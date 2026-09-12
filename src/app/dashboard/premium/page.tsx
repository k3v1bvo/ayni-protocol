'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { Paywall } from '@unlock-protocol/paywall';
import { networks } from '@unlock-protocol/networks';
import { hasValidMembership, UNLOCK_LOCK_ADDRESS, UNLOCK_NETWORK_ID } from '@/lib/web3/unlock';
import {
  Lock, LockOpen, Sparkles, ShieldCheck, Crown, Wallet,
  CheckCircle2, RefreshCw, AlertTriangle, Gem, TrendingUp, Headset,
} from 'lucide-react';

export default function PremiumPage() {
  const [walletAddress, setWalletAddress] = useState<string | null>(null);
  const [connecting, setConnecting] = useState(false);
  const [checking, setChecking] = useState(false);
  const [hasMembership, setHasMembership] = useState(false);
  const [buying, setBuying] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const checkMembership = useCallback(async (address: string) => {
    setChecking(true);
    try {
      const valid = await hasValidMembership(address);
      setHasMembership(valid);
    } finally {
      setChecking(false);
    }
  }, []);

  useEffect(() => {
    if (walletAddress) checkMembership(walletAddress);
  }, [walletAddress, checkMembership]);

  const handleConnectWallet = async () => {
    setError(null);
    if (typeof window === 'undefined' || !(window as any).ethereum) {
      setError('No se detectó una wallet EVM (MetaMask, Rabby, etc.) instalada en tu navegador.');
      return;
    }
    setConnecting(true);
    try {
      const accounts: string[] = await (window as any).ethereum.request({ method: 'eth_requestAccounts' });
      if (accounts?.[0]) setWalletAddress(accounts[0]);
    } catch (err: any) {
      setError(err?.message || 'No se pudo conectar la wallet.');
    } finally {
      setConnecting(false);
    }
  };

  const handleBuyMembership = async () => {
    if (!UNLOCK_LOCK_ADDRESS) {
      setError('El Lock de membresía todavía no está desplegado en Base Sepolia.');
      return;
    }
    setError(null);
    setBuying(true);
    try {
      const paywall = new Paywall(networks as any);
      await paywall.loadCheckoutModal({
        locks: {
          [UNLOCK_LOCK_ADDRESS]: { network: UNLOCK_NETWORK_ID },
        },
        pessimistic: true,
      } as any);
      if (walletAddress) await checkMembership(walletAddress);
    } catch (err: any) {
      setError(err?.message || 'No se pudo completar la compra de la membresía.');
    } finally {
      setBuying(false);
    }
  };

  return (
    <DashboardLayout>
      <div className="page-header">
        <div className="page-title-group">
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '4px' }}>
            <div className="page-title">Contenido Premium AYNI</div>
            <span className="badge badge-purple">
              <Sparkles size={11} /> Unlock Protocol · Base Sepolia
            </span>
          </div>
          <div className="page-subtitle">
            Membresía token-gated: una llave NFT en tu wallet desbloquea beneficios exclusivos, verificado 100% on-chain.
          </div>
        </div>
      </div>

      {error && (
        <div className="alert alert-error" style={{ marginBottom: '20px', display: 'flex', alignItems: 'center', gap: '8px' }}>
          <AlertTriangle size={16} /> {error}
        </div>
      )}

      {!UNLOCK_LOCK_ADDRESS && (
        <div className="alert alert-warning" style={{ marginBottom: '20px', display: 'flex', alignItems: 'center', gap: '8px' }}>
          <AlertTriangle size={16} /> Falta configurar <code>NEXT_PUBLIC_UNLOCK_LOCK_ADDRESS</code> con el Lock desplegado.
        </div>
      )}

      {!walletAddress ? (
        <div className="card" style={{ padding: '40px', textAlign: 'center' }}>
          <Lock size={40} color="var(--brand-purple, #a78bfa)" style={{ marginBottom: '14px' }} />
          <h3 style={{ fontSize: '1.2rem', fontWeight: 800, margin: '0 0 8px' }}>
            Conecta tu wallet para ver tu membresía
          </h3>
          <p style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', margin: '0 0 20px', maxWidth: '420px', marginLeft: 'auto', marginRight: 'auto' }}>
            Verificamos on-chain, en tiempo real, si tu wallet tiene la llave NFT de membresía Premium de AYNI.
          </p>
          <button type="button" onClick={handleConnectWallet} disabled={connecting} className="btn btn-primary">
            <Wallet size={16} /> {connecting ? 'Conectando...' : 'Conectar Wallet'}
          </button>
        </div>
      ) : checking ? (
        <div className="card" style={{ padding: '40px', textAlign: 'center' }}>
          <RefreshCw size={28} className="spin" color="var(--brand-cyan)" style={{ marginBottom: '10px' }} />
          <p style={{ color: 'var(--text-secondary)' }}>Verificando membresía on-chain...</p>
        </div>
      ) : hasMembership ? (
        <>
          <div className="alert alert-success" style={{ marginBottom: '24px', display: 'flex', alignItems: 'center', gap: '8px' }}>
            <CheckCircle2 size={16} /> Membresía verificada on-chain — bienvenido al círculo Premium AYNI.
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: '16px' }}>
            <div className="card" style={{ padding: '22px' }}>
              <LockOpen size={22} color="var(--brand-emerald)" style={{ marginBottom: '10px' }} />
              <h4 style={{ margin: '0 0 6px', fontSize: '1rem', fontWeight: 700 }}>Comisión Escrow reducida</h4>
              <p style={{ fontSize: '0.82rem', color: 'var(--text-secondary)', margin: 0 }}>
                4% en vez de 5% en todos tus encargos, de por vida mientras tu llave esté vigente.
              </p>
            </div>
            <div className="card" style={{ padding: '22px' }}>
              <Gem size={22} color="var(--brand-gold)" style={{ marginBottom: '10px' }} />
              <h4 style={{ margin: '0 0 6px', fontSize: '1rem', fontWeight: 700 }}>Acceso anticipado al Marketplace</h4>
              <p style={{ fontSize: '0.82rem', color: 'var(--text-secondary)', margin: 0 }}>
                Reserva productos de diáspora en preventa, antes que el resto de la comunidad.
              </p>
            </div>
            <div className="card" style={{ padding: '22px' }}>
              <Headset size={22} color="var(--brand-cyan)" style={{ marginBottom: '10px' }} />
              <h4 style={{ margin: '0 0 6px', fontSize: '1rem', fontWeight: 700 }}>Soporte prioritario</h4>
              <p style={{ fontSize: '0.82rem', color: 'var(--text-secondary)', margin: 0 }}>
                Línea directa con el equipo de disputas y auditoría IA para tus encargos.
              </p>
            </div>
            <div className="card" style={{ padding: '22px' }}>
              <TrendingUp size={22} color="var(--brand-purple, #a78bfa)" style={{ marginBottom: '10px' }} />
              <h4 style={{ margin: '0 0 6px', fontSize: '1rem', fontWeight: 700 }}>Reportes financieros avanzados</h4>
              <p style={{ fontSize: '0.82rem', color: 'var(--text-secondary)', margin: 0 }}>
                Exporta tu historial de ganancias y liquidaciones on-chain en cualquier momento.
              </p>
            </div>
          </div>
        </>
      ) : (
        <div className="card" style={{ padding: '40px', textAlign: 'center' }}>
          <Crown size={40} color="var(--brand-gold)" style={{ marginBottom: '14px' }} />
          <h3 style={{ fontSize: '1.2rem', fontWeight: 800, margin: '0 0 8px' }}>
            Todavía no tienes la membresía Premium
          </h3>
          <p style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', margin: '0 0 20px', maxWidth: '460px', marginLeft: 'auto', marginRight: 'auto' }}>
            Compra la llave NFT una sola vez (Base Sepolia) y desbloquea comisión reducida, acceso anticipado
            al marketplace y soporte prioritario — todo verificado on-chain, sin contraseñas ni cuentas.
          </p>
          <button type="button" onClick={handleBuyMembership} disabled={buying || !UNLOCK_LOCK_ADDRESS} className="btn btn-gold">
            <ShieldCheck size={16} /> {buying ? 'Abriendo checkout...' : 'Comprar Membresía Premium'}
          </button>
        </div>
      )}
    </DashboardLayout>
  );
}
