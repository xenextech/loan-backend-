import {
  Controller,
  Get,
  Post,
  Param,
  UseGuards,
  HttpCode,
  HttpStatus,
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';
import { BankAccountOpeningService } from './bank-account-opening.service';
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
export class BankAccountOpeningController {
  constructor(
    private readonly bankAccountOpeningService: BankAccountOpeningService,
  ) {}

  @Get(':id/bank-account')
  @Roles(UserRole.STUDENT)
  @ApiOperation({
    summary:
      "Get the Bank Account Opening requirement for this application — null until both Parent and College verification are complete. Only the application's own owner can access this.",
  })
  getBankAccountOpening(
    @CurrentUser() user: JwtPayload,
    @Param('id') id: string,
  ) {
    return this.bankAccountOpeningService.getForApplication(id, user.sub);
  }

  @Post(':id/bank-account/complete')
  @HttpCode(HttpStatus.OK)
  @Roles(UserRole.STUDENT)
  @ApiOperation({
    summary:
      'Record that the logged-in student has completed opening a bank account with the partner bank. Idempotent — repeat calls after completion just return the existing record. Requires being signed in as the account that owns this application.',
  })
  completeBankAccountOpening(
    @CurrentUser() user: JwtPayload,
    @Param('id') id: string,
  ) {
    return this.bankAccountOpeningService.completeForApplication(id, user.sub);
  }
}
