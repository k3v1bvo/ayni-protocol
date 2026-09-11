'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { useParams, useRouter } from 'next/navigation';
import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { 
  Package, Truck, Plane, MapPin, CheckCircle2, Clock, 
  ShieldCheck, AlertTriangle, Key, Copy, Check, ArrowLeft,
  Phone, User, ExternalLink, RefreshCw
} from 'lucide-react';
import { executeEscrowRelease } from '@/lib/web3/contracts';

interface TrackingState {
  orderId: string;
  orderCode: string;
  title: string;
  origin: string;
  destination: string;
  courierName: string;
  trackingNumber: string;
  currentStep: number; // 0 to 4
  amountUsdc: number;
  estimatedDelivery: string;
  otpCode?: string;
  status: 'funded' | 'in_transit' | 'delivered' | 'completed';
}

const SAMPLE_TRACKINGS: Record<string, TrackingState> = {
  'ORD-2609-001': {
    orderId: '1',
    orderCode: 'ORD-2609-001',
    title: 'Kit Implantes Dentales Titanio Grado 5',
    origin: 'Madrid, España 🇪🇸',
    destination: 'La Paz, Bolivia 🇧🇴',
    courierName: 'Red Viajero: Juan Pérez (Vuelo IB-6841)',
    trackingNumber: 'AYN-MAD-LPZ-8831',
    currentStep: 3,
    amountUsdc: 185.00,
    estimatedDelivery: '12 de Septiembre, 2026',
    otpCode: '774411',
    status: 'in_transit',
  },
  'default': {
    orderId: 'default',
    orderCode: 'ORD-2609-002',
    title: 'Manta Aguayo Jalq\'a Tejida a Mano',
    origin: 'Cochabamba, Bolivia 🇧🇴',
    destination: 'Santa Cruz, Bolivia 🇧🇴',
    courierName: 'Courier Trans Copacabana Express',
    trackingNumber: 'GUIA-TCB-992014',
    currentStep: 2,
    amountUsdc: 85.00,
    estimatedDelivery: '11 de Septiembre, 2026',
    otpCode: '123987',
    status: 'in_transit',
  }
};

export default function TrackingDetailPage() {
  const params = useParams();
  const router = useRouter();
  const orderId = (params?.orderId as string) || 'default';

  const [tracking, setTracking] = useState<TrackingState>(() => {
    return SAMPLE_TRACKINGS[orderId] || {
      ...SAMPLE_TRACKINGS['default'],
      orderCode: orderId.startsWith('ORD') ? orderId : `ORD-${orderId}`,
    };
  });

  const [otpInput, setOtpInput] = useState('');
  const [isReleasing, setIsReleasing] = useState(false);
  const [releaseSuccess, setReleaseSuccess] = useState<string | null>(null);
  const [copiedTracking, setCopiedTracking] = useState(false);

  const steps = [
    { title: 'Custodiado en Escrow', desc: 'Fondos bloqueados en Base L2' },
    { title: 'Empacado & Precintado', desc: 'Comprobante verificado con IA' },
    { title: 'Despachado en Ruta', desc: 'En custodia del courier o viajero' },
    { title: 'Llegada a Destino', desc: 'Listo para entrega física presencial' },
    { title: 'Entregado con OTP', desc: 'Pago liberado al vendedor' },
  ];

  const handleVerifyOtp = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!otpInput.trim()) return;

    setIsReleasing(true);
    const res = await executeEscrowRelease(tracking.orderCode, otpInput.trim());

    setReleaseSuccess('¡Código OTP verificado en Smart Contract! Fondos liberados al transportista.');
    setTracking(prev => ({
      ...prev,
      currentStep: 4,
      status: 'completed',
    }));
    setIsReleasing(false);
  };

  const copyTrackingNumber = () => {
    navigator.clipboard.writeText(tracking.trackingNumber);
    setCopiedTracking(true);
    setTimeout(() => setCopiedTracking(false), 2000);
  };

  return (
    <DashboardLayout>
      <div style={{ maxWidth: '800px', margin: '0 auto' }}>
        {/* Back navigation */}
        <Link 
          href="/dashboard/orders" 
          className="btn btn-ghost btn-sm" 
          style={{ marginBottom: '16px', display: 'inline-flex', alignItems: 'center', gap: '6px' }}
        >
          <ArrowLeft size={14} /> Volver a Mis Pedidos
        </Link>

        {/* Header Card */}
        <div className="card" style={{ padding: '24px', marginBottom: '24px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '12px' }}>
            <div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '4px' }}>
                <span style={{ fontFamily: 'monospace', fontWeight: 800, color: 'var(--brand-cyan)', fontSize: '0.95rem' }}>
                  {tracking.orderCode}
                </span>
                <span className="badge badge-cyan" style={{ fontSize: '0.72rem' }}>
                  Tracking en Tiempo Real
                </span>
              </div>
              <h2 style={{ fontSize: '1.3rem', fontWeight: 800, margin: '0 0 6px', color: 'var(--text-primary)' }}>
                {tracking.title}
              </h2>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '0.85rem', color: 'var(--text-muted)' }}>
                <span>Ruta: <strong>{tracking.origin}</strong></span>
                <span>➔</span>
                <span style={{ color: 'var(--brand-emerald)' }}><strong>{tracking.destination}</strong></span>
              </div>
            </div>

            <div style={{ textAlign: 'right' }}>
              <div style={{ fontSize: '1.35rem', fontWeight: 800, color: 'var(--brand-gold)', fontFamily: 'var(--font-display)' }}>
                ${tracking.amountUsdc.toFixed(2)} USDC
              </div>
              <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>En custodia de Smart Contract</div>
            </div>
          </div>
        </div>

        {/* Interactive Timeline */}
        <div className="card" style={{ padding: '28px', marginBottom: '24px' }}>
          <h3 style={{ fontSize: '1.05rem', fontWeight: 700, marginBottom: '24px', display: 'flex', alignItems: 'center', gap: '8px' }}>
            <Truck size={18} color="var(--brand-cyan)" /> Estado del Envío Departamental
          </h3>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '20px', position: 'relative' }}>
            {steps.map((s, idx) => {
              const isDone = idx < tracking.currentStep;
              const isCurrent = idx === tracking.currentStep;
              return (
                <div key={idx} style={{ display: 'flex', gap: '16px', position: 'relative' }}>
                  {/* Step icon */}
                  <div style={{
                    width: 36,
                    height: 36,
                    borderRadius: '50%',
                    background: isDone 
                      ? 'rgba(0,214,143,0.15)' 
                      : isCurrent 
                        ? 'rgba(0,207,255,0.2)' 
                        : 'rgba(255,255,255,0.04)',
                    border: isDone 
                      ? '2px solid var(--brand-emerald)' 
                      : isCurrent 
                        ? '2px solid var(--brand-cyan)' 
                        : '1px solid var(--border-default)',
                    color: isDone ? 'var(--brand-emerald)' : isCurrent ? 'var(--brand-cyan)' : 'var(--text-muted)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    flexShrink: 0,
                    zIndex: 2,
                  }}>
                    {isDone ? <Check size={18} /> : <span>{idx + 1}</span>}
                  </div>

                  {/* Connecting Line */}
                  {idx < steps.length - 1 && (
                    <div style={{
                      position: 'absolute',
                      left: 17,
                      top: 36,
                      width: 2,
                      height: 20,
                      background: idx < tracking.currentStep ? 'var(--brand-emerald)' : 'var(--border-subtle)',
                      zIndex: 1,
                    }} />
                  )}

                  <div style={{ flex: 1 }}>
                    <div style={{ 
                      fontWeight: isCurrent ? 700 : 600, 
                      fontSize: '0.92rem', 
                      color: isDone ? 'var(--brand-emerald)' : isCurrent ? 'var(--brand-cyan)' : 'var(--text-secondary)' 
                    }}>
                      {s.title} {isCurrent && <span className="badge badge-cyan" style={{ fontSize: '0.65rem', marginLeft: '6px' }}>En curso</span>}
                    </div>
                    <div style={{ fontSize: '0.78rem', color: 'var(--text-muted)', marginTop: '2px' }}>
                      {s.desc}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Courier Info & OTP Verification */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: '20px', marginBottom: '24px' }}>
          {/* Courier Details */}
          <div className="card" style={{ padding: '20px' }}>
            <h4 style={{ fontSize: '0.95rem', fontWeight: 700, marginBottom: '14px', color: 'var(--text-primary)' }}>
              Detalles del Transportista / Guía
            </h4>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '10px', fontSize: '0.84rem' }}>
              <div>
                <span style={{ color: 'var(--text-muted)' }}>Operador Logístico:</span>
                <div style={{ fontWeight: 600, marginTop: '2px' }}>{tracking.courierName}</div>
              </div>
              <div>
                <span style={{ color: 'var(--text-muted)' }}>Número de Guía Oficial:</span>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginTop: '2px' }}>
                  <span style={{ fontFamily: 'monospace', color: 'var(--brand-cyan)', fontWeight: 700 }}>
                    {tracking.trackingNumber}
                  </span>
                  <button type="button" onClick={copyTrackingNumber} className="btn btn-ghost btn-sm" style={{ padding: '2px 6px' }}>
                    {copiedTracking ? <Check size={12} color="var(--brand-emerald)" /> : <Copy size={12} />}
                  </button>
                </div>
              </div>
              <div>
                <span style={{ color: 'var(--text-muted)' }}>Entrega Estimada:</span>
                <div style={{ fontWeight: 600, marginTop: '2px' }}>{tracking.estimatedDelivery}</div>
              </div>
            </div>
          </div>

          {/* OTP Release Action Box */}
          <div className="card" style={{ padding: '20px', border: '1px solid rgba(0,207,255,0.25)' }}>
            <h4 style={{ fontSize: '0.95rem', fontWeight: 700, marginBottom: '8px', color: 'var(--brand-cyan)', display: 'flex', alignItems: 'center', gap: '6px' }}>
              <Key size={16} /> Confirmar Entrega Física (OTP)
            </h4>
            <p style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', marginBottom: '14px', lineHeight: 1.4 }}>
              Cuando el transportista o viajero te entregue el producto físico conforme, ingresa el código OTP para liberar los fondos retenidos en Base L2.
            </p>

            {tracking.otpCode && (
              <div style={{ background: 'rgba(245,166,35,0.08)', padding: '8px 12px', borderRadius: '8px', marginBottom: '12px', fontSize: '0.78rem', color: 'var(--brand-gold)' }}>
                🧪 <strong>Tu código OTP:</strong> {tracking.otpCode}
              </div>
            )}

            {releaseSuccess ? (
              <div className="alert alert-success animate-spring-check" style={{ fontSize: '0.82rem', padding: '14px' }}>
                <CheckCircle2 size={18} /> {releaseSuccess}
              </div>
            ) : (
              <form onSubmit={handleVerifyOtp} style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
                <input
                  type="text"
                  maxLength={6}
                  required
                  placeholder="Código OTP (6 dígitos)"
                  value={otpInput}
                  onChange={e => setOtpInput(e.target.value.replace(/\s+/g, ''))}
                  className="input input-interactive"
                  style={{ fontFamily: 'monospace', letterSpacing: '4px', textAlign: 'center', fontSize: '1.15rem', flex: '1 1 160px', height: '46px' }}
                />
                <button
                  type="submit"
                  disabled={isReleasing}
                  className="btn btn-tangem-glow btn-pressable"
                  style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '6px', flex: '1 1 140px', height: '46px' }}
                >
                  {isReleasing ? <RefreshCw size={15} className="spin" /> : <ShieldCheck size={15} />}
                  Liberar en Base L2
                </button>
              </form>
            )}

            <div style={{ marginTop: '14px', paddingTop: '10px', borderTop: '1px solid var(--border-subtle)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <span style={{ fontSize: '0.72rem', color: 'var(--text-muted)' }}>¿Problemas con el paquete?</span>
              <Link href="/dashboard/disputes" style={{ fontSize: '0.75rem', color: '#ef4444', textDecoration: 'none', fontWeight: 600 }}>
                Abrir Disputa
              </Link>
            </div>
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
}
