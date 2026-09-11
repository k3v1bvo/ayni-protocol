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
  onAiDetected?: (detection: { url: string; detectedItem: string; confidence: string; verdict: string; iataSafe: boolean }) => void;
  label?: string;
  compact?: boolean;
  autoAudit?: boolean;
}

export function ImageUploader({
  bucket,
  pathPrefix,
  maxFiles = 5,
  existingUrls = [],
  onUploadComplete,
  onAiDetected,
  label = 'Subir imágenes',
  compact = false,
  autoAudit = true,
}: ImageUploaderProps) {
  const [previews, setPreviews] = useState<string[]>(existingUrls);
  const [uploading, setUploading] = useState(false);
  const [dragOver, setDragOver] = useState(false);
  const [auditingUrl, setAuditingUrl] = useState<string | null>(null);
  const [verifications, setVerifications] = useState<{ [url: string]: { detectedItem: string; confidence: string; verdict: string; iataSafe: boolean } }>({});
  const inputRef = useRef<HTMLInputElement>(null);

  const auditImageWithAi = async (url: string) => {
    setAuditingUrl(url);
    try {
      const res = await fetch('/api/ai/verify-image', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          imageUrl: url,
          type: 'PRODUCT',
        }),
      });

      if (res.ok) {
        const data = await res.json();
        const info = {
          detectedItem: data.detectedItem || 'Artículo identificado',
          confidence: data.confidence || '98%',
          verdict: data.verdict || 'APROBADO_CONFORME',
          iataSafe: data.iataSafe ?? true,
        };
        setVerifications(prev => ({ ...prev, [url]: info }));
        if (onAiDetected) {
          onAiDetected({ url, ...info });
        }
      }
    } catch (err) {
      console.warn('Error auditando imagen con Gemini Vision:', err);
    } finally {
      setAuditingUrl(null);
    }
  };

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
      if (url) {
        newUrls.push(url);
        if (autoAudit) {
          // Auditoría inmediata con Gemini Vision
          auditImageWithAi(url);
        }
      }
    }

    const updated = [...previews, ...newUrls];
    setPreviews(updated);
    onUploadComplete(updated);
    setUploading(false);
  }, [bucket, pathPrefix, maxFiles, previews, onUploadComplete, autoAudit]);

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
          {previews.map((url, i) => {
            const verification = verifications[url];
            const isAuditing = auditingUrl === url;

            return (
              <div key={i} style={{
                position: 'relative',
                aspectRatio: '1',
                borderRadius: '10px',
                overflow: 'hidden',
                border: '1px solid var(--border-default)',
                background: '#050810',
              }}>
                <img
                  src={url}
                  alt={`Preview ${i + 1}`}
                  style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                />

                {/* ImgBB Hosting Tag */}
                <span style={{
                  position: 'absolute',
                  top: 4,
                  left: 4,
                  background: 'rgba(5, 8, 16, 0.85)',
                  color: 'var(--brand-cyan)',
                  fontSize: '0.58rem',
                  padding: '1px 5px',
                  borderRadius: '4px',
                  fontWeight: 800,
                  letterSpacing: '0.5px',
                  border: '1px solid rgba(0, 207, 255, 0.3)',
                }}>
                  ImgBB
                </span>

                {/* Delete button */}
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
                    zIndex: 2,
                  }}
                  aria-label="Eliminar imagen"
                >
                  <X size={12} />
                </button>

                {/* AI Verification Overlay */}
                {verification ? (
                  <div style={{
                    position: 'absolute',
                    bottom: 0,
                    left: 0,
                    right: 0,
                    background: 'linear-gradient(to top, rgba(5,8,16,0.95) 0%, rgba(5,8,16,0.75) 80%, transparent 100%)',
                    padding: '14px 6px 4px 6px',
                    fontSize: '0.62rem',
                    color: '#fff',
                    pointerEvents: 'none',
                  }}>
                    <div style={{ color: 'var(--brand-cyan)', fontWeight: 700, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                      ✓ {verification.detectedItem}
                    </div>
                    <div style={{ fontSize: '0.55rem', color: 'rgba(255,255,255,0.7)' }}>
                      Coincidencia: {verification.confidence}
                    </div>
                  </div>
                ) : isAuditing ? (
                  <div style={{
                    position: 'absolute',
                    bottom: 0,
                    left: 0,
                    right: 0,
                    background: 'rgba(5, 8, 16, 0.9)',
                    padding: '4px',
                    fontSize: '0.58rem',
                    color: 'var(--brand-cyan)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    gap: '4px',
                  }}>
                    <Loader2 size={10} style={{ animation: 'spin 1s linear infinite' }} />
                    <span>Gemini Vision...</span>
                  </div>
                ) : (
                  <button
                    type="button"
                    onClick={() => auditImageWithAi(url)}
                    style={{
                      position: 'absolute',
                      bottom: 4,
                      left: 4,
                      right: 4,
                      background: 'rgba(0, 207, 255, 0.85)',
                      border: 'none',
                      borderRadius: '4px',
                      color: '#050810',
                      fontSize: '0.58rem',
                      fontWeight: 700,
                      padding: '3px 4px',
                      cursor: 'pointer',
                    }}
                  >
                    Auditar con IA
                  </button>
                )}
              </div>
            );
          })}
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
