"use client"

import * as React from "react"
import * as AccordionPrimitive from "@radix-ui/react-accordion"
import { ChevronDown } from "lucide-react"

import { cn } from "@/lib/utils"

const Accordion = AccordionPrimitive.Root

const AccordionItem = React.forwardRef<
  React.ElementRef<typeof AccordionPrimitive.Item>,
  React.ComponentPropsWithoutRef<typeof AccordionPrimitive.Item>
>(({ className, ...props }, ref) => (
  <AccordionPrimitive.Item
    ref={ref}
    className={cn("border-b last:border-b-0", className)}
    {...props}
  />
))
AccordionItem.displayName = "AccordionItem"

// Define props for AccordionTrigger to include showChevron
interface CustomAccordionTriggerProps extends React.ComponentPropsWithoutRef<typeof AccordionPrimitive.Trigger> {
  showChevron?: boolean;
}

const AccordionTrigger = React.forwardRef<
  React.ElementRef<typeof AccordionPrimitive.Trigger>,
  CustomAccordionTriggerProps // Use the new props interface
>(({ className, children, showChevron = true, ...props }, ref) => ( // Default showChevron to true
  <AccordionPrimitive.Header className="flex">
    <AccordionPrimitive.Trigger
      ref={ref}
      className={cn(
        "flex flex-1 items-center justify-between py-4 font-medium transition-all", // Base classes
        "hover:no-underline", // User's custom style preserved
        "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-1 focus-visible:ring-offset-background", // User's custom style preserved
        showChevron && "[&[data-state=open]>svg.accordion-chevron]:rotate-180", // Apply rotation only if chevron is shown
        className
      )}
      {...props}
    >
      {/* The children prop will now be the main content for the trigger, e.g., a Label and a Switch */}
      {children}
      {showChevron && (
        <ChevronDown className="h-4 w-4 shrink-0 transition-transform duration-200 text-muted-foreground group-hover:text-accent-foreground accordion-chevron" />
      )}
    </AccordionPrimitive.Trigger>
  </AccordionPrimitive.Header>
))
AccordionTrigger.displayName = AccordionPrimitive.Trigger.displayName

const AccordionContent = React.forwardRef<
  React.ElementRef<typeof AccordionPrimitive.Content>,
  React.ComponentPropsWithoutRef<typeof AccordionPrimitive.Content>
>(({ className, children, ...props }, ref) => (
  <AccordionPrimitive.Content
    ref={ref}
    className="overflow-hidden text-sm transition-all data-[state=closed]:animate-accordion-up data-[state=open]:animate-accordion-down"
    {...props}
  >
    <div className={cn("pb-4 pt-0", className)}>{children}</div>
  </AccordionPrimitive.Content>
))

AccordionContent.displayName = AccordionPrimitive.Content.displayName

export { Accordion, AccordionItem, AccordionTrigger, AccordionContent }
