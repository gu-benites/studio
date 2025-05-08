
"use client";

import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Slider } from '@/components/ui/slider';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from '@/components/ui/card';
import { X, PlusCircle, AlertCircle, Info } from 'lucide-react';
import { OilInputRow } from './OilInputRow';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { DilutionBottleIcon } from './DilutionBottleIcon'; // Import the new component

const ML_TO_DROPS_CONVERSION = 20; // 1ml = 20 drops

interface OilEntry {
  id: string;
  name: string;
  percentage: number;
  drops: number;
}

export const UnifiedDilutionCalculator: React.FC = () => {
  const [bottleVolume, setBottleVolume] = useState<number>(10); // Default 10ml
  const [oils, setOils] = useState<OilEntry[]>([
    { id: crypto.randomUUID(), name: 'Óleo Essencial', percentage: 2, drops: 0 },
  ]);
  const [totalDrops, setTotalDrops] = useState<number>(0);
  const [totalPercentage, setTotalPercentage] = useState<number>(0);

  const maxBottleVolume = 500;
  const maxSingleOilDilutionPercentage = 30; 

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

  const addOilEntry = () => {
    setOils([...oils, { id: crypto.randomUUID(), name: '', percentage: 1, drops: 0 }]);
  };

  const removeOil = (id: string) => {
    if (oils.length > 1) { 
      setOils(oils.filter(oil => oil.id !== id));
    } else {
        setOils([{ id: crypto.randomUUID(), name: 'Óleo Essencial', percentage: 2, drops: 0 }]);
    }
  };

  const updateOil = (id: string, field: keyof OilEntry, value: string | number) => {
    setOils(oils.map(oil => {
        if (oil.id === id) {
            if (field === 'percentage') {
                const numericValue = Number(value);
                let maxPercentage = 100; // Default for multi-oil
                if (oils.length === 1) {
                    maxPercentage = maxSingleOilDilutionPercentage;
                }
                return { ...oil, [field]: Math.max(0, Math.min(maxPercentage, numericValue)) };
            }
            return { ...oil, [field]: value };
        }
        return oil;
    }));
  };
  
  const handleSingleOilPercentageChange = (value: number[]) => {
    if (oils.length === 1) {
        updateOil(oils[0].id, 'percentage', value[0]);
    }
  };

  const dilutionCategory = useMemo(() => {
    const percentage = oils.length === 1 ? oils[0].percentage : totalPercentage;
    if (percentage === 0) return "Sem diluição (0%)";
    if (percentage <= 1) return "Muito Suave (Ideal para crianças, idosos, peles sensíveis)";
    if (percentage <= 3) return "Suave (Uso facial, uso diário prolongado)";
    if (percentage <= 5) return "Moderada (Uso corporal geral, massagens)";
    if (percentage <= 10) return "Forte (Tratamentos localizados, curto prazo)";
    return "Muito Forte (Uso pontual e específico, com cautela)";
  }, [oils, totalPercentage]);

  const isSingleOilMode = oils.length === 1;
  const displayPercentage = isSingleOilMode ? oils[0].percentage : totalPercentage;

  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle>Calculadora de Diluição</CardTitle>
        <CardDescription>
          Calcule a quantidade de gotas para diluição precisa.
          (1ml ≈ {ML_TO_DROPS_CONVERSION} gotas)
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 items-center">
          <div className="md:col-span-2 space-y-6">
            <div className="space-y-2">
              <Label htmlFor="bottleVolumeUnified">Volume Total do Frasco (ml)</Label>
              <Input
                id="bottleVolumeUnified"
                type="number"
                value={bottleVolume === 0 ? '' : bottleVolume}
                onChange={handleVolumeChange}
                placeholder="Ex: 10"
                min="0"
                max={maxBottleVolume}
              />
              {bottleVolume > maxBottleVolume && <p className="text-xs text-destructive mt-1">Volume máximo: {maxBottleVolume}ml.</p>}
            </div>

            {isSingleOilMode ? (
              <div className="space-y-2">
                <div className="flex justify-between items-center">
                  <Label htmlFor="dilutionPercentageSingleUnified">Porcentagem de Diluição (%)</Label>
                  <span className="text-sm font-medium text-primary">{oils[0].percentage}%</span>
                </div>
                <Slider
                  id="dilutionPercentageSingleUnified"
                  min={0}
                  max={maxSingleOilDilutionPercentage}
                  step={1}
                  value={[oils[0].percentage]}
                  onValueChange={handleSingleOilPercentageChange}
                />
                {oils[0].percentage > maxSingleOilDilutionPercentage && <p className="text-xs text-destructive mt-1">Diluição máxima recomendada: {maxSingleOilDilutionPercentage}%.</p>}
              </div>
            ) : (
              <div className="space-y-4">
                <Label>Óleos Essenciais na Mistura</Label>
                {oils.map((oil) => (
                  <OilInputRow
                    key={oil.id}
                    oil={oil}
                    onUpdate={updateOil}
                    onRemove={removeOil}
                    onPercentageChange={(newPercentage) => updateOil(oil.id, 'percentage', newPercentage)}
                    isOnlyOil={false}
                  />
                ))}
              </div>
            )}
          </div>
          
          <div className="flex flex-col items-center justify-center md:col-span-1 space-y-3">
            <DilutionBottleIcon percentage={displayPercentage} className="w-32 h-48" />
            <div className="text-center">
              <p className="text-sm text-muted-foreground mb-0.5">Total de Óleo Essencial:</p>
              <p className="text-2xl font-bold text-primary">{displayPercentage.toFixed(1)}%</p>
            </div>
          </div>
        </div>

        {isSingleOilMode ? (
          <>
            <Alert variant="default" className="bg-primary/5 border-primary/20">
              <Info className="h-4 w-4 text-primary" />
              <AlertDescription className="text-primary/80 text-sm">
                <strong>Categoria de Diluição:</strong> {dilutionCategory}
              </AlertDescription>
            </Alert>

            <div className="text-center pt-4">
              <p className="text-sm text-muted-foreground mb-1">Número de Gotas de Óleo Essencial:</p>
              <p className="text-3xl font-bold text-primary" data-testid="calculated-drops-unified">
                {oils[0].drops}
              </p>
            </div>
            <Button variant="outline" onClick={addOilEntry} className="w-full">
              <PlusCircle className="mr-2 h-4 w-4" /> Adicionar outro Óleo para criar uma mistura
            </Button>
          </>
        ) : (
          <>
            {totalPercentage !== 100 && totalPercentage > 0 && (
              <Alert variant="destructive" className="mt-2">
                <AlertCircle className="h-4 w-4" />
                <AlertDescription>
                 A soma das porcentagens ({totalPercentage.toFixed(1)}%) não é 100%. Ajuste as proporções para uma mistura precisa.
                </AlertDescription>
              </Alert>
            )}

            <div className="space-y-3 pt-4 border-t">
                <Alert variant="default" className="bg-primary/5 border-primary/20 mt-2">
                    <Info className="h-4 w-4 text-primary" />
                    <AlertDescription className="text-primary/80 text-sm">
                        <strong>Categoria da Mistura:</strong> {dilutionCategory}
                    </AlertDescription>
                </Alert>
                <div className="flex justify-between items-center text-xl font-bold mt-2">
                    <Label>Total de Gotas de Óleos Essenciais:</Label>
                    <span className="text-primary">{totalDrops}</span>
                </div>
            </div>
             <Button variant="outline" onClick={addOilEntry} className="w-full">
              <PlusCircle className="mr-2 h-4 w-4" /> Adicionar mais um Óleo
            </Button>
          </>
        )}
      </CardContent>
    </Card>
  );
};
