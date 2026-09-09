-- ==============================================================================
-- AYNI PROTOCOL - DATOS DE PRUEBA DE PRODUCCIÓN (SEED)
-- Usuarios en todos los roles, tiendas, condimentos de la diáspora, viajes y herencias
-- ==============================================================================

-- 1. IDs fijos para consistencia referencial
DO $$
DECLARE
    client_uuid UUID := '11111111-1111-4111-a111-111111111111';
    traveler_uuid UUID := '22222222-2222-4222-a222-222222222222';
    merchant_uuid UUID := '33333333-3333-4333-a333-333333333333';
    admin_uuid UUID := '44444444-4444-4444-a444-444444444444';
    
    store_condiments_uuid UUID := '55555555-5555-4555-a555-555555555555';
    store_textiles_uuid UUID := '66666666-6666-4666-a666-666666666666';
    store_med_uuid UUID := '77777777-7777-4777-a777-777777777777';

    trip_madrid_uuid UUID := '88888888-8888-4888-a888-888888888888';
    trip_ba_uuid UUID := '99999999-9999-4999-a999-999999999999';

    vault_uuid UUID := 'aaaaaaaa-aaaa-4aaa-aaaa-aaaaaaaaaaaa';
BEGIN

    -- 2. INSERTAR USUARIOS EN auth.users (Contraseña: Password123!)
    -- Nota: Supabase Auth usa bcrypt en encrypted_password y requiere raw_app_meta_data
    INSERT INTO auth.users (
        id, instance_id, aud, role, email, encrypted_password, email_confirmed_at, raw_app_meta_data, raw_user_meta_data, created_at, updated_at
    ) VALUES 
    (
        client_uuid, '00000000-0000-0000-0000-000000000000', 'authenticated', 'authenticated',
        'cliente@ayni.app', crypt('Password123!', gen_salt('bf')), now(),
        '{"provider": "email", "providers": ["email"]}'::jsonb,
        '{"full_name": "Ana María Quispe", "role": "client"}'::jsonb, now(), now()
    ),
    (
        traveler_uuid, '00000000-0000-0000-0000-000000000000', 'authenticated', 'authenticated',
        'viajero@ayni.app', crypt('Password123!', gen_salt('bf')), now(),
        '{"provider": "email", "providers": ["email"]}'::jsonb,
        '{"full_name": "Alejandro Mamani", "role": "traveler"}'::jsonb, now(), now()
    ),
    (
        merchant_uuid, '00000000-0000-0000-0000-000000000000', 'authenticated', 'authenticated',
        'comercio@ayni.app', crypt('Password123!', gen_salt('bf')), now(),
        '{"provider": "email", "providers": ["email"]}'::jsonb,
        '{"full_name": "Demetrio Flores (Sabores & Artesanías)", "role": "merchant"}'::jsonb, now(), now()
    ),
    (
        admin_uuid, '00000000-0000-0000-0000-000000000000', 'authenticated', 'authenticated',
        'admin@ayni.app', crypt('Password123!', gen_salt('bf')), now(),
        '{"provider": "email", "providers": ["email"]}'::jsonb,
        '{"full_name": "Auditor Oficial AYNI", "role": "admin"}'::jsonb, now(), now()
    )
    ON CONFLICT (id) DO UPDATE SET
        raw_app_meta_data = EXCLUDED.raw_app_meta_data,
        encrypted_password = EXCLUDED.encrypted_password;

    -- 3. ACTUALIZAR DETALLES EN public.profiles
    INSERT INTO public.profiles (id, full_name, email, role, phone, country, reputation_score, guarantee_balance, verified_id, wallet_address)
    VALUES
    (
        client_uuid, 'Ana María Quispe', 'cliente@ayni.app', 'client',
        '+591 71234567', 'Bolivia', 4.90, 0.00, true, '0x71A09E1B2C3D4E5F6A7B8C9D0E1F2A3B4C5D6E7F'
    ),
    (
        traveler_uuid, 'Alejandro Mamani', 'viajero@ayni.app', 'traveler',
        '+34 612345678', 'España / Bolivia', 4.95, 500.00, true, '0x3a82F7B3C4D5E6F7A8B9C0D1E2F3A4B5C6D7E8F9'
    ),
    (
        merchant_uuid, 'Demetrio Flores (Sabores & Artesanías)', 'comercio@ayni.app', 'merchant',
        '+591 79876543', 'Bolivia', 4.88, 250.00, true, '0x9B11Cd88A3B4C5D6E7F8A9B0C1D2E3F4A5B6C7D8'
    ),
    (
        admin_uuid, 'Auditor Oficial AYNI', 'admin@ayni.app', 'admin',
        '+591 22446688', 'Bolivia', 5.00, 10000.00, true, '0x000000000000000000000000000000000000dEaD'
    )
    ON CONFLICT (id) DO UPDATE SET
        reputation_score = EXCLUDED.reputation_score,
        guarantee_balance = EXCLUDED.guarantee_balance,
        verified_id = EXCLUDED.verified_id,
        wallet_address = EXCLUDED.wallet_address;

    -- 4. INSERTAR TIENDAS
    INSERT INTO public.stores (id, owner_id, name, slug, category, description, location_city, location_country, rating, is_verified)
    VALUES
    (
        store_condiments_uuid, merchant_uuid,
        'Sabores & Especias del Valle', 'sabores-valle-especias', 'condiments',
        'Selección premium de ajíes nativos, condimentos tradicionales y salsas ancestrales deshidratadas al vacío para la diáspora.',
        'Cochabamba', 'Bolivia', 4.96, true
    ),
    (
        store_textiles_uuid, merchant_uuid,
        'Tejidos Illimani Original', 'tejidos-illimani', 'textiles',
        'Textiles ceremoniales, chullos y mantas de alpaca 100% natural tejidas por artesanas del altiplano.',
        'La Paz', 'Bolivia', 4.92, true
    ),
    (
        store_med_uuid, merchant_uuid,
        'MedTech Europa Express', 'medtech-europa', 'medical',
        'Insumos odontológicos y médicos de precisión adquiridos en farmacias y distribuidores de Madrid y Fráncfort.',
        'Madrid', 'España', 4.97, true
    )
    ON CONFLICT (id) DO NOTHING;

    -- 5. INSERTAR PRODUCTOS (Con especial énfasis en Condimentos de la Diáspora)
    INSERT INTO public.products (id, store_id, code, title, description, category, price_usd, weight_kg, origin_country, image_url, in_stock, tags, available_routes_count)
    VALUES
    (
        gen_random_uuid(), store_condiments_uuid, 'CND-001',
        'Ají Amarillo & Panca en Vainas Deshidratadas (250g)',
        'Vainas enteras deshidratadas al sol andino, seleccionadas a mano y selladas al vacío para conservar pungencia y aroma natural. Especial para compatriotas en el exterior.',
        'condiments', 14.50, 0.25, 'Bolivia', '/images/ayni_condiments_diaspora.jpg', true,
        ARRAY['ají amarillo', 'panca', 'diáspora', 'condimentos'], 6
    ),
    (
        gen_random_uuid(), store_condiments_uuid, 'CND-002',
        'Llajwa Artesanal Deshidratada con Quirquiña y Locoto (Pack x3)',
        'El auténtico sabor picante boliviano. Rehidrata en 30 segundos con agua tibia y aceite. Ideal para quienes extrañan la mesa familiar viviendo en Europa o América del Norte.',
        'condiments', 12.00, 0.18, 'Bolivia', '/images/ayni_condiments_diaspora.jpg', true,
        ARRAY['llajwa', 'locoto', 'quirquiña', 'nostalgia'], 8
    ),
    (
        gen_random_uuid(), store_condiments_uuid, 'CND-003',
        'Sal Rosada Ancestral de Salar con Finas Hierbas Andinas (400g)',
        'Cristales puros de sal extraídos de las profundidades del Salar de Uyuni mezclados con hierbas aromáticas de montaña. Frasco hermético con sello de seguridad aduanero.',
        'condiments', 11.50, 0.40, 'Bolivia', '/images/ayni_condiments_diaspora.jpg', true,
        ARRAY['sal rosada', 'uyuni', 'especias', 'gourmet'], 4
    ),
    (
        gen_random_uuid(), store_condiments_uuid, 'CND-004',
        'Pasta Concentrada de Rocoto & Huacatay Fresco (Frasco 250g)',
        'Base esencial para guisos, sopas y marinados típicos sudamericanos. Elaboración artesanal sin conservantes industriales, envasado al calor.',
        'condiments', 15.00, 0.35, 'Bolivia', '/images/ayni_condiments_diaspora.jpg', true,
        ARRAY['rocoto', 'huacatay', 'pasta', 'artesanal'], 5
    ),
    (
        gen_random_uuid(), store_condiments_uuid, 'CND-005',
        'Mix de Condimentos de la Chiquitanía (Comino, Palillo y Pipi de Mono)',
        'Especias nativas tostadas a fuego lento en fogón de leña. La mezcla perfecta para empanadas, carnes y asados con sazón 100% auténtica.',
        'condiments', 13.50, 0.22, 'Bolivia', '/images/ayni_condiments_diaspora.jpg', true,
        ARRAY['comino', 'pipi de mono', 'oriente', 'condimentos'], 4
    ),
    (
        gen_random_uuid(), store_textiles_uuid, 'TXT-001',
        'Chullo Artesanal Andino Lana de Alpaca 100%',
        'Tejido a mano con técnica ancestral andina. Lana de alpaca virgen sin tintes químicos.',
        'textiles', 38.00, 0.30, 'Bolivia', 'https://images.unsplash.com/photo-1579541814924-49fef17c5be5?w=400&h=300&fit=crop&q=80', true,
        ARRAY['alpaca', 'artesanal', 'chullo'], 3
    ),
    (
        gen_random_uuid(), store_med_uuid, 'MED-001',
        'Kit Implante Dental Titanio Grado 5 con Certificación CE',
        'Implante de titanio médico con tornillo de cicatrización estéril en empaque sellado de fábrica.',
        'medical', 185.00, 0.05, 'España', 'https://images.unsplash.com/photo-1559757175-5700dde675bc?w=400&h=300&fit=crop&q=80', true,
        ARRAY['médico', 'titanio', 'implante'], 5
    )
    ON CONFLICT (code) DO NOTHING;

    -- 6. INSERTAR VIAJES ACTIVOS
    INSERT INTO public.trips (id, traveler_id, origin_city, origin_country, destination_city, destination_country, departure_date, arrival_date, flight_number, available_kg, price_per_kg_usd, status)
    VALUES
    (
        trip_madrid_uuid, traveler_uuid,
        'Madrid', 'España', 'La Paz', 'Bolivia',
        CURRENT_DATE + INTERVAL '3 days', CURRENT_DATE + INTERVAL '4 days',
        'IB-6825', 14.50, 18.00, 'active'
    ),
    (
        trip_ba_uuid, traveler_uuid,
        'Buenos Aires', 'Argentina', 'Santa Cruz', 'Bolivia',
        CURRENT_DATE + INTERVAL '6 days', CURRENT_DATE + INTERVAL '6 days',
        'BO-708', 8.00, 15.00, 'active'
    ),
    (
        gen_random_uuid(), traveler_uuid,
        'Miami', 'EE.UU.', 'Cochabamba', 'Bolivia',
        CURRENT_DATE + INTERVAL '10 days', CURRENT_DATE + INTERVAL '11 days',
        'AA-951', 12.00, 20.00, 'active'
    )
    ON CONFLICT (id) DO NOTHING;

    -- 7. INSERTAR BÓVEDA DE HERENCIA CRIPTO (AYNI HERITAGE)
    INSERT INTO public.heritage_vaults (id, owner_id, vault_name, total_staked_usd, inactivity_threshold_days, last_heartbeat_at, status, contract_address, network)
    VALUES
    (
        vault_uuid, client_uuid,
        'Bóveda Familiar Quispe-Mamani',
        18450.00, 180, now(), 'active',
        '0x71C99B49a370e1219b26C5F403dD7bB147983690', 'Base L2'
    )
    ON CONFLICT (id) DO NOTHING;

    -- 8. BENEFICIARIOS DE LA BÓVEDA
    INSERT INTO public.heritage_beneficiaries (vault_id, name, relation, wallet_address, share_percentage, email, status)
    VALUES
    (
        vault_uuid, 'Valentina Mamani Quispe', 'Hija',
        '0x3a82F7B3C4D5E6F7A8B9C0D1E2F3A4B5C6D7E8F9', 50, 'valentina.m@gmail.com', 'verified'
    ),
    (
        vault_uuid, 'Mateo Mamani Quispe', 'Hijo',
        '0x9B11Cd88A3B4C5D6E7F8A9B0C1D2E3F4A5B6C7D8', 30, 'mateo.mamani@outlook.com', 'verified'
    ),
    (
        vault_uuid, 'Carmen Quispe Flores', 'Cónyuge',
        '0x71A09E1B2C3D4E5F6A7B8C9D0E1F2A3B4C5D6E7F', 20, 'carmen.q@gmail.com', 'verified'
    )
    ON CONFLICT DO NOTHING;

    -- 9. ORDEN ACTIVA DE PRUEBA (COMPRA A PIE CON ESCROW)
    INSERT INTO public.orders (
        order_code, client_id, traveler_id, store_id, order_type, description,
        product_price_usd, traveler_fee_usd, platform_fee_usd, guarantee_fund_usd, total_escrow_usd,
        otp_hash, otp_plain_simulated, status
    ) VALUES (
        'AYN-2026-001', client_uuid, traveler_uuid, store_condiments_uuid, 'cross_border_nostalgia',
        'Encargo Especial: Kit de Condimentos Diáspora (Ají amarillo + Llajwa x3 + Sal Rosada)',
        38.00, 15.00, 2.50, 1.50, 57.00,
        encode(digest('AYNI88', 'sha256'), 'hex'), 'AYNI88', 'funded'
    )
    ON CONFLICT (order_code) DO NOTHING;

END $$;
