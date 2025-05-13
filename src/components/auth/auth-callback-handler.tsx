'use client'

import { useEffect } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'

/**
 * This component shows a loading indicator and lets the server handle the auth callback.
 * It should be shown when a user is redirected back from the OAuth provider.  
 */
export default function AuthCallbackHandler() {
  const router = useRouter()
  const searchParams = useSearchParams()
  
  useEffect(() => {
    // Just log that we're showing the component, but don't process the code
    // Let auth-context.tsx handle the actual code exchange
    console.log('Auth callback handler: Showing loading state only')
    
    // Do not try to process the code here - let the auth context do it
  }, [])

  // Show a loading indicator while authentication completes
  return (
    <div className="flex items-center justify-center min-h-screen">
      <div className="flex flex-col items-center space-y-4">
        <div className="h-8 w-8 rounded-full border-4 border-primary border-t-transparent animate-spin" />
        <p className="text-muted-foreground">Completing authentication...</p>
      </div>
    </div>
  )
}
