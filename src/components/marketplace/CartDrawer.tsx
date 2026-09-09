'use client';

import React, { useState } from 'react';
import { useCart } from '@/context/CartContext';
import { useAuth } from '@/context/AuthContext';
import { useRouter } from 'next/navigation';
import { X, Trash2, Plus, Minus, ShieldCheck, ArrowRight, CheckCircle2, ShoppingBag } from 'lucide-react';

export function CartDrawer() {
  const {
    items,
    removeItem,
    updateQuantity,
    clearCart,
    isCartOpen,
    setIsCartOpen,
    totalItems,
    subtotal,
    escrowFee,
    total,
  } = useCart();

  const { user } = useAuth();
  const router = useRouter();

  const [checkingOut, setCheckingOut] = useState(false);
  const [successTx, setSuccessTx] = useState<string | null>(null);

  if (!isCartOpen) return null;

  const handleCheckout = async () => {
    setCheckingOut(true);
    // Simulate smart contract escrow deposit
    await new Promise(r => setTimeout(r, 1200));
    const randomTx = '0x' + Array.from({ length: 64 }, () => Math.floor(Math.random() * 16).toString(16)).join('');
    setSuccessTx(randomTx);
    setCheckingOut(false);
  };

  const handleFinish = () => {
    clearCart();
    setSuccessTx(null);
    setIsCartOpen(false);
    router.push('/dashboard/orders');
  };

  return (
    <>
      {/* Backdrop */}
      <div
        className="cart-overlay"
        onClick={() => !checkingOut && setIsCartOpen(false)}
      />

      {/* Slide-over Drawer */}
      <div className="cart-drawer">
        {/* Header */}
        <div className="cart-drawer-header">
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <div className="avatar-placeholder" style={{ width: 34, height: 34, background: 'rgba(0, 207, 255, 0.15)', color: 'var(--brand-cyan)' }}>
              <ShoppingBag size={18} />
            </div>
            <div>
              <div style={{ fontSize: '1.05rem', fontWeight: 700, color: 'var(--text-primary)' }}>
                Carrito de Encargos
              </div>
              <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                {totalItems} {totalItems === 1 ? 'artículo' : 'artículos'} seleccionados
              </div>
            </div>
          </div>

          <button
            type="button"
            className="btn btn-ghost btn-sm"
            onClick={() => setIsCartOpen(false)}
            style={{ width: 36, height: 36, borderRadius: '50%', padding: 0 }}
          >
            <X size={18} />
          </button>
        </div>

        {/* Content */}
        <div className="cart-drawer-content">
          {successTx ? (
            <div style={{ padding: '32px 16px', textAlign: 'center', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '16px' }}>
              <div style={{ width: 64, height: 64, borderRadius: '50%', background: 'rgba(0, 214, 143, 0.15)', border: '1px solid rgba(0, 214, 143, 0.3)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--brand-emerald)' }}>
                <CheckCircle2 size={36} />
              </div>
              <h3 style={{ fontSize: '1.25rem', fontWeight: 700, color: 'var(--text-primary)' }}>
                ¡Fondos Bloqueados en Escrow con Éxito!
              </h3>
              <p style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', lineHeight: 1.5, maxWidth: '340px' }}>
                Tu orden ha sido registrada en el Smart Contract de AYNI. Los fondos permanecerán custodiados hasta que recibas y verifiques los productos mediante OTP de entrega.
              </p>
              <div style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid var(--border-default)', borderRadius: '10px', padding: '12px', width: '100%', fontSize: '0.72rem', wordBreak: 'break-all', fontFamily: 'monospace', color: 'var(--brand-cyan)' }}>
                <div style={{ color: 'var(--text-muted)', marginBottom: '4px' }}>Hash de Transacción L2:</div>
                {successTx}
              </div>
              <button
                type="button"
                onClick={handleFinish}
                className="btn btn-primary"
                style={{ width: '100%', marginTop: '8px' }}
              >
                Ver Estado en Mis Pedidos <ArrowRight size={16} />
              </button>
            </div>
          ) : items.length === 0 ? (
            <div style={{ padding: '48px 16px', textAlign: 'center', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '14px' }}>
              <div style={{ width: 60, height: 60, borderRadius: '50%', background: 'rgba(255, 255, 255, 0.04)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--text-muted)' }}>
                <ShoppingBag size={28} />
              </div>
              <div style={{ fontSize: '1.05rem', fontWeight: 600, color: 'var(--text-primary)' }}>
                Tu carrito está vacío
              </div>
              <p style={{ fontSize: '0.825rem', color: 'var(--text-muted)', maxWidth: '280px' }}>
                Explora los condimentos y productos de origen para agregarlos a tu próximo encargo con viajeros de la comunidad.
              </p>
              <button
                type="button"
                onClick={() => setIsCartOpen(false)}
                className="btn btn-outline btn-sm"
              >
                Continuar Explorando
              </button>
            </div>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
              {items.map(item => (
                <div
                  key={item.id}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '12px',
                    padding: '12px',
                    background: 'rgba(255,255,255,0.02)',
                    border: '1px solid var(--border-subtle)',
                    borderRadius: '12px',
                  }}
                >
                  <img
                    src={item.image_url}
                    alt={item.title}
                    style={{
                      width: 56,
                      height: 56,
                      borderRadius: '8px',
                      objectFit: 'cover',
                      border: '1px solid rgba(255,255,255,0.08)',
                    }}
                  />
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{ fontSize: '0.875rem', fontWeight: 600, color: 'var(--text-primary)', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                      {item.title}
                    </div>
                    <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)' }}>
                      Origen: {item.origin_city} • {item.weight_kg}kg
                    </div>
                    <div style={{ fontSize: '0.875rem', fontWeight: 700, color: 'var(--brand-gold)', marginTop: '4px' }}>
                      ${(item.price * item.quantity).toFixed(2)} USDC
                      <span style={{ fontSize: '0.7rem', color: 'var(--text-muted)', fontWeight: 400, marginLeft: '6px' }}>
                        (${item.price.toFixed(2)} c/u)
                      </span>
                    </div>
                  </div>

                  {/* Quantity Controls */}
                  <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: '6px' }}>
                    <button
                      type="button"
                      onClick={() => removeItem(item.id)}
                      className="btn btn-ghost btn-sm"
                      style={{ padding: '4px', color: '#ff6b87', height: 'auto' }}
                      title="Eliminar"
                    >
                      <Trash2 size={14} />
                    </button>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '6px', background: 'rgba(0,0,0,0.3)', borderRadius: '6px', padding: '2px 4px', border: '1px solid var(--border-default)' }}>
                      <button
                        type="button"
                        onClick={() => updateQuantity(item.id, -1)}
                        style={{ background: 'none', border: 'none', color: 'var(--text-secondary)', cursor: 'pointer', display: 'flex', alignItems: 'center', padding: '2px' }}
                      >
                        <Minus size={12} />
                      </button>
                      <span style={{ fontSize: '0.8rem', fontWeight: 600, minWidth: '16px', textAlign: 'center' }}>
                        {item.quantity}
                      </span>
                      <button
                        type="button"
                        onClick={() => updateQuantity(item.id, 1)}
                        style={{ background: 'none', border: 'none', color: 'var(--text-secondary)', cursor: 'pointer', display: 'flex', alignItems: 'center', padding: '2px' }}
                      >
                        <Plus size={12} />
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Footer with Escrow calculation */}
        {items.length > 0 && !successTx && (
          <div className="cart-drawer-footer">
            <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', marginBottom: '16px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.825rem', color: 'var(--text-secondary)' }}>
                <span>Subtotal productos:</span>
                <span>${subtotal.toFixed(2)} USDC</span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.825rem', color: 'var(--brand-cyan)' }}>
                <span style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                  <ShieldCheck size={14} /> Custodia Escrow Smart Contract (5%):
                </span>
                <span>${escrowFee.toFixed(2)} USDC</span>
              </div>
              <div className="divider" style={{ margin: '4px 0' }} />
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '1rem', fontWeight: 700, color: 'var(--text-primary)' }}>
                <span>Total a Bloquear:</span>
                <span style={{ color: 'var(--brand-gold)' }}>${total.toFixed(2)} USDC</span>
              </div>
            </div>

            <div style={{ display: 'flex', gap: '10px' }}>
              <button
                type="button"
                onClick={clearCart}
                className="btn btn-outline btn-sm"
                style={{ flex: '0 0 auto' }}
              >
                Vaciar
              </button>
              <button
                type="button"
                onClick={handleCheckout}
                disabled={checkingOut}
                className="btn btn-primary"
                style={{ flex: 1, justifyContent: 'center' }}
              >
                {checkingOut ? (
                  <span style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <span className="spinner" /> Procesando Escrow...
                  </span>
                ) : (
                  <span style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                    Confirmar Encargo & Escrow <ArrowRight size={16} />
                  </span>
                )}
              </button>
            </div>
          </div>
        )}
      </div>
    </>
  );
}
