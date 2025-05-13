'use client'

import { useState } from 'react'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import AuthForm from './auth-form'

interface GuestCheckProps {
  onContinue: () => void
}

export default function GuestCheck({ onContinue }: GuestCheckProps) {
  const [showAuth, setShowAuth] = useState(false)
  const [authType, setAuthType] = useState<'login' | 'register'>('login')

  if (showAuth) {
    return (
      <div className="w-full max-w-md mx-auto">
        <div className="flex justify-between items-center mb-4">
          <div className="flex space-x-4">
            <button
              onClick={() => setAuthType('login')}
              className={`pb-2 px-1 ${
                authType === 'login'
                  ? 'border-b-2 border-primary font-medium'
                  : 'text-muted-foreground'
              }`}
            >
              Login
            </button>
            <button
              onClick={() => setAuthType('register')}
              className={`pb-2 px-1 ${
                authType === 'register'
                  ? 'border-b-2 border-primary font-medium'
                  : 'text-muted-foreground'
              }`}
            >
              Register
            </button>
          </div>
          <button
            onClick={() => setShowAuth(false)}
            className="text-muted-foreground hover:text-foreground"
          >
            Cancel
          </button>
        </div>
        
        <AuthForm />
      </div>
    )
  }

  return (
    <Card className="w-full max-w-md mx-auto">
      <CardHeader>
        <CardTitle>Create an Account to Continue</CardTitle>
        <CardDescription>
          To save your recipe and access all features, please log in or create an account.
        </CardDescription>
      </CardHeader>
      <CardContent className="flex flex-col space-y-4">
        <Button 
          onClick={() => setShowAuth(true)}
          className="w-full"
        >
          Login/Register
        </Button>
        <Button
          onClick={onContinue}
          variant="outline"
          className="w-full"
        >
          Continue as Guest
        </Button>
      </CardContent>
    </Card>
  )
}
