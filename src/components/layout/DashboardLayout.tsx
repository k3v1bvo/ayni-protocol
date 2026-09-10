'use client';

import React, { useState, useEffect } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';
import { AppSidebar } from '@/components/layout/Sidebar';
import { BottomNav } from '@/components/layout/BottomNav';
import { CartDrawer } from '@/components/marketplace/CartDrawer';
import { NotificationCenter } from '@/components/layout/NotificationCenter';
import { Search, Menu } from 'lucide-react';
import Link from 'next/link';

export function DashboardLayout({ children }: { children: React.ReactNode }) {
  const [mobileOpen, setMobileOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const router = useRouter();
  const pathname = usePathname();
  const { user, role, isLoading, setDemoUser } = useAuth();
  const [showDemoPrompt, setShowDemoPrompt] = useState(false);

  useEffect(() => {
    const timer = setTimeout(() => {
      setShowDemoPrompt(true);
      if (!user) {
        setDemoUser('traveler');
      }
    }, 1500);
    return () => clearTimeout(timer);
  }, [user, setDemoUser]);

  if (isLoading || !user) {
    return (
      <div style={{
        minHeight: '100vh',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        background: 'var(--bg-primary)',
        color: 'var(--text-secondary)',
        gap: '20px',
        padding: '24px',
        textAlign: 'center',
      }}>
        <div style={{
          width: '44px',
          height: '44px',
          border: '3px solid rgba(0, 207, 255, 0.15)',
          borderTopColor: 'var(--brand-cyan)',
          borderRadius: '50%',
          animation: 'spin 0.8s linear infinite',
        }} />
        <div>
          <div style={{ fontSize: '1rem', fontWeight: 600, color: 'var(--text-primary)', marginBottom: '4px' }}>
            Verificando sesión segura AYNI Protocol...
          </div>
          <div style={{ fontSize: '0.82rem', color: 'var(--text-muted)' }}>
            Autenticación descentralizada & Supabase Guard
          </div>
        </div>

        {showDemoPrompt && (
          <div style={{
            marginTop: '12px',
            padding: '20px',
            borderRadius: '16px',
            background: 'rgba(255, 255, 255, 0.03)',
            border: '1px solid rgba(255, 255, 255, 0.08)',
            backdropFilter: 'blur(12px)',
            maxWidth: '420px',
            width: '100%',
            animation: 'fadeIn 0.4s ease-out',
          }}>
            <p style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', marginBottom: '16px' }}>
              ¿Deseas explorar de inmediato con un perfil simulado de prueba?
            </p>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '8px', marginBottom: '14px' }}>
              <button
                id="btn-demo-traveler"
                onClick={() => setDemoUser('traveler')}
                className="sc-button-interactive"
                style={{
                  padding: '10px 8px',
                  borderRadius: '10px',
                  background: 'rgba(0, 207, 255, 0.1)',
                  border: '1px solid rgba(0, 207, 255, 0.25)',
                  color: 'var(--brand-cyan)',
                  fontSize: '0.78rem',
                  fontWeight: 600,
                  cursor: 'pointer',
                }}
              >
                ✈️ Viajero
              </button>
              <button
                id="btn-demo-client"
                onClick={() => setDemoUser('client')}
                className="sc-button-interactive"
                style={{
                  padding: '10px 8px',
                  borderRadius: '10px',
                  background: 'rgba(255, 184, 0, 0.1)',
                  border: '1px solid rgba(255, 184, 0, 0.25)',
                  color: 'var(--brand-gold)',
                  fontSize: '0.78rem',
                  fontWeight: 600,
                  cursor: 'pointer',
                }}
              >
                🛍️ Cliente
              </button>
              <button
                id="btn-demo-merchant"
                onClick={() => setDemoUser('merchant')}
                className="sc-button-interactive"
                style={{
                  padding: '10px 8px',
                  borderRadius: '10px',
                  background: 'rgba(0, 230, 153, 0.1)',
                  border: '1px solid rgba(0, 230, 153, 0.25)',
                  color: 'var(--brand-emerald)',
                  fontSize: '0.78rem',
                  fontWeight: 600,
                  cursor: 'pointer',
                }}
              >
                🏪 Comercio
              </button>
            </div>
            <Link
              href={`/auth?redirect=${encodeURIComponent(pathname || '/dashboard')}`}
              style={{
                fontSize: '0.8rem',
                color: 'var(--text-muted)',
                textDecoration: 'underline',
                transition: 'color 0.2s',
              }}
            >
              O inicia sesión con tu correo / Web3
            </Link>
          </div>
        )}
      </div>
    );
  }

  const getRoleColor = () => {
    if (role === 'traveler') return 'var(--brand-cyan)';
    if (role === 'merchant') return 'var(--brand-emerald)';
    if (role === 'admin') return 'var(--brand-purple)';
    return 'var(--brand-gold)';
  };

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      router.push(`/dashboard/marketplace?search=${encodeURIComponent(searchQuery.trim())}`);
    }
  };

  return (
    <div className="app-shell">
      <AppSidebar mobileOpen={mobileOpen} onClose={() => setMobileOpen(false)} />
      <div className="main-area">
        {/* Top Bar */}
        <div className="topbar">
          <button
            type="button"
            className="btn btn-ghost btn-sm mobile-menu-trigger"
            onClick={() => setMobileOpen(true)}
            id="mobile-menu-btn"
            aria-label="Abrir menú"
          >
            <Menu size={20} />
          </button>

          {/* Functional Search Bar */}
          <form onSubmit={handleSearchSubmit} className="topbar-search" style={{ flex: 1, maxWidth: 420 }}>
            <div className="input-icon-wrap" style={{ position: 'relative', display: 'flex', alignItems: 'center' }}>
              <button
                type="submit"
                style={{ position: 'absolute', left: '10px', background: 'transparent', border: 'none', color: 'var(--text-muted)', cursor: 'pointer', padding: 0, display: 'flex', alignItems: 'center' }}
                aria-label="Buscar"
              >
                <Search size={16} />
              </button>
              <input
                type="search"
                placeholder="Buscar rutas, pedidos, productos..."
                className="input"
                value={searchQuery}
                onChange={e => setSearchQuery(e.target.value)}
                style={{ paddingLeft: '38px', fontSize: '0.85rem', height: '38px', width: '100%' }}
              />
            </div>
          </form>

          <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginLeft: 'auto' }}>
            {/* Interactive Notifications Center */}
            <NotificationCenter />

            {/* User chip linking to Settings */}
            {user && (
              <Link
                href="/dashboard/settings"
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '8px',
                  background: 'rgba(255,255,255,0.04)',
                  border: '1px solid var(--border-default)',
                  borderRadius: '9999px',
                  padding: '5px 12px 5px 6px',
                  textDecoration: 'none',
                  color: 'inherit',
                  transition: 'all 0.2s ease',
                }}
                className="user-profile-chip"
                title="Ver y editar perfil"
              >
                <div className="avatar-placeholder" style={{
                  width: 28,
                  height: 28,
                  background: 'rgba(0,207,255,0.15)',
                  color: getRoleColor(),
                  fontSize: '0.8rem',
                  fontWeight: 700,
                  borderRadius: '50%',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                }}>
                  {user.full_name?.charAt(0) || 'U'}
                </div>
                <div style={{ lineHeight: 1.2 }}>
                  <div style={{ fontSize: '0.8rem', fontWeight: 600 }}>
                    {user.full_name?.split(' ')[0] || 'Usuario'}
                  </div>
                  <div style={{ fontSize: '0.65rem', color: getRoleColor(), textTransform: 'capitalize' }}>
                    {role}
                  </div>
                </div>
              </Link>
            )}
          </div>
        </div>

        {/* Page Content */}
        <div className="page-content fade-in">
          {children}
        </div>
      </div>

      {/* Cart Drawer */}
      <CartDrawer />

      {/* Mobile Bottom Navigation Bar */}
      <BottomNav />
    </div>
  );
}
