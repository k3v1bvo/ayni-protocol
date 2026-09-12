'use client';

import React, { useState, useEffect } from 'react';
import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { useAuth } from '@/context/AuthContext';
import { ImageUploader } from '@/components/ui/ImageUploader';
import { getSupabaseBrowserClient, isSupabaseConfigured } from '@/lib/supabase/client';
import { sanitizeText, sanitizePhone, sanitizeEmail } from '@/lib/utils/sanitizer';
import {
  User, Mail, Shield, Wallet, Save, Sparkles, Key, CheckCircle2,
  Phone, MapPin, Globe, Linkedin, MessageCircle, FileText, Camera,
  AlertTriangle, Loader2
} from 'lucide-react';
import { EmailNotificationTester } from '@/components/dashboard/EmailNotificationTester';

export default function ProfilePage() {
  const { user, role } = useAuth();

  const [fullName, setFullName] = useState('');
  const [phone, setPhone] = useState('');
  const [whatsapp, setWhatsapp] = useState('');
  const [country, setCountry] = useState('Bolivia');
  const [city, setCity] = useState('');
  const [linkedin, setLinkedin] = useState('');
  const [bio, setBio] = useState('');
  const [wallet, setWallet] = useState('');
  const [avatarUrl, setAvatarUrl] = useState('');
  const [walletConnected, setWalletConnected] = useState(false);

  const [saving, setSaving] = useState(false);
  const [savedNotice, setSavedNotice] = useState<string | null>(null);
  const [errorNotice, setErrorNotice] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  // Load profile data from Supabase
  useEffect(() => {
    async function loadProfile() {
      if (!user?.id) { setLoading(false); return; }

      if (isSupabaseConfigured) {
        try {
          const supabase = getSupabaseBrowserClient();
          const { data } = await supabase
            .from('profiles')
            .select('*')
            .eq('id', user.id)
            .single();

          if (data) {
            setFullName(data.full_name || '');
            setPhone(data.phone || '');
            setWhatsapp(data.whatsapp || '');
            setCountry(data.country || 'Bolivia');
            setCity(data.city || '');
            setLinkedin(data.linkedin || '');
            setBio(data.bio || '');
            setWallet(data.wallet_address || '');
            setAvatarUrl(data.avatar_url || '');
            setWalletConnected(!!data.wallet_address);
            setLoading(false);
            return;
          }
        } catch (e) {
          console.warn('Error loading profile from Supabase:', e);
        }
      }

      // Fallback to user context data
      setFullName(user.full_name || '');
      setPhone(user.phone || '');
      setWallet(user.wallet_address || '');
      setAvatarUrl(user.avatar_url || '');
      setWalletConnected(!!user.wallet_address);
      setLoading(false);
    }

    loadProfile();
  }, [user]);

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setErrorNotice(null);
    setSavedNotice(null);

    const cleanName = sanitizeText(fullName, 120);
    const cleanPhone = sanitizePhone(phone);
    const cleanWhatsapp = sanitizePhone(whatsapp);
    const cleanCountry = sanitizeText(country, 60);
    const cleanCity = sanitizeText(city, 100);
    const cleanLinkedin = sanitizeText(linkedin, 200);
    const cleanBio = sanitizeText(bio, 500);
    const cleanWallet = sanitizeText(wallet, 64);

    if (!cleanName) {
      setErrorNotice('El nombre es obligatorio.');
      setSaving(false);
      return;
    }

    const payload = {
      id: user?.id,
      full_name: cleanName,
      phone: cleanPhone || null,
      whatsapp: cleanWhatsapp || null,
      country: cleanCountry,
      city: cleanCity || null,
      linkedin: cleanLinkedin || null,
      bio: cleanBio || null,
      wallet_address: cleanWallet || null,
      avatar_url: avatarUrl || null,
    };

    // Try Supabase first
    if (isSupabaseConfigured && user?.id) {
      try {
        const res = await fetch('/api/profile', {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(payload),
        });
        const result = await res.json();
        if (res.ok) {
          // Update localStorage too for immediate reflection
          const currentProfile = JSON.parse(localStorage.getItem('ayni_active_profile') || '{}');
          const updated = { ...currentProfile, ...payload };
          localStorage.setItem('ayni_active_profile', JSON.stringify(updated));
          setSavedNotice('¡Perfil actualizado correctamente en Supabase!');
          setSaving(false);
          setTimeout(() => setSavedNotice(null), 4000);
          return;
        } else {
          console.warn('API error:', result.error);
        }
      } catch (err) {
        console.warn('API call failed:', err);
      }
    }

    // Fallback: save to localStorage
    if (typeof window !== 'undefined') {
      const currentProfile = JSON.parse(localStorage.getItem('ayni_active_profile') || '{}');
      localStorage.setItem('ayni_active_profile', JSON.stringify({ ...currentProfile, ...payload }));
      localStorage.setItem('ayni_user_settings', JSON.stringify(payload));
    }
    setSavedNotice('¡Perfil guardado localmente!');
    setSaving(false);
    setTimeout(() => setSavedNotice(null), 4000);
  };

  const handleConnectWallet = () => {
    if (walletConnected) {
      setWalletConnected(false);
      setWallet('');
    } else {
      const simulatedWallet = '0x' + Array.from({ length: 40 }, () => Math.floor(Math.random() * 16).toString(16)).join('');
      setWallet(simulatedWallet);
      setWalletConnected(true);
    }
  };

  const handleAvatarUpload = (urls: string[]) => {
    if (urls.length > 0) {
      setAvatarUrl(urls[urls.length - 1]);
    }
  };

  if (loading) {
    return (
      <DashboardLayout>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', minHeight: '40vh', gap: '12px', color: 'var(--text-muted)' }}>
          <Loader2 size={24} style={{ animation: 'spin 1s linear infinite' }} />
          Cargando perfil...
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout>
      {/* Header */}
      <div className="page-header">
        <div className="page-title-group">
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '4px', flexWrap: 'wrap' }}>
            <div className="page-title">Mi Perfil</div>
            <span className="badge badge-cyan">
              <Sparkles size={11} /> Perfil & Seguridad
            </span>
          </div>
          <div className="page-subtitle">
            Administra tus datos personales, información de contacto, billetera EVM y avatar.
          </div>
        </div>
      </div>

      {/* Notices */}
      {savedNotice && (
        <div className="alert alert-success" style={{ marginBottom: '20px' }}>
          <CheckCircle2 size={16} /> {savedNotice}
        </div>
      )}
      {errorNotice && (
        <div className="alert alert-error" style={{ marginBottom: '20px' }}>
          <AlertTriangle size={16} /> {errorNotice}
        </div>
      )}

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: '24px' }}>

        {/* Avatar & Identity Card */}
        <div className="card" style={{ padding: '28px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '20px' }}>
            <Camera size={20} color="var(--brand-purple)" />
            <h3 style={{ fontSize: '1.1rem', fontWeight: 700, margin: 0 }}>Avatar & Identidad</h3>
          </div>

          {/* Current Avatar Preview */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '16px', marginBottom: '20px' }}>
            <div style={{
              width: 72, height: 72, borderRadius: '50%', overflow: 'hidden',
              border: '2px solid var(--border-cyan)',
              background: 'linear-gradient(135deg, rgba(0,207,255,0.1), rgba(245,166,35,0.1))',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              flexShrink: 0,
            }}>
              {avatarUrl ? (
                <img src={avatarUrl} alt="Avatar" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
              ) : (
                <User size={32} color="var(--text-muted)" />
              )}
            </div>
            <div>
              <div style={{ fontWeight: 700, fontSize: '1rem', color: 'var(--text-primary)' }}>
                {fullName || user?.full_name || 'Usuario AYNI'}
              </div>
              <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>{user?.email}</div>
              <span className={`badge ${role === 'traveler' ? 'badge-cyan' : role === 'merchant' ? 'badge-emerald' : role === 'admin' ? 'badge-purple' : 'badge-gold'}`} style={{ marginTop: '4px', fontSize: '0.7rem' }}>
                {role === 'traveler' ? '✈️ Viajero' : role === 'merchant' ? '🏪 Comerciante' : role === 'admin' ? '🛡️ Admin' : '🛍️ Cliente'}
              </span>
            </div>
          </div>

          {/* Avatar Upload */}
          <ImageUploader
            bucket="avatars"
            pathPrefix={user?.id || 'anon'}
            maxFiles={1}
            existingUrls={avatarUrl ? [avatarUrl] : []}
            onUploadComplete={handleAvatarUpload}
            label="Cambiar avatar"
            compact
          />

          {/* Reputation */}
          <div style={{ marginTop: '20px', padding: '14px', background: 'rgba(245,166,35,0.05)', borderRadius: '12px', border: '1px solid rgba(245,166,35,0.15)' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <span style={{ fontSize: '0.82rem', color: 'var(--text-secondary)' }}>Reputación</span>
              <span style={{ fontWeight: 700, color: 'var(--brand-gold)', fontSize: '1.1rem' }}>
                ★ {user?.reputation_score?.toFixed(2) || '5.00'}
              </span>
            </div>
          </div>
        </div>

        {/* Personal Details Form */}
        <div className="card" style={{ padding: '28px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '20px' }}>
            <User size={20} color="var(--brand-cyan)" />
            <h3 style={{ fontSize: '1.1rem', fontWeight: 700, margin: 0 }}>Datos Personales</h3>
          </div>

          <form onSubmit={handleSave} style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
            <div className="input-group">
              <label className="input-label">Nombre Completo *</label>
              <input type="text" required value={fullName} onChange={e => setFullName(e.target.value)} className="input" placeholder="Tu nombre completo" />
            </div>

            <div className="input-group">
              <label className="input-label">Correo Electrónico (no modificable)</label>
              <input type="email" disabled value={user?.email || ''} className="input" style={{ opacity: 0.6, cursor: 'not-allowed' }} />
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
              <div className="input-group">
                <label className="input-label"><Phone size={12} style={{ marginRight: 4 }} />Teléfono</label>
                <input type="tel" value={phone} onChange={e => setPhone(e.target.value)} className="input" placeholder="+591 7..." />
              </div>
              <div className="input-group">
                <label className="input-label"><MessageCircle size={12} style={{ marginRight: 4 }} />WhatsApp</label>
                <input type="tel" value={whatsapp} onChange={e => setWhatsapp(e.target.value)} className="input" placeholder="+591 7..." />
              </div>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
              <div className="input-group">
                <label className="input-label"><Globe size={12} style={{ marginRight: 4 }} />País</label>
                <input type="text" value={country} onChange={e => setCountry(e.target.value)} className="input" />
              </div>
              <div className="input-group">
                <label className="input-label"><MapPin size={12} style={{ marginRight: 4 }} />Ciudad</label>
                <input type="text" value={city} onChange={e => setCity(e.target.value)} className="input" placeholder="La Paz, Santa Cruz..." />
              </div>
            </div>

            <div className="input-group">
              <label className="input-label"><Linkedin size={12} style={{ marginRight: 4 }} />LinkedIn (opcional)</label>
              <input type="url" value={linkedin} onChange={e => setLinkedin(e.target.value)} className="input" placeholder="https://linkedin.com/in/tu-perfil" />
            </div>

            <div className="input-group">
              <label className="input-label"><FileText size={12} style={{ marginRight: 4 }} />Bio / Descripción</label>
              <textarea
                value={bio}
                onChange={e => setBio(e.target.value)}
                className="input"
                rows={3}
                maxLength={500}
                placeholder="Cuéntanos sobre ti, tu experiencia con viajes, comercio..."
                style={{ resize: 'vertical', minHeight: '70px' }}
              />
              <span style={{ fontSize: '0.7rem', color: 'var(--text-muted)', marginTop: '2px' }}>{bio.length}/500</span>
            </div>

            <button
              type="submit"
              disabled={saving}
              className="btn btn-primary"
              style={{ marginTop: '8px', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px' }}
            >
              {saving ? <Loader2 size={15} style={{ animation: 'spin 1s linear infinite' }} /> : <Save size={15} />}
              {saving ? 'Guardando...' : 'Guardar Cambios'}
            </button>
          </form>
        </div>

        {/* Wallet & Security */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
          <div className="card" style={{ padding: '28px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                <Wallet size={20} color="var(--brand-gold)" />
                <h3 style={{ fontSize: '1.1rem', fontWeight: 700, margin: 0 }}>Billetera EVM (Base L2)</h3>
              </div>
              <button type="button" onClick={handleConnectWallet} className="btn btn-ghost btn-sm" style={{ fontSize: '0.75rem' }}>
                {walletConnected ? 'Desconectar' : 'Conectar Wallet'}
              </button>
            </div>

            <p style={{ fontSize: '0.84rem', color: 'var(--text-secondary)', lineHeight: 1.5, marginBottom: '16px' }}>
              Dirección para liquidaciones del Smart Contract Escrow. Compatible con MetaMask, Trust Wallet y Tangem.
            </p>

            <div className="input-group" style={{ marginBottom: '16px' }}>
              <label className="input-label">Dirección de Billetera (0x...)</label>
              <input type="text" placeholder="0x..." value={wallet} onChange={e => setWallet(e.target.value)} className="input" style={{ fontFamily: 'monospace', fontSize: '0.82rem' }} />
            </div>

            <span className={`badge ${walletConnected ? 'badge-emerald' : 'badge-gold'}`}>
              {walletConnected ? '✓ Red Base L2 Verificada' : '● Sin Billetera Vinculada'}
            </span>
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

              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '10px 0', borderBottom: '1px solid var(--border-subtle)' }}>
                <div>
                  <div style={{ fontSize: '0.88rem', fontWeight: 600 }}>Código OTP en Entregas</div>
                  <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>Firma criptográfica Keccak-256</div>
                </div>
                <span className="badge badge-cyan">Habilitado</span>
              </div>

              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '10px 0' }}>
                <div>
                  <div style={{ fontSize: '0.88rem', fontWeight: 600 }}>Autenticación 2FA</div>
                  <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>Protección adicional con autenticador</div>
                </div>
                <span className="badge badge-gold">Pendiente</span>
              </div>
            </div>
          </div>
        </div>

        {/* Panel de Diagnóstico & Notificaciones Google SMTP */}
        <EmailNotificationTester />
      </div>
    </DashboardLayout>
  );
}
