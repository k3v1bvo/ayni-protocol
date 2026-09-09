-- ==============================================================================
-- AYNI PROTOCOL - ESQUEMA MAESTRO DE PRODUCCIÓN (SUPABASE / POSTGRESQL 15+)
-- Plataforma P2P de Crowdshipping, Comercio de Origen & Bóvedas de Herencia Cripto
-- ==============================================================================

-- 1. Habilitar extensiones necesarias
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- 2. Definición de Tipos Enumerados (Enums)
DO $$ BEGIN
    CREATE TYPE user_role AS ENUM ('client', 'traveler', 'merchant', 'admin');
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

DO $$ BEGIN
    CREATE TYPE trip_status AS ENUM ('planned', 'active', 'completed', 'cancelled');
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

DO $$ BEGIN
    CREATE TYPE order_type AS ENUM ('foot_shopping', 'parcel_transport', 'cross_border_nostalgia');
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

DO $$ BEGIN
    CREATE TYPE order_status AS ENUM (
        'created',
        'funded',
        'purchased',
        'verified_ai',
        'in_transit',
        'delivered',
        'cancelled',
        'disputed'
    );
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

DO $$ BEGIN
    CREATE TYPE heritage_status AS ENUM ('active', 'heartbeat_due', 'grace_period', 'executed', 'cancelled');
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

-- ==============================================================================
-- 3. TABLA: PROFILES (Extensión de auth.users de Supabase)
-- ==============================================================================
CREATE TABLE IF NOT EXISTS public.profiles (
    id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
    full_name TEXT NOT NULL,
    email TEXT UNIQUE NOT NULL,
    role user_role NOT NULL DEFAULT 'client',
    phone TEXT,
    country TEXT DEFAULT 'Bolivia',
    reputation_score NUMERIC(3,2) DEFAULT 5.00 CHECK (reputation_score >= 1.00 AND reputation_score <= 5.00),
    guarantee_balance NUMERIC(10,2) DEFAULT 0.00,
    verified_id BOOLEAN DEFAULT false,
    wallet_address TEXT,
    avatar_url TEXT,
    created_at TIMESTAMPTZ DEFAULT now(),
    updated_at TIMESTAMPTZ DEFAULT now()
);

-- ==============================================================================
-- 4. TABLA: STORES (Tiendas de Artesanos, Productores y Comercios)
-- ==============================================================================
CREATE TABLE IF NOT EXISTS public.stores (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    owner_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE,
    name TEXT NOT NULL,
    slug TEXT UNIQUE NOT NULL,
    category TEXT NOT NULL, -- 'condiments', 'textiles', 'artisan', 'gourmet'
    description TEXT,
    location_city TEXT NOT NULL,
    location_country TEXT NOT NULL DEFAULT 'Bolivia',
    banner_url TEXT,
    rating NUMERIC(3,2) DEFAULT 5.00,
    is_verified BOOLEAN DEFAULT true,
    created_at TIMESTAMPTZ DEFAULT now(),
    updated_at TIMESTAMPTZ DEFAULT now()
);

-- ==============================================================================
-- 5. TABLA: PRODUCTS (Catálogo de Productos, Condimentos & Artesanías)
-- ==============================================================================
CREATE TABLE IF NOT EXISTS public.products (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    store_id UUID REFERENCES public.stores(id) ON DELETE CASCADE,
    code TEXT UNIQUE NOT NULL,
    title TEXT NOT NULL,
    description TEXT,
    category TEXT NOT NULL, -- 'condiments', 'textiles', 'medical', 'tech', 'food'
    price_usd NUMERIC(10,2) NOT NULL,
    weight_kg NUMERIC(5,2) NOT NULL DEFAULT 0.20,
    origin_country TEXT NOT NULL DEFAULT 'Bolivia',
    image_url TEXT,
    in_stock BOOLEAN DEFAULT true,
    tags TEXT[] DEFAULT '{}',
    available_routes_count INT DEFAULT 1,
    created_at TIMESTAMPTZ DEFAULT now(),
    updated_at TIMESTAMPTZ DEFAULT now()
);

-- ==============================================================================
-- 6. TABLA: TRIPS (Rutas de Viajeros y Espacio en Equipaje)
-- ==============================================================================
CREATE TABLE IF NOT EXISTS public.trips (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    traveler_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE,
    origin_city TEXT NOT NULL,
    origin_country TEXT NOT NULL,
    destination_city TEXT NOT NULL,
    destination_country TEXT NOT NULL,
    departure_date DATE NOT NULL,
    arrival_date DATE NOT NULL,
    flight_number TEXT,
    available_kg NUMERIC(5,2) NOT NULL,
    price_per_kg_usd NUMERIC(6,2) NOT NULL DEFAULT 15.00,
    status trip_status NOT NULL DEFAULT 'active',
    created_at TIMESTAMPTZ DEFAULT now(),
    updated_at TIMESTAMPTZ DEFAULT now()
);

-- ==============================================================================
-- 7. TABLA: ORDERS (Encargos, Compras a Pie y Custodia Escrow)
-- ==============================================================================
CREATE TABLE IF NOT EXISTS public.orders (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    order_code TEXT UNIQUE NOT NULL,
    client_id UUID REFERENCES public.profiles(id),
    traveler_id UUID REFERENCES public.profiles(id),
    store_id UUID REFERENCES public.stores(id),
    product_id UUID REFERENCES public.products(id),
    order_type order_type NOT NULL DEFAULT 'foot_shopping',
    description TEXT NOT NULL,
    
    -- Desglose financiero transparente
    product_price_usd NUMERIC(10,2) NOT NULL,
    traveler_fee_usd NUMERIC(10,2) NOT NULL,
    platform_fee_usd NUMERIC(10,2) NOT NULL,
    guarantee_fund_usd NUMERIC(10,2) NOT NULL,
    total_escrow_usd NUMERIC(10,2) NOT NULL,
    
    -- Seguridad criptográfica
    otp_hash TEXT NOT NULL, -- SHA-256 / Keccak-256
    otp_plain_simulated TEXT, -- Solo para ambiente de pruebas
    status order_status NOT NULL DEFAULT 'funded',
    
    created_at TIMESTAMPTZ DEFAULT now(),
    delivered_at TIMESTAMPTZ
);

-- ==============================================================================
-- 8. TABLA: HERITAGE_VAULTS (Contratos Inteligentes de Herencia Cripto)
-- ==============================================================================
CREATE TABLE IF NOT EXISTS public.heritage_vaults (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    owner_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE,
    vault_name TEXT NOT NULL DEFAULT 'Bóveda Familiar Principal',
    total_staked_usd NUMERIC(12,2) NOT NULL DEFAULT 0.00,
    inactivity_threshold_days INT NOT NULL DEFAULT 180,
    last_heartbeat_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    status heritage_status NOT NULL DEFAULT 'active',
    contract_address TEXT NOT NULL DEFAULT '0x71C99B49a370e1219b26C5F403dD7bB147983690',
    network TEXT NOT NULL DEFAULT 'Base L2',
    created_at TIMESTAMPTZ DEFAULT now(),
    updated_at TIMESTAMPTZ DEFAULT now()
);

-- ==============================================================================
-- 9. TABLA: HERITAGE_BENEFICIARIES (Herederos Designados en el Smart Contract)
-- ==============================================================================
CREATE TABLE IF NOT EXISTS public.heritage_beneficiaries (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    vault_id UUID REFERENCES public.heritage_vaults(id) ON DELETE CASCADE,
    name TEXT NOT NULL,
    relation TEXT NOT NULL,
    wallet_address TEXT NOT NULL,
    share_percentage INT NOT NULL CHECK (share_percentage > 0 AND share_percentage <= 100),
    email TEXT,
    status TEXT DEFAULT 'verified',
    created_at TIMESTAMPTZ DEFAULT now()
);

-- ==============================================================================
-- 10. TABLA: AI_RECEIPT_AUDITS (Auditoría Multimodal de Facturas por IA)
-- ==============================================================================
CREATE TABLE IF NOT EXISTS public.ai_receipt_audits (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    order_id UUID REFERENCES public.orders(id) ON DELETE CASCADE,
    receipt_image_url TEXT,
    merchant_detected TEXT,
    detected_amount_usd NUMERIC(10,2),
    expected_amount_usd NUMERIC(10,2),
    confidence_score NUMERIC(3,2),
    status TEXT NOT NULL DEFAULT 'approved',
    audit_timestamp TIMESTAMPTZ DEFAULT now()
);

-- ==============================================================================
-- 11. TRIGGER: Sincronización Automática auth.users -> public.profiles
-- ==============================================================================
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER 
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
    user_assigned_role public.user_role;
BEGIN
    BEGIN
        user_assigned_role := (NEW.raw_user_meta_data->>'role')::public.user_role;
    EXCEPTION WHEN OTHERS THEN
        user_assigned_role := 'client'::public.user_role;
    END;

    INSERT INTO public.profiles (id, full_name, email, role)
    VALUES (
        NEW.id,
        COALESCE(NEW.raw_user_meta_data->>'full_name', split_part(NEW.email, '@', 1)),
        NEW.email,
        COALESCE(user_assigned_role, 'client'::public.user_role)
    )
    ON CONFLICT (id) DO UPDATE
    SET
        full_name = EXCLUDED.full_name,
        email = EXCLUDED.email,
        updated_at = now();
    RETURN NEW;
EXCEPTION WHEN OTHERS THEN
    -- Prevenir que un error en profiles bloquee la creación de auth.users
    RETURN NEW;
END;
$$;

-- Vista de compatibilidad para código que consulte 'users'
CREATE OR REPLACE VIEW public.users AS SELECT * FROM public.profiles;

DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
    AFTER INSERT ON auth.users
    FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- ==============================================================================
-- 12. SEGURIDAD: ROW LEVEL SECURITY (RLS)
-- ==============================================================================
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.stores ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.products ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.trips ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.orders ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.heritage_vaults ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.heritage_beneficiaries ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.ai_receipt_audits ENABLE ROW LEVEL SECURITY;

-- Políticas de lectura pública
CREATE POLICY "Lectura pública de perfiles básicos" ON public.profiles FOR SELECT USING (true);
CREATE POLICY "Lectura pública de tiendas" ON public.stores FOR SELECT USING (true);
CREATE POLICY "Lectura pública de productos" ON public.products FOR SELECT USING (true);
CREATE POLICY "Lectura pública de viajes activos" ON public.trips FOR SELECT USING (true);

-- Políticas de usuario autenticado
CREATE POLICY "Usuarios pueden actualizar su propio perfil" ON public.profiles
    FOR UPDATE USING (auth.uid() = id);

CREATE POLICY "Dueños pueden administrar sus tiendas" ON public.stores
    FOR ALL USING (auth.uid() = owner_id);

CREATE POLICY "Dueños pueden administrar sus productos" ON public.products
    FOR ALL USING (
        EXISTS (SELECT 1 FROM public.stores WHERE stores.id = products.store_id AND stores.owner_id = auth.uid())
    );

CREATE POLICY "Viajeros pueden administrar sus viajes" ON public.trips
    FOR ALL USING (auth.uid() = traveler_id);

CREATE POLICY "Clientes y viajeros ven sus órdenes asociadas" ON public.orders
    FOR SELECT USING (auth.uid() = client_id OR auth.uid() = traveler_id);

CREATE POLICY "Titulares administran sus bóvedas de herencia" ON public.heritage_vaults
    FOR ALL USING (auth.uid() = owner_id);

CREATE POLICY "Titulares ven sus beneficiarios" ON public.heritage_beneficiaries
    FOR ALL USING (
        EXISTS (SELECT 1 FROM public.heritage_vaults WHERE heritage_vaults.id = heritage_beneficiaries.vault_id AND heritage_vaults.owner_id = auth.uid())
    );

-- ==============================================================================
-- 13. STORAGE BUCKETS (Para imágenes de productos, facturas y bóvedas)
-- ==============================================================================
INSERT INTO storage.buckets (id, name, public)
VALUES 
    ('products', 'products', true),
    ('receipts', 'receipts', false),
    ('avatars', 'avatars', true),
    ('heritage-docs', 'heritage-docs', false)
ON CONFLICT (id) DO NOTHING;
