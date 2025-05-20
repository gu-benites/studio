import { createServerClient } from '@supabase/ssr';
import { cookies } from 'next/headers';
import { Database } from '../types/database.types';

/**
 * Create a server-side Supabase client
 * This should be used in Server Components, Server Actions, and Route Handlers
 */
export function createServerSupabaseClient() {
  const cookieStore = cookies();
  
  return createServerClient<Database>(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        get(name: string) {
          return cookieStore.get(name)?.value;
        },
        set(name: string, value: string, options: any) {
          try {
            cookieStore.set({ name, value, ...options });
          } catch (error) {
            // Handle error if needed
          }
        },
        remove(name: string, options: any) {
          try {
            cookieStore.set({ name, value: '', ...options });
          } catch (error) {
            // Handle error if needed
          }
        },
      },
    }
  );
}

/**
 * Get the current user on the server
 */
export async function getServerUser() {
  const supabase = createServerSupabaseClient();
  const { data: { user } } = await supabase.auth.getUser();
  return user;
}

/**
 * Ensure the user is authenticated on the server
 * Throws an error if not authenticated
 */
export async function requireServerUser() {
  const user = await getServerUser();
  if (!user) {
    throw new Error('Authentication required');
  }
  return user;
}
