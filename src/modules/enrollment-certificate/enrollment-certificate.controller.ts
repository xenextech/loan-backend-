import {
  Controller,
  Get,
  Post,
  Put,
  Delete,
  Body,
  Param,
  UseGuards,
} from '@nestjs/common';
import {
  ApiTags,
  ApiOperation,
  ApiBearerAuth,
  ApiParam,
} from '@nestjs/swagger';
import { EnrollmentCertificateService } from './enrollment-certificate.service';
import { CreateEnrollmentCertificateDto } from './dto/create-enrollment-certificate.dto';
import { UpdateEnrollmentCertificateDto } from './dto/update-enrollment-certificate.dto';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { RolesGuard } from '../../common/guards/roles.guard';
import { Roles } from '../../common/decorators/roles.decorator';
import { CurrentUser } from '../../common/decorators/current-user.decorator';
import { JwtPayload } from '../../common/interfaces/jwt-payload.interface';
import { UserRole } from '../../common/enums';

@ApiTags('Enrollment Certificates')
@ApiBearerAuth('JWT')
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles(UserRole.COLLEGE)
@Controller('enrollment-certificates')
export class EnrollmentCertificateController {
  constructor(private readonly enrollmentCertificateService: EnrollmentCertificateService) {}

  @Post()
  @ApiOperation({ summary: 'Create and save a new enrollment certificate' })
  create(@Body() dto: CreateEnrollmentCertificateDto, @CurrentUser() user: JwtPayload) {
    return this.enrollmentCertificateService.create(dto, user.email);
  }

  @Get()
  @ApiOperation({ summary: 'List all enrollment certificates created by this college account' })
  findAll(@CurrentUser() user: JwtPayload) {
    return this.enrollmentCertificateService.findAll(user.email);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get a single enrollment certificate by ID' })
  @ApiParam({ name: 'id', description: 'Enrollment certificate UUID' })
  findOne(@Param('id') id: string, @CurrentUser() user: JwtPayload) {
    return this.enrollmentCertificateService.findOne(id, user.email);
  }

  @Put(':id')
  @ApiOperation({ summary: 'Update an existing enrollment certificate' })
  @ApiParam({ name: 'id', description: 'Enrollment certificate UUID' })
  update(
    @Param('id') id: string,
    @Body() dto: UpdateEnrollmentCertificateDto,
    @CurrentUser() user: JwtPayload,
  ) {
    return this.enrollmentCertificateService.update(id, dto, user.email);
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Delete an enrollment certificate' })
  @ApiParam({ name: 'id', description: 'Enrollment certificate UUID' })
  remove(@Param('id') id: string, @CurrentUser() user: JwtPayload) {
    return this.enrollmentCertificateService.remove(id, user.email);
  }
}
