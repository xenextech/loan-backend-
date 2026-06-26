import {
  Controller,
  Get,
  Post,
  Patch,
  Delete,
  Body,
  Param,
  Query,
  UseGuards,
  HttpCode,
  HttpStatus,
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';
import { ApplicationsService } from './applications.service';
import { Step1Dto } from './dto/step1.dto';
import { Step2Dto } from './dto/step2.dto';
import { Step3Dto } from './dto/step3.dto';
import { Step4Dto } from './dto/step4.dto';
import { QueryApplicationDto } from './dto/query-application.dto';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { RolesGuard } from '../../common/guards/roles.guard';
import { Roles } from '../../common/decorators/roles.decorator';
import { CurrentUser } from '../../common/decorators/current-user.decorator';
import { UserRole } from '../../common/enums';
import { JwtPayload } from '../../common/interfaces/jwt-payload.interface';

@ApiTags('Applications')
@ApiBearerAuth('JWT')
@UseGuards(JwtAuthGuard, RolesGuard)
@Controller('applications')
export class ApplicationsController {
  constructor(private readonly applicationsService: ApplicationsService) {}

  @Post()
  @HttpCode(HttpStatus.CREATED)
  @Roles(UserRole.STUDENT)
  @ApiOperation({ summary: 'Create a new draft application' })
  create(@CurrentUser() user: JwtPayload) {
    return this.applicationsService.create(user.sub);
  }

  @Get()
  @Roles(UserRole.STUDENT)
  @ApiOperation({ summary: 'List my applications' })
  findMy(@CurrentUser() user: JwtPayload, @Query() query: QueryApplicationDto) {
    return this.applicationsService.findMyApplications(user.sub, query);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get application by ID' })
  findOne(@CurrentUser() user: JwtPayload, @Param('id') id: string) {
    return this.applicationsService.findOne(id, user.sub, user.role);
  }

  @Patch(':id/step1')
  @Roles(UserRole.STUDENT)
  @ApiOperation({ summary: 'Save Step 1 — Personal, study, and loan information' })
  saveStep1(
    @CurrentUser() user: JwtPayload,
    @Param('id') id: string,
    @Body() dto: Step1Dto,
  ) {
    return this.applicationsService.saveStep1(id, user.sub, dto);
  }

  @Patch(':id/step2')
  @Roles(UserRole.STUDENT)
  @ApiOperation({ summary: 'Save Step 2 — Identity & address' })
  saveStep2(
    @CurrentUser() user: JwtPayload,
    @Param('id') id: string,
    @Body() dto: Step2Dto,
  ) {
    return this.applicationsService.saveStep2(id, user.sub, dto);
  }

  @Patch(':id/step3')
  @Roles(UserRole.STUDENT)
  @ApiOperation({ summary: 'Save Step 3 — Family & fee structure' })
  saveStep3(
    @CurrentUser() user: JwtPayload,
    @Param('id') id: string,
    @Body() dto: Step3Dto,
  ) {
    return this.applicationsService.saveStep3(id, user.sub, dto);
  }

  @Post(':id/submit')
  @HttpCode(HttpStatus.OK)
  @Roles(UserRole.STUDENT)
  @ApiOperation({ summary: 'Submit application (Step 4 declaration + final status change)' })
  submit(
    @CurrentUser() user: JwtPayload,
    @Param('id') id: string,
    @Body() dto: Step4Dto,
  ) {
    return this.applicationsService.submit(id, user.sub, dto);
  }

  @Delete(':id')
  @HttpCode(HttpStatus.OK)
  @Roles(UserRole.STUDENT)
  @ApiOperation({ summary: 'Delete a draft application' })
  delete(@CurrentUser() user: JwtPayload, @Param('id') id: string) {
    return this.applicationsService.deleteDraft(id, user.sub);
  }
}
