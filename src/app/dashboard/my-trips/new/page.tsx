'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { useAuth } from '@/context/AuthContext';
import { isSupabaseConfigured } from '@/lib/supabase/client';
import { sanitizeText, sanitizeAmount } from '@/lib/utils/sanitizer';
import { Plane, ArrowLeft, CheckCircle2, Sparkles, AlertTriangle, Loader2 } from 'lucide-react';
import Link from 'next/link';

export default function NewTripPage() {
  const router = useRouter();
  const { user } = useAuth();

  const [originCity, setOriginCity] = useState('');
  const [originCountry, setOriginCountry] = useState('España');
  const [destCity, setDestCity] = useState('');
  const [destCountry, setDestCountry] = useState('Bolivia');
  const [departure, setDeparture] = useState('');
  const [arrival, setArrival] = useState('');
  const [availableKg, setAvailableKg] = useState('20');
  const [pricePerKg, setPricePerKg] = useState('15');
  const [flightNumber, setFlightNumber] = useState('');

  const [submitted, setSubmitted] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg(null);
    setSubmitting(true);

    if (!originCity.trim() || !destCity.trim()) {
      setErrorMsg('Las ciudades de origen y destino son obligatorias.');
      setSubmitting(false);
      return;
    }
    if (!departure || !arrival) {
      setErrorMsg('Las fechas de salida y llegada son obligatorias.');
      setSubmitting(false);
      return;
    }

    const payload = {
      traveler_id: user?.id,
      origin_city: sanitizeText(originCity, 100),
      origin_country: sanitizeText(originCountry, 60),
      destination_city: sanitizeText(destCity, 100),
      destination_country: sanitizeText(destCountry, 60),
      departure_date: departure,
      arrival_date: arrival,
      available_kg: sanitizeAmount(availableKg, 0.1, 200),
      price_per_kg_usd: sanitizeAmount(pricePerKg, 1, 500),
      flight_number: sanitizeText(flightNumber, 30) || null,
    };

    if (isSupabaseConfigured && user?.id) {
      try {
        const res = await fetch('/api/trips', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(payload),
        });
        if (res.ok) {
          setSubmitted(true);
          setSubmitting(false);
          setTimeout(() => router.push('/dashboard/my-trips'), 2000);
          return;
        }
        const result = await res.json();
        setErrorMsg(result.error || 'Error al crear viaje');
      } catch (err) {
        console.warn('API error:', err);
      }
    }

    // Fallback
    const existing = JSON.parse(localStorage.getItem('ayni_my_trips') || '[]');
    existing.push({ id: `TR-${Date.now().toString(36)}`, ...payload, status: 'active' });
    localStorage.setItem('ayni_my_trips', JSON.stringify(existing));
    setSubmitted(true);
    setSubmitting(false);
    setTimeout(() => router.push('/dashboard/my-trips'), 2000);
  };

  if (submitted) {
    return (
      <DashboardLayout>
        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', minHeight: '50vh', gap: '16px', textAlign: 'center' }}>
          <div style={{ width: 64, height: 64, borderRadius: '50%', background: 'rgba(0,214,143,0.15)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <CheckCircle2 size={32} color="var(--brand-emerald)" />
          </div>
          <h2 style={{ fontWeight: 700, fontSize: '1.3rem' }}>¡Viaje publicado!</h2>
          <p style={{ color: 'var(--text-secondary)' }}>Los compradores ya pueden ver tu ruta y enviarte encargos.</p>
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout>
      <div className="page-header" style={{ marginBottom: '24px' }}>
        <div className="page-title-group">
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '4px' }}>
            <Link href="/dashboard/my-trips" className="btn btn-ghost btn-sm" style={{ padding: '4px 8px' }}><ArrowLeft size={16} /></Link>
            <div className="page-title">Publicar Nuevo Viaje</div>
            <span className="badge badge-cyan"><Sparkles size={11} /> Itinerario</span>
          </div>
          <div className="page-subtitle">Publica tu viaje para recibir encargos y monetizar tu equipaje disponible.</div>
        </div>
      </div>

      {errorMsg && (
        <div className="alert alert-error" style={{ marginBottom: '20px' }}><AlertTriangle size={16} /> {errorMsg}</div>
      )}

      <div className="card" style={{ padding: '28px', maxWidth: '640px' }}>
        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
          {/* Origin */}
          <fieldset style={{ border: '1px solid var(--border-subtle)', borderRadius: '12px', padding: '16px' }}>
            <legend style={{ fontSize: '0.85rem', fontWeight: 700, color: 'var(--brand-cyan)', padding: '0 8px' }}>✈️ Origen</legend>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
              <div className="input-group">
                <label className="input-label">Ciudad *</label>
                <input type="text" required value={originCity} onChange={e => setOriginCity(e.target.value)} className="input" placeholder="Madrid" />
              </div>
              <div className="input-group">
                <label className="input-label">País *</label>
                <input type="text" required value={originCountry} onChange={e => setOriginCountry(e.target.value)} className="input" />
              </div>
            </div>
          </fieldset>

          {/* Destination */}
          <fieldset style={{ border: '1px solid var(--border-subtle)', borderRadius: '12px', padding: '16px' }}>
            <legend style={{ fontSize: '0.85rem', fontWeight: 700, color: 'var(--brand-gold)', padding: '0 8px' }}>📍 Destino</legend>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
              <div className="input-group">
                <label className="input-label">Ciudad *</label>
                <input type="text" required value={destCity} onChange={e => setDestCity(e.target.value)} className="input" placeholder="La Paz" />
              </div>
              <div className="input-group">
                <label className="input-label">País *</label>
                <input type="text" required value={destCountry} onChange={e => setDestCountry(e.target.value)} className="input" />
              </div>
            </div>
          </fieldset>

          {/* Dates */}
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
            <div className="input-group">
              <label className="input-label">Fecha Salida *</label>
              <input type="date" required value={departure} onChange={e => setDeparture(e.target.value)} className="input" />
            </div>
            <div className="input-group">
              <label className="input-label">Fecha Llegada *</label>
              <input type="date" required value={arrival} onChange={e => setArrival(e.target.value)} className="input" />
            </div>
          </div>

          {/* Capacity & Pricing */}
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '12px' }}>
            <div className="input-group">
              <label className="input-label">Kg Disponibles</label>
              <input type="number" min="0.1" step="0.1" value={availableKg} onChange={e => setAvailableKg(e.target.value)} className="input" />
            </div>
            <div className="input-group">
              <label className="input-label">Precio $/kg</label>
              <input type="number" min="1" step="0.5" value={pricePerKg} onChange={e => setPricePerKg(e.target.value)} className="input" />
            </div>
            <div className="input-group">
              <label className="input-label">Nro. Vuelo</label>
              <input type="text" value={flightNumber} onChange={e => setFlightNumber(e.target.value)} className="input" placeholder="IB 6825" />
            </div>
          </div>

          <button type="submit" disabled={submitting} className="btn btn-primary" style={{ marginTop: '8px', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px' }}>
            {submitting ? <Loader2 size={16} style={{ animation: 'spin 1s linear infinite' }} /> : <Plane size={16} />}
            {submitting ? 'Publicando...' : 'Publicar Viaje'}
          </button>
        </form>
      </div>
    </DashboardLayout>
  );
}
