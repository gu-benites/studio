/**
 * This file contains the generated database types from Supabase.
 * It should be updated whenever your database schema changes.
 */

export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export interface Database {
  public: {
    Tables: {
      // Essential Oils Tables
      essential_oils: {
        Row: {
          id: string;
          name_english: string;
          name_scientific: string;
          name_portuguese: string;
          general_description: string;
          internal_use_status_id: string;
          dilution_recommendation_id: string;
          phototoxicity_status_id: string;
          created_at: string;
          updated_at: string;
          bubble_uid: string;
          names_concatenated: string;
          image_url: string | null;
          embedding: any;
        };
        Insert: {
          id?: string;
          name_english: string;
          name_scientific: string;
          name_portuguese: string;
          general_description: string;
          internal_use_status_id: string;
          dilution_recommendation_id: string;
          phototoxicity_status_id: string;
          created_at?: string;
          updated_at?: string;
          bubble_uid?: string;
          names_concatenated?: string;
          image_url?: string | null;
          embedding?: any;
        };
        Update: {
          id?: string;
          name_english?: string;
          name_scientific?: string;
          name_portuguese?: string;
          general_description?: string;
          internal_use_status_id?: string;
          dilution_recommendation_id?: string;
          phototoxicity_status_id?: string;
          created_at?: string;
          updated_at?: string;
          bubble_uid?: string;
          names_concatenated?: string;
          image_url?: string | null;
          embedding?: any;
        };
      };
      // Add other table definitions as needed
    };
    Views: {
      // Add view definitions if any
    };
    Functions: {
      // Add function definitions if any
    };
    Enums: {
      // Add enum definitions if any
    };
  };
}

// Helper types for table access
export type Tables<T extends keyof Database['public']['Tables']> = Database['public']['Tables'][T]['Row'];
export type InsertDto<T extends keyof Database['public']['Tables']> = Database['public']['Tables'][T]['Insert'];
export type UpdateDto<T extends keyof Database['public']['Tables']> = Database['public']['Tables'][T]['Update'];
