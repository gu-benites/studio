"use client";

import React from 'react';
import { cn } from '@/lib/utils';

interface DilutionBottleIconProps {
  percentage: number; // 0 to 100
  className?: string;
}

export const DilutionBottleIcon: React.FC<DilutionBottleIconProps> = ({ percentage, className }) => {
  const validPercentage = Math.max(0, Math.min(100, percentage));

  // SVG viewBox dimensions
  const viewBoxWidth = 100;
  const viewBoxHeight = 150;

  // Bottle dimensions within viewBox
  const bottleBodyX = 15;
  const bottleBodyY = 50;
  const bottleBodyWidth = 70;
  const bottleBodyHeight = 90; // This is the fillable height

  const bottleNeckWidth = 30;
  const bottleNeckHeight = 20;
  const bottleNeckX = bottleBodyX + (bottleBodyWidth - bottleNeckWidth) / 2;
  const bottleNeckY = bottleBodyY - bottleNeckHeight;

  const capWidth = 40;
  const capHeight = 15;
  const capX = bottleBodyX + (bottleBodyWidth - capWidth) / 2;
  const capY = bottleNeckY - capHeight;

  // Calculate fill height based on percentage
  const fillHeight = (bottleBodyHeight * validPercentage) / 100;
  const fillY = bottleBodyY + bottleBodyHeight - fillHeight;

  return (
    <svg
      viewBox={`0 0 ${viewBoxWidth} ${viewBoxHeight}`}
      className={cn("fill-current", className)}
      xmlns="http://www.w3.org/2000/svg"
      aria-hidden="true"
    >
      {/* Liquid Fill - primary color - Rendered first to be behind the outline */}
      {validPercentage > 0 && (
        <rect
          x={bottleBodyX}
          y={fillY}
          width={bottleBodyWidth}
          height={fillHeight}
          className="text-primary" // Uses primary theme color for fill
        />
      )}

      {/* Bottle Outline - Rendered after the fill */}
      <path
        d={`M${capX},${capY} h${capWidth} v${capHeight} H${bottleNeckX + bottleNeckWidth} v${bottleNeckHeight} H${bottleBodyX + bottleBodyWidth} v${bottleBodyHeight} a5,5 0 0 1 -5,5 H${bottleBodyX + 5} a5,5 0 0 1 -5,-5 V${bottleNeckY + bottleNeckHeight} H${bottleNeckX} V${capY + capHeight} H${capX} Z`}
        className="text-border fill-transparent stroke-current" // text-border for outline, fill-transparent
        strokeWidth="2"
      />
      
      {/* Optional: Subtle gloss/highlight on the bottle - can be enhanced */}
      <path 
        d={`M${bottleBodyX + 10},${bottleBodyY + 10} Q${bottleBodyX + 15},${bottleBodyY + bottleBodyHeight / 2} ${bottleBodyX + 10},${bottleBodyY + bottleBodyHeight -10}`}
        className="text-white/30 fill-transparent stroke-current" // text-white/30 for subtle highlight
        strokeWidth="3"
        strokeLinecap="round"
      />
    </svg>
  );
};
