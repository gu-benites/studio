# User Types PRD for AromaChat with Supabase and Stripe Integration

## 1. Introduction

### 1.1 Purpose
This Product Requirements Document (PRD) defines the user types, roles, permissions, and authentication flows for the AromaChat application, with specific focus on Supabase and Stripe integration for user management, authentication, and subscription handling.

### 1.2 Scope
This document covers user types, their respective access levels, the user authentication and subscription flows, and database schema requirements for user management through Supabase and payment processing through Stripe.

### 1.3 Definitions
- **Supabase**: The platform providing authentication, database, and storage for AromaChat
- **JWT**: JSON Web Token used for secure authentication between client and server
- **RLS**: Row Level Security in PostgreSQL used by Supabase to control data access based on user roles
- **Stripe**: Payment processing platform handling subscriptions and one-time payments
- **Webhook**: Automated callbacks between Stripe and our application to handle subscription events

## 2. User Types Overview

Our application will support four distinct user types, each with specific access levels and permissions:

### 2.1 Guest Users
Users who access the application without creating an account.

### 2.2 Registered Users (Free Tier)
Users who have created an account but do not have a paid subscription.

### 2.3 Premium Users (Paid Tier)
Registered users who have purchased a subscription plan, further divided into:
- **Monthly Subscribers**: Users paying on a monthly recurring basis
- **Annual Subscribers**: Users paying on an annual recurring basis (typically at a discounted rate)

### 2.4 Administrators
Users with special privileges to manage the application, users, and payments.

## 3. Detailed User Type Specifications

### 3.1 Guest Users

**3.1.1 Characteristics**
- No authentication required
- Session-based tracking only
- Limited feature access
- Cannot save work or preferences

**3.1.2 Access Permissions**
- Access to free tools and features only
- View marketing/informational pages
- View pricing plans
- Cannot access registered-only features

**3.1.3 Technical Implementation**
- Anonymous sessions in Supabase
- No database entries in users table
- Usage metrics collected anonymously

### 3.2 Registered Users (Free Tier)

**3.2.1 Characteristics**
- Email/password or social authentication
- Persistent user profile
- Access to free and registered-only features
- Can save work and preferences

**3.2.2 Access Permissions**
- All guest user permissions
- Access to registered-only tools and features
- Save work/projects to their account
- Customize personal settings and preferences
- Access to personal dashboard
- Cannot access premium features

**3.2.3 Technical Implementation**
- Standard Supabase authentication
- Entry in `users` table with free tier flag
- RLS policies allowing access to owned data
- Foreign key relationships to user-generated content

### 3.3 Premium Users (Paid Tier)

**3.3.1 Characteristics**
- Email/password or social authentication
- Active subscription plan (monthly or annual)
- Full access to all features
- Enhanced usage limits
- Different billing cycles based on plan type

**3.3.2 Access Permissions**
- All registered user permissions
- Access to premium-only features and tools
- Higher usage limits and quotas
- Priority support access
- Advanced customization options
- Both monthly and annual subscribers have identical feature access

**3.3.3 Technical Implementation**
- Standard Supabase authentication
- Entry in `users` table with premium tier flag
- Additional record in `subscriptions` table with billing_interval field
- Separate price_id references for monthly vs. annual plans in Stripe
- RLS policies allowing access to premium features
- Usage tracking and quota management
- Renewal date tracking based on billing cycle

**3.3.4 Monthly vs. Annual Subscribers**
- Identical feature access and permissions
- Different billing_interval in subscriptions table
- Different renewal handling logic
- Different pricing (annual typically discounted)
- Different renewal notification timing

### 3.4 Administrators

**3.4.1 Characteristics**
- Specially designated accounts
- Complete system access
- Management capabilities

**3.4.2 Access Permissions**
- All premium user permissions
- User management (view, edit, delete users)
- Content moderation
- Subscription and payment management
- System configuration
- Analytics and reporting access

**3.4.3 Technical Implementation**
- Standard Supabase authentication
- Entry in `users` table with admin flag
- Special RLS policies allowing administrative access
- Audit logging of administrative actions

## 4. Database Schema

### 4.1 Core User Tables

#### 4.1.1 `users` Table (Supabase Auth)
```sql
-- Enhanced from default Supabase auth.users
CREATE TABLE IF NOT EXISTS auth.users (
  id UUID REFERENCES auth.users NOT NULL PRIMARY KEY,
  email TEXT UNIQUE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  user_type TEXT NOT NULL DEFAULT 'registered', -- 'registered', 'premium', 'admin'
  display_name TEXT,
  avatar_url TEXT,
  last_sign_in TIMESTAMP WITH TIME ZONE,
  is_active BOOLEAN DEFAULT TRUE,
  metadata JSONB DEFAULT '{}'::JSONB
);
```

#### 4.1.2 `profiles` Table (Public)
```sql
CREATE TABLE public.profiles (
  id UUID REFERENCES auth.users PRIMARY KEY,
  display_name TEXT,
  avatar_url TEXT,
  bio TEXT,
  preferences JSONB DEFAULT '{}'::JSONB,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);
```

#### 4.1.3 `subscriptions` Table (Public)
```sql
CREATE TABLE public.subscriptions (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES auth.users NOT NULL,
  stripe_customer_id TEXT,
  stripe_subscription_id TEXT,
  plan_id TEXT NOT NULL,
  billing_interval TEXT NOT NULL, -- 'month' or 'year'
  price_id TEXT NOT NULL, -- Stripe price ID (different for monthly vs annual)
  status TEXT NOT NULL, -- 'active', 'canceled', 'past_due', etc.
  current_period_start TIMESTAMP WITH TIME ZONE,
  current_period_end TIMESTAMP WITH TIME ZONE,
  cancel_at_period_end BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  renewal_reminder_sent BOOLEAN DEFAULT FALSE,
  metadata JSONB DEFAULT '{}'::JSONB
);
```

### 4.2 Row Level Security Policies

#### 4.2.1 Profiles RLS
```sql
-- Users can read any profile
CREATE POLICY "Profiles are viewable by everyone" 
  ON public.profiles FOR SELECT USING (true);

-- Users can update only their own profile
CREATE POLICY "Users can update their own profile" 
  ON public.profiles FOR UPDATE USING (auth.uid() = id);
```

#### 4.2.2 Subscriptions RLS
```sql
-- Users can view only their own subscriptions
CREATE POLICY "Users can view their own subscriptions" 
  ON public.subscriptions FOR SELECT USING (auth.uid() = user_id);

-- Only admins can update subscriptions
CREATE POLICY "Only admins can update subscriptions" 
  ON public.subscriptions FOR UPDATE USING (
    EXISTS (
      SELECT 1 FROM auth.users 
      WHERE id = auth.uid() AND user_type = 'admin'
    )
  );
```

## 5. Authentication Flow

### 5.1 Sign Up Process
1. User completes registration form with email/password or chooses social login
2. Supabase creates new user in `auth.users`
3. Application creates corresponding record in `public.profiles`
4. User receives email verification (if enabled)
5. Upon verification, user account is activated as "registered" (free tier)

### 5.2 Sign In Process
1. User enters credentials or uses social login
2. Supabase authenticates and returns JWT token
3. Application checks user type and subscription status
4. User is directed to appropriate dashboard based on their access level

### 5.3 Premium Upgrade Flow
1. User selects subscription plan
2. Stripe Checkout process is initiated
3. Upon successful payment:
   - Stripe webhook notifies application
   - User type is updated to "premium" in `auth.users`
   - New record is created in `subscriptions` table
4. User is granted immediate access to premium features

### 5.4 Admin Assignment
1. Only existing admins can designate new administrators
2. Admin updates user record in `auth.users` to set `user_type = 'admin'`
3. Audit log entry is created for the change
4. New admin immediately receives administrative privileges

## 6. Feature Access Control

### 6.1 Implementation Strategy

The application will implement feature access control using a combination of:

#### 6.1.1 Frontend Access Control
- UI components conditionally rendered based on user type
- Navigation options filtered by permission level
- Feature buttons/links with access checks
- Premium feature cards with upgrade prompts for non-premium users

#### 6.1.2 Backend Access Control
- Supabase RLS policies to restrict data access
- API route middleware to validate user type and subscription status
- Function-level permission checks
- Usage quotas and rate limits based on user tier

### 6.2 Feature Matrix

| Feature | Guest | Registered | Premium | Admin |
|---------|-------|------------|---------|-------|
| Browse public content | ✅ | ✅ | ✅ | ✅ |
| Use free tools | ✅ | ✅ | ✅ | ✅ |
| Save work/projects | ❌ | ✅ | ✅ | ✅ |
| Access registered-only tools | ❌ | ✅ | ✅ | ✅ |
| Access premium tools | ❌ | ❌ | ✅ | ✅ |
| Standard usage limits | ❌ | ✅ | ❌ | ✅ |
| Enhanced usage limits | ❌ | ❌ | ✅ | ✅ |
| User management | ❌ | ❌ | ❌ | ✅ |
| Payment management | ❌ | ❌ | ❌ | ✅ |
| System configuration | ❌ | ❌ | ❌ | ✅ |

## 7. Implementation Guidelines for Supabase

### 7.1 Authentication Setup
- Enable email/password authentication
- Configure social providers as needed (Google, GitHub, etc.)
- Set up email templates for verification and password reset
- Configure JWT expiration and refresh token settings

### 7.2 Database Configuration
- Create database schema with proper RLS policies
- Set up database triggers for user creation and updates
- Implement functions for common user operations

### 7.3 User Type Checks
```javascript
// Example of checking user type in frontend
const checkUserAccess = async () => {
  const user = supabase.auth.user();
  
  if (!user) {
    // Guest user
    return 'guest';
  }
  
  // Get user details including type
  const { data, error } = await supabase
    .from('users')
    .select('user_type')
    .eq('id', user.id)
    .single();
    
  if (error) {
    console.error('Error fetching user type', error);
    return 'guest';
  }
  
  return data.user_type; // 'registered', 'premium', or 'admin'
};
```

### 7.4 Webhook Integration
- Configure Stripe webhooks to notify of subscription changes
- Implement webhook handlers to update user status and subscription records
- Ensure proper error handling and retry logic

## 8. User Interface Considerations

### 8.1 User Type Indicators
- Visual indicators of current user type in UI
- Clear premium feature markers
- Consistent upgrade prompts for non-premium features

### 8.2 Account Management
- Self-service profile management for all registered users
- Subscription management interface for premium users
- Administrative interface for user management

### 8.3 Authorization Feedback
- Clear messaging when access is denied due to user type
- Helpful upgrade paths when premium features are accessed by non-premium users
- Graceful handling of expired subscriptions

## 9. Testing Strategy

### 9.1 Test Accounts
- Create test accounts for each user type
- Set up Stripe test mode for subscription testing

### 9.2 Test Scenarios
- Authentication flows for each sign-up method
- Access control for each feature by user type
- Subscription upgrade and downgrade scenarios
- Administrative functions

### 9.3 Security Testing
- Test RLS policies for proper data isolation
- Verify JWT token validation and refreshing
- Check for authorization bypass vulnerabilities

## 10. Success Metrics

### 10.1 Key Performance Indicators
- Conversion rate from guest to registered users
- Conversion rate from registered to premium users
- User retention by user type
- Feature usage patterns across user types

### 10.2 Monitoring
- Track authentication success/failure rates
- Monitor permission denial events
- Measure feature access patterns
