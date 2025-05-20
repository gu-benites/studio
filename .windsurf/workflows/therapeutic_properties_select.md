---
description: Therapeutic Properties Multi-Select Component with Create and Search
---

# Therapeutic Properties Select Component

Check file C:\Users\conta\cursor\studio-1\src\components\admin\oil-form\components\TherapeuticPropertiesSelect.README.md

Component will be desing to be placed in http://localhost:9002/admin/essential-oils

Also check all the lines at C:\Users\conta\cursor\studio-1\app_docs\database\full_schema.sql

Cehck files C:\Users\conta\cursor\studio-1\app_docs\forms

## Overview
A reusable React component for selecting therapeutic properties with search, multi-select, and create-new functionality. This component integrates with Supabase for data management and follows the application's design system.

## Database Schema Reference
- **Table**: `eo_therapeutic_properties`
- **Join Table**: `essential_oil_therapeutic_properties`
- **View**: `v_essential_oil_full_details`

## Implementation Phases

### Phase 1: Setup & Type Definitions
1. **Update TypeScript Types**
   - [ ] Extend `Database` type in `src/types/supabase.ts`
   - [ ] Add type for component props and API responses
   ```typescript
   // In src/types/supabase.ts
export type TherapeuticProperty = Database['public']['Tables']['eo_therapeutic_properties']['Row'];
   ```

2. **Component Structure**
   ```
   src/
   └── components/
       └── admin/
           └── oil-form/
               ├── components/
               │   ├── TherapeuticPropertiesSelect.tsx
               │   ├── index.ts (barrel export)
               │   └── README.md
               └── hooks/
                   └── useTherapeuticProperties.ts
   ```

### Phase 2: Core Functionality
1. **Data Fetching Hook**
   ```typescript
   // useTherapeuticProperties.ts
   export function useTherapeuticProperties() {
     const query = useQuery({
       queryKey: ['therapeutic-properties'],
       queryFn: async () => {
         const { data, error } = await supabase
           .from('eo_therapeutic_properties')
           .select('*')
           .order('property_name');
         if (error) throw error;
         return data;
       },
     });
     
     const createMutation = useMutation({
       mutationFn: async (propertyName: string) => {
         const { data, error } = await supabase
           .from('eo_therapeutic_properties')
           .insert({ property_name: propertyName })
           .select()
           .single();
         if (error) throw error;
         return data;
       },
       onSuccess: () => query.refetch()
     });
     
     return { ...query, createMutation };
   }
   ```

2. **Component Implementation**
   - [ ] Create controlled component with proper TypeScript types
   - [ ] Implement search with debouncing (300ms)
   - [ ] Add multi-select with chips
   - [ ] Create new property flow with validation
   - [ ] Loading and error states

### Phase 3: Integration & Testing
1. **Form Integration**
   ```typescript
   // In your form component
   const { control } = useForm<FormValues>({
     defaultValues: {
       therapeutic_properties: []
     }
   });
   
   // In your form JSX
   <Controller
     name="therapeutic_properties"
     control={control}
     render={({ field }) => (
       <TherapeuticPropertiesSelect
         value={field.value}
         onChange={field.onChange}
         placeholder="Search therapeutic properties..."
       />
     )}
   />
   ```

2. **Testing Strategy**
   - [ ] Unit tests for component rendering
   - [ ] Integration tests with React Hook Form
   - [ ] E2E test for create and select flow
   - [ ] Performance testing with large datasets

## Component API

### Props
```typescript
interface TherapeuticPropertiesSelectProps {
  value: string[]; // Array of property IDs
  onChange: (value: string[]) => void;
  className?: string;
  placeholder?: string;
  disabled?: boolean;
  maxSelections?: number;
  onCreateNew?: (name: string) => Promise<TherapeuticProperty>;
}
```

## Error Handling
- Display toast notifications for API errors
- Validate property names before creation
- Handle concurrent modifications
- Implement proper loading states

## Performance Optimization
- Virtualize long lists with `react-window`
- Debounce search input (300ms)
- Cache API responses with React Query
- Use React.memo for component optimization

## Accessibility
- ARIA labels for all interactive elements
- Keyboard navigation support
- Screen reader announcements
- Focus management

## Deployment & Monitoring
- Add Sentry error tracking
- Log user interactions (anonymized)
- Monitor performance metrics
- Set up alerts for error rates

## Documentation
- Add JSDoc for all public APIs
- Create Storybook stories
- Document usage examples
- Add component playground
- Update the README with usage examples and props documentation

## Deployment
- Ensure all tests pass
- Verify accessibility (a11y) compliance
- Check bundle size impact
- Update any relevant documentation

## Future Enhancements
- Add keyboard navigation
- Implement drag-and-drop reordering of selected items
- Add support for custom theming
- Include more detailed property information in the dropdown

## Rollback Plan
- Keep the previous version of the component until the new one is verified
- Use feature flags if deploying to production
- Have database migration rollback scripts ready