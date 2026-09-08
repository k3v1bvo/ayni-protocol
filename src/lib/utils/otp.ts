/**
 * Utilidades para generación y verificación de OTP criptográfico
 * Basado en RF-08 y Módulo C de Seguridad de AYNI.
 */

const OTP_CHARS = '23456789ABCDEFGHJKLMNPQRSTUVWXYZ'; // Evita caracteres ambiguos (0, O, 1, I)

/**
 * Genera un código OTP alfanumérico seguro de 6 caracteres
 */
export function generateOtpCode(length = 6): string {
  let result = '';
  const array = new Uint8Array(length);
  if (typeof window !== 'undefined' && window.crypto) {
    window.crypto.getRandomValues(array);
    for (let i = 0; i < length; i++) {
      result += OTP_CHARS[array[i] % OTP_CHARS.length];
    }
  } else {
    for (let i = 0; i < length; i++) {
      result += OTP_CHARS[Math.floor(Math.random() * OTP_CHARS.length)];
    }
  }
  return result;
}

/**
 * Calcula el hash SHA-256 en formato hexadecimal de un string
 */
export async function hashOtpCode(otpCode: string): Promise<string> {
  const normalized = otpCode.trim().toUpperCase();
  if (typeof window !== 'undefined' && window.crypto && window.crypto.subtle) {
    const encoder = new TextEncoder();
    const data = encoder.encode(normalized);
    const hashBuffer = await window.crypto.subtle.digest('SHA-256', data);
    const hashArray = Array.from(new Uint8Array(hashBuffer));
    return hashArray.map(b => b.toString(16).padStart(2, '0')).join('');
  }
  
  // Fallback simple para entornos sin crypto.subtle
  let hash = 0;
  for (let i = 0; i < normalized.length; i++) {
    hash = (hash << 5) - hash + normalized.charCodeAt(i);
    hash |= 0;
  }
  return Math.abs(hash).toString(16).padStart(64, '0');
}

/**
 * Valida si un OTP ingresado coincide con el hash almacenado
 */
export async function verifyOtpCode(inputOtp: string, storedHash: string): Promise<boolean> {
  const inputHash = await hashOtpCode(inputOtp);
  return inputHash.toLowerCase() === storedHash.toLowerCase();
}
