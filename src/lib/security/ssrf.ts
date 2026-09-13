/**
 * Utilidad de Protección Anti-SSRF (Server-Side Request Forgery)
 * y Sanitización Defensiva de Peticiones Externas para AYNI Protocol.
 * 
 * Cumple con directivas OWASP Top 10 y Web Security Academy.
 */

const BLOCKED_HOSTNAMES = new Set([
  'localhost',
  '127.0.0.1',
  '0.0.0.0',
  '::1',
  'metadata.google.internal',
  '169.254.169.254', // AWS/GCP/Azure Instance Metadata
  'instance-data',
]);

const PRIVATE_IP_REGEX = /^(10\.|127\.|172\.(1[6-9]|2[0-9]|3[0-1])\.|192\.168\.|169\.254\.)/;

/**
 * Valida si una URL es estrictamente HTTPS y no apunta a recursos internos o metadatos de la nube.
 */
export function isSafeHttpsUrl(rawUrl: string): boolean {
  if (!rawUrl || typeof rawUrl !== 'string') return false;

  try {
    const parsed = new URL(rawUrl.trim());

    // 1. Debe ser obligatoriamente protocolo HTTPS
    if (parsed.protocol !== 'https:') {
      return false;
    }

    const host = parsed.hostname.toLowerCase();

    // 2. Bloquear nombres de host internos conocidos
    if (BLOCKED_HOSTNAMES.has(host)) {
      return false;
    }

    // 3. Bloquear rangos de IP privadas (RFC 1918 / Loopback / Link-Local)
    if (PRIVATE_IP_REGEX.test(host)) {
      return false;
    }

    // 4. Bloquear puertos no estándar (solo 443 o puerto por defecto)
    if (parsed.port && parsed.port !== '443') {
      return false;
    }

    return true;
  } catch {
    return false;
  }
}

/**
 * Descarga de manera segura una imagen externa con protección contra:
 * - SSRF
 * - Bombas de descompresión / DoS por tamaño de archivo
 * - Slowloris / Timeout de peticiones colgadas
 */
export async function safeFetchImage(
  url: string,
  maxBytes: number = 10 * 1024 * 1024, // 10MB límite
  timeoutMs: number = 6000 // 6s timeout
): Promise<{ buffer: Buffer; mimeType: string } | null> {
  if (!isSafeHttpsUrl(url)) {
    console.warn(`[Anti-SSRF] Petición bloqueada hacia URL insegura o privada: ${url}`);
    return null;
  }

  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), timeoutMs);

  try {
    const res = await fetch(url, {
      signal: controller.signal,
      headers: {
        'User-Agent': 'AYNI-Security-Oracle/1.0',
        Accept: 'image/jpeg, image/png, image/webp, image/gif, */*',
      },
    });

    if (!res.ok) {
      console.warn(`[Anti-SSRF] Error HTTP ${res.status} al descargar imagen segura: ${url}`);
      return null;
    }

    // Validar Content-Length anticipado si está presente
    const contentLength = res.headers.get('content-length');
    if (contentLength && parseInt(contentLength, 10) > maxBytes) {
      console.warn(`[Anti-SSRF] Imagen rechazada: tamaño excede el límite permitido (${contentLength} > ${maxBytes})`);
      return null;
    }

    const arrayBuffer = await res.arrayBuffer();
    if (arrayBuffer.byteLength > maxBytes) {
      console.warn(`[Anti-SSRF] Imagen rechazada por sobrepasar ${maxBytes} bytes`);
      return null;
    }

    const rawMime = res.headers.get('content-type') || 'image/jpeg';
    const mimeType = rawMime.split(';')[0].trim().toLowerCase();

    return {
      buffer: Buffer.from(arrayBuffer),
      mimeType,
    };
  } catch (err: any) {
    console.warn(`[Anti-SSRF] Fallo al descargar imagen: ${err.message}`);
    return null;
  } finally {
    clearTimeout(timer);
  }
}
