'use client'; 

import type { ReactNode } from 'react';
import React from 'react';
import { useUIState } from '@/contexts/UIStateContext';
import AppSidebar from '@/components/layout/app-sidebar';
import { MobileHeader } from '@/components/layout/mobile-header';
import { cn } from '@/lib/utils';

export function AppLayoutClient({ children }: { children: ReactNode }) {
  const { isSidebarOpen, isSidebarPinned, activeUserMenuSubItem, setActiveUserMenuSubItem, isUserAccountMenuExpanded, closeUserAccountMenu } = useUIState();
  const [isMobile, setIsMobile] = React.useState(false);
  
  React.useEffect(() => {
    const checkMobile = () => setIsMobile(window.innerWidth < 768); 
    checkMobile();
    window.addEventListener('resize', checkMobile);
    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  let mainContentPaddingLeft = "pl-0 md:pl-[48px]"; // Default: no padding mobile, 48px desktop collapsed
  if (!isMobile) { 
    if (isSidebarPinned) { 
      mainContentPaddingLeft = "md:pl-[287px]"; // Desktop expanded
    }
  }
  
  React.useEffect(() => {
    if (!isSidebarOpen && activeUserMenuSubItem) {
      setActiveUserMenuSubItem(null);
    }
    if (!isSidebarOpen && isUserAccountMenuExpanded) {
      closeUserAccountMenu();
    }
  }, [isSidebarOpen, activeUserMenuSubItem, setActiveUserMenuSubItem, isUserAccountMenuExpanded, closeUserAccountMenu]);


  return (
    <div className="flex min-h-screen">
      <AppSidebar /> 
      <div className="flex flex-col flex-1">
        <MobileHeader /> 
        <main
          className={cn(
            "flex-1 transition-all duration-300 ease-in-out",
            mainContentPaddingLeft 
          )}
        >
          {children}
        </main>
      </div>
    </div>
  );
}

