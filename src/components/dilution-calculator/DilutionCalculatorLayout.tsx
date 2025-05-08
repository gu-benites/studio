
"use client";

import React from 'react';
import { UnifiedDilutionCalculator } from './UnifiedDilutionCalculator';

export const DilutionCalculatorLayout: React.FC = () => {
  return (
    <div className="w-full max-w-2xl mx-auto">
      <UnifiedDilutionCalculator />
    </div>
  );
};
