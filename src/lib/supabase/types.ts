export type UserRole = 'client' | 'traveler' | 'merchant' | 'admin';

export type OrderType = 'store' | 'store_run' | 'medical' | 'remittance' | 'spare_parts';

export type OrderStatus = 'created' | 'funded' | 'verified_ai' | 'shipped' | 'completed' | 'disputed' | 'refunded';

export type TripStatus = 'scheduled' | 'in_transit' | 'completed' | 'cancelled';

export type TransportType = 'aerial' | 'terrestrial' | 'fluvial';

export interface UserProfile {
  id: string;
  wallet_address?: string | null;
  full_name?: string | null;
  email: string;
  phone?: string | null;
  role: UserRole;
  reputation_score: number;
  guarantee_balance: number;
  avatar_url?: string | null;
  created_at?: string;
  updated_at?: string;
}

export interface Trip {
  id: string;
  traveler_id: string;
  traveler?: UserProfile;
  origin_city: string;
  origin_country: string;
  destination_city: string;
  destination_country: string;
  departure_date: string;
  arrival_date: string;
  total_kg_capacity: number;
  available_kg: number;
  volume_dimensions_cm?: {
    alto: number;
    ancho: number;
    profundidad: number;
  };
  transport_type: TransportType;
  luggage_photos: string[];
  status: TripStatus;
  created_at?: string;
}

export interface Order {
  id: string;
  client_id: string;
  client?: UserProfile;
  traveler_id?: string | null;
  traveler?: UserProfile | null;
  trip_id?: string | null;
  trip?: Trip | null;
  order_type: OrderType;
  description: string;
  product_cost_usdc: number;
  traveler_fee_usdc: number;
  system_fee_usdc: number;
  applied_high_value_cap: boolean;
  secret_otp_hash: string;
  status: OrderStatus;
  smart_contract_trade_id?: number | null;
  created_at?: string;
  updated_at?: string;
}

export interface AiReceiptVerification {
  id: string;
  order_id: string;
  receipt_image_url: string;
  product_image_url: string;
  ocr_extracted_amount?: number | null;
  ocr_store_name?: string | null;
  visual_match_score?: number | null;
  ai_validation_status: 'passed' | 'flagged' | 'rejected';
  ai_raw_response?: Record<string, unknown> | null;
  processed_at?: string;
}
