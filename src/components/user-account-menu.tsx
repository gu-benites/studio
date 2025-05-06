
"use client";

import {
  Settings,
  Globe,
  HelpCircle,
  LogOut,
  ChevronRight,
  CreditCard,
} from 'lucide-react';
import Link from 'next/link';
import * as React from 'react';

import { useUIState } from '@/contexts/UIStateContext';
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
      'flex w-full items-center justify-between px-4 py-2.5 text-sm text-left hover:bg-muted rounded-md',
      isActive && 'font-semibold bg-muted' // Active state for Language when its sub-menu is open
    )}
  >
    <div className="flex items-center gap-3">
      <Icon className="h-5 w-5 text-muted-foreground" />
      <span>{label}</span>
    </div>
    {hasSubMenu && <ChevronRight className="h-4 w-4 text-muted-foreground" />}
  </button>
);

export const UserAccountMenu: React.FC = () => {
  const { 
    setLogoutModalOpen, 
    setSubscriptionModalOpen,
    activeUserMenuSubItem,
    setActiveUserMenuSubItem,
    closeSidebarCompletely, // For mobile navigation/modal actions
    handleUserMenuToggle, // For desktop navigation/modal actions (closes menu & sidebar)
  } = useUIState();
  const [isClientMobile, setIsClientMobile] = React.useState(false);

  React.useEffect(() => {
    const checkMobile = () => setIsClientMobile(window.innerWidth < 768);
    checkMobile();
    window.addEventListener('resize', checkMobile);
    return () => window.removeEventListener('resize', checkMobile);
  }, []);


  const handleLanguageClick = () => {
    setActiveUserMenuSubItem(activeUserMenuSubItem === 'language' ? null : 'language');
  };

  // This function is called when a menu item leading to navigation or a modal is clicked.
  const handleNavigationOrModalAction = () => {
    if (isClientMobile) {
        closeSidebarCompletely(); // Close mobile drawer
    } else {
        handleUserMenuToggle(); // Close user menu and collapse/unpin sidebar on desktop
    }
  };
  

  const menuItems: MenuItemProps[] = [
    { href: '/settings', icon: Settings, label: 'Settings', onClick: handleNavigationOrModalAction }, 
    { icon: CreditCard, label: 'My Subscription', onClick: () => { setSubscriptionModalOpen(true); handleNavigationOrModalAction(); } },
    { icon: Globe, label: 'Language', onClick: handleLanguageClick, hasSubMenu: true, isActive: activeUserMenuSubItem === 'language' },
    { href: '/help', icon: HelpCircle, label: 'Help Center', onClick: handleNavigationOrModalAction }, 
    { icon: LogOut, label: 'Sign Out', onClick: () => { setLogoutModalOpen(true); handleNavigationOrModalAction(); }
    },
  ];

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
          <p className="text-xs font-semibold text-muted-foreground">My Account</p>
        </div>
        <Separator className="my-1" />
        <div className="flex flex-col space-y-0.5">
          {menuItems.map((item, index) => 
            item.href ? (
              <Link href={item.href} key={index} passHref legacyBehavior>
                {/* The 'a' tag is necessary for legacyBehavior to correctly pass onClick */}
                <a onClick={item.onClick} className="block">
                  {/* Pass undefined for onClick to MenuItem as the 'a' tag handles it */}
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
