import { Module } from '@nestjs/common';
import { UtilsController } from './utils.controller';
import { EmiCalculatorService } from './emi-calculator.service';
import { EligibilityService } from './eligibility.service';

@Module({
  controllers: [UtilsController],
  providers: [EmiCalculatorService, EligibilityService],
  exports: [EmiCalculatorService],
})
export class UtilsModule {}
