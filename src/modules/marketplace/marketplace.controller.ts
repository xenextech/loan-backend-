import {
  Body,
  Controller,
  Delete,
  Get,
  HttpCode,
  HttpStatus,
  MaxFileSizeValidator,
  Param,
  ParseFilePipe,
  Patch,
  Post,
  Query,
  UploadedFile,
  UseGuards,
  UseInterceptors,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import {
  ApiBearerAuth,
  ApiBody,
  ApiConsumes,
  ApiOperation,
  ApiTags,
} from '@nestjs/swagger';
import { memoryStorage } from 'multer';
import { CollegeService } from './college.service';
import { CourseService } from './course.service';
import { UniversityService } from './university.service';
import { QueryCollegesDto } from './dto/query-colleges.dto';
import { CreateCollegeDto } from './dto/create-college.dto';
import { UpdateCollegeDto } from './dto/update-college.dto';
import { CreateCourseDto } from './dto/create-course.dto';
import { UpdateCourseDto } from './dto/update-course.dto';
import { QueryCoursesAdminDto } from './dto/query-courses-admin.dto';
import { CreateUniversityDto } from './dto/create-university.dto';
import { UpdateUniversityDto } from './dto/update-university.dto';
import { PrefillQueryDto } from './dto/prefill-query.dto';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { RolesGuard } from '../../common/guards/roles.guard';
import { Roles } from '../../common/decorators/roles.decorator';
import { CurrentUser } from '../../common/decorators/current-user.decorator';
import { JwtPayload } from '../../common/interfaces/jwt-payload.interface';
import { UserRole } from '../../common/enums';
import { StorageService } from '../storage/storage.service';
import {
  ALLOWED_IMAGE_TYPES,
  MAX_IMAGE_SIZE,
  STORAGE_BUCKETS,
} from '../storage/storage.constants';

// Browsing endpoints are open to any authenticated user (the marketplace lives
// inside the student dashboard, always behind login); create/update/delete are
// ADMIN-only. See CollegeVerification/CollegeController for the unrelated
// per-application magic-link verification workflow — this module is the
// browsable catalog instead.
@ApiTags('College Marketplace')
@ApiBearerAuth('JWT')
@UseGuards(JwtAuthGuard, RolesGuard)
@Controller('marketplace')
export class MarketplaceController {
  constructor(
    private readonly collegeService: CollegeService,
    private readonly courseService: CourseService,
    private readonly universityService: UniversityService,
    private readonly storageService: StorageService,
  ) {}

  @Post('uploads/image')
  @Roles(UserRole.ADMIN)
  @ApiOperation({
    summary: 'Upload a college/course logo or banner image (admin)',
    description:
      'Returns the resulting public URL — the caller stores it into logoUrl/bannerUrl ' +
      'on a subsequent create/update call. Not tied to an existing college/course id, ' +
      'so it also works while filling out a brand-new "create" form.',
  })
  @ApiConsumes('multipart/form-data')
  @ApiBody({
    schema: {
      type: 'object',
      properties: { file: { type: 'string', format: 'binary' } },
    },
  })
  @UseInterceptors(FileInterceptor('file', { storage: memoryStorage() }))
  async uploadImage(
    @UploadedFile(
      new ParseFilePipe({
        validators: [new MaxFileSizeValidator({ maxSize: MAX_IMAGE_SIZE })],
      }),
    )
    file: Express.Multer.File,
  ) {
    const result = await this.storageService.uploadFile(
      file,
      STORAGE_BUCKETS.PUBLIC_IMAGES,
      'marketplace',
      ALLOWED_IMAGE_TYPES,
      MAX_IMAGE_SIZE,
    );
    return { url: result.publicUrl };
  }

  @Get('universities')
  @ApiOperation({
    summary: 'List universities (filter dropdown source)',
    description:
      'Active only by default; admin catalog view passes includeInactive=true.',
  })
  getUniversities(@Query('includeInactive') includeInactive?: string) {
    return this.universityService.findAll(includeInactive === 'true');
  }

  @Get('colleges')
  @ApiOperation({
    summary: 'Search/filter/paginate the college catalog',
    description:
      'Filters: search, province, district, universityId, category, degreeLevel, ' +
      'duration, minFee, maxFee. Each card includes startingTuition and courseCount ' +
      'computed from its active courses.',
  })
  getColleges(@Query() query: QueryCollegesDto) {
    return this.collegeService.findAll(query);
  }

  @Get('colleges/:id')
  @ApiOperation({ summary: 'Get college detail with its active courses' })
  getCollege(@Param('id') id: string) {
    return this.collegeService.findOne(id);
  }

  @Get('courses')
  @Roles(UserRole.ADMIN)
  @ApiOperation({
    summary: 'Search/filter/paginate the course catalog (admin)',
    description:
      'Each row includes its parent college + affiliated university. ' +
      'Filters: search, collegeId, category, degreeLevel, includeInactive.',
  })
  getCoursesAdmin(@Query() query: QueryCoursesAdminDto) {
    return this.courseService.findAllForAdmin(query);
  }

  @Get('courses/:id')
  @ApiOperation({ summary: 'Get a single course detail' })
  getCourse(@Param('id') id: string) {
    return this.courseService.findOne(id);
  }

  @Get('courses/:id/related')
  @ApiOperation({
    summary: 'Get related courses for the Course Detail page',
    description:
      'Same-category courses first, backfilled with same-degree-level courses. ' +
      'Returns an empty list (not 404) for an unknown/inactive courseId.',
  })
  getRelatedCourses(@Param('id') id: string) {
    return this.courseService.findRelated(id);
  }

  @Get('prefill')
  @Roles(UserRole.STUDENT)
  @ApiOperation({
    summary:
      'Validate a selected college+course pair and return apply-form prefill data',
    description:
      'Called by the /apply wizard when arriving from the College Marketplace. ' +
      'Returns 404/400 if the ids are invalid, inactive, or mismatched — the ' +
      'frontend falls back to a blank, manually-fillable form in that case.',
  })
  getPrefill(@Query() query: PrefillQueryDto) {
    return this.collegeService.getPrefillData(query.collegeId, query.courseId);
  }

  @Post('colleges')
  @Roles(UserRole.ADMIN)
  @ApiOperation({ summary: 'Create a college (admin)' })
  createCollege(
    @CurrentUser() user: JwtPayload,
    @Body() dto: CreateCollegeDto,
  ) {
    return this.collegeService.create(dto, user.sub);
  }

  @Patch('colleges/:id')
  @Roles(UserRole.ADMIN)
  @ApiOperation({ summary: 'Update a college (admin)' })
  updateCollege(
    @CurrentUser() user: JwtPayload,
    @Param('id') id: string,
    @Body() dto: UpdateCollegeDto,
  ) {
    return this.collegeService.update(id, dto, user.sub);
  }

  @Delete('colleges/:id')
  @HttpCode(HttpStatus.OK)
  @Roles(UserRole.ADMIN)
  @ApiOperation({ summary: 'Deactivate a college (admin, soft-delete)' })
  deleteCollege(@CurrentUser() user: JwtPayload, @Param('id') id: string) {
    return this.collegeService.remove(id, user.sub);
  }

  @Post('universities')
  @Roles(UserRole.ADMIN)
  @ApiOperation({ summary: 'Create a university (admin)' })
  createUniversity(
    @CurrentUser() user: JwtPayload,
    @Body() dto: CreateUniversityDto,
  ) {
    return this.universityService.create(dto, user.sub);
  }

  @Patch('universities/:id')
  @Roles(UserRole.ADMIN)
  @ApiOperation({ summary: 'Update a university (admin)' })
  updateUniversity(
    @CurrentUser() user: JwtPayload,
    @Param('id') id: string,
    @Body() dto: UpdateUniversityDto,
  ) {
    return this.universityService.update(id, dto, user.sub);
  }

  @Delete('universities/:id')
  @HttpCode(HttpStatus.OK)
  @Roles(UserRole.ADMIN)
  @ApiOperation({ summary: 'Deactivate a university (admin, soft-delete)' })
  deleteUniversity(@CurrentUser() user: JwtPayload, @Param('id') id: string) {
    return this.universityService.remove(id, user.sub);
  }

  @Post('courses')
  @Roles(UserRole.ADMIN)
  @ApiOperation({ summary: 'Create a course under a college (admin)' })
  createCourse(@CurrentUser() user: JwtPayload, @Body() dto: CreateCourseDto) {
    return this.courseService.create(dto, user.sub);
  }

  @Patch('courses/:id')
  @Roles(UserRole.ADMIN)
  @ApiOperation({ summary: 'Update a course (admin)' })
  updateCourse(
    @CurrentUser() user: JwtPayload,
    @Param('id') id: string,
    @Body() dto: UpdateCourseDto,
  ) {
    return this.courseService.update(id, dto, user.sub);
  }

  @Delete('courses/:id')
  @HttpCode(HttpStatus.OK)
  @Roles(UserRole.ADMIN)
  @ApiOperation({ summary: 'Deactivate a course (admin, soft-delete)' })
  deleteCourse(@CurrentUser() user: JwtPayload, @Param('id') id: string) {
    return this.courseService.remove(id, user.sub);
  }
}
