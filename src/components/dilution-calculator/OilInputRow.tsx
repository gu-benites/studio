
"use client";

import React from 'react';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Slider } from '@/components/ui/slider';
import { Button } from '@/components/ui/button';
import { X, GripVertical } from 'lucide-react'; // GripVertical for potential drag-and-drop later

interface OilEntry {
  id: string;
  name: string;
  percentage: number;
  drops: number;
}

interface OilInputRowProps {
  oil: OilEntry;
  onUpdate: (id: string, field: keyof OilEntry, value: string | number) => void;
  onRemove: (id: string) => void;
  onPercentageChange: (newPercentage: number) => void;
  isOnlyOil: boolean;
}

export const OilInputRow: React.FC<OilInputRowProps> = ({ oil, onUpdate, onRemove, onPercentageChange, isOnlyOil }) => {
  return (
    <div className="p-4 border rounded-lg space-y-3 bg-card shadow-sm">
      <div className="flex items-center justify-between">
        <Label htmlFor={`oilName-${oil.id}`} className="sr-only">Nome do Óleo (Opcional)</Label>
        <Input
          id={`oilName-${oil.id}`}
          type="text"
          placeholder="Nome do Óleo (Opcional)"
          value={oil.name}
          onChange={(e) => onUpdate(oil.id, 'name', e.target.value)}
          className="flex-grow text-sm"
        />
        {!isOnlyOil && (
          <Button variant="ghost" size="icon" onClick={() => onRemove(oil.id)} className="ml-2 text-muted-foreground hover:text-destructive" aria-label="Remover óleo">
            <X className="h-4 w-4" />
          </Button>
        )}
      </div>
      
      <div className="space-y-1">
        <div className="flex justify-between items-center">
            <Label htmlFor={`oilPercentage-${oil.id}`} className="text-xs text-muted-foreground">Porcentagem Individual</Label>
            <span className="text-sm font-medium text-primary">{oil.percentage}%</span>
        </div>
        <Slider
          id={`oilPercentage-${oil.id}`}
          min={0}
          max={100} 
          step={0.1}
          value={[oil.percentage]}
          onValueChange={(value) => onPercentageChange(value[0])}
        />
      </div>

      <div className="text-right">
        <p className="text-xs text-muted-foreground">Gotas deste óleo: <span className="font-semibold text-foreground">{oil.drops}</span></p>
      </div>
    </div>
  );
};
