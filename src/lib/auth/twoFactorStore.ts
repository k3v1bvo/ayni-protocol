/**
 * Store en memoria con expiración y control de intentos para códigos 2FA
 */

interface TwoFactorEntry {
  code: string;
  expiresAt: number;
  attempts: number;
}

declare global {
  // eslint-disable-next-line no-var
  var __ayni_2fa_store: Map<string, TwoFactorEntry> | undefined;
}

const store = globalThis.__ayni_2fa_store || new Map<string, TwoFactorEntry>();
if (!globalThis.__ayni_2fa_store) {
  globalThis.__ayni_2fa_store = store;
}

export function save2FACode(email: string, code: string, ttlMinutes: number = 10): void {
  const cleanEmail = email.toLowerCase().trim();
  store.set(cleanEmail, {
    code,
    expiresAt: Date.now() + ttlMinutes * 60 * 1000,
    attempts: 0,
  });
}

export function verify2FACode(email: string, inputCode: string): { valid: boolean; error?: string } {
  const cleanEmail = email.toLowerCase().trim();
  const entry = store.get(cleanEmail);

  if (!entry) {
    return { valid: false, error: 'No se ha solicitado ningún código o ya expiró. Solicita uno nuevo.' };
  }

  if (Date.now() > entry.expiresAt) {
    store.delete(cleanEmail);
    return { valid: false, error: 'El código ha expirado. Por favor solicita uno nuevo.' };
  }

  if (entry.attempts >= 4) {
    store.delete(cleanEmail);
    return { valid: false, error: 'Demasiados intentos fallidos. Por seguridad, solicita un nuevo código.' };
  }

  if (entry.code !== inputCode.trim()) {
    entry.attempts += 1;
    const remaining = 4 - entry.attempts;
    return {
      valid: false,
      error: `Código incorrecto. ${remaining > 0 ? `Te quedan ${remaining} intento(s).` : 'Código bloqueado.'}`,
    };
  }

  // Código verificado con éxito -> eliminar para evitar reutilización (Replay attack prevention)
  store.delete(cleanEmail);
  return { valid: true };
}
