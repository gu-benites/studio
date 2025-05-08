
"use client";

import React, { useState, useEffect, useCallback } from 'react';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Slider } from '@/components/ui/slider';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { X, PlusCircle, AlertCircle } from 'lucide-react';
import { OilInputRow } from './OilInputRow'; // To be created

const ML_TO_DROPS_CONVERSION = 20; // 1ml = 20 drops

interface OilEntry {
  id: string;
  name: string;
  percentage: number;
  drops: number;
}

export const MultipleOilsCalculator: React.FC = () => {
  const [bottleVolume, setBottleVolume] = useState<number>(10); // Default 10ml
  const [oils, setOils] = useState<OilEntry[]>([
    { id: crypto.randomUUID(), name: '', percentage: 2, drops: 0 }, // Start with one oil at 2%
  ]);
  const [totalDrops, setTotalDrops] = useState<number>(0);
  const [totalPercentage, setTotalPercentage] = useState<number>(0);

  const maxBottleVolume = 500;

  const calculateDropsForOil = useCallback((percentage: number): number => {
    if (bottleVolume > 0 && percentage > 0) {
      const drops = (bottleVolume * (percentage / 100) * ML_TO_DROPS_CONVERSION);
      return parseFloat(drops.toFixed(1));
    }
    return 0;
  }, [bottleVolume]);

  useEffect(() => {
    let currentTotalDrops = 0;
    let currentTotalPercentage = 0;
    const updatedOils = oils.map(oil => {
      const drops = calculateDropsForOil(oil.percentage);
      currentTotalDrops += drops;
      currentTotalPercentage += oil.percentage;
      return { ...oil, drops };
    });
    // Only update if there's an actual change to avoid infinite loops if objects are new but values same
    if (JSON.stringify(oils) !== JSON.stringify(updatedOils)) {
      setOils(updatedOils);
    }
    setTotalDrops(parseFloat(currentTotalDrops.toFixed(1)));
    setTotalPercentage(parseFloat(currentTotalPercentage.toFixed(1)));
  }, [bottleVolume, oils, calculateDropsForOil]);

  const handleVolumeChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    let value = parseFloat(event.target.value);
    if (isNaN(value)) value = 0;
    if (value < 0) value = 0;
    if (value > maxBottleVolume) value = maxBottleVolume;
    setBottleVolume(value);
  };

  const addOil = () => {
    setOils([...oils, { id: crypto.randomUUID(), name: '', percentage: 1, drops: 0 }]); // New oils default to 1%
  };

  const removeOil = (id: string) => {
    setOils(oils.filter(oil => oil.id !== id));
  };

  const updateOil = (id: string, field: keyof OilEntry, value: string | number) => {
    setOils(oils.map(oil => oil.id === id ? { ...oil, [field]: field === 'percentage' ? Math.max(0, Math.min(100, Number(value))) : value } : oil));
  };
  
  const handleOilPercentageChange = (id: string, newPercentage: number) => {
    updateOil(id, 'percentage', newPercentage);
  };


  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle>Calculadora para Múltiplos Óleos</CardTitle>
        <CardDescription>
          Calcule a diluição para misturas com vários óleos essenciais.
          (Considerando 1ml = {ML_TO_DROPS_CONVERSION} gotas)
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="space-y-2">
          <Label htmlFor="bottleVolumeMultiple">Volume Total do Frasco (ml)</Label>
          <Input
            id="bottleVolumeMultiple"
            type="number"
            value={bottleVolume === 0 ? '' : bottleVolume}
            onChange={handleVolumeChange}
            placeholder="Ex: 30"
            min="0"
            max={maxBottleVolume}
          />
          {bottleVolume > maxBottleVolume && <p className="text-xs text-destructive mt-1">Volume máximo: {maxBottleVolume}ml.</p>}
        </div>

        <div className="space-y-4">
          <Label>Óleos Essenciais na Mistura</Label>
          {oils.map((oil, index) => (
            <OilInputRow
              key={oil.id}
              oil={oil}
              onUpdate={updateOil}
              onRemove={removeOil}
              onPercentageChange={(newPercentage) => handleOilPercentageChange(oil.id, newPercentage)}
              isOnlyOil={oils.length === 1}
            />
          ))}
        </div>

        <Button variant="outline" onClick={addOil} className="w-full">
          <PlusCircle className="mr-2 h-4 w-4" /> Adicionar Óleo
        </Button>

        {totalPercentage !== 100 && totalPercentage > 0 && (
          <div className="p-3 bg-destructive/10 text-destructive border border-destructive/20 rounded-md text-sm flex items-center">
            <AlertCircle className="mr-2 h-4 w-4" />
            A soma das porcentagens ({totalPercentage.toFixed(1)}%) não é 100%. Ajuste as proporções.
          </div>
        )}

        <div className="space-y-3 pt-4 border-t">
            <div className="flex justify-between items-center text-lg font-semibold">
                <Label>Percentual Total da Mistura:</Label>
                <span className={totalPercentage === 100 ? "text-green-600" : totalPercentage > 0 ? "text-destructive" : "text-primary"}>
                    {totalPercentage.toFixed(1)}%
                </span>
            </div>
            <div className="flex justify-between items-center text-xl font-bold">
                <Label>Total de Gotas de Óleos Essenciais:</Label>
                <span className="text-primary">{totalDrops}</span>
            </div>
        </div>
      </CardContent>
    </Card>
  );
};
