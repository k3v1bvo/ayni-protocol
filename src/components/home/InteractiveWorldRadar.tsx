'use client';

import React, { useState, useEffect, useRef, useMemo } from 'react';
import { 
  Plane, ShieldCheck, Key, Sparkles, Navigation, Globe, 
  MapPin, Clock, ArrowRight, RefreshCw, Zap, DollarSign, CheckCircle2
} from 'lucide-react';

interface FlightRoute {
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

const ROUTES: FlightRoute[] = [
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
    cargoDescription: 'Componentes Electrónicos de Precisión y Lente Canon',
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
    cargoDescription: 'Ají amarillo en vainas, llajwa deshidratada y café de altura',
    cargoWeightKg: 4.2,
    estimatedHours: 12.0,
  },
];

// Nodos globales secundarios para radar
const GLOBAL_HUBS = [
  { code: 'BUE', city: 'Buenos Aires', x: 330, y: 420 },
  { code: 'BOG', city: 'Bogotá', x: 285, y: 280 },
  { code: 'LIM', city: 'Lima', x: 275, y: 330 },
  { code: 'LHR', city: 'Londres', x: 470, y: 140 },
  { code: 'CDG', city: 'París', x: 480, y: 150 },
  { code: 'DXB', city: 'Dubái', x: 620, y: 220 },
  { code: 'JFK', city: 'Nueva York', x: 265, y: 175 },
];

export function InteractiveWorldRadar() {
  const [activeRouteId, setActiveRouteId] = useState<string>('mad-lpz');
  const [flightProgress, setFlightProgress] = useState<number>(0.38);
  const [isPlaying, setIsPlaying] = useState<boolean>(true);
  const [telemetrySpeed] = useState<number>(894);
  const [telemetryAltitude] = useState<number>(38200);
  const animRef = useRef<number>();

  const currentRoute = useMemo(() => {
    return ROUTES.find(r => r.id === activeRouteId) || ROUTES[0];
  }, [activeRouteId]);

  // Motor de animación continua del vuelo a lo largo de la curva de Bézier cuadrática
  useEffect(() => {
    let startTime: number | null = null;
    const duration = 9000; // 9 segundos por trayecto

    const animate = (timestamp: number) => {
      if (!startTime) startTime = timestamp - (flightProgress * duration);
      const elapsed = timestamp - startTime;
      const prog = (elapsed % duration) / duration;

      setFlightProgress(prog);
      if (isPlaying) {
        animRef.current = requestAnimationFrame(animate);
      }
    };

    if (isPlaying) {
      animRef.current = requestAnimationFrame(animate);
    }

    return () => {
      if (animRef.current) cancelAnimationFrame(animRef.current);
    };
  }, [isPlaying, activeRouteId]);

  // Calcular posición (x, y) y ángulo de orientación del avión en la curva de Bézier
  const planeState = useMemo(() => {
    const t = flightProgress;
    const p0 = currentRoute.origin;
    const p1 = currentRoute.curveControl;
    const p2 = currentRoute.dest;

    // Bézier cuadrática: B(t) = (1-t)^2 P0 + 2(1-t)t P1 + t^2 P2
    const x = Math.pow(1 - t, 2) * p0.x + 2 * (1 - t) * t * p1.x + Math.pow(t, 2) * p2.x;
    const y = Math.pow(1 - t, 2) * p0.y + 2 * (1 - t) * t * p1.y + Math.pow(t, 2) * p2.y;

    // Vector derivada para la rotación tangencial: B'(t) = 2(1-t)(P1 - P0) + 2t(P2 - P1)
    const dx = 2 * (1 - t) * (p1.x - p0.x) + 2 * t * (p2.x - p1.x);
    const dy = 2 * (1 - t) * (p1.y - p0.y) + 2 * t * (p2.y - p1.y);
    const angle = (Math.atan2(dy, dx) * 180) / Math.PI;

    return { x, y, angle };
  }, [flightProgress, currentRoute]);

  const curvePathD = `M ${currentRoute.origin.x} ${currentRoute.origin.y} Q ${currentRoute.curveControl.x} ${currentRoute.curveControl.y} ${currentRoute.dest.x} ${currentRoute.dest.y}`;

  return (
    <div style={{
      position: 'relative',
      borderRadius: '24px',
      overflow: 'hidden',
      border: '1px solid rgba(0, 207, 255, 0.35)',
      background: 'radial-gradient(ellipse at 50% 30%, #0c1530 0%, #050814 80%, #02040a 100%)',
      boxShadow: '0 25px 80px rgba(0, 0, 0, 0.85), 0 0 50px rgba(0, 207, 255, 0.15)',
      marginBottom: '60px',
    }}>
      {/* Top HUD Bar */}
      <div style={{
        padding: '16px 24px',
        borderBottom: '1px solid rgba(255, 255, 255, 0.08)',
        background: 'rgba(5, 8, 20, 0.75)',
        backdropFilter: 'blur(16px)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        flexWrap: 'wrap',
        gap: '14px',
        zIndex: 5,
        position: 'relative',
      }}>
        {/* Title & Live Status */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
          <div style={{
            width: 36,
            height: 36,
            borderRadius: '10px',
            background: 'linear-gradient(135deg, var(--brand-cyan), var(--brand-purple))',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            color: '#050810',
            boxShadow: '0 0 20px rgba(0,207,255,0.4)',
          }}>
            <Plane size={20} />
          </div>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <span style={{ fontFamily: 'var(--font-display)', fontWeight: 800, fontSize: '0.95rem', color: 'var(--text-primary)' }}>
                Radar Global de Vuelos P2P & Custodia Escrow
              </span>
              <span className="sc-radar-dot" style={{ width: 8, height: 8 }} />
            </div>
            <div style={{ fontSize: '0.72rem', color: 'var(--brand-cyan)' }}>
              Simulación Vectorial en Código Puro · Base Layer 2
            </div>
          </div>
        </div>

        {/* Route Selector Pills */}
        <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
          {ROUTES.map(r => {
            const isSelected = r.id === activeRouteId;
            return (
              <button
                key={r.id}
                type="button"
                onClick={() => {
                  setActiveRouteId(r.id);
                  setFlightProgress(0);
                }}
                className="btn-pressable"
                style={{
                  padding: '7px 14px',
                  borderRadius: '12px',
                  fontSize: '0.76rem',
                  fontWeight: 700,
                  background: isSelected ? 'linear-gradient(135deg, rgba(0,207,255,0.2) 0%, rgba(155,114,255,0.2) 100%)' : 'rgba(255, 255, 255, 0.04)',
                  border: isSelected ? '1px solid var(--brand-cyan)' : '1px solid rgba(255, 255, 255, 0.08)',
                  color: isSelected ? 'var(--brand-cyan)' : 'var(--text-secondary)',
                  cursor: 'pointer',
                  transition: 'all 0.2s ease',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '6px',
                }}
              >
                <span>{r.origin.flag}</span>
                <span>{r.name}</span>
                {isSelected && (
                  <span style={{ width: 6, height: 6, borderRadius: '50%', background: 'var(--brand-emerald)' }} />
                )}
              </button>
            );
          })}
        </div>
      </div>

      {/* Main Interactive Map Canvas (Pure SVG Vector World Map) */}
      <div style={{ position: 'relative', width: '100%', height: '440px', overflow: 'hidden' }}>
        <svg
          viewBox="0 0 1000 500"
          style={{ width: '100%', height: '100%', display: 'block', background: 'transparent' }}
        >
          <defs>
            {/* Gradiente dinámico para la ruta en vuelo */}
            <linearGradient id="routeGlowGrad" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="#00cfff" stopOpacity="0.8" />
              <stop offset="50%" stopColor="#9b72ff" stopOpacity="0.9" />
              <stop offset="100%" stopColor="#00d68f" stopOpacity="0.8" />
            </linearGradient>

            {/* Filtro de resplandor Neón */}
            <filter id="neonGlow" x="-30%" y="-30%" width="160%" height="160%">
              <feGaussianBlur stdDeviation="4" result="blur" />
              <feMerge>
                <feMergeNode in="blur" />
                <feMergeNode in="SourceGraphic" />
              </feMerge>
            </filter>

            {/* Patrón de rejilla geo-espacial */}
            <pattern id="geoGrid" width="50" height="50" patternUnits="userSpaceOnUse">
              <path d="M 50 0 L 0 0 0 50" fill="none" stroke="rgba(0, 207, 255, 0.04)" strokeWidth="0.8" />
              <circle cx="50" cy="50" r="1" fill="rgba(0, 207, 255, 0.15)" />
            </pattern>
          </defs>

          {/* Geo Matrix Grid */}
          <rect width="1000" height="500" fill="url(#geoGrid)" />

          {/* Líneas de latitud de referencia (Ecuador, Trópicos) */}
          <line x1="0" y1="250" x2="1000" y2="250" stroke="rgba(0, 207, 255, 0.12)" strokeDasharray="6 8" strokeWidth="0.8" />
          <text x="12" y="245" fill="rgba(0, 207, 255, 0.4)" fontSize="9" fontFamily="monospace">0° ECUADOR</text>

          <line x1="0" y1="170" x2="1000" y2="170" stroke="rgba(255, 255, 255, 0.06)" strokeDasharray="3 6" strokeWidth="0.6" />
          <line x1="0" y1="330" x2="1000" y2="330" stroke="rgba(255, 255, 255, 0.06)" strokeDasharray="3 6" strokeWidth="0.6" />

          {/* ========================================================
              CONTINENTES VECTORIALES EN CÓDIGO PURO (Sin imágenes)
              ======================================================== */}
          {/* América del Norte */}
          <path
            d="M 120 70 L 220 60 L 300 90 L 320 150 L 290 190 L 250 220 L 220 250 L 190 200 L 140 180 L 100 130 Z"
            fill="rgba(0, 207, 255, 0.045)"
            stroke="rgba(0, 207, 255, 0.22)"
            strokeWidth="1.2"
          />
          {/* América Central */}
          <path
            d="M 220 250 L 250 260 L 270 290 L 255 300 L 230 270 Z"
            fill="rgba(0, 207, 255, 0.045)"
            stroke="rgba(0, 207, 255, 0.2)"
            strokeWidth="1.2"
          />
          {/* América del Sur (Con Bolivia destacada) */}
          <path
            d="M 270 290 L 350 300 L 390 350 L 360 440 L 320 480 L 280 430 L 265 350 L 270 290 Z"
            fill="rgba(0, 207, 255, 0.05)"
            stroke="rgba(0, 207, 255, 0.25)"
            strokeWidth="1.4"
          />
          {/* Europa */}
          <path
            d="M 450 100 L 530 90 L 560 130 L 530 180 L 480 190 L 450 160 L 440 120 Z"
            fill="rgba(155, 114, 255, 0.05)"
            stroke="rgba(155, 114, 255, 0.28)"
            strokeWidth="1.2"
          />
          {/* África */}
          <path
            d="M 460 200 L 560 190 L 590 260 L 560 380 L 500 420 L 460 340 L 440 240 Z"
            fill="rgba(0, 207, 255, 0.035)"
            stroke="rgba(0, 207, 255, 0.18)"
            strokeWidth="1.2"
          />
          {/* Asia */}
          <path
            d="M 560 90 L 750 80 L 880 120 L 890 220 L 800 280 L 720 260 L 640 220 L 560 180 Z"
            fill="rgba(0, 207, 255, 0.045)"
            stroke="rgba(0, 207, 255, 0.2)"
            strokeWidth="1.2"
          />
          {/* Oceanía / Australia */}
          <path
            d="M 800 340 L 890 330 L 910 400 L 840 430 L 790 390 Z"
            fill="rgba(0, 207, 255, 0.04)"
            stroke="rgba(0, 207, 255, 0.18)"
            strokeWidth="1.2"
          />

          {/* Destacar el Corazón de Sudamérica (Bolivia Hub) */}
          <circle cx="315" cy="350" r="18" fill="rgba(245, 166, 35, 0.08)" stroke="rgba(245, 166, 35, 0.4)" strokeWidth="1" strokeDasharray="3 3" />

          {/* Aeropuertos secundarios mundiales (Idle dots) */}
          {GLOBAL_HUBS.map(h => (
            <g key={h.code} opacity="0.65">
              <circle cx={h.x} cy={h.y} r="2.5" fill="var(--text-muted)" />
              <text x={h.x + 5} y={h.y + 3} fill="var(--text-muted)" fontSize="7" fontFamily="monospace">
                {h.code}
              </text>
            </g>
          ))}

          {/* ========================================================
              TRAYECTORIA DE VUELO (Curva de Bézier Luminosa)
              ======================================================== */}
          {/* 1. Sombra / Resplandor Base */}
          <path
            d={curvePathD}
            fill="none"
            stroke="rgba(0, 207, 255, 0.2)"
            strokeWidth="4"
            filter="url(#neonGlow)"
          />

          {/* 2. Trayectoria punteada de navegación */}
          <path
            d={curvePathD}
            fill="none"
            stroke="rgba(255, 255, 255, 0.25)"
            strokeWidth="1.5"
            strokeDasharray="4 6"
          />

          {/* 3. Estela animada de vuelo en progreso */}
          <path
            d={curvePathD}
            fill="none"
            stroke="url(#routeGlowGrad)"
            strokeWidth="2.8"
            strokeDasharray="8 8"
            style={{
              animation: 'laserScan 2.5s linear infinite',
            }}
          />

          {/* ========================================================
              AEROPUERTO ORIGEN (Pulsante Verde Esmeralda)
              ======================================================== */}
          <g transform={`translate(${currentRoute.origin.x}, ${currentRoute.origin.y})`}>
            <circle r="16" fill="none" stroke="var(--brand-emerald)" strokeWidth="1" opacity="0.3">
              <animate attributeName="r" values="6;22;6" dur="2.4s" repeatCount="indefinite" />
              <animate attributeName="opacity" values="0.8;0;0.8" dur="2.4s" repeatCount="indefinite" />
            </circle>
            <circle r="5" fill="var(--brand-emerald)" boxShadow="0 0 10px var(--brand-emerald)" />
            <circle r="2" fill="#050810" />

            {/* Tag de Origen */}
            <rect x="-35" y="-28" width="70" height="20" rx="6" fill="rgba(5,8,16,0.9)" stroke="var(--brand-emerald)" strokeWidth="1" />
            <text x="0" y="-14" textAnchor="middle" fill="#fff" fontSize="8.5" fontWeight="bold" fontFamily="monospace">
              {currentRoute.origin.flag} {currentRoute.origin.code}
            </text>
          </g>

          {/* ========================================================
              AEROPUERTO DESTINO (Pulsante Dorado / Escrow)
              ======================================================== */}
          <g transform={`translate(${currentRoute.dest.x}, ${currentRoute.dest.y})`}>
            <circle r="20" fill="none" stroke="var(--brand-gold)" strokeWidth="1.2" opacity="0.4">
              <animate attributeName="r" values="8;26;8" dur="2s" repeatCount="indefinite" />
              <animate attributeName="opacity" values="0.9;0;0.9" dur="2s" repeatCount="indefinite" />
            </circle>
            <circle r="6" fill="var(--brand-gold)" />
            <circle r="2" fill="#050810" />

            {/* Tag de Destino */}
            <rect x="-35" y="12" width="70" height="20" rx="6" fill="rgba(5,8,16,0.9)" stroke="var(--brand-gold)" strokeWidth="1" />
            <text x="0" y="26" textAnchor="middle" fill="#fff" fontSize="8.5" fontWeight="bold" fontFamily="monospace">
              {currentRoute.dest.flag} {currentRoute.dest.code}
            </text>
          </g>

          {/* ========================================================
              AVIÓN EN VUELO (Animado en tiempo real con rotación tangencial)
              ======================================================== */}
          <g
            transform={`translate(${planeState.x}, ${planeState.y}) rotate(${planeState.angle})`}
            filter="url(#neonGlow)"
          >
            {/* Resplandor de propulsión */}
            <ellipse cx="-16" cy="0" rx="8" ry="3" fill="var(--brand-cyan)" opacity="0.75" />

            {/* Silueta del Avión Comercial */}
            <path
              d="M 14 0 L -6 -12 L -2 -3 L -12 -3 L -15 -7 L -17 -7 L -16 0 L -17 7 L -15 7 L -12 3 L -2 3 L -6 12 Z"
              fill="#ffffff"
              stroke="var(--brand-cyan)"
              strokeWidth="1"
            />
            {/* Cabina con luz cian */}
            <circle cx="8" cy="0" r="1.8" fill="var(--brand-cyan)" />
          </g>
        </svg>

        {/* Live Overlay Telemetry HUD (Cyber-Fintech Card) */}
        <div style={{
          position: 'absolute',
          bottom: '16px',
          left: '16px',
          right: '16px',
          background: 'rgba(7, 12, 26, 0.88)',
          backdropFilter: 'blur(20px)',
          border: '1px solid rgba(0, 207, 255, 0.25)',
          borderRadius: '16px',
          padding: '14px 20px',
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(170px, 1fr))',
          gap: '16px',
          alignItems: 'center',
          boxShadow: '0 12px 40px rgba(0,0,0,0.6)',
        }}>
          {/* Flight Info */}
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '0.7rem', color: 'var(--text-muted)' }}>
              <Plane size={12} color="var(--brand-cyan)" />
              <span>VUELO ACTIVO</span>
            </div>
            <div style={{ fontWeight: 800, fontSize: '0.9rem', color: 'var(--text-primary)' }}>
              {currentRoute.flightNumber}
            </div>
            <div style={{ fontSize: '0.68rem', color: 'var(--brand-cyan)' }}>
              {currentRoute.traveler}
            </div>
          </div>

          {/* Progress Bar & Status */}
          <div>
            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.7rem', color: 'var(--text-secondary)', marginBottom: '4px' }}>
              <span>Trayecto en curso</span>
              <strong style={{ color: 'var(--brand-emerald)' }}>{Math.round(flightProgress * 100)}%</strong>
            </div>
            <div style={{ width: '100%', height: '6px', background: 'rgba(255,255,255,0.08)', borderRadius: '999px', overflow: 'hidden' }}>
              <div style={{
                width: `${Math.round(flightProgress * 100)}%`,
                height: '100%',
                background: 'linear-gradient(90deg, var(--brand-cyan), var(--brand-emerald))',
                borderRadius: '999px',
                transition: 'width 0.1s linear',
              }} />
            </div>
            <div style={{ fontSize: '0.65rem', color: 'var(--text-muted)', marginTop: '4px' }}>
              Altitud: {telemetryAltitude.toLocaleString()} FT · {telemetrySpeed} KM/H
            </div>
          </div>

          {/* Escrow Locked */}
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '0.7rem', color: 'var(--text-muted)' }}>
              <ShieldCheck size={12} color="var(--brand-gold)" />
              <span>CUSTODIA ESCROW</span>
            </div>
            <div style={{ fontFamily: 'var(--font-display)', fontWeight: 800, fontSize: '1rem', color: 'var(--brand-gold)' }}>
              ${currentRoute.escrowUsdc.toFixed(2)} USDC
            </div>
            <div style={{ fontSize: '0.68rem', color: 'var(--text-secondary)' }}>
              Base L2 Tx Hash Verificada
            </div>
          </div>

          {/* Cargo & Traveler Reward */}
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '0.7rem', color: 'var(--text-muted)' }}>
              <Key size={12} color="var(--brand-purple)" />
              <span>ENTREGA OTP + TANGEM</span>
            </div>
            <div style={{ fontWeight: 800, fontSize: '0.85rem', color: 'var(--brand-purple)' }}>
              +{currentRoute.travelerFeeUsdc} USDC Ganancia
            </div>
            <div style={{ fontSize: '0.68rem', color: 'var(--text-muted)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
              {currentRoute.cargoDescription}
            </div>
          </div>
        </div>
      </div>

      {/* Bottom Sub-Bar: Interactive Controller */}
      <div style={{
        padding: '12px 24px',
        background: 'rgba(5, 8, 16, 0.95)',
        borderTop: '1px solid rgba(255, 255, 255, 0.06)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        flexWrap: 'wrap',
        gap: '12px',
        fontSize: '0.78rem',
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '16px', color: 'var(--text-secondary)' }}>
          <span style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
            <span style={{ width: 8, height: 8, borderRadius: '50%', background: 'var(--brand-emerald)', display: 'inline-block' }} />
            Despegue: <strong>{currentRoute.origin.city} ({currentRoute.origin.code})</strong>
          </span>
          <ArrowRight size={14} color="var(--brand-cyan)" />
          <span style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
            <span style={{ width: 8, height: 8, borderRadius: '50%', background: 'var(--brand-gold)', display: 'inline-block' }} />
            Aterrizaje: <strong>{currentRoute.dest.city} ({currentRoute.dest.code} - {currentRoute.dest.altitude})</strong>
          </span>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
          <button
            type="button"
            onClick={() => setFlightProgress(0)}
            className="btn-ghost"
            style={{ padding: '4px 10px', fontSize: '0.74rem', display: 'flex', alignItems: 'center', gap: '4px', borderRadius: '8px' }}
          >
            <RefreshCw size={12} />
            <span>Reiniciar Vuelo</span>
          </button>

          <button
            type="button"
            onClick={() => setIsPlaying(prev => !prev)}
            className="btn btn-ghost btn-sm"
            style={{
              padding: '4px 12px',
              fontSize: '0.74rem',
              color: isPlaying ? 'var(--brand-cyan)' : 'var(--text-muted)',
              border: '1px solid rgba(0, 207, 255, 0.25)',
              borderRadius: '8px',
            }}
          >
            {isPlaying ? '⏸ Pausar Radar' : '▶ Reanudar Radar'}
          </button>
        </div>
      </div>
    </div>
  );
}
