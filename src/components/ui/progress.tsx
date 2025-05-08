"use client"

import * as React from "react"
import * as ProgressPrimitive from "@radix-ui/react-progress"

import { cn } from "@/lib/utils"

interface ProgressProps extends React.ComponentPropsWithoutRef<typeof ProgressPrimitive.Root> {
  indicatorClassName?: string;
  // value prop is already part of React.ComponentPropsWithoutRef<typeof ProgressPrimitive.Root>
}

const Progress = React.forwardRef<
  React.ElementRef<typeof ProgressPrimitive.Root>,
  ProgressProps
>(({ className, value, indicatorClassName, ...rootProps }, ref) => {
  // 'indicatorClassName' is destructured and will not be in 'rootProps'.
  // 'value' is destructured and passed explicitly to ProgressPrimitive.Root.
  return (
    <ProgressPrimitive.Root
      ref={ref}
      className={cn(
        "relative h-4 w-full overflow-hidden rounded-full bg-secondary", // Default styles for Root
        className // User-provided styles for Root
      )}
      value={value} // Pass value explicitly
      {...rootProps} // Spread remaining valid Root props
    >
      <ProgressPrimitive.Indicator
        className={cn(
          "h-full w-full flex-1 bg-primary transition-all", // Default styles for Indicator
          indicatorClassName // User-provided styles for Indicator
        )}
        style={{ transform: `translateX(-${100 - (value || 0)}%)` }}
      />
    </ProgressPrimitive.Root>
  )
})
Progress.displayName = ProgressPrimitive.Root.displayName

export { Progress }
