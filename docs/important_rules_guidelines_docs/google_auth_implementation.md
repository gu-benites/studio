# Google Authentication Implementation

## Overview

This document outlines the implementation of Google authentication in the AromaChat application using Supabase Auth. It details the components involved, the flow of authentication, and the solutions to common issues encountered with the OAuth PKCE flow.

## Components

The authentication system consists of the following key components:

1. **Auth Form Component** (`src/components/auth/auth-form.tsx`)
   - Provides the UI for the Google Sign-in button
   - Initiates the OAuth flow with Supabase

2. **Auth Context** (`src/contexts/auth-context.tsx`)
   - Manages authentication state throughout the application
   - Handles session retrieval and user profile synchronization
   - Processes OAuth code exchange

3. **Auth Callback Page** (`src/app/auth/callback/page.tsx`)
   - Handles the redirect from Google OAuth
   - Shows loading and error states during authentication
   - Manages redirection after successful authentication

4. **Auth Callback Handler Component** (`src/components/auth/auth-callback-handler.tsx`)
   - Displays a loading state during authentication
   - Initially designed as a reusable component for callback handling

## Authentication Flow

The authentication flow follows these steps:

1. **Initiate Authentication**
   - User clicks the "Sign in with Google" button in `auth-form.tsx`
   - The application calls `supabase.auth.signInWithOAuth()` with:
     - Provider: 'google'
     - RedirectTo: 'http://localhost:9002/auth/callback'

2. **Google Authentication**
   - User is redirected to Google's authentication page
   - User grants permissions to the application
   - Google redirects back to our callback URL with an authorization code

3. **Code Exchange**
   - The application receives the authorization code in the URL
   - `auth-context.tsx` detects the code and processes it using PKCE (Proof Key for Code Exchange)
   - The code is exchanged for a session using `supabase.auth.exchangeCodeForSession(code)`

4. **Profile Synchronization**
   - After successful authentication, the user's Google profile data is synchronized to the Supabase profiles table
   - This includes name and avatar information

5. **Redirection**
   - User is redirected to the home page after successful authentication

6. **Sign-Out Process**
   - User clicks the "Sign Out" button in the sidebar menu
   - The `signOut` function in `auth-context.tsx` is triggered
   - A POST request is sent to `/api/auth/logout`
   - The server-side route uses `supabase.auth.signOut()` to invalidate the session
   - Client-side state is cleared and all Supabase cookies are removed
   - User is redirected to the login page

## Common Issues and Solutions

### Issue: Multiple Code Exchange Attempts

**Problem**:
The error "invalid request: both auth code and code verifier should be non-empty" occurs when multiple components try to exchange the same authorization code. The PKCE flow requires that:
- The same client that initiated the auth flow must exchange the code
- The code can only be exchanged once

**Solution**:
1. Centralize code exchange to a single component (auth-context.tsx)
2. Only process the code on the dedicated callback page
3. Clear the code from the URL after processing to prevent repeated exchanges

### Issue: Redirect Loop or Hanging on Callback Page

**Problem**:
Users get stuck on the callback page after authentication or enter redirect loops between pages.

**Solution**:
1. Use `window.location.replace('/')` for reliable navigation after authentication
2. Implement a timeout to force redirection if normal flow fails
3. Only process authentication on the dedicated callback page

### Issue: Sign-Out Cookie Management in Next.js App Router

**Problem**:
Next.js App Router's `cookies()` API requires asynchronous usage, but the Supabase Auth client accesses cookies synchronously, causing warnings and potentially slow sign-outs.

**Solution**:
1. Create a dedicated API route for sign-out (`/api/auth/logout`)
2. Use the recommended Supabase client initialization in route handlers:
   ```typescript
   const supabase = createRouteHandlerClient({ cookies })
   ```
3. Keep cookie manipulation minimal - let Supabase handle its own cookies
4. Implement proper error handling and timeouts in the client-side code

### Issue: Inconsistent Auth State

**Problem**:
Authentication state becomes inconsistent across the application, with some components showing logged-in state while others don't.

**Solution**:
1. Use a singleton Supabase client instance across the application
2. Properly update React state after authentication
3. Clear session data before attempting to exchange a new code

## Implementation Details

### Key Code Patterns

1. **Auth Code Detection**:
```typescript
// Check for code parameter in the URL
if (typeof window !== 'undefined') {
  const url = new URL(window.location.href)
  const code = url.searchParams.get('code')
  
  if (code && window.location.pathname.includes('/auth/callback')) {
    // Process the code
  }
}
```

2. **Code Exchange**:
```typescript
const { data, error } = await supabase.auth.exchangeCodeForSession(code)
```

3. **Profile Synchronization**:
```typescript
await supabase
  .from('profiles')
  .upsert({
    id: user.id,
    full_name: fullName,
    avatar_url: avatarUrl,
    updated_at: new Date().toISOString()
  }, { 
    onConflict: 'id' 
  })
```

4. **Reliable Redirection**:
```typescript
if (typeof window !== 'undefined') {
  window.location.replace('/')
}
```

5. **Robust Sign-Out Implementation**:
```typescript
// Client-side sign-out in auth-context.tsx
const signOut = async () => {
  try {
    // Clear React state first
    setUser(null)
    setSession(null)
    
    // Call the logout API endpoint with a timeout
    const controller = new AbortController()
    const timeoutId = setTimeout(() => controller.abort(), 3000)
    
    await fetch('/api/auth/logout', { 
      method: 'POST',
      signal: controller.signal
    })
    
    clearTimeout(timeoutId)
    
    // Clear all Supabase-related local storage items
    const storageKeys = Object.keys(window.localStorage)
    const supabaseKeys = storageKeys.filter(key => key.startsWith('sb-'))
    
    for (const key of supabaseKeys) {
      window.localStorage.removeItem(key)
    }
    
    // Redirect to login page
    window.location.replace('/auth/login')
  } catch (error) {
    console.error('Error in signOut function:', error)
    window.location.replace('/auth/login')
  }
}

// Server-side logout implementation in API route
export async function POST() {
  const supabase = createRouteHandlerClient({ cookies })
  await supabase.auth.signOut()
  return NextResponse.json({ success: true })
}
```

## Maintenance Guidelines

When maintaining the authentication system:

1. **Component Responsibility**:
   - `auth-form.tsx`: Handles sign-in UI and initiating OAuth
   - `auth-context.tsx`: Manages auth state and code exchange
   - `auth/callback/page.tsx`: Handles the redirect and showing loading/error states

2. **Avoid Duplicate Processing**:
   - Never process the same authorization code in multiple components
   - Clear the code from the URL after processing

3. **Testing Authentication**:
   - Test the complete flow from sign-in to redirect to the home page
   - Monitor console logs for any errors in the authentication process
   - Verify that user profile data is properly synchronized

4. **URL Configuration**:
   - Ensure redirect URLs match your environment (development/production)
   - Update `redirectTo` values in OAuth calls when deploying to different environments

## Future Enhancements

Potential improvements to the authentication system:

1. **Additional Providers**:
   - Add support for other OAuth providers (GitHub, Microsoft, etc.)
   - Implement email/password authentication as a fallback

2. **Enhanced User Profiles**:
   - Collect additional information during sign-up
   - Allow users to link multiple providers to the same account

3. **Session Management**:
   - Implement session refresh logic
   - Add silent authentication for returning users
