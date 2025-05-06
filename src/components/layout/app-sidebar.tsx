
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
      if (!mobile && isSidebarOpen && !isSidebarPinned && !isUserAccountMenuExpanded) { // Desktop, unpinned, open (likely due to hover)
        // This scenario should not persist if hover-to-open is removed.
        // For now, if it occurs, and menu is not open, it implies an old hover state.
        // closeSidebarCompletely(); // Re-evaluating this based on hover only darkening
      }
    };
    checkMobile();
    window.addEventListener('resize', checkMobile);
    return () => window.removeEventListener('resize', checkMobile);
  }, [isSidebarOpen, isSidebarPinned, isUserAccountMenuExpanded, closeSidebarCompletely]);


  React.useEffect(() => {
    if (isClientMobile && isSidebarOpen && pathname) {
      // Mobile sidebar closes on navigation handled by individual link clicks
    }
  }, [pathname, isClientMobile, isSidebarOpen]);

  const handleMouseEnter = () => {
    if (!isClientMobile && !isSidebarPinned && !isSidebarOpen) { 
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
      if (!isSidebarOpen) { 
        toggleMobileSidebar(); 
        openUserAccountMenuSimple(); 
      } else { 
        toggleUserAccountMenuSimple(); 
      }
    } else { 
      handleUserMenuToggle(); 
    }
  };
  
  const effectiveIsSidebarOpenForTextAndHeader = isClientMobile ? isSidebarOpen : isSidebarPinned || isUserAccountMenuExpanded;
  const desktopSidebarWidth = (isSidebarPinned || isUserAccountMenuExpanded) ? 'md:w-[287px]' : 'md:w-[48px]';
  const mobileSidebarTranslate = isSidebarOpen ? 'translate-x-0' : '-translate-x-full';

  const sidebarClasses = cn(
    'fixed inset-y-0 left-0 z-40 flex flex-col bg-[hsl(var(--app-sidebar-background))] border-r border-[hsl(var(--app-sidebar-border))] transition-all duration-300 ease-in-out shadow-lg',
    isClientMobile ? 'w-full max-w-[287px]' : desktopSidebarWidth,
    isClientMobile ? mobileSidebarTranslate : 'md:translate-x-0 md:relative',
    (isHovering && !isSidebarPinned && !isClientMobile && !isSidebarOpen && !isUserAccountMenuExpanded) && 'bg-[hsl(var(--app-sidebar-hover-background))]'
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
        <div className="flex flex-col flex-grow overflow-y-auto">
          <div className={cn(
            "flex items-center border-b border-[hsl(var(--app-sidebar-border))] h-[60px] shrink-0",
            effectiveIsSidebarOpenForTextAndHeader ? "px-4 justify-between" : "px-[calc((48px-28px)/2)] justify-center md:justify-start md:px-0" 
          )}>
            {(effectiveIsSidebarOpenForTextAndHeader) && (
              <Link href="/" className="flex items-center gap-2 text-lg font-semibold text-primary shrink-0">
                  <ChefHat className="h-7 w-7" /> {/* App Icon 28x28 */}
                  <span>RecipeSage</span>
              </Link>
            )}
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

            {isClientMobile && isSidebarOpen && (
              <Button
                  variant="ghost"
                  size="icon"
                  onClick={toggleMobileSidebar} 
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
                    closeSidebarCompletely(); 
                  }
                }}
                className={cn(
                  'flex items-center gap-3 rounded-lg text-sm font-medium transition-all',
                  effectiveIsSidebarOpenForTextAndHeader ? 'px-3 py-2.5 w-full' : 'justify-center w-8 h-9 p-0.5', // Collapsed: 32x36 clickable area
                  pathname === item.href
                    ? 'bg-[hsl(var(--app-sidebar-active-background))] text-[hsl(var(--app-sidebar-active-foreground))]'
                    : 'text-[hsl(var(--app-sidebar-foreground))] hover:bg-[hsl(var(--app-sidebar-hover-background))] hover:text-primary'
                )}
                title={effectiveIsSidebarOpenForTextAndHeader ? "" : item.label} 
              >
                <item.icon className="h-7 w-7 shrink-0" /> {/* Nav Icon 28x28 */}
                {effectiveIsSidebarOpenForTextAndHeader && <span>{item.label}</span>}
              </Link>
            ))}
          </nav>
        </div>

        <div className="mt-auto border-t border-[hsl(var(--app-sidebar-border))]">
          {isUserAccountMenuExpanded && effectiveIsSidebarOpenForTextAndHeader && (
            <div className="bg-card"> 
              <UserAccountMenu />
            </div>
          )}
          <button
            onClick={handleAvatarClick}
            className={cn(
              "flex w-full items-center gap-3 text-left text-sm font-medium transition-colors hover:bg-[hsl(var(--app-sidebar-hover-background))]",
              effectiveIsSidebarOpenForTextAndHeader ? "p-3 h-[60px]" : "justify-center h-[60px] p-[calc((48px-28px)/2)]", 
              isUserAccountMenuExpanded && effectiveIsSidebarOpenForTextAndHeader && 'bg-muted' 
            )}
            aria-label="User account menu"
          >
            <Image
              src="https://picsum.photos/seed/useravatar/40/40"
              alt="User Avatar"
              width={28} // Profile Image 28x28
              height={28} // Profile Image 28x28
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
