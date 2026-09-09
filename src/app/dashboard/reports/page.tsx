'use client';

import React from 'react';
import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { BarChart3, ShieldCheck, Sparkles, CheckCircle2, AlertTriangle, FileText } from 'lucide-react';

const RECENT_AUDITS = [
  {
    id: 'AUD-104',
    orderId: 'AYN-2026-001',
    merchant: 'Sabores & Especias del Valle',
    detectedAmount: 38.00,
    expectedAmount: 38.00,
    confidence: '99.4%',
    status: 'approved',
    date: 'Sep 08, 2026',
  },
  {
    id: 'AUD-103',
    orderId: 'ORD-001',
    merchant: 'MedTech Europa SL',
    detectedAmount: 370.00,
    expectedAmount: 374.00,
    confidence: '98.1%',
    status: 'approved',
    date: 'Sep 07, 2026',
  },
  {
    id: 'AUD-102',
    orderId: 'ORD-002',
    merchant: 'FNAC Callao',
    detectedAmount: 195.00,
    expectedAmount: 197.40,
    confidence: '97.6%',
    status: 'approved',
    date: 'Sep 05, 2026',
  },
];

export default function ReportsPage() {
  return (
    <DashboardLayout>
      <div className="page-header">
        <div className="page-title-group">
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '4px' }}>
            <div className="page-title">Reportes & Auditoría IA</div>
            <span className="badge badge-purple">
              <Sparkles size={11} /> Google Gemini Vision Pipeline
            </span>
          </div>
          <div className="page-subtitle">
            Monitoreo en tiempo real de facturas escaneadas, OCR aduanero y validaciones de Escrow.
          </div>
        </div>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '16px', marginBottom: '28px' }}>
        <div className="card" style={{ padding: '20px' }}>
          <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>Facturas Auditadas (30d)</div>
          <div style={{ fontSize: '2rem', fontWeight: 800, color: 'var(--brand-cyan)', fontFamily: 'var(--font-display)', marginTop: '4px' }}>148</div>
          <div style={{ fontSize: '0.75rem', color: 'var(--brand-emerald)', marginTop: '4px' }}>99.2% concordancia con comercio</div>
        </div>
        <div className="card" style={{ padding: '20px' }}>
          <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>Monto Total Auditado</div>
          <div style={{ fontSize: '2rem', fontWeight: 800, color: 'var(--brand-gold)', fontFamily: 'var(--font-display)', marginTop: '4px' }}>$28,420</div>
          <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginTop: '4px' }}>Fondos Escrow liquidados</div>
        </div>
        <div className="card" style={{ padding: '20px' }}>
          <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>Alertas de Discrepancia</div>
          <div style={{ fontSize: '2rem', fontWeight: 800, color: 'var(--brand-emerald)', fontFamily: 'var(--font-display)', marginTop: '4px' }}>0</div>
          <div style={{ fontSize: '0.75rem', color: 'var(--brand-emerald)', marginTop: '4px' }}>Red libre de fraudes</div>
        </div>
      </div>

      <div className="card" style={{ padding: '24px' }}>
        <h3 style={{ fontSize: '1.1rem', fontWeight: 700, marginBottom: '16px' }}>Registro de Facturas Procesadas por IA</h3>
        <div style={{ overflowX: 'auto' }}>
          <table className="table" style={{ width: '100%' }}>
            <thead>
              <tr>
                <th>ID Auditoría</th>
                <th>Orden</th>
                <th>Comercio Detectado</th>
                <th>Monto Factura</th>
                <th>Score Confianza IA</th>
                <th>Estado</th>
              </tr>
            </thead>
            <tbody>
              {RECENT_AUDITS.map(a => (
                <tr key={a.id}>
                  <td style={{ fontWeight: 600, color: 'var(--brand-purple)' }}>{a.id}</td>
                  <td><span style={{ color: 'var(--brand-cyan)' }}>#{a.orderId}</span></td>
                  <td>{a.merchant}</td>
                  <td style={{ fontWeight: 700 }}>${a.detectedAmount.toFixed(2)} USD</td>
                  <td><span className="badge badge-cyan">{a.confidence}</span></td>
                  <td><span className="badge badge-emerald">✓ Aprobado</span></td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </DashboardLayout>
  );
}
