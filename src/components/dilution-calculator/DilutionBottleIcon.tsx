"use client";

import React from 'react';
import { cn } from '@/lib/utils';

interface DilutionBottleIconProps {
  percentage: number; // 0 to 100
  className?: string;
}

export const DilutionBottleIcon: React.FC<DilutionBottleIconProps> = ({ percentage, className }) => {
  const validPercentage = Math.max(0, Math.min(100, percentage));

  const viewBoxWidth = 100;
  const viewBoxHeight = 200;

  const fillRectX = 25;
  const fillRectYStart = 90; 
  const fillRectYEnd = 162;   
  const fillRectWidth = 50;   
  const fillableHeight = fillRectYEnd - fillRectYStart; // 72

  const currentFillHeight = (fillableHeight * validPercentage) / 100;
  const currentFillY = fillRectYStart + (fillableHeight - currentFillHeight);
  
  const clipPathId = "bottleClipPath";

  return (
    <svg
      viewBox={`0 0 ${viewBoxWidth} ${viewBoxHeight}`}
      className={cn("fill-current", className)} 
      xmlns="http://www.w3.org/2000/svg"
      aria-hidden="true"
    >
      <defs>
        <clipPath id={clipPathId}>
          {/* This path defines the inner shape of the bottle body for clipping the liquid */}
          <path d="M 25 90 L 25 154 A 8 8 0 0 0 33 162 L 67 162 A 8 8 0 0 0 75 154 L 75 90 Z" />
        </clipPath>
      </defs>

      {/* Liquid Fill - primary color - Rendered first to be behind the outline */}
      {validPercentage > 0 && (
        <rect
          x={fillRectX}
          y={currentFillY} 
          width={fillRectWidth}
          height={currentFillHeight}
          className="text-primary" 
          clipPath={`url(#${clipPathId})`} // Apply the clipPath
        />
      )}

      {/* Bottle Outline Path */}
      <path
        d="M 25 162 L 25 90 A 13 20 0 0 1 38 70 L 62 70 A 13 20 0 0 1 75 90 L 75 162 A 8 8 0 0 1 67 170 L 33 170 A 8 8 0 0 1 25 162 Z"
        stroke="currentColor" 
        strokeWidth="2"
        fill="transparent" 
        className="text-border" 
      />

      {/* Bottle Cap */}
      <rect
        x="32"
        y="46"
        width="36"
        height="24"
        rx="4"
        fill="hsl(var(--muted-foreground))" 
        stroke="currentColor" 
        strokeWidth="2"
        className="text-border" 
      />
    </svg>
  );
};
