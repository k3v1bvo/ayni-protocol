'use client';

import React, { useState } from 'react';
import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { verifyOtpCode } from '@/lib/utils/otp';
import {
  ShoppingBag, Eye, EyeOff, KeyRound, CheckCircle2, AlertCircle, 
  Sparkles, Clock, Search, Filter, Package, Plane, MapPin
} from 'lucide-react';

const ALL_ORDERS = [
  {
    id: 'ORD-2609-001', type: 'medical', status: 'verified_ai',
    description: 'Kit implantes dentales titanio grado 5 + biomateriales óseos — Madrid, España',
    clientName: 'Dra. Claudia Vargas R.', travelerName: 'Diana Quiroga M.',
    route: { from: 'Amsterdam 🇳🇱', to: 'La Paz 🇧🇴' },
    productCost: 340, travelerFee: 34, systemFee: 10.2, total: 384.2,
    otpCode: 'AY7K9M',
    otpHash: '96d24608c0efee41872df0d5ea66fa211e0e8e97f0fb5de5b23d913d806a6b5c',
    aiScore: 0.96, ocrAmount: 340.0, ocrStore: 'MedTech Europa SL',
    date: '2026-09-08T10:00:00Z',
  },
  {
    id: 'ORD-2609-002', type: 'store_run', status: 'shipped',
    description: 'Lente fotográfico Canon EF 50mm f/1.8 — FNAC Callao, Madrid',
    clientName: 'Mateo Quispe A.', travelerName: 'Alejandro Mamani C.',
    route: { from: 'Madrid 🇪🇸', to: 'La Paz 🇧🇴' },
    productCost: 155, travelerFee: 10.85, systemFee: 4.65, total: 170.5,
    otpCode: 'MN82K1',
    otpHash: '2c53e0a2976fba89f28d8b67104d4ef6bbd688cf6cf3ef0c77ec7ad81c3c3e72',
    aiScore: 0.98, ocrAmount: 155.0, ocrStore: 'FNAC Callao',
    date: '2026-09-07T14:30:00Z',
  },
  {
    id: 'ORD-2609-003', type: 'store', status: 'completed',
    description: 'Chullo artesanal andino lana de alpaca — Tejidos Illimani, Cochabamba',
    clientName: 'María José Reyes', travelerName: 'Lucía Fernández R.',
    route: { from: 'Buenos Aires 🇦🇷', to: 'Cochabamba 🇧🇴' },
    productCost: 38, travelerFee: 1.9, systemFee: 0.76, total: 40.66,
    otpCode: '---',
    otpHash: '',
    aiScore: 0.99, ocrAmount: 38.0, ocrStore: 'Tejidos Illimani',
    date: '2026-09-06T09:15:00Z',
  },
  {
    id: 'ORD-2609-004', type: 'remittance', status: 'funded',
    description: 'Remesa en efectivo USD → USDC equivalente $500 para familia Choque',
    clientName: 'Jorge Choque M.', travelerName: 'Sin asignar',
    route: { from: 'Miami 🇺🇸', to: 'Santa Cruz 🇧🇴' },
    productCost: 500, travelerFee: 35, systemFee: 15, total: 550,
    otpCode: 'R3M1SA',
    otpHash: 'aabbcc',
    aiScore: null, ocrAmount: null, ocrStore: null,
    date: '2026-09-08T16:00:00Z',
  },
];

const TYPE_LABELS: Record<string, { label: string; cls: string }> = {
  medical: { label: 'Médico', cls: 'badge-red' },
  store_run: { label: 'Compra a Pie', cls: 'badge-purple' },
  store: { label: 'Marketplace', cls: 'badge-gold' },
  remittance: { label: 'Remesa', cls: 'badge-cyan' },
};

const STATUS_LABELS: Record<string, { label: string; cls: string }> = {
  funded: { label: 'En Escrow', cls: 'badge-gold' },
  verified_ai: { label: 'IA Verificado', cls: 'badge-cyan' },
  shipped: { label: 'En Tránsito', cls: 'badge-purple' },
  completed: { label: 'Completado', cls: 'badge-emerald' },
  disputed: { label: 'Disputa', cls: 'badge-red' },
};

export default function OrdersPage() {
  const [expanded, setExpanded] = useState<string | null>(null);
  const [revealedOtp, setRevealedOtp] = useState<Record<string, boolean>>({});
  const [inputOtps, setInputOtps] = useState<Record<string, string>>({});
  const [feedback, setFeedback] = useState<Record<string, { ok: boolean; msg: string }>>({});
  const [orders, setOrders] = useState(ALL_ORDERS);
  const [statusFilter, setStatusFilter] = useState('all');

  const filtered = statusFilter === 'all' ? orders : orders.filter(o => o.status === statusFilter);

  const handleVerify = async (order: typeof ALL_ORDERS[0]) => {
    const input = (inputOtps[order.id] || '').trim().toUpperCase();
    if (!input) {
      setFeedback(p => ({ ...p, [order.id]: { ok: false, msg: 'Ingresa el código OTP de 6 caracteres' } }));
      return;
    }
    // Demo: compare directly with stored code
    if (input === order.otpCode) {
      setOrders(prev => prev.map(o => o.id === order.id ? { ...o, status: 'completed' } : o));
      setFeedback(p => ({ ...p, [order.id]: { ok: true, msg: `✅ ¡Entrega confirmada! $${(order.productCost + order.travelerFee).toFixed(2)} USDC liberados a la wallet del viajero.` } }));
    } else {
      setFeedback(p => ({ ...p, [order.id]: { ok: false, msg: '❌ Código OTP incorrecto. Verifica con el comprador.' } }));
    }
  };

  return (
    <DashboardLayout>
      <div className="page-header">
        <div className="page-title-group">
          <div className="page-title">Gestión de Pedidos</div>
          <div className="page-subtitle">Encargos activos, en tránsito y completados con validación OTP</div>
        </div>
        <button className="btn btn-primary">
          <Package size={16} /> Nuevo Pedido
        </button>
      </div>

      {/* Filter Tabs */}
      <div className="tab-bar" style={{ marginBottom: '24px', maxWidth: '600px' }}>
        {['all', 'funded', 'verified_ai', 'shipped', 'completed'].map(s => (
          <button key={s} type="button" className={`tab-item ${statusFilter === s ? 'active' : ''}`} onClick={() => setStatusFilter(s)}>
            {s === 'all' ? 'Todos' : STATUS_LABELS[s]?.label || s}
          </button>
        ))}
      </div>

      {/* Orders List */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
        {filtered.map(order => {
          const isOpen = expanded === order.id;
          const st = STATUS_LABELS[order.status];
          const tp = TYPE_LABELS[order.type];

          return (
            <div key={order.id} className="card">
              {/* Header row */}
              <div
                style={{ padding: '18px 22px', cursor: 'pointer', display: 'flex', gap: '14px', alignItems: 'center', flexWrap: 'wrap' }}
                onClick={() => setExpanded(isOpen ? null : order.id)}
              >
                {/* Icon */}
                <div style={{
                  width: 42, height: 42, borderRadius: 10, flexShrink: 0,
                  background: 'rgba(0,207,255,0.1)',
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  color: 'var(--brand-cyan)',
                }}>
                  <Package size={20} />
                </div>

                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ display: 'flex', gap: '8px', alignItems: 'center', flexWrap: 'wrap', marginBottom: '4px' }}>
                    <span style={{ fontFamily: 'var(--font-display)', fontSize: '0.75rem', color: 'var(--text-muted)' }}>#{order.id}</span>
                    {st && <span className={`badge ${st.cls}`}>{st.label}</span>}
                    {tp && <span className={`badge ${tp.cls}`}>{tp.label}</span>}
                  </div>
                  <div style={{ fontWeight: 600, fontSize: '0.9rem', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                    {order.description}
                  </div>
                  <div style={{ display: 'flex', gap: '14px', marginTop: '4px', fontSize: '0.75rem', color: 'var(--text-muted)', flexWrap: 'wrap' }}>
                    <span>👤 {order.clientName}</span>
                    <span>✈ {order.route.from} → {order.route.to}</span>
                    <span>🕐 {new Date(order.date).toLocaleDateString('es-ES')}</span>
                  </div>
                </div>

                <div style={{ textAlign: 'right', flexShrink: 0 }}>
                  <div style={{ fontFamily: 'var(--font-display)', fontSize: '1.1rem', fontWeight: 800, color: order.status === 'completed' ? 'var(--brand-emerald)' : 'var(--brand-cyan)' }}>
                    ${order.total.toFixed(2)}
                  </div>
                  <div style={{ fontSize: '0.7rem', color: 'var(--text-muted)' }}>USDC total</div>
                </div>
              </div>

              {/* Expanded Detail */}
              {isOpen && (
                <div style={{ borderTop: '1px solid var(--border-subtle)', padding: '20px 22px' }}>
                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px', marginBottom: '20px' }}>
                    {/* Fee breakdown */}
                    <div style={{ background: 'rgba(255,255,255,0.03)', borderRadius: 10, padding: '14px' }}>
                      <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)', marginBottom: '10px', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                        Desglose Financiero
                      </div>
                      {[
                        { label: 'Costo producto', value: `$${order.productCost}` },
                        { label: 'Honorario viajero', value: `$${order.travelerFee}` },
                        { label: 'Comisión sistema', value: `$${order.systemFee}` },
                      ].map((r, i) => (
                        <div key={i} style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.82rem', padding: '3px 0' }}>
                          <span style={{ color: 'var(--text-secondary)' }}>{r.label}</span>
                          <span style={{ fontWeight: 600 }}>{r.value}</span>
                        </div>
                      ))}
                      <div style={{ borderTop: '1px solid var(--border-subtle)', marginTop: '8px', paddingTop: '8px', display: 'flex', justifyContent: 'space-between', fontWeight: 700, color: 'var(--brand-cyan)' }}>
                        <span>Total Escrow</span>
                        <span>${order.total.toFixed(2)} USDC</span>
                      </div>
                    </div>

                    {/* AI Verification */}
                    {order.aiScore !== null && (
                      <div style={{ background: 'rgba(155,114,255,0.08)', border: '1px solid rgba(155,114,255,0.2)', borderRadius: 10, padding: '14px' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '6px', marginBottom: '10px' }}>
                          <Sparkles size={15} color="var(--brand-purple)" />
                          <span style={{ fontSize: '0.72rem', color: 'var(--brand-purple)', textTransform: 'uppercase', letterSpacing: '0.05em', fontWeight: 600 }}>
                            Auditoría IA Gemini
                          </span>
                        </div>
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '6px', fontSize: '0.82rem' }}>
                          <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                            <span style={{ color: 'var(--text-secondary)' }}>Coincidencia visual</span>
                            <span style={{ color: 'var(--brand-emerald)', fontWeight: 700 }}>{(order.aiScore * 100).toFixed(0)}%</span>
                          </div>
                          <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                            <span style={{ color: 'var(--text-secondary)' }}>Monto OCR</span>
                            <span style={{ fontWeight: 600 }}>${order.ocrAmount}</span>
                          </div>
                          <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                            <span style={{ color: 'var(--text-secondary)' }}>Comercio</span>
                            <span style={{ fontWeight: 600 }}>{order.ocrStore}</span>
                          </div>
                          <div className="badge badge-emerald" style={{ alignSelf: 'flex-start', marginTop: '4px' }}>
                            <CheckCircle2 size={11} /> Dictamen: Aprobado
                          </div>
                        </div>
                      </div>
                    )}
                  </div>

                  {/* OTP Section */}
                  {order.status !== 'completed' && order.status !== 'disputed' && (
                    <div style={{
                      background: 'rgba(245,166,35,0.06)',
                      border: '1px solid rgba(245,166,35,0.2)',
                      borderRadius: 12,
                      padding: '18px',
                    }}>
                      <div style={{ fontWeight: 700, fontSize: '0.9rem', marginBottom: '14px', color: 'var(--brand-gold)', display: 'flex', alignItems: 'center', gap: '8px' }}>
                        <KeyRound size={18} /> Código OTP de Entrega (6 dígitos)
                      </div>

                      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px' }}>
                        {/* Buyer side */}
                        <div>
                          <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginBottom: '8px' }}>
                            🔒 Código del Comprador (revelar solo al recibir el paquete físicamente):
                          </div>
                          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                            <div style={{
                              fontFamily: 'var(--font-display)',
                              fontSize: '1.5rem',
                              fontWeight: 800,
                              letterSpacing: '0.2em',
                              background: 'rgba(0,0,0,0.5)',
                              border: '1px solid rgba(245,166,35,0.3)',
                              borderRadius: 8,
                              padding: '8px 14px',
                              color: revealedOtp[order.id] ? 'var(--brand-gold)' : 'var(--text-muted)',
                              cursor: 'pointer',
                            }}>
                              {revealedOtp[order.id] ? order.otpCode : '•  •  •  •  •  •'}
                            </div>
                            <button
                              type="button"
                              className="btn btn-ghost btn-sm"
                              onClick={() => setRevealedOtp(p => ({ ...p, [order.id]: !p[order.id] }))}
                            >
                              {revealedOtp[order.id] ? <EyeOff size={15} /> : <Eye size={15} />}
                              {revealedOtp[order.id] ? 'Ocultar' : 'Revelar'}
                            </button>
                          </div>
                        </div>

                        {/* Traveler side */}
                        <div>
                          <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginBottom: '8px' }}>
                            ✈ Terminal del Viajero (ingresar código para liberar pago):
                          </div>
                          <div style={{ display: 'flex', gap: '8px' }}>
                            <input
                              type="text"
                              maxLength={6}
                              placeholder="AY7K9M"
                              value={inputOtps[order.id] || ''}
                              onChange={e => setInputOtps(p => ({ ...p, [order.id]: e.target.value.toUpperCase() }))}
                              className="input"
                              style={{ maxWidth: 140, fontFamily: 'var(--font-display)', fontSize: '1rem', fontWeight: 700, letterSpacing: '0.1em', textTransform: 'uppercase' }}
                            />
                            <button type="button" className="btn btn-primary btn-sm" onClick={() => handleVerify(order)}>
                              <KeyRound size={15} /> Confirmar
                            </button>
                          </div>
                        </div>
                      </div>

                      {feedback[order.id] && (
                        <div className={`alert ${feedback[order.id].ok ? 'alert-success' : 'alert-error'}`} style={{ marginTop: '12px' }}>
                          {feedback[order.id].ok ? <CheckCircle2 size={16} /> : <AlertCircle size={16} />}
                          {feedback[order.id].msg}
                        </div>
                      )}
                    </div>
                  )}

                  {order.status === 'completed' && (
                    <div className="alert alert-success">
                      <CheckCircle2 size={16} />
                      Entrega completada y fondos liquidados correctamente. Viajero recibió ${(order.productCost + order.travelerFee).toFixed(2)} USDC.
                    </div>
                  )}
                </div>
              )}
            </div>
          );
        })}
      </div>
    </DashboardLayout>
  );
}
