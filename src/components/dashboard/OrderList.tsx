'use client';

import React, { useState } from 'react';
import { Order } from '@/lib/supabase/types';
import { useAuth } from '@/context/AuthContext';
import { verifyOtpCode } from '@/lib/utils/otp';
import { ShieldCheck, Eye, EyeOff, KeyRound, CheckCircle2, Sparkles, AlertCircle, ShoppingBag } from 'lucide-react';

const INITIAL_ORDERS: (Order & { clientOtpCode?: string; aiScore?: number; ocrAmount?: number })[] = [
  {
    id: '20000000-0000-0000-0000-000000000001',
    client_id: '00000000-0000-0000-0000-000000000002',
    client: {
      id: '00000000-0000-0000-0000-000000000002',
      full_name: 'Dra. Claudia Vargas R.',
      email: 'claudia@ayni.io',
      role: 'client',
      reputation_score: 5.0,
      guarantee_balance: 0,
    },
    traveler_id: '00000000-0000-0000-0000-000000000001',
    order_type: 'medical',
    description: 'Kit de implantes dentales de titanio y biomateriales óseos esterilizados en Madrid',
    product_cost_usdc: 340.0,
    traveler_fee_usdc: 23.8,
    system_fee_usdc: 10.2,
    applied_high_value_cap: false,
    secret_otp_hash: '96d24608c0efee41872df0d5ea66fa211e0e8e97f0fb5de5b23d913d806a6b5c', // Hash de 'AY7K9M'
    clientOtpCode: 'AY7K9M',
    status: 'verified_ai',
    aiScore: 0.96,
    ocrAmount: 340.0,
    created_at: '2026-09-08T10:00:00Z',
  },
  {
    id: '20000000-0000-0000-0000-000000000002',
    client_id: '00000000-0000-0000-0000-000000000002',
    client: {
      id: '00000000-0000-0000-0000-000000000002',
      full_name: 'Mateo Quispe',
      email: 'mateo@ayni.io',
      role: 'client',
      reputation_score: 4.9,
      guarantee_balance: 0,
    },
    traveler_id: '00000000-0000-0000-0000-000000000001',
    order_type: 'store_run',
    description: 'Compra en mostrador FNAC Callao: Lente fotográfico 50mm f/1.8 con garantía europea',
    product_cost_usdc: 180.0,
    traveler_fee_usdc: 12.6,
    system_fee_usdc: 5.4,
    applied_high_value_cap: false,
    secret_otp_hash: '2c53e0a2976fba89f28d8b67104d4ef6bbd688cf6cf3ef0c77ec7ad81c3c3e72', // Hash de 'MN82K1'
    clientOtpCode: 'MN82K1',
    status: 'shipped',
    aiScore: 0.98,
    ocrAmount: 180.0,
    created_at: '2026-09-07T14:30:00Z',
  },
];

export function OrderList() {
  const { role } = useAuth();
  const [orders, setOrders] = useState(INITIAL_ORDERS);
  const [revealedOtp, setRevealedOtp] = useState<Record<string, boolean>>({});
  const [inputOtps, setInputOtps] = useState<Record<string, string>>({});
  const [feedback, setFeedback] = useState<Record<string, { type: 'success' | 'error'; msg: string }>>({});

  const toggleRevealOtp = (orderId: string) => {
    setRevealedOtp(prev => ({ ...prev, [orderId]: !prev[orderId] }));
  };

  const handleVerifyAndRelease = async (order: typeof INITIAL_ORDERS[0]) => {
    const inputOtp = (inputOtps[order.id] || '').trim().toUpperCase();
    if (!inputOtp) {
      setFeedback(prev => ({ ...prev, [order.id]: { type: 'error', msg: 'Ingresa el código OTP de 6 caracteres entregado por el comprador' } }));
      return;
    }

    const isValid = await verifyOtpCode(inputOtp, order.secret_otp_hash);
    if (isValid) {
      setOrders(prev => prev.map(o => o.id === order.id ? { ...o, status: 'completed' } : o));
      setFeedback(prev => ({
        ...prev,
        [order.id]: {
          type: 'success',
          msg: `¡OTP validado! Fondos liberados del Escrow ($${(order.product_cost_usdc + order.traveler_fee_usdc).toFixed(2)} USDC al viajero).`,
        },
      }));
    } else {
      setFeedback(prev => ({
        ...prev,
        [order.id]: { type: 'error', msg: 'Código OTP incorrecto. Verifica con el comprador.' },
      }));
    }
  };

  const getStatusBadge = (status: Order['status']) => {
    switch (status) {
      case 'verified_ai':
        return <span className="badge badge-cyan">IA Verificada</span>;
      case 'shipped':
        return <span className="badge badge-purple">En Tránsito</span>;
      case 'completed':
        return <span className="badge badge-emerald">Completada & Liquidada</span>;
      default:
        return <span className="badge badge-gold">Custodia Escrow</span>;
    }
  };

  return (
    <section id="pedidos" style={{ padding: '40px 0' }}>
      <div className="container-custom">
        <div style={{ marginBottom: '32px' }}>
          <span className="badge badge-gold" style={{ marginBottom: '8px' }}>Módulos B, C & D</span>
          <h2 style={{ fontSize: '2rem', fontWeight: 800, marginTop: '6px' }}>
            Encargos en Custodia y <span className="gradient-text-cyan">Verificación OTP</span>
          </h2>
          <p style={{ color: 'var(--text-secondary)', fontSize: '0.95rem' }}>
            Fondos protegidos en Escrow (Base L2). La IA multimodal audita facturas y el OTP de 6 dígitos asegura la entrega mano a mano.
          </p>
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
          {orders.map(order => (
            <div key={order.id} className="glass-panel" style={{ padding: '24px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '12px', marginBottom: '16px' }}>
                <div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '6px' }}>
                    <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)', fontFamily: 'var(--font-mono)' }}>
                      #{order.id.slice(0, 8)}
                    </span>
                    {getStatusBadge(order.status)}
                    <span className="badge" style={{ background: 'rgba(255,255,255,0.06)', color: 'var(--text-secondary)' }}>
                      {order.order_type.replace('_', ' ').toUpperCase()}
                    </span>
                  </div>
                  <h3 style={{ fontSize: '1.15rem', fontWeight: 700, color: 'var(--text-primary)' }}>
                    {order.description}
                  </h3>
                </div>

                <div style={{ textAlign: 'right' }}>
                  <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>Monto Total Bloqueado</div>
                  <div style={{ fontSize: '1.35rem', fontWeight: 800, color: 'var(--ayni-cyan)', fontFamily: 'var(--font-mono)' }}>
                    ${(order.product_cost_usdc + order.traveler_fee_usdc + order.system_fee_usdc).toFixed(2)} USDC
                  </div>
                </div>
              </div>

              {/* AI Multimodal Audit Card */}
              {order.aiScore && (
                <div style={{
                  background: 'rgba(0, 240, 255, 0.05)',
                  border: '1px solid rgba(0, 240, 255, 0.2)',
                  borderRadius: '12px',
                  padding: '12px 16px',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  flexWrap: 'wrap',
                  gap: '10px',
                  marginBottom: '16px',
                }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                    <Sparkles size={18} color="var(--ayni-cyan)" />
                    <span style={{ fontSize: '0.85rem', color: '#e0f2fe' }}>
                      <strong>Auditoría IA (Gemini):</strong> Factura legal validada (${order.ocrAmount} USDC) • Coincidencia de imagen: {(order.aiScore * 100).toFixed(0)}%
                    </span>
                  </div>
                  <span className="badge badge-emerald" style={{ fontSize: '0.7rem' }}>Dictamen: Aprobado</span>
                </div>
              )}

              {/* OTP Security Flow */}
              <div style={{
                background: 'rgba(255, 255, 255, 0.02)',
                borderRadius: '12px',
                padding: '16px',
                display: 'grid',
                gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))',
                gap: '16px',
                alignItems: 'center',
              }}>
                {/* Client Side: Reveal OTP */}
                <div>
                  <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)', marginBottom: '4px' }}>
                    Custodia del Comprador (Revelar solo al recibir físicamente el paquete):
                  </div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                    <div style={{
                      fontFamily: 'var(--font-mono)',
                      fontSize: '1.2rem',
                      fontWeight: 800,
                      letterSpacing: '0.15em',
                      background: 'rgba(0, 0, 0, 0.6)',
                      border: '1px solid var(--border-gold)',
                      borderRadius: '8px',
                      padding: '6px 14px',
                      color: revealedOtp[order.id] ? 'var(--ayni-gold)' : 'var(--text-muted)',
                    }}>
                      {revealedOtp[order.id] ? order.clientOtpCode : '••••••'}
                    </div>
                    <button
                      type="button"
                      onClick={() => toggleRevealOtp(order.id)}
                      className="btn btn-outline"
                      style={{ padding: '8px 12px', fontSize: '0.8rem' }}
                    >
                      {revealedOtp[order.id] ? <EyeOff size={16} /> : <Eye size={16} />}
                      {revealedOtp[order.id] ? 'Ocultar' : 'Revelar OTP'}
                    </button>
                  </div>
                </div>

                {/* Traveler Side: Input OTP to unlock payout */}
                <div>
                  <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)', marginBottom: '4px' }}>
                    Terminal del Viajero (Ingresar OTP para liquidar pago en Escrow):
                  </div>
                  {order.status === 'completed' ? (
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: 'var(--ayni-emerald)', fontWeight: 600, fontSize: '0.9rem' }}>
                      <CheckCircle2 size={20} />
                      Fondos liquidados y transferidos a la wallet
                    </div>
                  ) : (
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                      <input
                        type="text"
                        maxLength={6}
                        placeholder="Código 6 dígitos"
                        value={inputOtps[order.id] || ''}
                        onChange={e => setInputOtps({ ...inputOtps, [order.id]: e.target.value })}
                        className="input-custom"
                        style={{
                          maxWidth: '160px',
                          textTransform: 'uppercase',
                          fontFamily: 'var(--font-mono)',
                          letterSpacing: '0.1em',
                          fontWeight: 700,
                          padding: '8px 12px',
                        }}
                      />
                      <button
                        type="button"
                        onClick={() => handleVerifyAndRelease(order)}
                        className="btn btn-primary"
                        style={{ padding: '8px 16px', fontSize: '0.825rem' }}
                      >
                        <KeyRound size={16} />
                        Liberar Fondos
                      </button>
                    </div>
                  )}
                </div>
              </div>

              {/* Feedback messages */}
              {feedback[order.id] && (
                <div style={{
                  marginTop: '12px',
                  padding: '10px 14px',
                  borderRadius: '8px',
                  fontSize: '0.85rem',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '8px',
                  background: feedback[order.id].type === 'success' ? 'rgba(16, 185, 129, 0.15)' : 'rgba(239, 68, 68, 0.15)',
                  color: feedback[order.id].type === 'success' ? '#34d399' : '#f87171',
                  border: `1px solid ${feedback[order.id].type === 'success' ? 'rgba(16, 185, 129, 0.3)' : 'rgba(239, 68, 68, 0.3)'}`,
                }}>
                  {feedback[order.id].type === 'success' ? <CheckCircle2 size={16} /> : <AlertCircle size={16} />}
                  <span>{feedback[order.id].msg}</span>
                </div>
              )}
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
