"use client";

import type { LucideIcon } from 'lucide-react';
import {
  PanelLeft,
  PanelLeftClose,
  Home,
  Settings,
  CreditCard,
  UserCircle,
  ChefHat,
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

const mainNavItems: NavItem[] = [
  { href: '/', icon: Home, label: 'Recipe Generator' },
  { href: '/settings', icon: Settings, label: 'Settings' },
];

const AppSidebar: React.FC = () => {
  const { isSidebarOpen, isSidebarPinned, toggleSidebar } = useUIState();
  const pathname = usePathname();
  const [isUserMenuOpen, setIsUserMenuOpen] = React.useState(false);

  const sidebarWidth = isSidebarOpen ? 'w-[287px]' : 'w-[68px]';

  const handleToggleClick = () => {
    if (isSidebarOpen && isSidebarPinned) { // If open and pinned, toggle will close and unpin
      toggleSidebar(false);
    } else { // Otherwise, toggle will open and pin
      toggleSidebar(true);
    }
  };

  return (
    <aside
      className={cn(
        'fixed inset-y-0 left-0 z-40 flex flex-col bg-card border-r border-app-sidebar-border transition-all duration-300 ease-in-out',
        sidebarWidth
      )}
      // Removed onMouseEnter and onMouseLeave to prevent hover-based expansion
    >
      {/* Sidebar Content */}
      <div className="flex flex-col flex-grow">
        {/* Top section: Logo and Toggle */}
        <div className={cn("flex items-center border-b border-app-sidebar-border", isSidebarOpen ? "px-4 h-[60px]" : "px-[10px] justify-center h-[60px]")}>
          {isSidebarOpen && (
             <Link href="/" className="flex items-center gap-2 text-lg font-semibold text-primary">
                <ChefHat className="h-7 w-7" />
                RecipeSage
             </Link>
          )}
          <Button
            variant="ghost"
            size="icon"
            onClick={handleToggleClick}
            className={cn("transition-colors hover:bg-app-sidebar-hover-background", isSidebarOpen ? "ml-auto" : " ") }
            aria-label={isSidebarOpen && isSidebarPinned ? 'Unpin and close sidebar' : 'Open and pin sidebar'}
          >
            {isSidebarOpen && isSidebarPinned ? <PanelLeftClose className="h-5 w-5" /> : <PanelLeft className="h-5 w-5" />}
          </Button>
        </div>
        
        {/* Navigation */}
        <nav className="flex-grow px-3 py-4 space-y-2"> {/* Removed onClick={handleSidebarAreaClick} */}
          {mainNavItems.map((item) => (
            <Link
              key={item.label}
              href={item.href}
              className={cn(
                'flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-all',
                pathname === item.href
                  ? 'bg-app-sidebar-active-background text-app-sidebar-active-foreground'
                  : 'text-app-sidebar-foreground hover:bg-app-sidebar-hover-background hover:text-primary',
                !isSidebarOpen && 'justify-center'
              )}
              title={isSidebarOpen ? "" : item.label}
            >
              <item.icon className={cn("h-5 w-5", !isSidebarOpen && "mx-auto")} />
              {isSidebarOpen && <span>{item.label}</span>}
            </Link>
          ))}
           <button
              onClick={() => useUIState.getState().setSubscriptionModalOpen(true)}
              className={cn(
                'flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-all w-full text-left',
                'text-app-sidebar-foreground hover:bg-app-sidebar-hover-background hover:text-primary',
                !isSidebarOpen && 'justify-center'
              )}
              title={isSidebarOpen ? "" : "My Subscription"}
            >
              <CreditCard className={cn("h-5 w-5", !isSidebarOpen && "mx-auto")} />
              {isSidebarOpen && <span>My Subscription</span>}
            </button>
        </nav>
      </div>

      {/* Bottom section: User Profile */}
      <div className="mt-auto border-t border-app-sidebar-border p-3">
        <Popover open={isUserMenuOpen} onOpenChange={setIsUserMenuOpen}>
          <PopoverTrigger asChild>
            <button
              className={cn(
                "flex w-full items-center gap-3 rounded-lg p-2 text-left text-sm font-medium transition-colors hover:bg-app-sidebar-hover-background",
                !isSidebarOpen && "justify-center"
              )}
              onClick={() => {
                setIsUserMenuOpen(prev => !prev); // Simplified: just toggle menu, don't expand sidebar
              }}
              aria-label="User account menu"
            >
              <Image
                src="https://picsum.photos/seed/useravatar/40/40"
                alt="User Avatar"
                width={32}
                height={32}
                className="rounded-full"
                data-ai-hint="profile avatar"
              />
              {isSidebarOpen && (
                <div className="flex flex-col">
                  <span className="text-app-sidebar-foreground">User Name</span>
                  <span className="text-xs text-muted-foreground">user@example.com</span>
                </div>
              )}
            </button>
          </PopoverTrigger>
          <PopoverContent 
            side="top" 
            align={isSidebarOpen ? "start" : "center"} 
            className="w-60 p-0 mb-2"
            style={{ marginLeft: isSidebarOpen ? '10px' : '58px'}} // Adjust position based on sidebar state
            onFocusOutside={(e) => {
              // Prevent closing if the click is on the trigger itself when sidebar was collapsed
              // This logic might still be relevant depending on exact browser behavior with focus.
              if (!isSidebarOpen && e.target instanceof HTMLElement && e.target.closest('button[aria-label="User account menu"]')) {
                return;
              }
              setIsUserMenuOpen(false);
            }}
          >
            <UserAccountMenu />
          </PopoverContent>
        </Popover>
      </div>
    </aside>
  );
};

export default AppSidebar;
