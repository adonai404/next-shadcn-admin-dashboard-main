export function normalizeCnpj(value: string): string {
  return value.replace(/\D/g, "");
}

export function isValidCnpjLength(value: string): boolean {
  return normalizeCnpj(value).length === 14;
}

export function formatCnpj(value: string): string {
  const digits = normalizeCnpj(value);
  if (digits.length !== 14) return value;
  return `${digits.slice(0, 2)}.${digits.slice(2, 5)}.${digits.slice(5, 8)}/${digits.slice(8, 12)}-${digits.slice(12)}`;
}
