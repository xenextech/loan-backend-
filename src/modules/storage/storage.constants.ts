export const STORAGE_BUCKETS = {
  PRIVATE: 'Private',
  PUBLIC_IMAGES: 'Public Image',
} as const;

// All loan documents go to the private bucket
export const DOCUMENT_BUCKET = STORAGE_BUCKETS.PRIVATE;

export const SIGNED_URL_EXPIRY_SECONDS = 365 * 24 * 60 * 60; // 1 year

export const ALLOWED_IMAGE_TYPES = ['image/jpeg', 'image/png', 'image/webp'];
export const ALLOWED_DOCUMENT_TYPES = [
  'application/pdf',
  'application/msword',
  'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
];

export const MAX_IMAGE_SIZE = 3 * 1024 * 1024; // 3 MB
export const MAX_DOCUMENT_SIZE = 5 * 1024 * 1024; // 5 MB
