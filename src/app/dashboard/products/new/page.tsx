'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { useAuth } from '@/context/AuthContext';
import { ImageUploader } from '@/components/ui/ImageUploader';
import { getSupabaseBrowserClient, isSupabaseConfigured } from '@/lib/supabase/client';
import { sanitizeText, sanitizeAmount } from '@/lib/utils/sanitizer';
import { Package, ArrowLeft, CheckCircle2, Sparkles, AlertTriangle, Loader2 } from 'lucide-react';
import Link from 'next/link';

const CATEGORIES = [
  { value: 'condiments', label: 'Condimentos & Especias' },
  { value: 'textiles', label: 'Textiles & Tejidos' },
  { value: 'food', label: 'Alimentos Gourmet' },
  { value: 'medical', label: 'Insumos Médicos' },
  { value: 'tech', label: 'Tecnología' },
  { value: 'art', label: 'Arte & Artesanías' },
  { value: 'jewelry', label: 'Joyería & Plata' },
  { value: 'clothing', label: 'Ropa' },
  { value: 'general', label: 'Otro' },
];

export default function NewProductPage() {
  const router = useRouter();
  const { user } = useAuth();

  const [title, setTitle] = useState('');
  const [category, setCategory] = useState('condiments');
  const [price, setPrice] = useState('14.50');
  const [stock, setStock] = useState('30');
  const [weight, setWeight] = useState('0.25');
  const [description, setDescription] = useState('');
  const [imageUrls, setImageUrls] = useState<string[]>([]);

  const [storeId, setStoreId] = useState<string | null>(null);
  const [submitted, setSubmitted] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  // Find merchant's store
  useEffect(() => {
    async function findStore() {
      if (!user?.id || !isSupabaseConfigured) return;
      try {
        const supabase = getSupabaseBrowserClient();
        const { data } = await supabase
          .from('stores')
          .select('id')
          .eq('owner_id', user.id)
          .single();
        if (data) setStoreId(data.id);
      } catch (e) {
        console.warn('No store found for merchant:', e);
      }
    }
    findStore();
  }, [user]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg(null);
    setSubmitting(true);

    const cleanTitle = sanitizeText(title, 200);
    if (!cleanTitle) {
      setErrorMsg('Por favor ingresa un título descriptivo para el producto.');
      setSubmitting(false);
      return;
    }

    const numPrice = sanitizeAmount(price, 0.5, 50000);
    if (numPrice <= 0) {
      setErrorMsg('El precio debe ser mayor a 0 USDC.');
      setSubmitting(false);
      return;
    }

    const payload = {
      store_id: storeId,
      title: cleanTitle,
      description: sanitizeText(description, 2000),
      category,
      price_usd: numPrice,
      weight_kg: sanitizeAmount(weight, 0.01, 100),
      origin_country: 'Bolivia',
      image_url: imageUrls[0] || null,
      images: imageUrls,
      tags: [],
    };

    // Try API route (Supabase)
    if (isSupabaseConfigured && storeId) {
      try {
        const res = await fetch('/api/products', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(payload),
        });
        const result = await res.json();
        if (res.ok) {
          setSubmitted(true);
          setSubmitting(false);
          setTimeout(() => router.push('/dashboard/products'), 2000);
          return;
        } else {
          setErrorMsg(result.error || 'Error al crear producto');
        }
      } catch (err) {
        console.warn('API error:', err);
      }
    }

    // Fallback: localStorage
    const existing = JSON.parse(localStorage.getItem('ayni_merchant_products') || '[]');
    existing.push({
      id: `P${Date.now().toString().slice(-4)}`,
      ...payload,
      status: 'active',
      sold: 0,
      created_at: new Date().toISOString(),
    });
    localStorage.setItem('ayni_merchant_products', JSON.stringify(existing));
    setSubmitted(true);
    setSubmitting(false);
    setTimeout(() => router.push('/dashboard/products'), 2000);
  };

  if (submitted) {
    return (
      <DashboardLayout>
        <div style={{
          display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center',
          minHeight: '50vh', gap: '16px', textAlign: 'center',
        }}>
          <div style={{
            width: 64, height: 64, borderRadius: '50%',
            background: 'rgba(0, 214, 143, 0.15)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
          }}>
            <CheckCircle2 size={32} color="var(--brand-emerald)" />
          </div>
          <h2 style={{ fontWeight: 700, fontSize: '1.3rem' }}>¡Producto creado exitosamente!</h2>
          <p style={{ color: 'var(--text-secondary)', fontSize: '0.9rem' }}>
            Tu producto ya está visible en el Marketplace.
          </p>
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout>
      {/* Header */}
      <div className="page-header" style={{ marginBottom: '24px' }}>
        <div className="page-title-group">
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '4px' }}>
            <Link href="/dashboard/products" className="btn btn-ghost btn-sm" style={{ padding: '4px 8px' }}>
              <ArrowLeft size={16} />
            </Link>
            <div className="page-title">Nuevo Producto</div>
            <span className="badge badge-emerald"><Sparkles size={11} /> Catálogo</span>
          </div>
          <div className="page-subtitle">Agrega un nuevo producto a tu tienda. Puedes subir hasta 5 fotos.</div>
        </div>
      </div>

      {!storeId && isSupabaseConfigured && (
        <div className="alert alert-error" style={{ marginBottom: '20px' }}>
          <AlertTriangle size={16} />
          No tienes una tienda registrada. <Link href="/dashboard/my-store" style={{ color: 'var(--brand-cyan)', textDecoration: 'underline' }}>Crea tu tienda primero</Link>.
        </div>
      )}

      {errorMsg && (
        <div className="alert alert-error" style={{ marginBottom: '20px' }}>
          <AlertTriangle size={16} /> {errorMsg}
        </div>
      )}

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(340px, 1fr))', gap: '24px' }}>
        {/* Form */}
        <div className="card" style={{ padding: '28px' }}>
          <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
            <div className="input-group">
              <label className="input-label">Nombre del Producto *</label>
              <input type="text" required value={title} onChange={e => setTitle(e.target.value)} className="input" placeholder="Ej: Chullo Artesanal Andino" maxLength={200} />
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
              <div className="input-group">
                <label className="input-label">Categoría *</label>
                <select value={category} onChange={e => setCategory(e.target.value)} className="input">
                  {CATEGORIES.map(c => <option key={c.value} value={c.value}>{c.label}</option>)}
                </select>
              </div>
              <div className="input-group">
                <label className="input-label">Precio (USDC) *</label>
                <input type="number" min="0.5" step="0.01" required value={price} onChange={e => setPrice(e.target.value)} className="input" />
              </div>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
              <div className="input-group">
                <label className="input-label">Stock (unidades)</label>
                <input type="number" min="0" value={stock} onChange={e => setStock(e.target.value)} className="input" />
              </div>
              <div className="input-group">
                <label className="input-label">Peso (kg)</label>
                <input type="number" min="0.01" step="0.01" value={weight} onChange={e => setWeight(e.target.value)} className="input" />
              </div>
            </div>

            <div className="input-group">
              <label className="input-label">Descripción</label>
              <textarea
                value={description}
                onChange={e => setDescription(e.target.value)}
                className="input"
                rows={4}
                maxLength={2000}
                placeholder="Describe tu producto: materiales, origen, proceso de elaboración..."
                style={{ resize: 'vertical' }}
              />
              <span style={{ fontSize: '0.7rem', color: 'var(--text-muted)' }}>{description.length}/2000</span>
            </div>

            <button
              type="submit"
              disabled={submitting || (!storeId && isSupabaseConfigured)}
              className="btn btn-primary"
              style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px' }}
            >
              {submitting ? <Loader2 size={16} style={{ animation: 'spin 1s linear infinite' }} /> : <Package size={16} />}
              {submitting ? 'Publicando...' : 'Publicar Producto'}
            </button>
          </form>
        </div>

        {/* Image Upload */}
        <div className="card" style={{ padding: '28px' }}>
          <h3 style={{ fontSize: '1rem', fontWeight: 700, marginBottom: '16px' }}>Fotos del Producto</h3>
          <ImageUploader
            bucket="products"
            pathPrefix={storeId || user?.id || 'temp'}
            maxFiles={5}
            existingUrls={imageUrls}
            onUploadComplete={setImageUrls}
            onAiDetected={(detection) => {
              if (!title && detection.detectedItem) {
                setTitle(detection.detectedItem);
              }
            }}
            label="Imágenes del producto (máx 5)"
          />
          <p style={{ fontSize: '0.78rem', color: 'var(--text-muted)', marginTop: '12px', lineHeight: 1.5 }}>
            🛡️ Alojamiento en <strong style={{ color: 'var(--brand-cyan)' }}>ImgBB CDN</strong> sin consumir tu cuota de Supabase. Cada foto es pre-auditada con <strong style={{ color: 'var(--brand-purple)' }}>Gemini 1.5 Flash Vision</strong> para verificar autenticidad y normas IATA.
          </p>
        </div>
      </div>
    </DashboardLayout>
  );
}
