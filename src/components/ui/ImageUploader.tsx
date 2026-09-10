'use client';

import React, { useRef, useState, useCallback } from 'react';
import { Upload, X, ImagePlus, Loader2 } from 'lucide-react';
import { uploadToSupabase, compressImage } from '@/lib/storage/upload';

interface ImageUploaderProps {
  bucket: string;
  pathPrefix?: string;
  maxFiles?: number;
  existingUrls?: string[];
  onUploadComplete: (urls: string[]) => void;
  label?: string;
  compact?: boolean;
}

export function ImageUploader({
  bucket,
  pathPrefix,
  maxFiles = 5,
  existingUrls = [],
  onUploadComplete,
  label = 'Subir imágenes',
  compact = false,
}: ImageUploaderProps) {
  const [previews, setPreviews] = useState<string[]>(existingUrls);
  const [uploading, setUploading] = useState(false);
  const [dragOver, setDragOver] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  const handleFiles = useCallback(async (files: FileList | File[]) => {
    const fileArray = Array.from(files).filter(f => f.type.startsWith('image/'));
    if (fileArray.length === 0) return;

    const remaining = maxFiles - previews.length;
    if (remaining <= 0) return;

    const toUpload = fileArray.slice(0, remaining);
    setUploading(true);

    const newUrls: string[] = [];
    for (const file of toUpload) {
      const compressed = await compressImage(file);
      const prefix = pathPrefix ? `${pathPrefix}/` : '';
      const ext = file.name.split('.').pop()?.toLowerCase() || 'jpg';
      const path = `${prefix}${Date.now()}-${Math.random().toString(36).slice(2, 6)}.${ext}`;
      const url = await uploadToSupabase(bucket, compressed, path);
      if (url) newUrls.push(url);
    }

    const updated = [...previews, ...newUrls];
    setPreviews(updated);
    onUploadComplete(updated);
    setUploading(false);
  }, [bucket, pathPrefix, maxFiles, previews, onUploadComplete]);

  const removeImage = (index: number) => {
    const updated = previews.filter((_, i) => i !== index);
    setPreviews(updated);
    onUploadComplete(updated);
  };

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setDragOver(false);
    if (e.dataTransfer.files) handleFiles(e.dataTransfer.files);
  }, [handleFiles]);

  return (
    <div>
      {label && (
        <label className="input-label\" style={{ marginBottom: '8px', display: 'block' }}>
          {label} ({previews.length}/{maxFiles})
        </label>
      )}

      {/* Preview Grid */}
      {previews.length > 0 && (
        <div style={{
          display: 'grid',
          gridTemplateColumns: compact ? 'repeat(auto-fill, minmax(70px, 1fr))' : 'repeat(auto-fill, minmax(100px, 1fr))',
          gap: '8px',
          marginBottom: '12px',
        }}>
          {previews.map((url, i) => (
            <div key={i} style={{
              position: 'relative',
              aspectRatio: '1',
              borderRadius: '10px',
              overflow: 'hidden',
              border: '1px solid var(--border-default)',
            }}>
              <img
                src={url}
                alt={`Preview ${i + 1}`}
                style={{ width: '100%', height: '100%', objectFit: 'cover' }}
              />
              <button
                type="button"
                onClick={() => removeImage(i)}
                style={{
                  position: 'absolute',
                  top: 4,
                  right: 4,
                  width: 22,
                  height: 22,
                  borderRadius: '50%',
                  background: 'rgba(239, 68, 68, 0.9)',
                  border: 'none',
                  color: '#fff',
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  padding: 0,
                }}
              >
                <X size={12} />
              </button>
            </div>
          ))}
        </div>
      )}

      {/* Drop Zone */}
      {previews.length < maxFiles && (
        <div
          onDragOver={(e) => { e.preventDefault(); setDragOver(true); }}
          onDragLeave={() => setDragOver(false)}
          onDrop={handleDrop}
          onClick={() => inputRef.current?.click()}
          style={{
            border: `2px dashed ${dragOver ? 'var(--brand-cyan)' : 'var(--border-default)'}`,
            borderRadius: '12px',
            padding: compact ? '16px' : '24px',
            textAlign: 'center',
            cursor: 'pointer',
            background: dragOver ? 'rgba(0, 207, 255, 0.05)' : 'rgba(255, 255, 255, 0.02)',
            transition: 'all 0.2s ease',
          }}
        >
          {uploading ? (
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px', color: 'var(--brand-cyan)' }}>
              <Loader2 size={20} className="animate-spin" style={{ animation: 'spin 1s linear infinite' }} />
              <span style={{ fontSize: '0.85rem' }}>Subiendo...</span>
            </div>
          ) : (
            <>
              <ImagePlus size={compact ? 20 : 28} color="var(--text-muted)" style={{ marginBottom: '6px' }} />
              <div style={{ fontSize: '0.82rem', color: 'var(--text-secondary)' }}>
                Arrastra imágenes aquí o haz clic para seleccionar
              </div>
              <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)', marginTop: '4px' }}>
                JPG, PNG o WebP · Máx {maxFiles} imágenes
              </div>
            </>
          )}
        </div>
      )}

      <input
        ref={inputRef}
        type="file"
        accept="image/*"
        multiple={maxFiles > 1}
        onChange={(e) => e.target.files && handleFiles(e.target.files)}
        style={{ display: 'none' }}
      />
    </div>
  );
}
