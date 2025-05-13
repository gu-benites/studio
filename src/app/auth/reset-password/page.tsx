import { Metadata } from 'next'
import ResetPasswordClient from './reset-password-client'

export const metadata: Metadata = {
  title: 'Reset Password - AromaChat',
  description: 'Reset your AromaChat password',
}

export default function ResetPasswordPage() {
  return <ResetPasswordClient />
}
