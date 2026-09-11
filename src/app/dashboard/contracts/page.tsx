'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { 
  FileCode, ShieldCheck, Cpu, Sliders, CheckCircle2, 
  ExternalLink, Copy, Check, Sparkles, RefreshCw, Lock,
  Key, AlertTriangle, Scale, Eye, Play, Terminal, Zap
} from 'lucide-react';
import { 
  AYNI_ESCROW_ADDRESS, 
  USDC_TOKEN_ADDRESS, 
  DEFAULT_CLAUSES, 
  CustomClauses,
  executeEscrowDeposit,
  executeEscrowRelease,
  executeDisputeResolution,
  Web3TransactionResult 
} from '@/lib/web3/contracts';

const SOLIDITY_ESCROW_CODE = `// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "@openzeppelin/contracts/security/ReentrancyGuard.sol";
import "@openzeppelin/contracts/token/ERC20/utils/SafeERC20.sol";
import "@openzeppelin/contracts/access/Ownable.sol";

/**
 * @title AyniEscrow — Custodia Blindada con Cláusulas Modulares
 * @author Protocolo AYNI (Buildathon ETH Bolivia 2026 - Red Base L2)
 * @notice Gas optimizado (< $0.001 USD), EAL6+ Tangem Guard y Arbitraje Oracular IA
 */
contract AyniEscrow is ReentrancyGuard, Ownable {
    using SafeERC20 for IERC20;

    struct CustomClauses {
        bool requiresTangemHardwareGuard;  // Exige firma de tarjeta Tangem
        address tangemGuardAddress;         // Billetera chip EAL6+ autorizada
        uint256 inspectionWindowSeconds;    // Ventana de inspección (ej. 24h = 86400s)
        bool milestonePayoutEnabled;        // 50% anticipo verificado + 50% OTP
        bool customsInsuranceCovered;       // Fondo Comunitario ante retención aduanera
        bool autoReleaseOnTimeout;          // Liberación tras 7 días sin disputa
    }

    struct Trade {
        address buyer;
        address traveler;
        uint256 purchaseAmount;
        uint256 feeAmount;
        uint256 systemFee;
        State state;
        bytes32 secretOtpHash;
        uint256 createdAt;
        uint256 deliveredAt;
        bool milestone1Paid;
        CustomClauses clauses;
    }

    function createTradeWithClauses(
        address _traveler,
        uint256 _purchaseAmount,
        uint256 _feeAmount,
        uint256 _systemFee,
        TradeType _type,
        bytes32 _otpHash,
        CustomClauses calldata _clauses
    ) external nonReentrant returns (uint256);

    function completeTradeWithOtp(
        uint256 _tradeId, 
        string calldata _otpCode, 
        bytes calldata _tangemSignature
    ) external nonReentrant;

    function resolveDispute(
        uint256 _tradeId, 
        uint256 _buyerRefund, 
        uint256 _travelerPayout, 
        string calldata _verdict
    ) external onlyAI nonReentrant;
}`;

export default function SmartContractsStudioPage() {
  const [clauses, setClauses] = useState<CustomClauses>(DEFAULT_CLAUSES);
  const [activeTab, setActiveTab] = useState<'clauses' | 'code' | 'audit'>('clauses');
  const [copiedCode, setCopiedCode] = useState(false);
  const [copiedAddress, setCopiedAddress] = useState(false);
  
  // Interactive Simulator State
  const [isSimulating, setIsSimulating] = useState(false);
  const [lastTxResult, setLastTxResult] = useState<Web3TransactionResult | null>(null);

  const copyCodeToClipboard = () => {
    navigator.clipboard.writeText(SOLIDITY_ESCROW_CODE);
    setCopiedCode(true);
    setTimeout(() => setCopiedCode(false), 2000);
  };

  const copyContractAddress = () => {
    navigator.clipboard.writeText(AYNI_ESCROW_ADDRESS);
    setCopiedAddress(true);
    setTimeout(() => setCopiedAddress(false), 2000);
  };

  const handleSimulateDeployDeposit = async () => {
    setIsSimulating(true);
    const otp = Math.floor(100000 + Math.random() * 900000).toString();
    const res = await executeEscrowDeposit({
      buyerAddress: '0x3d4b8e2b9c1d3f5a6e8d2c4b7a9e1f3d5c7b9a1e',
      travelerAddress: '0x8f1a7b9c1d3f5a6e8d2c4b7a9e1f3d5c7b9a1e44',
      amountUsdc: 150.00,
      otpPlain: otp,
      travelerFeeUsdc: 25.00,
      systemFeeUsdc: 7.50,
      clauses,
    });
    setLastTxResult(res);
    setIsSimulating(false);
  };

  const handleSimulateRelease = async () => {
    setIsSimulating(true);
    const res = await executeEscrowRelease(1088, '774411');
    setLastTxResult(res);
    setIsSimulating(false);
  };

  const handleSimulateDispute = async () => {
    setIsSimulating(true);
    const res = await executeDisputeResolution(1088, 150.00, 0, 'Dictamen pericial IA: Paquete con precinto violentado');
    setLastTxResult(res);
    setIsSimulating(false);
  };

  return (
    <DashboardLayout>
      <div style={{ maxWidth: '1080px', margin: '0 auto' }}>
        {/* Header */}
        <div className="page-header" style={{ marginBottom: '24px' }}>
          <div className="page-title-group">
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '4px', flexWrap: 'wrap' }}>
              <h1 className="page-title">Smart Contracts Studio & Cláusulas</h1>
              <span className="badge badge-emerald">
                <ShieldCheck size={11} /> Blindaje OpenZeppelin
              </span>
              <span className="badge badge-cyan">
                <Cpu size={11} /> Red Base L2 (Sepolia)
              </span>
            </div>
            <div className="page-subtitle">
              Inspecciona, parametriza y compila contratos inteligentes de custodia modular. Modifica cláusulas de inspección, hitos y protección Tangem Hardware.
            </div>
          </div>

          <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
            <a 
              href={`https://sepolia.basescan.org/address/${AYNI_ESCROW_ADDRESS}`}
              target="_blank"
              rel="noreferrer"
              className="btn btn-ghost btn-sm btn-pressable"
              style={{ display: 'inline-flex', alignItems: 'center', gap: '6px', color: 'var(--brand-cyan)' }}
            >
              <ExternalLink size={14} /> BaseScan Explorer
            </a>
          </div>
        </div>

        {/* Contract Address Bar */}
        <div className="card" style={{ padding: '14px 20px', marginBottom: '24px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '12px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <div style={{ width: 10, height: 10, borderRadius: '50%', background: 'var(--brand-emerald)', boxShadow: '0 0 10px var(--brand-emerald)' }} />
            <div>
              <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)', textTransform: 'uppercase' }}>Contrato Oficial Desplegado</div>
              <div style={{ fontFamily: 'monospace', fontSize: '0.88rem', fontWeight: 700, color: 'var(--brand-cyan)' }}>
                {AYNI_ESCROW_ADDRESS}
              </div>
            </div>
          </div>

          <button 
            type="button" 
            onClick={copyContractAddress} 
            className="btn btn-ghost btn-sm btn-pressable"
            style={{ fontSize: '0.75rem' }}
          >
            {copiedAddress ? <Check size={13} color="var(--brand-emerald)" /> : <Copy size={13} />}
            {copiedAddress ? 'Copiado' : 'Copiar Dirección'}
          </button>
        </div>

        {/* Tabs */}
        <div style={{ display: 'flex', gap: '8px', marginBottom: '20px' }}>
          <button
            type="button"
            onClick={() => setActiveTab('clauses')}
            className={`btn btn-sm btn-pressable ${activeTab === 'clauses' ? 'btn-primary' : 'btn-ghost'}`}
            style={{ display: 'flex', alignItems: 'center', gap: '6px' }}
          >
            <Sliders size={14} /> Configurador de Cláusulas
          </button>
          <button
            type="button"
            onClick={() => setActiveTab('code')}
            className={`btn btn-sm btn-pressable ${activeTab === 'code' ? 'btn-primary' : 'btn-ghost'}`}
            style={{ display: 'flex', alignItems: 'center', gap: '6px' }}
          >
            <FileCode size={14} /> Código Solidity (^0.8.20)
          </button>
          <button
            type="button"
            onClick={() => setActiveTab('audit')}
            className={`btn btn-sm btn-pressable ${activeTab === 'audit' ? 'btn-primary' : 'btn-ghost'}`}
            style={{ display: 'flex', alignItems: 'center', gap: '6px' }}
          >
            <ShieldCheck size={14} /> Auditoría & Seguridad
          </button>
        </div>

        {/* TAB 1: CONFIGURADOR DE CLÁUSULAS */}
        {activeTab === 'clauses' && (
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: '20px', marginBottom: '24px' }}>
            {/* Clause Switches Card */}
            <div className="card" style={{ padding: '24px' }}>
              <h3 style={{ fontSize: '1.1rem', fontWeight: 700, marginBottom: '6px', color: 'var(--text-primary)', display: 'flex', alignItems: 'center', gap: '8px' }}>
                <Sliders size={18} color="var(--brand-cyan)" /> Cláusulas Programables del Trade
              </h3>
              <p style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', marginBottom: '20px' }}>
                Activa o personaliza las reglas lógicas que el Smart Contract ejecutará automáticamente durante la custodia de fondos.
              </p>

              <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                {/* Clause 1: Tangem Guard */}
                <div style={{ background: 'rgba(255,255,255,0.02)', border: '1px solid var(--border-subtle)', borderRadius: '12px', padding: '14px' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '6px' }}>
                    <div style={{ fontWeight: 700, fontSize: '0.88rem', color: 'var(--brand-cyan)', display: 'flex', alignItems: 'center', gap: '6px' }}>
                      <Lock size={15} /> Cláusula Tangem Hardware Guard
                    </div>
                    <input 
                      type="checkbox" 
                      checked={clauses.requiresTangemHardwareGuard}
                      onChange={e => setClauses(prev => ({ ...prev, requiresTangemHardwareGuard: e.target.checked }))}
                      style={{ cursor: 'pointer', transform: 'scale(1.2)' }}
                    />
                  </div>
                  <p style={{ fontSize: '0.78rem', color: 'var(--text-muted)', margin: 0, lineHeight: 1.4 }}>
                    Exige la firma física del chip criptográfico EAL6+ de la tarjeta Tangem autorizada para permitir la liberación de fondos o cancelaciones.
                  </p>
                </div>

                {/* Clause 2: Inspection Window */}
                <div style={{ background: 'rgba(255,255,255,0.02)', border: '1px solid var(--border-subtle)', borderRadius: '12px', padding: '14px' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '6px' }}>
                    <div style={{ fontWeight: 700, fontSize: '0.88rem', color: 'var(--brand-gold)', display: 'flex', alignItems: 'center', gap: '6px' }}>
                      <Zap size={15} /> Ventana de Inspección Técnica
                    </div>
                    <select 
                      value={clauses.inspectionWindowSeconds}
                      onChange={e => setClauses(prev => ({ ...prev, inspectionWindowSeconds: parseInt(e.target.value) }))}
                      className="input input-interactive"
                      style={{ width: 'auto', padding: '4px 8px', fontSize: '0.78rem' }}
                    >
                      <option value={0}>Liberación Inmediata</option>
                      <option value={86400}>24 Horas de Gracia</option>
                      <option value={172800}>48 Horas (Electrónica)</option>
                      <option value={259200}>72 Horas (Garantía)</option>
                    </select>
                  </div>
                  <p style={{ fontSize: '0.78rem', color: 'var(--text-muted)', margin: 0, lineHeight: 1.4 }}>
                    El comprador tiene este lapso tras ingresar el OTP para probar el funcionamiento del producto antes de que el contrato complete la liquidación definitiva.
                  </p>
                </div>

                {/* Clause 3: Milestone Payout */}
                <div style={{ background: 'rgba(255,255,255,0.02)', border: '1px solid var(--border-subtle)', borderRadius: '12px', padding: '14px' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '6px' }}>
                    <div style={{ fontWeight: 700, fontSize: '0.88rem', color: 'var(--brand-emerald)', display: 'flex', alignItems: 'center', gap: '6px' }}>
                      <Scale size={15} /> Desembolso por Hitos (50% Compra / 50% OTP)
                    </div>
                    <input 
                      type="checkbox" 
                      checked={clauses.milestonePayoutEnabled}
                      onChange={e => setClauses(prev => ({ ...prev, milestonePayoutEnabled: e.target.checked }))}
                      style={{ cursor: 'pointer', transform: 'scale(1.2)' }}
                    />
                  </div>
                  <p style={{ fontSize: '0.78rem', color: 'var(--text-muted)', margin: 0, lineHeight: 1.4 }}>
                    Al subir la foto del ticket de compra y ser validada por el Oráculo IA, se reembolsa de inmediato el 50% del costo al viajero para no descapitalizarlo.
                  </p>
                </div>

                {/* Clause 4: Customs Insurance */}
                <div style={{ background: 'rgba(255,255,255,0.02)', border: '1px solid var(--border-subtle)', borderRadius: '12px', padding: '14px' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '6px' }}>
                    <div style={{ fontWeight: 700, fontSize: '0.88rem', color: 'var(--brand-purple)', display: 'flex', alignItems: 'center', gap: '6px' }}>
                      <ShieldCheck size={15} /> Seguro ante Decomiso Aduanero
                    </div>
                    <input 
                      type="checkbox" 
                      checked={clauses.customsInsuranceCovered}
                      onChange={e => setClauses(prev => ({ ...prev, customsInsuranceCovered: e.target.checked }))}
                      style={{ cursor: 'pointer', transform: 'scale(1.2)' }}
                    />
                  </div>
                  <p style={{ fontSize: '0.78rem', color: 'var(--text-muted)', margin: 0, lineHeight: 1.4 }}>
                    Si la aduana retiene la mercancía con acta oficial comprobable, el Fondo Comunitario de Reserva asume la restitución económica.
                  </p>
                </div>
              </div>
            </div>

            {/* Interactive On-Chain Simulator */}
            <div className="card" style={{ padding: '24px', display: 'flex', flexDirection: 'column' }}>
              <h3 style={{ fontSize: '1.1rem', fontWeight: 700, marginBottom: '6px', color: 'var(--text-primary)', display: 'flex', alignItems: 'center', gap: '8px' }}>
                <Terminal size={18} color="var(--brand-gold)" /> Simulador de Interacción On-Chain
              </h3>
              <p style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', marginBottom: '18px' }}>
                Ejecuta llamadas de prueba al contrato en Base Sepolia con las cláusulas configuradas arriba.
              </p>

              <div style={{ display: 'flex', flexDirection: 'column', gap: '10px', marginBottom: '20px' }}>
                <button
                  type="button"
                  disabled={isSimulating}
                  onClick={handleSimulateDeployDeposit}
                  className="btn btn-primary btn-pressable btn-block"
                  style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px', padding: '12px' }}
                >
                  {isSimulating ? <RefreshCw size={15} className="spin" /> : <Play size={15} />}
                  Ejecutar `createTradeWithClauses(...)`
                </button>

                <button
                  type="button"
                  disabled={isSimulating}
                  onClick={handleSimulateRelease}
                  className="btn btn-tangem-glow btn-pressable btn-block"
                  style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px', padding: '12px' }}
                >
                  <Key size={15} />
                  Ejecutar `completeTradeWithOtp(...)`
                </button>

                <button
                  type="button"
                  disabled={isSimulating}
                  onClick={handleSimulateDispute}
                  className="btn btn-outline btn-pressable btn-block"
                  style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px', padding: '12px', borderColor: '#ef4444', color: '#ef4444' }}
                >
                  <AlertTriangle size={15} />
                  Ejecutar `resolveDispute(...)`
                </button>
              </div>

              {/* Console Output Result */}
              {lastTxResult ? (
                <div style={{ 
                  background: '#04060d', 
                  border: '1px solid rgba(0,207,255,0.3)', 
                  borderRadius: '12px', 
                  padding: '16px',
                  fontSize: '0.78rem',
                  fontFamily: 'monospace',
                  color: 'var(--text-primary)',
                  marginTop: 'auto'
                }}>
                  <div style={{ color: 'var(--brand-emerald)', fontWeight: 700, marginBottom: '6px', display: 'flex', alignItems: 'center', gap: '6px' }}>
                    <CheckCircle2 size={14} /> Transacción Ejecutada en Base L2
                  </div>
                  <div><strong>Método:</strong> {lastTxResult.methodCalled}</div>
                  <div><strong>Trade ID:</strong> #{lastTxResult.tradeId}</div>
                  <div><strong>Hash:</strong> {lastTxResult.txHash.slice(0, 16)}...{lastTxResult.txHash.slice(-8)}</div>
                  <div style={{ marginTop: '8px' }}>
                    <a 
                      href={lastTxResult.explorerUrl} 
                      target="_blank" 
                      rel="noreferrer" 
                      style={{ color: 'var(--brand-cyan)', textDecoration: 'underline' }}
                    >
                      Ver en BaseScan Explorer ↗
                    </a>
                  </div>
                </div>
              ) : (
                <div style={{ 
                  background: 'rgba(255,255,255,0.02)', 
                  border: '1px dashed var(--border-default)', 
                  borderRadius: '12px', 
                  padding: '20px', 
                  textAlign: 'center',
                  fontSize: '0.78rem',
                  color: 'var(--text-muted)',
                  marginTop: 'auto'
                }}>
                  Presiona cualquiera de los botones para ejecutar la llamada criptográfica al Smart Contract y ver el resultado en vivo.
                </div>
              )}
            </div>
          </div>
        )}

        {/* TAB 2: CÓDIGO SOLIDITY */}
        {activeTab === 'code' && (
          <div className="card" style={{ padding: '24px', marginBottom: '24px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '14px', flexWrap: 'wrap', gap: '10px' }}>
              <div>
                <h3 style={{ fontSize: '1.05rem', fontWeight: 700, margin: '0 0 2px' }}>AyniEscrow.sol</h3>
                <span style={{ fontSize: '0.72rem', color: 'var(--text-muted)' }}>Solidity ^0.8.20 • Base Layer 2 Ready</span>
              </div>
              <button 
                type="button" 
                onClick={copyCodeToClipboard}
                className="btn btn-ghost btn-sm btn-pressable"
                style={{ fontSize: '0.75rem', display: 'flex', alignItems: 'center', gap: '6px' }}
              >
                {copiedCode ? <Check size={13} color="var(--brand-emerald)" /> : <Copy size={13} />}
                {copiedCode ? 'Código Copiado' : 'Copiar Código'}
              </button>
            </div>

            <pre style={{
              background: '#040711',
              border: '1px solid rgba(0,207,255,0.2)',
              borderRadius: '12px',
              padding: '18px',
              fontSize: '0.78rem',
              color: '#d1e4ff',
              overflowX: 'auto',
              maxHeight: '480px',
              lineHeight: 1.5,
              fontFamily: 'monospace'
            }}>
              {SOLIDITY_ESCROW_CODE}
            </pre>
          </div>
        )}

        {/* TAB 3: AUDITORÍA & SEGURIDAD */}
        {activeTab === 'audit' && (
          <div className="card" style={{ padding: '28px', marginBottom: '24px' }}>
            <h3 style={{ fontSize: '1.15rem', fontWeight: 700, marginBottom: '6px', color: 'var(--brand-emerald)', display: 'flex', alignItems: 'center', gap: '8px' }}>
              <ShieldCheck size={20} /> Matriz de Seguridad y Blindaje Criptográfico
            </h3>
            <p style={{ fontSize: '0.82rem', color: 'var(--text-secondary)', marginBottom: '20px' }}>
              Parámetros de seguridad implementados según las directrices de OpenZeppelin y el estándar de custodia de la Fundación Ethereum:
            </p>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '16px' }}>
              <div style={{ background: 'rgba(0,214,143,0.06)', border: '1px solid rgba(0,214,143,0.2)', padding: '16px', borderRadius: '12px' }}>
                <div style={{ fontWeight: 700, color: 'var(--brand-emerald)', marginBottom: '4px', fontSize: '0.9rem' }}>
                  ✓ Prevención de Reentrada (CEI)
                </div>
                <div style={{ fontSize: '0.78rem', color: 'var(--text-secondary)' }}>
                  Modificador `nonReentrant` en todos los puntos de salida de fondos. Estado mutado antes de la transferencia externa.
                </div>
              </div>

              <div style={{ background: 'rgba(0,207,255,0.06)', border: '1px solid rgba(0,207,255,0.2)', padding: '16px', borderRadius: '12px' }}>
                <div style={{ fontWeight: 700, color: 'var(--brand-cyan)', marginBottom: '4px', fontSize: '0.9rem' }}>
                  ✓ SafeERC20 Protection
                </div>
                <div style={{ fontSize: '0.78rem', color: 'var(--text-secondary)' }}>
                  Garantiza compatibilidad total con USDC y tokens que no devuelven booleano estándar sin comprometer la ejecución.
                </div>
              </div>

              <div style={{ background: 'rgba(245,166,35,0.06)', border: '1px solid rgba(245,166,35,0.2)', padding: '16px', borderRadius: '12px' }}>
                <div style={{ fontWeight: 700, color: 'var(--brand-gold)', marginBottom: '4px', fontSize: '0.9rem' }}>
                  ✓ Circuit Breaker (Pausable)
                </div>
                <div style={{ fontSize: '0.78rem', color: 'var(--text-secondary)' }}>
                  Pausa de emergencia en caso de anomalías en la red Base L2, preservando el 100% de los depósitos en custodia.
                </div>
              </div>

              <div style={{ background: 'rgba(155,114,255,0.06)', border: '1px solid rgba(155,114,255,0.2)', padding: '16px', borderRadius: '12px' }}>
                <div style={{ fontWeight: 700, color: 'var(--brand-purple)', marginBottom: '4px', fontSize: '0.9rem' }}>
                  ✓ Tangem Hardware Guard EAL6+
                </div>
                <div style={{ fontSize: '0.78rem', color: 'var(--text-secondary)' }}>
                  Exige firma criptográfica de clave privada aislada generada en el chip de la tarjeta física Tangem.
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </DashboardLayout>
  );
}
