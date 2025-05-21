# Improved Project Structure Recommendations

Based on your current project structure, here are some recommendations to improve organization, testability, and maintainability:

## 1. Core Folder Structure

```
/src
  /app                   # Next.js app router pages and layouts
  /components            # Reusable UI components
    /common              # Common components used across the application
    /layout              # Layout components
    /ui                  # Base UI components (buttons, inputs, etc.)
    /features            # Feature-specific components
      /admin             # Admin-related components
      /recipe-flow       # Recipe flow components
      /dilution-calculator  # Dilution calculator components
  /lib                   # Utility functions and libraries
    /api                 # API client utilities
    /helpers             # Helper functions
    /supabase            # Supabase related utilities
  /hooks                 # Custom React hooks
  /contexts              # React contexts
  /types                 # TypeScript type definitions
  /styles                # Global styles
  /services              # External service integrations
  /constants             # Application constants
  /utils                 # Utility functions
  /test                  # Test utilities and mocks
    /mocks               # Mock data
    /fixtures            # Test fixtures
    /helpers             # Test helper functions
```

## 2. Feature-Based Organization

Consider reorganizing components by feature rather than by type. This makes it easier to locate related files:

```
/src
  /features
    /auth
      /components        # Auth components
      /hooks             # Auth-specific hooks
      /utils             # Auth-specific utilities
      /api               # Auth API calls
      /types             # Auth-specific types
    /essential-oils
      /components        # Oil-related components
      /hooks             # Oil-specific hooks
      /utils             # Oil-specific utilities
      /api               # Oil API calls
      /types             # Oil-specific types
    /recipe-generation
      /components
      /hooks
      /utils
      /api
      /types
```

## 3. Testing Organization

Improve your testing structure:

```
/src
  /components
    /ComponentName
      ComponentName.tsx
      ComponentName.test.tsx  # Co-locate tests with components
      index.ts               # Re-export for cleaner imports
  /test
    /setup                   # Test setup files
    /mocks                   # Mock data and services
    /utils                   # Test utilities
```

## 4. Configuration Files

Move configuration files to their own directory:

```
/config
  jest.config.js
  next.config.js
  tailwind.config.js
  tsconfig.json
```

## 5. Documentation

Add a proper documentation structure:

```
/docs
  /architecture            # Architectural documentation
  /api                     # API documentation
  /components              # Component documentation
  /development             # Development guidelines
```

## 6. Scripts Directory

Add a scripts directory for utility scripts:

```
/scripts
  /db-seed                 # Database seeding scripts
  /code-gen                # Code generation scripts
  /deploy                  # Deployment scripts
```

## 7. Component Organization Best Practices

- **Barrel Files**: Use index.ts barrel files to simplify imports
- **Component Folders**: Group component files together (component, tests, stories, styles)
- **Co-location**: Place related files together to improve discoverability

Example:
```
/src/components/common/Button/
  Button.tsx
  Button.test.tsx
  Button.stories.tsx
  index.ts  # exports Button
```

## 8. API Organization

Organize API calls by domain:

```
/src/services
  /api
    /essential-oils
      getOils.ts
      updateOil.ts
      createOil.ts
    /recipes
      getRecipes.ts
      createRecipe.ts
    /auth
      login.ts
      register.ts
      resetPassword.ts
```

## 9. Separate Business Logic from UI Components

Extract business logic from components into custom hooks and utilities:

```
/src/hooks/useEssentialOils.ts  # Business logic for oils
/src/components/OilList.tsx     # UI component using the hook
```

## 10. Environment Configuration

Create a structured approach to environment configuration:

```
/src/config
  environment.ts       # Environment configuration
  feature-flags.ts     # Feature flags
  api-endpoints.ts     # API endpoints
```
