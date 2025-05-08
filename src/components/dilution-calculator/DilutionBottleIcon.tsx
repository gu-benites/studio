"use client";

import React from 'react';
import { cn } from '@/lib/utils';

interface DilutionBottleIconProps {
  percentage: number; // 0 to 100
  className?: string;
}

export const DilutionBottleIcon: React.FC<DilutionBottleIconProps> = ({ percentage, className }) => {
  const validPercentage = Math.max(0, Math.min(100, percentage));

  // SVG viewBox dimensions from user's SVG
  const viewBoxWidth = 100;
  const viewBoxHeight = 200;

  // Dimensions for the fillable part of the bottle body
  // Based on the path: M 25 162 L 25 90 ... L 75 90 L 75 162 ...
  const fillRectX = 25;
  const fillRectYStart = 90; // Top of the straight part of the bottle body
  const fillRectYEnd = 162;   // Bottom of the straight part of the bottle body
  const fillRectWidth = 50;   // 75 - 25
  const fillableHeight = fillRectYEnd - fillRectYStart; // 162 - 90 = 72

  // Calculate fill height and Y position based on percentage
  const currentFillHeight = (fillableHeight * validPercentage) / 100;
  const currentFillY = fillRectYStart + (fillableHeight - currentFillHeight);

  return (
    <svg
      viewBox={`0 0 ${viewBoxWidth} ${viewBoxHeight}`}
      className={cn("fill-current", className)} // fill-current will be used by rect for liquid
      xmlns="http://www.w3.org/2000/svg"
      aria-hidden="true"
    >
      {/* Liquid Fill - primary color - Rendered first to be behind the outline */}
      {validPercentage > 0 && (
        <rect
          x={fillRectX}
          y={currentFillY}
          width={fillRectWidth}
          height={currentFillHeight}
          className="text-primary" // Uses primary theme color for fill
        />
      )}

      {/* Bottle Outline Path - from user */}
      <path
        d="M 25 162 L 25 90 A 13 20 0 0 1 38 70 L 62 70 A 13 20 0 0 1 75 90 L 75 162 A 8 8 0 0 1 67 170 L 33 170 A 8 8 0 0 1 25 162 Z"
        stroke="currentColor" // Use currentColor for theme-aware stroke
        strokeWidth="2"
        fill="transparent" // Ensure path itself is transparent
        className="text-border" // Use border color from theme for the outline
      />

      {/* Bottle Cap - from user, adapted for theming */}
      <rect
        x="32"
        y="46"
        width="36"
        height="24"
        rx="4"
        fill="hsl(var(--muted-foreground))" // Themed cap color
        stroke="currentColor" // Use currentColor for theme-aware stroke
        strokeWidth="2"
        className="text-border" // Use border color from theme for the cap outline
      />
    </svg>
  );
};