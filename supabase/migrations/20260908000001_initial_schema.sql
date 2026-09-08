-- =============================================================================
-- AYNI / MINKA PROTOCOL - SUPABASE INITIAL SCHEMA
-- Ecosistema P2P Descentralizado de Crowdshipping, Comercio y Remesas
-- Buildathon ETH Bolivia 2026
-- =============================================================================

-- Extension para identificadores unicos UUID
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- -----------------------------------------------------------------------------
-- 1. TABLA: users (Perfiles de usuario, roles y reputacion)
-- -----------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.users (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  wallet_address TEXT UNIQUE,
  full_name TEXT,
  email TEXT UNIQUE,
  phone TEXT,
  role TEXT DEFAULT 'client' CHECK (role IN ('client', 'traveler', 'merchant', 'admin')),
  reputation_score NUMERIC(3,2) DEFAULT 5.00,
  guarantee_balance NUMERIC(18,6) DEFAULT 0.00,
  avatar_url TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- -----------------------------------------------------------------------------
-- 2. TABLA: trips (Rutas y capacidad declarada por los viajeros)
-- -----------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.trips (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  traveler_id UUID REFERENCES public.users(id) ON DELETE CASCADE,
  origin_city TEXT NOT NULL,
  origin_country TEXT NOT NULL,
  destination_city TEXT NOT NULL,
  destination_country TEXT NOT NULL,
  departure_date TIMESTAMPTZ NOT NULL,
  arrival_date TIMESTAMPTZ NOT NULL,
  total_kg_capacity NUMERIC(5,2) NOT NULL,
  available_kg NUMERIC(5,2) NOT NULL,
  volume_dimensions_cm JSONB DEFAULT '{"alto": 55, "ancho": 35, "profundidad": 25}'::jsonb,
  transport_type TEXT DEFAULT 'aerial' CHECK (transport_type IN ('aerial', 'terrestrial', 'fluvial')),
  luggage_photos TEXT[] DEFAULT '{}',
  status TEXT DEFAULT 'scheduled' CHECK (status IN ('scheduled', 'in_transit', 'completed', 'cancelled')),
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- -----------------------------------------------------------------------------
-- 3. TABLA: orders (Gestion de pedidos y ordenes de compra)
-- -----------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.orders (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  client_id UUID REFERENCES public.users(id) ON DELETE RESTRICT,
  traveler_id UUID REFERENCES public.users(id) ON DELETE SET NULL,
  trip_id UUID REFERENCES public.trips(id) ON DELETE SET NULL,
  order_type TEXT NOT NULL CHECK (order_type IN ('store', 'store_run', 'medical', 'remittance', 'spare_parts')),
  description TEXT NOT NULL,
  product_cost_usdc NUMERIC(18,6) NOT NULL DEFAULT 0.00,
  traveler_fee_usdc NUMERIC(18,6) NOT NULL DEFAULT 0.00,
  system_fee_usdc NUMERIC(18,6) NOT NULL DEFAULT 0.00,
  applied_high_value_cap BOOLEAN DEFAULT FALSE,
  secret_otp_hash TEXT NOT NULL, -- Hash SHA256 / Keccak256 del OTP de 6 caracteres
  status TEXT DEFAULT 'funded' CHECK (status IN ('created', 'funded', 'verified_ai', 'shipped', 'completed', 'disputed', 'refunded')),
  smart_contract_trade_id BIGINT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- -----------------------------------------------------------------------------
-- 4. TABLA: ai_receipt_verifications (Auditoria visual y comprobantes con IA)
-- -----------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.ai_receipt_verifications (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  order_id UUID REFERENCES public.orders(id) ON DELETE CASCADE,
  receipt_image_url TEXT NOT NULL,
  product_image_url TEXT NOT NULL,
  ocr_extracted_amount NUMERIC(18,6),
  ocr_store_name TEXT,
  visual_match_score NUMERIC(3,2), -- Confianza de matching imagen vs requerimiento (0.00 a 1.00)
  ai_validation_status TEXT DEFAULT 'flagged' CHECK (ai_validation_status IN ('passed', 'flagged', 'rejected')),
  ai_raw_response JSONB,
  processed_at TIMESTAMPTZ DEFAULT NOW()
);

-- -----------------------------------------------------------------------------
-- 5. TRIGGER: Sincronizacion automatica auth.users -> public.users
-- -----------------------------------------------------------------------------
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.users (id, email, full_name, role, avatar_url)
  VALUES (
    NEW.id,
    NEW.email,
    COALESCE(NEW.raw_user_meta_data->>'full_name', NEW.raw_user_meta_data->>'name', split_part(NEW.email, '@', 1)),
    COALESCE(NEW.raw_user_meta_data->>'role', 'client'),
    NEW.raw_user_meta_data->>'avatar_url'
  )
  ON CONFLICT (id) DO UPDATE SET
    email = EXCLUDED.email,
    full_name = COALESCE(EXCLUDED.full_name, public.users.full_name),
    avatar_url = COALESCE(EXCLUDED.avatar_url, public.users.avatar_url);
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Disparador solo si existe el esquema auth (Supabase gestionado)
DO $$
BEGIN
  IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_schema = 'auth' AND table_name = 'users') THEN
    DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
    CREATE TRIGGER on_auth_user_created
      AFTER INSERT ON auth.users
      FOR EACH ROW EXECUTE PROCEDURE public.handle_new_user();
  END IF;
END $$;

-- -----------------------------------------------------------------------------
-- 6. POLITICAS DE SEGURIDAD ROW LEVEL SECURITY (RLS)
-- -----------------------------------------------------------------------------
ALTER TABLE public.users ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.trips ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.orders ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.ai_receipt_verifications ENABLE ROW LEVEL SECURITY;

-- Politica users: Lectura publica, edicion de perfil propio
CREATE POLICY "Public users are viewable by everyone" 
  ON public.users FOR SELECT USING (true);

CREATE POLICY "Users can update their own profile" 
  ON public.users FOR UPDATE USING (auth.uid() = id);

-- Politica trips: Lectura publica de itinerarios activos, creacion por viajeros autenticados
CREATE POLICY "Trips are viewable by everyone" 
  ON public.trips FOR SELECT USING (true);

CREATE POLICY "Authenticated travelers can create trips" 
  ON public.trips FOR INSERT WITH CHECK (auth.uid() = traveler_id);

CREATE POLICY "Travelers can update their own trips" 
  ON public.trips FOR UPDATE USING (auth.uid() = traveler_id);

-- Politica orders: Visualizacion para partes involucradas (cliente o transportista) o admins
CREATE POLICY "Orders viewable by parties involved" 
  ON public.orders FOR SELECT USING (
    auth.uid() = client_id OR 
    auth.uid() = traveler_id OR
    EXISTS (SELECT 1 FROM public.users WHERE id = auth.uid() AND role = 'admin')
  );

CREATE POLICY "Clients can create orders" 
  ON public.orders FOR INSERT WITH CHECK (auth.uid() = client_id);

CREATE POLICY "Involved parties can update orders" 
  ON public.orders FOR UPDATE USING (
    auth.uid() = client_id OR auth.uid() = traveler_id
  );

-- Politica ai_receipt_verifications
CREATE POLICY "Verifications viewable by order parties" 
  ON public.ai_receipt_verifications FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM public.orders o 
      WHERE o.id = order_id AND (o.client_id = auth.uid() OR o.traveler_id = auth.uid())
    )
  );

-- -----------------------------------------------------------------------------
-- 7. STORAGE BUCKETS (Fotos de equipaje, comprobantes y productos)
-- -----------------------------------------------------------------------------
INSERT INTO storage.buckets (id, name, public)
VALUES 
  ('luggage-photos', 'luggage-photos', true),
  ('receipts', 'receipts', false),
  ('products', 'products', true)
ON CONFLICT (id) DO NOTHING;
