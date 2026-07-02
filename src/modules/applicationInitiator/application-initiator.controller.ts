import {
  Body,
  Controller,
  Param,
  Patch,
  Post,
  UseGuards,
} from '@nestjs/common';
import { ApiBearerAuth, ApiOperation, ApiTags } from '@nestjs/swagger';
import { ApplicationInitiatorService } from './application-initiator.service';
import { CreateInitiatorApplicationDto } from './dto/create-initiator-application.dto';
import { UpdateInitiatorApplicationDto } from './dto/update-initiator-application.dto';
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
