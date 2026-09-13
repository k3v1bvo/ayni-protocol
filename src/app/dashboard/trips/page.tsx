'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { calculateOrderFees } from '@/lib/constants/fees';
import { useAuth } from '@/context/AuthContext';
import {
  Plane, Search, Filter, MapPin, Weight, Calendar, Star, Plus,
  ChevronRight, ArrowRight, Clock, Shield, CheckCircle2, X,
  Sparkles, RefreshCw, Check, PlaneTakeoff, ShieldCheck
} from 'lucide-react';

const TRIPS_DATA = [
  {
    id: 'T001', traveler: 'Alejandro Mamani C.', rating: 4.95, trips: 18,
    from: 'Madrid', fromFlag: '🇪🇸', fromCountry: 'España',
    to: 'La Paz', toFlag: '🇧🇴', toCountry: 'Bolivia',
    departure: '2026-09-12', arrival: '2026-09-13',
    totalKg: 23, availableKg: 14.5,
    transport: 'Vuelo directo', airline: 'Iberia IB 6825',
    pricePerKg: 8.0, maxItemValue: 500,
    status: 'scheduled', verified: true,
    avatar: 'AM',
    tags: ['Verificado IATA', 'Puntual', 'Amigable'],
  },
  {
    id: 'T002', traveler: 'Carlos Mendoza V.', rating: 4.88, trips: 12,
    from: 'Miami', fromFlag: '🇺🇸', fromCountry: 'EE.UU.',
    to: 'Santa Cruz', toFlag: '🇧🇴', toCountry: 'Bolivia',
    departure: '2026-09-15', arrival: '2026-09-16',
    totalKg: 20, availableKg: 8.0,
    transport: 'Vuelo con escala', airline: 'LATAM LA 4051',
    pricePerKg: 7.5, maxItemValue: 300,
    status: 'scheduled', verified: true,
    avatar: 'CM',
    tags: ['Verificado IATA', 'Rápido'],
  },
  {
    id: 'T003', traveler: 'Lucía Fernández R.', rating: 5.0, trips: 24,
    from: 'Buenos Aires', fromFlag: '🇦🇷', fromCountry: 'Argentina',
    to: 'Cochabamba', toFlag: '🇧🇴', toCountry: 'Bolivia',
    departure: '2026-09-18', arrival: '2026-09-18',
    totalKg: 15, availableKg: 6.5,
    transport: 'Vuelo directo', airline: 'BOA OB 901',
    pricePerKg: 9.0, maxItemValue: 400,
    status: 'scheduled', verified: true,
    avatar: 'LF',
    tags: ['Superhero', 'Top Rated'],
  },
  {
    id: 'T004', traveler: 'Juan Pablo Rueda', rating: 4.72, trips: 7,
    from: 'Ciudad de México', fromFlag: '🇲🇽', fromCountry: 'México',
    to: 'La Paz', toFlag: '🇧🇴', toCountry: 'Bolivia',
    departure: '2026-09-22', arrival: '2026-09-23',
    totalKg: 25, availableKg: 18.0,
    transport: 'Vuelo con escala', airline: 'Aeroméxico + BOA',
    pricePerKg: 6.5, maxItemValue: 200,
    status: 'scheduled', verified: false,
    avatar: 'JP',
    tags: ['En verificación'],
  },
  {
    id: 'T005', traveler: 'Diana Quiroga M.', rating: 4.98, trips: 31,
    from: 'Amsterdam', fromFlag: '🇳🇱', fromCountry: 'Países Bajos',
    to: 'La Paz', toFlag: '🇧🇴', toCountry: 'Bolivia',
    departure: '2026-09-25', arrival: '2026-09-26',
    totalKg: 23, availableKg: 11.0,
    transport: 'Vuelo con escala', airline: 'KLM + BOA',
    pricePerKg: 10.0, maxItemValue: 800,
    status: 'scheduled', verified: true,
    avatar: 'DQ',
    tags: ['Verificada IATA', 'Insumos médicos OK', 'Superhero'],
  },
];

const SAMPLE_TICKETS = [
  {
    airline: 'Iberia',
    code: 'IB 6825',
    route: 'Madrid (MAD) ➔ La Paz (LPZ)',
    date: '2026-09-14',
    seat: '14A',
    kilos: 23,
    avatar: 'AM',
    rawText: 'BOARDING PASS IBERIA IB 6825 FROM: MADRID BARAJAS (MAD) TO: LA PAZ EL ALTO (LPZ) DATE: 2026-09-14 SEAT: 14A BAGGAGE: 23KG CHECKED + 10KG CABIN PASSENGER: ALEJANDRO MAMANI PNR: 7A9F3E',
    previewImg: 'https://images.unsplash.com/photo-1544620347-c4fd4a3d5957?w=500&h=280&fit=crop&q=80',
  },
  {
    airline: 'LATAM Airlines',
    code: 'LA 4051',
    route: 'Miami (MIA) ➔ Santa Cruz (VVI)',
    date: '2026-09-16',
    seat: '08C',
    kilos: 20,
    avatar: 'CM',
    rawText: 'BOARDING PASS LATAM LA 4051 FROM: MIAMI INTL (MIA) TO: VIRU VIRU (VVI) DATE: 2026-09-16 SEAT: 08C BAGGAGE: 20KG CHECKED + 8KG CABIN PASSENGER: CARLOS MENDOZA PNR: 8E2B4D',
    previewImg: 'https://images.unsplash.com/photo-1436491865332-7a61a109cc05?w=500&h=280&fit=crop&q=80',
  },
  {
    airline: 'Boliviana de Aviación (BOA)',
    code: 'OB 776',
    route: 'Santa Cruz (VVI) ➔ Madrid (MAD)',
    date: '2026-09-18',
    seat: '22D',
    kilos: 30,
    avatar: 'LF',
    rawText: 'BOARDING PASS BOA OB 776 FROM: VIRU VIRU (VVI) TO: MADRID BARAJAS (MAD) DATE: 2026-09-18 SEAT: 22D BAGGAGE: 30KG CHECKED + 10KG CABIN PASSENGER: LUCIA FERNANDEZ PNR: 3C7E9A',
    previewImg: 'https://images.unsplash.com/photo-1506012787146-f92b2d7d6d96?w=500&h=280&fit=crop&q=80',
  }
];

export default function TripsPage() {
  const router = useRouter();
  const { user, role } = useAuth();
  const [tripsList, setTripsList] = useState(TRIPS_DATA);
  const [search, setSearch] = useState('');
  const [selectedTrip, setSelectedTrip] = useState<typeof TRIPS_DATA[0] | null>(null);
  const [orderKg, setOrderKg] = useState(2);
  const [orderAmount, setOrderAmount] = useState(200);
  const [submittingOrder, setSubmittingOrder] = useState(false);
  const [orderCreatedNotice, setOrderCreatedNotice] = useState<string | null>(null);

  // Flight Verification State (Gemini 3.6 Flash IATA Oracle)
  const [isFlightModalOpen, setIsFlightModalOpen] = useState(false);
  const [selectedTicketSample, setSelectedTicketSample] = useState<number>(0);
  const [isVerifyingFlight, setIsVerifyingFlight] = useState(false);
  const [flightResult, setFlightResult] = useState<{
    airline: string;
    flightNumber: string;
    originIata: string;
    destinationIata: string;
    departureDate: string;
    seat: string;
    baggageAllowanceKg: number;
    confidence: string;
    verdict: string;
    notes: string;
    modelUsed: string;
    attestationHash: string;
  } | null>(null);

  const fee = calculateOrderFees(orderAmount);

  const handleRunFlightVerification = async () => {
    const ticket = SAMPLE_TICKETS[selectedTicketSample];
    setIsVerifyingFlight(true);
    try {
      const res = await fetch('/api/ai/verify-flight', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ticketText: ticket.rawText,
          travelerName: ticket.airline,
          imageUrl: ticket.previewImg,
        }),
      });
      if (res.ok) {
        const data = await res.json();
        setFlightResult(data);
      }
    } catch (err) {
      console.warn('Error verificando pasaje:', err);
    } finally {
      setIsVerifyingFlight(false);
    }
  };

  const handleApplyVerifiedFlight = () => {
    if (!flightResult) return;
    const ticket = SAMPLE_TICKETS[selectedTicketSample];
    const newTrip = {
      id: `T-${Date.now().toString().slice(-3)}`,
      traveler: user?.full_name || 'Viajero Verificado IATA',
      rating: 5.0,
      trips: 1,
      from: flightResult.originIata === 'MAD' ? 'Madrid' : flightResult.originIata === 'MIA' ? 'Miami' : 'Santa Cruz',
      fromFlag: flightResult.originIata === 'MAD' ? '🇪🇸' : flightResult.originIata === 'MIA' ? '🇺🇸' : '🇧🇴',
      fromCountry: flightResult.originIata === 'MAD' ? 'España' : flightResult.originIata === 'MIA' ? 'EE.UU.' : 'Bolivia',
      to: flightResult.destinationIata === 'LPZ' ? 'La Paz' : flightResult.destinationIata === 'VVI' ? 'Santa Cruz' : 'Madrid',
      toFlag: flightResult.destinationIata === 'LPZ' ? '🇧🇴' : flightResult.destinationIata === 'VVI' ? '🇧🇴' : '🇪🇸',
      toCountry: flightResult.destinationIata === 'MAD' ? 'España' : 'Bolivia',
      departure: flightResult.departureDate,
      arrival: flightResult.departureDate,
      totalKg: flightResult.baggageAllowanceKg || 23,
      availableKg: flightResult.baggageAllowanceKg ? flightResult.baggageAllowanceKg - 6 : 17,
      transport: 'Vuelo directo verificado',
      airline: `${flightResult.airline} ${flightResult.flightNumber}`,
      pricePerKg: 8.5,
      maxItemValue: 500,
      status: 'scheduled',
      verified: true,
      avatar: (user?.full_name || 'V').slice(0, 2).toUpperCase(),
      tags: ['Verificado IATA', 'Base L2 Certified', 'Oráculo Aéreo'],
    };
    setTripsList([newTrip, ...tripsList]);
    setIsFlightModalOpen(false);
    setFlightResult(null);
  };

  const handleCreateOrder = async () => {
    setSubmittingOrder(true);
    await new Promise(r => setTimeout(r, 1000));
    const randomTx = '0x' + Array.from({ length: 64 }, () => Math.floor(Math.random() * 16).toString(16)).join('');
    const simOtp = Math.floor(100000 + Math.random() * 900000).toString();
    const orderCode = `ORD-${Date.now().toString().slice(-4)}`;

    // Despacho asíncrono de correo con el código OTP confidencial
    try {
      const recipient = user?.email || 'ayniprotocol@gmail.com';
      fetch('/api/email/send', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          to: recipient,
          type: 'otp',
          data: {
            recipientName: user?.full_name || 'Comprador AYNI',
            orderCode,
            otpCode: simOtp,
            productTitle: `Encargo con Viajero ${selectedTrip?.traveler || 'Asignado'} (${selectedTrip?.from} ➔ ${selectedTrip?.to})`,
            travelerName: selectedTrip?.traveler || 'Viajero Certificado',
            escrowAmountUsd: fee.totalOrderCostUsdc,
          },
        }),
      }).catch(err => console.warn('Error enviando correo OTP en trips:', err));
    } catch (_) {}

    setSubmittingOrder(false);
    setOrderCreatedNotice(randomTx);
    setTimeout(() => {
      router.push('/dashboard/orders');
    }, 1800);
  };

  const filtered = tripsList.filter(t =>
    !search ||
    t.from.toLowerCase().includes(search.toLowerCase()) ||
    t.to.toLowerCase().includes(search.toLowerCase()) ||
    t.traveler.toLowerCase().includes(search.toLowerCase())
  );

  const getAvatarColor = (name: string) => {
    const colors = ['rgba(0,207,255,0.2)', 'rgba(245,166,35,0.2)', 'rgba(0,214,143,0.2)', 'rgba(155,114,255,0.2)'];
    return colors[name.charCodeAt(0) % colors.length];
  };

  return (
    <DashboardLayout>
      <div className="page-header" style={{ flexWrap: 'wrap', gap: '14px' }}>
        <div className="page-title-group">
          <div className="page-title">
            {role === 'traveler' ? 'Encargos Disponibles' : 'Rutas y Viajeros Disponibles'}
          </div>
          <div className="page-subtitle">
            {role === 'traveler'
              ? 'Selecciona un pedido de compra para llevarlo en tu próximo viaje'
              : 'Elige un viajero verificado y envía tu pedido o compra asistida'}
          </div>
        </div>
        <div style={{ display: 'flex', gap: '10px', flexWrap: 'wrap' }}>
          <button
            type="button"
            onClick={() => setIsFlightModalOpen(true)}
            className="btn btn-secondary"
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: '8px',
              border: '1px solid rgba(0,207,255,0.4)',
              background: 'rgba(0,207,255,0.08)',
              color: 'var(--brand-cyan)',
              fontWeight: 600,
            }}
          >
            <Sparkles size={16} /> Validar Pasaje con Oráculo IA
          </button>
          <Link href="/dashboard/my-trips/new" className="btn btn-primary" style={{ display: 'inline-flex', alignItems: 'center', gap: '8px' }}>
            <Plus size={16} /> Publicar mi Ruta
          </Link>
        </div>
      </div>

      {/* Search bar */}
      <div style={{ display: 'flex', gap: '12px', marginBottom: '24px' }}>
        <div className="input-icon-wrap" style={{ flex: 1 }}>
          <Search size={16} className="input-icon" />
          <input
            type="search"
            placeholder="Buscar por ciudad de origen, destino o viajero..."
            className="input"
            style={{ paddingLeft: '40px' }}
            value={search}
            onChange={e => setSearch(e.target.value)}
          />
        </div>
        <button className="btn btn-ghost">
          <Filter size={16} /> Filtros
        </button>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: selectedTrip ? '1fr 380px' : '1fr', gap: '20px', alignItems: 'start' }}>
        {/* Trip List */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
          {filtered.map(trip => (
            <div
              key={trip.id}
              className="trip-card"
              style={{
                cursor: 'pointer',
                borderColor: selectedTrip?.id === trip.id ? 'var(--brand-cyan)' : 'var(--border-default)',
                background: selectedTrip?.id === trip.id ? 'rgba(0,207,255,0.03)' : 'var(--bg-card)',
              }}
              onClick={() => setSelectedTrip(selectedTrip?.id === trip.id ? null : trip)}
            >
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: '12px' }}>
                {/* Traveler */}
                <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                  <div className="avatar-placeholder" style={{
                    width: 46,
                    height: 46,
                    background: getAvatarColor(trip.avatar),
                    color: trip.verified ? 'var(--brand-cyan)' : 'var(--text-secondary)',
                    fontWeight: 700,
                    fontSize: '1rem',
                    border: trip.verified ? '1px solid rgba(0,207,255,0.3)' : '1px solid var(--border-default)',
                  }}>
                    {trip.avatar}
                  </div>
                  <div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '6px', marginBottom: '3px' }}>
                      <span style={{ fontWeight: 600, fontSize: '0.95rem' }}>{trip.traveler}</span>
                      {trip.verified && (
                        <CheckCircle2 size={15} color="var(--brand-cyan)" fill="rgba(0,207,255,0.2)" />
                      )}
                    </div>
                    <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
                      <span style={{ fontSize: '0.75rem', color: 'var(--brand-gold)' }}>★ {trip.rating}</span>
                      <span style={{ color: 'var(--border-default)' }}>•</span>
                      <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>{trip.trips} viajes</span>
                    </div>
                  </div>
                </div>

                {/* Tags */}
                <div style={{ display: 'flex', gap: '5px', flexWrap: 'wrap', justifyContent: 'flex-end' }}>
                  {trip.tags.map(t => (
                    <span key={t} className="badge badge-cyan" style={{ fontSize: '0.65rem' }}>{t}</span>
                  ))}
                </div>
              </div>

              {/* Route */}
              <div className="route-display">
                <div>
                  <div className="route-city">{trip.fromFlag} {trip.from}</div>
                  <div className="route-country">{trip.fromCountry}</div>
                </div>
                <div style={{ flex: 1, display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <div className="route-line" />
                  <Plane size={18} color="var(--brand-cyan)" style={{ flexShrink: 0 }} />
                  <div className="route-line" style={{ background: 'linear-gradient(90deg, transparent, var(--brand-cyan))' }} />
                </div>
                <div style={{ textAlign: 'right' }}>
                  <div className="route-city">{trip.to} {trip.toFlag}</div>
                  <div className="route-country">{trip.toCountry}</div>
                </div>
              </div>

              {/* Metrics */}
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '10px' }}>
                {[
                  { icon: Calendar, label: 'Salida', value: new Date(trip.departure).toLocaleDateString('es-ES', { day: '2-digit', month: 'short' }), color: 'var(--brand-gold)' },
                  { icon: Weight, label: 'Disponible', value: `${trip.availableKg} kg`, color: 'var(--brand-cyan)' },
                  { icon: Plane, label: 'Vuelo', value: trip.airline.split(' ')[0], color: 'var(--brand-purple)' },
                  { icon: Shield, label: 'Max valor', value: `$${trip.maxItemValue}`, color: 'var(--brand-emerald)' },
                ].map((m, i) => (
                  <div key={i} style={{ background: 'rgba(255,255,255,0.03)', borderRadius: 8, padding: '10px', textAlign: 'center' }}>
                    <div style={{ fontSize: '0.65rem', color: 'var(--text-muted)', marginBottom: '4px', textTransform: 'uppercase', letterSpacing: '0.05em' }}>{m.label}</div>
                    <div style={{ fontSize: '0.9rem', fontWeight: 700, color: m.color }}>{m.value}</div>
                  </div>
                ))}
              </div>

              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <div style={{ fontSize: '0.82rem', color: 'var(--text-muted)' }}>
                  {trip.airline} • {trip.transport}
                </div>
                <button type="button" className="btn btn-primary btn-sm" onClick={e => { e.stopPropagation(); setSelectedTrip(trip); }}>
                  Solicitar Encargo <ChevronRight size={14} />
                </button>
              </div>
            </div>
          ))}

          {filtered.length === 0 && (
            <div style={{ textAlign: 'center', padding: '60px', color: 'var(--text-muted)' }}>
              <Plane size={40} style={{ marginBottom: 12, opacity: 0.4 }} />
              <div>No hay rutas disponibles para ese criterio</div>
            </div>
          )}
        </div>

        {/* Order Panel — shows when trip selected */}
        {selectedTrip && (
          <div className="card card-glow-cyan" style={{ padding: '24px', position: 'sticky', top: 'calc(var(--topbar-h) + 24px)' }}>
            <div style={{ fontWeight: 700, fontSize: '1rem', marginBottom: '16px' }}>
              📦 Nuevo Encargo con {selectedTrip.traveler.split(' ')[0]}
            </div>

            <div style={{
              background: 'rgba(0,207,255,0.06)',
              borderRadius: 10,
              padding: '12px',
              marginBottom: '16px',
              fontSize: '0.8rem',
              display: 'flex',
              alignItems: 'center',
              gap: '8px',
              color: 'var(--brand-cyan)',
            }}>
              <MapPin size={14} />
              {selectedTrip.fromFlag} {selectedTrip.from} → {selectedTrip.to} {selectedTrip.toFlag} · {new Date(selectedTrip.departure).toLocaleDateString('es-ES', { day: '2-digit', month: 'short' })}
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '14px', marginBottom: '20px' }}>
              <div className="input-group">
                <label className="input-label">Costo de compra del producto (USDC)</label>
                <input
                  type="number"
                  min="1"
                  max="3000"
                  value={orderAmount}
                  onChange={e => setOrderAmount(Number(e.target.value))}
                  className="input"
                  style={{ fontWeight: 700, fontSize: '1.1rem', color: 'var(--brand-gold)' }}
                />
              </div>

              <div className="input-group">
                <label className="input-label">Peso estimado (kg)</label>
                <input
                  type="number"
                  min="0.1"
                  max={selectedTrip.availableKg}
                  step="0.1"
                  value={orderKg}
                  onChange={e => setOrderKg(Number(e.target.value))}
                  className="input"
                />
                <span style={{ fontSize: '0.72rem', color: 'var(--text-muted)' }}>
                  Máx disponible: {selectedTrip.availableKg} kg
                </span>
              </div>
            </div>

            {/* Fee breakdown */}
            <div style={{ background: 'rgba(255,255,255,0.03)', borderRadius: 10, padding: '14px', marginBottom: '16px' }}>
              <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginBottom: '10px', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                Desglose de Pago
              </div>
              {[
                { label: 'Costo del producto', value: `$${orderAmount.toFixed(2)}` },
                { label: `Honorario viajero (${(fee.travelerFeeRate * 100).toFixed(0)}%)`, value: `$${fee.travelerFeeUsdc.toFixed(2)}`, cap: fee.appliedHighValueCap },
                { label: `Comisión sistema (${(fee.systemFeeRate * 100).toFixed(0)}%)`, value: `$${fee.systemFeeUsdc.toFixed(2)}` },
                { label: 'Fondo de reserva', value: `$${fee.reserveFeeUsdc.toFixed(2)}` },
              ].map((row, i) => (
                <div key={i} style={{ display: 'flex', justifyContent: 'space-between', padding: '4px 0', fontSize: '0.82rem' }}>
                  <span style={{ color: 'var(--text-secondary)' }}>
                    {row.label}
                    {row.cap && <span className="badge badge-emerald" style={{ marginLeft: 6, fontSize: '0.6rem' }}>tope $50</span>}
                  </span>
                  <span style={{ fontWeight: 600 }}>{row.value}</span>
                </div>
              ))}
              <div style={{ borderTop: '1px solid var(--border-subtle)', marginTop: '10px', paddingTop: '10px', display: 'flex', justifyContent: 'space-between' }}>
                <span style={{ fontWeight: 700, color: 'var(--text-primary)' }}>Total en Escrow</span>
                <span style={{ fontWeight: 800, color: 'var(--brand-cyan)', fontFamily: 'var(--font-display)', fontSize: '1.1rem' }}>
                  ${fee.totalOrderCostUsdc.toFixed(2)} USDC
                </span>
              </div>
            </div>

            {orderCreatedNotice ? (
              <div style={{ background: 'rgba(0,214,143,0.1)', border: '1px solid rgba(0,214,143,0.3)', borderRadius: '10px', padding: '16px', textAlign: 'center' }}>
                <CheckCircle2 size={32} color="var(--brand-emerald)" style={{ margin: '0 auto 8px' }} />
                <div style={{ fontWeight: 700, color: 'var(--text-primary)', fontSize: '0.95rem' }}>¡Encargo Registrado en Escrow!</div>
                <div style={{ fontSize: '0.72rem', color: 'var(--brand-cyan)', fontFamily: 'monospace', wordBreak: 'break-all', marginTop: '4px' }}>
                  Tx: {orderCreatedNotice}
                </div>
                <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginTop: '8px' }}>
                  Redirigiendo a Mis Pedidos...
                </div>
              </div>
            ) : (
              <>
                <button
                  type="button"
                  onClick={handleCreateOrder}
                  disabled={submittingOrder}
                  className="btn btn-primary"
                  style={{ width: '100%', padding: '12px', justifyContent: 'center' }}
                >
                  {submittingOrder ? (
                    <span style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                      <span className="spinner" /> Bloqueando Fondos en Escrow...
                    </span>
                  ) : (
                    <span style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                      <Shield size={16} /> Crear Encargo y Bloquear Fondos
                    </span>
                  )}
                </button>
                <button
                  type="button"
                  className="btn btn-ghost btn-sm"
                  style={{ width: '100%', marginTop: '8px' }}
                  onClick={() => setSelectedTrip(null)}
                >
                  Cancelar
                </button>
              </>
            )}
          </div>
        )}
      </div>

      {/* MODAL: Oráculo IA de Validación de Pasajes IATA */}
      {isFlightModalOpen && (
        <div
          style={{
            position: 'fixed',
            inset: 0,
            background: 'rgba(5, 7, 15, 0.85)',
            backdropFilter: 'blur(8px)',
            zIndex: 9999,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            padding: '20px',
            animation: 'fadeIn 0.2s ease',
          }}
        >
          <style>{`
            @keyframes flightLaserScan {
              0% { top: 0%; opacity: 0.8; }
              50% { top: 95%; opacity: 1; }
              100% { top: 0%; opacity: 0.8; }
            }
          `}</style>

          <div
            style={{
              background: 'var(--bg-card)',
              border: '1px solid rgba(0, 207, 255, 0.3)',
              boxShadow: '0 20px 60px rgba(0, 0, 0, 0.7), 0 0 40px rgba(0, 207, 255, 0.15)',
              borderRadius: '16px',
              maxWidth: '740px',
              width: '100%',
              maxHeight: '90vh',
              overflowY: 'auto',
              padding: '28px',
              position: 'relative',
            }}
          >
            {/* Modal Header */}
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '20px' }}>
              <div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '6px' }}>
                  <span className="badge badge-cyan" style={{ display: 'inline-flex', alignItems: 'center', gap: '4px' }}>
                    <PlaneTakeoff size={12} /> Gemini 3.6 Flash Multimodal
                  </span>
                  <span className="badge badge-purple">Oráculo IATA On-Chain</span>
                </div>
                <h2 style={{ fontSize: '1.25rem', fontWeight: 800, margin: 0, color: 'var(--text-primary)' }}>
                  🛫 Certificación Forense de Pasaje Aéreo
                </h2>
                <p style={{ fontSize: '0.82rem', color: 'var(--text-muted)', margin: '4px 0 0' }}>
                  Verifica tu billete de avión oficial. La IA extrae código de vuelo, ruta IATA y franquicia de equipaje para garantizar máxima seguridad a los compradores.
                </p>
              </div>
              <button
                type="button"
                onClick={() => {
                  setIsFlightModalOpen(false);
                  setFlightResult(null);
                }}
                className="btn btn-ghost btn-sm"
                style={{ borderRadius: '50%', width: 32, height: 32, padding: 0, display: 'flex', alignItems: 'center', justifyContent: 'center' }}
              >
                <X size={18} />
              </button>
            </div>

            {/* Select Sample Tickets */}
            <div style={{ marginBottom: '18px' }}>
              <label style={{ fontSize: '0.78rem', fontWeight: 600, color: 'var(--text-secondary)', display: 'block', marginBottom: '8px' }}>
                Selecciona un Pasaje de Demostración (o usa OCR en vivo):
              </label>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '10px' }}>
                {SAMPLE_TICKETS.map((t, idx) => (
                  <button
                    key={idx}
                    type="button"
                    onClick={() => {
                      setSelectedTicketSample(idx);
                      setFlightResult(null);
                    }}
                    style={{
                      background: selectedTicketSample === idx ? 'rgba(0, 207, 255, 0.12)' : 'rgba(255,255,255,0.02)',
                      border: selectedTicketSample === idx ? '1px solid var(--brand-cyan)' : '1px solid var(--border-default)',
                      borderRadius: '10px',
                      padding: '10px',
                      textAlign: 'left',
                      cursor: 'pointer',
                      transition: 'all 0.2s ease',
                    }}
                  >
                    <div style={{ fontSize: '0.75rem', fontWeight: 700, color: selectedTicketSample === idx ? 'var(--brand-cyan)' : 'var(--text-primary)' }}>
                      {t.airline}
                    </div>
                    <div style={{ fontSize: '0.7rem', color: 'var(--text-muted)', marginTop: '2px' }}>
                      {t.route}
                    </div>
                    <div style={{ fontSize: '0.68rem', color: 'var(--brand-emerald)', marginTop: '4px', fontWeight: 600 }}>
                      Capacidad: {t.kilos} kg
                    </div>
                  </button>
                ))}
              </div>
            </div>

            {/* Ticket Visual Preview & Laser Scanner */}
            <div
              style={{
                position: 'relative',
                borderRadius: '12px',
                overflow: 'hidden',
                border: '1px solid rgba(255, 255, 255, 0.08)',
                background: '#090d16',
                marginBottom: '20px',
              }}
            >
              <div style={{ display: 'grid', gridTemplateColumns: '220px 1fr', minHeight: '150px' }}>
                <div style={{ position: 'relative', height: '100%', minHeight: '150px' }}>
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src={SAMPLE_TICKETS[selectedTicketSample].previewImg}
                    alt="Boarding Pass"
                    style={{ width: '100%', height: '100%', objectFit: 'cover', opacity: 0.85 }}
                  />
                  {isVerifyingFlight && (
                    <div
                      style={{
                        position: 'absolute',
                        left: 0,
                        right: 0,
                        height: '3px',
                        background: 'linear-gradient(90deg, transparent, #00cfff, #00d68f, transparent)',
                        boxShadow: '0 0 14px #00cfff, 0 0 28px #00d68f',
                        animation: 'flightLaserScan 1.6s ease-in-out infinite',
                        zIndex: 10,
                      }}
                    />
                  )}
                </div>

                <div style={{ padding: '16px', display: 'flex', flexDirection: 'column', justifyContent: 'center' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '6px' }}>
                    <Plane size={16} color="var(--brand-cyan)" />
                    <span style={{ fontSize: '0.85rem', fontWeight: 700, color: 'var(--text-primary)' }}>
                      Boarding Pass OCR Raw Stream
                    </span>
                  </div>
                  <div
                    style={{
                      fontFamily: 'monospace',
                      fontSize: '0.72rem',
                      color: 'var(--text-secondary)',
                      background: 'rgba(0,0,0,0.4)',
                      padding: '10px',
                      borderRadius: '8px',
                      border: '1px solid var(--border-subtle)',
                      lineHeight: '1.4',
                      wordBreak: 'break-all',
                    }}
                  >
                    {SAMPLE_TICKETS[selectedTicketSample].rawText}
                  </div>
                </div>
              </div>
            </div>

            {/* Run Verification Button */}
            {!flightResult && (
              <button
                type="button"
                onClick={handleRunFlightVerification}
                disabled={isVerifyingFlight}
                className="btn btn-primary"
                style={{
                  width: '100%',
                  padding: '14px',
                  justifyContent: 'center',
                  fontSize: '0.95rem',
                  fontWeight: 700,
                  boxShadow: '0 4px 20px rgba(0, 207, 255, 0.25)',
                }}
              >
                {isVerifyingFlight ? (
                  <span style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                    <span className="spinner" /> Procesando con Gemini 3.6 Flash & IATA Parser...
                  </span>
                ) : (
                  <span style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                    <Sparkles size={18} /> Auditar Pasaje con Gemini 3.6 Flash
                  </span>
                )}
              </button>
            )}

            {/* Verification Results Card */}
            {flightResult && (
              <div
                style={{
                  background: 'rgba(0, 214, 143, 0.04)',
                  border: '1px solid rgba(0, 214, 143, 0.3)',
                  borderRadius: '12px',
                  padding: '18px',
                  animation: 'fadeIn 0.3s ease',
                }}
              >
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '14px' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <ShieldCheck size={20} color="var(--brand-emerald)" />
                    <span style={{ fontWeight: 800, fontSize: '1rem', color: 'var(--brand-emerald)' }}>
                      Pasaje Autenticado Exitosamente
                    </span>
                  </div>
                  <span className="badge badge-emerald" style={{ fontWeight: 700 }}>
                    {flightResult.confidence} Confianza
                  </span>
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '12px', marginBottom: '14px' }}>
                  <div style={{ background: 'rgba(255,255,255,0.02)', padding: '10px', borderRadius: '8px', border: '1px solid var(--border-subtle)' }}>
                    <div style={{ fontSize: '0.68rem', color: 'var(--text-muted)', textTransform: 'uppercase' }}>Aerolínea & Vuelo</div>
                    <div style={{ fontSize: '0.88rem', fontWeight: 700, color: 'var(--text-primary)', marginTop: '2px' }}>
                      {flightResult.airline} {flightResult.flightNumber}
                    </div>
                  </div>

                  <div style={{ background: 'rgba(255,255,255,0.02)', padding: '10px', borderRadius: '8px', border: '1px solid var(--border-subtle)' }}>
                    <div style={{ fontSize: '0.68rem', color: 'var(--text-muted)', textTransform: 'uppercase' }}>Ruta IATA</div>
                    <div style={{ fontSize: '0.88rem', fontWeight: 700, color: 'var(--brand-cyan)', marginTop: '2px' }}>
                      {flightResult.originIata} ➔ {flightResult.destinationIata}
                    </div>
                  </div>

                  <div style={{ background: 'rgba(255,255,255,0.02)', padding: '10px', borderRadius: '8px', border: '1px solid var(--border-subtle)' }}>
                    <div style={{ fontSize: '0.68rem', color: 'var(--text-muted)', textTransform: 'uppercase' }}>Fecha Salida</div>
                    <div style={{ fontSize: '0.88rem', fontWeight: 700, color: 'var(--text-primary)', marginTop: '2px' }}>
                      {flightResult.departureDate} (Asiento {flightResult.seat})
                    </div>
                  </div>

                  <div style={{ background: 'rgba(255,255,255,0.02)', padding: '10px', borderRadius: '8px', border: '1px solid var(--border-subtle)' }}>
                    <div style={{ fontSize: '0.68rem', color: 'var(--text-muted)', textTransform: 'uppercase' }}>Franquicia Equipaje</div>
                    <div style={{ fontSize: '0.88rem', fontWeight: 800, color: 'var(--brand-emerald)', marginTop: '2px' }}>
                      {flightResult.baggageAllowanceKg} KG Bodega
                    </div>
                  </div>
                </div>

                <div style={{ fontSize: '0.78rem', color: 'var(--text-secondary)', marginBottom: '14px', lineHeight: '1.4' }}>
                  <strong>Dictamen Forense:</strong> {flightResult.notes}
                </div>

                <div
                  style={{
                    background: 'rgba(0, 0, 0, 0.4)',
                    padding: '8px 12px',
                    borderRadius: '6px',
                    fontSize: '0.7rem',
                    fontFamily: 'monospace',
                    color: 'var(--brand-cyan)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    marginBottom: '16px',
                    border: '1px solid rgba(0, 207, 255, 0.2)',
                  }}
                >
                  <span>Atestación Hash: {flightResult.attestationHash}</span>
                  <span style={{ color: 'var(--text-muted)', fontSize: '0.65rem' }}>{flightResult.modelUsed}</span>
                </div>

                <div style={{ display: 'flex', gap: '10px' }}>
                  <button
                    type="button"
                    onClick={handleApplyVerifiedFlight}
                    className="btn btn-primary"
                    style={{ flex: 1, padding: '12px', justifyContent: 'center', fontWeight: 700 }}
                  >
                    <Check size={16} /> Certificar y Publicar Ruta Verificada On-Chain
                  </button>
                  <button
                    type="button"
                    onClick={() => setFlightResult(null)}
                    className="btn btn-ghost"
                  >
                    <RefreshCw size={16} /> Reintentar
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      )}
    </DashboardLayout>
  );
}
