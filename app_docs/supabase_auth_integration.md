# Supabase Authentication Integration Guide for AromaChat

## Project Context
- **Framework**: Next.js (App Router)
- **Authentication Provider**: Supabase
- **Goal**: Implement secure, full-stack authentication for AromaChat application

## Prerequisites
- Supabase Project Created
- Next.js Project Setup
- TypeScript Environment

## Implementation Plan for AromaChat

### Phase 1: Setup & Configuration
1. **Create Supabase Project**
   - Set up database tables for User management
   - Configure authentication providers (email, social logins)

2. **Environment Configuration**
   - Set up environment variables
   - Configure Supabase client

3. **User Schema Design**
   - Design User table with required fields:
     - Basic auth fields (email, password)
     - Profile fields (name, gender, age category, specific age)
     - Preferences (language)
     - Timestamps (created_at, updated_at)

### Phase 2: Authentication Components
1. **Login Component**
   - Email/password login form
   - Social login options
   - Error handling
   - Remember me functionality

2. **Registration Component**
   - User registration form
   - Field validation
   - Terms acceptance
   - Email verification

3. **Password Management**
   - Reset password flow
   - Change password functionality

### Phase 3: Authentication Flow Integration
1. **Entry Flow Integration**
   - Home screen authentication options
   - Login/Register prompts
   - Auth success handling

2. **Recipe Flow Authentication**
   - Guest check implementation
   - Login prompt before application method selection
   - Session persistence

3. **Account Management**
   - Profile update functionality
   - Password change
   - Language preferences
   - Sensitivity management

## Token and Security Considerations

### Key Types
1. **Anon Key (Public Key)**
   - Safely exposable client-side
   - Limited, read-only permissions
   - Designed for client-side interactions
   - Prefixed with `NEXT_PUBLIC_SUPABASE_ANON_KEY`

2. **Service Role Key (Secret Key)**
   - MUST NEVER be exposed client-side
   - Full administrative access
   - Keep strictly confidential
   - Store only on server-side or in secure environment variables

### Token Exposure Prevention
- Use `.env.local` for storing keys
- Next.js prevents `.env.local` from bundling in client-side code
- Only keys prefixed with `NEXT_PUBLIC_` are exposed
- Anon key has intentionally restricted access

### Dev Tools Security
✅ Network Tab: 
- Shows Supabase URL
- Does NOT expose sensitive tokens

✅ Elements Tab: 
- No token exposure

✅ Sources Tab: 
- No token exposure

## Implementation Tasks

### Task 1: Create Supabase Project

```bash
# Use Supabase MCP to create a new project
# First, get the cost information
mcp1_get_cost --organization_id="bjusachvupintyhoilvn" --type="project"

# Confirm cost and create project
mcp1_confirm_cost --type="project" --amount=[AMOUNT] --recurrence="monthly"
mcp1_create_project --name="aromachat" --organization_id="bjusachvupintyhoilvn" --confirm_cost_id=[CONFIRM_ID]
```

### Task 2: Set Up Database Schema

```sql
-- User profile extension to auth.users
CREATE TABLE public.profiles (
  id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL PRIMARY KEY,
  first_name TEXT,
  last_name TEXT,
  gender TEXT,
  age_category TEXT,
  specific_age INTEGER,
  language TEXT DEFAULT 'en',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now() NOT NULL,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now() NOT NULL
);

-- User sensitivities table
CREATE TABLE public.user_sensitivities (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  essential_oil_id UUID NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now() NOT NULL
);

-- RLS Policies
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_sensitivities ENABLE ROW LEVEL SECURITY;

-- Profiles policies
CREATE POLICY "Users can view their own profile" 
  ON public.profiles FOR SELECT 
  USING (auth.uid() = id);

CREATE POLICY "Users can update their own profile" 
  ON public.profiles FOR UPDATE 
  USING (auth.uid() = id);

-- Sensitivities policies
CREATE POLICY "Users can view their own sensitivities" 
  ON public.user_sensitivities FOR SELECT 
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own sensitivities" 
  ON public.user_sensitivities FOR INSERT 
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete their own sensitivities" 
  ON public.user_sensitivities FOR DELETE 
  USING (auth.uid() = user_id);
```

### Task 3: Configure Environment Variables

Create `.env.local` file:

```
NEXT_PUBLIC_SUPABASE_URL=your_supabase_project_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
```

### Task 4: Supabase Client Setup

Create `lib/supabase/client.ts`:

```typescript
import { createClientComponentClient } from '@supabase/auth-helpers-nextjs'
import type { Database } from '@/types/supabase'

export const supabase = createClientComponentClient<Database>()
```

Create `lib/supabase/server.ts`:

```typescript
import { createServerComponentClient } from '@supabase/auth-helpers-nextjs'
import { cookies } from 'next/headers'
import type { Database } from '@/types/supabase'

export const supabaseServer = () => 
  createServerComponentClient<Database>({ cookies })
```

### Task 5: Authentication Middleware

Create `middleware.ts`:

```typescript
import { createMiddlewareClient } from '@supabase/auth-helpers-nextjs'
import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'

export async function middleware(req: NextRequest) {
  const res = NextResponse.next()
  const supabase = createMiddlewareClient({ req, res })
  
  // Refresh session if expired
  await supabase.auth.getSession()
  
  return res
}

export const config = {
  matcher: [
    // Protect these routes
    '/account/:path*',
    '/recipes/my-recipes/:path*',
    // Skip these routes
    '/(api|_next|_vercel|.*\..*)(.*)',
  ],
}
```

### Task 6: Login Component

Create `components/auth/login-form.tsx`:

```tsx
'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { supabase } from '@/lib/supabase/client'

export default function LoginForm() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)
  const router = useRouter()

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError(null)
    
    try {
      const { error } = await supabase.auth.signInWithPassword({
        email,
        password,
      })
      
      if (error) throw error
      
      router.refresh()
      router.push('/account')
    } catch (error: any) {
      setError(error.message || 'An error occurred during login')
    } finally {
      setLoading(false)
    }
  }

  return (
    <form onSubmit={handleLogin} className="space-y-4">
      {error && (
        <div className="p-3 bg-red-100 text-red-700 rounded">
          {error}
        </div>
      )}
      
      <div>
        <label htmlFor="email" className="block text-sm font-medium">
          Email
        </label>
        <input
          id="email"
          type="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          required
          className="mt-1 block w-full rounded-md border p-2"
        />
      </div>
      
      <div>
        <label htmlFor="password" className="block text-sm font-medium">
          Password
        </label>
        <input
          id="password"
          type="password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          required
          className="mt-1 block w-full rounded-md border p-2"
        />
      </div>
      
      <button
        type="submit"
        disabled={loading}
        className="w-full py-2 px-4 bg-primary text-white rounded-md"
      >
        {loading ? 'Logging in...' : 'Log In'}
      </button>
    </form>
  )
}
```

### Task 7: Registration Component

Create `components/auth/register-form.tsx`:

```tsx
'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { supabase } from '@/lib/supabase/client'

export default function RegisterForm() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [firstName, setFirstName] = useState('')
  const [lastName, setLastName] = useState('')
  const [error, setError] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)
  const [message, setMessage] = useState<string | null>(null)
  const router = useRouter()

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError(null)
    setMessage(null)
    
    try {
      // 1. Create the user in Supabase Auth
      const { data: authData, error: authError } = await supabase.auth.signUp({
        email,
        password,
        options: {
          emailRedirectTo: `${window.location.origin}/auth/callback`,
        },
      })
      
      if (authError) throw authError
      
      if (authData?.user) {
        // 2. Create the user profile
        const { error: profileError } = await supabase
          .from('profiles')
          .insert([
            {
              id: authData.user.id,
              first_name: firstName,
              last_name: lastName,
              created_at: new Date().toISOString(),
              updated_at: new Date().toISOString(),
            },
          ])
        
        if (profileError) throw profileError
        
        setMessage('Registration successful! Please check your email for verification.')
      }
    } catch (error: any) {
      setError(error.message || 'An error occurred during registration')
    } finally {
      setLoading(false)
    }
  }

  return (
    <form onSubmit={handleRegister} className="space-y-4">
      {error && (
        <div className="p-3 bg-red-100 text-red-700 rounded">
          {error}
        </div>
      )}
      
      {message && (
        <div className="p-3 bg-green-100 text-green-700 rounded">
          {message}
        </div>
      )}
      
      <div className="grid grid-cols-2 gap-4">
        <div>
          <label htmlFor="firstName" className="block text-sm font-medium">
            First Name
          </label>
          <input
            id="firstName"
            type="text"
            value={firstName}
            onChange={(e) => setFirstName(e.target.value)}
            required
            className="mt-1 block w-full rounded-md border p-2"
          />
        </div>
        
        <div>
          <label htmlFor="lastName" className="block text-sm font-medium">
            Last Name
          </label>
          <input
            id="lastName"
            type="text"
            value={lastName}
            onChange={(e) => setLastName(e.target.value)}
            required
            className="mt-1 block w-full rounded-md border p-2"
          />
        </div>
      </div>
      
      <div>
        <label htmlFor="email" className="block text-sm font-medium">
          Email
        </label>
        <input
          id="email"
          type="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          required
          className="mt-1 block w-full rounded-md border p-2"
        />
      </div>
      
      <div>
        <label htmlFor="password" className="block text-sm font-medium">
          Password
        </label>
        <input
          id="password"
          type="password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          required
          minLength={8}
          className="mt-1 block w-full rounded-md border p-2"
        />
      </div>
      
      <button
        type="submit"
        disabled={loading}
        className="w-full py-2 px-4 bg-primary text-white rounded-md"
      >
        {loading ? 'Creating Account...' : 'Register'}
      </button>
    </form>
  )
}
```

### Task 8: Auth Callback Handler

Create `app/auth/callback/route.ts`:

```typescript
import { createRouteHandlerClient } from '@supabase/auth-helpers-nextjs'
import { cookies } from 'next/headers'
import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'

export async function GET(request: NextRequest) {
  const requestUrl = new URL(request.url)
  const code = requestUrl.searchParams.get('code')

  if (code) {
    const cookieStore = cookies()
    const supabase = createRouteHandlerClient({ cookies: () => cookieStore })
    await supabase.auth.exchangeCodeForSession(code)
  }

  // URL to redirect to after sign in process completes
  return NextResponse.redirect(requestUrl.origin)
}
```

### Task 9: Auth Context Provider

Create `contexts/auth-context.tsx`:

```tsx
'use client'

import { createContext, useContext, useEffect, useState } from 'react'
import { supabase } from '@/lib/supabase/client'
import type { User, Session } from '@supabase/supabase-js'

type AuthContextType = {
  user: User | null
  session: Session | null
  isLoading: boolean
  signOut: () => Promise<void>
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null)
  const [session, setSession] = useState<Session | null>(null)
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    const getSession = async () => {
      setIsLoading(true)
      const { data: { session }, error } = await supabase.auth.getSession()
      
      if (error) {
        console.error('Error getting session:', error)
      }
      
      setSession(session)
      setUser(session?.user ?? null)
      setIsLoading(false)
    }

    getSession()

    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      (_event, session) => {
        setSession(session)
        setUser(session?.user ?? null)
        setIsLoading(false)
      }
    )

    return () => {
      subscription.unsubscribe()
    }
  }, [])

  const signOut = async () => {
    await supabase.auth.signOut()
  }

  const value = {
    user,
    session,
    isLoading,
    signOut,
  }

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}

export const useAuth = () => {
  const context = useContext(AuthContext)
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider')
  }
  return context
}
```

### Task 10: Protected Route Component

Create `components/auth/protected-route.tsx`:

```tsx
'use client'

import { useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { useAuth } from '@/contexts/auth-context'

export default function ProtectedRoute({ children }: { children: React.ReactNode }) {
  const { user, isLoading } = useAuth()
  const router = useRouter()

  useEffect(() => {
    if (!isLoading && !user) {
      router.push('/login?redirect=' + encodeURIComponent(window.location.pathname))
    }
  }, [user, isLoading, router])

  if (isLoading) {
    return <div className="flex justify-center p-12">Loading...</div>
  }

  if (!user) {
    return null
  }

  return <>{children}</>
}
```

### Task 11: Guest Check Component for Recipe Flow

Create `components/recipe/guest-check.tsx`:

```tsx
'use client'

import { useAuth } from '@/contexts/auth-context'
import { useState } from 'react'
import { useRouter } from 'next/navigation'
import LoginForm from '../auth/login-form'
import RegisterForm from '../auth/register-form'

export default function GuestCheck({ onContinue }: { onContinue: () => void }) {
  const { user } = useAuth()
  const [showAuth, setShowAuth] = useState(false)
  const [authType, setAuthType] = useState<'login' | 'register'>('login')
  const router = useRouter()

  // If user is already logged in, continue to next step
  if (user) {
    return null
  }

  if (showAuth) {
    return (
      <div className="p-6 border rounded-lg shadow-md">
        <div className="flex justify-between mb-6">
          <div className="space-x-4">
            <button
              onClick={() => setAuthType('login')}
              className={`px-4 py-2 ${authType === 'login' ? 'bg-primary text-white' : 'bg-gray-100'} rounded`}
            >
              Login
            </button>
            <button
              onClick={() => setAuthType('register')}
              className={`px-4 py-2 ${authType === 'register' ? 'bg-primary text-white' : 'bg-gray-100'} rounded`}
            >
              Register
            </button>
          </div>
          <button
            onClick={() => setShowAuth(false)}
            className="text-gray-500"
          >
            Cancel
          </button>
        </div>
        
        {authType === 'login' ? <LoginForm /> : <RegisterForm />}
      </div>
    )
  }

  return (
    <div className="p-6 border rounded-lg shadow-md text-center">
      <h3 className="text-xl font-semibold mb-4">Create an Account to Continue</h3>
      <p className="mb-6">
        To save your recipe and access all features, please log in or create an account.
      </p>
      <div className="flex justify-center space-x-4">
        <button
          onClick={() => setShowAuth(true)}
          className="px-6 py-2 bg-primary text-white rounded-md"
        >
          Login/Register
        </button>
        <button
          onClick={onContinue}
          className="px-6 py-2 border border-gray-300 rounded-md"
        >
          Continue as Guest
        </button>
      </div>
    </div>
  )
}
```
✅ Network Tab: 
- Shows Supabase URL
- Does NOT expose sensitive tokens

✅ Elements Tab: 
- No token exposure

✅ Sources Tab: 
- No token exposure

## Authentication Integration Roadmap

### 1. Installation
```bash
# Install Supabase SSR package (replaces deprecated auth-helpers-nextjs)
npm install @supabase/ssr @supabase/supabase-js
```

> **Note**: The `@supabase/auth-helpers-nextjs` package is now deprecated. Use `@supabase/ssr` instead as recommended by Supabase.

### 2. Environment Configuration
- Create `.env.local` file
- Add Supabase Project URL and Anon Key
```
NEXT_PUBLIC_SUPABASE_URL=your_supabase_project_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
```

### 3. Supabase Client Setup
- Create `/lib/supabase/client.ts`
- Configure client-side Supabase instance
```typescript
import { createClientComponentClient } from '@supabase/auth-helpers-nextjs'

export const supabase = createClientComponentClient()
```

### 4. Server-Side Authentication
- Create `/lib/supabase/server.ts`
- Configure server-side Supabase instance
```typescript
import { createServerComponentClient } from '@supabase/auth-helpers-nextjs'
import { cookies } from 'next/headers'

export const supabaseServer = () => 
  createServerComponentClient({ cookies })
```

### 5. Authentication Middleware
- Create `/middleware.ts`
- Protect routes and handle authentication state
```typescript
import { createMiddlewareClient } from '@supabase/auth-helpers-nextjs'
import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'

export async function middleware(req: NextRequest) {
  const res = NextResponse.next()
  const supabase = createMiddlewareClient({ req, res })
  
  // Add authentication checks here
  return res
}
```

### 6. Authentication Components
- Create login, signup, and logout components
- Implement magic link, social login, and password-based authentication

### 7. Protected Routes
- Use server-side authentication checks
- Redirect unauthenticated users
- Implement role-based access control

### 8. Error Handling
- Implement comprehensive error handling
- Create user-friendly error messages
- Log authentication errors securely

### 9. Testing
- Unit tests for authentication flows
- Integration tests for protected routes
- Security vulnerability testing

## Best Practices
- Always use HTTPS
- Implement rate limiting
- Use strong password policies
- Enable multi-factor authentication
- Regularly audit authentication logs

## Security Considerations
- Never store sensitive tokens client-side
- Use environment variables
- Implement proper session management
- Protect against common vulnerabilities (CSRF, XSS)

## Recommended Next Steps
1. Configure Supabase Auth Providers
2. Set up user profiles
3. Implement password reset
4. Add multi-factor authentication

## Potential Challenges
- Handling authentication state
- Managing server vs. client-side sessions
- Implementing secure password reset

## Implementation Log

### 2025-05-09: Initial Authentication Components

#### 1. Created AuthForm Component
Implemented a combined login and registration form in `src/components/auth/auth-form.tsx` with the following features:
- Toggle between login and registration modes
- Form validation
- Error handling
- Success messages
- Integration with Supabase Auth
- Profile creation on registration

```tsx
// Key implementation details from auth-form.tsx
export default function AuthForm() {
  const [mode, setMode] = useState<'login' | 'register'>('login')
  // ... state management

  const handleLogin = async (e: React.FormEvent) => {
    // ... login logic with Supabase
  }

  const handleRegister = async (e: React.FormEvent) => {
    // ... registration logic with Supabase and profile creation
  }

  // ... UI rendering with conditional fields based on mode
}
```

#### 2. Created ProtectedRoute Component
Implemented a component to protect routes that require authentication in `src/components/auth/protected-route.tsx`:
- Redirects unauthenticated users
- Shows loading state
- Only renders children when authenticated

```tsx
export default function ProtectedRoute({ children, redirectTo = '/auth/login' }) {
  const { user, isLoading } = useAuth()
  // ... authentication check and redirection logic
  return user ? <>{children}</> : null
}
```

#### 3. Created GuestCheck Component
Implemented a component to prompt users to log in or continue as a guest in `src/components/auth/guest-check.tsx`:
- Option to login/register
- Option to continue as guest
- Integration with AuthForm

```tsx
export default function GuestCheck({ onContinue }) {
  // ... state management
  return (
    // ... UI with options to login/register or continue as guest
  )
}
```

#### Next Steps
1. ✅ Update Supabase client files to use the new `@supabase/ssr` package
2. Create auth callback handler for OAuth flows
3. Create login and register pages
4. Implement password reset functionality
5. Test authentication flow end-to-end

### 2025-05-09: Updated Supabase Client Implementation

#### 1. Updated Client-Side Supabase Client
Updated the client-side Supabase client in `src/lib/supabase/client.ts` to use the new `@supabase/ssr` package instead of the deprecated `@supabase/auth-helpers-nextjs` package:

```typescript
// Before
import { createClientComponentClient } from '@supabase/auth-helpers-nextjs'
import type { Database } from '@/types/supabase'

export const supabase = createClientComponentClient<Database>()

// After
import { createBrowserClient } from '@supabase/ssr'
import type { Database } from '@/types/supabase'

export const supabase = createBrowserClient<Database>(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
)
```

#### 2. Updated Server-Side Supabase Client
Updated the server-side Supabase client in `src/lib/supabase/server.ts` to use the new `@supabase/ssr` package:

```typescript
// Before
import { createServerComponentClient } from '@supabase/auth-helpers-nextjs'
import { cookies } from 'next/headers'
import type { Database } from '@/types/supabase'

export const supabaseServer = () => 
  createServerComponentClient<Database>({ cookies })

// After
import { createServerClient } from '@supabase/ssr'
import { cookies } from 'next/headers'
import type { Database } from '@/types/supabase'

export const supabaseServer = () => {
  return createServerClient<Database>(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        get(name) {
          try {
            const cookieStore = cookies()
            return cookieStore.get(name)?.value
          } catch (error) {
            console.error('Error getting cookie:', error)
            return undefined
          }
        },
        set(name, value, options) {
          try {
            const cookieStore = cookies()
            cookieStore.set(name, value, options)
          } catch (error) {
            console.error('Error setting cookie:', error)
          }
        },
        remove(name, options) {
          try {
            const cookieStore = cookies()
            cookieStore.delete(name)
          } catch (error) {
            console.error('Error removing cookie:', error)
          }
        },
      },
    }
  )
}
```

#### 3. Updated Authentication Middleware
Updated the authentication middleware in `middleware.ts` to use the new `@supabase/ssr` package:

```typescript
// Before
import { createMiddlewareClient } from '@supabase/auth-helpers-nextjs'
import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'

export async function middleware(req: NextRequest) {
  const res = NextResponse.next()
  const supabase = createMiddlewareClient({ req, res })
  
  // Refresh session if expired
  await supabase.auth.getSession()
  
  return res
}

// After
import { createServerClient } from '@supabase/ssr'
import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'
import type { Database } from '@/types/supabase'

export async function middleware(req: NextRequest) {
  const res = NextResponse.next()
  
  // Create a Supabase client for the middleware
  const supabase = createServerClient<Database>(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        get(name) {
          return req.cookies.get(name)?.value
        },
        set(name, value, options) {
          // If the cookie is updated, update the cookies for the request and response
          req.cookies.set({
            name,
            value,
            ...options,
          })
          res.cookies.set({
            name,
            value,
            ...options,
          })
        },
        remove(name, options) {
          // If the cookie is removed, update the cookies for the request and response
          req.cookies.delete(name)
          res.cookies.delete(name)
        },
      },
    }
  )
  
  // Refresh session if expired
  await supabase.auth.getSession()
  
  return res
}
```

#### 4. Created Login Page
Created a login page in `src/app/auth/login/page.tsx` that uses the AuthForm component:

```tsx
import AuthForm from '@/components/auth/auth-form'

export const metadata = {
  title: 'Login - AromaChat',
  description: 'Login to your AromaChat account',
}

export default function LoginPage() {
  return (
    <div className="container flex items-center justify-center min-h-[calc(100vh-4rem)] py-12">
      <AuthForm />
    </div>
  )
}
```

### 2025-05-09: Password Reset Functionality

#### 1. Created Reset Password Form Component
Implemented a form component for requesting a password reset in `src/components/auth/reset-password-form.tsx`:

```tsx
export default function ResetPasswordForm() {
  const [email, setEmail] = useState('')
  // ... state management

  const handleResetPassword = async (e: React.FormEvent) => {
    // ... password reset logic
    const { error } = await supabase.auth.resetPasswordForEmail(email, {
      redirectTo: `${window.location.origin}/auth/update-password`,
    })
    // ... error handling and user feedback
  }

  // ... form UI
}
```

#### 2. Created Update Password Form Component
Implemented a form component for updating the password after reset in `src/components/auth/update-password-form.tsx`:

```tsx
export default function UpdatePasswordForm() {
  const [password, setPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  // ... state management

  const handleUpdatePassword = async (e: React.FormEvent) => {
    // ... password validation
    const { error } = await supabase.auth.updateUser({
      password,
    })
    // ... error handling and redirection
  }

  // ... form UI
}
```

#### Current Issues and Next Steps

1. **Directory Creation Issues**: We're experiencing issues creating directories in the project structure. This is likely due to permission issues or the way the file system is mounted in the development environment.

2. **TypeScript Errors**: We've addressed some TypeScript errors related to the cookie handling in the server-side Supabase client, but there may still be some issues that need to be resolved for proper type checking.

3. **Next Steps**:
   - Create the auth callback handler for OAuth flows
   - Create the register page
   - Create the reset-password and update-password pages to use our form components
   - Test the authentication flow end-to-end
   - Integrate the authentication flow with the recipe creation process
   - Implement profile management functionality

## Complete Implementation Guide

This section provides a step-by-step guide to complete the Supabase authentication implementation for the AromaChat application.

### 1. Install Required Dependencies

```bash
npm install @supabase/ssr @supabase/supabase-js
```

### 2. Create Directory Structure

Create the following directory structure for the authentication components and pages:

```
src/
├── components/
│   └── auth/
│       ├── auth-form.tsx           # Combined login/register form
│       ├── protected-route.tsx     # Route protection component
│       ├── guest-check.tsx         # Guest check component for recipe flow
│       ├── reset-password-form.tsx # Password reset request form
│       └── update-password-form.tsx # Update password form
├── app/
│   └── auth/
│       ├── login/
│       │   └── page.tsx            # Login page
│       ├── register/
│       │   └── page.tsx            # Register page
│       ├── reset-password/
│       │   └── page.tsx            # Reset password page
│       ├── update-password/
│       │   └── page.tsx            # Update password page
│       └── callback/
│           └── route.ts            # Auth callback handler
```

### 3. Create Auth Pages

#### Login Page (`src/app/auth/login/page.tsx`)

```tsx
import AuthForm from '@/components/auth/auth-form'

export const metadata = {
  title: 'Login - AromaChat',
  description: 'Login to your AromaChat account',
}

export default function LoginPage() {
  return (
    <div className="container flex items-center justify-center min-h-[calc(100vh-4rem)] py-12">
      <AuthForm />
    </div>
  )
}
```

#### Register Page (`src/app/auth/register/page.tsx`)

```tsx
import AuthForm from '@/components/auth/auth-form'

export const metadata = {
  title: 'Register - AromaChat',
  description: 'Create a new AromaChat account',
}

export default function RegisterPage() {
  return (
    <div className="container flex items-center justify-center min-h-[calc(100vh-4rem)] py-12">
      <AuthForm />
    </div>
  )
}
```

#### Reset Password Page (`src/app/auth/reset-password/page.tsx`)

```tsx
import ResetPasswordForm from '@/components/auth/reset-password-form'

export const metadata = {
  title: 'Reset Password - AromaChat',
  description: 'Reset your AromaChat account password',
}

export default function ResetPasswordPage() {
  return (
    <div className="container flex items-center justify-center min-h-[calc(100vh-4rem)] py-12">
      <ResetPasswordForm />
    </div>
  )
}
```

#### Update Password Page (`src/app/auth/update-password/page.tsx`)

```tsx
import UpdatePasswordForm from '@/components/auth/update-password-form'

export const metadata = {
  title: 'Update Password - AromaChat',
  description: 'Update your AromaChat account password',
}

export default function UpdatePasswordPage() {
  return (
    <div className="container flex items-center justify-center min-h-[calc(100vh-4rem)] py-12">
      <UpdatePasswordForm />
    </div>
  )
}
```

### 4. Create Auth Callback Handler

Create the auth callback handler to handle OAuth and email verification redirects:

```typescript
// src/app/auth/callback/route.ts
import { createServerClient } from '@supabase/ssr'
import { cookies } from 'next/headers'
import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'
import type { Database } from '@/types/supabase'

export async function GET(request: NextRequest) {
  const requestUrl = new URL(request.url)
  const code = requestUrl.searchParams.get('code')
  
  if (code) {
    const cookieStore = cookies()
    const supabase = createServerClient<Database>(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
      {
        cookies: {
          get(name: string) {
            return cookieStore.get(name)?.value
          },
          set(name: string, value: string, options: { [key: string]: any } = {}) {
            cookieStore.set(name, value, options)
          },
          remove(name: string, options: { [key: string]: any } = {}) {
            cookieStore.set(name, '', { ...options, maxAge: 0 })
          },
        },
      }
    )
    
    // Exchange the code for a session
    await supabase.auth.exchangeCodeForSession(code)
  }

  // URL to redirect to after sign in process completes
  return NextResponse.redirect(requestUrl.origin)
}
```

### 5. Integrate Authentication with Recipe Flow

To integrate the authentication flow with the recipe creation process, use the `GuestCheck` component at the beginning of the recipe flow:

```tsx
// Example usage in a recipe flow component
import { useState } from 'react'
import { useAuth } from '@/contexts/auth-context'
import GuestCheck from '@/components/auth/guest-check'

export default function RecipeFlow() {
  const [showGuestCheck, setShowGuestCheck] = useState(true)
  const { user } = useAuth()
  
  const handleContinueAsGuest = () => {
    setShowGuestCheck(false)
  }
  
  if (!user && showGuestCheck) {
    return <GuestCheck onContinue={handleContinueAsGuest} />
  }
  
  return (
    // Recipe flow content
    <div>
      {/* Recipe flow steps */}
    </div>
  )
}
```

### 6. Protect Routes

Use the `ProtectedRoute` component to protect routes that require authentication:

```tsx
// Example usage in a protected page
import ProtectedRoute from '@/components/auth/protected-route'

export default function AccountPage() {
  return (
    <ProtectedRoute>
      <div>
        {/* Protected content */}
        <h1>Account Settings</h1>
        {/* ... */}
      </div>
    </ProtectedRoute>
  )
}
```

### 7. Testing the Authentication Flow

To test the authentication flow:

1. Start the development server: `npm run dev`
2. Navigate to `/auth/login` to test the login functionality
3. Navigate to `/auth/register` to test the registration functionality
4. Test the password reset flow by clicking "Forgot password?" on the login page
5. Test protected routes by trying to access `/account` or other protected routes
6. Test the guest check by starting the recipe flow

### 8. Troubleshooting

#### Common Issues:

1. **Cookie Handling**: If you encounter issues with cookie handling in the server-side Supabase client, ensure that you're properly implementing the cookie methods according to the Supabase SSR package requirements.

2. **TypeScript Errors**: If you encounter TypeScript errors related to the cookie handling, make sure you're properly typing the parameters and handling the Promise<ReadonlyRequestCookies> issues.

3. **Directory Creation**: If you encounter issues creating directories in the project structure, try creating them manually through the file explorer or terminal before creating the files.

4. **Auth Callback**: If the auth callback isn't working correctly, check that the route.ts file is properly set up and that the URL in the resetPasswordForEmail method matches your application's URL structure.
```
