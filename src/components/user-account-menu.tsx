
"use client";

import {
  UserCircle,
  Settings,
  Globe,
  HelpCircle,
  LogOut,
  ChevronRight,
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
    isLanguageSelectorOpen, 
    setLanguageSelectorOpen,
    activeUserMenuSubItem,
    setActiveUserMenuSubItem
  } = useUIState();

  const handleLanguageClick = () => {
    setActiveUserMenuSubItem(activeUserMenuSubItem === 'language' ? null : 'language');
    // This will be handled by Popover's open state in LanguageSelector
  };

  const menuItems: MenuItemProps[] = [
    { href: '/account', icon: UserCircle, label: 'Account' }, // Placeholder link
    { href: '/settings', icon: Settings, label: 'Settings' },
    { icon: Globe, label: 'Language', onClick: handleLanguageClick, hasSubMenu: true, isActive: activeUserMenuSubItem === 'language' },
    { href: '/help', icon: HelpCircle, label: 'Help Center' }, // Placeholder link
    { icon: LogOut, label: 'Sign Out', onClick: () => setLogoutModalOpen(true) },
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
