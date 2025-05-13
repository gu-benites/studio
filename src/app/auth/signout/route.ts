import { createRouteHandlerClient } from '@supabase/auth-helpers-nextjs'
import { cookies } from 'next/headers'
import { NextResponse } from 'next/server'
import type { Database } from '@/types/supabase'

export async function POST() {
  try {
    // Create the Supabase client using the correct pattern for route handlers
    // This follows the new Next.js convention of passing cookies() directly
    const supabase = createRouteHandlerClient<Database>({ cookies })
    
    // Sign out on the server side
    await supabase.auth.signOut()
    
    // Create a response with success message
    const response = NextResponse.json({ success: true }, { status: 200 })
    
    // Extract the project reference from the environment variable
    const cookieName = process.env.NEXT_PUBLIC_SUPABASE_URL
      ? process.env.NEXT_PUBLIC_SUPABASE_URL.split('//')[1].split('.')[0]
      : 'iutxzpzbznbgpkdwbzds'
    
    // Clear cookies directly in the response object
    // This avoids using the cookies() API which is causing the warnings
    const cookieOptions = { 
      expires: new Date(0),
      path: '/',
      secure: process.env.NODE_ENV === 'production',
      httpOnly: true,
      sameSite: 'lax' as const
    }
    
    // Clear all possible Supabase auth cookies
    const cookieBaseName = `sb-${cookieName}-auth-token`
    
    // Clear the token cookies
    response.cookies.set(cookieBaseName, '', cookieOptions)
    response.cookies.set(`${cookieBaseName}.0`, '', cookieOptions)
    response.cookies.set(`${cookieBaseName}.1`, '', cookieOptions)
    response.cookies.set(`${cookieBaseName}.2`, '', cookieOptions)
    
    // Clear the verifier cookies
    response.cookies.set(`${cookieBaseName}-code-verifier`, '', cookieOptions)
    response.cookies.set(`${cookieBaseName}-code-verifier.0`, '', cookieOptions)
    
    // Clear additional cookies
    response.cookies.set(`${cookieBaseName}-provider-token`, '', cookieOptions)
    response.cookies.set(`sb-refresh-token`, '', cookieOptions)
    
    return response
  } catch (error) {
    console.error('Error in signout route:', error)
    return NextResponse.json({ error: 'Sign out failed' }, { status: 500 })
  }
}
