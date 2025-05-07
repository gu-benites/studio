"use client";

import type { LucideIcon } from 'lucide-react';
import {
  PanelLeft,
  PanelLeftClose,
  Home,
  ChefHat,
  Settings, // Keep for settings page navigation if it's a main feature
  CreditCard, // Keep for billing/subscription if it's a main feature
  Palette,
  LoaderCircle,
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
  isUserMenuRelated?: boolean; // Flag to identify items that should only be in user menu
}

const mainNavItems: NavItem[] = [
  { href: '/', icon: Home, label: 'Recipe Generator' },
  // { href: '/settings', icon: Settings, label: 'Settings', isUserMenuRelated: true }, // Moved to UserAccountMenu
  // { href: '/billing', icon: CreditCard, label: 'Billing', isUserMenuRelated: true }, // Example, if billing has a top-level page
  { href: '/design-system', icon: Palette, label: 'Design System' },
  { href: '/loading-state', icon: LoaderCircle, label: 'Loading State' },
];

const AppSidebar: React.FC = () => {
  const { 
    isSidebarOpen, 
    isSidebarPinned, 
    toggleDesktopSidebarPin, 
    toggleMobileSidebar,
    closeSidebarCompletely, // Used for mobile nav clicks
    isUserAccountMenuExpanded,
    handleUserMenuToggle, // Main handler for avatar click / user menu related close actions
    openUserAccountMenuSimple, // For mobile, when sidebar is already open
    toggleUserAccountMenuSimple, // For mobile, when sidebar is already open
  } = useUIState();

  const pathname = usePathname();
  const [isClientMobile, setIsClientMobile] = React.useState(false);
  const [isHovering, setIsHovering] = React.useState(false);
  const hoverTimeoutRef = React.useRef<NodeJS.Timeout | null>(null);


  React.useEffect(() => {
    const checkMobile = () => {
      const mobile = window.innerWidth < 768;
      setIsClientMobile(mobile);
      // If transitioning from desktop to mobile and sidebar was pinned, unpin it.
      if (mobile && isSidebarPinned) {
         // No direct unpin action, rely on context's logic if needed or just visual change
      }
    };
    checkMobile(); // Initial check
    window.addEventListener('resize', checkMobile);
    return () => window.removeEventListener('resize', checkMobile);
  }, [isSidebarPinned]);


  const handleMouseEnter = () => {
    if (!isClientMobile && !isSidebarPinned && !isSidebarOpen && !isUserAccountMenuExpanded) { 
      if (hoverTimeoutRef.current) clearTimeout(hoverTimeoutRef.current);
      setIsHovering(true);
    }
  };

  const handleMouseLeave = () => {
    if (!isClientMobile && !isSidebarPinned && !isSidebarOpen && !isUserAccountMenuExpanded) {
      hoverTimeoutRef.current = setTimeout(() => setIsHovering(false), 100); // Small delay to prevent flickering
    }
  };
  
  React.useEffect(() => {
    // Cleanup timeout on unmount
    return () => {
      if (hoverTimeoutRef.current) clearTimeout(hoverTimeoutRef.current);
    };
  }, []);

  // Determine if sidebar should be visually expanded
  // Desktop: expanded if pinned OR if user account menu is open
  // Mobile: expanded if isSidebarOpen (drawer is open)
  const isDesktopExpanded = !isClientMobile && (isSidebarPinned || isUserAccountMenuExpanded);
  const isMobileExpanded = isClientMobile && isSidebarOpen;
  const isEffectivelyExpanded = isDesktopExpanded || isMobileExpanded;

  // Width classes for desktop
  const desktopSidebarWidth = isDesktopExpanded ? 'md:w-[287px]' : 'md:w-[48px]';
  // Translate class for mobile drawer
  const mobileSidebarTranslate = isSidebarOpen ? 'translate-x-0' : '-translate-x-full';

  const sidebarClasses = cn(
    'fixed inset-y-0 left-0 z-40 flex flex-col bg-[hsl(var(--app-sidebar-background))] text-[hsl(var(--app-sidebar-foreground))] border-r border-[hsl(var(--app-sidebar-border))] transition-all duration-300 ease-in-out shadow-lg',
    // Width: mobile uses full width up to max, desktop uses specific widths
    isClientMobile ? 'w-full max-w-[287px]' : desktopSidebarWidth,
    // Positioning: mobile slides, desktop is relative (part of layout flow) or fixed if overlay
    isClientMobile ? mobileSidebarTranslate : 'md:translate-x-0 md:relative',
    // Hover effect for unpinned, collapsed desktop sidebar (not when user menu is open)
    (isHovering && !isDesktopExpanded && !isClientMobile && !isUserAccountMenuExpanded) && 'bg-[hsl(var(--app-sidebar-hover-background))]'
  );
  
  const handleAvatarClick = () => {
    if (isClientMobile) {
      // If mobile sidebar is closed, first open it, then open the menu.
      // If mobile sidebar is open, just toggle the menu.
      if (!isSidebarOpen) { // Mobile sidebar is closed
        toggleMobileSidebar(); // This opens the drawer
        setTimeout(() => openUserAccountMenuSimple(), 50); // Then open menu inside after drawer animates
      } else { // Mobile sidebar is already open
        toggleUserAccountMenuSimple(); // Just toggle the menu section
      }
    } else { // Desktop
      handleUserMenuToggle(); // This handles opening menu AND pinning/expanding sidebar
    }
  };
  

  return (
    <>
      {/* Overlay for mobile when sidebar is open */}
      {isClientMobile && isSidebarOpen && (
          <div 
              onClick={toggleMobileSidebar} 
              className="fixed inset-0 z-30 bg-black/50 md:hidden"
              aria-hidden="true"
          />
      )}
      <TooltipProvider delayDuration={0}>
      <aside 
        className={sidebarClasses}
        onMouseEnter={handleMouseEnter}
        onMouseLeave={handleMouseLeave}
      >
        <div className={cn(
          "flex flex-col flex-grow overflow-y-auto",
           // Prevent horizontal scroll on collapsed desktop sidebar
           !isClientMobile && !isEffectivelyExpanded && "overflow-x-hidden"
        )}>
          {/* Sidebar Header */}
          <div className={cn(
            "flex items-center border-b border-[hsl(var(--app-sidebar-border))] h-[60px] shrink-0",
            // If expanded (desktop or mobile), add padding and gap
            isEffectivelyExpanded 
              ? "px-3 gap-3" 
              : "justify-center px-[calc((48px-32px)/2)]" // Centered toggle icon when collapsed
          )}>
             {/* Toggle Button: Positioned first for consistent layout */}
            <Button
                variant="ghost"
                size="icon" // Uses 40x40, icon inside is smaller
                onClick={isClientMobile ? toggleMobileSidebar : toggleDesktopSidebarPin}
                className={cn(
                    "h-9 w-9 shrink-0", // Ensures button is 36x36
                    "hover:bg-[hsl(var(--app-sidebar-hover-background))] hover:text-[hsl(var(--app-sidebar-foreground))]",
                    "focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-[hsl(var(--app-sidebar-background))]"
                )}
                aria-label={
                  isClientMobile 
                    ? (isSidebarOpen ? 'Close sidebar' : 'Open sidebar')
                    : (isSidebarPinned ? 'Unpin and collapse sidebar' : 'Pin and expand sidebar')
                }
            >
              {/* Icon changes based on state (expanded/pinned or mobile open state) */}
              {isEffectivelyExpanded ? <PanelLeftClose className="h-5 w-5" /> : <PanelLeft className="h-5 w-5" />}
            </Button>

            {/* Logo and App Name: Only shown when sidebar is effectively expanded */}
            {isEffectivelyExpanded && ( 
              <Link 
                href="/" 
                className="flex items-center gap-2 text-lg font-semibold text-primary overflow-hidden"
                onClick={() => { if (isClientMobile) closeSidebarCompletely();}}
              >
                <ChefHat className="h-4 w-4 shrink-0" /> {/* Icon size 16x16 */}
                <span className="truncate">RecipeSage</span>
              </Link>
            )}
          </div>
          
          {/* Main Navigation */}
          <nav className={cn(
            "flex-grow py-4 space-y-1", 
            // Padding adjusts based on expanded state
            isEffectivelyExpanded ? "px-3" : "px-[calc((48px-32px)/2)]" // (48px total - 32px icon area) / 2 = 8px padding
            )}>
            {mainNavItems.filter(item => !item.isUserMenuRelated).map((item) => {
              // Content of the nav link (icon + optional label)
              const navLinkContent = (
                <Link
                  href={item.href}
                  onClick={() => { 
                    // On mobile, clicking a nav item should close the entire sidebar
                    if (isClientMobile && isSidebarOpen) {
                      closeSidebarCompletely(); 
                    }
                  }}
                  className={cn(
                    'flex items-center gap-3 rounded-lg text-sm font-medium transition-all',
                    'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-1 focus-visible:ring-offset-[hsl(var(--app-sidebar-background))]',
                    // Expanded: full width, padding. Collapsed: centered icon, fixed size for 32x36 clickable area.
                    isEffectivelyExpanded ? 'px-3 py-2.5 w-full' : 'justify-center w-8 h-9 p-0', 
                    pathname === item.href
                      ? 'bg-[hsl(var(--app-sidebar-active-background))] text-[hsl(var(--app-sidebar-active-foreground))]'
                      : 'text-[hsl(var(--app-sidebar-foreground))] hover:bg-[hsl(var(--app-sidebar-hover-background))] hover:text-[hsl(var(--app-sidebar-foreground))]'
                  )}
                  title={isEffectivelyExpanded ? undefined : item.label} // Tooltip only when collapsed
                >
                  <item.icon className="h-4 w-4 shrink-0" /> {/* Icon size 16x16 */}
                  {isEffectivelyExpanded && <span className="truncate">{item.label}</span>}
                </Link>
              );

              return (
                <div key={item.label}>
                  {isEffectivelyExpanded ? (
                    navLinkContent // No tooltip needed if expanded
                  ) : (
                    // Tooltip for collapsed desktop sidebar items
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

        {/* Sidebar Footer: User Account Section */}
        <div className="mt-auto border-t border-[hsl(var(--app-sidebar-border))]">
          {/* User Account Menu: Rendered if expanded state is true for current view (desktop/mobile) */}
          {isUserAccountMenuExpanded && isEffectivelyExpanded && (
            <UserAccountMenu />
          )}
          {/* Avatar Button: Always visible, triggers menu */}
          {/* Tooltip for avatar is removed */}
          <button
            onClick={handleAvatarClick}
            className={cn(
              "flex w-full items-center gap-3 text-left text-sm font-medium transition-colors",
              "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-0 focus-visible:ring-offset-[hsl(var(--app-sidebar-background))]", // Adjusted offset for better focus ring visibility
              // Styling for expanded vs collapsed state
              isEffectivelyExpanded ? "p-3 h-[60px]" : "justify-center h-[60px] w-full px-[calc((48px-32px)/2)]", 
              // Active state styling if menu is open and sidebar is expanded
              isUserAccountMenuExpanded && isEffectivelyExpanded 
                ? 'bg-[hsl(var(--app-sidebar-active-background))] text-[hsl(var(--app-sidebar-active-foreground))]'
                : 'hover:bg-[hsl(var(--app-sidebar-hover-background))] hover:text-[hsl(var(--app-sidebar-foreground))]'
            )}
            aria-label="Open user menu" 
          >
            <Image
              src="https://picsum.photos/seed/useravatar/64/64" // Original image size, next/image will handle display size
              alt="User Avatar"
              width={32} // Desired display width
              height={32} // Desired display height
              className="rounded-full shrink-0" // Removed h-8 w-8, rely on props.
              data-ai-hint="profile avatar"
            />
            {/* User Info: Only shown when sidebar is effectively expanded */}
            {isEffectivelyExpanded && (
              <div className="flex flex-col overflow-hidden">
                <span className="truncate">User Name</span>
                <span className={cn(
                  "text-xs truncate",
                  // Different muted color if menu is active
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