import AuthForm from '@/components/auth/auth-form'

export const metadata = {
  title: 'Login - AromaChat',
  description: 'Login to your AromaChat account',
}

export default function LoginPage() {
  return (
    <div className="container flex items-center justify-center min-h-[calc(100vh-4rem)] py-12">
      <AuthForm />
    </div>
  )
}
