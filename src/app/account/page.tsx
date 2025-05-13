'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { useAuth } from '@/contexts/auth-context'
import { Button } from '@/components/ui/button'
import { Card, CardHeader, CardTitle, CardContent, CardFooter } from '@/components/ui/card'
import ProtectedRoute from '@/components/auth/protected-route'

export default function AccountPage() {
  const { user, signOut } = useAuth()
  const router = useRouter()
  const [isLoggingOut, setIsLoggingOut] = useState(false)

  const handleSignOut = async () => {
    setIsLoggingOut(true)
    try {
      await signOut()
      router.push('/auth/login')
    } catch (error) {
      console.error('Error signing out:', error)
    } finally {
      setIsLoggingOut(false)
    }
  }

  return (
    <ProtectedRoute>
      <div className="container max-w-4xl py-12">
        <Card>
          <CardHeader>
            <CardTitle className="text-2xl">My Account</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid gap-2">
              <div className="text-sm font-medium text-muted-foreground">Email</div>
              <div>{user?.email}</div>
            </div>
            <div className="grid gap-2">
              <div className="text-sm font-medium text-muted-foreground">Name</div>
              <div>
                {user?.user_metadata?.first_name} {user?.user_metadata?.last_name}
              </div>
            </div>
          </CardContent>
          <CardFooter className="flex flex-col space-y-4">
            <div className="flex flex-wrap gap-2 w-full">
              <Button
                onClick={() => router.push('/account/profile')}
                variant="default"
              >
                Edit Profile
              </Button>
              <Button
                onClick={() => router.push('/auth/update-password?mode=change')}
                variant="secondary"
              >
                Change Password
              </Button>
              <Button 
                variant="outline" 
                onClick={handleSignOut}
                disabled={isLoggingOut}
              >
                {isLoggingOut ? 'Signing out...' : 'Sign out'}
              </Button>
            </div>
          </CardFooter>
        </Card>
      </div>
    </ProtectedRoute>
  )
}