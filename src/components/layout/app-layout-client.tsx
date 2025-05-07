
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
    closeUserAccountMenuSimple // Changed from closeUserAccountMenu to closeUserAccountMenuSimple
  } = useUIState();
  
  React.useEffect(() => {
    // If sidebar closes (isSidebarOpen becomes false), and user menu sub-items or the main menu were open, close them.
    // This is particularly relevant for mobile where closing the drawer should reset menu states.
    // For desktop, if the sidebar is unpinned and collapses, user menu aspects are also handled.
    if (!isSidebarOpen) {
      if (activeUserMenuSubItem) {
        setActiveUserMenuSubItem(null);
      }
      if (isUserAccountMenuExpanded) {
        // Call the simple close as we don't want to trigger sidebar state changes again from here,
        // as this effect is reacting *to* a sidebar state change.
        closeUserAccountMenuSimple(); 
      }
    }
  }, [isSidebarOpen, activeUserMenuSubItem, setActiveUserMenuSubItem, isUserAccountMenuExpanded, closeUserAccountMenuSimple]);


  // This local state for isMobile might not be strictly necessary for padding/margin anymore
  // if the sidebar itself handles its width and the main content area is purely flex-driven.
  // However, it's used by MobileHeader, so keep for that.
  const [isMobile, setIsMobile] = React.useState(false);
  React.useEffect(() => {
    const checkMobile = () => setIsMobile(window.innerWidth < 768); 
    checkMobile();
    window.addEventListener('resize', checkMobile);
    return () => window.removeEventListener('resize', checkMobile);
  }, []);


  return (
    <div className="flex min-h-screen bg-background"> {/* Ensure base background color */}
      <AppSidebar /> 
      {/* This div will take up the remaining space next to the sidebar */}
      <div className="flex flex-col flex-1 overflow-x-hidden"> {/* Added overflow-x-hidden to prevent horizontal scrollbars from main content if it's too wide */}
        <MobileHeader /> 
        <main
          className={cn(
            "flex-1" // Main content takes available space. Child components handle their own layout (e.g. centering).
            // Transitions related to width changes are primarily handled by the AppSidebar component's width animation.
            // The flex-1 property of this main's parent div will adjust its size smoothly in response.
          )}
        >
          {children}
        </main>
      </div>
    </div>
  );
}

// Helper function, if needed in UIStateContext or here, to close user menu without affecting sidebar state.
// Placed here as comment as it's part of context now.
// const closeUserAccountMenuSimple = () => {
//   setActiveUserMenuSubItem(null);
//   // setState directly if this was in context: s => ({ ...s, isUserAccountMenuExpanded: false, activeUserMenuSubItem: null })
// };
