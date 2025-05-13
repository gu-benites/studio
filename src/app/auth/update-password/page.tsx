import { Metadata } from 'next'
import UpdatePasswordFormWrapper from './update-password-client'

export const metadata: Metadata = {
  title: 'Update Password - AromaChat',
  description: 'Update your AromaChat password',
}

export default function UpdatePasswordPage() {
  return <UpdatePasswordFormWrapper />
}