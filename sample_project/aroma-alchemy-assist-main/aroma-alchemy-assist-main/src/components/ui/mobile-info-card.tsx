
import React from 'react';
import { Card } from '@/components/ui/card';
import { cn } from '@/lib/utils';
import { useIsMobile } from '@/hooks/use-mobile';

interface MobileInfoCardProps {
  title: string;
  content: string;
  className?: string;
  colorScheme?: 'purple' | 'blue' | 'default';
}

export function MobileInfoCard({ 
  title, 
  content, 
  className,
  colorScheme = 'default'
}: MobileInfoCardProps) {
  const isMobile = useIsMobile();
  
  const colorClasses = {
    purple: "bg-secondary border-secondary",
    blue: "bg-blue-50 border-blue-100",
    default: "bg-gray-50 border-gray-100"
  };
  
  const titleColors = {
    purple: "text-primary",
    blue: "text-blue-600",
    default: "text-gray-700"
  };
  
  return (
    <Card className={cn(
      "p-4 rounded-xl w-full border shadow-sm",
      colorClasses[colorScheme],
      className
    )}>
      <h4 className={cn(
        "text-sm font-medium mb-1",
        titleColors[colorScheme]
      )}>
        {title}
      </h4>
      <p className={cn(
        "text-gray-600",
        isMobile ? "text-xs" : "text-sm" 
      )}>
        {content}
      </p>
    </Card>
  );
}

export function MobileInfoCardGroup({
  children,
  className,
  colorScheme = 'default'
}: {
  children: React.ReactNode;
  className?: string;
  colorScheme?: 'purple' | 'blue' | 'default';
}) {
  const isMobile = useIsMobile();
  
  return (
    <div className={cn(
      "w-full",
      isMobile ? "space-y-3" : "grid grid-cols-2 gap-4",
      className
    )}>
      {React.Children.map(children, child => {
        if (React.isValidElement(child)) {
          return React.cloneElement(child as React.ReactElement<MobileInfoCardProps>, {
            colorScheme: colorScheme,
            ...((child as React.ReactElement<MobileInfoCardProps>).props)
          });
        }
        return child;
      })}
    </div>
  );
}
