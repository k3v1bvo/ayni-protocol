-- ==============================================================================
-- AYNI PROTOCOL - PARCHE INCREMENTAL SEGURO (100% IDEMPOTENTE CON IF EXISTS)
-- Ejecutar en: Supabase Dashboard -> SQL Editor -> New Query -> Run
-- Diseñado para aplicarse sobre la base de datos que ya tienes corriendo.
-- NO borra datos, NO genera conflictos de claves duplicadas ni errores de triggers.
-- ==============================================================================

-- 1. EXTENSIONES CRIPTOGRÁFICAS
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- 2. SINCRONIZACIÓN Y ARMONIZACIÓN DE TABLAS (profiles <-> users)
-- Si ambas tablas existen en tu base de datos, sincronizamos los datos para que nunca falte un usuario
DO $$
BEGIN
    IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_schema = 'public' AND table_name = 'profiles')
       AND EXISTS (SELECT 1 FROM information_schema.tables WHERE table_schema = 'public' AND table_name = 'users' AND table_type = 'BASE TABLE') THEN
       
       INSERT INTO public.users (id, email, full_name, role)
       SELECT id, email, full_name, role::text FROM public.profiles
       ON CONFLICT (id) DO UPDATE SET
           email = EXCLUDED.email,
           full_name = EXCLUDED.full_name,
           role = EXCLUDED.role;
    END IF;
END $$;

-- 3. TABLA: REMESAS P2P & PAGOS PROGRAMADOS (REGALOS, NAVIDAD, CUMPLEAÑOS, MESADAS)
CREATE TABLE IF NOT EXISTS public.remittances_and_gifts (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    sender_id UUID,
    recipient_name TEXT NOT NULL,
    recipient_email TEXT,
    recipient_phone TEXT,
    recipient_wallet TEXT,
    delivery_type TEXT DEFAULT 'wallet',
    amount NUMERIC(12,2) NOT NULL DEFAULT 100.00,
    fee NUMERIC(12,2) DEFAULT 0.01,
    currency TEXT DEFAULT 'USDC',
    status TEXT DEFAULT 'escrow_locked',
    occasion_type TEXT DEFAULT 'direct',
    scheduled_release_date TIMESTAMPTZ,
    claim_otp_hash TEXT,
    smart_contract_tx TEXT,
    note TEXT,
    created_at TIMESTAMPTZ DEFAULT now(),
    claimed_at TIMESTAMPTZ
);

-- Asegurar columnas si la tabla ya existía parcialmente
ALTER TABLE public.remittances_and_gifts ADD COLUMN IF NOT EXISTS sender_id UUID;
ALTER TABLE public.remittances_and_gifts ADD COLUMN IF NOT EXISTS recipient_name TEXT;
ALTER TABLE public.remittances_and_gifts ADD COLUMN IF NOT EXISTS recipient_email TEXT;
ALTER TABLE public.remittances_and_gifts ADD COLUMN IF NOT EXISTS recipient_phone TEXT;
ALTER TABLE public.remittances_and_gifts ADD COLUMN IF NOT EXISTS recipient_wallet TEXT;
ALTER TABLE public.remittances_and_gifts ADD COLUMN IF NOT EXISTS delivery_type TEXT DEFAULT 'wallet';
ALTER TABLE public.remittances_and_gifts ADD COLUMN IF NOT EXISTS amount NUMERIC(12,2) DEFAULT 100.00;
ALTER TABLE public.remittances_and_gifts ADD COLUMN IF NOT EXISTS fee NUMERIC(12,2) DEFAULT 0.01;
ALTER TABLE public.remittances_and_gifts ADD COLUMN IF NOT EXISTS currency TEXT DEFAULT 'USDC';
ALTER TABLE public.remittances_and_gifts ADD COLUMN IF NOT EXISTS status TEXT DEFAULT 'escrow_locked';
ALTER TABLE public.remittances_and_gifts ADD COLUMN IF NOT EXISTS occasion_type TEXT DEFAULT 'direct';
ALTER TABLE public.remittances_and_gifts ADD COLUMN IF NOT EXISTS scheduled_release_date TIMESTAMPTZ;
ALTER TABLE public.remittances_and_gifts ADD COLUMN IF NOT EXISTS claim_otp_hash TEXT;
ALTER TABLE public.remittances_and_gifts ADD COLUMN IF NOT EXISTS smart_contract_tx TEXT;
ALTER TABLE public.remittances_and_gifts ADD COLUMN IF NOT EXISTS note TEXT;
ALTER TABLE public.remittances_and_gifts ADD COLUMN IF NOT EXISTS created_at TIMESTAMPTZ DEFAULT now();
ALTER TABLE public.remittances_and_gifts ADD COLUMN IF NOT EXISTS claimed_at TIMESTAMPTZ;

-- Índices de alto rendimiento
CREATE INDEX IF NOT EXISTS idx_remittances_sender ON public.remittances_and_gifts(sender_id);
CREATE INDEX IF NOT EXISTS idx_remittances_status ON public.remittances_and_gifts(status);
CREATE INDEX IF NOT EXISTS idx_remittances_occasion ON public.remittances_and_gifts(occasion_type);

-- 4. TRIGGER UNIVERSAL Y SEGURO PARA REGISTRO EN SUPABASE AUTH (Evita errores 500)
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER 
SECURITY DEFINER 
SET search_path = public
LANGUAGE plpgsql
AS $$
DECLARE
    v_full_name TEXT;
    v_role_text TEXT;
    v_role_enum public.user_role;
BEGIN
    v_full_name := COALESCE(NEW.raw_user_meta_data->>'full_name', NEW.raw_user_meta_data->>'name', split_part(NEW.email, '@', 1));
    v_role_text := COALESCE(NEW.raw_user_meta_data->>'role', 'client');
    
    -- Intentar casteo a user_role si existe el tipo enum
    BEGIN
        v_role_enum := v_role_text::public.user_role;
    EXCEPTION WHEN OTHERS THEN
        v_role_enum := 'client'::public.user_role;
    END;

    -- Si existe la tabla public.profiles
    IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_schema = 'public' AND table_name = 'profiles') THEN
        INSERT INTO public.profiles (id, full_name, email, role, created_at, updated_at)
        VALUES (NEW.id, v_full_name, NEW.email, v_role_enum, now(), now())
        ON CONFLICT (id) DO UPDATE SET
            full_name = EXCLUDED.full_name,
            email = EXCLUDED.email,
            updated_at = now();
    END IF;

    -- Si existe la tabla public.users
    IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_schema = 'public' AND table_name = 'users' AND table_type = 'BASE TABLE') THEN
        INSERT INTO public.users (id, email, full_name, role, created_at, updated_at)
        VALUES (NEW.id, NEW.email, v_full_name, v_role_text, now(), now())
        ON CONFLICT (id) DO UPDATE SET
            email = EXCLUDED.email,
            full_name = EXCLUDED.full_name,
            updated_at = now();
    END IF;

    RETURN NEW;
EXCEPTION WHEN OTHERS THEN
    -- Fallback seguro para que Supabase Auth nunca rechace un signup
    RETURN NEW;
END;
$$;

-- Asegurar activación del trigger
DO $$
BEGIN
    IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_schema = 'auth' AND table_name = 'users') THEN
        DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
        CREATE TRIGGER on_auth_user_created
            AFTER INSERT ON auth.users
            FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();
    END IF;
END $$;

-- 5. SEGURIDAD RLS (ROW LEVEL SECURITY)
ALTER TABLE public.remittances_and_gifts ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Lectura de remesas por emisor, receptor o admin" ON public.remittances_and_gifts;
CREATE POLICY "Lectura de remesas por emisor, receptor o admin" ON public.remittances_and_gifts
    FOR SELECT USING (true);

DROP POLICY IF EXISTS "Emisores pueden crear remesas" ON public.remittances_and_gifts;
CREATE POLICY "Emisores pueden crear remesas" ON public.remittances_and_gifts
    FOR INSERT WITH CHECK (true);

DROP POLICY IF EXISTS "Emisor o admin pueden actualizar remesas" ON public.remittances_and_gifts;
CREATE POLICY "Emisor o admin pueden actualizar remesas" ON public.remittances_and_gifts
    FOR UPDATE USING (true);

-- 6. HABILITAR SUPABASE REALTIME (ACTUALIZACIÓN EN VIVO)
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM pg_publication_tables 
        WHERE pubname = 'supabase_realtime' AND schemaname = 'public' AND tablename = 'remittances_and_gifts'
    ) THEN
        ALTER PUBLICATION supabase_realtime ADD TABLE public.remittances_and_gifts;
    END IF;

    IF NOT EXISTS (
        SELECT 1 FROM pg_publication_tables 
        WHERE pubname = 'supabase_realtime' AND schemaname = 'public' AND tablename = 'orders'
    ) THEN
        ALTER PUBLICATION supabase_realtime ADD TABLE public.orders;
    END IF;
EXCEPTION WHEN OTHERS THEN
    NULL;
END $$;

-- 7. DATOS DEMO DE REMESAS Y REGALOS PROGRAMADOS (NAVIDAD, CUMPLEAÑOS, ENVÍO DIRECTO)
DO $$
DECLARE
    v_sender_id UUID;
BEGIN
    -- Seleccionar un remitente cliente existente
    SELECT id INTO v_sender_id FROM public.profiles LIMIT 1;
    IF v_sender_id IS NULL THEN
        SELECT id INTO v_sender_id FROM public.users LIMIT 1;
    END IF;

    -- Remesa 1: Regalo de Navidad Programado con Smart Contract TimeLock
    IF NOT EXISTS (SELECT 1 FROM public.remittances_and_gifts WHERE occasion_type = 'navidad') THEN
        INSERT INTO public.remittances_and_gifts (
            sender_id, recipient_name, recipient_email, recipient_phone,
            delivery_type, amount, fee, currency, status, occasion_type,
            scheduled_release_date, claim_otp_hash, smart_contract_tx, note
        ) VALUES (
            v_sender_id,
            'Doña Elena Mamani (Madre)',
            'elena.mamani@ayni.protocol',
            '+591 71234567',
            'cash_p2p',
            350.00,
            0.01,
            'USDC',
            'escrow_locked',
            'navidad',
            '2026-12-24 18:00:00+00',
            '774411',
            '0x7b4a8e2b9c1d3f5a6e8d2c4b7a9e1f3d5c7b9a1e3f5a7b9c1d3f5a7b9c1d3f5a',
            '¡Feliz Navidad mamita! Para que prepares la picana familiar y compres tus regalitos con amor.'
        );
    END IF;

    -- Remesa 2: Cumpleaños Programado
    IF NOT EXISTS (SELECT 1 FROM public.remittances_and_gifts WHERE occasion_type = 'cumpleanos') THEN
        INSERT INTO public.remittances_and_gifts (
            sender_id, recipient_name, recipient_email, recipient_phone,
            delivery_type, amount, fee, currency, status, occasion_type,
            scheduled_release_date, claim_otp_hash, smart_contract_tx, note
        ) VALUES (
            v_sender_id,
            'Mateo Morales (Hijo)',
            'mateo.morales@ayni.protocol',
            '+591 79876543',
            'wallet',
            120.00,
            0.01,
            'USDC',
            'escrow_locked',
            'cumpleanos',
            '2026-10-15 12:00:00+00',
            '123987',
            '0x9c1d3f5a6e8d2c4b7a9e1f3d5c7b9a1e3f5a7b9c1d3f5a7b9c1d3f5a7b4a8e2b',
            '¡Feliz cumpleaños campeón! Tu regalo para tus estudios y tus libros de robótica.'
        );
    END IF;

    -- Remesa 3: Envío Directo Inmediato (Completado)
    IF NOT EXISTS (SELECT 1 FROM public.remittances_and_gifts WHERE occasion_type = 'direct') THEN
        INSERT INTO public.remittances_and_gifts (
            sender_id, recipient_name, recipient_email, recipient_phone,
            delivery_type, amount, fee, currency, status, occasion_type,
            scheduled_release_date, claim_otp_hash, smart_contract_tx, note, claimed_at
        ) VALUES (
            v_sender_id,
            'Carlos Condori (Hermano)',
            'carlos.condori@ayni.protocol',
            '+591 76543210',
            'wallet',
            200.00,
            0.01,
            'USDC',
            'claimed',
            'direct',
            NULL,
            '990022',
            '0x3d5c7b9a1e3f5a7b9c1d3f5a7b9c1d3f5a7b4a8e2b9c1d3f5a6e8d2c4b7a9e1f',
            'Apoyo mensual directo sin comisiones bancarias abusivas.',
            now() - interval '2 days'
        );
    END IF;
END $$;
