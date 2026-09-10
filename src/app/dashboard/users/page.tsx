'use client';

import React, { useState } from 'react';
import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { ShieldCheck, UserCheck, Star, Users, Search, CheckCircle2, UserX } from 'lucide-react';

interface UserRecord {
  id: string;
  name: string;
  email: string;
  role: 'client' | 'traveler' | 'merchant' | 'admin';
  roleLabel: string;
  badge: string;
  reputation: number;
  country: string;
  wallet: string;
  verified: boolean;
}

const DEFAULT_USERS: UserRecord[] = [
  {
    id: 'USR-01',
    name: 'Ana María Quispe',
    email: 'cliente@ayni.app',
    role: 'client',
    roleLabel: 'Cliente',
    badge: 'badge-gold',
    reputation: 4.90,
    country: 'Bolivia',
    wallet: '0x71A0...6E7F',
    verified: true,
  },
  {
    id: 'USR-02',
    name: 'Alejandro Mamani',
    email: 'viajero@ayni.app',
    role: 'traveler',
    roleLabel: 'Viajero',
    badge: 'badge-cyan',
    reputation: 4.95,
    country: 'España / Bolivia',
    wallet: '0x3a82...E8F9',
    verified: true,
  },
  {
    id: 'USR-03',
    name: 'Demetrio Flores',
    email: 'comercio@ayni.app',
    role: 'merchant',
    roleLabel: 'Comercio',
    badge: 'badge-emerald',
    reputation: 4.88,
    country: 'Bolivia',
    wallet: '0x9B11...C7D8',
    verified: true,
  },
  {
    id: 'USR-04',
    name: 'Auditor Oficial AYNI',
    email: 'admin@ayni.app',
    role: 'admin',
    roleLabel: 'Auditor / Admin',
    badge: 'badge-purple',
    reputation: 5.00,
    country: 'Bolivia',
    wallet: '0x0000...dEaD',
    verified: true,
  },
];

export default function UsersPage() {
  const [users, setUsers] = useState<UserRecord[]>(DEFAULT_USERS);
  const [search, setSearch] = useState('');
  const [roleFilter, setRoleFilter] = useState('all');
  const [feedback, setFeedback] = useState<string | null>(null);

  const handleToggleVerification = (id: string) => {
    setUsers(prev => prev.map(u => {
      if (u.id === id) {
        const next = !u.verified;
        setFeedback(`Estado de verificación de ${u.name} actualizado: ${next ? 'Verificado ✓' : 'Suspendido ⏸'}`);
        setTimeout(() => setFeedback(null), 3000);
        return { ...u, verified: next };
      }
      return u;
    }));
  };

  const filtered = users.filter(u => {
    const matchesRole = roleFilter === 'all' || u.role === roleFilter;
    const matchesSearch = !search ||
      u.name.toLowerCase().includes(search.toLowerCase()) ||
      u.email.toLowerCase().includes(search.toLowerCase()) ||
      u.country.toLowerCase().includes(search.toLowerCase());
    return matchesRole && matchesSearch;
  });

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

      {feedback && (
        <div className="alert alert-success" style={{ marginBottom: '20px' }}>
          <CheckCircle2 size={16} /> {feedback}
        </div>
      )}

      {/* Filter and Search Bar */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '16px', marginBottom: '24px' }}>
        <div className="tab-bar" style={{ margin: 0 }}>
          {[
            { id: 'all', label: 'Todos' },
            { id: 'client', label: 'Clientes' },
            { id: 'traveler', label: 'Viajeros' },
            { id: 'merchant', label: 'Comercios' },
            { id: 'admin', label: 'Auditores' },
          ].map(r => (
            <button
              key={r.id}
              type="button"
              className={`tab-item ${roleFilter === r.id ? 'active' : ''}`}
              onClick={() => setRoleFilter(r.id)}
            >
              {r.label}
            </button>
          ))}
        </div>

        <div className="input-icon-wrap" style={{ maxWidth: '320px', width: '100%' }}>
          <Search size={16} className="input-icon" />
          <input
            type="search"
            placeholder="Buscar usuario o país..."
            className="input"
            style={{ paddingLeft: '40px' }}
            value={search}
            onChange={e => setSearch(e.target.value)}
          />
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
                <th style={{ textAlign: 'right' }}>Acciones</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map(u => (
                <tr key={u.id}>
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
                    <span
                      className={`badge ${u.verified ? 'badge-emerald' : 'badge-gold'}`}
                      style={{ fontSize: '0.7rem' }}
                    >
                      {u.verified ? '✓ Verificado' : '⏸ En Revisión'}
                    </span>
                  </td>
                  <td style={{ textAlign: 'right' }}>
                    <button
                      type="button"
                      onClick={() => handleToggleVerification(u.id)}
                      className="btn btn-ghost btn-sm"
                      style={{ fontSize: '0.74rem' }}
                    >
                      {u.verified ? 'Suspender' : 'Verificar'}
                    </button>
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
