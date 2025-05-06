"use client";

import type { LucideIcon } from 'lucide-react';
import {
  PanelLeft,
  PanelLeftClose,
  Home,
  ChefHat,
  X, // Import X for mobile close
} from 'lucide-react';
import Link from 'next/link';
import Image from 'next/image';
import { usePathname } from 'next/navigation';
import * as React from 'react';

import { useUIState } from '@/contexts/UIStateContext';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { UserAccountMenu } from '@/components/user-account-menu';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';

interface NavItem {
  href: string;
  icon: LucideIcon;
  label: string;
}

// Main navigation items - Settings and Billing/Subscription removed
const mainNavItems: NavItem[] = [
  { href: '/', icon: Home, label: 'Recipe Generator' },
  // Add other main navigation items here if any
];

const AppSidebar: React.FC = () => {
  const { 
    isSidebarOpen, 
    isSidebarPinned, 
    toggleDesktopSidebarPin, 
    toggleMobileSidebar,
    closeSidebarCompletely,
    setActiveUserMenuSubItem 
  } = useUIState();
  const pathname = usePathname();
  const [isUserMenuOpen, setIsUserMenuOpen] = React.useState(false);
  const [isClientMobile, setIsClientMobile] = React.useState(false);

  React.useEffect(() => {
    const checkMobile = () => setIsClientMobile(window.innerWidth < 768); // Tailwind 'md' breakpoint is 768px
    checkMobile();
    window.addEventListener('resize', checkMobile);
    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  React.useEffect(() => {
    if (!isSidebarOpen) {
      setIsUserMenuOpen(false);
      // activeUserMenuSubItem is reset by context actions (toggleMobileSidebar, toggleDesktopSidebarPin)
    }
  }, [isSidebarOpen]);

  // Close mobile sidebar on route change if it's open and not behaving like a pinned desktop sidebar
  React.useEffect(() => {
    if (isClientMobile && isSidebarOpen) {
      closeSidebarCompletely();
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [pathname, isClientMobile]); // closeSidebarCompletely and isSidebarOpen are stable or handled by context

  const showText = isClientMobile ? isSidebarOpen : isSidebarPinned;
  const desktopSidebarWidth = isSidebarPinned ? 'md:w-[287px]' : 'md:w-[68px]';
  const mobileSidebarTranslate = isSidebarOpen ? 'translate-x-0' : '-translate-x-full';

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
      <aside
        className={cn(
          // Common styles
          'fixed inset-y-0 left-0 z-40 flex flex-col bg-card border-r border-app-sidebar-border transition-transform duration-300 ease-in-out',
          // Mobile specific styles (drawer)
          'w-full max-w-[287px]', // Max width for mobile drawer
          mobileSidebarTranslate, // Controls visibility on mobile
          // Desktop specific styles
          'md:translate-x-0 md:relative md:max-w-none', // Desktop: part of layout flow
          desktopSidebarWidth // Desktop: dynamic width
        )}
      >
        <div className="flex flex-col flex-grow">
          {/* Top section: Logo and Toggles */}
          <div className={cn(
            "flex items-center border-b border-app-sidebar-border h-[60px] shrink-0", // shrink-0 to prevent shrinking
            showText ? "px-4 justify-between" : "px-[10px] justify-center"
          )}>
            {/* Logo/Title - visible when sidebar should show text */}
            {showText && (
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
                "hidden md:inline-flex transition-colors hover:bg-app-sidebar-hover-background",
                !isSidebarPinned && "mx-auto" // Centered if collapsed (unpinned) on desktop
              )}
              aria-label={isSidebarPinned ? 'Unpin and close sidebar' : 'Open and pin sidebar'}
            >
              {isSidebarPinned ? <PanelLeftClose className="h-5 w-5" /> : <PanelLeft className="h-5 w-5" />}
            </Button>

            {/* Mobile Close Button (visible only when sidebar is open on mobile) */}
            {isClientMobile && isSidebarOpen && (
              <Button
                  variant="ghost"
                  size="icon"
                  onClick={toggleMobileSidebar} // This will close it
                  className="md:hidden" // Ensure it's only on mobile
                  aria-label="Close sidebar"
              >
                  <X className="h-5 w-5" />
              </Button>
            )}
          </div>
          
          <nav className="flex-grow px-3 py-4 space-y-2">
            {mainNavItems.map((item) => (
              <Link
                key={item.label}
                href={item.href}
                onClick={() => { if (isClientMobile && isSidebarOpen) toggleMobileSidebar(); }} // Close mobile sidebar on nav
                className={cn(
                  'flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-all',
                  pathname === item.href
                    ? 'bg-app-sidebar-active-background text-app-sidebar-active-foreground'
                    : 'text-app-sidebar-foreground hover:bg-app-sidebar-hover-background hover:text-primary',
                  !showText && 'justify-center' // Center icon if label is hidden
                )}
                title={showText ? "" : item.label}
              >
                <item.icon className={cn("h-5 w-5 shrink-0", !showText && "mx-auto")} />
                {showText && <span>{item.label}</span>}
              </Link>
            ))}
          </nav>
        </div>

        <div className="mt-auto border-t border-app-sidebar-border p-3">
          <Popover open={isUserMenuOpen} onOpenChange={(open) => {
            setIsUserMenuOpen(open);
            if (!open) {
              setActiveUserMenuSubItem(null); // Close any sub-menu when main user menu closes
            }
          }}>
            <PopoverTrigger asChild>
              <button
                className={cn(
                  "flex w-full items-center gap-3 rounded-lg p-2 text-left text-sm font-medium transition-colors hover:bg-app-sidebar-hover-background",
                  !showText && "justify-center"
                )}
                aria-label="User account menu"
              >
                <Image
                  src="https://picsum.photos/seed/useravatar/40/40"
                  alt="User Avatar"
                  width={32}
                  height={32}
                  className="rounded-full shrink-0"
                  data-ai-hint="profile avatar"
                />
                {showText && (
                  <div className="flex flex-col overflow-hidden">
                    <span className="text-app-sidebar-foreground truncate">User Name</span>
                    <span className="text-xs text-muted-foreground truncate">user@example.com</span>
                  </div>
                )}
              </button>
            </PopoverTrigger>
            <PopoverContent 
              side="top" 
              align={showText ? "start" : "center"} 
              className="w-60 p-0 mb-2"
              style={{ marginLeft: showText ? '10px' : '58px'}}
            >
              <UserAccountMenu />
            </PopoverContent>
          </Popover>
        </div>
      </aside>
    </>
  );
};

export default AppSidebar;