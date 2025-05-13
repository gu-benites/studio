
import { createServerClient, type CookieOptions } from '@supabase/ssr'
import { cookies } from 'next/headers'
import { NextResponse } from 'next/server'
import type { Database } from '@/types/supabase'

export async function POST() {
  try {
    const cookieStore = cookies()
    
    // Updated to use createServerClient from @supabase/ssr
    const supabase = createServerClient<Database>(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
      {
        cookies: {
          get(name: string) {
            return cookieStore.get(name)?.value
          },
          set(name: string, value: string, options: CookieOptions) {
            // For a route handler, modifications to cookies should be done on the response.
            // However, for signOut, Supabase primarily reads session cookies from the request.
            // If Supabase client needs to set cookies during signOut, it typically handles this.
            // For explicit clearing, we'll do it on the response object below.
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
    
    const response = NextResponse.json({ 
      success: true,
      message: 'Signed out successfully' 
    }, { status: 200 })
    
    // Explicitly clear Supabase auth cookies on the response
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
    
    const cookieBaseName = `sb-${projectRef}-auth-token`;
    const cookieOptions: CookieOptions = { 
      expires: new Date(0),
      path: '/',
      secure: process.env.NODE_ENV === 'production',
      httpOnly: true,
      sameSite: 'lax' as const
    };
    
    response.cookies.set(cookieBaseName, '', cookieOptions);
    // Clear potential multipart cookies
    for (let i = 0; i < 5; i++) {
        response.cookies.set(`${cookieBaseName}.${i}`, '', cookieOptions);
    }
    response.cookies.set(`${cookieBaseName}-code-verifier`, '', cookieOptions);
    for (let i = 0; i < 5; i++) {
        response.cookies.set(`${cookieBaseName}-code-verifier.${i}`, '', cookieOptions);
    }
    response.cookies.set(`sb-${projectRef}-provider-token`, '', cookieOptions); // Deprecated but good to clear
    response.cookies.set(`sb-provider-token`, '', cookieOptions); // Generic provider token
    response.cookies.set(`sb-${projectRef}-refresh-token`, '', cookieOptions);
    response.cookies.set(`sb-refresh-token`, '', cookieOptions); // Generic refresh token

    return response
  } catch (error) {
    console.error('Unexpected error in logout route:', error)
    return NextResponse.json({ 
      success: false, 
      error: 'An unexpected error occurred'
    }, { status: 500 })
  }
}

