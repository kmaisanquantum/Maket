import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;

export const supabase = createClient(supabaseUrl, supabaseAnonKey);

// Server-side client with elevated privileges
export function createServerClient() {
  return createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
  );
}

// ─── Types ────────────────────────────────────────────────────────────────────

export type Commodity = 'coffee' | 'cocoa';
export type TransportStatus = 'open' | 'matched' | 'completed';
export type Province =
  | 'Eastern Highlands'
  | 'Western Highlands'
  | 'Morobe'
  | 'East New Britain'
  | 'West New Britain'
  | 'Madang'
  | 'Oro'
  | 'Simbu'
  | 'Southern Highlands'
  | 'Enga'
  | 'Other';

export interface Price {
  id: string;
  commodity: Commodity;
  price_pgk: number;        // Price in Papua New Guinea Kina per kg
  price_usd: number;        // USD reference price per kg
  source: string;           // e.g. "CCDA", "CIC", "Manual"
  region: string;
  created_at: string;
  updated_at: string;
  week_change_pct: number | null;
}

export interface TransportRequest {
  id: string;
  farmer_name: string;
  phone: string;
  province: Province;
  village: string;
  commodity: Commodity;
  quantity_kg: number;
  pickup_date: string;
  destination: string;
  offered_price_pgk: number | null;
  notes: string | null;
  status: TransportStatus;
  driver_name: string | null;
  driver_phone: string | null;
  created_at: string;
}
