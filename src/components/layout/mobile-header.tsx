
"use client";

import { PanelLeft, ChefHat } from 'lucide-react';
import Link from 'next/link';
import * as React from 'react';

import { useUIState } from '@/contexts/UIStateContext';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';

export const MobileHeader: React.FC = () => {
  const { toggleMobileSidebar, isSidebarOpen } = useUIState();
  const [isClientMobile, setIsClientMobile] = React.useState(false);
  const [hasMounted, setHasMounted] = React.useState(false);

  React.useEffect(() => {
    setHasMounted(true);
    const checkMobile = () => setIsClientMobile(window.innerWidth < 768);
    checkMobile();
    window.addEventListener('resize', checkMobile);
    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  // Only render header on mobile and after client has mounted
  if (!hasMounted || !isClientMobile) {
    return null;
  }

  return (
    <header className={cn(
        "sticky top-0 z-30 flex items-center justify-between h-[60px] px-4 border-b bg-background/80 backdrop-blur-sm",
        "md:hidden" // Ensure it's hidden on desktop (though isClientMobile already handles this)
    )}>
      <Button
        variant="ghost"
        size="icon"
        onClick={toggleMobileSidebar}
        aria-label={isSidebarOpen ? "Close sidebar" : "Open sidebar"}
        className="h-9 w-9 hover:bg-sidebar-hover hover:text-sidebar-foreground focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background"
      >
        <PanelLeft className="h-5 w-5" />
      </Button>
      <Link href="/" className="flex items-center gap-2 text-lg font-semibold text-primary">
        <ChefHat className="h-4 w-4" /> {/* Icon size change */}
        <span className="sr-only">RecipeSage</span> {/* Show full name in sidebar */}
      </Link>
      <div className="w-9 h-9" /> {/* Spacer to balance the hamburger icon */}
    </header>
  );
};

