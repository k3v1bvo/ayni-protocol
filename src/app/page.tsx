'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';
import { Plane, ShoppingBag, ShieldCheck, Sparkles, ArrowRight, Store, Users, CheckCircle, Globe, TrendingUp, Zap } from 'lucide-react';
import { AuthModal } from '@/components/auth/AuthModal';

const STATS = [
  { label: 'Países conectados', value: '12+', color: 'var(--brand-cyan)' },
  { label: 'Ahorro vs courier', value: '65%', color: 'var(--brand-emerald)' },
  { label: 'Gas en Base L2', value: '<$0.01', color: 'var(--brand-gold)' },
  { label: 'Fondo de garantía', value: '2%', color: 'var(--brand-purple)' },
];

const FEATURES = [
  {
    icon: Plane,
    color: 'var(--brand-cyan)',
    bg: 'rgba(0,207,255,0.1)',
    title: 'Crowdshipping Inteligente',
    desc: 'Viajeros comparten espacio de equipaje. Tú envías paquetes y compras a precios justos sin pagar couriers abusivos.',
  },
  {
    icon: Store,
    color: 'var(--brand-emerald)',
    bg: 'rgba(0,214,143,0.1)',
    title: 'Marketplace de Artesanías',
    desc: 'Comerciantes locales y artesanos publican sus productos. Viajeros los compran en mostrador y los llevan a destino.',
  },
  {
    icon: ShieldCheck,
    color: 'var(--brand-gold)',
    bg: 'rgba(245,166,35,0.1)',
    title: 'Escrow & OTP Seguro',
    desc: 'Fondos protegidos en smart contract. La entrega se confirma con un código OTP criptográfico de 6 dígitos.',
  },
  {
    icon: Sparkles,
    color: 'var(--brand-purple)',
    bg: 'rgba(155,114,255,0.1)',
    title: 'Auditoría con IA Multimodal',
    desc: 'Google Gemini verifica facturas, extrae montos y valida que el producto corresponda antes de aprobar el pago.',
  },
];

const TESTIMONIALS = [
  {
    name: 'Dra. Claudia Vargas',
    role: 'Cliente / Compradora',
    text: 'Recibí mis implantes dentales de Madrid en perfectas condiciones. Pagué solo el 7% de comisión, no el 40% del courier.',
    stars: 5,
    badge: 'badge-gold',
    location: 'La Paz, Bolivia',
  },
  {
    name: 'Alejandro Mamani',
    role: 'Viajero Frecuente',
    text: 'Viajo cada mes a España. Con AYNI, uso el espacio de mi maleta y genero ingresos extras de forma completamente segura.',
    stars: 5,
    badge: 'badge-cyan',
    location: 'Madrid → La Paz',
  },
  {
    name: 'Tejidos Illimani',
    role: 'Comerciante / Artesana',
    text: 'Mi tienda de tejidos andinos ahora llega a clientes en Europa y EE.UU. Los viajeros los llevan físicamente. ¡Increíble!',
    stars: 5,
    badge: 'badge-emerald',
    location: 'Cochabamba, Bolivia',
  },
];

export default function LandingPage() {
  const { user, isLoading } = useAuth();
  const router = useRouter();
  const [authOpen, setAuthOpen] = useState(false);
  const [authMode, setAuthMode] = useState<'signin' | 'signup'>('signin');

  useEffect(() => {
    if (!isLoading && user) {
      router.push('/dashboard');
    }
  }, [user, isLoading, router]);

  if (isLoading) {
    return (
      <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <div style={{ color: 'var(--text-muted)', fontSize: '0.9rem' }}>Cargando...</div>
      </div>
    );
  }

  return (
    <>
      {/* NAVBAR */}
      <header style={{
        position: 'sticky',
        top: 0,
        zIndex: 90,
        background: 'rgba(5,8,16,0.9)',
        backdropFilter: 'blur(20px)',
        borderBottom: '1px solid var(--border-subtle)',
      }}>
        <div className="container" style={{ display: 'flex', alignItems: 'center', height: '68px', gap: '24px' }}>
          <a href="/" style={{ display: 'flex', alignItems: 'center', gap: '10px', textDecoration: 'none', flexShrink: 0 }}>
            <div style={{
              width: 38,
              height: 38,
              borderRadius: 10,
              background: 'linear-gradient(135deg, var(--brand-cyan), var(--brand-gold))',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              fontWeight: 900, fontSize: '1.1rem', color: '#050810',
              boxShadow: '0 0 20px rgba(0,207,255,0.3)',
            }}>A</div>
            <span style={{ fontFamily: 'var(--font-display)', fontWeight: 700, fontSize: '1.1rem' }} className="gradient-text-gold">
              AYNI / MINKA
            </span>
          </a>

          <nav style={{ display: 'flex', gap: '4px', flex: 1 }}>
            {[
              { label: 'Marketplace', href: '#marketplace' },
              { label: 'Rutas', href: '#rutas' },
              { label: 'Cómo funciona', href: '#como-funciona' },
              { label: 'Tarifas', href: '#tarifas' },
            ].map(l => (
              <a key={l.href} href={l.href} style={{
                padding: '6px 14px',
                borderRadius: 8,
                color: 'var(--text-secondary)',
                textDecoration: 'none',
                fontSize: '0.875rem',
                fontWeight: 500,
                transition: 'all 0.15s',
              }}>
                {l.label}
              </a>
            ))}
          </nav>

          <div style={{ display: 'flex', gap: '10px', alignItems: 'center', flexShrink: 0 }}>
            <button type="button" className="btn btn-ghost btn-sm" onClick={() => { setAuthMode('signin'); setAuthOpen(true); }}>
              Iniciar Sesión
            </button>
            <button type="button" className="btn btn-primary btn-sm" onClick={() => { setAuthMode('signup'); setAuthOpen(true); }}>
              Registrarse Gratis
            </button>
          </div>
        </div>
      </header>

      {/* HERO */}
      <section style={{ padding: '90px 0 70px', position: 'relative', overflow: 'hidden' }}>
        {/* Background glow orbs */}
        <div style={{ position: 'absolute', top: '-100px', left: '10%', width: '600px', height: '600px', borderRadius: '50%', background: 'radial-gradient(circle, rgba(0,207,255,0.08) 0%, transparent 70%)', pointerEvents: 'none' }} />
        <div style={{ position: 'absolute', top: '50px', right: '5%', width: '400px', height: '400px', borderRadius: '50%', background: 'radial-gradient(circle, rgba(245,166,35,0.07) 0%, transparent 70%)', pointerEvents: 'none' }} />

        <div className="container" style={{ textAlign: 'center', position: 'relative', zIndex: 2 }}>
          <div style={{
            display: 'inline-flex', alignItems: 'center', gap: '8px',
            background: 'rgba(0,207,255,0.1)', border: '1px solid var(--border-cyan)',
            borderRadius: '9999px', padding: '6px 16px', marginBottom: '28px',
          }}>
            <span style={{ width: 7, height: 7, borderRadius: '50%', background: 'var(--brand-emerald)', boxShadow: '0 0 8px var(--brand-emerald)', display: 'inline-block' }} />
            <span style={{ fontSize: '0.82rem', fontWeight: 600, color: 'var(--brand-cyan)' }}>
              🏔️ Buildathon ETH Bolivia 2026 — Protocolo Oficial AYNI / MINKA
            </span>
          </div>

          <h1 style={{
            fontFamily: 'var(--font-display)',
            fontSize: 'clamp(2.8rem, 6vw, 5rem)',
            fontWeight: 800,
            letterSpacing: '-0.04em',
            lineHeight: 1.08,
            maxWidth: '900px',
            margin: '0 auto 24px',
          }}>
            Logística P2P y <br />
            <span className="gradient-text-cyan">Marketplace Andino</span><br />
            en <span className="gradient-text-gold">Base L2</span>
          </h1>

          <p style={{
            fontSize: 'clamp(1rem, 2vw, 1.2rem)',
            color: 'var(--text-secondary)',
            maxWidth: '700px',
            margin: '0 auto 40px',
            lineHeight: 1.7,
          }}>
            Transformamos el espacio de equipaje de viajeros en una red de comercio descentralizado. Artesanos locales, compradores globales, entrega segura con Escrow Web3 y verificación IA.
          </p>

          <div style={{ display: 'flex', justifyContent: 'center', gap: '14px', flexWrap: 'wrap', marginBottom: '70px' }}>
            <button
              type="button"
              className="btn btn-primary btn-lg"
              onClick={() => { setAuthMode('signup'); setAuthOpen(true); }}
            >
              Empezar Gratis <ArrowRight size={18} />
            </button>
            <button
              type="button"
              className="btn btn-ghost btn-lg"
              onClick={() => { setAuthMode('signin'); setAuthOpen(true); }}
            >
              Ver el Marketplace
            </button>
          </div>

          {/* Stats row */}
          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(160px, 1fr))',
            gap: '16px',
            maxWidth: '780px',
            margin: '0 auto',
          }}>
            {STATS.map(s => (
              <div key={s.label} style={{
                background: 'var(--bg-card)',
                border: '1px solid var(--border-default)',
                borderRadius: '14px',
                padding: '18px',
                textAlign: 'center',
              }}>
                <div style={{ fontFamily: 'var(--font-display)', fontSize: '2rem', fontWeight: 800, color: s.color }}>
                  {s.value}
                </div>
                <div style={{ fontSize: '0.78rem', color: 'var(--text-secondary)', marginTop: '4px' }}>{s.label}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* FEATURES */}
      <section id="como-funciona" style={{ padding: '70px 0', borderTop: '1px solid var(--border-subtle)' }}>
        <div className="container">
          <div style={{ textAlign: 'center', marginBottom: '50px' }}>
            <div className="badge badge-cyan" style={{ marginBottom: '12px' }}>Arquitectura del Protocolo</div>
            <h2 style={{ fontFamily: 'var(--font-display)', fontSize: 'clamp(1.8rem, 4vw, 2.8rem)', fontWeight: 700, letterSpacing: '-0.03em' }}>
              Todo en una sola plataforma
            </h2>
            <p style={{ color: 'var(--text-secondary)', maxWidth: '600px', margin: '12px auto 0', fontSize: '1.05rem' }}>
              Reciprocidad andina (*Ayni*) aplicada a la logística moderna con tecnología Web3.
            </p>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))', gap: '20px' }}>
            {FEATURES.map((f, i) => (
              <div key={i} className="card" style={{ padding: '28px', display: 'flex', flexDirection: 'column', gap: '14px' }}>
                <div style={{
                  width: 52, height: 52, borderRadius: '14px',
                  background: f.bg, color: f.color,
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                }}>
                  <f.icon size={26} />
                </div>
                <div>
                  <div style={{ fontWeight: 700, fontSize: '1.05rem', marginBottom: '8px' }}>{f.title}</div>
                  <div style={{ color: 'var(--text-secondary)', fontSize: '0.9rem', lineHeight: 1.6 }}>{f.desc}</div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* TESTIMONIALS */}
      <section style={{ padding: '70px 0', borderTop: '1px solid var(--border-subtle)' }}>
        <div className="container">
          <div style={{ textAlign: 'center', marginBottom: '50px' }}>
            <h2 style={{ fontFamily: 'var(--font-display)', fontSize: 'clamp(1.8rem, 4vw, 2.5rem)', fontWeight: 700 }}>
              La comunidad AYNI habla
            </h2>
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '20px' }}>
            {TESTIMONIALS.map((t, i) => (
              <div key={i} className="card" style={{ padding: '24px' }}>
                <div style={{ display: 'flex', gap: '3px', marginBottom: '12px' }}>
                  {Array.from({ length: t.stars }).map((_, j) => (
                    <span key={j} style={{ color: 'var(--brand-gold)', fontSize: '1rem' }}>★</span>
                  ))}
                </div>
                <p style={{ color: 'var(--text-secondary)', fontSize: '0.9rem', lineHeight: 1.6, marginBottom: '16px', fontStyle: 'italic' }}>
                  "{t.text}"
                </p>
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                  <div>
                    <div style={{ fontWeight: 600, fontSize: '0.9rem' }}>{t.name}</div>
                    <div style={{ color: 'var(--text-muted)', fontSize: '0.75rem' }}>{t.location}</div>
                  </div>
                  <span className={`badge ${t.badge}`}>{t.role}</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA FINAL */}
      <section style={{ padding: '80px 0' }}>
        <div className="container">
          <div style={{
            background: 'linear-gradient(135deg, rgba(0,207,255,0.08) 0%, rgba(245,166,35,0.08) 100%)',
            border: '1px solid rgba(0,207,255,0.2)',
            borderRadius: '24px',
            padding: '60px 40px',
            textAlign: 'center',
          }}>
            <h2 style={{ fontFamily: 'var(--font-display)', fontSize: 'clamp(1.8rem, 4vw, 2.8rem)', fontWeight: 800, letterSpacing: '-0.03em', marginBottom: '16px' }}>
              ¿Listo para ser parte del<br /><span className="gradient-text-gold">Protocolo AYNI</span>?
            </h2>
            <p style={{ color: 'var(--text-secondary)', maxWidth: '500px', margin: '0 auto 36px', fontSize: '1.05rem' }}>
              Únete como Cliente, Viajero o Comerciante. Gratis, seguro y descentralizado.
            </p>
            <button
              type="button"
              className="btn btn-primary btn-lg"
              onClick={() => { setAuthMode('signup'); setAuthOpen(true); }}
            >
              <Sparkles size={18} />
              Crear cuenta gratuita
            </button>
          </div>
        </div>
      </section>

      {/* FOOTER */}
      <footer style={{ borderTop: '1px solid var(--border-subtle)', padding: '32px 0' }}>
        <div className="container" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '16px' }}>
          <div>
            <div style={{ fontFamily: 'var(--font-display)', fontWeight: 700 }} className="gradient-text-gold">
              AYNI / MINKA Protocol
            </div>
            <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginTop: '4px' }}>
              ERS v1.0.1 — Buildathon ETH Bolivia 2026 • Base L2
            </div>
          </div>
          <a href="https://github.com/k3v1bvo/ayni-protocol" target="_blank" rel="noreferrer" style={{ color: 'var(--brand-cyan)', fontSize: '0.85rem', textDecoration: 'none' }}>
            github.com/k3v1bvo/ayni-protocol →
          </a>
        </div>
      </footer>

      <AuthModal isOpen={authOpen} onClose={() => setAuthOpen(false)} initialMode={authMode} />
    </>
  );
}
