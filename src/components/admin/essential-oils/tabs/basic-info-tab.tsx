'use client';

import { Control, Controller, FieldValues } from 'react-hook-form';
import {
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { MultiSelect } from '@/components/ui/multi-select';

interface BasicInfoTabProps {
  control: Control<FieldValues>;
}

export function BasicInfoTab({ control }: BasicInfoTabProps) {
  const plantParts = [
    'Bark', 'Leaves', 'Flowers', 'Roots', 'Seeds', 'Fruits', 'Resin', 'Whole Plant'
  ];

  return (
    <>
      <FormField
        control={control}
        name="name_english"
        render={({ field }) => (
          <FormItem>
            <FormLabel>English Name</FormLabel>
            <FormControl>
              <Input placeholder="Enter essential oil name in English" {...field} />
            </FormControl>
            <FormDescription>
              Provide the common or commercial name of the essential oil.
            </FormDescription>
            <FormMessage />
          </FormItem>
        )}
      />

      <FormField
        control={control}
        name="name_scientific"
        render={({ field }) => (
          <FormItem>
            <FormLabel>Scientific Name</FormLabel>
            <FormControl>
              <Input placeholder="Enter scientific botanical name" {...field} />
            </FormControl>
            <FormDescription>
              Provide the precise botanical/Latin name of the plant.
            </FormDescription>
            <FormMessage />
          </FormItem>
        )}
      />

      <FormField
        control={control}
        name="name_portuguese"
        render={({ field }) => (
          <FormItem>
            <FormLabel>Portuguese Name</FormLabel>
            <FormControl>
              <Input placeholder="Enter essential oil name in Portuguese" {...field} />
            </FormControl>
            <FormDescription>
              Provide the name of the essential oil in Portuguese.
            </FormDescription>
            <FormMessage />
          </FormItem>
        )}
      />

      <FormField
        control={control}
        name="plant_parts"
        render={({ field }) => (
          <FormItem>
            <FormLabel>Plant Parts Used</FormLabel>
            <FormControl>
              <MultiSelect
                options={plantParts}
                value={field.value || []}
                onChange={field.onChange}
                placeholder="Select plant parts used"
              />
            </FormControl>
            <FormDescription>
              Select the parts of the plant used in this essential oil extraction.
            </FormDescription>
            <FormMessage />
          </FormItem>
        )}
      />

      <FormField
        control={control}
        name="general_description"
        render={({ field }) => (
          <FormItem>
            <FormLabel>General Description</FormLabel>
            <FormControl>
              <Textarea
                placeholder="Provide a comprehensive description of the essential oil"
                {...field}
              />
            </FormControl>
            <FormDescription>
              Write a detailed description about the essential oil, its origin, and characteristics.
            </FormDescription>
            <FormMessage />
          </FormItem>
        )}
      />
    </>
  );
}
