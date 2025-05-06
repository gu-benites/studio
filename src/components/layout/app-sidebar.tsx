
"use client";

import type { LucideIcon } from 'lucide-react';
import {
  PanelLeft,
  PanelLeftClose,
  Home,
  ChefHat,
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
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip"

interface NavItem {
  href: string;
  icon: LucideIcon;
  label: string;
}

const mainNavItems: NavItem[] = [
  { href: '/', icon: Home, label: 'Recipe Generator' },
];

const AppSidebar: React.FC = () => {
  const { 
    isSidebarOpen, 
    isSidebarPinned, 
    toggleDesktopSidebarPin, 
    toggleMobileSidebar,
    closeSidebarCompletely,
    isUserAccountMenuExpanded,
    handleUserMenuToggle, 
    openUserAccountMenuSimple, 
    toggleUserAccountMenuSimple, 
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
      // Mobile sidebar closes on navigation handled by individual link clicks
    }
  }, [pathname, isClientMobile, isSidebarOpen]);

  const handleMouseEnter = () => {
    if (!isClientMobile && !isSidebarPinned && !isSidebarOpen && !isUserAccountMenuExpanded) { 
      if (hoverTimeoutRef.current) clearTimeout(hoverTimeoutRef.current);
      setIsHovering(true);
    }
  };

  const handleMouseLeave = () => {
    if (!isClientMobile && !isSidebarPinned && !isSidebarOpen && !isUserAccountMenuExpanded) {
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
      if (!isSidebarOpen) { 
        toggleMobileSidebar(); 
        setTimeout(() => openUserAccountMenuSimple(), 50); // Ensure sidebar is open before menu
      } else { 
        toggleUserAccountMenuSimple(); 
      }
    } else { 
      handleUserMenuToggle(); 
    }
  };
  
  const isDesktopExpanded = !isClientMobile && (isSidebarPinned || isUserAccountMenuExpanded);
  const isMobileExpanded = isClientMobile && isSidebarOpen;
  const isEffectivelyExpanded = isDesktopExpanded || isMobileExpanded;

  const desktopSidebarWidth = isDesktopExpanded ? 'md:w-[287px]' : 'md:w-[48px]';
  const mobileSidebarTranslate = isSidebarOpen ? 'translate-x-0' : '-translate-x-full';

  const sidebarClasses = cn(
    'fixed inset-y-0 left-0 z-40 flex flex-col bg-[hsl(var(--app-sidebar-background))] text-[hsl(var(--app-sidebar-foreground))] border-r border-[hsl(var(--app-sidebar-border))] transition-all duration-300 ease-in-out shadow-lg',
    isClientMobile ? 'w-full max-w-[287px]' : desktopSidebarWidth,
    isClientMobile ? mobileSidebarTranslate : 'md:translate-x-0 md:relative',
    (isHovering && !isDesktopExpanded && !isClientMobile && !isSidebarOpen && !isUserAccountMenuExpanded) && 'bg-[hsl(var(--app-sidebar-hover-background))]'
  );
  

  return (
    <>
      {isClientMobile && isSidebarOpen && (
          <div 
              onClick={toggleMobileSidebar} 
              className="fixed inset-0 z-30 bg-black/50 md:hidden"
              aria-hidden="true"
          />
      )}
      <TooltipProvider delayDuration={0}>
      <aside className={sidebarClasses} onMouseEnter={handleMouseEnter} onMouseLeave={handleMouseLeave}>
        <div className="flex flex-col flex-grow overflow-y-auto">
          {/* Sidebar Header */}
          <div className={cn(
            "flex items-center border-b border-[hsl(var(--app-sidebar-border))] h-[60px] shrink-0",
            // Desktop Expanded: Icon on left (part of normal flow), then Logo.
            // Desktop Collapsed: Icon centered.
            // Mobile Open: Logo on left, X on right.
            isEffectivelyExpanded ? "px-3 gap-3" : "justify-center",
            isMobileExpanded && "justify-between" // Override for mobile open
          )}>

            {/* Desktop/Mobile Toggle Button (PanelLeft/PanelLeftClose/X) */}
            {!isClientMobile && ( // Desktop toggle
                <Button
                    variant="ghost"
                    size="icon"
                    onClick={toggleDesktopSidebarPin}
                    className={cn(
                        "h-9 w-9 hover:bg-[hsl(var(--app-sidebar-hover-background))] hover:text-[hsl(var(--app-sidebar-foreground))]",
                        "focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-[hsl(var(--app-sidebar-background))]",
                        !isEffectivelyExpanded && "mx-auto" // Center when collapsed and no logo
                    )}
                    aria-label={isSidebarPinned ? 'Unpin and collapse sidebar' : 'Pin and expand sidebar'}
                >
                    {isSidebarPinned ? <PanelLeftClose className="h-5 w-5" /> : <PanelLeft className="h-5 w-5" />}
                </Button>
            )}
            
            {/* Logo and Title - Shown when sidebar is effectively expanded */}
            {isEffectivelyExpanded && (
              <Link 
                href="/" 
                className="flex items-center gap-2 text-lg font-semibold text-primary"
                onClick={() => { if (isClientMobile) closeSidebarCompletely();}}
              >
                <ChefHat className="h-7 w-7" />
                <span>RecipeSage</span>
              </Link>
            )}
            
            {/* Mobile Close Button (X) - Shown only when mobile sidebar is open */}
            {isMobileExpanded && (
              <Button
                  variant="ghost"
                  size="icon"
                  onClick={toggleMobileSidebar} 
                  className="h-9 w-9 hover:bg-[hsl(var(--app-sidebar-hover-background))] hover:text-[hsl(var(--app-sidebar-foreground))] focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-[hsl(var(--app-sidebar-background))]"
                  aria-label="Close sidebar"
              >
                  <X className="h-5 w-5" />
              </Button>
            )}
          </div>
          
          <nav className={cn("flex-grow py-4 space-y-1", isEffectivelyExpanded ? "px-3" : "px-[calc((48px-32px)/2)]")}>
            {mainNavItems.map((item) => {
              const navLinkContent = (
                <Link
                  href={item.href}
                  onClick={() => { 
                    if (isClientMobile && isSidebarOpen) {
                      closeSidebarCompletely(); 
                    }
                  }}
                  className={cn(
                    'flex items-center gap-3 rounded-lg text-sm font-medium transition-all',
                    'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-1 focus-visible:ring-offset-[hsl(var(--app-sidebar-background))]',
                    isEffectivelyExpanded ? 'px-3 py-2.5 w-full' : 'justify-center w-8 h-9 p-0.5', 
                    pathname === item.href
                      ? 'bg-[hsl(var(--app-sidebar-active-background))] text-[hsl(var(--app-sidebar-active-foreground))]'
                      : 'text-[hsl(var(--app-sidebar-foreground))] hover:bg-[hsl(var(--app-sidebar-hover-background))] hover:text-[hsl(var(--app-sidebar-foreground))]'
                  )}
                >
                  <item.icon className="h-7 w-7 shrink-0" />
                  {isEffectivelyExpanded && <span>{item.label}</span>}
                </Link>
              );

              return (
                <div key={item.label}>
                  {isEffectivelyExpanded ? (
                    navLinkContent
                  ) : (
                    <Tooltip>
                      <TooltipTrigger asChild>{navLinkContent}</TooltipTrigger>
                      <TooltipContent side="right" sideOffset={8}>
                        <p>{item.label}</p>
                      </TooltipContent>
                    </Tooltip>
                  )}
                </div>
              );
            })}
          </nav>
        </div>

        <div className="mt-auto border-t border-[hsl(var(--app-sidebar-border))]">
          {isUserAccountMenuExpanded && isEffectivelyExpanded && (
            // UserAccountMenu bg is handled internally by its own Card component
            <UserAccountMenu />
          )}
          <Tooltip>
            <TooltipTrigger asChild disabled={isEffectivelyExpanded}>
              <button
                onClick={handleAvatarClick}
                className={cn(
                  "flex w-full items-center gap-3 text-left text-sm font-medium transition-colors",
                  "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-0 focus-visible:ring-offset-[hsl(var(--app-sidebar-background))]",
                  isEffectivelyExpanded ? "p-3 h-[60px]" : "justify-center h-[60px] w-full p-[calc((48px-28px)/2)]", 
                  isUserAccountMenuExpanded && isEffectivelyExpanded 
                    ? 'bg-[hsl(var(--app-sidebar-active-background))] text-[hsl(var(--app-sidebar-active-foreground))]'
                    : 'hover:bg-[hsl(var(--app-sidebar-hover-background))] hover:text-[hsl(var(--app-sidebar-foreground))]'
                )}
                aria-label="User account menu"
              >
                <Image
                  src="https://picsum.photos/seed/useravatar/40/40"
                  alt="User Avatar"
                  width={28}
                  height={28}
                  className="rounded-full shrink-0"
                  data-ai-hint="profile avatar"
                />
                {isEffectivelyExpanded && (
                  <div className="flex flex-col overflow-hidden">
                    <span className="truncate">User Name</span>
                    <span className={cn(
                      "text-xs truncate",
                      isUserAccountMenuExpanded && isEffectivelyExpanded ? 'opacity-80' : 'text-muted-foreground'
                    )}>user@example.com</span>
                  </div>
                )}
              </button>
            </TooltipTrigger>
            {!isEffectivelyExpanded && (
              <TooltipContent side="right" sideOffset={8}>
                <p>User Name</p>
                <p className="text-xs text-muted-foreground">user@example.com</p>
              </TooltipContent>
            )}
          </Tooltip>
        </div>
      </aside>
      </TooltipProvider>
    </>
  );
};

export default AppSidebar;

    