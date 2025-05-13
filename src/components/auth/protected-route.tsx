'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { useAuth } from '@/contexts/auth-context'

interface ProtectedRouteProps {
  children: React.ReactNode
  redirectTo?: string
}

export default function ProtectedRoute({ 
  children, 
  redirectTo = '/auth/login' // Make sure this matches the correct login path
}: ProtectedRouteProps) {
  const { user, isLoading } = useAuth()
  const router = useRouter()
  const [isRedirecting, setIsRedirecting] = useState(false)
  const [loadingTimeout, setLoadingTimeout] = useState(false)

  // Set a maximum time to show loading state to prevent getting stuck
  useEffect(() => {
    const timer = setTimeout(() => {
      if (isLoading) {
        console.log('Protected route: Loading timeout reached, forcing state update');
        setLoadingTimeout(true);
      }
    }, 5000); // 5 second maximum loading time
    
    return () => clearTimeout(timer);
  }, [isLoading]);

  useEffect(() => {
    // Handle redirection when auth state is determined
    let redirectTimer: NodeJS.Timeout | null = null;
    
    if (!isLoading || loadingTimeout) {
      // If still no user after loading or timeout, redirect to login
      if (!user && !isRedirecting) {
        setIsRedirecting(true);
        console.log('Protected route: User not authenticated, redirecting to', redirectTo);
        redirectTimer = setTimeout(() => {
          router.push(redirectTo);
        }, 100);
      } else if (user) {
        console.log('Protected route: User authenticated as', user.email);
      }
    }
    
    return () => {
      if (redirectTimer) clearTimeout(redirectTimer);
    };
  }, [user, isLoading, loadingTimeout, router, redirectTo, isRedirecting]);

  // Show loading indicator while loading or during redirect
  if (isLoading || isRedirecting) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="flex flex-col items-center space-y-4">
          <div className="h-8 w-8 rounded-full border-4 border-primary border-t-transparent animate-spin" />
          <p className="text-muted-foreground">Loading...</p>
        </div>
      </div>
    )
  }

  // If not logged in, don't render children
  if (!user) {
    return null
  }

  // If logged in, render children
  return <>{children}</>
}
