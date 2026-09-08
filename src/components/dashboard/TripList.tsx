'use client';

import React, { useState } from 'react';
import { Trip } from '@/lib/supabase/types';
import { Plane, Calendar, Weight, Box, ArrowRight, ShieldCheck, Plus } from 'lucide-react';

const INITIAL_TRIPS: Trip[] = [
  {
    id: '10000000-0000-0000-0000-000000000001',
    traveler_id: '00000000-0000-0000-0000-000000000001',
    traveler: {
      id: '00000000-0000-0000-0000-000000000001',
      full_name: 'Alejandro Mamani',
      email: 'alejandro@ayni.io',
      role: 'traveler',
      reputation_score: 4.95,
      guarantee_balance: 250,
    },
    origin_city: 'Madrid',
    origin_country: 'España',
    destination_city: 'La Paz',
    destination_country: 'Bolivia',
    departure_date: '2026-09-12T10:00:00Z',
    arrival_date: '2026-09-13T06:30:00Z',
    total_kg_capacity: 23.0,
    available_kg: 14.5,
    volume_dimensions_cm: { alto: 55, ancho: 40, profundidad: 23 },
    transport_type: 'aerial',
    luggage_photos: ['https://images.unsplash.com/photo-1553062407-98eeb64c6a62?w=500&auto=format&fit=crop&q=60'],
    status: 'scheduled',
  },
  {
    id: '10000000-0000-0000-0000-000000000002',
    traveler_id: '00000000-0000-0000-0000-000000000001',
    traveler: {
      id: '00000000-0000-0000-0000-000000000001',
      full_name: 'Carlos Mendoza',
      email: 'carlos@ayni.io',
      role: 'traveler',
      reputation_score: 4.88,
      guarantee_balance: 400,
    },
    origin_city: 'Miami',
    origin_country: 'EE.UU.',
    destination_city: 'Santa Cruz',
    destination_country: 'Bolivia',
    departure_date: '2026-09-15T18:00:00Z',
    arrival_date: '2026-09-16T04:15:00Z',
    total_kg_capacity: 20.0,
    available_kg: 8.0,
    volume_dimensions_cm: { alto: 50, ancho: 38, profundidad: 20 },
    transport_type: 'aerial',
    luggage_photos: ['https://images.unsplash.com/photo-1565026057447-bc90a3dceb87?w=500&auto=format&fit=crop&q=60'],
    status: 'scheduled',
  },
  {
    id: '10000000-0000-0000-0000-000000000003',
    traveler_id: '00000000-0000-0000-0000-000000000001',
    traveler: {
      id: '00000000-0000-0000-0000-000000000001',
      full_name: 'Lucía Fernández',
      email: 'lucia@ayni.io',
      role: 'traveler',
      reputation_score: 5.0,
      guarantee_balance: 150,
    },
    origin_city: 'Buenos Aires',
    origin_country: 'Argentina',
    destination_city: 'Cochabamba',
    destination_country: 'Bolivia',
    departure_date: '2026-09-18T14:30:00Z',
    arrival_date: '2026-09-18T22:00:00Z',
    total_kg_capacity: 15.0,
    available_kg: 6.5,
    volume_dimensions_cm: { alto: 45, ancho: 35, profundidad: 20 },
    transport_type: 'aerial',
    luggage_photos: [],
    status: 'scheduled',
  },
];

export function TripList() {
  const [trips] = useState<Trip[]>(INITIAL_TRIPS);
  const [selectedTrip, setSelectedTrip] = useState<Trip | null>(null);

  return (
    <section id="rutas" style={{ padding: '40px 0' }}>
      <div className="container-custom">
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', marginBottom: '32px', flexWrap: 'wrap', gap: '16px' }}>
          <div>
            <span className="badge badge-cyan" style={{ marginBottom: '8px' }}>Módulo A: Gestión de Rutas</span>
            <h2 style={{ fontSize: '2rem', fontWeight: 800, marginTop: '6px' }}>
              Rutas Disponibles y <span className="gradient-text-gold">Capacidad Ociosa</span>
            </h2>
            <p style={{ color: 'var(--text-secondary)', fontSize: '0.95rem' }}>
              Viajeros verificados con espacio en maleta para transportar compras o paquetes de valor.
            </p>
          </div>
          <button className="btn btn-primary" style={{ padding: '10px 18px' }}>
            <Plus size={18} />
            Publicar mi Ruta
          </button>
        </div>

        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(340px, 1fr))',
          gap: '20px',
        }}>
          {trips.map(trip => (
            <div key={trip.id} className="glass-panel" style={{ padding: '24px', display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
              <div>
                {/* Header: Origin -> Destination */}
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '16px' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <div style={{
                      background: 'rgba(0, 240, 255, 0.1)',
                      padding: '8px',
                      borderRadius: '8px',
                      color: 'var(--ayni-cyan)',
                    }}>
                      <Plane size={18} />
                    </div>
                    <span className="badge badge-emerald">Programado</span>
                  </div>
                  <div style={{ fontSize: '0.8rem', color: 'var(--ayni-gold)', fontWeight: 600, display: 'flex', alignItems: 'center', gap: '4px' }}>
                    <span>★ {trip.traveler?.reputation_score}</span>
                    <span style={{ color: 'var(--text-muted)' }}>({trip.traveler?.full_name?.split(' ')[0]})</span>
                  </div>
                </div>

                <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '16px' }}>
                  <div>
                    <div style={{ fontSize: '1.25rem', fontWeight: 700 }}>{trip.origin_city}</div>
                    <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>{trip.origin_country}</div>
                  </div>
                  <ArrowRight size={20} color="var(--ayni-cyan)" />
                  <div>
                    <div style={{ fontSize: '1.25rem', fontWeight: 700 }}>{trip.destination_city}</div>
                    <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>{trip.destination_country}</div>
                  </div>
                </div>

                {/* Metrics */}
                <div style={{
                  display: 'grid',
                  gridTemplateColumns: 'repeat(2, 1fr)',
                  gap: '12px',
                  background: 'rgba(255, 255, 255, 0.03)',
                  borderRadius: '12px',
                  padding: '12px',
                  marginBottom: '18px',
                }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <Weight size={16} color="var(--ayni-cyan)" />
                    <div>
                      <div style={{ fontSize: '0.7rem', color: 'var(--text-muted)' }}>Espacio Libre</div>
                      <div style={{ fontSize: '0.95rem', fontWeight: 700, color: 'var(--text-primary)' }}>
                        {trip.available_kg} kg <span style={{ fontSize: '0.7rem', color: 'var(--text-muted)' }}>/ {trip.total_kg_capacity}kg</span>
                      </div>
                    </div>
                  </div>

                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <Calendar size={16} color="var(--ayni-gold)" />
                    <div>
                      <div style={{ fontSize: '0.7rem', color: 'var(--text-muted)' }}>Salida</div>
                      <div style={{ fontSize: '0.95rem', fontWeight: 700, color: 'var(--text-primary)' }}>
                        {new Date(trip.departure_date).toLocaleDateString('es-ES', { day: '2-digit', month: 'short' })}
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              <button
                type="button"
                onClick={() => setSelectedTrip(trip)}
                className="btn btn-outline"
                style={{ width: '100%', padding: '10px', fontSize: '0.875rem' }}
              >
                Solicitar Encargo con este Viajero
              </button>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
