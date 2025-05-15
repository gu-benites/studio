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
          id: string
          name_english: string
          name_scientific: string
          name_portuguese: string
          general_description: string
          internal_use_status_id: string
          dilution_recommendation_id: string
          phototoxicity_status_id: string
          created_at: string
          updated_at: string
          bubble_uid: string
          names_concatenated: string
          image_url: string | null
          embedding: any
        }
        Insert: {
          id?: string
          name_english: string
          name_scientific: string
          name_portuguese: string
          general_description: string
          internal_use_status_id: string
          dilution_recommendation_id: string
          phototoxicity_status_id: string
          created_at?: string
          updated_at?: string
          bubble_uid?: string
          names_concatenated?: string
          image_url?: string | null
          embedding?: any
        }
        Update: {
          id?: string
          name_english?: string
          name_scientific?: string
          name_portuguese?: string
          general_description?: string
          internal_use_status_id?: string
          dilution_recommendation_id?: string
          phototoxicity_status_id?: string
          created_at?: string
          updated_at?: string
          bubble_uid?: string
          names_concatenated?: string
          image_url?: string | null
          embedding?: any
        }
      }

      // Reference Tables
      eo_internal_use_statuses: {
        Row: {
          id: string
          name: string
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          name: string
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          name?: string
          created_at?: string
          updated_at?: string
        }
      }

      eo_dilution_recommendations: {
        Row: {
          id: string
          name: string
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          name: string
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          name?: string
          created_at?: string
          updated_at?: string
        }
      }

      eo_phototoxicity_statuses: {
        Row: {
          id: string
          name: string
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          name: string
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          name?: string
          created_at?: string
          updated_at?: string
        }
      }

      eo_application_methods: {
        Row: {
          id: string
          name: string
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          name: string
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          name?: string
          created_at?: string
          updated_at?: string
        }
      }

      eo_therapeutic_properties: {
        Row: {
          id: string
          property_name: string
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          property_name: string
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          property_name?: string
          created_at?: string
          updated_at?: string
        }
      }

      eo_health_benefits: {
        Row: {
          id: string
          benefit_name: string
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          benefit_name: string
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          benefit_name?: string
          created_at?: string
          updated_at?: string
        }
      }

      eo_energetic_emotional_properties: {
        Row: {
          id: string
          property_name: string
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          property_name: string
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          property_name?: string
          created_at?: string
          updated_at?: string
        }
      }

      eo_chakras: {
        Row: {
          id: string
          chakra_name: string
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          chakra_name: string
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          chakra_name?: string
          created_at?: string
          updated_at?: string
        }
      }

      eo_extraction_methods: {
        Row: {
          id: string
          method_name: string
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          method_name: string
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          method_name?: string
          created_at?: string
          updated_at?: string
        }
      }

      eo_countries: {
        Row: {
          id: string
          country_name: string
          country_code: string | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          country_name: string
          country_code?: string | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          country_name?: string
          country_code?: string | null
          created_at?: string
          updated_at?: string
        }
      }

      eo_plant_parts: {
        Row: {
          id: string
          part_name: string
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          part_name: string
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          part_name?: string
          created_at?: string
          updated_at?: string
        }
      }

      eo_aroma_scents: {
        Row: {
          id: string
          scent_name: string
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          scent_name: string
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          scent_name?: string
          created_at?: string
          updated_at?: string
        }
      }

      eo_pets: {
        Row: {
          id: string
          animal_name: string
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          animal_name: string
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          animal_name?: string
          created_at?: string
          updated_at?: string
        }
      }

      eo_child_safety_age_ranges: {
        Row: {
          id: string
          range_description: string
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          range_description: string
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          range_description?: string
          created_at?: string
          updated_at?: string
        }
      }

      eo_pregnancy_nursing_statuses: {
        Row: {
          id: string
          status_description: string
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          status_description: string
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          status_description?: string
          created_at?: string
          updated_at?: string
        }
      }

      // Join Tables
      essential_oil_application_methods: {
        Row: {
          essential_oil_id: string
          application_method_id: string
          created_at: string
        }
        Insert: {
          essential_oil_id: string
          application_method_id: string
          created_at?: string
        }
        Update: {
          essential_oil_id?: string
          application_method_id?: string
          created_at?: string
        }
      }

      essential_oil_therapeutic_properties: {
        Row: {
          essential_oil_id: string
          property_id: string
          created_at: string
        }
        Insert: {
          essential_oil_id: string
          property_id: string
          created_at?: string
        }
        Update: {
          essential_oil_id?: string
          property_id?: string
          created_at?: string
        }
      }

      essential_oil_health_benefits: {
        Row: {
          essential_oil_id: string
          health_benefit_id: string
          created_at: string
        }
        Insert: {
          essential_oil_id: string
          health_benefit_id: string
          created_at?: string
        }
        Update: {
          essential_oil_id?: string
          health_benefit_id?: string
          created_at?: string
        }
      }

      essential_oil_energetic_emotional_properties: {
        Row: {
          essential_oil_id: string
          energetic_property_id: string
          created_at: string
        }
        Insert: {
          essential_oil_id: string
          energetic_property_id: string
          created_at?: string
        }
        Update: {
          essential_oil_id?: string
          energetic_property_id?: string
          created_at?: string
        }
      }

      essential_oil_chakra_association: {
        Row: {
          essential_oil_id: string
          chakra_id: string
          created_at: string
        }
        Insert: {
          essential_oil_id: string
          chakra_id: string
          created_at?: string
        }
        Update: {
          essential_oil_id?: string
          chakra_id?: string
          created_at?: string
        }
      }

      essential_oil_extraction_methods: {
        Row: {
          essential_oil_id: string
          extraction_method_id: string
          created_at: string
        }
        Insert: {
          essential_oil_id: string
          extraction_method_id: string
          created_at?: string
        }
        Update: {
          essential_oil_id?: string
          extraction_method_id?: string
          created_at?: string
        }
      }

      essential_oil_extraction_countries: {
        Row: {
          essential_oil_id: string
          country_id: string
          created_at: string
        }
        Insert: {
          essential_oil_id: string
          country_id: string
          created_at?: string
        }
        Update: {
          essential_oil_id?: string
          country_id?: string
          created_at?: string
        }
      }

      essential_oil_plant_parts: {
        Row: {
          essential_oil_id: string
          plant_part_id: string
          created_at: string
        }
        Insert: {
          essential_oil_id: string
          plant_part_id: string
          created_at?: string
        }
        Update: {
          essential_oil_id?: string
          plant_part_id?: string
          created_at?: string
        }
      }

      essential_oil_aroma_scents: {
        Row: {
          essential_oil_id: string
          scent_id: string
          created_at: string
        }
        Insert: {
          essential_oil_id: string
          scent_id: string
          created_at?: string
        }
        Update: {
          essential_oil_id?: string
          scent_id?: string
          created_at?: string
        }
      }

      essential_oil_pet_safety: {
        Row: {
          essential_oil_id: string
          pet_id: string
          safety_notes: string
          created_at: string
        }
        Insert: {
          essential_oil_id: string
          pet_id: string
          safety_notes: string
          created_at?: string
        }
        Update: {
          essential_oil_id?: string
          pet_id?: string
          safety_notes?: string
          created_at?: string
        }
      }

      essential_oil_child_safety: {
        Row: {
          essential_oil_id: string
          age_range_id: string
          safety_notes: string
          created_at: string
        }
        Insert: {
          essential_oil_id: string
          age_range_id: string
          safety_notes: string
          created_at?: string
        }
        Update: {
          essential_oil_id?: string
          age_range_id?: string
          safety_notes?: string
          created_at?: string
        }
      }

      essential_oil_pregnancy_nursing_safety: {
        Row: {
          essential_oil_id: string
          pregnancy_nursing_status_id: string
          created_at: string
        }
        Insert: {
          essential_oil_id: string
          pregnancy_nursing_status_id: string
          created_at?: string
        }
        Update: {
          essential_oil_id?: string
          pregnancy_nursing_status_id?: string
          created_at?: string
        }
      }

      // User Tables
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
      v_essential_oil_full_details: {
        Row: {
          id: string
          name_english: string
          name_scientific: string
          name_portuguese: string
          general_description: string
          internal_use_status_id: string
          dilution_recommendation_id: string
          phototoxicity_status_id: string
          created_at: string
          updated_at: string
          bubble_uid: string
          names_concatenated: string
          image_url: string | null
          application_methods: string[]
          pet_safety: {
            pet_id: string
            safety_notes: string
          }[]
          child_safety: {
            age_range_id: string
            safety_notes: string
          }[]
          pregnancy_nursing_status: string[]
          therapeutic_properties: string[]
          health_benefits: string[]
          energetic_emotional_properties: string[]
          chakras: string[]
          extraction_methods: string[]
          extraction_countries: string[]
          plant_parts: string[]
          aroma_scents: string[]
        }
      }
    }

    Functions: {
      [_ in never]: never
    }

    Enums: {
      [_ in never]: never
    }
  }
}
