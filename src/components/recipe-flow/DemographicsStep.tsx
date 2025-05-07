
"use client";

import React, { useEffect } from 'react';
import { useForm, Controller, SubmitHandler } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useRouter } from 'next/navigation';

import { useRecipeForm } from '@/contexts/RecipeFormContext';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { getPotentialCauses } from '@/services/aromarx-api-client';

const ageCategories = [
  { value: "baby", label: "Bebê (0-35 meses)", min: 0, max: 35, unit: "meses" },
  { value: "child", label: "Criança (3-9 anos)", min: 3, max: 9, unit: "anos" },
  { value: "teen", label: "Adolescente (10-17 anos)", min: 10, max: 17, unit: "anos" },
  { value: "adult", label: "Adulto (18-64 anos)", min: 18, max: 64, unit: "anos" },
  { value: "senior", label: "Idoso (65+ anos)", min: 65, max: 120, unit: "anos" },
];

const demographicsSchema = z.object({
  gender: z.enum(["male", "female"], { required_error: "Gênero é obrigatório." }),
  ageCategory: z.string().min(1, "Categoria de idade é obrigatória."),
  ageSpecific: z.string().min(1, "Idade específica é obrigatória."),
}).superRefine((data, ctx) => {
  const ageNum = parseInt(data.ageSpecific, 10);
  if (isNaN(ageNum)) {
    ctx.addIssue({
      code: z.ZodIssueCode.custom,
      message: "Idade específica deve ser um número.",
      path: ["ageSpecific"],
    });
    return;
  }

  const categoryInfo = ageCategories.find(cat => cat.value === data.ageCategory);
  if (!categoryInfo) {
    ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: "Categoria de idade inválida selecionada.",
        path: ["ageCategory"],
      });
    return;
  }

  if (ageNum < categoryInfo.min || ageNum > categoryInfo.max) {
    ctx.addIssue({
      code: z.ZodIssueCode.custom,
      message: `Para ${categoryInfo.label.toLowerCase()}, a idade deve ser entre ${categoryInfo.min} e ${categoryInfo.max} ${categoryInfo.unit}.`,
      path: ["ageSpecific"],
    });
  }
});

type DemographicsFormData = z.infer<typeof demographicsSchema>;

const DemographicsStep: React.FC = () => {
  const router = useRouter();
  const { formData, updateFormData, setCurrentStep, setIsLoading, setError, updateFormValidity } = useRecipeForm();

  const { control, handleSubmit, formState: { errors, isValid, isSubmitting }, watch, reset } = useForm<DemographicsFormData>({
    resolver: zodResolver(demographicsSchema),
    defaultValues: {
      gender: formData.gender as "male" | "female" || undefined,
      ageCategory: formData.ageCategory || '',
      ageSpecific: formData.ageSpecific || '',
    },
    mode: 'onChange', 
  });

  // Initialize form with context data if available
  useEffect(() => {
    if (formData.gender && formData.ageCategory && formData.ageSpecific) {
      reset({
        gender: formData.gender as "male" | "female",
        ageCategory: formData.ageCategory,
        ageSpecific: formData.ageSpecific,
      });
    }
  }, [formData.gender, formData.ageCategory, formData.ageSpecific, reset]);


  useEffect(() => {
    updateFormValidity(isValid);
  }, [isValid, updateFormValidity]);

  const watchedAgeCategory = watch("ageCategory");
  const currentCategoryInfo = ageCategories.find(cat => cat.value === watchedAgeCategory);
  const ageSpecificLabel = currentCategoryInfo ? `Idade Específica (${currentCategoryInfo.unit})` : "Idade Específica";
  const ageSpecificPlaceholder = currentCategoryInfo ? `Ex: ${Math.floor((currentCategoryInfo.min + currentCategoryInfo.max) / 2)}` : "Ex: 30";


  const onSubmitDemographics: SubmitHandler<DemographicsFormData> = async (data) => {
    let apiAgeCategoryValue = data.ageCategory;
    let apiAgeSpecificValue = data.ageSpecific;

    // API expects "child" for babies and age in years (0, 1, or 2)
    if (data.ageCategory === 'baby') {
      apiAgeCategoryValue = 'child'; 
      const months = parseInt(data.ageSpecific, 10);
      if (months < 12) apiAgeSpecificValue = '0'; // 0 years old
      else if (months < 24) apiAgeSpecificValue = '1'; // 1 year old
      else apiAgeSpecificValue = '2'; // 2 years old
    }
    
    updateFormData({
      gender: data.gender,
      ageCategory: data.ageCategory, // Store original category for display/logic
      ageSpecific: data.ageSpecific,   // Store original specific age
    });
    
    setIsLoading(true);
    setError(null);
    try {
      if (!formData.healthConcern) {
        throw new Error("Problema de saúde não definido.");
      }
      const apiPayload = { // This payload is for the API call
        healthConcern: formData.healthConcern,
        gender: data.gender,
        ageCategory: apiAgeCategoryValue, // Use potentially modified category for API
        ageSpecific: apiAgeSpecificValue,   // Use potentially modified age for API
      };
      const potentialCauses = await getPotentialCauses(apiPayload);
      updateFormData({ potentialCausesResult: potentialCauses }); // Store the API result
      setCurrentStep('causes');
      router.push('/create-recipe/causes');
    } catch (apiError: any) {
      setError(apiError.message || "Falha ao buscar causas potenciais.");
      console.error("API Error in DemographicsStep:", apiError);
    } finally {
      setIsLoading(false);
    }
  };
  
  return (
    // The form ID matches the default in RecipeStepLayout, or can be passed as a prop
    <form id="current-step-form" onSubmit={handleSubmit(onSubmitDemographics)} className="space-y-6">
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
                {ageCategories.map(cat => (
                  <SelectItem key={cat.value} value={cat.value}>{cat.label}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          )}
        />
        {errors.ageCategory && <p className="text-sm text-destructive mt-1">{errors.ageCategory.message}</p>}
      </div>

      <div>
        <Label htmlFor="ageSpecific">{ageSpecificLabel}</Label>
        <Controller
          name="ageSpecific"
          control={control}
          render={({ field }) => <Input id="ageSpecific" type="number" placeholder={ageSpecificPlaceholder} {...field} />}
        />
        {errors.ageSpecific && <p className="text-sm text-destructive mt-1">{errors.ageSpecific.message}</p>}
      </div>
      
       {/* The actual submit button is in RecipeStepLayout. This form will be submitted by it. */}
    </form>
  );
};

export default DemographicsStep;
