'use client';

import React, { useState, useEffect } from 'react';
import { DashboardLayout } from '@/components/layout/DashboardLayout';
import {
  ShieldCheck, HeartPulse, Users, Clock, Plus, CheckCircle2,
  Copy, ExternalLink, AlertTriangle, Sparkles, Key, Lock, RefreshCw, X,
  ArrowUpRight, Trash2, ShieldAlert, Cpu, Activity, History, Sliders, Wifi
} from 'lucide-react';
import { sanitizeText, sanitizeEmail, sanitizeAmount } from '@/lib/utils/sanitizer';
import { TangemConnector } from '@/components/web3/TangemConnector';

interface Beneficiary {
  id: string;
  name: string;
  relation: string;
  wallet: string;
  percentage: number;
  email: string;
  status: 'verified' | 'pending';
}

interface HeartbeatRecord {
  id: string;
  timestamp: string;
  txHash: string;
  method: string;
  status: 'confirmed' | 'pending';
}

const INITIAL_HEARTBEATS: HeartbeatRecord[] = [
  { id: 'hb-1', timestamp: '2026-09-08 14:20', txHash: '0x8f2a9c1d3e5b7a0f4c2e6d8b0a1c3e5f7a9b1d3f5a7b9c1d3f5a7b9c1d3f5a7b', method: 'Web3 Ping (Passkey)', status: 'confirmed' },
  { id: 'hb-2', timestamp: '2026-07-15 11:15', txHash: '0x3c7e9a1b5d2f4a6c8e0b2d4f6a8c0e2b4d6f8a0c2e4b6d8f0a2c4e6b8d0f2a4c', method: 'Tangem NFC Card Tap', status: 'confirmed' },
  { id: 'hb-3', timestamp: '2026-05-20 09:42', txHash: '0x1a4c6e8b0d2f3a5c7e9b1d3f5a7b9c1d3f5a7b9c1d3f5a7b4a8e2b9c1d3f5a6e', method: 'Web Dashboard L2', status: 'confirmed' },
];

const INITIAL_BENEFICIARIES: Beneficiary[] = [
  {
    id: 'BEN-001',
    name: 'Valentina Mamani Quispe',
    relation: 'Hija',
    wallet: '0x3a82F7B124C835dFA49a7E3D8523cb5c18B4b92',
    percentage: 50,
    email: 'valentina.m@gmail.com',
    status: 'verified',
  },
  {
    id: 'BEN-002',
    name: 'Mateo Mamani Quispe',
    relation: 'Hijo',
    wallet: '0x9B11Cd842F5cE3a6771e89D01c44A003444888A3',
    percentage: 30,
    email: 'mateo.mamani@outlook.com',
    status: 'verified',
  },
  {
    id: 'BEN-003',
    name: 'Carmen Quispe Flores',
    relation: 'Cónyuge',
    wallet: '0x71A09E18aFeB4533038D354a72d3fC35E6C110F4',
    percentage: 20,
    email: 'carmen.q@gmail.com',
    status: 'verified',
  },
];

export default function HeritagePage() {
  const [beneficiaries, setBeneficiaries] = useState<Beneficiary[]>(INITIAL_BENEFICIARIES);
  const [vaultBalance, setVaultBalance] = useState(18450.00);
  const [inactivityInterval, setInactivityInterval] = useState<number>(180);
  const [daysRemaining, setDaysRemaining] = useState(142);
  const [heartbeatSuccess, setHeartbeatSuccess] = useState(false);
  const [heartbeatTx, setHeartbeatTx] = useState<string | null>(null);
  const [copiedWallet, setCopiedWallet] = useState<string | null>(null);
  const [heartbeats, setHeartbeats] = useState<HeartbeatRecord[]>(INITIAL_HEARTBEATS);

  // Modals
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isDepositModalOpen, setIsDepositModalOpen] = useState(false);
  const [isTangemModalOpen, setIsTangemModalOpen] = useState(false);
  const [customIntervalModal, setCustomIntervalModal] = useState(false);
  const [customDaysInput, setCustomDaysInput] = useState('180');
  const [depositAmount, setDepositAmount] = useState('500');
  const [depositSuccess, setDepositSuccess] = useState<string | null>(null);

  // Form states for new beneficiary
  const [newName, setNewName] = useState('');
  const [newRelation, setNewRelation] = useState('Hijo/a');
  const [newWallet, setNewWallet] = useState('');
  const [newPercentage, setNewPercentage] = useState(10);
  const [newEmail, setNewEmail] = useState('');
  const [formError, setFormError] = useState<string | null>(null);

  useEffect(() => {
    // Load persisted data
    try {
      const savedBens = localStorage.getItem('ayni_beneficiaries');
      if (savedBens) setBeneficiaries(JSON.parse(savedBens));
      const savedHbs = localStorage.getItem('ayni_heartbeats');
      if (savedHbs) setHeartbeats(JSON.parse(savedHbs));
      const savedInterval = localStorage.getItem('ayni_heritage_interval');
      if (savedInterval) {
        const parsed = parseInt(savedInterval, 10);
        if (!isNaN(parsed) && parsed > 0) {
          setInactivityInterval(parsed);
          setDaysRemaining(Math.min(142, parsed));
        }
      }
    } catch (e) {
      console.error('Error loading heritage storage:', e);
    }
  }, []);

  const totalPercentage = beneficiaries.reduce((acc, b) => acc + b.percentage, 0);

  const handleSelectInterval = (days: number) => {
    setInactivityInterval(days);
    setDaysRemaining(days);
    try {
      localStorage.setItem('ayni_heritage_interval', String(days));
    } catch {}
  };

  const handleCustomIntervalSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const days = parseInt(customDaysInput, 10);
    if (!isNaN(days) && days >= 15 && days <= 1825) {
      handleSelectInterval(days);
      setCustomIntervalModal(false);
    }
  };

  const handleHeartbeat = (methodName?: string) => {
    const txHash = '0x' + Array.from({ length: 64 }, () => Math.floor(Math.random() * 16).toString(16)).join('');
    setDaysRemaining(inactivityInterval);
    setHeartbeatTx(txHash);
    setHeartbeatSuccess(true);

    const now = new Date();
    const formattedDate = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}-${String(now.getDate()).padStart(2, '0')} ${String(now.getHours()).padStart(2, '0')}:${String(now.getMinutes()).padStart(2, '0')}`;
    const newRecord: HeartbeatRecord = {
      id: `hb-${Date.now()}`,
      timestamp: formattedDate,
      txHash,
      method: methodName || 'Web3 Ping L2 (Passkey)',
      status: 'confirmed',
    };
    const updated = [newRecord, ...heartbeats];
    setHeartbeats(updated);
    try {
      localStorage.setItem('ayni_heartbeats', JSON.stringify(updated));
    } catch {}

    setTimeout(() => {
      setHeartbeatSuccess(false);
    }, 6000);
  };

  const copyToClipboard = (text: string, id: string) => {
    navigator.clipboard.writeText(text);
    setCopiedWallet(id);
    setTimeout(() => setCopiedWallet(null), 2000);
  };

  const handleRemoveBeneficiary = (id: string) => {
    const updated = beneficiaries.filter(b => b.id !== id);
    setBeneficiaries(updated);
    try {
      localStorage.setItem('ayni_beneficiaries', JSON.stringify(updated));
    } catch {}
  };

  const handleAddBeneficiary = (e: React.FormEvent) => {
    e.preventDefault();
    setFormError(null);

    const cleanName = sanitizeText(newName, 80);
    const cleanWallet = sanitizeText(newWallet, 64);
    const cleanEmail = sanitizeEmail(newEmail);
    const cleanPercentage = sanitizeAmount(newPercentage, 1, 100);

    if (!cleanName || !cleanWallet) {
      setFormError('Completa todos los campos obligatorios válidos.');
      return;
    }

    if (!cleanWallet.startsWith('0x') || cleanWallet.length < 10) {
      setFormError('Introduce una dirección EVM válida (comienza con 0x).');
      return;
    }

    if (totalPercentage + cleanPercentage > 100) {
      setFormError(`El porcentaje total no puede superar el 100%. Disponible: ${100 - totalPercentage}%`);
      return;
    }

    const newBen: Beneficiary = {
      id: `BEN-${Date.now().toString().slice(-3)}`,
      name: cleanName,
      relation: newRelation,
      wallet: cleanWallet,
      percentage: cleanPercentage,
      email: cleanEmail || 'No registrado',
      status: 'verified',
    };

    const updated = [...beneficiaries, newBen];
    setBeneficiaries(updated);
    try {
      localStorage.setItem('ayni_beneficiaries', JSON.stringify(updated));
    } catch {}
    setIsModalOpen(false);
    setNewName('');
    setNewWallet('');
    setNewEmail('');
    setNewPercentage(10);
  };

  const handleDeposit = (e: React.FormEvent) => {
    e.preventDefault();
    const val = sanitizeAmount(depositAmount, 1, 500000);
    if (val <= 0) return;

    const tx = '0x' + Array.from({ length: 64 }, () => Math.floor(Math.random() * 16).toString(16)).join('');
    setVaultBalance(prev => prev + val);
    setDepositSuccess(`¡Depósito completado! +${val.toFixed(2)} USDC transferidos al Smart Contract Base L2 (Tx: ${tx.slice(0, 10)}...${tx.slice(-6)})`);
    setTimeout(() => {
      setDepositSuccess(null);
      setIsDepositModalOpen(false);
    }, 3000);
  };

  return (
    <DashboardLayout>
      <div className="sc-perspective-container">
        {/* Page Header */}
        <div className="page-header" style={{ marginBottom: '24px' }}>
          <div className="page-title-group">
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '4px', flexWrap: 'wrap' }}>
              <div className="page-title">AYNI Heritage</div>
              <span className="badge badge-gold">
                <Sparkles size={11} /> Smart Contracts de Sucesión Base L2
              </span>
              <span className="sc-live-hud">
                <span className="sc-radar-dot" style={{ background: '#10B981', boxShadow: '0 0 8px #10B981' }}></span>
                BÓVEDA ACTIVA & CUSTODIADA
              </span>
            </div>
            <div className="page-subtitle">
              Bóvedas descentralizadas no-custodiales de herencia y protección patrimonial para compatriotas en la diáspora.
            </div>
          </div>
          
          <div style={{ display: 'flex', gap: '10px', flexWrap: 'wrap' }}>
            <button
              type="button"
              onClick={() => setIsDepositModalOpen(true)}
              className="btn btn-primary"
              style={{ display: 'inline-flex', alignItems: 'center', gap: '6px' }}
            >
              <ArrowUpRight size={16} /> Depositar Fondos
            </button>
            <button
              type="button"
              onClick={() => setIsModalOpen(true)}
              className="btn btn-gold"
              disabled={totalPercentage >= 100}
              style={{ display: 'inline-flex', alignItems: 'center', gap: '6px' }}
            >
              <Plus size={16} /> Asignar Beneficiario
            </button>
          </div>
        </div>

        {/* Hero Showcase Card */}
        <div className="card-kinetic sc-card-depth" style={{
          marginBottom: '28px',
          background: 'linear-gradient(135deg, rgba(0,207,255,0.09) 0%, rgba(245,166,35,0.08) 50%, rgba(139,92,246,0.09) 100%)',
          border: '1px solid rgba(0,207,255,0.3)',
          borderRadius: '20px',
          padding: '24px 28px',
          display: 'flex',
          gap: '24px',
          alignItems: 'center',
          flexWrap: 'wrap',
          boxShadow: '0 12px 36px rgba(0,0,0,0.4)',
        }}>
          <div style={{
            position: 'relative',
            width: '120px',
            height: '96px',
            borderRadius: '16px',
            overflow: 'hidden',
            flexShrink: 0,
            border: '1px solid rgba(0,207,255,0.4)',
            boxShadow: '0 8px 24px rgba(0,0,0,0.6)',
          }}>
            <img
              src="/images/ayni_heritage_vault.jpg"
              alt="AYNI Heritage Vault"
              style={{ width: '100%', height: '100%', objectFit: 'cover' }}
            />
            <div style={{
              position: 'absolute',
              bottom: 4,
              right: 4,
              background: 'rgba(5,11,20,0.85)',
              padding: '2px 6px',
              borderRadius: '6px',
              fontSize: '0.65rem',
              color: 'var(--brand-cyan)',
              display: 'flex',
              alignItems: 'center',
              gap: '4px',
              border: '1px solid rgba(0,207,255,0.3)',
            }}>
              <Cpu size={10} /> Base L2
            </div>
          </div>
          
          <div style={{ flex: '1', minWidth: '280px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '6px', flexWrap: 'wrap' }}>
              <span className="badge badge-cyan" style={{ fontSize: '0.72rem' }}>Smart Contract No Custodial ERC-4337</span>
              <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)', fontFamily: 'monospace' }}>
                Contrato: 0x71C9...B49a en Base L2
              </span>
            </div>
            <h2 style={{ fontSize: '1.25rem', fontWeight: 700, margin: '0 0 6px', color: 'var(--text-primary)' }}>
              Bóveda de Herencia Digital & Sucesión Inmutable
            </h2>
            <p style={{ fontSize: '0.86rem', color: 'var(--text-secondary)', lineHeight: 1.5, margin: 0 }}>
              Si resides en el extranjero o acumulas fondos en criptoactivos y remesas, este Smart Contract transfiere de forma autónoma tus fondos a tus herederos en caso de inactividad prolongada (Dead Man's Switch), sin procesos judiciales costosos ni intermediarios bancarios.
            </p>
          </div>
        </div>

        {/* Stats Cards */}
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))',
          gap: '16px',
          marginBottom: '28px',
        }}>
          <div className="card card-kinetic sc-card-depth" style={{ padding: '20px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '10px' }}>
              <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>Patrimonio en Bóveda</span>
              <Lock size={16} color="var(--brand-gold)" />
            </div>
            <div style={{ fontSize: '1.75rem', fontWeight: 800, color: 'var(--brand-gold)', fontFamily: 'var(--font-display)' }}>
              ${vaultBalance.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
            </div>
            <div style={{ fontSize: '0.75rem', color: 'var(--brand-emerald)', marginTop: '4px', display: 'flex', alignItems: 'center', gap: '4px' }}>
              <span className="sc-radar-dot" style={{ width: 6, height: 6, background: '#10B981' }}></span>
              Custodiado en Escrow Base L2 (USDC)
            </div>
          </div>

          <div className="card card-kinetic sc-card-depth" style={{ padding: '20px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '10px' }}>
              <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>Herederos Asignados</span>
              <Users size={16} color="var(--brand-cyan)" />
            </div>
            <div style={{ fontSize: '1.75rem', fontWeight: 800, color: 'var(--brand-cyan)', fontFamily: 'var(--font-display)' }}>
              {beneficiaries.length} beneficiarios
            </div>
            <div style={{ fontSize: '0.75rem', color: totalPercentage === 100 ? 'var(--brand-emerald)' : 'var(--brand-gold)', marginTop: '4px' }}>
              {totalPercentage}% del patrimonio adjudicado
            </div>
          </div>

          <div className="card card-kinetic sc-card-depth" style={{ padding: '20px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '10px' }}>
              <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>Prueba de Vida (Dead Man)</span>
              <HeartPulse size={16} color="var(--brand-red)" />
            </div>
            <div style={{ fontSize: '1.75rem', fontWeight: 800, color: 'var(--brand-emerald)', fontFamily: 'var(--font-display)' }}>
              {daysRemaining} días
            </div>
            <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginTop: '4px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <span>Plazo: {inactivityInterval} días</span>
              <button 
                type="button" 
                onClick={() => setCustomIntervalModal(true)} 
                className="btn btn-ghost btn-sm" 
                style={{ padding: '0 4px', fontSize: '0.7rem', color: 'var(--brand-cyan)' }}
              >
                Ajustar
              </button>
            </div>
          </div>

          <div className="card card-kinetic sc-card-depth" style={{ padding: '20px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '10px' }}>
              <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>Mecanismo de Desbloqueo</span>
              <Key size={16} color="var(--brand-purple)" />
            </div>
            <div style={{ fontSize: '1.1rem', fontWeight: 700, color: 'var(--brand-purple)' }}>
              TimeLock + MultiSig
            </div>
            <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginTop: '4px' }}>
              Smart Contract verificado en Base
            </div>
          </div>
        </div>

        {/* Heartbeat Action Box with Biometric Pulse */}
        <div className="card-kinetic sc-card-depth" style={{
          marginBottom: '32px',
          padding: '24px 28px',
          background: 'rgba(15, 23, 42, 0.65)',
          border: '1px solid rgba(239, 68, 68, 0.25)',
          borderRadius: '18px',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          flexWrap: 'wrap',
          gap: '18px',
          boxShadow: '0 8px 30px rgba(239,68,68,0.05)',
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '16px', flex: '1', minWidth: '280px' }}>
            <div className="sc-biometric-pulse" style={{
              width: 52,
              height: 52,
              borderRadius: '50%',
              background: 'rgba(239, 68, 68, 0.15)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              flexShrink: 0,
            }}>
              <HeartPulse size={26} color="#EF4444" />
            </div>
            <div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '4px' }}>
                <span style={{ fontWeight: 700, fontSize: '1.05rem', color: 'var(--text-primary)' }}>
                  Mecanismo de Presencia (Heartbeat Biométrico)
                </span>
                <span className="badge badge-red" style={{ fontSize: '0.68rem' }}>
                  {daysRemaining} / {inactivityInterval} DÍAS
                </span>
              </div>
              <p style={{ fontSize: '0.84rem', color: 'var(--text-secondary)', margin: '0 0 10px 0' }}>
                Confirma tu actividad periódica. Al hacer clic, se emite una transacción al contrato en Base L2 reiniciando el plazo a {inactivityInterval} días.
              </p>
              
              {/* Interval Preset Selectors */}
              <div style={{ display: 'flex', alignItems: 'center', gap: '6px', flexWrap: 'wrap' }}>
                <span style={{ fontSize: '0.76rem', color: 'var(--text-muted)' }}>Intervalo:</span>
                {[90, 180, 365].map(d => (
                  <button
                    key={d}
                    type="button"
                    onClick={() => handleSelectInterval(d)}
                    style={{
                      padding: '3px 9px',
                      borderRadius: '6px',
                      fontSize: '0.75rem',
                      cursor: 'pointer',
                      border: inactivityInterval === d ? '1px solid var(--brand-cyan)' : '1px solid var(--border-default)',
                      background: inactivityInterval === d ? 'rgba(0,207,255,0.15)' : 'rgba(255,255,255,0.03)',
                      color: inactivityInterval === d ? 'var(--brand-cyan)' : 'var(--text-secondary)',
                      fontWeight: inactivityInterval === d ? 600 : 400,
                    }}
                  >
                    {d} días
                  </button>
                ))}
                <button
                  type="button"
                  onClick={() => setCustomIntervalModal(true)}
                  style={{
                    padding: '3px 9px',
                    borderRadius: '6px',
                    fontSize: '0.75rem',
                    cursor: 'pointer',
                    border: ![90, 180, 365].includes(inactivityInterval) ? '1px solid var(--brand-gold)' : '1px solid var(--border-default)',
                    background: ![90, 180, 365].includes(inactivityInterval) ? 'rgba(245,166,35,0.15)' : 'rgba(255,255,255,0.03)',
                    color: ![90, 180, 365].includes(inactivityInterval) ? 'var(--brand-gold)' : 'var(--text-secondary)',
                  }}
                >
                  {![90, 180, 365].includes(inactivityInterval) ? `${inactivityInterval}d (Custom)` : 'Personalizar'}
                </button>
              </div>
            </div>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: '8px' }}>
            <button
              type="button"
              onClick={() => handleHeartbeat()}
              className="btn btn-primary"
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '8px',
                padding: '10px 20px',
                boxShadow: '0 0 20px rgba(0,207,255,0.3)',
              }}
            >
              <RefreshCw size={16} /> Confirmar que sigo activo (Ping L2)
            </button>

            <button
              type="button"
              onClick={() => setIsTangemModalOpen(true)}
              className="btn btn-outline btn-sm"
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '6px',
                borderColor: 'var(--brand-cyan)',
                color: 'var(--brand-cyan)',
                fontSize: '0.75rem',
              }}
            >
              <Wifi size={13} /> Ping con Tarjeta Tangem (NFC EAL6+)
            </button>

            {heartbeatSuccess && (
              <div style={{ fontSize: '0.78rem', color: 'var(--brand-emerald)', display: 'flex', alignItems: 'center', gap: '6px' }}>
                <CheckCircle2 size={15} /> ¡Presencia confirmada en Base L2! Tx: {heartbeatTx?.slice(0, 10)}...
              </div>
            )}
          </div>
        </div>

        {/* Beneficiaries Table Section */}
        <div className="card card-kinetic sc-card-depth" style={{ padding: '24px', marginBottom: '32px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px', flexWrap: 'wrap', gap: '12px' }}>
            <div>
              <h3 style={{ fontSize: '1.15rem', fontWeight: 700, margin: '0 0 4px', color: 'var(--text-primary)' }}>
                Beneficiarios Registrados en el Contrato
              </h3>
              <p style={{ fontSize: '0.82rem', color: 'var(--text-secondary)', margin: 0 }}>
                Direcciones de billetera cripto autorizadas para recibir su cuota parte automática si se cumple la condición de inactividad.
              </p>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
              <span className={`badge ${totalPercentage === 100 ? 'badge-emerald' : 'badge-gold'}`}>
                Cuota Total: {totalPercentage}% / 100%
              </span>
            </div>
          </div>

          <div style={{ overflowX: 'auto' }}>
            <table className="table" style={{ width: '100%' }}>
              <thead>
                <tr>
                  <th>Heredero / Beneficiario</th>
                  <th>Parentesco</th>
                  <th>Billetera EVM (L2)</th>
                  <th>Porcentaje Asignado</th>
                  <th>Estimado a Recibir</th>
                  <th>Estado</th>
                  <th style={{ textAlign: 'center' }}>Acción</th>
                </tr>
              </thead>
              <tbody>
                {beneficiaries.map(ben => (
                  <tr key={ben.id}>
                    <td>
                      <div>
                        <div style={{ fontWeight: 600, color: 'var(--text-primary)' }}>{ben.name}</div>
                        <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)' }}>{ben.email}</div>
                      </div>
                    </td>
                    <td>
                      <span className="badge badge-cyan" style={{ fontSize: '0.75rem' }}>{ben.relation}</span>
                    </td>
                    <td>
                      <button
                        type="button"
                        onClick={() => copyToClipboard(ben.wallet, ben.id)}
                        title="Copiar billetera"
                        style={{
                          background: 'rgba(255,255,255,0.04)',
                          border: '1px solid var(--border-default)',
                          borderRadius: '6px',
                          padding: '4px 8px',
                          color: 'var(--brand-cyan)',
                          fontFamily: 'monospace',
                          fontSize: '0.78rem',
                          cursor: 'pointer',
                          display: 'inline-flex',
                          alignItems: 'center',
                          gap: '6px',
                        }}
                      >
                        {ben.wallet.slice(0, 8)}...{ben.wallet.slice(-6)}
                        {copiedWallet === ben.id ? <CheckCircle2 size={12} color="var(--brand-emerald)" /> : <Copy size={12} />}
                      </button>
                    </td>
                    <td>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                        <span style={{ fontWeight: 700, color: 'var(--brand-gold)' }}>{ben.percentage}%</span>
                        <div style={{
                          width: '70px',
                          height: '6px',
                          borderRadius: '3px',
                          background: 'rgba(255,255,255,0.1)',
                          overflow: 'hidden',
                        }}>
                          <div style={{
                            width: `${ben.percentage}%`,
                            height: '100%',
                            background: 'linear-gradient(90deg, var(--brand-cyan), var(--brand-gold))',
                          }} />
                        </div>
                      </div>
                    </td>
                    <td style={{ fontWeight: 700, color: 'var(--text-primary)' }}>
                      ${((vaultBalance * ben.percentage) / 100).toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })} USDC
                    </td>
                    <td>
                      <span className="badge badge-emerald" style={{ fontSize: '0.7rem' }}>
                        ✓ Verificado
                      </span>
                    </td>
                    <td style={{ textAlign: 'center' }}>
                      <button
                        type="button"
                        onClick={() => handleRemoveBeneficiary(ben.id)}
                        title="Eliminar beneficiario de la cuota"
                        style={{
                          background: 'transparent',
                          border: 'none',
                          color: 'var(--text-muted)',
                          cursor: 'pointer',
                          padding: '4px',
                          borderRadius: '4px',
                          transition: 'color 0.2s',
                        }}
                        onMouseEnter={e => (e.currentTarget.style.color = '#EF4444')}
                        onMouseLeave={e => (e.currentTarget.style.color = 'var(--text-muted)')}
                      >
                        <Trash2 size={15} />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Heartbeats History Table Section */}
        <div className="card card-kinetic sc-card-depth" style={{ padding: '24px', marginBottom: '32px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px', flexWrap: 'wrap', gap: '10px' }}>
            <div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <History size={18} color="var(--brand-cyan)" />
                <h3 style={{ fontSize: '1.15rem', fontWeight: 700, margin: 0, color: 'var(--text-primary)' }}>
                  Historial de Latidos Verificados (Smart Contract Heartbeats)
                </h3>
              </div>
              <p style={{ fontSize: '0.82rem', color: 'var(--text-secondary)', margin: '4px 0 0' }}>
                Registro inmutable de pruebas de vida on-chain en Base L2 que han reiniciado el TimeLock.
              </p>
            </div>
            <span className="badge badge-emerald" style={{ fontSize: '0.72rem' }}>
              <CheckCircle2 size={11} /> {heartbeats.length} latidos certificados
            </span>
          </div>

          <div style={{ overflowX: 'auto' }}>
            <table className="table" style={{ width: '100%' }}>
              <thead>
                <tr>
                  <th>Fecha & Hora</th>
                  <th>Hash Transacción (Base L2)</th>
                  <th>Método de Autenticación</th>
                  <th style={{ textAlign: 'right' }}>Estado Red</th>
                </tr>
              </thead>
              <tbody>
                {heartbeats.map(hb => (
                  <tr key={hb.id}>
                    <td>
                      <span style={{ fontSize: '0.85rem', color: 'var(--text-primary)', fontWeight: 500 }}>
                        {hb.timestamp}
                      </span>
                    </td>
                    <td>
                      <a
                        href={`https://basescan.org/tx/${hb.txHash}`}
                        target="_blank"
                        rel="noreferrer"
                        style={{
                          fontFamily: 'monospace',
                          fontSize: '0.8rem',
                          color: 'var(--brand-cyan)',
                          textDecoration: 'none',
                          display: 'inline-flex',
                          alignItems: 'center',
                          gap: '4px',
                        }}
                      >
                        {hb.txHash.slice(0, 10)}...{hb.txHash.slice(-8)}
                        <ExternalLink size={12} />
                      </a>
                    </td>
                    <td>
                      <span className="badge badge-purple" style={{ fontSize: '0.72rem' }}>
                        {hb.method}
                      </span>
                    </td>
                    <td style={{ textAlign: 'right' }}>
                      <span className="badge badge-emerald" style={{ fontSize: '0.72rem' }}>
                        <CheckCircle2 size={11} /> Confirmado L2
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Security Architecture & Rules Card */}
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))',
          gap: '20px',
        }}>
          <div className="card card-kinetic sc-card-depth" style={{ padding: '24px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '12px' }}>
              <Clock size={18} color="var(--brand-gold)" />
              <h4 style={{ fontWeight: 700, margin: 0, fontSize: '1rem', color: 'var(--text-primary)' }}>
                Regla de Ejecución: Dead Man's Switch
              </h4>
            </div>
            <p style={{ fontSize: '0.84rem', color: 'var(--text-secondary)', lineHeight: 1.5 }}>
              El Smart Contract de AYNI Heritage cuenta con un temporizador programable. Si el titular no emite una transacción de confirmación en el plazo establecido (180 días), el contrato entra en estado de pre-liberación.
            </p>
            <ul style={{ paddingLeft: '18px', fontSize: '0.8rem', color: 'var(--text-muted)', margin: '10px 0 0', lineHeight: 1.6 }}>
              <li>Notificación de gracia por 30 días a correos registrados.</li>
              <li>Si no hay respuesta, liberación irrevocable a las wallets designadas en Base L2.</li>
            </ul>
          </div>

          <div className="card card-kinetic sc-card-depth" style={{ padding: '24px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '12px' }}>
              <ShieldCheck size={18} color="var(--brand-emerald)" />
              <h4 style={{ fontWeight: 700, margin: 0, fontSize: '1rem', color: 'var(--text-primary)' }}>
                Inmutabilidad & Seguridad Web3
              </h4>
            </div>
            <p style={{ fontSize: '0.84rem', color: 'var(--text-secondary)', lineHeight: 1.5 }}>
              Ni AYNI ni ningún tercero tiene custodia de las claves privadas. Los fondos están protegidos en un contrato ERC-4337 en Base L2, lo que garantiza costos de transacción ínfimos (&lt;$0.01) y máxima seguridad.
            </p>
            <div style={{ marginTop: '12px' }}>
              <span className="badge badge-purple" style={{ fontSize: '0.72rem' }}>
                Auditoría Criptográfica Verificada
              </span>
            </div>
          </div>
        </div>

        {/* Modal: Asignar Nuevo Beneficiario */}
        {isModalOpen && (
          <div className="modal-overlay" onClick={() => setIsModalOpen(false)}>
            <div
              className="modal-box"
              style={{ width: '100%', maxWidth: 480, padding: '28px' }}
              onClick={e => e.stopPropagation()}
            >
              <button
                type="button"
                onClick={() => setIsModalOpen(false)}
                style={{ position: 'absolute', top: 16, right: 16, background: 'transparent', border: 'none', color: 'var(--text-muted)', cursor: 'pointer' }}
              >
                <X size={18} />
              </button>

              <div style={{ marginBottom: '20px' }}>
                <h3 style={{ fontSize: '1.25rem', fontWeight: 700, margin: '0 0 4px', color: 'var(--text-primary)' }}>
                  Asignar Nuevo Beneficiario
                </h3>
                <p style={{ fontSize: '0.82rem', color: 'var(--text-secondary)', margin: 0 }}>
                  Añade una persona de confianza para que herede fondos automáticamente.
                </p>
              </div>

              {formError && (
                <div className="alert alert-error" style={{ marginBottom: '16px' }}>
                  <AlertTriangle size={15} /> {formError}
                </div>
              )}

              <form onSubmit={handleAddBeneficiary} style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
                <div className="input-group">
                  <label className="input-label">Nombre Completo *</label>
                  <input
                    type="text"
                    required
                    placeholder="Ej: Sofía Quispe Mamani"
                    value={newName}
                    onChange={e => setNewName(e.target.value)}
                    className="input"
                  />
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
                  <div className="input-group">
                    <label className="input-label">Parentesco</label>
                    <select
                      value={newRelation}
                      onChange={e => setNewRelation(e.target.value)}
                      className="input"
                    >
                      <option value="Hijo/a">Hijo/a</option>
                      <option value="Cónyuge">Cónyuge</option>
                      <option value="Padre/Madre">Padre/Madre</option>
                      <option value="Hermano/a">Hermano/a</option>
                      <option value="Familiar">Otro Familiar</option>
                      <option value="Albacea">Albacea / Custodio</option>
                    </select>
                  </div>

                  <div className="input-group">
                    <label className="input-label">Porcentaje (%) *</label>
                    <input
                      type="number"
                      min={1}
                      max={100 - totalPercentage}
                      required
                      value={newPercentage}
                      onChange={e => setNewPercentage(Number(e.target.value))}
                      className="input"
                    />
                    <span style={{ fontSize: '0.7rem', color: 'var(--text-muted)', marginTop: '2px' }}>
                      Disponible: {100 - totalPercentage}%
                    </span>
                  </div>
                </div>

                <div className="input-group">
                  <label className="input-label">Billetera EVM (Dirección 0x...) *</label>
                  <input
                    type="text"
                    required
                    placeholder="0x..."
                    value={newWallet}
                    onChange={e => setNewWallet(e.target.value)}
                    className="input"
                  />
                </div>

                <div className="input-group">
                  <label className="input-label">Correo electrónico de notificación</label>
                  <input
                    type="email"
                    placeholder="correo@ejemplo.com"
                    value={newEmail}
                    onChange={e => setNewEmail(e.target.value)}
                    className="input"
                  />
                </div>

                <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '10px', marginTop: '8px' }}>
                  <button
                    type="button"
                    onClick={() => setIsModalOpen(false)}
                    className="btn btn-ghost"
                  >
                    Cancelar
                  </button>
                  <button
                    type="submit"
                    className="btn btn-primary"
                  >
                    Registrar en Smart Contract
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}

        {/* Modal: Depositar Fondos a Bóveda */}
        {isDepositModalOpen && (
          <div className="modal-overlay" onClick={() => setIsDepositModalOpen(false)}>
            <div
              className="modal-box"
              style={{ width: '100%', maxWidth: 460, padding: '28px' }}
              onClick={e => e.stopPropagation()}
            >
              <button
                type="button"
                onClick={() => setIsDepositModalOpen(false)}
                style={{ position: 'absolute', top: 16, right: 16, background: 'transparent', border: 'none', color: 'var(--text-muted)', cursor: 'pointer' }}
              >
                <X size={18} />
              </button>

              <div style={{ marginBottom: '20px' }}>
                <h3 style={{ fontSize: '1.25rem', fontWeight: 700, margin: '0 0 4px', color: 'var(--text-primary)' }}>
                  Depositar Fondos a Bóveda L2
                </h3>
                <p style={{ fontSize: '0.82rem', color: 'var(--text-secondary)', margin: 0 }}>
                  Añade saldo en USDC al Smart Contract de Herencia en Base L2.
                </p>
              </div>

              {depositSuccess && (
                <div className="alert alert-success" style={{ marginBottom: '16px', fontSize: '0.82rem' }}>
                  <CheckCircle2 size={16} /> {depositSuccess}
                </div>
              )}

              <form onSubmit={handleDeposit} style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                <div className="input-group">
                  <label className="input-label">Monto a Depositar (USDC)</label>
                  <div style={{ position: 'relative' }}>
                    <input
                      type="number"
                      min="10"
                      step="10"
                      required
                      value={depositAmount}
                      onChange={e => setDepositAmount(e.target.value)}
                      className="input"
                      style={{ paddingLeft: '28px' }}
                    />
                    <span style={{ position: 'absolute', left: '10px', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }}>$</span>
                  </div>
                  <div style={{ display: 'flex', gap: '6px', marginTop: '6px' }}>
                    {[100, 500, 1000, 5000].map(amt => (
                      <button
                        key={amt}
                        type="button"
                        onClick={() => setDepositAmount(String(amt))}
                        style={{
                          background: 'rgba(255,255,255,0.05)',
                          border: '1px solid var(--border-default)',
                          borderRadius: '6px',
                          padding: '3px 8px',
                          fontSize: '0.75rem',
                          color: 'var(--text-secondary)',
                          cursor: 'pointer',
                        }}
                      >
                        +${amt}
                      </button>
                    ))}
                  </div>
                </div>

                <div style={{
                  padding: '12px 14px',
                  background: 'rgba(0,207,255,0.06)',
                  border: '1px solid rgba(0,207,255,0.2)',
                  borderRadius: '10px',
                  fontSize: '0.8rem',
                  color: 'var(--text-secondary)',
                  display: 'flex',
                  justifyContent: 'space-between',
                }}>
                  <span>Comisión de Red (Base L2 Gas):</span>
                  <strong style={{ color: 'var(--brand-emerald)' }}>&lt; $0.005 USDC</strong>
                </div>

                <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '10px', marginTop: '8px' }}>
                  <button
                    type="button"
                    onClick={() => setIsDepositModalOpen(false)}
                    className="btn btn-ghost"
                  >
                    Cancelar
                  </button>
                  <button
                    type="submit"
                    className="btn btn-primary"
                  >
                    Confirmar Depósito L2
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}
        {/* Modal: Personalizar Intervalo Dead Man */}
        {customIntervalModal && (
          <div className="modal-overlay" onClick={() => setCustomIntervalModal(false)}>
            <div
              className="modal-box"
              style={{ width: '100%', maxWidth: 440, padding: '28px' }}
              onClick={e => e.stopPropagation()}
            >
              <button
                type="button"
                onClick={() => setCustomIntervalModal(false)}
                style={{ position: 'absolute', top: 16, right: 16, background: 'transparent', border: 'none', color: 'var(--text-muted)', cursor: 'pointer' }}
              >
                <X size={18} />
              </button>

              <div style={{ marginBottom: '20px' }}>
                <h3 style={{ fontSize: '1.25rem', fontWeight: 700, margin: '0 0 4px', color: 'var(--text-primary)' }}>
                  Personalizar Plazo de Inactividad
                </h3>
                <p style={{ fontSize: '0.82rem', color: 'var(--text-secondary)', margin: 0 }}>
                  Define cuántos días de inactividad deben transcurrir antes de que el Smart Contract habilite a tus beneficiarios.
                </p>
              </div>

              <form onSubmit={handleCustomIntervalSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                <div>
                  <label className="input-label">Días de inactividad (entre 15 y 1825 días):</label>
                  <input
                    type="number"
                    min="15"
                    max="1825"
                    required
                    value={customDaysInput}
                    onChange={e => setCustomDaysInput(e.target.value)}
                    className="input"
                    style={{ fontSize: '1.1rem', fontWeight: 700 }}
                  />
                </div>

                <div style={{ display: 'flex', gap: '8px' }}>
                  {[30, 60, 120, 240, 730].map(d => (
                    <button
                      key={d}
                      type="button"
                      onClick={() => setCustomDaysInput(String(d))}
                      style={{
                        padding: '4px 8px',
                        background: 'rgba(255,255,255,0.05)',
                        border: '1px solid var(--border-default)',
                        borderRadius: '6px',
                        fontSize: '0.75rem',
                        color: 'var(--text-secondary)',
                        cursor: 'pointer',
                      }}
                    >
                      {d}d
                    </button>
                  ))}
                </div>

                <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '10px', marginTop: '8px' }}>
                  <button
                    type="button"
                    onClick={() => setCustomIntervalModal(false)}
                    className="btn btn-ghost"
                  >
                    Cancelar
                  </button>
                  <button
                    type="submit"
                    className="btn btn-primary"
                  >
                    Guardar Intervalo
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}
        {/* Modal Tangem para Heritage */}
        <TangemConnector
          isOpen={isTangemModalOpen}
          onClose={() => setIsTangemModalOpen(false)}
          actionTitle="Ping Dead Man's Switch con Tarjeta Tangem"
          actionDescription="Aproxima tu tarjeta Tangem física o escanea con la app móvil para firmar tu prueba de vida descentralizada en Base L2."
          onSuccess={(addr, tx) => {
            handleHeartbeat('Tangem NFC Card Tap (EAL6+)');
          }}
        />
      </div>
    </DashboardLayout>
  );
}
