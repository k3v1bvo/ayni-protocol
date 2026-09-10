'use client';

import React, { useState, Suspense } from 'react';
import Link from 'next/link';
import { useRouter, useSearchParams } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';
import { UserRole } from '@/lib/supabase/types';
import { sanitizeEmail, sanitizeText, sanitizeRedirect } from '@/lib/utils/sanitizer';
import {
  Mail, Lock, User, Sparkles, CheckCircle, AlertCircle, ArrowLeft,
  ShieldCheck, Plane, ShoppingBag, Store, Eye, EyeOff, ChevronRight,
  HeartPulse, Shield, Zap
} from 'lucide-react';

function AuthContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const rawRedirect = searchParams.get('redirect') || '/dashboard';
  const redirectUrl = sanitizeRedirect(rawRedirect, '/dashboard');

  const { signInWithEmail, signUpWithEmail, signInWithGoogle, setDemoUser } = useAuth();
  const initialMode = searchParams.get('mode') === 'signup' ? 'signup' : 'signin';
  const [mode, setMode] = useState<'signin' | 'signup'>(initialMode);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [fullName, setFullName] = useState('');
  const [role, setRole] = useState<UserRole>('client');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setSuccessMsg(null);

    // Strict sanitization layer (Clean Architecture)
    const cleanEmail = sanitizeEmail(email);
    if (!cleanEmail) {
      setError('Por favor ingresa una dirección de correo electrónico válida (ej: usuario@correo.com).');
      return;
    }

    if (!password || password.length < 6) {
      setError('La contraseña debe contener al menos 6 caracteres.');
      return;
    }

    setLoading(true);

    try {
      if (mode === 'signin') {
        const res = await signInWithEmail(cleanEmail, password);
        if (res.error) {
          setError(res.error);
        } else {
          setSuccessMsg('¡Bienvenido de vuelta a AYNI!');
          setTimeout(() => router.push(redirectUrl), 400);
        }
      } else {
        const cleanFullName = sanitizeText(fullName, 120);
        if (!cleanFullName) {
          setError('Por favor ingresa tu nombre completo.');
          setLoading(false);
          return;
        }

        const res = await signUpWithEmail(cleanEmail, password, cleanFullName, role);
        if (res.error) {
          setError(res.error);
        } else {
          setSuccessMsg('¡Cuenta registrada exitosamente en AYNI!');
          setTimeout(() => router.push(redirectUrl), 400);
        }
      }
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Ocurrió un error inesperado al autenticar.';
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
    setSuccessMsg(`Ingresando con perfil de prueba (${demoRole})...`);
    setTimeout(() => router.push(redirectUrl), 250);
  };

  return (
    <div className="auth-page-wrapper">
      {/* Background ambient lighting */}
      <div className="auth-ambient-glow-1" />
      <div className="auth-ambient-glow-2" />

      {/* Main Luxury Glass Monolith */}
      <div className="auth-monolith-grid sc-perspective-container">
        
        {/* Left Column: Brand & Security Showcase */}
        <div className="auth-showcase-panel">
          <div>
            {/* Holographic Logo Badge */}
            <div style={{ display: 'flex', alignItems: 'center', gap: '14px', marginBottom: '32px' }}>
              <div style={{
                width: 48,
                height: 48,
                borderRadius: 14,
                background: 'linear-gradient(135deg, var(--brand-cyan) 0%, var(--brand-gold) 100%)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontWeight: 900,
                fontSize: '1.4rem',
                color: '#050810',
                boxShadow: '0 0 28px rgba(0, 207, 255, 0.45)',
              }}>
                A
              </div>
              <div>
                <div style={{ fontFamily: 'var(--font-display)', fontWeight: 800, fontSize: '1.4rem', letterSpacing: '-0.02em' }} className="gradient-text-gold">
                  AYNI PROTOCOL
                </div>
                <div style={{ fontSize: '0.7rem', color: 'var(--brand-cyan)', letterSpacing: '0.08em', textTransform: 'uppercase', fontWeight: 600 }}>
                  Red Global Descentralizada
                </div>
              </div>
            </div>

            <h1 style={{
              fontFamily: 'var(--font-display)',
              fontSize: '2.1rem',
              fontWeight: 800,
              lineHeight: 1.2,
              marginBottom: '16px',
              letterSpacing: '-0.02em',
            }}>
              Acceso Soberano al <br />
              <span className="gradient-text-cyan">Protocolo Global P2P</span>
            </h1>

            <p style={{ color: 'var(--text-secondary)', fontSize: '0.92rem', lineHeight: 1.65, marginBottom: '36px' }}>
              Crowdshipping transfronterizo, condimentos autóctonos de la diáspora y bóvedas de herencia cripto respaldadas por contratos inteligentes en Base L2.
            </p>

            {/* Architecture Guarantees */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
              <div style={{ display: 'flex', alignItems: 'flex-start', gap: '12px' }}>
                <div style={{ width: 28, height: 28, borderRadius: 8, background: 'rgba(0,207,255,0.12)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--brand-cyan)', flexShrink: 0 }}>
                  <ShieldCheck size={16} />
                </div>
                <div>
                  <div style={{ fontSize: '0.88rem', fontWeight: 700, color: 'var(--text-primary)' }}>
                    Escrow No Custodial en Base L2
                  </div>
                  <div style={{ fontSize: '0.78rem', color: 'var(--text-muted)' }}>
                    Gas subcentavo (&lt;$0.01) y fondos bloqueados con seguridad Keccak-256.
                  </div>
                </div>
              </div>

              <div style={{ display: 'flex', alignItems: 'flex-start', gap: '12px' }}>
                <div style={{ width: 28, height: 28, borderRadius: 8, background: 'rgba(245,166,35,0.12)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--brand-gold)', flexShrink: 0 }}>
                  <HeartPulse size={16} />
                </div>
                <div>
                  <div style={{ fontSize: '0.88rem', fontWeight: 700, color: 'var(--text-primary)' }}>
                    Bóvedas Heritage Sucesoria
                  </div>
                  <div style={{ fontSize: '0.78rem', color: 'var(--text-muted)' }}>
                    Smart Contracts Dead Man's Switch sin intermediarios notariales.
                  </div>
                </div>
              </div>

              <div style={{ display: 'flex', alignItems: 'flex-start', gap: '12px' }}>
                <div style={{ width: 28, height: 28, borderRadius: 8, background: 'rgba(0,214,143,0.12)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--brand-emerald)', flexShrink: 0 }}>
                  <Zap size={16} />
                </div>
                <div>
                  <div style={{ fontSize: '0.88rem', fontWeight: 700, color: 'var(--text-primary)' }}>
                    Auditoría IA Gemini Vision OCR
                  </div>
                  <div style={{ fontSize: '0.78rem', color: 'var(--text-muted)' }}>
                    Verificación en tiempo real de facturas, recibos y sellos aduaneros.
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Real-time Network Pill */}
          <div style={{
            marginTop: '36px',
            padding: '14px 18px',
            background: 'rgba(5, 8, 16, 0.65)',
            borderRadius: '16px',
            border: '1px solid rgba(0, 207, 255, 0.2)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
          }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <span style={{ width: 8, height: 8, borderRadius: '50%', background: 'var(--brand-emerald)', boxShadow: '0 0 8px var(--brand-emerald)' }} />
              <span style={{ fontSize: '0.78rem', color: 'var(--text-secondary)' }}>Red Base L2 Operativa</span>
            </div>
            <span style={{ fontSize: '0.82rem', fontWeight: 700, color: 'var(--brand-cyan)' }}>
              $480,240 USDC
            </span>
          </div>
        </div>

        {/* Right Column: High-End Glass Form */}
        <div className="auth-form-panel">
          <Link
            href="/"
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
            <ArrowLeft size={15} /> Volver al Inicio
          </Link>

          <div style={{ marginBottom: '24px' }}>
            <h2 style={{ fontSize: '1.75rem', fontWeight: 800, letterSpacing: '-0.02em', marginBottom: '6px' }}>
              {mode === 'signin' ? 'Iniciar Sesión' : 'Crear Cuenta'}
            </h2>
            <p style={{ color: 'var(--text-secondary)', fontSize: '0.85rem' }}>
              {mode === 'signin'
                ? 'Ingresa tus credenciales para gestionar tus envíos, viajes y bóvedas.'
                : 'Únete a la comunidad AYNI como cliente, viajero o comercio registrado.'}
            </p>
          </div>

          {/* Tab Switcher */}
          <div style={{
            display: 'flex',
            background: 'rgba(5, 8, 16, 0.6)',
            borderRadius: '14px',
            padding: '4px',
            marginBottom: '22px',
            border: '1px solid var(--border-default)',
          }}>
            <button
              type="button"
              className={`auth-tab-pill ${mode === 'signin' ? 'active' : ''}`}
              onClick={() => { setMode('signin'); setError(null); setSuccessMsg(null); }}
            >
              Iniciar Sesión
            </button>
            <button
              type="button"
              className={`auth-tab-pill ${mode === 'signup' ? 'active' : ''}`}
              onClick={() => { setMode('signup'); setError(null); setSuccessMsg(null); }}
            >
              Crear Cuenta
            </button>
          </div>

          {/* Feedback Messages */}
          {error && (
            <div style={{
              background: 'rgba(239, 68, 68, 0.12)',
              border: '1px solid rgba(239, 68, 68, 0.3)',
              borderRadius: '12px',
              padding: '12px 16px',
              color: '#f87171',
              fontSize: '0.85rem',
              marginBottom: '18px',
              display: 'flex',
              alignItems: 'center',
              gap: '10px',
            }}>
              <AlertCircle size={17} style={{ flexShrink: 0 }} />
              <span>{error}</span>
            </div>
          )}

          {successMsg && (
            <div style={{
              background: 'rgba(16, 185, 129, 0.12)',
              border: '1px solid rgba(16, 185, 129, 0.3)',
              borderRadius: '12px',
              padding: '12px 16px',
              color: '#34d399',
              fontSize: '0.85rem',
              marginBottom: '18px',
              display: 'flex',
              alignItems: 'center',
              gap: '10px',
            }}>
              <CheckCircle size={17} style={{ flexShrink: 0 }} />
              <span>{successMsg}</span>
            </div>
          )}

          {/* Google OAuth Button */}
          <button
            type="button"
            onClick={handleGoogle}
            disabled={loading}
            className="btn btn-outline"
            style={{
              width: '100%',
              marginBottom: '18px',
              padding: '12px 16px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '10px',
              fontSize: '0.9rem',
              fontWeight: 600,
              borderColor: 'rgba(255,255,255,0.12)',
            }}
          >
            <svg width="18" height="18" viewBox="0 0 24 24">
              <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
              <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
              <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z"/>
              <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z"/>
            </svg>
            <span>Continuar con Google</span>
          </button>

          <div style={{
            display: 'flex',
            alignItems: 'center',
            gap: '12px',
            margin: '0 0 18px',
            color: 'var(--text-muted)',
            fontSize: '0.78rem',
          }}>
            <div style={{ flex: 1, height: 1, background: 'var(--border-subtle)' }} />
            <span>o ingresa con tu correo</span>
            <div style={{ flex: 1, height: 1, background: 'var(--border-subtle)' }} />
          </div>

          <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
            {mode === 'signup' && (
              <>
                {/* Full Name */}
                <div>
                  <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 600, color: 'var(--text-secondary)', marginBottom: '6px' }}>
                    Nombre Completo
                  </label>
                  <div className="auth-input-wrapper">
                    <User size={16} className="auth-input-icon" />
                    <input
                      type="text"
                      required
                      placeholder="Ej: Alejandro Mamani Quispe"
                      value={fullName}
                      onChange={e => setFullName(e.target.value)}
                      className="auth-input-field"
                    />
                  </div>
                </div>

                {/* Role Selector */}
                <div>
                  <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 600, color: 'var(--text-secondary)', marginBottom: '8px' }}>
                    Selecciona tu Rol Principal
                  </label>
                  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '10px' }}>
                    {[
                      { id: 'client', label: 'Cliente', desc: 'Envía encargos', icon: ShoppingBag },
                      { id: 'traveler', label: 'Viajero', desc: 'Lleva maletas', icon: Plane },
                      { id: 'merchant', label: 'Comercio', desc: 'Vende productos', icon: Store },
                    ].map(r => {
                      const IconComp = r.icon;
                      return (
                        <div
                          key={r.id}
                          onClick={() => setRole(r.id as UserRole)}
                          className={`auth-role-card ${role === r.id ? 'selected' : ''}`}
                        >
                          <IconComp size={18} color={role === r.id ? 'var(--brand-cyan)' : 'var(--text-muted)'} />
                          <div style={{ fontSize: '0.82rem', fontWeight: 700, color: role === r.id ? 'var(--brand-cyan)' : 'var(--text-primary)' }}>
                            {r.label}
                          </div>
                          <div style={{ fontSize: '0.68rem', color: 'var(--text-muted)' }}>
                            {r.desc}
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              </>
            )}

            {/* Email */}
            <div>
              <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 600, color: 'var(--text-secondary)', marginBottom: '6px' }}>
                Correo Electrónico
              </label>
              <div className="auth-input-wrapper">
                <Mail size={16} className="auth-input-icon" />
                <input
                  type="email"
                  required
                  placeholder="tu.correo@ejemplo.com"
                  value={email}
                  onChange={e => setEmail(e.target.value)}
                  className="auth-input-field"
                />
              </div>
            </div>

            {/* Password */}
            <div>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '6px' }}>
                <label style={{ fontSize: '0.8rem', fontWeight: 600, color: 'var(--text-secondary)' }}>
                  Contraseña
                </label>
                {mode === 'signin' && (
                  <span style={{ fontSize: '0.74rem', color: 'var(--brand-cyan)', cursor: 'pointer' }} onClick={() => setError('Contacta al soporte AYNI o recupera vía correo.')}>
                    ¿Olvidaste tu contraseña?
                  </span>
                )}
              </div>
              <div className="auth-input-wrapper" style={{ position: 'relative' }}>
                <Lock size={16} className="auth-input-icon" />
                <input
                  type={showPassword ? 'text' : 'password'}
                  required
                  placeholder="••••••••••••"
                  value={password}
                  onChange={e => setPassword(e.target.value)}
                  className="auth-input-field"
                  style={{ paddingRight: '42px' }}
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

            {/* Submit Button */}
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
                  <span>Procesando...</span>
                </>
              ) : mode === 'signin' ? (
                <>
                  <span>Ingresar a mi Cuenta</span>
                  <ChevronRight size={16} />
                </>
              ) : (
                <>
                  <span>Crear Cuenta Gratuita</span>
                  <Sparkles size={16} />
                </>
              )}
            </button>
          </form>

          {/* Quick Demo Access for Judges / Evaluators */}
          <div style={{ marginTop: '28px', paddingTop: '20px', borderTop: '1px solid var(--border-subtle)' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '6px', justifyContent: 'center', marginBottom: '12px', fontSize: '0.78rem', color: 'var(--brand-gold)', fontWeight: 600 }}>
              <Sparkles size={14} /> Acceso Rápido para Pruebas / Jurado:
            </div>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '8px' }}>
              <button
                type="button"
                onClick={() => handleQuickDemo('client')}
                className="btn btn-ghost btn-sm"
                style={{ fontSize: '0.76rem', padding: '9px 10px', border: '1px solid rgba(245,166,35,0.25)', justifyContent: 'flex-start', gap: '6px' }}
              >
                <ShoppingBag size={14} color="var(--brand-gold)" /> Cliente (Ana M.)
              </button>
              <button
                type="button"
                onClick={() => handleQuickDemo('traveler')}
                className="btn btn-ghost btn-sm"
                style={{ fontSize: '0.76rem', padding: '9px 10px', border: '1px solid rgba(0,207,255,0.25)', justifyContent: 'flex-start', gap: '6px' }}
              >
                <Plane size={14} color="var(--brand-cyan)" /> Viajero (Alejandro)
              </button>
              <button
                type="button"
                onClick={() => handleQuickDemo('merchant')}
                className="btn btn-ghost btn-sm"
                style={{ fontSize: '0.76rem', padding: '9px 10px', border: '1px solid rgba(0,214,143,0.25)', justifyContent: 'flex-start', gap: '6px' }}
              >
                <Store size={14} color="var(--brand-emerald)" /> Comercio (Demetrio)
              </button>
              <button
                type="button"
                onClick={() => handleQuickDemo('admin')}
                className="btn btn-ghost btn-sm"
                style={{ fontSize: '0.76rem', padding: '9px 10px', border: '1px solid rgba(155,114,255,0.25)', justifyContent: 'flex-start', gap: '6px' }}
              >
                <ShieldCheck size={14} color="var(--brand-purple)" /> Auditor (Admin)
              </button>
            </div>
          </div>

        </div>
      </div>
    </div>
  );
}

export default function AuthPage() {
  return (
    <Suspense fallback={
      <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'var(--bg-app)' }}>
        <div className="spinner" style={{ width: 28, height: 28 }} />
      </div>
    }>
      <AuthContent />
    </Suspense>
  );
}
