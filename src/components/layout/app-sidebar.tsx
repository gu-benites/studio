"use client";

import type { LucideIcon } from 'lucide-react';
import {
  PanelLeft,
  PanelLeftClose,
  Home,
  ChefHat,
  // Settings, // No longer in main nav
  // List,     // No longer in main nav
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
  // { href: '/create-recipe', icon: ChefHat, label: 'Create Recipe' }, 
  // { href: '/my-recipes', icon: List, label: 'My Recipes' },
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
      if (!mobile && isSidebarOpen && !isSidebarPinned && !isUserAccountMenuExpanded) {
        // If switching from mobile to desktop, and sidebar was open (mobile drawer) but not pinned/user menu, collapse it
        // This case is less common as sidebar state is usually reset anyway.
      }
    };
    checkMobile();
    window.addEventListener('resize', checkMobile);
    return () => window.removeEventListener('resize', checkMobile);
  }, [isSidebarOpen, isSidebarPinned, isUserAccountMenuExpanded]);


  React.useEffect(() => {
    // Mobile sidebar closing on navigation is handled by individual link clicks
    // or UserAccountMenu's handleNavigationOrModalAction
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
        setTimeout(() => openUserAccountMenuSimple(), 50); 
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
        <div className={cn(
          "flex flex-col flex-grow overflow-y-auto",
          // Add overflow-x-hidden only for desktop collapsed state
           !isClientMobile && !isEffectivelyExpanded && "overflow-x-hidden"
        )}>
          {/* Sidebar Header */}
          <div className={cn(
            "flex items-center border-b border-[hsl(var(--app-sidebar-border))] h-[60px] shrink-0",
            // Case 1: Mobile and Open
            isMobileExpanded ? "justify-between px-3" : 
            // Case 2: Desktop and Expanded (isSidebarPinned or isUserAccountMenuExpanded)
            (!isClientMobile && isEffectivelyExpanded) ? "items-center px-3 gap-3" : 
            // Case 3: Desktop and Collapsed
            (!isClientMobile && !isEffectivelyExpanded) ? "justify-center px-[6px]" : // Centers the w-9 (36px) button in 48px
            "" // Fallback
          )}>

            {/* DESKTOP: Toggle icon is primary element. Logo appears next to it if expanded. */}
            {!isClientMobile && (
              <>
                <Button
                    variant="ghost"
                    size="icon" // Uses h-10 w-10 from variant, override with className
                    onClick={toggleDesktopSidebarPin}
                    className={cn(
                        "h-9 w-9 shrink-0", // Explicitly h-9 w-9
                        "hover:bg-[hsl(var(--app-sidebar-hover-background))] hover:text-[hsl(var(--app-sidebar-foreground))]",
                        "focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-[hsl(var(--app-sidebar-background))]"
                    )}
                    aria-label={isSidebarPinned ? 'Unpin and collapse sidebar' : 'Pin and expand sidebar'}
                >
                    {isSidebarPinned ? <PanelLeftClose className="h-5 w-5" /> : <PanelLeft className="h-5 w-5" />}
                </Button>
                {isEffectivelyExpanded && ( /* This is true if isSidebarPinned or isUserAccountMenuExpanded (on desktop) */
                  <Link 
                    href="/" 
                    className="flex items-center gap-2 text-lg font-semibold text-primary overflow-hidden"
                  >
                    <ChefHat className="h-4 w-4 shrink-0" /> 
                    <span className="truncate">RecipeSage</span>
                  </Link>
                )}
              </>
            )}

            {/* MOBILE: Logo is to the left, Close (X) icon is to the right. (Only when sidebar is open) */}
            {isMobileExpanded && (
              <>
                <Link 
                  href="/" 
                  className="flex items-center gap-2 text-lg font-semibold text-primary overflow-hidden"
                  onClick={() => { if (isClientMobile) closeSidebarCompletely();}}
                >
                  <ChefHat className="h-4 w-4 shrink-0" /> 
                  <span className="truncate">RecipeSage</span>
                </Link>
                <Button
                    variant="ghost"
                    size="icon" // uses h-10 w-10, override with className
                    onClick={toggleMobileSidebar} 
                    className="h-9 w-9 hover:bg-[hsl(var(--app-sidebar-hover-background))] hover:text-[hsl(var(--app-sidebar-foreground))] focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-[hsl(var(--app-sidebar-background))]"
                    aria-label="Close sidebar"
                >
                    <X className="h-5 w-5" />
                </Button>
              </>
            )}
          </div>
          
          <nav className={cn(
            "flex-grow py-4 space-y-1", 
            isEffectivelyExpanded ? "px-3" : "px-[calc((48px-32px)/2)]" // px-[8px] for collapsed
            )}>
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
                    isEffectivelyExpanded ? 'px-3 py-2.5 w-full' : 'justify-center w-8 h-9 p-0', 
                    pathname === item.href
                      ? 'bg-[hsl(var(--app-sidebar-active-background))] text-[hsl(var(--app-sidebar-active-foreground))]'
                      : 'text-[hsl(var(--app-sidebar-foreground))] hover:bg-[hsl(var(--app-sidebar-hover-background))] hover:text-[hsl(var(--app-sidebar-foreground))]'
                  )}
                  title={isEffectivelyExpanded ? undefined : item.label} 
                >
                  <item.icon className="h-4 w-4 shrink-0" /> 
                  {isEffectivelyExpanded && <span className="truncate">{item.label}</span>}
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
            <UserAccountMenu />
          )}
          <button
            onClick={handleAvatarClick}
            className={cn(
              "flex w-full items-center gap-3 text-left text-sm font-medium transition-colors",
              "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-0 focus-visible:ring-offset-[hsl(var(--app-sidebar-background))]",
              isEffectivelyExpanded ? "p-3 h-[60px]" : "justify-center h-[60px] w-full px-[calc((48px-32px)/2)]", 
              isUserAccountMenuExpanded && isEffectivelyExpanded 
                ? 'bg-[hsl(var(--app-sidebar-active-background))] text-[hsl(var(--app-sidebar-active-foreground))]'
                : 'hover:bg-[hsl(var(--app-sidebar-hover-background))] hover:text-[hsl(var(--app-sidebar-foreground))]'
            )}
            aria-label="User account menu"
          >
            <Image
              src="https://picsum.photos/seed/useravatar/64/64" 
              alt="User Avatar"
              width={32} 
              height={32} 
              className="rounded-full shrink-0 h-8 w-8" 
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
        </div>
      </aside>
      </TooltipProvider>
    </>
  );
};

export default AppSidebar;
