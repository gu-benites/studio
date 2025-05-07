
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
    isSidebarPinned,
    isUserAccountMenuExpanded,
    activeUserMenuSubItem, 
    setActiveUserMenuSubItem, 
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

  const isDesktopClient = hasMounted && !isClientMobile;
  const isDesktopSidebarEffectivelyExpanded = isDesktopClient && (isSidebarPinned || isUserAccountMenuExpanded);

  return (
    <div className="flex h-full bg-background"> 
      <AppSidebar /> 
      
      <div className={cn(
        "flex flex-col flex-1 min-h-0 transition-all duration-300 ease-in-out",
        "overflow-y-auto", // Moved scroll behavior here
        isDesktopClient && (isDesktopSidebarEffectivelyExpanded ? "md:ml-[287px]" : "md:ml-[48px]")
      )}> 
        {hasMounted && isClientMobile && <MobileHeader />}
        {/* 
          RecipeStepLayout will add its own padding-bottom if its fixed footer is present.
          This 'main' element will just be a flex container for the page content.
        */}
        <main className="flex-1">
          {children}
        </main>
      </div>
    </div>
  );
}
