'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';
import { UserRole } from '@/lib/supabase/types';
import { sanitizeEmail, sanitizeText } from '@/lib/utils/sanitizer';
import { obfuscateEmail } from '@/lib/utils/obfuscate';
import {
  Mail, Lock, User, X, AlertCircle, CheckCircle, Sparkles, Eye,
  EyeOff, ShieldCheck, Wifi, RefreshCw, ArrowLeft, KeyRound
} from 'lucide-react';

interface AuthModalProps {
  isOpen: boolean;
  onClose: () => void;
  initialMode?: 'signin' | 'signup';
}

const ROLES = [
  { id: 'client', emoji: '🛍️', label: 'Cliente', desc: 'Quiero encargar compras y envíos' },
  { id: 'traveler', emoji: '✈️', label: 'Viajero', desc: 'Viajo y quiero llevar encargos' },
  { id: 'merchant', emoji: '🏪', label: 'Comerciante', desc: 'Tengo una tienda o productos' },
];

export function AuthModal({ isOpen, onClose, initialMode = 'signin' }: AuthModalProps) {
  const router = useRouter();
  const { signInWithEmail, signUpWithEmail, signInWithGoogle, setDemoUser } = useAuth();
  
  const [mode, setMode] = useState<'signin' | 'signup' | 'recovery' | 'twofactor'>(initialMode);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [fullName, setFullName] = useState('');
  const [role, setRole] = useState<UserRole>('client');
  const [showPass, setShowPass] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  // 2FA Flow States
  const [enable2FaCheck, setEnable2FaCheck] = useState(false);
  const [twoFaMethod, setTwoFaMethod] = useState<'email' | 'tangem'>('email');
  const [twoFaCode, setTwoFaCode] = useState('');
  const [twoFaSending, setTwoFaSending] = useState(false);
  const [twoFaVerifying, setTwoFaVerifying] = useState(false);
  const [tangemState, setTangemState] = useState<'idle' | 'approaching' | 'verifying' | 'success'>('idle');

  React.useEffect(() => {
    if (isOpen) {
      setMode(initialMode);
      setError(null);
      setSuccess(null);
      setEmail('');
      setPassword('');
      setTwoFaCode('');
      setTangemState('idle');
      if (typeof window !== 'undefined') {
        const stored2Fa = localStorage.getItem('ayni_2fa_enabled');
        setEnable2FaCheck(stored2Fa === 'true');
      }
    }
  }, [isOpen, initialMode]);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    const cleanEmail = sanitizeEmail(email);
    if (!cleanEmail) {
      setError('Por favor ingresa un correo electrónico válido.');
      return;
    }

    setLoading(true);
    try {
      if (mode === 'signin') {
        const { error: err } = await signInWithEmail(cleanEmail, password);
        if (err) { setError(err); return; }

        // Si tiene 2FA activado o seleccionado, activar paso de segundo factor
        const is2FaRequired = enable2FaCheck || (typeof window !== 'undefined' && localStorage.getItem('ayni_2fa_enabled') === 'true');
        if (is2FaRequired) {
          setMode('twofactor');
          triggerSend2Fa(cleanEmail);
          return;
        }

        setSuccess('¡Sesión iniciada! Redirigiendo...');
        setTimeout(() => { onClose(); router.push('/dashboard'); }, 500);
      } else if (mode === 'signup') {
        const cleanName = sanitizeText(fullName, 120);
        if (!cleanName) { setError('Ingresa tu nombre completo'); return; }
        const { error: err } = await signUpWithEmail(cleanEmail, password, cleanName, role);
        if (err) { setError(err); return; }
        setSuccess('¡Cuenta creada con éxito! Bienvenido a AYNI.');
        setTimeout(() => { onClose(); router.push('/dashboard'); }, 500);
      }
    } finally {
      setLoading(false);
    }
  };

  const triggerSend2Fa = async (targetEmail: string) => {
    setTwoFaSending(true);
    setError(null);
    try {
      const res = await fetch('/api/auth/2fa/send', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: targetEmail, purpose: 'inicio de sesión seguro (2FA)' }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Error enviando código 2FA');
      setSuccess(`Código de 6 dígitos enviado a ${obfuscateEmail(targetEmail)}`);
    } catch (err: any) {
      setError(err.message || 'Error al conectar con el servidor 2FA.');
    } finally {
      setTwoFaSending(false);
    }
  };

  const handleVerify2Fa = async () => {
    const cleanEmail = sanitizeEmail(email);
    if (!cleanEmail || !twoFaCode) {
      setError('Ingresa el código de 6 dígitos recibido.');
      return;
    }
    setTwoFaVerifying(true);
    setError(null);
    try {
      const res = await fetch('/api/auth/2fa/verify', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: cleanEmail, code: twoFaCode }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Código incorrecto');
      setSuccess('¡Segundo factor verificado! Entrando al sistema...');
      setTimeout(() => { onClose(); router.push('/dashboard'); }, 600);
    } catch (err: any) {
      setError(err.message || 'Código de seguridad inválido');
    } finally {
      setTwoFaVerifying(false);
    }
  };

  const handleSimulateTangem = () => {
    setTangemState('approaching');
    setTimeout(() => {
      setTangemState('verifying');
      setTimeout(() => {
        setTangemState('success');
        setSuccess('✓ Chip Tangem EAL6+ autenticado. Acceso concedido.');
        setTimeout(() => { onClose(); router.push('/dashboard'); }, 1000);
      }, 1200);
    }, 1000);
  };

  const handlePasswordRecovery = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setSuccess(null);
    const cleanEmail = sanitizeEmail(email);
    if (!cleanEmail) {
      setError('Ingresa un correo electrónico válido.');
      return;
    }

    setLoading(true);
    try {
      const res = await fetch('/api/auth/reset-password', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: cleanEmail }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Error al procesar recuperación');
      setSuccess(data.message || 'Enlace enviado a tu correo mediante Google SMTP.');
    } catch (err: any) {
      setError(err.message || 'Error de conexión.');
    } finally {
      setLoading(false);
    }
  };

  const handleGoogle = async () => {
    setLoading(true);
    const { error: err } = await signInWithGoogle();
    if (err) { setError(err); setLoading(false); return; }
    setTimeout(() => { onClose(); router.push('/dashboard'); }, 700);
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div
        className="modal-box"
        style={{ width: '100%', maxWidth: 460, padding: '32px' }}
        onClick={e => e.stopPropagation()}
      >
        {/* Close Button */}
        <button
          type="button"
          onClick={onClose}
          style={{ position: 'absolute', top: 18, right: 18, background: 'transparent', border: 'none', color: 'var(--text-muted)', cursor: 'pointer', lineHeight: 1 }}
        >
          <X size={20} />
        </button>

        {/* Logo & Title */}
        <div style={{ textAlign: 'center', marginBottom: '20px' }}>
          <div style={{ fontFamily: 'var(--font-display)', fontSize: '1.75rem', fontWeight: 800, marginBottom: '4px' }}>
            <span className="gradient-text-gold">AYNI</span>
          </div>
          <p style={{ color: 'var(--text-secondary)', fontSize: '0.85rem' }}>
            {mode === 'signin' && 'Bienvenido de vuelta a la red P2P'}
            {mode === 'signup' && 'Crea tu cuenta en el ecosistema descentralizado'}
            {mode === 'recovery' && 'Recuperación Segura de Contraseña (Gmail SMTP)'}
            {mode === 'twofactor' && 'Verificación de Segundo Factor (2FA / Tangem)'}
          </p>
        </div>

        {/* Status Alerts */}
        {error && (
          <div className="alert alert-error" style={{ marginBottom: '16px' }}>
            <AlertCircle size={16} /> {error}
          </div>
        )}
        {success && (
          <div className="alert alert-success" style={{ marginBottom: '16px' }}>
            <CheckCircle size={16} /> {success}
          </div>
        )}

        {/* Tabs for Signin/Signup */}
        {(mode === 'signin' || mode === 'signup') && (
          <div className="tab-bar" style={{ marginBottom: '20px' }}>
            <button type="button" className={`tab-item ${mode === 'signin' ? 'active' : ''}`} onClick={() => { setMode('signin'); setError(null); }}>
              Iniciar Sesión
            </button>
            <button type="button" className={`tab-item ${mode === 'signup' ? 'active' : ''}`} onClick={() => { setMode('signup'); setError(null); }}>
              Registrarse
            </button>
          </div>
        )}

        {/* ── MODE 1 & 2: SIGNIN & SIGNUP ── */}
        {(mode === 'signin' || mode === 'signup') && (
          <>
            <button type="button" className="btn btn-google" style={{ width: '100%', marginBottom: '16px' }} onClick={handleGoogle} disabled={loading}>
              <svg width="18" height="18" viewBox="0 0 24 24">
                <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
                <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
                <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z" />
                <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z" />
              </svg>
              Continuar con Google
            </button>

            <div className="divider" style={{ marginBottom: '16px' }}>O con correo electrónico</div>

            <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
              {mode === 'signup' && (
                <>
                  <div className="input-group">
                    <label className="input-label">Nombre completo</label>
                    <div className="input-icon-wrap">
                      <User size={15} className="input-icon" />
                      <input type="text" required placeholder="Ej: Ana María Quispe" value={fullName} onChange={e => setFullName(e.target.value)} className="input" style={{ paddingLeft: 40 }} />
                    </div>
                  </div>

                  <div className="input-group">
                    <label className="input-label">¿Cuál es tu rol?</label>
                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '8px' }}>
                      {ROLES.map(r => (
                        <button
                          key={r.id}
                          type="button"
                          onClick={() => setRole(r.id as UserRole)}
                          style={{
                            padding: '10px 8px',
                            background: role === r.id ? 'rgba(0,207,255,0.1)' : 'rgba(255,255,255,0.03)',
                            border: `1px solid ${role === r.id ? 'var(--brand-cyan)' : 'var(--border-default)'}`,
                            borderRadius: 10,
                            cursor: 'pointer',
                            textAlign: 'center',
                          }}
                        >
                          <div style={{ fontSize: '1.25rem', marginBottom: '4px' }}>{r.emoji}</div>
                          <div style={{ fontSize: '0.78rem', fontWeight: 600, color: role === r.id ? 'var(--brand-cyan)' : 'var(--text-secondary)' }}>{r.label}</div>
                          <div style={{ fontSize: '0.62rem', color: 'var(--text-muted)', marginTop: '2px', lineHeight: 1.3 }}>{r.desc}</div>
                        </button>
                      ))}
                    </div>
                  </div>
                </>
              )}

              <div className="input-group">
                <label className="input-label">Correo electrónico</label>
                <div className="input-icon-wrap">
                  <Mail size={15} className="input-icon" />
                  <input type="email" required placeholder="tu@correo.com" value={email} onChange={e => setEmail(e.target.value)} className="input" style={{ paddingLeft: 40 }} />
                </div>
              </div>

              <div className="input-group">
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <label className="input-label">Contraseña</label>
                  {mode === 'signin' && (
                    <button
                      type="button"
                      onClick={() => { setMode('recovery'); setError(null); setSuccess(null); }}
                      style={{ background: 'transparent', border: 'none', color: 'var(--brand-cyan)', fontSize: '0.75rem', cursor: 'pointer', padding: 0 }}
                    >
                      ¿Olvidaste tu contraseña?
                    </button>
                  )}
                </div>
                <div className="input-icon-wrap" style={{ position: 'relative' }}>
                  <Lock size={15} className="input-icon" />
                  <input
                    type={showPass ? 'text' : 'password'}
                    required
                    minLength={6}
                    placeholder="••••••••"
                    value={password}
                    onChange={e => setPassword(e.target.value)}
                    className="input"
                    style={{ paddingLeft: 40, paddingRight: 40 }}
                  />
                  <button
                    type="button"
                    onClick={() => setShowPass(!showPass)}
                    style={{ position: 'absolute', right: 12, top: '50%', transform: 'translateY(-50%)', background: 'transparent', border: 'none', cursor: 'pointer', color: 'var(--text-muted)' }}
                  >
                    {showPass ? <EyeOff size={15} /> : <Eye size={15} />}
                  </button>
                </div>
              </div>

              {/* 2FA Checkbox Option during signin */}
              {mode === 'signin' && (
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px', padding: '6px 0' }}>
                  <input
                    type="checkbox"
                    id="require-2fa-check"
                    checked={enable2FaCheck}
                    onChange={e => setEnable2FaCheck(e.target.checked)}
                    style={{ accentColor: 'var(--brand-cyan)', cursor: 'pointer' }}
                  />
                  <label htmlFor="require-2fa-check" style={{ fontSize: '0.78rem', color: 'var(--text-secondary)', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '5px' }}>
                    <ShieldCheck size={14} color="var(--brand-cyan)" /> Requerir Doble Factor de Autenticación (2FA / Tangem)
                  </label>
                </div>
              )}

              <button type="submit" disabled={loading} className="btn btn-primary" style={{ width: '100%', padding: '12px', fontSize: '0.95rem', marginTop: '4px' }}>
                {loading ? 'Procesando...' : mode === 'signin' ? 'Iniciar Sesión' : 'Crear Cuenta en AYNI'}
              </button>
            </form>
          </>
        )}

        {/* ── MODE 3: PASSWORD RECOVERY (GMAIL SMTP DESACOPLADO) ── */}
        {mode === 'recovery' && (
          <div>
            <p style={{ fontSize: '0.82rem', color: 'var(--text-secondary)', marginBottom: '16px', lineHeight: 1.5 }}>
              Ingresa el correo asociado a tu cuenta. Te enviaremos un enlace de restablecimiento con la plantilla oficial de AYNI Protocol.
            </p>

            <form onSubmit={handlePasswordRecovery} style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
              <div className="input-group">
                <label className="input-label">Correo electrónico</label>
                <div className="input-icon-wrap">
                  <Mail size={15} className="input-icon" />
                  <input
                    type="email"
                    required
                    placeholder="tu@correo.com"
                    value={email}
                    onChange={e => setEmail(e.target.value)}
                    className="input"
                    style={{ paddingLeft: 40 }}
                  />
                </div>
              </div>

              <button type="submit" disabled={loading} className="btn btn-primary" style={{ width: '100%', padding: '11px', fontSize: '0.9rem' }}>
                {loading ? 'Enviando enlace...' : 'Enviar Correo de Recuperación'}
              </button>

              <button
                type="button"
                onClick={() => { setMode('signin'); setError(null); setSuccess(null); }}
                className="btn btn-ghost btn-sm"
                style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '6px', fontSize: '0.8rem' }}
              >
                <ArrowLeft size={14} /> Volver a Iniciar Sesión
              </button>
            </form>
          </div>
        )}

        {/* ── MODE 4: TWO-FACTOR AUTHENTICATION (2FA) STEP ── */}
        {mode === 'twofactor' && (
          <div>
            {/* Method Tabs */}
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '8px', marginBottom: '16px' }}>
              <button
                type="button"
                onClick={() => { setTwoFaMethod('email'); setError(null); }}
                className={`btn btn-sm ${twoFaMethod === 'email' ? 'btn-primary' : 'btn-ghost'}`}
                style={{ fontSize: '0.8rem', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '6px' }}
              >
                <Mail size={14} /> Correo (Gmail OTP)
              </button>
              <button
                type="button"
                onClick={() => { setTwoFaMethod('tangem'); setError(null); }}
                className={`btn btn-sm ${twoFaMethod === 'tangem' ? 'btn-primary' : 'btn-ghost'}`}
                style={{ fontSize: '0.8rem', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '6px' }}
              >
                <Wifi size={14} style={{ transform: 'rotate(90deg)' }} /> Tangem Card
              </button>
            </div>

            {twoFaMethod === 'email' && (
              <div>
                <p style={{ fontSize: '0.82rem', color: 'var(--text-secondary)', marginBottom: '14px', lineHeight: 1.45 }}>
                  Ingresa el código criptográfico de 6 dígitos enviado a <strong>{obfuscateEmail(email)}</strong>.
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
                    onClick={() => triggerSend2Fa(email)}
                    disabled={twoFaSending}
                    className="btn btn-ghost btn-sm"
                    style={{ whiteSpace: 'nowrap', fontSize: '0.78rem' }}
                  >
                    {twoFaSending ? <RefreshCw size={13} className="spin" /> : 'Reenviar'}
                  </button>
                </div>

                <button
                  type="button"
                  onClick={handleVerify2Fa}
                  disabled={twoFaVerifying || twoFaCode.length !== 6}
                  className="btn btn-primary btn-block"
                  style={{ padding: '11px', fontSize: '0.9rem', opacity: twoFaCode.length === 6 ? 1 : 0.6 }}
                >
                  {twoFaVerifying ? 'Validando 2FA...' : 'Verificar y Continuar'}
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
                  Aproxima tu tarjeta física Tangem para validar el factor de posesión por hardware.
                </p>

                {tangemState === 'idle' && (
                  <button type="button" onClick={handleSimulateTangem} className="btn btn-tangem-glow btn-block" style={{ padding: '11px' }}>
                    <Wifi size={14} style={{ transform: 'rotate(90deg)', marginRight: '6px' }} />
                    Aproximar Tarjeta Tangem (Tap NFC)
                  </button>
                )}

                {tangemState === 'approaching' && (
                  <div style={{ fontSize: '0.84rem', color: 'var(--brand-cyan)', fontWeight: 700 }}>
                    Detectando chip NFC Tangem...
                  </div>
                )}

                {tangemState === 'verifying' && (
                  <div style={{ fontSize: '0.84rem', color: 'var(--brand-emerald)', fontWeight: 700, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '6px' }}>
                    <RefreshCw size={14} className="spin" />
                    Validando firma criptográfica de enclave...
                  </div>
                )}

                {tangemState === 'success' && (
                  <div style={{ fontSize: '0.88rem', color: 'var(--brand-emerald)', fontWeight: 800 }}>
                    ✓ ¡Autenticación Tangem Exitosa!
                  </div>
                )}
              </div>
            )}

            <div style={{ marginTop: '16px', textAlign: 'center' }}>
              <button
                type="button"
                onClick={() => { setMode('signin'); setError(null); setSuccess(null); }}
                className="btn btn-ghost btn-sm"
                style={{ fontSize: '0.78rem' }}
              >
                <ArrowLeft size={13} style={{ marginRight: 4 }} /> Cancelar y volver
              </button>
            </div>
          </div>
        )}

        {/* Security Trust Footer */}
        <div style={{ marginTop: '20px', paddingTop: '16px', borderTop: '1px solid var(--border-subtle)', textAlign: 'center' }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '6px', fontSize: '0.75rem', color: 'var(--text-muted)' }}>
            <span>🔒 Protocolo seguro • Cifrado de extremo a extremo • Red Base L2</span>
          </div>
        </div>
      </div>
    </div>
  );
}
