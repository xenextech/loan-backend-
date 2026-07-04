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
import { OfferLetterService } from './offer-letter.service';
import { CreateOfferLetterDto } from './dto/create-offer-letter.dto';
import { UpdateOfferLetterDto } from './dto/update-offer-letter.dto';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { RolesGuard } from '../../common/guards/roles.guard';
import { Roles } from '../../common/decorators/roles.decorator';
import { CurrentUser } from '../../common/decorators/current-user.decorator';
import { JwtPayload } from '../../common/interfaces/jwt-payload.interface';
import { UserRole } from '../../common/enums';

@ApiTags('Offer Letters')
@ApiBearerAuth('JWT')
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles(UserRole.COLLEGE)
@Controller('offer-letters')
export class OfferLetterController {
  constructor(private readonly offerLetterService: OfferLetterService) {}

  @Post()
  @ApiOperation({ summary: 'Create and save a new offer letter' })
  create(@Body() dto: CreateOfferLetterDto, @CurrentUser() user: JwtPayload) {
    return this.offerLetterService.create(dto, user.email);
  }

  @Get()
  @ApiOperation({
    summary: 'List all offer letters created by this college account',
  })
  findAll(@CurrentUser() user: JwtPayload) {
    return this.offerLetterService.findAll(user.email);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get a single offer letter by ID' })
  @ApiParam({ name: 'id', description: 'Offer letter UUID' })
  findOne(@Param('id') id: string, @CurrentUser() user: JwtPayload) {
    return this.offerLetterService.findOne(id, user.email);
  }

  @Put(':id')
  @ApiOperation({ summary: 'Update an existing offer letter' })
  @ApiParam({ name: 'id', description: 'Offer letter UUID' })
  update(
    @Param('id') id: string,
    @Body() dto: UpdateOfferLetterDto,
    @CurrentUser() user: JwtPayload,
  ) {
    return this.offerLetterService.update(id, dto, user.email);
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Delete an offer letter' })
  @ApiParam({ name: 'id', description: 'Offer letter UUID' })
  remove(@Param('id') id: string, @CurrentUser() user: JwtPayload) {
    return this.offerLetterService.remove(id, user.email);
  }
}
