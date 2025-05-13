import { createBrowserClient } from '@supabase/ssr'
import type { Database } from '@/types/supabase'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

if (!supabaseUrl || !supabaseAnonKey) {
  // This error will be thrown when this module is first imported,
  // if the environment variables are missing.
  throw new Error(
    "Supabase URL or Anon Key is missing from environment variables. " +
    "Please ensure NEXT_PUBLIC_SUPABASE_URL and NEXT_PUBLIC_SUPABASE_ANON_KEY are set in your .env.local file."
  )
}

// Global instance variable to ensure the same instance is used across the app
let supabaseInstance: ReturnType<typeof createBrowserClient<Database>> | null = null

export const createClient = () => {
  if (!supabaseInstance) {
    // We've already checked supabaseUrl and supabaseAnonKey are defined.
    supabaseInstance = createBrowserClient<Database>(
      supabaseUrl!,
      supabaseAnonKey!
    )
  }
  return supabaseInstance
}

// Export a singleton instance for use throughout the app
// This ensures the same client is used for the entire auth flow
export const supabase = createClient()
