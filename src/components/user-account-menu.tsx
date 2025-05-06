"use client";

import {
  UserCircle,
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
    setSubscriptionModalOpen,
    activeUserMenuSubItem,
    setActiveUserMenuSubItem,
    closeUserAccountMenu, // To close the whole menu when navigating
    closeSidebarCompletely // To close sidebar and menu
  } = useUIState();

  const handleLanguageClick = () => {
    setActiveUserMenuSubItem(activeUserMenuSubItem === 'language' ? null : 'language');
  };

  const handleNavigationOrModal = () => {
    // This function can be called by items that navigate or open modals
    // to ensure the menu structure behaves as expected.
    // For page navigation via Link, the sidebar's useEffect for pathname changes handles full closure.
    // For modals, we might want to close the sub-menu or the entire user menu.
    if (isClientMobile()) { // Helper to check if mobile
        closeSidebarCompletely(); // On mobile, usually close everything
    } else {
        closeUserAccountMenu(); // On desktop, just close the user menu section
    }
  };
  
  // Helper function to determine if on mobile, assuming window is available
  const isClientMobile = () => typeof window !== 'undefined' && window.innerWidth < 768;


  const menuItems: MenuItemProps[] = [
    { href: '/settings', icon: Settings, label: 'Settings', onClick: handleNavigationOrModal }, // Removed /account, use /settings
    { icon: CreditCard, label: 'My Subscription', onClick: () => { setSubscriptionModalOpen(true); handleNavigationOrModal(); } },
    { icon: Globe, label: 'Language', onClick: handleLanguageClick, hasSubMenu: true, isActive: activeUserMenuSubItem === 'language' },
    { href: '/help', icon: HelpCircle, label: 'Help Center', onClick: handleNavigationOrModal }, 
    { icon: LogOut, label: 'Sign Out', onClick: () => { setLogoutModalOpen(true); handleNavigationOrModal(); }
    },
  ];

  if (activeUserMenuSubItem === 'language') {
    return (
      <div className="w-full bg-card text-card-foreground p-1"> {/* Adjusted padding */}
         <LanguageSelector onBack={() => setActiveUserMenuSubItem(null)} />
      </div>
    );
  }

  return (
    <div className="w-full bg-card text-card-foreground p-2"> {/* Adjusted padding */}
        <div className="px-2 py-1.5"> {/* Adjusted padding */}
          <p className="text-xs font-semibold text-muted-foreground">My Account</p>
        </div>
        <Separator className="my-1" /> {/* Added separator */}
        <div className="flex flex-col space-y-0.5"> {/* Adjusted spacing */}
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
  );
};
