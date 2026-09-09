'use client';

import React, { useState } from 'react';
import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { useAuth } from '@/context/AuthContext';
import {
  Settings, User, Mail, Shield, Wallet, Bell, Globe, CheckCircle2,
  Lock, Save, Sparkles
} from 'lucide-react';

export default function SettingsPage() {
  const { user, role } = useAuth();
  const [fullName, setFullName] = useState(user?.full_name || 'Ana María Quispe');
  const [phone, setPhone] = useState('+591 71234567');
  const [country, setCountry] = useState('Bolivia');
  const [wallet, setWallet] = useState('0x71A09E1B2C3D4E5F6A7B8C9D0E1F2A3B4C5D6E7F');
  const [saved, setSaved] = useState(false);

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    setSaved(true);
    setTimeout(() => setSaved(false), 3000);
  };

  return (
    <DashboardLayout>
      {/* Header */}
      <div className="page-header">
        <div className="page-title-group">
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '4px' }}>
            <div className="page-title">Configuración de Cuenta</div>
            <span className="badge badge-cyan">
              <Sparkles size={11} /> Perfil & Seguridad
            </span>
          </div>
          <div className="page-subtitle">
            Administra tus datos personales, billetera EVM para liquidaciones y preferencias de seguridad.
          </div>
        </div>
      </div>

      {saved && (
        <div className="alert alert-success" style={{ marginBottom: '24px' }}>
          <CheckCircle2 size={16} /> ¡Configuración guardada con éxito!
        </div>
      )}

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: '24px' }}>
        {/* Personal Details */}
        <div className="card" style={{ padding: '28px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '20px' }}>
            <User size={20} color="var(--brand-cyan)" />
            <h3 style={{ fontSize: '1.1rem', fontWeight: 700, margin: 0 }}>Datos del Perfil</h3>
          </div>

          <form onSubmit={handleSave} style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
            <div className="input-group">
              <label className="input-label">Nombre Completo</label>
              <input
                type="text"
                required
                value={fullName}
                onChange={e => setFullName(e.target.value)}
                className="input"
              />
            </div>

            <div className="input-group">
              <label className="input-label">Correo Electrónico (No modificable)</label>
              <input
                type="email"
                disabled
                value={user?.email || 'usuario@ayni.app'}
                className="input"
                style={{ opacity: 0.7, cursor: 'not-allowed' }}
              />
            </div>

            <div className="input-group">
              <label className="input-label">Teléfono / WhatsApp</label>
              <input
                type="tel"
                value={phone}
                onChange={e => setPhone(e.target.value)}
                className="input"
              />
            </div>

            <div className="input-group">
              <label className="input-label">País de Residencia</label>
              <input
                type="text"
                value={country}
                onChange={e => setCountry(e.target.value)}
                className="input"
              />
            </div>

            <button type="submit" className="btn btn-primary" style={{ marginTop: '8px' }}>
              <Save size={15} /> Guardar Cambios
            </button>
          </form>
        </div>

        {/* Web3 & Security Details */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
          <div className="card" style={{ padding: '28px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '20px' }}>
              <Wallet size={20} color="var(--brand-gold)" />
              <h3 style={{ fontSize: '1.1rem', fontWeight: 700, margin: 0 }}>Billetera EVM (Base L2)</h3>
            </div>

            <p style={{ fontSize: '0.84rem', color: 'var(--text-secondary)', lineHeight: 1.5, marginBottom: '16px' }}>
              Dirección a la cual se enviarán tus comisiones y liberaciones automáticas del Smart Contract Escrow.
            </p>

            <div className="input-group" style={{ marginBottom: '16px' }}>
              <label className="input-label">Dirección de Billetera (0x...)</label>
              <input
                type="text"
                value={wallet}
                onChange={e => setWallet(e.target.value)}
                className="input"
                style={{ fontFamily: 'monospace', fontSize: '0.82rem' }}
              />
            </div>

            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <span className="badge badge-emerald">✓ Red Base L2 Verificada</span>
            </div>
          </div>

          <div className="card" style={{ padding: '28px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '16px' }}>
              <Shield size={20} color="var(--brand-emerald)" />
              <h3 style={{ fontSize: '1.1rem', fontWeight: 700, margin: 0 }}>Seguridad & Validación</h3>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '10px 0', borderBottom: '1px solid var(--border-subtle)' }}>
                <div>
                  <div style={{ fontSize: '0.88rem', fontWeight: 600 }}>Verificación de Identidad (KYC)</div>
                  <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>Cédula o pasaporte validado</div>
                </div>
                <span className="badge badge-emerald">Aprobado</span>
              </div>

              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '10px 0' }}>
                <div>
                  <div style={{ fontSize: '0.88rem', fontWeight: 600 }}>Código OTP en Entregas</div>
                  <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>Firma criptográfica Keccak-256</div>
                </div>
                <span className="badge badge-cyan">Habilitado</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
}
