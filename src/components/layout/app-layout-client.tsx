'use client'; 

import type { ReactNode } from 'react';
import React from 'react';
import { useUIState } from '@/contexts/UIStateContext';
import AppSidebar from '@/components/layout/app-sidebar';
import { MobileHeader } from '@/components/layout/mobile-header';
import { cn } from '@/lib/utils';

export function AppLayoutClient({ children }: { children: ReactNode }) {
  const { 
    isSidebarOpen: contextSidebarOpen, // True if sidebar is visually expanded (pinned or user menu open)
    isSidebarPinned,
    isUserAccountMenuExpanded,
    activeUserMenuSubItem, 
    setActiveUserMenuSubItem, 
    closeUserAccountMenuSimple 
  } = useUIState();

  React.useEffect(() => {
    // This effect ensures that if the sidebar is programmatically closed (e.g. by screen resize or other logic not directly related to user menu interaction),
    // the user account menu and its sub-items are also reset.
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

  const isDesktopClient = hasMounted && !isClientMobile;
  // Determine if the sidebar is effectively expanded on desktop for margin calculation
  const isDesktopSidebarEffectivelyExpanded = isDesktopClient && (isSidebarPinned || isUserAccountMenuExpanded);


  return (
    // Main flex container: h-full to take parent's height (body min-h-screen).
    // overflow-hidden to ensure this container itself does not scroll.
    <div className="flex h-full bg-background overflow-hidden"> 
      <AppSidebar /> 
      
      {/* Main content wrapper: 
          - flex-1 to take remaining space.
          - flex-col for stacking MobileHeader and main.
          - overflow-y-auto to allow its own content to scroll.
          - min-h-0 is important for flex children with overflow to ensure they don't expand their parent indefinitely.
          - Dynamic margin-left on desktop to account for the fixed sidebar.
      */}
      <div className={cn(
        "flex flex-col flex-1 overflow-y-auto min-h-0 transition-all duration-300 ease-in-out",
        isDesktopClient && (isDesktopSidebarEffectivelyExpanded ? "md:ml-[287px]" : "md:ml-[48px]")
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

