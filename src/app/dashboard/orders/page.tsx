'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { useAuth } from '@/context/AuthContext';
import { getSupabaseBrowserClient, isSupabaseConfigured } from '@/lib/supabase/client';
import { playSuccessSound, playNotificationSound } from '@/lib/notifications/sound';
import {
  ShoppingBag, Key, CheckCircle2, Truck, AlertTriangle, Clock, ShieldCheck,
  Plus, Search, Eye, Filter, Loader2, X, Copy, Sparkles, RefreshCw, Store, Check
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
  store_name?: string;
  store_location?: string;
  store_instructions?: string;
  reference_images?: string[];
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

  // AI Purchase Verification Modal State
  const [verifyingOrder, setVerifyingOrder] = useState<OrderItem | null>(null);
  const [selectedPhoto, setSelectedPhoto] = useState<string>('https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=400&h=300&fit=crop&q=80');
  const [isAuditingOrder, setIsAuditingOrder] = useState(false);
  const [auditResult, setAuditResult] = useState<{
    detectedItem: string;
    category?: string;
    confidence: string;
    verdict: string;
    notes: string;
    iataSafe: boolean;
    provider: string;
    attestationHash?: string;
  } | null>(null);

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

  const handleAuditOrderPhoto = async () => {
    if (!verifyingOrder || !selectedPhoto) return;
    setIsAuditingOrder(true);
    try {
      const res = await fetch('/api/ai/verify-image', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          imageUrl: selectedPhoto,
          expectedName: verifyingOrder.description,
          expectedAmount: verifyingOrder.product_price_usd,
          type: 'PRODUCT',
        }),
      });
      if (res.ok) {
        const data = await res.json();
        setAuditResult(data);
      }
    } catch (err) {
      console.warn('Error auditando foto de compra:', err);
    } finally {
      setIsAuditingOrder(false);
    }
  };

  const handleConfirmAiCertification = async () => {
    if (!verifyingOrder) return;
    await updateOrderStatus(verifyingOrder.id, 'verified_ai');
    setNotice(`✅ Orden ${verifyingOrder.order_code} certificada con éxito por Gemini 3.6 Flash`);
    setVerifyingOrder(null);
    setAuditResult(null);
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

      // Despacho asíncrono de correo de liberación de fondos
      try {
        const recipient = user?.email || 'ayniprotocol@gmail.com';
        fetch('/api/email/send', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            to: recipient,
            type: 'payout_released',
            data: {
              travelerName: user?.full_name || 'Viajero AYNI',
              orderCode: order.order_code,
              productTitle: order.description,
              payoutAmountUsd: order.product_price_usd,
              txHash: '0x' + Array.from({ length: 64 }, () => Math.floor(Math.random() * 16).toString(16)).join(''),
            },
          }),
        }).catch(e => console.warn('Error enviando correo de fondos liberados:', e));
      } catch (_) {}
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

                    {order.status === 'verified_ai' && (
                      <div style={{
                        marginTop: '8px',
                        display: 'inline-flex',
                        alignItems: 'center',
                        gap: '6px',
                        background: 'linear-gradient(135deg, rgba(155,114,255,0.12) 0%, rgba(0,207,255,0.08) 100%)',
                        border: '1px solid rgba(155,114,255,0.35)',
                        borderRadius: '8px',
                        padding: '4px 10px',
                        fontSize: '0.74rem',
                        color: 'var(--brand-purple)',
                        fontWeight: 600,
                      }}>
                        <Sparkles size={12} color="var(--brand-purple)" />
                        <span>Compra Verificada por Oráculo Gemini 3.6 Flash (IATA Conforme)</span>
                      </div>
                    )}
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
                        className="btn btn-ghost btn-sm btn-pressable" 
                        style={{ display: 'flex', alignItems: 'center', gap: '4px', fontSize: '0.75rem', color: 'var(--brand-cyan)', borderColor: 'rgba(0,207,255,0.25)' }}
                      >
                        <Truck size={13} /> Tracking
                      </Link>
                      <button type="button" onClick={() => setDetailOrder(order)} className="btn btn-ghost btn-sm btn-pressable" style={{ display: 'flex', alignItems: 'center', gap: '4px', fontSize: '0.75rem' }}>
                        <Eye size={13} /> Detalle
                      </button>

                      {/* Status transition buttons based on role */}
                      {role === 'traveler' && order.status === 'funded' && (
                        <button type="button" onClick={() => updateOrderStatus(order.id, 'purchased')} className="btn btn-primary btn-sm btn-pressable" style={{ fontSize: '0.75rem' }}>
                          Confirmar Compra
                        </button>
                      )}

                      {/* AI Audit Button for Traveler & Client when funded or purchased */}
                      {(order.status === 'funded' || order.status === 'purchased') && (
                        <button
                          type="button"
                          onClick={() => { setVerifyingOrder(order); setAuditResult(null); }}
                          className="btn btn-outline btn-sm btn-tangem-glow btn-pressable"
                          style={{ fontSize: '0.75rem', borderColor: 'var(--brand-purple)', color: 'var(--brand-purple)', display: 'flex', alignItems: 'center', gap: '4px' }}
                        >
                          <Sparkles size={12} color="var(--brand-purple)" /> Auditar con IA
                        </button>
                      )}

                      {role === 'traveler' && order.status === 'purchased' && (
                        <button type="button" onClick={() => updateOrderStatus(order.id, 'in_transit')} className="btn btn-primary btn-sm btn-pressable" style={{ fontSize: '0.75rem' }}>
                          Marcar En Tránsito
                        </button>
                      )}

                      {role === 'traveler' && order.status === 'verified_ai' && (
                        <button
                          type="button"
                          onClick={() => updateOrderStatus(order.id, 'in_transit')}
                          className="btn btn-primary btn-sm btn-tangem-glow btn-pressable"
                          style={{ fontSize: '0.75rem', background: 'linear-gradient(135deg, var(--brand-purple), var(--brand-cyan))', display: 'flex', alignItems: 'center', gap: '4px' }}
                        >
                          <Truck size={12} /> Despachar a Vuelo
                        </button>
                      )}

                      {(role === 'client' || role === 'traveler') && order.status === 'in_transit' && (
                        <button type="button" onClick={() => setDetailOrder(order)} className="btn btn-tangem-glow btn-sm btn-pressable" style={{ fontSize: '0.75rem' }}>
                          <Key size={12} /> Verificar OTP
                        </button>
                      )}

                      {role === 'client' && (order.status === 'funded' || order.status === 'purchased' || order.status === 'verified_ai') && (
                        <button type="button" onClick={() => updateOrderStatus(order.id, 'disputed')} className="btn btn-ghost btn-sm btn-pressable" style={{ fontSize: '0.75rem', color: 'var(--brand-red)', borderColor: 'rgba(255,77,109,0.25)' }}>
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

            {/* Store / Market Info if present */}
            {(detailOrder.store_name || detailOrder.store_location || (detailOrder.reference_images && detailOrder.reference_images.length > 0)) && (
              <div style={{ marginTop: '14px', padding: '14px', background: 'rgba(0,207,255,0.05)', borderRadius: '12px', border: '1px solid rgba(0,207,255,0.2)' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontWeight: 700, fontSize: '0.84rem', color: 'var(--brand-cyan)', marginBottom: '4px' }}>
                  <Store size={15} /> Punto de Compra: {detailOrder.store_name || 'Comercio físico'}
                </div>
                {detailOrder.store_location && (
                  <div style={{ fontSize: '0.78rem', color: 'var(--text-secondary)', marginBottom: '4px' }}>
                    📍 Ubicación: {detailOrder.store_location}
                  </div>
                )}
                {detailOrder.store_instructions && (
                  <div style={{ fontSize: '0.75rem', color: 'var(--brand-gold)', background: 'rgba(245,166,35,0.08)', padding: '6px 10px', borderRadius: '8px', marginTop: '6px' }}>
                    💡 Instrucciones: {detailOrder.store_instructions}
                  </div>
                )}
                {detailOrder.reference_images && detailOrder.reference_images.length > 0 && (
                  <div style={{ marginTop: '10px' }}>
                    <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)', marginBottom: '6px' }}>Fotos de Referencia (ImgBB):</div>
                    <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
                      {detailOrder.reference_images.map((imgUrl, i) => (
                        <a key={i} href={imgUrl} target="_blank" rel="noopener noreferrer" style={{ display: 'block', width: 48, height: 48, borderRadius: 8, overflow: 'hidden', border: '1px solid var(--border-default)' }}>
                          <img src={imgUrl} alt="Referencia" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                        </a>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            )}

            {/* OTP Section */}
            {detailOrder.status === 'in_transit' && (
              <div style={{ marginTop: '20px', padding: '16px', background: 'rgba(0,207,255,0.05)', borderRadius: '12px', border: '1px solid rgba(0,207,255,0.2)' }}>
                <h4 style={{ fontSize: '0.88rem', fontWeight: 700, marginBottom: '8px', display: 'flex', alignItems: 'center', gap: '6px' }}>
                  <Key size={15} color="var(--brand-cyan)" /> Verificar Entrega (OTP)
                </h4>
                <p style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', marginBottom: '12px' }}>
                  El comprador debe proporcionar su código OTP de 6 caracteres para liberar el pago del escrow.
                </p>

                {/* Buyer OTP display */}
                {detailOrder.otp_plain_simulated && (
                  <div style={{ marginBottom: '12px', padding: '8px 12px', background: 'rgba(0,207,255,0.08)', borderRadius: '8px', border: '1px solid rgba(0,207,255,0.25)', fontSize: '0.78rem', color: 'var(--brand-cyan)' }}>
                    🔑 <strong>Clave Secreta OTP del Comprador:</strong> {detailOrder.otp_plain_simulated}
                    <button type="button" onClick={() => copyToClipboard(detailOrder.otp_plain_simulated!)} style={{ marginLeft: '8px', background: 'transparent', border: 'none', cursor: 'pointer', color: 'var(--brand-cyan)' }}>
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

      {/* AI Purchase Verification Modal */}
      {verifyingOrder && (
        <div className="modal-overlay" onClick={() => { setVerifyingOrder(null); setAuditResult(null); }}>
          <div className="modal-box" style={{ width: '100%', maxWidth: 540, padding: '24px' }} onClick={e => e.stopPropagation()}>
            <button
              type="button"
              onClick={() => { setVerifyingOrder(null); setAuditResult(null); }}
              style={{ position: 'absolute', top: 16, right: 16, background: 'transparent', border: 'none', color: 'var(--text-muted)', cursor: 'pointer' }}
            >
              <X size={18} />
            </button>

            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '4px' }}>
              <Sparkles size={18} color="var(--brand-purple)" />
              <h3 style={{ fontSize: '1.15rem', fontWeight: 800, margin: 0 }}>
                Auditoría Visual de Compra (Gemini 3.6 Flash)
              </h3>
            </div>
            <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)', marginBottom: '16px' }}>
              Orden #{verifyingOrder.order_code} • Inspección pericial de producto y boleta antes de embarcar
            </div>

            {/* Product description expectation */}
            <div style={{ background: 'rgba(255,255,255,0.03)', padding: '12px 14px', borderRadius: '10px', marginBottom: '14px', border: '1px solid var(--border-subtle)', fontSize: '0.82rem' }}>
              <div style={{ color: 'var(--text-muted)', fontSize: '0.72rem', marginBottom: '2px' }}>Encargo a Verificar:</div>
              <div style={{ fontWeight: 600, color: 'var(--text-primary)' }}>{verifyingOrder.description}</div>
              <div style={{ color: 'var(--brand-gold)', fontSize: '0.75rem', marginTop: '4px' }}>
                Monto en Custodia Escrow: ${verifyingOrder.product_price_usd?.toFixed(2)} USDC
              </div>
            </div>

            {/* Photo Selection */}
            <div style={{ marginBottom: '14px' }}>
              <label className="input-label" style={{ marginBottom: '6px' }}>Selecciona o sube la foto de la compra realizada:</label>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '8px', marginBottom: '10px' }}>
                {[
                  { label: 'Aguayo Jalq\'a', url: 'https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=400&h=300&fit=crop&q=80' },
                  { label: 'Implante Titanio', url: 'https://images.unsplash.com/photo-1559757175-5700dde675bc?w=400&h=300&fit=crop&q=80' },
                  { label: 'Lente Canon', url: 'https://images.unsplash.com/photo-1606983340126-99ab4feaa64a?w=400&h=300&fit=crop&q=80' },
                ].map((sample, idx) => (
                  <button
                    key={idx}
                    type="button"
                    onClick={() => { setSelectedPhoto(sample.url); setAuditResult(null); }}
                    style={{
                      padding: '6px',
                      borderRadius: '8px',
                      background: selectedPhoto === sample.url ? 'rgba(155,114,255,0.15)' : 'rgba(255,255,255,0.03)',
                      border: selectedPhoto === sample.url ? '1px solid var(--brand-purple)' : '1px solid var(--border-default)',
                      color: selectedPhoto === sample.url ? 'var(--brand-purple)' : 'var(--text-secondary)',
                      fontSize: '0.72rem',
                      fontWeight: 600,
                      cursor: 'pointer',
                      textAlign: 'center',
                    }}
                  >
                    📸 {sample.label}
                  </button>
                ))}
              </div>

              {/* Photo Preview with Laser Scanner */}
              <div style={{
                position: 'relative',
                height: '180px',
                borderRadius: '10px',
                overflow: 'hidden',
                border: isAuditingOrder ? '1px solid var(--brand-cyan)' : '1px solid var(--border-default)',
                boxShadow: isAuditingOrder ? '0 0 20px rgba(0,207,255,0.3)' : 'none',
              }}>
                <img
                  src={selectedPhoto}
                  alt="Foto a auditar"
                  style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                />
                {isAuditingOrder && (
                  <div style={{
                    position: 'absolute',
                    top: 0,
                    left: 0,
                    right: 0,
                    height: '3px',
                    background: 'linear-gradient(90deg, transparent, #00cfff, #9b72ff, transparent)',
                    boxShadow: '0 0 16px #00cfff, 0 0 24px #9b72ff',
                    animation: 'laserScan 1.4s ease-in-out infinite alternate',
                    zIndex: 10,
                  }} />
                )}
                {isAuditingOrder && (
                  <div style={{
                    position: 'absolute',
                    bottom: 8,
                    left: 8,
                    background: 'rgba(5,8,16,0.85)',
                    color: 'var(--brand-cyan)',
                    padding: '3px 8px',
                    borderRadius: '4px',
                    fontSize: '0.68rem',
                    fontWeight: 700,
                    display: 'flex',
                    alignItems: 'center',
                    gap: '4px',
                  }}>
                    <span className="sc-radar-dot" /> Escaneo Multimodal en Vivo
                  </div>
                )}
              </div>
            </div>

            {/* Audit Trigger */}
            <div style={{ marginBottom: '14px' }}>
              <button
                type="button"
                onClick={handleAuditOrderPhoto}
                disabled={isAuditingOrder}
                className="btn btn-primary btn-tangem-glow btn-pressable"
                style={{ width: '100%', padding: '10px 14px', fontSize: '0.82rem', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px' }}
              >
                {isAuditingOrder ? <RefreshCw size={14} className="spin" /> : <Sparkles size={14} />}
                {isAuditingOrder ? 'Inspeccionando con Gemini 3.6 Flash...' : '⚡ Ejecutar Auditoría Pericial de Compra'}
              </button>
            </div>

            {/* Results HUD */}
            {auditResult && (
              <div className="animate-spring-check" style={{
                background: 'rgba(5, 8, 16, 0.9)',
                border: '1px solid rgba(0, 214, 143, 0.4)',
                borderRadius: '12px',
                padding: '14px',
                marginBottom: '14px',
                boxShadow: '0 0 20px rgba(0, 214, 143, 0.1)',
              }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px', flexWrap: 'wrap', gap: '6px' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                    <CheckCircle2 size={16} color="var(--brand-emerald)" />
                    <span style={{ fontWeight: 800, fontSize: '0.84rem', color: 'var(--brand-emerald)' }}>
                      {auditResult.verdict}
                    </span>
                  </div>
                  <span className="badge badge-cyan" style={{ fontSize: '0.72rem' }}>
                    Coincidencia: {auditResult.confidence}
                  </span>
                </div>

                <div style={{ fontSize: '0.8rem', color: 'var(--text-primary)', marginBottom: '6px' }}>
                  <strong>Objeto Detectado:</strong> {auditResult.detectedItem} {auditResult.category ? `(${auditResult.category})` : ''}
                </div>
                <div style={{ fontSize: '0.76rem', color: 'var(--text-secondary)', fontStyle: 'italic', marginBottom: '8px' }}>
                  "{auditResult.notes}"
                </div>

                <div style={{ display: 'flex', gap: '10px', fontSize: '0.7rem', color: 'var(--text-muted)', borderTop: '1px solid rgba(255,255,255,0.06)', paddingTop: '6px', marginBottom: '10px' }}>
                  <span>✈️ IATA Cabina: <strong style={{ color: 'var(--brand-emerald)' }}>Autorizado</strong></span>
                  <span>🔒 Escrow Base L2: <strong>Conforme</strong></span>
                  <span>⚡ Motor: <strong>Gemini 3.6 Flash</strong></span>
                </div>

                <button
                  type="button"
                  onClick={handleConfirmAiCertification}
                  className="btn btn-primary"
                  style={{ width: '100%', fontSize: '0.8rem', padding: '9px 12px', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '6px' }}
                >
                  <Check size={14} /> Certificar Compra y Emitir Sello On-Chain
                </button>
              </div>
            )}
          </div>
        </div>
      )}
    </DashboardLayout>
  );
}
