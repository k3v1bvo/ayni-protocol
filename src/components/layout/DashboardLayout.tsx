'use client';

import React, { useState, useEffect } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';
import { AppSidebar } from '@/components/layout/Sidebar';
import { BottomNav } from '@/components/layout/BottomNav';
import { CartDrawer } from '@/components/marketplace/CartDrawer';
import { Bell, Search, Menu } from 'lucide-react';

export function DashboardLayout({ children }: { children: React.ReactNode }) {
  const [mobileOpen, setMobileOpen] = useState(false);
  const router = useRouter();
  const pathname = usePathname();
  const { user, role, isLoading } = useAuth();

  useEffect(() => {
    if (!isLoading && !user) {
      const target = pathname && pathname !== '/dashboard' ? pathname : '/dashboard';
      router.replace('/auth?redirect=' + encodeURIComponent(target));
    }
  }, [isLoading, user, router, pathname]);

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
        gap: '16px',
      }}>
        <div style={{
          width: '42px',
          height: '42px',
          border: '3px solid rgba(0, 207, 255, 0.15)',
          borderTopColor: 'var(--brand-cyan)',
          borderRadius: '50%',
          animation: 'spin 0.8s linear infinite',
        }} />
        <div style={{ fontSize: '0.9rem', fontWeight: 500, color: 'var(--text-muted)' }}>
          Verificando sesión segura AYNI Protocol...
        </div>
      </div>
    );
  }

  const getRoleColor = () => {
    if (role === 'traveler') return 'var(--brand-cyan)';
    if (role === 'merchant') return 'var(--brand-emerald)';
    if (role === 'admin') return 'var(--brand-purple)';
    return 'var(--brand-gold)';
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

          {/* Search */}
          <div className="topbar-search" style={{ flex: 1, maxWidth: 420 }}>
            <div className="input-icon-wrap">
              <Search size={16} className="input-icon" />
              <input
                type="search"
                placeholder="Buscar rutas, pedidos, productos..."
                className="input"
                style={{ paddingLeft: '40px', fontSize: '0.85rem', height: '38px' }}
              />
            </div>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginLeft: 'auto' }}>
            {/* Notifications */}
            <div style={{ position: 'relative' }}>
              <button
                type="button"
                className="btn btn-ghost btn-sm"
                style={{ padding: '8px' }}
                onClick={() => alert('Tienes 3 notificaciones activas: 1 entrega verificada por IA, 1 remesa liberada y 1 encargo disponible en tu ruta.')}
              >
                <Bell size={18} />
              </button>
              <span className="notif-dot" style={{ position: 'absolute', top: '-4px', right: '-4px' }}>3</span>
            </div>

            {/* User chip */}
            {user && (
              <div style={{
                display: 'flex',
                alignItems: 'center',
                gap: '8px',
                background: 'rgba(255,255,255,0.04)',
                border: '1px solid var(--border-default)',
                borderRadius: '9999px',
                padding: '5px 12px 5px 6px',
              }}>
                <div className="avatar-placeholder" style={{
                  width: 28,
                  height: 28,
                  background: 'rgba(0,207,255,0.15)',
                  color: getRoleColor(),
                  fontSize: '0.8rem',
                  fontWeight: 700,
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
              </div>
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
