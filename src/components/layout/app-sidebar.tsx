
"use client";

import type { LucideIcon } from 'lucide-react';
import {
  PanelLeft,
  PanelLeftClose,
  Home,
  ChefHat,
  // Settings, // No longer direct nav
  // CreditCard, // No longer direct nav
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
    handleUserMenuToggle, // Used for desktop avatar click
    openUserAccountMenuSimple, // Used for mobile avatar click when drawer is opening
    toggleUserAccountMenuSimple, // Used for mobile avatar click when drawer is already open
  } = useUIState();
  const pathname = usePathname();
  const [isClientMobile, setIsClientMobile] = React.useState(false);
  const [isHovering, setIsHovering] = React.useState(false);
  const hoverTimeoutRef = React.useRef<NodeJS.Timeout | null>(null);


  React.useEffect(() => {
    const checkMobile = () => {
      const mobile = window.innerWidth < 768;
      setIsClientMobile(mobile);
    };
    checkMobile();
    window.addEventListener('resize', checkMobile);
    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  React.useEffect(() => {
    if (isClientMobile && isSidebarOpen && pathname) {
      // Close mobile sidebar on navigation
      // Note: This might be handled by individual Link onClick handlers as well.
      // closeSidebarCompletely(); // Keeping this to ensure robust closure.
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [pathname, isClientMobile]); // Removed isSidebarOpen from deps to avoid loop if closeSidebarCompletely changes it.

  const handleMouseEnter = () => {
    if (!isClientMobile && !isSidebarPinned && !isSidebarOpen) { // Only darken if fully collapsed and unpinned
      if (hoverTimeoutRef.current) clearTimeout(hoverTimeoutRef.current);
      setIsHovering(true);
    }
  };

  const handleMouseLeave = () => {
    if (!isClientMobile && !isSidebarPinned && !isSidebarOpen) {
      hoverTimeoutRef.current = setTimeout(() => setIsHovering(false), 100);
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
        openUserAccountMenuSimple(); // And open the menu section within it
      } else { // Mobile sidebar (drawer) is already open
        toggleUserAccountMenuSimple(); // Just toggle the menu section visibility
      }
    } else { // Desktop
      handleUserMenuToggle(); // Unified handler for desktop: opens menu & sidebar, or closes menu & sidebar
    }
  };
  
  const showText = isSidebarPinned || (isClientMobile && isSidebarOpen);
  const desktopSidebarWidth = isSidebarPinned ? 'md:w-[287px]' : 'md:w-[48px]';
  const mobileSidebarTranslate = isSidebarOpen ? 'translate-x-0' : '-translate-x-full';

  const sidebarClasses = cn(
    'fixed inset-y-0 left-0 z-40 flex flex-col bg-[hsl(var(--app-sidebar-background))] border-r border-[hsl(var(--app-sidebar-border))] transition-all duration-300 ease-in-out shadow-lg',
    isClientMobile ? 'w-full max-w-[287px]' : desktopSidebarWidth,
    isClientMobile ? mobileSidebarTranslate : 'md:translate-x-0 md:relative',
    (isHovering && !isSidebarPinned && !isClientMobile && !isSidebarOpen) && 'bg-[hsl(var(--app-sidebar-hover-background))]'
  );
  
  const effectiveIsSidebarOpenForTextAndHeader = isClientMobile ? isSidebarOpen : isSidebarPinned;


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
            "flex items-center border-b border-[hsl(var(--app-sidebar-border))] h-[60px] shrink-0",
            effectiveIsSidebarOpenForTextAndHeader ? "px-4 justify-between" : "px-[calc((48px-28px)/2)] justify-center md:justify-start md:px-0" 
          )}>
            {effectiveIsSidebarOpenForTextAndHeader && (
              <Link href="/" className="flex items-center gap-2 text-lg font-semibold text-primary shrink-0">
                  <ChefHat className="h-7 w-7" />
                  <span>RecipeSage</span>
              </Link>
            )}
             {/* Desktop Pin/Unpin Toggle */}
            <Button
              variant="ghost"
              size="icon"
              onClick={toggleDesktopSidebarPin}
              className={cn(
                "hidden md:inline-flex transition-colors hover:bg-[hsl(var(--app-sidebar-hover-background))]",
                effectiveIsSidebarOpenForTextAndHeader ? "ml-auto" : "mx-auto w-full h-full flex items-center justify-center rounded-none"
              )}
              aria-label={isSidebarPinned ? 'Unpin and collapse sidebar' : 'Pin and expand sidebar'}
            >
              {isSidebarPinned ? <PanelLeftClose className="h-5 w-5" /> : <PanelLeft className="h-5 w-5" />}
            </Button>

            {/* Mobile Close (X) Icon - appears inside open mobile sidebar header */}
            {isClientMobile && isSidebarOpen && (
              <Button
                  variant="ghost"
                  size="icon"
                  onClick={toggleMobileSidebar} // This will close the mobile drawer
                  className="md:hidden ml-auto" 
                  aria-label="Close sidebar"
              >
                  <X className="h-5 w-5" />
              </Button>
            )}
          </div>
          
          <nav className={cn("flex-grow py-4 space-y-1", effectiveIsSidebarOpenForTextAndHeader ? "px-3" : "px-[calc((48px-32px)/2)]")}>
            {mainNavItems.map((item) => (
              <Link
                key={item.label}
                href={item.href}
                onClick={() => { 
                  if (isClientMobile && isSidebarOpen) {
                    closeSidebarCompletely(); // Close mobile drawer on nav click
                  }
                  // On desktop, main nav clicks do not affect sidebar pin state or user menu.
                }}
                className={cn(
                  'flex items-center gap-3 rounded-lg text-sm font-medium transition-all',
                  effectiveIsSidebarOpenForTextAndHeader ? 'px-3 py-2.5 w-[263px] h-[46px]' : 'justify-center w-8 h-9 p-0.5', // 32x36 click area, 28x28 icon
                  pathname === item.href
                    ? 'bg-[hsl(var(--app-sidebar-active-background))] text-[hsl(var(--app-sidebar-active-foreground))]'
                    : 'text-[hsl(var(--app-sidebar-foreground))] hover:bg-[hsl(var(--app-sidebar-hover-background))] hover:text-primary'
                )}
                title={effectiveIsSidebarOpenForTextAndHeader ? "" : item.label} // Tooltip for collapsed icons
              >
                <item.icon className="h-7 w-7 shrink-0" /> {/* 28x28 icon */}
                {effectiveIsSidebarOpenForTextAndHeader && <span>{item.label}</span>}
              </Link>
            ))}
          </nav>
        </div>

        <div className="mt-auto border-t border-[hsl(var(--app-sidebar-border))]">
          {isUserAccountMenuExpanded && effectiveIsSidebarOpenForTextAndHeader && (
            <div className="bg-card"> {/* Background for the menu itself */}
              <UserAccountMenu />
            </div>
          )}
          <button
            onClick={handleAvatarClick}
            className={cn(
              "flex w-full items-center gap-3 text-left text-sm font-medium transition-colors hover:bg-[hsl(var(--app-sidebar-hover-background))]",
              effectiveIsSidebarOpenForTextAndHeader ? "p-3 h-[60px]" : "justify-center p-[calc((48px-28px)/2)] h-[60px]", // Consistent height for avatar section
              isUserAccountMenuExpanded && effectiveIsSidebarOpenForTextAndHeader && 'bg-muted' // Indicate active avatar when menu is open and sidebar expanded
            )}
            aria-label="User account menu"
          >
            <Image
              src="https://picsum.photos/seed/useravatar/40/40"
              alt="User Avatar"
              width={effectiveIsSidebarOpenForTextAndHeader ? 32 : 28} // Icon size 28x28
              height={effectiveIsSidebarOpenForTextAndHeader ? 32 : 28}
              className="rounded-full shrink-0"
              data-ai-hint="profile avatar"
            />
            {effectiveIsSidebarOpenForTextAndHeader && (
              <div className="flex flex-col overflow-hidden">
                <span className="text-[hsl(var(--app-sidebar-foreground))] truncate">User Name</span>
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
