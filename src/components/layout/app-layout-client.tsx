'use client'; // This is crucial to mark this as a Client Component

import type { ReactNode } from 'react';
import React from 'react';
import { useUIState } from '@/contexts/UIStateContext';
import AppSidebar from '@/components/layout/app-sidebar';
import { MobileHeader } from '@/components/layout/mobile-header';
import { cn } from '@/lib/utils';

export function AppLayoutClient({ children }: { children: ReactNode }) {
  const { isSidebarOpen, isSidebarPinned, activeUserMenuSubItem, setActiveUserMenuSubItem } = useUIState();
  const [isMobile, setIsMobile] = React.useState(false);
  const [isHovering, setIsHovering] = React.useState(false);
  const hoverTimeoutRef = React.useRef<NodeJS.Timeout | null>(null);

  React.useEffect(() => {
    const checkMobile = () => setIsMobile(window.innerWidth < 768); // Tailwind 'md' breakpoint
    checkMobile();
    window.addEventListener('resize', checkMobile);
    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  // Determine main content padding based on device and sidebar state
  let mainContentPaddingLeft = "pl-0 md:pl-[68px]"; // Default: no padding on mobile, collapsed on desktop
  if (!isMobile) { // Desktop
    // Sidebar is considered open for padding purposes if it's pinned, or if it's contextually open AND being hovered
    if (isSidebarPinned || (isSidebarOpen && isHovering) ) { 
      mainContentPaddingLeft = "md:pl-[287px]";
    }
  }
  // On mobile, sidebar is an overlay, so main content doesn't need padding adjustment based on its state.


  // Effect to close user menu if sidebar is collapsed (isSidebarOpen becomes false)
  React.useEffect(() => {
    if (!isSidebarOpen && activeUserMenuSubItem) {
      setActiveUserMenuSubItem(null);
    }
  }, [isSidebarOpen, activeUserMenuSubItem, setActiveUserMenuSubItem]);


  const handleMouseEnter = () => {
    if (!isMobile && !isSidebarPinned) { // Only apply hover effect on desktop if sidebar is not pinned
      if (hoverTimeoutRef.current) {
        clearTimeout(hoverTimeoutRef.current);
        hoverTimeoutRef.current = null;
      }
      setIsHovering(true);
    }
  };

  const handleMouseLeave = () => {
    if (!isMobile && !isSidebarPinned) { // Only apply hover effect on desktop if sidebar is not pinned
       hoverTimeoutRef.current = setTimeout(() => {
        setIsHovering(false);
      }, 300); // Small delay to prevent flickering and allow moving cursor to sidebar
    }
  };
  
  React.useEffect(() => {
    // Cleanup timeout on unmount
    return () => {
      if (hoverTimeoutRef.current) {
        clearTimeout(hoverTimeoutRef.current);
      }
    };
  }, []);


  return (
    <div className="flex min-h-screen" onMouseEnter={handleMouseEnter} onMouseLeave={handleMouseLeave}>
      {/* Pass isHovering and setIsHovering to AppSidebar so it can react */}
      <AppSidebar isHovering={isHovering} setIsHovering={setIsHovering} /> 
      <div className="flex flex-col flex-1">
        <MobileHeader /> {/* Mobile header is part of the main content flow */}
        <main
          className={cn(
            "flex-1 transition-all duration-300 ease-in-out",
            mainContentPaddingLeft // Apply dynamic padding
          )}
        >
          {children}
        </main>
      </div>
    </div>
  );
}
