
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

const AccordionTrigger = React.forwardRef<
  React.ElementRef<typeof AccordionPrimitive.Trigger>,
  React.ComponentPropsWithoutRef<typeof AccordionPrimitive.Trigger>
>(({ className, children, ...props }, ref) => (
  <AccordionPrimitive.Header className="flex"> {/* Default is <h3> */}
    <AccordionPrimitive.Trigger
      ref={ref}
      asChild // Render as its child, which will be a div
      className={cn( // These classes will be applied to the child <div>
        // Base styles for the trigger area (now a div)
        "flex flex-1 items-center justify-between py-4 font-medium transition-all",
        // Specific interaction styles
        "hover:no-underline", // Remove underline from the div itself, children can have their own
        "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-1 focus-visible:ring-offset-background",
        // Chevron rotation, targeting a class on the chevron
        "[&[data-state=open]>svg.accordion-chevron]:rotate-180",
        className // Allow overriding classes from usage
      )}
      {...props}
    >
      {/* Explicit child div that is not a button. This div receives the classes from AccordionPrimitive.Trigger via asChild */}
      <div className="flex flex-1 items-center justify-between w-full"> 
        <div className="flex-1">{children}</div> {/* Content passed to AccordionTrigger (e.g., checkbox, label) */}
        <ChevronDown className="h-4 w-4 shrink-0 transition-transform duration-200 text-muted-foreground group-hover:text-accent-foreground accordion-chevron" />
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
