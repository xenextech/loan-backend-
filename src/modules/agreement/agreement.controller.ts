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
import { AgreementService } from './agreement.service';
import { CreateAgreementDto } from './dto/create-agreement.dto';
import { UpdateAgreementDto } from './dto/update-agreement.dto';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { RolesGuard } from '../../common/guards/roles.guard';
import { Roles } from '../../common/decorators/roles.decorator';
import { CurrentUser } from '../../common/decorators/current-user.decorator';
import { JwtPayload } from '../../common/interfaces/jwt-payload.interface';
import { UserRole } from '../../common/enums';

@ApiTags('Agreements (Bonafide Certificates)')
@ApiBearerAuth('JWT')
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles(UserRole.COLLEGE)
@Controller('agreements')
export class AgreementController {
  constructor(private readonly agreementService: AgreementService) {}

  @Post()
  @ApiOperation({ summary: 'Create and save a new bonafide certificate (agreement)' })
  create(@Body() dto: CreateAgreementDto, @CurrentUser() user: JwtPayload) {
    return this.agreementService.create(dto, user.email);
  }

  @Get()
  @ApiOperation({ summary: 'List all agreements created by this college account' })
  findAll(@CurrentUser() user: JwtPayload) {
    return this.agreementService.findAll(user.email);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get a single agreement by ID' })
  @ApiParam({ name: 'id', description: 'Agreement UUID' })
  findOne(@Param('id') id: string, @CurrentUser() user: JwtPayload) {
    return this.agreementService.findOne(id, user.email);
  }

  @Put(':id')
  @ApiOperation({ summary: 'Update an existing agreement' })
  @ApiParam({ name: 'id', description: 'Agreement UUID' })
  update(
    @Param('id') id: string,
    @Body() dto: UpdateAgreementDto,
    @CurrentUser() user: JwtPayload,
  ) {
    return this.agreementService.update(id, dto, user.email);
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Delete an agreement' })
  @ApiParam({ name: 'id', description: 'Agreement UUID' })
  remove(@Param('id') id: string, @CurrentUser() user: JwtPayload) {
    return this.agreementService.remove(id, user.email);
  }
}
