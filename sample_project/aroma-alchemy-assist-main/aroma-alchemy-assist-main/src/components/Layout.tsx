
import React from 'react';
import { useIsMobile } from '@/hooks/use-mobile';
import { cn } from '@/lib/utils';

interface LayoutProps {
  children: React.ReactNode;
}

const Layout: React.FC<LayoutProps> = ({ children }) => {
  const isMobile = useIsMobile();
  
  return (
    <div className="min-h-screen bg-background flex flex-col">
      <main className={cn(
        "flex-grow flex items-center justify-center", 
        isMobile ? "px-4 py-4" : "px-6 py-8"
      )}>
        <div className="w-full max-w-4xl">
          {children}
        </div>
      </main>
      <footer className="py-3 text-center">
        <p className="text-xs text-gray-500">© {new Date().getFullYear()} AromaCHAT - Assistente de Aromaterapia</p>
      </footer>
    </div>
  );
};

export default Layout;
