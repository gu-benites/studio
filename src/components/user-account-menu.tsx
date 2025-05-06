"use client";

import {
  UserCircle,
  Settings,
  Globe,
  HelpCircle,
  LogOut,
  ChevronRight,
  CreditCard, // Added for My Subscription
} from 'lucide-react';
import Link from 'next/link';
import * as React from 'react';

import { useUIState } from '@/contexts/UIStateContext';
import { cn } from '@/lib/utils';
import { LanguageSelector } from './language-selector';

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
      'flex w-full items-center justify-between px-4 py-2.5 text-sm text-left hover:bg-muted',
      isActive && 'font-semibold bg-muted'
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
    setSubscriptionModalOpen, // For My Subscription
    activeUserMenuSubItem,
    setActiveUserMenuSubItem,
    closeSidebarCompletely // To close the popover when sidebar closes
  } = useUIState();

  const handleLanguageClick = () => {
    setActiveUserMenuSubItem(activeUserMenuSubItem === 'language' ? null : 'language');
  };

  const handleSettingsClick = () => {
    // Example: Close popover after navigating or opening modal
    // If settings opens a modal, you might do it there.
    // For a page navigation, Link handles it.
    closeSidebarCompletely(); // Close the popover
  };
  
  const handleSubscriptionClick = () => {
    setSubscriptionModalOpen(true);
    // Consider if the popover should close here too.
    // For now, let's assume it stays open or Popover handles onOpenChange correctly.
    // If user menu should close after this, call:
    // setActiveUserMenuSubItem(null); // and ensure Popover onOpenChange updates isUserMenuOpen in sidebar
  };


  const menuItems: MenuItemProps[] = [
    { href: '/account', icon: UserCircle, label: 'Account', onClick: handleSettingsClick }, 
    { href: '/settings', icon: Settings, label: 'Settings', onClick: handleSettingsClick },
    { icon: CreditCard, label: 'My Subscription', onClick: handleSubscriptionClick },
    { icon: Globe, label: 'Language', onClick: handleLanguageClick, hasSubMenu: true, isActive: activeUserMenuSubItem === 'language' },
    { href: '/help', icon: HelpCircle, label: 'Help Center', onClick: handleSettingsClick }, 
    { icon: LogOut, label: 'Sign Out', onClick: () => {
        setLogoutModalOpen(true);
        // Consider closing popover here as well.
        // setActiveUserMenuSubItem(null); 
      }
    },
  ];

  return (
    <div className="relative">
      <div className={cn("bg-popover text-popover-foreground rounded-md shadow-lg transition-all duration-200 ease-in-out", activeUserMenuSubItem === 'language' ? 'opacity-0 -translate-x-full pointer-events-none' : 'opacity-100 translate-x-0')}>
        <div className="p-2">
          <p className="px-3 py-2 text-xs font-semibold text-muted-foreground">My Account</p>
        </div>
        <div className="flex flex-col">
          {menuItems.map((item, index) => 
            item.href ? (
              <Link href={item.href} key={index} passHref legacyBehavior>
                <MenuItem {...item} />
              </Link>
            ) : (
              <MenuItem key={index} {...item} />
            )
          )}
        </div>
      </div>
      {activeUserMenuSubItem === 'language' && (
        <div className="absolute top-0 left-0 w-full bg-popover text-popover-foreground rounded-md shadow-lg">
           <LanguageSelector onBack={() => setActiveUserMenuSubItem(null)} />
        </div>
      )}
    </div>
  );
};