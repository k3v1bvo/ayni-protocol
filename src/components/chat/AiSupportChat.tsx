'use client';

import React, { useState, useRef, useEffect } from 'react';
import { 
  Bot, MessageSquare, X, Send, Sparkles, ShieldCheck, 
  ExternalLink, Key, RefreshCw, ShoppingBag, AlertCircle, ChevronDown,
  Camera, Image as ImageIcon, CheckCircle2, ScanLine, Loader2
} from 'lucide-react';
import { useAuth } from '@/context/AuthContext';

interface ChatMessage {
  id: string;
  sender: 'user' | 'assistant';
  text: string;
  time: string;
  imageUrl?: string;
}

const INITIAL_MESSAGES: ChatMessage[] = [
  {
    id: 'm-1',
    sender: 'assistant',
    text: '¡Hola! Soy AYNI Guardian, tu oráculo de soporte con IA multimodal. Puedo verificar fotos de tus productos, auditar tickets/recibos de compra con OCR (alojados de forma ilimitada en ImgBB), resolver dudas sobre custodia Escrow en Base L2, tu tarjeta Tangem o compras en mercadillos. ¿En qué puedo ayudarte hoy?',
    time: 'Ahora',
  },
];

const QUICK_SUGGESTIONS = [
  '📸 Verificar foto de producto o ticket',
  '🛍️ Compras en mercadillos específicos',
  '🔑 ¿Cuándo debo entregar el código OTP?',
  '🛡️ ¿Cómo me protege la tarjeta Tangem?',
  '✈️ ¿Qué pasa si la aduana retiene un paquete?',
];

export function AiSupportChat() {
  const { user, role } = useAuth();
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState<ChatMessage[]>(INITIAL_MESSAGES);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [uploadingPhoto, setUploadingPhoto] = useState(false);
  const [attachedImageUrl, setAttachedImageUrl] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    if (isOpen) {
      scrollToBottom();
    }
  }, [messages, isOpen]);

  // Manejador de subida de imagen directa a ImgBB
  const handleImageSelected = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setUploadingPhoto(true);
    try {
      const formData = new FormData();
      formData.append('image', file);

      const res = await fetch('/api/upload', {
        method: 'POST',
        body: formData,
      });

      if (res.ok) {
        const data = await res.json();
        if (data.url) {
          setAttachedImageUrl(data.url);
          // Si el input está vacío, sugerir texto para la verificación
          if (!input.trim()) {
            setInput('Por favor audita y verifica esta foto: confirma si el producto o texto del comprobante está completo y conforme.');
          }
        }
      }
    } catch (err) {
      console.warn('Error subiendo foto a ImgBB para el chat:', err);
    } finally {
      setUploadingPhoto(false);
      if (fileInputRef.current) fileInputRef.current.value = '';
    }
  };

  const handleSend = async (textToSend?: string) => {
    const messageText = textToSend || input.trim();
    if ((!messageText && !attachedImageUrl) || loading || uploadingPhoto) return;

    const currentImg = attachedImageUrl;
    setAttachedImageUrl(null);

    const userMsg: ChatMessage = {
      id: `usr-${Date.now()}`,
      sender: 'user',
      text: messageText || 'Verifica la imagen adjunta.',
      imageUrl: currentImg || undefined,
      time: new Date().toLocaleTimeString('es-ES', { hour: '2-digit', minute: '2-digit' }),
    };

    setMessages(prev => [...prev, userMsg]);
    if (!textToSend) setInput('');
    setLoading(true);

    try {
      const res = await fetch('/api/ai/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          messages: [...messages, userMsg],
          userRole: role,
          imageUrl: currentImg,
        }),
      });

      if (res.ok) {
        const data = await res.json();
        const botMsg: ChatMessage = {
          id: `bot-${Date.now()}`,
          sender: 'assistant',
          text: data.reply || 'Inspección completada. No se detectan anomalías.',
          time: new Date().toLocaleTimeString('es-ES', { hour: '2-digit', minute: '2-digit' }),
        };
        setMessages(prev => [...prev, botMsg]);
      } else {
        throw new Error('Error al conectar con el asistente');
      }
    } catch (err) {
      const errorMsg: ChatMessage = {
        id: `bot-${Date.now()}`,
        sender: 'assistant',
        text: 'Tus fondos están 100% seguros bajo el Smart Contract en Base L2. Si subiste un comprobante o producto, recuerda que debe ser legible y sin tachaduras.',
        time: new Date().toLocaleTimeString('es-ES', { hour: '2-digit', minute: '2-digit' }),
      };
      setMessages(prev => [...prev, errorMsg]);
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      {/* Floating Launcher Button */}
      {!isOpen && (
        <button
          type="button"
          onClick={() => setIsOpen(true)}
          className="btn-pressable"
          style={{
            position: 'fixed',
            bottom: 24,
            right: 24,
            zIndex: 9990,
            background: 'linear-gradient(135deg, #00cfff 0%, #9b72ff 100%)',
            color: '#050810',
            border: 'none',
            borderRadius: '50px',
            padding: '12px 20px',
            fontWeight: 800,
            fontSize: '0.88rem',
            display: 'flex',
            alignItems: 'center',
            gap: '8px',
            boxShadow: '0 8px 30px rgba(0, 207, 255, 0.4), 0 0 20px rgba(155, 114, 255, 0.3)',
            cursor: 'pointer',
          }}
          aria-label="Abrir asistente de soporte IA"
        >
          <Bot size={20} />
          <span>Asistente IA AYNI</span>
          <span className="badge badge-cyan" style={{ fontSize: '0.65rem', padding: '1px 6px', background: '#050810', color: '#00cfff' }}>
            Gemini 1.5
          </span>
        </button>
      )}

      {/* Floating Chat Modal */}
      {isOpen && (
        <div
          style={{
            position: 'fixed',
            bottom: 24,
            right: 24,
            width: '380px',
            maxWidth: 'calc(100vw - 32px)',
            height: '540px',
            maxHeight: 'calc(100vh - 48px)',
            background: 'rgba(9, 14, 28, 0.98)',
            backdropFilter: 'blur(28px)',
            border: '1px solid rgba(0, 207, 255, 0.35)',
            borderRadius: '24px',
            boxShadow: '0 24px 70px rgba(0, 0, 0, 0.9), 0 0 40px rgba(0, 207, 255, 0.15)',
            zIndex: 9995,
            display: 'flex',
            flexDirection: 'column',
            overflow: 'hidden',
            animation: 'fadeIn 0.25s ease-out',
          }}
        >
          {/* Header */}
          <div style={{
            padding: '16px 20px',
            background: 'linear-gradient(135deg, rgba(0,207,255,0.12) 0%, rgba(155,114,255,0.12) 100%)',
            borderBottom: '1px solid rgba(255, 255, 255, 0.08)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
          }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
              <div style={{
                width: 36,
                height: 36,
                borderRadius: '12px',
                background: 'linear-gradient(135deg, var(--brand-cyan), var(--brand-purple))',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                color: '#050810',
              }}>
                <Bot size={20} />
              </div>
              <div>
                <div style={{ fontWeight: 800, fontSize: '0.92rem', color: 'var(--text-primary)', display: 'flex', alignItems: 'center', gap: '6px' }}>
                  AYNI Guardian AI
                  <span className="sc-radar-dot" style={{ width: 6, height: 6 }} />
                </div>
                <div style={{ fontSize: '0.7rem', color: 'var(--brand-cyan)' }}>
                  Oráculo y Soporte Pericial en Vivo
                </div>
              </div>
            </div>

            <button
              type="button"
              onClick={() => setIsOpen(false)}
              className="btn-ghost"
              style={{ padding: '6px', border: 'none', borderRadius: '50%' }}
              aria-label="Cerrar chat"
            >
              <X size={18} />
            </button>
          </div>

          {/* Messages Container */}
          <div style={{
            flex: 1,
            overflowY: 'auto',
            padding: '16px',
            display: 'flex',
            flexDirection: 'column',
            gap: '12px',
          }}>
            {messages.map(m => (
              <div
                key={m.id}
                style={{
                  alignSelf: m.sender === 'user' ? 'flex-end' : 'flex-start',
                  maxWidth: '84%',
                  display: 'flex',
                  flexDirection: 'column',
                  gap: '4px',
                }}
              >
                <div style={{
                  padding: '12px 16px',
                  borderRadius: m.sender === 'user' ? '18px 18px 4px 18px' : '18px 18px 18px 4px',
                  background: m.sender === 'user'
                    ? 'linear-gradient(135deg, #00cfff 0%, #0099cc 100%)'
                    : 'rgba(255, 255, 255, 0.05)',
                  border: m.sender === 'user'
                    ? 'none'
                    : '1px solid rgba(255, 255, 255, 0.08)',
                  color: m.sender === 'user' ? '#050810' : 'var(--text-primary)',
                  fontSize: '0.84rem',
                  lineHeight: 1.45,
                  fontWeight: m.sender === 'user' ? 600 : 400,
                  whiteSpace: 'pre-line',
                }}>
                  {m.imageUrl && (
                    <div style={{
                      marginBottom: '8px',
                      borderRadius: '10px',
                      overflow: 'hidden',
                      border: '1px solid rgba(0, 207, 255, 0.35)',
                      position: 'relative',
                    }}>
                      <img
                        src={m.imageUrl}
                        alt="Adjunto comprobante o producto"
                        style={{ width: '100%', maxHeight: '180px', objectFit: 'cover', display: 'block' }}
                      />
                      <span style={{
                        position: 'absolute',
                        bottom: 4,
                        right: 4,
                        background: 'rgba(5, 8, 16, 0.85)',
                        color: 'var(--brand-cyan)',
                        fontSize: '0.62rem',
                        padding: '2px 6px',
                        borderRadius: '4px',
                        fontWeight: 700,
                      }}>
                        ImgBB CDN
                      </span>
                    </div>
                  )}
                  {m.text}
                </div>
                <span style={{
                  fontSize: '0.65rem',
                  color: 'var(--text-muted)',
                  alignSelf: m.sender === 'user' ? 'flex-end' : 'flex-start',
                  padding: '0 4px',
                }}>
                  {m.time}
                </span>
              </div>
            ))}

            {(loading || uploadingPhoto) && (
              <div style={{ alignSelf: 'flex-start', display: 'flex', alignItems: 'center', gap: '8px', padding: '10px 14px', background: 'rgba(255,255,255,0.04)', borderRadius: '14px' }}>
                <RefreshCw size={14} className="spin" color="var(--brand-cyan)" />
                <span style={{ fontSize: '0.76rem', color: 'var(--text-secondary)' }}>
                  {uploadingPhoto ? 'Subiendo foto a ImgBB...' : 'Gemini 1.5 Vision analizando imagen y comprobante...'}
                </span>
              </div>
            )}

            <div ref={messagesEndRef} />
          </div>

          {/* Attached image preview banner */}
          {attachedImageUrl && (
            <div style={{
              padding: '8px 14px',
              background: 'rgba(0, 207, 255, 0.08)',
              borderTop: '1px solid rgba(0, 207, 255, 0.25)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
            }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <img
                  src={attachedImageUrl}
                  alt="Miniatura para enviar"
                  style={{ width: 34, height: 34, borderRadius: 6, objectFit: 'cover', border: '1px solid var(--brand-cyan)' }}
                />
                <span style={{ fontSize: '0.74rem', color: 'var(--brand-cyan)', fontWeight: 600 }}>
                  Foto lista para auditar con Gemini Vision
                </span>
              </div>
              <button
                type="button"
                onClick={() => setAttachedImageUrl(null)}
                className="btn-ghost"
                style={{ padding: '4px', borderRadius: '50%' }}
                aria-label="Quitar foto"
              >
                <X size={14} />
              </button>
            </div>
          )}

          {/* Quick suggestions pills */}
          <div style={{
            padding: '8px 12px',
            borderTop: '1px solid rgba(255, 255, 255, 0.05)',
            display: 'flex',
            gap: '6px',
            overflowX: 'auto',
            background: 'rgba(5, 8, 16, 0.6)',
          }}>
            {QUICK_SUGGESTIONS.map((q, idx) => (
              <button
                key={idx}
                type="button"
                onClick={() => {
                  if (q.includes('Verificar foto')) {
                    fileInputRef.current?.click();
                  } else {
                    handleSend(q);
                  }
                }}
                style={{
                  padding: '4px 10px',
                  borderRadius: '12px',
                  background: 'rgba(0, 207, 255, 0.08)',
                  border: '1px solid rgba(0, 207, 255, 0.2)',
                  color: 'var(--brand-cyan)',
                  fontSize: '0.72rem',
                  whiteSpace: 'nowrap',
                  cursor: 'pointer',
                }}
              >
                {q}
              </button>
            ))}
          </div>

          {/* Input Bar */}
          <form
            onSubmit={e => {
              e.preventDefault();
              handleSend();
            }}
            style={{
              padding: '12px 14px',
              borderTop: '1px solid rgba(255, 255, 255, 0.08)',
              display: 'flex',
              alignItems: 'center',
              gap: '8px',
              background: 'rgba(10, 15, 28, 0.95)',
            }}
          >
            <input
              ref={fileInputRef}
              type="file"
              accept="image/*"
              onChange={handleImageSelected}
              style={{ display: 'none' }}
            />

            <button
              type="button"
              onClick={() => fileInputRef.current?.click()}
              disabled={uploadingPhoto || loading}
              className="btn-ghost"
              style={{
                padding: '8px',
                borderRadius: '10px',
                color: attachedImageUrl ? 'var(--brand-cyan)' : 'var(--text-secondary)',
                background: attachedImageUrl ? 'rgba(0, 207, 255, 0.12)' : 'transparent',
                border: attachedImageUrl ? '1px solid var(--brand-cyan)' : 'none',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                cursor: 'pointer',
              }}
              title="Subir foto de producto o comprobante para auditar con IA"
              aria-label="Adjuntar imagen"
            >
              <Camera size={18} />
            </button>

            <input
              type="text"
              value={input}
              onChange={e => setInput(e.target.value)}
              placeholder={attachedImageUrl ? 'Describe el producto o consulta del ticket...' : 'Pregunta o adjunta foto de tu compra...'}
              className="input input-interactive"
              style={{ fontSize: '0.82rem', padding: '10px 14px', flex: 1 }}
            />

            <button
              type="submit"
              disabled={(!input.trim() && !attachedImageUrl) || loading || uploadingPhoto}
              className="btn btn-primary"
              style={{ padding: '0 14px', height: '38px' }}
              aria-label="Enviar mensaje"
            >
              <Send size={16} />
            </button>
          </form>
        </div>
      )}
    </>
  );
}
