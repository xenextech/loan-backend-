import { Controller, Post, Body, HttpCode, HttpStatus } from '@nestjs/common';
import { ApiTags, ApiOperation } from '@nestjs/swagger';
import { EmiCalculatorService } from './emi-calculator.service';
import { EligibilityService } from './eligibility.service';
import { EmiCalculatorDto } from './dto/emi-calculator.dto';
import { EligibilityDto } from './dto/eligibility.dto';
import { Public } from '../../common/decorators/public.decorator';

@ApiTags('Utils')
@Public()
@Controller('utils')
export class UtilsController {
  constructor(
    private readonly emiService: EmiCalculatorService,
    private readonly eligibilityService: EligibilityService,
  ) {}

  @Post('emi-calculator')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Calculate monthly EMI (public endpoint)' })
  calculateEmi(@Body() dto: EmiCalculatorDto) {
    return this.emiService.calculate(dto);
  }

  @Post('eligibility-checker')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Check loan eligibility (public endpoint)' })
  checkEligibility(@Body() dto: EligibilityDto) {
    return this.eligibilityService.check(dto);
  }
}
