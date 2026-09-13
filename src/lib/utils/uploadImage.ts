/**
 * AYNI Protocol — ImgBB API & Cloud Storage Utility
 * Subida automática de imágenes 100% por API (Rest API v1)
 * Con compresión previa en el navegador y fallback multi-clave
 */

const PRIMARY_IMGBB_KEY = process.env.NEXT_PUBLIC_IMGBB_API_KEY || process.env.IMGBB_API_KEY || 'b049b0990069aec5dfec445cff31a63a';
const BACKUP_IMGBB_KEY = '471638ad84d836135f96a835dc638435';

/**
 * 1. Compresión previa en el navegador (client-side)
 * Si la imagen supera los 400 KB o es una foto pesada de celular,
 * la escala (máx 1920x1920 px) y la comprime a JPEG con calidad 85% para subida casi instantánea.
 */
export async function compressImage(
  file: File,
  maxWidth: number = 1920,
  maxHeight: number = 1920,
  quality: number = 0.85
): Promise<File> {
  // Si no estamos en el navegador o no es imagen, retornar tal cual
  if (typeof window === 'undefined' || !file.type.startsWith('image/')) {
    return file;
  }

  // Si ya pesa menos de 350 KB, no hace falta comprimir
  if (file.size <= 350 * 1024) {
    return file;
  }

  return new Promise((resolve) => {
    const img = new Image();
    const canvas = document.createElement('canvas');
    const ctx = canvas.getContext('2d');

    img.onload = () => {
      let { width, height } = img;

      // Mantener aspect ratio
      if (width > maxWidth || height > maxHeight) {
        if (width > height) {
          height = Math.round((height * maxWidth) / width);
          width = maxWidth;
        } else {
          width = Math.round((width * maxHeight) / height);
          height = maxHeight;
        }
      }

      canvas.width = width;
      canvas.height = height;
      ctx?.drawImage(img, 0, 0, width, height);

      canvas.toBlob(
        (blob) => {
          if (blob && blob.size < file.size) {
            const compressed = new File([blob], file.name.replace(/\.[^/.]+$/, '.jpg'), {
              type: 'image/jpeg',
              lastModified: Date.now(),
            });
            resolve(compressed);
          } else {
            resolve(file);
          }
        },
        'image/jpeg',
        quality
      );
    };

    img.onerror = () => resolve(file);
    img.src = URL.createObjectURL(file);
  });
}

/**
 * 2. Subida a ImgBB mediante llamada REST API v1 directa (client-side)
 * con soporte multi-key y hasta 3 reintentos.
 */
async function tryUploadToImgBBApi(file: File, apiKey: string): Promise<string | null> {
  try {
    const formData = new FormData();
    formData.append('image', file);
    formData.append('name', file.name.replace(/\.[^/.]+$/, ''));

    const res = await fetch(`https://api.imgbb.com/1/upload?key=${apiKey}`, {
      method: 'POST',
      body: formData,
    });

    if (!res.ok) return null;

    const data = await res.json();
    if (data.success && data.data?.url) {
      return data.data.url; // URL pública directa (ej. https://i.ibb.co/.../foto.jpg)
    }
    return null;
  } catch (err) {
    return null;
  }
}

/**
 * 3. Función principal: Sube una foto a ImgBB con estrategia en cascada:
 * - Intento 1: Llamada directa a ImgBB con clave primaria.
 * - Intento 2: Llamada directa a ImgBB con clave de respaldo.
 * - Intento 3: Llamada interna al backend (/api/upload).
 * Devuelve la URL pública directa.
 */
export async function uploadImageToImgBB(file: File): Promise<string> {
  // Paso A: Comprimir imagen antes de enviar
  const fileToUpload = await compressImage(file);

  // Paso B: Intento directo a ImgBB con clave primaria
  if (PRIMARY_IMGBB_KEY) {
    const url1 = await tryUploadToImgBBApi(fileToUpload, PRIMARY_IMGBB_KEY);
    if (url1) return url1;
  }

  // Paso C: Intento directo a ImgBB con clave secundaria
  if (BACKUP_IMGBB_KEY && BACKUP_IMGBB_KEY !== PRIMARY_IMGBB_KEY) {
    const url2 = await tryUploadToImgBBApi(fileToUpload, BACKUP_IMGBB_KEY);
    if (url2) return url2;
  }

  // Paso D: Fallback vía API interna del servidor (/api/upload)
  try {
    const formData = new FormData();
    formData.append('image', fileToUpload);

    const res = await fetch('/api/upload', {
      method: 'POST',
      body: formData,
    });

    if (res.ok) {
      const data = await res.json();
      if (data.url) return data.url;
    }
  } catch (backendErr) {
    console.warn('[Upload] Fallo fallback vía /api/upload:', backendErr);
  }

  // Paso E: Fallback de seguridad en memoria (DataURL) para nunca bloquear al usuario
  return new Promise((resolve) => {
    const reader = new FileReader();
    reader.onloadend = () => resolve(reader.result as string);
    reader.readAsDataURL(fileToUpload);
  });
}

/**
 * Sube múltiples imágenes en paralelo a ImgBB
 */
export async function uploadMultipleImagesToImgBB(files: File[]): Promise<string[]> {
  const promises = files.map(file => uploadImageToImgBB(file));
  return Promise.all(promises);
}
