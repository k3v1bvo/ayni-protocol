'use client';

import React, { useState, useEffect } from 'react';
import { Mail, Send, CheckCircle, AlertCircle, RefreshCw, Key, Shield, Clock, Sparkles } from 'lucide-react';

export function EmailNotificationTester() {
  const [targetEmail, setTargetEmail] = useState('');
  const [emailType, setEmailType] = useState<'otp' | 'new_order' | 'heritage' | 'notification'>('otp');
  const [status, setStatus] = useState<{
    configured: boolean;
    connected?: boolean;
    message?: string;
  } | null>(null);
  
  const [loadingStatus, setLoadingStatus] = useState(false);
  const [sending, setSending] = useState(false);
  const [sendResult, setSendResult] = useState<{
    success?: boolean;
    simulated?: boolean;
    message?: string;
    messageId?: string;
  } | null>(null);

  // Check SMTP status on mount
  const checkStatus = async () => {
    setLoadingStatus(true);
    try {
      const res = await fetch('/api/email/send');
      const data = await res.json();
      setStatus(data);
    } catch (e: any) {
      setStatus({ configured: false, message: 'Error consultando servidor de correo' });
    } finally {
      setLoadingStatus(false);
    }
  };

  useEffect(() => {
    checkStatus();
  }, []);

  const handleSendTest = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!targetEmail || !targetEmail.includes('@')) return;

    setSending(true);
    setSendResult(null);

    try {
      const payload = {
        to: targetEmail,
        type: emailType,
        data: {
          recipientName: 'Tester AYNI',
          orderCode: 'AY-7719-BCN',
          otpCode: '849201',
          productTitle: 'Ají amarillo deshidratado y café de altura Yungas',
          travelerName: 'María Elena Q. (Tangem EAL6+)',
          escrowAmountUsd: 195.0,
          totalAmountUsd: 195.0,
          routeText: 'La Paz (LPZ) ➔ Barcelona (BCN)',
          vaultName: 'Bóveda Familiar Principal',
          daysRemaining: 14,
          totalStakedUsd: 12500,
          title: 'Prueba de Sistema de Notificaciones',
          message: 'Tu servicio de Google SMTP está funcionando correctamente en AYNI Protocol.',
        },
      };

      const res = await fetch('/api/email/send', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });

      const data = await res.json();
      if (res.ok && data.success) {
        setSendResult({
          success: true,
          simulated: data.simulated,
          messageId: data.messageId,
          message: data.simulated
            ? '✅ Correo simulado exitosamente en el servidor (Credenciales SMTP aún no configuradas en .env.local)'
            : '🚀 ¡Correo enviado exitosamente a tu bandeja de entrada vía Google SMTP!',
        });
      } else {
        setSendResult({
          success: false,
          message: data.error || 'Fallo al enviar correo',
        });
      }
    } catch (err: any) {
      setSendResult({
        success: false,
        message: err?.message || 'Error de conexión',
      });
    } finally {
      setSending(false);
    }
  };

  return (
    <div style={{
      background: 'linear-gradient(145deg, #0f172a 0%, #1e293b 100%)',
      border: '1px solid #334155',
      borderRadius: '16px',
      padding: '24px',
      color: '#f8fafc',
      boxShadow: '0 10px 25px -5px rgba(0, 0, 0, 0.3)',
      marginTop: '24px'
    }}>
      {/* Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
          <div style={{
            background: 'rgba(56, 189, 248, 0.15)',
            padding: '10px',
            borderRadius: '10px',
            color: '#38bdf8'
          }}>
            <Mail size={22} />
          </div>
          <div>
            <h3 style={{ margin: 0, fontSize: '16px', fontWeight: 700 }}>Google SMTP Mailer · Centro de Notificaciones</h3>
            <p style={{ margin: '2px 0 0 0', fontSize: '12px', color: '#94a3b8' }}>
              Envío de correos automáticos para Órdenes, Códigos Secretos OTP y Herencias Cripto
            </p>
          </div>
        </div>

        <button
          onClick={checkStatus}
          disabled={loadingStatus}
          style={{
            background: 'rgba(255, 255, 255, 0.05)',
            border: '1px solid #475569',
            color: '#cbd5e1',
            borderRadius: '8px',
            padding: '6px 12px',
            fontSize: '12px',
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            gap: '6px'
          }}
        >
          <RefreshCw size={14} className={loadingStatus ? 'animate-spin' : ''} />
          Verificar Conexión
        </button>
      </div>

      {/* SMTP Status Pill */}
      <div style={{
        background: status?.connected ? 'rgba(16, 185, 129, 0.1)' : 'rgba(245, 158, 11, 0.1)',
        border: `1px solid ${status?.connected ? 'rgba(16, 185, 129, 0.3)' : 'rgba(245, 158, 11, 0.3)'}`,
        borderRadius: '10px',
        padding: '10px 16px',
        marginBottom: '20px',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        fontSize: '12.5px'
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          {status?.connected ? (
            <CheckCircle size={16} color="#10b981" />
          ) : (
            <AlertCircle size={16} color="#f59e0b" />
          )}
          <span>
            <strong>Estado SMTP:</strong>{' '}
            {status?.connected
              ? 'Conectado a Google SMTP (Envío Real Activo)'
              : status?.configured
              ? 'Configurado con error de autenticación'
              : 'Modo Simulación Activo (Para envíos reales agrega SMTP_USER y SMTP_PASS)'}
          </span>
        </div>
        <span style={{
          fontSize: '11px',
          fontWeight: 700,
          textTransform: 'uppercase',
          padding: '2px 8px',
          borderRadius: '4px',
          background: status?.connected ? '#065f46' : '#78350f',
          color: status?.connected ? '#a7f3d0' : '#fde68a'
        }}>
          {status?.connected ? 'EN VIVO' : 'SIMULADO'}
        </span>
      </div>

      {/* Test Form */}
      <form onSubmit={handleSendTest}>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '14px', marginBottom: '16px' }}>
          <div>
            <label style={{ display: 'block', fontSize: '12px', fontWeight: 600, color: '#cbd5e1', marginBottom: '6px' }}>
              Correo de Destino para Prueba:
            </label>
            <input
              type="email"
              placeholder="tu-correo@gmail.com"
              value={targetEmail}
              onChange={(e) => setTargetEmail(e.target.value)}
              required
              style={{
                width: '100%',
                background: '#0b1329',
                border: '1px solid #334155',
                borderRadius: '8px',
                padding: '10px 14px',
                color: '#ffffff',
                fontSize: '13px',
                outline: 'none'
              }}
            />
          </div>

          <div>
            <label style={{ display: 'block', fontSize: '12px', fontWeight: 600, color: '#cbd5e1', marginBottom: '6px' }}>
              Plantilla de Prueba:
            </label>
            <select
              value={emailType}
              onChange={(e: any) => setEmailType(e.target.value)}
              style={{
                width: '100%',
                background: '#0b1329',
                border: '1px solid #334155',
                borderRadius: '8px',
                padding: '10px 14px',
                color: '#ffffff',
                fontSize: '13px',
                outline: 'none'
              }}
            >
              <option value="otp">🔑 Código Secreto OTP de Entrega ($195 USDC)</option>
              <option value="new_order">📦 Confirmación de Orden & Fondos Escrow</option>
              <option value="heritage">⚠️ Dead Man's Switch (Alerta de Bóveda Herencia)</option>
              <option value="notification">🔔 Notificación General del Sistema</option>
            </select>
          </div>
        </div>

        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <div style={{ fontSize: '11.5px', color: '#94a3b8' }}>
            Las plantillas son 100% responsivas con el sello criptográfico de AYNI.
          </div>
          <button
            type="submit"
            disabled={sending || !targetEmail}
            style={{
              background: sending ? '#475569' : '#0284c7',
              color: '#ffffff',
              fontWeight: 700,
              fontSize: '13px',
              padding: '10px 22px',
              borderRadius: '8px',
              border: 'none',
              cursor: sending ? 'not-allowed' : 'pointer',
              display: 'flex',
              alignItems: 'center',
              gap: '8px',
              transition: 'background 0.2s ease'
            }}
          >
            <Send size={15} />
            {sending ? 'Despachando...' : 'Enviar Correo de Prueba'}
          </button>
        </div>
      </form>

      {/* Result feedback */}
      {sendResult && (
        <div style={{
          marginTop: '16px',
          padding: '12px 16px',
          borderRadius: '8px',
          fontSize: '12.5px',
          background: sendResult.success ? 'rgba(16, 185, 129, 0.15)' : 'rgba(239, 68, 68, 0.15)',
          border: `1px solid ${sendResult.success ? '#10b981' : '#ef4444'}`,
          color: sendResult.success ? '#a7f3d0' : '#fca5a5',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center'
        }}>
          <div>{sendResult.message}</div>
          {sendResult.messageId && (
            <div style={{ fontSize: '11px', color: '#94a3b8', fontFamily: 'monospace' }}>
              ID: {sendResult.messageId}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
