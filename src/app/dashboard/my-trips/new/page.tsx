'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { sanitizeText, sanitizeAmount } from '@/lib/utils/sanitizer';
import { Plane, Calendar, Weight, ArrowRight, ArrowLeft, CheckCircle2, DollarSign, Sparkles } from 'lucide-react';
import Link from 'next/link';

export default function NewTripPage() {
  const router = useRouter();
  const [originCity, setOriginCity] = useState('');
  const [originCountry, setOriginCountry] = useState('Bolivia');
  const [destCity, setDestCity] = useState('');
  const [destCountry, setDestCountry] = useState('España');
  const [depDate, setDepDate] = useState('');
  const [arrDate, setArrDate] = useState('');
  const [flightNumber, setFlightNumber] = useState('');
  const [availableKg, setAvailableKg] = useState(10);
  const [pricePerKg, setPricePerKg] = useState(15);
  const [submitted, setSubmitted] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    const cleanOrigin = sanitizeText(originCity, 60);
    const cleanDest = sanitizeText(destCity, 60);

    const newTrip = {
      id: `TR-${Date.now().toString().slice(-3)}`,
      from: cleanOrigin || 'Madrid',
      fromFlag: '✈️',
      fromCountry: sanitizeText(originCountry, 40) || 'Origen',
      to: cleanDest || 'La Paz',
      toFlag: '📍',
      toCountry: sanitizeText(destCountry, 40) || 'Destino',
      departure: depDate || '2026-10-01',
      arrival: arrDate || '2026-10-02',
      totalKg: Number(availableKg),
      availableKg: Number(availableKg),
      reservedKg: 0,
      airline: sanitizeText(flightNumber, 50) || 'Aerolínea Internacional',
      status: 'scheduled',
      pendingOrders: 0,
      earnings: 0,
    };

    if (typeof window !== 'undefined') {
      try {
        const saved = localStorage.getItem('ayni_my_trips');
        const existing = saved ? JSON.parse(saved) : [];
        const updated = [newTrip, ...(Array.isArray(existing) ? existing : [])];
        localStorage.setItem('ayni_my_trips', JSON.stringify(updated));
      } catch (err) {
        console.error('Error saving trip:', err);
      }
    }

    setSubmitted(true);
    setTimeout(() => {
      router.push('/dashboard/my-trips');
    }, 1000);
  };

  return (
    <DashboardLayout>
      <div style={{ maxWidth: '680px', margin: '0 auto' }}>
        <Link
          href="/dashboard/my-trips"
          style={{ display: 'inline-flex', alignItems: 'center', gap: '6px', color: 'var(--text-muted)', fontSize: '0.85rem', textDecoration: 'none', marginBottom: '16px' }}
        >
          <ArrowLeft size={16} /> Volver a Mis Viajes
        </Link>

        <div className="page-header" style={{ marginBottom: '24px' }}>
          <div className="page-title-group">
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '4px' }}>
              <div className="page-title">Publicar Nuevo Itinerario</div>
              <span className="badge badge-cyan">
                <Sparkles size={11} /> Monetiza tu Maleta
              </span>
            </div>
            <div className="page-subtitle">
              Declara los kilos disponibles de tu equipaje para transportar encargos y compras a pie.
            </div>
          </div>
        </div>

        {submitted && (
          <div className="alert alert-success" style={{ marginBottom: '24px' }}>
            <CheckCircle2 size={16} /> ¡Itinerario publicado con éxito en la red AYNI! Redirigiendo...
          </div>
        )}

        <div className="card" style={{ padding: '32px' }}>
          <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '18px' }}>
            {/* Origin & Destination */}
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
              <div className="input-group">
                <label className="input-label">Ciudad de Origen *</label>
                <input
                  type="text"
                  required
                  placeholder="Ej: Madrid"
                  value={originCity}
                  onChange={e => setOriginCity(e.target.value)}
                  className="input"
                />
              </div>
              <div className="input-group">
                <label className="input-label">País de Origen *</label>
                <input
                  type="text"
                  required
                  placeholder="Ej: España"
                  value={originCountry}
                  onChange={e => setOriginCountry(e.target.value)}
                  className="input"
                />
              </div>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
              <div className="input-group">
                <label className="input-label">Ciudad de Destino *</label>
                <input
                  type="text"
                  required
                  placeholder="Ej: La Paz"
                  value={destCity}
                  onChange={e => setDestCity(e.target.value)}
                  className="input"
                />
              </div>
              <div className="input-group">
                <label className="input-label">País de Destino *</label>
                <input
                  type="text"
                  required
                  placeholder="Ej: Bolivia"
                  value={destCountry}
                  onChange={e => setDestCountry(e.target.value)}
                  className="input"
                />
              </div>
            </div>

            {/* Dates */}
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
              <div className="input-group">
                <label className="input-label">Fecha de Salida *</label>
                <input
                  type="date"
                  required
                  value={depDate}
                  onChange={e => setDepDate(e.target.value)}
                  className="input"
                />
              </div>
              <div className="input-group">
                <label className="input-label">Fecha de Llegada *</label>
                <input
                  type="date"
                  required
                  value={arrDate}
                  onChange={e => setArrDate(e.target.value)}
                  className="input"
                />
              </div>
            </div>

            {/* Flight & Capacity */}
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '16px' }}>
              <div className="input-group">
                <label className="input-label">N° de Vuelo / Aerolínea</label>
                <input
                  type="text"
                  placeholder="Ej: IB-6825"
                  value={flightNumber}
                  onChange={e => setFlightNumber(e.target.value)}
                  className="input"
                />
              </div>
              <div className="input-group">
                <label className="input-label">Kilos Disponibles (kg) *</label>
                <input
                  type="number"
                  min={1}
                  max={46}
                  required
                  value={availableKg}
                  onChange={e => setAvailableKg(Number(e.target.value))}
                  className="input"
                />
              </div>
              <div className="input-group">
                <label className="input-label">Precio por Kg (USDC) *</label>
                <input
                  type="number"
                  min={5}
                  max={50}
                  required
                  value={pricePerKg}
                  onChange={e => setPricePerKg(Number(e.target.value))}
                  className="input"
                />
              </div>
            </div>

            <div style={{
              padding: '14px',
              background: 'rgba(0,207,255,0.05)',
              border: '1px solid rgba(0,207,255,0.2)',
              borderRadius: '10px',
              fontSize: '0.82rem',
              color: 'var(--text-secondary)',
              lineHeight: 1.5,
            }}>
              💡 <strong>Ganancia potencial estimada:</strong> Si transportas los {availableKg} kg a ${pricePerKg} USDC/kg, recibirás <strong>${(availableKg * pricePerKg).toFixed(2)} USDC</strong> directamente en tu wallet al validar los códigos OTP de entrega.
            </div>

            <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '12px', marginTop: '8px' }}>
              <Link href="/dashboard/my-trips" className="btn btn-ghost">
                Cancelar
              </Link>
              <button type="submit" className="btn btn-primary">
                <Plane size={16} /> Publicar Vuelo en AYNI
              </button>
            </div>
          </form>
        </div>
      </div>
    </DashboardLayout>
  );
}
