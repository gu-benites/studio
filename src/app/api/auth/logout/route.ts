import { createRouteHandlerClient } from '@supabase/auth-helpers-nextjs'
import { cookies } from 'next/headers'
import { NextResponse } from 'next/server'

export async function POST() {
  try {
    // Using the more explicit version with destructured cookies function
    // This is the recommended way according to both Next.js and Supabase docs
    const cookieStore = cookies()
    
    // Initialize Supabase client without any type parameter
    const supabase = createRouteHandlerClient({
      cookies: () => cookieStore
    })
    
    // Sign out server-side
    const { error } = await supabase.auth.signOut()
    
    if (error) {
      console.error('Error signing out:', error.message)
      return NextResponse.json({ 
        success: false, 
        error: error.message 
      }, { status: 500 })
    }
    
    return NextResponse.json({ 
      success: true,
      message: 'Signed out successfully' 
    }, { status: 200 })
  } catch (error) {
    console.error('Unexpected error in logout route:', error)
    return NextResponse.json({ 
      success: false, 
      error: 'An unexpected error occurred'
    }, { status: 500 })
  }
}
