import * as React from "react";
import { cva, type VariantProps } from "class-variance-authority";

import { cn } from "@/lib/utils";
import { Badge } from "@/components/ui/badge"; // Assuming Badge component exists

interface RelevancyBadgeProps extends React.HTMLAttributes<HTMLDivElement> {
  score: 1 | 2 | 3 | 4 | 5;
  maxScore?: number;
  size?: "small" | "default"; // For potential future use, maps to text/padding
}

const RelevancyBadge = React.forwardRef<HTMLDivElement, RelevancyBadgeProps>(
  ({ className, score, maxScore = 5, size = "small", ...props }, ref) => {
    let bgColor = "";
    let textColor = "";

    switch (score) {
      case 5: // Medium Green
        bgColor = "bg-[#6CC15A]";
        textColor = "text-white";
        break;
      case 4: // Lime Green
        bgColor = "bg-[#CBE453]";
        textColor = "text-slate-900";
        break;
      case 3: // Gold Yellow
        bgColor = "bg-[#F9D66B]";
        textColor = "text-slate-900";
        break;
      case 2: // Salmon Orange
        bgColor = "bg-[#FA947C]";
        textColor = "text-white";
        break;
      case 1: // Pinkish Red
        bgColor = "bg-[#FE737C]";
        textColor = "text-white";
        break;
      default:
        bgColor = "bg-gray-400";
        textColor = "text-white";
    }

    const sizeClasses = size === 'small' ? 'text-xs px-2.5 py-0.5' : 'text-sm px-3 py-1';

    return (
      <Badge
        className={cn(
          bgColor,
          textColor,
          sizeClasses, 
          "font-semibold", 
          "border-none", // Added to remove default badge border if any
          className
        )}
        ref={ref}
        {...props}
      >
        Relevância: {score}/{maxScore}
      </Badge>
    );
  }
);
RelevancyBadge.displayName = "RelevancyBadge";

export { RelevancyBadge };
