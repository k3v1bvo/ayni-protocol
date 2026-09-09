'use client';

import React, { useState } from 'react';
import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { 
  Store, Package, Star, TrendingUp, Plus, Edit, Eye, 
  MapPin, ShoppingBag, CheckCircle2, Camera, Globe
} from 'lucide-react';

const MY_PRODUCTS = [
  {
    id: 'MP001', title: 'Chullo Artesanal Lana de Alpaca', price: 38.00, stock: 12,
    category: 'textiles', orders: 24, rating: 4.92, status: 'active',
    image: 'https://images.unsplash.com/photo-1579541814924-49fef17c5be5?w=200&h=150&fit=crop&q=80',
  },
  {
    id: 'MP002', title: 'Manta Aguayo Jalq\'a Original', price: 85.00, stock: 5,
    category: 'textiles', orders: 11, rating: 4.88, status: 'active',
    image: 'https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=200&h=150&fit=crop&q=80',
  },
  {
    id: 'MP003', title: 'Tableta Chocolate Criollo 72%', price: 12.50, stock: 40,
    category: 'food', orders: 67, rating: 4.97, status: 'active',
    image: 'https://images.unsplash.com/photo-1549007994-cb92caebd54b?w=200&h=150&fit=crop&q=80',
  },
  {
    id: 'MP004', title: 'Anillo Plata 950 + Turquesa', price: 45.00, stock: 0,
    category: 'jewelry', orders: 8, rating: 4.75, status: 'out_of_stock',
    image: 'https://images.unsplash.com/photo-1515562141207-7a88fb7ce338?w=200&h=150&fit=crop&q=80',
  },
];

const RECENT_STORE_ORDERS = [
  { id: 'SO-001', product: 'Chullo Artesanal', buyer: 'Camila Torres', from: 'Madrid 🇪🇸', total: 45.8, status: 'shipped', date: 'Sep 08' },
  { id: 'SO-002', product: 'Manta Aguayo Jalq\'a', buyer: 'Pierre Moreau', from: 'Paris 🇫🇷', total: 94.5, status: 'funded', date: 'Sep 07' },
  { id: 'SO-003', product: 'Tableta Chocolate x3', buyer: 'Ana García', from: 'Madrid 🇪🇸', total: 42.6, status: 'completed', date: 'Sep 06' },
];

export default function MyStorePage() {
  const [activeTab, setActiveTab] = useState<'overview' | 'products' | 'orders'>('overview');

  return (
    <DashboardLayout>
      {/* Store Header Banner */}
      <div style={{
        background: 'linear-gradient(135deg, rgba(0,214,143,0.1) 0%, rgba(0,207,255,0.05) 100%)',
        border: '1px solid rgba(0,214,143,0.2)',
        borderRadius: 20,
        padding: '28px 32px',
        marginBottom: '28px',
        display: 'flex',
        gap: '24px',
        alignItems: 'center',
        flexWrap: 'wrap',
      }}>
        {/* Store Avatar */}
        <div style={{
          width: 80, height: 80, borderRadius: '50%',
          background: 'linear-gradient(135deg, rgba(0,214,143,0.2), rgba(0,207,255,0.2))',
          border: '2px solid rgba(0,214,143,0.4)',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          fontSize: '2.5rem', flexShrink: 0,
        }}>
          🏔️
        </div>

        <div style={{ flex: 1 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '6px', flexWrap: 'wrap' }}>
            <h1 style={{ fontFamily: 'var(--font-display)', fontSize: '1.5rem', fontWeight: 700 }}>
              Tejidos & Artesanías Illimani
            </h1>
            <span className="badge badge-emerald">
              <CheckCircle2 size={11} /> Tienda Verificada
            </span>
          </div>
          <div style={{ display: 'flex', gap: '16px', flexWrap: 'wrap', fontSize: '0.85rem', color: 'var(--text-secondary)' }}>
            <span style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
              <MapPin size={14} /> Cochabamba, Bolivia
            </span>
            <span style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
              <Star size={14} color="var(--brand-gold)" /> 4.88 (110 valoraciones)
            </span>
            <span style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
              <Globe size={14} /> Ventas en 8 países
            </span>
          </div>
          <p style={{ marginTop: '10px', fontSize: '0.875rem', color: 'var(--text-secondary)', maxWidth: '600px' }}>
            Artesanías andinas 100% auténticas. Tejidos a mano con lana de alpaca y técnicas ancestrales jalq'a desde Cochabamba. Cada pieza tiene historia.
          </p>
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', flexShrink: 0 }}>
          <button className="btn btn-gold">
            <Plus size={16} /> Agregar Producto
          </button>
          <button className="btn btn-ghost btn-sm">
            <Edit size={14} /> Editar Tienda
          </button>
        </div>
      </div>

      {/* Stats */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: '14px', marginBottom: '28px' }}>
        {[
          { label: 'Ventas totales', value: '$4,230', color: 'var(--brand-emerald)', iconBg: 'rgba(0,214,143,0.15)', glow: 'rgba(0,214,143,0.08)', icon: TrendingUp },
          { label: 'Productos activos', value: '24', color: 'var(--brand-cyan)', iconBg: 'rgba(0,207,255,0.15)', glow: 'rgba(0,207,255,0.08)', icon: Package },
          { label: 'Pedidos este mes', value: '38', color: 'var(--brand-gold)', iconBg: 'rgba(245,166,35,0.15)', glow: 'rgba(245,166,35,0.08)', icon: ShoppingBag },
          { label: 'Clientes únicos', value: '112', color: 'var(--brand-purple)', iconBg: 'rgba(155,114,255,0.15)', glow: 'rgba(155,114,255,0.08)', icon: Globe },
        ].map((s, i) => (
          <div key={i} className="stat-card" style={{ '--stat-glow': s.glow } as React.CSSProperties}>
            <div className="stat-icon" style={{ background: s.iconBg }}>
              <s.icon size={20} color={s.color} />
            </div>
            <div>
              <div className="stat-value" style={{ color: s.color }}>{s.value}</div>
              <div className="stat-label">{s.label}</div>
            </div>
          </div>
        ))}
      </div>

      {/* Tabs */}
      <div className="tab-bar" style={{ marginBottom: '24px', maxWidth: '400px' }}>
        {[
          { id: 'overview', label: 'Resumen' },
          { id: 'products', label: 'Mis Productos' },
          { id: 'orders', label: 'Pedidos Recibidos' },
        ].map(t => (
          <button key={t.id} type="button" className={`tab-item ${activeTab === t.id ? 'active' : ''}`} onClick={() => setActiveTab(t.id as typeof activeTab)}>
            {t.label}
          </button>
        ))}
      </div>

      {/* Tab Content */}
      {activeTab === 'products' && (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(260px, 1fr))', gap: '16px' }}>
          {MY_PRODUCTS.map(p => (
            <div key={p.id} className="card" style={{ overflow: 'hidden' }}>
              <div style={{ position: 'relative' }}>
                <img src={p.image} alt={p.title} style={{ width: '100%', height: 160, objectFit: 'cover', display: 'block' }} />
                <div style={{ position: 'absolute', top: 8, right: 8, display: 'flex', gap: '5px' }}>
                  {p.status === 'out_of_stock' ? (
                    <span className="badge badge-red" style={{ fontSize: '0.65rem' }}>Sin stock</span>
                  ) : (
                    <span className="badge badge-emerald" style={{ fontSize: '0.65rem' }}>Activo</span>
                  )}
                </div>
              </div>
              <div style={{ padding: '16px' }}>
                <div style={{ fontWeight: 600, marginBottom: '8px', fontSize: '0.9rem' }}>{p.title}</div>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '12px' }}>
                  <span style={{ fontFamily: 'var(--font-display)', fontWeight: 700, color: 'var(--brand-cyan)', fontSize: '1.1rem' }}>
                    ${p.price.toFixed(2)} <span style={{ fontSize: '0.7rem', color: 'var(--text-muted)', fontWeight: 400 }}>USDC</span>
                  </span>
                  <span style={{ fontSize: '0.75rem', color: 'var(--brand-gold)' }}>★ {p.rating}</span>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.78rem', color: 'var(--text-muted)', marginBottom: '12px' }}>
                  <span>📦 {p.stock} en stock</span>
                  <span>🛍 {p.orders} pedidos</span>
                </div>
                <div style={{ display: 'flex', gap: '8px' }}>
                  <button className="btn btn-ghost btn-sm" style={{ flex: 1 }}>
                    <Edit size={13} /> Editar
                  </button>
                  <button className="btn btn-primary btn-sm" style={{ flex: 1 }}>
                    <Eye size={13} /> Ver
                  </button>
                </div>
              </div>
            </div>
          ))}

          {/* Add Product Card */}
          <div className="card" style={{
            display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center',
            padding: '40px', cursor: 'pointer', border: '2px dashed var(--border-default)', minHeight: 280,
            gap: '12px', color: 'var(--text-muted)',
          }}>
            <div style={{ width: 52, height: 52, borderRadius: 14, background: 'rgba(255,255,255,0.04)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <Plus size={24} />
            </div>
            <div style={{ textAlign: 'center' }}>
              <div style={{ fontWeight: 600, color: 'var(--text-secondary)', marginBottom: '4px' }}>Nuevo Producto</div>
              <div style={{ fontSize: '0.8rem' }}>Haz clic para agregar</div>
            </div>
          </div>
        </div>
      )}

      {activeTab === 'orders' && (
        <div className="card">
          <div style={{ padding: '16px 22px', borderBottom: '1px solid var(--border-subtle)', fontWeight: 700 }}>
            Pedidos de Clientes (a llevar por viajeros)
          </div>
          <table className="data-table">
            <thead>
              <tr>
                <th>Pedido</th>
                <th>Producto</th>
                <th>Origen</th>
                <th>Estado</th>
                <th style={{ textAlign: 'right' }}>Total</th>
              </tr>
            </thead>
            <tbody>
              {RECENT_STORE_ORDERS.map(o => {
                const st: Record<string, string> = { shipped: 'badge-purple', funded: 'badge-gold', completed: 'badge-emerald' };
                const sl: Record<string, string> = { shipped: 'En tránsito', funded: 'En Escrow', completed: 'Entregado' };
                return (
                  <tr key={o.id}>
                    <td><span style={{ fontFamily: 'var(--font-display)', fontSize: '0.8rem', color: 'var(--text-muted)' }}>#{o.id}</span></td>
                    <td style={{ fontWeight: 500, color: 'var(--text-primary)', fontSize: '0.875rem' }}>{o.product}</td>
                    <td><span style={{ fontSize: '0.82rem' }}>{o.from}</span></td>
                    <td><span className={`badge ${st[o.status]}`}>{sl[o.status]}</span></td>
                    <td style={{ textAlign: 'right', fontWeight: 700, color: 'var(--brand-cyan)', fontFamily: 'var(--font-display)' }}>
                      ${o.total}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}

      {activeTab === 'overview' && (
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px' }}>
          <div className="card" style={{ padding: '24px' }}>
            <div style={{ fontWeight: 700, marginBottom: '16px' }}>Productos más vendidos</div>
            {MY_PRODUCTS.filter(p => p.status === 'active').map((p, i) => (
              <div key={p.id} style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '12px' }}>
                <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)', width: 20 }}>#{i + 1}</span>
                <img src={p.image} alt="" style={{ width: 36, height: 36, borderRadius: 8, objectFit: 'cover', flexShrink: 0 }} />
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ fontSize: '0.85rem', fontWeight: 600, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{p.title}</div>
                  <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)' }}>{p.orders} pedidos · ★ {p.rating}</div>
                </div>
                <div style={{ fontWeight: 700, color: 'var(--brand-cyan)', fontSize: '0.9rem', flexShrink: 0 }}>${p.price}</div>
              </div>
            ))}
          </div>

          <div className="card" style={{ padding: '24px' }}>
            <div style={{ fontWeight: 700, marginBottom: '16px' }}>Últimos pedidos</div>
            {RECENT_STORE_ORDERS.map(o => {
              const st: Record<string, string> = { shipped: 'badge-purple', funded: 'badge-gold', completed: 'badge-emerald' };
              return (
                <div key={o.id} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '8px 0', borderBottom: '1px solid var(--border-subtle)' }}>
                  <div>
                    <div style={{ fontSize: '0.85rem', fontWeight: 500 }}>{o.product}</div>
                    <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)' }}>{o.buyer} · {o.date}</div>
                  </div>
                  <div style={{ textAlign: 'right' }}>
                    <div style={{ fontWeight: 700, color: 'var(--brand-cyan)', fontSize: '0.9rem' }}>${o.total}</div>
                    <span className={`badge ${st[o.status]}`} style={{ fontSize: '0.62rem' }}>
                      {{funded:'En Escrow', shipped:'Tránsito', completed:'Entregado'}[o.status]}
                    </span>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}
    </DashboardLayout>
  );
}
