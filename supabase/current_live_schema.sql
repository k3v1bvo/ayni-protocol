-- ==============================================================================
-- AYNI PROTOCOL - ESQUEMA ACTIVO EN VIVO EN SUPABASE (PRODUCCIÓN)
-- Referencia estricta de la estructura real para evitar discrepancias.
-- ==============================================================================

-- 1. TABLA: PROFILES (Perfiles vinculados a auth.users)
CREATE TABLE IF NOT EXISTS public.profiles (
  id uuid NOT NULL,
  full_name text NOT NULL,
  email text NOT NULL UNIQUE,
  role USER-DEFINED NOT NULL DEFAULT 'client'::user_role,
  phone text,
  country text DEFAULT 'Bolivia'::text,
  reputation_score numeric DEFAULT 5.00 CHECK (reputation_score >= 1.00 AND reputation_score <= 5.00),
  guarantee_balance numeric DEFAULT 0.00,
  verified_id boolean DEFAULT false,
  wallet_address text,
  avatar_url text,
  created_at timestamp with time zone DEFAULT now(),
  updated_at timestamp with time zone DEFAULT now(),
  CONSTRAINT profiles_pkey PRIMARY KEY (id),
  CONSTRAINT profiles_id_fkey FOREIGN KEY (id) REFERENCES auth.users(id)
);

-- 2. TABLA: STORES (Comercios y tiendas aliadas de la diáspora)
CREATE TABLE IF NOT EXISTS public.stores (
  id uuid NOT NULL DEFAULT gen_random_uuid(),
  owner_id uuid,
  name text NOT NULL,
  slug text NOT NULL UNIQUE,
  category text NOT NULL,
  description text,
  location_city text NOT NULL,
  location_country text NOT NULL DEFAULT 'Bolivia'::text,
  banner_url text,
  rating numeric DEFAULT 5.00,
  is_verified boolean DEFAULT true,
  created_at timestamp with time zone DEFAULT now(),
  updated_at timestamp with time zone DEFAULT now(),
  CONSTRAINT stores_pkey PRIMARY KEY (id),
  CONSTRAINT stores_owner_id_fkey FOREIGN KEY (owner_id) REFERENCES public.profiles(id)
);

-- 3. TABLA: PRODUCTS (Catálogo de productos de comercios)
CREATE TABLE IF NOT EXISTS public.products (
  id uuid NOT NULL DEFAULT gen_random_uuid(),
  store_id uuid,
  code text NOT NULL UNIQUE,
  title text NOT NULL,
  description text,
  category text NOT NULL,
  price_usd numeric NOT NULL,
  weight_kg numeric NOT NULL DEFAULT 0.20,
  origin_country text NOT NULL DEFAULT 'Bolivia'::text,
  image_url text,
  in_stock boolean DEFAULT true,
  tags text[] DEFAULT '{}'::text[],
  available_routes_count integer DEFAULT 1,
  created_at timestamp with time zone DEFAULT now(),
  updated_at timestamp with time zone DEFAULT now(),
  CONSTRAINT products_pkey PRIMARY KEY (id),
  CONSTRAINT products_store_id_fkey FOREIGN KEY (store_id) REFERENCES public.stores(id)
);

-- 4. TABLA: TRIPS (Itinerarios publicados por viajeros)
CREATE TABLE IF NOT EXISTS public.trips (
  id uuid NOT NULL DEFAULT gen_random_uuid(),
  traveler_id uuid,
  origin_city text NOT NULL,
  origin_country text NOT NULL,
  destination_city text NOT NULL,
  destination_country text NOT NULL,
  departure_date date NOT NULL,
  arrival_date date NOT NULL,
  flight_number text,
  available_kg numeric NOT NULL,
  price_per_kg_usd numeric NOT NULL DEFAULT 15.00,
  status USER-DEFINED NOT NULL DEFAULT 'active'::trip_status,
  created_at timestamp with time zone DEFAULT now(),
  updated_at timestamp with time zone DEFAULT now(),
  CONSTRAINT trips_pkey PRIMARY KEY (id),
  CONSTRAINT trips_traveler_id_fkey FOREIGN KEY (traveler_id) REFERENCES public.profiles(id)
);

-- 5. TABLA: ORDERS (Encargos, compras en tienda y envíos P2P)
CREATE TABLE IF NOT EXISTS public.orders (
  id uuid NOT NULL DEFAULT gen_random_uuid(),
  order_code text NOT NULL UNIQUE,
  client_id uuid,
  traveler_id uuid,
  store_id uuid,
  product_id uuid,
  order_type USER-DEFINED NOT NULL DEFAULT 'foot_shopping'::order_type,
  description text NOT NULL,
  product_price_usd numeric NOT NULL,
  traveler_fee_usd numeric NOT NULL,
  platform_fee_usd numeric NOT NULL,
  guarantee_fund_usd numeric NOT NULL,
  total_escrow_usd numeric NOT NULL,
  otp_hash text NOT NULL,
  otp_plain_simulated text,
  status USER-DEFINED NOT NULL DEFAULT 'funded'::order_status,
  created_at timestamp with time zone DEFAULT now(),
  delivered_at timestamp with time zone,
  CONSTRAINT orders_pkey PRIMARY KEY (id),
  CONSTRAINT orders_client_id_fkey FOREIGN KEY (client_id) REFERENCES public.profiles(id),
  CONSTRAINT orders_traveler_id_fkey FOREIGN KEY (traveler_id) REFERENCES public.profiles(id),
  CONSTRAINT orders_store_id_fkey FOREIGN KEY (store_id) REFERENCES public.stores(id),
  CONSTRAINT orders_product_id_fkey FOREIGN KEY (product_id) REFERENCES public.products(id)
);

-- 6. TABLA: HERITAGE_VAULTS (Bóvedas de herencia cripto con Dead Man's Switch)
CREATE TABLE IF NOT EXISTS public.heritage_vaults (
  id uuid NOT NULL DEFAULT gen_random_uuid(),
  owner_id uuid,
  vault_name text NOT NULL DEFAULT 'Bóveda Familiar Principal'::text,
  total_staked_usd numeric NOT NULL DEFAULT 0.00,
  inactivity_threshold_days integer NOT NULL DEFAULT 180,
  last_heartbeat_at timestamp with time zone NOT NULL DEFAULT now(),
  status USER-DEFINED NOT NULL DEFAULT 'active'::heritage_status,
  contract_address text NOT NULL DEFAULT '0x71C99B49a370e1219b26C5F403dD7bB147983690'::text,
  network text NOT NULL DEFAULT 'Base L2'::text,
  created_at timestamp with time zone DEFAULT now(),
  updated_at timestamp with time zone DEFAULT now(),
  CONSTRAINT heritage_vaults_pkey PRIMARY KEY (id),
  CONSTRAINT heritage_vaults_owner_id_fkey FOREIGN KEY (owner_id) REFERENCES public.profiles(id)
);

-- 7. TABLA: HERITAGE_BENEFICIARIES (Herederos designados y porcentaje de asignación)
CREATE TABLE IF NOT EXISTS public.heritage_beneficiaries (
  id uuid NOT NULL DEFAULT gen_random_uuid(),
  vault_id uuid,
  name text NOT NULL,
  relation text NOT NULL,
  wallet_address text NOT NULL,
  share_percentage integer NOT NULL CHECK (share_percentage > 0 AND share_percentage <= 100),
  email text,
  status text DEFAULT 'verified'::text,
  created_at timestamp with time zone DEFAULT now(),
  CONSTRAINT heritage_beneficiaries_pkey PRIMARY KEY (id),
  CONSTRAINT heritage_beneficiaries_vault_id_fkey FOREIGN KEY (vault_id) REFERENCES public.heritage_vaults(id)
);

-- 8. TABLA: AI_RECEIPT_AUDITS (Auditoría de boletas comerciales con IA)
CREATE TABLE IF NOT EXISTS public.ai_receipt_audits (
  id uuid NOT NULL DEFAULT gen_random_uuid(),
  order_id uuid,
  receipt_image_url text,
  merchant_detected text,
  detected_amount_usd numeric,
  expected_amount_usd numeric,
  confidence_score numeric,
  status text NOT NULL DEFAULT 'approved'::text,
  audit_timestamp timestamp with time zone DEFAULT now(),
  CONSTRAINT ai_receipt_audits_pkey PRIMARY KEY (id),
  CONSTRAINT ai_receipt_audits_order_id_fkey FOREIGN KEY (order_id) REFERENCES public.orders(id)
);

-- 9. TABLA: USERS (Espejo de usuarios con wallet address)
CREATE TABLE IF NOT EXISTS public.users (
  id uuid NOT NULL DEFAULT uuid_generate_v4(),
  wallet_address text UNIQUE,
  full_name text,
  email text UNIQUE,
  phone text,
  role text DEFAULT 'client'::text CHECK (role = ANY (ARRAY['client'::text, 'traveler'::text, 'merchant'::text, 'admin'::text])),
  reputation_score numeric DEFAULT 5.00,
  guarantee_balance numeric DEFAULT 0.00,
  avatar_url text,
  created_at timestamp with time zone DEFAULT now(),
  updated_at timestamp with time zone DEFAULT now(),
  CONSTRAINT users_pkey PRIMARY KEY (id)
);

-- 10. TABLA: AI_RECEIPT_VERIFICATIONS (Verificaciones multimodales IA Gemini)
CREATE TABLE IF NOT EXISTS public.ai_receipt_verifications (
  id uuid NOT NULL DEFAULT uuid_generate_v4(),
  order_id uuid,
  receipt_image_url text NOT NULL,
  product_image_url text NOT NULL,
  ocr_extracted_amount numeric,
  ocr_store_name text,
  visual_match_score numeric,
  ai_validation_status text DEFAULT 'flagged'::text CHECK (ai_validation_status = ANY (ARRAY['passed'::text, 'flagged'::text, 'rejected'::text])),
  ai_raw_response jsonb,
  processed_at timestamp with time zone DEFAULT now(),
  CONSTRAINT ai_receipt_verifications_pkey PRIMARY KEY (id),
  CONSTRAINT ai_receipt_verifications_order_id_fkey FOREIGN KEY (order_id) REFERENCES public.orders(id)
);

-- 11. TABLA: REMITTANCES_AND_GIFTS (Remesas, mesadas y regalos programados)
CREATE TABLE IF NOT EXISTS public.remittances_and_gifts (
  id uuid NOT NULL DEFAULT gen_random_uuid(),
  sender_id uuid,
  recipient_name text NOT NULL,
  recipient_email text,
  recipient_phone text,
  recipient_wallet text,
  delivery_type text DEFAULT 'wallet'::text,
  amount numeric NOT NULL DEFAULT 100.00,
  fee numeric DEFAULT 0.01,
  currency text DEFAULT 'USDC'::text,
  status text DEFAULT 'escrow_locked'::text,
  occasion_type text DEFAULT 'direct'::text,
  scheduled_release_date timestamp with time zone,
  claim_otp_hash text,
  smart_contract_tx text,
  note text,
  created_at timestamp with time zone DEFAULT now(),
  claimed_at timestamp with time zone,
  CONSTRAINT remittances_and_gifts_pkey PRIMARY KEY (id)
);
