'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { calculateOrderFees } from '@/lib/constants/fees';
import { useAuth } from '@/context/AuthContext';
import {
  Plane, Search, Filter, MapPin, Weight, Calendar, Star, Plus,
  ChevronRight, ArrowRight, Clock, Shield, CheckCircle2, X
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
    tags: ['Verificado', 'Puntual', 'Amigable'],
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
    tags: ['Verificado', 'Rápido'],
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
    tags: ['Verificada', 'Insumos médicos OK', 'Superhero'],
  },
];

export default function TripsPage() {
  const router = useRouter();
  const { role } = useAuth();
  const [search, setSearch] = useState('');
  const [selectedTrip, setSelectedTrip] = useState<typeof TRIPS_DATA[0] | null>(null);
  const [orderKg, setOrderKg] = useState(2);
  const [orderAmount, setOrderAmount] = useState(200);
  const [submittingOrder, setSubmittingOrder] = useState(false);
  const [orderCreatedNotice, setOrderCreatedNotice] = useState<string | null>(null);

  const fee = calculateOrderFees(orderAmount);

  const handleCreateOrder = async () => {
    setSubmittingOrder(true);
    await new Promise(r => setTimeout(r, 1000));
    const randomTx = '0x' + Array.from({ length: 64 }, () => Math.floor(Math.random() * 16).toString(16)).join('');
    setSubmittingOrder(false);
    setOrderCreatedNotice(randomTx);
    setTimeout(() => {
      router.push('/dashboard/orders');
    }, 1800);
  };

  const filtered = TRIPS_DATA.filter(t =>
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
        <Link href="/dashboard/my-trips/new" className="btn btn-primary" style={{ display: 'inline-flex', alignItems: 'center', gap: '8px' }}>
          <Plus size={16} /> Publicar mi Ruta
        </Link>
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
    </DashboardLayout>
  );
}
