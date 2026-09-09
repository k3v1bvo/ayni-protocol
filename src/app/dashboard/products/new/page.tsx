'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { Package, ArrowLeft, CheckCircle2, Sparkles, Plus } from 'lucide-react';
import Link from 'next/link';

export default function NewProductPage() {
  const router = useRouter();
  const [title, setTitle] = useState('');
  const [category, setCategory] = useState('condiments');
  const [price, setPrice] = useState(14.50);
  const [stock, setStock] = useState(30);
  const [weight, setWeight] = useState(0.25);
  const [description, setDescription] = useState('');
  const [submitted, setSubmitted] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitted(true);
    setTimeout(() => {
      router.push('/dashboard/products');
    }, 1200);
  };

  return (
    <DashboardLayout>
      <div style={{ maxWidth: '680px', margin: '0 auto' }}>
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

        {submitted && (
          <div className="alert alert-success" style={{ marginBottom: '24px' }}>
            <CheckCircle2 size={16} /> ¡Producto publicado en el Marketplace AYNI! Redirigiendo...
          </div>
        )}

        <div className="card" style={{ padding: '32px' }}>
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

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
              <div className="input-group">
                <label className="input-label">Categoría *</label>
                <select
                  value={category}
                  onChange={e => setCategory(e.target.value)}
                  className="input"
                >
                  <option value="condiments">🌶️ Condimentos & Sabores Patrios</option>
                  <option value="textiles">🧶 Textiles & Artesanías</option>
                  <option value="medical">💊 Insumos Médicos</option>
                  <option value="food">🍫 Alimentos Gourmet</option>
                  <option value="art">🎨 Arte & Joyería</option>
                </select>
              </div>

              <div className="input-group">
                <label className="input-label">Precio Unitario (USDC) *</label>
                <input
                  type="number"
                  step="0.5"
                  min={1}
                  required
                  value={price}
                  onChange={e => setPrice(Number(e.target.value))}
                  className="input"
                />
              </div>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
              <div className="input-group">
                <label className="input-label">Stock Inicial *</label>
                <input
                  type="number"
                  min={1}
                  required
                  value={stock}
                  onChange={e => setStock(Number(e.target.value))}
                  className="input"
                />
              </div>

              <div className="input-group">
                <label className="input-label">Peso Estimado (kg) *</label>
                <input
                  type="number"
                  step="0.05"
                  min={0.01}
                  required
                  value={weight}
                  onChange={e => setWeight(Number(e.target.value))}
                  className="input"
                />
              </div>
            </div>

            <div className="input-group">
              <label className="input-label">Descripción detallada y empaque *</label>
              <textarea
                rows={3}
                required
                placeholder="Describe los ingredientes, el origen andino o regional, y el tipo de envasado al vacío..."
                value={description}
                onChange={e => setDescription(e.target.value)}
                className="input"
                style={{ resize: 'vertical' }}
              />
            </div>

            <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '12px', marginTop: '6px' }}>
              <Link href="/dashboard/products" className="btn btn-ghost">
                Cancelar
              </Link>
              <button type="submit" className="btn btn-primary">
                <Plus size={16} /> Publicar en Marketplace
              </button>
            </div>
          </form>
        </div>
      </div>
    </DashboardLayout>
  );
}
