'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { useAuth } from '@/context/AuthContext';
import { getSupabaseBrowserClient, isSupabaseConfigured } from '@/lib/supabase/client';
import { playSuccessSound, playNotificationSound } from '@/lib/notifications/sound';
import {
  ShoppingBag, Key, CheckCircle2, Truck, AlertTriangle, Clock, ShieldCheck,
  Plus, Search, Eye, Filter, Loader2, X, Copy, Sparkles, RefreshCw
} from 'lucide-react';

interface OrderItem {
  id: string;
  order_code: string;
  description: string;
  product_price_usd: number;
  traveler_fee_usd: number;
  platform_fee_usd: number;
  guarantee_fund_usd: number;
  total_escrow_usd: number;
  status: string;
  otp_plain_simulated?: string;
  otp_hash?: string;
  created_at?: string;
  delivered_at?: string;
}

const STATUS_MAP: Record<string, { label: string; badge: string; icon: React.ReactNode }> = {
  created:     { label: 'Creado',          badge: 'badge-gold',    icon: <Clock size={13} /> },
  funded:      { label: 'Fondeado/Escrow', badge: 'badge-cyan',    icon: <ShieldCheck size={13} /> },
  purchased:   { label: 'Comprado',        badge: 'badge-emerald', icon: <ShoppingBag size={13} /> },
  verified_ai: { label: 'Verificado IA',   badge: 'badge-purple',  icon: <CheckCircle2 size={13} /> },
  in_transit:  { label: 'En Tránsito',     badge: 'badge-cyan',    icon: <Truck size={13} /> },
  delivered:   { label: 'Entregado',        badge: 'badge-emerald', icon: <CheckCircle2 size={13} /> },
  cancelled:   { label: 'Cancelado',        badge: 'badge-gold',    icon: <X size={13} /> },
  disputed:    { label: 'Disputa',          badge: 'badge-red',     icon: <AlertTriangle size={13} /> },
};

export default function OrdersPage() {
  const { user, role } = useAuth();
  const [orders, setOrders] = useState<OrderItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [notice, setNotice] = useState<string | null>(null);
  const [filterStatus, setFilterStatus] = useState('all');
  const [searchQ, setSearchQ] = useState('');
  const [detailOrder, setDetailOrder] = useState<OrderItem | null>(null);
  const [otpInput, setOtpInput] = useState('');
  const [otpResult, setOtpResult] = useState<string | null>(null);

  useEffect(() => { loadOrders(); }, [user, role]);

  async function loadOrders() {
    if (!user?.id) { setLoading(false); return; }

    if (isSupabaseConfigured) {
      try {
        const params = new URLSearchParams();
        if (role === 'client') params.set('client_id', user.id);
        else if (role === 'traveler') params.set('traveler_id', user.id);
        else if (role === 'merchant') params.set('store_owner_id', user.id);

        const res = await fetch(`/api/orders?${params}`);
        if (res.ok) {
          const { orders: data } = await res.json();
          if (data) { setOrders(data); setLoading(false); return; }
        }
      } catch (e) { console.warn(e); }
    }

    // Fallback
    const saved = localStorage.getItem('ayni_orders');
    if (saved) { try { setOrders(JSON.parse(saved)); } catch {} }
    setLoading(false);
  }

  const updateOrderStatus = async (orderId: string, newStatus: string) => {
    if (isSupabaseConfigured) {
      try {
        const res = await fetch('/api/orders', {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            id: orderId,
            status: newStatus,
            ...(newStatus === 'delivered' ? { delivered_at: new Date().toISOString() } : {}),
          }),
        });
        if (res.ok) {
          setOrders(prev => prev.map(o => o.id === orderId ? { ...o, status: newStatus } : o));
          playSuccessSound();
          setNotice(`Estado actualizado a: ${STATUS_MAP[newStatus]?.label || newStatus}`);
          setTimeout(() => setNotice(null), 3000);
          return;
        }
      } catch (e) { console.warn(e); }
    }

    // Fallback
    setOrders(prev => prev.map(o => o.id === orderId ? { ...o, status: newStatus } : o));
    playSuccessSound();
    setNotice(`Estado actualizado a: ${STATUS_MAP[newStatus]?.label || newStatus}`);
    setTimeout(() => setNotice(null), 3000);
  };

  const verifyOTP = (order: OrderItem) => {
    const clean = otpInput.trim().toUpperCase();
    if (!clean) { setOtpResult('Ingresa el código OTP.'); return; }

    // In demo/test mode, compare plain text
    if (order.otp_plain_simulated && clean === order.otp_plain_simulated.toUpperCase()) {
      updateOrderStatus(order.id, 'delivered');
      setOtpResult('✅ ¡OTP verificado! Pago liberado del escrow.');
      setOtpInput('');
      playSuccessSound();
    } else {
      setOtpResult('❌ Código incorrecto. Intenta de nuevo.');
    }
  };

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    playNotificationSound();
    setNotice('Copiado al portapapeles.');
    setTimeout(() => setNotice(null), 2000);
  };

  const filtered = orders.filter(o => {
    if (filterStatus !== 'all' && o.status !== filterStatus) return false;
    if (searchQ && !o.description.toLowerCase().includes(searchQ.toLowerCase()) && !o.order_code.toLowerCase().includes(searchQ.toLowerCase())) return false;
    return true;
  });

  const roleTitle = role === 'traveler' ? 'Encargos Activos' : role === 'merchant' ? 'Pedidos Recibidos' : 'Mis Pedidos';

  return (
    <DashboardLayout>
      <div className="page-header" style={{ marginBottom: '24px' }}>
        <div className="page-title-group">
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '4px', flexWrap: 'wrap' }}>
            <div className="page-title">{roleTitle}</div>
            <span className="badge badge-cyan"><Sparkles size={11} /> Escrow P2P</span>
            <span className="badge badge-gold" style={{ fontSize: '0.7rem' }}>{orders.length} órdenes</span>
          </div>
          <div className="page-subtitle">
            {role === 'traveler' ? 'Gestiona encargos, confirma entregas y verifica OTP.' :
             role === 'merchant' ? 'Pedidos de tus productos y estado de envíos.' :
             'Historial y estado de tus pedidos con custodia escrow.'}
          </div>
        </div>
        {role === 'client' && (
          <Link href="/dashboard/orders/new" className="btn btn-primary" style={{ display: 'inline-flex', alignItems: 'center', gap: '6px' }}>
            <Plus size={16} /> Nuevo Pedido
          </Link>
        )}
      </div>

      {notice && (
        <div className="alert alert-success" style={{ marginBottom: '16px' }}><CheckCircle2 size={16} /> {notice}</div>
      )}

      {/* Filters */}
      <div style={{ display: 'flex', gap: '12px', marginBottom: '20px', flexWrap: 'wrap' }}>
        <div style={{ position: 'relative', flex: '1 1 200px', maxWidth: '300px' }}>
          <Search size={16} style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }} />
          <input type="text" placeholder="Buscar por código o descripción..." value={searchQ} onChange={e => setSearchQ(e.target.value)} className="input" style={{ paddingLeft: '36px' }} />
        </div>
        <select value={filterStatus} onChange={e => setFilterStatus(e.target.value)} className="input" style={{ flex: '0 0 auto', maxWidth: '200px' }}>
          <option value="all">Todos los estados</option>
          {Object.entries(STATUS_MAP).map(([k, v]) => <option key={k} value={k}>{v.label}</option>)}
        </select>
        <button type="button" onClick={loadOrders} className="btn btn-ghost btn-sm" style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
          <RefreshCw size={14} /> Refrescar
        </button>
      </div>

      {loading ? (
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', minHeight: '30vh', gap: '10px', color: 'var(--text-muted)' }}>
          <Loader2 size={20} style={{ animation: 'spin 1s linear infinite' }} /> Cargando órdenes...
        </div>
      ) : filtered.length === 0 ? (
        <div className="card" style={{ padding: '40px', textAlign: 'center' }}>
          <ShoppingBag size={40} color="var(--text-muted)" style={{ marginBottom: '12px' }} />
          <h3 style={{ fontWeight: 700, fontSize: '1.1rem', marginBottom: '8px' }}>
            {searchQ || filterStatus !== 'all' ? 'Sin resultados para ese filtro' : 'No hay órdenes aún'}
          </h3>
          <p style={{ color: 'var(--text-secondary)', fontSize: '0.88rem' }}>
            {role === 'client' ? 'Explora el Marketplace y crea tu primer pedido.' : 'Las órdenes aparecerán aquí cuando los compradores te asignen encargos.'}
          </p>
        </div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
          {filtered.map(order => {
            const st = STATUS_MAP[order.status] || { label: order.status, badge: 'badge-gold', icon: <Clock size={13} /> };
            return (
              <div key={order.id} className="card card-kinetic" style={{ padding: '20px' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '12px' }}>
                  {/* Order Info */}
                  <div style={{ flex: 1, minWidth: '200px' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '6px', flexWrap: 'wrap' }}>
                      <span style={{ fontFamily: 'monospace', fontSize: '0.78rem', color: 'var(--brand-cyan)', cursor: 'pointer' }} onClick={() => copyToClipboard(order.order_code)}>
                        {order.order_code} <Copy size={10} style={{ opacity: 0.6 }} />
                      </span>
                      <span className={`badge ${st.badge}`} style={{ fontSize: '0.7rem', display: 'inline-flex', alignItems: 'center', gap: '3px' }}>
                        {st.icon} {st.label}
                      </span>
                    </div>
                    <div style={{ fontWeight: 600, fontSize: '0.9rem', color: 'var(--text-primary)', marginBottom: '4px' }}>
                      {order.description}
                    </div>
                    <div style={{ fontSize: '0.78rem', color: 'var(--text-muted)' }}>
                      {order.created_at ? new Date(order.created_at).toLocaleDateString('es', { day: 'numeric', month: 'short', year: 'numeric' }) : ''}
                    </div>
                  </div>

                  {/* Financial Breakdown */}
                  <div style={{ display: 'flex', gap: '14px', alignItems: 'center', flexWrap: 'wrap' }}>
                    <div style={{ textAlign: 'right' }}>
                      <div style={{ fontWeight: 800, fontSize: '1.15rem', color: 'var(--brand-gold)' }}>${order.total_escrow_usd?.toFixed(2)}</div>
                      <div style={{ fontSize: '0.7rem', color: 'var(--text-muted)' }}>Total Escrow</div>
                    </div>
                    <div style={{ display: 'flex', gap: '6px', flexWrap: 'wrap' }}>
                      <Link 
                        href={`/dashboard/tracking/${order.order_code || order.id}`} 
                        className="btn btn-ghost btn-sm" 
                        style={{ display: 'flex', alignItems: 'center', gap: '4px', fontSize: '0.75rem', color: 'var(--brand-cyan)' }}
                      >
                        <Truck size={13} /> Tracking
                      </Link>
                      <button type="button" onClick={() => setDetailOrder(order)} className="btn btn-ghost btn-sm" style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                        <Eye size={13} /> Detalle
                      </button>
                      {/* Status transition buttons based on role */}
                      {role === 'traveler' && order.status === 'funded' && (
                        <button type="button" onClick={() => updateOrderStatus(order.id, 'purchased')} className="btn btn-primary btn-sm" style={{ fontSize: '0.75rem' }}>
                          Confirmar Compra
                        </button>
                      )}
                      {role === 'traveler' && order.status === 'purchased' && (
                        <button type="button" onClick={() => updateOrderStatus(order.id, 'in_transit')} className="btn btn-primary btn-sm" style={{ fontSize: '0.75rem' }}>
                          Marcar En Tránsito
                        </button>
                      )}
                      {(role === 'client' || role === 'traveler') && order.status === 'in_transit' && (
                        <button type="button" onClick={() => setDetailOrder(order)} className="btn btn-primary btn-sm" style={{ fontSize: '0.75rem' }}>
                          <Key size={12} /> Verificar OTP
                        </button>
                      )}
                      {role === 'client' && (order.status === 'funded' || order.status === 'purchased') && (
                        <button type="button" onClick={() => updateOrderStatus(order.id, 'disputed')} className="btn btn-ghost btn-sm" style={{ fontSize: '0.75rem', color: 'var(--brand-red)' }}>
                          <AlertTriangle size={12} /> Disputa
                        </button>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Detail / OTP Modal */}
      {detailOrder && (
        <div className="modal-overlay" onClick={() => { setDetailOrder(null); setOtpResult(null); setOtpInput(''); }}>
          <div className="modal-box" style={{ width: '100%', maxWidth: 500, padding: '28px' }} onClick={e => e.stopPropagation()}>
            <button type="button" onClick={() => { setDetailOrder(null); setOtpResult(null); setOtpInput(''); }} style={{ position: 'absolute', top: 16, right: 16, background: 'transparent', border: 'none', color: 'var(--text-muted)', cursor: 'pointer' }}>
              <X size={18} />
            </button>

            <h3 style={{ fontSize: '1.15rem', fontWeight: 700, marginBottom: '6px' }}>Detalle de Orden</h3>
            <span style={{ fontFamily: 'monospace', fontSize: '0.82rem', color: 'var(--brand-cyan)' }}>{detailOrder.order_code}</span>

            {/* Financial Breakdown */}
            <div style={{ marginTop: '20px', padding: '16px', background: 'rgba(255,255,255,0.03)', borderRadius: '12px', border: '1px solid var(--border-subtle)' }}>
              <h4 style={{ fontSize: '0.88rem', fontWeight: 700, marginBottom: '12px', color: 'var(--text-primary)' }}>Desglose Financiero</h4>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', fontSize: '0.85rem' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                  <span style={{ color: 'var(--text-secondary)' }}>Costo del producto</span>
                  <span style={{ fontWeight: 600 }}>${detailOrder.product_price_usd?.toFixed(2)}</span>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                  <span style={{ color: 'var(--text-secondary)' }}>Fee del viajero</span>
                  <span style={{ fontWeight: 600 }}>${detailOrder.traveler_fee_usd?.toFixed(2)}</span>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                  <span style={{ color: 'var(--text-secondary)' }}>Fee plataforma (5%)</span>
                  <span style={{ fontWeight: 600 }}>${detailOrder.platform_fee_usd?.toFixed(2)}</span>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                  <span style={{ color: 'var(--text-secondary)' }}>Fondo de garantía</span>
                  <span style={{ fontWeight: 600 }}>${detailOrder.guarantee_fund_usd?.toFixed(2)}</span>
                </div>
                <hr style={{ border: 'none', borderTop: '1px solid var(--border-subtle)', margin: '4px 0' }} />
                <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                  <span style={{ fontWeight: 700, color: 'var(--text-primary)' }}>Total en Escrow</span>
                  <span style={{ fontWeight: 800, fontSize: '1.1rem', color: 'var(--brand-gold)' }}>${detailOrder.total_escrow_usd?.toFixed(2)} USDC</span>
                </div>
              </div>
            </div>

            {/* OTP Section */}
            {detailOrder.status === 'in_transit' && (
              <div style={{ marginTop: '20px', padding: '16px', background: 'rgba(0,207,255,0.05)', borderRadius: '12px', border: '1px solid rgba(0,207,255,0.2)' }}>
                <h4 style={{ fontSize: '0.88rem', fontWeight: 700, marginBottom: '8px', display: 'flex', alignItems: 'center', gap: '6px' }}>
                  <Key size={15} color="var(--brand-cyan)" /> Verificar Entrega (OTP)
                </h4>
                <p style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', marginBottom: '12px' }}>
                  El comprador debe proporcionar su código OTP de 6 caracteres para liberar el pago del escrow.
                </p>

                {/* Demo OTP display */}
                {detailOrder.otp_plain_simulated && (
                  <div style={{ marginBottom: '12px', padding: '8px 12px', background: 'rgba(245,166,35,0.1)', borderRadius: '8px', fontSize: '0.78rem', color: 'var(--brand-gold)' }}>
                    🧪 <strong>OTP de prueba:</strong> {detailOrder.otp_plain_simulated}
                    <button type="button" onClick={() => copyToClipboard(detailOrder.otp_plain_simulated!)} style={{ marginLeft: '8px', background: 'transparent', border: 'none', cursor: 'pointer', color: 'var(--brand-gold)' }}>
                      <Copy size={12} />
                    </button>
                  </div>
                )}

                <div style={{ display: 'flex', gap: '8px' }}>
                  <input
                    type="text"
                    placeholder="Ingresa código OTP"
                    value={otpInput}
                    onChange={e => setOtpInput(e.target.value.toUpperCase())}
                    className="input"
                    maxLength={6}
                    style={{ fontFamily: 'monospace', letterSpacing: '2px', textAlign: 'center', fontSize: '1.1rem', flex: 1 }}
                  />
                  <button type="button" onClick={() => verifyOTP(detailOrder)} className="btn btn-primary" style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                    <ShieldCheck size={14} /> Verificar
                  </button>
                </div>
                {otpResult && (
                  <div style={{ marginTop: '8px', fontSize: '0.85rem', fontWeight: 600, color: otpResult.startsWith('✅') ? 'var(--brand-emerald)' : 'var(--brand-red)' }}>
                    {otpResult}
                  </div>
                )}
              </div>
            )}

            {/* Dispute Shortcut */}
            <div style={{ marginTop: '20px', paddingTop: '14px', borderTop: '1px solid var(--border-subtle)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <span style={{ fontSize: '0.78rem', color: 'var(--text-muted)' }}>¿Ocurrió un percance con este pedido?</span>
              <Link 
                href="/dashboard/disputes" 
                className="btn btn-ghost btn-sm" 
                style={{ color: '#ef4444', fontSize: '0.78rem', padding: '4px 10px' }}
                onClick={() => setDetailOrder(null)}
              >
                Abrir Disputa
              </Link>
            </div>
          </div>
        </div>
      )}
    </DashboardLayout>
  );
}
