/**
 * AYNI Protocol — Data Privacy & Cryptographic Obfuscation Layer
 * Protege la privacidad de usuarios, billeteras y códigos sensibles (GDPR & ISO/IEC 27701)
 */

/**
 * Ofusca un correo electrónico manteniendo legibles el primer y último caracter del usuario y el dominio.
 * Ejemplo: "carlos.quispe@gmail.com" -> "c••••••e@gmail.com"
 */
export function obfuscateEmail(email: string | null | undefined): string {
  if (!email || !email.includes('@')) return '••••••••@••••.com';
  const [username, domain] = email.trim().toLowerCase().split('@');
  if (username.length <= 2) {
    return `${username[0]}•@${domain}`;
  }
  const firstChar = username[0];
  const lastChar = username[username.length - 1];
  const masked = '•'.repeat(Math.min(username.length - 2, 6));
  return `${firstChar}${masked}${lastChar}@${domain}`;
}

/**
 * Ofusca una dirección de billetera Web3 dejando legibles el prefijo y sufijo hexadecimal.
 * Ejemplo: "0x53a97d2f0DAE06cDE58a89bEEb0FbcA98Cf98ad8" -> "0x53a9••••8ad8"
 */
export function obfuscateWallet(address: string | null | undefined, prefixChars: number = 6, suffixChars: number = 4): string {
  if (!address) return '0x••••••••••••';
  const clean = address.trim();
  if (clean.length <= prefixChars + suffixChars) return clean;
  return `${clean.slice(0, prefixChars)}••••${clean.slice(-suffixChars)}`;
}

/**
 * Ofusca un número de teléfono dejando el código de país y los últimos 2 dígitos.
 * Ejemplo: "+591 71234567" -> "+591 •••• ••67"
 */
export function obfuscatePhone(phone: string | null | undefined): string {
  if (!phone) return '••••••••';
  const clean = phone.trim();
  if (clean.length <= 4) return '••••';
  const suffix = clean.slice(-2);
  const prefix = clean.startsWith('+') ? clean.slice(0, 4) : '';
  return `${prefix} •••• ••${suffix}`;
}

/**
 * Ofusca un código OTP para vistas previas seguras o registros de auditoría.
 * Ejemplo: "849201" -> "•••201"
 */
export function obfuscateOtp(otp: string | null | undefined): string {
  if (!otp) return '••••••';
  const clean = otp.trim();
  if (clean.length <= 3) return '•••';
  return '•••' + clean.slice(-3);
}

/**
 * Ofusca un nombre completo para privacidad en listados públicos de transacciones.
 * Ejemplo: "Valentina Mamani Quispe" -> "Valentina M. Q."
 */
export function obfuscateName(fullName: string | null | undefined): string {
  if (!fullName) return 'Usuario';
  const parts = fullName.trim().split(/\s+/);
  if (parts.length === 1) return parts[0];
  const first = parts[0];
  const initials = parts.slice(1).map(p => `${p[0].toUpperCase()}.`).join(' ');
  return `${first} ${initials}`;
}

/**
 * Ofusca un documento de identidad o pasaporte para auditorías públicas.
 * Ejemplo: "6849201-LP" -> "68••••01-LP"
 */
export function obfuscateDocumentId(docId: string | null | undefined): string {
  if (!docId) return '••••••';
  const clean = docId.trim();
  if (clean.length <= 4) return '••••';
  return `${clean.slice(0, 2)}••••${clean.slice(-3)}`;
}
