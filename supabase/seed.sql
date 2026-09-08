-- =============================================================================
-- AYNI / MINKA PROTOCOL - SEED DATA (HACKATHON ETH BOLIVIA 2026)
-- Datos de prueba para simular el ecosistema
-- =============================================================================

-- Usuarios de prueba
INSERT INTO public.users (id, wallet_address, full_name, email, role, reputation_score, guarantee_balance)
VALUES
  (
    '00000000-0000-0000-0000-000000000001',
    '0x71C83f707f1B78B06Ac5eB0135d97FeC1b5F4295',
    'Alejandro Mamani Choque',
    'viajero@ayni.io',
    'traveler',
    4.95,
    250.00
  ),
  (
    '00000000-0000-0000-0000-000000000002',
    '0x2B5AD5c4795c026514f8317c7a215E218DcCD6CF',
    'Dra. Claudia Vargas R.',
    'cliente@ayni.io',
    'client',
    5.00,
    0.00
  ),
  (
    '00000000-0000-0000-0000-000000000003',
    '0x6813Eb9362372EEF6200f3b1dbC3f819671cBA69',
    'Artesanías & Textiles Illimani',
    'comercio@ayni.io',
    'merchant',
    4.88,
    500.00
  )
ON CONFLICT (id) DO NOTHING;

-- Rutas e itinerarios activos
INSERT INTO public.trips (
  id, traveler_id, origin_city, origin_country, destination_city, destination_country,
  departure_date, arrival_date, total_kg_capacity, available_kg, volume_dimensions_cm, transport_type, status
) VALUES
  (
    '10000000-0000-0000-0000-000000000001',
    '00000000-0000-0000-0000-000000000001',
    'Madrid', 'España',
    'La Paz', 'Bolivia',
    NOW() + INTERVAL '2 days',
    NOW() + INTERVAL '3 days',
    23.00,
    14.50,
    '{"alto": 55, "ancho": 40, "profundidad": 23}'::jsonb,
    'aerial',
    'scheduled'
  ),
  (
    '10000000-0000-0000-0000-000000000002',
    '00000000-0000-0000-0000-000000000001',
    'Miami', 'Estados Unidos',
    'Santa Cruz', 'Bolivia',
    NOW() + INTERVAL '5 days',
    NOW() + INTERVAL '6 days',
    20.00,
    8.00,
    '{"alto": 50, "ancho": 38, "profundidad": 20}'::jsonb,
    'aerial',
    'scheduled'
  )
ON CONFLICT (id) DO NOTHING;

-- Pedidos y encargos de prueba
INSERT INTO public.orders (
  id, client_id, traveler_id, trip_id, order_type, description,
  product_cost_usdc, traveler_fee_usdc, system_fee_usdc, applied_high_value_cap,
  secret_otp_hash, status
) VALUES
  (
    '20000000-0000-0000-0000-000000000001',
    '00000000-0000-0000-0000-000000000002',
    '00000000-0000-0000-0000-000000000001',
    '10000000-0000-0000-0000-000000000001',
    'medical',
    'Kit de implantes dentales de titanio y biomateriales óseos esterilizados',
    340.00,
    30.00,
    10.20,
    false,
    'e3b0c44298fc1c149afbf4c8996fb92427ae41e4649b934ca495991b7852b855', -- Hash placeholder
    'funded'
  ),
  (
    '20000000-0000-0000-0000-000000000002',
    '00000000-0000-0000-0000-000000000002',
    '00000000-0000-0000-0000-000000000001',
    '10000000-0000-0000-0000-000000000001',
    'store_run',
    'Compra en tienda física oficial FNAC Callao: Lente fotográfico 50mm f/1.8 verificado',
    180.00,
    18.00,
    5.40,
    false,
    'e3b0c44298fc1c149afbf4c8996fb92427ae41e4649b934ca495991b7852b855',
    'verified_ai'
  )
ON CONFLICT (id) DO NOTHING;
