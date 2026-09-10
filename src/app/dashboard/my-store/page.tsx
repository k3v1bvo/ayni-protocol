'use client';

import React, { useState, useEffect, useCallback } from 'react';
import Link from 'next/link';
import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { useAuth } from '@/context/AuthContext';
import { 
  Store, Package, Star, TrendingUp, Plus, Edit, Eye, 
  MapPin, ShoppingBag, CheckCircle2, Globe, AlertCircle, 
  Trash2, X, Check, RefreshCw, UploadCloud
} from 'lucide-react';
import { ImageUploader } from '@/components/ui/ImageUploader';

interface StoreData {
  id: string;
  owner_id: string;
  name: string;
  slug: string;
  category: string;
  description?: string | null;
  location_city: string;
  location_country: string;
  banner_url?: string | null;
  is_verified: boolean;
  rating?: number;
  rating_count?: number;
}

interface ProductItem {
  id: string;
  title: string;
  price: number;
  stock: number;
  category: string;
  orders_count?: number;
  rating?: number;
  is_active: boolean;
  images?: string[];
  image?: string;
  origin_city?: string;
  weight_kg?: number;
  created_at?: string;
}

interface StoreOrder {
  id: string;
  title: string;
  buyer_name?: string;
  total_price: number;
  status: string;
  created_at: string;
  destination_city?: string;
  otp_code?: string;
}

const DEFAULT_STORE: StoreData = {
  id: 'store-illimani-001',
  owner_id: 'usr-demo-merchant',
  name: 'Tejidos & Artesanías Illimani',
  slug: 'tejidos-artesanias-illimani',
  category: 'textiles',
  description: "Artesanías andinas 100% auténticas. Tejidos a mano con lana de alpaca y técnicas ancestrales jalq'a desde Cochabamba. Cada pieza tiene historia y trazabilidad comunitaria.",
  location_city: 'Cochabamba',
  location_country: 'Bolivia',
  banner_url: 'https://images.unsplash.com/photo-1579541814924-49fef17c5be5?w=400&h=300&fit=crop&q=80',
  is_verified: true,
  rating: 4.88,
  rating_count: 110,
};

const DEFAULT_PRODUCTS: ProductItem[] = [
  {
    id: 'MP001', title: 'Chullo Artesanal Lana de Alpaca', price: 38.00, stock: 12,
    category: 'textiles', orders_count: 24, rating: 4.92, is_active: true,
    image: 'https://images.unsplash.com/photo-1579541814924-49fef17c5be5?w=200&h=150&fit=crop&q=80',
  },
  {
    id: 'MP002', title: "Manta Aguayo Jalq'a Original", price: 85.00, stock: 5,
    category: 'textiles', orders_count: 11, rating: 4.88, is_active: true,
    image: 'https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=200&h=150&fit=crop&q=80',
  },
  {
    id: 'MP003', title: 'Tableta Chocolate Criollo 72%', price: 12.50, stock: 40,
    category: 'food', orders_count: 67, rating: 4.97, is_active: true,
    image: 'https://images.unsplash.com/photo-1549007994-cb92caebd54b?w=200&h=150&fit=crop&q=80',
  },
  {
    id: 'MP004', title: 'Anillo Plata 950 + Turquesa', price: 45.00, stock: 0,
    category: 'jewelry', orders_count: 8, rating: 4.75, is_active: false,
    image: 'https://images.unsplash.com/photo-1515562141207-7a88fb7ce338?w=200&h=150&fit=crop&q=80',
  },
];

const DEFAULT_ORDERS: StoreOrder[] = [
  { id: 'SO-001', title: 'Chullo Artesanal', buyer_name: 'Camila Torres (Madrid 🇪🇸)', total_price: 45.8, status: 'shipped', created_at: '2026-09-08T10:00:00Z', destination_city: 'Madrid' },
  { id: 'SO-002', title: "Manta Aguayo Jalq'a", buyer_name: 'Pierre Moreau (París 🇫🇷)', total_price: 94.5, status: 'funded', created_at: '2026-09-07T15:30:00Z', destination_city: 'París' },
  { id: 'SO-003', title: 'Tableta Chocolate x3', buyer_name: 'Ana García (Madrid 🇪🇸)', total_price: 42.6, status: 'completed', created_at: '2026-09-06T18:20:00Z', destination_city: 'Madrid' },
];

export default function MyStorePage() {
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState<'overview' | 'products' | 'orders'>('overview');
  const [store, setStore] = useState<StoreData | null>(null);
  const [products, setProducts] = useState<ProductItem[]>(DEFAULT_PRODUCTS);
  const [orders, setOrders] = useState<StoreOrder[]>(DEFAULT_ORDERS);
  const [loading, setLoading] = useState(true);

  // Edit / Register Modal
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [editName, setEditName] = useState('');
  const [editCategory, setEditCategory] = useState('textiles');
  const [editCity, setEditCity] = useState('');
  const [editCountry, setEditCountry] = useState('Bolivia');
  const [editDescription, setEditDescription] = useState('');
  const [editBanner, setEditBanner] = useState('');
  const [savingStore, setSavingStore] = useState(false);
  const [saveSuccess, setSaveSuccess] = useState<string | null>(null);

  // Delete product confirmation modal
  const [deleteProductTarget, setDeleteProductTarget] = useState<ProductItem | null>(null);

  const fetchStoreAndData = useCallback(async () => {
    setLoading(true);
    const userId = user?.id || 'usr-demo-merchant';

    // 1. Fetch Store
    try {
      const res = await fetch(`/api/stores?owner_id=${userId}`);
      if (res.ok) {
        const data = await res.json();
        if (data.stores && data.stores.length > 0) {
          setStore(data.stores[0]);
          localStorage.setItem('ayni_my_store', JSON.stringify(data.stores[0]));
        } else {
          // Check localStorage
          const local = localStorage.getItem('ayni_my_store');
          if (local) {
            setStore(JSON.parse(local));
          } else {
            // Default demo store
            setStore(DEFAULT_STORE);
          }
        }
      } else {
        const local = localStorage.getItem('ayni_my_store');
        setStore(local ? JSON.parse(local) : DEFAULT_STORE);
      }
    } catch {
      const local = localStorage.getItem('ayni_my_store');
      setStore(local ? JSON.parse(local) : DEFAULT_STORE);
    }

    // 2. Fetch Products
    try {
      const resP = await fetch('/api/products');
      if (resP.ok) {
        const dataP = await resP.json();
        if (dataP.products && dataP.products.length > 0) {
          // User or store products
          const myProducts = dataP.products.filter((p: any) => 
            p.owner_id === userId || p.store_id === store?.id || p.store === store?.name
          );
          if (myProducts.length > 0) {
            setProducts(myProducts.map((p: any) => ({
              id: p.id,
              title: p.title,
              price: Number(p.price) || 0,
              stock: p.stock ?? 10,
              category: p.category || 'artesanias',
              orders_count: p.orders_count || Math.floor(Math.random() * 20),
              rating: p.rating || 4.9,
              is_active: p.is_active !== false,
              images: p.images || (p.image ? [p.image] : []),
              image: p.image || (p.images && p.images[0]) || DEFAULT_PRODUCTS[0].image,
            })));
          }
        }
      }
    } catch (e) {
      console.error('Error fetching products:', e);
    }

    // 3. Fetch Orders
    try {
      const resO = await fetch('/api/orders');
      if (resO.ok) {
        const dataO = await resO.json();
        if (dataO.orders && dataO.orders.length > 0) {
          setOrders(dataO.orders.map((o: any) => ({
            id: o.id,
            title: o.title || `Pedido #${o.id.slice(0, 6)}`,
            buyer_name: o.client?.full_name || 'Comprador verificado',
            total_price: Number(o.total_price) || 0,
            status: o.status,
            created_at: o.created_at,
            destination_city: o.destination_city || 'Bolivia',
            otp_code: o.delivery_otp,
          })));
        }
      }
    } catch (e) {
      console.error('Error fetching orders:', e);
    }

    setLoading(false);
  }, [user, store?.id, store?.name]);

  useEffect(() => {
    fetchStoreAndData();
  }, [fetchStoreAndData]);

  const openEditModal = () => {
    if (store) {
      setEditName(store.name);
      setEditCategory(store.category);
      setEditCity(store.location_city);
      setEditCountry(store.location_country);
      setEditDescription(store.description || '');
      setEditBanner(store.banner_url || '');
    } else {
      setEditName('');
      setEditCategory('textiles');
      setEditCity('Cochabamba');
      setEditCountry('Bolivia');
      setEditDescription('');
      setEditBanner('');
    }
    setIsEditModalOpen(true);
  };

  const handleSaveStore = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editName.trim()) return;

    setSavingStore(true);
    const payload = {
      id: store?.id,
      owner_id: user?.id || 'usr-demo-merchant',
      name: editName.trim(),
      category: editCategory,
      location_city: editCity.trim() || 'Cochabamba',
      location_country: editCountry.trim() || 'Bolivia',
      description: editDescription.trim(),
      banner_url: editBanner || null,
    };

    try {
      const isNew = !store?.id || store.id.startsWith('store-illimani');
      const method = isNew ? 'POST' : 'PUT';
      const res = await fetch('/api/stores', {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });

      if (res.ok) {
        const resData = await res.json();
        const updatedStore = resData.store || { ...store, ...payload, is_verified: true };
        setStore(updatedStore);
        localStorage.setItem('ayni_my_store', JSON.stringify(updatedStore));
        setSaveSuccess('¡Tienda guardada con éxito en Supabase!');
      } else {
        // Fallback local update
        const fallbackStore: StoreData = {
          id: store?.id || `store-${Date.now()}`,
          owner_id: user?.id || 'usr-demo-merchant',
          name: editName.trim(),
          slug: editName.toLowerCase().replace(/\s+/g, '-'),
          category: editCategory,
          location_city: editCity.trim(),
          location_country: editCountry.trim(),
          description: editDescription.trim(),
          banner_url: editBanner || null,
          is_verified: true,
          rating: store?.rating || 4.9,
          rating_count: store?.rating_count || 1,
        };
        setStore(fallbackStore);
        localStorage.setItem('ayni_my_store', JSON.stringify(fallbackStore));
        setSaveSuccess('Tienda actualizada localmente.');
      }
    } catch {
      const fallbackStore: StoreData = {
        id: store?.id || `store-${Date.now()}`,
        owner_id: user?.id || 'usr-demo-merchant',
        name: editName.trim(),
        slug: editName.toLowerCase().replace(/\s+/g, '-'),
        category: editCategory,
        location_city: editCity.trim(),
        location_country: editCountry.trim(),
        description: editDescription.trim(),
        banner_url: editBanner || null,
        is_verified: true,
        rating: store?.rating || 4.9,
        rating_count: store?.rating_count || 1,
      };
      setStore(fallbackStore);
      localStorage.setItem('ayni_my_store', JSON.stringify(fallbackStore));
      setSaveSuccess('Tienda actualizada.');
    }

    setSavingStore(false);
    setTimeout(() => {
      setSaveSuccess(null);
      setIsEditModalOpen(false);
    }, 1200);
  };

  const handleDeleteProduct = async (product: ProductItem) => {
    try {
      const res = await fetch(`/api/products?id=${product.id}`, { method: 'DELETE' });
      if (res.ok) {
        setProducts(prev => prev.filter(p => p.id !== product.id));
      } else {
        setProducts(prev => prev.filter(p => p.id !== product.id));
      }
    } catch {
      setProducts(prev => prev.filter(p => p.id !== product.id));
    }
    setDeleteProductTarget(null);
  };

  // Calculations
  const totalSales = orders
    .filter(o => o.status === 'completed' || o.status === 'funded' || o.status === 'shipped')
    .reduce((acc, o) => acc + (Number(o.total_price) || 0), 0);
  const activeProductsCount = products.filter(p => p.is_active).length;
  const ordersCount = orders.length;

  return (
    <DashboardLayout>
      {/* Store Header Banner */}
      <div style={{
        background: 'linear-gradient(135deg, rgba(0,214,143,0.1) 0%, rgba(0,207,255,0.05) 100%)',
        border: '1px solid rgba(0,214,143,0.2)',
        borderRadius: 20,
        padding: '28px 32px',
        marginBottom: '28px',
        display: 'flex',
        gap: '24px',
        alignItems: 'center',
        flexWrap: 'wrap',
      }}>
        {/* Store Avatar or Banner */}
        <div style={{
          width: 84, height: 84, borderRadius: '50%',
          background: 'linear-gradient(135deg, rgba(0,214,143,0.2), rgba(0,207,255,0.2))',
          border: '2px solid rgba(0,214,143,0.4)',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          fontSize: '2.5rem', flexShrink: 0, overflow: 'hidden',
        }}>
          {store?.banner_url ? (
            <img src={store.banner_url} alt={store.name} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
          ) : (
            '🏔️'
          )}
        </div>

        <div style={{ flex: 1, minWidth: '280px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '6px', flexWrap: 'wrap' }}>
            <h1 style={{ fontFamily: 'var(--font-display)', fontSize: '1.5rem', fontWeight: 700 }}>
              {store?.name || 'Mi Tienda Oficial'}
            </h1>
            {store?.is_verified && (
              <span className="badge badge-emerald">
                <CheckCircle2 size={11} /> Tienda Verificada
              </span>
            )}
            <span className="badge badge-purple" style={{ textTransform: 'capitalize' }}>
              {store?.category || 'artesanías'}
            </span>
          </div>
          <div style={{ display: 'flex', gap: '16px', flexWrap: 'wrap', fontSize: '0.85rem', color: 'var(--text-secondary)' }}>
            <span style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
              <MapPin size={14} /> {store?.location_city || 'Bolivia'}, {store?.location_country || 'Bolivia'}
            </span>
            <span style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
              <Star size={14} color="var(--brand-gold)" /> {store?.rating || 4.9} ({store?.rating_count || 45} valoraciones)
            </span>
            <span style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
              <Globe size={14} /> Conectada a Red de Viajeros
            </span>
          </div>
          <p style={{ marginTop: '10px', fontSize: '0.875rem', color: 'var(--text-secondary)', maxWidth: '650px', lineHeight: 1.5 }}>
            {store?.description || 'Productos andinos y nacionales con autenticidad garantizada y entregas mediante viajeros con Escrow.'}
          </p>
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', flexShrink: 0 }}>
          <Link href="/dashboard/products/new" className="btn btn-gold" style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
            <Plus size={16} /> Agregar Producto
          </Link>
          <button 
            type="button" 
            onClick={openEditModal} 
            className="btn btn-ghost btn-sm" 
            style={{ display: 'flex', alignItems: 'center', gap: '6px' }}
          >
            <Edit size={14} /> Editar Tienda
          </button>
        </div>
      </div>

      {/* Stats Cards */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: '14px', marginBottom: '28px' }}>
        {[
          { label: 'Ventas generadas', value: `$${totalSales.toFixed(2)}`, color: 'var(--brand-emerald)', iconBg: 'rgba(0,214,143,0.15)', glow: 'rgba(0,214,143,0.08)', icon: TrendingUp },
          { label: 'Productos activos', value: `${activeProductsCount}`, color: 'var(--brand-cyan)', iconBg: 'rgba(0,207,255,0.15)', glow: 'rgba(0,207,255,0.08)', icon: Package },
          { label: 'Pedidos recibidos', value: `${ordersCount}`, color: 'var(--brand-gold)', iconBg: 'rgba(245,166,35,0.15)', glow: 'rgba(245,166,35,0.08)', icon: ShoppingBag },
          { label: 'Valoración media', value: `★ ${store?.rating || 4.9}`, color: 'var(--brand-purple)', iconBg: 'rgba(155,114,255,0.15)', glow: 'rgba(155,114,255,0.08)', icon: Star },
        ].map((s, i) => (
          <div key={i} className="stat-card" style={{ '--stat-glow': s.glow } as React.CSSProperties}>
            <div className="stat-icon" style={{ background: s.iconBg }}>
              <s.icon size={20} color={s.color} />
            </div>
            <div>
              <div className="stat-value" style={{ color: s.color }}>{s.value}</div>
              <div className="stat-label">{s.label}</div>
            </div>
          </div>
        ))}
      </div>

      {/* Tabs */}
      <div className="tab-bar" style={{ marginBottom: '24px', maxWidth: '440px' }}>
        {[
          { id: 'overview', label: 'Resumen' },
          { id: 'products', label: `Mis Productos (${products.length})` },
          { id: 'orders', label: `Pedidos (${orders.length})` },
        ].map(t => (
          <button 
            key={t.id} 
            type="button" 
            className={`tab-item ${activeTab === t.id ? 'active' : ''}`} 
            onClick={() => setActiveTab(t.id as typeof activeTab)}
          >
            {t.label}
          </button>
        ))}
      </div>

      {/* TAB CONTENT: PRODUCTS */}
      {activeTab === 'products' && (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(260px, 1fr))', gap: '16px' }}>
          {products.map(p => {
            const displayImg = p.images && p.images.length > 0 ? p.images[0] : (p.image || DEFAULT_PRODUCTS[0].image);
            return (
              <div key={p.id} className="card" style={{ overflow: 'hidden' }}>
                <div style={{ position: 'relative' }}>
                  <img src={displayImg} alt={p.title} style={{ width: '100%', height: 160, objectFit: 'cover', display: 'block' }} />
                  <div style={{ position: 'absolute', top: 8, right: 8, display: 'flex', gap: '5px' }}>
                    {p.stock === 0 || !p.is_active ? (
                      <span className="badge badge-red" style={{ fontSize: '0.65rem' }}>Sin stock</span>
                    ) : (
                      <span className="badge badge-emerald" style={{ fontSize: '0.65rem' }}>Activo</span>
                    )}
                  </div>
                  {p.images && p.images.length > 1 && (
                    <div style={{ 
                      position: 'absolute', bottom: 8, left: 8, 
                      background: 'rgba(0,0,0,0.7)', backdropFilter: 'blur(4px)',
                      borderRadius: '6px', padding: '2px 6px', fontSize: '0.68rem', color: '#fff' 
                    }}>
                      📷 {p.images.length} fotos
                    </div>
                  )}
                </div>
                <div style={{ padding: '16px' }}>
                  <div style={{ fontWeight: 600, marginBottom: '8px', fontSize: '0.9rem', lineHeight: 1.3 }}>{p.title}</div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '12px' }}>
                    <span style={{ fontFamily: 'var(--font-display)', fontWeight: 700, color: 'var(--brand-cyan)', fontSize: '1.1rem' }}>
                      ${p.price.toFixed(2)} <span style={{ fontSize: '0.7rem', color: 'var(--text-muted)', fontWeight: 400 }}>USDC</span>
                    </span>
                    <span style={{ fontSize: '0.75rem', color: 'var(--brand-gold)' }}>★ {p.rating || 4.9}</span>
                  </div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.78rem', color: 'var(--text-muted)', marginBottom: '12px' }}>
                    <span>📦 {p.stock} en stock</span>
                    <span>🛍 {p.orders_count || 0} pedidos</span>
                  </div>
                  <div style={{ display: 'flex', gap: '8px' }}>
                    <Link href={`/dashboard/products`} className="btn btn-ghost btn-sm" style={{ flex: 1 }}>
                      <Edit size={13} /> Gestionar
                    </Link>
                    <button 
                      type="button"
                      onClick={() => setDeleteProductTarget(p)}
                      className="btn btn-outline btn-sm" 
                      style={{ color: '#ef4444', borderColor: 'rgba(239,68,68,0.3)', padding: '0 10px' }}
                      title="Eliminar producto"
                    >
                      <Trash2 size={13} />
                    </button>
                  </div>
                </div>
              </div>
            );
          })}

          {/* Add Product Card */}
          <Link href="/dashboard/products/new" className="card" style={{
            display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center',
            padding: '40px', cursor: 'pointer', border: '2px dashed var(--border-default)', minHeight: 280,
            gap: '12px', color: 'var(--text-muted)', textDecoration: 'none',
          }}>
            <div style={{ width: 52, height: 52, borderRadius: 14, background: 'rgba(255,255,255,0.04)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <Plus size={24} color="var(--brand-gold)" />
            </div>
            <div style={{ textAlign: 'center' }}>
              <div style={{ fontWeight: 600, color: 'var(--text-secondary)', marginBottom: '4px' }}>Publicar Nuevo Producto</div>
              <div style={{ fontSize: '0.8rem' }}>Con fotos y protección Escrow</div>
            </div>
          </Link>
        </div>
      )}

      {/* TAB CONTENT: ORDERS */}
      {activeTab === 'orders' && (
        <div className="card">
          <div style={{ padding: '16px 22px', borderBottom: '1px solid var(--border-subtle)', fontWeight: 700, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <span>Pedidos Recibidos para esta Tienda</span>
            <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)', fontWeight: 400 }}>{orders.length} pedidos</span>
          </div>
          <div style={{ overflowX: 'auto' }}>
            <table className="data-table">
              <thead>
                <tr>
                  <th>ID Pedido</th>
                  <th>Producto / Título</th>
                  <th>Destino / Comprador</th>
                  <th>Estado</th>
                  <th>OTP de Entrega</th>
                  <th style={{ textAlign: 'right' }}>Total (USDC)</th>
                </tr>
              </thead>
              <tbody>
                {orders.map(o => {
                  const st: Record<string, string> = { shipped: 'badge-purple', funded: 'badge-gold', completed: 'badge-emerald', created: 'badge-cyan' };
                  const sl: Record<string, string> = { shipped: 'En tránsito', funded: 'En Escrow', completed: 'Entregado', created: 'Esperando Pago' };
                  return (
                    <tr key={o.id}>
                      <td><span style={{ fontFamily: 'monospace', fontSize: '0.8rem', color: 'var(--text-muted)' }}>#{o.id.slice(0, 8)}</span></td>
                      <td style={{ fontWeight: 500, color: 'var(--text-primary)', fontSize: '0.875rem' }}>{o.title}</td>
                      <td>
                        <span style={{ fontSize: '0.82rem', color: 'var(--text-secondary)' }}>
                          {o.buyer_name || o.destination_city}
                        </span>
                      </td>
                      <td><span className={`badge ${st[o.status] || 'badge-cyan'}`}>{sl[o.status] || o.status}</span></td>
                      <td>
                        {o.otp_code ? (
                          <span style={{ fontFamily: 'monospace', background: 'rgba(0,207,255,0.1)', color: 'var(--brand-cyan)', padding: '2px 8px', borderRadius: '4px', fontSize: '0.8rem', fontWeight: 700 }}>
                            {o.otp_code}
                          </span>
                        ) : (
                          <span style={{ color: 'var(--text-muted)', fontSize: '0.75rem' }}>—</span>
                        )}
                      </td>
                      <td style={{ textAlign: 'right', fontWeight: 700, color: 'var(--brand-cyan)', fontFamily: 'var(--font-display)' }}>
                        ${Number(o.total_price).toFixed(2)}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* TAB CONTENT: OVERVIEW */}
      {activeTab === 'overview' && (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: '20px' }}>
          <div className="card" style={{ padding: '24px' }}>
            <div style={{ fontWeight: 700, marginBottom: '16px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <span>Productos Destacados</span>
              <button type="button" onClick={() => setActiveTab('products')} className="btn btn-ghost btn-sm" style={{ fontSize: '0.75rem' }}>
                Ver todos
              </button>
            </div>
            {products.slice(0, 4).map((p, i) => {
              const img = p.images && p.images.length > 0 ? p.images[0] : (p.image || DEFAULT_PRODUCTS[0].image);
              return (
                <div key={p.id} style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '12px', paddingBottom: '12px', borderBottom: '1px solid var(--border-subtle)' }}>
                  <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)', width: 20 }}>#{i + 1}</span>
                  <img src={img} alt="" style={{ width: 42, height: 42, borderRadius: 8, objectFit: 'cover', flexShrink: 0 }} />
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{ fontSize: '0.85rem', fontWeight: 600, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{p.title}</div>
                    <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)' }}>{p.orders_count || 0} pedidos · Stock: {p.stock}</div>
                  </div>
                  <div style={{ fontWeight: 700, color: 'var(--brand-cyan)', fontSize: '0.9rem', flexShrink: 0 }}>${p.price.toFixed(2)}</div>
                </div>
              );
            })}
          </div>

          <div className="card" style={{ padding: '24px' }}>
            <div style={{ fontWeight: 700, marginBottom: '16px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <span>Últimos Pedidos</span>
              <button type="button" onClick={() => setActiveTab('orders')} className="btn btn-ghost btn-sm" style={{ fontSize: '0.75rem' }}>
                Ver historial
              </button>
            </div>
            {orders.slice(0, 4).map(o => {
              const st: Record<string, string> = { shipped: 'badge-purple', funded: 'badge-gold', completed: 'badge-emerald', created: 'badge-cyan' };
              return (
                <div key={o.id} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '10px 0', borderBottom: '1px solid var(--border-subtle)' }}>
                  <div style={{ minWidth: 0, paddingRight: '12px' }}>
                    <div style={{ fontSize: '0.85rem', fontWeight: 500, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{o.title}</div>
                    <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)' }}>{o.buyer_name}</div>
                  </div>
                  <div style={{ textAlign: 'right', flexShrink: 0 }}>
                    <div style={{ fontWeight: 700, color: 'var(--brand-cyan)', fontSize: '0.9rem' }}>${Number(o.total_price).toFixed(2)}</div>
                    <span className={`badge ${st[o.status] || 'badge-cyan'}`} style={{ fontSize: '0.62rem' }}>
                      {{ funded: 'En Escrow', shipped: 'Tránsito', completed: 'Entregado', created: 'Creado' }[o.status] || o.status}
                    </span>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* EDIT / REGISTER STORE MODAL */}
      {isEditModalOpen && (
        <>
          <div className="cart-overlay" onClick={() => setIsEditModalOpen(false)} />
          <div className="modal-content" style={{ maxWidth: '520px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <Store size={20} color="var(--brand-cyan)" />
                <h3 style={{ fontSize: '1.2rem', fontWeight: 700 }}>Editar Información de la Tienda</h3>
              </div>
              <button 
                type="button" 
                onClick={() => setIsEditModalOpen(false)} 
                className="btn btn-ghost btn-sm"
                style={{ width: 32, height: 32, borderRadius: '50%', padding: 0 }}
              >
                <X size={16} />
              </button>
            </div>

            <form onSubmit={handleSaveStore} style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
              <div>
                <label className="label">Nombre Comercial de la Tienda *</label>
                <input
                  type="text"
                  required
                  value={editName}
                  onChange={e => setEditName(e.target.value)}
                  placeholder="Ej: Tejidos Illimani, Cacao del Beni"
                  className="input"
                />
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
                <div>
                  <label className="label">Categoría Principal *</label>
                  <select
                    value={editCategory}
                    onChange={e => setEditCategory(e.target.value)}
                    className="input"
                  >
                    <option value="textiles">Textiles & Aguayos</option>
                    <option value="food">Alimentos & Cacao</option>
                    <option value="condiments">Condimentos & Sabores</option>
                    <option value="jewelry">Joyería & Plata</option>
                    <option value="art">Arte & Artesanías</option>
                    <option value="medical">Insumos Médicos</option>
                    <option value="tech">Tecnología</option>
                  </select>
                </div>
                <div>
                  <label className="label">Ciudad de Origen *</label>
                  <input
                    type="text"
                    required
                    value={editCity}
                    onChange={e => setEditCity(e.target.value)}
                    placeholder="Ej: Cochabamba, La Paz"
                    className="input"
                  />
                </div>
              </div>

              <div>
                <label className="label">Descripción de la Tienda y Técnicas Artesanales</label>
                <textarea
                  rows={3}
                  value={editDescription}
                  onChange={e => setEditDescription(e.target.value)}
                  placeholder="Explica a los compradores internacionales la procedencia de tus productos, la tradición familiar o la calidad de tus materiales..."
                  className="input"
                  style={{ resize: 'vertical' }}
                />
              </div>

              <div>
                <label className="label">Banner o Foto Principal de la Tienda</label>
                <input
                  type="url"
                  value={editBanner}
                  onChange={e => setEditBanner(e.target.value)}
                  placeholder="https://images.unsplash.com/... o sube una imagen"
                  className="input"
                />
                <div style={{ marginTop: '8px' }}>
                  <ImageUploader
                    bucket="ayni-images"
                    pathPrefix="stores"
                    maxFiles={1}
                    onUploadComplete={(urls) => {
                      if (urls.length > 0) setEditBanner(urls[0]);
                    }}
                    label="O subir foto de tienda a Storage"
                    compact
                  />
                </div>
              </div>

              {saveSuccess && (
                <div className="alert alert-success" style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <Check size={16} /> {saveSuccess}
                </div>
              )}

              <div style={{ display: 'flex', gap: '10px', marginTop: '10px' }}>
                <button 
                  type="button" 
                  onClick={() => setIsEditModalOpen(false)} 
                  className="btn btn-outline" 
                  style={{ flex: 1 }}
                >
                  Cancelar
                </button>
                <button 
                  type="submit" 
                  disabled={savingStore} 
                  className="btn btn-primary" 
                  style={{ flex: 2, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px' }}
                >
                  {savingStore ? <RefreshCw size={16} className="spin" /> : <Check size={16} />}
                  Guardar Tienda en Supabase
                </button>
              </div>
            </form>
          </div>
        </>
      )}

      {/* DELETE PRODUCT CONFIRMATION MODAL */}
      {deleteProductTarget && (
        <>
          <div className="cart-overlay" onClick={() => setDeleteProductTarget(null)} />
          <div className="modal-content" style={{ maxWidth: '420px', textAlign: 'center' }}>
            <div style={{ 
              width: 52, height: 52, borderRadius: '50%', background: 'rgba(239,68,68,0.1)', 
              color: '#ef4444', display: 'flex', alignItems: 'center', justifyContent: 'center', 
              margin: '0 auto 16px' 
            }}>
              <Trash2 size={24} />
            </div>
            <h3 style={{ fontSize: '1.15rem', fontWeight: 700, marginBottom: '8px' }}>
              ¿Eliminar {deleteProductTarget.title}?
            </h3>
            <p style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', marginBottom: '20px', lineHeight: 1.4 }}>
              Esta acción no se puede deshacer. Se removerá del Marketplace de AYNI y de tu inventario.
            </p>
            <div style={{ display: 'flex', gap: '10px' }}>
              <button 
                type="button" 
                onClick={() => setDeleteProductTarget(null)} 
                className="btn btn-outline" 
                style={{ flex: 1 }}
              >
                Cancelar
              </button>
              <button 
                type="button" 
                onClick={() => handleDeleteProduct(deleteProductTarget)} 
                className="btn btn-primary" 
                style={{ flex: 1, background: '#ef4444', borderColor: '#ef4444' }}
              >
                Sí, Eliminar
              </button>
            </div>
          </div>
        </>
      )}
    </DashboardLayout>
  );
}
