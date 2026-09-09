'use client';

import React, { useState, useEffect } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import Link from 'next/link';
import { useAuth } from '@/context/AuthContext';
import {
  LayoutDashboard, Plane, ShoppingBag, Package, ShieldCheck, BarChart3,
  Store, Star, LogOut, Bell, Search, Menu, X, ChevronRight, Sparkles, Wallet, Settings
} from 'lucide-react';

interface SidebarProps { mobileOpen: boolean; onClose: () => void; }

const NAV_ITEMS = {
  common: [
    { href: '/dashboard', label: 'Dashboard', icon: LayoutDashboard },
    { href: '/dashboard/marketplace', label: 'Marketplace', icon: Store },
  ],
  client: [
    { href: '/dashboard/orders', label: 'Mis Pedidos', icon: ShoppingBag },
    { href: '/dashboard/trips', label: 'Rutas Disponibles', icon: Plane },
  ],
  traveler: [
    { href: '/dashboard/my-trips', label: 'Mis Viajes', icon: Plane },
    { href: '/dashboard/orders', label: 'Encargos Activos', icon: Package },
    { href: '/dashboard/earnings', label: 'Mis Ganancias', icon: BarChart3 },
  ],
  merchant: [
    { href: '/dashboard/my-store', label: 'Mi Tienda', icon: Store },
    { href: '/dashboard/products', label: 'Productos', icon: Package },
    { href: '/dashboard/orders', label: 'Pedidos Recibidos', icon: ShoppingBag },
    { href: '/dashboard/earnings', label: 'Mis Ventas', icon: BarChart3 },
  ],
  admin: [
    { href: '/dashboard/reports', label: 'Reportes & IA', icon: BarChart3 },
    { href: '/dashboard/users', label: 'Usuarios', icon: ShieldCheck },
  ],
};

function SidebarContent({ onClose }: { onClose?: () => void }) {
  const pathname = usePathname();
  const router = useRouter();
  const { user, role, signOut, setDemoUser } = useAuth();

  const roleItems = NAV_ITEMS[role] || [];

  const isActive = (href: string) =>
    href === '/dashboard' ? pathname === href : pathname.startsWith(href);

  const handleSignOut = async () => {
    await signOut();
    router.push('/');
  };

  const getRoleBadgeClass = () => {
    if (role === 'traveler') return 'badge badge-cyan';
    if (role === 'merchant') return 'badge badge-emerald';
    if (role === 'admin') return 'badge badge-purple';
    return 'badge badge-gold';
  };

  const getRoleLabel = () => {
    const labels: Record<string, string> = {
      client: 'Cliente',
      traveler: 'Viajero',
      merchant: 'Comerciante',
      admin: 'Auditor',
    };
    return labels[role] || role;
  };

  return (
    <>
      {/* Logo */}
      <a href="/dashboard" className="sidebar-logo">
        <div className="sidebar-logo-icon">A</div>
        <div className="sidebar-logo-text">
          <div className="sidebar-logo-name">AYNI</div>
          <div className="sidebar-logo-sub">Protocolo Global P2P & Escrow</div>
        </div>
      </a>

      {/* User Profile Card */}
      {user && (
        <div style={{
          margin: '12px',
          padding: '14px',
          background: 'rgba(255,255,255,0.03)',
          border: '1px solid rgba(255,255,255,0.06)',
          borderRadius: '12px',
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '10px' }}>
            <div className="avatar-placeholder" style={{
              width: 38,
              height: 38,
              background: 'linear-gradient(135deg, #00cfff22, #f5a62322)',
              border: '1px solid rgba(255,255,255,0.1)',
              color: '#00cfff',
              fontSize: '1rem',
            }}>
              {user.full_name?.charAt(0) || user.email?.charAt(0)}
            </div>
            <div style={{ minWidth: 0 }}>
              <div style={{ fontSize: '0.875rem', fontWeight: 600, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                {user.full_name || user.email?.split('@')[0]}
              </div>
              <div style={{ fontSize: '0.7rem', color: 'var(--text-muted)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                {user.email}
              </div>
            </div>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <span className={getRoleBadgeClass()}>{getRoleLabel()}</span>
            <span style={{ fontSize: '0.75rem', color: 'var(--brand-gold)', fontWeight: 600 }}>
              ★ {user.reputation_score?.toFixed(1)}
            </span>
          </div>
        </div>
      )}

      {/* Common Nav */}
      <div className="sidebar-section">
        <div className="sidebar-section-label">General</div>
        {NAV_ITEMS.common.map(item => (
          <Link
            key={item.href}
            href={item.href}
            className={`sidebar-item ${isActive(item.href) ? 'active' : ''}`}
            onClick={onClose}
          >
            <div className="sidebar-item-icon">
              <item.icon size={16} />
            </div>
            {item.label}
          </Link>
        ))}
        {/* AYNI Heritage Module */}
        <Link
          href="/dashboard/heritage"
          className={`sidebar-item ${isActive('/dashboard/heritage') ? 'active' : ''}`}
          onClick={onClose}
        >
          <div className="sidebar-item-icon">
            <ShieldCheck size={16} color="var(--brand-gold)" />
          </div>
          Herencias & Bóvedas
        </Link>
      </div>

      {/* Role-specific Nav */}
      {roleItems.length > 0 && (
        <div className="sidebar-section">
          <div className="sidebar-section-label">
            {role === 'traveler' ? 'Mi actividad de Viajero' :
              role === 'merchant' ? 'Mi actividad de Comercio' :
              role === 'admin' ? 'Administración' : 'Mis Encargos'}
          </div>
          {roleItems.map(item => (
            <Link
              key={item.href}
              href={item.href}
              className={`sidebar-item ${isActive(item.href) ? 'active' : ''}`}
              onClick={onClose}
            >
              <div className="sidebar-item-icon">
                <item.icon size={16} />
              </div>
              {item.label}
            </Link>
          ))}
        </div>
      )}

      {/* Protocol Trust & Security Card */}
      <div className="sidebar-section" style={{ marginTop: 'auto' }}>
        <div style={{
          padding: '12px',
          background: 'linear-gradient(135deg, rgba(0,207,255,0.05) 0%, rgba(245,166,35,0.05) 100%)',
          border: '1px solid rgba(0,207,255,0.12)',
          borderRadius: '10px',
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '6px', marginBottom: '6px' }}>
            <span style={{ width: 6, height: 6, borderRadius: '50%', background: 'var(--brand-emerald)', boxShadow: '0 0 6px var(--brand-emerald)' }} />
            <span style={{ fontSize: '0.72rem', fontWeight: 600, color: 'var(--brand-cyan)' }}>Red AYNI Protocol L2</span>
          </div>
          <div style={{ fontSize: '0.68rem', color: 'var(--text-muted)', lineHeight: 1.4 }}>
            Escrow Inteligente Activo • Auditoría Criptográfica OTP
          </div>
        </div>
      </div>

      {/* Wallet / Settings / Logout */}
      <div className="sidebar-bottom">
        <Link href="/dashboard/settings" className="sidebar-item" onClick={onClose}>
          <div className="sidebar-item-icon"><Settings size={16} /></div>
          Configuración
        </Link>
        <button type="button" onClick={handleSignOut} className="sidebar-item" style={{ color: '#ff6b87' }}>
          <div className="sidebar-item-icon" style={{ color: '#ff6b87' }}><LogOut size={16} /></div>
          Cerrar Sesión
        </button>
      </div>
    </>
  );
}

export function AppSidebar({ mobileOpen, onClose }: SidebarProps) {
  return (
    <>
      {/* Desktop Sidebar */}
      <div className="sidebar" style={{ display: 'flex' }}>
        <SidebarContent />
      </div>

      {/* Mobile Overlay */}
      {mobileOpen && (
        <div
          style={{
            position: 'fixed',
            inset: 0,
            background: 'rgba(0,0,0,0.6)',
            zIndex: 49,
            backdropFilter: 'blur(4px)',
          }}
          onClick={onClose}
        />
      )}

      {/* Mobile Sidebar */}
      <div
        className="sidebar"
        style={{
          transform: mobileOpen ? 'translateX(0)' : 'translateX(-100%)',
          transition: 'transform 0.25s ease',
          zIndex: 51,
          display: 'flex',
        }}
      >
        <div style={{ position: 'absolute', top: 16, right: 16 }}>
          <button type="button" onClick={onClose} className="btn btn-ghost btn-sm">
            <X size={16} />
          </button>
        </div>
        <SidebarContent onClose={onClose} />
      </div>
    </>
  );
}
