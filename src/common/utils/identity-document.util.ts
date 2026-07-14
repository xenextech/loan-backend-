import { BadRequestException } from '@nestjs/common';
import { DocumentType, IdentityType } from '../enums';

export const IDENTITY_DOCUMENT_TYPES: DocumentType[] = [
  DocumentType.IDENTITY_FRONT,
  DocumentType.IDENTITY_BACK,
  DocumentType.IDENTITY_DOCUMENT,
];

const IDENTITY_TYPE_LABELS: Record<string, string> = {
  [IdentityType.CITIZENSHIP]: 'Citizenship',
  [IdentityType.PASSPORT]: 'Passport',
  [IdentityType.DRIVING_LICENSE]: 'Driving License',
  [IdentityType.NATIONAL_ID]: 'National ID',
  [IdentityType.PAN_NUMBER]: 'PAN Number',
};

export function isIdentityDocumentType(documentType: DocumentType): boolean {
  return IDENTITY_DOCUMENT_TYPES.includes(documentType);
}

// Mime-type guard for IDENTITY_DOCUMENT: must be an image or PDF.
// Front/back image slots also accept PDF in addition to images so the
// user can upload whichever format they have available.
export function assertIdentitySingleDocumentMimeType(
  _identityType: string | null | undefined,
  _documentType: DocumentType,
  _mimeType: string,
): void {
  // All identity document slots (IDENTITY_FRONT, IDENTITY_BACK,
  // IDENTITY_DOCUMENT) accept images and/or PDF.
  // Allowed types are enforced at the storage layer via DOCUMENT_CONFIG —
  // no additional restrictions are applied here.
}

// Final completeness check — run before allowing an application to be submitted.
// At least one identity document must be present (front image, back image,
// or a single document file). Users may upload any combination of the three.
export function assertIdentityDocumentsComplete(
  identityType: string | null | undefined,
  documents: { documentType: DocumentType; mimeType: string }[],
): void {
  if (!identityType) return;

  const hasFront = documents.some(
    (d) => d.documentType === DocumentType.IDENTITY_FRONT,
  );
  const hasBack = documents.some(
    (d) => d.documentType === DocumentType.IDENTITY_DOCUMENT ||
           d.documentType === DocumentType.IDENTITY_BACK,
  );

  if (!hasFront && !hasBack) {
    const label = IDENTITY_TYPE_LABELS[identityType] ?? identityType;
    throw new BadRequestException(
      `${label} requires at least one identity document (front image, back image, or a PDF/document file).`,
    );
  }
}
