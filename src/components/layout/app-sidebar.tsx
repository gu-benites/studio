
"use client";

import type { LucideIcon } from 'lucide-react';
import {
  PanelLeft,
  PanelLeftClose,
  Home,
  ChefHat,
  Palette,
  LoaderCircle,
  FlaskConical, // Added icon for Dilution Calculator
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
  { href: '/dilution-calculator', icon: FlaskConical, label: 'Dilution Calculator' }, // Added new item
  { href: '/design-system', icon: Palette, label: 'Design System' },
  { href: '/loading-state', icon: LoaderCircle, label: 'Loading State' },
];


const AppSidebar: React.FC = () => {
  const { 
    isSidebarOpen: contextSidebarOpen,
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
  const [hasMounted, setHasMounted] = React.useState(false);


  React.useEffect(() => {
    setHasMounted(true);
    const checkMobile = () => {
      const mobile = window.innerWidth < 768;
      setIsClientMobile(mobile);
    };
    checkMobile();
    window.addEventListener('resize', checkMobile);
    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  const currentIsSidebarOpen = hasMounted ? contextSidebarOpen : false;
  const currentIsSidebarPinned = hasMounted ? isSidebarPinned : false;
  const currentIsUserAccountMenuExpanded = hasMounted ? isUserAccountMenuExpanded : false;

  const handleMouseEnter = () => {
    if (hasMounted && !isClientMobile && !currentIsSidebarOpen) { 
      if (hoverTimeoutRef.current) clearTimeout(hoverTimeoutRef.current);
      setIsHovering(true);
    }
  };

  const handleMouseLeave = () => {
    if (hasMounted && !isClientMobile) { 
      hoverTimeoutRef.current = setTimeout(() => setIsHovering(false), 100);
    }
  };
  
  React.useEffect(() => {
    return () => {
      if (hoverTimeoutRef.current) clearTimeout(hoverTimeoutRef.current);
    };
  }, []);

  const isDesktopClient = hasMounted && !isClientMobile;
  
  const isDesktopExpanded = isDesktopClient && (currentIsSidebarPinned || currentIsUserAccountMenuExpanded);
  const isMobileExpanded = hasMounted && isClientMobile && currentIsSidebarOpen;
  const isEffectivelyExpanded = isDesktopExpanded || isMobileExpanded;
  
  const desktopSidebarWidth = isDesktopExpanded ? 'md:w-[287px]' : 'md:w-[48px]';
  const mobileSidebarTranslate = currentIsSidebarOpen ? 'translate-x-0' : '-translate-x-full';

  const sidebarOuterClasses = cn(
    'fixed inset-y-0 left-0 z-40 h-full', 
    'transition-all duration-300 ease-in-out',
    isHovering && isDesktopClient && !isEffectivelyExpanded && !currentIsSidebarPinned ? 'shadow-xl' : 'shadow-lg',
    isDesktopClient ? desktopSidebarWidth : `w-full max-w-[287px] ${mobileSidebarTranslate}`
  );
  
  const sidebarInnerClasses = cn(
    "flex flex-col h-full", 
    "text-[hsl(var(--app-sidebar-foreground))] border-r border-[hsl(var(--app-sidebar-border))]",
    "transition-colors duration-300 ease-in-out", 
    isHovering && isDesktopClient && !isEffectivelyExpanded && !currentIsSidebarPinned ? 'bg-[hsl(var(--app-sidebar-hover-background))]' : 'bg-[hsl(var(--app-sidebar-background))]',
    !isClientMobile && !isEffectivelyExpanded && "overflow-x-hidden" 
  );

  const handleAvatarClick = () => {
    if (isClientMobile) {
      if (!currentIsSidebarOpen) { 
        toggleMobileSidebar(); 
        setTimeout(() => openUserAccountMenuSimple(), 50); 
      } else { 
        toggleUserAccountMenuSimple();
      }
    } else { 
      handleUserMenuToggle();
    }
  };


  if (!hasMounted) { 
    const collapsedSidebarClasses = cn(
      'fixed inset-y-0 left-0 z-40 h-full md:w-[48px]',
      'flex flex-col bg-[hsl(var(--app-sidebar-background))] text-[hsl(var(--app-sidebar-foreground))] border-r border-[hsl(var(--app-sidebar-border))] shadow-lg'
    );
    return (
      <TooltipProvider delayDuration={0}>
        <aside className={collapsedSidebarClasses}>
          <div className={"flex flex-col h-full"}>
            <div className="flex items-center border-b border-[hsl(var(--app-sidebar-border))] h-[60px] shrink-0 justify-center px-[calc((48px-32px)/2)]">
              <Button variant="ghost" size="icon" className="h-9 w-9 hover:bg-[hsl(var(--app-sidebar-hover-background))] hover:text-[hsl(var(--app-sidebar-foreground))]">
                <PanelLeft className="h-5 w-5" />
              </Button>
            </div>
            <nav className="flex-grow py-4 space-y-1 px-[calc((48px-32px)/2)] overflow-y-auto overflow-x-hidden">
              {mainNavItems.map(item => (
                <div key={item.label}>
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <Link 
                        href={item.href} 
                        className="flex justify-center items-center w-8 h-9 p-0 rounded-lg text-[hsl(var(--app-sidebar-foreground))] hover:bg-[hsl(var(--app-sidebar-hover-background))]" 
                        title={item.label}
                        onClick={() => {}}
                      >
                        <item.icon className="h-4 w-4 shrink-0" />
                      </Link>
                    </TooltipTrigger>
                    <TooltipContent side="right" sideOffset={8}><p>{item.label}</p></TooltipContent>
                  </Tooltip>
                </div>
              ))}
            </nav>
            <div className="mt-auto border-t border-[hsl(var(--app-sidebar-border))] shrink-0">
              <button className="flex w-full items-center justify-center h-[60px] px-[calc((48px-32px)/2)] hover:bg-[hsl(var(--app-sidebar-hover-background))]">
                <Image src="https://picsum.photos/seed/useravatar/64/64" alt="User Avatar" width={32} height={32} className="rounded-full shrink-0" data-ai-hint="profile avatar" />
              </button>
            </div>
          </div>
        </aside>
      </TooltipProvider>
    );
  }
  

  return (
    <>
      {isClientMobile && currentIsSidebarOpen && (
          <div 
              onClick={toggleMobileSidebar} 
              className="fixed inset-0 z-30 bg-black/50 md:hidden"
              aria-hidden="true"
          />
      )}
      <TooltipProvider delayDuration={0}>
      <aside 
        className={sidebarOuterClasses}
        onMouseEnter={handleMouseEnter}
        onMouseLeave={handleMouseLeave}
      >
        <div className={sidebarInnerClasses}>
          <div className={cn(
            "flex items-center border-b border-[hsl(var(--app-sidebar-border))] h-[60px] shrink-0", 
            isEffectivelyExpanded 
              ? "px-3 gap-3" 
              : "justify-center px-[calc((48px-32px)/2)]" 
          )}>
            <Button
                variant="ghost"
                size="icon" 
                onClick={isClientMobile ? toggleMobileSidebar : toggleDesktopSidebarPin}
                className={cn(
                    "h-9 w-9 shrink-0", 
                    "hover:bg-[hsl(var(--app-sidebar-hover-background))] hover:text-[hsl(var(--app-sidebar-foreground))]",
                    "focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-[hsl(var(--app-sidebar-background))]"
                )}
                aria-label={
                  isClientMobile 
                    ? (currentIsSidebarOpen ? 'Close sidebar' : 'Open sidebar')
                    : (currentIsSidebarPinned ? 'Unpin and collapse sidebar' : 'Pin and expand sidebar')
                }
            >
              {isEffectivelyExpanded ? <PanelLeftClose className="h-5 w-5" /> : <PanelLeft className="h-5 w-5" />}
            </Button>

            {isEffectivelyExpanded && ( 
              <Link 
                href="/" 
                className="flex items-center gap-2 text-lg font-semibold text-primary overflow-hidden"
                onClick={() => { if (isClientMobile) closeSidebarCompletely();}}
              >
                <ChefHat className="h-4 w-4 shrink-0" />
                <span className="truncate">RecipeSage</span>
              </Link>
            )}
          </div>
          
          <nav className={cn(
            "flex-grow py-4 space-y-1", 
            "overflow-y-auto", 
            isEffectivelyExpanded ? "px-3" : "px-[calc((48px-32px)/2)]"
            )}>
            {mainNavItems.map((item) => {
              const navLinkContent = (
                <Link
                  href={item.href}
                  onClick={() => { 
                    if (isClientMobile && currentIsSidebarOpen) {
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
        
          <div className="mt-auto border-t border-[hsl(var(--app-sidebar-border))] shrink-0"> 
            {currentIsUserAccountMenuExpanded && isEffectivelyExpanded && (
              <UserAccountMenu />
            )}
            <TooltipProvider delayDuration={(isDesktopClient && !isEffectivelyExpanded) ? 0 : 999999}>
              <Tooltip>
                <TooltipTrigger asChild>
                  <button
                    onClick={handleAvatarClick}
                    className={cn(
                      "flex w-full items-center gap-3 text-left text-sm font-medium transition-colors",
                      "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-0 focus-visible:ring-offset-[hsl(var(--app-sidebar-background))]",
                      isEffectivelyExpanded ? "p-3 h-[60px]" : "justify-center h-[60px] w-full px-[calc((48px-32px)/2)]", 
                      currentIsUserAccountMenuExpanded && isEffectivelyExpanded 
                        ? 'bg-[hsl(var(--app-sidebar-active-background))] text-[hsl(var(--app-sidebar-active-foreground))]'
                        : 'hover:bg-[hsl(var(--app-sidebar-hover-background))] hover:text-[hsl(var(--app-sidebar-foreground))]'
                    )}
                    aria-label="Open user menu" 
                  >
                    <Image
                      src="https://picsum.photos/seed/useravatar/64/64" 
                      alt="User Avatar"
                      width={32} 
                      height={32} 
                      className="rounded-full shrink-0" 
                      data-ai-hint="profile avatar"
                    />
                    {isEffectivelyExpanded && (
                      <div className="flex flex-col overflow-hidden">
                        <span className="truncate">User Name</span>
                        <span className={cn(
                          "text-xs truncate",
                          currentIsUserAccountMenuExpanded && isEffectivelyExpanded ? 'opacity-80' : 'text-muted-foreground'
                        )}>user@example.com</span>
                      </div>
                    )}
                  </button>
                </TooltipTrigger>
                {(isDesktopClient && !isEffectivelyExpanded) && (
                   <TooltipContent side="right" sideOffset={8}>
                     <p>User Name</p>
                     <p className="text-xs text-muted-foreground">user@example.com</p>
                   </TooltipContent>
                )}
              </Tooltip>
            </TooltipProvider>
          </div>
        </div>
      </aside>
      </TooltipProvider>
    </>
  );
};

export default AppSidebar;
