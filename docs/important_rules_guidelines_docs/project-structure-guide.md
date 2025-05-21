# React Project Structure Best Practices

This guide outlines a comprehensive structure for React projects to facilitate maintainability, scalability, and collaboration.

## Recommended Folder Structure

```
src/
├── assets/              # Static files (images, fonts, etc.)
├── components/          # Reusable React components
│   ├── common/          # Shared components (Button, Card, etc.)
│   ├── layout/          # Layout components (Header, Footer, etc.)
│   └── [feature]/       # Feature-specific components
├── config/              # Application configuration
├── hooks/               # Custom hooks
├── lib/                 # Libraries and utilities
├── models/              # Type definitions and interfaces
├── pages/               # Page components
├── schemas/             # Validation schemas (Zod, Yup, etc.)
├── services/            # API services and external integrations
│   ├── api/             # API clients
│   └── [serviceType]/   # Services separated by domain
├── store/               # State management (Redux, Zustand, etc.)
├── styles/              # Global styles
└── utils/               # Utility functions
```

## API Services Organization

API services should be organized to provide a clean interface for making HTTP requests:

```typescript
// services/api/client.ts
import axios from 'axios';

export const apiClient = axios.create({
  baseURL: process.env.REACT_APP_API_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Interceptors for error handling, authentication, etc.
apiClient.interceptors.request.use(/* ... */);
apiClient.interceptors.response.use(/* ... */);
```

```typescript
// services/users/userService.ts
import { apiClient } from '../api/client';
import { User, CreateUserInput } from '@/models/user';

export const userService = {
  getAll: async (): Promise<User[]> => {
    const response = await apiClient.get('/users');
    return response.data;
  },
  
  getById: async (id: string): Promise<User> => {
    const response = await apiClient.get(`/users/${id}`);
    return response.data;
  },
  
  create: async (user: CreateUserInput): Promise<User> => {
    const response = await apiClient.post('/users', user);
    return response.data;
  },
  
  // Other CRUD methods
};
```

## Models and Schemas

Models define your data structures, while schemas handle validation:

```typescript
// models/user.ts
export interface User {
  id: string;
  name: string;
  email: string;
  role: UserRole;
  createdAt: string;
}

export type UserRole = 'admin' | 'user' | 'guest';

export interface CreateUserInput {
  name: string;
  email: string;
  password: string;
  role?: UserRole;
}
```

```typescript
// schemas/userSchema.ts
import * as z from 'zod';

export const createUserSchema = z.object({
  name: z.string().min(2, 'Name must have at least 2 characters'),
  email: z.string().email('Invalid email'),
  password: z.string().min(8, 'Password must have at least 8 characters'),
  role: z.enum(['admin', 'user', 'guest']).optional(),
});

export type CreateUserFormData = z.infer<typeof createUserSchema>;
```

## Business Logic with Custom Hooks

Encapsulate business logic in custom hooks:

```typescript
// hooks/useUsers.ts
import { useState, useCallback } from 'react';
import { userService } from '@/services/users/userService';
import { User, CreateUserInput } from '@/models/user';

export function useUsers() {
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<Error | null>(null);

  const fetchUsers = useCallback(async () => {
    try {
      setLoading(true);
      const data = await userService.getAll();
      setUsers(data);
      setError(null);
    } catch (err) {
      setError(err instanceof Error ? err : new Error('Error fetching users'));
    } finally {
      setLoading(false);
    }
  }, []);

  const createUser = useCallback(async (userData: CreateUserInput) => {
    try {
      setLoading(true);
      const newUser = await userService.create(userData);
      setUsers(prev => [...prev, newUser]);
      return newUser;
    } catch (err) {
      setError(err instanceof Error ? err : new Error('Error creating user'));
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  // Other CRUD operations

  return {
    users,
    loading,
    error,
    fetchUsers,
    createUser,
    // Other methods
  };
}
```

## Operation Policies

Handle authorization and business rules:

```typescript
// lib/permissions.ts
import { User, UserRole } from '@/models/user';

export const Permissions = {
  canCreateUser: (currentUser: User): boolean => {
    return ['admin'].includes(currentUser.role);
  },
  
  canEditUser: (currentUser: User, targetUser: User): boolean => {
    return currentUser.id === targetUser.id || currentUser.role === 'admin';
  },
  
  // Other permission checks
};
```

## Component Example

```tsx
// components/users/UserList.tsx
import { useState, useEffect } from 'react';
import { Plus, Edit, Trash2, RefreshCcw } from 'lucide-react';
import { useUsers } from '@/hooks/useUsers';
import { User } from '@/models/user';
import { Permissions } from '@/lib/permissions';

export default function UserList() {
  const { users, loading, error, fetchUsers, deleteUser } = useUsers();
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  
  useEffect(() => {
    // In a real scenario, you would get the current user from some auth context
    const mockCurrentUser = { id: '1', name: 'Admin', email: 'admin@example.com', role: 'admin', createdAt: new Date().toISOString() };
    setCurrentUser(mockCurrentUser);
    
    fetchUsers();
  }, [fetchUsers]);

  const handleDelete = async (userId: string) => {
    if (window.confirm('Are you sure you want to delete this user?')) {
      try {
        await deleteUser(userId);
      } catch (err) {
        console.error('Error deleting user:', err);
      }
    }
  };

  if (loading && users.length === 0) {
    return <div className="flex justify-center p-8">Loading users...</div>;
  }

  if (error) {
    return (
      <div className="p-4 border border-red-300 bg-red-50 text-red-800 rounded">
        <p>Error loading users: {error.message}</p>
        <button 
          onClick={() => fetchUsers()} 
          className="mt-2 flex items-center text-red-600 hover:text-red-800"
        >
          <RefreshCcw size={16} className="mr-1" /> Try again
        </button>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-lg shadow p-6">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-xl font-semibold text-gray-800">Users</h2>
        {currentUser && Permissions.canCreateUser(currentUser) && (
          <button className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded flex items-center">
            <Plus size={16} className="mr-1" /> New User
          </button>
        )}
      </div>
      
      {users.length === 0 ? (
        <p className="text-gray-500 text-center py-8">No users found.</p>
      ) : (
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="bg-gray-50 border-b">
                <th className="py-3 px-4 text-left text-sm font-medium text-gray-500">Name</th>
                <th className="py-3 px-4 text-left text-sm font-medium text-gray-500">Email</th>
                <th className="py-3 px-4 text-left text-sm font-medium text-gray-500">Role</th>
                <th className="py-3 px-4 text-left text-sm font-medium text-gray-500">Created At</th>
                <th className="py-3 px-4 text-sm font-medium text-gray-500">Actions</th>
              </tr>
            </thead>
            <tbody>
              {users.map((user) => (
                <tr key={user.id} className="border-b hover:bg-gray-50">
                  <td className="py-3 px-4">{user.name}</td>
                  <td className="py-3 px-4">{user.email}</td>
                  <td className="py-3 px-4 capitalize">{user.role}</td>
                  <td className="py-3 px-4">{new Date(user.createdAt).toLocaleDateString()}</td>
                  <td className="py-3 px-4 flex space-x-2 justify-end">
                    {currentUser && Permissions.canEditUser(currentUser, user) && (
                      <>
                        <button className="p-1 text-blue-600 hover:text-blue-800">
                          <Edit size={16} />
                        </button>
                        <button 
                          className="p-1 text-red-600 hover:text-red-800"
                          onClick={() => handleDelete(user.id)}
                        >
                          <Trash2 size={16} />
                        </button>
                      </>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
```

## Documentation for Collaborators

To facilitate collaboration:

1. **README.md**: Include project overview, architecture explanation, setup instructions, and conventions.
2. **CONTRIBUTING.md**: Guidelines for contribution including:
   - Branch naming conventions
   - Commit message format
   - Pull request process
   - Code review standards
3. **Code Comments**: Add comments for complex logic or important architectural decisions

## Recommended Conventions

### File Naming

- React Components: PascalCase (e.g., `UserList.tsx`)
- Hooks: camelCase with "use" prefix (e.g., `useUsers.ts`)
- Services: camelCase with "Service" suffix (e.g., `userService.ts`)
- Utility files: camelCase (e.g., `formatDate.ts`)
- Test files: Same name as the file being tested with `.test` or `.spec` suffix

### Imports

- Use absolute imports with aliases for better organization:
  ```typescript
  // Configure in tsconfig.json
  {
    "compilerOptions": {
      "baseUrl": ".",
      "paths": {
        "@/*": ["src/*"]
      }
    }
  }
  ```

### Code Formatting

- Use a linter (ESLint) and formatter (Prettier)
- Configure them in your project with reasonable rules

### Git Workflow

- Follow Conventional Commits:
  - `feat:` for new features
  - `fix:` for bug fixes
  - `docs:` for documentation
  - `style:` for formatting changes
  - `refactor:` for code restructuring
  - `test:` for tests
  - `chore:` for maintenance tasks

## Libraries Recommendations

- **State Management**: 
  - Small to medium projects: React Context + useReducer or Zustand
  - Large applications: Redux Toolkit or Zustand
  
- **Form Management**: 
  - React Hook Form + Zod/Yup

- **API Requests**: 
  - Axios or TanStack Query (React Query)

- **Routing**: 
  - React Router or TanStack Router

- **UI Components**: 
  - Tailwind CSS + Headless UI or Shadcn UI
  - Lucide React for icons

- **Testing**: 
  - Jest + React Testing Library
  - Cypress for E2E tests

## Project Setup Checklist

- [ ] Initialize project (Create React App, Vite, or Next.js)
- [ ] Set up TypeScript
- [ ] Set up ESLint and Prettier
- [ ] Configure folder structure
- [ ] Set up routing
- [ ] Set up state management
- [ ] Set up API client
- [ ] Set up testing framework
- [ ] Create README.md and CONTRIBUTING.md
- [ ] Set up CI/CD pipeline