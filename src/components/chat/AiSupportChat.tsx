'use client';

import React, { useState, useRef, useEffect, useCallback } from 'react';
import {
  Bot, X, Send, Sparkles, RefreshCw,
  Camera, Maximize2, Minimize2, Trash2, ChevronDown
} from 'lucide-react';
import { useAuth } from '@/context/AuthContext';

interface ChatMessage {
  id: string;
  sender: 'user' | 'assistant';
  text: string;
  time: string;
  imageUrl?: string;
  status?: 'sending' | 'sent' | 'error';
  provider?: string;
}

const INITIAL_MESSAGE: ChatMessage = {
  id: 'm-init',
  sender: 'assistant',
  text: '¡Hola! Soy **AYNI Guardian**, tu asistente de soporte con IA. Puedo ayudarte con:\n\n• 📦 Verificar fotos de productos y recibos\n• 🔑 Dudas sobre el código OTP\n• 💳 Billetera Tangem y custodia\n• 🏛️ Herencias cripto (Heritage)\n• ⚖️ Disputas y protección\n\n¿En qué puedo ayudarte?',
  time: 'Ahora',
  status: 'sent',
  provider: 'system',
};

const QUICK_ACTIONS = [
  { label: '📸 Verificar foto', action: 'photo' },
  { label: '🔑 ¿Cómo funciona el OTP?', action: 'send', text: '¿Cómo funciona el código OTP y cuándo debo entregarlo?' },
  { label: '💳 Tangem', action: 'send', text: '¿Cómo funciona la billetera Tangem y cómo protege mis fondos?' },
  { label: '📦 Estado pedido', action: 'send', text: '¿Cómo puedo ver el estado de mi pedido?' },
  { label: '🏛️ Heritage', action: 'send', text: 'Explícame cómo funcionan las bóvedas de herencia cripto AYNI Heritage.' },
];

// Formatear texto con negritas, viñetas y líneas
function renderFormattedText(text: string) {
  const lines = text.split('\n');

  return lines.map((line, i) => {
    // Convertir **texto** en negritas
    const parts = line.split(/(\*\*[^*]+\*\*)/g);
    const formattedParts = parts.map((part, j) => {
      if (part.startsWith('**') && part.endsWith('**')) {
        return <strong key={j} style={{ color: 'var(--brand-cyan)', fontWeight: 700 }}>{part.slice(2, -2)}</strong>;
      }
      return <span key={j}>{part}</span>;
    });

    // Viñetas
    if (line.startsWith('• ') || line.startsWith('- ')) {
      return (
        <div key={i} style={{ paddingLeft: '8px', display: 'flex', gap: '6px', marginTop: '2px' }}>
          <span style={{ color: 'var(--brand-cyan)', flexShrink: 0 }}>•</span>
          <span>{formattedParts}</span>
        </div>
      );
    }

    // Líneas vacías
    if (line.trim() === '') {
      return <div key={i} style={{ height: '6px' }} />;
    }

    return <div key={i}>{formattedParts}</div>;
  });
}

export function AiSupportChat() {
  const { user, role } = useAuth();
  const [isOpen, setIsOpen] = useState(false);
  const [isExpanded, setIsExpanded] = useState(false);
  const [messages, setMessages] = useState<ChatMessage[]>([INITIAL_MESSAGE]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [uploadingPhoto, setUploadingPhoto] = useState(false);
  const [attachedImageUrl, setAttachedImageUrl] = useState<string | null>(null);
  const [showScrollBtn, setShowScrollBtn] = useState(false);
  const [unreadCount, setUnreadCount] = useState(0);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const messagesContainerRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  const scrollToBottom = useCallback(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    setShowScrollBtn(false);
  }, []);

  useEffect(() => {
    if (isOpen) {
      scrollToBottom();
      setUnreadCount(0);
      // Focus input
      setTimeout(() => inputRef.current?.focus(), 300);
    }
  }, [isOpen, scrollToBottom]);

  useEffect(() => {
    if (isOpen) scrollToBottom();
    else if (messages.length > 1) {
      const lastMsg = messages[messages.length - 1];
      if (lastMsg.sender === 'assistant' && lastMsg.id !== 'm-init') {
        setUnreadCount(prev => prev + 1);
      }
    }
  }, [messages, isOpen, scrollToBottom]);

  // Detectar scroll para mostrar botón "ir abajo"
  const handleScroll = () => {
    const container = messagesContainerRef.current;
    if (!container) return;
    const isNearBottom = container.scrollHeight - container.scrollTop - container.clientHeight < 80;
    setShowScrollBtn(!isNearBottom);
  };

  // Upload imagen a ImgBB
  const handleImageSelected = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Validar tamaño (max 10MB)
    if (file.size > 10 * 1024 * 1024) {
      addBotMessage('⚠️ La imagen es demasiado grande (máx 10MB). Intenta con una foto más pequeña.', 'system');
      return;
    }

    setUploadingPhoto(true);
    try {
      const formData = new FormData();
      formData.append('image', file);

      const res = await fetch('/api/upload', { method: 'POST', body: formData });

      if (res.ok) {
        const data = await res.json();
        if (data.url) {
          setAttachedImageUrl(data.url);
          if (!input.trim()) {
            setInput('Verifica esta imagen por favor.');
          }
        }
      } else {
        addBotMessage('⚠️ No se pudo subir la imagen. Intenta de nuevo.', 'system');
      }
    } catch (err) {
      console.warn('Error subiendo foto:', err);
      addBotMessage('⚠️ Error de conexión al subir la foto.', 'system');
    } finally {
      setUploadingPhoto(false);
      if (fileInputRef.current) fileInputRef.current.value = '';
    }
  };

  const addBotMessage = (text: string, provider: string = 'system') => {
    const msg: ChatMessage = {
      id: `bot-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`,
      sender: 'assistant',
      text,
      time: new Date().toLocaleTimeString('es-ES', { hour: '2-digit', minute: '2-digit' }),
      status: 'sent',
      provider,
    };
    setMessages(prev => [...prev, msg]);
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
      status: 'sent',
    };

    setMessages(prev => [...prev, userMsg]);
    if (!textToSend) setInput('');
    setLoading(true);

    try {
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 30000); // 30s timeout

      const res = await fetch('/api/ai/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          messages: [...messages, userMsg].filter(m => m.id !== 'm-init').map(m => ({
            sender: m.sender,
            text: m.text,
            imageUrl: m.imageUrl,
          })),
          userRole: role,
          imageUrl: currentImg,
        }),
        signal: controller.signal,
      });

      clearTimeout(timeoutId);

      if (res.ok) {
        const data = await res.json();
        const botMsg: ChatMessage = {
          id: `bot-${Date.now()}`,
          sender: 'assistant',
          text: data.reply || 'Análisis completado. No se detectan anomalías.',
          time: new Date().toLocaleTimeString('es-ES', { hour: '2-digit', minute: '2-digit' }),
          status: 'sent',
          provider: data.provider,
        };
        setMessages(prev => [...prev, botMsg]);
      } else {
        throw new Error(`HTTP ${res.status}`);
      }
    } catch (err: any) {
      const isTimeout = err.name === 'AbortError';
      const errorMsg: ChatMessage = {
        id: `bot-err-${Date.now()}`,
        sender: 'assistant',
        text: isTimeout
          ? '⏳ La respuesta tardó demasiado. Tus fondos están seguros. Intenta de nuevo.'
          : '⚠️ Error de conexión con el asistente. Tus fondos están 100% seguros en el Smart Contract. Intenta de nuevo en unos segundos.',
        time: new Date().toLocaleTimeString('es-ES', { hour: '2-digit', minute: '2-digit' }),
        status: 'error',
        provider: 'error',
      };
      setMessages(prev => [...prev, errorMsg]);
    } finally {
      setLoading(false);
    }
  };

  const handleRetry = () => {
    // Encontrar el último mensaje del usuario y re-enviarlo
    const lastUserMsg = [...messages].reverse().find(m => m.sender === 'user');
    if (lastUserMsg) {
      // Quitar el último mensaje de error
      setMessages(prev => {
        const last = prev[prev.length - 1];
        if (last?.status === 'error') return prev.slice(0, -1);
        return prev;
      });
      setTimeout(() => handleSend(lastUserMsg.text), 100);
    }
  };

  const clearChat = () => {
    setMessages([INITIAL_MESSAGE]);
    setInput('');
    setAttachedImageUrl(null);
  };

  const chatWidth = isExpanded ? '520px' : '380px';
  const chatHeight = isExpanded ? '680px' : '520px';

  return (
    <>
      {/* ── Floating Launcher ── */}
      {!isOpen && (
        <button
          type="button"
          onClick={() => setIsOpen(true)}
          className="btn-pressable"
          style={{
            position: 'fixed',
            bottom: 90,
            right: 20,
            zIndex: 9990,
            background: 'linear-gradient(135deg, #00cfff 0%, #9b72ff 100%)',
            color: '#050810',
            border: 'none',
            borderRadius: '50px',
            padding: '11px 18px',
            fontWeight: 800,
            fontSize: '0.82rem',
            display: 'flex',
            alignItems: 'center',
            gap: '8px',
            boxShadow: '0 6px 28px rgba(0, 207, 255, 0.35), 0 0 18px rgba(155, 114, 255, 0.25)',
            cursor: 'pointer',
            transition: 'all 0.3s ease-out',
          }}
          aria-label="Abrir asistente IA"
        >
          <Bot size={18} />
          <span>Asistente IA</span>
          {unreadCount > 0 && (
            <span style={{
              background: '#ff4757',
              color: '#fff',
              fontSize: '0.62rem',
              fontWeight: 800,
              padding: '1px 6px',
              borderRadius: '10px',
              minWidth: '16px',
              textAlign: 'center',
            }}>
              {unreadCount}
            </span>
          )}
        </button>
      )}

      {/* ── Chat Modal ── */}
      {isOpen && (
        <div
          style={{
            position: 'fixed',
            bottom: 20,
            right: 20,
            width: chatWidth,
            maxWidth: 'calc(100vw - 24px)',
            height: chatHeight,
            maxHeight: 'calc(100vh - 40px)',
            background: 'rgba(9, 14, 28, 0.98)',
            backdropFilter: 'blur(28px)',
            border: '1px solid rgba(0, 207, 255, 0.25)',
            borderRadius: '20px',
            boxShadow: '0 20px 60px rgba(0, 0, 0, 0.85), 0 0 35px rgba(0, 207, 255, 0.1)',
            zIndex: 9995,
            display: 'flex',
            flexDirection: 'column',
            overflow: 'hidden',
            animation: 'fadeIn 0.3s ease-out',
            transition: 'width 0.3s ease-out, height 0.3s ease-out',
          }}
        >
          {/* ── Header ── */}
          <div style={{
            padding: '12px 16px',
            background: 'linear-gradient(135deg, rgba(0,207,255,0.1) 0%, rgba(155,114,255,0.1) 100%)',
            borderBottom: '1px solid rgba(255, 255, 255, 0.06)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
          }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
              <div style={{
                width: 34,
                height: 34,
                borderRadius: '10px',
                background: 'linear-gradient(135deg, var(--brand-cyan), var(--brand-purple))',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                color: '#050810',
              }}>
                <Bot size={18} />
              </div>
              <div>
                <div style={{ fontWeight: 800, fontSize: '0.88rem', color: 'var(--text-primary)', display: 'flex', alignItems: 'center', gap: '6px' }}>
                  AYNI Guardian
                  <span className="sc-radar-dot" style={{ width: 6, height: 6, background: loading ? '#ffa502' : '#2ed573' }} />
                </div>
                <div style={{ fontSize: '0.66rem', color: 'var(--text-secondary)' }}>
                  {loading ? 'Procesando...' : 'Soporte IA · Base L2'}
                </div>
              </div>
            </div>

            <div style={{ display: 'flex', gap: '4px' }}>
              <button
                type="button"
                onClick={clearChat}
                className="btn-ghost"
                style={{ padding: '5px', borderRadius: '8px', border: 'none' }}
                title="Limpiar chat"
                aria-label="Limpiar chat"
              >
                <Trash2 size={14} color="var(--text-muted)" />
              </button>
              <button
                type="button"
                onClick={() => setIsExpanded(!isExpanded)}
                className="btn-ghost"
                style={{ padding: '5px', borderRadius: '8px', border: 'none' }}
                title={isExpanded ? 'Reducir' : 'Expandir'}
                aria-label="Cambiar tamaño"
              >
                {isExpanded ? <Minimize2 size={14} color="var(--text-muted)" /> : <Maximize2 size={14} color="var(--text-muted)" />}
              </button>
              <button
                type="button"
                onClick={() => setIsOpen(false)}
                className="btn-ghost"
                style={{ padding: '5px', borderRadius: '8px', border: 'none' }}
                aria-label="Cerrar chat"
              >
                <X size={14} color="var(--text-muted)" />
              </button>
            </div>
          </div>

          {/* ── Messages ── */}
          <div
            ref={messagesContainerRef}
            onScroll={handleScroll}
            style={{
              flex: 1,
              overflowY: 'auto',
              padding: '14px',
              display: 'flex',
              flexDirection: 'column',
              gap: '10px',
              position: 'relative',
            }}
          >
            {messages.map(m => (
              <div
                key={m.id}
                style={{
                  alignSelf: m.sender === 'user' ? 'flex-end' : 'flex-start',
                  maxWidth: '85%',
                  display: 'flex',
                  flexDirection: 'column',
                  gap: '3px',
                  animation: 'fadeIn 0.25s ease-out',
                }}
              >
                <div style={{
                  padding: '10px 14px',
                  borderRadius: m.sender === 'user' ? '16px 16px 4px 16px' : '16px 16px 16px 4px',
                  background: m.sender === 'user'
                    ? 'linear-gradient(135deg, #00cfff 0%, #0099cc 100%)'
                    : m.status === 'error'
                      ? 'rgba(255, 71, 87, 0.08)'
                      : 'rgba(255, 255, 255, 0.04)',
                  border: m.sender === 'user'
                    ? 'none'
                    : m.status === 'error'
                      ? '1px solid rgba(255, 71, 87, 0.2)'
                      : '1px solid rgba(255, 255, 255, 0.06)',
                  color: m.sender === 'user' ? '#050810' : 'var(--text-primary)',
                  fontSize: '0.82rem',
                  lineHeight: 1.5,
                  fontWeight: m.sender === 'user' ? 600 : 400,
                }}>
                  {/* Imagen adjunta */}
                  {m.imageUrl && (
                    <div style={{
                      marginBottom: '8px',
                      borderRadius: '8px',
                      overflow: 'hidden',
                      border: '1px solid rgba(0, 207, 255, 0.25)',
                    }}>
                      <img
                        src={m.imageUrl}
                        alt="Adjunto"
                        style={{ width: '100%', maxHeight: '160px', objectFit: 'cover', display: 'block' }}
                        loading="lazy"
                      />
                    </div>
                  )}
                  {/* Texto formateado */}
                  <div>{renderFormattedText(m.text)}</div>
                </div>

                {/* Timestamp + provider */}
                <div style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '6px',
                  alignSelf: m.sender === 'user' ? 'flex-end' : 'flex-start',
                  padding: '0 4px',
                }}>
                  <span style={{ fontSize: '0.62rem', color: 'var(--text-muted)' }}>
                    {m.time}
                  </span>
                  {m.provider === 'gemini' && (
                    <span style={{ fontSize: '0.58rem', color: 'var(--brand-purple)', fontWeight: 600 }}>
                      <Sparkles size={9} style={{ display: 'inline', marginRight: '2px', verticalAlign: 'middle' }} />
                      Gemini
                    </span>
                  )}
                </div>

                {/* Retry button on error */}
                {m.status === 'error' && m.sender === 'assistant' && (
                  <button
                    type="button"
                    onClick={handleRetry}
                    style={{
                      alignSelf: 'flex-start',
                      display: 'flex',
                      alignItems: 'center',
                      gap: '4px',
                      padding: '4px 10px',
                      borderRadius: '8px',
                      background: 'rgba(0, 207, 255, 0.1)',
                      border: '1px solid rgba(0, 207, 255, 0.2)',
                      color: 'var(--brand-cyan)',
                      fontSize: '0.7rem',
                      fontWeight: 600,
                      cursor: 'pointer',
                      marginTop: '2px',
                    }}
                  >
                    <RefreshCw size={11} /> Reintentar
                  </button>
                )}
              </div>
            ))}

            {/* Typing indicator */}
            {loading && (
              <div style={{
                alignSelf: 'flex-start',
                display: 'flex',
                alignItems: 'center',
                gap: '8px',
                padding: '10px 14px',
                background: 'rgba(255,255,255,0.03)',
                borderRadius: '14px',
                border: '1px solid rgba(255,255,255,0.05)',
                animation: 'fadeIn 0.2s ease-out',
              }}>
                <div style={{ display: 'flex', gap: '4px' }}>
                  {[0, 1, 2].map(i => (
                    <div
                      key={i}
                      style={{
                        width: 6,
                        height: 6,
                        borderRadius: '50%',
                        background: 'var(--brand-cyan)',
                        opacity: 0.6,
                        animation: `pulse 1.2s ease-in-out ${i * 0.2}s infinite`,
                      }}
                    />
                  ))}
                </div>
                <span style={{ fontSize: '0.72rem', color: 'var(--text-secondary)' }}>
                  {uploadingPhoto ? 'Subiendo foto...' : 'AYNI Guardian pensando...'}
                </span>
              </div>
            )}

            <div ref={messagesEndRef} />
          </div>

          {/* Scroll to bottom button */}
          {showScrollBtn && (
            <button
              type="button"
              onClick={scrollToBottom}
              style={{
                position: 'absolute',
                bottom: 140,
                left: '50%',
                transform: 'translateX(-50%)',
                padding: '4px 12px',
                borderRadius: '20px',
                background: 'rgba(0, 207, 255, 0.15)',
                border: '1px solid rgba(0, 207, 255, 0.25)',
                color: 'var(--brand-cyan)',
                fontSize: '0.68rem',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                gap: '4px',
                zIndex: 2,
              }}
            >
              <ChevronDown size={12} /> Nuevos mensajes
            </button>
          )}

          {/* Imagen adjunta preview */}
          {attachedImageUrl && (
            <div style={{
              padding: '6px 12px',
              background: 'rgba(0, 207, 255, 0.06)',
              borderTop: '1px solid rgba(0, 207, 255, 0.15)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
            }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <img
                  src={attachedImageUrl}
                  alt="Vista previa"
                  style={{ width: 30, height: 30, borderRadius: 4, objectFit: 'cover', border: '1px solid var(--brand-cyan)' }}
                />
                <span style={{ fontSize: '0.7rem', color: 'var(--brand-cyan)', fontWeight: 600 }}>
                  Foto lista para auditar
                </span>
              </div>
              <button
                type="button"
                onClick={() => setAttachedImageUrl(null)}
                className="btn-ghost"
                style={{ padding: '3px', borderRadius: '50%', border: 'none' }}
                aria-label="Quitar foto"
              >
                <X size={12} />
              </button>
            </div>
          )}

          {/* Quick actions (solo si hay pocos mensajes) */}
          {messages.length <= 2 && !loading && (
            <div style={{
              padding: '6px 10px',
              borderTop: '1px solid rgba(255, 255, 255, 0.04)',
              display: 'flex',
              gap: '5px',
              overflowX: 'auto',
              background: 'rgba(5, 8, 16, 0.5)',
            }}>
              {QUICK_ACTIONS.map((q, idx) => (
                <button
                  key={idx}
                  type="button"
                  onClick={() => {
                    if (q.action === 'photo') {
                      fileInputRef.current?.click();
                    } else if (q.text) {
                      handleSend(q.text);
                    }
                  }}
                  style={{
                    padding: '4px 9px',
                    borderRadius: '10px',
                    background: 'rgba(0, 207, 255, 0.06)',
                    border: '1px solid rgba(0, 207, 255, 0.15)',
                    color: 'var(--brand-cyan)',
                    fontSize: '0.68rem',
                    whiteSpace: 'nowrap',
                    cursor: 'pointer',
                    transition: 'all 0.2s ease',
                  }}
                >
                  {q.label}
                </button>
              ))}
            </div>
          )}

          {/* ── Input Bar ── */}
          <form
            onSubmit={e => {
              e.preventDefault();
              handleSend();
            }}
            style={{
              padding: '10px 12px',
              borderTop: '1px solid rgba(255, 255, 255, 0.06)',
              display: 'flex',
              alignItems: 'center',
              gap: '6px',
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
                padding: '7px',
                borderRadius: '8px',
                color: attachedImageUrl ? 'var(--brand-cyan)' : 'var(--text-secondary)',
                background: attachedImageUrl ? 'rgba(0, 207, 255, 0.1)' : 'transparent',
                border: 'none',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                cursor: 'pointer',
                flexShrink: 0,
              }}
              title="Adjuntar imagen"
              aria-label="Adjuntar imagen"
            >
              <Camera size={16} />
            </button>

            <input
              ref={inputRef}
              type="text"
              value={input}
              onChange={e => setInput(e.target.value)}
              placeholder={attachedImageUrl ? 'Describe qué verificar...' : 'Escribe tu pregunta...'}
              className="input input-interactive"
              style={{ fontSize: '0.8rem', padding: '9px 12px', flex: 1 }}
            />

            <button
              type="submit"
              disabled={(!input.trim() && !attachedImageUrl) || loading || uploadingPhoto}
              className="btn btn-primary"
              style={{
                padding: '0 12px',
                height: '36px',
                borderRadius: '10px',
                flexShrink: 0,
                opacity: (!input.trim() && !attachedImageUrl) || loading ? 0.4 : 1,
                transition: 'opacity 0.2s ease',
              }}
              aria-label="Enviar mensaje"
            >
              <Send size={14} />
            </button>
          </form>
        </div>
      )}

      {/* Keyframe para dots animation */}
      <style jsx global>{`
        @keyframes pulse {
          0%, 100% { opacity: 0.3; transform: scale(0.8); }
          50% { opacity: 1; transform: scale(1.2); }
        }
      `}</style>
    </>
  );
}
