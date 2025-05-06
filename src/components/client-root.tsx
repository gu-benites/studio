
'use client';

import type { ReactNode } from 'react';
import { AppLayoutClient } from '@/components/layout/app-layout-client';
import { LogoutConfirmationDialog } from '@/components/logout-confirmation-dialog';
import { SubscriptionModal } from '@/components/subscription-modal';
import { Toaster } from "@/components/ui/toaster";
import { UIStateProvider } from '@/contexts/UIStateContext';
import React from 'react';

export function ClientRoot({ children }: { children: ReactNode }) {
  return (
    <UIStateProvider>
      <AppLayoutClient>{children}</AppLayoutClient>
      <LogoutConfirmationDialog />
      <SubscriptionModal />
      <Toaster />
    </UIStateProvider>
  );
}
