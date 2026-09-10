'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { Plane, Plus, Calendar, Weight, Camera, CheckCircle2, Package, ArrowRight, MapPin, TrendingUp, DollarSign, Edit2, X } from 'lucide-react';

export interface TripItem {
  id: string;
  from: string;
  fromFlag: string;
  fromCountry: string;
  to: string;
  toFlag: string;
  toCountry: string;
  departure: string;
  arrival: string;
  totalKg: number;
  availableKg: number;
  reservedKg: number;
  airline: string;
  status: string;
  pendingOrders: number;
  earnings: number;
}

const DEFAULT_TRIPS: TripItem[] = [
  {
    id: 'TR-001',
    from: 'Madrid', fromFlag: '🇪🇸', fromCountry: 'España',
    to: 'La Paz', toFlag: '🇧🇴', toCountry: 'Bolivia',
    departure: '2026-09-12', arrival: '2026-09-13',
    totalKg: 23, availableKg: 14.5, reservedKg: 8.5,
    airline: 'Iberia IB 6825',
    status: 'scheduled',
    pendingOrders: 3,
    earnings: 84.5,
  },
  {
    id: 'TR-002',
    from: 'La Paz', fromFlag: '🇧🇴', fromCountry: 'Bolivia',
    to: 'Madrid', toFlag: '🇪🇸', toCountry: 'España',
    departure: '2026-09-20', arrival: '2026-09-21',
    totalKg: 23, availableKg: 23, reservedKg: 0,
    airline: 'Iberia IB 6826',
    status: 'scheduled',
    pendingOrders: 0,
    earnings: 0,
  },
];

export default function MyTripsPage() {
  const [trips, setTrips] = useState<TripItem[]>(DEFAULT_TRIPS);
  const [actionNotice, setActionNotice] = useState<string | null>(null);
  const [editingTrip, setEditingTrip] = useState<TripItem | null>(null);

  useEffect(() => {
    if (typeof window !== 'undefined') {
      const saved = localStorage.getItem('ayni_my_trips');
      if (saved) {
        try {
          const parsed = JSON.parse(saved);
          if (Array.isArray(parsed) && parsed.length > 0) {
            setTrips(parsed);
          }
        } catch (e) {
          // ignore
        }
      }
    }
  }, []);

  const handleUploadPhoto = (id: string) => {
    setActionNotice(`📸 Foto de equipaje para el itinerario #${id} subida y auditada por IA.`);
    setTimeout(() => setActionNotice(null), 4000);
  };

  const handleSaveEdit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingTrip) return;
    const updated = trips.map(t => t.id === editingTrip.id ? editingTrip : t);
    setTrips(updated);
    if (typeof window !== 'undefined') {
      localStorage.setItem('ayni_my_trips', JSON.stringify(updated));
    }
    setEditingTrip(null);
    setActionNotice('Itinerario actualizado con éxito.');
    setTimeout(() => setActionNotice(null), 3000);
  };

  return (
    <DashboardLayout>
      <div className="sc-perspective-container">
      <div className="page-header">
        <div className="page-title-group">
          <div className="page-title">Mis Viajes y Rutas</div>
          <div className="page-subtitle">Gestiona tu itinerario, capacidad disponible y encargos activos</div>
        </div>
        <Link
          href="/dashboard/my-trips/new"
          className="btn btn-primary"
          style={{ display: 'inline-flex', alignItems: 'center', gap: '8px', textDecoration: 'none' }}
        >
          <Plus size={16} /> Publicar Nuevo Viaje
        </Link>
      </div>

      {actionNotice && (
        <div className="alert alert-success" style={{ marginBottom: '20px' }}>
          <CheckCircle2 size={16} /> {actionNotice}
        </div>
      )}

      {/* Earnings Summary */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '14px', marginBottom: '28px' }}>
        {[
          { label: 'Ganancias totales', value: '$1,240', color: 'var(--brand-gold)', icon: TrendingUp, iconBg: 'rgba(245,166,35,0.15)', glow: 'rgba(245,166,35,0.08)' },
          { label: 'Este mes', value: '$342', color: 'var(--brand-cyan)', icon: DollarSign, iconBg: 'rgba(0,207,255,0.15)', glow: 'rgba(0,207,255,0.08)' },
          { label: 'Encargos completados', value: '38', color: 'var(--brand-emerald)', icon: CheckCircle2, iconBg: 'rgba(0,214,143,0.15)', glow: 'rgba(0,214,143,0.08)' },
          { label: 'Viajes realizados', value: '18', color: 'var(--brand-purple)', icon: Plane, iconBg: 'rgba(155,114,255,0.15)', glow: 'rgba(155,114,255,0.08)' },
        ].map((s, i) => (
          <div key={i} className="stat-card card-kinetic sc-card-depth" style={{ '--stat-glow': s.glow } as React.CSSProperties}>
            <div className="stat-icon" style={{ background: s.iconBg }}>
              <s.icon size={20} color={s.color} />
            </div>
            <div>
              <div className="stat-value" style={{ color: s.color }}>{s.value}</div>
              <div className="stat-label">{s.label}</div>
            </div>
          </div>
        ))}
      </div>

      {/* Trip Cards */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: '18px' }}>
        {trips.map(trip => (
          <div key={trip.id} className="card card-glow-cyan card-kinetic sc-card-depth" style={{ padding: '24px' }}>
            {/* Trip Header */}
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '16px', gap: '12px', flexWrap: 'wrap' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                <div style={{ width: 44, height: 44, borderRadius: 12, background: 'rgba(0,207,255,0.1)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--brand-cyan)' }}>
                  <Plane size={22} />
                </div>
                <div>
                  <div style={{ fontWeight: 700, fontSize: '1rem' }}>{trip.airline}</div>
                  <div style={{ fontSize: '0.78rem', color: 'var(--text-muted)' }}>#{trip.id}</div>
                </div>
              </div>
              <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
                {trip.pendingOrders > 0 && (
                  <span className="badge badge-gold">{trip.pendingOrders} encargos</span>
                )}
                <span className="badge badge-cyan">Programado</span>
              </div>
            </div>

            {/* Route */}
            <div style={{ display: 'flex', alignItems: 'center', gap: '16px', marginBottom: '18px' }}>
              <div>
                <div style={{ fontSize: '1.4rem', fontWeight: 800 }}>{trip.fromFlag} {trip.from}</div>
                <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>{trip.fromCountry}</div>
              </div>
              <div style={{ flex: 1, display: 'flex', alignItems: 'center', gap: '8px' }}>
                <div style={{ flex: 1, height: 1, background: 'linear-gradient(90deg, var(--brand-cyan), transparent)', opacity: 0.4 }} />
                <Plane size={20} color="var(--brand-cyan)" />
                <div style={{ flex: 1, height: 1, background: 'linear-gradient(90deg, transparent, var(--brand-cyan))', opacity: 0.4 }} />
              </div>
              <div style={{ textAlign: 'right' }}>
                <div style={{ fontSize: '1.4rem', fontWeight: 800 }}>{trip.to} {trip.toFlag}</div>
                <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>{trip.toCountry}</div>
              </div>
            </div>

            {/* Metrics */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(140px, 1fr))', gap: '12px', marginBottom: '18px' }}>
              {[
                { label: 'Salida', value: trip.departure, color: 'var(--brand-gold)' },
                { label: 'Capacidad total', value: `${trip.totalKg} kg`, color: 'var(--text-primary)' },
                { label: 'Espacio libre', value: `${trip.availableKg} kg`, color: 'var(--brand-cyan)' },
                { label: 'Ganancia estimada', value: `$${trip.earnings}`, color: 'var(--brand-emerald)' },
              ].map((m, i) => (
                <div key={i} style={{ background: 'rgba(255,255,255,0.03)', borderRadius: 8, padding: '12px', textAlign: 'center' }}>
                  <div style={{ fontSize: '0.65rem', color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: '4px' }}>{m.label}</div>
                  <div style={{ fontWeight: 700, color: m.color, fontSize: '0.95rem' }}>{m.value}</div>
                </div>
              ))}
            </div>

            {/* Capacity Bar */}
            <div style={{ marginBottom: '18px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.75rem', color: 'var(--text-muted)', marginBottom: '6px' }}>
                <span>Capacidad ocupada: {trip.reservedKg} kg de {trip.totalKg} kg</span>
                <span style={{ color: 'var(--brand-cyan)' }}>{((trip.reservedKg / trip.totalKg) * 100).toFixed(0)}% usado</span>
              </div>
              <div className="progress-bar">
                <div className="progress-fill" style={{ width: `${(trip.reservedKg / trip.totalKg) * 100}%` }} />
              </div>
            </div>

            <div style={{ display: 'flex', gap: '10px', flexWrap: 'wrap' }}>
              <Link
                href="/dashboard/orders"
                className="btn btn-primary btn-sm"
                style={{ display: 'inline-flex', alignItems: 'center', gap: '6px', textDecoration: 'none' }}
              >
                <Package size={14} /> Ver Encargos ({trip.pendingOrders})
              </Link>
              <button
                type="button"
                onClick={() => handleUploadPhoto(trip.id)}
                className="btn btn-ghost btn-sm"
              >
                <Camera size={14} /> Subir Foto Equipaje
              </button>
              <button
                type="button"
                onClick={() => setEditingTrip(trip)}
                className="btn btn-ghost btn-sm"
              >
                <Edit2 size={14} /> Editar Itinerario
              </button>
            </div>
          </div>
        ))}

        {/* New Trip CTA Card */}
        <Link
          href="/dashboard/my-trips/new"
          style={{
            border: '2px dashed var(--border-default)',
            borderRadius: 16,
            padding: '40px',
            textAlign: 'center',
            cursor: 'pointer',
            transition: 'all 0.2s',
            color: 'var(--text-muted)',
            textDecoration: 'none',
            display: 'block',
          }}
          className="card-kinetic"
        >
          <Plane size={32} style={{ marginBottom: 12, opacity: 0.6, color: 'var(--brand-cyan)' }} />
          <div style={{ fontWeight: 700, color: 'var(--text-primary)', marginBottom: '4px', fontSize: '1.05rem' }}>
            ¿Tienes otro viaje próximo?
          </div>
          <div style={{ fontSize: '0.85rem', color: 'var(--text-secondary)' }}>
            Publica tu ruta y rentabiliza el equipaje disponible
          </div>
        </Link>
      </div>

      {/* Edit Trip Modal */}
      {editingTrip && (
        <div className="modal-overlay" onClick={() => setEditingTrip(null)}>
          <div className="modal-content" onClick={e => e.stopPropagation()}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
              <h3 style={{ fontSize: '1.15rem', fontWeight: 700, margin: 0 }}>Editar Itinerario #{editingTrip.id}</h3>
              <button type="button" onClick={() => setEditingTrip(null)} style={{ background: 'transparent', border: 'none', color: 'var(--text-muted)', cursor: 'pointer' }}>
                <X size={18} />
              </button>
            </div>

            <form onSubmit={handleSaveEdit} style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
              <div className="input-group">
                <label className="input-label">Aerolínea / N° Vuelo</label>
                <input
                  type="text"
                  required
                  value={editingTrip.airline}
                  onChange={e => setEditingTrip({ ...editingTrip, airline: e.target.value })}
                  className="input"
                />
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
                <div className="input-group">
                  <label className="input-label">Kilos Totales</label>
                  <input
                    type="number"
                    min={5}
                    value={editingTrip.totalKg}
                    onChange={e => setEditingTrip({ ...editingTrip, totalKg: Number(e.target.value) })}
                    className="input"
                  />
                </div>
                <div className="input-group">
                  <label className="input-label">Kilos Libres</label>
                  <input
                    type="number"
                    min={1}
                    value={editingTrip.availableKg}
                    onChange={e => setEditingTrip({ ...editingTrip, availableKg: Number(e.target.value) })}
                    className="input"
                  />
                </div>
              </div>

              <div style={{ display: 'flex', gap: '10px', marginTop: '12px' }}>
                <button type="button" onClick={() => setEditingTrip(null)} className="btn btn-ghost" style={{ flex: 1 }}>
                  Cancelar
                </button>
                <button type="submit" className="btn btn-primary" style={{ flex: 1 }}>
                  Guardar Cambios
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
      </div>
    </DashboardLayout>
  );
}
