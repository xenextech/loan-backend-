import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { StorageService } from '../storage/storage.service';
import { ParentProfileDto } from './dto/parent-profile.dto';
import {
  DOCUMENT_BUCKET,
  ALLOWED_IMAGE_TYPES,
  ALLOWED_DOCUMENT_TYPES,
  MAX_DOCUMENT_SIZE,
} from '../storage/storage.constants';

@Injectable()
export class ParentsService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly storage: StorageService,
  ) {}

  async getProfile(userId: string) {
    return this.prisma.parentProfile.findUnique({ where: { userId } });
  }

  async upsertProfile(userId: string, dto: ParentProfileDto) {
    return this.prisma.parentProfile.upsert({
      where: { userId },
      create: { userId, ...dto },
      update: dto,
    });
  }

  async uploadSalarySheet(userId: string, file: Express.Multer.File) {
    const profile = await this.prisma.parentProfile.findUnique({
      where: { userId },
    });

    if (profile?.salarySheetFilePath && profile?.salarySheetBucketName) {
      await this.storage.deleteFile(
        profile.salarySheetBucketName,
        profile.salarySheetFilePath,
      );
    }

    const uploadResult = await this.storage.uploadFile(
      file,
      DOCUMENT_BUCKET,
      `parent-salary-sheets/${userId}`,
      [...ALLOWED_IMAGE_TYPES, ...ALLOWED_DOCUMENT_TYPES],
      MAX_DOCUMENT_SIZE,
    );

    return this.prisma.parentProfile.upsert({
      where: { userId },
      create: {
        userId,
        salarySheetFileName: uploadResult.fileName,
        salarySheetOriginalFileName: uploadResult.originalFileName,
        salarySheetMimeType: uploadResult.mimeType,
        salarySheetSize: uploadResult.size,
        salarySheetBucketName: uploadResult.bucketName,
        salarySheetFilePath: uploadResult.filePath,
        salarySheetPublicUrl: uploadResult.publicUrl,
      },
      update: {
        salarySheetFileName: uploadResult.fileName,
        salarySheetOriginalFileName: uploadResult.originalFileName,
        salarySheetMimeType: uploadResult.mimeType,
        salarySheetSize: uploadResult.size,
        salarySheetBucketName: uploadResult.bucketName,
        salarySheetFilePath: uploadResult.filePath,
        salarySheetPublicUrl: uploadResult.publicUrl,
      },
    });
  }

  async deleteSalarySheet(userId: string) {
    const profile = await this.prisma.parentProfile.findUnique({
      where: { userId },
    });

    if (!profile?.salarySheetFilePath || !profile?.salarySheetBucketName) {
      throw new NotFoundException('No salary sheet found');
    }

    await this.storage.deleteFile(
      profile.salarySheetBucketName,
      profile.salarySheetFilePath,
    );

    return this.prisma.parentProfile.update({
      where: { userId },
      data: {
        salarySheetFileName: null,
        salarySheetOriginalFileName: null,
        salarySheetMimeType: null,
        salarySheetSize: null,
        salarySheetBucketName: null,
        salarySheetFilePath: null,
        salarySheetPublicUrl: null,
      },
    });
  }
}
