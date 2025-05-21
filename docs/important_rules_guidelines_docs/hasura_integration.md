# Hasura GraphQL Integration Guide

This document provides guidance on how to interact with the Hasura GraphQL API in your application.

## Configuration

### Environment Variables
Make sure these environment variables are set in your `.env.local` file:

```env
NEXT_PUBLIC_HASURA_GRAPHQL_URL=http://129.148.47.122:8585/v1/graphql
HASURA_ADMIN_SECRET=
```

## Making GraphQL Queries

### Basic Query Example

```typescript
const GET_ESSENTIAL_OILS = `
  query GetEssentialOils {
    essential_oils {
      id
      name_english
      name_scientific
      description
    }
  }
`;

async function fetchEssentialOils() {
  const response = await fetch(process.env.NEXT_PUBLIC_HASURA_GRAPHQL_URL, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'x-hasura-admin-secret': process.env.HASURA_ADMIN_SECRET!,
    },
    body: JSON.stringify({
      query: GET_ESSENTIAL_OILS,
    }),
  });

  const result = await response.json();
  return result.data?.essential_oils;
}
```

### Using Variables in Queries

```typescript
const GET_OIL_BY_ID = `
  query GetOilById($id: uuid!) {
    essential_oils_by_pk(id: $id) {
      id
      name_english
      therapeutic_properties {
        property {
          name
        }
      }
    }
  }
`;

async function fetchOilById(id: string) {
  const response = await fetch(process.env.NEXT_PUBLIC_HASURA_GRAPHQL_URL, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'x-hasura-admin-secret': process.env.HASURA_ADMIN_SECRET!,
    },
    body: JSON.stringify({
      query: GET_OIL_BY_ID,
      variables: { id },
    }),
  });

  const result = await response.json();
  return result.data?.essential_oils_by_pk;
}
```

## Making Mutations

### Create Operation

```typescript
const CREATE_OIL = `
  mutation CreateEssentialOil($object: essential_oils_insert_input!) {
    insert_essential_oils_one(object: $object) {
      id
      name_english
    }
  }
`;

async function createOil(oilData: any) {
  const response = await fetch(process.env.NEXT_PUBLIC_HASURA_GRAPHQL_URL, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'x-hasura-admin-secret': process.env.HASURA_ADMIN_SECRET!,
    },
    body: JSON.stringify({
      query: CREATE_OIL,
      variables: {
        object: oilData
      },
    }),
  });

  const result = await response.json();
  return result.data?.insert_essential_oils_one;
}
```

### Update Operation

```typescript
const UPDATE_OIL = `
  mutation UpdateEssentialOil($id: uuid!, $updates: essential_oils_set_input!) {
    update_essential_oils_by_pk(pk_columns: {id: $id}, _set: $updates) {
      id
      name_english
    }
  }
`;

async function updateOil(id: string, updates: any) {
  const response = await fetch(process.env.NEXT_PUBLIC_HASURA_GRAPHQL_URL, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'x-hasura-admin-secret': process.env.HASURA_ADMIN_SECRET!,
    },
    body: JSON.stringify({
      query: UPDATE_OIL,
      variables: {
        id,
        updates
      },
    }),
  });

  const result = await response.json();
  return result.data?.update_essential_oils_by_pk;
}
```

## Subscriptions (Real-time Data)

```typescript
import { createClient } from 'graphql-ws';

const client = createClient({
  url: 'ws://129.148.47.122:8585/v1/graphql',
  connectionParams: {
    headers: {
      'x-hasura-admin-secret': process.env.HASURA_ADMIN_SECRET!,
    },
  },
});

const SUBSCRIBE_TO_OILS = `
  subscription OnOilUpdated {
    essential_oils {
      id
      name_english
      updated_at
    }
  }
`;

// Subscribe to changes
const unsubscribe = client.subscribe(
  { query: SUBSCRIBE_TO_OILS },
  {
    next: (data) => console.log('Received update:', data),
    error: (error) => console.error('Error:', error),
    complete: () => console.log('Subscription complete'),
  }
);

// Later, to unsubscribe
// unsubscribe();
```

## Error Handling

Always handle potential errors in your GraphQL operations:

```typescript
async function safeGraphQLRequest(query: string, variables?: any) {
  try {
    const response = await fetch(process.env.NEXT_PUBLIC_HASURA_GRAPHQL_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-hasura-admin-secret': process.env.HASURA_ADMIN_SECRET!,
      },
      body: JSON.stringify({
        query,
        variables,
      }),
    });

    const result = await response.json();

    if (result.errors) {
      console.error('GraphQL Errors:', result.errors);
      throw new Error(result.errors[0].message);
    }

    return result.data;
  } catch (error) {
    console.error('Request failed:', error);
    throw error;
  }
}
```

## Best Practices

1. **Use Environment Variables**: Never hardcode the Hasura URL or admin secret in your code.
2. **Implement Error Handling**: Always handle both network and GraphQL errors.
3. **Use Fragments**: For complex queries, use fragments to reduce duplication.
4. **Batch Requests**: When possible, batch multiple queries into a single request.
5. **Cache Responses**: Implement caching for frequently accessed data.
6. **Use Variables**: Always use variables instead of string interpolation to prevent injection attacks.
7. **Monitor Performance**: Keep an eye on query performance using Hasura's monitoring tools.

## Authentication

For production, consider implementing proper authentication:

1. **JWT Authentication**: Configure Hasura to use JWT authentication.
2. **Webhook Authentication**: Use a webhook to validate requests.
3. **Role-Based Access Control**: Define roles and permissions in Hasura.

## Development Tools

- **GraphiQL**: Access the interactive GraphiQL interface at `http://129.148.47.122:8585/console`
- **Hasura Console**: For schema management and testing queries
- **Apollo DevTools**: For debugging GraphQL queries in the browser

## Troubleshooting

- **CORS Issues**: Ensure CORS is properly configured in Hasura
- **Permission Denied**: Check your role permissions in Hasura
- **Connection Issues**: Verify the Hasura server is running and accessible
- **Schema Changes**: After making schema changes in the database, remember to reload metadata in Hasura

For more information, refer to the [Hasura Documentation](https://hasura.io/docs/latest/).
