import {
  Controller,
  Get,
  Put,
  Post,
  Body,
  Param,
  UseInterceptors,
  UploadedFile,
  UseGuards,
  ParseFilePipe,
  MaxFileSizeValidator,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import {
  ApiTags,
  ApiOperation,
  ApiParam,
  ApiConsumes,
  ApiBody,
  ApiBearerAuth,
} from '@nestjs/swagger';
import { memoryStorage } from 'multer';
import { CollegeService } from './college.service';
import { CollegeFormDto } from './dto/college-form.dto';
import { Public } from '../../common/decorators/public.decorator';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { RolesGuard } from '../../common/guards/roles.guard';
import { Roles } from '../../common/decorators/roles.decorator';
import { CurrentUser } from '../../common/decorators/current-user.decorator';
import { JwtPayload } from '../../common/interfaces/jwt-payload.interface';
import { UserRole } from '../../common/enums';

// Token-based endpoints are @Public (no JWT). The my-verifications endpoint requires JWT + COLLEGE role.
@ApiTags('College Verification')
@Controller('college')
export class CollegeController {
  constructor(private readonly collegeService: CollegeService) {}

  // Must be defined before :token to avoid being captured as a token value
  @Get('my-verifications')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.COLLEGE)
  @ApiBearerAuth('JWT')
  @ApiOperation({
    summary:
      'List all verifications submitted by the authenticated college account',
  })
  getMyVerifications(@CurrentUser() user: JwtPayload) {
    return this.collegeService.getMyVerifications(user.email);
  }

  @Get(':token')
  @Public()
  @ApiOperation({ summary: 'View application details via college access link' })
  @ApiParam({
    name: 'token',
    description: '64-char hex token from the college link',
  })
  getApplication(@Param('token') token: string) {
    return this.collegeService.getApplicationByToken(token);
  }

  @Put(':token/form')
  @Public()
  @ApiOperation({
    summary:
      'Submit or update the college verification form (application confirmation)',
  })
  @ApiParam({
    name: 'token',
    description: '64-char hex token from the college link',
  })
  submitForm(@Param('token') token: string, @Body() dto: CollegeFormDto) {
    return this.collegeService.submitCollegeForm(token, dto);
  }

  @Post(':token/offer-letter')
  @Public()
  @ApiOperation({ summary: 'Upload the offer letter document' })
  @ApiParam({
    name: 'token',
    description: '64-char hex token from the college link',
  })
  @ApiConsumes('multipart/form-data')
  @ApiBody({
    schema: {
      type: 'object',
      properties: { file: { type: 'string', format: 'binary' } },
    },
  })
  @UseInterceptors(FileInterceptor('file', { storage: memoryStorage() }))
  uploadOfferLetter(
    @Param('token') token: string,
    @UploadedFile(
      new ParseFilePipe({
        validators: [new MaxFileSizeValidator({ maxSize: 10 * 1024 * 1024 })],
      }),
    )
    file: Express.Multer.File,
  ) {
    return this.collegeService.uploadOfferLetter(token, file);
  }

  @Post(':token/enrollment-docs')
  @Public()
  @ApiOperation({ summary: 'Upload the enrollment documents' })
  @ApiParam({
    name: 'token',
    description: '64-char hex token from the college link',
  })
  @ApiConsumes('multipart/form-data')
  @ApiBody({
    schema: {
      type: 'object',
      properties: { file: { type: 'string', format: 'binary' } },
    },
  })
  @UseInterceptors(FileInterceptor('file', { storage: memoryStorage() }))
  uploadEnrollmentDocs(
    @Param('token') token: string,
    @UploadedFile(
      new ParseFilePipe({
        validators: [new MaxFileSizeValidator({ maxSize: 10 * 1024 * 1024 })],
      }),
    )
    file: Express.Multer.File,
  ) {
    return this.collegeService.uploadEnrollmentDocs(token, file);
  }
}
