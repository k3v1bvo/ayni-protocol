'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { useAuth } from '@/context/AuthContext';
import { AuthModal } from '@/components/auth/AuthModal';
import { UserRole } from '@/lib/supabase/types';
import { Plane, ShoppingBag, Shield, User, LogOut, ChevronDown, Sparkles, DollarSign } from 'lucide-react';

export function Navbar() {
  const { user, role, signOut, setDemoUser } = useAuth();
  const [authModalOpen, setAuthModalOpen] = useState(false);
  const [authModalMode, setAuthModalMode] = useState<'signin' | 'signup'>('signin');
  const [roleDropdownOpen, setRoleDropdownOpen] = useState(false);

  const getRoleBadge = (userRole: UserRole) => {
    switch (userRole) {
      case 'traveler':
        return <span className="badge badge-cyan">Viajero</span>;
      case 'merchant':
        return <span className="badge badge-emerald">Comercio</span>;
      case 'admin':
        return <span className="badge badge-purple">Auditor</span>;
      default:
        return <span className="badge badge-gold">Cliente</span>;
    }
  };

  return (
    <>
      <header style={{
        position: 'sticky',
        top: 0,
        zIndex: 100,
        backdropFilter: 'blur(20px)',
        WebkitBackdropFilter: 'blur(20px)',
        background: 'rgba(7, 9, 14, 0.85)',
        borderBottom: '1px solid var(--border-subtle)',
      }}>
        <div className="container-custom" style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          height: '74px',
        }}>
          {/* Brand Logo */}
          <Link href="/" style={{ display: 'flex', alignItems: 'center', gap: '10px', textDecoration: 'none' }}>
            <div style={{
              width: '42px',
              height: '42px',
              borderRadius: '12px',
              background: 'linear-gradient(135deg, #00f0ff 0%, #f59e0b 100%)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: '#07090e',
              fontWeight: 800,
              fontSize: '1.25rem',
              boxShadow: '0 0 20px rgba(0, 240, 255, 0.3)',
            }}>
              A
            </div>
            <div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                <span style={{ fontSize: '1.4rem', fontWeight: 800, letterSpacing: '-0.02em' }} className="gradient-text-gold">
                  AYNI
                </span>
              </div>
              <div style={{ fontSize: '0.65rem', color: 'var(--text-muted)', letterSpacing: '0.08em', textTransform: 'uppercase' }}>
                Protocolo Global P2P & Escrow
              </div>
            </div>
          </Link>

          {/* Navigation Links */}
          <nav style={{ display: 'none', alignItems: 'center', gap: '28px' }} className="nav-desktop">
            <a href="#rutas" style={{ color: 'var(--text-secondary)', textDecoration: 'none', fontSize: '0.9rem', fontWeight: 500, transition: 'color 0.2s' }}>
              Rutas Activas
            </a>
            <a href="#pedidos" style={{ color: 'var(--text-secondary)', textDecoration: 'none', fontSize: '0.9rem', fontWeight: 500, transition: 'color 0.2s' }}>
              Compra a Pie
            </a>
            <a href="#calculadora" style={{ color: 'var(--text-secondary)', textDecoration: 'none', fontSize: '0.9rem', fontWeight: 500, transition: 'color 0.2s' }}>
              Calculadora de Tarifas
            </a>
            <a href="#protocolo" style={{ color: 'var(--text-secondary)', textDecoration: 'none', fontSize: '0.9rem', fontWeight: 500, transition: 'color 0.2s' }}>
              Escrow & IA
            </a>
          </nav>

          {/* User Status / Login Actions */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '14px' }}>
            {user ? (
              <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                {/* Role Switcher Pill */}
                <div style={{ position: 'relative' }}>
                  <button
                    type="button"
                    onClick={() => setRoleDropdownOpen(!roleDropdownOpen)}
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: '8px',
                      background: 'rgba(255, 255, 255, 0.05)',
                      border: '1px solid var(--border-subtle)',
                      borderRadius: '20px',
                      padding: '6px 12px',
                      color: 'var(--text-primary)',
                      cursor: 'pointer',
                      fontSize: '0.825rem',
                    }}
                  >
                    {getRoleBadge(role)}
                    <span style={{ fontWeight: 600 }}>{user.full_name?.split(' ')[0]}</span>
                    <ChevronDown size={14} color="var(--text-muted)" />
                  </button>

                  {roleDropdownOpen && (
                    <div style={{
                      position: 'absolute',
                      right: 0,
                      top: 'calc(100% + 8px)',
                      width: '220px',
                      background: '#0d121f',
                      border: '1px solid var(--border-highlight)',
                      borderRadius: '12px',
                      boxShadow: '0 10px 30px rgba(0,0,0,0.5)',
                      padding: '8px',
                      zIndex: 110,
                    }}>
                      <div style={{ padding: '8px', borderBottom: '1px solid var(--border-subtle)', marginBottom: '4px' }}>
                        <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>Reputación</div>
                        <div style={{ fontSize: '0.9rem', fontWeight: 700, color: 'var(--ayni-gold)' }}>
                          ★ {user.reputation_score.toFixed(2)} / 5.00
                        </div>
                        {user.guarantee_balance > 0 && (
                          <div style={{ fontSize: '0.75rem', color: 'var(--ayni-emerald)', marginTop: '2px' }}>
                            Garantía: ${user.guarantee_balance} USDC
                          </div>
                        )}
                      </div>

                      <div style={{ fontSize: '0.7rem', color: 'var(--text-muted)', padding: '6px 8px' }}>
                        Cambiar perfil activo:
                      </div>

                      {(['traveler', 'client', 'merchant', 'admin'] as UserRole[]).map(r => (
                        <button
                          key={r}
                          type="button"
                          onClick={() => { setDemoUser(r); setRoleDropdownOpen(false); }}
                          style={{
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'space-between',
                            width: '100%',
                            padding: '8px',
                            background: role === r ? 'rgba(0, 240, 255, 0.1)' : 'transparent',
                            border: 'none',
                            borderRadius: '6px',
                            color: role === r ? 'var(--ayni-cyan)' : 'var(--text-secondary)',
                            fontSize: '0.8rem',
                            cursor: 'pointer',
                            textAlign: 'left',
                          }}
                        >
                          <span style={{ textTransform: 'capitalize' }}>{r}</span>
                          {role === r && <span style={{ fontSize: '0.7rem' }}>✓ Activo</span>}
                        </button>
                      ))}

                      <div style={{ borderTop: '1px solid var(--border-subtle)', marginTop: '6px', paddingTop: '4px' }}>
                        <button
                          type="button"
                          onClick={() => { signOut(); setRoleDropdownOpen(false); }}
                          style={{
                            display: 'flex',
                            alignItems: 'center',
                            gap: '8px',
                            width: '100%',
                            padding: '8px',
                            background: 'transparent',
                            border: 'none',
                            color: '#f87171',
                            fontSize: '0.8rem',
                            cursor: 'pointer',
                          }}
                        >
                          <LogOut size={14} />
                          Cerrar Sesión
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            ) : (
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                <button
                  type="button"
                  onClick={() => { setAuthModalMode('signin'); setAuthModalOpen(true); }}
                  className="btn btn-outline"
                  style={{ padding: '8px 16px', fontSize: '0.85rem' }}
                >
                  Iniciar Sesión
                </button>
                <button
                  type="button"
                  onClick={() => { setAuthModalMode('signup'); setAuthModalOpen(true); }}
                  className="btn btn-primary"
                  style={{ padding: '8px 18px', fontSize: '0.85rem' }}
                >
                  Registrarse
                </button>
              </div>
            )}
          </div>
        </div>
      </header>

      {/* Auth Modal */}
      <AuthModal
        isOpen={authModalOpen}
        onClose={() => setAuthModalOpen(false)}
        initialMode={authModalMode}
      />
    </>
  );
}
