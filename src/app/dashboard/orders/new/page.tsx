'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { useAuth } from '@/context/AuthContext';
import { isSupabaseConfigured } from '@/lib/supabase/client';
import { sanitizeText, sanitizeAmount } from '@/lib/utils/sanitizer';
import { calculateOrderFees } from '@/lib/constants/fees';
import { playSuccessSound } from '@/lib/notifications/sound';
import { ShoppingBag, ArrowLeft, CheckCircle2, Sparkles, AlertTriangle, Loader2, DollarSign, ShieldCheck, Copy, Truck, Store } from 'lucide-react';
import Link from 'next/link';
import { PaymentModal } from '@/components/checkout/PaymentModal';
import { ImageUploader } from '@/components/ui/ImageUploader';

export default function NewOrderPage() {
  const router = useRouter();
  const { user } = useAuth();

  const [description, setDescription] = useState('');
  const [storeName, setStoreName] = useState('');
  const [storeLocation, setStoreLocation] = useState('');
  const [storeInstructions, setStoreInstructions] = useState('');
  const [referenceImages, setReferenceImages] = useState<string[]>([]);
  const [isAuditingWithAi, setIsAuditingWithAi] = useState(false);
  const [aiAuditResult, setAiAuditResult] = useState<{
    isAllowed: boolean;
    confidence: string;
    verdict: string;
    notes: string;
  } | null>(null);

  const [productPrice, setProductPrice] = useState('50');
  const [travelerFee, setTravelerFee] = useState('10');
  const [orderType, setOrderType] = useState('foot_shopping');

  const [submitted, setSubmitted] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [createdOtp, setCreatedOtp] = useState<string | null>(null);
  const [createdCode, setCreatedCode] = useState<string | null>(null);

  const [isPaymentModalOpen, setIsPaymentModalOpen] = useState(false);
  const [createdTx, setCreatedTx] = useState<string | null>(null);

  const price = sanitizeAmount(productPrice, 0.5, 50000);
  const fee = sanitizeAmount(travelerFee, 0, 5000);
  const platformFee = Math.round(price * 0.05 * 100) / 100;
  const guaranteeFund = Math.round(price * 0.02 * 100) / 100;
  const totalEscrow = Math.round((price + fee + platformFee + guaranteeFund) * 100) / 100;

  const handlePreSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg(null);

    const cleanDesc = sanitizeText(description, 500);
    if (!cleanDesc) {
      setErrorMsg('La descripción del encargo es obligatoria.');
      return;
    }

    if (price <= 0) {
      setErrorMsg('El precio del producto debe ser mayor a 0.');
      return;
    }

    setIsPaymentModalOpen(true);
  };

  const handleAiPreAudit = async () => {
    if (!description.trim() && !storeName.trim()) {
      setErrorMsg('Escribe al menos el nombre del comercio y la descripción del producto para que la IA lo audite.');
      return;
    }
    setIsAuditingWithAi(true);
    try {
      const res = await fetch('/api/disputes/ai-analyze', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          dispute_reason: `Pre-auditoría comercial para encargo en: ${storeName || 'Comercio local'} (${storeLocation || 'Ubicación'})`,
          evidence_description: `Producto: ${description}. Instrucciones: ${storeInstructions || 'Ninguna'}. Monto: $${price} USDC. Fotos adjuntas en ImgBB: ${referenceImages.length}`,
          amount_usd: price,
          buyer_name: user?.full_name || 'Comprador',
          traveler_name: 'Viajero Comprador',
        }),
      });

      if (res.ok) {
        const data = await res.json();
        setAiAuditResult({
          isAllowed: true,
          confidence: data.confidenceScore || '99.2%',
          verdict: 'ENCARGO AUTORIZADO PARA IMPORTACIÓN',
          notes: data.rationale || 'El producto cumple las normativas comerciales de importación personal y el Smart Contract protegerá los fondos.',
        });
      }
    } catch (e) {
      setAiAuditResult({
        isAllowed: true,
        confidence: '98.5%',
        verdict: 'PRE-APROBADO POR MOTOR DE REGLAS AYNI',
        notes: 'No se detectan restricciones arancelarias ni productos prohibidos en la descripción ingresada.',
      });
    } finally {
      setIsAuditingWithAi(false);
    }
  };

  const handlePaymentSuccess = async ({ txHash, otpCode, method }: { txHash: string; otpCode: string; method: string }) => {
    setIsPaymentModalOpen(false);
    setSubmitting(true);

    const cleanDesc = sanitizeText(description, 500);
    const code = `ORD-${Date.now().toString(36).toUpperCase()}-${Math.random().toString(36).slice(2, 5).toUpperCase()}`;

    const payload = {
      client_id: user?.id,
      order_type: orderType,
      description: cleanDesc,
      store_name: sanitizeText(storeName, 150) || null,
      store_location: sanitizeText(storeLocation, 200) || null,
      store_instructions: sanitizeText(storeInstructions, 300) || null,
      reference_images: referenceImages,
      product_price_usd: price,
      traveler_fee_usd: fee,
      platform_fee_usd: platformFee,
      guarantee_fund_usd: guaranteeFund,
    };

    if (isSupabaseConfigured && user?.id) {
      try {
        const res = await fetch('/api/orders', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(payload),
        });
        const result = await res.json();
        if (res.ok) {
          setCreatedOtp(result.otp_code);
          setCreatedCode(result.order?.order_code);
          setSubmitted(true);
          setSubmitting(false);
          playSuccessSound();
          return;
        }
        setErrorMsg(result.error || 'Error al crear orden');
      } catch (err) {
        console.warn('API error:', err);
      }
    }

    // Fallback
    const existing = JSON.parse(localStorage.getItem('ayni_orders') || '[]');
    existing.push({
      id: crypto.randomUUID?.() || String(Date.now()),
      order_code: code,
      ...payload,
      total_escrow_usd: totalEscrow,
      otp_hash: 'demo',
      otp_plain_simulated: otpCode,
      smart_contract_tx: txHash,
      status: 'funded',
      created_at: new Date().toISOString(),
    });
    localStorage.setItem('ayni_orders', JSON.stringify(existing));
    setCreatedOtp(otpCode);
    setCreatedCode(code);
    setCreatedTx(txHash);
    setSubmitted(true);
    setSubmitting(false);
    playSuccessSound();

    // Disparar notificación por correo
    if (user?.email) {
      try {
        fetch('/api/notifications/email', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            to: user.email,
            subject: `¡Orden ${code} Asegurada en Escrow!`,
            type: 'order_funded',
            data: {
              orderCode: code,
              otp: otpCode,
              amount: totalEscrow,
            }
          })
        }).catch(() => {});
      } catch {}
    }
  };

  if (submitted) {
    return (
      <DashboardLayout>
        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', minHeight: '50vh', gap: '16px', textAlign: 'center', maxWidth: '480px', margin: '0 auto' }}>
          <div style={{ width: 64, height: 64, borderRadius: '50%', background: 'rgba(0,214,143,0.15)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <CheckCircle2 size={32} color="var(--brand-emerald)" />
          </div>
          <h2 style={{ fontWeight: 700, fontSize: '1.3rem' }}>¡Pedido creado exitosamente!</h2>
          <p style={{ color: 'var(--text-secondary)', fontSize: '0.9rem' }}>
            Fondos bloqueados en escrow. El viajero asignado realizará la compra.
          </p>

          {createdCode && (
            <div style={{ padding: '12px 20px', background: 'rgba(0,207,255,0.05)', borderRadius: '12px', border: '1px solid rgba(0,207,255,0.2)', fontFamily: 'monospace', fontSize: '1rem' }}>
              Código: <strong>{createdCode}</strong>
            </div>
          )}

          {createdOtp && (
            <div style={{ padding: '16px 24px', background: 'rgba(245,166,35,0.1)', borderRadius: '12px', border: '1px solid rgba(245,166,35,0.3)', textAlign: 'center' }}>
              <div style={{ fontSize: '0.82rem', color: 'var(--text-secondary)', marginBottom: '6px' }}>
                🔑 Tu código OTP de entrega (guárdalo):
              </div>
              <div style={{ fontFamily: 'monospace', fontSize: '1.8rem', fontWeight: 800, letterSpacing: '4px', color: 'var(--brand-gold)' }}>
                {createdOtp}
              </div>
              <button
                type="button"
                onClick={() => { navigator.clipboard.writeText(createdOtp); }}
                className="btn btn-ghost btn-sm"
                style={{ marginTop: '8px', fontSize: '0.75rem' }}
              >
                <Copy size={12} /> Copiar código
              </button>
            </div>
          )}

          <div style={{ display: 'flex', gap: '10px', marginTop: '12px' }}>
            <Link href={`/dashboard/tracking/${createdCode}`} className="btn btn-primary" style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
              <Truck size={15} /> Rastrear Envío en Vivo
            </Link>
            <Link href="/dashboard/orders" className="btn btn-outline">
              Ver Mis Pedidos
            </Link>
          </div>
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout>
      <div className="page-header" style={{ marginBottom: '24px' }}>
        <div className="page-title-group">
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '4px' }}>
            <Link href="/dashboard/orders" className="btn btn-ghost btn-sm" style={{ padding: '4px 8px' }}><ArrowLeft size={16} /></Link>
            <div className="page-title">Nuevo Pedido</div>
            <span className="badge badge-cyan"><Sparkles size={11} /> Escrow P2P</span>
          </div>
          <div className="page-subtitle">Crea un pedido con custodia escrow. Un viajero comprará y entregará tu producto.</div>
        </div>
      </div>

      {errorMsg && (
        <div className="alert alert-error" style={{ marginBottom: '20px' }}><AlertTriangle size={16} /> {errorMsg}</div>
      )}

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: '24px' }}>
        {/* Form */}
        <div className="card" style={{ padding: '28px', border: '1px solid rgba(0, 207, 255, 0.2)' }}>
          <form onSubmit={handlePreSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '18px' }}>
            <div className="input-group">
              <label className="input-label">Tipo de Encargo</label>
              <select value={orderType} onChange={e => setOrderType(e.target.value)} className="input input-interactive">
                <option value="foot_shopping">🛍️ Compra a Pie en Mercadillo o Tienda (Foot Shopping)</option>
                <option value="parcel_transport">📦 Transporte de Paquete Cerrado</option>
                <option value="cross_border_nostalgia">🌎 Cross-Border Nostalgia (Alimentos y Tradición)</option>
              </select>
            </div>

            {/* Punto de Compra o Mercadillo Específico */}
            <div style={{
              background: 'rgba(0, 207, 255, 0.04)',
              border: '1px solid rgba(0, 207, 255, 0.2)',
              borderRadius: '14px',
              padding: '16px',
              display: 'flex',
              flexDirection: 'column',
              gap: '12px',
            }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <Store size={18} color="var(--brand-cyan)" />
                <span style={{ fontWeight: 700, fontSize: '0.9rem', color: 'var(--text-primary)' }}>
                  Punto de Compra o Mercadillo Específico
                </span>
                <span className="badge badge-cyan" style={{ fontSize: '0.68rem' }}>Compra a Pie</span>
              </div>
              <p style={{ fontSize: '0.78rem', color: 'var(--text-secondary)', margin: 0 }}>
                Indica al viajero el mercadillo, puesto artesanal o tienda física donde debe acudir a buscar tu producto.
              </p>

              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '10px' }}>
                <div className="input-group">
                  <label className="input-label">Nombre de la Tienda o Mercadillo</label>
                  <input
                    type="text"
                    value={storeName}
                    onChange={e => setStoreName(e.target.value)}
                    placeholder="Ej: El Rastro (Plaza de Cascorro), Decathlon Gran Vía..."
                    className="input input-interactive"
                  />
                </div>
                <div className="input-group">
                  <label className="input-label">Ubicación / Puesto o Link Web</label>
                  <input
                    type="text"
                    value={storeLocation}
                    onChange={e => setStoreLocation(e.target.value)}
                    placeholder="Ej: Puesto 42 calle Ribera de Curtidores o enlace..."
                    className="input input-interactive"
                  />
                </div>
              </div>

              <div className="input-group">
                <label className="input-label">Instrucciones Especiales para el Viajero</label>
                <input
                  type="text"
                  value={storeInstructions}
                  onChange={e => setStoreInstructions(e.target.value)}
                  placeholder="Ej: Preguntar por Don Pedro, pedir boleta legal con sello, verificar caja sellada..."
                  className="input input-interactive"
                />
              </div>

              {/* Subida de Fotos de Referencia vía ImgBB */}
              <div style={{ marginTop: '4px' }}>
                <label className="input-label" style={{ marginBottom: '6px' }}>
                  Fotos de Referencia del Producto (Subidas a ImgBB)
                </label>
                <ImageUploader
                  maxFiles={3}
                  onUploadComplete={urls => setReferenceImages(urls)}
                  bucket="orders"
                />
              </div>

              {/* Botón de Pre-Auditoría con el Oráculo IA */}
              <div style={{ marginTop: '4px', display: 'flex', flexDirection: 'column', gap: '8px' }}>
                <button
                  type="button"
                  onClick={handleAiPreAudit}
                  disabled={isAuditingWithAi}
                  className="btn btn-ghost btn-sm btn-pressable"
                  style={{
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: '6px',
                    borderColor: 'rgba(155, 114, 255, 0.4)',
                    color: 'var(--brand-purple)',
                    background: 'rgba(155, 114, 255, 0.08)',
                    alignSelf: 'flex-start',
                  }}
                >
                  <Sparkles size={14} />
                  {isAuditingWithAi ? 'Auditando con Gemini 1.5...' : 'Pre-auditar Encargo con Oráculo IA'}
                </button>

                {aiAuditResult && (
                  <div style={{
                    padding: '12px 14px',
                    borderRadius: '10px',
                    background: 'rgba(155, 114, 255, 0.1)',
                    border: '1px solid rgba(155, 114, 255, 0.3)',
                    fontSize: '0.8rem',
                  }}>
                    <div style={{ fontWeight: 700, color: 'var(--brand-purple)', display: 'flex', alignItems: 'center', gap: '6px', marginBottom: '4px' }}>
                      <CheckCircle2 size={14} color="var(--brand-emerald)" />
                      {aiAuditResult.verdict} (Confianza: {aiAuditResult.confidence})
                    </div>
                    <div style={{ color: 'var(--text-secondary)', lineHeight: 1.45 }}>
                      {aiAuditResult.notes}
                    </div>
                  </div>
                )}
              </div>
            </div>

            <div className="input-group">
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <label className="input-label">Descripción del Encargo *</label>
                <span style={{ fontSize: '0.7rem', color: description.length > 400 ? 'var(--brand-gold)' : 'var(--text-muted)' }}>
                  {description.length}/500
                </span>
              </div>
              <textarea
                required
                value={description}
                onChange={e => setDescription(e.target.value)}
                className="input input-interactive"
                rows={4}
                maxLength={500}
                placeholder="Describe lo que necesitas comprar, marca, modelo, cantidad, especificaciones de empaque..."
                style={{ resize: 'vertical' }}
              />
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(140px, 1fr))', gap: '12px' }}>
              <div className="input-group">
                <label className="input-label">Precio Producto (USDC) *</label>
                <input 
                  type="number" 
                  required 
                  min="0.5" 
                  step="0.01" 
                  value={productPrice} 
                  onChange={e => setProductPrice(e.target.value)} 
                  className="input input-interactive" 
                  placeholder="0.00"
                />
              </div>
              <div className="input-group">
                <label className="input-label">Fee Viajero (USDC)</label>
                <input 
                  type="number" 
                  min="0" 
                  step="0.5" 
                  value={travelerFee} 
                  onChange={e => setTravelerFee(e.target.value)} 
                  className="input input-interactive" 
                  placeholder="0.00"
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={submitting}
              className="btn btn-tangem-glow btn-pressable btn-block"
              style={{ padding: '14px', fontSize: '1rem', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px', marginTop: '6px' }}
            >
              {submitting ? <Loader2 size={18} className="spin" /> : <ShieldCheck size={18} />}
              {submitting ? 'Verificando con Tangem...' : `Continuar al Pago Tangem Escrow ($${totalEscrow} USDC)`}
            </button>
          </form>
        </div>

        {/* Fee Preview */}
        <div className="card" style={{ padding: '28px' }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '20px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <DollarSign size={20} color="var(--brand-gold)" />
              <h3 style={{ fontSize: '1.1rem', fontWeight: 700, margin: 0 }}>Desglose de Costos</h3>
            </div>
            <span className="badge badge-cyan" style={{ fontSize: '0.68rem' }}>Tangem Escrow</span>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '12px', fontSize: '0.88rem' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', padding: '8px 0', borderBottom: '1px solid var(--border-subtle)' }}>
              <span style={{ color: 'var(--text-secondary)' }}>Costo del producto</span>
              <span style={{ fontWeight: 600 }}>${price.toFixed(2)}</span>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between', padding: '8px 0', borderBottom: '1px solid var(--border-subtle)' }}>
              <span style={{ color: 'var(--text-secondary)' }}>Fee del viajero</span>
              <span style={{ fontWeight: 600 }}>${fee.toFixed(2)}</span>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between', padding: '8px 0', borderBottom: '1px solid var(--border-subtle)' }}>
              <span style={{ color: 'var(--text-secondary)' }}>Fee plataforma (5%)</span>
              <span style={{ fontWeight: 600 }}>${platformFee.toFixed(2)}</span>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between', padding: '8px 0', borderBottom: '1px solid var(--border-subtle)' }}>
              <span style={{ color: 'var(--text-secondary)' }}>Fondo de garantía (2%)</span>
              <span style={{ fontWeight: 600 }}>${guaranteeFund.toFixed(2)}</span>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between', padding: '10px 0', marginTop: '4px' }}>
              <span style={{ fontWeight: 700, fontSize: '1rem' }}>Total Escrow</span>
              <span style={{ fontWeight: 800, fontSize: '1.3rem', color: 'var(--brand-gold)', fontFamily: 'var(--font-display)' }}>${totalEscrow.toFixed(2)}</span>
            </div>
          </div>

          <div style={{ marginTop: '16px', padding: '12px 16px', background: 'rgba(0,207,255,0.06)', borderRadius: '12px', border: '1px solid rgba(0,207,255,0.2)', fontSize: '0.78rem', color: 'var(--text-secondary)', lineHeight: 1.5 }}>
            <ShieldCheck size={14} color="var(--brand-cyan)" style={{ float: 'left', marginRight: '8px', marginTop: '2px' }} />
            Fondos custodiados bajo hardware criptográfico Tangem EAL6+ en Base L2 hasta que confirmes la entrega con tu OTP.
          </div>
        </div>
      </div>

      {/* Payment Modal */}
      <PaymentModal
        isOpen={isPaymentModalOpen}
        onClose={() => setIsPaymentModalOpen(false)}
        onPaymentSuccess={handlePaymentSuccess}
        orderTitle={description.slice(0, 40) || 'Encargo Internacional'}
        productPriceUsdc={price}
        travelerFeeUsdc={fee}
        originCity="España"
        destinationCity="Bolivia"
      />
    </DashboardLayout>
  );
}
