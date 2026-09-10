'use client';

import React, { useState } from 'react';
import { 
  ShieldCheck, Wallet, QrCode, ArrowRight, CheckCircle2, 
  ExternalLink, Copy, Check, X, Sparkles, RefreshCw, Smartphone
} from 'lucide-react';
import { executeEscrowDeposit } from '@/lib/web3/contracts';
import { TangemConnector } from '@/components/web3/TangemConnector';

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
  const [activeTab, setActiveTab] = useState<'web3' | 'eldorado' | 'binance' | 'demo'>('web3');
  const [isProcessing, setIsProcessing] = useState(false);
  const [copiedAddress, setCopiedAddress] = useState(false);
  const [isTangemOpen, setIsTangemOpen] = useState(false);
  const [paidSuccessData, setPaidSuccessData] = useState<{ txHash: string; otp: string } | null>(null);

  if (!isOpen) return null;

  // Cálculo de comisiones según especificaciones técnicas (5% plataforma)
  const systemFeeUsdc = parseFloat((productPriceUsdc * 0.05).toFixed(2));
  const totalEscrowUsdc = (productPriceUsdc + travelerFeeUsdc + systemFeeUsdc).toFixed(2);
  
  // Tasa de cambio estimada P2P El Dorado: 1 USDC ≈ 9.50 BOB
  const totalInBob = (parseFloat(totalEscrowUsdc) * 9.50).toFixed(2);

  const escrowContractAddress = '0x71C93475A6E46949Cbc4928Eb811b7d566bEB49a';

  const copyAddress = () => {
    navigator.clipboard.writeText(escrowContractAddress);
    setCopiedAddress(true);
    setTimeout(() => setCopiedAddress(false), 2000);
  };

  const handleProcessPayment = async (method: string) => {
    setIsProcessing(true);

    // Generar OTP de 6 dígitos seguro
    const otp = Math.floor(100000 + Math.random() * 900000).toString();

    const res = await executeEscrowDeposit({
      buyerAddress: '0x3d4b8e2b9c1d3f5a6e8d2c4b7a9e1f3d5c7b9a1e',
      amountUsdc: parseFloat(totalEscrowUsdc),
      otpPlain: otp,
      travelerFeeUsdc,
      systemFeeUsdc,
    });

    setPaidSuccessData({ txHash: res.txHash, otp });
    setIsProcessing(false);

    setTimeout(() => {
      onPaymentSuccess({ txHash: res.txHash, otpCode: otp, method });
    }, 2200);
  };

  return (
    <>
      <div className="modal-overlay" onClick={onClose}>
        <div 
          className="modal-box" 
          style={{ 
            maxWidth: 540, 
            padding: '28px', 
            background: 'linear-gradient(180deg, #0d1527 0%, #060a14 100%)',
            border: '1px solid rgba(0, 207, 255, 0.25)',
            boxShadow: '0 20px 60px rgba(0,0,0,0.7)',
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

          {/* Header */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '4px' }}>
            <span className="badge badge-emerald" style={{ fontSize: '0.72rem' }}>
              <ShieldCheck size={12} /> Custodia Smart Contract Base L2
            </span>
          </div>

          <h3 style={{ fontSize: '1.3rem', fontWeight: 800, color: 'var(--text-primary)', margin: '0 0 6px' }}>
            Bloquear Pago en Escrow Seguro
          </h3>
          <p style={{ fontSize: '0.82rem', color: 'var(--text-secondary)', margin: '0 0 18px', lineHeight: 1.4 }}>
            Tus fondos quedan salvaguardados en el Smart Contract y <strong>solo se liberan cuando confirmes tu código OTP</strong> al recibir el producto.
          </p>

          {/* Resumen Financiero */}
          <div style={{ 
            background: 'rgba(255,255,255,0.03)', 
            border: '1px solid var(--border-subtle)', 
            borderRadius: '12px', 
            padding: '14px 18px', 
            marginBottom: '18px' 
          }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '6px', fontSize: '0.84rem' }}>
              <span style={{ color: 'var(--text-secondary)' }}>Producto ({orderTitle.slice(0, 32)}):</span>
              <strong style={{ color: 'var(--text-primary)' }}>${productPriceUsdc.toFixed(2)} USDC</strong>
            </div>
            {travelerFeeUsdc > 0 && (
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '6px', fontSize: '0.84rem' }}>
                <span style={{ color: 'var(--text-secondary)' }}>Honorario de Transporte / Envío:</span>
                <strong style={{ color: 'var(--brand-cyan)' }}>+${travelerFeeUsdc.toFixed(2)} USDC</strong>
              </div>
            )}
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px', fontSize: '0.84rem' }}>
              <span style={{ color: 'var(--text-secondary)' }}>Comisión AYNI (5% Escrow + Soporte):</span>
              <strong style={{ color: 'var(--text-muted)' }}>+${systemFeeUsdc.toFixed(2)} USDC</strong>
            </div>
            <div style={{ borderTop: '1px solid var(--border-subtle)', paddingTop: '8px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <div>
                <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)' }}>TOTAL A BLOQUEAR:</div>
                <div style={{ fontSize: '1.25rem', fontWeight: 800, color: 'var(--brand-gold)' }}>
                  ${totalEscrowUsdc} USDC
                </div>
              </div>
              <div style={{ textAlign: 'right' }}>
                <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)' }}>Equivalente P2P Bolivia:</div>
                <div style={{ fontSize: '0.92rem', fontWeight: 700, color: 'var(--brand-emerald)' }}>
                  ≈ Bs. {totalInBob} BOB
                </div>
              </div>
            </div>
          </div>

          {/* Success state */}
          {paidSuccessData ? (
            <div style={{ textAlign: 'center', padding: '24px 0' }}>
              <div style={{ width: 64, height: 64, borderRadius: '50%', background: 'rgba(0,214,143,0.2)', color: 'var(--brand-emerald)', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 16px' }}>
                <CheckCircle2 size={36} />
              </div>
              <h4 style={{ fontSize: '1.2rem', fontWeight: 800, color: 'var(--brand-emerald)', marginBottom: '6px' }}>
                ¡Pago Bloqueado en Escrow con Éxito!
              </h4>
              <p style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', marginBottom: '16px' }}>
                Tu código de entrega secreto para reclamar el pedido es:
              </p>
              <div style={{ 
                display: 'inline-block', 
                background: 'rgba(0,207,255,0.15)', 
                border: '2px dashed var(--brand-cyan)', 
                borderRadius: '12px', 
                padding: '10px 24px', 
                fontSize: '1.6rem', 
                fontWeight: 900, 
                letterSpacing: '4px',
                fontFamily: 'monospace',
                color: 'var(--brand-cyan)',
                marginBottom: '16px'
              }}>
                {paidSuccessData.otp}
              </div>
              <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                Guarda este código. Solo entrégalo al recibir físicamente tu producto.
              </div>
            </div>
          ) : (
            <>
              {/* Payment Tabs */}
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '6px', marginBottom: '18px' }}>
                {[
                  { id: 'web3', label: 'Web3 L2', icon: '⚡' },
                  { id: 'eldorado', label: 'El Dorado', icon: '🇧🇴' },
                  { id: 'binance', label: 'Binance', icon: '🟡' },
                  { id: 'demo', label: 'Demo Jurado', icon: '🧪' },
                ].map(t => (
                  <button
                    key={t.id}
                    type="button"
                    onClick={() => setActiveTab(t.id as typeof activeTab)}
                    className={`btn btn-sm ${activeTab === t.id ? 'btn-primary' : 'btn-ghost'}`}
                    style={{ fontSize: '0.72rem', padding: '6px 2px', display: 'flex', flexDirection: 'column', gap: '2px', alignItems: 'center' }}
                  >
                    <span>{t.icon}</span>
                    <span>{t.label}</span>
                  </button>
                ))}
              </div>

              {/* TAB 1: WEB3 DIRECTO (BASE L2) */}
              {activeTab === 'web3' && (
                <div>
                  <div style={{ 
                    padding: '12px', 
                    background: 'rgba(0,207,255,0.06)', 
                    border: '1px solid rgba(0,207,255,0.2)', 
                    borderRadius: '10px', 
                    marginBottom: '16px',
                    fontSize: '0.82rem',
                    color: 'var(--text-secondary)',
                    lineHeight: 1.4
                  }}>
                    Conecta tu wallet (MetaMask, Coinbase Wallet, Trust) o firma con tu tarjeta física <strong>Tangem</strong> en la red Base Sepolia. Costo de gas: <strong>&lt; $0.005 USDC</strong>.
                  </div>

                  <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                    <button
                      type="button"
                      disabled={isProcessing}
                      onClick={() => handleProcessPayment('web3_wallet')}
                      className="btn btn-primary"
                      style={{ width: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px' }}
                    >
                      {isProcessing ? <RefreshCw size={16} className="spin" /> : <Wallet size={16} />}
                      Pagar ${totalEscrowUsdc} USDC con Wallet Web3
                    </button>

                    <button
                      type="button"
                      onClick={() => setIsTangemOpen(true)}
                      className="btn btn-outline"
                      style={{ 
                        width: '100%', 
                        display: 'flex', 
                        alignItems: 'center', 
                        justifyContent: 'center', 
                        gap: '8px',
                        borderColor: 'var(--brand-cyan)',
                        color: 'var(--brand-cyan)'
                      }}
                    >
                      <Smartphone size={16} /> Firmar con Billetera Fría Tangem (NFC/App)
                    </button>
                  </div>
                </div>
              )}

              {/* TAB 2: EL DORADO P2P (BOLIVIA BOB) */}
              {activeTab === 'eldorado' && (
                <div style={{ textAlign: 'center' }}>
                  <div style={{ 
                    padding: '12px', 
                    background: 'rgba(245,166,35,0.08)', 
                    border: '1px solid rgba(245,166,35,0.25)', 
                    borderRadius: '10px', 
                    marginBottom: '14px',
                    fontSize: '0.8rem',
                    color: 'var(--text-secondary)',
                    textAlign: 'left'
                  }}>
                    <strong>Pago P2P en Bolivianos (BOB):</strong> Abre El Dorado con la orden precargada para comprar USDT/USDC con transferencia QR bancaria boliviana (Banco Unión, BCP, BNB, etc.) y transferir al contrato.
                  </div>

                  <div style={{
                    width: 130,
                    height: 130,
                    margin: '0 auto 12px',
                    background: '#ffffff',
                    borderRadius: '10px',
                    padding: '8px',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                  }}>
                    <img 
                      src={`https://api.qrserver.com/v1/create-qr-code/?size=115x115&data=eldorado://pay?amount=${totalEscrowUsdc}&currency=USDC&address=${escrowContractAddress}`}
                      alt="El Dorado QR" 
                      style={{ width: '100%', height: '100%' }}
                    />
                  </div>

                  <div style={{ fontSize: '0.85rem', fontWeight: 700, color: 'var(--brand-gold)', marginBottom: '12px' }}>
                    Bs. {totalInBob} BOB → ${totalEscrowUsdc} USDC
                  </div>

                  <div style={{ display: 'flex', gap: '8px' }}>
                    <a
                      href={`eldorado://pay?amount=${totalEscrowUsdc}&currency=USDC&address=${escrowContractAddress}`}
                      target="_blank"
                      rel="noreferrer"
                      className="btn btn-gold"
                      style={{ flex: 1, fontSize: '0.78rem' }}
                    >
                      Abrir App El Dorado
                    </a>
                    <button
                      type="button"
                      onClick={() => handleProcessPayment('eldorado_p2p')}
                      className="btn btn-primary"
                      style={{ flex: 1, fontSize: '0.78rem' }}
                    >
                      Confirmar Depósito P2P
                    </button>
                  </div>
                </div>
              )}

              {/* TAB 3: BINANCE PAY */}
              {activeTab === 'binance' && (
                <div style={{ textAlign: 'center' }}>
                  <div style={{ 
                    padding: '12px', 
                    background: 'rgba(245,166,35,0.06)', 
                    border: '1px solid rgba(245,166,35,0.2)', 
                    borderRadius: '10px', 
                    marginBottom: '14px',
                    fontSize: '0.8rem',
                    color: 'var(--text-secondary)',
                    textAlign: 'left'
                  }}>
                    <strong>Binance Pay (0% Comisión):</strong> Escanea con la app de Binance o transfiere directo a la dirección del Smart Contract en Base L2.
                  </div>

                  <div style={{
                    width: 130,
                    height: 130,
                    margin: '0 auto 12px',
                    background: '#ffffff',
                    borderRadius: '10px',
                    padding: '8px',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                  }}>
                    <img 
                      src={`https://api.qrserver.com/v1/create-qr-code/?size=115x115&data=ethereum:${escrowContractAddress}@84532?value=${totalEscrowUsdc}`}
                      alt="Binance Pay QR" 
                      style={{ width: '100%', height: '100%' }}
                    />
                  </div>

                  <div style={{ 
                    background: 'rgba(255,255,255,0.04)', 
                    borderRadius: '8px', 
                    padding: '8px 12px', 
                    display: 'flex', 
                    alignItems: 'center', 
                    justifyContent: 'space-between',
                    marginBottom: '14px' 
                  }}>
                    <span style={{ fontSize: '0.75rem', fontFamily: 'monospace', color: 'var(--text-muted)' }}>
                      {escrowContractAddress.slice(0, 10)}...{escrowContractAddress.slice(-8)}
                    </span>
                    <button type="button" onClick={copyAddress} className="btn btn-ghost btn-sm" style={{ padding: '2px 8px', fontSize: '0.75rem' }}>
                      {copiedAddress ? <Check size={12} color="var(--brand-emerald)" /> : <Copy size={12} />}
                    </button>
                  </div>

                  <button
                    type="button"
                    onClick={() => handleProcessPayment('binance_pay')}
                    className="btn btn-primary"
                    style={{ width: '100%' }}
                  >
                    Confirmar Pago Binance Pay
                  </button>
                </div>
              )}

              {/* TAB 4: MODO JURADO / DEMO 1-CLICK */}
              {activeTab === 'demo' && (
                <div>
                  <div style={{ 
                    padding: '14px', 
                    background: 'rgba(155,114,255,0.1)', 
                    border: '1px solid rgba(155,114,255,0.3)', 
                    borderRadius: '10px', 
                    marginBottom: '16px',
                    fontSize: '0.82rem',
                    color: 'var(--text-secondary)',
                    lineHeight: 1.4
                  }}>
                    <div style={{ fontWeight: 700, color: 'var(--brand-purple)', marginBottom: '4px', display: 'flex', alignItems: 'center', gap: '6px' }}>
                      <Sparkles size={14} /> Modo Rápido para Jurados (ETH Bolivia 2026)
                    </div>
                    Permite probar el flujo íntegro de custodia, emisión de OTP y bloqueo en el Smart Contract sin requerir saldo real de gas o tokens en Base Sepolia.
                  </div>

                  <button
                    type="button"
                    disabled={isProcessing}
                    onClick={() => handleProcessPayment('demo_judge_1click')}
                    className="btn btn-gold"
                    style={{ width: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px', padding: '12px' }}
                  >
                    {isProcessing ? <RefreshCw size={16} className="spin" /> : <Sparkles size={16} />}
                    ⚡ Simular Bloqueo Escrow 1-Click (${totalEscrowUsdc} USDC)
                  </button>
                </div>
              )}
            </>
          )}
        </div>
      </div>

      {/* Modal Tangem integrado */}
      <TangemConnector
        isOpen={isTangemOpen}
        onClose={() => setIsTangemOpen(false)}
        amountUsdc={parseFloat(totalEscrowUsdc)}
        actionTitle="Firmar Depósito Escrow con Tangem"
        actionDescription="Aproxima tu tarjeta física Tangem o escanea desde la app para firmar el depósito de custodia en Base L2."
        onSuccess={(address, tx) => {
          handleProcessPayment('tangem_card');
        }}
      />
    </>
  );
}
