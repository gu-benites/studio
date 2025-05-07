
"use client";

import React from 'react';
import { useForm, Controller, SubmitHandler } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useRouter } from 'next/navigation';

import { useRecipeForm } from '@/contexts/RecipeFormContext';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button'; // Not used for submit, layout handles it
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { getPotentialCauses } from '@/services/aromarx-api-client';
import type { RecipeFormData } from '@/contexts/RecipeFormContext';

const demographicsSchema = z.object({
  gender: z.string().min(1, "Gênero é obrigatório."),
  ageCategory: z.string().min(1, "Categoria de idade é obrigatória."),
  ageSpecific: z.string()
    .min(1, "Idade específica é obrigatória.")
    .regex(/^\d+$/, "Idade específica deve ser um número.")
    .refine(val => parseInt(val) > 0 && parseInt(val) < 120, "Idade inválida."),
});

type DemographicsFormData = z.infer<typeof demographicsSchema>;

const DemographicsStep: React.FC = () => {
  const router = useRouter();
  const { formData, updateFormData, setCurrentStep, setIsLoading, setError } = useRecipeForm();

  const { control, handleSubmit, formState: { errors, isValid, isSubmitting } } = useForm<DemographicsFormData>({
    resolver: zodResolver(demographicsSchema),
    defaultValues: {
      gender: formData.gender || '',
      ageCategory: formData.ageCategory || '',
      ageSpecific: formData.ageSpecific || '',
    },
    mode: 'onChange', // Validate on change for better UX
  });

  const onSubmit: SubmitHandler<DemographicsFormData> = async (data) => {
    updateFormData({
      gender: data.gender,
      ageCategory: data.ageCategory,
      ageSpecific: data.ageSpecific,
    });
    
    setIsLoading(true);
    setError(null);
    try {
      if (!formData.healthConcern) {
        throw new Error("Problema de saúde não definido.");
      }
      const apiPayload = {
        healthConcern: formData.healthConcern,
        gender: data.gender,
        ageCategory: data.ageCategory,
        ageSpecific: data.ageSpecific,
      };
      const potentialCauses = await getPotentialCauses(apiPayload);
      updateFormData({ potentialCausesResult: potentialCauses });
      setCurrentStep('causes');
      router.push('/create-recipe/causes');
    } catch (apiError: any) {
      setError(apiError.message || "Falha ao buscar causas potenciais.");
      console.error("API Error in DemographicsStep:", apiError);
    } finally {
      setIsLoading(false);
    }
  };
  
  // Access layout's Next button via form submission
  // The RecipeStepLayout will provide navigation buttons.
  // We need to trigger form submission when its "Next" is clicked.
  // This is implicitly handled if this component is the main form inside the layout.

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
      <div>
        <Label htmlFor="gender">Gênero</Label>
        <Controller
          name="gender"
          control={control}
          render={({ field }) => (
            <Select onValueChange={field.onChange} defaultValue={field.value}>
              <SelectTrigger id="gender">
                <SelectValue placeholder="Selecione o gênero" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="male">Masculino</SelectItem>
                <SelectItem value="female">Feminino</SelectItem>
              </SelectContent>
            </Select>
          )}
        />
        {errors.gender && <p className="text-sm text-destructive mt-1">{errors.gender.message}</p>}
      </div>

      <div>
        <Label htmlFor="ageCategory">Categoria de Idade</Label>
        <Controller
          name="ageCategory"
          control={control}
          render={({ field }) => (
            <Select onValueChange={field.onChange} defaultValue={field.value}>
              <SelectTrigger id="ageCategory">
                <SelectValue placeholder="Selecione a categoria de idade" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="child">Criança</SelectItem>
                <SelectItem value="teen">Adolescente</SelectItem>
                <SelectItem value="adult">Adulto</SelectItem>
                <SelectItem value="senior">Idoso</SelectItem>
              </SelectContent>
            </Select>
          )}
        />
        {errors.ageCategory && <p className="text-sm text-destructive mt-1">{errors.ageCategory.message}</p>}
      </div>

      <div>
        <Label htmlFor="ageSpecific">Idade Específica</Label>
        <Controller
          name="ageSpecific"
          control={control}
          render={({ field }) => <Input id="ageSpecific" type="number" placeholder="Ex: 30" {...field} />}
        />
        {errors.ageSpecific && <p className="text-sm text-destructive mt-1">{errors.ageSpecific.message}</p>}
      </div>
      
      {/* Submit button is part of RecipeStepLayout, it will trigger this form's onSubmit */}
      {/* Add a hidden submit button to allow RecipeStepLayout to trigger form submission programmatically if needed,
          or ensure the layout's button has type="submit" and is part of this form,
          or pass onSubmit to the layout. The RecipeStepLayout is designed to wrap this form.
      */}
       <button type="submit" disabled={!isValid || isSubmitting} className="hidden" aria-hidden="true">
        Internal Submit
      </button>
    </form>
  );
};

export default DemographicsStep;
