'use client';

import React, { useState } from 'react';
import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { Search, Filter, ShoppingBag, Heart, Star, MapPin, Package, Tag, Sparkles, ChevronDown, Plus } from 'lucide-react';

const CATEGORIES = [
  { id: 'all', label: 'Todos', icon: '🌎' },
  { id: 'textiles', label: 'Textiles & Tejidos', icon: '🧶' },
  { id: 'medical', label: 'Insumos Médicos', icon: '💊' },
  { id: 'tech', label: 'Tecnología', icon: '📱' },
  { id: 'food', label: 'Alimentos Gourmet', icon: '🍫' },
  { id: 'art', label: 'Arte & Artesanías', icon: '🎨' },
  { id: 'jewelry', label: 'Joyería & Plata', icon: '💍' },
  { id: 'clothing', label: 'Ropa de Marca', icon: '👗' },
];

const PRODUCTS = [
  {
    id: 'P001',
    title: 'Chullo Artesanal Andino Lana de Alpaca',
    store: 'Tejidos Illimani',
    storeLocation: 'Cochabamba, Bolivia',
    storeRating: 4.88,
    price: 38.00,
    currency: 'USDC',
    category: 'textiles',
    origin: '🇧🇴 Bolivia',
    weight: '0.3 kg',
    inStock: true,
    image: 'https://images.unsplash.com/photo-1579541814924-49fef17c5be5?w=400&h=300&fit=crop&q=80',
    tags: ['alpaca', 'artesanal', 'andino'],
    available_routes: 3,
    description: 'Tejido a mano con técnica ancestral andina. Lana de alpaca 100% natural.',
  },
  {
    id: 'P002',
    title: 'Implante Dental Titanio Grado 5 (Unidad)',
    store: 'MedTech Europa SL',
    storeLocation: 'Madrid, España',
    storeRating: 4.97,
    price: 185.00,
    currency: 'USDC',
    category: 'medical',
    origin: '🇪🇸 España',
    weight: '0.05 kg',
    inStock: true,
    image: 'https://images.unsplash.com/photo-1559757175-5700dde675bc?w=400&h=300&fit=crop&q=80',
    tags: ['médico', 'titanio', 'certificado'],
    available_routes: 5,
    description: 'Implante de titanio grado 5 con certificación CE. Incluye tornillo de cicatrización.',
  },
  {
    id: 'P003',
    title: 'Lente Fotográfico 50mm f/1.8 Canon EF',
    store: 'FNAC Callao Oficial',
    storeLocation: 'Madrid, España',
    storeRating: 4.92,
    price: 155.00,
    currency: 'USDC',
    category: 'tech',
    origin: '🇪🇸 España',
    weight: '0.29 kg',
    inStock: true,
    image: 'https://images.unsplash.com/photo-1606983340126-99ab4feaa64a?w=400&h=300&fit=crop&q=80',
    tags: ['fotografía', 'canon', 'lente'],
    available_routes: 4,
    description: 'Lente prime con garantía oficial Canon Europa 2 años. Perfecto para retratos.',
  },
  {
    id: 'P004',
    title: 'Tableta de Chocolate Artesanal Criollo 72%',
    store: 'Cacao del Beni',
    storeLocation: 'Beni, Bolivia',
    storeRating: 4.85,
    price: 12.50,
    currency: 'USDC',
    category: 'food',
    origin: '🇧🇴 Bolivia',
    weight: '0.1 kg',
    inStock: true,
    image: 'https://images.unsplash.com/photo-1549007994-cb92caebd54b?w=400&h=300&fit=crop&q=80',
    tags: ['chocolate', 'artesanal', 'orgánico'],
    available_routes: 7,
    description: 'Chocolate criollo boliviano de la Amazonía. Premio internacional de cacao fino.',
  },
  {
    id: 'P005',
    title: 'Manta Aguayo Tradicional Jalq\'a Tejida a Mano',
    store: 'Arte Jalq\'a Original',
    storeLocation: 'Sucre, Bolivia',
    storeRating: 4.93,
    price: 85.00,
    currency: 'USDC',
    category: 'textiles',
    origin: '🇧🇴 Bolivia',
    weight: '0.8 kg',
    inStock: true,
    image: 'https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=400&h=300&fit=crop&q=80',
    tags: ['aguayo', 'jalq\'a', 'patrimonio'],
    available_routes: 3,
    description: 'Tejido ceremonial de la cultura Jalq\'a con diseños de animales mitológicos (payqu).',
  },
  {
    id: 'P006',
    title: 'Apple AirPods Pro (2ª generación) Sellados',
    store: 'iPoint Store Madrid',
    storeLocation: 'Madrid, España',
    storeRating: 4.95,
    price: 220.00,
    currency: 'USDC',
    category: 'tech',
    origin: '🇪🇸 España',
    weight: '0.06 kg',
    inStock: false,
    image: 'https://images.unsplash.com/photo-1606841837239-c5a1a4a07af7?w=400&h=300&fit=crop&q=80',
    tags: ['apple', 'audífonos', 'ANC'],
    available_routes: 2,
    description: 'AirPods Pro 2da gen con chip H2. Cancelación de ruido activa. Garantía internacional.',
  },
  {
    id: 'P007',
    title: 'Anillo de Plata 950 con Turquesa Boliviana',
    store: 'Plata Qori Andino',
    storeLocation: 'La Paz, Bolivia',
    storeRating: 4.90,
    price: 45.00,
    currency: 'USDC',
    category: 'jewelry',
    origin: '🇧🇴 Bolivia',
    weight: '0.02 kg',
    inStock: true,
    image: 'https://images.unsplash.com/photo-1515562141207-7a88fb7ce338?w=400&h=300&fit=crop&q=80',
    tags: ['plata', 'joyería', 'turquesa'],
    available_routes: 6,
    description: 'Elaborado por artesano orfebre certificado. Diseño contemporáneo con motivos tiwanakutas.',
  },
  {
    id: 'P008',
    title: 'Supplement Kit Omega-3 + Vitamina D3 (90 días)',
    store: 'Health House Amsterdam',
    storeLocation: 'Ámsterdam, Países Bajos',
    storeRating: 4.80,
    price: 62.00,
    currency: 'USDC',
    category: 'medical',
    origin: '🇳🇱 Países Bajos',
    weight: '0.45 kg',
    inStock: true,
    image: 'https://images.unsplash.com/photo-1584308666744-24d5c474f2ae?w=400&h=300&fit=crop&q=80',
    tags: ['suplementos', 'omega3', 'vitaminas'],
    available_routes: 2,
    description: 'Kit farmacéutico premium europeo. Certificado por la Agencia Europea de Medicamentos.',
  },
];

export default function MarketplacePage() {
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [searchTerm, setSearchTerm] = useState('');
  const [wishlist, setWishlist] = useState<Set<string>>(new Set());
  const [sortBy, setSortBy] = useState<'price_asc' | 'price_desc' | 'rating' | 'routes'>('routes');

  const toggleWishlist = (id: string) => {
    setWishlist(prev => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  };

  const filtered = PRODUCTS
    .filter(p => selectedCategory === 'all' || p.category === selectedCategory)
    .filter(p => !searchTerm || p.title.toLowerCase().includes(searchTerm.toLowerCase()) || p.store.toLowerCase().includes(searchTerm.toLowerCase()))
    .sort((a, b) => {
      if (sortBy === 'price_asc') return a.price - b.price;
      if (sortBy === 'price_desc') return b.price - a.price;
      if (sortBy === 'rating') return b.storeRating - a.storeRating;
      return b.available_routes - a.available_routes;
    });

  return (
    <DashboardLayout>
      {/* Header */}
      <div className="page-header">
        <div className="page-title-group">
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '4px' }}>
            <div className="page-title">Marketplace AYNI</div>
            <span className="badge badge-emerald">
              <Sparkles size={11} /> {PRODUCTS.length} productos
            </span>
          </div>
          <div className="page-subtitle">
            Artesanías, insumos médicos, tecnología y más — Compra con viajeros verificados
          </div>
        </div>
        <button className="btn btn-gold">
          <Plus size={16} /> Publicar Producto
        </button>
      </div>

      {/* Search & Filters Bar */}
      <div style={{ display: 'flex', gap: '12px', marginBottom: '24px', flexWrap: 'wrap', alignItems: 'center' }}>
        <div className="input-icon-wrap" style={{ flex: '1', minWidth: '280px' }}>
          <Search size={16} className="input-icon" />
          <input
            type="search"
            placeholder="Buscar productos, tiendas, orígenes..."
            className="input"
            style={{ paddingLeft: '40px' }}
            value={searchTerm}
            onChange={e => setSearchTerm(e.target.value)}
          />
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)', flexShrink: 0 }}>Ordenar:</span>
          <select
            value={sortBy}
            onChange={e => setSortBy(e.target.value as typeof sortBy)}
            className="input"
            style={{ width: 'auto', padding: '9px 12px', fontSize: '0.85rem', cursor: 'pointer' }}
          >
            <option value="routes">Más rutas disponibles</option>
            <option value="rating">Mejor valoración</option>
            <option value="price_asc">Precio: menor a mayor</option>
            <option value="price_desc">Precio: mayor a menor</option>
          </select>
        </div>
      </div>

      {/* Category Tabs */}
      <div style={{ display: 'flex', gap: '8px', marginBottom: '24px', overflowX: 'auto', paddingBottom: '4px' }}>
        {CATEGORIES.map(cat => (
          <button
            key={cat.id}
            type="button"
            onClick={() => setSelectedCategory(cat.id)}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '6px',
              padding: '8px 16px',
              borderRadius: '9999px',
              border: `1px solid ${selectedCategory === cat.id ? 'var(--brand-cyan)' : 'var(--border-default)'}`,
              background: selectedCategory === cat.id ? 'rgba(0,207,255,0.1)' : 'rgba(255,255,255,0.03)',
              color: selectedCategory === cat.id ? 'var(--brand-cyan)' : 'var(--text-secondary)',
              fontSize: '0.82rem',
              fontWeight: selectedCategory === cat.id ? 600 : 400,
              cursor: 'pointer',
              transition: 'all 0.15s',
              whiteSpace: 'nowrap',
              flexShrink: 0,
            }}
          >
            <span>{cat.icon}</span>
            {cat.label}
          </button>
        ))}
      </div>

      {/* Results Count */}
      <div style={{ color: 'var(--text-muted)', fontSize: '0.82rem', marginBottom: '16px' }}>
        {filtered.length} producto{filtered.length !== 1 ? 's' : ''} encontrado{filtered.length !== 1 ? 's' : ''}
        {searchTerm && <span style={{ color: 'var(--brand-cyan)' }}> para "{searchTerm}"</span>}
      </div>

      {/* Product Grid */}
      <div className="product-grid">
        {filtered.map(product => (
          <div key={product.id} className="product-card">
            {/* Image */}
            <div style={{ position: 'relative', overflow: 'hidden' }}>
              <img
                src={product.image}
                alt={product.title}
                className="product-card-image"
                onError={e => {
                  (e.target as HTMLImageElement).style.display = 'none';
                }}
              />

              {/* Badges on image */}
              <div style={{ position: 'absolute', top: 10, left: 10, display: 'flex', gap: '5px', flexWrap: 'wrap' }}>
                {!product.inStock && (
                  <span className="badge badge-red" style={{ fontSize: '0.65rem' }}>Agotado</span>
                )}
                {product.available_routes >= 5 && (
                  <span className="badge badge-emerald" style={{ fontSize: '0.65rem' }}>
                    🔥 {product.available_routes} rutas
                  </span>
                )}
              </div>

              {/* Wishlist button */}
              <button
                type="button"
                onClick={e => { e.stopPropagation(); toggleWishlist(product.id); }}
                style={{
                  position: 'absolute',
                  top: 10,
                  right: 10,
                  width: 32,
                  height: 32,
                  borderRadius: '50%',
                  background: 'rgba(5,8,16,0.7)',
                  border: '1px solid var(--border-default)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  cursor: 'pointer',
                  color: wishlist.has(product.id) ? 'var(--brand-red)' : 'var(--text-muted)',
                  transition: 'all 0.15s',
                }}
              >
                <Heart size={14} fill={wishlist.has(product.id) ? 'currentColor' : 'none'} />
              </button>
            </div>

            {/* Body */}
            <div className="product-card-body">
              <div className="product-card-title">{product.title}</div>

              <div className="product-card-store">
                <MapPin size={11} />
                {product.store} • {product.storeLocation}
              </div>

              <div style={{ display: 'flex', gap: '5px', flexWrap: 'wrap' }}>
                {product.tags.slice(0, 3).map(t => (
                  <span key={t} className="badge" style={{ background: 'rgba(255,255,255,0.05)', color: 'var(--text-muted)', border: '1px solid var(--border-subtle)', fontSize: '0.65rem' }}>
                    {t}
                  </span>
                ))}
              </div>

              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginTop: '4px' }}>
                <div>
                  <div className="product-card-price">${product.price.toFixed(2)} <span style={{ fontSize: '0.7rem', fontWeight: 400, color: 'var(--text-muted)' }}>USDC</span></div>
                  <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)', marginTop: '2px' }}>
                    {product.origin} • ⚖ {product.weight}
                  </div>
                </div>
                <div style={{ textAlign: 'right' }}>
                  <div style={{ fontSize: '0.72rem', color: 'var(--brand-gold)', fontWeight: 600 }}>★ {product.storeRating}</div>
                  <div style={{ fontSize: '0.65rem', color: 'var(--text-muted)' }}>{product.available_routes} rutas</div>
                </div>
              </div>

              {/* Actions */}
              <div style={{ display: 'flex', gap: '8px', marginTop: '4px' }}>
                <button
                  type="button"
                  className="btn btn-primary btn-sm"
                  disabled={!product.inStock}
                  style={{ flex: 1, opacity: product.inStock ? 1 : 0.5 }}
                >
                  <ShoppingBag size={14} />
                  {product.inStock ? 'Encargar' : 'Sin stock'}
                </button>
                <button type="button" className="btn btn-ghost btn-sm" style={{ padding: '7px 10px' }}>
                  <Package size={14} />
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>

      {filtered.length === 0 && (
        <div style={{ textAlign: 'center', padding: '60px 20px' }}>
          <div style={{ fontSize: '3rem', marginBottom: '16px' }}>🔍</div>
          <div style={{ fontWeight: 600, marginBottom: '8px' }}>Sin resultados</div>
          <div style={{ color: 'var(--text-secondary)', fontSize: '0.9rem' }}>
            Intenta con otra categoría o término de búsqueda
          </div>
        </div>
      )}
    </DashboardLayout>
  );
}
