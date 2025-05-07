
import React from 'react';
import { 
  Accordion,
  AccordionItem,
  AccordionTrigger,
  AccordionContent
} from '@/components/ui/accordion';
import { cn } from '@/lib/utils';
import { Badge } from '@/components/ui/badge';
import { useIsMobile } from '@/hooks/use-mobile';

interface MobileAccordionProps {
  title: string;
  description?: string;
  badge?: {
    text: string;
    color: string;
  };
  className?: string;
  defaultOpen?: boolean;
  children: React.ReactNode;
}

export function MobileAccordion({
  title,
  description,
  badge,
  className,
  defaultOpen = false,
  children
}: MobileAccordionProps) {
  const isMobile = useIsMobile();
  const value = defaultOpen ? 'item-1' : undefined;
  
  return (
    <Accordion 
      type="single" 
      collapsible 
      defaultValue={value}
      className={cn("w-full rounded-xl border border-gray-100 bg-white shadow-sm", className)}
    >
      <AccordionItem value="item-1" className="border-none">
        <AccordionTrigger className="py-4 px-4">
          <div className="flex flex-col items-start text-left w-full">
            <div className="flex items-center justify-between w-full">
              <h3 className="text-lg font-semibold text-gray-800">{title}</h3>
              {badge && (
                <Badge className={cn("rounded-full px-3 py-1 text-xs text-white", badge.color)}>
                  {badge.text}
                </Badge>
              )}
            </div>
            {description && (
              <p className={cn(
                "text-gray-600 mt-1",
                isMobile ? "text-sm" : ""
              )}>
                {description}
              </p>
            )}
          </div>
        </AccordionTrigger>
        <AccordionContent>
          <div className="px-4 pb-4">
            {children}
          </div>
        </AccordionContent>
      </AccordionItem>
    </Accordion>
  );
}

export function MobileAccordionGroup({
  children,
  className
}: {
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <div className={cn("space-y-4", className)}>
      {children}
    </div>
  );
}
