'use client';

import React, { useState } from 'react';
import { DashboardLayout } from '@/components/layout/DashboardLayout';
import {
  ShieldCheck, HeartPulse, Users, Clock, Plus, CheckCircle2,
  Copy, ExternalLink, AlertTriangle, Sparkles, Key, Lock, RefreshCw, X
} from 'lucide-react';

interface Beneficiary {
  id: string;
  name: string;
  relation: string;
  wallet: string;
  percentage: number;
  email: string;
  status: 'verified' | 'pending';
}

const INITIAL_BENEFICIARIES: Beneficiary[] = [
  {
    id: 'BEN-001',
    name: 'Valentina Mamani Quispe',
    relation: 'Hija',
    wallet: '0x3a82F7...4b92',
    percentage: 50,
    email: 'valentina.m@gmail.com',
    status: 'verified',
  },
  {
    id: 'BEN-002',
    name: 'Mateo Mamani Quispe',
    relation: 'Hijo',
    wallet: '0x9B11Cd...88A3',
    percentage: 30,
    email: 'mateo.mamani@outlook.com',
    status: 'verified',
  },
  {
    id: 'BEN-003',
    name: 'Carmen Quispe Flores',
    relation: 'Cónyuge',
    wallet: '0x71A09E...10F4',
    percentage: 20,
    email: 'carmen.q@gmail.com',
    status: 'verified',
  },
];

export default function HeritagePage() {
  const [beneficiaries, setBeneficiaries] = useState<Beneficiary[]>(INITIAL_BENEFICIARIES);
  const [daysRemaining, setDaysRemaining] = useState(142);
  const [heartbeatSuccess, setHeartbeatSuccess] = useState(false);
  const [copiedWallet, setCopiedWallet] = useState<string | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);

  // Form states for new beneficiary
  const [newName, setNewName] = useState('');
  const [newRelation, setNewRelation] = useState('Hijo/a');
  const [newWallet, setNewWallet] = useState('');
  const [newPercentage, setNewPercentage] = useState(10);
  const [newEmail, setNewEmail] = useState('');
  const [formError, setFormError] = useState<string | null>(null);

  const totalPercentage = beneficiaries.reduce((acc, b) => acc + b.percentage, 0);

  const handleHeartbeat = () => {
    setDaysRemaining(180);
    setHeartbeatSuccess(true);
    setTimeout(() => setHeartbeatSuccess(false), 4000);
  };

  const copyToClipboard = (text: string, id: string) => {
    navigator.clipboard.writeText(text);
    setCopiedWallet(id);
    setTimeout(() => setCopiedWallet(null), 2000);
  };

  const handleAddBeneficiary = (e: React.FormEvent) => {
    e.preventDefault();
    setFormError(null);

    if (!newName.trim() || !newWallet.trim()) {
      setFormError('Completa todos los campos obligatorios.');
      return;
    }

    if (totalPercentage + newPercentage > 100) {
      setFormError(`El porcentaje total no puede superar el 100%. Espacio disponible: ${100 - totalPercentage}%`);
      return;
    }

    const newBen: Beneficiary = {
      id: `BEN-${Date.now().toString().slice(-3)}`,
      name: newName.trim(),
      relation: newRelation,
      wallet: newWallet.trim(),
      percentage: Number(newPercentage),
      email: newEmail.trim() || 'No registrado',
      status: 'verified',
    };

    setBeneficiaries(prev => [...prev, newBen]);
    setIsModalOpen(false);
    setNewName('');
    setNewWallet('');
    setNewEmail('');
    setNewPercentage(10);
  };

  return (
    <DashboardLayout>
      {/* Page Header */}
      <div className="page-header">
        <div className="page-title-group">
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '4px' }}>
            <div className="page-title">AYNI Heritage</div>
            <span className="badge badge-gold">
              <Sparkles size={11} /> Smart Contracts de Sucesión
            </span>
          </div>
          <div className="page-subtitle">
            Bóvedas descentralizadas de herencia y protección patrimonial para familias y compatriotas en la diáspora.
          </div>
        </div>
        <button
          type="button"
          onClick={() => setIsModalOpen(true)}
          className="btn btn-gold"
          disabled={totalPercentage >= 100}
        >
          <Plus size={16} /> Asignar Beneficiario
        </button>
      </div>

      {/* Hero Showcase Card */}
      <div style={{
        marginBottom: '28px',
        background: 'linear-gradient(135deg, rgba(0,207,255,0.08) 0%, rgba(245,166,35,0.08) 100%)',
        border: '1px solid rgba(0,207,255,0.25)',
        borderRadius: '20px',
        padding: '24px 28px',
        display: 'flex',
        gap: '24px',
        alignItems: 'center',
        flexWrap: 'wrap',
      }}>
        <div style={{
          width: '120px',
          height: '90px',
          borderRadius: '14px',
          overflow: 'hidden',
          flexShrink: 0,
          border: '1px solid rgba(255,255,255,0.12)',
          boxShadow: '0 8px 24px rgba(0,0,0,0.5)',
        }}>
          <img
            src="/images/ayni_heritage_vault.jpg"
            alt="AYNI Heritage Vault"
            style={{ width: '100%', height: '100%', objectFit: 'cover' }}
          />
        </div>
        <div style={{ flex: '1', minWidth: '280px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '6px' }}>
            <span className="badge badge-cyan" style={{ fontSize: '0.72rem' }}>Smart Contract No Custodial</span>
            <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>Contrato: 0x71C9...B49a en Base L2</span>
          </div>
          <h2 style={{ fontSize: '1.25rem', fontWeight: 700, margin: '0 0 6px' }}>
            Bóveda de Herencia Digital & Sucesión Automática
          </h2>
          <p style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', lineHeight: 1.5, margin: 0 }}>
            Si resides en el extranjero o acumulas fondos en criptoactivos y remesas, este Smart Contract transfiere de forma autónoma tus fondos a tus herederos en caso de inactividad prolongada (Dead Man's Switch), sin procesos judiciales costosos ni intermediarios bancarios.
          </p>
        </div>
      </div>

      {/* Stats Cards */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))',
        gap: '16px',
        marginBottom: '28px',
      }}>
        <div className="card" style={{ padding: '20px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '10px' }}>
            <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>Patrimonio en Bóveda</span>
            <Lock size={16} color="var(--brand-gold)" />
          </div>
          <div style={{ fontSize: '1.75rem', fontWeight: 800, color: 'var(--brand-gold)', fontFamily: 'var(--font-display)' }}>
            $18,450.00
          </div>
          <div style={{ fontSize: '0.75rem', color: 'var(--brand-emerald)', marginTop: '4px' }}>
            ● Custodiado en Escrow L2 (USDC)
          </div>
        </div>

        <div className="card" style={{ padding: '20px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '10px' }}>
            <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>Herederos Asignados</span>
            <Users size={16} color="var(--brand-cyan)" />
          </div>
          <div style={{ fontSize: '1.75rem', fontWeight: 800, color: 'var(--brand-cyan)', fontFamily: 'var(--font-display)' }}>
            {beneficiaries.length} personas
          </div>
          <div style={{ fontSize: '0.75rem', color: totalPercentage === 100 ? 'var(--brand-emerald)' : 'var(--brand-gold)', marginTop: '4px' }}>
            {totalPercentage}% del fondo asignado
          </div>
        </div>

        <div className="card" style={{ padding: '20px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '10px' }}>
            <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>Prueba de Vida (Dead Man)</span>
            <HeartPulse size={16} color="var(--brand-red)" />
          </div>
          <div style={{ fontSize: '1.75rem', fontWeight: 800, color: 'var(--brand-emerald)', fontFamily: 'var(--font-display)' }}>
            {daysRemaining} días
          </div>
          <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginTop: '4px' }}>
            Plazo de inactividad: 180 días
          </div>
        </div>

        <div className="card" style={{ padding: '20px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '10px' }}>
            <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>Mecanismo de Desbloqueo</span>
            <Key size={16} color="var(--brand-purple)" />
          </div>
          <div style={{ fontSize: '1.1rem', fontWeight: 700, color: 'var(--brand-purple)' }}>
            TimeLock + MultiSig
          </div>
          <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginTop: '4px' }}>
            Smart Contract con auditoría de oráculo
          </div>
        </div>
      </div>

      {/* Heartbeat Action Box */}
      <div style={{
        marginBottom: '32px',
        padding: '20px 24px',
        background: 'rgba(255,255,255,0.02)',
        border: '1px solid var(--border-default)',
        borderRadius: '16px',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        flexWrap: 'wrap',
        gap: '16px',
      }}>
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '4px' }}>
            <HeartPulse size={18} color="var(--brand-red)" />
            <span style={{ fontWeight: 700, fontSize: '1rem' }}>Mecanismo de Presencia (Heartbeat)</span>
          </div>
          <p style={{ fontSize: '0.82rem', color: 'var(--text-secondary)', margin: 0 }}>
            Confirma tu actividad periódica. Al hacer clic, se reinicia el temporizador de 180 días en el Smart Contract.
          </p>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
          {heartbeatSuccess && (
            <span style={{ fontSize: '0.82rem', color: 'var(--brand-emerald)', display: 'flex', alignItems: 'center', gap: '6px' }}>
              <CheckCircle2 size={16} /> ¡Presencia confirmada! Reloj reiniciado a 180 días.
            </span>
          )}
          <button
            type="button"
            onClick={handleHeartbeat}
            className="btn btn-primary"
            style={{ display: 'flex', alignItems: 'center', gap: '8px' }}
          >
            <RefreshCw size={15} /> Confirmar que sigo activo
          </button>
        </div>
      </div>

      {/* Beneficiaries Table Section */}
      <div className="card" style={{ padding: '24px', marginBottom: '32px' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px', flexWrap: 'wrap', gap: '12px' }}>
          <div>
            <h3 style={{ fontSize: '1.15rem', fontWeight: 700, margin: '0 0 4px' }}>
              Beneficiarios Registrados en el Contrato
            </h3>
            <p style={{ fontSize: '0.82rem', color: 'var(--text-secondary)', margin: 0 }}>
              Direcciones de billetera cripto autorizadas para recibir su cuota parte automática si se cumple la condición de inactividad.
            </p>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <span className="badge badge-emerald">
              Cuota Total: {totalPercentage}% / 100%
            </span>
          </div>
        </div>

        <div style={{ overflowX: 'auto' }}>
          <table className="table" style={{ width: '100%' }}>
            <thead>
              <tr>
                <th>Heredero / Beneficiario</th>
                <th>Parentesco</th>
                <th>Billetera EVM (L2)</th>
                <th>Porcentaje Asignado</th>
                <th>Estimado a Recibir</th>
                <th>Estado</th>
              </tr>
            </thead>
            <tbody>
              {beneficiaries.map(ben => (
                <tr key={ben.id}>
                  <td>
                    <div>
                      <div style={{ fontWeight: 600, color: 'var(--text-primary)' }}>{ben.name}</div>
                      <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)' }}>{ben.email}</div>
                    </div>
                  </td>
                  <td>
                    <span className="badge badge-cyan" style={{ fontSize: '0.75rem' }}>{ben.relation}</span>
                  </td>
                  <td>
                    <button
                      type="button"
                      onClick={() => copyToClipboard(ben.wallet, ben.id)}
                      style={{
                        background: 'rgba(255,255,255,0.04)',
                        border: '1px solid var(--border-default)',
                        borderRadius: '6px',
                        padding: '4px 8px',
                        color: 'var(--brand-cyan)',
                        fontFamily: 'monospace',
                        fontSize: '0.78rem',
                        cursor: 'pointer',
                        display: 'inline-flex',
                        alignItems: 'center',
                        gap: '6px',
                      }}
                    >
                      {ben.wallet}
                      {copiedWallet === ben.id ? <CheckCircle2 size={12} color="var(--brand-emerald)" /> : <Copy size={12} />}
                    </button>
                  </td>
                  <td>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                      <span style={{ fontWeight: 700, color: 'var(--brand-gold)' }}>{ben.percentage}%</span>
                      <div style={{
                        width: '70px',
                        height: '6px',
                        borderRadius: '3px',
                        background: 'rgba(255,255,255,0.1)',
                        overflow: 'hidden',
                      }}>
                        <div style={{
                          width: `${ben.percentage}%`,
                          height: '100%',
                          background: 'linear-gradient(90deg, var(--brand-cyan), var(--brand-gold))',
                        }} />
                      </div>
                    </div>
                  </td>
                  <td style={{ fontWeight: 700, color: 'var(--text-primary)' }}>
                    ${((18450 * ben.percentage) / 100).toLocaleString('en-US', { minimumFractionDigits: 2 })} USDC
                  </td>
                  <td>
                    <span className="badge badge-emerald" style={{ fontSize: '0.7rem' }}>
                      ✓ Verificado
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Security Architecture & Rules Card */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))',
        gap: '20px',
      }}>
        <div className="card" style={{ padding: '24px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '12px' }}>
            <Clock size={18} color="var(--brand-gold)" />
            <h4 style={{ fontWeight: 700, margin: 0, fontSize: '1rem' }}>Regla de Ejecución: Dead Man's Switch</h4>
          </div>
          <p style={{ fontSize: '0.84rem', color: 'var(--text-secondary)', lineHeight: 1.5 }}>
            El Smart Contract de AYNI Heritage cuenta con un temporizador programable. Si el titular no emite una transacción de confirmación en el plazo establecido (180 días), el contrato entra en estado de pre-liberación.
          </p>
          <ul style={{ paddingLeft: '18px', fontSize: '0.8rem', color: 'var(--text-muted)', margin: '10px 0 0', lineHeight: 1.6 }}>
            <li>Notificación de gracia por 30 días a correos registrados.</li>
            <li>Si no hay respuesta, liberación irrevocable a las wallets designadas.</li>
          </ul>
        </div>

        <div className="card" style={{ padding: '24px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '12px' }}>
            <ShieldCheck size={18} color="var(--brand-emerald)" />
            <h4 style={{ fontWeight: 700, margin: 0, fontSize: '1rem' }}>Inmutabilidad & Seguridad Web3</h4>
          </div>
          <p style={{ fontSize: '0.84rem', color: 'var(--text-secondary)', lineHeight: 1.5 }}>
            Ni AYNI ni ningún tercero tiene custodia de las claves privadas. Los fondos están protegidos en un contrato ERC-4337 en Base L2, lo que garantiza costos de transacción ínfimos (&lt;$0.01) y máxima seguridad.
          </p>
          <div style={{ marginTop: '12px' }}>
            <span className="badge badge-purple" style={{ fontSize: '0.72rem' }}>
              Auditoría Criptográfica Verificada
            </span>
          </div>
        </div>
      </div>

      {/* Modal: Asignar Nuevo Beneficiario */}
      {isModalOpen && (
        <div className="modal-overlay" onClick={() => setIsModalOpen(false)}>
          <div
            className="modal-box"
            style={{ width: '100%', maxWidth: 480, padding: '28px' }}
            onClick={e => e.stopPropagation()}
          >
            <button
              type="button"
              onClick={() => setIsModalOpen(false)}
              style={{ position: 'absolute', top: 16, right: 16, background: 'transparent', border: 'none', color: 'var(--text-muted)', cursor: 'pointer' }}
            >
              <X size={18} />
            </button>

            <div style={{ marginBottom: '20px' }}>
              <h3 style={{ fontSize: '1.25rem', fontWeight: 700, margin: '0 0 4px' }}>
                Asignar Nuevo Beneficiario
              </h3>
              <p style={{ fontSize: '0.82rem', color: 'var(--text-secondary)', margin: 0 }}>
                Añade una persona de confianza para que herede fondos automáticamente.
              </p>
            </div>

            {formError && (
              <div className="alert alert-error" style={{ marginBottom: '16px' }}>
                <AlertTriangle size={15} /> {formError}
              </div>
            )}

            <form onSubmit={handleAddBeneficiary} style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
              <div className="input-group">
                <label className="input-label">Nombre Completo *</label>
                <input
                  type="text"
                  required
                  placeholder="Ej: Sofía Quispe Mamani"
                  value={newName}
                  onChange={e => setNewName(e.target.value)}
                  className="input"
                />
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
                <div className="input-group">
                  <label className="input-label">Parentesco</label>
                  <select
                    value={newRelation}
                    onChange={e => setNewRelation(e.target.value)}
                    className="input"
                  >
                    <option value="Hijo/a">Hijo/a</option>
                    <option value="Cónyuge">Cónyuge</option>
                    <option value="Padre/Madre">Padre/Madre</option>
                    <option value="Hermano/a">Hermano/a</option>
                    <option value="Familiar">Otro Familiar</option>
                    <option value="Albacea">Albacea / Custodio</option>
                  </select>
                </div>

                <div className="input-group">
                  <label className="input-label">Porcentaje (%) *</label>
                  <input
                    type="number"
                    min={1}
                    max={100 - totalPercentage}
                    required
                    value={newPercentage}
                    onChange={e => setNewPercentage(Number(e.target.value))}
                    className="input"
                  />
                  <span style={{ fontSize: '0.7rem', color: 'var(--text-muted)', marginTop: '2px' }}>
                    Disponible: {100 - totalPercentage}%
                  </span>
                </div>
              </div>

              <div className="input-group">
                <label className="input-label">Billetera EVM (Dirección 0x...) *</label>
                <input
                  type="text"
                  required
                  placeholder="0x..."
                  value={newWallet}
                  onChange={e => setNewWallet(e.target.value)}
                  className="input"
                />
              </div>

              <div className="input-group">
                <label className="input-label">Correo electrónico de notificación</label>
                <input
                  type="email"
                  placeholder="correo@ejemplo.com"
                  value={newEmail}
                  onChange={e => setNewEmail(e.target.value)}
                  className="input"
                />
              </div>

              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '10px', marginTop: '8px' }}>
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="btn btn-ghost"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="btn btn-primary"
                >
                  Registrar en Smart Contract
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </DashboardLayout>
  );
}
