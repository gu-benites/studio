'use client'

import { createContext, useContext, useEffect, useState } from 'react'
import { supabase } from '@/lib/supabase/client'
import type { User, Session } from '@supabase/supabase-js'

type AuthContextType = {
  user: User | null
  session: Session | null
  isLoading: boolean
  signOut: () => Promise<void>
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null)
  const [session, setSession] = useState<Session | null>(null)
  const [isLoading, setIsLoading] = useState(true)

  // Function to sync user data to profiles table
  const syncUserProfile = async (user: User) => {
    try {
      // Check if profile exists
      const { data: existingProfile, error: fetchError } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', user.id)
        .single()
      
      if (fetchError && fetchError.code !== 'PGRST116') { // PGRST116 is the error code for no rows returned
        console.error('Error fetching profile:', fetchError)
        return
      }
      
      // Get user metadata
      const metadata = user.user_metadata || {}
      const avatarUrl = metadata.avatar_url || metadata.picture || null
      const firstName = metadata.first_name || metadata.given_name || ''
      const lastName = metadata.last_name || metadata.family_name || ''
      
      if (!existingProfile) {
        // Create new profile
        const { error: insertError } = await supabase.from('profiles').insert({
          id: user.id,
          email: user.email,
          first_name: firstName,
          last_name: lastName,
          avatar_url: avatarUrl,
          updated_at: new Date().toISOString()
        })
        
        if (insertError) console.error('Error creating profile:', insertError)
      } else if (
        // Only update if there are changes
        existingProfile.first_name !== firstName ||
        existingProfile.last_name !== lastName ||
        existingProfile.avatar_url !== avatarUrl
      ) {
        // Update existing profile with OAuth data
        const { error: updateError } = await supabase
          .from('profiles')
          .update({
            first_name: firstName || existingProfile.first_name,
            last_name: lastName || existingProfile.last_name,
            avatar_url: avatarUrl || existingProfile.avatar_url,
            updated_at: new Date().toISOString()
          })
          .eq('id', user.id)
        
        if (updateError) console.error('Error updating profile:', updateError)
      }
    } catch (error) {
      console.error('Error syncing user profile:', error)
    }
  }
  
  useEffect(() => {
    const getSession = async () => {
      try {
        setIsLoading(true)
        console.log('AuthContext: Getting initial session...')
        
        // CRITICAL: Check for code parameter in the URL
        // This is the key to completing the PKCE flow from the same client that initiated it
        if (typeof window !== 'undefined') {
          const url = new URL(window.location.href)
          const code = url.searchParams.get('code')
          
          if (code) {
            // Handle auth code differently based on current path
            if (!window.location.pathname.includes('/auth/callback')) {
              // If we're not on the callback page, redirect there with the code
              console.log('AuthContext: Found auth code in URL but not on callback page, redirecting')
              window.location.href = `/auth/callback?code=${code}`
              setIsLoading(false)
              return
            } else {
              // We're on the callback page, process the code
              console.log('AuthContext: Found auth code on callback page, processing:', code.substring(0, 8) + '...')
              
              try {
                console.log('AuthContext: Exchanging code for session...')
                // Exchange the code for a session - MUST be done client-side for PKCE
                const { data, error } = await supabase.auth.exchangeCodeForSession(code)
                
                if (error) {
                  console.error('Error exchanging code for session:', error.message, error)
                  setIsLoading(false)
                  // Don't alert - let the callback page handle the error display
                  return
                } 
                
                console.log('AuthContext: Session established successfully', data.session?.user?.email)
                
                // Update state with new session
                setSession(data.session)
                setUser(data.session?.user ?? null)
                
                // If we have a user, sync profile immediately
                if (data.session?.user) {
                  await syncUserProfile(data.session.user)
                }
                
                // Let the callback page handle the redirection
                // This avoids conflicts in the navigation flow
                
                // Clear the code from URL to prevent repeated exchanges
                if (typeof window !== 'undefined' && window.history && window.history.replaceState) {
                  const cleanUrl = window.location.pathname
                  window.history.replaceState({}, document.title, cleanUrl)
                }
                
                // Add redirection after successful authentication
                console.log('AuthContext: Redirecting to home page after successful authentication')
                setTimeout(() => {
                  window.location.replace('/')
                }, 1000)
                
                setIsLoading(false)
                return
              } catch (exchangeError) {
                console.error('Error in code exchange:', exchangeError)
                setIsLoading(false)
                return
              }
            }
          } else {
            console.log('AuthContext: No code parameter found in URL')
          }
        }
        
        // Now get the current session
        console.log('AuthContext: Retrieving current session...')
        const { data: { session }, error } = await supabase.auth.getSession()
        
        if (error) {
          console.error('Error getting session:', error)
          setIsLoading(false)
          return
        }
        
        console.log('AuthContext: Session state:', session ? 'Authenticated' : 'Not authenticated')
        if (session && session.user) {
          console.log('AuthContext: Logged in as:', session.user.email)
        }
        
        setSession(session)
        const currentUser = session?.user ?? null
        setUser(currentUser)
        
        // Sync profile data if user exists
        if (currentUser) {
          console.log('AuthContext: Syncing user profile for session')
          await syncUserProfile(currentUser)
        }
      } catch (error) {
        console.error('Unexpected error in getSession:', error)
      } finally {
        console.log('AuthContext: Authentication check completed')
        setIsLoading(false)
      }
    }

    // Get the initial session
    getSession()

    // Set up the auth state change listener
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        console.log('AuthContext: Auth state changed', event)
        try {
          // Update the session state first
          setSession(session)
          const currentUser = session?.user ?? null
          setUser(currentUser)
          
          // If a user just signed in or updated their user data, sync their profile
          if (currentUser && (event === 'SIGNED_IN' || event === 'USER_UPDATED')) {
            console.log('AuthContext: Syncing user profile after', event)
            await syncUserProfile(currentUser)
          }
          
          if (event === 'SIGNED_OUT') {
            console.log('AuthContext: User signed out')
          }
        } catch (error) {
          console.error('Error in auth state change handler:', error)
        } finally {
          setIsLoading(false)
        }
      }
    )

    return () => {
      subscription.unsubscribe()
    }
  }, [])

  const signOut = async () => {
    try {
      console.log('AuthContext: Starting sign-out process')
      
      if (typeof window === 'undefined') {
        console.error('Cannot sign out in a server context')
        return
      }
      
      // First, clear React state
      setUser(null)
      setSession(null)
      
      // New simplified approach: Use our optimized logout endpoint
      try {
        console.log('AuthContext: Calling logout endpoint')
        
        // Set a reasonable timeout
        const controller = new AbortController()
        const timeoutId = setTimeout(() => controller.abort(), 3000) // 3 second timeout
        
        // Call our new logout endpoint
        const response = await fetch('/api/auth/logout', { 
          method: 'POST',
          signal: controller.signal,
          headers: {
            'Content-Type': 'application/json'
          }
        })
        
        clearTimeout(timeoutId)
        
        if (!response.ok) {
          throw new Error(`Logout failed with status: ${response.status}`)
        }
        
        console.log('AuthContext: Server-side logout successful')
      } catch (fetchError) {
        console.warn('Server logout request failed:', fetchError)
        console.log('AuthContext: Falling back to client-side signout')
        
        // Fallback to client-side signout
        await supabase.auth.signOut()
      }
      
      // Clear all potential storage to be thorough
      const storageKeys = Object.keys(window.localStorage)
      const supabaseKeys = storageKeys.filter(key => key.startsWith('sb-'))
      
      for (const key of supabaseKeys) {
        window.localStorage.removeItem(key)
        window.sessionStorage.removeItem(key)
      }
      
      // Redirect to login page
      console.log('AuthContext: Redirecting to login page')
      window.location.replace('/auth/login')
    } catch (error) {
      console.error('Error in signOut function:', error)
      
      // Always try to redirect to login page even if there was an error
      if (typeof window !== 'undefined') {
        window.location.replace('/auth/login')
      }
    }
  }

  const value = {
    user,
    session,
    isLoading,
    signOut,
  }

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}

export const useAuth = () => {
  const context = useContext(AuthContext)
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider')
  }
  return context
}
