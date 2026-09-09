'use client';

import React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { LayoutDashboard, Store, Plane, Gift, Settings, ShoppingCart } from 'lucide-react';
import { useCart } from '@/context/CartContext';

export function BottomNav() {
  const pathname = usePathname();
  const { totalItems, setIsCartOpen } = useCart();

  const navItems = [
    { href: '/dashboard', label: 'Inicio', icon: LayoutDashboard },
    { href: '/dashboard/marketplace', label: 'Mercado', icon: Store },
    { href: '/dashboard/trips', label: 'Rutas', icon: Plane },
    { href: '/dashboard/remesas', label: 'Remesas', icon: Gift },
    { href: '/dashboard/settings', label: 'Perfil', icon: Settings },
  ];

  const isActive = (href: string) => {
    if (href === '/dashboard') return pathname === href;
    return pathname.startsWith(href);
  };

  return (
    <nav className="mobile-bottom-nav">
      {navItems.map(item => {
        const active = isActive(item.href);
        const Icon = item.icon;
        return (
          <Link
            key={item.href}
            href={item.href}
            className={`mobile-nav-item ${active ? 'active' : ''}`}
          >
            <div className="mobile-nav-icon-wrap">
              <Icon size={20} />
            </div>
            <span className="mobile-nav-label">{item.label}</span>
          </Link>
        );
      })}

      {/* Quick cart button if on marketplace or has items */}
      {totalItems > 0 && (
        <button
          type="button"
          onClick={() => setIsCartOpen(true)}
          className="mobile-nav-cart-float"
          aria-label="Ver carrito de compras"
        >
          <ShoppingCart size={18} />
          <span className="mobile-cart-badge">{totalItems}</span>
        </button>
      )}
    </nav>
  );
}
