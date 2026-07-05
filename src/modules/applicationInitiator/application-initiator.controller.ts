import {
  Body,
  Controller,
  Get,
  Param,
  Patch,
  Post,
  Query,
  UseGuards,
} from '@nestjs/common';
import { ApiBearerAuth, ApiOperation, ApiTags } from '@nestjs/swagger';
import { ApplicationInitiatorService } from './application-initiator.service';
import { CreateInitiatorApplicationDto } from './dto/create-initiator-application.dto';
import { UpdateInitiatorApplicationDto } from './dto/update-initiator-application.dto';
import { QueryCollegeVerifiedDto } from './dto/query-college-verified.dto';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { RolesGuard } from '../../common/guards/roles.guard';
import { Roles } from '../../common/decorators/roles.decorator';
import { CurrentUser } from '../../common/decorators/current-user.decorator';
import { UserRole } from '../../common/enums';
import { JwtPayload } from '../../common/interfaces/jwt-payload.interface';

// Initiator-facing credit appraisal API. The student-facing `/applications` steps
// are untouched — this is the internal risk memo filled in by bank staff.
@ApiTags('Application Initiator')
@ApiBearerAuth('JWT')
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles(UserRole.INITIATOR)
@Controller('applications/:applicationId/initiator')
export class ApplicationInitiatorController {
  constructor(
    private readonly applicationInitiatorService: ApplicationInitiatorService,
  ) {}

  @Get()
  @ApiOperation({
    summary:
      'Get full application details for initiator review — loan information plus applicant (user/student) and parent verification relations',
  })
  findOne(@Param('applicationId') applicationId: string) {
    return this.applicationInitiatorService.getInitiatorApplication(
      applicationId,
    );
  }

  @Get('overview')
  @ApiOperation({
    summary:
      'Get application overview — basic student info, college verification, and parent profile',
  })
  getOverview(@Param('applicationId') applicationId: string) {
    return this.applicationInitiatorService.getInitiatorApplicationOverview(
      applicationId,
    );
  }

  @Post()
  @ApiOperation({
    summary:
      'Create initiator information (Basic Information required, rest optional)',
  })
  create(
    @CurrentUser() user: JwtPayload,
    @Param('applicationId') applicationId: string,
    @Body() dto: CreateInitiatorApplicationDto,
  ) {
    return this.applicationInitiatorService.createInitiatorApplication(
      applicationId,
      user.sub,
      dto,
    );
  }

  @Patch()
  @ApiOperation({
    summary: 'Update initiator information (all fields optional)',
  })
  update(
    @CurrentUser() user: JwtPayload,
    @Param('applicationId') applicationId: string,
    @Body() dto: UpdateInitiatorApplicationDto,
  ) {
    return this.applicationInitiatorService.updateInitiatorApplication(
      applicationId,
      user.sub,
      dto,
    );
  }
}

// List-type endpoint, not scoped to a single application — kept in a separate
// controller since the class above is pinned to the `:applicationId` prefix.
@ApiTags('Application Initiator')
@ApiBearerAuth('JWT')
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles(UserRole.INITIATOR)
@Controller('applications/initiator')
export class ApplicationInitiatorListController {
  constructor(
    private readonly applicationInitiatorService: ApplicationInitiatorService,
  ) {}

  @Post()
  @ApiOperation({
    summary:
      'Start a new application from scratch — no existing application ID required. Returns the created application (with its generated id) for subsequent PATCH /applications/:applicationId/initiator calls.',
  })
  create(
    @CurrentUser() user: JwtPayload,
    @Body() dto: CreateInitiatorApplicationDto,
  ) {
    return this.applicationInitiatorService.createNewApplication(user.sub, dto);
  }

  @Get('college-verified')
  @ApiOperation({
    summary:
      'List students whose application has been verified by their college (paginated), mapped by applicationId',
  })
  getCollegeVerified(@Query() query: QueryCollegeVerifiedDto) {
    return this.applicationInitiatorService.getCollegeVerifiedApplications(
      query,
    );
  }
}
