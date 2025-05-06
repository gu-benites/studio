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
    openUserAccountMenu,
    closeUserAccountMenu,
    toggleUserAccountMenu,
  } = useUIState();
  const pathname = usePathname();
  const [isClientMobile, setIsClientMobile] = React.useState(false);
  const [isHovering, setIsHovering] = React.useState(false);
  const hoverTimeoutRef = React.useRef<NodeJS.Timeout | null>(null);


  React.useEffect(() => {
    const checkMobile = () => setIsClientMobile(window.innerWidth < 768);
    checkMobile();
    window.addEventListener('resize', checkMobile);
    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  React.useEffect(() => {
    if (isClientMobile && isSidebarOpen && pathname) { // Added pathname to dependencies
      // Check if user account menu should also close or if navigation implies it
      // For now, closeSidebarCompletely handles user menu closure too
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
      hoverTimeoutRef.current = setTimeout(() => setIsHovering(false), 300);
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
        toggleMobileSidebar(); // This will open the sidebar
        openUserAccountMenu(); // And open the menu
      } else { // Mobile sidebar is already open
        toggleUserAccountMenu();
      }
    } else { // Desktop
      if (!isSidebarPinned) { 
        toggleDesktopSidebarPin(); // This pins and expands the sidebar
        openUserAccountMenu();     // And open the menu
      } else { // Desktop sidebar is pinned and expanded
        toggleUserAccountMenu();
      }
    }
  };

  const showText = isSidebarPinned || (isClientMobile && isSidebarOpen);
  const desktopSidebarWidth = isSidebarPinned ? 'md:w-[287px]' : 'md:w-[48px]';
  const mobileSidebarTranslate = isSidebarOpen ? 'translate-x-0' : '-translate-x-full';

  const sidebarClasses = cn(
    'fixed inset-y-0 left-0 z-40 flex flex-col bg-card border-r border-app-sidebar-border transition-all duration-300 ease-in-out',
    isClientMobile ? 'w-full max-w-[287px]' : desktopSidebarWidth,
    isClientMobile ? mobileSidebarTranslate : 'md:translate-x-0 md:relative',
    (isHovering && !isSidebarPinned && !isClientMobile) && 'bg-app-sidebar-hover-background'
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
      <aside className={sidebarClasses} onMouseEnter={handleMouseEnter} onMouseLeave={handleMouseLeave}>
        <div className="flex flex-col flex-grow overflow-y-auto"> {/* Added overflow-y-auto */}
          <div className={cn(
            "flex items-center border-b border-app-sidebar-border h-[60px] shrink-0",
            showText ? "px-4 justify-between" : "px-[10px] justify-center md:justify-start md:px-0" // adjust px for collapsed desktop
          )}>
            {showText && (
              <Link href="/" className="flex items-center gap-2 text-lg font-semibold text-primary shrink-0">
                  <ChefHat className="h-7 w-7" />
                  <span>RecipeSage</span>
              </Link>
            )}
             {/* Desktop Pin/Unpin: Aligned to the right when text is shown, centered otherwise OR at start */}
            <Button
              variant="ghost"
              size="icon"
              onClick={toggleDesktopSidebarPin}
              className={cn(
                "hidden md:inline-flex transition-colors hover:bg-app-sidebar-hover-background",
                showText ? "ml-auto" : "mx-auto w-full h-full flex items-center justify-center rounded-none" // Centered if collapsed
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
                  className="md:hidden"
                  aria-label="Close sidebar"
              >
                  <X className="h-5 w-5" />
              </Button>
            )}
          </div>
          
          <nav className={cn("flex-grow py-4 space-y-1", showText ? "px-3" : "px-[calc((48px-32px)/2)]")}>
            {mainNavItems.map((item) => (
              <Link
                key={item.label}
                href={item.href}
                onClick={() => { if (isClientMobile && isSidebarOpen) toggleMobileSidebar(); }}
                className={cn(
                  'flex items-center gap-3 rounded-lg text-sm font-medium transition-all',
                  showText ? 'px-3 py-2.5' : 'justify-center w-8 h-9 p-0.5', // w-8 (32px), h-9 (36px), p-0.5 for icon centering
                  pathname === item.href
                    ? 'bg-app-sidebar-active-background text-app-sidebar-active-foreground'
                    : 'text-app-sidebar-foreground hover:bg-app-sidebar-hover-background hover:text-primary'
                )}
                title={showText ? "" : item.label}
              >
                <item.icon className="h-7 w-7 shrink-0" /> {/* Icon size 28x28 */}
                {showText && <span>{item.label}</span>}
              </Link>
            ))}
          </nav>
        </div>

        {/* User Account Section - Integrated */}
        <div className="mt-auto border-t border-app-sidebar-border">
          {isUserAccountMenuExpanded && showText && ( // Only show if sidebar is expanded enough for text
            <div className="bg-card"> {/* UserAccountMenu content will be styled by itself */}
              <UserAccountMenu />
            </div>
          )}
          <button
            onClick={handleAvatarClick}
            className={cn(
              "flex w-full items-center gap-3 text-left text-sm font-medium transition-colors hover:bg-app-sidebar-hover-background",
              showText ? "p-3" : "justify-center p-[10px] h-[48px]" // p-2.5 for 28px avatar in 48px, (48-28)/2 = 10px => p-[10px]
            )}
            aria-label="User account menu"
          >
            <Image
              src="https://picsum.photos/seed/useravatar/40/40"
              alt="User Avatar"
              width={showText ? 32 : 28} // Avatar 28x28 when collapsed
              height={showText ? 32 : 28}
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
        </div>
      </aside>
    </>
  );
};

export default AppSidebar;
