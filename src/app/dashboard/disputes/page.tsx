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
  const [aiVerdict, setAiVerdict] = useState<{
    verdict: string;
    confidenceScore: string;
    rationale: string;
    oracleProvider: string;
    recommendedPayout?: { buyerAmount: number; sellerAmount: number };
  } | null>(null);

  const handleRunAiAudit = async () => {
    if (!selectedDispute) return;
    setIsAiAnalyzing(true);
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
        setAiVerdict(data);
        setResolutionNote(`[${data.oracleProvider}] Dictamen: ${data.rationale}`);
      }
    } catch (e) {
      console.error('Error running AI audit:', e);
    }
    setIsAiAnalyzing(false);
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
                <div style={{ fontSize: '0.78rem', color: 'var(--text-muted)', marginBottom: '6px' }}>
                  Evidencia fotográfica aportada:
                </div>
                <div style={{ height: '160px', borderRadius: '10px', overflow: 'hidden', border: '1px solid var(--border-default)' }}>
                  <img
                    src={selectedDispute.evidence_images[0]}
                    alt="Evidencia"
                    style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                  />
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

            {/* AI Analysis Trigger Box (Chainlink Functions + Gemini Vision) */}
            {selectedDispute.status === 'open' || selectedDispute.status === 'investigating' ? (
              <div style={{ marginBottom: '16px' }}>
                <div style={{
                  padding: '14px',
                  background: 'linear-gradient(135deg, rgba(0,207,255,0.08) 0%, rgba(155,114,255,0.08) 100%)',
                  border: '1px solid rgba(0,207,255,0.25)',
                  borderRadius: '12px',
                  marginBottom: '16px',
                }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px', flexWrap: 'wrap', gap: '8px' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                      <Sparkles size={16} color="var(--brand-cyan)" />
                      <span style={{ fontSize: '0.85rem', fontWeight: 700, color: 'var(--brand-cyan)' }}>
                        Oráculo IA Descentralizado (Chainlink Functions)
                      </span>
                    </div>
                    <button
                      type="button"
                      disabled={isAiAnalyzing}
                      onClick={handleRunAiAudit}
                      className="btn btn-sm btn-primary"
                      style={{ fontSize: '0.75rem', display: 'flex', alignItems: 'center', gap: '4px' }}
                    >
                      {isAiAnalyzing ? <RefreshCw size={12} className="spin" /> : <Sparkles size={12} />}
                      {isAiAnalyzing ? 'Analizando en Chainlink...' : '⚡ Evaluar con IA en < 5s'}
                    </button>
                  </div>

                  {aiVerdict ? (
                    <div style={{ fontSize: '0.82rem', color: 'var(--text-secondary)', lineHeight: 1.4 }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '6px' }}>
                        <span className="badge badge-emerald" style={{ fontSize: '0.72rem' }}>
                          Veredicto: {aiVerdict.verdict === 'buyer_wins' ? 'Comprador Gana' : aiVerdict.verdict === 'seller_wins' ? 'Vendedor Gana' : 'Split 50/50'}
                        </span>
                        <span className="badge badge-cyan" style={{ fontSize: '0.72rem' }}>
                          Confianza: {aiVerdict.confidenceScore}
                        </span>
                      </div>
                      <p style={{ margin: '0 0 6px', color: 'var(--text-primary)' }}>
                        {aiVerdict.rationale}
                      </p>
                      {aiVerdict.recommendedPayout && (
                        <div style={{ fontSize: '0.75rem', color: 'var(--brand-gold)' }}>
                          Distribución sugerida: Comprador ${aiVerdict.recommendedPayout.buyerAmount} USDC | Vendedor ${aiVerdict.recommendedPayout.sellerAmount} USDC
                        </div>
                      )}
                    </div>
                  ) : (
                    <p style={{ fontSize: '0.78rem', color: 'var(--text-muted)', margin: 0 }}>
                      Pulsa el botón para ejecutar el modelo pericial de visión OCR y reputación on-chain antes de dictar sentencia.
                    </p>
                  )}
                </div>

                <label className="label">Dictamen & Justificación del Mediador:</label>
                <textarea
                  rows={2}
                  value={resolutionNote}
                  onChange={e => setResolutionNote(e.target.value)}
                  placeholder="Ej: Se comprobó embalaje deficiente. Reembolso total acordado."
                  className="input"
                  style={{ marginBottom: '16px' }}
                />

                <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)', marginBottom: '8px' }}>
                  Selecciona la resolución a ejecutar en el Smart Contract:
                </div>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '8px' }}>
                  <button
                    type="button"
                    disabled={isResolving}
                    onClick={() => handleResolve('refund')}
                    className="btn btn-outline"
                    style={{ borderColor: '#ef4444', color: '#ef4444', fontSize: '0.75rem', padding: '10px 6px' }}
                  >
                    ↩️ 100% Reembolso
                  </button>
                  <button
                    type="button"
                    disabled={isResolving}
                    onClick={() => handleResolve('split')}
                    className="btn btn-outline"
                    style={{ borderColor: 'var(--brand-gold)', color: 'var(--brand-gold)', fontSize: '0.75rem', padding: '10px 6px' }}
                  >
                    ⚖️ Split 50% / 50%
                  </button>
                  <button
                    type="button"
                    disabled={isResolving}
                    onClick={() => handleResolve('release')}
                    className="btn btn-primary"
                    style={{ fontSize: '0.75rem', padding: '10px 6px' }}
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
