# Hasura Client

A type-safe, modular client for interacting with Hasura GraphQL API.

## Features

- Type-safe GraphQL queries and mutations
- Built-in pagination and filtering
- Real-time subscriptions (using polling fallback)
- Modular model system for database tables
- Error handling and type validation

## Installation

```bash
npm install graphql-request graphql
```

## Usage

### Basic Query

```typescript
import { hasuraClient } from './client';
import { essentialOilModel } from './models/essential-oil';

// Get an essential oil by ID
const oil = await essentialOilModel.findById('123e4567-e89b-12d3-a456-426614174000', {
  id: true,
  name_english: true,
  name_scientific: true,
  description: true,
});

// Find active essential oils
const activeOils = await essentialOilModel.findActive({
  id: true,
  name_english: true,
  image_url: true,
});
```

### Advanced Query with Pagination

```typescript
// Get paginated results with filtering
const result = await essentialOilModel.findManyPaginated(
  { is_active: { _eq: true } }, // where
  { id: true, name_english: true, description: true }, // fields
  { name_english: 'asc' }, // orderBy
  { limit: 10, offset: 0 } // pagination
);

console.log(result.data); // Array of essential oils
console.log(result.total); // Total count
console.log(result.pageInfo); // Pagination info
```

### Create, Update, Delete

```typescript
// Create a new essential oil
const newOil = await essentialOilModel.create({
  name_english: 'Lavender',
  name_scientific: 'Lavandula angustifolia',
  description: 'Calming and soothing',
  is_active: true,
});

// Update an existing oil
const updatedOil = await essentialOilModel.updateById(newOil.id, {
  description: 'Calming, soothing, and relaxing',
}, {
  id: true,
  description: true,
});

// Delete an oil
const deletedOil = await essentialOilModel.deleteById(newOil.id, {
  id: true,
  name_english: true,
});
```

### Subscriptions (using polling)

```typescript
// Subscribe to changes in essential oils
const unsubscribe = essentialOilModel.subscribe(
  (oils) => {
    console.log('Updated oils:', oils);
  },
  { is_active: { _eq: true } }, // where
  { id: true, name_english: true } // fields
);

// Later, to unsubscribe
unsubscribe();
```

## Models

### Creating a New Model

1. Create a new file in `src/lib/hasura/models/` (e.g., `user.ts`)
2. Define your type and extend `BaseModel`:

```typescript
import { BaseModel } from '../base-model';
import type { FieldSelection, WhereInput } from '../types';

export type User = {
  id: string;
  email: string;
  name: string;
  created_at: string;
  // ... other fields
};

export class UserModel extends BaseModel<User> {
  protected tableName = 'users';
  protected idField = 'id';

  // Add custom methods as needed
  async findByEmail(email: string, fields: FieldSelection<User> = { id: true, email: true }) {
    return this.findMany(
      { email: { _eq: email } } as WhereInput<User>,
      fields
    );
  }
}

export const userModel = new UserModel();
```

3. Export the model in `src/lib/hasura/models/index.ts`

## Error Handling

All methods return a `HasuraResponse<T>` type that includes either `data` or `errors`:

```typescript
const { data, errors } = await essentialOilModel.findById('123');

if (errors) {
  console.error('Error:', errors[0].message);
  return;
}

// Use data with type safety
console.log(data.name_english);
```

## Best Practices

1. Always specify only the fields you need in your queries
2. Use the model's built-in methods for common operations
3. Create custom methods in your model for complex queries
4. Handle errors appropriately
5. Use TypeScript's type system to ensure type safety

## License

MIT
