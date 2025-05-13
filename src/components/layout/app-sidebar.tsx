"use client";

import type { LucideIcon } from 'lucide-react';
import {
  PanelLeft,
  PanelLeftClose,
  Home,
  ChefHat,
  Palette,
  LoaderCircle,
  FlaskConical, 
  Settings,
  HelpCircle,
  CreditCard,
  LogOut,
  Beaker, // Added for Chemical Visualizer
  User as UserIcon
} from 'lucide-react';
import Link from 'next/link';
import Image from 'next/image';
import { usePathname } from 'next/navigation';
import * as React from 'react';
import { useState, useEffect } from 'react';

import { useUIState } from '@/contexts/UIStateContext';
import { useAuth } from '@/contexts/auth-context';
import { supabase } from '@/lib/supabase/client';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { AppNavItem, AppFooterButton } from '@/components/ui/app-nav-item';
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
  mobileOnly?: boolean; 
  desktopOnly?: boolean;
}

const mainNavItems: NavItem[] = [
  { href: '/', icon: Home, label: 'Recipe Generator' },
  { href: '/dilution-calculator', icon: FlaskConical, label: 'Dilution Calculator' },
  { href: '/chemical-visualizer', icon: Beaker, label: 'Chemical Visualizer' }, // New Item
  { href: '/design-system', icon: Palette, label: 'Design System' },
  { href: '/loading-state', icon: LoaderCircle, label: 'Loading State' },
];

const userMenuItems: NavItem[] = [
    { href: '/settings', icon: Settings, label: 'Settings' },
    { icon: CreditCard, label: 'My Subscription', onClickKey: 'subscription' },
    { icon: HelpCircle, label: 'Help Center', onClickKey: 'help' },
    { icon: LogOut, label: 'Sign Out', onClickKey: 'logout'},
] as any;


const AppSidebar = () => {
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
  
  const { user } = useAuth();
  const [avatarUrl, setAvatarUrl] = useState<string | null>(null);
  const [userName, setUserName] = useState<string>('User Name');
  const [userEmail, setUserEmail] = useState<string>('user@example.com');

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
  
  // Fetch user profile data including avatar
  useEffect(() => {
    const fetchUserProfile = async () => {
      if (!user) {
        // Reset user information when not authenticated
        setUserName('User Name');
        setUserEmail('user@example.com');
        setAvatarUrl(null);
        return;
      }
      
      try {
        // Set user name and email from auth
        const firstName = user.user_metadata?.first_name || '';
        const lastName = user.user_metadata?.last_name || '';
        setUserName(firstName && lastName ? `${firstName} ${lastName}` : 'User Name');
        setUserEmail(user.email || 'user@example.com');
        
        // Fetch avatar from profiles table
        const { data, error } = await supabase
          .from('profiles')
          .select('avatar_url')
          .eq('id', user.id)
          .single();
        
        if (error) {
          console.error('Error fetching profile:', error);
          return;
        }
        
        if (data?.avatar_url) {
          setAvatarUrl(data.avatar_url);
        }
      } catch (error) {
        console.error('Error fetching user profile:', error);
      }
    };
    
    fetchUserProfile();
  }, [user]);

  const currentIsSidebarOpen = hasMounted ? contextSidebarOpen : false;
  const currentIsSidebarPinned = hasMounted ? isSidebarPinned : false;
  const currentIsUserAccountMenuExpanded = hasMounted ? isUserAccountMenuExpanded : false;

  const handleMouseEnter = () => {
    if (hasMounted && !isClientMobile && !currentIsSidebarPinned && !currentIsUserAccountMenuExpanded) { 
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
  
  const desktopSidebarWidth = isEffectivelyExpanded ? 'md:w-[287px]' : 'md:w-[48px]';
  const mobileSidebarTranslate = currentIsSidebarOpen ? 'translate-x-0' : '-translate-x-full';

  const sidebarOuterClasses = cn(
    'fixed inset-y-0 left-0 z-40 h-full', 
    'transition-all duration-300 ease-in-out',
    isHovering && isDesktopClient && !currentIsSidebarPinned && !currentIsUserAccountMenuExpanded ? 'shadow-xl' : 'shadow-lg',
    isDesktopClient ? desktopSidebarWidth : `w-full max-w-[287px] ${mobileSidebarTranslate}`
  );
  
  const sidebarInnerClasses = cn(
    "flex flex-col h-full", 
    "text-sidebar-foreground border-r border-sidebar-border",
    "transition-colors duration-300 ease-in-out", 
    "bg-sidebar", // Base background
    !isClientMobile && !isEffectivelyExpanded && "overflow-x-hidden",
    (isDesktopClient && isHovering && !currentIsSidebarPinned && !currentIsUserAccountMenuExpanded) ? 'bg-sidebar-hover' : '',
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


  // Return a placeholder sidebar during initial mount
  if (!hasMounted) { 
    const collapsedSidebarClasses = cn(
      'fixed inset-y-0 left-0 z-40 h-full md:w-[48px]',
      'flex flex-col bg-sidebar text-sidebar-foreground border-r border-sidebar-border shadow-lg'
    );
    
    return (
      <aside className={collapsedSidebarClasses}>
        <div className="flex flex-col h-full">
          {/* Header */}
          <div className="flex items-center border-b border-sidebar-border h-[var(--footer-nav-height)] shrink-0 justify-center px-[calc((48px-32px)/2)]">
            <Button variant="ghost" size="icon" className="h-9 w-9 hover:bg-sidebar-hover">
              <PanelLeft className="h-5 w-5" />
            </Button>
          </div>
          
          {/* Nav placeholder - no tooltips during initial render */}
          <div className="flex-grow py-4 space-y-1 px-[calc((48px-32px)/2)] overflow-y-auto">
            {mainNavItems.map(item => (
              <div key={item.label} className="flex justify-center">
                <div className="flex justify-center items-center w-8 h-9 rounded-lg text-sidebar-foreground">
                  <item.icon className="h-4 w-4 shrink-0" />
                </div>
              </div>
            ))}
          </div>
          
          {/* Footer */}
          <div className="mt-auto border-t border-sidebar-border shrink-0">
            <div className="flex w-full items-center justify-center h-[var(--footer-nav-height)] px-[calc((48px-32px)/2)]">
              <div className="h-8 w-8 rounded-full bg-muted" />
            </div>
          </div>
        </div>
      </aside>
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
      <aside 
        className={sidebarOuterClasses}
        onMouseEnter={handleMouseEnter}
        onMouseLeave={handleMouseLeave}
      >
        <div className={sidebarInnerClasses}>
          <div className={cn(
            "flex items-center border-b border-sidebar-border h-[var(--footer-nav-height)] shrink-0", 
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
                    "hover:bg-sidebar-hover",
                    "focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-sidebar"
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
              const isActive = pathname === item.href;
              const handleNavigate = () => {
                if (isClientMobile && currentIsSidebarOpen) {
                  closeSidebarCompletely();
                }
              };
              
              return (
                <div key={item.label}>
                  <AppNavItem 
                    href={item.href}
                    icon={item.icon}
                    label={item.label}
                    size={isEffectivelyExpanded ? "default" : "icon"}
                    isActive={isActive}
                    showTooltip={!isEffectivelyExpanded}
                    onNavigate={handleNavigate}
                  />
                </div>
              );
            })}
          </nav>
        
          <div className="mt-auto border-t border-sidebar-border shrink-0"> 
            {currentIsUserAccountMenuExpanded && isEffectivelyExpanded && (
              <UserAccountMenu />
            )}
            <AppFooterButton
              onClick={handleAvatarClick}
              size={isEffectivelyExpanded ? "default" : "icon"}
              variant={currentIsUserAccountMenuExpanded && isEffectivelyExpanded ? "active" : "default"}
              className={cn(
                "w-full text-left",
                isEffectivelyExpanded ? "p-3 h-[var(--footer-nav-height)]" : "h-[var(--footer-nav-height)] px-[calc((48px-32px)/2)]"
              )}
              aria-label="Open user menu"
              showTooltip={isDesktopClient && !isEffectivelyExpanded && !isHovering}
              tooltipContent={
                <>
                  <p>{userName}</p>
                  <p className="text-xs text-muted-foreground">{userEmail}</p>
                </>
              }
              icon={
                avatarUrl ? (
                  <Image
                    src={avatarUrl}
                    alt="User Avatar"
                    width={32}
                    height={32}
                    className="rounded-full shrink-0 object-cover"
                    data-ai-hint="profile avatar"
                  />
                ) : (
                  <div className="h-8 w-8 rounded-full bg-muted flex items-center justify-center border shrink-0">
                    <UserIcon className="h-4 w-4 text-muted-foreground" />
                  </div>
                )
              }
            >
              {isEffectivelyExpanded && (
                <div className="flex flex-col overflow-hidden ml-3">
                  <span className="truncate">{userName}</span>
                  <span className={cn(
                    "text-xs truncate",
                    currentIsUserAccountMenuExpanded && isEffectivelyExpanded ? 'opacity-80' : 'text-muted-foreground'
                  )}>{userEmail}</span>
                </div>
              )}
            </AppFooterButton>
          </div>
        </div>
      </aside>
    </>
  );
};

export default AppSidebar;