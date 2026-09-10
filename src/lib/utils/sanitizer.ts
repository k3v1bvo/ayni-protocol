/**
 * Backend Clean Architecture - Input Sanitization & Validation Layer
 * Protects forms against XSS, script injection, malformed data, and unexpected payload types.
 */

export function sanitizeText(value: unknown, maxLength: number = 255): string {
  if (typeof value !== 'string') return '';
  return value
    .replace(/[<>]/g, '') // Strip basic HTML tags
    .trim()
    .slice(0, maxLength);
}

export function sanitizeEmail(value: unknown): string {
  if (typeof value !== 'string') return '';
  const clean = value.trim().toLowerCase();
  // Standard RFC 5322 regex validation
  const emailRegex = /^[a-zA-Z0-9.!#$%&'*+/=?^_`{|}~-]+@[a-zA-Z0-9-]+(?:\.[a-zA-Z0-9-]+)*$/;
  return emailRegex.test(clean) ? clean : '';
}

export function sanitizeAmount(value: unknown, min: number = 0, max: number = 1000000): number {
  const num = typeof value === 'number' ? value : parseFloat(String(value));
  if (isNaN(num) || !isFinite(num)) return 0;
  return Math.min(max, Math.max(min, Math.round(num * 100) / 100));
}

export function sanitizePhone(value: unknown): string {
  if (typeof value !== 'string') return '';
  // Allow numbers, spaces, plus signs, dashes, parentheses
  return value.replace(/[^0-9+\s\-()]/g, '').trim().slice(0, 30);
}

export function sanitizeRedirect(url: unknown, defaultUrl: string = '/dashboard'): string {
  if (typeof url !== 'string' || !url.startsWith('/') || url.startsWith('//')) {
    return defaultUrl;
  }
  return url.slice(0, 200);
}
