'use client'; 

import type { ReactNode } from 'react';
import React from 'react';
import { useUIState } from '@/contexts/UIStateContext';
import AppSidebar from '@/components/layout/app-sidebar';
import { MobileHeader } from '@/components/layout/mobile-header';
import { cn } from '@/lib/utils';

export function AppLayoutClient({ children }: { children: ReactNode }) {
  const { 
    isSidebarOpen: contextSidebarOpen,
    activeUserMenuSubItem, 
    setActiveUserMenuSubItem, 
    isUserAccountMenuExpanded, 
    closeUserAccountMenuSimple 
  } = useUIState();

  React.useEffect(() => {
    if (!contextSidebarOpen) {
      if (activeUserMenuSubItem) {
        setActiveUserMenuSubItem(null);
      }
      if (isUserAccountMenuExpanded) {
        closeUserAccountMenuSimple(); 
      }
    }
  }, [contextSidebarOpen, activeUserMenuSubItem, setActiveUserMenuSubItem, isUserAccountMenuExpanded, closeUserAccountMenuSimple]);

  const [isClientMobile, setIsClientMobile] = React.useState(false);
  const [hasMounted, setHasMounted] = React.useState(false);

  React.useEffect(() => {
    setHasMounted(true);
    const checkMobile = () => setIsClientMobile(window.innerWidth < 768); 
    checkMobile();
    window.addEventListener('resize', checkMobile);
    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  return (
    // Main flex container: h-full to take parent's height (body min-h-screen).
    // Added overflow-hidden to ensure this container itself does not scroll.
    <div className="flex h-full bg-background overflow-hidden"> 
      <AppSidebar /> 
      
      {/* Main content wrapper: 
          - flex-1 to take remaining space.
          - flex-col for stacking MobileHeader and main.
          - overflow-y-auto to allow its own content to scroll.
          - min-h-0 is important for flex children with overflow to ensure they don't expand their parent indefinitely.
      */}
      <div className={cn(
        "flex flex-col flex-1 overflow-y-auto min-h-0",
      )}> 
        {hasMounted && isClientMobile && <MobileHeader />}
        {/* Main content area itself: flex-1 to fill the scrollable wrapper. */}
        <main className="flex-1 p-4 sm:p-6 md:p-8">
          {children}
        </main>
      </div>
    </div>
  );
}

