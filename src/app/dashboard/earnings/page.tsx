'use client';

import React, { useState } from 'react';
import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { useAuth } from '@/context/AuthContext';
import {
  TrendingUp, DollarSign, Wallet, ArrowUpRight, CheckCircle2,
  Calendar, ShieldCheck, Download, Sparkles
} from 'lucide-react';

const EARNINGS_HISTORY = [
  {
    id: 'PAY-892',
    date: 'Sep 06, 2026',
    description: 'Comisión por entrega — Orden #AYN-2026-001 (Condimentos Diáspora)',
    route: 'Madrid → La Paz',
    amount: 15.00,
    status: 'liquidated',
    txHash: '0x8f2a...c31b',
  },
  {
    id: 'PAY-884',
    date: 'Ago 28, 2026',
    description: 'Honorarios transporte equipaje — Kit Implante Dental Titanio',
    route: 'Madrid → La Paz',
    amount: 32.50,
    status: 'liquidated',
    txHash: '0x1b4e...77a9',
  },
  {
    id: 'PAY-871',
    date: 'Ago 14, 2026',
    description: 'Compra en mostrador asistida — Lente Canon 50mm FNAC',
    route: 'Miami → Santa Cruz',
    amount: 28.00,
    status: 'liquidated',
    txHash: '0x49de...e201',
  },
];

export default function EarningsPage() {
  const { user, role } = useAuth();
  const [withdrawing, setWithdrawing] = useState(false);
  const [withdrawSuccess, setWithdrawSuccess] = useState(false);

  const handleWithdraw = () => {
    setWithdrawing(true);
    setTimeout(() => {
      setWithdrawing(false);
      setWithdrawSuccess(true);
      setTimeout(() => setWithdrawSuccess(false), 4000);
    }, 1200);
  };

  return (
    <DashboardLayout>
      {/* Header */}
      <div className="page-header">
        <div className="page-title-group">
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '4px' }}>
            <div className="page-title">Mis Ganancias & Liquidaciones</div>
            <span className="badge badge-emerald">
              <Sparkles size={11} /> Base L2 Liquidación Inmediata
            </span>
          </div>
          <div className="page-subtitle">
            Ingresos generados por transporte de equipaje, comisiones P2P y ventas en el marketplace.
          </div>
        </div>
        <button
          type="button"
          onClick={handleWithdraw}
          disabled={withdrawing}
          className="btn btn-gold"
        >
          <Wallet size={16} /> {withdrawing ? 'Transfiriendo...' : 'Retirar a Billetera EVM'}
        </button>
      </div>

      {withdrawSuccess && (
        <div className="alert alert-success" style={{ marginBottom: '24px' }}>
          <CheckCircle2 size={16} /> ¡Retiro exitoso! Los fondos fueron transferidos a tu wallet configurada en Base L2.
        </div>
      )}

      {/* Overview Cards */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))',
        gap: '16px',
        marginBottom: '28px',
      }}>
        <div className="card" style={{ padding: '22px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
            <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>Saldo Disponible</span>
            <DollarSign size={18} color="var(--brand-emerald)" />
          </div>
          <div style={{ fontSize: '2rem', fontWeight: 800, color: 'var(--brand-emerald)', fontFamily: 'var(--font-display)' }}>
            $342.50
          </div>
          <div style={{ fontSize: '0.75rem', color: 'var(--brand-cyan)', marginTop: '4px' }}>
            ● Listo para retiro a USDC en Base L2
          </div>
        </div>

        <div className="card" style={{ padding: '22px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
            <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>En Custodia Escrow Activa</span>
            <ShieldCheck size={18} color="var(--brand-gold)" />
          </div>
          <div style={{ fontSize: '2rem', fontWeight: 800, color: 'var(--brand-gold)', fontFamily: 'var(--font-display)' }}>
            $85.00
          </div>
          <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginTop: '4px' }}>
            Se liberará al validar con código OTP
          </div>
        </div>

        <div className="card" style={{ padding: '22px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
            <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>Total Histórico Generado</span>
            <TrendingUp size={18} color="var(--brand-cyan)" />
          </div>
          <div style={{ fontSize: '2rem', fontWeight: 800, color: 'var(--brand-cyan)', fontFamily: 'var(--font-display)' }}>
            $1,890.00
          </div>
          <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginTop: '4px' }}>
            En 24 entregas exitosas
          </div>
        </div>
      </div>

      {/* Transactions Table */}
      <div className="card" style={{ padding: '24px' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
          <div>
            <h3 style={{ fontSize: '1.1rem', fontWeight: 700, margin: '0 0 4px' }}>
              Historial de Pagos y Liquidaciones
            </h3>
            <p style={{ fontSize: '0.82rem', color: 'var(--text-secondary)', margin: 0 }}>
              Registro inmutable de comisiones pagadas a través de Smart Contracts.
            </p>
          </div>
        </div>

        <div style={{ overflowX: 'auto' }}>
          <table className="table" style={{ width: '100%' }}>
            <thead>
              <tr>
                <th>Referencia</th>
                <th>Fecha</th>
                <th>Concepto / Ruta</th>
                <th>Hash Transacción L2</th>
                <th style={{ textAlign: 'right' }}>Monto Neto</th>
                <th>Estado</th>
              </tr>
            </thead>
            <tbody>
              {EARNINGS_HISTORY.map(p => (
                <tr key={p.id}>
                  <td style={{ fontWeight: 600, color: 'var(--brand-cyan)' }}>#{p.id}</td>
                  <td style={{ fontSize: '0.82rem', color: 'var(--text-muted)' }}>{p.date}</td>
                  <td>
                    <div style={{ fontWeight: 600, color: 'var(--text-primary)' }}>{p.description}</div>
                    <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)' }}>{p.route}</div>
                  </td>
                  <td>
                    <span style={{ fontFamily: 'monospace', fontSize: '0.75rem', color: 'var(--text-secondary)' }}>
                      {p.txHash}
                    </span>
                  </td>
                  <td style={{ textAlign: 'right', fontWeight: 700, color: 'var(--brand-emerald)', fontFamily: 'var(--font-display)' }}>
                    +${p.amount.toFixed(2)} USDC
                  </td>
                  <td>
                    <span className="badge badge-emerald" style={{ fontSize: '0.7rem' }}>
                      ✓ Liquidado
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </DashboardLayout>
  );
}
