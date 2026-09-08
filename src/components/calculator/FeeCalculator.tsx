'use client';

import React, { useState } from 'react';
import { calculateOrderFees, HIGH_VALUE_MAX_FEE_CAP_USDC } from '@/lib/constants/fees';
import { Calculator, ShieldCheck, DollarSign, ArrowRight, Zap, Info } from 'lucide-react';

export function FeeCalculator() {
  const [costInput, setCostInput] = useState<number>(350);
  const breakdown = calculateOrderFees(costInput);

  return (
    <section id="calculadora" style={{ padding: '60px 0' }}>
      <div className="container-custom">
        <div style={{ textAlign: 'center', marginBottom: '40px' }}>
          <span className="badge badge-gold" style={{ marginBottom: '12px' }}>
            Transparencia Web3 & Matriz Escalonada
          </span>
          <h2 style={{ fontSize: '2.25rem', fontWeight: 800, letterSpacing: '-0.02em', marginTop: '8px' }}>
            Calculadora de Tarifas y <span className="gradient-text-cyan">Tope de Alto Valor</span>
          </h2>
          <p style={{ color: 'var(--text-secondary)', maxWidth: '680px', margin: '12px auto 0' }}>
            Comisiones justas basadas en reciprocidad andina (*Ayni*). Conoce el reparto exacto entre el viajero,
            el fondo comunitario de garantía y el mantenimiento del protocolo.
          </p>
        </div>

        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))',
          gap: '24px',
          alignItems: 'stretch',
        }}>
          {/* Input Panel */}
          <div className="glass-panel" style={{ padding: '32px', display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
            <div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '20px' }}>
                <div style={{
                  background: 'rgba(0, 240, 255, 0.1)',
                  padding: '10px',
                  borderRadius: '10px',
                  color: 'var(--ayni-cyan)',
                }}>
                  <Calculator size={22} />
                </div>
                <div>
                  <h3 style={{ fontSize: '1.2rem', fontWeight: 700 }}>Simular Encargo</h3>
                  <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>Introduce el valor de compra en mostrador</div>
                </div>
              </div>

              <div style={{ marginBottom: '24px' }}>
                <label style={{ display: 'block', fontSize: '0.875rem', color: 'var(--text-secondary)', marginBottom: '8px' }}>
                  Costo de Compra del Producto (USDC):
                </label>
                <div style={{ position: 'relative' }}>
                  <input
                    type="number"
                    min="1"
                    max="5000"
                    value={costInput || ''}
                    onChange={e => setCostInput(Number(e.target.value) || 0)}
                    className="input-custom"
                    style={{ fontSize: '1.5rem', fontWeight: 700, paddingLeft: '44px', color: 'var(--ayni-gold)' }}
                  />
                  <span style={{ position: 'absolute', left: '16px', top: '16px', fontSize: '1.4rem', color: 'var(--text-muted)' }}>
                    $
                  </span>
                </div>
              </div>

              {/* Quick Preset Buttons */}
              <div style={{ marginBottom: '20px' }}>
                <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginBottom: '8px' }}>Montos típicos de prueba:</div>
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px' }}>
                  {[
                    { label: 'Medicamento ($45)', val: 45 },
                    { label: 'Lente Óptico ($180)', val: 180 },
                    { label: 'Implante Dental ($350)', val: 350 },
                    { label: 'Equipo / Tech ($1,800)', val: 1800 },
                  ].map(preset => (
                    <button
                      key={preset.val}
                      type="button"
                      onClick={() => setCostInput(preset.val)}
                      style={{
                        background: costInput === preset.val ? 'rgba(0, 240, 255, 0.15)' : 'rgba(255, 255, 255, 0.04)',
                        border: `1px solid ${costInput === preset.val ? 'var(--ayni-cyan)' : 'var(--border-subtle)'}`,
                        borderRadius: '8px',
                        padding: '6px 10px',
                        color: costInput === preset.val ? 'var(--ayni-cyan)' : 'var(--text-secondary)',
                        fontSize: '0.78rem',
                        cursor: 'pointer',
                      }}
                    >
                      {preset.label}
                    </button>
                  ))}
                </div>
              </div>
            </div>

            {/* High Value Cap Alert */}
            {breakdown.appliedHighValueCap ? (
              <div style={{
                background: 'rgba(16, 185, 129, 0.12)',
                border: '1px solid rgba(16, 185, 129, 0.3)',
                borderRadius: '12px',
                padding: '14px',
                display: 'flex',
                alignItems: 'flex-start',
                gap: '10px',
              }}>
                <ShieldCheck size={20} color="#10b981" style={{ flexShrink: 0, marginTop: '2px' }} />
                <div style={{ fontSize: '0.8rem', color: '#a7f3d0' }}>
                  <strong>¡Regla de Competitividad Activada (Sección 4.3)!</strong><br />
                  La tarifa del transportista se limitó al tope de <strong>${HIGH_VALUE_MAX_FEE_CAP_USDC} USD</strong> para no encarecer artículos de alto valor.
                </div>
              </div>
            ) : (
              <div style={{
                background: 'rgba(255, 255, 255, 0.03)',
                border: '1px solid var(--border-subtle)',
                borderRadius: '12px',
                padding: '12px',
                fontSize: '0.78rem',
                color: 'var(--text-muted)',
                display: 'flex',
                alignItems: 'center',
                gap: '8px',
              }}>
                <Info size={16} />
                <span>Escala activa: Tasa total {(breakdown.totalFeeRate * 100).toFixed(0)}% según volumen.</span>
              </div>
            )}
          </div>

          {/* Breakdown Output Panel */}
          <div className="glass-panel" style={{ padding: '32px', border: '1px solid var(--border-gold)' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
              <h3 style={{ fontSize: '1.2rem', fontWeight: 700 }}>Desglose de Liquidación</h3>
              <span className="badge badge-cyan">Base L2 (USDC)</span>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
              {/* Product Cost */}
              <div style={{ display: 'flex', justifyContent: 'space-between', paddingBottom: '10px', borderBottom: '1px solid var(--border-subtle)' }}>
                <span style={{ color: 'var(--text-secondary)', fontSize: '0.9rem' }}>Costo Compra en Mostrador</span>
                <span style={{ fontWeight: 600, fontFamily: 'var(--font-mono)' }}>${costInput.toFixed(2)} USDC</span>
              </div>

              {/* Traveler Fee */}
              <div style={{ display: 'flex', justifyContent: 'space-between', paddingBottom: '10px', borderBottom: '1px solid var(--border-subtle)' }}>
                <div>
                  <div style={{ color: 'var(--ayni-cyan)', fontSize: '0.9rem', fontWeight: 600 }}>
                    Honorario al Viajero
                  </div>
                  <div style={{ fontSize: '0.725rem', color: 'var(--text-muted)' }}>
                    {(breakdown.travelerFeeRate * 100).toFixed(0)}% {breakdown.appliedHighValueCap ? '(Tope $50 aplicado)' : ''}
                  </div>
                </div>
                <span style={{ fontWeight: 700, color: 'var(--ayni-cyan)', fontFamily: 'var(--font-mono)' }}>
                  +${breakdown.travelerFeeUsdc.toFixed(2)} USDC
                </span>
              </div>

              {/* System Fee */}
              <div style={{ display: 'flex', justifyContent: 'space-between', paddingBottom: '10px', borderBottom: '1px solid var(--border-subtle)' }}>
                <div>
                  <div style={{ color: 'var(--text-secondary)', fontSize: '0.9rem' }}>Mantenimiento Sistema</div>
                  <div style={{ fontSize: '0.725rem', color: 'var(--text-muted)' }}>
                    {(breakdown.systemFeeRate * 100).toFixed(0)}% (infraestructura y oráculos)
                  </div>
                </div>
                <span style={{ fontWeight: 600, fontFamily: 'var(--font-mono)' }}>
                  +${breakdown.systemFeeUsdc.toFixed(2)} USDC
                </span>
              </div>

              {/* Guarantee Reserve Fund */}
              <div style={{ display: 'flex', justifyContent: 'space-between', paddingBottom: '14px', borderBottom: '1px solid var(--border-subtle)' }}>
                <div>
                  <div style={{ color: 'var(--ayni-gold)', fontSize: '0.9rem', fontWeight: 600 }}>
                    Fondo Comunitario de Reserva
                  </div>
                  <div style={{ fontSize: '0.725rem', color: 'var(--text-muted)' }}>
                    {(breakdown.reserveFeeRate * 100).toFixed(0)}% (cobertura mutua de siniestros)
                  </div>
                </div>
                <span style={{ fontWeight: 600, color: 'var(--ayni-gold)', fontFamily: 'var(--font-mono)' }}>
                  +${breakdown.reserveFeeUsdc.toFixed(2)} USDC
                </span>
              </div>

              {/* Grand Total */}
              <div style={{
                background: 'rgba(0, 0, 0, 0.4)',
                borderRadius: '12px',
                padding: '16px',
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                marginTop: '6px',
              }}>
                <div>
                  <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                    Total a Bloquear en Escrow
                  </div>
                  <div style={{ fontSize: '1.6rem', fontWeight: 800, color: '#ffffff', fontFamily: 'var(--font-mono)' }}>
                    ${breakdown.totalOrderCostUsdc.toFixed(2)} <span style={{ fontSize: '0.9rem', color: 'var(--ayni-cyan)' }}>USDC</span>
                  </div>
                </div>
                <div style={{ textAlign: 'right' }}>
                  <div style={{ fontSize: '0.7rem', color: 'var(--ayni-emerald)', fontWeight: 600 }}>Ahorro estimado vs Courier:</div>
                  <div style={{ fontSize: '1.1rem', fontWeight: 700, color: 'var(--ayni-emerald)' }}>~65% menos</div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
