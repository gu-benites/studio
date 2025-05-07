'use client'; 

import type { ReactNode } from 'react';
import React from 'react';
import { useUIState } from '@/contexts/UIStateContext';
import AppSidebar from '@/components/layout/app-sidebar';
import { MobileHeader } from '@/components/layout/mobile-header';
import { cn } from '@/lib/utils';

export function AppLayoutClient({ children }: { children: ReactNode }) {
  const { 
    isSidebarOpen: contextSidebarOpen, // Renamed from isSidebarOpen
    activeUserMenuSubItem, 
    setActiveUserMenuSubItem, 
    isUserAccountMenuExpanded, 
    closeUserAccountMenuSimple 
  } = useUIState();

  // Use contextSidebarOpen for the check
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

  const [isMobile, setIsMobile] = React.useState(false);
  const [hasMounted, setHasMounted] = React.useState(false);

  React.useEffect(() => {
    setHasMounted(true);
    const checkMobile = () => setIsMobile(window.innerWidth < 768); 
    checkMobile();
    window.addEventListener('resize', checkMobile);
    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  // Determine sidebar visibility based on mounted state for initial render consistency
  const sidebarVisibleOnClient = hasMounted ? contextSidebarOpen : false;


  return (
    <div className="flex h-screen overflow-hidden bg-background"> {/* Consistent layout */}
      <AppSidebar /> 
      {/* Main content wrapper: flex-1 to take remaining space, scrollable */}
      <div className={cn(
        "flex flex-col flex-1 overflow-x-hidden overflow-y-auto transition-all duration-300 ease-in-out",
        // Apply margin-left adjustment only on desktop and when sidebar is not mobile overlay
        // No dynamic margin needed if AppSidebar is part of flex layout and resizes itself
      )}> 
        {hasMounted && isMobile && <MobileHeader />}
        <main className="flex-1 p-4 sm:p-6 md:p-8"> {/* Added padding to main */}
          {children}
        </main>
      </div>
    </div>
  );
}
