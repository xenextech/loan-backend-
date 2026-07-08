import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsString } from 'class-validator';

// Subset of ParentDocumentType accepted by the single-file identity document
// route — SALARY_SHEET is deliberately excluded, it has its own multi-file route.
export enum ParentIdentityDocumentType {
  NID = 'NID',
  PAN_ID = 'PAN_ID',
}

export class UpdateParentDocumentLabelDto {
  @ApiProperty({ example: 'ABC Bank Salary Slip' })
  @IsString()
  @IsNotEmpty({ message: 'Document label cannot be empty' })
  label: string;
}
