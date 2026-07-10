import { ApiProperty } from '@nestjs/swagger';

// Kept as a plain TS union rather than a Prisma enum: documentType here is
// derived per-request from which of the three source tables a row came from,
// never persisted as a column — see DocumentVaultService's DOCUMENT_TYPE_LABELS.
// Add a new source table + case in DocumentVaultService to extend this list;
// the response shape below never needs to change.
export type VaultDocumentType =
  'OFFER_LETTER' | 'AGREEMENT' | 'ENROLLMENT_CERTIFICATE';

export class VaultDocumentDto {
  @ApiProperty({ example: 'b3e1c2a4-1234-4a5b-9c8d-abcdef123456' })
  id: string;

  @ApiProperty({
    example: 'OFFER_LETTER',
    enum: ['OFFER_LETTER', 'AGREEMENT', 'ENROLLMENT_CERTIFICATE'],
  })
  documentType: VaultDocumentType;

  @ApiProperty({ example: 'Offer Letter — AIM/OL/2081/0031' })
  documentName: string;

  @ApiProperty({ example: 'b3e1c2a4-1234-4a5b-9c8d-abcdef654321' })
  applicationId: string;

  @ApiProperty({ example: 'UNL-2026-000123', nullable: true })
  applicationNumber: string | null;

  @ApiProperty({ example: 'Ace Institute of Management' })
  uploadedBy: string;

  @ApiProperty({ example: '2026-07-10T09:15:00.000Z' })
  generatedAt: Date;

  @ApiProperty({ example: 'PDF' })
  fileType: 'PDF';

  @ApiProperty({
    example: '/dashboard/document-vault/offer-letter/b3e1c2a4-...',
  })
  downloadUrl: string;

  @ApiProperty({
    example: '/dashboard/document-vault/offer-letter/b3e1c2a4-...',
  })
  previewUrl: string;

  @ApiProperty({ example: 'AVAILABLE' })
  status: 'AVAILABLE';
}

export class VaultDocumentListResponseDto {
  @ApiProperty({ type: [VaultDocumentDto] })
  documents: VaultDocumentDto[];
}
