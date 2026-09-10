'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { Package, Plus, Search, Sparkles, Tag, CheckCircle2, Edit2, Trash2, Power } from 'lucide-react';

export interface ProductItem {
  id: string;
  title: string;
  category: string;
  price: number;
  stock: number;
  status: 'active' | 'paused';
  sold: number;
}

const DEFAULT_PRODUCTS: ProductItem[] = [
  {
    id: 'P009',
    title: 'Ají Amarillo & Panca en Vainas Deshidratadas (250g)',
    category: 'Condimentos & Especias',
    price: 14.50,
    stock: 45,
    status: 'active',
    sold: 128,
  },
  {
    id: 'P010',
    title: 'Llajwa Artesanal Deshidratada con Quirquiña y Locoto (Pack x3)',
    category: 'Condimentos & Especias',
    price: 12.00,
    stock: 60,
    status: 'active',
    sold: 215,
  },
  {
    id: 'P011',
    title: 'Sal Rosada Ancestral de Salar con Finas Hierbas (400g)',
    category: 'Condimentos & Especias',
    price: 11.50,
    stock: 32,
    status: 'active',
    sold: 84,
  },
  {
    id: 'P001',
    title: 'Chullo Artesanal Andino Lana de Alpaca',
    category: 'Textiles',
    price: 38.00,
    stock: 14,
    status: 'active',
    sold: 42,
  },
];

export default function MerchantProductsPage() {
  const [searchTerm, setSearchTerm] = useState('');
  const [products, setProducts] = useState<ProductItem[]>(DEFAULT_PRODUCTS);
  const [notice, setNotice] = useState<string | null>(null);

  useEffect(() => {
    if (typeof window !== 'undefined') {
      const saved = localStorage.getItem('ayni_merchant_products');
      if (saved) {
        try {
          const parsed = JSON.parse(saved);
          if (Array.isArray(parsed) && parsed.length > 0) {
            setProducts(parsed);
          }
        } catch (e) {
          // ignore
        }
      }
    }
  }, []);

  const saveProducts = (updated: ProductItem[]) => {
    setProducts(updated);
    if (typeof window !== 'undefined') {
      localStorage.setItem('ayni_merchant_products', JSON.stringify(updated));
    }
  };

  const handleDelete = (id: string) => {
    const updated = products.filter(p => p.id !== id);
    saveProducts(updated);
    setNotice('Producto eliminado del catálogo.');
    setTimeout(() => setNotice(null), 3000);
  };

  const handleToggleStatus = (id: string) => {
    const updated = products.map(p => {
      if (p.id === id) {
        const nextStatus = p.status === 'active' ? 'paused' : 'active';
        return { ...p, status: nextStatus as 'active' | 'paused' };
      }
      return p;
    });
    saveProducts(updated);
    setNotice('Estado del producto actualizado.');
    setTimeout(() => setNotice(null), 2500);
  };

  const filtered = products.filter(p =>
    p.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
    p.category.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <DashboardLayout>
      <div className="page-header">
        <div className="page-title-group">
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '4px' }}>
            <div className="page-title">Gestión de Productos & Stock</div>
            <span className="badge badge-emerald">
              <Sparkles size={11} /> Catálogo de Tienda
            </span>
          </div>
          <div className="page-subtitle">
            Administra tus condimentos, artesanías y productos disponibles para viajeros y clientes globales.
          </div>
        </div>
        <Link
          href="/dashboard/products/new"
          className="btn btn-gold"
          style={{ display: 'inline-flex', alignItems: 'center', gap: '8px', textDecoration: 'none' }}
        >
          <Plus size={16} /> Publicar Nuevo Producto
        </Link>
      </div>

      {notice && (
        <div className="alert alert-success" style={{ marginBottom: '18px' }}>
          <CheckCircle2 size={16} /> {notice}
        </div>
      )}

      {/* Search */}
      <div style={{ marginBottom: '20px', maxWidth: '400px' }}>
        <div className="input-icon-wrap">
          <Search size={16} className="input-icon" />
          <input
            type="search"
            placeholder="Filtrar por nombre o categoría..."
            className="input"
            style={{ paddingLeft: '40px' }}
            value={searchTerm}
            onChange={e => setSearchTerm(e.target.value)}
          />
        </div>
      </div>

      {/* Table */}
      <div className="card" style={{ padding: '24px' }}>
        <div style={{ overflowX: 'auto' }}>
          <table className="table" style={{ width: '100%' }}>
            <thead>
              <tr>
                <th>Código / Producto</th>
                <th>Categoría</th>
                <th>Precio Unitario</th>
                <th>Stock Disponible</th>
                <th>Ventas Históricas</th>
                <th>Estado</th>
                <th style={{ textAlign: 'right' }}>Acciones</th>
              </tr>
            </thead>
            <tbody>
              {filtered.length === 0 ? (
                <tr>
                  <td colSpan={7} style={{ textAlign: 'center', padding: '32px', color: 'var(--text-muted)' }}>
                    No se encontraron productos coincidentes.
                  </td>
                </tr>
              ) : (
                filtered.map(prod => (
                  <tr key={prod.id}>
                    <td>
                      <div style={{ fontWeight: 600, color: 'var(--text-primary)' }}>{prod.title}</div>
                      <div style={{ fontSize: '0.72rem', color: 'var(--brand-cyan)' }}>#{prod.id}</div>
                    </td>
                    <td>
                      <span className="badge badge-gold" style={{ fontSize: '0.75rem' }}>{prod.category}</span>
                    </td>
                    <td style={{ fontWeight: 700, color: 'var(--text-primary)' }}>
                      ${prod.price.toFixed(2)} USDC
                    </td>
                    <td>
                      <span style={{ fontWeight: 600, color: prod.stock > 20 ? 'var(--brand-emerald)' : 'var(--brand-gold)' }}>
                        {prod.stock} unidades
                      </span>
                    </td>
                    <td style={{ color: 'var(--text-secondary)' }}>
                      {prod.sold} entregas
                    </td>
                    <td>
                      <span
                        className={`badge ${prod.status === 'active' ? 'badge-emerald' : 'badge-gold'}`}
                        style={{ fontSize: '0.7rem' }}
                      >
                        {prod.status === 'active' ? '● Activo' : '⏸ Pausado'}
                      </span>
                    </td>
                    <td style={{ textAlign: 'right' }}>
                      <div style={{ display: 'inline-flex', gap: '6px' }}>
                        <button
                          type="button"
                          onClick={() => handleToggleStatus(prod.id)}
                          className="btn btn-ghost btn-sm"
                          style={{ padding: '6px 8px' }}
                          title={prod.status === 'active' ? 'Pausar publicación' : 'Activar publicación'}
                        >
                          <Power size={14} color={prod.status === 'active' ? 'var(--brand-gold)' : 'var(--brand-emerald)'} />
                        </button>
                        <button
                          type="button"
                          onClick={() => handleDelete(prod.id)}
                          className="btn btn-ghost btn-sm"
                          style={{ padding: '6px 8px', color: 'var(--brand-red)' }}
                          title="Eliminar producto"
                        >
                          <Trash2 size={14} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </DashboardLayout>
  );
}
