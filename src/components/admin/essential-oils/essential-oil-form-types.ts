import * as z from "zod";

export type Category = {
  id: string;
  name: string;
  description: string | null;
};

export type Property = {
  id: string;
  name: string;
  description: string | null;
};

export type Country = {
  id: string;
  name: string;
  code: string; // Used in frontend components
  iso_code_2?: string; // From database
  iso_code_3?: string; // From database
};

export type ExtractionMethod = {
  id: string;
  name: string;
  description: string | null;
};

export type AromaticDescriptor = {
  id: string;
  name: string; // Changed from descriptor to name for consistency
  description: string | null;
};

export type ChemicalCompound = {
  id: string;
  name: string;
  description: string | null;
};

export type HealthIssue = {
  id: string;
  name: string;
  description: string | null;
};

export type PlantPart = {
  id: string;
  name: string;
  description: string | null;
};

export type UsageMode = {
  id: string;
  name: string;
  description: string | null;
  icon_svg: string | null;
};

export type SafetyCharacteristic = {
  id: string;
  name: string;
  description: string | null;
  severity_level?: number | null;
};


export type ChemicalCompoundEntry = {
  id?: string; // This would be the ID of the junction table entry, if editing
  compound_id: string; // FK to chemical_compounds table
  min_percentage?: number;
  max_percentage?: number;
  typical_percentage?: number;
  notes?: string;
  compoundName?: string; // Name of the chemical compound for display
};

// Props for ChemicalCompoundsTab
export interface ChemicalFormProps {
  compounds: ChemicalCompound[]; // List of all available chemical compounds
  selectedCompounds: ChemicalCompoundEntry[]; // List of compounds linked to the essential oil
  setSelectedCompounds: (compounds: ChemicalCompoundEntry[]) => void; // Update linked compounds
  onChange: (compounds: ChemicalCompoundEntry[]) => void; // For react-hook-form
  isLoading: boolean;
  setCompounds: (compounds: ChemicalCompound[]) => void; // To update the list of all available compounds
}


export const formSchema = z.object({
  name_english: z.string().min(2, {
    message: "English name must be at least 2 characters.",
  }),
  name_scientific: z.string().min(2, {
    message: "Scientific name must be at least 2 characters.",
  }),
  name_portuguese: z.string().optional(),
  general_description: z.string().optional(),
  properties: z.array(z.string()).optional(),
  extraction_methods: z.array(z.string()).optional(),
  extraction_countries: z.array(z.string()).optional(),
  plant_parts: z.array(z.string()).optional(),
  aromatic_descriptors: z.array(z.string()).optional(),
  chemical_compounds: z.array(z.object({
    id: z.string().optional(), // ID of the junction table entry
    compound_id: z.string(), // ID of the chemical compound itself
    min_percentage: z.number().min(0).max(100).optional().nullable(),
    max_percentage: z.number().min(0).max(100).optional().nullable(),
    typical_percentage: z.number().min(0).max(100).optional().nullable(),
    notes: z.string().optional().nullable()
  })).optional(),
  health_issues: z.array(z.string()).optional(),
  usage_modes: z.array(z.string()).optional(),
  safety_characteristics: z.array(z.string()).optional(),
});

export type EssentialOilFormValues = z.infer<typeof formSchema>;

export interface EssentialOilFormProps {
  initialData?: any;
  onSubmit: (data: { basicData: Partial<EssentialOilFormValues>, relations: any }) => Promise<void>;
  isSubmitting?: boolean;
}
