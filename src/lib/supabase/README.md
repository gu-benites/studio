# Supabase Integration

This directory contains all Supabase-related code for the application, including the client, server utilities, models, and repositories.

## Structure

```
supabase/
├── client/               # Client-side Supabase client and utilities
│   └── index.ts          # Main client export
├── server/               # Server-side Supabase utilities
│   └── index.ts          # Server client and auth helpers
├── models/               # Domain models
│   ├── base/             # Base model interfaces
│   └── essential-oils/   # Essential oil domain models
├── repositories/         # Data access layer
│   ├── base/             # Base repository implementation
│   └── essential-oils/   # Essential oil repository
├── types/                # TypeScript type definitions
│   └── database.types.ts # Generated database types
├── utils/                # Utility functions
│   └── storage.ts        # File storage utilities
└── constants/            # Application constants
    └── index.ts          # Shared constants
```

## Usage

### Client-Side Usage

```typescript
import { 
  supabase, 
  essentialOilRepository,
  EssentialOilQueryOptions 
} from '@/lib/supabase';

// Get current user
const { data: { user } } = await supabase.auth.getUser();

// Query essential oils
const oils = await essentialOilRepository.findWithOptions({
  searchTerm: 'lavender',
  limit: 10,
  orderBy: { column: 'name_english', ascending: true }
});

// Upload a file
const fileInput = document.querySelector('input[type="file"]');
const file = fileInput.files[0];
const { path, url } = await uploadFile('bucket-name', 'folder', file);
```

### Server-Side Usage

```typescript
import { createServerSupabaseClient } from '@/lib/supabase/server';

export async function getServerSideProps(context) {
  const supabase = createServerSupabaseClient(context);
  
  // Get the current user
  const { data: { user } } = await supabase.auth.getUser();
  
  // Fetch data
  const { data: oils } = await supabase
    .from('essential_oils')
    .select('*')
    .limit(10);
    
  return { props: { user, oils } };
}
```

## Adding a New Model

1. Create a new model file in `models/`:
   ```typescript
   // models/my-model/my-model.model.ts
   import { Tables } from '../../types/database.types';
   
   export interface MyModel extends Tables<'my_table'> {
     // Add any additional properties or methods
   }
   
   export interface CreateMyModelDto {
     // Define create DTO
   }
   
   export interface UpdateMyModelDto {
     // Define update DTO
   }
   ```

2. Create a repository in `repositories/`:
   ```typescript
   // repositories/my-model/my-model.repository.ts
   import { BaseRepository } from '../base/base.repository';
   import { MyModel, CreateMyModelDto, UpdateMyModelDto } from '../../models/my-model/my-model.model';
   
   export class MyModelRepository extends BaseRepository<'my_table'> {
     constructor() {
       super('my_table');
     }
     
     // Add any custom methods here
   }
   
   // Export a singleton instance
   export const myModelRepository = new MyModelRepository();
   ```

3. Export the new model and repository in the main `index.ts` file.

## Best Practices

1. **Always use the repository pattern** for database access
2. **Keep business logic out of components** - move it to services or repositories
3. **Use TypeScript types** for better type safety
4. **Handle errors** appropriately in repositories
5. **Use environment variables** for sensitive data
6. **Implement proper error boundaries** for client-side errors
7. **Use RLS (Row Level Security)** for database security

## Environment Variables

Make sure these environment variables are set in your `.env.local` file:

```
NEXT_PUBLIC_SUPABASE_URL=your-supabase-url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key
```

## Testing

When writing tests, you can mock the Supabase client using a library like `@supabase/supabase-js-mock`.
