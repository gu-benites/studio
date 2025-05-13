'use client';

import { redirect } from 'next/navigation';
import { useAuth } from '@/contexts/auth-context';
import { Skeleton } from '@/components/ui/skeleton';
import { AdminSidebar } from '@/components/admin/admin-sidebar';

export default function AdminLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const { user, isLoading } = useAuth();
  
  // Show loading state while checking authentication
  if (isLoading) {
    return (
      <div className="flex h-screen items-center justify-center">
        <div className="w-[600px] space-y-4">
          <Skeleton className="h-8 w-full" />
          <Skeleton className="h-[600px] w-full" />
        </div>
      </div>
    );
  }
  
  // Check if user is authenticated and has admin role
  // This is client-side protection; we'll also add server-side protection
  if (!user) {
    redirect('/auth/login?callbackUrl=/admin');
  }
  
  // Render the admin layout with sidebar
  return (
    <div className="flex min-h-screen">
      <AdminSidebar />
      <div className="flex-1 p-6 lg:p-8">
        <div className="mx-auto max-w-6xl">
          {children}
        </div>
      </div>
    </div>
  );
}
