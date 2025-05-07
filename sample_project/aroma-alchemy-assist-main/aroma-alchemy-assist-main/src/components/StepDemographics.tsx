
import React, { useState } from 'react';
import { useFormContext } from '@/context/FormContext';
import { Gender, AgeCategory } from '@/types';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';

const StepDemographics: React.FC = () => {
  const { formData, updateFormData, nextStep } = useFormContext();
  
  const [gender, setGender] = useState<Gender>(formData.gender || 'female');
  const [ageCategory, setAgeCategory] = useState<AgeCategory>(formData.age_category || 'adult');
  const [ageSpecific, setAgeSpecific] = useState<string>(formData.age_specific || '');
  const [error, setError] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!ageSpecific) {
      setError('Por favor, informe a idade específica');
      return;
    }
    
    updateFormData({
      gender,
      age_category: ageCategory,
      age_specific: ageSpecific
    });
    nextStep();
  };

  const getAgeRange = () => {
    switch (ageCategory) {
      case 'child':
        return { min: 0, max: 12 };
      case 'teen':
        return { min: 13, max: 19 };
      case 'adult':
        return { min: 20, max: 64 };
      case 'senior':
        return { min: 65, max: 120 };
    }
  };

  const validateAge = (value: string) => {
    const range = getAgeRange();
    const age = parseInt(value);
    
    if (isNaN(age)) {
      return false;
    }
    
    return age >= range.min && age <= range.max;
  };

  return (
    <div className="step-container">
      <form onSubmit={handleSubmit}>
        <div className="mb-6">
          <Label className="text-lg mb-2 block">Gênero</Label>
          <RadioGroup 
            value={gender} 
            onValueChange={(value) => setGender(value as Gender)}
            className="flex flex-col space-y-2"
          >
            <div className="flex items-center space-x-2">
              <RadioGroupItem value="female" id="female" />
              <Label htmlFor="female">Feminino</Label>
            </div>
            <div className="flex items-center space-x-2">
              <RadioGroupItem value="male" id="male" />
              <Label htmlFor="male">Masculino</Label>
            </div>
            <div className="flex items-center space-x-2">
              <RadioGroupItem value="other" id="other" />
              <Label htmlFor="other">Outro</Label>
            </div>
          </RadioGroup>
        </div>
        
        <div className="mb-6">
          <Label htmlFor="age-category" className="text-lg mb-2 block">
            Categoria de Idade
          </Label>
          <Select 
            value={ageCategory}
            onValueChange={(value) => {
              setAgeCategory(value as AgeCategory);
              setAgeSpecific('');
            }}
          >
            <SelectTrigger>
              <SelectValue placeholder="Selecione uma categoria" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="child">Criança (0-12)</SelectItem>
              <SelectItem value="teen">Adolescente (13-19)</SelectItem>
              <SelectItem value="adult">Adulto (20-64)</SelectItem>
              <SelectItem value="senior">Idoso (65+)</SelectItem>
            </SelectContent>
          </Select>
        </div>
        
        <div className="mb-6">
          <Label htmlFor="age-specific" className="text-lg mb-2 block">
            Idade Específica
          </Label>
          <Input
            id="age-specific"
            type="number"
            value={ageSpecific}
            onChange={(e) => {
              const value = e.target.value;
              if (value === '' || validateAge(value)) {
                setAgeSpecific(value);
                setError('');
              } else {
                setError(`Por favor, insira uma idade válida para ${ageCategory === 'child' ? 'criança' : 
                  ageCategory === 'teen' ? 'adolescente' : 
                  ageCategory === 'adult' ? 'adulto' : 'idoso'}`);
              }
            }}
            placeholder={`Idade (${getAgeRange().min}-${getAgeRange().max})`}
            min={getAgeRange().min}
            max={getAgeRange().max}
          />
          {error && <p className="text-red-500 mt-2">{error}</p>}
        </div>
        
        <div className="flex justify-end">
          <Button 
            type="submit" 
            className="bg-aroma-primary hover:bg-aroma-primary/90"
            disabled={!!error}
          >
            Continuar
          </Button>
        </div>
      </form>
    </div>
  );
};

export default StepDemographics;
