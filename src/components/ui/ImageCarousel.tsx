'use client';

import React, { useState, useRef, useCallback } from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';

interface ImageCarouselProps {
  images: string[];
  alt?: string;
  height?: string;
  borderRadius?: string;
  showDots?: boolean;
  showArrows?: boolean;
}

export function ImageCarousel({
  images,
  alt = 'Imagen',
  height = '240px',
  borderRadius = '12px',
  showDots = true,
  showArrows = true,
}: ImageCarouselProps) {
  const [current, setCurrent] = useState(0);
  const touchStart = useRef<number | null>(null);
  const touchEnd = useRef<number | null>(null);

  const total = images.length;
  if (total === 0) return null;

  // Single image — no carousel needed
  if (total === 1) {
    return (
      <div style={{ width: '100%', height, borderRadius, overflow: 'hidden' }}>
        <img
          src={images[0]}
          alt={alt}
          style={{ width: '100%', height: '100%', objectFit: 'cover' }}
          loading="lazy"
        />
      </div>
    );
  }

  const goTo = (idx: number) => setCurrent((idx + total) % total);
  const prev = () => goTo(current - 1);
  const next = () => goTo(current + 1);

  const handleTouchStart = (e: React.TouchEvent) => {
    touchStart.current = e.targetTouches[0].clientX;
    touchEnd.current = null;
  };

  const handleTouchMove = (e: React.TouchEvent) => {
    touchEnd.current = e.targetTouches[0].clientX;
  };

  const handleTouchEnd = () => {
    if (touchStart.current === null || touchEnd.current === null) return;
    const diff = touchStart.current - touchEnd.current;
    if (Math.abs(diff) > 50) {
      if (diff > 0) next();
      else prev();
    }
    touchStart.current = null;
    touchEnd.current = null;
  };

  return (
    <div
      style={{ position: 'relative', width: '100%', height, borderRadius, overflow: 'hidden' }}
      onTouchStart={handleTouchStart}
      onTouchMove={handleTouchMove}
      onTouchEnd={handleTouchEnd}
    >
      {/* Images Track */}
      <div style={{
        display: 'flex',
        transform: `translateX(-${current * 100}%)`,
        transition: 'transform 0.35s cubic-bezier(0.4, 0, 0.2, 1)',
        width: `${total * 100}%`,
        height: '100%',
      }}>
        {images.map((src, i) => (
          <div key={i} style={{ width: `${100 / total}%`, height: '100%', flexShrink: 0 }}>
            <img
              src={src}
              alt={`${alt} ${i + 1}`}
              style={{ width: '100%', height: '100%', objectFit: 'cover' }}
              loading="lazy"
            />
          </div>
        ))}
      </div>

      {/* Arrow Controls */}
      {showArrows && (
        <>
          <button
            type="button"
            onClick={prev}
            aria-label="Anterior"
            style={{
              position: 'absolute',
              top: '50%',
              left: '8px',
              transform: 'translateY(-50%)',
              width: 32,
              height: 32,
              borderRadius: '50%',
              background: 'rgba(5, 8, 16, 0.7)',
              border: '1px solid rgba(255,255,255,0.15)',
              color: '#fff',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              backdropFilter: 'blur(8px)',
              transition: 'all 0.2s',
              padding: 0,
            }}
          >
            <ChevronLeft size={16} />
          </button>
          <button
            type="button"
            onClick={next}
            aria-label="Siguiente"
            style={{
              position: 'absolute',
              top: '50%',
              right: '8px',
              transform: 'translateY(-50%)',
              width: 32,
              height: 32,
              borderRadius: '50%',
              background: 'rgba(5, 8, 16, 0.7)',
              border: '1px solid rgba(255,255,255,0.15)',
              color: '#fff',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              backdropFilter: 'blur(8px)',
              transition: 'all 0.2s',
              padding: 0,
            }}
          >
            <ChevronRight size={16} />
          </button>
        </>
      )}

      {/* Dot Indicators */}
      {showDots && (
        <div style={{
          position: 'absolute',
          bottom: '10px',
          left: '50%',
          transform: 'translateX(-50%)',
          display: 'flex',
          gap: '6px',
        }}>
          {images.map((_, i) => (
            <button
              key={i}
              type="button"
              onClick={() => goTo(i)}
              aria-label={`Ir a imagen ${i + 1}`}
              style={{
                width: current === i ? 20 : 8,
                height: 8,
                borderRadius: 4,
                background: current === i ? 'var(--brand-cyan)' : 'rgba(255,255,255,0.4)',
                border: 'none',
                cursor: 'pointer',
                transition: 'all 0.3s ease',
                padding: 0,
              }}
            />
          ))}
        </div>
      )}

      {/* Counter Badge */}
      <div style={{
        position: 'absolute',
        top: '10px',
        right: '10px',
        background: 'rgba(5, 8, 16, 0.7)',
        padding: '2px 8px',
        borderRadius: '8px',
        fontSize: '0.7rem',
        color: 'rgba(255,255,255,0.8)',
        backdropFilter: 'blur(8px)',
      }}>
        {current + 1} / {total}
      </div>
    </div>
  );
}
