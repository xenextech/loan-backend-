import {
  Controller,
  Get,
  Put,
  Post,
  Body,
  Param,
  UseInterceptors,
  UploadedFile,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import {
  ApiTags,
  ApiOperation,
  ApiParam,
  ApiConsumes,
  ApiBody,
} from '@nestjs/swagger';
import { memoryStorage } from 'multer';
import { ParentPublicService } from './parent-public.service';
import { ParentVerificationDto } from './dto/parent-verification.dto';
import { Public } from '../../common/decorators/public.decorator';

// All endpoints are public — authenticated via the opaque token in the URL.
@ApiTags('Parent Verification')
@Public()
@Controller('parent')
export class ParentPublicController {
  constructor(private readonly parentPublicService: ParentPublicService) {}

  @Get(':token')
  @ApiOperation({ summary: 'View application details via parent access link' })
  @ApiParam({
    name: 'token',
    description: '64-char hex token from the parent link',
  })
  getApplication(@Param('token') token: string) {
    return this.parentPublicService.getApplicationByToken(token);
  }

  @Put(':token/profile')
  @ApiOperation({ summary: 'Submit or update parent profile information' })
  @ApiParam({
    name: 'token',
    description: '64-char hex token from the parent link',
  })
  submitProfile(
    @Param('token') token: string,
    @Body() dto: ParentVerificationDto,
  ) {
    return this.parentPublicService.submitParentProfile(token, dto);
  }

  @Post(':token/salary-sheet')
  @ApiOperation({ summary: 'Upload parent salary sheet document' })
  @ApiParam({
    name: 'token',
    description: '64-char hex token from the parent link',
  })
  @ApiConsumes('multipart/form-data')
  @ApiBody({
    schema: {
      type: 'object',
      properties: { file: { type: 'string', format: 'binary' } },
    },
  })
  @UseInterceptors(FileInterceptor('file', { storage: memoryStorage() }))
  uploadSalarySheet(
    @Param('token') token: string,
    @UploadedFile() file: Express.Multer.File,
  ) {
    return this.parentPublicService.uploadSalarySheet(token, file);
  }
}
