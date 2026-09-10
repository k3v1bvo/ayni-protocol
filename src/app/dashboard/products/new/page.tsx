'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { sanitizeText, sanitizeAmount } from '@/lib/utils/sanitizer';
import { Package, ArrowLeft, CheckCircle2, Sparkles, Plus, Store, Tag } from 'lucide-react';
import Link from 'next/link';

export default function NewProductPage() {
  const router = useRouter();
  const [title, setTitle] = useState('');
  const [category, setCategory] = useState('Condimentos & Especias');
  const [price, setPrice] = useState('14.50');
  const [stock, setStock] = useState('30');
  const [weight, setWeight] = useState('0.25');
  const [description, setDescription] = useState('');
  const [submitted, setSubmitted] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  const numPrice = sanitizeAmount(price, 0.5, 5000);
  const numStock = Math.max(1, parseInt(stock, 10) || 1);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg(null);

    const cleanTitle = sanitizeText(title, 140);
    if (!cleanTitle) {
      setErrorMsg('Por favor ingresa un título descriptivo para el producto.');
      return;
    }

    if (numPrice <= 0) {
      setErrorMsg('El precio debe ser mayor a 0 USDC.');
      return;
    }

    const newProd = {
      id: `P${Date.now().toString().slice(-3)}`,
      title: cleanTitle,
      category,
      price: numPrice,
      stock: numStock,
      status: 'active',
      sold: 0,
      description: sanitizeText(description, 500),
    };

    if (typeof window !== 'undefined') {
      try {
        const saved = localStorage.getItem('ayni_merchant_products');
        const existing = saved ? JSON.parse(saved) : [];
        const updated = [newProd, ...(Array.isArray(existing) ? existing : [])];
        localStorage.setItem('ayni_merchant_products', JSON.stringify(updated));
      } catch (err) {
        console.error('Error saving merchant product:', err);
      }
    }

    setSubmitted(true);
    setTimeout(() => {
      router.push('/dashboard/products');
    }, 1000);
  };

  return (
    <DashboardLayout>
      <div style={{ maxWidth: '820px', margin: '0 auto' }}>
        <Link
          href="/dashboard/products"
          style={{ display: 'inline-flex', alignItems: 'center', gap: '6px', color: 'var(--text-muted)', fontSize: '0.85rem', textDecoration: 'none', marginBottom: '16px' }}
        >
          <ArrowLeft size={16} /> Volver a Productos
        </Link>

        <div className="page-header" style={{ marginBottom: '24px' }}>
          <div className="page-title-group">
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '4px' }}>
              <div className="page-title">Publicar Nuevo Producto</div>
              <span className="badge badge-emerald">
                <Sparkles size={11} /> Catálogo de Tienda
              </span>
            </div>
            <div className="page-subtitle">
              Agrega condimentos de origen, artesanías o productos listos para que viajeros los compren y lleven.
            </div>
          </div>
        </div>

        {errorMsg && (
          <div className="alert alert-error" style={{ marginBottom: '20px' }}>
            {errorMsg}
          </div>
        )}

        {submitted && (
          <div className="alert alert-success" style={{ marginBottom: '24px' }}>
            <CheckCircle2 size={16} /> ¡Producto publicado en el Marketplace AYNI! Redirigiendo a tu catálogo...
          </div>
        )}

        <div style={{ display: 'grid', gridTemplateColumns: '1.2fr 0.8fr', gap: '24px', alignItems: 'start' }}>
          {/* Form */}
          <div className="card" style={{ padding: '28px' }}>
            <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '18px' }}>
              <div className="input-group">
                <label className="input-label">Título del Producto *</label>
                <input
                  type="text"
                  required
                  placeholder="Ej: Ají Amarillo en Vainas Deshidratadas (250g)"
                  value={title}
                  onChange={e => setTitle(e.target.value)}
                  className="input"
                />
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '14px' }}>
                <div className="input-group">
                  <label className="input-label">Categoría *</label>
                  <select
                    value={category}
                    onChange={e => setCategory(e.target.value)}
                    className="input"
                  >
                    <option value="Condimentos & Especias">🌶️ Condimentos & Especias</option>
                    <option value="Textiles & Tejidos">🧶 Textiles & Tejidos</option>
                    <option value="Insumos Médicos">💊 Insumos Médicos</option>
                    <option value="Alimentos Gourmet">🍫 Alimentos Gourmet</option>
                    <option value="Arte & Joyería">🎨 Arte & Joyería</option>
                  </select>
                </div>

                <div className="input-group">
                  <label className="input-label">Precio Unitario (USDC) *</label>
                  <input
                    type="number"
                    step="0.5"
                    min="1"
                    required
                    value={price}
                    onChange={e => setPrice(e.target.value)}
                    className="input"
                  />
                </div>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '14px' }}>
                <div className="input-group">
                  <label className="input-label">Stock Inicial *</label>
                  <input
                    type="number"
                    min="1"
                    required
                    value={stock}
                    onChange={e => setStock(e.target.value)}
                    className="input"
                  />
                </div>

                <div className="input-group">
                  <label className="input-label">Peso Estimado (kg) *</label>
                  <input
                    type="number"
                    step="0.05"
                    min="0.01"
                    required
                    value={weight}
                    onChange={e => setWeight(e.target.value)}
                    className="input"
                  />
                </div>
              </div>

              <div className="input-group">
                <label className="input-label">Descripción & Origen del Producto</label>
                <textarea
                  rows={3}
                  placeholder="Detalles sobre el empaque al vacío, procedencia y recomendaciones de transporte..."
                  value={description}
                  onChange={e => setDescription(e.target.value)}
                  className="input"
                  style={{ resize: 'vertical' }}
                />
              </div>

              <button
                type="submit"
                disabled={submitted}
                className="btn btn-primary btn-lg"
                style={{ marginTop: '8px', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px' }}
              >
                <Plus size={18} /> Publicar en Marketplace
              </button>
            </form>
          </div>

          {/* Live Preview Card */}
          <div className="card sc-card-depth" style={{ padding: '24px', background: 'rgba(10, 16, 32, 0.85)', border: '1px solid rgba(0, 207, 255, 0.25)' }}>
            <div style={{ fontSize: '0.75rem', color: 'var(--brand-cyan)', textTransform: 'uppercase', fontWeight: 700, letterSpacing: '0.08em', marginBottom: '12px' }}>
              Vista Previa del Card
            </div>

            <div style={{
              borderRadius: '14px',
              padding: '16px',
              background: 'rgba(255,255,255,0.02)',
              border: '1px solid var(--border-default)',
            }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
                <span className="badge badge-gold" style={{ fontSize: '0.72rem' }}>
                  {category}
                </span>
                <span style={{ fontSize: '0.75rem', color: 'var(--brand-emerald)', fontWeight: 600 }}>
                  ● En Stock ({numStock})
                </span>
              </div>

              <h4 style={{ fontSize: '1rem', fontWeight: 700, color: 'var(--text-primary)', marginBottom: '8px' }}>
                {title || 'Título del Producto'}
              </h4>

              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline', marginTop: '14px' }}>
                <div>
                  <div style={{ fontSize: '0.7rem', color: 'var(--text-muted)' }}>Precio</div>
                  <div style={{ fontSize: '1.25rem', fontWeight: 800, color: 'var(--brand-cyan)', fontFamily: 'var(--font-display)' }}>
                    ${numPrice.toFixed(2)} USDC
                  </div>
                </div>
                <div style={{ fontSize: '0.78rem', color: 'var(--text-muted)' }}>
                  ⚖ {weight} kg
                </div>
              </div>
            </div>

            <div style={{ marginTop: '16px', fontSize: '0.78rem', color: 'var(--text-secondary)', lineHeight: 1.5 }}>
              🛡️ El producto estará inmediatamente disponible para compras y encargos de viajeros con liquidación automática mediante Smart Contract Escrow.
            </div>
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
}
