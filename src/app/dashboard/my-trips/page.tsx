'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { useAuth } from '@/context/AuthContext';
import { getSupabaseBrowserClient, isSupabaseConfigured } from '@/lib/supabase/client';
import {
  Plane, Plus, Calendar, Edit2, Trash2, CheckCircle2, Package, MapPin,
  DollarSign, X, Save, Loader2, AlertTriangle, Sparkles
} from 'lucide-react';

interface TripItem {
  id: string;
  origin_city: string;
  origin_country: string;
  destination_city: string;
  destination_country: string;
  departure_date: string;
  arrival_date: string;
  available_kg: number;
  price_per_kg_usd: number;
  flight_number?: string;
  status: string;
}

export default function MyTripsPage() {
  const { user } = useAuth();
  const [trips, setTrips] = useState<TripItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [notice, setNotice] = useState<string | null>(null);
  const [editTrip, setEditTrip] = useState<TripItem | null>(null);
  const [deleteId, setDeleteId] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);

  // Edit form state
  const [eOrigin, setEOrigin] = useState('');
  const [eOriginCountry, setEOriginCountry] = useState('');
  const [eDest, setEDest] = useState('');
  const [eDestCountry, setEDestCountry] = useState('');
  const [eDeparture, setEDeparture] = useState('');
  const [eArrival, setEArrival] = useState('');
  const [eKg, setEKg] = useState('');
  const [ePrice, setEPrice] = useState('');
  const [eFlight, setEFlight] = useState('');

  useEffect(() => { loadTrips(); }, [user]);

  async function loadTrips() {
    if (!user?.id) { setLoading(false); return; }

    if (isSupabaseConfigured) {
      try {
        const supabase = getSupabaseBrowserClient();
        const { data } = await supabase
          .from('trips')
          .select('*')
          .eq('traveler_id', user.id)
          .order('departure_date', { ascending: true });
        if (data) { setTrips(data); setLoading(false); return; }
      } catch (e) { console.warn(e); }
    }

    // Fallback
    const saved = localStorage.getItem('ayni_my_trips');
    if (saved) { try { setTrips(JSON.parse(saved)); } catch {} }
    setLoading(false);
  }

  const openEdit = (t: TripItem) => {
    setEditTrip(t);
    setEOrigin(t.origin_city);
    setEOriginCountry(t.origin_country);
    setEDest(t.destination_city);
    setEDestCountry(t.destination_country);
    setEDeparture(t.departure_date);
    setEArrival(t.arrival_date);
    setEKg(String(t.available_kg));
    setEPrice(String(t.price_per_kg_usd));
    setEFlight(t.flight_number || '');
  };

  const handleEditSave = async () => {
    if (!editTrip) return;
    setSaving(true);

    const payload = {
      id: editTrip.id,
      origin_city: eOrigin.trim(),
      origin_country: eOriginCountry.trim(),
      destination_city: eDest.trim(),
      destination_country: eDestCountry.trim(),
      departure_date: eDeparture,
      arrival_date: eArrival,
      available_kg: Math.max(0.1, parseFloat(eKg) || 20),
      price_per_kg_usd: Math.max(1, parseFloat(ePrice) || 15),
      flight_number: eFlight.trim() || undefined,
    };

    if (isSupabaseConfigured) {
      try {
        const res = await fetch('/api/trips', {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(payload),
        });
        if (res.ok) {
          const { trip } = await res.json();
          setTrips(prev => prev.map(t => t.id === editTrip.id ? { ...t, ...trip } : t));
          setNotice('Viaje actualizado.');
          setEditTrip(null);
          setSaving(false);
          setTimeout(() => setNotice(null), 3000);
          return;
        }
      } catch (e) { console.warn(e); }
    }

    setTrips(prev => prev.map(t => t.id === editTrip.id ? { ...t, ...payload } : t));
    setNotice('Viaje actualizado localmente.');
    setEditTrip(null);
    setSaving(false);
    setTimeout(() => setNotice(null), 3000);
  };

  const handleDelete = async () => {
    if (!deleteId) return;
    setSaving(true);

    if (isSupabaseConfigured) {
      try {
        const res = await fetch(`/api/trips?id=${deleteId}`, { method: 'DELETE' });
        if (res.ok) {
          setTrips(prev => prev.filter(t => t.id !== deleteId));
          setNotice('Viaje eliminado.');
          setDeleteId(null);
          setSaving(false);
          setTimeout(() => setNotice(null), 3000);
          return;
        }
        const result = await res.json();
        setNotice(result.error || 'Error al eliminar');
        setDeleteId(null);
        setSaving(false);
        setTimeout(() => setNotice(null), 3000);
        return;
      } catch (e) { console.warn(e); }
    }

    setTrips(prev => prev.filter(t => t.id !== deleteId));
    setNotice('Viaje eliminado.');
    setDeleteId(null);
    setSaving(false);
    setTimeout(() => setNotice(null), 3000);
  };

  const getCountryFlag = (country: string) => {
    const flags: Record<string, string> = { 'Bolivia': '🇧🇴', 'España': '🇪🇸', 'Argentina': '🇦🇷', 'EEUU': '🇺🇸', 'Brasil': '🇧🇷', 'Chile': '🇨🇱', 'Colombia': '🇨🇴', 'Peru': '🇵🇪', 'Mexico': '🇲🇽' };
    return flags[country] || '🌍';
  };

  return (
    <DashboardLayout>
      <div className="page-header" style={{ marginBottom: '24px' }}>
        <div className="page-title-group">
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '4px', flexWrap: 'wrap' }}>
            <div className="page-title">Mis Viajes</div>
            <span className="badge badge-cyan"><Sparkles size={11} /> Itinerarios</span>
            <span className="badge badge-gold" style={{ fontSize: '0.7rem' }}>{trips.length} viajes</span>
          </div>
          <div className="page-subtitle">Publica tus viajes para recibir encargos de compradores.</div>
        </div>
        <Link href="/dashboard/my-trips/new" className="btn btn-primary" style={{ display: 'inline-flex', alignItems: 'center', gap: '6px' }}>
          <Plus size={16} /> Nuevo Viaje
        </Link>
      </div>

      {notice && (
        <div className="alert alert-success" style={{ marginBottom: '16px' }}><CheckCircle2 size={16} /> {notice}</div>
      )}

      {loading ? (
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', minHeight: '30vh', gap: '10px', color: 'var(--text-muted)' }}>
          <Loader2 size={20} style={{ animation: 'spin 1s linear infinite' }} /> Cargando viajes...
        </div>
      ) : trips.length === 0 ? (
        <div className="card" style={{ padding: '40px', textAlign: 'center' }}>
          <Plane size={40} color="var(--text-muted)" style={{ marginBottom: '12px' }} />
          <h3 style={{ fontWeight: 700, fontSize: '1.1rem', marginBottom: '8px' }}>No tienes viajes publicados</h3>
          <p style={{ color: 'var(--text-secondary)', fontSize: '0.88rem', marginBottom: '16px' }}>
            Publica tu primer viaje y comienza a recibir encargos.
          </p>
          <Link href="/dashboard/my-trips/new" className="btn btn-primary" style={{ display: 'inline-flex', alignItems: 'center', gap: '6px' }}>
            <Plus size={16} /> Publicar Viaje
          </Link>
        </div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
          {trips.map(t => (
            <div key={t.id} className="card card-kinetic" style={{ padding: '20px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '12px' }}>
                {/* Route Info */}
                <div style={{ flex: 1, minWidth: '200px' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '8px' }}>
                    <span style={{ fontSize: '1.2rem' }}>{getCountryFlag(t.origin_country)}</span>
                    <span style={{ fontWeight: 700, fontSize: '0.95rem' }}>{t.origin_city}</span>
                    <div style={{ width: '40px', height: '2px', background: 'linear-gradient(90deg, var(--brand-cyan), var(--brand-gold))', borderRadius: '1px' }} />
                    <span style={{ fontWeight: 700, fontSize: '0.95rem' }}>{t.destination_city}</span>
                    <span style={{ fontSize: '1.2rem' }}>{getCountryFlag(t.destination_country)}</span>
                  </div>
                  <div style={{ display: 'flex', gap: '16px', flexWrap: 'wrap', fontSize: '0.82rem', color: 'var(--text-secondary)' }}>
                    <span style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                      <Calendar size={13} /> {new Date(t.departure_date).toLocaleDateString('es')} → {new Date(t.arrival_date).toLocaleDateString('es')}
                    </span>
                    {t.flight_number && (
                      <span style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                        <Plane size={13} /> {t.flight_number}
                      </span>
                    )}
                  </div>
                </div>

                {/* Stats */}
                <div style={{ display: 'flex', gap: '16px', alignItems: 'center', flexWrap: 'wrap' }}>
                  <div style={{ textAlign: 'center' }}>
                    <div style={{ fontWeight: 800, fontSize: '1.1rem', color: 'var(--brand-cyan)' }}>{t.available_kg} kg</div>
                    <div style={{ fontSize: '0.7rem', color: 'var(--text-muted)' }}>Disponible</div>
                  </div>
                  <div style={{ textAlign: 'center' }}>
                    <div style={{ fontWeight: 800, fontSize: '1.1rem', color: 'var(--brand-gold)' }}>${t.price_per_kg_usd}</div>
                    <div style={{ fontSize: '0.7rem', color: 'var(--text-muted)' }}>por kg</div>
                  </div>
                  <span className={`badge ${t.status === 'active' ? 'badge-emerald' : t.status === 'completed' ? 'badge-cyan' : 'badge-gold'}`} style={{ fontSize: '0.72rem' }}>
                    {t.status === 'active' ? '✓ Activo' : t.status === 'completed' ? 'Completado' : t.status}
                  </span>
                </div>

                {/* Actions */}
                <div style={{ display: 'flex', gap: '6px' }}>
                  <button type="button" onClick={() => openEdit(t)} className="btn btn-ghost btn-sm" style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                    <Edit2 size={13} /> Editar
                  </button>
                  <button type="button" onClick={() => setDeleteId(t.id)} className="btn btn-ghost btn-sm" style={{ color: 'var(--brand-red)' }}>
                    <Trash2 size={13} />
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Edit Modal */}
      {editTrip && (
        <div className="modal-overlay" onClick={() => setEditTrip(null)}>
          <div className="modal-box" style={{ width: '100%', maxWidth: 520, padding: '28px' }} onClick={e => e.stopPropagation()}>
            <button type="button" onClick={() => setEditTrip(null)} style={{ position: 'absolute', top: 16, right: 16, background: 'transparent', border: 'none', color: 'var(--text-muted)', cursor: 'pointer' }}>
              <X size={18} />
            </button>
            <h3 style={{ fontSize: '1.15rem', fontWeight: 700, marginBottom: '20px' }}>Editar Viaje</h3>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
                <div className="input-group">
                  <label className="input-label">Ciudad Origen</label>
                  <input type="text" value={eOrigin} onChange={e => setEOrigin(e.target.value)} className="input" />
                </div>
                <div className="input-group">
                  <label className="input-label">País Origen</label>
                  <input type="text" value={eOriginCountry} onChange={e => setEOriginCountry(e.target.value)} className="input" />
                </div>
              </div>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
                <div className="input-group">
                  <label className="input-label">Ciudad Destino</label>
                  <input type="text" value={eDest} onChange={e => setEDest(e.target.value)} className="input" />
                </div>
                <div className="input-group">
                  <label className="input-label">País Destino</label>
                  <input type="text" value={eDestCountry} onChange={e => setEDestCountry(e.target.value)} className="input" />
                </div>
              </div>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
                <div className="input-group">
                  <label className="input-label">Fecha Salida</label>
                  <input type="date" value={eDeparture} onChange={e => setEDeparture(e.target.value)} className="input" />
                </div>
                <div className="input-group">
                  <label className="input-label">Fecha Llegada</label>
                  <input type="date" value={eArrival} onChange={e => setEArrival(e.target.value)} className="input" />
                </div>
              </div>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '12px' }}>
                <div className="input-group">
                  <label className="input-label">Kg disponibles</label>
                  <input type="number" min="0.1" step="0.1" value={eKg} onChange={e => setEKg(e.target.value)} className="input" />
                </div>
                <div className="input-group">
                  <label className="input-label">$/kg</label>
                  <input type="number" min="1" step="0.5" value={ePrice} onChange={e => setEPrice(e.target.value)} className="input" />
                </div>
                <div className="input-group">
                  <label className="input-label">Vuelo</label>
                  <input type="text" value={eFlight} onChange={e => setEFlight(e.target.value)} className="input" placeholder="IB 6825" />
                </div>
              </div>
              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '10px', marginTop: '8px' }}>
                <button type="button" onClick={() => setEditTrip(null)} className="btn btn-ghost">Cancelar</button>
                <button type="button" onClick={handleEditSave} disabled={saving} className="btn btn-primary" style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                  {saving ? <Loader2 size={14} style={{ animation: 'spin 1s linear infinite' }} /> : <Save size={14} />}
                  Guardar
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Delete Confirmation */}
      {deleteId && (
        <div className="modal-overlay" onClick={() => setDeleteId(null)}>
          <div className="modal-box" style={{ width: '100%', maxWidth: 400, padding: '28px', textAlign: 'center' }} onClick={e => e.stopPropagation()}>
            <AlertTriangle size={36} color="var(--brand-red)" style={{ marginBottom: '12px' }} />
            <h3 style={{ fontSize: '1.1rem', fontWeight: 700, marginBottom: '8px' }}>¿Eliminar viaje?</h3>
            <p style={{ color: 'var(--text-secondary)', fontSize: '0.88rem', marginBottom: '20px' }}>
              No se puede eliminar si tiene órdenes activas asociadas.
            </p>
            <div style={{ display: 'flex', justifyContent: 'center', gap: '10px' }}>
              <button type="button" onClick={() => setDeleteId(null)} className="btn btn-ghost">Cancelar</button>
              <button type="button" onClick={handleDelete} disabled={saving} className="btn btn-primary" style={{ background: 'var(--brand-red)' }}>
                {saving ? 'Eliminando...' : 'Sí, Eliminar'}
              </button>
            </div>
          </div>
        </div>
      )}
    </DashboardLayout>
  );
}
