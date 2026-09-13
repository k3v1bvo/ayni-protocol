'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { useAuth } from '@/context/AuthContext';
import {
  ShieldAlert, ShieldCheck, Scale, AlertTriangle, CheckCircle2,
  Clock, ArrowRight, Eye, MessageSquare, FileText, Check, X,
  ExternalLink, Sparkles, RefreshCw, UploadCloud, User
} from 'lucide-react';

interface DisputeItem {
  id: string;
  order_id: string;
  order_title: string;
  client_name: string;
  traveler_name: string;
  amount_usd: number;
  reason: string;
  evidence_description: string;
  evidence_images: string[];
  status: 'open' | 'investigating' | 'resolved_refund' | 'resolved_release' | 'resolved_split';
  created_at: string;
  resolved_at?: string;
  resolution_notes?: string;
  arbitrator_name?: string;
  smart_contract_tx?: string;
}

const INITIAL_DISPUTES: DisputeItem[] = [
  {
    id: 'DISP-001',
    order_id: 'ORD-2609-003',
    order_title: 'Manta Aguayo Jalq\'a Original (100% Lana)',
    client_name: 'Mateo Morales',
    traveler_name: 'Alejandro Vargas',
    amount_usd: 85.00,
    reason: 'Producto con rasgadura visible en el borde lateral',
    evidence_description: 'Al abrir el paquete frente al transportista, se evidencia rasgadura en la costura artesanal izquierda. El viajero afirma que venía así de la tienda.',
    evidence_images: ['https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=400&h=300&fit=crop&q=80'],
    status: 'open',
    created_at: '2026-09-09T16:30:00Z',
    smart_contract_tx: '0x9b4a1e3f5a7b9c1d3f5a7b9c1d3f5a7b9c1d3f5a7b4a8e2b9c1d3f5a6e8d2c4b',
  },
  {
    id: 'DISP-002',
    order_id: 'ORD-2609-005',
    order_title: 'Implante Dental Titanio Grado 5',
    client_name: 'Dr. Fernando Rocha',
    traveler_name: 'Elena Quispe',
    amount_usd: 185.00,
    reason: 'Empaque secundario esterilizado con sello violentado',
    evidence_description: 'El blister exterior tiene una rotura en el precinto térmico. Por normativa médica odontológica no se puede implantar.',
    evidence_images: ['https://images.unsplash.com/photo-1559757175-5700dde675bc?w=400&h=300&fit=crop&q=80'],
    status: 'investigating',
    created_at: '2026-09-08T11:15:00Z',
    smart_contract_tx: '0x3c7e9a1b5d2f4a6c8e0b2d4f6a8c0e2b4d6f8a0c2e4b6d8f0a2c4e6b8d0f2a4c',
  },
  {
    id: 'DISP-003',
    order_id: 'ORD-2609-001',
    order_title: 'Lente Canon EF 50mm f/1.8 STM',
    client_name: 'Carla Mendoza',
    traveler_name: 'Rodrigo Paz',
    amount_usd: 155.00,
    reason: 'Retraso de más de 8 días sin aviso del viajero',
    evidence_description: 'El viajero perdió el vuelo original y reprogramó sin coordinar. El comprador ya compró un reemplazo de emergencia.',
    evidence_images: ['https://images.unsplash.com/photo-1606983340126-99ab4feaa64a?w=400&h=300&fit=crop&q=80'],
    status: 'resolved_refund',
    created_at: '2026-09-05T09:00:00Z',
    resolved_at: '2026-09-06T14:20:00Z',
    resolution_notes: 'Reembolso total al comprador. Viajero conservó el producto para retornarlo a la tienda en Madrid.',
    arbitrator_name: 'DAO AYNI Arbitraje L1',
    smart_contract_tx: '0x1d4a8e2b9c1d3f5a6e8d2c4b7a9e1f3d5c7b9a1e3f5a7b9c1d3f5a7b9c1d3f5a',
  },
];

export default function DisputesPage() {
  const { user, role } = useAuth();
  const [disputes, setDisputes] = useState<DisputeItem[]>(INITIAL_DISPUTES);
  const [selectedDispute, setSelectedDispute] = useState<DisputeItem | null>(null);
  const [filterStatus, setFilterStatus] = useState<string>('all');
  const [resolutionNote, setResolutionNote] = useState('');
  const [isResolving, setIsResolving] = useState(false);
  const [resolveSuccess, setResolveSuccess] = useState<string | null>(null);

  // New dispute modal state
  const [isNewDisputeOpen, setIsNewDisputeOpen] = useState(false);
  const [newOrderCode, setNewOrderCode] = useState('');
  const [newTitle, setNewTitle] = useState('');
  const [newAmount, setNewAmount] = useState('50');
  const [newReason, setNewReason] = useState('');
  const [newEvidence, setNewEvidence] = useState('');

  // AI Dispute Analysis state (Chainlink Functions + Gemini Vision)
  const [isAiAnalyzing, setIsAiAnalyzing] = useState(false);
  const [aiAuditStep, setAiAuditStep] = useState<number>(0);
  const [aiVerdict, setAiVerdict] = useState<{
    verdict: string;
    confidenceScore: string;
    rationale: string;
    oracleProvider: string;
    recommendedPayout?: { buyerAmount: number; sellerAmount: number };
    photoMatchesClaim?: boolean | null;
    photoFindings?: string | null;
    photoAnalyzed?: boolean;
    attestationHash?: string;
    oracleModel?: string;
    executionTimeMs?: number;
    timestamp?: string;
  } | null>(null);

  const handleRunAiAudit = async () => {
    if (!selectedDispute) return;
    setIsAiAnalyzing(true);
    setAiAuditStep(1);

    const t1 = setTimeout(() => setAiAuditStep(2), 450);
    const t2 = setTimeout(() => setAiAuditStep(3), 950);

    try {
      const res = await fetch('/api/disputes/ai-analyze', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          order_id: selectedDispute.order_id,
          dispute_reason: selectedDispute.reason,
          evidence_description: selectedDispute.evidence_description,
          buyer_name: selectedDispute.client_name,
          traveler_name: selectedDispute.traveler_name,
          amount_usd: selectedDispute.amount_usd,
          evidence_images: selectedDispute.evidence_images,
        }),
      });

      if (res.ok) {
        const data = await res.json();
        setAiAuditStep(4);
        setAiVerdict(data);
        const photoNote = data.photoAnalyzed
          ? ` [Peritaje Fotográfico: ${data.photoMatchesClaim ? 'Coincide con Reclamo' : 'Discrepancia'} - ${data.photoFindings || ''}]`
          : '';
        setResolutionNote(`[${data.oracleProvider}] Dictamen: ${data.rationale}${photoNote}`);
      }
    } catch (e) {
      console.error('Error running AI audit:', e);
    } finally {
      clearTimeout(t1);
      clearTimeout(t2);
      setIsAiAnalyzing(false);
    }
  };

  useEffect(() => {
    try {
      const saved = localStorage.getItem('ayni_disputes');
      if (saved) {
        setDisputes(JSON.parse(saved));
      }
    } catch {}
  }, []);

  const saveDisputes = (updated: DisputeItem[]) => {
    setDisputes(updated);
    try {
      localStorage.setItem('ayni_disputes', JSON.stringify(updated));
    } catch {}
  };

  const handleResolve = (type: 'refund' | 'release' | 'split') => {
    if (!selectedDispute) return;
    setIsResolving(true);

    const now = new Date().toISOString();
    const resolutionStatus = type === 'refund' 
      ? 'resolved_refund' 
      : type === 'release' 
        ? 'resolved_release' 
        : 'resolved_split';

    const resolutionText = type === 'refund'
      ? '100% Reembolsado al Comprador (Fondos retornados a su wallet EVM)'
      : type === 'release'
        ? '100% Liberado al Vendedor/Viajero (Se verificó entrega conforme)'
        : 'Split 50% / 50% Mediado (Compensación compartida por daño parcial)';

    const updated = disputes.map(d => {
      if (d.id === selectedDispute.id) {
        return {
          ...d,
          status: resolutionStatus as DisputeItem['status'],
          resolved_at: now,
          resolution_notes: resolutionNote.trim() || resolutionText,
          arbitrator_name: user?.full_name ? `${user.full_name} (Mediador AYNI)` : 'Comité de Arbitraje AYNI',
        };
      }
      return d;
    });

    saveDisputes(updated);
    setResolveSuccess(`¡Disputa resuelta con éxito! Decisión ejecutada en Smart Contract.`);

    setTimeout(() => {
      setIsResolving(false);
      setResolveSuccess(null);
      setSelectedDispute(null);
      setResolutionNote('');
    }, 1500);
  };

  const handleCreateDispute = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newReason.trim()) return;

    const newDisp: DisputeItem = {
      id: `DISP-${Date.now().toString().slice(-4)}`,
      order_id: newOrderCode.trim() || `ORD-${Date.now().toString(36).toUpperCase()}`,
      order_title: newTitle.trim() || 'Encargo Internacional',
      client_name: user?.full_name || 'Comprador Acreditado',
      traveler_name: 'Viajero en Ruta',
      amount_usd: parseFloat(newAmount) || 50,
      reason: newReason.trim(),
      evidence_description: newEvidence.trim() || 'Fotografías y comprobantes adjuntados por el usuario.',
      evidence_images: ['https://images.unsplash.com/photo-1579541814924-49fef17c5be5?w=400&h=300&fit=crop&q=80'],
      status: 'open',
      created_at: new Date().toISOString(),
      smart_contract_tx: '0x' + Array.from({ length: 64 }, () => Math.floor(Math.random() * 16).toString(16)).join(''),
    };

    const updated = [newDisp, ...disputes];
    saveDisputes(updated);
    setIsNewDisputeOpen(false);
    setNewReason('');
    setNewEvidence('');
  };

  const filteredDisputes = disputes.filter(d => {
    if (filterStatus === 'all') return true;
    if (filterStatus === 'active') return d.status === 'open' || d.status === 'investigating';
    if (filterStatus === 'resolved') return d.status.startsWith('resolved');
    return d.status === filterStatus;
  });

  const openCount = disputes.filter(d => d.status === 'open' || d.status === 'investigating').length;
  const lockedEscrow = disputes
    .filter(d => d.status === 'open' || d.status === 'investigating')
    .reduce((acc, d) => acc + d.amount_usd, 0);

  return (
    <DashboardLayout>
      {/* Header */}
      <div className="page-header" style={{ marginBottom: '24px' }}>
        <div className="page-title-group">
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '4px', flexWrap: 'wrap' }}>
            <div className="page-title">Centro de Arbitraje & Disputas</div>
            <span className="badge badge-purple">
              <Scale size={11} /> Escrow MultiSig & Resolución Descentralizada
            </span>
          </div>
          <div className="page-subtitle">
            Protección integral para compradores, viajeros y tiendas. Cuando surge un imprevisto, los fondos se bloquean en el Smart Contract hasta su mediación imparcial.
          </div>
        </div>

        <button
          type="button"
          onClick={() => setIsNewDisputeOpen(true)}
          className="btn btn-outline"
          style={{ display: 'flex', alignItems: 'center', gap: '6px', borderColor: 'var(--border-cyan)' }}
        >
          <ShieldAlert size={16} color="var(--brand-cyan)" /> Reportar Problema en Pedido
        </button>
      </div>

      {/* Stats Cards */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '14px', marginBottom: '28px' }}>
        <div className="stat-card" style={{ '--stat-glow': 'rgba(239,68,68,0.08)' } as React.CSSProperties}>
          <div className="stat-icon" style={{ background: 'rgba(239,68,68,0.15)' }}>
            <ShieldAlert size={20} color="#ef4444" />
          </div>
          <div>
            <div className="stat-value" style={{ color: '#ef4444' }}>{openCount}</div>
            <div className="stat-label">Disputas en Mediación</div>
          </div>
        </div>

        <div className="stat-card" style={{ '--stat-glow': 'rgba(245,166,35,0.08)' } as React.CSSProperties}>
          <div className="stat-icon" style={{ background: 'rgba(245,166,35,0.15)' }}>
            <Clock size={20} color="var(--brand-gold)" />
          </div>
          <div>
            <div className="stat-value" style={{ color: 'var(--brand-gold)' }}>${lockedEscrow.toFixed(2)}</div>
            <div className="stat-label">Custodiado en Smart Contract</div>
          </div>
        </div>

        <div className="stat-card" style={{ '--stat-glow': 'rgba(0,214,143,0.08)' } as React.CSSProperties}>
          <div className="stat-icon" style={{ background: 'rgba(0,214,143,0.15)' }}>
            <CheckCircle2 size={20} color="var(--brand-emerald)" />
          </div>
          <div>
            <div className="stat-value" style={{ color: 'var(--brand-emerald)' }}>98.2%</div>
            <div className="stat-label">Resolución en &lt; 24 Horas</div>
          </div>
        </div>

        <div className="stat-card" style={{ '--stat-glow': 'rgba(155,114,255,0.08)' } as React.CSSProperties}>
          <div className="stat-icon" style={{ background: 'rgba(155,114,255,0.15)' }}>
            <Scale size={20} color="var(--brand-purple)" />
          </div>
          <div>
            <div className="stat-value" style={{ color: 'var(--brand-purple)' }}>L1 + L2</div>
            <div className="stat-label">Arbitraje Humano + DAO</div>
          </div>
        </div>
      </div>

      {/* Filter Tabs */}
      <div style={{ display: 'flex', gap: '8px', marginBottom: '20px', flexWrap: 'wrap' }}>
        {[
          { id: 'all', label: 'Todas las Disputas' },
          { id: 'active', label: `Activas (${openCount})` },
          { id: 'resolved', label: 'Resueltas' },
        ].map(tab => (
          <button
            key={tab.id}
            type="button"
            onClick={() => setFilterStatus(tab.id)}
            className={`btn btn-sm ${filterStatus === tab.id ? 'btn-primary' : 'btn-ghost'}`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* Disputes List */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
        {filteredDisputes.map(disp => {
          const isOpen = disp.status === 'open' || disp.status === 'investigating';
          return (
            <div key={disp.id} className="card" style={{ padding: '20px', borderLeft: isOpen ? '4px solid #ef4444' : '4px solid var(--brand-emerald)' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '12px', marginBottom: '12px' }}>
                <div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '4px' }}>
                    <span style={{ fontFamily: 'monospace', fontWeight: 700, color: 'var(--brand-cyan)', fontSize: '0.85rem' }}>
                      #{disp.id}
                    </span>
                    <span className="badge" style={{ fontSize: '0.7rem' }}>
                      Pedido: {disp.order_id}
                    </span>
                    {isOpen ? (
                      <span className="badge badge-red" style={{ fontSize: '0.7rem' }}>
                        En Mediación
                      </span>
                    ) : (
                      <span className="badge badge-emerald" style={{ fontSize: '0.7rem' }}>
                        Resuelta
                      </span>
                    )}
                  </div>
                  <h3 style={{ fontSize: '1.05rem', fontWeight: 700, color: 'var(--text-primary)', margin: '0 0 4px' }}>
                    {disp.order_title}
                  </h3>
                  <div style={{ fontSize: '0.82rem', color: 'var(--text-muted)' }}>
                    Comprador: <strong>{disp.client_name}</strong> • Viajero: <strong>{disp.traveler_name}</strong>
                  </div>
                </div>

                <div style={{ textAlign: 'right' }}>
                  <div style={{ fontSize: '1.25rem', fontWeight: 800, color: 'var(--brand-gold)', fontFamily: 'var(--font-display)' }}>
                    ${disp.amount_usd.toFixed(2)} <span style={{ fontSize: '0.75rem', fontWeight: 400, color: 'var(--text-muted)' }}>USDC</span>
                  </div>
                  <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)' }}>Bloqueado en Escrow</div>
                </div>
              </div>

              {/* Dispute Reason */}
              <div style={{ background: 'rgba(255,255,255,0.03)', borderRadius: '10px', padding: '12px 14px', marginBottom: '14px', border: '1px solid var(--border-subtle)' }}>
                <div style={{ fontSize: '0.78rem', color: 'var(--text-muted)', marginBottom: '4px', display: 'flex', alignItems: 'center', gap: '6px' }}>
                  <AlertTriangle size={13} color="var(--brand-gold)" /> Motivo del Reclamo:
                </div>
                <div style={{ fontSize: '0.88rem', color: 'var(--text-primary)', fontWeight: 600 }}>
                  {disp.reason}
                </div>
                <div style={{ fontSize: '0.82rem', color: 'var(--text-secondary)', marginTop: '4px', lineHeight: 1.4 }}>
                  {disp.evidence_description}
                </div>

                {disp.resolution_notes && (
                  <div style={{ marginTop: '10px', paddingTop: '8px', borderTop: '1px solid var(--border-subtle)', fontSize: '0.82rem', color: 'var(--brand-emerald)' }}>
                    <strong>Resolución Final:</strong> {disp.resolution_notes} ({disp.arbitrator_name})
                  </div>
                )}
              </div>

              {/* Bottom Actions */}
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '10px' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                  {disp.smart_contract_tx && (
                    <a
                      href={`https://basescan.org/tx/${disp.smart_contract_tx}`}
                      target="_blank"
                      rel="noreferrer"
                      style={{ color: 'var(--brand-cyan)', textDecoration: 'none', display: 'inline-flex', alignItems: 'center', gap: '3px' }}
                    >
                      Smart Contract Tx <ExternalLink size={11} />
                    </a>
                  )}
                  <span>•</span>
                  <span>Registrada el {new Date(disp.created_at).toLocaleDateString('es-ES')}</span>
                </div>

                <div style={{ display: 'flex', gap: '8px' }}>
                  <button
                    type="button"
                    onClick={() => setSelectedDispute(disp)}
                    className="btn btn-primary btn-sm"
                    style={{ display: 'flex', alignItems: 'center', gap: '6px' }}
                  >
                    <Scale size={14} /> {isOpen ? 'Arbitrar Disputa' : 'Ver Detalles del Arbitraje'}
                  </button>
                </div>
              </div>
            </div>
          );
        })}

        {filteredDisputes.length === 0 && (
          <div className="card" style={{ padding: '40px', textAlign: 'center' }}>
            <div style={{ fontSize: '2.5rem', marginBottom: '10px' }}>⚖️</div>
            <h3 style={{ fontSize: '1.1rem', fontWeight: 600, color: 'var(--text-primary)' }}>
              No hay disputas en esta categoría
            </h3>
            <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)', marginTop: '4px' }}>
              El protocolo mantiene una tasa de éxito de entregas del 99.4%.
            </p>
          </div>
        )}
      </div>

      {/* ARBITRATION DETAIL & DECISION MODAL */}
      {selectedDispute && (
        <>
          <div className="cart-overlay" onClick={() => setSelectedDispute(null)} />
          <div className="modal-content" style={{ maxWidth: '600px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <Scale size={20} color="var(--brand-purple)" />
                <h3 style={{ fontSize: '1.2rem', fontWeight: 700, margin: 0 }}>
                  Tribunal de Arbitraje — #{selectedDispute.id}
                </h3>
              </div>
              <button
                type="button"
                onClick={() => setSelectedDispute(null)}
                className="btn btn-ghost btn-sm"
                style={{ width: 32, height: 32, borderRadius: '50%', padding: 0 }}
              >
                <X size={16} />
              </button>
            </div>

            <div style={{ marginBottom: '16px' }}>
              <div style={{ fontSize: '1.05rem', fontWeight: 700, color: 'var(--text-primary)' }}>
                {selectedDispute.order_title}
              </div>
              <div style={{ fontSize: '0.85rem', color: 'var(--text-muted)', marginTop: '2px' }}>
                Monto en custodia: <strong style={{ color: 'var(--brand-gold)' }}>${selectedDispute.amount_usd.toFixed(2)} USDC</strong>
              </div>
            </div>

            {/* Evidence & Parties */}
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px', marginBottom: '16px' }}>
              <div style={{ background: 'rgba(255,255,255,0.03)', padding: '12px', borderRadius: '8px' }}>
                <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>Comprador (Demandante):</div>
                <div style={{ fontWeight: 600, fontSize: '0.88rem', marginTop: '2px' }}>{selectedDispute.client_name}</div>
              </div>
              <div style={{ background: 'rgba(255,255,255,0.03)', padding: '12px', borderRadius: '8px' }}>
                <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>Viajero / Vendedor:</div>
                <div style={{ fontWeight: 600, fontSize: '0.88rem', marginTop: '2px' }}>{selectedDispute.traveler_name}</div>
              </div>
            </div>

            {/* Evidence Image */}
            {selectedDispute.evidence_images && selectedDispute.evidence_images.length > 0 && (
              <div style={{ marginBottom: '16px' }}>
                <div style={{ fontSize: '0.78rem', color: 'var(--text-muted)', marginBottom: '6px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <span>Evidencia fotográfica aportada:</span>
                  {isAiAnalyzing && (
                    <span style={{ fontSize: '0.72rem', color: 'var(--brand-cyan)', display: 'flex', alignItems: 'center', gap: '5px', fontWeight: 700 }}>
                      <span className="sc-radar-dot" /> Escáner Pericial Multimodal en Vivo
                    </span>
                  )}
                </div>
                <div style={{
                  position: 'relative',
                  height: '170px',
                  borderRadius: '10px',
                  overflow: 'hidden',
                  border: isAiAnalyzing ? '1px solid var(--brand-cyan)' : '1px solid var(--border-default)',
                  boxShadow: isAiAnalyzing ? '0 0 20px rgba(0,207,255,0.25)' : 'none',
                  transition: 'all 0.3s ease'
                }}>
                  <img
                    src={selectedDispute.evidence_images[0]}
                    alt="Evidencia"
                    style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                  />
                  {isAiAnalyzing && (
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
                </div>
              </div>
            )}

            {/* Reason */}
            <div style={{ background: 'rgba(239,68,68,0.06)', border: '1px solid rgba(239,68,68,0.2)', padding: '12px', borderRadius: '10px', marginBottom: '16px' }}>
              <div style={{ fontSize: '0.78rem', color: '#ef4444', fontWeight: 600, marginBottom: '4px' }}>
                Declaración del Comprador:
              </div>
              <div style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', lineHeight: 1.4 }}>
                {selectedDispute.evidence_description}
              </div>
            </div>

            {resolveSuccess && (
              <div className="alert alert-success" style={{ marginBottom: '16px' }}>
                <CheckCircle2 size={16} /> {resolveSuccess}
              </div>
            )}

            {/* AI Analysis Trigger Box (Chainlink Functions + Gemini 3.6 Flash) */}
            {selectedDispute.status === 'open' || selectedDispute.status === 'investigating' ? (
              <div style={{ marginBottom: '16px' }}>
                <div style={{
                  padding: '16px',
                  background: 'linear-gradient(135deg, rgba(0,207,255,0.08) 0%, rgba(155,114,255,0.08) 100%)',
                  border: '1px solid rgba(0,207,255,0.3)',
                  borderRadius: '14px',
                  marginBottom: '16px',
                  boxShadow: '0 4px 20px rgba(0,0,0,0.2)',
                }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '12px', flexWrap: 'wrap', gap: '8px' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                      <Sparkles size={18} color="var(--brand-cyan)" />
                      <div>
                        <div style={{ fontSize: '0.88rem', fontWeight: 800, color: 'var(--brand-cyan)', letterSpacing: '0.3px' }}>
                          Oráculo Pericial Forense (Chainlink + Gemini 3.6 Flash)
                        </div>
                        <div style={{ fontSize: '0.68rem', color: 'var(--text-muted)' }}>
                          Peritaje de visión por computadora y resolución algorítmica on-chain
                        </div>
                      </div>
                    </div>
                    <button
                      type="button"
                      disabled={isAiAnalyzing}
                      onClick={handleRunAiAudit}
                      className="btn btn-sm btn-tangem-glow btn-pressable"
                      style={{ fontSize: '0.75rem', display: 'flex', alignItems: 'center', gap: '6px', padding: '6px 12px' }}
                    >
                      {isAiAnalyzing ? <RefreshCw size={13} className="spin" /> : <Sparkles size={13} />}
                      {isAiAnalyzing ? 'Ejecutando Oráculo...' : '⚡ Evaluar con Oráculo IA'}
                    </button>
                  </div>

                  {/* TELEMETRÍA EN TIEMPO REAL CUANDO ESTÁ ANALIZANDO */}
                  {isAiAnalyzing && (
                    <div className="animate-spring-check" style={{
                      background: 'rgba(5, 8, 16, 0.9)',
                      border: '1px solid rgba(0, 207, 255, 0.4)',
                      borderRadius: '10px',
                      padding: '14px',
                      marginBottom: '10px',
                    }}>
                      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '10px', borderBottom: '1px solid rgba(255,255,255,0.06)', paddingBottom: '6px' }}>
                        <span style={{ fontSize: '0.72rem', fontWeight: 700, color: 'var(--brand-cyan)', letterSpacing: '0.5px', textTransform: 'uppercase' }}>
                          Consenso de Oráculo en Progreso
                        </span>
                        <span style={{ fontSize: '0.7rem', color: 'var(--brand-gold)', fontWeight: 600 }}>
                          Fase {aiAuditStep}/4
                        </span>
                      </div>

                      <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', fontSize: '0.75rem' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: aiAuditStep >= 1 ? 'var(--brand-cyan)' : 'var(--text-muted)' }}>
                          <span style={{ fontWeight: 800 }}>{aiAuditStep > 1 ? '✓' : '●'}</span>
                          <span>🛰️ Ingesta de Telemetría On-Chain y Metadatos IPFS</span>
                        </div>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: aiAuditStep >= 2 ? 'var(--brand-cyan)' : 'var(--text-muted)' }}>
                          <span style={{ fontWeight: 800 }}>{aiAuditStep > 2 ? '✓' : aiAuditStep === 2 ? '●' : '○'}</span>
                          <span>👁️ Inspección Multimodal Gemini 3.6 Flash Vision (Fisuras y Precintos)</span>
                        </div>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: aiAuditStep >= 3 ? 'var(--brand-cyan)' : 'var(--text-muted)' }}>
                          <span style={{ fontWeight: 800 }}>{aiAuditStep > 3 ? '✓' : aiAuditStep === 3 ? '●' : '○'}</span>
                          <span>⚖️ Verificación de Cláusulas de Custodia Smart Contract Base L2</span>
                        </div>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: aiAuditStep >= 4 ? 'var(--brand-emerald)' : 'var(--text-muted)' }}>
                          <span style={{ fontWeight: 800 }}>{aiAuditStep >= 4 ? '✓' : '○'}</span>
                          <span>🔏 Consenso Criptográfico Chainlink Functions & Cálculo de Payout</span>
                        </div>
                      </div>
                    </div>
                  )}

                  {/* VEREDICTO DE ORÁCULO LLEGÓ */}
                  {aiVerdict && !isAiAnalyzing ? (
                    <div className="animate-spring-check" style={{
                      fontSize: '0.82rem',
                      color: 'var(--text-secondary)',
                      lineHeight: 1.45,
                      background: 'rgba(5, 8, 16, 0.85)',
                      padding: '16px',
                      borderRadius: '12px',
                      border: '1px solid rgba(0,207,255,0.3)',
                      boxShadow: '0 0 25px rgba(0,207,255,0.1)',
                    }}>
                      {/* Top status bar */}
                      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '12px', flexWrap: 'wrap', gap: '8px' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flexWrap: 'wrap' }}>
                          <span className={
                            aiVerdict.verdict === 'buyer_wins' 
                              ? 'badge badge-gold' 
                              : aiVerdict.verdict === 'seller_wins' 
                                ? 'badge badge-emerald' 
                                : 'badge badge-purple'
                          } style={{ fontSize: '0.78rem', fontWeight: 800, padding: '4px 10px' }}>
                            {aiVerdict.verdict === 'buyer_wins' ? '🛡️ DICTAMEN: REEMBOLSO AL COMPRADOR' : aiVerdict.verdict === 'seller_wins' ? '🚚 DICTAMEN: LIBERACIÓN AL VIAJERO' : '⚖️ DICTAMEN: MEDIACIÓN PARITARIA 50/50'}
                          </span>
                          <span className="badge badge-cyan" style={{ fontSize: '0.75rem', fontWeight: 700 }}>
                            Certeza: {aiVerdict.confidenceScore}
                          </span>
                        </div>
                        <span style={{ fontSize: '0.68rem', color: 'var(--text-muted)' }}>
                          {aiVerdict.oracleProvider}
                        </span>
                      </div>

                      {/* Escrow Payout Comparison Bar */}
                      {aiVerdict.recommendedPayout && (
                        <div style={{
                          marginBottom: '12px',
                          background: 'rgba(255,255,255,0.03)',
                          border: '1px solid rgba(255,255,255,0.08)',
                          borderRadius: '8px',
                          padding: '10px 12px',
                        }}>
                          <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.72rem', color: 'var(--text-muted)', marginBottom: '4px' }}>
                            <span>Distribución Algorítmica de Custodia:</span>
                            <span style={{ color: 'var(--brand-gold)', fontWeight: 700 }}>Total: ${selectedDispute.amount_usd.toFixed(2)} USDC</span>
                          </div>
                          <div style={{ display: 'flex', height: '18px', borderRadius: '6px', overflow: 'hidden', background: 'rgba(0,0,0,0.4)', marginBottom: '4px' }}>
                            <div style={{
                              width: `${(aiVerdict.recommendedPayout.buyerAmount / (selectedDispute.amount_usd || 1)) * 100}%`,
                              background: 'linear-gradient(90deg, #ef4444, #f5a623)',
                              display: 'flex',
                              alignItems: 'center',
                              justifyContent: 'center',
                              fontSize: '0.65rem',
                              fontWeight: 700,
                              color: '#fff',
                              transition: 'width 0.5s ease',
                            }}>
                              {aiVerdict.recommendedPayout.buyerAmount > 0 && `Comprador $${aiVerdict.recommendedPayout.buyerAmount}`}
                            </div>
                            <div style={{
                              width: `${(aiVerdict.recommendedPayout.sellerAmount / (selectedDispute.amount_usd || 1)) * 100}%`,
                              background: 'linear-gradient(90deg, #00cfff, #00d68f)',
                              display: 'flex',
                              alignItems: 'center',
                              justifyContent: 'center',
                              fontSize: '0.65rem',
                              fontWeight: 700,
                              color: '#050810',
                              transition: 'width 0.5s ease',
                            }}>
                              {aiVerdict.recommendedPayout.sellerAmount > 0 && `Viajero $${aiVerdict.recommendedPayout.sellerAmount}`}
                            </div>
                          </div>
                          <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.68rem', color: 'var(--text-secondary)' }}>
                            <span>Comprador: ${aiVerdict.recommendedPayout.buyerAmount.toFixed(2)} USDC ({Math.round((aiVerdict.recommendedPayout.buyerAmount / (selectedDispute.amount_usd || 1)) * 100)}%)</span>
                            <span>Viajero: ${aiVerdict.recommendedPayout.sellerAmount.toFixed(2)} USDC ({Math.round((aiVerdict.recommendedPayout.sellerAmount / (selectedDispute.amount_usd || 1)) * 100)}%)</span>
                          </div>
                        </div>
                      )}

                      {/* Photo Findings Details */}
                      {aiVerdict.photoAnalyzed && (
                        <div style={{
                          marginBottom: '10px',
                          background: aiVerdict.photoMatchesClaim ? 'rgba(0,214,143,0.06)' : 'rgba(245,166,35,0.06)',
                          border: `1px solid ${aiVerdict.photoMatchesClaim ? 'rgba(0,214,143,0.25)' : 'rgba(245,166,35,0.25)'}`,
                          borderRadius: '8px',
                          padding: '10px 12px',
                        }}>
                          <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '0.72rem', fontWeight: 700, color: aiVerdict.photoMatchesClaim ? 'var(--brand-emerald)' : 'var(--brand-gold)', marginBottom: '2px' }}>
                            <span>📷 Peritaje Visual Forense (Gemini 3.6 Flash):</span>
                            <span>{aiVerdict.photoMatchesClaim ? '✓ Coincide con lo Declarado' : '⚠️ Discrepancia con lo Declarado'}</span>
                          </div>
                          <div style={{ fontSize: '0.78rem', color: 'var(--text-secondary)', fontStyle: 'italic' }}>
                            {aiVerdict.photoFindings}
                          </div>
                        </div>
                      )}

                      {/* Juridical rationale */}
                      <p style={{ margin: '0 0 10px', color: 'var(--text-primary)', fontSize: '0.82rem', lineHeight: 1.5 }}>
                        {aiVerdict.rationale}
                      </p>

                      {/* Cryptographic Attestation Metadata */}
                      <div style={{
                        background: 'rgba(0,0,0,0.4)',
                        borderRadius: '6px',
                        padding: '8px 10px',
                        fontSize: '0.68rem',
                        color: 'var(--text-muted)',
                        display: 'flex',
                        flexDirection: 'column',
                        gap: '2px',
                        border: '1px solid rgba(255,255,255,0.04)',
                        marginBottom: '12px',
                      }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', fontFamily: 'monospace' }}>
                          <span>Atestación DON:</span>
                          <span style={{ color: 'var(--brand-cyan)' }}>{aiVerdict.attestationHash ? `${aiVerdict.attestationHash.slice(0, 12)}...${aiVerdict.attestationHash.slice(-8)}` : '0x7b4a...9c1d'}</span>
                        </div>
                        <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                          <span>Smart Contract Destino:</span>
                          <span style={{ color: 'var(--text-secondary)' }}>AyniEscrowBaseL2.sol (0x8A2...F31)</span>
                        </div>
                        <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                          <span>Latencia de Consenso:</span>
                          <span style={{ color: 'var(--brand-emerald)' }}>{aiVerdict.executionTimeMs || 420}ms • Bloque Verificado</span>
                        </div>
                      </div>

                      {/* 1-Click Action Button */}
                      <button
                        type="button"
                        onClick={() => {
                          const actionType = aiVerdict.verdict === 'buyer_wins' ? 'refund' : aiVerdict.verdict === 'seller_wins' ? 'release' : 'split';
                          handleResolve(actionType);
                        }}
                        disabled={isResolving}
                        className="btn btn-primary btn-tangem-glow btn-pressable"
                        style={{ width: '100%', fontSize: '0.82rem', padding: '10px 14px', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px' }}
                      >
                        <Check size={16} />
                        <span>⚡ Aplicar Sentencia Recomendada On-Chain (1-Click MultiSig)</span>
                      </button>
                    </div>
                  ) : !isAiAnalyzing && (
                    <p style={{ fontSize: '0.78rem', color: 'var(--text-muted)', margin: 0 }}>
                      Pulsa el botón superior para ejecutar el peritaje de visión artificial multimodal y reputación on-chain con Chainlink Functions antes de dictar sentencia.
                    </p>
                  )}
                </div>

                <label className="input-label" style={{ marginBottom: '6px' }}>Dictamen & Justificación del Mediador:</label>
                <textarea
                  rows={2}
                  value={resolutionNote}
                  onChange={e => setResolutionNote(e.target.value)}
                  placeholder="Ej: Se comprobó daño en embalaje. Reembolso total acordado."
                  className="input input-interactive"
                  style={{ marginBottom: '16px' }}
                />

                <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)', marginBottom: '8px' }}>
                  Selecciona la resolución a ejecutar en el Smart Contract Base L2:
                </div>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(130px, 1fr))', gap: '8px' }}>
                  <button
                    type="button"
                    disabled={isResolving}
                    onClick={() => handleResolve('refund')}
                    className="btn btn-outline btn-pressable"
                    style={{ borderColor: '#ef4444', color: '#ef4444', fontSize: '0.78rem', padding: '10px 8px' }}
                  >
                    ↩️ 100% Reembolso
                  </button>
                  <button
                    type="button"
                    disabled={isResolving}
                    onClick={() => handleResolve('split')}
                    className="btn btn-outline btn-pressable"
                    style={{ borderColor: 'var(--brand-gold)', color: 'var(--brand-gold)', fontSize: '0.78rem', padding: '10px 8px' }}
                  >
                    ⚖️ Split 50% / 50%
                  </button>
                  <button
                    type="button"
                    disabled={isResolving}
                    onClick={() => handleResolve('release')}
                    className="btn btn-primary btn-pressable"
                    style={{ fontSize: '0.78rem', padding: '10px 8px' }}
                  >
                    🛡️ Liberar a Vendedor
                  </button>
                </div>
              </div>
            ) : (
              <div style={{ background: 'rgba(0,214,143,0.08)', border: '1px solid rgba(0,214,143,0.3)', padding: '14px', borderRadius: '10px' }}>
                <div style={{ fontSize: '0.85rem', fontWeight: 700, color: 'var(--brand-emerald)', marginBottom: '4px' }}>
                  Disputa Cerrada
                </div>
                <div style={{ fontSize: '0.82rem', color: 'var(--text-secondary)' }}>
                  {selectedDispute.resolution_notes}
                </div>
                <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginTop: '8px' }}>
                  Arbitrado por: {selectedDispute.arbitrator_name} • {selectedDispute.resolved_at ? new Date(selectedDispute.resolved_at).toLocaleString('es-ES') : ''}
                </div>
              </div>
            )}
          </div>
        </>
      )}

      {/* REPORT NEW DISPUTE MODAL */}
      {isNewDisputeOpen && (
        <>
          <div className="cart-overlay" onClick={() => setIsNewDisputeOpen(false)} />
          <div className="modal-content" style={{ maxWidth: '480px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <ShieldAlert size={20} color="#ef4444" />
                <h3 style={{ fontSize: '1.2rem', fontWeight: 700, margin: 0 }}>
                  Reportar Problema en Pedido
                </h3>
              </div>
              <button
                type="button"
                onClick={() => setIsNewDisputeOpen(false)}
                className="btn btn-ghost btn-sm"
                style={{ width: 32, height: 32, borderRadius: '50%', padding: 0 }}
              >
                <X size={16} />
              </button>
            </div>

            <form onSubmit={handleCreateDispute} style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
              <div>
                <label className="label">Código del Pedido</label>
                <input
                  type="text"
                  required
                  placeholder="Ej: ORD-2609-001"
                  value={newOrderCode}
                  onChange={e => setNewOrderCode(e.target.value)}
                  className="input"
                />
              </div>

              <div>
                <label className="label">Título o Producto</label>
                <input
                  type="text"
                  required
                  placeholder="Ej: Manta Aguayo Jalq'a"
                  value={newTitle}
                  onChange={e => setNewTitle(e.target.value)}
                  className="input"
                />
              </div>

              <div>
                <label className="label">Monto del Escrow (USDC)</label>
                <input
                  type="number"
                  min="1"
                  required
                  value={newAmount}
                  onChange={e => setNewAmount(e.target.value)}
                  className="input"
                />
              </div>

              <div>
                <label className="label">Motivo Principal del Reclamo *</label>
                <select
                  value={newReason}
                  onChange={e => setNewReason(e.target.value)}
                  required
                  className="input"
                >
                  <option value="">Selecciona un motivo...</option>
                  <option value="Producto llegó dañado o con roturas">Producto llegó dañado o con roturas</option>
                  <option value="Producto no coincide con la descripción">Producto no coincide con la descripción</option>
                  <option value="Paquete incompleto o faltan ítems">Paquete incompleto o faltan ítems</option>
                  <option value="Retraso injustificado mayor a 7 días">Retraso injustificado mayor a 7 días</option>
                  <option value="Viajero no se presentó al punto de entrega">Viajero no se presentó al punto de entrega</option>
                  <option value="Otro motivo">Otro motivo</option>
                </select>
              </div>

              <div>
                <label className="label">Descripción Detallada de lo Ocurrido</label>
                <textarea
                  rows={3}
                  value={newEvidence}
                  onChange={e => setNewEvidence(e.target.value)}
                  placeholder="Describe detalladamente el problema y la condición en que recibiste el paquete..."
                  className="input"
                />
              </div>

              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '10px', marginTop: '6px' }}>
                <button
                  type="button"
                  onClick={() => setIsNewDisputeOpen(false)}
                  className="btn btn-outline"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="btn btn-primary"
                  style={{ background: '#ef4444', borderColor: '#ef4444' }}
                >
                  Bloquear Escrow & Abrir Disputa
                </button>
              </div>
            </form>
          </div>
        </>
      )}
    </DashboardLayout>
  );
}
