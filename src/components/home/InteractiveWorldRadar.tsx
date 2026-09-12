'use client';

import React, { useState, useEffect, useRef, useMemo } from 'react';
import { 
  Plane, ShieldCheck, Key, Navigation, ArrowRight,
  Maximize2, Minimize2, Pause, Play
} from 'lucide-react';

export interface FlightRoute {
  id: string;
  name: string;
  badge: string;
  origin: {
    code: string;
    city: string;
    country: string;
    flag: string;
    x: number;
    y: number;
    altitude: string;
  };
  dest: {
    code: string;
    city: string;
    country: string;
    flag: string;
    x: number;
    y: number;
    altitude: string;
  };
  curveControl: { x: number; y: number };
  flightNumber: string;
  traveler: string;
  tangemId: string;
  escrowUsdc: number;
  travelerFeeUsdc: number;
  cargoDescription: string;
  cargoWeightKg: number;
  estimatedHours: number;
}

export const ROUTES: FlightRoute[] = [
  {
    id: 'mad-lpz',
    name: 'Madrid ➔ La Paz',
    badge: 'Transatlántica Urgente',
    origin: {
      code: 'MAD',
      city: 'Madrid',
      country: 'España',
      flag: '🇪🇸',
      x: 485,
      y: 175,
      altitude: '610 m',
    },
    dest: {
      code: 'LPZ',
      city: 'La Paz',
      country: 'Bolivia',
      flag: '🇧🇴',
      x: 310,
      y: 345,
      altitude: '4,061 m',
    },
    curveControl: { x: 375, y: 220 },
    flightNumber: 'AY-6821 / IB',
    traveler: 'Rodrigo M. (Tangem EAL6+)',
    tangemId: 'TNG-8841-BASE',
    escrowUsdc: 374.00,
    travelerFeeUsdc: 140.00,
    cargoDescription: 'Implantes Médicos de Titanio Grado 5 + Factura OCR',
    cargoWeightKg: 2.8,
    estimatedHours: 11.5,
  },
  {
    id: 'mia-vvi',
    name: 'Miami ➔ Santa Cruz',
    badge: 'Ruta Tecnológica',
    origin: {
      code: 'MIA',
      city: 'Miami',
      country: 'EE.UU.',
      flag: '🇺🇸',
      x: 275,
      y: 205,
      altitude: '2 m',
    },
    dest: {
      code: 'VVI',
      city: 'Santa Cruz',
      country: 'Bolivia',
      flag: '🇧🇴',
      x: 335,
      y: 360,
      altitude: '373 m',
    },
    curveControl: { x: 310, y: 275 },
    flightNumber: 'AY-9022 / AA',
    traveler: 'Valeria C. (Tangem EAL6+)',
    tangemId: 'TNG-1290-BASE',
    escrowUsdc: 520.00,
    travelerFeeUsdc: 185.00,
    cargoDescription: 'MacBook Air M3 + Accesorios Oficiales Sellados',
    cargoWeightKg: 3.4,
    estimatedHours: 6.8,
  },
  {
    id: 'hnd-cbb',
    name: 'Tokio ➔ Cochabamba',
    badge: 'Ruta Asia-Andes',
    origin: {
      code: 'HND',
      city: 'Tokio',
      country: 'Japón',
      flag: '🇯🇵',
      x: 840,
      y: 180,
      altitude: '11 m',
    },
    dest: {
      code: 'CBB',
      city: 'Cochabamba',
      country: 'Bolivia',
      flag: '🇧🇴',
      x: 318,
      y: 355,
      altitude: '2,548 m',
    },
    curveControl: { x: 570, y: 110 },
    flightNumber: 'AY-1104 / NH',
    traveler: 'Kenji T. (Tangem EAL6+)',
    tangemId: 'TNG-4402-BASE',
    escrowUsdc: 680.00,
    travelerFeeUsdc: 220.00,
    cargoDescription: 'Componentes Electrónicos de Precisión y Lente Óptico Canon',
    cargoWeightKg: 1.9,
    estimatedHours: 24.0,
  },
  {
    id: 'lpz-bcn',
    name: 'La Paz ➔ Barcelona',
    badge: 'Sabores de la Diáspora',
    origin: {
      code: 'LPZ',
      city: 'La Paz',
      country: 'Bolivia',
      flag: '🇧🇴',
      x: 310,
      y: 345,
      altitude: '4,061 m',
    },
    dest: {
      code: 'BCN',
      city: 'Barcelona',
      country: 'España',
      flag: '🇪🇸',
      x: 495,
      y: 170,
      altitude: '4 m',
    },
    curveControl: { x: 420, y: 230 },
    flightNumber: 'AY-7719 / UX',
    traveler: 'María Elena Q. (Tangem EAL6+)',
    tangemId: 'TNG-7709-BASE',
    escrowUsdc: 195.00,
    travelerFeeUsdc: 75.00,
    cargoDescription: 'Ají amarillo en vainas, llajwa deshidratada artesanal y café de altura',
    cargoWeightKg: 4.2,
    estimatedHours: 12.0,
  },
  {
    id: 'bue-vvi',
    name: 'Buenos Aires ➔ Santa Cruz',
    badge: 'Conexión Cono Sur',
    origin: {
      code: 'BUE',
      city: 'Buenos Aires',
      country: 'Argentina',
      flag: '🇦🇷',
      x: 330,
      y: 420,
      altitude: '25 m',
    },
    dest: {
      code: 'VVI',
      city: 'Santa Cruz',
      country: 'Bolivia',
      flag: '🇧🇴',
      x: 335,
      y: 360,
      altitude: '373 m',
    },
    curveControl: { x: 345, y: 390 },
    flightNumber: 'AY-3310 / AR',
    traveler: 'Alejandro M. (Tangem EAL6+)',
    tangemId: 'TNG-3320-BASE',
    escrowUsdc: 210.00,
    travelerFeeUsdc: 80.00,
    cargoDescription: 'Insumos Médicos, Libros Académicos y Documentación',
    cargoWeightKg: 3.1,
    estimatedHours: 3.2,
  },
];

// Nodos globales secundarios
const GLOBAL_HUBS = [
  { code: 'BUE', city: 'Buenos Aires', x: 330, y: 420 },
  { code: 'BOG', city: 'Bogotá', x: 285, y: 280 },
  { code: 'LIM', city: 'Lima', x: 275, y: 330 },
  { code: 'LHR', city: 'Londres', x: 470, y: 140 },
  { code: 'CDG', city: 'París', x: 480, y: 150 },
  { code: 'DXB', city: 'Dubái', x: 620, y: 220 },
  { code: 'JFK', city: 'Nueva York', x: 265, y: 175 },
];

/**
 * =========================================================================
 * GLOBAL RADAR BACKGROUND (Fondo Animado Vectorial Cinematográfico Lento)
 * =========================================================================
 * Se ubica en posición fija/absoluta en el fondo de la landing page.
 * Visible en el hero y con efecto parallax continuo mientras el usuario scrollea.
 */
export function GlobalRadarBackground({
  activeRouteId,
  flightProgress,
  scrollY,
}: {
  activeRouteId: string;
  flightProgress: number;
  scrollY: number;
}) {
  const currentRoute = useMemo(() => {
    return ROUTES.find(r => r.id === activeRouteId) || ROUTES[0];
  }, [activeRouteId]);

  // Posición (x, y) y ángulo tangencial del avión en la curva de Bézier cuadrática
  const planeState = useMemo(() => {
    const t = Math.min(1, Math.max(0, flightProgress));
    const p0 = currentRoute.origin;
    const p1 = currentRoute.curveControl;
    const p2 = currentRoute.dest;

    const x = Math.pow(1 - t, 2) * p0.x + 2 * (1 - t) * t * p1.x + Math.pow(t, 2) * p2.x;
    const y = Math.pow(1 - t, 2) * p0.y + 2 * (1 - t) * t * p1.y + Math.pow(t, 2) * p2.y;

    const dx = 2 * (1 - t) * (p1.x - p0.x) + 2 * t * (p2.x - p1.x);
    const dy = 2 * (1 - t) * (p1.y - p0.y) + 2 * t * (p2.y - p1.y);
    const angle = (Math.atan2(dy, dx) * 180) / Math.PI;

    return { x, y, angle };
  }, [flightProgress, currentRoute]);

  const activeCurvePath = `M ${currentRoute.origin.x} ${currentRoute.origin.y} Q ${currentRoute.curveControl.x} ${currentRoute.curveControl.y} ${currentRoute.dest.x} ${currentRoute.dest.y}`;

  // Opacidad y parallax sutil según el scroll:
  // En el hero está al 85% de opacidad; al bajar se atenúa suavemente al 45% para máxima legibilidad
  const bgOpacity = Math.max(0.45, 0.88 - scrollY * 0.0004);
  const parallaxTranslateY = Math.min(100, scrollY * 0.08);

  return (
    <div
      aria-hidden="true"
      style={{
        position: 'fixed',
        top: 0,
        left: 0,
        width: '100vw',
        height: '100vh',
        overflow: 'hidden',
        pointerEvents: 'none',
        zIndex: 0,
        userSelect: 'none',
        transform: `translateY(${-parallaxTranslateY}px)`,
        transition: 'transform 0.1s linear',
      }}
    >
      <svg
        viewBox="0 0 1000 500"
        preserveAspectRatio="xMidYMid slice"
        style={{
          width: '100%',
          height: '100%',
          display: 'block',
          opacity: bgOpacity,
          transition: 'opacity 0.3s ease-out',
        }}
      >
        <defs>
          {/* Gradiente dinámico de la trayectoria activa */}
          <linearGradient id="bgRouteGrad" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#00cfff" stopOpacity="0.9" />
            <stop offset="50%" stopColor="#9b72ff" stopOpacity="0.95" />
            <stop offset="100%" stopColor="#00d68f" stopOpacity="0.9" />
          </linearGradient>

          {/* Filtro Neón para el avión y estelas */}
          <filter id="bgNeon" x="-40%" y="-40%" width="180%" height="180%">
            <feGaussianBlur stdDeviation="3.5" result="blur" />
            <feMerge>
              <feMergeNode in="blur" />
              <feMergeNode in="SourceGraphic" />
            </feMerge>
          </filter>

          {/* Filtro de brillo para balizas de aeropuertos */}
          <filter id="bgBeaconGlow" x="-50%" y="-50%" width="200%" height="200%">
            <feGaussianBlur stdDeviation="4" result="blur" />
            <feMerge>
              <feMergeNode in="blur" />
              <feMergeNode in="SourceGraphic" />
            </feMerge>
          </filter>

          {/* Cuadrícula geo-espacial */}
          <pattern id="bgGridPattern" width="45" height="45" patternUnits="userSpaceOnUse">
            <path d="M 45 0 L 0 0 0 45" fill="none" stroke="rgba(0, 207, 255, 0.03)" strokeWidth="0.7" />
            <circle cx="45" cy="45" r="0.8" fill="rgba(0, 207, 255, 0.12)" />
          </pattern>

          {/* Haz rotativo de radar continuo */}
          <radialGradient id="bgSweepGrad" cx="0%" cy="0%" r="100%">
            <stop offset="0%" stopColor="#00cfff" stopOpacity="0.16" />
            <stop offset="60%" stopColor="#00cfff" stopOpacity="0.03" />
            <stop offset="100%" stopColor="#00cfff" stopOpacity="0" />
          </radialGradient>
        </defs>

        {/* Cuadrícula */}
        <rect width="1000" height="500" fill="url(#bgGridPattern)" />

        {/* Haz de Radar Rotativo Lento (28s por ciclo) */}
        <g transform="translate(500, 250)">
          <circle r="140" fill="none" stroke="rgba(0, 207, 255, 0.05)" strokeWidth="0.8" strokeDasharray="3 6" />
          <circle r="260" fill="none" stroke="rgba(0, 207, 255, 0.04)" strokeWidth="0.8" strokeDasharray="3 6" />
          <circle r="380" fill="none" stroke="rgba(0, 207, 255, 0.03)" strokeWidth="0.8" strokeDasharray="4 8" />

          <g>
            <path
              d="M 0 0 L 460 0 A 460 460 0 0 1 425 175 Z"
              fill="url(#bgSweepGrad)"
            >
              <animateTransform
                attributeName="transform"
                type="rotate"
                from="0"
                to="360"
                dur="28s"
                repeatCount="indefinite"
              />
            </path>
            <line x1="0" y1="0" x2="460" y2="0" stroke="rgba(0, 207, 255, 0.3)" strokeWidth="1.2">
              <animateTransform
                attributeName="transform"
                type="rotate"
                from="0"
                to="360"
                dur="28s"
                repeatCount="indefinite"
              />
            </line>
          </g>
        </g>

        {/* Línea Ecuador */}
        <line x1="0" y1="250" x2="1000" y2="250" stroke="rgba(0, 207, 255, 0.08)" strokeDasharray="5 7" strokeWidth="0.8" />
        <text x="16" y="246" fill="rgba(0, 207, 255, 0.35)" fontSize="8" fontFamily="monospace" letterSpacing="0.1em">
          0° ECUADOR · AYNI ESCROW PROTOCOL BASE L2
        </text>

        {/* ========================================================
            CONTINENTES VECTORIALES EN CÓDIGO PURO
            ======================================================== */}
        {/* América del Norte */}
        <path
          d="M 120 70 L 220 60 L 300 90 L 320 150 L 290 190 L 250 220 L 220 250 L 190 200 L 140 180 L 100 130 Z"
          fill="rgba(0, 207, 255, 0.03)"
          stroke="rgba(0, 207, 255, 0.18)"
          strokeWidth="1.2"
        />
        {/* América Central */}
        <path
          d="M 220 250 L 250 260 L 270 290 L 255 300 L 230 270 Z"
          fill="rgba(0, 207, 255, 0.03)"
          stroke="rgba(0, 207, 255, 0.16)"
          strokeWidth="1.2"
        />
        {/* América del Sur */}
        <path
          d="M 270 290 L 350 300 L 390 350 L 360 440 L 320 480 L 280 430 L 265 350 L 270 290 Z"
          fill="rgba(0, 207, 255, 0.04)"
          stroke="rgba(0, 207, 255, 0.22)"
          strokeWidth="1.4"
        />
        {/* Europa */}
        <path
          d="M 450 100 L 530 90 L 560 130 L 530 180 L 480 190 L 450 160 L 440 120 Z"
          fill="rgba(155, 114, 255, 0.035)"
          stroke="rgba(155, 114, 255, 0.22)"
          strokeWidth="1.2"
        />
        {/* África */}
        <path
          d="M 460 200 L 560 190 L 590 260 L 560 380 L 500 420 L 460 340 L 440 240 Z"
          fill="rgba(0, 207, 255, 0.025)"
          stroke="rgba(0, 207, 255, 0.14)"
          strokeWidth="1.2"
        />
        {/* Asia */}
        <path
          d="M 560 90 L 750 80 L 880 120 L 890 220 L 800 280 L 720 260 L 640 220 L 560 180 Z"
          fill="rgba(0, 207, 255, 0.03)"
          stroke="rgba(0, 207, 255, 0.18)"
          strokeWidth="1.2"
        />
        {/* Oceanía */}
        <path
          d="M 800 340 L 890 330 L 910 400 L 840 430 L 790 390 Z"
          fill="rgba(0, 207, 255, 0.025)"
          stroke="rgba(0, 207, 255, 0.14)"
          strokeWidth="1.2"
        />

        {/* Hub Bolivia (Corazón de Sudamérica) */}
        <circle cx="315" cy="350" r="22" fill="rgba(245, 166, 35, 0.06)" stroke="rgba(245, 166, 35, 0.35)" strokeWidth="1" strokeDasharray="3 3" />
        <circle cx="315" cy="350" r="4" fill="var(--brand-gold)" opacity="0.8" />

        {/* Aeropuertos Secundarios */}
        {GLOBAL_HUBS.map(h => (
          <g key={h.code} opacity="0.45">
            <circle cx={h.x} cy={h.y} r="2" fill="rgba(255,255,255,0.4)" />
            <text x={h.x + 4} y={h.y + 3} fill="rgba(255,255,255,0.3)" fontSize="7" fontFamily="monospace">
              {h.code}
            </text>
          </g>
        ))}

        {/* Rutas inactivas (faint glow de fondo para ambientar la red global) */}
        {ROUTES.map(r => {
          if (r.id === activeRouteId) return null;
          const pathD = `M ${r.origin.x} ${r.origin.y} Q ${r.curveControl.x} ${r.curveControl.y} ${r.dest.x} ${r.dest.y}`;
          return (
            <g key={r.id} opacity="0.2">
              <path
                d={pathD}
                fill="none"
                stroke="rgba(0, 207, 255, 0.4)"
                strokeWidth="1.2"
                strokeDasharray="4 6"
              />
              <circle cx={r.origin.x} cy={r.origin.y} r="3" fill="rgba(0, 207, 255, 0.6)" />
              <circle cx={r.dest.x} cy={r.dest.y} r="3" fill="rgba(245, 166, 35, 0.6)" />
            </g>
          );
        })}

        {/* ========================================================
            RUTA ACTIVA (Brillo Neón Iluminado)
            ======================================================== */}
        <path
          d={activeCurvePath}
          fill="none"
          stroke="rgba(0, 207, 255, 0.25)"
          strokeWidth="6"
          filter="url(#bgNeon)"
        />
        <path
          d={activeCurvePath}
          fill="none"
          stroke="rgba(255, 255, 255, 0.2)"
          strokeWidth="1.4"
          strokeDasharray="4 6"
        />
        <path
          d={activeCurvePath}
          fill="none"
          stroke="url(#bgRouteGrad)"
          strokeWidth="2.8"
          strokeDasharray="8 8"
        />

        {/* Faro Origen */}
        <g transform={`translate(${currentRoute.origin.x}, ${currentRoute.origin.y})`}>
          <circle r="18" fill="none" stroke="var(--brand-emerald)" strokeWidth="1" opacity="0.3">
            <animate attributeName="r" values="6;24;6" dur="3s" repeatCount="indefinite" />
            <animate attributeName="opacity" values="0.8;0;0.8" dur="3s" repeatCount="indefinite" />
          </circle>
          <circle r="5.5" fill="var(--brand-emerald)" filter="url(#bgBeaconGlow)" />
          <circle r="2" fill="#050810" />

          <rect x="-34" y="-26" width="68" height="18" rx="6" fill="rgba(5,8,16,0.9)" stroke="var(--brand-emerald)" strokeWidth="1" />
          <text x="0" y="-14" textAnchor="middle" fill="#fff" fontSize="8" fontWeight="bold" fontFamily="monospace">
            {currentRoute.origin.flag} {currentRoute.origin.code}
          </text>
        </g>

        {/* Faro Destino */}
        <g transform={`translate(${currentRoute.dest.x}, ${currentRoute.dest.y})`}>
          <circle r="18" fill="none" stroke="var(--brand-gold)" strokeWidth="1" opacity="0.3">
            <animate attributeName="r" values="6;24;6" dur="3s" repeatCount="indefinite" />
            <animate attributeName="opacity" values="0.8;0;0.8" dur="3s" repeatCount="indefinite" />
          </circle>
          <circle r="5.5" fill="var(--brand-gold)" filter="url(#bgBeaconGlow)" />
          <circle r="2" fill="#050810" />

          <rect x="-34" y="-26" width="68" height="18" rx="6" fill="rgba(5,8,16,0.9)" stroke="var(--brand-gold)" strokeWidth="1" />
          <text x="0" y="-14" textAnchor="middle" fill="#fff" fontSize="8" fontWeight="bold" fontFamily="monospace">
            {currentRoute.dest.flag} {currentRoute.dest.code}
          </text>
        </g>

        {/* Avión en vuelo lento */}
        <g
          transform={`translate(${planeState.x}, ${planeState.y}) rotate(${planeState.angle})`}
          filter="url(#bgNeon)"
        >
          <ellipse cx="-16" cy="0" rx="10" ry="3.5" fill="var(--brand-cyan)" opacity="0.85" />
          <line x1="-16" y1="0" x2="-30" y2="0" stroke="rgba(0, 207, 255, 0.4)" strokeWidth="1.5" strokeDasharray="3 3" />

          <path
            d="M 15 0 L -6 -13 L -2 -3 L -13 -3 L -16 -7 L -18 -7 L -17 0 L -18 7 L -16 7 L -13 3 L -2 3 L -6 13 Z"
            fill="#ffffff"
            stroke="var(--brand-cyan)"
            strokeWidth="1.2"
          />
          <circle cx="9" cy="0" r="2.2" fill="var(--brand-cyan)" />
        </g>
      </svg>

      {/* Degradados de profundidad (Vignette) para contraste con el texto */}
      <div
        style={{
          position: 'absolute',
          inset: 0,
          background: 'radial-gradient(ellipse at 50% 40%, transparent 25%, rgba(5, 8, 16, 0.65) 65%, #050810 95%)',
          pointerEvents: 'none',
        }}
      />
      <div
        style={{
          position: 'absolute',
          top: 0,
          left: 0,
          right: 0,
          height: '140px',
          background: 'linear-gradient(180deg, #050810 0%, rgba(5,8,16,0.6) 60%, transparent 100%)',
          pointerEvents: 'none',
        }}
      />
      <div
        style={{
          position: 'absolute',
          bottom: 0,
          left: 0,
          right: 0,
          height: '180px',
          background: 'linear-gradient(0deg, #050810 0%, rgba(5,8,16,0.7) 60%, transparent 100%)',
          pointerEvents: 'none',
        }}
      />
    </div>
  );
}

/**
 * =========================================================================
 * HERO FLIGHT TELEMETRY CAPSULE (Cápsula de Telemetría Glassmorphism)
 * =========================================================================
 */
export function HeroFlightTelemetry({
  activeRouteId,
  flightProgress,
  isPlaying,
  onSelectRoute,
  onTogglePlay,
  onNextRoute,
}: {
  activeRouteId: string;
  flightProgress: number;
  isPlaying: boolean;
  onSelectRoute: (id: string) => void;
  onTogglePlay: () => void;
  onNextRoute: () => void;
}) {
  const currentRoute = useMemo(() => {
    return ROUTES.find(r => r.id === activeRouteId) || ROUTES[0];
  }, [activeRouteId]);

  return (
    <div
      style={{
        background: 'linear-gradient(145deg, rgba(9, 15, 34, 0.88) 0%, rgba(5, 8, 18, 0.94) 100%)',
        backdropFilter: 'blur(20px)',
        WebkitBackdropFilter: 'blur(20px)',
        border: '1px solid rgba(0, 207, 255, 0.35)',
        borderRadius: '20px',
        padding: '20px 26px',
        boxShadow: '0 24px 60px rgba(0, 0, 0, 0.75), 0 0 35px rgba(0, 207, 255, 0.15)',
        maxWidth: '960px',
        margin: '0 auto 38px',
        position: 'relative',
        zIndex: 10,
        transition: 'all 0.3s cubic-bezier(0.16, 1, 0.3, 1)',
      }}
    >
      {/* Barra superior de rutas */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '12px', marginBottom: '16px', paddingBottom: '14px', borderBottom: '1px solid rgba(255,255,255,0.08)' }}>
        
        {/* Título e indicador en vivo */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
          <div style={{
            width: 34,
            height: 34,
            borderRadius: '10px',
            background: 'linear-gradient(135deg, var(--brand-cyan), var(--brand-purple))',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            color: '#050810',
            boxShadow: '0 0 16px rgba(0,207,255,0.4)',
          }}>
            <Plane size={18} />
          </div>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <span style={{ fontSize: '0.88rem', fontWeight: 800, color: 'var(--text-primary)', letterSpacing: '-0.01em' }}>
                Radar Global de Vuelos P2P & Custodia Escrow
              </span>
              <span style={{ width: 8, height: 8, borderRadius: '50%', background: 'var(--brand-emerald)', boxShadow: '0 0 8px var(--brand-emerald)', display: 'inline-block' }} />
            </div>
            <div style={{ fontSize: '0.7rem', color: 'var(--brand-cyan)' }}>
              Auto-rotación cinemática continua · Base Layer 2
            </div>
          </div>
        </div>

        {/* Píldoras de rutas navegables */}
        <div style={{ display: 'flex', gap: '6px', flexWrap: 'wrap' }}>
          {ROUTES.map(r => {
            const isSelected = r.id === activeRouteId;
            return (
              <button
                key={r.id}
                type="button"
                onClick={() => onSelectRoute(r.id)}
                style={{
                  padding: '6px 12px',
                  borderRadius: '10px',
                  fontSize: '0.74rem',
                  fontWeight: 700,
                  background: isSelected ? 'linear-gradient(135deg, rgba(0,207,255,0.22) 0%, rgba(155,114,255,0.22) 100%)' : 'rgba(255, 255, 255, 0.04)',
                  border: isSelected ? '1px solid var(--brand-cyan)' : '1px solid rgba(255, 255, 255, 0.08)',
                  color: isSelected ? 'var(--brand-cyan)' : 'var(--text-secondary)',
                  cursor: 'pointer',
                  transition: 'all 0.2s ease',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '6px',
                  boxShadow: isSelected ? '0 0 14px rgba(0, 207, 255, 0.25)' : 'none',
                }}
              >
                <span>{r.origin.flag}</span>
                <span>{r.origin.code} ➔ {r.dest.code}</span>
                {isSelected && (
                  <span style={{ width: 6, height: 6, borderRadius: '50%', background: 'var(--brand-emerald)' }} />
                )}
              </button>
            );
          })}
        </div>
      </div>

      {/* Grid de telemetría del vuelo activo */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))',
        gap: '16px',
        alignItems: 'center',
      }}>
        {/* Vuelo y Viajero */}
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '0.68rem', color: 'var(--text-muted)' }}>
            <Navigation size={11} color="var(--brand-cyan)" />
            <span>VUELO ACTIVO</span>
          </div>
          <div style={{ fontWeight: 800, fontSize: '0.94rem', color: 'var(--text-primary)', marginTop: '2px' }}>
            {currentRoute.origin.flag} {currentRoute.origin.city} ({currentRoute.origin.code}) ➔ {currentRoute.dest.flag} {currentRoute.dest.city}
          </div>
          <div style={{ fontSize: '0.72rem', color: 'var(--brand-cyan)', marginTop: '2px' }}>
            {currentRoute.flightNumber} · {currentRoute.traveler}
          </div>
        </div>

        {/* Progreso del trayecto */}
        <div>
          <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.68rem', color: 'var(--text-secondary)', marginBottom: '5px' }}>
            <span>Trayecto en curso</span>
            <strong style={{ color: 'var(--brand-emerald)' }}>{Math.round(flightProgress * 100)}% en ruta</strong>
          </div>
          <div style={{ width: '100%', height: '6px', background: 'rgba(255,255,255,0.08)', borderRadius: '999px', overflow: 'hidden' }}>
            <div style={{
              width: `${Math.round(flightProgress * 100)}%`,
              height: '100%',
              background: 'linear-gradient(90deg, var(--brand-cyan), var(--brand-emerald))',
              borderRadius: '999px',
              transition: 'width 0.15s linear',
            }} />
          </div>
          <div style={{ fontSize: '0.66rem', color: 'var(--text-muted)', marginTop: '4px' }}>
            Altitud: 38,200 FT · 894 KM/H
          </div>
        </div>

        {/* Custodia Escrow */}
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '0.68rem', color: 'var(--text-muted)' }}>
            <ShieldCheck size={12} color="var(--brand-gold)" />
            <span>CUSTODIA ESCROW</span>
          </div>
          <div style={{ fontFamily: 'var(--font-display)', fontWeight: 800, fontSize: '1.15rem', color: 'var(--brand-gold)', marginTop: '1px' }}>
            ${currentRoute.escrowUsdc.toFixed(2)} USDC
          </div>
          <div style={{ fontSize: '0.68rem', color: 'var(--text-secondary)' }}>
            Base L2 Smart Contract
          </div>
        </div>

        {/* Carga y Ganancia Viajero */}
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '0.68rem', color: 'var(--text-muted)' }}>
            <Key size={12} color="var(--brand-purple)" />
            <span>ENTREGA OTP + TANGEM</span>
          </div>
          <div style={{ fontWeight: 800, fontSize: '0.92rem', color: 'var(--brand-purple)', marginTop: '1px' }}>
            +{currentRoute.travelerFeeUsdc} USDC Ganancia
          </div>
          <div style={{ fontSize: '0.68rem', color: 'var(--text-muted)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }} title={currentRoute.cargoDescription}>
            {currentRoute.cargoDescription}
          </div>
        </div>

        {/* Controles */}
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'flex-end', gap: '8px' }}>
          <button
            type="button"
            onClick={onTogglePlay}
            className="btn btn-ghost btn-sm"
            style={{
              padding: '6px 12px',
              fontSize: '0.72rem',
              color: isPlaying ? 'var(--brand-cyan)' : 'var(--text-muted)',
              border: '1px solid rgba(0, 207, 255, 0.25)',
              borderRadius: '8px',
              display: 'flex',
              alignItems: 'center',
              gap: '5px',
            }}
          >
            {isPlaying ? <Pause size={12} /> : <Play size={12} />}
            <span>{isPlaying ? 'Pausar' : 'Reanudar'}</span>
          </button>

          <button
            type="button"
            onClick={onNextRoute}
            className="btn btn-ghost btn-sm"
            title="Siguiente Vuelo"
            style={{
              padding: '6px 10px',
              fontSize: '0.72rem',
              border: '1px solid rgba(255,255,255,0.1)',
              borderRadius: '8px',
              color: 'var(--text-secondary)',
              display: 'flex',
              alignItems: 'center',
              gap: '4px',
            }}
          >
            <span>Siguiente</span>
            <ArrowRight size={12} />
          </button>
        </div>
      </div>
    </div>
  );
}

/**
 * =========================================================================
 * MINI RADAR FLIGHT HUD FLOTANTE (Visible al scrollear hacia abajo)
 * =========================================================================
 */
export function MiniFlightHUD({
  activeRouteId,
  flightProgress,
  onNextRoute,
}: {
  activeRouteId: string;
  flightProgress: number;
  onNextRoute: () => void;
}) {
  const [isCollapsed, setIsCollapsed] = useState(false);
  const currentRoute = useMemo(() => {
    return ROUTES.find(r => r.id === activeRouteId) || ROUTES[0];
  }, [activeRouteId]);

  return (
    <aside
      aria-label="Telemetría de vuelo en curso"
      style={{
        position: 'fixed',
        bottom: '22px',
        right: '22px',
        zIndex: 890,
        background: 'linear-gradient(180deg, rgba(8, 14, 30, 0.96) 0%, rgba(4, 7, 16, 0.98) 100%)',
        backdropFilter: 'blur(24px)',
        WebkitBackdropFilter: 'blur(24px)',
        border: '1px solid rgba(0, 207, 255, 0.4)',
        boxShadow: '0 16px 50px rgba(0, 0, 0, 0.8), 0 0 25px rgba(0, 207, 255, 0.2)',
        borderRadius: isCollapsed ? '999px' : '18px',
        padding: isCollapsed ? '8px 16px' : '12px 18px',
        display: 'flex',
        alignItems: 'center',
        gap: '14px',
        maxWidth: 'calc(100vw - 32px)',
        transition: 'all 0.3s cubic-bezier(0.16, 1, 0.3, 1)',
        animation: 'fadeIn 0.3s ease-out',
      }}
    >
      {isCollapsed ? (
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
          <div style={{
            width: 26,
            height: 26,
            borderRadius: '50%',
            background: 'rgba(0, 207, 255, 0.15)',
            border: '1px solid var(--brand-cyan)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
          }}>
            <Plane size={13} color="var(--brand-cyan)" />
          </div>

          <span style={{ fontSize: '0.8rem', fontWeight: 800, color: 'var(--text-primary)' }}>
            {currentRoute.origin.flag} {currentRoute.origin.code} ➔ {currentRoute.dest.flag} {currentRoute.dest.code}
          </span>

          <span style={{ fontSize: '0.75rem', fontWeight: 700, color: 'var(--brand-emerald)' }}>
            {Math.round(flightProgress * 100)}%
          </span>

          <button
            type="button"
            onClick={() => setIsCollapsed(false)}
            title="Expandir Telemetría"
            style={{
              background: 'transparent',
              border: 'none',
              color: 'var(--text-muted)',
              cursor: 'pointer',
              padding: '2px',
              display: 'flex',
              alignItems: 'center',
            }}
          >
            <Maximize2 size={13} />
          </button>
        </div>
      ) : (
        <div style={{ display: 'flex', alignItems: 'center', gap: '14px', flexWrap: 'wrap' }}>
          {/* Ícono de avión */}
          <div style={{
            width: 36,
            height: 36,
            borderRadius: '12px',
            background: 'linear-gradient(135deg, rgba(0, 207, 255, 0.2), rgba(155, 114, 255, 0.2))',
            border: '1px solid var(--brand-cyan)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            position: 'relative',
            boxShadow: '0 0 16px rgba(0, 207, 255, 0.3)',
          }}>
            <Plane size={17} color="var(--brand-cyan)" />
            <span 
              style={{
                position: 'absolute',
                top: -2,
                right: -2,
                width: 8,
                height: 8,
                borderRadius: '50%',
                background: 'var(--brand-emerald)',
                boxShadow: '0 0 8px var(--brand-emerald)',
              }} 
            />
          </div>

          {/* Info y Progreso */}
          <div style={{ minWidth: '150px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '6px', marginBottom: '3px' }}>
              <span style={{ fontWeight: 800, fontSize: '0.82rem', color: 'var(--text-primary)' }}>
                {currentRoute.origin.flag} {currentRoute.origin.code} ➔ {currentRoute.dest.flag} {currentRoute.dest.code}
              </span>
              <span style={{ fontSize: '0.68rem', color: 'var(--text-muted)' }}>({currentRoute.flightNumber})</span>
            </div>

            <div style={{ width: '100%', height: '5px', background: 'rgba(255,255,255,0.1)', borderRadius: '999px', overflow: 'hidden' }}>
              <div style={{
                width: `${Math.round(flightProgress * 100)}%`,
                height: '100%',
                background: 'linear-gradient(90deg, var(--brand-cyan), var(--brand-emerald))',
                borderRadius: '999px',
                transition: 'width 0.15s linear',
              }} />
            </div>

            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.66rem', color: 'var(--text-secondary)', marginTop: '3px' }}>
              <span>Alt: 38,200 FT</span>
              <strong style={{ color: 'var(--brand-emerald)' }}>{Math.round(flightProgress * 100)}% en ruta</strong>
            </div>
          </div>

          {/* Escrow Badge */}
          <div style={{ borderLeft: '1px solid rgba(255,255,255,0.1)', paddingLeft: '12px' }} className="nav-desktop">
            <div style={{ fontSize: '0.62rem', color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.04em' }}>
              Escrow L2
            </div>
            <div style={{ fontFamily: 'var(--font-display)', fontWeight: 800, fontSize: '0.85rem', color: 'var(--brand-gold)' }}>
              ${currentRoute.escrowUsdc.toFixed(2)} USDC
            </div>
          </div>

          {/* Acciones */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
            <button
              type="button"
              onClick={onNextRoute}
              className="btn-ghost"
              title="Cambiar Ruta de Vuelo"
              style={{
                padding: '6px 8px',
                borderRadius: '8px',
                fontSize: '0.72rem',
                border: '1px solid rgba(255,255,255,0.1)',
                color: 'var(--text-secondary)',
                cursor: 'pointer',
              }}
            >
              <ArrowRight size={13} />
            </button>

            <button
              type="button"
              onClick={() => setIsCollapsed(true)}
              title="Minimizar"
              style={{
                background: 'transparent',
                border: 'none',
                color: 'var(--text-muted)',
                cursor: 'pointer',
                padding: '4px',
                display: 'flex',
                alignItems: 'center',
              }}
            >
              <Minimize2 size={13} />
            </button>
          </div>
        </div>
      )}
    </aside>
  );
}

/**
 * =========================================================================
 * COMPONENTE PRINCIPAL (Orquestador que maneja el ciclo de vuelo lento)
 * =========================================================================
 */
export function InteractiveWorldRadar() {
  const [activeRouteIndex, setActiveRouteIndex] = useState<number>(0);
  const [flightProgress, setFlightProgress] = useState<number>(0.15);
  const [isPlaying, setIsPlaying] = useState<boolean>(true);
  const [isScrolledPast, setIsScrolledPast] = useState<boolean>(false);
  const [scrollY, setScrollY] = useState<number>(0);

  const animRef = useRef<number>();
  const lastTimeRef = useRef<number | null>(null);

  const activeRoute = ROUTES[activeRouteIndex] || ROUTES[0];

  // Detector de scroll para parallax y Mini HUD flotante
  useEffect(() => {
    const handleScroll = () => {
      const y = window.scrollY;
      setScrollY(y);
      setIsScrolledPast(y > 520);
    };

    window.addEventListener('scroll', handleScroll, { passive: true });
    handleScroll();
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  // Animación lenta y cinemática (22 segundos por trayecto completo)
  useEffect(() => {
    if (!isPlaying) {
      lastTimeRef.current = null;
      return;
    }

    const DURATION = 22000; // 22 segundos para un viaje suave y relajado
    let pauseTimer: NodeJS.Timeout | null = null;

    const tick = (now: number) => {
      if (lastTimeRef.current === null) {
        lastTimeRef.current = now;
      }
      const delta = now - lastTimeRef.current;
      lastTimeRef.current = now;

      setFlightProgress(prev => {
        const next = prev + delta / DURATION;
        if (next >= 1.0) {
          // Llegada a destino: pausar un instante con baliza encendida y pasar a la siguiente ruta
          if (!pauseTimer) {
            pauseTimer = setTimeout(() => {
              setActiveRouteIndex(idx => (idx + 1) % ROUTES.length);
              setFlightProgress(0);
              lastTimeRef.current = null;
              pauseTimer = null;
            }, 1400);
          }
          return 1.0;
        }
        return next;
      });

      animRef.current = requestAnimationFrame(tick);
    };

    animRef.current = requestAnimationFrame(tick);

    return () => {
      if (animRef.current) cancelAnimationFrame(animRef.current);
      if (pauseTimer) clearTimeout(pauseTimer);
      lastTimeRef.current = null;
    };
  }, [isPlaying, activeRouteIndex]);

  const handleSelectRoute = (id: string) => {
    const idx = ROUTES.findIndex(r => r.id === id);
    if (idx !== -1) {
      setActiveRouteIndex(idx);
      setFlightProgress(0);
      lastTimeRef.current = null;
    }
  };

  const handleNextRoute = () => {
    setActiveRouteIndex(idx => (idx + 1) % ROUTES.length);
    setFlightProgress(0);
    lastTimeRef.current = null;
  };

  const handleTogglePlay = () => {
    setIsPlaying(p => !p);
  };

  return (
    <>
      {/* Fondo Animado Global Vectorial Fijo / Parallax detrás de la landing */}
      <GlobalRadarBackground
        activeRouteId={activeRoute.id}
        flightProgress={flightProgress}
        scrollY={scrollY}
      />

      {/* Cápsula de Telemetría en el Hero */}
      <HeroFlightTelemetry
        activeRouteId={activeRoute.id}
        flightProgress={flightProgress}
        isPlaying={isPlaying}
        onSelectRoute={handleSelectRoute}
        onTogglePlay={handleTogglePlay}
        onNextRoute={handleNextRoute}
      />

      {/* Mini HUD flotante al bajar — desactivado por pedido de diseño, se conserva el componente por si se retoma */}
    </>
  );
}
