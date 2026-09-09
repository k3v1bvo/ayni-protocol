'use client';

import React from 'react';
import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { ShieldCheck, UserCheck, Star, Users } from 'lucide-react';

const PROTOCOL_USERS = [
  {
    name: 'Ana María Quispe',
    email: 'cliente@ayni.app',
    role: 'client',
    roleLabel: 'Cliente',
    badge: 'badge-gold',
    reputation: 4.90,
    country: 'Bolivia',
    wallet: '0x71A0...6E7F',
  },
  {
    name: 'Alejandro Mamani',
    email: 'viajero@ayni.app',
    role: 'traveler',
    roleLabel: 'Viajero',
    badge: 'badge-cyan',
    reputation: 4.95,
    country: 'España / Bolivia',
    wallet: '0x3a82...E8F9',
  },
  {
    name: 'Demetrio Flores',
    email: 'comercio@ayni.app',
    role: 'merchant',
    roleLabel: 'Comercio',
    badge: 'badge-emerald',
    reputation: 4.88,
    country: 'Bolivia',
    wallet: '0x9B11...C7D8',
  },
  {
    name: 'Auditor Oficial AYNI',
    email: 'admin@ayni.app',
    role: 'admin',
    roleLabel: 'Auditor / Admin',
    badge: 'badge-purple',
    reputation: 5.00,
    country: 'Bolivia',
    wallet: '0x0000...dEaD',
  },
];

export default function UsersPage() {
  return (
    <DashboardLayout>
      <div className="page-header">
        <div className="page-title-group">
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '4px' }}>
            <div className="page-title">Gestión de Usuarios del Protocolo</div>
            <span className="badge badge-purple">
              <Users size={11} /> Red Descentralizada
            </span>
          </div>
          <div className="page-subtitle">
            Directorio de clientes, viajeros verificados, artesanos y comercios registrados.
          </div>
        </div>
      </div>

      <div className="card" style={{ padding: '24px' }}>
        <div style={{ overflowX: 'auto' }}>
          <table className="table" style={{ width: '100%' }}>
            <thead>
              <tr>
                <th>Usuario</th>
                <th>Rol</th>
                <th>País</th>
                <th>Reputación</th>
                <th>Billetera EVM</th>
                <th>Estado</th>
              </tr>
            </thead>
            <tbody>
              {PROTOCOL_USERS.map((u, i) => (
                <tr key={i}>
                  <td>
                    <div style={{ fontWeight: 600, color: 'var(--text-primary)' }}>{u.name}</div>
                    <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>{u.email}</div>
                  </td>
                  <td>
                    <span className={`badge ${u.badge}`}>{u.roleLabel}</span>
                  </td>
                  <td style={{ fontSize: '0.85rem' }}>{u.country}</td>
                  <td style={{ fontWeight: 700, color: 'var(--brand-gold)' }}>★ {u.reputation.toFixed(2)}</td>
                  <td>
                    <span style={{ fontFamily: 'monospace', fontSize: '0.78rem', color: 'var(--brand-cyan)' }}>
                      {u.wallet}
                    </span>
                  </td>
                  <td>
                    <span className="badge badge-emerald" style={{ fontSize: '0.7rem' }}>
                      ✓ Verificado
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
