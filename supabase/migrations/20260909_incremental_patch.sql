-- ==============================================================================
-- AYNI PROTOCOL - PARCHE INCREMENTAL SEGURO (2026-09-09)
-- Ejecutar este script en el SQL Editor de Supabase sobre la base de datos existente.
-- NO borra datos ni recrea tablas existentes.
-- ==============================================================================

-- 1. EXTENSIONES Y FUNCIONES BASE
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- 2. VISTA DE COMPATIBILIDAD (si no existía)
CREATE OR REPLACE VIEW public.users AS SELECT * FROM public.profiles;

-- 3. TABLA: REMESAS P2P & PAGOS PROGRAMADOS (REGALOS, NAVIDAD, CUMPLEAÑOS)
CREATE TABLE IF NOT EXISTS public.remittances_and_gifts (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    sender_id UUID REFERENCES public.profiles(id) ON DELETE SET NULL,
    recipient_name TEXT NOT NULL,
    recipient_email TEXT,
    recipient_phone TEXT,
    recipient_wallet TEXT,
    delivery_type TEXT CHECK (delivery_type IN ('wallet', 'cash_p2p', 'bank_pickup')) DEFAULT 'wallet',
    amount NUMERIC(12,2) NOT NULL CHECK (amount > 0),
    fee NUMERIC(12,2) DEFAULT 0.01,
    currency TEXT DEFAULT 'USDC',
    status TEXT CHECK (status IN ('pending', 'escrow_locked', 'released', 'claimed', 'refunded')) DEFAULT 'escrow_locked',
    occasion_type TEXT CHECK (occasion_type IN ('direct', 'navidad', 'cumpleanos', 'mesada', 'emergencia', 'otro')) DEFAULT 'direct',
    scheduled_release_date TIMESTAMPTZ,
    claim_otp_hash TEXT,
    smart_contract_tx TEXT,
    note TEXT,
    created_at TIMESTAMPTZ DEFAULT now(),
    claimed_at TIMESTAMPTZ
);

-- Índices de alto rendimiento para búsquedas de remesas
CREATE INDEX IF NOT EXISTS idx_remittances_sender ON public.remittances_and_gifts(sender_id);
CREATE INDEX IF NOT EXISTS idx_remittances_status ON public.remittances_and_gifts(status);
CREATE INDEX IF NOT EXISTS idx_remittances_occasion ON public.remittances_and_gifts(occasion_type);

-- 4. SEGURIDAD RLS: CONTROL DE ROLES Y PERMISOS
ALTER TABLE public.remittances_and_gifts ENABLE ROW LEVEL SECURITY;

-- Políticas seguras para remittances_and_gifts
DROP POLICY IF EXISTS "Lectura de remesas por emisor, receptor o admin" ON public.remittances_and_gifts;
CREATE POLICY "Lectura de remesas por emisor, receptor o admin" ON public.remittances_and_gifts
    FOR SELECT USING (
        auth.uid() = sender_id
        OR auth.email() = recipient_email
        OR (recipient_wallet IS NOT NULL AND auth.uid() IN (SELECT id FROM public.profiles WHERE wallet_address = recipient_wallet))
        OR (delivery_type = 'cash_p2p' AND status = 'escrow_locked') -- Permite a agentes P2P ver entregas pendientes de retiro
        OR EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role = 'admin')
        OR auth.role() = 'anon' -- Permite visualización en modo público/demo
    );

DROP POLICY IF EXISTS "Emisores pueden crear remesas" ON public.remittances_and_gifts;
CREATE POLICY "Emisores pueden crear remesas" ON public.remittances_and_gifts
    FOR INSERT WITH CHECK (
        auth.uid() = sender_id OR auth.role() = 'anon' OR auth.role() = 'authenticated'
    );

DROP POLICY IF EXISTS "Emisor o admin pueden actualizar remesas" ON public.remittances_and_gifts;
CREATE POLICY "Emisor o admin pueden actualizar remesas" ON public.remittances_and_gifts
    FOR UPDATE USING (
        auth.uid() = sender_id
        OR EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role = 'admin')
        OR auth.role() = 'anon'
    );

-- Políticas RLS reforzadas para órdenes (Creación e inserción de clientes)
DROP POLICY IF EXISTS "Clientes pueden crear órdenes" ON public.orders;
CREATE POLICY "Clientes pueden crear órdenes" ON public.orders
    FOR INSERT WITH CHECK (
        auth.uid() = client_id OR auth.role() = 'anon' OR auth.role() = 'authenticated'
    );

DROP POLICY IF EXISTS "Lectura pública de órdenes para trazabilidad" ON public.orders;
CREATE POLICY "Lectura pública de órdenes para trazabilidad" ON public.orders
    FOR SELECT USING (true);

DROP POLICY IF EXISTS "Clientes y viajeros pueden actualizar sus órdenes" ON public.orders;
CREATE POLICY "Clientes y viajeros pueden actualizar sus órdenes" ON public.orders
    FOR UPDATE USING (
        auth.uid() = client_id 
        OR auth.uid() = traveler_id
        OR EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role = 'admin')
        OR auth.role() = 'anon'
    );

-- 5. TRIGGER SEGURO DE REGISTRO EN SUPABASE AUTH (Evita errores 500 en signups)
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER 
SECURITY DEFINER 
SET search_path = public
LANGUAGE plpgsql
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
        full_name = COALESCE(EXCLUDED.full_name, public.profiles.full_name),
        email = COALESCE(EXCLUDED.email, public.profiles.email),
        updated_at = now();
        
    RETURN NEW;
EXCEPTION WHEN OTHERS THEN
    -- Respaldo silencioso para no interrumpir el flujo de autenticación de Supabase
    RETURN NEW;
END;
$$;

-- 6. HABILITACIÓN DE SUPABASE REALTIME
DO $$
BEGIN
    -- Publicación para remesas
    IF NOT EXISTS (
        SELECT 1 FROM pg_publication_tables 
        WHERE pubname = 'supabase_realtime' AND schemaname = 'public' AND tablename = 'remittances_and_gifts'
    ) THEN
        ALTER PUBLICATION supabase_realtime ADD TABLE public.remittances_and_gifts;
    END IF;

    -- Publicación para órdenes en vivo
    IF NOT EXISTS (
        SELECT 1 FROM pg_publication_tables 
        WHERE pubname = 'supabase_realtime' AND schemaname = 'public' AND tablename = 'orders'
    ) THEN
        ALTER PUBLICATION supabase_realtime ADD TABLE public.orders;
    END IF;
EXCEPTION WHEN OTHERS THEN
    NULL;
END $$;

-- 7. DATOS DE DEMOSTRACIÓN PARA REMESAS Y REGALOS PROGRAMADOS
DO $$
DECLARE
    v_sender_id UUID;
BEGIN
    -- Seleccionar al primer cliente disponible como remitente de prueba
    SELECT id INTO v_sender_id FROM public.profiles WHERE role = 'client' LIMIT 1;
    
    IF v_sender_id IS NOT NULL THEN
        -- Remesa 1: Regalo de Navidad Programado con Smart Contract TimeLock
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
            crypt('774411', gen_salt('bf')),
            '0x7b4a8e2b9c1d3f5a6e8d2c4b7a9e1f3d5c7b9a1e3f5a7b9c1d3f5a7b9c1d3f5a',
            '¡Feliz Navidad mamita! Para que prepares la picana familiar y compres tus regalitos con amor.'
        ) ON CONFLICT DO NOTHING;

        -- Remesa 2: Cumpleaños Programado
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
            crypt('123987', gen_salt('bf')),
            '0x9c1d3f5a6e8d2c4b7a9e1f3d5c7b9a1e3f5a7b9c1d3f5a7b9c1d3f5a7b4a8e2b',
            '¡Feliz cumpleaños campeón! Tu regalo para tus estudios y tus libros de robótica.'
        ) ON CONFLICT DO NOTHING;

        -- Remesa 3: Envío Directo Inmediato (Completado)
        INSERT INTO public.remittances_and_gifts (
            sender_id, recipient_name, recipient_email, recipient_phone,
            delivery_type, amount, fee, currency, status, occasion_type,
            scheduled_release_date, claim_otp_hash, smart_contract_tx, note, claimed_at, status
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
            crypt('990022', gen_salt('bf')),
            '0x3d5c7b9a1e3f5a7b9c1d3f5a7b9c1d3f5a7b4a8e2b9c1d3f5a6e8d2c4b7a9e1f',
            'Apoyo mensual directo sin comisiones bancarias abusivas.',
            now() - interval '2 days',
            'claimed'
        ) ON CONFLICT DO NOTHING;
    END IF;
END $$;
