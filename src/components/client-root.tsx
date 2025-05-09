
'use client';

import type { ReactNode } from 'react';
import dynamic from 'next/dynamic';
import { Loader2 } from 'lucide-react';
import { AppLayoutClient } from '@/components/layout/app-layout-client';
import { LogoutConfirmationDialog } from '@/components/logout-confirmation-dialog';
// import { SubscriptionModal } from '@/components/subscription-modal'; // Original import
import { Toaster } from "@/components/ui/toaster";
import { UIStateProvider } from '@/contexts/UIStateContext';
import { RecipeFormProvider } from '@/contexts/RecipeFormContext';
import React from 'react';

const SubscriptionModal = dynamic(() => 
  import('@/components/subscription-modal').then(mod => mod.SubscriptionModal),
  {
    // Modals are not usually SSR critical and often appear based on client interaction
    ssr: false, 
    // Minimal or no loading indicator for a modal, as it might be jarring.
    // It will simply not be in the DOM until it's ready and triggered.
    // If a loading state is desired, it can be simple:
    // loading: () => <p>Loading subscription options...</p> 
  }
);

export function ClientRoot({ children }: { children: ReactNode }) {
  const [hasMounted, setHasMounted] = React.useState(false);
  React.useEffect(() => {
    setHasMounted(true);
  }, []);

  return (
    <UIStateProvider>
      <RecipeFormProvider>
        <AppLayoutClient>{children}</AppLayoutClient>
        {/* Render LogoutConfirmationDialog immediately if it's simple and frequently used */}
        <LogoutConfirmationDialog /> 
        {/* Conditionally render SubscriptionModal after mount to ensure client-side only if needed */}
        {hasMounted && <SubscriptionModal />} 
        <Toaster />
      </RecipeFormProvider>
    </UIStateProvider>
  );
}
