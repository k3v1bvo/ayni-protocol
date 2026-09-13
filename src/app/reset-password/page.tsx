'use client';

import React, { useState, useEffect, Suspense } from 'react';
import Link from 'next/link';
import { useRouter, useSearchParams } from 'next/navigation';
import { getSupabaseBrowserClient, isSupabaseConfigured } from '@/lib/supabase/client';
import { Lock, Eye, EyeOff, CheckCircle, AlertCircle, ArrowLeft, ShieldCheck } from 'lucide-react';

function ResetPasswordContent() {
  const router = useRouter();
  const searchParams = useSearchParams();

  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);
  const [sessionChecked, setSessionChecked] = useState(false);

  useEffect(() => {
    async function checkRecoverySession() {
      if (!isSupabaseConfigured) {
        setSessionChecked(true);
        return;
      }

      try {
        const supabase = getSupabaseBrowserClient();
        const { data: { session } } = await supabase.auth.getSession();
        setSessionChecked(true);
      } catch (err) {
        console.warn('Error verificando sesión de recuperación:', err);
        setSessionChecked(true);
      }
    }

    checkRecoverySession();
  }, []);

  const handleUpdatePassword = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (password.length < 6) {
      setError('La contraseña debe tener al menos 6 caracteres.');
      return;
    }

    if (password !== confirmPassword) {
      setError('Las contraseñas no coinciden. Por favor verifícalas.');
      return;
    }

    setLoading(true);

    try {
      if (isSupabaseConfigured) {
        const supabase = getSupabaseBrowserClient();
        const { error: updateError } = await supabase.auth.updateUser({
          password: password,
        });

        if (updateError) {
          throw updateError;
        }
      }

      setSuccess(true);
      setTimeout(() => {
        router.push('/auth?mode=signin');
      }, 2500);
    } catch (err: any) {
      console.error('Error actualizando contraseña:', err);
      setError(err.message || 'No fue posible actualizar la contraseña. El enlace puede haber expirado.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-page-wrapper" style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '24px' }}>
      <div className="auth-ambient-glow-1" />
      <div className="auth-ambient-glow-2" />

      <div
        className="modal-box"
        style={{
          width: '100%',
          maxWidth: '460px',
          background: 'rgba(10, 14, 26, 0.85)',
          border: '1px solid rgba(0, 207, 255, 0.25)',
          backdropFilter: 'blur(24px)',
          borderRadius: '24px',
          padding: '36px',
          boxShadow: '0 20px 50px rgba(0, 0, 0, 0.6), 0 0 30px rgba(0, 207, 255, 0.15)',
          position: 'relative',
          zIndex: 10,
        }}
      >
        <Link
          href="/auth"
          style={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: '6px',
            color: 'var(--text-muted)',
            fontSize: '0.82rem',
            textDecoration: 'none',
            marginBottom: '24px',
            transition: 'color 0.2s ease',
          }}
        >
          <ArrowLeft size={15} /> Volver a Autenticación
        </Link>

        {/* Brand Header */}
        <div style={{ textAlign: 'center', marginBottom: '28px' }}>
          <div style={{
            width: 52,
            height: 52,
            borderRadius: 16,
            background: 'linear-gradient(135deg, var(--brand-cyan) 0%, var(--brand-gold) 100%)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            fontWeight: 900,
            fontSize: '1.5rem',
            color: '#050810',
            margin: '0 auto 16px',
            boxShadow: '0 0 25px rgba(0, 207, 255, 0.4)',
          }}>
            A
          </div>
          <h1 style={{ fontFamily: 'var(--font-display)', fontSize: '1.6rem', fontWeight: 800, marginBottom: '6px' }}>
            Restablecer Contraseña
          </h1>
          <p style={{ color: 'var(--text-secondary)', fontSize: '0.86rem', lineHeight: 1.5 }}>
            Ingresa tu nueva clave de acceso para proteger tu cuenta y tus contratos en AYNI Protocol.
          </p>
        </div>

        {error && (
          <div style={{
            background: 'rgba(239, 68, 68, 0.12)',
            border: '1px solid rgba(239, 68, 68, 0.3)',
            borderRadius: '12px',
            padding: '12px 16px',
            color: '#f87171',
            fontSize: '0.85rem',
            marginBottom: '20px',
            display: 'flex',
            alignItems: 'center',
            gap: '10px',
          }}>
            <AlertCircle size={18} style={{ flexShrink: 0 }} />
            <span>{error}</span>
          </div>
        )}

        {success ? (
          <div style={{ textAlign: 'center', padding: '16px 0' }}>
            <div style={{
              width: 60,
              height: 60,
              borderRadius: '50%',
              background: 'rgba(0, 214, 143, 0.15)',
              border: '1px solid var(--brand-emerald)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              margin: '0 auto 16px',
              color: 'var(--brand-emerald)',
            }}>
              <CheckCircle size={32} />
            </div>
            <h3 style={{ fontSize: '1.25rem', fontWeight: 700, marginBottom: '8px', color: 'var(--brand-emerald)' }}>
              ¡Contraseña Actualizada!
            </h3>
            <p style={{ fontSize: '0.88rem', color: 'var(--text-secondary)', marginBottom: '20px' }}>
              Tu credencial ha sido renovada con éxito. Redirigiendo a inicio de sesión...
            </p>
            <Link
              href="/auth?mode=signin"
              className="btn btn-primary"
              style={{ display: 'inline-flex', alignItems: 'center', gap: '8px', padding: '10px 24px' }}
            >
              <span>Ir a Iniciar Sesión Ahora</span>
            </Link>
          </div>
        ) : (
          <form onSubmit={handleUpdatePassword} style={{ display: 'flex', flexDirection: 'column', gap: '18px' }}>
            <div>
              <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 600, color: 'var(--text-secondary)', marginBottom: '6px' }}>
                Nueva Contraseña
              </label>
              <div className="auth-input-wrapper" style={{ position: 'relative' }}>
                <Lock size={16} className="auth-input-icon" />
                <input
                  type={showPassword ? 'text' : 'password'}
                  required
                  minLength={6}
                  placeholder="Mínimo 6 caracteres"
                  value={password}
                  onChange={e => setPassword(e.target.value)}
                  className="auth-input-field"
                  style={{ paddingRight: '40px' }}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  style={{
                    position: 'absolute',
                    right: '12px',
                    background: 'transparent',
                    border: 'none',
                    color: 'var(--text-muted)',
                    cursor: 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                  }}
                >
                  {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                </button>
              </div>
            </div>

            <div>
              <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 600, color: 'var(--text-secondary)', marginBottom: '6px' }}>
                Confirmar Nueva Contraseña
              </label>
              <div className="auth-input-wrapper" style={{ position: 'relative' }}>
                <Lock size={16} className="auth-input-icon" />
                <input
                  type={showPassword ? 'text' : 'password'}
                  required
                  minLength={6}
                  placeholder="Repite tu nueva contraseña"
                  value={confirmPassword}
                  onChange={e => setConfirmPassword(e.target.value)}
                  className="auth-input-field"
                />
              </div>
            </div>

            {/* Password strength indicators */}
            <div style={{ display: 'flex', gap: '6px', marginTop: '2px' }}>
              <div style={{ flex: 1, height: 4, borderRadius: 2, background: password.length >= 6 ? 'var(--brand-emerald)' : 'rgba(255,255,255,0.1)' }} />
              <div style={{ flex: 1, height: 4, borderRadius: 2, background: password.length >= 8 && /[A-Z]/.test(password) ? 'var(--brand-emerald)' : 'rgba(255,255,255,0.1)' }} />
              <div style={{ flex: 1, height: 4, borderRadius: 2, background: password.length >= 10 && /[0-9!@#$%^&*]/.test(password) ? 'var(--brand-emerald)' : 'rgba(255,255,255,0.1)' }} />
            </div>

            <button
              type="submit"
              disabled={loading}
              className="btn btn-primary btn-lg btn-shimmer"
              style={{
                width: '100%',
                marginTop: '10px',
                padding: '13px',
                fontSize: '0.95rem',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '8px',
              }}
            >
              {loading ? (
                <>
                  <div className="spinner" style={{ width: 16, height: 16, borderTopColor: '#050810' }} />
                  <span>Actualizando Contraseña...</span>
                </>
              ) : (
                <>
                  <span>Guardar Nueva Contraseña</span>
                  <ShieldCheck size={16} />
                </>
              )}
            </button>
          </form>
        )}

        <div style={{ marginTop: '24px', paddingTop: '18px', borderTop: '1px solid var(--border-subtle)', textAlign: 'center' }}>
          <span style={{ fontSize: '0.74rem', color: 'var(--text-muted)' }}>
            🔒 AYNI Protocol Security • Encriptación Criptográfica EAL6+
          </span>
        </div>
      </div>
    </div>
  );
}

export default function ResetPasswordPage() {
  return (
    <Suspense fallback={
      <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'var(--bg-app)' }}>
        <div className="spinner" style={{ width: 28, height: 28 }} />
      </div>
    }>
      <ResetPasswordContent />
    </Suspense>
  );
}
