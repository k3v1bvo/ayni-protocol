import { getSupabaseBrowserClient } from '@/lib/supabase/client';

/**
 * Upload a file to Supabase Storage.
 * @param bucket - The storage bucket name (e.g., 'products', 'avatars', 'receipts')
 * @param file - The File object to upload
 * @param path - Optional custom path within the bucket. If omitted, generates a unique name.
 * @returns The public URL of the uploaded file, or null on failure.
 */
export async function uploadToSupabase(
  bucket: string,
  file: File,
  path?: string
): Promise<string | null> {
  try {
    const supabase = getSupabaseBrowserClient();

    const ext = file.name.split('.').pop()?.toLowerCase() || 'jpg';
    const safeName = `${Date.now()}-${Math.random().toString(36).slice(2, 8)}.${ext}`;
    const filePath = path || safeName;

    const { error } = await supabase.storage
      .from(bucket)
      .upload(filePath, file, {
        cacheControl: '3600',
        upsert: true,
        contentType: file.type,
      });

    if (error) {
      console.error(`Upload error (${bucket}/${filePath}):`, error.message);
      return null;
    }

    const { data: publicData } = supabase.storage
      .from(bucket)
      .getPublicUrl(filePath);

    return publicData?.publicUrl || null;
  } catch (err) {
    console.error('Upload failed:', err);
    return null;
  }
}

/**
 * Upload multiple files to Supabase Storage.
 * @param bucket - The storage bucket name
 * @param files - Array of File objects
 * @param pathPrefix - Optional prefix for file paths (e.g., 'product-123/')
 * @returns Array of public URLs (nulls filtered out)
 */
export async function uploadMultipleToSupabase(
  bucket: string,
  files: File[],
  pathPrefix?: string
): Promise<string[]> {
  const uploads = files.map((file, idx) => {
    const prefix = pathPrefix ? `${pathPrefix}/` : '';
    const ext = file.name.split('.').pop()?.toLowerCase() || 'jpg';
    const path = `${prefix}${Date.now()}-${idx}-${Math.random().toString(36).slice(2, 6)}.${ext}`;
    return uploadToSupabase(bucket, file, path);
  });

  const results = await Promise.all(uploads);
  return results.filter((url): url is string => url !== null);
}

/**
 * Delete a file from Supabase Storage.
 * @param bucket - The storage bucket name
 * @param filePath - The path of the file to delete
 */
export async function deleteFromSupabase(bucket: string, filePath: string): Promise<boolean> {
  try {
    const supabase = getSupabaseBrowserClient();
    const { error } = await supabase.storage.from(bucket).remove([filePath]);
    if (error) {
      console.error(`Delete error (${bucket}/${filePath}):`, error.message);
      return false;
    }
    return true;
  } catch (err) {
    console.error('Delete failed:', err);
    return false;
  }
}

/**
 * Compress an image file before upload (client-side).
 * Reduces file size while maintaining acceptable quality.
 * @param file - The original image file
 * @param maxWidth - Maximum width in pixels (default 1200)
 * @param quality - JPEG quality 0-1 (default 0.8)
 * @returns Compressed File object
 */
export async function compressImage(
  file: File,
  maxWidth: number = 1200,
  quality: number = 0.8
): Promise<File> {
  return new Promise((resolve) => {
    // If not an image or already small, return as-is
    if (!file.type.startsWith('image/') || file.size < 100 * 1024) {
      resolve(file);
      return;
    }

    const img = new Image();
    const canvas = document.createElement('canvas');
    const ctx = canvas.getContext('2d');

    img.onload = () => {
      let { width, height } = img;

      if (width > maxWidth) {
        height = Math.round((height * maxWidth) / width);
        width = maxWidth;
      }

      canvas.width = width;
      canvas.height = height;
      ctx?.drawImage(img, 0, 0, width, height);

      canvas.toBlob(
        (blob) => {
          if (blob) {
            const compressed = new File([blob], file.name, {
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
