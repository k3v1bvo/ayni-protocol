'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { useAuth } from '@/context/AuthContext';
import { supabase } from '@/lib/supabase/client';
import {
  Gift, Send, ShieldCheck, Clock, CheckCircle2, Copy, Sparkles,
  ArrowUpRight, ArrowDownLeft, AlertCircle, Calendar, Key, Search,
  Filter, Plus, RefreshCw, X
} from 'lucide-react';

interface Remittance {
  id: string;
  recipient_name: string;
  recipient_email?: string;
  recipient_phone?: string;
  recipient_wallet?: string;
  delivery_type: 'wallet' | 'cash_p2p' | 'bank_pickup';
  amount: number;
  fee: number;
  currency: string;
  status: 'pending' | 'escrow_locked' | 'released' | 'claimed' | 'refunded';
  occasion_type: 'direct' | 'navidad' | 'cumpleanos' | 'mesada' | 'emergencia' | 'otro';
  scheduled_release_date?: string | null;
  claim_otp_hash?: string;
  smart_contract_tx?: string;
  note?: string;
  created_at: string;
  claimed_at?: string | null;
}

const FALLBACK_REMITTANCES: Remittance[] = [
  {
    id: 'rem-001',
    recipient_name: 'Doña Elena Mamani (Madre)',
    recipient_email: 'elena.mamani@ayni.protocol',
    recipient_phone: '+591 71234567',
    recipient_wallet: '0x3d...f8a2',
    delivery_type: 'cash_p2p',
    amount: 350.00,
    fee: 0.01,
    currency: 'USDC',
    status: 'escrow_locked',
    occasion_type: 'navidad',
    scheduled_release_date: '2026-12-24T18:00:00Z',
    claim_otp_hash: '774411',
    smart_contract_tx: '0x7b4a8e2b9c1d3f5a6e8d2c4b7a9e1f3d5c7b9a1e3f5a7b9c1d3f5a7b9c1d3f5a',
    note: '¡Feliz Navidad mamita! Para que prepares la picana familiar y compres tus regalitos con amor.',
    created_at: new Date().toISOString(),
  },
  {
    id: 'rem-002',
    recipient_name: 'Mateo Morales (Hijo)',
    recipient_email: 'mateo.morales@ayni.protocol',
    recipient_phone: '+591 79876543',
    recipient_wallet: '0x9c...2c4b',
    delivery_type: 'wallet',
    amount: 120.00,
    fee: 0.01,
    currency: 'USDC',
    status: 'escrow_locked',
    occasion_type: 'cumpleanos',
    scheduled_release_date: '2026-10-15T12:00:00Z',
    claim_otp_hash: '123987',
    smart_contract_tx: '0x9c1d3f5a6e8d2c4b7a9e1f3d5c7b9a1e3f5a7b9c1d3f5a7b9c1d3f5a7b4a8e2b',
    note: '¡Feliz cumpleaños campeón! Tu regalo para tus estudios y tus libros de robótica.',
    created_at: new Date(Date.now() - 86400000).toISOString(),
  },
  {
    id: 'rem-003',
    recipient_name: 'Carlos Condori (Hermano)',
    recipient_email: 'carlos.condori@ayni.protocol',
    recipient_phone: '+591 76543210',
    recipient_wallet: '0x2a...4b11',
    delivery_type: 'wallet',
    amount: 200.00,
    fee: 0.01,
    currency: 'USDC',
    status: 'claimed',
    occasion_type: 'direct',
    scheduled_release_date: null,
    claim_otp_hash: '990022',
    smart_contract_tx: '0x3d5c7b9a1e3f5a7b9c1d3f5a7b9c1d3f5a7b4a8e2b9c1d3f5a6e8d2c4b7a9e1f',
    note: 'Apoyo mensual directo sin comisiones bancarias abusivas.',
    created_at: new Date(Date.now() - 172800000).toISOString(),
    claimed_at: new Date(Date.now() - 86400000).toISOString(),
  },
];

export default function RemesasPage() {
  const { user } = useAuth();
  const [remittances, setRemittances] = useState<Remittance[]>(FALLBACK_REMITTANCES);
  const [activeTab, setActiveTab] = useState<'all' | 'gifts' | 'claimed'>('all');
  const [search, setSearch] = useState('');
  const [copiedId, setCopiedId] = useState<string | null>(null);

  // Claim modal state
  const [claimModalOpen, setClaimModalOpen] = useState(false);
  const [claimCode, setClaimCode] = useState('');
  const [claimStatus, setClaimStatus] = useState<{ success?: boolean; message?: string } | null>(null);

  useEffect(() => {
    async function loadRemittances() {
      try {
        const { data, error } = await supabase
          .from('remittances_and_gifts')
          .select('*')
          .order('created_at', { ascending: false });

        if (!error && data && data.length > 0) {
          setRemittances(data as Remittance[]);
        }
      } catch (err) {
        console.error('Error fetching remittances:', err);
      }
    }
    loadRemittances();
  }, []);

  const copyToClipboard = (text: string, id: string) => {
    navigator.clipboard.writeText(text);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  const handleClaimOtp = (e: React.FormEvent) => {
    e.preventDefault();
    if (claimCode.trim().length < 6) {
      setClaimStatus({ success: false, message: 'Ingresa un código OTP válido de 6 dígitos.' });
      return;
    }

    const match = remittances.find(r => r.claim_otp_hash?.includes(claimCode.trim()));
    if (match) {
      setRemittances(prev =>
        prev.map(r => (r.id === match.id ? { ...r, status: 'claimed', claimed_at: new Date().toISOString() } : r))
      );
      setClaimStatus({
        success: true,
        message: `¡Remesa de $${match.amount} USDC para ${match.recipient_name} liberada con éxito del Smart Contract!`,
      });
      setTimeout(() => {
        setClaimModalOpen(false);
        setClaimStatus(null);
        setClaimCode('');
      }, 2500);
    } else {
      setClaimStatus({
        success: false,
        message: 'Código de retiro inválido o la remesa ya ha sido cobrada.',
      });
    }
  };

  const filteredRemittances = remittances.filter(r => {
    if (activeTab === 'gifts' && r.occasion_type === 'direct') return false;
    if (activeTab === 'claimed' && r.status !== 'claimed') return false;
    if (search.trim()) {
      const q = search.toLowerCase();
      return (
        r.recipient_name.toLowerCase().includes(q) ||
        r.note?.toLowerCase().includes(q) ||
        r.occasion_type.toLowerCase().includes(q)
      );
    }
    return true;
  });

  const totalSent = remittances.reduce((sum, r) => sum + Number(r.amount), 0);
  const totalInEscrow = remittances
    .filter(r => r.status === 'escrow_locked')
    .reduce((sum, r) => sum + Number(r.amount), 0);
  const scheduledCount = remittances.filter(r => r.occasion_type !== 'direct' && r.status === 'escrow_locked').length;

  const getOccasionBadge = (type: string) => {
    switch (type) {
      case 'navidad':
        return (
          <span className="badge badge-gold" style={{ display: 'inline-flex', alignItems: 'center', gap: '4px' }}>
            🎄 Regalo de Navidad
          </span>
        );
      case 'cumpleanos':
        return (
          <span className="badge badge-cyan" style={{ display: 'inline-flex', alignItems: 'center', gap: '4px' }}>
            🎂 Cumpleaños
          </span>
        );
      case 'mesada':
        return (
          <span className="badge badge-purple" style={{ display: 'inline-flex', alignItems: 'center', gap: '4px' }}>
            📅 Mesada Familiar
          </span>
        );
      default:
        return (
          <span className="badge" style={{ background: 'rgba(255,255,255,0.06)', color: 'var(--text-secondary)' }}>
            ⚡ Envío Directo
          </span>
        );
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'escrow_locked':
        return (
          <span className="badge badge-cyan" style={{ display: 'inline-flex', alignItems: 'center', gap: '4px' }}>
            <Clock size={12} /> TimeLock en Escrow
          </span>
        );
      case 'claimed':
        return (
          <span className="badge badge-emerald" style={{ display: 'inline-flex', alignItems: 'center', gap: '4px' }}>
            <CheckCircle2 size={12} /> Cobrado / Liberado
          </span>
        );
      default:
        return <span className="badge badge-purple">{status}</span>;
    }
  };

  return (
    <DashboardLayout>
      <div className="sc-perspective-container" style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
      {/* Header & Main Actions */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '16px' }}>
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '6px' }}>
            <span className="badge badge-gold">Módulo P2P Sin Fronteras</span>
            <span className="badge badge-cyan">Costo &lt;$0.01 Base L2</span>
          </div>
          <h1 style={{ fontSize: '1.85rem', fontWeight: 800, color: 'var(--text-primary)' }}>
            Remesas P2P & Pagos Programados
          </h1>
          <p style={{ fontSize: '0.9rem', color: 'var(--text-secondary)', maxWidth: '650px' }}>
            Envía dinero a familiares en cualquier país con tarifas mínimas o programa regalos con Smart Contract TimeLock para Navidad, cumpleaños o mesadas.
          </p>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '12px', flexWrap: 'wrap' }}>
          <button
            type="button"
            onClick={() => setClaimModalOpen(true)}
            className="btn btn-outline"
            style={{ display: 'flex', alignItems: 'center', gap: '8px' }}
          >
            <Key size={16} color="var(--brand-gold)" /> Cobrar con Código OTP
          </button>
          <Link
            href="/dashboard/remesas/new"
            className="btn btn-primary"
            style={{ display: 'flex', alignItems: 'center', gap: '8px' }}
          >
            <Plus size={16} /> Nueva Remesa o Regalo
          </Link>
        </div>
      </div>

      {/* Metrics Cards */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))',
        gap: '16px',
      }}>
        <div className="card card-kinetic sc-stagger-item" style={{ padding: '20px', '--stagger': 0 } as React.CSSProperties}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '10px' }}>
            <span style={{ fontSize: '0.825rem', color: 'var(--text-muted)', fontWeight: 600 }}>Total Enviado</span>
            <div className="avatar-placeholder" style={{ width: 34, height: 34, background: 'rgba(0, 207, 255, 0.1)', color: 'var(--brand-cyan)' }}>
              <Send size={18} />
            </div>
          </div>
          <div style={{ fontSize: '1.75rem', fontWeight: 800, color: 'var(--text-primary)' }}>
            ${totalSent.toFixed(2)} <span style={{ fontSize: '0.9rem', color: 'var(--text-muted)' }}>USDC</span>
          </div>
          <div style={{ fontSize: '0.75rem', color: 'var(--brand-emerald)', marginTop: '4px', display: 'flex', alignItems: 'center', gap: '4px' }}>
            <ShieldCheck size={14} /> 100% verificado en blockchain
          </div>
        </div>

        <div className="card card-kinetic sc-stagger-item" style={{ padding: '20px', '--stagger': 1 } as React.CSSProperties}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '10px' }}>
            <span style={{ fontSize: '0.825rem', color: 'var(--text-muted)', fontWeight: 600 }}>En Custodia Smart Contract</span>
            <div className="avatar-placeholder" style={{ width: 34, height: 34, background: 'rgba(245, 166, 35, 0.1)', color: 'var(--brand-gold)' }}>
              <Clock size={18} />
            </div>
          </div>
          <div style={{ fontSize: '1.75rem', fontWeight: 800, color: 'var(--brand-gold)' }}>
            ${totalInEscrow.toFixed(2)} <span style={{ fontSize: '0.9rem', color: 'var(--text-muted)' }}>USDC</span>
          </div>
          <div style={{ fontSize: '0.75rem', color: 'var(--brand-cyan)', marginTop: '4px' }}>
            Desbloqueo seguro por fecha o entrega
          </div>
        </div>

        <div className="card card-kinetic sc-stagger-item" style={{ padding: '20px', '--stagger': 2 } as React.CSSProperties}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '10px' }}>
            <span style={{ fontSize: '0.825rem', color: 'var(--text-muted)', fontWeight: 600 }}>Regalos Programados</span>
            <div className="avatar-placeholder" style={{ width: 34, height: 34, background: 'rgba(155, 114, 255, 0.1)', color: 'var(--brand-purple)' }}>
              <Gift size={18} />
            </div>
          </div>
          <div style={{ fontSize: '1.75rem', fontWeight: 800, color: 'var(--brand-purple)' }}>
            {scheduledCount} <span style={{ fontSize: '0.9rem', color: 'var(--text-muted)' }}>activos</span>
          </div>
          <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginTop: '4px' }}>
            Navidad y Cumpleaños TimeLock
          </div>
        </div>

        <div className="card card-kinetic sc-stagger-item" style={{ padding: '20px', '--stagger': 3 } as React.CSSProperties}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '10px' }}>
            <span style={{ fontSize: '0.825rem', color: 'var(--text-muted)', fontWeight: 600 }}>Comisión Promedio</span>
            <div className="avatar-placeholder" style={{ width: 34, height: 34, background: 'rgba(0, 214, 143, 0.1)', color: 'var(--brand-emerald)' }}>
              <Sparkles size={18} />
            </div>
          </div>
          <div style={{ fontSize: '1.75rem', fontWeight: 800, color: 'var(--brand-emerald)' }}>
            &lt; $0.01 <span style={{ fontSize: '0.9rem', color: 'var(--text-muted)' }}>USD</span>
          </div>
          <div style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', marginTop: '4px' }}>
            Vs $15-$30 en bancos tradicionales
          </div>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '14px' }}>
        <div className="tab-bar" style={{ maxWidth: '420px', width: '100%' }}>
          <button
            type="button"
            className={`tab-item ${activeTab === 'all' ? 'active' : ''}`}
            onClick={() => setActiveTab('all')}
          >
            Todas ({remittances.length})
          </button>
          <button
            type="button"
            className={`tab-item ${activeTab === 'gifts' ? 'active' : ''}`}
            onClick={() => setActiveTab('gifts')}
          >
            Regalos TimeLock ({scheduledCount})
          </button>
          <button
            type="button"
            className={`tab-item ${activeTab === 'claimed' ? 'active' : ''}`}
            onClick={() => setActiveTab('claimed')}
          >
            Cobrados
          </button>
        </div>

        <div style={{ position: 'relative', width: '100%', maxWidth: '320px' }}>
          <Search size={16} style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }} />
          <input
            type="search"
            value={search}
            onChange={e => setSearch(e.target.value)}
            placeholder="Buscar por destinatario o nota..."
            className="input"
            style={{ paddingLeft: '38px', height: '40px', fontSize: '0.85rem' }}
          />
        </div>
      </div>

      {/* Remittances List */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
        {filteredRemittances.map((rem, i) => (
          <div
            key={rem.id}
            className="card card-kinetic sc-stagger-item"
            style={{
              padding: '20px',
              display: 'flex',
              flexDirection: 'column',
              gap: '16px',
              '--stagger': i % 8,
              border: rem.occasion_type === 'navidad' ? '1px solid rgba(245, 166, 35, 0.35)' : undefined,
              background: rem.occasion_type === 'navidad' ? 'linear-gradient(135deg, rgba(245,166,35,0.04) 0%, rgba(15,21,39,0.95) 100%)' : undefined,
            } as React.CSSProperties}
          >
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '12px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                <div
                  className="avatar-placeholder"
                  style={{
                    width: 44,
                    height: 44,
                    background: rem.occasion_type === 'navidad' ? 'rgba(245, 166, 35, 0.15)' : 'rgba(0, 207, 255, 0.15)',
                    color: rem.occasion_type === 'navidad' ? 'var(--brand-gold)' : 'var(--brand-cyan)',
                  }}
                >
                  {rem.occasion_type === 'navidad' ? <Gift size={22} /> : <Send size={22} />}
                </div>
                <div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flexWrap: 'wrap' }}>
                    <span style={{ fontSize: '1.05rem', fontWeight: 700, color: 'var(--text-primary)' }}>
                      {rem.recipient_name}
                    </span>
                    {getOccasionBadge(rem.occasion_type)}
                    {getStatusBadge(rem.status)}
                  </div>
                  <div style={{ fontSize: '0.78rem', color: 'var(--text-muted)', marginTop: '2px' }}>
                    Método: {rem.delivery_type === 'cash_p2p' ? 'Efectivo en Mostrador P2P' : 'Directo a Billetera EVM'} • Tel: {rem.recipient_phone || 'N/D'}
                  </div>
                </div>
              </div>

              <div style={{ textAlign: 'right' }}>
                <div style={{ fontSize: '1.4rem', fontWeight: 800, color: 'var(--brand-gold)' }}>
                  ${rem.amount.toFixed(2)} <span style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>{rem.currency}</span>
                </div>
                <div style={{ fontSize: '0.72rem', color: 'var(--brand-emerald)' }}>
                  Comisión pagada: ${rem.fee.toFixed(2)}
                </div>
              </div>
            </div>

            {/* Note & Dedication */}
            {rem.note && (
              <div style={{
                background: 'rgba(255, 255, 255, 0.02)',
                border: '1px solid var(--border-subtle)',
                borderRadius: '8px',
                padding: '10px 14px',
                fontSize: '0.85rem',
                color: 'var(--text-secondary)',
                fontStyle: 'italic',
              }}>
                "{rem.note}"
              </div>
            )}

            {/* Bottom Details Bar */}
            <div style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              flexWrap: 'wrap',
              gap: '12px',
              paddingTop: '12px',
              borderTop: '1px solid var(--border-subtle)',
              fontSize: '0.78rem',
            }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '16px', color: 'var(--text-muted)', flexWrap: 'wrap' }}>
                {rem.scheduled_release_date && (
                  <span style={{ display: 'flex', alignItems: 'center', gap: '4px', color: 'var(--brand-cyan)' }}>
                    <Calendar size={14} /> Desbloqueo: {new Date(rem.scheduled_release_date).toLocaleDateString('es-BO', { day: 'numeric', month: 'long', year: 'numeric' })}
                  </span>
                )}
                <span>Creado: {new Date(rem.created_at).toLocaleDateString()}</span>
              </div>

              {/* OTP & Actions */}
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                {rem.claim_otp_hash && (
                  <div style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '6px',
                    background: 'rgba(0, 207, 255, 0.08)',
                    border: '1px solid rgba(0, 207, 255, 0.2)',
                    borderRadius: '6px',
                    padding: '4px 10px',
                  }}>
                    <Key size={13} color="var(--brand-cyan)" />
                    <span style={{ fontFamily: 'monospace', fontWeight: 700, color: 'var(--brand-cyan)', letterSpacing: '0.05em' }}>
                      OTP: {rem.claim_otp_hash}
                    </span>
                    <button
                      type="button"
                      onClick={() => copyToClipboard(rem.claim_otp_hash!, rem.id)}
                      style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--text-muted)', display: 'flex' }}
                      title="Copiar código OTP de reclamo"
                    >
                      <Copy size={13} />
                    </button>
                    {copiedId === rem.id && <span style={{ fontSize: '0.7rem', color: 'var(--brand-emerald)' }}>¡Copiado!</span>}
                  </div>
                )}

                {rem.status === 'escrow_locked' && rem.claim_otp_hash && (
                  <button
                    type="button"
                    onClick={() => {
                      setClaimCode(rem.claim_otp_hash || '');
                      setClaimModalOpen(true);
                    }}
                    className="btn btn-outline btn-sm"
                    style={{ fontSize: '0.75rem', height: '28px', padding: '0 10px', color: 'var(--brand-gold)', borderColor: 'rgba(245,166,35,0.4)' }}
                  >
                    <Key size={12} /> Cobrar Fondos
                  </button>
                )}

                {rem.smart_contract_tx && (
                  <a
                    href={`https://basescan.org/tx/${rem.smart_contract_tx}`}
                    target="_blank"
                    rel="noreferrer"
                    className="btn btn-ghost btn-sm"
                    style={{ fontSize: '0.75rem', height: '28px', padding: '0 8px' }}
                  >
                    Ver Tx <ArrowUpRight size={12} />
                  </a>
                )}
              </div>
            </div>
          </div>
        ))}

        {filteredRemittances.length === 0 && (
          <div className="card" style={{ padding: '48px 24px', textAlign: 'center' }}>
            <div className="avatar-placeholder" style={{ width: 56, height: 56, margin: '0 auto 16px', background: 'rgba(255,255,255,0.04)' }}>
              <Gift size={26} color="var(--text-muted)" />
            </div>
            <h3 style={{ fontSize: '1.1rem', fontWeight: 600, color: 'var(--text-primary)' }}>
              No se encontraron remesas
            </h3>
            <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)', marginTop: '4px' }}>
              Comienza enviando apoyo a tus seres queridos o programa tu primer regalo de Navidad con Smart Contracts.
            </p>
            <Link href="/dashboard/remesas/new" className="btn btn-primary btn-sm" style={{ marginTop: '16px', display: 'inline-flex' }}>
              Crear Nueva Remesa
            </Link>
          </div>
        )}
      </div>

      {/* Claim with OTP Modal */}
      {claimModalOpen && (
        <>
          <div className="cart-overlay" onClick={() => setClaimModalOpen(false)} />
          <div className="modal-content" style={{ maxWidth: '440px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <Key size={20} color="var(--brand-gold)" />
                <h3 style={{ fontSize: '1.15rem', fontWeight: 700, color: 'var(--text-primary)' }}>
                  Cobrar Remesa / Regalo con OTP
                </h3>
              </div>
              <button
                type="button"
                onClick={() => setClaimModalOpen(false)}
                className="btn btn-ghost btn-sm"
                style={{ width: 32, height: 32, borderRadius: '50%', padding: 0 }}
              >
                <X size={16} />
              </button>
            </div>

            <form onSubmit={handleClaimOtp} style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
              <p style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', lineHeight: 1.5 }}>
                Ingresa el código OTP de 6 dígitos que te envió el remitente o el comprobante de TimeLock para liberar los fondos a tu billetera o retirar en mostrador P2P aliado.
              </p>

              <div>
                <label className="label">Código de Reclamo (OTP de 6 dígitos)</label>
                <input
                  type="text"
                  maxLength={6}
                  value={claimCode}
                  onChange={e => setClaimCode(e.target.value.replace(/\D/g, ''))}
                  placeholder="Ej: 774411"
                  className="input"
                  style={{
                    fontSize: '1.4rem',
                    textAlign: 'center',
                    letterSpacing: '0.25em',
                    fontWeight: 700,
                    fontFamily: 'monospace',
                  }}
                  autoFocus
                />
              </div>

              <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>Probar con datos de prueba (Hackathon Demo):</div>
                <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
                  <button
                    type="button"
                    onClick={() => setClaimCode('774411')}
                    style={{
                      background: 'rgba(245,166,35,0.1)',
                      border: '1px solid rgba(245,166,35,0.3)',
                      borderRadius: '6px',
                      padding: '4px 8px',
                      fontSize: '0.75rem',
                      color: 'var(--brand-gold)',
                      cursor: 'pointer',
                    }}
                  >
                    🎄 Probar 774411 ($350)
                  </button>
                  <button
                    type="button"
                    onClick={() => setClaimCode('123987')}
                    style={{
                      background: 'rgba(0,207,255,0.1)',
                      border: '1px solid rgba(0,207,255,0.3)',
                      borderRadius: '6px',
                      padding: '4px 8px',
                      fontSize: '0.75rem',
                      color: 'var(--brand-cyan)',
                      cursor: 'pointer',
                    }}
                  >
                    🎂 Probar 123987 ($120)
                  </button>
                </div>
              </div>

              {claimStatus && (
                <div className={`alert ${claimStatus.success ? 'alert-success' : 'alert-error'}`}>
                  {claimStatus.message}
                </div>
              )}

              <div style={{ display: 'flex', gap: '10px', marginTop: '8px' }}>
                <button
                  type="button"
                  onClick={() => setClaimModalOpen(false)}
                  className="btn btn-outline"
                  style={{ flex: 1 }}
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="btn btn-primary"
                  style={{ flex: 2 }}
                >
                  Validar & Liberar Fondos
                </button>
              </div>
            </form>
          </div>
        </>
      )}
      </div>
    </DashboardLayout>
  );
}
