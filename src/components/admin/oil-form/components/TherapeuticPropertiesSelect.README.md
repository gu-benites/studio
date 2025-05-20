# Therapeutic Properties Select Component

A reusable React component for selecting therapeutic properties with search, multi-select, and create-new-on-the-fly functionality.

## Features

- 🔍 Search existing therapeutic properties
- ✨ Create new properties on the fly
- 🏷️ Display selected properties as removable chips
- 📱 Responsive design
- 🛡️ Error handling and loading states
- 🧪 Fully tested with React Testing Library
- 📚 Comprehensive TypeScript support

## Installation

```bash
# If not already installed
npm install @tanstack/react-query lucide-react
```

## Usage

```tsx
import { useState } from 'react';
import { TherapeuticPropertiesSelect } from '@/components/admin/oil-form/components';

export function OilForm() {
  const [selectedProperties, setSelectedProperties] = useState<string[]>([]);

  return (
    <div className="space-y-4">
      <TherapeuticPropertiesSelect
        value={selectedProperties}
        onChange={setSelectedProperties}
        placeholder="Search therapeutic properties..."
      />
    </div>
  );
}
```

## Props

| Prop | Type | Required | Default | Description |
|------|------|----------|---------|-------------|
| `value` | `string[]` | Yes | `[]` | Array of selected property IDs |
| `onChange` | `(value: string[]) => void` | Yes | - | Callback when selection changes |
| `placeholder` | `string` | No | `'Search therapeutic properties...'` | Placeholder text |
| `disabled` | `boolean` | No | `false` | Disable the select |
| `maxSelections` | `number` | No | - | Maximum number of properties that can be selected |
| `className` | `string` | No | - | Additional CSS classes |

## Database Schema

The component works with the following Supabase tables:

```sql
create table public.eo_therapeutic_properties (
  id uuid not null default extensions.uuid_generate_v4(),
  property_name text not null,
  created_at timestamp with time zone not null default now(),
  updated_at timestamp with time zone not null default now(),
  constraint eo_therapeutic_properties_pkey primary key (id),
  constraint eo_therapeutic_properties_property_name_key unique (property_name)
) TABLESPACE pg_default;

-- Join table for many-to-many relationship with essential_oils
create table public.essential_oil_therapeutic_properties (
  essential_oil_id uuid not null,
  therapeutic_property_id uuid not null,
  created_at timestamp with time zone not null default now(),
  constraint essential_oil_therapeutic_properties_pkey primary key (essential_oil_id, therapeutic_property_id),
  constraint essential_oil_therapeutic_properties_essential_oil_id_fkey
    foreign key (essential_oil_id) references essential_oils(id) on delete cascade,
  constraint essential_oil_therapeutic_properties_therapeutic_property_id_fkey
    foreign key (therapeutic_property_id) references eo_therapeutic_properties(id) on delete cascade
) TABLESPACE pg_default;

-- Prevent deletion of properties that are in use
create or replace function prevent_deletion_if_in_used()
returns trigger as $$
begin
  if exists (
    select 1 
    from essential_oil_therapeutic_properties 
    where therapeutic_property_id = old.id
  ) then
    raise exception 'Cannot delete property that is in use';
  end if;
  return old;
end;
$$ language plpgsql security definer;

create trigger prevent_therapeutic_property_deletion 
before delete on eo_therapeutic_properties 
for each row execute function prevent_deletion_if_in_used();
```

## Implementation Details

### Data Flow
1. The component fetches all therapeutic properties on mount using `useTherapeuticProperties` hook
2. When searching, it filters the pre-loaded properties client-side
3. If no exact match is found, it shows a "Create new" option
4. When a new property is created, it's added to the list and selected
5. Selected properties are displayed as chips that can be removed

### Error Handling
- Displays error messages if fetching or creating properties fails
- Shows loading states during async operations
- Validates input before creating new properties

## Development

### Running Tests

```bash
npm test TherapeuticPropertiesSelect
```

### Storybook

View the component in Storybook:

```bash
npm run storybook
```

Then navigate to: http://localhost:6006/?path=/story/admin-oilform-therapeuticpropertiesselect--default

## Dependencies

- React 18+
- @tanstack/react-query
- Shadcn UI components
- Lucide React for icons
- Tailwind CSS for styling
- TypeScript

## View to load selected items
create view public.v_essential_oil_full_details as
select
  eo.id,
  eo.name_english,
  eo.name_scientific,
  eo.name_portuguese,
  eo.general_description,
  eo.embedding,
  eo.created_at,
  eo.updated_at,
  eo.bubble_uid,
  eo.names_concatenated,
  eo.image_url,
  eo.internal_use_status_id,
  eo.dilution_recommendation_id,
  eo.phototoxicity_status_id,
  COALESCE(
    array_agg(distinct eam.application_method_id) filter (
      where
        eam.application_method_id is not null
    ),
    '{}'::uuid[]
  ) as application_methods,
  COALESCE(
    jsonb_agg(
      distinct jsonb_build_object(
        'pet_id',
        eps.pet_id,
        'safety_notes',
        eps.safety_notes
      )
    ) filter (
      where
        eps.pet_id is not null
    ),
    '[]'::jsonb
  ) as pet_safety,
  COALESCE(
    jsonb_agg(
      distinct jsonb_build_object(
        'age_range_id',
        ecs.age_range_id,
        'safety_notes',
        ecs.safety_notes
      )
    ) filter (
      where
        ecs.age_range_id is not null
    ),
    '[]'::jsonb
  ) as child_safety,
  COALESCE(
    array_agg(distinct eopns.pregnancy_nursing_status_id) filter (
      where
        eopns.pregnancy_nursing_status_id is not null
    ),
    '{}'::uuid[]
  ) as pregnancy_nursing_status,
  COALESCE(
    array_agg(distinct eotp.property_id) filter (
      where
        eotp.property_id is not null
    ),
    '{}'::uuid[]
  ) as therapeutic_properties,
  COALESCE(
    array_agg(distinct eohb.health_benefit_id) filter (
      where
        eohb.health_benefit_id is not null
    ),
    '{}'::uuid[]
  ) as health_benefits,
  COALESCE(
    array_agg(distinct eoeep.energetic_property_id) filter (
      where
        eoeep.energetic_property_id is not null
    ),
    '{}'::uuid[]
  ) as energetic_emotional_properties,
  COALESCE(
    array_agg(distinct eoca.chakra_id) filter (
      where
        eoca.chakra_id is not null
    ),
    '{}'::uuid[]
  ) as chakras,
  COALESCE(
    array_agg(distinct eoem.extraction_method_id) filter (
      where
        eoem.extraction_method_id is not null
    ),
    '{}'::uuid[]
  ) as extraction_methods,
  COALESCE(
    array_agg(distinct eoec.country_id) filter (
      where
        eoec.country_id is not null
    ),
    '{}'::uuid[]
  ) as extraction_countries,
  COALESCE(
    array_agg(distinct eopp.plant_part_id) filter (
      where
        eopp.plant_part_id is not null
    ),
    '{}'::uuid[]
  ) as plant_parts,
  COALESCE(
    array_agg(distinct eoas.scent_id) filter (
      where
        eoas.scent_id is not null
    ),
    '{}'::uuid[]
  ) as aroma_scents
from
  essential_oils eo
  left join essential_oil_application_methods eam on eo.id = eam.essential_oil_id
  left join essential_oil_pet_safety eps on eo.id = eps.essential_oil_id
  left join essential_oil_child_safety ecs on eo.id = ecs.essential_oil_id
  left join essential_oil_pregnancy_nursing_safety eopns on eo.id = eopns.essential_oil_id
  left join essential_oil_therapeutic_properties eotp on eo.id = eotp.essential_oil_id
  left join essential_oil_health_benefits eohb on eo.id = eohb.essential_oil_id
  left join essential_oil_energetic_emotional_properties eoeep on eo.id = eoeep.essential_oil_id
  left join essential_oil_chakra_association eoca on eo.id = eoca.essential_oil_id
  left join essential_oil_extraction_methods eoem on eo.id = eoem.essential_oil_id
  left join essential_oil_extraction_countries eoec on eo.id = eoec.essential_oil_id
  left join essential_oil_plant_parts eopp on eo.id = eopp.essential_oil_id
  left join essential_oil_aroma_scents eoas on eo.id = eoas.essential_oil_id
group by
  eo.id;