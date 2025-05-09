"use client";

import React, { useEffect } from 'react';
import { useForm, Controller, SubmitHandler } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useRouter } from 'next/navigation';
import { PersonStanding, User } from 'lucide-react';

import { useRecipeForm } from '@/contexts/RecipeFormContext';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { Slider } from '@/components/ui/slider';
import { getPotentialCauses } from '@/services/aromarx-api-client';

const ageCategories = [
  { value: "baby", label: "Bebê (0-35 meses)", min: 0, max: 35, unit: "meses", step: 1 },
  { value: "child", label: "Criança (3-9 anos)", min: 3, max: 9, unit: "anos", step: 1 },
  { value: "teen", label: "Adolescente (10-17 anos)", min: 10, max: 17, unit: "anos", step: 1 },
  { value: "adult", label: "Adulto (18-64 anos)", min: 18, max: 64, unit: "anos", step: 1 },
  { value: "senior", label: "Idoso (65+ anos)", min: 65, max: 120, unit: "anos", step: 1 },
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

const DemographicsStepComponent: React.FC = () => {
  const router = useRouter();
  // Destructure setIsFetchingCauses from useRecipeForm
  const { formData, updateFormData, setCurrentStep, setIsLoading, setIsFetchingCauses, setError, updateFormValidity } = useRecipeForm();

  const { control, handleSubmit, formState: { errors, isValid }, watch, setValue, reset, trigger } = useForm<DemographicsFormData>({
    resolver: zodResolver(demographicsSchema),
    defaultValues: {
      gender: formData.gender as "male" | "female" || undefined,
      ageCategory: formData.ageCategory || '',
      ageSpecific: formData.ageSpecific || '',
    },
    mode: 'onChange',
  });

  const watchedGender = watch("gender");
  const watchedAgeCategory = watch("ageCategory");
  const watchedAgeSpecific = watch("ageSpecific");

  const currentCategoryInfo = ageCategories.find(cat => cat.value === watchedAgeCategory);

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

  useEffect(() => {
    if (watchedAgeCategory) {
        const category = ageCategories.find(cat => cat.value === watchedAgeCategory);
        if (category) {
            const currentAgeNum = parseInt(watchedAgeSpecific, 10);
            if (isNaN(currentAgeNum) || currentAgeNum < category.min || currentAgeNum > category.max) {
                setValue("ageSpecific", String(category.min), { shouldValidate: true, shouldDirty: true });
            }
        }
    }
  }, [watchedAgeCategory, setValue, watchedAgeSpecific]);


  const onSubmitDemographics: SubmitHandler<DemographicsFormData> = async (data) => {
    let apiAgeCategoryValue = data.ageCategory;
    let apiAgeSpecificValue = data.ageSpecific;

    if (data.ageCategory === 'baby') {
      apiAgeCategoryValue = 'child';
      const months = parseInt(data.ageSpecific, 10);
      if (months < 12) apiAgeSpecificValue = '0';
      else if (months < 24) apiAgeSpecificValue = '1';
      else apiAgeSpecificValue = '2';
    }
    
    updateFormData({
      gender: data.gender,
      ageCategory: data.ageCategory,
      ageSpecific: data.ageSpecific,
    });
    
    setIsLoading(true);
    setIsFetchingCauses(true); // Set fetching causes to true
    setError(null);
    
    // Navigate immediately
    router.push('/create-recipe/causes');
    setCurrentStep('causes'); // Set current step before API call for loading screen context

    try {
      if (!formData.healthConcern) {
        throw new Error("Problema de saúde não definido.");
      }
      const apiPayload = { 
        healthConcern: formData.healthConcern,
        gender: data.gender,
        ageCategory: apiAgeCategoryValue, 
        ageSpecific: apiAgeSpecificValue,  
      };
      const potentialCauses = await getPotentialCauses(apiPayload);
      updateFormData({ potentialCausesResult: potentialCauses }); 
      // Navigation and setCurrentStep already handled above
    } catch (apiError: any) {
      setError(apiError.message || "Falha ao buscar causas potenciais.");
      console.error("API Error in DemographicsStep:", apiError);
      // Optionally, navigate back or show error on the current page (causes page)
      // router.push('/create-recipe/demographics'); // Or handle error on causes page
    } finally {
      setIsLoading(false);
      setIsFetchingCauses(false); // Set fetching causes to false after API call
    }
  };
  
  return (
    <form id="current-step-form" onSubmit={handleSubmit(onSubmitDemographics)} className="space-y-8">
      <div>
        <Label className="mb-2 block">Gênero</Label>
        <div className="flex space-x-2">
          <Button
            type="button"
            variant={watchedGender === "male" ? "default" : "outline"}
            onClick={() => {
              setValue("gender", "male", { shouldValidate: true, shouldDirty: true });
              trigger("gender");
            }}
            className="flex-1"
          >
            Masculino
            <PersonStanding className="ml-2 h-4 w-4" />
          </Button>
          <Button
            type="button"
            variant={watchedGender === "female" ? "default" : "outline"}
            onClick={() => {
                setValue("gender", "female", { shouldValidate: true, shouldDirty: true });
                trigger("gender");
            }}
            className="flex-1"
          >
            Feminino
            <User className="ml-2 h-4 w-4" />
          </Button>
        </div>
        {errors.gender && <p className="text-sm text-destructive mt-1">{errors.gender.message}</p>}
      </div>

      <div>
        <Label className="mb-2 block">Categoria de Idade</Label>
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
          {ageCategories.map(cat => (
            <Button
              key={cat.value}
              type="button"
              variant={watchedAgeCategory === cat.value ? "default" : "outline"}
              onClick={() => {
                setValue("ageCategory", cat.value, { shouldValidate: true, shouldDirty: true });
                setValue("ageSpecific", String(cat.min), { shouldValidate: true, shouldDirty: true });
                trigger("ageCategory");
              }}
              className="w-full h-auto py-3 group"
            >
              <div className="flex flex-col items-center justify-center">
                <span className="text-sm">{cat.label.split('(')[0].trim()}</span>
                <span
                  className={`text-xs font-normal ${
                    watchedAgeCategory === cat.value
                      ? 'text-primary-foreground opacity-75' 
                      : 'text-muted-foreground group-hover:text-accent-foreground' 
                  }`}
                >
                  {`${cat.min}-${cat.max} ${cat.unit}`}
                </span>
              </div>
            </Button>
          ))}
        </div>
        {errors.ageCategory && <p className="text-sm text-destructive mt-1">{errors.ageCategory.message}</p>}
      </div>
      
      {currentCategoryInfo && (
        <div>
            <div className="flex justify-between items-center mb-2">
                <Label htmlFor="ageSpecificSlider">Idade Específica: <span className="font-semibold">{watchedAgeSpecific} {currentCategoryInfo.unit}</span></Label>
            </div>
            <Controller
                name="ageSpecific"
                control={control}
                render={({ field }) => (
                <div>
                    <Slider
                    id="ageSpecificSlider"
                    min={currentCategoryInfo.min}
                    max={currentCategoryInfo.max}
                    step={currentCategoryInfo.step}
                    value={[parseInt(field.value, 10) || currentCategoryInfo.min]}
                    onValueChange={(value) => {
                        field.onChange(String(value[0]));
                        trigger("ageSpecific");
                    }}
                    disabled={!watchedAgeCategory}
                    className="mb-1"
                    />
                    <div className="flex justify-between text-xs text-muted-foreground px-1">
                    <span>{currentCategoryInfo.min}</span>
                    <span>{currentCategoryInfo.max}</span>
                    </div>
                    <p className="text-xs text-muted-foreground text-center mt-1">{currentCategoryInfo.unit}</p>
                </div>
                )}
            />
            {errors.ageSpecific && <p className="text-sm text-destructive mt-1">{errors.ageSpecific.message}</p>}
        </div>
      )}
    </form>
  );
};

const DemographicsStep = React.memo(DemographicsStepComponent);
DemographicsStep.displayName = 'DemographicsStep';
export default DemographicsStep;
