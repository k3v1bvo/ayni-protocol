'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';
import { UserRole } from '@/lib/supabase/types';
import { Mail, Lock, User, X, AlertCircle, CheckCircle, Sparkles, Eye, EyeOff } from 'lucide-react';

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
  const { signInWithEmail, signUpWithEmail, signInWithGoogle, setDemoUser, isConfigured } = useAuth();
  const [mode, setMode] = useState<'signin' | 'signup'>(initialMode);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [fullName, setFullName] = useState('');
  const [role, setRole] = useState<UserRole>('client');
  const [showPass, setShowPass] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  React.useEffect(() => {
    if (isOpen) {
      setMode(initialMode);
      setError(null);
      setSuccess(null);
      setEmail('');
      setPassword('');
    }
  }, [isOpen, initialMode]);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoading(true);
    try {
      if (mode === 'signin') {
        const { error: err } = await signInWithEmail(email, password);
        if (err) { setError(err); return; }
        setSuccess('¡Sesión iniciada! Redirigiendo...');
        setTimeout(() => { onClose(); router.push('/dashboard'); }, 700);
      } else {
        if (!fullName.trim()) { setError('Ingresa tu nombre completo'); return; }
        const { error: err } = await signUpWithEmail(email, password, fullName, role);
        if (err) { setError(err); return; }
        setSuccess('¡Cuenta creada! Bienvenido a AYNI.');
        setTimeout(() => { onClose(); router.push('/dashboard'); }, 700);
      }
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

  const handleDemo = (r: UserRole) => {
    setDemoUser(r);
    setSuccess(`Entrando como ${r}...`);
    setTimeout(() => { onClose(); router.push('/dashboard'); }, 500);
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div
        className="modal-box"
        style={{ width: '100%', maxWidth: 460, padding: '32px' }}
        onClick={e => e.stopPropagation()}
      >
        {/* Close */}
        <button
          type="button"
          onClick={onClose}
          style={{ position: 'absolute', top: 18, right: 18, background: 'transparent', border: 'none', color: 'var(--text-muted)', cursor: 'pointer', lineHeight: 1 }}
        >
          <X size={20} />
        </button>

        {/* Logo & Title */}
        <div style={{ textAlign: 'center', marginBottom: '24px' }}>
          <div style={{ fontFamily: 'var(--font-display)', fontSize: '1.75rem', fontWeight: 800, marginBottom: '4px' }}>
            <span className="gradient-text-gold">AYNI</span>
          </div>
          <p style={{ color: 'var(--text-secondary)', fontSize: '0.875rem' }}>
            {mode === 'signin' ? 'Bienvenido de vuelta a la red P2P' : 'Crea tu cuenta en el ecosistema descentralizado'}
          </p>
        </div>

        {/* Tabs */}
        <div className="tab-bar" style={{ marginBottom: '20px' }}>
          <button type="button" className={`tab-item ${mode === 'signin' ? 'active' : ''}`} onClick={() => { setMode('signin'); setError(null); }}>
            Iniciar Sesión
          </button>
          <button type="button" className={`tab-item ${mode === 'signup' ? 'active' : ''}`} onClick={() => { setMode('signup'); setError(null); }}>
            Registrarse
          </button>
        </div>

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

        {/* Google */}
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
            <label className="input-label">Contraseña</label>
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

          <button type="submit" disabled={loading} className="btn btn-primary" style={{ width: '100%', padding: '12px', fontSize: '0.95rem', marginTop: '4px' }}>
            {loading ? 'Procesando...' : mode === 'signin' ? 'Iniciar Sesión' : 'Crear Cuenta en AYNI'}
          </button>
        </form>

        {/* Security Trust Note */}
        <div style={{ marginTop: '20px', paddingTop: '16px', borderTop: '1px solid var(--border-subtle)', textAlign: 'center' }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '6px', fontSize: '0.75rem', color: 'var(--text-muted)' }}>
            <span>🔒 Protocolo seguro • Cifrado de extremo a extremo • Red Base L2</span>
          </div>
        </div>
      </div>
    </div>
  );
}
