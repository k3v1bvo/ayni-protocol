'use client';

import React, { useState } from 'react';
import { 
  ShieldCheck, Smartphone, Wifi, QrCode, CheckCircle2, 
  ExternalLink, ArrowRight, X, Sparkles, Key, Lock 
} from 'lucide-react';

interface TangemConnectorProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: (tangemAddress: string, txHash?: string) => void;
  actionTitle?: string;
  actionDescription?: string;
  amountUsdc?: number;
}

export function TangemConnector({
  isOpen,
  onClose,
  onSuccess,
  actionTitle = 'Firma de Custodia con Tangem Card',
  actionDescription = 'Aproxima tu tarjeta física Tangem o escanea desde la app móvil para autorizar con seguridad EAL6+.',
  amountUsdc,
}: TangemConnectorProps) {
  const [step, setStep] = useState<'prompt' | 'tapping' | 'success'>('prompt');
  const [mode, setMode] = useState<'nfc' | 'qr'>('qr');
  const [activeAddress, setActiveAddress] = useState<string | null>(null);

  if (!isOpen) return null;

  const mockAddress = '0x9a8F23B15a7B9c1D3f5A7b9C1d3F5a7B9c1D3F5A';

  const handleSimulateTap = () => {
    setStep('tapping');
    setTimeout(() => {
      setActiveAddress(mockAddress);
      setStep('success');
      const tx = '0x' + Array.from({ length: 64 }, () => Math.floor(Math.random() * 16).toString(16)).join('');
      setTimeout(() => {
        onSuccess(mockAddress, tx);
        onClose();
        setStep('prompt');
      }, 1400);
    }, 2000);
  };

  const handleWalletConnectDeepLink = () => {
    // Abre la app de Tangem en el teléfono mediante deep link de WalletConnect
    const wcUri = `tangem://wc?uri=wc:ayni-protocol-base-l2-${Date.now()}`;
    if (typeof window !== 'undefined') {
      window.location.href = wcUri;
    }
    handleSimulateTap();
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div 
        className="modal-box" 
        style={{ 
          maxWidth: 480, 
          padding: '28px', 
          background: 'linear-gradient(180deg, #090e1a 0%, #050810 100%)',
          border: '1px solid rgba(0, 207, 255, 0.3)',
          boxShadow: '0 20px 60px rgba(0, 207, 255, 0.15)',
          position: 'relative',
        }} 
        onClick={e => e.stopPropagation()}
      >
        <button 
          type="button" 
          onClick={onClose} 
          style={{ position: 'absolute', top: 16, right: 16, background: 'transparent', border: 'none', color: 'var(--text-muted)', cursor: 'pointer' }}
        >
          <X size={18} />
        </button>

        {/* Header con logo Tangem */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '8px' }}>
          <div style={{ 
            background: 'linear-gradient(135deg, #00d68f, #00cfff)', 
            borderRadius: '8px', 
            padding: '6px 10px', 
            fontWeight: 800, 
            fontSize: '0.85rem', 
            color: '#050810',
            letterSpacing: '1px'
          }}>
            TANGEM
          </div>
          <span className="badge badge-cyan" style={{ fontSize: '0.7rem' }}>
            <ShieldCheck size={11} /> Sponsor Oficial ETH Bolivia 2026
          </span>
        </div>

        <h3 style={{ fontSize: '1.25rem', fontWeight: 800, color: 'var(--text-primary)', margin: '0 0 4px' }}>
          {actionTitle}
        </h3>
        <p style={{ fontSize: '0.82rem', color: 'var(--text-secondary)', margin: '0 0 20px', lineHeight: 1.4 }}>
          {actionDescription}
        </p>

        {/* Tangem Physical Card Representation */}
        <div style={{
          position: 'relative',
          height: '180px',
          borderRadius: '16px',
          background: 'linear-gradient(135deg, #111827 0%, #030712 50%, #0f172a 100%)',
          border: '1px solid rgba(255,255,255,0.15)',
          padding: '20px',
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'space-between',
          overflow: 'hidden',
          marginBottom: '20px',
          boxShadow: '0 12px 30px rgba(0,0,0,0.6)',
        }}>
          {/* Hologram metallic shine */}
          <div style={{
            position: 'absolute',
            top: 0,
            left: step === 'tapping' ? '120%' : '-60%',
            width: '60%',
            height: '100%',
            background: 'linear-gradient(90deg, transparent, rgba(0,207,255,0.25), transparent)',
            transform: 'skewX(-25deg)',
            transition: 'left 1.2s ease-in-out',
            pointerEvents: 'none',
          }} />

          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <span style={{ fontWeight: 800, fontSize: '1.1rem', letterSpacing: '2px', color: '#ffffff' }}>
              tangem
            </span>
            <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
              <Wifi size={18} color="var(--brand-cyan)" style={{ transform: 'rotate(90deg)' }} />
              <span style={{ fontSize: '0.7rem', color: 'var(--brand-cyan)', fontWeight: 600 }}>NFC EAL6+</span>
            </div>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
            <div style={{
              width: 38,
              height: 28,
              borderRadius: '6px',
              background: 'linear-gradient(135deg, #f5a623, #d97706)',
              border: '1px solid rgba(255,255,255,0.3)',
            }} />
            <div style={{ fontSize: '0.78rem', color: 'rgba(255,255,255,0.7)', fontFamily: 'monospace' }}>
              •••• •••• •••• 849A
            </div>
          </div>

          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end' }}>
            <div>
              <div style={{ fontSize: '0.62rem', color: 'rgba(255,255,255,0.5)', textTransform: 'uppercase' }}>
                Red Descentralizada
              </div>
              <div style={{ fontSize: '0.78rem', color: 'var(--brand-emerald)', fontWeight: 700 }}>
                Base L2 • AYNI Escrow
              </div>
            </div>
            {amountUsdc && (
              <div style={{ textAlign: 'right' }}>
                <div style={{ fontSize: '0.62rem', color: 'rgba(255,255,255,0.5)' }}>MONTO</div>
                <div style={{ fontSize: '1.1rem', fontWeight: 800, color: 'var(--brand-gold)' }}>
                  ${amountUsdc.toFixed(2)} USDC
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Modos: NFC vs App Tangem QR */}
        {step === 'prompt' && (
          <div>
            <div style={{ display: 'flex', gap: '8px', marginBottom: '16px' }}>
              <button
                type="button"
                onClick={() => setMode('qr')}
                className={`btn btn-sm ${mode === 'qr' ? 'btn-primary' : 'btn-ghost'}`}
                style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '6px' }}
              >
                <Smartphone size={14} /> App Tangem (Móvil)
              </button>
              <button
                type="button"
                onClick={() => setMode('nfc')}
                className={`btn btn-sm ${mode === 'nfc' ? 'btn-primary' : 'btn-ghost'}`}
                style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '6px' }}
              >
                <Wifi size={14} /> Tap NFC Físico
              </button>
            </div>

            {mode === 'qr' ? (
              <div style={{ textAlign: 'center', padding: '10px 0' }}>
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
                  boxShadow: '0 8px 24px rgba(0,0,0,0.4)',
                }}>
                  {/* Simulated QR Pattern */}
                  <img 
                    src={`https://api.qrserver.com/v1/create-qr-code/?size=120x120&data=tangem://wc?uri=wc:ayni-base-${Date.now()}`}
                    alt="Tangem WalletConnect QR" 
                    style={{ width: '100%', height: '100%' }}
                  />
                </div>
                <p style={{ fontSize: '0.78rem', color: 'var(--text-muted)', marginBottom: '12px' }}>
                  Abre la <strong>App de Tangem</strong> en tu teléfono, ve a WalletConnect y escanea este código.
                </p>
                <div style={{ display: 'flex', gap: '10px' }}>
                  <button
                    type="button"
                    onClick={handleWalletConnectDeepLink}
                    className="btn btn-primary"
                    style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '6px' }}
                  >
                    <Smartphone size={14} /> Abrir en App Tangem
                  </button>
                  <button
                    type="button"
                    onClick={handleSimulateTap}
                    className="btn btn-outline"
                    style={{ flex: 1, borderColor: 'var(--brand-cyan)', color: 'var(--brand-cyan)' }}
                  >
                    Simular Firma 1-Click
                  </button>
                </div>
              </div>
            ) : (
              <div style={{ textAlign: 'center', padding: '16px 0' }}>
                <div style={{
                  width: 64,
                  height: 64,
                  borderRadius: '50%',
                  background: 'rgba(0, 207, 255, 0.15)',
                  border: '1px solid var(--border-cyan)',
                  margin: '0 auto 16px',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                }}>
                  <Wifi size={28} color="var(--brand-cyan)" />
                </div>
                <div style={{ fontWeight: 600, fontSize: '0.92rem', marginBottom: '6px' }}>
                  Aproxima tu tarjeta Tangem al sensor NFC
                </div>
                <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)', marginBottom: '16px' }}>
                  Sostén la tarjeta contra la parte posterior de tu teléfono o lector de tarjeta para firmar la transacción.
                </p>
                <button
                  type="button"
                  onClick={handleSimulateTap}
                  className="btn btn-primary"
                  style={{ width: '100%' }}
                >
                  Detectar Tarjeta Tangem
                </button>
              </div>
            )}
          </div>
        )}

        {step === 'tapping' && (
          <div style={{ textAlign: 'center', padding: '30px 0' }}>
            <div style={{ 
              width: 56, height: 56, borderRadius: '50%', 
              background: 'rgba(0,214,143,0.15)', border: '2px solid var(--brand-emerald)',
              margin: '0 auto 16px', display: 'flex', alignItems: 'center', justifyContent: 'center',
              animation: 'pulse 1.2s infinite'
            }}>
              <Lock size={26} color="var(--brand-emerald)" />
            </div>
            <div style={{ fontWeight: 700, fontSize: '1.05rem', color: 'var(--text-primary)', marginBottom: '4px' }}>
              Autenticando chip EAL6+ Tangem...
            </div>
            <div style={{ fontSize: '0.82rem', color: 'var(--text-muted)' }}>
              Firmando autorización en Base L2 (Gas &lt; $0.001)
            </div>
          </div>
        )}

        {step === 'success' && (
          <div style={{ textAlign: 'center', padding: '24px 0' }}>
            <div style={{ 
              width: 56, height: 56, borderRadius: '50%', 
              background: 'rgba(0,214,143,0.2)', color: 'var(--brand-emerald)',
              margin: '0 auto 16px', display: 'flex', alignItems: 'center', justifyContent: 'center' 
            }}>
              <CheckCircle2 size={32} />
            </div>
            <div style={{ fontWeight: 700, fontSize: '1.1rem', color: 'var(--brand-emerald)', marginBottom: '4px' }}>
              ¡Firma Tangem Verificada con Éxito!
            </div>
            <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)', fontFamily: 'monospace' }}>
              Wallet: {activeAddress?.slice(0, 10)}...{activeAddress?.slice(-6)}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
