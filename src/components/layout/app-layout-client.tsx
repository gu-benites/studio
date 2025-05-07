'use client'; 

import type { ReactNode } from 'react';
import React from 'react';
import { useUIState } from '@/contexts/UIStateContext';
import AppSidebar from '@/components/layout/app-sidebar';
import { MobileHeader } from '@/components/layout/mobile-header';
import { cn } from '@/lib/utils';

export function AppLayoutClient({ children }: { children: ReactNode }) {
  const { 
    isSidebarOpen, 
    activeUserMenuSubItem, 
    setActiveUserMenuSubItem, 
    isUserAccountMenuExpanded, 
    closeUserAccountMenuSimple 
  } = useUIState();
  
  React.useEffect(() => {
    if (!isSidebarOpen) {
      if (activeUserMenuSubItem) {
        setActiveUserMenuSubItem(null);
      }
      if (isUserAccountMenuExpanded) {
        closeUserAccountMenuSimple(); 
      }
    }
  }, [isSidebarOpen, activeUserMenuSubItem, setActiveUserMenuSubItem, isUserAccountMenuExpanded, closeUserAccountMenuSimple]);

  const [isMobile, setIsMobile] = React.useState(false);
  React.useEffect(() => {
    const checkMobile = () => setIsMobile(window.innerWidth < 768); 
    checkMobile();
    window.addEventListener('resize', checkMobile);
    return () => window.removeEventListener('resize', checkMobile);
  }, []);


  return (
    <div className="flex h-screen overflow-hidden bg-background"> {/* Outermost container: fixed height, no scroll */}
      <AppSidebar /> 
      {/* Main content wrapper: flex-1 to take remaining space, scrollable */}
      <div className="flex flex-col flex-1 overflow-x-hidden overflow-y-auto"> 
        <MobileHeader /> 
        <main className="flex-1"> {/* Main content itself */}
          {children}
        </main>
      </div>
    </div>
  );
}
