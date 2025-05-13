'use client'

import { useSearchParams } from 'next/navigation'
import { AuthProvider } from '@/contexts/auth-context'
import UpdatePasswordForm from '@/components/auth/update-password-form'

export default function UpdatePasswordFormWrapper() {
  const searchParams = useSearchParams()
  const mode = searchParams.get('mode') === 'change' ? 'change' : 'reset'
  
  return (
    <AuthProvider>
      <div className="container flex items-center justify-center min-h-[calc(100vh-4rem)] py-12">
        <UpdatePasswordForm mode={mode} />
      </div>
    </AuthProvider>
  )
}
