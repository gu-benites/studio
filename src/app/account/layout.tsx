import { Metadata } from 'next'
import { AuthProvider } from '@/contexts/auth-context'

export const metadata: Metadata = {
  title: 'Account - AromaChat',
  description: 'Manage your AromaChat account settings',
}

export default function AccountLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <AuthProvider>
      <main className="flex-1">{children}</main>
    </AuthProvider>
  )
}
