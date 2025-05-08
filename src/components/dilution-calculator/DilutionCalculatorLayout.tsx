
"use client";

import React, { useState } from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { SingleOilCalculator } from './SingleOilCalculator';
import { MultipleOilsCalculator } from './MultipleOilsCalculator';

export const DilutionCalculatorLayout: React.FC = () => {
  const [activeTab, setActiveTab] = useState<'single' | 'multiple'>('single');

  return (
    <Tabs defaultValue="single" className="w-full max-w-2xl mx-auto" onValueChange={(value) => setActiveTab(value as 'single' | 'multiple')}>
      <TabsList className="grid w-full grid-cols-2 mb-6">
        <TabsTrigger value="single">Óleo Único</TabsTrigger>
        <TabsTrigger value="multiple">Múltiplos Óleos</TabsTrigger>
      </TabsList>
      <TabsContent value="single">
        <SingleOilCalculator />
      </TabsContent>
      <TabsContent value="multiple">
        <MultipleOilsCalculator />
      </TabsContent>
    </Tabs>
  );
};
