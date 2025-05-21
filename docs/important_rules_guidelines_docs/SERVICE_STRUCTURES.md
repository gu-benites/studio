# Service Structures Documentation

This document outlines the structure and organization of the main service directories in the `src/lib` folder.

## Table of Contents

- [Hasura](#hasura)
- [OpenAI](#openai)
- [Redis](#redis)
- [Supabase](#supabase)

## Hasura

```
src/lib/hasura/
├── client/                 # GraphQL client implementation
│   ├── config.ts           # Client configuration
│   ├── graphql-client.ts   # GraphQL client setup
│   └── types.ts            # TypeScript types
│
├── models/                # Data models
│   ├── base/              # Base model classes
│   │   └── base-model.ts  # Base model implementation
│   ├── essential-oil.ts    # Essential oil model
│   └── essential-oil-related.ts # Related models
│
├── queries/              # GraphQL queries
│   ├── builder/           # Query builder utilities
│   └── fragments/         # Reusable query fragments
│
├── utils/                # Utility functions
│   └── index.ts           # Utility exports
│
├── index.ts              # Main exports
└── README.md              # Documentation
```

### Key Features
- Type-safe GraphQL queries
- Modular model structure
- Reusable query fragments
- Centralized client configuration

## OpenAI

```
src/lib/openai/
├── client/                 # OpenAI client configuration
│   ├── config.ts           # Client initialization
│   ├── types.ts            # TypeScript types
│   └── index.ts            # Client exports
│
├── models/                # Domain models
│   └── base/              # Base model classes
│       └── base-model.ts  # Base model implementation
│
├── services/              # Service layer
│   ├── embeddings/        # Embedding services
│   │   ├── types.ts      # Type definitions
│   │   ├── embedding-service.ts # Implementation
│   │   └── index.ts      # Exports
│   │
│   └── completions/     # Completion services
│       ├── types.ts      # Type definitions
│       ├── completion-service.ts # Implementation
│       └── index.ts      # Exports
│
├── utils/                # Utility functions
│   ├── cache/            # Caching implementation
│   ├── error-handler.ts  # Error handling
│   └── index.ts          # Utility exports
│
├── constants/           # Application constants
│   └── index.ts
│
├── index.ts             # Main exports
└── README.md             # Documentation
```

### Key Features
- Type-safe API interactions
- Modular service architecture
- Built-in caching
- Comprehensive error handling
- Rate limiting

## Redis

```
src/lib/redis/
├── client/               # Redis client configuration
│   ├── config.ts         # Client initialization
│   ├── types.ts          # Type definitions
│   └── index.ts          # Client exports
│
├── services/            # Service implementations
│   ├── cache-service.ts  # Main cache service
│   └── index.ts          # Service exports
│
├── utils/               # Utility functions
│   ├── helpers.ts        # Helper functions
│   └── index.ts          # Utility exports
│
├── constants/           # Redis constants
│   └── index.ts          # Default TTLs and prefixes
│
├── index.ts             # Main exports
└── README.md             # Documentation
```

### Key Features
- Type-safe Redis client
- Namespaced caching
- Automatic JSON serialization
- TTL support
- Cache statistics
- Graceful degradation

## Supabase

```
src/lib/supabase/
├── client/               # Supabase client
│   ├── index.ts          # Client initialization
│   └── types.ts          # Type definitions
│
├── models/              # Data models
│   ├── base/            # Base model classes
│   │   └── base.model.ts # Base model implementation
│   ├── essential-oils/   # Essential oil models
│   │   └── essential-oil.model.ts
│   ├── recipes/         # Recipe models
│   └── users/           # User models
│
├── repositories/        # Data access layer
│   ├── base/            # Base repository
│   │   └── base.repository.ts
│   ├── essential-oils/   # Essential oil repositories
│   │   └── essential-oil.repository.ts
│   ├── recipes/         # Recipe repositories
│   └── users/           # User repositories
│
├── server/             # Server-side utilities
│   └── index.ts         # Server client
│
├── utils/              # Utility functions
│   └── storage.ts       # Storage utilities
│
├── types/              # TypeScript types
│   └── database.types.ts # Generated types
│
├── index.ts            # Main exports
└── README.md            # Documentation
```

### Key Features
- Type-safe database access
- Repository pattern implementation
- Server-side utilities
- Authentication helpers
- Storage integration

## Common Patterns

### Configuration
All services follow a similar pattern for configuration:
1. Environment variables for sensitive data
2. Centralized client initialization
3. Type-safe configuration objects

### Error Handling
- Consistent error types across services
- Centralized error handling
- Graceful degradation

### Type Safety
- Strict TypeScript configuration
- Generated types where possible
- Consistent type naming conventions

## Best Practices

1. **Environment Variables**
   - Never commit sensitive data
   - Use descriptive names
   - Document all required variables

2. **Type Safety**
   - Use strict TypeScript
   - Generate types when possible
   - Avoid `any` types

3. **Error Handling**
   - Catch and handle errors appropriately
   - Log errors for debugging
   - Provide user-friendly messages

4. **Testing**
   - Write unit tests for business logic
   - Mock external services
   - Test error cases

## Getting Started

1. Set up environment variables (see each service's README)
2. Import the required service in your code
3. Use the provided methods to interact with the service

## License

MIT
