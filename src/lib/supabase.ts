import { createClient } from '@supabase/supabase-js';

// Initialize the Supabase client with your project URL and anon key
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || '';
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || '';

export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    autoRefreshToken: true,
    persistSession: true,
  },
});

// Export database types for type safety
export type Database = {
  public: {
    Tables: {
      eo_therapeutic_properties: {
        Row: {
          id: string;
          property_name: string;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          property_name: string;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          property_name?: string;
          created_at?: string;
          updated_at?: string;
        };
      };
      essential_oil_therapeutic_properties: {
        Row: {
          essential_oil_id: string;
          therapeutic_property_id: string;
          created_at: string;
        };
        Insert: {
          essential_oil_id: string;
          therapeutic_property_id: string;
          created_at?: string;
        };
        Update: {
          essential_oil_id?: string;
          therapeutic_property_id?: string;
          created_at?: string;
        };
      };
      // Add other tables as needed
    };
    Views: {
      v_essential_oil_full_details: {
        Row: {
          // Add view fields as needed
          id?: string;
          // Add other view fields as needed
        };
      };
    };
  };
};

// Helper types for common operations
export type Tables<T extends keyof Database['public']['Tables']> = Database['public']['Tables'][T]['Row'];

// Remove Enums type since we're not using it yet
// export type Enums<T extends keyof Database['public']['Enums']> = Database['public']['Enums'][T];
