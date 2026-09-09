'use client';

import React, { useState } from 'react';
import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { Package, Plus, Search, Sparkles, Tag, CheckCircle2, Edit2, Trash2 } from 'lucide-react';

const MERCHANT_PRODUCTS = [
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

  const filtered = MERCHANT_PRODUCTS.filter(p =>
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
        <button className="btn btn-gold">
          <Plus size={16} /> Publicar Nuevo Producto
        </button>
      </div>

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
              {filtered.map(prod => (
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
                    <span className="badge badge-emerald" style={{ fontSize: '0.7rem' }}>
                      Activo
                    </span>
                  </td>
                  <td style={{ textAlign: 'right' }}>
                    <button className="btn btn-ghost btn-sm" style={{ padding: '6px' }}>
                      <Edit2 size={14} />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </DashboardLayout>
  );
}
