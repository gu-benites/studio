"use client"

import * as React from "react"
import Link from "next/link"
import { LucideIcon } from "lucide-react"
import { cva, type VariantProps } from "class-variance-authority"
import { cn } from "@/lib/utils"
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip"

const navItemVariants = cva(
  "flex items-center gap-3 rounded-lg text-sm font-medium transition-all",
  {
    variants: {
      variant: {
        default: "text-sidebar-foreground hover:bg-sidebar-hover",
        active: "bg-sidebar-active text-sidebar-active-foreground",
      },
      size: {
        default: "px-3 py-2.5 w-full", // Expanded
        icon: "justify-center w-8 h-9 p-0", // Collapsed icon mode
      },
    },
    defaultVariants: {
      variant: "default",
      size: "default",
    },
  }
)

export interface AppNavItemProps
  extends React.HTMLAttributes<HTMLAnchorElement>,
    VariantProps<typeof navItemVariants> {
  href: string
  icon: LucideIcon
  label: string
  isActive?: boolean
  showTooltip?: boolean
  onNavigate?: () => void
}

export const AppNavItem = React.forwardRef<HTMLAnchorElement, AppNavItemProps>(
  ({ 
    className, 
    href, 
    icon: Icon, 
    label, 
    variant, 
    size, 
    isActive, 
    showTooltip = false,
    onNavigate,
    ...props 
  }, ref) => {
    
    // Determine variant based on active state
    const computedVariant = isActive ? "active" : variant

    const navLinkContent = (
      <Link
        href={href}
        ref={ref}
        onClick={onNavigate}
        className={cn(
          navItemVariants({ variant: computedVariant, size }),
          "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-1 focus-visible:ring-offset-sidebar",
          className
        )}
        title={size === "icon" ? label : undefined}
        {...props}
      >
        <Icon className="h-4 w-4 shrink-0" />
        {size === "default" && <span className="truncate">{label}</span>}
      </Link>
    )

    if (showTooltip && size === "icon") {
      return (
        <TooltipProvider>
          <Tooltip>
            <TooltipTrigger asChild>{navLinkContent}</TooltipTrigger>
            <TooltipContent side="right" sideOffset={8}>
              <p>{label}</p>
            </TooltipContent>
          </Tooltip>
        </TooltipProvider>
      )
    }

    return navLinkContent
  }
)

AppNavItem.displayName = "AppNavItem"

export interface AppFooterButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement>,
    VariantProps<typeof navItemVariants> {
  icon?: React.ReactNode
  showTooltip?: boolean
  tooltipContent?: React.ReactNode
}

export const AppFooterButton = React.forwardRef<HTMLButtonElement, AppFooterButtonProps>(
  ({ 
    className, 
    icon, 
    children,
    variant, 
    size, 
    showTooltip = false,
    tooltipContent,
    ...props 
  }, ref) => {
    
    const buttonContent = (
      <button
        ref={ref}
        className={cn(
          navItemVariants({ variant, size }),
          "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-0 focus-visible:ring-offset-sidebar",
          className
        )}
        {...props}
      >
        {icon}
        {size === "default" && children}
      </button>
    )

    if (showTooltip && size === "icon" && tooltipContent) {
      return (
        <TooltipProvider>
          <Tooltip>
            <TooltipTrigger asChild>{buttonContent}</TooltipTrigger>
            <TooltipContent side="right" sideOffset={8}>
              {tooltipContent}
            </TooltipContent>
          </Tooltip>
        </TooltipProvider>
      )
    }

    return buttonContent
  }
)

AppFooterButton.displayName = "AppFooterButton"
