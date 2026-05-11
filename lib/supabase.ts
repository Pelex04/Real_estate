import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;

if (!supabaseUrl || !supabaseAnonKey) {
  throw new Error('Missing Supabase environment variables');
}

export const supabase = createClient(supabaseUrl, supabaseAnonKey);

export interface Property {
  id: string;
  title: string;
  description: string;
  price: number;
  type: 'sale' | 'rent';
  category: 'house' | 'apartment' | 'land' | 'commercial';
  bedrooms: number;
  bathrooms: number;
  area_sqm: number;
  location: string;
  city: string;
  latitude?: number;
  longitude?: number;
  featured: boolean;
  status: 'available' | 'sold' | 'rented';
  created_at: string;
  updated_at: string;
}

export type PropertyImage = {
  id: string;
  property_id: string;
  image_url: string;
  is_primary: boolean;
  order_index: number;
  created_at: string;
};

export type ContactInquiry = {
  id: string;
  property_id?: string;
  name: string;
  email: string;
  phone?: string;
  message: string;
  status: 'new' | 'contacted' | 'closed';
  created_at: string;
};
