'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { sanitizeText, sanitizeAmount } from '@/lib/utils/sanitizer';
import { ShoppingBag, ArrowLeft, CheckCircle2, ShieldCheck, Sparkles } from 'lucide-react';
import Link from 'next/link';

export default function NewOrderPage() {
  const router = useRouter();
  const [description, setDescription] = useState('');
  const [category, setCategory] = useState('condiments');
  const [productCost, setProductCost] = useState(35);
  const [storeLocation, setStoreLocation] = useState('Madrid, España');
  const [deliveryCity, setDeliveryCity] = useState('La Paz, Bolivia');
  const [submitted, setSubmitted] = useState(false);

  // Cálculos transparentes de Escrow según reglas del protocolo AYNI
  const travelerFee = Math.min(productCost * 0.10, 50); // 10% con cap de $50 USD
  const platformFee = productCost * 0.03;
  const guaranteeFund = productCost * 0.02;
  const totalEscrow = productCost + travelerFee + platformFee + guaranteeFund;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    const cleanDesc = sanitizeText(description, 160);
    const cleanStore = sanitizeText(storeLocation, 80);
    const cleanCity = sanitizeText(deliveryCity, 80);
    const numCost = sanitizeAmount(productCost, 5, 5000);

    const otpCode = Math.random().toString(36).substring(2, 8).toUpperCase();
    const newOrder = {
      id: `ORD-2609-${Date.now().toString().slice(-3)}`,
      type: category,
      status: 'funded',
      description: `${cleanDesc || 'Encargo personalizado'} — ${cleanStore || 'Madrid'}`,
      clientName: 'Mi Cuenta (Tú)',
      travelerName: 'Esperando asignación',
      route: { from: cleanStore || 'Madrid 🇪🇸', to: cleanCity || 'La Paz 🇧🇴' },
      productCost: numCost,
      travelerFee: Number(travelerFee.toFixed(2)),
      systemFee: Number((platformFee + guaranteeFund).toFixed(2)),
      total: Number(totalEscrow.toFixed(2)),
      otpCode,
      otpHash: 'hash_' + otpCode,
      aiScore: 0.98,
      ocrAmount: numCost,
      ocrStore: cleanStore,
      date: new Date().toISOString(),
    };

    if (typeof window !== 'undefined') {
      try {
        const saved = localStorage.getItem('ayni_orders');
        const existing = saved ? JSON.parse(saved) : [];
        const updated = [newOrder, ...(Array.isArray(existing) ? existing : [])];
        localStorage.setItem('ayni_orders', JSON.stringify(updated));
      } catch (err) {
        console.error('Error saving order:', err);
      }
    }

    setSubmitted(true);
    setTimeout(() => {
      router.push('/dashboard/orders');
    }, 1000);
  };

  return (
    <DashboardLayout>
      <div style={{ maxWidth: '680px', margin: '0 auto' }}>
        <Link
          href="/dashboard/orders"
          style={{ display: 'inline-flex', alignItems: 'center', gap: '6px', color: 'var(--text-muted)', fontSize: '0.85rem', textDecoration: 'none', marginBottom: '16px' }}
        >
          <ArrowLeft size={16} /> Volver a Mis Pedidos
        </Link>

        <div className="page-header" style={{ marginBottom: '24px' }}>
          <div className="page-title-group">
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '4px' }}>
              <div className="page-title">Nuevo Encargo / Compra a Pie</div>
              <span className="badge badge-gold">
                <ShieldCheck size={11} /> Protección Smart Contract Escrow
              </span>
            </div>
            <div className="page-subtitle">
              Pide a un viajero que compre o transporte condimentos, insumos o artesanías hasta tu ciudad.
            </div>
          </div>
        </div>

        {submitted && (
          <div className="alert alert-success" style={{ marginBottom: '24px' }}>
            <CheckCircle2 size={16} /> ¡Encargo creado en Escrow! Los fondos quedarán custodiados hasta que valides con OTP.
          </div>
        )}

        <div className="card" style={{ padding: '32px' }}>
          <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '18px' }}>
            <div className="input-group">
              <label className="input-label">Descripción del Producto / Encargo *</label>
              <input
                type="text"
                required
                placeholder="Ej: Kit de condimentos andinos deshidratados (Ají amarillo + Llajwa)"
                value={description}
                onChange={e => setDescription(e.target.value)}
                className="input"
              />
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
              <div className="input-group">
                <label className="input-label">Categoría</label>
                <select
                  value={category}
                  onChange={e => setCategory(e.target.value)}
                  className="input"
                >
                  <option value="condiments">🌶️ Condimentos & Sabores Patrios</option>
                  <option value="medical">💊 Insumos Médicos / Farmacia</option>
                  <option value="textiles">🧶 Textiles & Artesanías</option>
                  <option value="tech">📱 Tecnología & Lentes</option>
                  <option value="other">📦 Otro Encargo</option>
                </select>
              </div>

              <div className="input-group">
                <label className="input-label">Costo Estimado del Producto (USDC) *</label>
                <input
                  type="number"
                  min={5}
                  max={2000}
                  required
                  value={productCost}
                  onChange={e => setProductCost(Number(e.target.value))}
                  className="input"
                />
              </div>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
              <div className="input-group">
                <label className="input-label">Ciudad / Tienda de Compra *</label>
                <input
                  type="text"
                  required
                  placeholder="Ej: Madrid, España"
                  value={storeLocation}
                  onChange={e => setStoreLocation(e.target.value)}
                  className="input"
                />
              </div>

              <div className="input-group">
                <label className="input-label">Ciudad de Entrega / Destino *</label>
                <input
                  type="text"
                  required
                  placeholder="Ej: La Paz, Bolivia"
                  value={deliveryCity}
                  onChange={e => setDeliveryCity(e.target.value)}
                  className="input"
                />
              </div>
            </div>

            {/* Escrow Fee Breakdown Box */}
            <div style={{
              padding: '18px',
              background: 'linear-gradient(135deg, rgba(245,166,35,0.06) 0%, rgba(0,207,255,0.06) 100%)',
              border: '1px solid rgba(245,166,35,0.25)',
              borderRadius: '12px',
            }}>
              <div style={{ fontWeight: 700, fontSize: '0.9rem', marginBottom: '10px', display: 'flex', alignItems: 'center', gap: '8px' }}>
                <ShieldCheck size={16} color="var(--brand-gold)" /> Desglose Financiero en Escrow
              </div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '6px', fontSize: '0.82rem' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                  <span style={{ color: 'var(--text-muted)' }}>Costo del producto:</span>
                  <span style={{ fontWeight: 600 }}>${productCost.toFixed(2)} USDC</span>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                  <span style={{ color: 'var(--text-muted)' }}>Honorario del viajero (monetización equipaje):</span>
                  <span style={{ fontWeight: 600, color: 'var(--brand-cyan)' }}>+${travelerFee.toFixed(2)} USDC</span>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                  <span style={{ color: 'var(--text-muted)' }}>Comisión del protocolo AYNI (3%):</span>
                  <span style={{ fontWeight: 600 }}>+${platformFee.toFixed(2)} USDC</span>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                  <span style={{ color: 'var(--text-muted)' }}>Fondo de garantía anti-pérdida (2%):</span>
                  <span style={{ fontWeight: 600 }}>+${guaranteeFund.toFixed(2)} USDC</span>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between', borderTop: '1px solid rgba(255,255,255,0.1)', paddingTop: '8px', marginTop: '4px', fontSize: '0.95rem' }}>
                  <span style={{ fontWeight: 700 }}>Total a Bloquear en Smart Contract:</span>
                  <span style={{ fontWeight: 800, color: 'var(--brand-gold)', fontFamily: 'var(--font-display)' }}>
                    ${totalEscrow.toFixed(2)} USDC
                  </span>
                </div>
              </div>
            </div>

            <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '12px', marginTop: '6px' }}>
              <Link href="/dashboard/orders" className="btn btn-ghost">
                Cancelar
              </Link>
              <button type="submit" className="btn btn-primary">
                <ShoppingBag size={16} /> Crear Encargo con Escrow
              </button>
            </div>
          </form>
        </div>
      </div>
    </DashboardLayout>
  );
}
