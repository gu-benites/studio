import { createBrowserClient } from '@supabase/ssr'
import type { Database } from '@/types/supabase'

// Global instance variable to ensure the same instance is used across the app
let supabaseInstance: ReturnType<typeof createBrowserClient<Database>> | null = null

/**
 * Create a Supabase client for browser-side usage
 * Uses a singleton pattern to ensure the same instance is used throughout the app
 * This is critical for OAuth flows where the code verifier needs to persist
 */
export const createClient = () => {
  if (!supabaseInstance) {
    supabaseInstance = createBrowserClient<Database>(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
    )
  }
  return supabaseInstance
}

// Export a singleton instance for use throughout the app
// This ensures the same client is used for the entire auth flow
export const supabase = createClient()
