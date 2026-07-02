import { PartialType } from '@nestjs/swagger';
import { CreateInitiatorApplicationDto } from './create-initiator-application.dto';

export class UpdateInitiatorApplicationDto extends PartialType(
  CreateInitiatorApplicationDto,
) {
  relationshipStartDate: any;
  citizenshipIssuedDate: any;
}
