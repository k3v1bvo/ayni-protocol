-- ==============================================================================
-- AYNI PROTOCOL — Migración: Notificaciones + Heritage Heartbeats + Profile Fields
-- ==============================================================================

-- 1. Tabla de notificaciones del sistema
CREATE TABLE IF NOT EXISTS public.notifications (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE,
    trade_id UUID,
    type TEXT NOT NULL DEFAULT 'system', -- 'order', 'trip', 'heritage', 'dispute', 'system'
    title TEXT NOT NULL,
    body TEXT,
    is_read BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMPTZ DEFAULT now()
);

ALTER TABLE public.notifications ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users see own notifications" ON public.notifications
    FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "System can insert notifications" ON public.notifications
    FOR INSERT WITH CHECK (true);
CREATE POLICY "Users can mark own notifications read" ON public.notifications
    FOR UPDATE USING (auth.uid() = user_id);

-- 2. Tabla de heartbeats de Heritage
CREATE TABLE IF NOT EXISTS public.heritage_heartbeats (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    vault_id UUID REFERENCES public.heritage_vaults(id) ON DELETE CASCADE,
    tx_hash TEXT,
    confirmed_at TIMESTAMPTZ DEFAULT now()
);

ALTER TABLE public.heritage_heartbeats ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Vault owners see heartbeats" ON public.heritage_heartbeats
    FOR ALL USING (
        EXISTS (SELECT 1 FROM public.heritage_vaults WHERE heritage_vaults.id = heritage_heartbeats.vault_id AND heritage_vaults.owner_id = auth.uid())
    );

-- 3. Campos adicionales en profiles (WhatsApp, LinkedIn, bio, city)
DO $$ BEGIN
    ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS whatsapp TEXT;
    ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS linkedin TEXT;
    ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS bio TEXT;
    ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS city TEXT;
EXCEPTION WHEN OTHERS THEN NULL;
END $$;

-- 4. Campo images[] en products para múltiples fotos
DO $$ BEGIN
    ALTER TABLE public.products ADD COLUMN IF NOT EXISTS images TEXT[] DEFAULT '{}';
EXCEPTION WHEN OTHERS THEN NULL;
END $$;

-- 5. Habilitar Realtime en tablas clave
ALTER PUBLICATION supabase_realtime ADD TABLE public.notifications;
ALTER PUBLICATION supabase_realtime ADD TABLE public.orders;
ALTER PUBLICATION supabase_realtime ADD TABLE public.heritage_vaults;
