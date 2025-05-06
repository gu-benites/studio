"use client";

import type { LucideIcon } from 'lucide-react';
import {
  PanelLeft,
  PanelLeftClose,
  Home,
  ChefHat,
  Settings, // Keep for direct nav example if any
  CreditCard, // Keep for direct nav example if any
  X, 
} from 'lucide-react';
import Link from 'next/link';
import Image from 'next/image';
import { usePathname } from 'next/navigation';
import * as React from 'react';

import { useUIState } from '@/contexts/UIStateContext';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { UserAccountMenu } from '@/components/user-account-menu';

interface NavItem {
  href: string;
  icon: LucideIcon;
  label: string;
  isUserMenuRelated?: boolean; // Flag to identify items that are part of user menu
}

const mainNavItems: NavItem[] = [
  { href: '/', icon: Home, label: 'Recipe Generator' },
  // Settings and Billing are now exclusively in UserAccountMenu, not main nav.
];

const AppSidebar: React.FC = () => {
  const { 
    isSidebarOpen, 
    isSidebarPinned, 
    toggleDesktopSidebarPin, 
    toggleMobileSidebar,
    closeSidebarCompletely,
    isUserAccountMenuExpanded,
    // User Account Menu specific actions for avatar click:
    openUserMenuAndExpandSidebarIfNeeded,
    closeUserMenuAndCollapseSidebarIfAutoExpanded,
    // Simpler actions for other cases (e.g. mobile menu toggle within already open sidebar)
    openUserAccountMenu, 
    toggleUserAccountMenu,
  } = useUIState();
  const pathname = usePathname();
  const [isClientMobile, setIsClientMobile] = React.useState(false);
  const [isHovering, setIsHovering] = React.useState(false);
  const hoverTimeoutRef = React.useRef<NodeJS.Timeout | null>(null);


  React.useEffect(() => {
    const checkMobile = () => {
      const mobile = window.innerWidth < 768;
      setIsClientMobile(mobile);
      if (!mobile && isSidebarOpen && !isSidebarPinned && !isUserAccountMenuExpanded) {
         // If transitioning from mobile to desktop, and sidebar was open (mobile drawer)
         // but not pinned and no user menu, collapse it.
         // This case might be too specific, primary logic is for clicks and pins.
      }
    };
    checkMobile();
    window.addEventListener('resize', checkMobile);
    return () => window.removeEventListener('resize', checkMobile);
  }, [isSidebarOpen, isSidebarPinned, isUserAccountMenuExpanded]);

  React.useEffect(() => {
    if (isClientMobile && isSidebarOpen && pathname) {
      closeSidebarCompletely();
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [pathname, isClientMobile]); 

  const handleMouseEnter = () => {
    if (!isClientMobile && !isSidebarPinned) {
      if (hoverTimeoutRef.current) clearTimeout(hoverTimeoutRef.current);
      setIsHovering(true);
    }
  };

  const handleMouseLeave = () => {
    if (!isClientMobile && !isSidebarPinned) {
      hoverTimeoutRef.current = setTimeout(() => setIsHovering(false), 100); // Shorter delay
    }
  };
  
  React.useEffect(() => {
    return () => {
      if (hoverTimeoutRef.current) clearTimeout(hoverTimeoutRef.current);
    };
  }, []);

  const handleAvatarClick = () => {
    if (isClientMobile) {
      if (!isSidebarOpen) { // Mobile sidebar (drawer) is closed
        toggleMobileSidebar(); // This will open the sidebar drawer
        openUserAccountMenu(); // And open the menu section within it
      } else { // Mobile sidebar (drawer) is already open
        toggleUserAccountMenu(); // Just toggle the menu section visibility
      }
    } else { // Desktop
      if (isUserAccountMenuExpanded) {
        closeUserMenuAndCollapseSidebarIfAutoExpanded();
      } else {
        openUserMenuAndExpandSidebarIfNeeded();
      }
    }
  };
  
  const showText = (isSidebarPinned || (isClientMobile && isSidebarOpen)) ;
  const desktopSidebarWidth = isSidebarPinned ? 'md:w-[287px]' : 'md:w-[48px]';
  const mobileSidebarTranslate = isSidebarOpen ? 'translate-x-0' : '-translate-x-full';

  const sidebarClasses = cn(
    'fixed inset-y-0 left-0 z-40 flex flex-col bg-app-sidebar-background border-r border-app-sidebar-border transition-all duration-300 ease-in-out shadow-lg',
    isClientMobile ? 'w-full max-w-[287px]' : desktopSidebarWidth,
    isClientMobile ? mobileSidebarTranslate : 'md:translate-x-0 md:relative',
    (isHovering && !isSidebarPinned && !isClientMobile && !isSidebarOpen) && 'bg-app-sidebar-hover-background'
  );
  
  const effectiveIsSidebarOpenForText = isClientMobile ? isSidebarOpen : isSidebarPinned;


  return (
    <>
      {isClientMobile && isSidebarOpen && (
          <div 
              onClick={toggleMobileSidebar} 
              className="fixed inset-0 z-30 bg-black/50 md:hidden"
              aria-hidden="true"
          />
      )}
      <aside className={sidebarClasses} onMouseEnter={handleMouseEnter} onMouseLeave={handleMouseLeave}>
        <div className="flex flex-col flex-grow overflow-y-auto">
          <div className={cn(
            "flex items-center border-b border-app-sidebar-border h-[60px] shrink-0",
            effectiveIsSidebarOpenForText ? "px-4 justify-between" : "px-[calc((48px-32px)/2)] justify-center md:justify-start md:px-0" 
          )}>
            {effectiveIsSidebarOpenForText && (
              <Link href="/" className="flex items-center gap-2 text-lg font-semibold text-primary shrink-0">
                  <ChefHat className="h-7 w-7" />
                  <span>RecipeSage</span>
              </Link>
            )}
            <Button
              variant="ghost"
              size="icon"
              onClick={toggleDesktopSidebarPin} // Manual pin action
              className={cn(
                "hidden md:inline-flex transition-colors hover:bg-app-sidebar-hover-background",
                effectiveIsSidebarOpenForText ? "ml-auto" : "mx-auto w-full h-full flex items-center justify-center rounded-none" 
              )}
              aria-label={isSidebarPinned ? 'Unpin and collapse sidebar' : 'Pin and expand sidebar'}
            >
              {isSidebarPinned ? <PanelLeftClose className="h-5 w-5" /> : <PanelLeft className="h-5 w-5" />}
            </Button>

            {isClientMobile && isSidebarOpen && (
              <Button
                  variant="ghost"
                  size="icon"
                  onClick={toggleMobileSidebar}
                  className="md:hidden ml-auto" // Ensure it's on the right if logo is also shown
                  aria-label="Close sidebar"
              >
                  <X className="h-5 w-5" />
              </Button>
            )}
          </div>
          
          <nav className={cn("flex-grow py-4 space-y-1", effectiveIsSidebarOpenForText ? "px-3" : "px-[calc((48px-32px)/2)]")}>
            {mainNavItems.map((item) => (
              <Link
                key={item.label}
                href={item.href}
                onClick={() => { if (isClientMobile && isSidebarOpen) toggleMobileSidebar(); }}
                className={cn(
                  'flex items-center gap-3 rounded-lg text-sm font-medium transition-all',
                  effectiveIsSidebarOpenForText ? 'px-3 py-2.5' : 'justify-center w-8 h-9 p-0.5', 
                  pathname === item.href
                    ? 'bg-app-sidebar-active-background text-app-sidebar-active-foreground'
                    : 'text-app-sidebar-foreground hover:bg-app-sidebar-hover-background hover:text-primary'
                )}
                title={effectiveIsSidebarOpenForText ? "" : item.label}
              >
                <item.icon className="h-7 w-7 shrink-0" />
                {effectiveIsSidebarOpenForText && <span>{item.label}</span>}
              </Link>
            ))}
          </nav>
        </div>

        <div className="mt-auto border-t border-app-sidebar-border">
          {isUserAccountMenuExpanded && effectiveIsSidebarOpenForText && (
            <div className="bg-card">
              <UserAccountMenu />
            </div>
          )}
          <button
            onClick={handleAvatarClick}
            className={cn(
              "flex w-full items-center gap-3 text-left text-sm font-medium transition-colors hover:bg-app-sidebar-hover-background",
              effectiveIsSidebarOpenForText ? "p-3" : "justify-center p-[calc((48px-28px)/2)] h-[48px]",
              isUserAccountMenuExpanded && effectiveIsSidebarOpenForText && 'bg-muted' // Indicate active avatar
            )}
            aria-label="User account menu"
          >
            <Image
              src="https://picsum.photos/seed/useravatar/40/40"
              alt="User Avatar"
              width={effectiveIsSidebarOpenForText ? 32 : 28}
              height={effectiveIsSidebarOpenForText ? 32 : 28}
              className="rounded-full shrink-0"
              data-ai-hint="profile avatar"
            />
            {effectiveIsSidebarOpenForText && (
              <div className="flex flex-col overflow-hidden">
                <span className="text-app-sidebar-foreground truncate">User Name</span>
                <span className="text-xs text-muted-foreground truncate">user@example.com</span>
              </div>
            )}
          </button>
        </div>
      </aside>
    </>
  );
};

export default AppSidebar;
