import { Controller, Get, Param } from '@nestjs/common';
import { ApiOperation } from '@nestjs/swagger';
import { Roles } from '../../common/decorators/roles.decorator';
import { UserRole } from '../../common/enums';
import { CreditScoreService } from './credit-score.service';

@Controller('credit-score')
export class CreditScoreController {
  constructor(private readonly creditScoreService: CreditScoreService) {}
  @Get(':applicationId')
  // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access
  @Roles(UserRole.STUDENT, UserRole.ADMIN)
  @ApiOperation({
    summary: 'Calculate credit score by application id',
  })
  calculateCreditScore(@Param('applicationId') applicationId: string) {
    return this.creditScoreService.calculateByApplicationId(applicationId);
  }
}
