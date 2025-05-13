'use client';

import { useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { ScrollArea } from '@/components/ui/scroll-area';
import { 
  ChevronLeft, 
  ChevronRight, 
  Database, 
  Beaker, 
  Grid, 
  Home, 
  Leaf, 
  Droplet as Oil, 
  Settings, 
  ShieldAlert, 
  Table, 
  Tags
} from 'lucide-react';

type AdminNavItemProps = {
  label: string;
  href: string;
  icon: React.ElementType;
  isActive?: boolean;
  isCollapsed?: boolean;
};

// Simple Nav Item without Tooltips
const AdminNavItem = ({ 
  label, 
  href, 
  icon: Icon, 
  isActive, 
  isCollapsed 
}: AdminNavItemProps) => {
  return (
    <Link
      href={href}
      className={cn(
        "flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-all hover:bg-sidebar-hover",
        isActive ? "bg-sidebar-active text-sidebar-active-foreground" : "text-sidebar-foreground",
        isCollapsed && "justify-center p-2"
      )}
      title={isCollapsed ? label : undefined}
    >
      <Icon className={cn("h-5 w-5", isCollapsed ? "mr-0" : "mr-1")} />
      {!isCollapsed && <span>{label}</span>}
    </Link>
  );
};

export function AdminSidebar() {
  const pathname = usePathname();
  const [isCollapsed, setIsCollapsed] = useState(false);
  
  return (
    <div 
      className={cn(
        "relative flex flex-col border-r border-border bg-sidebar transition-all duration-300",
        isCollapsed ? "max-w-[70px]" : "w-64"
      )}
    >
      <div className={cn(
        "flex h-16 items-center border-b px-4",
        isCollapsed && "justify-center px-2"
      )}>
        {!isCollapsed && (
          <div className="flex items-center gap-2 font-semibold">
            <Leaf className="h-5 w-5 text-primary" />
            <span>AromaChat Admin</span>
          </div>
        )}
        {isCollapsed && (
          <Leaf className="h-6 w-6 text-primary" />
        )}
      </div>
      
      <Button
        variant="ghost"
        size="icon"
        className="absolute -right-4 top-20 hidden h-8 w-8 rounded-full border shadow-sm md:flex"
        onClick={() => setIsCollapsed(!isCollapsed)}
      >
        {isCollapsed ? (
          <ChevronRight className="h-4 w-4" />
        ) : (
          <ChevronLeft className="h-4 w-4" />
        )}
        <span className="sr-only">
          {isCollapsed ? "Expand sidebar" : "Collapse sidebar"}
        </span>
      </Button>
      
      <ScrollArea className="flex-1 pb-4">
        <nav className="space-y-1 px-2 py-3">
          <AdminNavItem 
            href="/admin" 
            icon={Home} 
            label="Dashboard" 
            isActive={pathname === "/admin"} 
            isCollapsed={isCollapsed} 
          />
          
          <div className={cn(
            "flex items-center px-3 py-2 text-xs font-medium text-muted-foreground",
            isCollapsed && "justify-center px-0"
          )}>
            {!isCollapsed && "Essential Oils"}
          </div>
          
          <AdminNavItem 
            href="/admin/essential-oils" 
            icon={Oil} 
            label="Essential Oils" 
            isActive={pathname.startsWith("/admin/essential-oils")} 
            isCollapsed={isCollapsed} 
          />
          
          <AdminNavItem 
            href="/admin/chemical-compounds" 
            icon={Beaker} 
            label="Chemical Compounds" 
            isActive={pathname.startsWith("/admin/chemical-compounds")} 
            isCollapsed={isCollapsed} 
          />
          
          <div className={cn(
            "flex items-center px-3 py-2 text-xs font-medium text-muted-foreground",
            isCollapsed && "justify-center px-0"
          )}>
            {!isCollapsed && "Lookups"}
          </div>
          
          <AdminNavItem 
            href="/admin/categories" 
            icon={Tags} 
            label="Categories" 
            isActive={pathname.startsWith("/admin/categories")} 
            isCollapsed={isCollapsed} 
          />
          
          <AdminNavItem 
            href="/admin/descriptors" 
            icon={Table} 
            label="Aromatic Descriptors" 
            isActive={pathname.startsWith("/admin/descriptors")} 
            isCollapsed={isCollapsed} 
          />
          
          <AdminNavItem 
            href="/admin/tables" 
            icon={Grid} 
            label="All Tables" 
            isActive={pathname.startsWith("/admin/tables")} 
            isCollapsed={isCollapsed} 
          />
          
          <div className={cn(
            "flex items-center px-3 py-2 text-xs font-medium text-muted-foreground",
            isCollapsed && "justify-center px-0"
          )}>
            {!isCollapsed && "System"}
          </div>
          
          <AdminNavItem 
            href="/admin/database" 
            icon={Database} 
            label="Database" 
            isActive={pathname.startsWith("/admin/database")} 
            isCollapsed={isCollapsed} 
          />
          
          <AdminNavItem 
            href="/admin/security" 
            icon={ShieldAlert} 
            label="Security" 
            isActive={pathname.startsWith("/admin/security")} 
            isCollapsed={isCollapsed} 
          />
          
          <AdminNavItem 
            href="/admin/settings" 
            icon={Settings} 
            label="Settings" 
            isActive={pathname.startsWith("/admin/settings")} 
            isCollapsed={isCollapsed} 
          />
        </nav>
      </ScrollArea>
    </div>
  );
}
