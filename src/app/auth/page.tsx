'use client';

import React, { useState, Suspense } from 'react';
import Link from 'next/link';
import { useRouter, useSearchParams } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';
import { UserRole } from '@/lib/supabase/types';
import { Mail, Lock, User, Sparkles, CheckCircle, AlertCircle, ArrowLeft, ShieldCheck, Plane, ShoppingBag, Store } from 'lucide-react';

function AuthContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const redirectUrl = searchParams.get('redirect') || '/dashboard';

  const { signInWithEmail, signUpWithEmail, signInWithGoogle, setDemoUser } = useAuth();
  const [mode, setMode] = useState<'signin' | 'signup'>('signin');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [fullName, setFullName] = useState('');
  const [role, setRole] = useState<UserRole>('client');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setSuccessMsg(null);
    setLoading(true);

    try {
      if (mode === 'signin') {
        const res = await signInWithEmail(email, password);
        if (res.error) {
          setError(res.error);
        } else {
          setSuccessMsg('¡Bienvenido de vuelta!');
          setTimeout(() => router.push(redirectUrl), 400);
        }
      } else {
        if (!fullName.trim()) {
          setError('Por favor ingresa tu nombre completo');
          setLoading(false);
          return;
        }
        const res = await signUpWithEmail(email, password, fullName, role);
        if (res.error) {
          setError(res.error);
        } else {
          setSuccessMsg('¡Cuenta registrada con éxito!');
          setTimeout(() => router.push(redirectUrl), 400);
        }
      }
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Error inesperado';
      setError(msg);
    } finally {
      setLoading(false);
    }
  };

  const handleGoogle = async () => {
    setError(null);
    setLoading(true);
    const res = await signInWithGoogle();
    if (res.error) {
      setError(res.error);
      setLoading(false);
    } else {
      setTimeout(() => router.push(redirectUrl), 400);
    }
  };

  const handleQuickDemo = (demoRole: UserRole) => {
    setDemoUser(demoRole);
    setSuccessMsg(`Ingresando como ${demoRole}...`);
    setTimeout(() => router.push(redirectUrl), 200);
  };

  return (
    <div style={{ minHeight: '80vh', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '40px 16px' }}>
      <div className="glass-panel" style={{ width: '100%', maxWidth: '460px', padding: '36px', border: '1px solid var(--border-highlight)' }}>
        <Link href="/" style={{ display: 'inline-flex', alignItems: 'center', gap: '6px', color: 'var(--text-muted)', fontSize: '0.85rem', textDecoration: 'none', marginBottom: '20px' }}>
          <ArrowLeft size={16} /> Volver al inicio
        </Link>

        <div style={{ textAlign: 'center', marginBottom: '24px' }}>
          <h2 style={{ fontSize: '1.75rem', fontWeight: 800 }}>
            {mode === 'signin' ? 'Iniciar Sesión' : 'Crear Cuenta'}
          </h2>
          <p style={{ color: 'var(--text-secondary)', fontSize: '0.875rem', marginTop: '4px' }}>
            Acceso a la plataforma oficial AYNI
          </p>
        </div>

        {/* Tab switcher */}
        <div style={{
          display: 'flex',
          background: 'rgba(255, 255, 255, 0.04)',
          borderRadius: '10px',
          padding: '4px',
          marginBottom: '20px',
        }}>
          <button
            type="button"
            onClick={() => { setMode('signin'); setError(null); }}
            style={{
              flex: 1,
              padding: '8px',
              border: 'none',
              borderRadius: '8px',
              fontSize: '0.875rem',
              fontWeight: 600,
              cursor: 'pointer',
              background: mode === 'signin' ? 'var(--ayni-cyan)' : 'transparent',
              color: mode === 'signin' ? '#050b14' : 'var(--text-secondary)',
            }}
          >
            Ingresar
          </button>
          <button
            type="button"
            onClick={() => { setMode('signup'); setError(null); }}
            style={{
              flex: 1,
              padding: '8px',
              border: 'none',
              borderRadius: '8px',
              fontSize: '0.875rem',
              fontWeight: 600,
              cursor: 'pointer',
              background: mode === 'signup' ? 'var(--ayni-cyan)' : 'transparent',
              color: mode === 'signup' ? '#050b14' : 'var(--text-secondary)',
            }}
          >
            Registrarse
          </button>
        </div>

        {error && (
          <div style={{ background: 'rgba(239, 68, 68, 0.15)', border: '1px solid rgba(239, 68, 68, 0.3)', borderRadius: '10px', padding: '10px 14px', color: '#f87171', fontSize: '0.85rem', marginBottom: '16px', display: 'flex', alignItems: 'center', gap: '8px' }}>
            <AlertCircle size={16} /> <span>{error}</span>
          </div>
        )}

        {successMsg && (
          <div style={{ background: 'rgba(16, 185, 129, 0.15)', border: '1px solid rgba(16, 185, 129, 0.3)', borderRadius: '10px', padding: '10px 14px', color: '#34d399', fontSize: '0.85rem', marginBottom: '16px', display: 'flex', alignItems: 'center', gap: '8px' }}>
            <CheckCircle size={16} /> <span>{successMsg}</span>
          </div>
        )}

        {/* Google OAuth Button */}
        <button
          type="button"
          onClick={handleGoogle}
          disabled={loading}
          className="btn btn-google"
          style={{ marginBottom: '16px' }}
        >
          <svg width="18" height="18" viewBox="0 0 24 24">
            <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
            <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
            <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z"/>
            <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z"/>
          </svg>
          Continuar con Google
        </button>

        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
          {mode === 'signup' && (
            <>
              <div>
                <label style={{ display: 'block', fontSize: '0.8rem', color: 'var(--text-secondary)', marginBottom: '6px' }}>
                  Nombre Completo
                </label>
                <input
                  type="text"
                  required
                  placeholder="Ej: Alejandro Mamani"
                  value={fullName}
                  onChange={e => setFullName(e.target.value)}
                  className="input-custom"
                />
              </div>

              <div>
                <label style={{ display: 'block', fontSize: '0.8rem', color: 'var(--text-secondary)', marginBottom: '6px' }}>
                  Rol en la plataforma
                </label>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '8px' }}>
                  {[
                    { id: 'client', label: 'Cliente' },
                    { id: 'traveler', label: 'Viajero' },
                    { id: 'merchant', label: 'Comercio' },
                  ].map(r => (
                    <button
                      key={r.id}
                      type="button"
                      onClick={() => setRole(r.id as UserRole)}
                      style={{
                        padding: '8px',
                        background: role === r.id ? 'rgba(0, 240, 255, 0.12)' : 'rgba(255, 255, 255, 0.03)',
                        border: `1px solid ${role === r.id ? 'var(--ayni-cyan)' : 'var(--border-subtle)'}`,
                        borderRadius: '8px',
                        color: role === r.id ? 'var(--ayni-cyan)' : 'var(--text-secondary)',
                        cursor: 'pointer',
                        fontSize: '0.8rem',
                        fontWeight: 600,
                      }}
                    >
                      {r.label}
                    </button>
                  ))}
                </div>
              </div>
            </>
          )}

          <div>
            <label style={{ display: 'block', fontSize: '0.8rem', color: 'var(--text-secondary)', marginBottom: '6px' }}>
              Correo Electrónico
            </label>
            <input
              type="email"
              required
              placeholder="tu@correo.com"
              value={email}
              onChange={e => setEmail(e.target.value)}
              className="input-custom"
            />
          </div>

          <div>
            <label style={{ display: 'block', fontSize: '0.8rem', color: 'var(--text-secondary)', marginBottom: '6px' }}>
              Contraseña
            </label>
            <input
              type="password"
              required
              placeholder="••••••••"
              value={password}
              onChange={e => setPassword(e.target.value)}
              className="input-custom"
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className="btn btn-primary"
            style={{ width: '100%', marginTop: '8px', padding: '12px' }}
          >
            {loading ? 'Procesando...' : mode === 'signin' ? 'Iniciar Sesión' : 'Registrarse'}
          </button>
        </form>

        {/* Demo Roles for Judges & Evaluators */}
        <div style={{ marginTop: '28px', paddingTop: '20px', borderTop: '1px solid var(--border-subtle)' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '6px', justifyContent: 'center', marginBottom: '12px', fontSize: '0.78rem', color: 'var(--brand-gold)', fontWeight: 600 }}>
            <Sparkles size={14} /> Acceso Rápido para Pruebas / Jurado:
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '8px' }}>
            <button
              type="button"
              onClick={() => handleQuickDemo('client')}
              className="btn btn-ghost btn-sm"
              style={{ fontSize: '0.78rem', padding: '8px', border: '1px solid var(--border-subtle)', justifyContent: 'flex-start', gap: '6px' }}
            >
              <ShoppingBag size={14} color="var(--brand-gold)" /> Cliente (Ana M.)
            </button>
            <button
              type="button"
              onClick={() => handleQuickDemo('traveler')}
              className="btn btn-ghost btn-sm"
              style={{ fontSize: '0.78rem', padding: '8px', border: '1px solid var(--border-subtle)', justifyContent: 'flex-start', gap: '6px' }}
            >
              <Plane size={14} color="var(--brand-cyan)" /> Viajero (Alejandro)
            </button>
            <button
              type="button"
              onClick={() => handleQuickDemo('merchant')}
              className="btn btn-ghost btn-sm"
              style={{ fontSize: '0.78rem', padding: '8px', border: '1px solid var(--border-subtle)', justifyContent: 'flex-start', gap: '6px' }}
            >
              <Store size={14} color="var(--brand-emerald)" /> Comercio (Demetrio)
            </button>
            <button
              type="button"
              onClick={() => handleQuickDemo('admin')}
              className="btn btn-ghost btn-sm"
              style={{ fontSize: '0.78rem', padding: '8px', border: '1px solid var(--border-subtle)', justifyContent: 'flex-start', gap: '6px' }}
            >
              <ShieldCheck size={14} color="var(--brand-purple)" /> Auditor (Admin)
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

export default function AuthPage() {
  return (
    <Suspense fallback={
      <div style={{ minHeight: '80vh', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <div className="spinner" />
      </div>
    }>
      <AuthContent />
    </Suspense>
  );
}
