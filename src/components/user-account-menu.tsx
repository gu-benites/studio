
"use client";

import {
  Settings,
  Globe,
  HelpCircle,
  LogOut,
  ChevronRight,
  CreditCard,
  LogIn,
  UserPlus,
} from 'lucide-react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import * as React from 'react';
import { useState } from 'react';

import { useUIState } from '@/contexts/UIStateContext';
import { useAuth } from '@/contexts/auth-context';
import { cn } from '@/lib/utils';
import { LanguageSelector } from './language-selector';
import { Separator } from '@/components/ui/separator';


interface MenuItemProps {
  icon: React.ElementType;
  label: string;
  href?: string;
  onClick?: () => void;
  hasSubMenu?: boolean;
  isActive?: boolean;
}

const MenuItem: React.FC<MenuItemProps> = ({ icon: Icon, label, href, onClick, hasSubMenu, isActive }) => (
  <button
    onClick={onClick}
    className={cn(
      'flex w-full items-center justify-between px-4 py-2.5 text-sm text-left rounded-md transition-colors',
      'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-1 focus-visible:ring-offset-card', // Card is the background for user menu
      isActive 
        ? 'font-semibold bg-sidebar-active text-sidebar-active-foreground' 
        : 'text-sidebar-foreground hover:bg-sidebar-hover'
    )}
  >
    <div className="flex items-center gap-3">
      {/* Icon color will be inherited from button's text color */}
      <Icon className="h-4 w-4 shrink-0" /> {/* Icon size change */}
      <span>{label}</span>
    </div>
    {hasSubMenu && <ChevronRight className="h-4 w-4" />}
  </button>
);

export const UserAccountMenu: React.FC = () => {
  const { 
    setLogoutModalOpen, 
    setSubscriptionModalOpen,
    activeUserMenuSubItem,
    setActiveUserMenuSubItem,
    closeSidebarCompletely, 
    handleUserMenuToggle, 
  } = useUIState();
  const { signOut, user } = useAuth();
  const router = useRouter();
  const [isClientMobile, setIsClientMobile] = React.useState(false);
  const [isLoggingOut, setIsLoggingOut] = useState(false);

  React.useEffect(() => {
    const checkMobile = () => setIsClientMobile(window.innerWidth < 768);
    checkMobile();
    window.addEventListener('resize', checkMobile);
    return () => window.removeEventListener('resize', checkMobile);
  }, []);


  const handleLanguageClick = () => {
    setActiveUserMenuSubItem(activeUserMenuSubItem === 'language' ? null : 'language');
  };

  const handleNavigationOrModalAction = () => {
    if (isClientMobile) {
        closeSidebarCompletely(); 
    } else {
        handleUserMenuToggle(); 
    }
  };
  

  // Handle sign out action
  const handleSignOut = async () => {
    try {
      setIsLoggingOut(true);
      // The signOut function now handles the redirect internally
      await signOut();
      // No need to manually navigate since signOut does it
    } catch (error) {
      console.error('Error signing out:', error);
      setIsLoggingOut(false);
    }
    // Note: We don't need the finally block with setIsLoggingOut(false) anymore
    // because the page will be redirected and this component unmounted
  };
  
  // Define menu items based on authentication status
  const authenticatedMenuItems: MenuItemProps[] = [
    { href: '/settings', icon: Settings, label: 'Settings', onClick: handleNavigationOrModalAction }, 
    { icon: CreditCard, label: 'My Subscription', onClick: () => { setSubscriptionModalOpen(true); handleNavigationOrModalAction(); } },
    { icon: Globe, label: 'Language', onClick: handleLanguageClick, hasSubMenu: true, isActive: activeUserMenuSubItem === 'language' },
    { href: '/help', icon: HelpCircle, label: 'Help Center', onClick: handleNavigationOrModalAction }, 
    { icon: LogOut, label: isLoggingOut ? 'Signing out...' : 'Sign Out', onClick: handleSignOut },
  ];
  
  const unauthenticatedMenuItems: MenuItemProps[] = [
    { href: '/auth/login', icon: LogIn, label: 'Log In', onClick: handleNavigationOrModalAction },
    { href: '/auth/register', icon: UserPlus, label: 'Register', onClick: handleNavigationOrModalAction },
    { icon: Globe, label: 'Language', onClick: handleLanguageClick, hasSubMenu: true, isActive: activeUserMenuSubItem === 'language' },
    { href: '/help', icon: HelpCircle, label: 'Help Center', onClick: handleNavigationOrModalAction },
  ];
  
  const menuItems = user ? authenticatedMenuItems : unauthenticatedMenuItems;

  if (activeUserMenuSubItem === 'language') {
    return (
      <div className="w-full bg-card text-card-foreground p-1">
         <LanguageSelector onBack={() => setActiveUserMenuSubItem(null)} />
      </div>
    );
  }

  return (
    <div className="w-full bg-card text-card-foreground p-2">
        <div className="px-2 py-1.5">
          <p className="text-xs font-semibold text-muted-foreground">
            {user ? 'My Account' : 'Account'}
          </p>
        </div>
        <Separator className="my-1" />
        <div className="flex flex-col space-y-0.5">
          {menuItems.map((item, index) => 
            item.href ? (
              <Link href={item.href} key={index} passHref legacyBehavior>
                {/* The <a> tag will not be directly styled for hover/focus; the MenuItem button inside will */}
                <a onClick={item.onClick} className="block rounded-md focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-1 focus-visible:ring-offset-card">
                  <MenuItem {...item} onClick={undefined} /> 
                </a>
              </Link>
            ) : (
              <MenuItem key={index} {...item} />
            )
          )}
        </div>
    </div>
  );
};
