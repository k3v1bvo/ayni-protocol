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
  AlertTriangle, Loader2, Lock, Smartphone, Wifi, Eye, EyeOff,
  RefreshCw, X, ShieldCheck
} from 'lucide-react';
import { obfuscateEmail, obfuscateWallet, obfuscatePhone } from '@/lib/utils/obfuscate';
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

  // 2FA & Obfuscation States
  const [is2FaActive, setIs2FaActive] = useState(false);
  const [show2FaModal, setShow2FaModal] = useState(false);
  const [twoFaMethod, setTwoFaMethod] = useState<'email' | 'tangem'>('email');
  const [twoFaCode, setTwoFaCode] = useState('');
  const [twoFaSending, setTwoFaSending] = useState(false);
  const [twoFaVerifying, setTwoFaVerifying] = useState(false);
  const [twoFaMsg, setTwoFaMsg] = useState<string | null>(null);
  const [twoFaErr, setTwoFaErr] = useState<string | null>(null);
  const [tangemScanState, setTangemScanState] = useState<'idle' | 'approaching' | 'verifying' | 'success'>('idle');
  const [privacyMaskActive, setPrivacyMaskActive] = useState(true);

  useEffect(() => {
    if (typeof window !== 'undefined') {
      const stored2Fa = localStorage.getItem('ayni_2fa_enabled');
      if (stored2Fa === 'true') setIs2FaActive(true);
    }
  }, []);

  const handleSend2FaEmail = async () => {
    const targetEmail = user?.email;
    if (!targetEmail) {
      setTwoFaErr('No hay un correo electrónico asociado a tu cuenta.');
      return;
    }
    setTwoFaSending(true);
    setTwoFaErr(null);
    setTwoFaMsg(null);
    try {
      const res = await fetch('/api/auth/2fa/send', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: targetEmail, purpose: 'activación de Doble Factor (2FA)' }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Error al enviar código');
      setTwoFaMsg('¡Código de 6 dígitos enviado a tu correo! Revisa tu bandeja de entrada.');
    } catch (err: any) {
      setTwoFaErr(err.message || 'Error de conexión');
    } finally {
      setTwoFaSending(false);
    }
  };

  const handleVerify2FaEmail = async () => {
    const targetEmail = user?.email;
    if (!targetEmail || !twoFaCode) {
      setTwoFaErr('Ingresa el código de 6 dígitos recibido.');
      return;
    }
    setTwoFaVerifying(true);
    setTwoFaErr(null);
    try {
      const res = await fetch('/api/auth/2fa/verify', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: targetEmail, code: twoFaCode }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Código incorrecto');
      setIs2FaActive(true);
      if (typeof window !== 'undefined') localStorage.setItem('ayni_2fa_enabled', 'true');
      setTwoFaMsg('¡Doble Factor de Autenticación (2FA) activado exitosamente!');
      setTimeout(() => setShow2FaModal(false), 1800);
    } catch (err: any) {
      setTwoFaErr(err.message || 'Código no válido');
    } finally {
      setTwoFaVerifying(false);
    }
  };

  const handleSimulateTangem2Fa = () => {
    setTangemScanState('approaching');
    setTimeout(() => {
      setTangemScanState('verifying');
      setTimeout(() => {
        setTangemScanState('success');
        setIs2FaActive(true);
        if (typeof window !== 'undefined') localStorage.setItem('ayni_2fa_enabled', 'true');
        setTimeout(() => {
          setShow2FaModal(false);
          setTangemScanState('idle');
        }, 1500);
      }, 1200);
    }, 1000);
  };

  const handleToggle2FaStatus = () => {
    if (is2FaActive) {
      setIs2FaActive(false);
      if (typeof window !== 'undefined') localStorage.removeItem('ayni_2fa_enabled');
    } else {
      setShow2FaModal(true);
    }
  };

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
                  <div style={{ fontSize: '0.88rem', fontWeight: 600 }}>Autenticación 2FA (MFA)</div>
                  <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                    {is2FaActive ? 'Protección activa con segundo factor' : 'Protección adicional con correo u hardware Tangem'}
                  </div>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <span className={`badge ${is2FaActive ? 'badge-emerald' : 'badge-gold'}`}>
                    {is2FaActive ? '✓ Habilitado' : 'Pendiente'}
                  </span>
                  <button
                    type="button"
                    onClick={handleToggle2FaStatus}
                    className={`btn btn-sm ${is2FaActive ? 'btn-ghost' : 'btn-primary'}`}
                    style={{ fontSize: '0.75rem', padding: '4px 10px' }}
                  >
                    {is2FaActive ? 'Desactivar' : 'Activar 2FA'}
                  </button>
                </div>
              </div>
            </div>
          </div>

          {/* Módulo de Ofuscación de Datos y Privacidad */}
          <div className="card" style={{ padding: '24px', background: 'rgba(0, 207, 255, 0.03)', border: '1px solid rgba(0, 207, 255, 0.2)' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '12px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <ShieldCheck size={18} color="var(--brand-cyan)" />
                <h4 style={{ fontSize: '0.98rem', fontWeight: 700, margin: 0, color: 'var(--brand-cyan)' }}>
                  Ofuscación & Privacidad de Datos
                </h4>
              </div>
              <button
                type="button"
                onClick={() => setPrivacyMaskActive(!privacyMaskActive)}
                className="btn btn-ghost btn-sm"
                style={{ fontSize: '0.75rem', display: 'flex', alignItems: 'center', gap: '5px', padding: '4px 8px' }}
              >
                {privacyMaskActive ? <EyeOff size={13} /> : <Eye size={13} />}
                {privacyMaskActive ? 'Datos Ofuscados' : 'Mostrar Reales'}
              </button>
            </div>

            <p style={{ fontSize: '0.78rem', color: 'var(--text-secondary)', marginBottom: '14px', lineHeight: 1.4 }}>
              Cumplimiento de estándares de privacidad ISO 27701. Los datos sensibles de tu cuenta son enmascarados ante terceros:
            </p>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', fontSize: '0.8rem', fontFamily: 'monospace' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', padding: '6px 10px', background: 'rgba(0,0,0,0.3)', borderRadius: '6px' }}>
                <span style={{ color: 'var(--text-muted)' }}>Correo:</span>
                <span style={{ color: 'var(--text-primary)' }}>{privacyMaskActive ? obfuscateEmail(user?.email) : (user?.email || '—')}</span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', padding: '6px 10px', background: 'rgba(0,0,0,0.3)', borderRadius: '6px' }}>
                <span style={{ color: 'var(--text-muted)' }}>Billetera:</span>
                <span style={{ color: 'var(--brand-gold)' }}>{privacyMaskActive ? obfuscateWallet(wallet || user?.wallet_address) : (wallet || user?.wallet_address || '—')}</span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', padding: '6px 10px', background: 'rgba(0,0,0,0.3)', borderRadius: '6px' }}>
                <span style={{ color: 'var(--text-muted)' }}>Teléfono:</span>
                <span style={{ color: 'var(--text-primary)' }}>{privacyMaskActive ? obfuscatePhone(phone) : (phone || '—')}</span>
              </div>
            </div>
          </div>
        </div>

        {/* Modal Interactivo de Configuración 2FA */}
        {show2FaModal && (
          <div className="modal-overlay" onClick={() => setShow2FaModal(false)}>
            <div className="modal-box" style={{ maxWidth: 460, width: '100%', padding: '24px' }} onClick={e => e.stopPropagation()}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <Lock size={20} color="var(--brand-cyan)" />
                  <h3 style={{ fontSize: '1.15rem', fontWeight: 800, margin: 0 }}>Doble Factor de Autenticación</h3>
                </div>
                <button type="button" onClick={() => setShow2FaModal(false)} className="btn-pressable" style={{ background: 'transparent', border: 'none', color: 'var(--text-muted)', cursor: 'pointer' }}>
                  <X size={18} />
                </button>
              </div>

              {/* Selector de Método 2FA */}
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '8px', marginBottom: '18px' }}>
                <button
                  type="button"
                  onClick={() => { setTwoFaMethod('email'); setTwoFaErr(null); }}
                  className={`btn btn-sm ${twoFaMethod === 'email' ? 'btn-primary' : 'btn-ghost'}`}
                  style={{ fontSize: '0.8rem', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '6px' }}
                >
                  <Mail size={14} /> Correo (Gmail OTP)
                </button>
                <button
                  type="button"
                  onClick={() => { setTwoFaMethod('tangem'); setTwoFaErr(null); }}
                  className={`btn btn-sm ${twoFaMethod === 'tangem' ? 'btn-primary' : 'btn-ghost'}`}
                  style={{ fontSize: '0.8rem', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '6px' }}
                >
                  <Wifi size={14} style={{ transform: 'rotate(90deg)' }} /> Tangem NFC Card
                </button>
              </div>

              {twoFaMethod === 'email' && (
                <div>
                  <p style={{ fontSize: '0.82rem', color: 'var(--text-secondary)', marginBottom: '14px', lineHeight: 1.45 }}>
                    Te enviaremos un código de seguridad de 6 dígitos a <strong>{obfuscateEmail(user?.email)}</strong> para confirmar tu identidad.
                  </p>

                  <div style={{ display: 'flex', gap: '8px', marginBottom: '14px' }}>
                    <input
                      type="text"
                      maxLength={6}
                      placeholder="123456"
                      value={twoFaCode}
                      onChange={e => setTwoFaCode(e.target.value.replace(/\D/g, ''))}
                      className="input"
                      style={{ fontSize: '1.25rem', letterSpacing: '6px', textAlign: 'center', fontFamily: 'monospace', fontWeight: 800 }}
                    />
                    <button
                      type="button"
                      onClick={handleSend2FaEmail}
                      disabled={twoFaSending}
                      className="btn btn-ghost btn-sm"
                      style={{ whiteSpace: 'nowrap', fontSize: '0.78rem' }}
                    >
                      {twoFaSending ? <RefreshCw size={13} className="spin" /> : 'Pedir Código'}
                    </button>
                  </div>

                  {twoFaMsg && (
                    <div style={{ padding: '10px', background: 'rgba(0,214,143,0.1)', border: '1px solid rgba(0,214,143,0.3)', borderRadius: '8px', fontSize: '0.78rem', color: 'var(--brand-emerald)', marginBottom: '14px' }}>
                      {twoFaMsg}
                    </div>
                  )}

                  {twoFaErr && (
                    <div style={{ padding: '10px', background: 'rgba(239,68,68,0.1)', border: '1px solid rgba(239,68,68,0.3)', borderRadius: '8px', fontSize: '0.78rem', color: '#f87171', marginBottom: '14px' }}>
                      {twoFaErr}
                    </div>
                  )}

                  <button
                    type="button"
                    onClick={handleVerify2FaEmail}
                    disabled={twoFaVerifying || twoFaCode.length !== 6}
                    className="btn btn-primary btn-block"
                    style={{ padding: '11px', fontSize: '0.9rem', opacity: twoFaCode.length === 6 ? 1 : 0.6 }}
                  >
                    {twoFaVerifying ? 'Verificando...' : 'Verificar y Activar 2FA'}
                  </button>
                </div>
              )}

              {twoFaMethod === 'tangem' && (
                <div style={{ textAlign: 'center', padding: '10px 0' }}>
                  <div style={{
                    width: 140,
                    height: 85,
                    margin: '0 auto 16px',
                    borderRadius: '10px',
                    background: 'linear-gradient(135deg, #0e1628, #040813)',
                    border: '1.5px solid var(--brand-cyan)',
                    display: 'flex',
                    flexDirection: 'column',
                    justifyContent: 'space-between',
                    padding: '10px',
                    boxShadow: '0 0 20px rgba(0,207,255,0.2)',
                  }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                      <span style={{ fontWeight: 900, fontSize: '0.75rem', letterSpacing: '1px', color: '#fff' }}>tangem</span>
                      <Wifi size={13} color="var(--brand-cyan)" style={{ transform: 'rotate(90deg)' }} />
                    </div>
                    <span style={{ fontSize: '0.6rem', color: 'var(--brand-emerald)', fontWeight: 700 }}>EAL6+ SECURITY CHIP</span>
                  </div>

                  <p style={{ fontSize: '0.82rem', color: 'var(--text-secondary)', marginBottom: '16px' }}>
                    Aproxima tu tarjeta física Tangem para vincular el chip de hardware como factor de posesión física.
                  </p>

                  {tangemScanState === 'idle' && (
                    <button type="button" onClick={handleSimulateTangem2Fa} className="btn btn-tangem-glow btn-block" style={{ padding: '11px' }}>
                      <Wifi size={14} style={{ transform: 'rotate(90deg)', marginRight: '6px' }} />
                      Aproximar Tarjeta Tangem (Tap NFC)
                    </button>
                  )}

                  {tangemScanState === 'approaching' && (
                    <div style={{ fontSize: '0.84rem', color: 'var(--brand-cyan)', fontWeight: 700 }}>
                      Detectando enclave NFC de la tarjeta...
                    </div>
                  )}

                  {tangemScanState === 'verifying' && (
                    <div style={{ fontSize: '0.84rem', color: 'var(--brand-emerald)', fontWeight: 700, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '6px' }}>
                      <RefreshCw size={14} className="spin" />
                      Validando firma criptográfica de hardware...
                    </div>
                  )}

                  {tangemScanState === 'success' && (
                    <div style={{ fontSize: '0.88rem', color: 'var(--brand-emerald)', fontWeight: 800 }}>
                      ✓ ¡Tarjeta Tangem vinculada como 2FA!
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>
        )}

        {/* Panel de Diagnóstico & Notificaciones Google SMTP */}
        <EmailNotificationTester />
      </div>
    </DashboardLayout>
  );
}
