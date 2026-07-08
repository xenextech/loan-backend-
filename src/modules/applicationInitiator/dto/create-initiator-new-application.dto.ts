import { IntersectionType } from '@nestjs/swagger';
import { Step1Dto } from '../../applications/dto/step1.dto';
import { Step2Dto } from '../../applications/dto/step2.dto';
import { Step3Dto } from '../../applications/dto/step3.dto';

// The Initiator-sourced "create a complete application" form — deliberately
// composed from the student flow's own Step1/2/3Dto (via IntersectionType)
// rather than redeclared, so field names, validation rules, and Swagger docs
// can never drift between the two entry points. Step4Dto (declaration/
// consent) is intentionally excluded: that's the student's own legal
// declaration and doesn't apply when the Initiator enters the record.
export class CreateInitiatorNewApplicationDto extends IntersectionType(
  Step1Dto,
  Step2Dto,
  Step3Dto,
) {}
