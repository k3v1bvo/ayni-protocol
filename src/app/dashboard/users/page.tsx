'use client';

import React, { useState, useEffect } from 'react';
import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { useAuth } from '@/context/AuthContext';
import { isSupabaseConfigured } from '@/lib/supabase/client';
import {
  Users, Search, Shield, Loader2, CheckCircle2, AlertTriangle,
  Sparkles, ChevronDown, Mail, Phone, Wallet, Star, UserCheck, UserX
} from 'lucide-react';

interface UserItem {
  id: string;
  full_name: string;
  email: string;
  role: string;
  reputation_score: number;
  wallet_address?: string;
  phone?: string;
  country?: string;
  verified_id?: boolean;
  created_at?: string;
}

export default function AdminUsersPage() {
  const { role } = useAuth();
  const [users, setUsers] = useState<UserItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQ, setSearchQ] = useState('');
  const [filterRole, setFilterRole] = useState('all');
  const [notice, setNotice] = useState<string | null>(null);
  const [total, setTotal] = useState(0);

  useEffect(() => { loadUsers(); }, [searchQ, filterRole]);

  async function loadUsers() {
    setLoading(true);
    if (isSupabaseConfigured) {
      try {
        const params = new URLSearchParams();
        if (searchQ) params.set('search', searchQ);
        if (filterRole !== 'all') params.set('role', filterRole);
        params.set('limit', '100');

        const res = await fetch(`/api/admin/users?${params}`);
        if (res.ok) {
          const { users: data, total: t } = await res.json();
          setUsers(data || []);
          setTotal(t || 0);
          setLoading(false);
          return;
        }
      } catch (e) { console.warn(e); }
    }

    // Fallback demo data
    setUsers([
      { id: '1', full_name: 'Carlos Quispe', email: 'carlos@ayni.app', role: 'client', reputation_score: 4.85, country: 'Bolivia', verified_id: true, created_at: '2026-08-15' },
      { id: '2', full_name: 'María Rodríguez', email: 'maria@ayni.app', role: 'traveler', reputation_score: 4.92, country: 'España', verified_id: true, created_at: '2026-08-20' },
      { id: '3', full_name: 'Doña Elena Textiles', email: 'elena@ayni.app', role: 'merchant', reputation_score: 4.78, country: 'Bolivia', verified_id: true, created_at: '2026-09-01' },
    ]);
    setTotal(3);
    setLoading(false);
  }

  const handleRoleChange = async (userId: string, newRole: string) => {
    if (isSupabaseConfigured) {
      try {
        const res = await fetch('/api/admin/users', {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ id: userId, role: newRole }),
        });
        if (res.ok) {
          setUsers(prev => prev.map(u => u.id === userId ? { ...u, role: newRole } : u));
          setNotice(`Rol actualizado a ${newRole}.`);
          setTimeout(() => setNotice(null), 3000);
          return;
        }
      } catch (e) { console.warn(e); }
    }

    setUsers(prev => prev.map(u => u.id === userId ? { ...u, role: newRole } : u));
    setNotice(`Rol actualizado localmente.`);
    setTimeout(() => setNotice(null), 3000);
  };

  const handleToggleSuspend = async (userId: string, currentlyActive: boolean) => {
    if (isSupabaseConfigured) {
      try {
        const res = await fetch('/api/admin/users', {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ id: userId, suspended: currentlyActive }),
        });
        if (res.ok) {
          setUsers(prev => prev.map(u => u.id === userId ? { ...u, verified_id: !currentlyActive } : u));
          setNotice(currentlyActive ? 'Usuario suspendido.' : 'Usuario reactivado.');
          setTimeout(() => setNotice(null), 3000);
          return;
        }
      } catch (e) { console.warn(e); }
    }

    setUsers(prev => prev.map(u => u.id === userId ? { ...u, verified_id: !currentlyActive } : u));
    setNotice(currentlyActive ? 'Usuario suspendido.' : 'Usuario reactivado.');
    setTimeout(() => setNotice(null), 3000);
  };

  const getRoleBadge = (r: string) => {
    const map: Record<string, { label: string; cls: string }> = {
      client: { label: '🛍️ Cliente', cls: 'badge-gold' },
      traveler: { label: '✈️ Viajero', cls: 'badge-cyan' },
      merchant: { label: '🏪 Comerciante', cls: 'badge-emerald' },
      admin: { label: '🛡️ Admin', cls: 'badge-purple' },
    };
    return map[r] || { label: r, cls: 'badge-gold' };
  };

  if (role !== 'admin') {
    return (
      <DashboardLayout>
        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', minHeight: '50vh', textAlign: 'center' }}>
          <Shield size={48} color="var(--brand-red)" style={{ marginBottom: '16px' }} />
          <h2 style={{ fontWeight: 700, fontSize: '1.3rem' }}>Acceso Denegado</h2>
          <p style={{ color: 'var(--text-secondary)' }}>Solo administradores pueden acceder a esta sección.</p>
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout>
      <div className="page-header" style={{ marginBottom: '24px' }}>
        <div className="page-title-group">
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '4px', flexWrap: 'wrap' }}>
            <div className="page-title">Gestión de Usuarios</div>
            <span className="badge badge-purple"><Sparkles size={11} /> Admin</span>
            <span className="badge badge-cyan" style={{ fontSize: '0.7rem' }}>{total} registrados</span>
          </div>
          <div className="page-subtitle">Administra perfiles, roles y accesos de todos los usuarios de la plataforma.</div>
        </div>
      </div>

      {notice && (
        <div className="alert alert-success" style={{ marginBottom: '16px' }}><CheckCircle2 size={16} /> {notice}</div>
      )}

      {/* Filters */}
      <div style={{ display: 'flex', gap: '12px', marginBottom: '20px', flexWrap: 'wrap' }}>
        <div style={{ position: 'relative', flex: '1 1 200px', maxWidth: '300px' }}>
          <Search size={16} style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }} />
          <input type="text" placeholder="Buscar por nombre o email..." value={searchQ} onChange={e => setSearchQ(e.target.value)} className="input" style={{ paddingLeft: '36px' }} />
        </div>
        <select value={filterRole} onChange={e => setFilterRole(e.target.value)} className="input" style={{ maxWidth: '200px' }}>
          <option value="all">Todos los roles</option>
          <option value="client">Clientes</option>
          <option value="traveler">Viajeros</option>
          <option value="merchant">Comerciantes</option>
          <option value="admin">Admins</option>
        </select>
      </div>

      {loading ? (
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', minHeight: '30vh', gap: '10px', color: 'var(--text-muted)' }}>
          <Loader2 size={20} style={{ animation: 'spin 1s linear infinite' }} /> Cargando usuarios...
        </div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
          {users.map(u => {
            const rb = getRoleBadge(u.role);
            const isActive = u.verified_id !== false;
            return (
              <div key={u.id} className="card card-kinetic" style={{ padding: '16px 20px' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '12px' }}>
                  {/* User Info */}
                  <div style={{ display: 'flex', alignItems: 'center', gap: '12px', flex: 1, minWidth: '200px' }}>
                    <div style={{
                      width: 40, height: 40, borderRadius: '50%',
                      background: 'linear-gradient(135deg, rgba(0,207,255,0.15), rgba(245,166,35,0.15))',
                      display: 'flex', alignItems: 'center', justifyContent: 'center',
                      color: 'var(--brand-cyan)', fontWeight: 700, fontSize: '0.9rem',
                    }}>
                      {u.full_name?.charAt(0)?.toUpperCase() || '?'}
                    </div>
                    <div>
                      <div style={{ fontWeight: 700, fontSize: '0.9rem', display: 'flex', alignItems: 'center', gap: '6px' }}>
                        {u.full_name}
                        {!isActive && <span style={{ fontSize: '0.65rem', color: 'var(--brand-red)' }}>⊘ Suspendido</span>}
                      </div>
                      <div style={{ fontSize: '0.78rem', color: 'var(--text-muted)' }}>{u.email}</div>
                    </div>
                  </div>

                  {/* Role Badge */}
                  <span className={`badge ${rb.cls}`} style={{ fontSize: '0.72rem' }}>{rb.label}</span>

                  {/* Reputation */}
                  <div style={{ textAlign: 'center' }}>
                    <div style={{ fontWeight: 700, color: 'var(--brand-gold)', fontSize: '0.9rem' }}>★ {u.reputation_score?.toFixed(2)}</div>
                    <div style={{ fontSize: '0.65rem', color: 'var(--text-muted)' }}>Rep.</div>
                  </div>

                  {/* Actions */}
                  <div style={{ display: 'flex', gap: '6px', alignItems: 'center' }}>
                    <select
                      value={u.role}
                      onChange={e => handleRoleChange(u.id, e.target.value)}
                      className="input"
                      style={{ fontSize: '0.75rem', padding: '4px 8px', maxWidth: '130px' }}
                    >
                      <option value="client">Cliente</option>
                      <option value="traveler">Viajero</option>
                      <option value="merchant">Comerciante</option>
                      <option value="admin">Admin</option>
                    </select>
                    <button
                      type="button"
                      onClick={() => handleToggleSuspend(u.id, isActive)}
                      className="btn btn-ghost btn-sm"
                      style={{ fontSize: '0.72rem', color: isActive ? 'var(--brand-red)' : 'var(--brand-emerald)' }}
                    >
                      {isActive ? <><UserX size={13} /> Suspender</> : <><UserCheck size={13} /> Activar</>}
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </DashboardLayout>
  );
}
