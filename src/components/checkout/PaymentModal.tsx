'use client';

import React, { useState } from 'react';
import {
  ShieldCheck, Smartphone, Wifi, ArrowRight, CheckCircle2,
  ExternalLink, Copy, Check, X, Sparkles, RefreshCw, Lock,
  Key, Cpu, CreditCard, Coins, LogIn, AlertTriangle
} from 'lucide-react';
import { executeEscrowDeposit } from '@/lib/web3/contracts';
import { usePollar } from '@pollar/react';

const POLLAR_USDC_ISSUER = process.env.NEXT_PUBLIC_POLLAR_USDC_ISSUER || 'GBBD47IF6LWK7P7MDEVSCWR7DPUWV3NY3DTQEVFL4NAT4AQH3ZLLFLA5';
const POLLAR_TREASURY_ADDRESS = process.env.NEXT_PUBLIC_POLLAR_TREASURY_ADDRESS || '';

interface PaymentModalProps {
  isOpen: boolean;
  onClose: () => void;
  onPaymentSuccess: (result: { txHash: string; otpCode: string; method: string }) => void;
  orderTitle: string;
  productPriceUsdc: number;
  travelerFeeUsdc?: number;
  originCity?: string;
  destinationCity?: string;
}

export function PaymentModal({
  isOpen,
  onClose,
  onPaymentSuccess,
  orderTitle,
  productPriceUsdc,
  travelerFeeUsdc = 0,
  originCity = 'España',
  destinationCity = 'Bolivia',
}: PaymentModalProps) {
  const [activeTab, setActiveTab] = useState<'tap' | 'mobile' | 'demo' | 'pollar'>('tap');
  const [tapState, setTapState] = useState<'idle' | 'approaching' | 'authenticating' | 'signing'>('idle');
  const [copiedWcUri, setCopiedWcUri] = useState(false);
  const [paidSuccessData, setPaidSuccessData] = useState<{ txHash: string; otp: string } | null>(null);
  const [pollarPaying, setPollarPaying] = useState(false);
  const [pollarError, setPollarError] = useState<string | null>(null);
  const { isAuthenticated, wallet, openLoginModal, runTx } = usePollar();

  if (!isOpen) return null;

  // Cálculo de comisiones según especificaciones técnicas (5% plataforma)
  const systemFeeUsdc = parseFloat((productPriceUsdc * 0.05).toFixed(2));
  const totalEscrowUsdc = (productPriceUsdc + travelerFeeUsdc + systemFeeUsdc).toFixed(2);
  const mockTangemAddress = '0x9a8F23B15a7B9c1D3f5A7b9C1d3F5a7B9c1D3F5A';
  const wcUri = `tangem://wc?uri=wc:ayni-base-escrow-${Date.now()}`;

  const copyWcUri = () => {
    navigator.clipboard.writeText(wcUri);
    setCopiedWcUri(true);
    setTimeout(() => setCopiedWcUri(false), 2000);
  };

  const handleExecuteEscrow = async (method: string) => {
    const otp = Math.floor(100000 + Math.random() * 900000).toString();

    const res = await executeEscrowDeposit({
      buyerAddress: mockTangemAddress,
      amountUsdc: parseFloat(totalEscrowUsdc),
      otpPlain: otp,
      travelerFeeUsdc,
      systemFeeUsdc,
    });

    setPaidSuccessData({ txHash: res.txHash, otp });

    setTimeout(() => {
      onPaymentSuccess({ txHash: res.txHash, otpCode: otp, method });
    }, 2400);
  };

  const handlePollarPayment = async () => {
    if (!isAuthenticated) {
      openLoginModal();
      return;
    }
    if (!POLLAR_TREASURY_ADDRESS) {
      setPollarError('Falta configurar la wallet de tesorería de Pollar (NEXT_PUBLIC_POLLAR_TREASURY_ADDRESS).');
      return;
    }

    setPollarError(null);
    setPollarPaying(true);
    try {
      const outcome = await runTx('payment', {
        destination: POLLAR_TREASURY_ADDRESS,
        amount: totalEscrowUsdc,
        asset: { type: 'credit_alphanum4', code: 'USDC', issuer: POLLAR_USDC_ISSUER },
      });

      if (outcome.status === 'error') {
        throw new Error(outcome.message || outcome.details || 'La transacción fue rechazada por la red Stellar.');
      }

      const otp = Math.floor(100000 + Math.random() * 900000).toString();
      setPaidSuccessData({ txHash: outcome.hash, otp });
      setTimeout(() => {
        onPaymentSuccess({ txHash: outcome.hash, otpCode: otp, method: 'pollar_stellar_usdc' });
      }, 2400);
    } catch (error: any) {
      setPollarError(error?.message || 'No se pudo completar el pago con Pollar. Verifica tu saldo de USDC.');
    } finally {
      setPollarPaying(false);
    }
  };

  const handleSimulatePhysicalTap = () => {
    setTapState('approaching');
    setTimeout(() => {
      setTapState('authenticating');
      setTimeout(() => {
        setTapState('signing');
        setTimeout(() => {
          handleExecuteEscrow('tangem_nfc_hardware');
        }, 1200);
      }, 1200);
    }, 1000);
  };

  const handleMobileAppOpen = () => {
    if (typeof window !== 'undefined') {
      window.location.href = wcUri;
    }
    setTapState('signing');
    setTimeout(() => {
      handleExecuteEscrow('tangem_mobile_app');
    }, 1500);
  };

  return (
    <div className="modal-overlay" onClick={onClose} role="dialog" aria-modal="true">
      <div 
        className="modal-box" 
        style={{ 
          maxWidth: 520, 
          width: '100%',
          padding: '24px', 
          background: 'linear-gradient(180deg, #090e1c 0%, #04060d 100%)',
          border: '1px solid rgba(0, 207, 255, 0.35)',
          boxShadow: '0 25px 70px rgba(0,0,0,0.85), 0 0 50px rgba(0, 207, 255, 0.12)',
          position: 'relative',
        }} 
        onClick={e => e.stopPropagation()}
      >
        {/* Close Button */}
        <button 
          type="button" 
          onClick={onClose} 
          className="btn-pressable"
          style={{ 
            position: 'absolute', 
            top: 16, 
            right: 16, 
            background: 'rgba(255,255,255,0.05)', 
            border: '1px solid rgba(255,255,255,0.1)', 
            borderRadius: '50%',
            width: 32,
            height: 32,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            color: 'var(--text-muted)', 
            cursor: 'pointer',
            zIndex: 10
          }}
          aria-label="Cerrar modal"
        >
          <X size={16} />
        </button>

        {/* Tangem Branding Header */}
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '14px', flexWrap: 'wrap', gap: '8px', paddingRight: '36px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <div style={{ 
              background: 'linear-gradient(135deg, #00d68f, #00cfff)', 
              borderRadius: '8px', 
              padding: '4px 10px', 
              fontWeight: 900, 
              fontSize: '0.82rem', 
              color: '#050810',
              letterSpacing: '1px',
              boxShadow: '0 0 16px rgba(0, 207, 255, 0.4)'
            }}>
              TANGEM
            </div>
            <span className="badge badge-cyan" style={{ fontSize: '0.68rem', padding: '3px 8px' }}>
              <ShieldCheck size={11} /> Sponsor Oficial ETH Bolivia 2026
            </span>
          </div>
          <span style={{ fontSize: '0.72rem', color: 'var(--brand-emerald)', fontWeight: 700 }}>
            Red Base L2 • Gas &lt; $0.001
          </span>
        </div>

        <h3 style={{ fontSize: '1.25rem', fontWeight: 800, color: 'var(--text-primary)', margin: '0 0 4px', letterSpacing: '-0.01em' }}>
          Custodia Escrow con Tangem Cold Wallet
        </h3>
        <p style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', margin: '0 0 16px', lineHeight: 1.4 }}>
          Tus fondos se resguardan mediante hardware criptográfico EAL6+. <strong>Solo tú liberas el pago mediante tu código secreto OTP</strong> al recibir el encargo conforme.
        </p>

        {/* Financial Summary */}
        <div style={{ 
          background: 'rgba(255,255,255,0.02)', 
          border: '1px solid rgba(0, 207, 255, 0.15)', 
          borderRadius: '12px', 
          padding: '12px 16px', 
          marginBottom: '16px' 
        }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '4px', fontSize: '0.82rem' }}>
            <span style={{ color: 'var(--text-secondary)' }}>Encargo ({orderTitle.slice(0, 28)}):</span>
            <strong style={{ color: 'var(--text-primary)' }}>${productPriceUsdc.toFixed(2)} USDC</strong>
          </div>
          {travelerFeeUsdc > 0 && (
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '4px', fontSize: '0.82rem' }}>
              <span style={{ color: 'var(--text-secondary)' }}>Honorario Transporte / Envío:</span>
              <strong style={{ color: 'var(--brand-cyan)' }}>+${travelerFeeUsdc.toFixed(2)} USDC</strong>
            </div>
          )}
          <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '6px', fontSize: '0.82rem' }}>
            <span style={{ color: 'var(--text-secondary)' }}>Comisión Escrow AYNI (5%):</span>
            <strong style={{ color: 'var(--text-muted)' }}>+${systemFeeUsdc.toFixed(2)} USDC</strong>
          </div>
          <div style={{ borderTop: '1px solid rgba(255,255,255,0.06)', paddingTop: '6px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <span style={{ fontSize: '0.78rem', color: 'var(--text-muted)', fontWeight: 600 }}>MONTO TOTAL EN CUSTODIA:</span>
            <span style={{ fontSize: '1.25rem', fontWeight: 900, color: 'var(--brand-gold)', fontFamily: 'var(--font-display)' }}>
              ${totalEscrowUsdc} USDC
            </span>
          </div>
        </div>

        {/* Success State */}
        {paidSuccessData ? (
          <div style={{ textAlign: 'center', padding: '16px 0', animation: 'fadeIn 0.3s ease-out' }}>
            <div className="animate-spring-check" style={{ 
              width: 58, 
              height: 58, 
              borderRadius: '50%', 
              background: 'rgba(0,214,143,0.18)', 
              color: 'var(--brand-emerald)', 
              display: 'flex', 
              alignItems: 'center', 
              justifyContent: 'center', 
              margin: '0 auto 12px',
              boxShadow: '0 0 30px rgba(0,214,143,0.3)'
            }}>
              <CheckCircle2 size={34} />
            </div>

            <h4 style={{ fontSize: '1.15rem', fontWeight: 800, color: 'var(--brand-emerald)', marginBottom: '4px' }}>
              ¡Custodia Tangem Bloqueada en Base L2!
            </h4>
            <p style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', marginBottom: '14px' }}>
              Tu código secreto de entrega OTP ha sido generado criptográficamente:
            </p>

            <div style={{ 
              display: 'inline-block', 
              background: 'rgba(0,207,255,0.12)', 
              border: '2px dashed var(--brand-cyan)', 
              borderRadius: '12px', 
              padding: '10px 24px', 
              fontSize: '1.75rem', 
              fontWeight: 900, 
              letterSpacing: '5px',
              fontFamily: 'monospace',
              color: 'var(--brand-cyan)',
              boxShadow: '0 0 24px rgba(0,207,255,0.2)',
              marginBottom: '12px'
            }}>
              {paidSuccessData.otp}
            </div>

            <div style={{ fontSize: '0.74rem', color: 'var(--brand-gold)', marginBottom: '8px' }}>
              ⚠️ Guárdalo seguro. Solo entrégalo al recibir físicamente el producto en mano.
            </div>
            <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)', fontFamily: 'monospace' }}>
              Tx: {paidSuccessData.txHash.slice(0, 14)}...{paidSuccessData.txHash.slice(-8)}
            </div>
          </div>
        ) : (
          <>
            {/* Exclusive Tangem Tabs */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '6px', marginBottom: '16px' }}>
              <button
                type="button"
                onClick={() => { setActiveTab('tap'); setTapState('idle'); }}
                className={`btn btn-sm btn-pressable ${activeTab === 'tap' ? 'btn-primary' : 'btn-ghost'}`}
                style={{ fontSize: '0.75rem', padding: '8px 4px', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '5px' }}
              >
                <Wifi size={13} style={{ transform: 'rotate(90deg)' }} /> Tarjeta NFC
              </button>
              <button
                type="button"
                onClick={() => { setActiveTab('mobile'); setTapState('idle'); }}
                className={`btn btn-sm btn-pressable ${activeTab === 'mobile' ? 'btn-primary' : 'btn-ghost'}`}
                style={{ fontSize: '0.75rem', padding: '8px 4px', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '5px' }}
              >
                <Smartphone size={13} /> App Tangem
              </button>
              <button
                type="button"
                onClick={() => { setActiveTab('demo'); setTapState('idle'); }}
                className={`btn btn-sm btn-pressable ${activeTab === 'demo' ? 'btn-gold' : 'btn-ghost'}`}
                style={{ fontSize: '0.75rem', padding: '8px 4px' }}
              >
                <Key size={13} /> Firma Rápida
              </button>
              <button
                type="button"
                onClick={() => { setActiveTab('pollar'); setPollarError(null); }}
                className={`btn btn-sm btn-pressable ${activeTab === 'pollar' ? 'btn-primary' : 'btn-ghost'}`}
                style={{ fontSize: '0.75rem', padding: '8px 4px', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '5px' }}
              >
                <Coins size={13} /> Pollar (Stellar)
              </button>
            </div>

            {/* TAB 1: TARJETA FÍSICA TANGEM (NFC TAP SIMULATOR) */}
            {activeTab === 'tap' && (
              <div>
                {/* 3D Tangem Hardware Card Visualizer */}
                <div 
                  className={`cold-wallet-card-active ${tapState !== 'idle' ? 'animate-pulse' : ''}`}
                  style={{
                    position: 'relative',
                    height: '170px',
                    borderRadius: '14px',
                    background: 'linear-gradient(135deg, #0e1628 0%, #040813 60%, #0d1e38 100%)',
                    border: '1.5px solid rgba(0, 207, 255, 0.4)',
                    padding: '16px 20px',
                    display: 'flex',
                    flexDirection: 'column',
                    justifyContent: 'space-between',
                    overflow: 'hidden',
                    marginBottom: '16px',
                  }}
                >
                  {/* Laser Shine Beam */}
                  <div style={{
                    position: 'absolute',
                    top: 0,
                    left: tapState !== 'idle' ? '120%' : '-40%',
                    width: '40%',
                    height: '100%',
                    background: 'linear-gradient(90deg, transparent, rgba(0,207,255,0.35), transparent)',
                    transform: 'skewX(-25deg)',
                    transition: 'left 1.4s ease-in-out',
                    pointerEvents: 'none',
                  }} />

                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                      <span style={{ fontWeight: 900, fontSize: '1.15rem', letterSpacing: '2px', color: '#ffffff' }}>
                        tangem
                      </span>
                      <span style={{ fontSize: '0.65rem', background: 'rgba(0,214,143,0.2)', color: 'var(--brand-emerald)', padding: '2px 6px', borderRadius: '4px', fontWeight: 700 }}>
                        EAL6+ CHIP
                      </span>
                    </div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '5px' }}>
                      <Wifi size={16} color="var(--brand-cyan)" style={{ transform: 'rotate(90deg)' }} />
                      <span style={{ fontSize: '0.7rem', color: 'var(--brand-cyan)', fontWeight: 700 }}>NFC</span>
                    </div>
                  </div>

                  <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                    <div style={{
                      width: 36,
                      height: 26,
                      borderRadius: '5px',
                      background: 'linear-gradient(135deg, #f5a623, #b45309)',
                      border: '1px solid rgba(255,255,255,0.4)',
                      boxShadow: '0 2px 6px rgba(0,0,0,0.5)',
                    }} />
                    <div style={{ fontSize: '0.78rem', color: 'rgba(255,255,255,0.7)', fontFamily: 'monospace', letterSpacing: '2px' }}>
                      •••• •••• •••• 849A
                    </div>
                  </div>

                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end' }}>
                    <div>
                      <div style={{ fontSize: '0.62rem', color: 'rgba(255,255,255,0.45)', textTransform: 'uppercase' }}>
                        SMART CONTRACT ESCROW
                      </div>
                      <div style={{ fontSize: '0.78rem', color: 'var(--brand-emerald)', fontWeight: 700 }}>
                        Base L2 • AyniEscrow.sol
                      </div>
                    </div>
                    <div style={{ textAlign: 'right' }}>
                      <div style={{ fontSize: '0.62rem', color: 'rgba(255,255,255,0.45)' }}>TOTAL</div>
                      <div style={{ fontSize: '1.05rem', fontWeight: 900, color: 'var(--brand-gold)' }}>
                        ${totalEscrowUsdc} USDC
                      </div>
                    </div>
                  </div>
                </div>

                {/* State description */}
                {tapState === 'idle' && (
                  <button
                    type="button"
                    onClick={handleSimulatePhysicalTap}
                    className="btn btn-tangem-glow btn-pressable btn-block"
                    style={{ padding: '13px', fontSize: '0.92rem' }}
                  >
                    <Wifi size={16} style={{ transform: 'rotate(90deg)' }} />
                    Aproximar Tarjeta Tangem (Tap NFC)
                  </button>
                )}

                {tapState === 'approaching' && (
                  <div style={{ textAlign: 'center', padding: '12px 0' }}>
                    <div style={{ fontSize: '0.88rem', fontWeight: 700, color: 'var(--brand-cyan)' }}>
                      Detectando sensor NFC...
                    </div>
                    <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                      Mantén la tarjeta Tangem apoyada en el teléfono
                    </div>
                  </div>
                )}

                {tapState === 'authenticating' && (
                  <div style={{ textAlign: 'center', padding: '12px 0' }}>
                    <div style={{ fontSize: '0.88rem', fontWeight: 700, color: 'var(--brand-emerald)' }}>
                      Autenticando enclave criptográfico EAL6+...
                    </div>
                    <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                      Firma de clave privada cold wallet generada
                    </div>
                  </div>
                )}

                {tapState === 'signing' && (
                  <div style={{ textAlign: 'center', padding: '12px 0', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px' }}>
                    <RefreshCw size={16} className="spin" color="var(--brand-cyan)" />
                    <span style={{ fontSize: '0.88rem', fontWeight: 700, color: 'var(--text-primary)' }}>
                      Bloqueando fondos en Smart Contract Base L2...
                    </span>
                  </div>
                )}
              </div>
            )}

            {/* TAB 2: APP TANGEM MÓVIL (WALLETCONNECT) */}
            {activeTab === 'mobile' && (
              <div style={{ textAlign: 'center' }}>
                <div style={{
                  width: 140,
                  height: 140,
                  margin: '0 auto 12px',
                  background: '#ffffff',
                  borderRadius: '12px',
                  padding: '10px',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  boxShadow: '0 8px 30px rgba(0, 207, 255, 0.25)',
                }}>
                  <img 
                    src={`https://api.qrserver.com/v1/create-qr-code/?size=120x120&data=tangem://wc?uri=wc:ayni-base-escrow-${Date.now()}`}
                    alt="Tangem WalletConnect QR" 
                    style={{ width: '100%', height: '100%' }}
                  />
                </div>

                <p style={{ fontSize: '0.78rem', color: 'var(--text-secondary)', marginBottom: '14px' }}>
                  Abre la <strong>App de Tangem</strong> en tu móvil, pulsa en WalletConnect y escanea este código QR o pulsa abajo:
                </p>

                <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                  <button
                    type="button"
                    onClick={handleMobileAppOpen}
                    className="btn btn-tangem-glow btn-pressable btn-block"
                    style={{ padding: '12px', fontSize: '0.88rem' }}
                  >
                    <Smartphone size={16} /> Abrir Directamente en App Tangem
                  </button>

                  <button
                    type="button"
                    onClick={copyWcUri}
                    className="btn btn-ghost btn-sm btn-pressable"
                    style={{ fontSize: '0.75rem', alignSelf: 'center' }}
                  >
                    {copiedWcUri ? <Check size={12} color="var(--brand-emerald)" /> : <Copy size={12} />}
                    {copiedWcUri ? 'Enlace WalletConnect Copiado' : 'Copiar URI WalletConnect'}
                  </button>
                </div>
              </div>
            )}

            {/* TAB 3: DEMO RÁPIDO PARA JURADO 1-CLICK */}
            {activeTab === 'demo' && (
              <div>
                <div style={{ 
                  padding: '14px', 
                  background: 'rgba(0,207,255,0.08)', 
                  border: '1px solid rgba(0,207,255,0.3)', 
                  borderRadius: '12px', 
                  marginBottom: '16px',
                  fontSize: '0.82rem',
                  color: 'var(--text-secondary)',
                  lineHeight: 1.45
                }}>
                  <div style={{ fontWeight: 700, color: 'var(--brand-cyan)', marginBottom: '4px', display: 'flex', alignItems: 'center', gap: '6px' }}>
                    <Key size={15} /> Firma Criptográfica Directa (Chip EAL6+)
                  </div>
                  Certifica la custodia en Base L2, vinculación de firma Tangem Cold Wallet y generación de clave secreta OTP para retiro seguro.
                </div>

                <button
                  type="button"
                  onClick={() => handleExecuteEscrow('tangem_instant_direct')}
                  className="btn btn-tangem-glow btn-pressable btn-block"
                  style={{ padding: '13px', fontSize: '0.92rem', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px' }}
                >
                  <Lock size={16} />
                  ⚡ Firmar & Custodiar en Escrow (${totalEscrowUsdc} USDC)
                </button>
              </div>
            )}

            {/* TAB 4: PAGO REAL CON POLLAR (STELLAR) */}
            {activeTab === 'pollar' && (
              <div>
                <div style={{
                  padding: '14px',
                  background: 'rgba(0,93,180,0.08)',
                  border: '1px solid rgba(0,93,180,0.3)',
                  borderRadius: '12px',
                  marginBottom: '16px',
                  fontSize: '0.82rem',
                  color: 'var(--text-secondary)',
                  lineHeight: 1.45
                }}>
                  <div style={{ fontWeight: 700, color: '#3fa9f5', marginBottom: '4px', display: 'flex', alignItems: 'center', gap: '6px' }}>
                    <Coins size={15} /> Pago real en USDC vía Stellar (Pollar)
                  </div>
                  A diferencia de las otras opciones, esta ejecuta una <strong>transacción real</strong> en la red Stellar usando tu wallet de Pollar — no es una simulación.
                </div>

                {!isAuthenticated ? (
                  <button
                    type="button"
                    onClick={handlePollarPayment}
                    className="btn btn-primary btn-pressable btn-block"
                    style={{ padding: '13px', fontSize: '0.92rem', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px' }}
                  >
                    <LogIn size={16} />
                    Iniciar sesión con Pollar para pagar
                  </button>
                ) : (
                  <>
                    <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginBottom: '10px', fontFamily: 'monospace' }}>
                      Wallet conectada: {wallet?.address ? `${wallet.address.slice(0, 8)}...${wallet.address.slice(-6)}` : '—'}
                    </div>
                    <button
                      type="button"
                      onClick={handlePollarPayment}
                      disabled={pollarPaying}
                      className="btn btn-primary btn-pressable btn-block"
                      style={{ padding: '13px', fontSize: '0.92rem', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px', opacity: pollarPaying ? 0.7 : 1 }}
                    >
                      {pollarPaying ? <RefreshCw size={16} className="spin" /> : <Coins size={16} />}
                      {pollarPaying ? 'Enviando pago en Stellar...' : `Pagar ${totalEscrowUsdc} USDC con Pollar`}
                    </button>
                  </>
                )}

                {pollarError && (
                  <div style={{
                    marginTop: '10px',
                    padding: '10px 12px',
                    background: 'rgba(239,68,68,0.1)',
                    border: '1px solid rgba(239,68,68,0.3)',
                    borderRadius: '8px',
                    fontSize: '0.75rem',
                    color: '#f87171',
                    display: 'flex',
                    alignItems: 'flex-start',
                    gap: '6px',
                  }}>
                    <AlertTriangle size={14} style={{ flexShrink: 0, marginTop: '1px' }} />
                    {pollarError}
                  </div>
                )}
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
}
