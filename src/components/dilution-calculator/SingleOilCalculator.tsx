
"use client";

import React, { useState, useEffect, useMemo } from 'react';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Slider } from '@/components/ui/slider';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Info } from 'lucide-react';

const ML_TO_DROPS_CONVERSION = 20; // 1ml = 20 drops

export const SingleOilCalculator: React.FC = () => {
  const [bottleVolume, setBottleVolume] = useState<number>(10); // Default 10ml
  const [dilutionPercentage, setDilutionPercentage] = useState<number>(2); // Default 2%
  const [calculatedDrops, setCalculatedDrops] = useState<number>(0);

  const maxBottleVolume = 500;
  const maxDilutionPercentage = 30;

  useEffect(() => {
    if (bottleVolume > 0 && dilutionPercentage > 0) {
      const drops = (bottleVolume * (dilutionPercentage / 100) * ML_TO_DROPS_CONVERSION);
      setCalculatedDrops(parseFloat(drops.toFixed(1))); // Keep one decimal place for precision if needed
    } else {
      setCalculatedDrops(0);
    }
  }, [bottleVolume, dilutionPercentage]);

  const handleVolumeChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    let value = parseFloat(event.target.value);
    if (isNaN(value)) value = 0;
    if (value < 0) value = 0;
    if (value > maxBottleVolume) value = maxBottleVolume;
    setBottleVolume(value);
  };

  const handlePercentageChange = (value: number[]) => {
    setDilutionPercentage(value[0]);
  };

  const dilutionCategory = useMemo(() => {
    if (dilutionPercentage <= 1) return "Muito Suave (Ideal para crianças, idosos, peles sensíveis)";
    if (dilutionPercentage <= 3) return "Suave (Uso facial, uso diário prolongado)";
    if (dilutionPercentage <= 5) return "Moderada (Uso corporal geral, massagens)";
    if (dilutionPercentage <= 10) return "Forte (Tratamentos localizados, curto prazo)";
    return "Muito Forte (Uso pontual e específico, com cautela)";
  }, [dilutionPercentage]);

  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle>Calculadora para Óleo Único</CardTitle>
        <CardDescription>
          Calcule a quantidade de gotas de óleo essencial para uma diluição precisa.
          (Considerando 1ml = {ML_TO_DROPS_CONVERSION} gotas)
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="space-y-2">
          <Label htmlFor="bottleVolumeSingle">Volume do Frasco (ml)</Label>
          <Input
            id="bottleVolumeSingle"
            type="number"
            value={bottleVolume === 0 ? '' : bottleVolume}
            onChange={handleVolumeChange}
            placeholder="Ex: 10"
            min="0"
            max={maxBottleVolume}
          />
           {bottleVolume > maxBottleVolume && <p className="text-xs text-destructive mt-1">Volume máximo: {maxBottleVolume}ml.</p>}
        </div>

        <div className="space-y-2">
          <div className="flex justify-between items-center">
            <Label htmlFor="dilutionPercentageSingle">Porcentagem de Diluição (%)</Label>
            <span className="text-sm font-medium text-primary">{dilutionPercentage}%</span>
          </div>
          <Slider
            id="dilutionPercentageSingle"
            min={0.1}
            max={maxDilutionPercentage}
            step={0.1}
            value={[dilutionPercentage]}
            onValueChange={handlePercentageChange}
          />
           {dilutionPercentage > maxDilutionPercentage && <p className="text-xs text-destructive mt-1">Diluição máxima recomendada: {maxDilutionPercentage}%.</p>}
        </div>
        
        <Alert variant="default" className="bg-primary/5 border-primary/20">
          <Info className="h-4 w-4 text-primary" />
          <AlertDescription className="text-primary/80">
            <strong>Categoria de Diluição:</strong> {dilutionCategory}
          </AlertDescription>
        </Alert>

        <div className="text-center pt-4">
          <p className="text-sm text-muted-foreground mb-1">Número de Gotas de Óleo Essencial:</p>
          <p className="text-3xl font-bold text-primary" data-testid="calculated-drops-single">
            {calculatedDrops}
          </p>
        </div>
      </CardContent>
    </Card>
  );
};
