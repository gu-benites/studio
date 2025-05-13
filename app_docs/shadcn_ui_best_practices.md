# shadcn UI Best Practices Guide

This document serves as a reference for maintaining consistency and following best practices when working with shadcn UI components in the AromaChat application.

## Table of Contents

1. [Component Design Philosophy](#component-design-philosophy)
2. [Theme System](#theme-system)
3. [Component Variants with cva](#component-variants-with-cva)
4. [Component Composition](#component-composition)
5. [Best Practices Checklist](#best-practices-checklist)
6. [Common Anti-Patterns to Avoid](#common-anti-patterns-to-avoid)
7. [Example Implementations](#example-implementations)

## Component Design Philosophy

shadcn UI follows several key design principles:

- **Modularity**: Components should be self-contained and reusable
- **Composition over inheritance**: Prefer composing smaller components to build larger ones
- **Unstyled by default**: Components provide structure but rely on the theme system for visual styling
- **Accessibility first**: Components should be accessible by default
- **Developer experience**: Components should be intuitive to use and adapt

## Theme System

### Theme Variables

Always use the theme system rather than direct CSS or inline styles:

```tsx
// ❌ Bad - Direct HSL reference
<div className="bg-[hsl(var(--sidebar-background))]">

// ✅ Good - Using theme variable
<div className="bg-sidebar">
```

### Extending the Theme

When adding new UI elements that need theming, extend the theme in `tailwind.config.ts`:

```typescript
// In tailwind.config.ts
theme: {
  extend: {
    colors: {
      sidebar: {
        DEFAULT: 'hsl(var(--sidebar-background))',
        foreground: 'hsl(var(--sidebar-foreground))',
        hover: 'hsl(var(--sidebar-hover))',
        active: 'hsl(var(--sidebar-active))',
        'active-foreground': 'hsl(var(--sidebar-active-foreground))',
        border: 'hsl(var(--sidebar-border))'
      }
    }
  }
}
```

Then define the CSS variables in `globals.css`:

```css
:root {
  /* Light mode variables */
  --sidebar-background: 0 0% 100%;
  --sidebar-foreground: 248 16% 33%;
  --sidebar-border: 210 14% 90%;
  --sidebar-hover: 210 17% 95%;
  --sidebar-active: 253 100% 68%;
  --sidebar-active-foreground: 0 0% 100%;
}

.dark {
  /* Dark mode variables */
  --sidebar-background: 240 10% 12%;
  --sidebar-foreground: 210 17% 85%;
  --sidebar-border: 240 5% 25%;
  --sidebar-hover: 240 10% 18%;
  --sidebar-active: 253 100% 75%;
  --sidebar-active-foreground: 248 16% 10%;
}
```

## Component Variants with cva

Use Class Variance Authority (cva) to create component variants:

```tsx
import { cva, type VariantProps } from "class-variance-authority"

const buttonVariants = cva(
  "inline-flex items-center justify-center whitespace-nowrap rounded-md text-sm font-medium transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:pointer-events-none disabled:opacity-50",
  {
    variants: {
      variant: {
        default: "bg-primary text-primary-foreground shadow hover:bg-primary/90",
        destructive: "bg-destructive text-destructive-foreground shadow-sm hover:bg-destructive/90",
        outline: "border border-input bg-transparent hover:bg-accent hover:text-accent-foreground",
        // Add more variants as needed
      },
      size: {
        default: "h-9 px-4 py-2",
        sm: "h-8 rounded-md px-3 text-xs",
        lg: "h-10 rounded-md px-8",
      },
    },
    defaultVariants: {
      variant: "default",
      size: "default",
    },
  }
)

export interface ButtonProps 
  extends React.ButtonHTMLAttributes<HTMLButtonElement>,
    VariantProps<typeof buttonVariants> {
  asChild?: boolean
}
```

## Component Composition

Follow the component composition pattern:

```tsx
// ❌ Bad - Monolithic component with complex inline conditionals
function ComplexCard({ title, isActive, hasImage, image }) {
  return (
    <div className={`p-4 rounded-lg ${isActive ? 'bg-primary' : 'bg-card'}`}>
      <div className="flex">
        {hasImage && <img src={image} className="w-12 h-12" />}
        <h3 className={`text-lg font-bold ${isActive ? 'text-white' : 'text-foreground'}`}>{title}</h3>
      </div>
      {/* More complex conditionals */}
    </div>
  )
}

// ✅ Good - Composed of reusable components
function Card({ children, className, isActive }) {
  return (
    <div className={cn("p-4 rounded-lg", isActive ? "bg-primary" : "bg-card", className)}>
      {children}
    </div>
  )
}

function CardHeader({ children }) {
  return <div className="flex items-center space-x-4">{children}</div>
}

function CardImage({ src, alt }) {
  return <img src={src} alt={alt} className="w-12 h-12 rounded" />
}

function CardTitle({ children, isActive }) {
  return (
    <h3 className={cn("text-lg font-bold", isActive ? "text-primary-foreground" : "text-foreground")}>
      {children}
    </h3>
  )
}

// Usage
function MyCard({ title, image, isActive }) {
  return (
    <Card isActive={isActive}>
      <CardHeader>
        {image && <CardImage src={image} alt={title} />}
        <CardTitle isActive={isActive}>{title}</CardTitle>
      </CardHeader>
    </Card>
  )
}
```

## Best Practices Checklist

When creating or modifying components, ensure you:

✅ Use the theme system for all colors and styling  
✅ Create variants with cva for components with multiple visual states  
✅ Split complex components into smaller, reusable ones  
✅ Use the `cn()` utility for conditional classes  
✅ Maintain consistent prop naming across related components  
✅ Export component types for better developer experience  
✅ Add sensible default variants  
✅ Use React.forwardRef for components that might need ref forwarding  
✅ Add proper display names to components  
✅ Ensure proper accessibility attributes  
✅ Apply responsive design consistently  

## Common Anti-Patterns to Avoid

❌ Direct HSL references in className (e.g., `bg-[hsl(var(--custom-color))]`)  
❌ Inline styles for theming  
❌ Deep nesting of conditional rendering  
❌ Complex class concatenations without the `cn()` utility  
❌ Inconsistent naming conventions across components  
❌ Hardcoded values for spacing, colors, or typography  
❌ Redundant component implementations instead of reusing existing ones  
❌ Monolithic, hard-to-maintain components  
❌ Ignoring accessibility concerns  

## Example Implementations

### Navigation Item Component

Here's a real-world example from our sidebar navigation items:

```tsx
// app-nav-item.tsx
import * as React from "react"
import Link from "next/link"
import { LucideIcon } from "lucide-react"
import { cva, type VariantProps } from "class-variance-authority"
import { cn } from "@/lib/utils"

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
  ({ className, href, icon: Icon, label, variant, size, isActive, showTooltip = false, onNavigate, ...props }, ref) => {
    // Implementation details...
  }
)

AppNavItem.displayName = "AppNavItem"
```

### Usage Example

```tsx
// Using the component
import { Home } from "lucide-react"
import { AppNavItem } from "@/components/ui/app-nav-item"

function Navigation() {
  return (
    <nav className="space-y-1">
      <AppNavItem 
        href="/" 
        icon={Home} 
        label="Dashboard" 
        isActive={pathname === "/"} 
        size={isExpanded ? "default" : "icon"}
        showTooltip={!isExpanded}
      />
      {/* More navigation items */}
    </nav>
  )
}
```

By following these best practices, you'll maintain a consistent, maintainable, and accessible UI throughout the application.
