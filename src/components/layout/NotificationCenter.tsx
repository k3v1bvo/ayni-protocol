'use client';

import React, { useState, useEffect, useRef } from 'react';
import { useRouter } from 'next/navigation';
import {
  Bell, CheckCircle2, Sparkles, Gift, ShieldCheck,
  Plane, Clock, Trash2, Check, X, ExternalLink
} from 'lucide-react';

export interface NotificationItem {
  id: string;
  title: string;
  message: string;
  time: string;
  category: 'ai' | 'remittance' | 'trip' | 'heritage';
  href: string;
  read: boolean;
}

const INITIAL_NOTIFICATIONS: NotificationItem[] = [
  {
    id: 'notif-1',
    title: 'Auditoría IA Vision Aprobada',
    message: 'El comprobante del pedido #ORD-2609-001 (Kit implantes) fue verificado al 98.8% con Gemini Vision OCR.',
    time: 'Hace 5 min',
    category: 'ai',
    href: '/dashboard/orders',
    read: false,
  },
  {
    id: 'notif-2',
    title: 'Remesa Programada Liberada',
    message: 'La remesa familiar #REM-001 de $350 USDC ha completado su TimeLock. Fondos disponibles para reclamo.',
    time: 'Hace 28 min',
    category: 'remittance',
    href: '/dashboard/remesas',
    read: false,
  },
  {
    id: 'notif-3',
    title: 'Nuevo Encargo en tu Ruta',
    message: 'Un cliente solicita transporte urgente de 1.2 kg en la ruta Madrid 🇪🇸 → La Paz 🇧🇴.',
    time: 'Hace 1 hora',
    category: 'trip',
    href: '/dashboard/orders',
    read: false,
  },
  {
    id: 'notif-4',
    title: 'Bóveda Heritage: Recordatorio Heartbeat',
    message: 'Tu contrato Dead Man\'s Switch está activo y seguro. Faltan 142 días para tu próximo ping.',
    time: 'Hace 3 horas',
    category: 'heritage',
    href: '/dashboard/heritage',
    read: true,
  },
];

export function NotificationCenter() {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [notifications, setNotifications] = useState<NotificationItem[]>(() => {
    if (typeof window !== 'undefined') {
      const saved = localStorage.getItem('ayni_notifications');
      if (saved) {
        try { return JSON.parse(saved); } catch (e) { /* fallback */ }
      }
    }
    return INITIAL_NOTIFICATIONS;
  });

  const popoverRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (typeof window !== 'undefined') {
      localStorage.setItem('ayni_notifications', JSON.stringify(notifications));
    }
  }, [notifications]);

  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (popoverRef.current && !popoverRef.current.contains(e.target as Node)) {
        setOpen(false);
      }
    }
    if (open) {
      document.addEventListener('mousedown', handleClickOutside);
    }
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [open]);

  const unreadCount = notifications.filter(n => !n.read).length;

  const markAllAsRead = () => {
    setNotifications(prev => prev.map(n => ({ ...n, read: true })));
  };

  const clearAll = () => {
    setNotifications([]);
  };

  const handleNotificationClick = (item: NotificationItem) => {
    setNotifications(prev => prev.map(n => n.id === item.id ? { ...n, read: true } : n));
    setOpen(false);
    router.push(item.href);
  };

  const getIcon = (category: NotificationItem['category']) => {
    switch (category) {
      case 'ai':
        return <Sparkles size={16} color="var(--brand-cyan)" />;
      case 'remittance':
        return <Gift size={16} color="var(--brand-emerald)" />;
      case 'trip':
        return <Plane size={16} color="var(--brand-gold)" />;
      case 'heritage':
        return <ShieldCheck size={16} color="var(--brand-purple)" />;
    }
  };

  return (
    <div style={{ position: 'relative' }} ref={popoverRef}>
      <button
        type="button"
        className="btn btn-ghost btn-sm"
        style={{ padding: '8px', position: 'relative' }}
        onClick={() => setOpen(!open)}
        aria-label="Notificaciones"
        title="Centro de Notificaciones"
      >
        <Bell size={18} />
        {unreadCount > 0 && (
          <span
            className="notif-dot"
            style={{
              position: 'absolute',
              top: '-2px',
              right: '-2px',
              background: 'var(--brand-cyan)',
              color: '#050810',
              fontWeight: 800,
              fontSize: '0.65rem',
              width: '18px',
              height: '18px',
              borderRadius: '50%',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              boxShadow: '0 0 10px rgba(0,207,255,0.6)',
            }}
          >
            {unreadCount}
          </span>
        )}
      </button>

      {open && (
        <div
          className="card"
          style={{
            position: 'absolute',
            right: 0,
            top: 'calc(100% + 10px)',
            width: '360px',
            maxWidth: '90vw',
            background: 'rgba(10, 15, 29, 0.96)',
            backdropFilter: 'blur(20px)',
            border: '1px solid rgba(0, 207, 255, 0.25)',
            boxShadow: '0 20px 50px rgba(0,0,0,0.8), 0 0 25px rgba(0,207,255,0.1)',
            borderRadius: '16px',
            zIndex: 999,
            overflow: 'hidden',
            animation: 'fadeIn 0.2s ease-out',
          }}
        >
          {/* Header */}
          <div style={{
            padding: '14px 18px',
            borderBottom: '1px solid var(--border-subtle)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            background: 'rgba(255, 255, 255, 0.02)',
          }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <span style={{ fontWeight: 700, fontSize: '0.92rem', color: 'var(--text-primary)' }}>
                Notificaciones
              </span>
              {unreadCount > 0 && (
                <span className="badge badge-cyan" style={{ fontSize: '0.68rem', padding: '2px 7px' }}>
                  {unreadCount} nuevas
                </span>
              )}
            </div>

            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              {unreadCount > 0 && (
                <button
                  type="button"
                  onClick={markAllAsRead}
                  style={{
                    background: 'transparent',
                    border: 'none',
                    color: 'var(--brand-cyan)',
                    fontSize: '0.74rem',
                    cursor: 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '4px',
                  }}
                  title="Marcar todas como leídas"
                >
                  <Check size={13} /> Leídas
                </button>
              )}
              {notifications.length > 0 && (
                <button
                  type="button"
                  onClick={clearAll}
                  style={{
                    background: 'transparent',
                    border: 'none',
                    color: 'var(--text-muted)',
                    fontSize: '0.74rem',
                    cursor: 'pointer',
                    padding: '2px',
                  }}
                  title="Limpiar todo"
                >
                  <Trash2 size={14} />
                </button>
              )}
            </div>
          </div>

          {/* List */}
          <div style={{ maxHeight: '360px', overflowY: 'auto' }}>
            {notifications.length === 0 ? (
              <div style={{ padding: '36px 20px', textAlign: 'center', color: 'var(--text-muted)', fontSize: '0.85rem' }}>
                <CheckCircle2 size={32} color="var(--brand-emerald)" style={{ margin: '0 auto 10px', opacity: 0.8 }} />
                <div>¡Todo al día! No tienes notificaciones pendientes.</div>
              </div>
            ) : (
              notifications.map(item => (
                <div
                  key={item.id}
                  onClick={() => handleNotificationClick(item)}
                  style={{
                    padding: '14px 18px',
                    borderBottom: '1px solid var(--border-subtle)',
                    cursor: 'pointer',
                    background: item.read ? 'transparent' : 'rgba(0, 207, 255, 0.04)',
                    transition: 'background 0.2s ease',
                    display: 'flex',
                    gap: '12px',
                    alignItems: 'flex-start',
                  }}
                  onMouseEnter={e => e.currentTarget.style.background = 'rgba(255, 255, 255, 0.04)'}
                  onMouseLeave={e => e.currentTarget.style.background = item.read ? 'transparent' : 'rgba(0, 207, 255, 0.04)'}
                >
                  <div style={{
                    width: 32,
                    height: 32,
                    borderRadius: 10,
                    background: 'rgba(255, 255, 255, 0.05)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    flexShrink: 0,
                    marginTop: '2px',
                  }}>
                    {getIcon(item.category)}
                  </div>

                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2px' }}>
                      <span style={{
                        fontSize: '0.82rem',
                        fontWeight: item.read ? 600 : 700,
                        color: item.read ? 'var(--text-primary)' : 'var(--brand-cyan)',
                      }}>
                        {item.title}
                      </span>
                      <span style={{ fontSize: '0.68rem', color: 'var(--text-muted)' }}>
                        {item.time}
                      </span>
                    </div>

                    <p style={{
                      fontSize: '0.78rem',
                      color: 'var(--text-secondary)',
                      lineHeight: 1.45,
                      margin: '0 0 6px',
                    }}>
                      {item.message}
                    </p>

                    <div style={{ display: 'flex', alignItems: 'center', gap: '4px', fontSize: '0.72rem', color: 'var(--brand-cyan)' }}>
                      <span>Ir al módulo</span>
                      <ExternalLink size={10} />
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      )}
    </div>
  );
}
