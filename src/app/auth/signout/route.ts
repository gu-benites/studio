
import { createServerClient, type CookieOptions } from '@supabase/ssr'
import { cookies } from 'next/headers'
import { NextResponse } from 'next/server'
import type { Database } from '@/types/supabase'

export async function POST() {
  try {
    const cookieStore = cookies()
    
    const supabase = createServerClient<Database>(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
      {
        cookies: {
          get(name: string) {
            return cookieStore.get(name)?.value
          },
          set(name: string, value: string, options: CookieOptions) {
            // NextResponse.next() cannot be used here as it creates a new response.
            // We will modify cookies on the actual response object later.
            // For server-side signOut, Supabase primarily reads session cookies.
            // Client-side cookies are handled by Supabase JS on the browser.
            // If Supabase client needs to set cookies during signOut (e.g., clearing specific ones),
            // this would need to be on a response object.
          },
          remove(name: string, options: CookieOptions) {
            // Similar to set, this would apply to a response object.
          },
        },
      }
    )
    
    // Sign out server-side
    const { error } = await supabase.auth.signOut()
    
    if (error) {
      console.error('Error signing out:', error.message)
      return NextResponse.json({ 
        success: false, 
        error: error.message 
      }, { status: 500 })
    }
    
    // Create a response with success message
    // We will clear cookies on this response object
    const response = NextResponse.json({ 
      success: true,
      message: 'Signed out successfully' 
    }, { status: 200 })
    
    // Extract the project reference from the environment variable
    // Default to the known project ID if env var is not set (should not happen in prod)
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
    let projectRef = 'iutxzpzbznbgpkdwbzds'; // Default fallback
    if (supabaseUrl) {
        try {
            const urlParts = new URL(supabaseUrl);
            projectRef = urlParts.hostname.split('.')[0];
        } catch (e) {
            console.warn("Could not parse NEXT_PUBLIC_SUPABASE_URL for project ref, using default.");
        }
    }
    
    // Clear cookies directly in the response object
    const cookieOptions = { 
      expires: new Date(0),
      path: '/',
      secure: process.env.NODE_ENV === 'production',
      httpOnly: true,
      sameSite: 'lax' as const
    }
    
    // Clear all possible Supabase auth cookies
    const cookieBaseName = `sb-${projectRef}-auth-token`
    
    // Clear the token cookies
    response.cookies.set(cookieBaseName, '', cookieOptions)
    // Supabase might store tokens in parts, clear those too
    for (let i = 0; i < 5; i++) { // Check a few parts
        response.cookies.set(`${cookieBaseName}.${i}`, '', cookieOptions)
    }
    
    // Clear the verifier cookies
    response.cookies.set(`${cookieBaseName}-code-verifier`, '', cookieOptions)
    for (let i = 0; i < 5; i++) {
        response.cookies.set(`${cookieBaseName}-code-verifier.${i}`, '', cookieOptions)
    }
    
    // Clear additional known cookies
    response.cookies.set(`${cookieBaseName}-provider-token`, '', cookieOptions)
    response.cookies.set(`sb-refresh-token`, '', cookieOptions) // Generic refresh token name
    response.cookies.set(`sb-${projectRef}-refresh-token`, '', cookieOptions) // Project specific refresh token

    // Also clear any other potential cookies that might be set by Supabase, if known
    // Example: response.cookies.set('sb-csrf-token', '', cookieOptions)

    return response
  } catch (error) {
    console.error('Unexpected error in logout route:', error)
    return NextResponse.json({ 
      success: false, 
      error: 'An unexpected error occurred'
    }, { status: 500 })
  }
}
