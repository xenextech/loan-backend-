export interface OcrIdentityResult {
  fullName?: string;
  dateOfBirth?: string;
  identityNumber?: string;
  issuedDistrict?: string;
  issuedDate?: string;
}

export interface OcrProvider {
  extractIdentityData(filePath: string): Promise<OcrIdentityResult>;
}
