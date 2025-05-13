import { createServerClient, type CookieOptions } from '@supabase/ssr'
import { cookies } from 'next/headers'
import type { Database } from '@/types/supabase'

/**
 * Create a Supabase client for server-side usage
 */
export const createClient = () => {
  return createServerClient<Database>(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        async get(name: string) {
          // Use a synchronous approach to get cookies
          const cookieList = cookies()
          const cookie = cookieList.get(name)
          return cookie?.value
        },
        set(name: string, value: string, options: CookieOptions) {
          try {
            const cookieList = cookies()
            cookieList.set(name, value, options)
          } catch (error) {
            // This will throw in middleware, but we can safely ignore it for now
          }
        },
        remove(name: string, options: CookieOptions) {
          try {
            const cookieList = cookies()
            cookieList.set(name, '', { ...options, maxAge: 0 })
          } catch (error) {
            // This will throw in middleware, but we can safely ignore it for now
          }
        },
      },
    }
  )
}

// For backward compatibility with existing code
export const supabaseServer = createClient

