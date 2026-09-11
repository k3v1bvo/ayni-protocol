'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';
import {
  Plane, ShoppingBag, ShieldCheck, Sparkles, ArrowRight, Store,
  Users, CheckCircle, Globe, TrendingUp, Zap, Lock, HeartHandshake,
  DollarSign, Clock, Shield, ChevronRight, Award, Flame, HeartPulse,
  RefreshCw, Key, ExternalLink
} from 'lucide-react';
import { InteractiveWorldRadar } from '@/components/home/InteractiveWorldRadar';


const STATS = [
  { label: 'Países conectados', value: '28+', color: 'var(--brand-cyan)' },
  { label: 'Ahorro vs courier tradicional', value: '68%', color: 'var(--brand-emerald)' },
  { label: 'Costo por transacción L2', value: '<$0.01', color: 'var(--brand-gold)' },
  { label: 'Tasa de éxito en entregas OTP', value: '99.8%', color: 'var(--brand-purple)' },
];

const BUSINESS_MODEL = [
  {
    role: 'Viajero / Courier P2P',
    share: '70%',
    color: 'var(--brand-cyan)',
    bg: 'rgba(0,207,255,0.08)',
    border: 'rgba(0,207,255,0.25)',
    title: 'Monetización Directa de Equipaje',
    desc: 'Los viajeros rentabilizan el espacio libre de sus maletas en vuelos internacionales o realizan compras asistidas a pie, recibiendo el 70% íntegro de la tarifa en USDC o cripto de forma inmediata al entregar.',
  },
  {
    role: 'Fondo de Cobertura Escrow',
    share: '20%',
    color: 'var(--brand-gold)',
    bg: 'rgba(245,166,35,0.08)',
    border: 'rgba(245,166,35,0.25)',
    title: 'Garantía Total Anti-Pérdidas',
    desc: 'Un fondo de reserva descentralizado auditado en Smart Contracts que cubre automáticamente al comprador y al comerciante ante demoras aéreas, extravíos o daños en ruta.',
  },
  {
    role: 'Protocolo AYNI',
    share: '10%',
    color: 'var(--brand-emerald)',
    bg: 'rgba(0,214,143,0.08)',
    border: 'rgba(0,214,143,0.25)',
    title: 'Infraestructura, IA & Oráculos',
    desc: 'Financia los oráculos de precios, el combustible de red (gas L2) y los algoritmos de visión computacional / IA que analizan comprobantes y facturas aduaneras en tiempo real.',
  },
];

const PILLARS = [
  {
    badge: 'Logística Colaborativa',
    title: 'Crowdshipping & Compras a Pie',
    desc: 'Conectamos a viajeros que vuelan con espacio libre en sus maletas con personas que necesitan enviar o recibir encargos urgentes, insumos médicos o artesanías sin las tarifas abusivas de couriers tradicionales.',
    img: '/images/ayni_hero_banner.jpg',
    features: [
      'Entregas en 24 a 48 horas en vuelos directos',
      'Auditoría IA de facturas y boletas de compra',
      'Confirmación con código OTP criptográfico Keccak-256',
    ],
  },
  {
    badge: 'Nostalgia & Sazón de Casa',
    title: 'Condimentos & Sabores para la Diáspora',
    desc: 'Quienes emigran al extranjero sufren por la falta de sus sabores nativos. AYNI permite encargar ajíes en vainas, llajwa deshidratada artesanal, sales ancestrales y condimentos autóctonos envasados al vacío y aprobados para cabina.',
    img: '/images/ayni_condiments_diaspora.jpg',
    features: [
      'Empaques herméticos con sellos de inviolabilidad',
      'Origen certificado: Valles andinos, Amazonía y Altiplano',
      'Transportados en mano por compatriotas que viajan',
    ],
  },
  {
    badge: 'Protección Patrimonial',
    title: 'AYNI Heritage — Herencias Cripto Inteligentes',
    desc: 'Bóvedas descentralizadas para proteger el patrimonio y las remesas de familias migrantes. Si el titular pasa un periodo prolongado inactivo (Dead Man\'s Switch), los fondos se transfieren automáticamente a sus beneficiarios sin intermediarios legales.',
    img: '/images/ayni_heritage_vault.jpg',
    features: [
      'Smart Contract inmutable en Base L2 no custodial',
      'Temporizador de presencia (Heartbeat) configurable',
      'Distribución porcentual automatizada a billeteras EVM',
    ],
  },
];

const TESTIMONIALS = [
  {
    name: 'Dra. Claudia Vargas',
    role: 'Odontóloga / Compradora',
    text: 'Necesitaba implantes de titanio urgente desde Madrid hacia La Paz. Con AYNI, un viajero me los entregó en 36 horas. El Escrow me dio total tranquilidad y la IA validó la factura del comercio.',
    location: 'Madrid → La Paz',
    badge: 'badge-cyan',
  },
  {
    name: 'Gonzalo Fernández',
    role: 'Residente en España / Diáspora',
    text: 'Llevaba 3 años viviendo en Barcelona y no encontraba ají amarillo auténtico ni locoto seco para mis comidas. Un viajero me trajo 4 frascos sellados al vacío. Sentí el sabor de mi hogar de nuevo.',
    location: 'Barcelona, España',
    badge: 'badge-gold',
  },
  {
    name: 'Alejandro Mamani',
    role: 'Viajero Frecuente',
    text: 'Hago la ruta Buenos Aires - Santa Cruz cada 20 días. Llevando encargos en mi maleta genero más de $400 USD extras por viaje de forma legal, segura y con liquidación inmediata al validar el OTP.',
    location: 'Buenos Aires → Santa Cruz',
    badge: 'badge-emerald',
  },
  {
    name: 'Mariana Quispe',
    role: 'Usuaria AYNI Heritage',
    text: 'Tengo ahorros en cripto y remesas que envío a mis hijos en Bolivia. Con la bóveda de AYNI Heritage sé que si algo me pasa en el exterior, ellos recibirán sus fondos sin trabas bancarias.',
    location: 'Miami, EE.UU.',
    badge: 'badge-purple',
  },
];

export default function LandingPage() {
  const { user, isLoading } = useAuth();
  const router = useRouter();
  const [landingHeartbeatDays, setLandingHeartbeatDays] = useState(142);
  const [landingHeartbeatPinged, setLandingHeartbeatPinged] = useState(false);
  const [calcWeight, setCalcWeight] = useState(3.0);
  const [calcRoute, setCalcRoute] = useState<'mad-lpz' | 'mia-sr' | 'bue-cbb'>('mad-lpz');

  useEffect(() => {
    const handleScroll = () => {
      const scrollHeight = document.documentElement.scrollHeight - window.innerHeight;
      if (scrollHeight > 0) {
        const progress = Math.min(1, Math.max(0, window.scrollY / scrollHeight));
        document.documentElement.style.setProperty('--sc-p', progress.toFixed(4));
      }
    };
    window.addEventListener('scroll', handleScroll, { passive: true });
    handleScroll();
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  if (isLoading) {
    return (
      <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'var(--bg-primary)' }}>
        <div style={{ color: 'var(--text-muted)', fontSize: '0.9rem' }}>Cargando protocolo AYNI...</div>
      </div>
    );
  }

  return (
    <>
      {/* Scroll-Craft Cinematic Timeline Bar */}
      <div className="sc-timeline-progress" />

      {/* Top Protocol Status Banner */}
      <div style={{
        background: 'linear-gradient(90deg, #050810, #0a1329, #050810)',
        borderBottom: '1px solid rgba(0,207,255,0.15)',
        padding: '6px 16px',
        textAlign: 'center',
        fontSize: '0.75rem',
        color: 'var(--text-secondary)',
      }}>
        <span style={{ color: 'var(--brand-cyan)', fontWeight: 600 }}>● Red Global AYNI Protocol L2</span>
        <span style={{ margin: '0 8px', color: 'rgba(255,255,255,0.2)' }}>|</span>
        <span>Contratos Escrow Verificados</span>
        <span style={{ margin: '0 8px', color: 'rgba(255,255,255,0.2)' }}>|</span>
        <span style={{ color: 'var(--brand-gold)' }}>🌶️ Especial Diáspora: Condimentos y Sabores Patrios Activos</span>
      </div>

      {/* NAVBAR */}
      <header style={{
        position: 'sticky',
        top: 0,
        zIndex: 90,
        background: 'rgba(5,8,16,0.92)',
        backdropFilter: 'blur(20px)',
        borderBottom: '1px solid var(--border-subtle)',
      }}>
        <div className="container" style={{ display: 'flex', alignItems: 'center', height: '70px', gap: '24px' }}>
          <a href="/" style={{ display: 'flex', alignItems: 'center', gap: '10px', textDecoration: 'none', flexShrink: 0 }}>
            <div style={{
              width: 40,
              height: 40,
              borderRadius: 12,
              background: 'linear-gradient(135deg, var(--brand-cyan), var(--brand-gold))',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              fontWeight: 900, fontSize: '1.2rem', color: '#050810',
              boxShadow: '0 0 20px rgba(0,207,255,0.35)',
            }}>A</div>
            <div>
              <div style={{ fontFamily: 'var(--font-display)', fontWeight: 800, fontSize: '1.25rem', letterSpacing: '-0.02em' }} className="gradient-text-gold">
                AYNI
              </div>
              <div style={{ fontSize: '0.62rem', color: 'var(--text-muted)', letterSpacing: '0.08em', textTransform: 'uppercase' }}>
                Protocolo Global P2P
              </div>
            </div>
          </a>

          <nav style={{ display: 'flex', gap: '6px', flex: 1, justifyContent: 'center' }} className="nav-desktop">
            {[
              { label: 'Cómo Funciona', href: '#como-funciona' },
              { label: 'Marketplace & Condimentos', href: '#pilares' },
              { label: 'Modelo de Negocio', href: '#modelo-negocio' },
              { label: 'Herencias Cripto', href: '#herencias' },
              { label: 'Seguridad & Escrow', href: '#seguridad' },
              { label: 'Comunidad', href: '#testimonios' },
            ].map(l => (
              <a key={l.href} href={l.href} style={{
                padding: '6px 12px',
                borderRadius: 8,
                color: 'var(--text-secondary)',
                textDecoration: 'none',
                fontSize: '0.85rem',
                fontWeight: 500,
                transition: 'all 0.15s',
              }}>
                {l.label}
              </a>
            ))}
          </nav>

          <div style={{ display: 'flex', gap: '10px', alignItems: 'center', flexShrink: 0 }}>
            {user ? (
              <Link
                href="/dashboard"
                className="btn btn-primary btn-sm"
                style={{ display: 'flex', alignItems: 'center', gap: '6px', textDecoration: 'none' }}
              >
                <span>Ir al Dashboard ({user.full_name?.split(' ')[0] || user.role})</span>
                <ChevronRight size={14} />
              </Link>
            ) : (
              <>
                <Link
                  href="/auth?mode=signin"
                  className="btn btn-ghost btn-sm"
                  style={{ textDecoration: 'none', display: 'inline-flex', alignItems: 'center' }}
                >
                  Iniciar Sesión
                </Link>
                <Link
                  href="/auth?mode=signup"
                  className="btn btn-primary btn-sm"
                  style={{ textDecoration: 'none', display: 'inline-flex', alignItems: 'center' }}
                >
                  Crear Cuenta
                </Link>
              </>
            )}
          </div>
        </div>
      </header>

      {/* HERO SECTION */}
      <section style={{ padding: '80px 0 60px', position: 'relative', overflow: 'hidden' }}>
        {/* Background glow orbs */}
        <div style={{ position: 'absolute', top: '-120px', left: '15%', width: '700px', height: '700px', borderRadius: '50%', background: 'radial-gradient(circle, rgba(0,207,255,0.09) 0%, transparent 70%)', pointerEvents: 'none' }} />
        <div style={{ position: 'absolute', top: '100px', right: '10%', width: '500px', height: '500px', borderRadius: '50%', background: 'radial-gradient(circle, rgba(245,166,35,0.08) 0%, transparent 70%)', pointerEvents: 'none' }} />

        <div className="container" style={{ position: 'relative', zIndex: 2 }}>
          <div style={{ textAlign: 'center', maxWidth: '920px', margin: '0 auto' }}>
            <div style={{
              display: 'inline-flex', alignItems: 'center', gap: '8px',
              background: 'rgba(0,207,255,0.08)', border: '1px solid rgba(0,207,255,0.25)',
              borderRadius: '9999px', padding: '6px 18px', marginBottom: '24px',
            }}>
              <span style={{ width: 8, height: 8, borderRadius: '50%', background: 'var(--brand-emerald)', boxShadow: '0 0 10px var(--brand-emerald)', display: 'inline-block' }} />
              <span style={{ fontSize: '0.82rem', fontWeight: 600, color: 'var(--brand-cyan)' }}>
                Protocolo Descentralizado de Logística P2P, Sabores de la Diáspora y Sucesión Cripto
              </span>
            </div>

            <h1 style={{
              fontFamily: 'var(--font-display)',
              fontSize: 'clamp(2.5rem, 5.5vw, 4.5rem)',
              fontWeight: 800,
              letterSpacing: '-0.04em',
              lineHeight: 1.1,
              marginBottom: '20px',
            }}>
              La red global que une <br />
              <span className="gradient-text-cyan">viajeros, productos patrios</span> y <br />
              <span className="gradient-text-gold">patrimonio familiar</span>
            </h1>

            <p style={{
              fontSize: 'clamp(1rem, 1.8vw, 1.2rem)',
              color: 'var(--text-secondary)',
              maxWidth: '750px',
              margin: '0 auto 36px',
              lineHeight: 1.65,
            }}>
              Monetiza el equipaje de tus viajes, encarga condimentos y alimentos típicos que no se consiguen en el extranjero, y asegura el legado de tu familia con bóvedas de herencia protegidas por Smart Contracts inmutables.
            </p>

            <div style={{ display: 'flex', justifyContent: 'center', gap: '14px', flexWrap: 'wrap', marginBottom: '32px' }}>
              <Link
                href="/auth?mode=signup"
                className="btn btn-primary btn-lg"
                style={{ padding: '14px 28px', fontSize: '1rem', textDecoration: 'none', display: 'inline-flex', alignItems: 'center', gap: '8px' }}
              >
                Comenzar con AYNI <ArrowRight size={18} />
              </Link>
              <Link
                href="/dashboard/marketplace"
                className="btn btn-ghost btn-lg"
                style={{ padding: '14px 24px', fontSize: '1rem', border: '1px solid var(--border-default)', textDecoration: 'none', display: 'inline-flex', alignItems: 'center' }}
              >
                Explorar Marketplace 🌶️
              </Link>
              <a
                href="#radar-showcase"
                className="btn btn-ghost btn-lg"
                style={{ padding: '14px 22px', fontSize: '0.92rem', border: '1px solid rgba(0, 207, 255, 0.35)', color: 'var(--brand-cyan)', textDecoration: 'none', display: 'inline-flex', alignItems: 'center', gap: '8px' }}
              >
                <Plane size={16} /> Ver Radar en Vivo
              </a>
            </div>

            {/* Radar Flagship Live Indicator */}
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px', marginBottom: '28px', fontSize: '0.78rem', color: 'var(--text-muted)' }}>
              <span style={{ width: 8, height: 8, borderRadius: '50%', background: 'var(--brand-emerald)', display: 'inline-block', boxShadow: '0 0 10px var(--brand-emerald)' }} />
              <span>Centro de Monitoreo Cripto-Logístico en Tiempo Real</span>
              <span style={{ opacity: 0.3 }}>•</span>
              <span style={{ color: 'var(--brand-cyan)' }}>Simulación Vectorial en Código Puro · Base L2</span>
            </div>
          </div>

          {/* ========================================================
              FLAGSHIP VISUAL: Simulador Interactivo de Vuelos P2P
              ======================================================== */}
          <InteractiveWorldRadar />

          {/* Stats row directly anchoring the world radar */}
          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))',
            gap: '16px',
            marginBottom: '48px',
          }}>
            {STATS.map(s => (
              <div key={s.label} style={{
                background: 'rgba(9, 14, 28, 0.8)',
                backdropFilter: 'blur(12px)',
                border: '1px solid rgba(255, 255, 255, 0.08)',
                borderRadius: '16px',
                padding: '20px',
                textAlign: 'center',
                boxShadow: '0 8px 30px rgba(0,0,0,0.4)',
                transition: 'all 0.25s ease',
              }}>
                <div style={{ fontFamily: 'var(--font-display)', fontSize: '2.1rem', fontWeight: 800, color: s.color }}>
                  {s.value}
                </div>
                <div style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', marginTop: '4px' }}>{s.label}</div>
              </div>
            ))}
          </div>

          {/* INTERACTIVE LIVE COMPARISON CALCULATOR (SCROLL-CRAFT ENGINE) */}
          <div className="sc-live-hud sc-card-depth" style={{ padding: '36px 30px', marginBottom: '20px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '16px', marginBottom: '24px' }}>
              <div>
                <div style={{ display: 'inline-flex', alignItems: 'center', gap: '8px', marginBottom: '6px' }}>
                  <span className="sc-radar-dot" />
                  <span style={{ fontSize: '0.75rem', fontWeight: 700, color: 'var(--brand-cyan)', letterSpacing: '0.08em', textTransform: 'uppercase' }}>
                    Calculadora Cripto-Logística en Vivo
                  </span>
                </div>
                <h3 style={{ fontFamily: 'var(--font-display)', fontSize: '1.45rem', fontWeight: 800, color: 'var(--text-primary)', margin: 0 }}>
                  Compara en Tiempo Real: Courier Tradicional vs Protocolo AYNI
                </h3>
              </div>
              
              {/* Route Picker Pills */}
              <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
                {[
                  { id: 'mad-lpz', label: '🇪🇸 Madrid → 🇧🇴 La Paz' },
                  { id: 'mia-sr', label: '🇺🇸 Miami → 🇧🇴 Santa Cruz' },
                  { id: 'bue-cbb', label: '🇦🇷 Bs. Aires → 🇧🇴 Cochabamba' },
                ].map(r => (
                  <button
                    key={r.id}
                    type="button"
                    onClick={() => setCalcRoute(r.id as any)}
                    style={{
                      padding: '8px 14px',
                      borderRadius: '10px',
                      fontSize: '0.78rem',
                      fontWeight: 600,
                      background: calcRoute === r.id ? 'rgba(0, 207, 255, 0.15)' : 'rgba(255, 255, 255, 0.04)',
                      border: calcRoute === r.id ? '1px solid var(--brand-cyan)' : '1px solid rgba(255, 255, 255, 0.08)',
                      color: calcRoute === r.id ? 'var(--brand-cyan)' : 'var(--text-secondary)',
                      cursor: 'pointer',
                      transition: 'all 0.25s ease',
                    }}
                  >
                    {r.label}
                  </button>
                ))}
              </div>
            </div>

            {/* Weight Slider Section */}
            <div style={{ background: 'rgba(5, 8, 16, 0.6)', padding: '20px 24px', borderRadius: '16px', border: '1px solid rgba(255, 255, 255, 0.06)', marginBottom: '28px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '14px' }}>
                <span style={{ fontSize: '0.9rem', color: 'var(--text-secondary)', fontWeight: 500 }}>
                  Peso del paquete / encomienda a enviar:
                </span>
                <span style={{ fontFamily: 'var(--font-display)', fontSize: '1.4rem', fontWeight: 800, color: 'var(--brand-gold)' }}>
                  {calcWeight.toFixed(1)} kg <span style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>({(calcWeight * 2.20462).toFixed(1)} lbs)</span>
                </span>
              </div>
              <input
                type="range"
                min="0.5"
                max="15"
                step="0.5"
                value={calcWeight}
                onChange={e => setCalcWeight(parseFloat(e.target.value))}
                className="sc-slider-glow"
              />
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.72rem', color: 'var(--text-muted)', marginTop: '8px' }}>
                <span>0.5 kg (Documento / Condimento)</span>
                <span>5.0 kg (Caja de Alimentos)</span>
                <span>10.0 kg (Repuestos)</span>
                <span>15.0 kg (Equipaje Completo)</span>
              </div>
            </div>

            {/* Side by Side Comparison Cards */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '20px', alignItems: 'stretch' }}>
              
              {/* Traditional Courier Card */}
              <div style={{
                background: 'rgba(239, 68, 68, 0.03)',
                border: '1px solid rgba(239, 68, 68, 0.2)',
                borderRadius: '16px',
                padding: '24px',
                display: 'flex',
                flexDirection: 'column',
                justifyContent: 'space-between',
              }}>
                <div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '10px' }}>
                    <span style={{ fontSize: '0.8rem', color: '#f87171', fontWeight: 700 }}>COURIER TRADICIONAL (DHL / FEDEX)</span>
                    <span className="badge" style={{ background: 'rgba(239, 68, 68, 0.1)', color: '#f87171' }}>Lento & Caro</span>
                  </div>
                  <div style={{ fontFamily: 'var(--font-display)', fontSize: '2.4rem', fontWeight: 900, color: '#f87171', marginBottom: '6px' }}>
                    ${Math.round(calcWeight * 54 + 42)} <span style={{ fontSize: '0.9rem', color: 'var(--text-muted)' }}>USD</span>
                  </div>
                  <div style={{ fontSize: '0.82rem', color: 'var(--text-secondary)', lineHeight: 1.6 }}>
                    • Tiempo de entrega: <strong>8 a 14 días hábiles</strong><br />
                    • Retención aduanera: <strong>Alta probabilidad para alimentos o artesanías</strong><br />
                    • Comisiones bancarias: <strong>+3.5% Swift / tarjetas</strong>
                  </div>
                </div>
              </div>

              {/* AYNI Protocol Card (Highlighted) */}
              <div style={{
                background: 'linear-gradient(145deg, rgba(0, 207, 255, 0.08) 0%, rgba(255, 184, 0, 0.06) 100%)',
                border: '1.5px solid var(--brand-cyan)',
                boxShadow: '0 0 30px rgba(0, 207, 255, 0.15)',
                borderRadius: '16px',
                padding: '24px',
                display: 'flex',
                flexDirection: 'column',
                justifyContent: 'space-between',
              }}>
                <div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '10px' }}>
                    <span style={{ fontSize: '0.8rem', color: 'var(--brand-cyan)', fontWeight: 700 }}>PROTOCOLO AYNI P2P (BASE L2)</span>
                    <span className="badge badge-cyan">⚡ 24h - 48h Cabina</span>
                  </div>
                  <div style={{ fontFamily: 'var(--font-display)', fontSize: '2.4rem', fontWeight: 900, color: 'var(--brand-cyan)', marginBottom: '6px' }}>
                    ${Math.round(calcWeight * 18 + 5)} <span style={{ fontSize: '0.9rem', color: 'var(--text-muted)' }}>USDC</span>
                  </div>
                  <div style={{ fontSize: '0.82rem', color: 'var(--text-secondary)', lineHeight: 1.6 }}>
                    • Tiempo de entrega: <strong>24 a 48 horas (Vuelo del Viajero)</strong><br />
                    • Custodia: <strong>Smart Contract Escrow inmutable</strong><br />
                    • Costo por transacción L2: <strong>&lt;$0.01 Gas</strong>
                  </div>
                </div>

                <div style={{ marginTop: '20px', paddingTop: '16px', borderTop: '1px solid rgba(0, 207, 255, 0.2)', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '10px' }}>
                  <div>
                    <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>Ahorro directo para tu bolsillo:</span>
                    <div style={{ fontSize: '1.1rem', fontWeight: 800, color: 'var(--brand-emerald)' }}>
                      ¡Ahorras ${Math.round((calcWeight * 54 + 42) - (calcWeight * 18 + 5))} USD ({Math.round((((calcWeight * 54 + 42) - (calcWeight * 18 + 5)) / (calcWeight * 54 + 42)) * 100)}%)!
                    </div>
                  </div>
                  <Link
                    href="/auth?mode=signup"
                    className="btn btn-primary btn-sm"
                    style={{ textDecoration: 'none', display: 'inline-flex', alignItems: 'center', gap: '6px' }}
                  >
                    Encargar con este peso <ArrowRight size={14} />
                  </Link>
                </div>
              </div>

            </div>
          </div>
        </div>
      </section>

      {/* CINEMATIC TIMELINE SECTION - SCROLL-CRAFT ENGINE */}
      <section id="como-funciona" style={{ padding: '90px 0', borderTop: '1px solid var(--border-subtle)', position: 'relative' }}>
        <div className="container">
          <div style={{ textAlign: 'center', marginBottom: '60px' }}>
            <div className="badge badge-cyan" style={{ marginBottom: '12px' }}>
              <Zap size={12} /> Flujo de Ejecución en Tres Fases
            </div>
            <h2 style={{ fontFamily: 'var(--font-display)', fontSize: 'clamp(2rem, 4.5vw, 3.2rem)', fontWeight: 800, letterSpacing: '-0.03em' }}>
              Cómo Funciona el <span className="gradient-text-cyan">Protocolo AYNI</span>
            </h2>
            <p style={{ color: 'var(--text-secondary)', maxWidth: '680px', margin: '14px auto 0', fontSize: '1.05rem', lineHeight: 1.6 }}>
              Una coreografía descentralizada entre Smart Contracts de Base L2, IA de visión computacional y validación criptográfica en mano.
            </p>
          </div>

          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))',
            gap: '28px',
            position: 'relative',
          }}>
            {/* Step 1 */}
            <div className="card card-kinetic" style={{ padding: '36px 28px', display: 'flex', flexDirection: 'column', gap: '18px', borderTop: '3px solid var(--brand-cyan)' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <span className="badge badge-cyan" style={{ fontSize: '0.75rem' }}>Fase 01 • Origen</span>
                <span style={{ fontFamily: 'var(--font-display)', fontSize: '2rem', fontWeight: 900, color: 'var(--brand-cyan)', opacity: 0.6 }}>01</span>
              </div>
              <div>
                <h3 style={{ fontSize: '1.25rem', fontWeight: 800, color: 'var(--text-primary)', marginBottom: '8px' }}>
                  Depósito Escrow en Base L2
                </h3>
                <p style={{ fontSize: '0.9rem', color: 'var(--text-secondary)', lineHeight: 1.65 }}>
                  El cliente crea su pedido de encargo, insumo médico o remesa familiar. Los fondos en USDC quedan bloqueados de forma no custodial bajo un contrato inteligente inmutable. Nadie puede tocarlos sin autorización.
                </p>
              </div>
              <div style={{ marginTop: 'auto', paddingTop: '16px', borderTop: '1px solid var(--border-subtle)', display: 'flex', alignItems: 'center', gap: '8px', fontSize: '0.75rem', color: 'var(--brand-cyan)' }}>
                <Lock size={14} /> Smart Contract TimeLock Activo
              </div>
            </div>

            {/* Step 2 */}
            <div className="card card-kinetic" style={{ padding: '36px 28px', display: 'flex', flexDirection: 'column', gap: '18px', borderTop: '3px solid var(--brand-gold)' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <span className="badge badge-gold" style={{ fontSize: '0.75rem' }}>Fase 02 • Tránsito</span>
                <span style={{ fontFamily: 'var(--font-display)', fontSize: '2rem', fontWeight: 900, color: 'var(--brand-gold)', opacity: 0.6 }}>02</span>
              </div>
              <div>
                <h3 style={{ fontSize: '1.25rem', fontWeight: 800, color: 'var(--text-primary)', marginBottom: '8px' }}>
                  Compra & Auditoría Multimodal IA
                </h3>
                <p style={{ fontSize: '0.9rem', color: 'var(--text-secondary)', lineHeight: 1.65 }}>
                  El viajero emparejado adquiere el producto en la tienda física o artesano nativo. Sube la foto del recibo y del empaque al vacío: el oráculo de IA (Gemini Vision) audita fecha, monto y sellos aduaneros en segundos.
                </p>
              </div>
              <div style={{ marginTop: 'auto', paddingTop: '16px', borderTop: '1px solid var(--border-subtle)', display: 'flex', alignItems: 'center', gap: '8px', fontSize: '0.75rem', color: 'var(--brand-gold)' }}>
                <Sparkles size={14} /> Gemini Vision OCR & Certificación 98.8%
              </div>
            </div>

            {/* Step 3 */}
            <div className="card card-kinetic" style={{ padding: '36px 28px', display: 'flex', flexDirection: 'column', gap: '18px', borderTop: '3px solid var(--brand-emerald)' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <span className="badge badge-emerald" style={{ fontSize: '0.75rem' }}>Fase 03 • Destino</span>
                <span style={{ fontFamily: 'var(--font-display)', fontSize: '2rem', fontWeight: 900, color: 'var(--brand-emerald)', opacity: 0.6 }}>03</span>
              </div>
              <div>
                <h3 style={{ fontSize: '1.25rem', fontWeight: 800, color: 'var(--text-primary)', marginBottom: '8px' }}>
                  Entrega Física & Liquidación OTP
                </h3>
                <p style={{ fontSize: '0.9rem', color: 'var(--text-secondary)', lineHeight: 1.65 }}>
                  Al entregar la encomienda en el destino, el comprador revela su código criptográfico OTP de un solo uso. El viajero lo valida en la app y el Smart Contract libera el 70% de ganancias inmediatamente en su wallet.
                </p>
              </div>
              <div style={{ marginTop: 'auto', paddingTop: '16px', borderTop: '1px solid var(--border-subtle)', display: 'flex', alignItems: 'center', gap: '8px', fontSize: '0.75rem', color: 'var(--brand-emerald)' }}>
                <ShieldCheck size={14} /> Hash Keccak-256 • Gas Base L2 &lt;$0.01
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* BRAND STORY & AYNI PHILOSOPHY */}
      <section style={{ padding: '70px 0', borderTop: '1px solid var(--border-subtle)', background: 'rgba(255,255,255,0.01)' }}>
        <div className="container">
          <div style={{ maxWidth: '820px', margin: '0 auto', textAlign: 'center' }}>
            <div className="badge badge-gold" style={{ marginBottom: '14px' }}>
              <HeartHandshake size={12} /> Filosofía Ancestral • Tecnología Futurista
            </div>
            <h2 style={{ fontFamily: 'var(--font-display)', fontSize: 'clamp(1.8rem, 3.5vw, 2.6rem)', fontWeight: 800, marginBottom: '20px' }}>
              ¿Qué es <span className="gradient-text-gold">AYNI</span>?
            </h2>
            <p style={{ fontSize: '1.05rem', color: 'var(--text-secondary)', lineHeight: 1.7, marginBottom: '24px' }}>
              En las civilizaciones andinas ancestrales, <strong>Ayni</strong> representa el principio sagrado de reciprocidad mutua: <em>"Hoy por ti, mañana por mí"</em>. Una comunidad que colabora desinteresadamente para construir, cultivar y transportar bienes para quien lo necesite.
            </p>
            <p style={{ fontSize: '0.95rem', color: 'var(--text-muted)', lineHeight: 1.7 }}>
              Hoy hemos transformado ese pacto milenario en un protocolo tecnológico global. Sin intermediarios bancarios abusivos ni empresas de courier que cobran el 40% del valor de un producto. Cada viajero que toma un avión se convierte en un nodo de confianza que transporta vida, cultura y afectos hacia sus compatriotas.
            </p>
          </div>
        </div>
      </section>

      {/* BUSINESS MODEL SECTION */}
      <section id="modelo-negocio" style={{ padding: '80px 0', borderTop: '1px solid var(--border-subtle)' }}>
        <div className="container">
          <div style={{ textAlign: 'center', marginBottom: '50px' }}>
            <div className="badge badge-cyan" style={{ marginBottom: '12px' }}>
              <DollarSign size={12} /> Transparencia Total
            </div>
            <h2 style={{ fontFamily: 'var(--font-display)', fontSize: 'clamp(2rem, 4vw, 3rem)', fontWeight: 800, letterSpacing: '-0.03em' }}>
              Nuestro Modelo de Negocio
            </h2>
            <p style={{ color: 'var(--text-secondary)', maxWidth: '650px', margin: '12px auto 0', fontSize: '1.05rem' }}>
              ¿Cómo se distribuyen los ingresos? Eliminamos intermediarios especulativos para retribuir a quienes aportan verdadero valor a la red.
            </p>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '24px', marginBottom: '40px' }}>
            {BUSINESS_MODEL.map((m, i) => (
              <div
                key={i}
                className="card"
                style={{
                  padding: '32px 28px',
                  background: m.bg,
                  border: `1px solid ${m.border}`,
                  display: 'flex',
                  flexDirection: 'column',
                  gap: '16px',
                }}
              >
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <span className="badge" style={{ background: 'rgba(255,255,255,0.06)', color: m.color, fontWeight: 700 }}>
                    {m.role}
                  </span>
                  <span style={{ fontFamily: 'var(--font-display)', fontSize: '2.5rem', fontWeight: 900, color: m.color }}>
                    {m.share}
                  </span>
                </div>
                <div>
                  <h3 style={{ fontSize: '1.2rem', fontWeight: 700, marginBottom: '8px', color: 'var(--text-primary)' }}>
                    {m.title}
                  </h3>
                  <p style={{ fontSize: '0.88rem', color: 'var(--text-secondary)', lineHeight: 1.6, margin: 0 }}>
                    {m.desc}
                  </p>
                </div>
              </div>
            ))}
          </div>

          {/* Comparison Table vs Traditional Courier */}
          <div className="card" style={{ padding: '32px', overflowX: 'auto' }}>
            <h3 style={{ fontSize: '1.15rem', fontWeight: 700, marginBottom: '16px', textAlign: 'center' }}>
              Comparativa: Courier Tradicional vs Protocolo AYNI
            </h3>
            <table className="table" style={{ width: '100%', minWidth: '550px' }}>
              <thead>
                <tr>
                  <th>Concepto</th>
                  <th>Courier Clásico (DHL, FedEx)</th>
                  <th style={{ color: 'var(--brand-cyan)' }}>Protocolo AYNI P2P</th>
                </tr>
              </thead>
              <tbody>
                <tr>
                  <td style={{ fontWeight: 600 }}>Costo promedio por 1 kg transfronterizo</td>
                  <td style={{ color: 'var(--brand-red)' }}>$90.00 - $150.00 USD</td>
                  <td style={{ color: 'var(--brand-emerald)', fontWeight: 700 }}>$18.00 - $25.00 USDC</td>
                </tr>
                <tr>
                  <td style={{ fontWeight: 600 }}>Tiempo de tránsito internacional</td>
                  <td>6 a 14 días hábiles</td>
                  <td style={{ color: 'var(--brand-cyan)', fontWeight: 700 }}>24 a 48 horas (vuelo del viajero)</td>
                </tr>
                <tr>
                  <td style={{ fontWeight: 600 }}>Envío de condimentos / alimentos típicos</td>
                  <td style={{ color: 'var(--brand-red)' }}>Altamente restringido o demorado</td>
                  <td style={{ color: 'var(--brand-emerald)', fontWeight: 700 }}>Permitido en cabina (sellado al vacío)</td>
                </tr>
                <tr>
                  <td style={{ fontWeight: 600 }}>Garantía de custodia de fondos</td>
                  <td>Reclamo burocrático de 60 días</td>
                  <td style={{ color: 'var(--brand-gold)', fontWeight: 700 }}>Smart Contract Escrow + Liberación con OTP</td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>
      </section>

      {/* THE 3 CORE PILLARS */}
      <section id="pilares" style={{ padding: '80px 0', borderTop: '1px solid var(--border-subtle)', background: 'rgba(5,8,16,0.6)' }}>
        <div className="container">
          <div style={{ textAlign: 'center', marginBottom: '60px' }}>
            <div className="badge badge-emerald" style={{ marginBottom: '12px' }}>
              Soluciones Integrales
            </div>
            <h2 style={{ fontFamily: 'var(--font-display)', fontSize: 'clamp(2rem, 4vw, 3rem)', fontWeight: 800, letterSpacing: '-0.03em' }}>
              Tres Pilares de Impacto Global
            </h2>
            <p style={{ color: 'var(--text-secondary)', maxWidth: '650px', margin: '12px auto 0', fontSize: '1.05rem' }}>
              Logística colaborativa, conexión cultural y protección patrimonial para millones de personas en todo el mundo.
            </p>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '60px' }}>
            {PILLARS.map((p, i) => (
              <div
                key={i}
                style={{
                  display: 'grid',
                  gridTemplateColumns: i % 2 === 0 ? '1fr 1fr' : '1fr 1fr',
                  gap: '40px',
                  alignItems: 'center',
                }}
                className="pillar-grid"
              >
                <div style={{ order: i % 2 === 1 ? 2 : 1 }}>
                  <span className="badge badge-gold" style={{ marginBottom: '12px' }}>{p.badge}</span>
                  <h3 style={{ fontFamily: 'var(--font-display)', fontSize: 'clamp(1.5rem, 3vw, 2.2rem)', fontWeight: 800, marginBottom: '16px' }}>
                    {p.title}
                  </h3>
                  <p style={{ fontSize: '1rem', color: 'var(--text-secondary)', lineHeight: 1.65, marginBottom: '20px' }}>
                    {p.desc}
                  </p>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '10px', marginBottom: '24px' }}>
                    {p.features.map((feat, fi) => (
                      <div key={fi} style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                        <CheckCircle size={17} color="var(--brand-cyan)" />
                        <span style={{ fontSize: '0.9rem', color: 'var(--text-primary)' }}>{feat}</span>
                      </div>
                    ))}
                  </div>
                  {i === 2 ? (
                    <a
                      href="#herencias"
                      className="btn btn-primary btn-sm"
                      style={{ textDecoration: 'none', display: 'inline-flex', alignItems: 'center', gap: '6px' }}
                    >
                      Explorar Bóvedas Heritage <ChevronRight size={15} />
                    </a>
                  ) : (
                    <Link
                      href={i === 0 ? "/dashboard/my-trips" : "/dashboard/marketplace"}
                      className="btn btn-primary btn-sm"
                      style={{ textDecoration: 'none', display: 'inline-flex', alignItems: 'center', gap: '6px' }}
                    >
                      {i === 0 ? "Ver Rutas de Viajeros" : "Explorar Marketplace"} <ChevronRight size={15} />
                    </Link>
                  )}
                </div>

                <div style={{
                  order: i % 2 === 1 ? 1 : 2,
                  borderRadius: '20px',
                  overflow: 'hidden',
                  border: '1px solid rgba(255,255,255,0.12)',
                  boxShadow: '0 12px 36px rgba(0,0,0,0.6)',
                  height: '320px',
                }}>
                  <img
                    src={p.img}
                    alt={p.title}
                    style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                  />
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* AYNI HERITAGE - CRIPTO HERENCIAS SECTION (3D SPATIAL & INTERACTIVE SIMULATOR) */}
      <section id="herencias" className="sc-perspective-container" style={{ padding: '90px 0', borderTop: '1px solid var(--border-subtle)', position: 'relative', overflow: 'hidden' }}>
        {/* Glow ambient backdrops */}
        <div style={{ position: 'absolute', top: '20%', left: '-10%', width: '600px', height: '600px', borderRadius: '50%', background: 'radial-gradient(circle, rgba(245,166,35,0.09) 0%, transparent 70%)', pointerEvents: 'none' }} />
        <div style={{ position: 'absolute', bottom: '10%', right: '-5%', width: '550px', height: '550px', borderRadius: '50%', background: 'radial-gradient(circle, rgba(0,207,255,0.08) 0%, transparent 70%)', pointerEvents: 'none' }} />

        <div className="container" style={{ position: 'relative', zIndex: 2 }}>
          <div style={{ textAlign: 'center', marginBottom: '50px' }}>
            <div className="badge badge-gold" style={{ marginBottom: '12px' }}>
              <Sparkles size={12} /> Bóvedas Descentralizadas de Sucesión
            </div>
            <h2 style={{ fontFamily: 'var(--font-display)', fontSize: 'clamp(2rem, 4.2vw, 3.2rem)', fontWeight: 800, letterSpacing: '-0.03em' }}>
              AYNI Heritage — <span className="gradient-text-gold">Herencias Cripto Inteligentes</span>
            </h2>
            <p style={{ color: 'var(--text-secondary)', maxWidth: '720px', margin: '14px auto 0', fontSize: '1.05rem', lineHeight: 1.65 }}>
              Protege el patrimonio y las remesas de familias migrantes. Un Smart Contract autónomo no custodial en Base L2 que transfiere tus fondos automáticamente a tus beneficiarios designados mediante un mecanismo <strong>Dead Man's Switch</strong>, sin trámites notariales ni comisiones burocráticas.
            </p>
          </div>

          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(340px, 1fr))',
            gap: '32px',
            alignItems: 'center',
          }}>
            {/* Left: Pillars of Security & Governance */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
              <div className="card card-kinetic" style={{ padding: '26px', borderLeft: '4px solid var(--brand-gold)' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '10px' }}>
                  <div style={{ width: 38, height: 38, borderRadius: 10, background: 'rgba(245,166,35,0.12)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--brand-gold)' }}>
                    <Lock size={20} />
                  </div>
                  <h3 style={{ fontSize: '1.15rem', fontWeight: 700, margin: 0 }}>Smart Contract No Custodial (Base L2)</h3>
                </div>
                <p style={{ fontSize: '0.88rem', color: 'var(--text-secondary)', lineHeight: 1.6, margin: 0 }}>
                  Tus activos nunca quedan bajo custodia de AYNI ni intermediarios bancarios. Solo el código auditado en la blockchain tiene la capacidad de ejecutar las reglas de dispersión que tú mismo definas.
                </p>
              </div>

              <div className="card card-kinetic" style={{ padding: '26px', borderLeft: '4px solid var(--brand-cyan)' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '10px' }}>
                  <div style={{ width: 38, height: 38, borderRadius: 10, background: 'rgba(0,207,255,0.12)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--brand-cyan)' }}>
                    <HeartPulse size={20} />
                  </div>
                  <h3 style={{ fontSize: '1.15rem', fontWeight: 700, margin: 0 }}>Temporizador de Vida (Dead Man's Switch)</h3>
                </div>
                <p style={{ fontSize: '0.88rem', color: 'var(--text-secondary)', lineHeight: 1.6, margin: 0 }}>
                  Confirmas tu presencia periódicamente con un solo clic o conexión de wallet. Si el temporizador llega a cero por inactividad prolongada, se activa el protocolo seguro de transferencia sucesoria.
                </p>
              </div>

              <div className="card card-kinetic" style={{ padding: '26px', borderLeft: '4px solid var(--brand-emerald)' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '10px' }}>
                  <div style={{ width: 38, height: 38, borderRadius: 10, background: 'rgba(0,214,143,0.12)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--brand-emerald)' }}>
                    <Users size={20} />
                  </div>
                  <h3 style={{ fontSize: '1.15rem', fontWeight: 700, margin: 0 }}>Distribución Porcentual Automática</h3>
                </div>
                <p style={{ fontSize: '0.88rem', color: 'var(--text-secondary)', lineHeight: 1.6, margin: 0 }}>
                  Asigna cuotas porcentuales exactas para tus hijos, pareja o familiares a sus billeteras públicas EVM. Transparente, sin juicios de sucesión de años ni costos de hasta el 30% en abogados.
                </p>
              </div>

              <div style={{ paddingTop: '8px' }}>
                <Link
                  href={user ? '/dashboard/heritage' : '/auth?redirect=/dashboard/heritage'}
                  className="btn btn-primary btn-lg"
                  style={{ display: 'inline-flex', alignItems: 'center', gap: '10px', textDecoration: 'none', padding: '14px 28px' }}
                >
                  <Key size={18} />
                  <span>Configurar mi Bóveda Heritage</span>
                  <ArrowRight size={18} />
                </Link>
              </div>
            </div>

            {/* Right: Live Interactive Simulator Card */}
            <div className="card sc-card-depth" style={{
              padding: '32px',
              background: 'linear-gradient(145deg, rgba(15,21,39,0.95) 0%, rgba(10,14,26,0.98) 100%)',
              border: '1px solid rgba(245,166,35,0.3)',
              boxShadow: '0 24px 60px rgba(0,0,0,0.8), 0 0 35px rgba(245,166,35,0.12)',
              borderRadius: '24px',
            }}>
              {/* Vault Simulator Header */}
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '22px', borderBottom: '1px solid var(--border-subtle)', paddingBottom: '16px' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                  <span style={{ position: 'relative', display: 'flex', height: 12, width: 12 }}>
                    <span style={{ position: 'absolute', display: 'inline-flex', height: '100%', width: '100%', borderRadius: '50%', background: 'var(--brand-emerald)', opacity: 0.75, animation: 'ping 1.5s cubic-bezier(0, 0, 0.2, 1) infinite' }} />
                    <span style={{ position: 'relative', display: 'inline-flex', borderRadius: '50%', height: 12, width: 12, background: 'var(--brand-emerald)' }} />
                  </span>
                  <span style={{ fontSize: '0.85rem', fontWeight: 700, color: 'var(--brand-emerald)' }}>
                    Bóveda Activa & Protegida
                  </span>
                </div>
                <span className="badge badge-cyan" style={{ fontSize: '0.72rem' }}>
                  Base L2: 0x71Ae...C901
                </span>
              </div>

              {/* Heartbeat Status Counter */}
              <div style={{
                background: 'rgba(5,8,16,0.7)',
                border: '1px solid var(--border-default)',
                borderRadius: '16px',
                padding: '20px',
                textAlign: 'center',
                marginBottom: '22px',
              }}>
                <div style={{ fontSize: '0.78rem', color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: '6px' }}>
                  Temporizador Dead Man's Switch
                </div>
                <div style={{ fontFamily: 'var(--font-display)', fontSize: '2.8rem', fontWeight: 900, color: 'var(--brand-gold)', lineHeight: 1.1 }}>
                  {landingHeartbeatDays} Días
                </div>
                <div style={{ fontSize: '0.82rem', color: 'var(--text-secondary)', marginTop: '6px' }}>
                  Próxima verificación requerida antes de activar la distribución
                </div>

                {landingHeartbeatPinged && (
                  <div style={{
                    marginTop: '12px',
                    padding: '8px 12px',
                    background: 'rgba(0,214,143,0.12)',
                    border: '1px solid rgba(0,214,143,0.3)',
                    borderRadius: '8px',
                    color: 'var(--brand-emerald)',
                    fontSize: '0.8rem',
                    fontWeight: 600,
                  }}>
                    ✓ ¡Presencia verificada! Temporizador restablecido a 180 días en Base L2.
                  </div>
                )}

                <button
                  type="button"
                  onClick={() => {
                    setLandingHeartbeatDays(180);
                    setLandingHeartbeatPinged(true);
                    setTimeout(() => setLandingHeartbeatPinged(false), 4000);
                  }}
                  className="btn btn-outline"
                  style={{
                    marginTop: '16px',
                    width: '100%',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    gap: '8px',
                    color: 'var(--brand-cyan)',
                    borderColor: 'rgba(0,207,255,0.3)',
                    padding: '10px 16px',
                  }}
                >
                  <RefreshCw size={15} /> Emitir Señal de Vida (Heartbeat Ping)
                </button>
              </div>

              {/* Beneficiary Allocation Preview */}
              <div>
                <div style={{ fontSize: '0.8rem', fontWeight: 600, color: 'var(--text-secondary)', marginBottom: '12px', display: 'flex', justifyContent: 'space-between' }}>
                  <span>Beneficiarios Vinculados</span>
                  <span style={{ color: 'var(--brand-cyan)' }}>100% Asignado</span>
                </div>

                <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '10px 14px', background: 'rgba(255,255,255,0.03)', borderRadius: '10px', border: '1px solid var(--border-subtle)' }}>
                    <div>
                      <div style={{ fontSize: '0.85rem', fontWeight: 600 }}>Valentina Mamani (Hija)</div>
                      <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)' }}>0x3a82...4b92</div>
                    </div>
                    <span className="badge badge-cyan" style={{ fontWeight: 700 }}>50%</span>
                  </div>

                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '10px 14px', background: 'rgba(255,255,255,0.03)', borderRadius: '10px', border: '1px solid var(--border-subtle)' }}>
                    <div>
                      <div style={{ fontSize: '0.85rem', fontWeight: 600 }}>Mateo Mamani (Hijo)</div>
                      <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)' }}>0x9B11...88A3</div>
                    </div>
                    <span className="badge badge-gold" style={{ fontWeight: 700 }}>30%</span>
                  </div>

                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '10px 14px', background: 'rgba(255,255,255,0.03)', borderRadius: '10px', border: '1px solid var(--border-subtle)' }}>
                    <div>
                      <div style={{ fontSize: '0.85rem', fontWeight: 600 }}>Carmen Quispe (Cónyuge)</div>
                      <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)' }}>0x71A0...10F4</div>
                    </div>
                    <span className="badge badge-emerald" style={{ fontWeight: 700 }}>20%</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* SECURITY & TRUST SECTION */}
      <section id="seguridad" style={{ padding: '80px 0', borderTop: '1px solid var(--border-subtle)' }}>
        <div className="container">
          <div style={{ textAlign: 'center', marginBottom: '50px' }}>
            <div className="badge badge-purple" style={{ marginBottom: '12px' }}>
              <Lock size={12} /> Criptografía de Vanguardia
            </div>
            <h2 style={{ fontFamily: 'var(--font-display)', fontSize: 'clamp(1.8rem, 3.5vw, 2.8rem)', fontWeight: 800 }}>
              Seguridad & Auditoría en Cada Paso
            </h2>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))', gap: '20px' }}>
            <div className="card" style={{ padding: '28px' }}>
              <ShieldCheck size={32} color="var(--brand-gold)" style={{ marginBottom: '14px' }} />
              <h4 style={{ fontWeight: 700, fontSize: '1.1rem', marginBottom: '8px' }}>Smart Contract Escrow No Custodial</h4>
              <p style={{ color: 'var(--text-secondary)', fontSize: '0.88rem', lineHeight: 1.5 }}>
                El dinero nunca pasa por las cuentas de AYNI. Permanece bloqueado en el contrato de Base L2 hasta que el cliente recibe conforme su paquete.
              </p>
            </div>

            <div className="card" style={{ padding: '28px' }}>
              <Zap size={32} color="var(--brand-cyan)" style={{ marginBottom: '14px' }} />
              <h4 style={{ fontWeight: 700, fontSize: '1.1rem', marginBottom: '8px' }}>Código OTP Criptográfico</h4>
              <p style={{ color: 'var(--text-secondary)', fontSize: '0.88rem', lineHeight: 1.5 }}>
                El comprador recibe una clave de 6 caracteres generada localmente con Keccak-256. Solo al dictarle el código al viajero se liberan los fondos.
              </p>
            </div>

            <div className="card" style={{ padding: '28px' }}>
              <Sparkles size={32} color="var(--brand-purple)" style={{ marginBottom: '14px' }} />
              <h4 style={{ fontWeight: 700, fontSize: '1.1rem', marginBottom: '8px' }}>Auditoría con IA Multimodal</h4>
              <p style={{ color: 'var(--text-secondary)', fontSize: '0.88rem', lineHeight: 1.5 }}>
                Modelos de visión por computadora analizan boletas de compra, verifican el monto exacto, la tienda autorizada y la integridad del producto.
              </p>
            </div>

            <div className="card" style={{ padding: '28px' }}>
              <Award size={32} color="var(--brand-emerald)" style={{ marginBottom: '14px' }} />
              <h4 style={{ fontWeight: 700, fontSize: '1.1rem', marginBottom: '8px' }}>Reputación & Depósito de Garantía</h4>
              <p style={{ color: 'var(--text-secondary)', fontSize: '0.88rem', lineHeight: 1.5 }}>
                Cada viajero deposita una fianza en USDC que respalda su itinerario. Los usuarios tienen calificaciones visibles y verificadas en la blockchain.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* TESTIMONIALS */}
      <section id="testimonios" style={{ padding: '80px 0', borderTop: '1px solid var(--border-subtle)', background: 'rgba(255,255,255,0.01)' }}>
        <div className="container">
          <div style={{ textAlign: 'center', marginBottom: '50px' }}>
            <h2 style={{ fontFamily: 'var(--font-display)', fontSize: 'clamp(1.8rem, 3.5vw, 2.6rem)', fontWeight: 800 }}>
              Lo que dice la comunidad global AYNI
            </h2>
            <p style={{ color: 'var(--text-secondary)', marginTop: '8px' }}>
              Miles de entregas exitosas conectando la diáspora con sus raíces.
            </p>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '20px' }}>
            {TESTIMONIALS.map((t, i) => (
              <div key={i} className="card" style={{ padding: '26px', display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
                <div>
                  <div style={{ display: 'flex', gap: '3px', marginBottom: '12px' }}>
                    {[1, 2, 3, 4, 5].map(s => (
                      <span key={s} style={{ color: 'var(--brand-gold)', fontSize: '1rem' }}>★</span>
                    ))}
                  </div>
                  <p style={{ color: 'var(--text-secondary)', fontSize: '0.9rem', lineHeight: 1.6, fontStyle: 'italic', marginBottom: '18px' }}>
                    "{t.text}"
                  </p>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', borderTop: '1px solid var(--border-subtle)', paddingTop: '12px' }}>
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

      {/* FINAL CTA */}
      <section style={{ padding: '90px 0' }}>
        <div className="container">
          <div style={{
            background: 'linear-gradient(135deg, rgba(0,207,255,0.1) 0%, rgba(245,166,35,0.1) 100%)',
            border: '1px solid rgba(0,207,255,0.3)',
            borderRadius: '28px',
            padding: '70px 40px',
            textAlign: 'center',
            boxShadow: '0 10px 40px rgba(0,0,0,0.5)',
          }}>
            <h2 style={{ fontFamily: 'var(--font-display)', fontSize: 'clamp(2rem, 4.5vw, 3.2rem)', fontWeight: 800, letterSpacing: '-0.03em', marginBottom: '16px' }}>
              Únete al <span className="gradient-text-gold">Protocolo AYNI</span> Hoy
            </h2>
            <p style={{ color: 'var(--text-secondary)', maxWidth: '580px', margin: '0 auto 36px', fontSize: '1.1rem', lineHeight: 1.6 }}>
              Regístrate gratis como cliente, viajero o comercio. Comienza a enviar encargos, monetizar equipaje o resguardar tu herencia digital.
            </p>
            <div style={{ display: 'flex', justifyContent: 'center', gap: '14px', flexWrap: 'wrap' }}>
              <Link
                href="/auth?mode=signup"
                className="btn btn-primary btn-lg"
                style={{ padding: '14px 32px', fontSize: '1rem', textDecoration: 'none', display: 'inline-flex', alignItems: 'center', gap: '8px' }}
              >
                <Sparkles size={18} /> Crear Cuenta Gratuita
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* FOOTER */}
      <footer style={{ borderTop: '1px solid var(--border-subtle)', padding: '40px 0', background: 'rgba(5,8,16,0.95)' }}>
        <div className="container" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '20px' }}>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '6px' }}>
              <div style={{ width: 24, height: 24, borderRadius: 6, background: 'linear-gradient(135deg, var(--brand-cyan), var(--brand-gold))', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 800, color: '#050810', fontSize: '0.8rem' }}>A</div>
              <span style={{ fontFamily: 'var(--font-display)', fontWeight: 800, fontSize: '1.1rem' }} className="gradient-text-gold">
                AYNI Protocol
              </span>
            </div>
            <div style={{ fontSize: '0.78rem', color: 'var(--text-muted)' }}>
              Protocolo P2P Global de Crowdshipping, Comercio y Bóvedas de Herencia Cripto
            </div>
          </div>

          <div style={{ display: 'flex', gap: '20px', alignItems: 'center', fontSize: '0.85rem' }}>
            <a href="https://github.com/k3v1bvo/ayni-protocol" target="_blank" rel="noreferrer" style={{ color: 'var(--brand-cyan)', textDecoration: 'none' }}>
              GitHub Repositorio →
            </a>
            <span style={{ color: 'var(--text-muted)' }}>•</span>
            <span style={{ color: 'var(--text-muted)' }}>Base L2 Mainnet Ready</span>
          </div>
        </div>
      </footer>

    </>
  );
}
