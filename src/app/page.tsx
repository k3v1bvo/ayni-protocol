'use client';

import React from 'react';
import { TripList } from '@/components/dashboard/TripList';
import { OrderList } from '@/components/dashboard/OrderList';
import { FeeCalculator } from '@/components/calculator/FeeCalculator';
import { 
  Plane, 
  ShoppingBag, 
  ShieldCheck, 
  BrainCircuit, 
  ArrowRight, 
  Coins, 
  Users, 
  CheckCircle2, 
  Lock
} from 'lucide-react';

export default function HomePage() {
  return (
    <div style={{ paddingBottom: '80px' }}>
      {/* Hero Section */}
      <section style={{
        position: 'relative',
        padding: '80px 0 60px',
        overflow: 'hidden',
        textAlign: 'center',
      }}>
        <div className="container-custom" style={{ position: 'relative', zIndex: 2 }}>
          {/* Hackathon Badge */}
          <div style={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: '8px',
            background: 'rgba(245, 158, 11, 0.12)',
            border: '1px solid rgba(245, 158, 11, 0.3)',
            borderRadius: '9999px',
            padding: '6px 16px',
            marginBottom: '24px',
          }}>
            <span style={{
              width: '8px',
              height: '8px',
              borderRadius: '50%',
              background: 'var(--ayni-gold)',
              boxShadow: '0 0 10px var(--ayni-gold)',
            }} />
            <span style={{ fontSize: '0.85rem', fontWeight: 600, color: 'var(--ayni-gold)', letterSpacing: '0.04em' }}>
              BUILDATHON ETH BOLIVIA 2026 • PROTOCOLO OFICIAL
            </span>
          </div>

          {/* Main Title */}
          <h1 style={{
            fontSize: 'clamp(2.5rem, 6vw, 4.2rem)',
            fontWeight: 800,
            lineHeight: 1.1,
            letterSpacing: '-0.03em',
            maxWidth: '920px',
            margin: '0 auto 24px',
          }}>
            Logística Colaborativa P2P y <br />
            <span className="gradient-text-gold">Reciprocidad Andina</span> en <span className="gradient-text-cyan">Base L2</span>
          </h1>

          {/* Subtitle */}
          <p style={{
            fontSize: 'clamp(1.05rem, 2vw, 1.25rem)',
            color: 'var(--text-secondary)',
            maxWidth: '740px',
            margin: '0 auto 36px',
            lineHeight: 1.6,
          }}>
            Transformamos el espacio ocioso de equipaje de miles de viajeros en una red descentralizada de comercio y remesas. Compras asistidas en mostrador, insumos médicos y transferencias seguras con Escrow y auditoría IA.
          </p>

          {/* Hero CTAs */}
          <div style={{ display: 'flex', justifyContent: 'center', gap: '16px', flexWrap: 'wrap', marginBottom: '60px' }}>
            <a href="#rutas" className="btn btn-primary" style={{ padding: '14px 28px', fontSize: '1rem' }}>
              Explorar Rutas y Maletas
              <ArrowRight size={18} />
            </a>
            <a href="#calculadora" className="btn btn-outline" style={{ padding: '14px 28px', fontSize: '1rem' }}>
              Calcular Comisión Justa
            </a>
          </div>

          {/* Stats Bar */}
          <div className="glass-panel" style={{
            maxWidth: '1000px',
            margin: '0 auto',
            padding: '24px',
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
            gap: '20px',
          }}>
            <div>
              <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                Gas Promedio
              </div>
              <div style={{ fontSize: '1.75rem', fontWeight: 800, color: 'var(--ayni-cyan)', fontFamily: 'var(--font-mono)' }}>
                &lt; $0.01 USD
              </div>
              <div style={{ fontSize: '0.75rem', color: 'var(--text-secondary)' }}>Red Base Layer 2</div>
            </div>

            <div>
              <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                Tope de Traslado
              </div>
              <div style={{ fontSize: '1.75rem', fontWeight: 800, color: 'var(--ayni-gold)', fontFamily: 'var(--font-mono)' }}>
                $50.00 USD
              </div>
              <div style={{ fontSize: '0.75rem', color: 'var(--text-secondary)' }}>Regla de Alto Valor</div>
            </div>

            <div>
              <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                Fondo de Garantía
              </div>
              <div style={{ fontSize: '1.75rem', fontWeight: 800, color: 'var(--ayni-emerald)', fontFamily: 'var(--font-mono)' }}>
                2% Mutual
              </div>
              <div style={{ fontSize: '0.75rem', color: 'var(--text-secondary)' }}>Cobertura colectiva</div>
            </div>

            <div>
              <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                Verificación de Entrega
              </div>
              <div style={{ fontSize: '1.75rem', fontWeight: 800, color: '#c084fc', fontFamily: 'var(--font-mono)' }}>
                OTP 6 Dígitos
              </div>
              <div style={{ fontSize: '0.75rem', color: 'var(--text-secondary)' }}>Liquidación instantánea</div>
            </div>
          </div>
        </div>
      </section>

      {/* Pillars Section */}
      <section id="protocolo" style={{ padding: '60px 0' }}>
        <div className="container-custom">
          <div style={{ textAlign: 'center', marginBottom: '40px' }}>
            <span className="badge badge-cyan" style={{ marginBottom: '8px' }}>Arquitectura Modular</span>
            <h2 style={{ fontSize: '2.25rem', fontWeight: 800 }}>Los 4 Pilares de AYNI / MINKA</h2>
          </div>

          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))',
            gap: '20px',
          }}>
            {/* Pilar 1 */}
            <div className="glass-panel" style={{ padding: '24px' }}>
              <div style={{
                width: '46px',
                height: '46px',
                borderRadius: '12px',
                background: 'rgba(0, 240, 255, 0.12)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                color: 'var(--ayni-cyan)',
                marginBottom: '16px',
              }}>
                <Plane size={24} />
              </div>
              <h3 style={{ fontSize: '1.15rem', fontWeight: 700, marginBottom: '8px' }}>
                Módulo A: Gestión de Rutas
              </h3>
              <p style={{ fontSize: '0.875rem', color: 'var(--text-secondary)', lineHeight: 1.5 }}>
                Declaración biométrica de peso disponible (kg), dimensiones y fotos de maleta antes de habilitar el itinerario.
              </p>
            </div>

            {/* Pilar 2 */}
            <div className="glass-panel" style={{ padding: '24px' }}>
              <div style={{
                width: '46px',
                height: '46px',
                borderRadius: '12px',
                background: 'rgba(245, 158, 11, 0.12)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                color: 'var(--ayni-gold)',
                marginBottom: '16px',
              }}>
                <ShoppingBag size={24} />
              </div>
              <h3 style={{ fontSize: '1.15rem', fontWeight: 700, marginBottom: '8px' }}>
                Módulo B: Compra a Pie
              </h3>
              <p style={{ fontSize: '0.875rem', color: 'var(--text-secondary)', lineHeight: 1.5 }}>
                Personal Shopper P2P en comercios de mostrador en la ciudad de origen. Inspección presencial y ofertas de liquidación.
              </p>
            </div>

            {/* Pilar 3 */}
            <div className="glass-panel" style={{ padding: '24px' }}>
              <div style={{
                width: '46px',
                height: '46px',
                borderRadius: '12px',
                background: 'rgba(16, 185, 129, 0.12)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                color: 'var(--ayni-emerald)',
                marginBottom: '16px',
              }}>
                <ShieldCheck size={24} />
              </div>
              <h3 style={{ fontSize: '1.15rem', fontWeight: 700, marginBottom: '8px' }}>
                Módulo C: Custodia Escrow & OTP
              </h3>
              <p style={{ fontSize: '0.875rem', color: 'var(--text-secondary)', lineHeight: 1.5 }}>
                Fondos retenidos en smart contract hasta que el comprador revela el código criptográfico de 6 dígitos al recibir.
              </p>
            </div>

            {/* Pilar 4 */}
            <div className="glass-panel" style={{ padding: '24px' }}>
              <div style={{
                width: '46px',
                height: '46px',
                borderRadius: '12px',
                background: 'rgba(139, 92, 246, 0.12)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                color: 'var(--ayni-purple)',
                marginBottom: '16px',
              }}>
                <BrainCircuit size={24} />
              </div>
              <h3 style={{ fontSize: '1.15rem', fontWeight: 700, marginBottom: '8px' }}>
                Módulo D: Auditoría IA Multimodal
              </h3>
              <p style={{ fontSize: '0.875rem', color: 'var(--text-secondary)', lineHeight: 1.5 }}>
                Pipeline con Google Gemini para extraer datos fiscales de comprobantes y verificar correspondencia física antes de viajar.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Routes Section */}
      <TripList />

      {/* Orders & OTP Escrow Demo */}
      <OrderList />

      {/* Tiered Fee Calculator */}
      <FeeCalculator />

      {/* Footer */}
      <footer style={{
        marginTop: '80px',
        borderTop: '1px solid var(--border-subtle)',
        padding: '40px 0 20px',
        textAlign: 'center',
      }}>
        <div className="container-custom">
          <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', gap: '10px', marginBottom: '12px' }}>
            <span style={{ fontWeight: 800, fontSize: '1.2rem' }} className="gradient-text-gold">AYNI</span>
            <span style={{ color: 'var(--text-muted)' }}>/</span>
            <span style={{ fontWeight: 700, color: 'var(--ayni-cyan)', fontSize: '1.1rem' }}>MINKA</span>
          </div>
          <p style={{ color: 'var(--text-muted)', fontSize: '0.85rem', maxWidth: '600px', margin: '0 auto 16px' }}>
            Documento de Especificación de Requerimientos de Software (ERS) Versión 1.0.1. Proyecto presentado para el Buildathon ETH Bolivia 2026.
          </p>
          <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
            Repositorio Oficial: <a href="https://github.com/k3v1bvo/ayni-protocol" target="_blank" rel="noreferrer" style={{ color: 'var(--ayni-cyan)', textDecoration: 'none' }}>github.com/k3v1bvo/ayni-protocol</a>
          </div>
        </div>
      </footer>
    </div>
  );
}
