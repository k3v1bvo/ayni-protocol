'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { useAuth } from '@/context/AuthContext';
import { getSupabaseBrowserClient, isSupabaseConfigured } from '@/lib/supabase/client';
import {
  Package, Plus, Edit2, Trash2, CheckCircle2, Eye, AlertTriangle,
  Sparkles, Search, Loader2, X, Save, DollarSign
} from 'lucide-react';

interface Product {
  id: string;
  code?: string;
  title: string;
  category: string;
  price_usd: number;
  weight_kg?: number;
  image_url?: string;
  in_stock: boolean;
  description?: string;
  created_at?: string;
}

export default function ProductsPage() {
  const { user } = useAuth();
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [storeId, setStoreId] = useState<string | null>(null);
  const [searchQ, setSearchQ] = useState('');
  const [notice, setNotice] = useState<string | null>(null);

  // Edit modal
  const [editProduct, setEditProduct] = useState<Product | null>(null);
  const [editTitle, setEditTitle] = useState('');
  const [editPrice, setEditPrice] = useState('');
  const [editCategory, setEditCategory] = useState('');
  const [editInStock, setEditInStock] = useState(true);
  const [editSaving, setEditSaving] = useState(false);

  // Delete confirmation
  const [deleteId, setDeleteId] = useState<string | null>(null);
  const [deleting, setDeleting] = useState(false);

  useEffect(() => {
    loadProducts();
  }, [user]);

  async function loadProducts() {
    if (!user?.id) { setLoading(false); return; }

    if (isSupabaseConfigured) {
      try {
        const supabase = getSupabaseBrowserClient();
        // Find store
        const { data: store } = await supabase.from('stores').select('id').eq('owner_id', user.id).single();
        if (store) {
          setStoreId(store.id);
          const { data: prods } = await supabase
            .from('products')
            .select('*')
            .eq('store_id', store.id)
            .order('created_at', { ascending: false });
          if (prods) { setProducts(prods); setLoading(false); return; }
        }
      } catch (e) {
        console.warn('Supabase product load error:', e);
      }
    }

    // Fallback: localStorage
    const saved = localStorage.getItem('ayni_merchant_products');
    if (saved) {
      try { setProducts(JSON.parse(saved)); } catch {}
    }
    setLoading(false);
  }

  const handleDelete = async () => {
    if (!deleteId) return;
    setDeleting(true);

    if (isSupabaseConfigured) {
      try {
        const res = await fetch(`/api/products?id=${deleteId}`, { method: 'DELETE' });
        if (res.ok) {
          setProducts(prev => prev.filter(p => p.id !== deleteId));
          setNotice('Producto eliminado correctamente.');
          setDeleteId(null);
          setDeleting(false);
          setTimeout(() => setNotice(null), 3000);
          return;
        }
      } catch (e) { console.warn(e); }
    }

    // Fallback
    const updated = products.filter(p => p.id !== deleteId);
    setProducts(updated);
    localStorage.setItem('ayni_merchant_products', JSON.stringify(updated));
    setNotice('Producto eliminado.');
    setDeleteId(null);
    setDeleting(false);
    setTimeout(() => setNotice(null), 3000);
  };

  const openEdit = (p: Product) => {
    setEditProduct(p);
    setEditTitle(p.title);
    setEditPrice(String(p.price_usd));
    setEditCategory(p.category);
    setEditInStock(p.in_stock);
  };

  const handleEditSave = async () => {
    if (!editProduct) return;
    setEditSaving(true);

    const payload = {
      id: editProduct.id,
      title: editTitle.trim().slice(0, 200),
      price_usd: Math.max(0.01, parseFloat(editPrice) || 0),
      category: editCategory,
      in_stock: editInStock,
    };

    if (isSupabaseConfigured) {
      try {
        const res = await fetch('/api/products', {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(payload),
        });
        if (res.ok) {
          const { product } = await res.json();
          setProducts(prev => prev.map(p => p.id === editProduct.id ? { ...p, ...product } : p));
          setNotice('Producto actualizado.');
          setEditProduct(null);
          setEditSaving(false);
          setTimeout(() => setNotice(null), 3000);
          return;
        }
      } catch (e) { console.warn(e); }
    }

    // Fallback
    setProducts(prev => prev.map(p => p.id === editProduct.id ? { ...p, ...payload } : p));
    setNotice('Producto actualizado localmente.');
    setEditProduct(null);
    setEditSaving(false);
    setTimeout(() => setNotice(null), 3000);
  };

  const filtered = products.filter(p =>
    !searchQ || p.title.toLowerCase().includes(searchQ.toLowerCase()) || p.category.toLowerCase().includes(searchQ.toLowerCase())
  );

  return (
    <DashboardLayout>
      <div className="page-header" style={{ marginBottom: '24px' }}>
        <div className="page-title-group">
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '4px', flexWrap: 'wrap' }}>
            <div className="page-title">Mis Productos</div>
            <span className="badge badge-emerald"><Sparkles size={11} /> Catálogo</span>
            <span className="badge badge-cyan" style={{ fontSize: '0.7rem' }}>{products.length} productos</span>
          </div>
          <div className="page-subtitle">Gestiona el catálogo de tu tienda. Crea, edita o elimina productos.</div>
        </div>
        <Link href="/dashboard/products/new" className="btn btn-primary" style={{ display: 'inline-flex', alignItems: 'center', gap: '6px' }}>
          <Plus size={16} /> Nuevo Producto
        </Link>
      </div>

      {notice && (
        <div className="alert alert-success" style={{ marginBottom: '16px' }}><CheckCircle2 size={16} /> {notice}</div>
      )}

      {/* Search */}
      <div style={{ marginBottom: '20px', position: 'relative', maxWidth: '400px' }}>
        <Search size={16} style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }} />
        <input
          type="text"
          placeholder="Buscar productos..."
          value={searchQ}
          onChange={e => setSearchQ(e.target.value)}
          className="input"
          style={{ paddingLeft: '36px' }}
        />
      </div>

      {loading ? (
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', minHeight: '30vh', gap: '10px', color: 'var(--text-muted)' }}>
          <Loader2 size={20} style={{ animation: 'spin 1s linear infinite' }} /> Cargando productos...
        </div>
      ) : filtered.length === 0 ? (
        <div className="card" style={{ padding: '40px', textAlign: 'center' }}>
          <Package size={40} color="var(--text-muted)" style={{ marginBottom: '12px' }} />
          <h3 style={{ fontWeight: 700, fontSize: '1.1rem', marginBottom: '8px' }}>No hay productos aún</h3>
          <p style={{ color: 'var(--text-secondary)', fontSize: '0.88rem', marginBottom: '16px' }}>
            Agrega tu primer producto para que aparezca en el Marketplace.
          </p>
          <Link href="/dashboard/products/new" className="btn btn-primary" style={{ display: 'inline-flex', alignItems: 'center', gap: '6px' }}>
            <Plus size={16} /> Crear Producto
          </Link>
        </div>
      ) : (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: '16px' }}>
          {filtered.map(p => (
            <div key={p.id} className="card card-kinetic" style={{ overflow: 'hidden' }}>
              {/* Image */}
              <div style={{ height: '140px', background: 'rgba(255,255,255,0.03)', overflow: 'hidden' }}>
                {p.image_url ? (
                  <img src={p.image_url} alt={p.title} style={{ width: '100%', height: '100%', objectFit: 'cover' }} loading="lazy" />
                ) : (
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '100%' }}>
                    <Package size={32} color="var(--text-muted)" />
                  </div>
                )}
              </div>
              {/* Info */}
              <div style={{ padding: '16px' }}>
                <div style={{ fontWeight: 700, fontSize: '0.92rem', marginBottom: '4px', color: 'var(--text-primary)' }}>{p.title}</div>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
                  <span className="badge badge-cyan" style={{ fontSize: '0.7rem' }}>{p.category}</span>
                  <span className={`badge ${p.in_stock ? 'badge-emerald' : 'badge-red'}`} style={{ fontSize: '0.7rem' }}>
                    {p.in_stock ? 'En stock' : 'Agotado'}
                  </span>
                </div>
                <div style={{ fontWeight: 800, fontSize: '1.1rem', color: 'var(--brand-gold)', marginBottom: '12px' }}>
                  ${p.price_usd?.toFixed(2)} <span style={{ fontSize: '0.7rem', fontWeight: 400, color: 'var(--text-muted)' }}>USDC</span>
                </div>
                <div style={{ display: 'flex', gap: '8px' }}>
                  <button type="button" onClick={() => openEdit(p)} className="btn btn-ghost btn-sm" style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '4px' }}>
                    <Edit2 size={13} /> Editar
                  </button>
                  <button type="button" onClick={() => setDeleteId(p.id)} className="btn btn-ghost btn-sm" style={{ color: 'var(--brand-red)', borderColor: 'rgba(239,68,68,0.3)' }}>
                    <Trash2 size={13} />
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Edit Modal */}
      {editProduct && (
        <div className="modal-overlay" onClick={() => setEditProduct(null)}>
          <div className="modal-box" style={{ width: '100%', maxWidth: 460, padding: '28px' }} onClick={e => e.stopPropagation()}>
            <button type="button" onClick={() => setEditProduct(null)} style={{ position: 'absolute', top: 16, right: 16, background: 'transparent', border: 'none', color: 'var(--text-muted)', cursor: 'pointer' }}>
              <X size={18} />
            </button>
            <h3 style={{ fontSize: '1.15rem', fontWeight: 700, marginBottom: '20px' }}>Editar Producto</h3>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
              <div className="input-group">
                <label className="input-label">Título</label>
                <input type="text" value={editTitle} onChange={e => setEditTitle(e.target.value)} className="input" />
              </div>
              <div className="input-group">
                <label className="input-label">Precio (USDC)</label>
                <input type="number" min="0.01" step="0.01" value={editPrice} onChange={e => setEditPrice(e.target.value)} className="input" />
              </div>
              <div className="input-group">
                <label className="input-label">En stock</label>
                <select value={editInStock ? 'yes' : 'no'} onChange={e => setEditInStock(e.target.value === 'yes')} className="input">
                  <option value="yes">Sí — Disponible</option>
                  <option value="no">No — Agotado</option>
                </select>
              </div>
              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '10px', marginTop: '8px' }}>
                <button type="button" onClick={() => setEditProduct(null)} className="btn btn-ghost">Cancelar</button>
                <button type="button" onClick={handleEditSave} disabled={editSaving} className="btn btn-primary" style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                  {editSaving ? <Loader2 size={14} style={{ animation: 'spin 1s linear infinite' }} /> : <Save size={14} />}
                  {editSaving ? 'Guardando...' : 'Guardar'}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Delete Confirmation */}
      {deleteId && (
        <div className="modal-overlay" onClick={() => setDeleteId(null)}>
          <div className="modal-box" style={{ width: '100%', maxWidth: 400, padding: '28px', textAlign: 'center' }} onClick={e => e.stopPropagation()}>
            <AlertTriangle size={36} color="var(--brand-red)" style={{ marginBottom: '12px' }} />
            <h3 style={{ fontSize: '1.1rem', fontWeight: 700, marginBottom: '8px' }}>¿Eliminar producto?</h3>
            <p style={{ color: 'var(--text-secondary)', fontSize: '0.88rem', marginBottom: '20px' }}>
              Esta acción no se puede deshacer. El producto se eliminará del Marketplace.
            </p>
            <div style={{ display: 'flex', justifyContent: 'center', gap: '10px' }}>
              <button type="button" onClick={() => setDeleteId(null)} className="btn btn-ghost">Cancelar</button>
              <button type="button" onClick={handleDelete} disabled={deleting} className="btn btn-primary" style={{ background: 'var(--brand-red)' }}>
                {deleting ? 'Eliminando...' : 'Sí, Eliminar'}
              </button>
            </div>
          </div>
        </div>
      )}
    </DashboardLayout>
  );
}
