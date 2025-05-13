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
      profiles: {
        Row: {
          id: string
          first_name: string | null
          last_name: string | null
          gender: string | null
          age_category: string | null
          specific_age: number | null
          language: string
          created_at: string
          updated_at: string
        }
        Insert: {
          id: string
          first_name?: string | null
          last_name?: string | null
          gender?: string | null
          age_category?: string | null
          specific_age?: number | null
          language?: string
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          first_name?: string | null
          last_name?: string | null
          gender?: string | null
          age_category?: string | null
          specific_age?: number | null
          language?: string
          created_at?: string
          updated_at?: string
        }
      }
      user_sensitivities: {
        Row: {
          id: string
          user_id: string
          essential_oil_id: string
          created_at: string
        }
        Insert: {
          id?: string
          user_id: string
          essential_oil_id: string
          created_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          essential_oil_id?: string
          created_at?: string
        }
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      [_ in never]: never
    }
    Enums: {
      [_ in never]: never
    }
  }
}
