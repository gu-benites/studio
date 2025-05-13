'use client'

import { useEffect, useState } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { supabase } from '@/lib/supabase/client'

export default function AuthCallbackPage() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const [status, setStatus] = useState<'loading' | 'success' | 'error'>('loading')
  const [errorMessage, setErrorMessage] = useState<string | null>(null)

  useEffect(() => {
    const handleAuth = async () => {
      try {
        // Get code from URL
        const code = searchParams.get('code')
        if (!code) {
          setStatus('error')
          setErrorMessage('No authentication code found')
          return
        }

        console.log('Auth callback: Found authorization code')
        
        // IMPORTANT: We don't need to call exchangeCodeForSession here!
        // The AuthContext will handle this for us since we're on the callback page
        // This avoids the "both auth code and code verifier should be non-empty" error
        // caused by multiple components trying to exchange the same code
        
        // We just need to wait a moment for the auth context to process the code
        setTimeout(() => {
          // If we're still on this page after 3 seconds, force redirect to home
          console.log('Auth callback: Forcing redirect to home...')
          if (typeof window !== 'undefined') {
            window.location.replace('/')
          }
        }, 3000)
        
        // Set status to success
        setStatus('success')
      } catch (error) {
        console.error('Auth callback: Unexpected error', error)
        setStatus('error')
        setErrorMessage('An unexpected error occurred')
      }
    }

    handleAuth()
  }, [router, searchParams])

  if (status === 'loading') {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="flex flex-col items-center space-y-4">
          <div className="h-8 w-8 rounded-full border-4 border-primary border-t-transparent animate-spin" />
          <p className="text-muted-foreground">Completing authentication...</p>
        </div>
      </div>
    )
  }

  if (status === 'error') {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="flex flex-col items-center space-y-4 max-w-md mx-auto p-6 bg-card rounded-lg shadow-md">
          <div className="text-destructive text-4xl">⚠️</div>
          <h1 className="text-xl font-semibold">Authentication Error</h1>
          <p className="text-muted-foreground text-center">{errorMessage || 'An unknown error occurred'}</p>
          <button 
            onClick={() => router.push('/auth/login')}
            className="px-4 py-2 bg-primary text-primary-foreground rounded-md hover:bg-primary/90 transition-colors"
          >
            Return to Login
          </button>
        </div>
      </div>
    )
  }

  return (
    <div className="flex items-center justify-center min-h-screen">
      <div className="flex flex-col items-center space-y-4">
        <div className="text-primary text-4xl">✓</div>
        <p className="text-muted-foreground">Authentication successful!</p>
        <p className="text-sm text-muted-foreground">Redirecting to home...</p>
      </div>
    </div>
  )
}