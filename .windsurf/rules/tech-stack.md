---
trigger: always_on
---

Technical Stack Documentation

## Core Technologies

### 1. Frontend
- **Framework**: Next.js 15.2.3 (App Router)
- **Language**: TypeScript 5.x
- **Styling**: Tailwind CSS 3.4.1 with shadcn/ui
- **UI Components**: Radix UI primitives with shadcn/ui
- **State Management**: @tanstack/react-query 5.66.0
- **Form Handling**: react-hook-form 7.54.2 with zod 3.24.2
- **Icons**: Lucide React 0.475.0

### 2. Backend
- **Runtime**: Node.js 18+
- **API Layer**: 
  - Next.js API Routes
  - Hasura GraphQL (v2.0+) - GraphQL layer on top of Supabase
- **Authentication**: 
  - Supabase Auth with @supabase/ssr
  - Client-side authentication with React Context
  - Server-side session management
  - JWT-based authentication with Hasura claims
  - User profile synchronization
- **Database**: 
  - Supabase PostgreSQL
- **Caching**: 
  - Redis via Upstash (@upstash/redis 1.34.9)
  - Hasura response caching
- **AI Integration**: OpenAI API (openai 4.100.0)