# 🚀 AYNI / MINKA Protocol

> **Ecosistema P2P Descentralizado de Crowdshipping, Comercio y Remesas**  
> *Buildathon ETH Bolivia 2026 — Versión Oficial 1.0.1*

[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)
[![Network: Base L2](https://img.shields.io/badge/Network-Base%20L2-blue.svg)](https://base.org)
[![Database: Supabase](https://img.shields.io/badge/Database-Supabase-3ECF8E.svg)](https://supabase.com)

---

## 🏔️ 1. Fundamentación Filosófica y Visión

El protocolo AYNI / MINKA transforma la logística y el comercio transfronterizo en economías emergentes aprovechando la capacidad ociosa de equipaje de miles de viajeros:

- **Ayni (Reciprocidad y Mutualismo)**: Correspondencia simétrica. Equilibrio justo entre el esfuerzo del transportista y el beneficio del solicitante (*"hoy por ti, mañana por mí"*).
- **Minka (Trabajo Colaborativo)**: Esfuerzo comunitario enfocado en resolver fallas estructurales del entorno (barreras arancelarias, costos abusivos de courier corporativo y comisiones bancarias).
- **Vínculo Social Protector**: Garantía mutua mediante contratos inteligentes (Escrow) y un fondo comunitario de reserva del 2% contra siniestros.

---

## ⚡ 2. Módulos del Sistema

1. **Módulo A: Gestión de Rutas y Capacidad Física**: Declaración de itinerarios multi-escala, peso disponible (kg) y volumen cúbico con evidencia fotográfica.
2. **Módulo B: Marketplace y "Compra a Pie" (Personal Shopper P2P)**: Encargo de compras presenciales en mostrador con verificación táctil y visual, insumos médicos y nichos de asimetría transfronteriza.
3. **Módulo C: Seguridad, Verificación e Inspección con OTP**: Custodia de fondos en Escrow y liberación garantizada únicamente cuando el comprador revela y el transportista ingresa el código OTP alfanumérico de 6 dígitos.
4. **Módulo D: Auditoría y Supervisión con IA Multimodal**: Validación automática de comprobantes, facturas legales y coincidencia de producto con visión artificial (Google Gemini).
5. **Módulo E: Remesas P2P**: Traslado físico de efectivo con liquidación paralela en stablecoins (USDC/USDT) en la red Base L2.

---

## 📊 3. Matriz de Comisiones y Regla de Competitividad

| Comisión Total | Viajero | Sistema (Mantenimiento) | Fondo de Reserva Mutua |
| :--- | :---: | :---: | :---: |
| **10%** del pedido | 5% | 3% | 2% (Fondo siniestros) |
| **7%** del pedido | 4% | 3% | 0% |
| **5%** del pedido | 3% | 2% | 0% |
| **4%** del pedido | 3% | 1% | 0% |

> **Regla de Alto Valor**: Para pedidos de alto costo (insumos médicos, componentes tecnológicos de hasta $3,000 USD), la tarifa de traslado se topa automáticamente:
> $$\text{Tarifa Traslado} = \min(\text{Monto} \times \%\text{tarifa}, \$50.00\text{ USD})$$

---

## 🛠️ 4. Estructura del Proyecto

```
├── supabase/
│   ├── migrations/
│   │   └── 20260908000001_initial_schema.sql  # Tablas, RLS, triggers y funciones
│   └── seed.sql                               # Datos de prueba (rutas, órdenes, usuarios)
├── src/
│   ├── app/
│   │   ├── auth/page.tsx                      # Página de login y registro
│   │   ├── layout.tsx                         # Root Layout con fuentes y AuthProvider
│   │   ├── page.tsx                           # Dashboard interactivo y Landing
│   │   └── globals.css                        # Sistema de diseño Andean-Futuristic
│   ├── components/
│   │   ├── auth/AuthModal.tsx                 # Modal de Email + Google OAuth
│   │   ├── calculator/FeeCalculator.tsx       # Simulador interactivo de tarifas y comisiones
│   │   ├── dashboard/                         # Componentes de rutas, pedidos y estadísticas
│   │   └── layout/Navbar.tsx                  # Barra de navegación con roles y sesión
│   ├── context/
│   │   └── AuthContext.tsx                    # Contexto global de sesión y perfil
│   └── lib/
│       ├── constants/fees.ts                  # Lógica de comisiones escalonadas y tope $50
│       ├── supabase/                          # Clientes SSR y Browser de Supabase
│       └── utils/otp.ts                       # Generador y validador de OTP (6 caracteres)
├── contracts/                                 # Smart contracts (AyniEscrow.sol - Fase 2)
└── package.json
```

---

## 🚀 5. Puesta en Marcha

### Prerrequisitos
- Node.js >= 18
- Cuenta en [Supabase](https://supabase.com) (opcional para desarrollo local; incluye modo demo integrado).

### Instalación
```bash
npm install
```

### Variables de Entorno
Crea un archivo `.env.local` basado en `.env.example`:
```env
NEXT_PUBLIC_SUPABASE_URL=https://tu-proyecto.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=tu-anon-key-de-supabase
```

### Ejecutar en Desarrollo
```bash
npm run dev
```
Abre [http://localhost:3000](http://localhost:3000) en tu navegador.
