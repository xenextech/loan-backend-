import { BadRequestException } from '@nestjs/common';
import { DocumentType, IdentityType } from '../enums';

export const IDENTITY_DOCUMENT_TYPES: DocumentType[] = [
  DocumentType.IDENTITY_FRONT,
  DocumentType.IDENTITY_BACK,
  DocumentType.IDENTITY_DOCUMENT,
];

const SINGLE_DOCUMENT_IDENTITY_TYPES = new Set<string>([
  IdentityType.PASSPORT,
  IdentityType.DRIVING_LICENSE,
  IdentityType.NATIONAL_ID,
  IdentityType.PAN_NUMBER,
]);

const IDENTITY_TYPE_LABELS: Record<string, string> = {
  [IdentityType.CITIZENSHIP]: 'Citizenship',
  [IdentityType.PASSPORT]: 'Passport',
  [IdentityType.DRIVING_LICENSE]: 'Driving License',
  [IdentityType.NATIONAL_ID]: 'National ID',
  [IdentityType.PAN_NUMBER]: 'PAN Number',
};

const CITIZENSHIP_CHOICE_ERROR =
  'Citizenship requires either: Front + Back images, OR one PDF document — not both.';

export function isIdentityDocumentType(documentType: DocumentType): boolean {
  return IDENTITY_DOCUMENT_TYPES.includes(documentType);
}

// Blocks mixing the two Citizenship options (front/back images vs. single PDF)
// as soon as a conflicting file is uploaded, without needing to know identityType yet.
export function assertIdentityUploadNotConflicting(
  documentType: DocumentType,
  existingTypes: DocumentType[],
): void {
  const isFrontOrBack =
    documentType === DocumentType.IDENTITY_FRONT ||
    documentType === DocumentType.IDENTITY_BACK;
  const isSingleDocument = documentType === DocumentType.IDENTITY_DOCUMENT;
  if (!isFrontOrBack && !isSingleDocument) return;

  const hasSingleDocument = existingTypes.includes(
    DocumentType.IDENTITY_DOCUMENT,
  );
  const hasFrontOrBack = existingTypes.some(
    (t) =>
      t === DocumentType.IDENTITY_FRONT || t === DocumentType.IDENTITY_BACK,
  );

  if (isFrontOrBack && hasSingleDocument) {
    throw new BadRequestException(CITIZENSHIP_CHOICE_ERROR);
  }
  if (isSingleDocument && hasFrontOrBack) {
    throw new BadRequestException(CITIZENSHIP_CHOICE_ERROR);
  }
}

// Citizenship's single-file option must be a PDF (images already have the front/back slots).
export function assertIdentitySingleDocumentMimeType(
  identityType: string | null | undefined,
  documentType: DocumentType,
  mimeType: string,
): void {
  if (!identityType) return;

  const isFrontOrBack =
    documentType === DocumentType.IDENTITY_FRONT ||
    documentType === DocumentType.IDENTITY_BACK;
  // eslint-disable-next-line @typescript-eslint/no-unsafe-enum-comparison
  if (isFrontOrBack && identityType !== IdentityType.CITIZENSHIP) {
    throw new BadRequestException(
      `${IDENTITY_TYPE_LABELS[identityType] ?? identityType} requires exactly one uploaded document (image or PDF) — front/back image slots are only used for Citizenship.`,
    );
  }

  if (
    // eslint-disable-next-line @typescript-eslint/no-unsafe-enum-comparison
    identityType === IdentityType.CITIZENSHIP &&
    documentType === DocumentType.IDENTITY_DOCUMENT &&
    mimeType !== 'application/pdf'
  ) {
    throw new BadRequestException(
      "Citizenship's single-document option only accepts a PDF file. To upload images instead, use the front and back image slots.",
    );
  }
}

// Final completeness check — run before allowing an application to be submitted.
export function assertIdentityDocumentsComplete(
  identityType: string | null | undefined,
  documents: { documentType: DocumentType; mimeType: string }[],
): void {
  if (!identityType) return;

  const hasFront = documents.some(
    (d) => d.documentType === DocumentType.IDENTITY_FRONT,
  );
  const hasBack = documents.some(
    (d) => d.documentType === DocumentType.IDENTITY_BACK,
  );
  const singleDocument = documents.find(
    (d) => d.documentType === DocumentType.IDENTITY_DOCUMENT,
  );

  // eslint-disable-next-line @typescript-eslint/no-unsafe-enum-comparison
  if (identityType === IdentityType.CITIZENSHIP) {
    if (singleDocument && (hasFront || hasBack)) {
      throw new BadRequestException(CITIZENSHIP_CHOICE_ERROR);
    }
    if (singleDocument) {
      if (singleDocument.mimeType !== 'application/pdf') {
        throw new BadRequestException(
          "Citizenship's single-document option only accepts a PDF file.",
        );
      }
      return;
    }
    if (hasFront !== hasBack) {
      throw new BadRequestException(
        'Citizenship requires both Front and Back images when not uploading a single PDF.',
      );
    }
    if (!hasFront && !hasBack) {
      throw new BadRequestException(CITIZENSHIP_CHOICE_ERROR);
    }
    return;
  }

  if (SINGLE_DOCUMENT_IDENTITY_TYPES.has(identityType) && !singleDocument) {
    throw new BadRequestException(
      `${IDENTITY_TYPE_LABELS[identityType]} requires exactly one uploaded document (image or PDF).`,
    );
  }
}
