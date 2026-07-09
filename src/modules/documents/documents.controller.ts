import {
  Controller,
  Post,
  Get,
  Delete,
  Param,
  UseGuards,
  UseInterceptors,
  UploadedFile,
  ParseEnumPipe,
  ParseFilePipe,
  MaxFileSizeValidator,
  HttpCode,
  HttpStatus,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import {
  ApiTags,
  ApiOperation,
  ApiBearerAuth,
  ApiConsumes,
  ApiBody,
  ApiParam,
} from '@nestjs/swagger';
import { memoryStorage } from 'multer';
import { DocumentsService } from './documents.service';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { RolesGuard } from '../../common/guards/roles.guard';
import { Roles } from '../../common/decorators/roles.decorator';
import { CurrentUser } from '../../common/decorators/current-user.decorator';
import { DocumentType, UserRole } from '../../common/enums';
import { JwtPayload } from '../../common/interfaces/jwt-payload.interface';

@ApiTags('Documents')
@ApiBearerAuth('JWT')
@UseGuards(JwtAuthGuard, RolesGuard)
@Controller('applications/:applicationId/documents')
export class DocumentsController {
  constructor(private readonly documentsService: DocumentsService) {}

  @Post(':documentType')
  @Roles(UserRole.STUDENT, UserRole.INITIATOR)
  @ApiOperation({
    summary: 'Upload a document for an application',
    description:
      'Accepts JPG, JPEG, PNG, WEBP images or a PDF file (application/pdf), depending on documentType. ' +
      'For identity documents: IDENTITY_FRONT/IDENTITY_BACK are image-only and must be uploaded as a pair ' +
      '(Citizenship only). IDENTITY_DOCUMENT is a single file — image or PDF for Passport/Driving ' +
      'License/National ID/PAN Number, but PDF-only when identityType is Citizenship. ' +
      'IDENTITY_DOCUMENT cannot be combined with IDENTITY_FRONT/IDENTITY_BACK on the same application. ' +
      'Initiators may only upload to INITIATOR-sourced applications they created.',
  })
  @ApiParam({ name: 'documentType', enum: DocumentType })
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
      },
    },
  })
  @UseInterceptors(FileInterceptor('file', { storage: memoryStorage() }))
  uploadDocument(
    @CurrentUser() user: JwtPayload,
    @Param('applicationId') applicationId: string,
    @Param('documentType', new ParseEnumPipe(DocumentType))
    documentType: DocumentType,
    @UploadedFile(
      new ParseFilePipe({
        validators: [new MaxFileSizeValidator({ maxSize: 10 * 1024 * 1024 })],
      }),
    )
    file: Express.Multer.File,
  ) {
    return this.documentsService.uploadDocument(
      applicationId,
      user.sub,
      user.role,
      documentType,
      file,
    );
  }

  @Get()
  @ApiOperation({ summary: 'List all documents for an application' })
  getDocuments(
    @CurrentUser() user: JwtPayload,
    @Param('applicationId') applicationId: string,
  ) {
    return this.documentsService.getDocuments(
      applicationId,
      user.sub,
      user.role,
    );
  }

  @Delete(':documentId')
  @HttpCode(HttpStatus.OK)
  @Roles(UserRole.STUDENT, UserRole.INITIATOR)
  @ApiOperation({ summary: 'Delete a document' })
  deleteDocument(
    @CurrentUser() user: JwtPayload,
    @Param('documentId') documentId: string,
  ) {
    return this.documentsService.deleteDocument(
      documentId,
      user.sub,
      user.role,
    );
  }
}
