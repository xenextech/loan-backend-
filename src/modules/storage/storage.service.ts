import {
  Injectable,
  BadRequestException,
  InternalServerErrorException,
  Logger,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { createClient, SupabaseClient } from '@supabase/supabase-js';
import { randomUUID } from 'crypto';
import { extname } from 'path';
import {
  STORAGE_BUCKETS,
  SIGNED_URL_EXPIRY_SECONDS,
} from './storage.constants';

export interface UploadResult {
  fileName: string;
  originalFileName: string;
  mimeType: string;
  size: number;
  bucketName: string;
  filePath: string;
  publicUrl: string;
}

@Injectable()
export class StorageService {
  private readonly client: SupabaseClient;
  private readonly logger = new Logger(StorageService.name);

  constructor(private readonly config: ConfigService) {
    const url = this.config.get<string>('supabase.url') ?? '';
    const key = this.config.get<string>('supabase.serviceRoleKey') ?? '';
    this.client = createClient(url, key);
  }

  async uploadFile(
    file: Express.Multer.File,
    bucket: string,
    folder: string,
    allowedMimeTypes: string[],
    maxSizeBytes: number,
  ): Promise<UploadResult> {
    if (!file) {
      throw new BadRequestException('No file provided');
    }
    if (!allowedMimeTypes.includes(file.mimetype)) {
      throw new BadRequestException(
        `Invalid file type. Allowed: ${allowedMimeTypes.join(', ')}`,
      );
    }

    if (file.size > maxSizeBytes) {
      throw new BadRequestException(
        `File too large. Maximum size: ${Math.round(maxSizeBytes / 1024 / 1024)} MB`,
      );
    }

    const ext = extname(file.originalname);
    const fileName = `${randomUUID()}${ext}`;
    const filePath = `${folder}/${fileName}`;

    const { error } = await this.client.storage
      .from(bucket)
      .upload(filePath, file.buffer, {
        contentType: file.mimetype,
        upsert: false,
      });

    if (error) {
      this.logger.error(`Supabase upload error: ${error.message}`);
      throw new InternalServerErrorException('Failed to upload file');
    }

    const publicUrl = await this.resolveUrl(bucket, filePath);

    return {
      fileName,
      originalFileName: file.originalname,
      mimeType: file.mimetype,
      size: file.size,
      bucketName: bucket,
      filePath,
      publicUrl,
    };
  }

  async deleteFile(bucket: string, filePath: string): Promise<void> {
    const { error } = await this.client.storage.from(bucket).remove([filePath]);
    if (error) {
      this.logger.warn(`Failed to delete file ${filePath}: ${error.message}`);
    }
  }

  // Returns a signed URL for private buckets, or a plain public URL for public buckets.
  async resolveUrl(bucket: string, filePath: string): Promise<string> {
    if (bucket === STORAGE_BUCKETS.PRIVATE) {
      return this.generateSignedUrl(bucket, filePath);
    }
    return this.getPublicUrl(bucket, filePath);
  }

  async generateSignedUrl(
    bucket: string,
    filePath: string,
    expiresIn = SIGNED_URL_EXPIRY_SECONDS,
  ): Promise<string> {
    const { data, error } = await this.client.storage
      .from(bucket)
      .createSignedUrl(filePath, expiresIn);

    if (error || !data?.signedUrl) {
      this.logger.error(`Failed to create signed URL: ${error?.message}`);
      throw new InternalServerErrorException('Failed to generate file URL');
    }

    return data.signedUrl;
  }

  getPublicUrl(bucket: string, filePath: string): string {
    const { data } = this.client.storage.from(bucket).getPublicUrl(filePath);
    return data.publicUrl;
  }
}
