import { Body, Controller, Get, Param, Post, UseGuards } from '@nestjs/common';
import { ApiBearerAuth, ApiOperation, ApiTags } from '@nestjs/swagger';
import { Roles } from '../../common/decorators/roles.decorator';
import { UserRole } from '../../common/enums';
import { CreditScoreService } from './credit-score.service';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { RolesGuard } from '../../common/guards/roles.guard';
import { CreateCreditScoringDto } from './dto/credit-score.dto';

@Controller('credit-score')
export class CreditScoreController {
  constructor(private readonly creditScoreService: CreditScoreService) {}
  @Get(':applicationId')
  @ApiTags('Applications Credit Score')
  @ApiBearerAuth('JWT')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(
    UserRole.INITIATOR,
    UserRole.SUPPORTER,
    UserRole.APPROVER,
    UserRole.ADMIN,
  )
  @ApiOperation({
    summary: 'Calculate credit score by application id',
  })
  calculateCreditScore(@Param('applicationId') applicationId: string) {
    return this.creditScoreService.calculateByApplicationId(applicationId);
  }

  @Post(':applicationId')
  @ApiTags('Applications Credit Score')
  @ApiBearerAuth('JWT')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.CHECKER)
  @ApiOperation({
    summary: 'Calculate credit score by application id',
  })
  create(
    @Body() dto: CreateCreditScoringDto,
    @Param('applicationId') applicationId: string,
  ) {
    return this.creditScoreService.saveCreditScoreParameterByApplicationId(
      dto,
      applicationId,
    );
  }
}
