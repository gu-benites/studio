
"use client"

import * as React from "react"
import * as AccordionPrimitive from "@radix-ui/react-accordion"
import { ChevronDown } from "lucide-react" // Import ChevronDown

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

const AccordionTrigger = React.forwardRef<
  React.ElementRef<typeof AccordionPrimitive.Trigger>,
  React.ComponentPropsWithoutRef<typeof AccordionPrimitive.Trigger>
>(({ className, children, ...props }, ref) => (
  <AccordionPrimitive.Header className="flex">
    <AccordionPrimitive.Trigger
      ref={ref}
      asChild // Allow custom button/div structure inside
      className={cn(
        "flex flex-1 items-center justify-between py-4 font-medium transition-all",
        "hover:no-underline",
        "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-1 focus-visible:ring-offset-background",
        "[&[data-state=open]>svg.accordion-chevron]:rotate-180", // Added class for icon rotation
        className
      )}
      {...props}
    >
      {/* Allow children to define the layout including the icon if needed, or add a default icon here */}
      {/* Example structure if children don't include the icon: */}
      <div className="flex flex-1 items-center justify-between w-full">
        <div className="flex-1">{children}</div>
        {/* Default ChevronDown icon - can be overridden by children if they provide their own icon logic */}
        {!React.Children.toArray(children).some(
          (child) => React.isValidElement(child) && (child.type as any).displayName === 'ChevronDown' // Crude check
        ) && (
          <ChevronDown className="h-4 w-4 shrink-0 transition-transform duration-200 text-muted-foreground group-hover:text-accent-foreground accordion-chevron" />
        )}
      </div>
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
