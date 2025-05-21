# AromaChat - Technical Stack Documentation

## Core Technologies

### 1. Frontend
- **Framework**: Next.js 13+ (App Router)
- **Language**: TypeScript 5.0+
- **Styling**: Tailwind CSS 3.0+
- **UI Components**: shadcn/ui (built on Radix UI)
- **State Management**: @tanstack/react-query
- **Form Handling**: react-hook-form with zod validation
- **Icons**: Lucide React

### 2. Backend
- **Runtime**: Node.js 18+
- **API Layer**: Next.js API Routes
- **Authentication**: Supabase Auth
- **Database**: Supabase PostgreSQL
- **Caching**: Redis (via Upstash)
- **AI Integration**: OpenAI API

### 3. Infrastructure
- **Hosting**: Vercel
- **CI/CD**: GitHub Actions
- **Monitoring**: Vercel Analytics
- **Error Tracking**: Sentry (optional)

## Detailed Architecture

### 1. Frontend Architecture

#### Component Structure
```
src/
├── app/                    # App Router pages
├── components/
│   ├── ui/                 # shadcn/ui components
│   ├── layout/              # Layout components
│   └── shared/              # Shared components
├── lib/
│   ├── api/               # API clients
│   ├── hooks/              # Custom hooks
│   └── utils/              # Utility functions
└── styles/                 # Global styles
```

#### State Management
- **Server State**: React Query for data fetching and caching
- **Client State**: React Context + useReducer for global state
- **Form State**: react-hook-form with zod validation
- **URL State**: Next.js router query params

### 2. Backend Architecture

#### API Routes
```
app/
├── api/
│   ├── auth/             # Authentication endpoints
│   ├── chat/             # Chat API endpoints
│   └── admin/            # Admin API endpoints
```

#### Services
- **OpenAI Service**: Handles all AI model interactions
- **Redis Service**: Manages caching layer
- **Database Service**: Handles database operations
- **Auth Service**: Manages authentication and authorization

## Development Environment

### 1. Prerequisites
- Node.js 18+
- npm 9+ or yarn 1.22+
- Git
- Docker (for local Redis)

### 2. Setup

#### Local Development
```bash
# Clone repository
git clone https://github.com/yourusername/aroma-chat.git
cd aroma-chat

# Install dependencies
npm install

# Set up environment variables
cp .env.example .env.local
# Edit .env.local with your credentials

# Start development server
npm run dev
```

#### Environment Variables
```env
# Next.js
NEXT_PUBLIC_APP_URL=http://localhost:3000
NODE_ENV=development

# Supabase
NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key

# OpenAI
OPENAI_API_KEY=your_openai_api_key

# Redis (Upstash)
UPSTASH_REDIS_REST_URL=your_redis_rest_url
UPSTASH_REDIS_REST_TOKEN=your_redis_rest_token
```

## Deployment

### 1. Production Build
```bash
# Install dependencies
npm install --production=false

# Build the application
npm run build

# Start the production server
npm start
```

### 2. Vercel Deployment
1. Connect your GitHub repository to Vercel
2. Set up environment variables in Vercel dashboard
3. Deploy!

## Performance Optimization

### 1. Code Splitting
- Automatic with Next.js dynamic imports
- Component-level code splitting with `next/dynamic`

### 2. Image Optimization
- Next.js Image component
- WebP format with fallbacks
- Lazy loading

### 3. Caching Strategy
- Client-side: React Query cache
- Server-side: Redis cache
- CDN: Vercel Edge Network

## Security

### 1. Authentication
- JWT-based authentication with Supabase
- Secure HTTP-only cookies
- CSRF protection

### 2. Data Protection
- Environment variables for sensitive data
- Row-level security in Supabase
- Input validation with zod

### 3. API Security
- Rate limiting
- CORS configuration
- Request validation

## Monitoring and Analytics

### 1. Error Tracking
- Error boundaries in React
- Server-side error logging
- Optional: Sentry integration

### 2. Performance Monitoring
- Web Vitals
- Custom performance metrics
- Vercel Analytics

## Testing

### 1. Unit Testing
- Jest + React Testing Library
- Test coverage reporting
- Snapshot testing

### 2. E2E Testing
- Playwright
- Visual regression testing
- API contract testing

### 3. Performance Testing
- Lighthouse CI
- WebPageTest
- Synthetic monitoring

## CI/CD Pipeline

### 1. GitHub Actions
- Linting and type checking
- Unit tests
- E2E tests
- Performance budgets
- Automatic deployments

## Documentation

### 1. Code Documentation
- JSDoc for functions and components
- README files in key directories
- TypeScript types for API contracts

### 2. API Documentation
- OpenAPI/Swagger
- Example requests and responses
- Authentication requirements

## Contributing

### 1. Development Workflow
1. Create a feature branch from `main`
2. Make your changes
3. Write tests
4. Submit a pull request

### 2. Code Style
- ESLint + Prettier
- TypeScript strict mode
- Consistent import ordering

### 3. Git Commit Messages
Conventional Commits specification:
- `feat`: New feature
- `fix`: Bug fix
- `docs`: Documentation changes
- `style`: Code style changes
- `refactor`: Code refactoring
- `test`: Adding tests
- `chore`: Build process or tooling changes
