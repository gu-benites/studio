import AuthForm from '@/components/auth/auth-form'

export const metadata = {
  title: 'Register - AromaChat',
  description: 'Create a new AromaChat account',
}

export default function RegisterPage() {
  return (
    <div className="container flex items-center justify-center min-h-[calc(100vh-4rem)] py-12">
      <AuthForm />
    </div>
  )
}
