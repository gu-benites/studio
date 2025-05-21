# AromaChat - AI-Powered Aromatherapy Assistant

A Next.js application that provides AI-powered aromatherapy recommendations with Redis caching for optimal performance.

## Features

- **AI-Powered Chat** - Get personalized aromatherapy recommendations using OpenAI's GPT models
- **Semantic Search** - Find relevant essential oils and blends using vector embeddings
- **Redis Caching** - Improved performance with automatic caching of API responses
- **Type-Safe** - Built with TypeScript for better developer experience
- **Responsive Design** - Works on desktop and mobile devices

## Tech Stack

- **Frontend**: Next.js 13+ with App Router
- **UI Components**: shadcn/ui (built on Radix UI)
- **Styling**: Tailwind CSS with CSS Variables
- **AI**: OpenAI API (GPT-4, Text Embeddings)
- **Caching**: Redis (via Upstash)
- **Authentication**: Supabase Auth
- **Database**: Supabase PostgreSQL
- **Deployment**: Vercel

## Getting Started

### Prerequisites

- Node.js 16.8 or later
- npm or yarn
- Redis instance (recommended: [Upstash](https://upstash.com/))
- OpenAI API key

### Installation

1. Clone the repository:
   ```bash
   git clone https://github.com/yourusername/aroma-chat.git
   cd aroma-chat
   ```

2. Install dependencies:
   ```bash
   npm install
   # or
   yarn
   ```

   Key packages used:
   - `next`: React framework for server-rendered applications
   - `openai`: Official OpenAI SDK for API interactions
   - `@upstash/redis`: Redis client for caching
   - `@supabase/supabase-js`: Supabase client for authentication and database
   - `@tanstack/react-query`: Data fetching and state management
   - `tailwindcss`: Utility-first CSS framework for styling
   - `class-variance-authority` & `tailwind-merge`: Used by shadcn/ui for component variants
   - `lucide-react`: Icons used by shadcn/ui components
   - `zod`: TypeScript-first schema validation
   - `react-hook-form`: Form handling with validation
   - `@radix-ui/*`: Primitives used by shadcn/ui components

3. Set up environment variables:
   ```env
   # OpenAI
   OPENAI_API_KEY=your_openai_api_key
   
   # Redis (Upstash)
   UPSTASH_REDIS_REST_URL=your_redis_rest_url
   UPSTASH_REDIS_REST_TOKEN=your_redis_rest_token
   
   # Supabase
   NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
   NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
   ```

4. Run the development server:
   ```bash
   npm run dev
   # or
   yarn dev
   ```

   Open [http://localhost:3000](http://localhost:3000) with your browser to see the result.

## Redis Caching

This project uses Redis for caching OpenAI API responses to improve performance and reduce costs. The caching is implemented with the following features:

- **Automatic caching** of completions and embeddings
- **Configurable TTL** for different types of data
- **Namespace support** to prevent key collisions
- **Cache statistics** for monitoring performance

For more details, see the [Redis Service Documentation](./src/lib/redis/README.md).

## OpenAI Integration

The application uses OpenAI's API for generating chat completions and embeddings. The integration includes:

- Type-safe API clients
- Automatic retries with exponential backoff
- Streaming support for chat completions
- Batch processing for embeddings

For more details, see the [OpenAI Service Documentation](./src/lib/openai/README.md).

## Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add some amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## Acknowledgments

- [Next.js](https://nextjs.org/) - The React Framework
- [OpenAI](https://openai.com/) - AI Models
- [Upstash](https://upstash.com/) - Serverless Redis
- [Supabase](https://supabase.com/) - Open Source Firebase Alternative
