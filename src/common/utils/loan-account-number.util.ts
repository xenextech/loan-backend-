export function generateLoanAccountNumber(): string {
  const prefix = 'LN';
  const year = new Date().getFullYear();
  const random = Math.floor(10000 + Math.random() * 90000);
  return `${prefix}-${year}-${random}`;
}
