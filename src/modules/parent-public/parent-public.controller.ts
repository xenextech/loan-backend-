import {
  Controller,
  Get,
  Put,
  Post,
  Patch,
  Body,
  Param,
  Query,
  UseInterceptors,
  UploadedFile,
  UploadedFiles,
  ParseEnumPipe,
} from '@nestjs/common';
import {
  FileInterceptor,
  FileFieldsInterceptor,
} from '@nestjs/platform-express';
import {
  ApiTags,
  ApiOperation,
  ApiParam,
  ApiQuery,
  ApiConsumes,
  ApiBody,
} from '@nestjs/swagger';
import { memoryStorage } from 'multer';
import { ParentPublicService } from './parent-public.service';
import { ParentVerificationDto } from './dto/parent-verification.dto';
import {
  ParentIdentityDocumentType,
  UpdateParentDocumentLabelDto,
} from './dto/parent-document.dto';
import { Public } from '../../common/decorators/public.decorator';

const TOKEN_PARAM = {
  name: 'token',
  description: '64-char hex token from the parent link',
};

// All endpoints are public — authenticated via the opaque token in the URL.
@ApiTags('Parent Verification')
@Public()
@Controller('parent')
export class ParentPublicController {
  constructor(private readonly parentPublicService: ParentPublicService) {}

  @Get(':token')
  @ApiOperation({ summary: 'View application details via parent access link' })
  @ApiParam(TOKEN_PARAM)
  @ApiQuery({
    name: 'email',
    required: false,

  })
  getApplication(
    @Param('token') token: string,
    @Query('email') email?: string,
  ) {
    return this.parentPublicService.getApplicationByToken(token, email);
  }

  @Put(':token/profile')
  @ApiOperation({ summary: 'Submit or update parent profile information' })
  @ApiParam(TOKEN_PARAM)
  submitProfile(
    @Param('token') token: string,
    @Body() dto: ParentVerificationDto,
    @Query('email') email?: string,
  ) {
    return this.parentPublicService.submitParentProfile(token, dto, email);
  }

  @Post(':token/salary-sheet')
  @ApiOperation({
    summary: 'Upload one or more parent salary sheet documents',
    description:
      'Accepts JPG, JPEG, PNG, WEBP or PDF files. Send multiple files under the ' +
      '"files" field to upload several at once — previously uploaded salary ' +
      'sheets are never overwritten. The single-file "file" field is kept for ' +
      'backward compatibility. An optional "label" field sets the same custom ' +
      'label on every file uploaded in this request; labels can be edited ' +
      'individually afterwards.',
  })
  @ApiParam(TOKEN_PARAM)
  @ApiConsumes('multipart/form-data')
  @ApiBody({
    schema: {
      type: 'object',
      properties: {
        file: {
          type: 'string',
          format: 'binary',
          description: 'Legacy single-file field',
        },
        files: {
          type: 'array',
          items: { type: 'string', format: 'binary' },
          description: 'One or more salary sheet files',
        },
        label: {
          type: 'string',
          description:
            'Optional custom label applied to all files in this request',
        },
      },
    },
  })
  @UseInterceptors(
    FileFieldsInterceptor(
      [
        { name: 'file', maxCount: 1 },
        { name: 'files', maxCount: 10 },
      ],
      { storage: memoryStorage() },
    ),
  )
  uploadSalarySheet(
    @Param('token') token: string,
    @UploadedFiles()
    uploaded: { file?: Express.Multer.File[]; files?: Express.Multer.File[] },
    @Body('label') label?: string,
    @Query('email') email?: string,
  ) {
    const files = [...(uploaded?.file ?? []), ...(uploaded?.files ?? [])];
    return this.parentPublicService.uploadSalarySheets(
      token,
      files,
      label,
      email,
    );
  }

  @Post(':token/documents/:documentType')
  @ApiOperation({
    summary: 'Upload parent NID or PAN ID document',
    description:
      'Accepts exactly one JPG, JPEG, PNG, WEBP or PDF file for the given identity ' +
      'document type. Uploading again replaces the previous document of the same type.',
  })
  @ApiParam(TOKEN_PARAM)
  @ApiParam({ name: 'documentType', enum: ParentIdentityDocumentType })
  @ApiConsumes('multipart/form-data')
  @ApiBody({
    schema: {
      type: 'object',
      properties: {
        file: {
          type: 'string',
          format: 'binary',
          description:
            'image/jpeg, image/png, image/jpg, image/webp, or application/pdf',
        },
        label: {
          type: 'string',
          description: 'Optional custom label for this document',
        },
      },
    },
  })
  @UseInterceptors(FileInterceptor('file', { storage: memoryStorage() }))
  uploadIdentityDocument(
    @Param('token') token: string,
    @Param('documentType', new ParseEnumPipe(ParentIdentityDocumentType))
    documentType: ParentIdentityDocumentType,
    @UploadedFile() file: Express.Multer.File,
    @Body('label') label?: string,
    @Query('email') email?: string,
  ) {
    return this.parentPublicService.uploadIdentityDocument(
      token,
      documentType,
      file,
      label,
      email,
    );
  }

  @Get(':token/documents')
  @ApiOperation({ summary: 'List all documents uploaded by the parent' })
  @ApiParam(TOKEN_PARAM)
  getDocuments(@Param('token') token: string, @Query('email') email?: string) {
    return this.parentPublicService.getDocuments(token, email);
  }

  @Patch(':token/documents/:documentId/label')
  @ApiOperation({ summary: "Rename an uploaded document's label" })
  @ApiParam(TOKEN_PARAM)
  @ApiParam({ name: 'documentId', description: 'ParentDocument id' })
  updateDocumentLabel(
    @Param('token') token: string,
    @Param('documentId') documentId: string,
    @Body() dto: UpdateParentDocumentLabelDto,
    @Query('email') email?: string,
  ) {
    return this.parentPublicService.updateDocumentLabel(
      token,
      documentId,
      dto.label,
      email,
    );
  }
}
