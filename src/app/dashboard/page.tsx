'use client';

import React from 'react';
import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { useAuth } from '@/context/AuthContext';
import {
  ShoppingBag, Plane, Package, TrendingUp, ShieldCheck, Sparkles,
  ArrowRight, Clock, CheckCircle2, ChevronRight, Star
} from 'lucide-react';
import Link from 'next/link';

const RECENT_ORDERS = [
  { id: 'ORD-001', description: 'Kit implantes dentales titanio', from: 'Madrid', status: 'verified_ai', amount: 374, type: 'medical' },
  { id: 'ORD-002', description: 'Lente 50mm f/1.8 FNAC Callao', from: 'Miami', status: 'shipped', amount: 197.4, type: 'store_run' },
  { id: 'ORD-003', description: 'Chullo artesanal Illimani S/M', from: 'Buenos Aires', status: 'completed', amount: 48.8, type: 'store' },
];

const ACTIVE_TRIPS = [
  {
    traveler: 'Alejandro Mamani',
    from: 'Madrid', fromFlag: '🇪🇸',
    to: 'La Paz', toFlag: '🇧🇴',
    date: 'Sep 12, 2026',
    kg: 14.5,
    score: 4.95,
  },
  {
    traveler: 'Carlos Mendoza',
    from: 'Miami', fromFlag: '🇺🇸',
    to: 'Santa Cruz', toFlag: '🇧🇴',
    date: 'Sep 15, 2026',
    kg: 8.0,
    score: 4.88,
  },
];

function StatusBadge({ status }: { status: string }) {
  const map: Record<string, { label: string; cls: string }> = {
    verified_ai: { label: 'IA Verificado', cls: 'badge-cyan' },
    shipped: { label: 'En tránsito', cls: 'badge-purple' },
    completed: { label: 'Completado', cls: 'badge-emerald' },
    funded: { label: 'En Escrow', cls: 'badge-gold' },
  };
  const s = map[status] || { label: status, cls: 'badge-gold' };
  return <span className={`badge ${s.cls}`}>{s.label}</span>;
}

export default function DashboardPage() {
  const { user, role } = useAuth();

  const getGreeting = () => {
    const hour = new Date().getHours();
    if (hour < 12) return 'Buenos días';
    if (hour < 19) return 'Buenas tardes';
    return 'Buenas noches';
  };

  const clientStats = [
    { label: 'Pedidos activos', value: '2', icon: Package, color: 'var(--brand-cyan)', glow: 'rgba(0,207,255,0.08)', iconBg: 'rgba(0,207,255,0.15)' },
    { label: 'USDC en Escrow', value: '$571.40', icon: ShieldCheck, color: 'var(--brand-gold)', glow: 'rgba(245,166,35,0.08)', iconBg: 'rgba(245,166,35,0.15)' },
    { label: 'Pedidos completados', value: '7', icon: CheckCircle2, color: 'var(--brand-emerald)', glow: 'rgba(0,214,143,0.08)', iconBg: 'rgba(0,214,143,0.15)' },
    { label: 'Ahorro total', value: '$1,240', icon: TrendingUp, color: 'var(--brand-purple)', glow: 'rgba(155,114,255,0.08)', iconBg: 'rgba(155,114,255,0.15)' },
  ];

  const travelerStats = [
    { label: 'Viajes publicados', value: '3', icon: Plane, color: 'var(--brand-cyan)', glow: 'rgba(0,207,255,0.08)', iconBg: 'rgba(0,207,255,0.15)' },
    { label: 'Ganancias este mes', value: '$342', icon: TrendingUp, color: 'var(--brand-gold)', glow: 'rgba(245,166,35,0.08)', iconBg: 'rgba(245,166,35,0.15)' },
    { label: 'Encargos en curso', value: '5', icon: Package, color: 'var(--brand-emerald)', glow: 'rgba(0,214,143,0.08)', iconBg: 'rgba(0,214,143,0.15)' },
    { label: 'Reputación', value: '4.95 ★', icon: Star, color: 'var(--brand-gold)', glow: 'rgba(245,166,35,0.08)', iconBg: 'rgba(245,166,35,0.15)' },
  ];

  const merchantStats = [
    { label: 'Productos publicados', value: '24', icon: ShoppingBag, color: 'var(--brand-emerald)', glow: 'rgba(0,214,143,0.08)', iconBg: 'rgba(0,214,143,0.15)' },
    { label: 'Ventas este mes', value: '$1,840', icon: TrendingUp, color: 'var(--brand-cyan)', glow: 'rgba(0,207,255,0.08)', iconBg: 'rgba(0,207,255,0.15)' },
    { label: 'Pedidos pendientes', value: '6', icon: Clock, color: 'var(--brand-gold)', glow: 'rgba(245,166,35,0.08)', iconBg: 'rgba(245,166,35,0.15)' },
    { label: 'Valoración tienda', value: '4.88 ★', icon: Star, color: 'var(--brand-gold)', glow: 'rgba(245,166,35,0.08)', iconBg: 'rgba(245,166,35,0.15)' },
  ];

  const stats = role === 'traveler' ? travelerStats : role === 'merchant' ? merchantStats : clientStats;

  return (
    <DashboardLayout>
      {/* Welcome Header */}
      <div style={{ marginBottom: '32px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '6px' }}>
          <h1 style={{ fontFamily: 'var(--font-display)', fontSize: '1.75rem', fontWeight: 700, letterSpacing: '-0.02em' }}>
            {getGreeting()}, {user?.full_name?.split(' ')[0] || 'Usuario'} 👋
          </h1>
          {role === 'traveler' && <span className="badge badge-cyan">Viajero Verificado</span>}
          {role === 'merchant' && <span className="badge badge-emerald">Comerciante Local</span>}
          {role === 'client' && <span className="badge badge-gold">Cliente</span>}
        </div>
        <p style={{ color: 'var(--text-secondary)' }}>
          {role === 'traveler' && 'Tus viajes activos y encargos pendientes de entrega están aquí.'}
          {role === 'merchant' && 'Gestiona tu tienda, productos y pedidos recibidos de viajeros.'}
          {role === 'client' && 'Tus pedidos activos, rutas disponibles y novedades del marketplace.'}
        </p>
      </div>

      {/* Stat Cards */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(210px, 1fr))', gap: '16px', marginBottom: '32px' }}>
        {stats.map((s, i) => (
          <div
            key={i}
            className="stat-card"
            style={{ '--stat-glow': s.glow } as React.CSSProperties}
          >
            <div className="stat-icon" style={{ background: s.iconBg }}>
              <s.icon size={22} color={s.color} />
            </div>
            <div>
              <div className="stat-value" style={{ color: s.color }}>{s.value}</div>
              <div className="stat-label">{s.label}</div>
            </div>
          </div>
        ))}
      </div>

      {/* Main Grid */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 360px', gap: '24px', alignItems: 'start' }}>
        {/* Left Column */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
          {/* Recent Orders / Activity */}
          <div className="card">
            <div style={{ padding: '20px 24px', borderBottom: '1px solid var(--border-subtle)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <div>
                <div style={{ fontWeight: 700, fontSize: '1rem' }}>
                  {role === 'merchant' ? 'Pedidos Recientes' : role === 'traveler' ? 'Encargos por Entregar' : 'Mis Pedidos Activos'}
                </div>
                <div style={{ color: 'var(--text-muted)', fontSize: '0.8rem', marginTop: '2px' }}>
                  Últimas transacciones en Escrow
                </div>
              </div>
              <Link href="/dashboard/orders" className="btn btn-ghost btn-sm">
                Ver todos <ChevronRight size={14} />
              </Link>
            </div>
            <div style={{ overflow: 'hidden' }}>
              <table className="data-table">
                <thead>
                  <tr>
                    <th>Pedido</th>
                    <th>Origen</th>
                    <th>Estado</th>
                    <th style={{ textAlign: 'right' }}>Monto</th>
                  </tr>
                </thead>
                <tbody>
                  {RECENT_ORDERS.map(o => (
                    <tr key={o.id} style={{ cursor: 'pointer' }}>
                      <td>
                        <div style={{ fontWeight: 600, fontSize: '0.85rem', color: 'var(--text-primary)' }}>{o.description}</div>
                        <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)' }}>#{o.id}</div>
                      </td>
                      <td><span style={{ fontSize: '0.82rem' }}>{o.from}</span></td>
                      <td><StatusBadge status={o.status} /></td>
                      <td style={{ textAlign: 'right', fontFamily: 'var(--font-display)', fontWeight: 700, color: 'var(--brand-cyan)' }}>
                        ${o.amount}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {/* AI Audit Panel */}
          <div className="card card-glow-cyan" style={{ padding: '24px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '16px' }}>
              <div style={{ width: 44, height: 44, borderRadius: 12, background: 'rgba(155,114,255,0.15)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--brand-purple)' }}>
                <Sparkles size={22} />
              </div>
              <div>
                <div style={{ fontWeight: 700 }}>Motor de Verificación IA (Gemini)</div>
                <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>Estado del pipeline de auditoría multimodal</div>
              </div>
              <span className="badge badge-emerald" style={{ marginLeft: 'auto' }}>Activo</span>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '12px' }}>
              {[
                { label: 'Facturas procesadas', value: '24', color: 'var(--brand-cyan)' },
                { label: 'Tasa de aprobación', value: '96%', color: 'var(--brand-emerald)' },
                { label: 'Alertas de fraude', value: '1', color: 'var(--brand-red)' },
              ].map((m, i) => (
                <div key={i} style={{ background: 'rgba(255,255,255,0.03)', borderRadius: 10, padding: '14px', textAlign: 'center' }}>
                  <div style={{ fontFamily: 'var(--font-display)', fontSize: '1.5rem', fontWeight: 700, color: m.color }}>{m.value}</div>
                  <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)', marginTop: 4 }}>{m.label}</div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Right Column */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
          {/* Available Routes */}
          <div className="card">
            <div style={{ padding: '18px 20px', borderBottom: '1px solid var(--border-subtle)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <div style={{ fontWeight: 700, fontSize: '0.95rem' }}>Rutas Disponibles</div>
              <Link href="/dashboard/trips" className="btn btn-ghost btn-sm">Ver todas</Link>
            </div>
            <div style={{ padding: '8px' }}>
              {ACTIVE_TRIPS.map((t, i) => (
                <div key={i} style={{
                  padding: '12px',
                  borderRadius: 10,
                  marginBottom: '6px',
                  background: 'rgba(255,255,255,0.02)',
                  border: '1px solid var(--border-subtle)',
                  cursor: 'pointer',
                  transition: 'all 0.15s',
                }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '8px' }}>
                    <div style={{ fontSize: '0.8rem', fontWeight: 600, color: 'var(--text-primary)' }}>{t.traveler}</div>
                    <span style={{ fontSize: '0.72rem', color: 'var(--brand-gold)' }}>★ {t.score}</span>
                  </div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '10px' }}>
                    <span style={{ fontSize: '0.9rem' }}>{t.fromFlag}</span>
                    <span style={{ fontSize: '0.85rem', fontWeight: 600 }}>{t.from}</span>
                    <div style={{ flex: 1, height: '1px', background: 'linear-gradient(90deg, var(--brand-cyan), transparent)', opacity: 0.4 }} />
                    <span style={{ fontSize: '0.85rem', fontWeight: 600 }}>{t.to}</span>
                    <span style={{ fontSize: '0.9rem' }}>{t.toFlag}</span>
                  </div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                    <span>📅 {t.date}</span>
                    <span style={{ color: 'var(--brand-cyan)' }}>⚖ {t.kg} kg libre</span>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Quick Actions */}
          <div className="card" style={{ padding: '20px' }}>
            <div style={{ fontWeight: 700, fontSize: '0.95rem', marginBottom: '14px' }}>Acciones Rápidas</div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
              {role === 'client' && [
                { label: 'Nuevo pedido de compra a pie', href: '/dashboard/orders/new', color: 'var(--brand-cyan)' },
                { label: 'Condimentos & Sabores Patrios', href: '/dashboard/marketplace', color: 'var(--brand-gold)' },
                { label: 'Ver rutas disponibles', href: '/dashboard/trips', color: 'var(--brand-cyan)' },
                { label: 'Bóveda de Herencia Cripto (Heritage)', href: '/dashboard/heritage', color: 'var(--brand-purple)' },
              ].map((a, i) => (
                <Link key={i} href={a.href} style={{
                  display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                  padding: '10px 14px',
                  background: 'rgba(255,255,255,0.03)',
                  border: '1px solid var(--border-subtle)',
                  borderRadius: 8,
                  textDecoration: 'none',
                  color: a.color,
                  fontSize: '0.85rem',
                  fontWeight: 500,
                  transition: 'all 0.15s',
                }}>
                  {a.label}
                  <ChevronRight size={14} />
                </Link>
              ))}

              {role === 'traveler' && [
                { label: 'Publicar nuevo itinerario', href: '/dashboard/my-trips/new', color: 'var(--brand-cyan)' },
                { label: 'Ver encargos disponibles', href: '/dashboard/orders', color: 'var(--brand-emerald)' },
                { label: 'Mis ganancias', href: '/dashboard/earnings', color: 'var(--brand-gold)' },
              ].map((a, i) => (
                <Link key={i} href={a.href} style={{
                  display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                  padding: '10px 14px',
                  background: 'rgba(255,255,255,0.03)',
                  border: '1px solid var(--border-subtle)',
                  borderRadius: 8,
                  textDecoration: 'none',
                  color: a.color,
                  fontSize: '0.85rem',
                  fontWeight: 500,
                }}>
                  {a.label}
                  <ChevronRight size={14} />
                </Link>
              ))}

              {role === 'merchant' && [
                { label: 'Agregar producto a mi tienda', href: '/dashboard/products/new', color: 'var(--brand-emerald)' },
                { label: 'Ver pedidos recibidos', href: '/dashboard/orders', color: 'var(--brand-cyan)' },
                { label: 'Mi perfil de comercio', href: '/dashboard/my-store', color: 'var(--brand-gold)' },
              ].map((a, i) => (
                <Link key={i} href={a.href} style={{
                  display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                  padding: '10px 14px',
                  background: 'rgba(255,255,255,0.03)',
                  border: '1px solid var(--border-subtle)',
                  borderRadius: 8,
                  textDecoration: 'none',
                  color: a.color,
                  fontSize: '0.85rem',
                  fontWeight: 500,
                }}>
                  {a.label}
                  <ChevronRight size={14} />
                </Link>
              ))}
            </div>
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
}
