# Essential Oils Search Tool Documentation

## Overview
A sophisticated, dual-mode search system for essential oils with advanced AI-powered semantic search capabilities.

## Technical Architecture

### Core Components
1. **Frontend (React/Next.js)**
   - `SemanticSearch` component in `semantic-search.tsx`
   - Manages search UI and interaction
   - Supports two search modes: Text and Semantic

2. **Backend API**
   - Endpoint: `/api/essential-oils/search`
   - Handles both text and semantic search requests
   - Supports dynamic search modes and thresholds

### Search Modes
#### 1. Text Search
- Standard database query
- Matches exact or partial text
- Fast and predictable results
- Suitable for short, precise queries

#### 2. Semantic Search (AI-Powered)
- Uses advanced **Embedding Technology**:
  - **Provider**: OpenAI
  - **Model**: `text-embedding-3-small`
  - **Embedding Process**:
    * Generate high-dimensional vector representation of search query
    * Uses OpenAI's API to create embeddings
    * 1536-dimensional vector space
  - **Search Strategy**:
    * Vector similarity search using Supabase RPC function `match_essential_oils`
    * Configurable similarity threshold (default: 0.3)
    * Fallback to text search if semantic search fails
  - **Key Features**:
    * Dynamic mode switching (text/semantic)
    * Graceful error handling
    * Performance optimization with limit and threshold controls
- Understands context and conceptual relationships
- More flexible and intelligent search
- Requires longer, more descriptive queries

### Key Technical Features
- **Debounced Search**: 500ms delay to reduce unnecessary API calls
- **Adaptive Search Mode**: 
  - Automatically falls back to text search for very short queries
  - Handles semantic search failures gracefully
- **Configurable Similarity Threshold**
  - User can adjust match sensitivity (0.1 - 0.9)
  - Controls semantic search result precision

### Search Flow
1. User enters search query
2. Query is debounced (500ms)
3. Search mode determined (text/semantic)
4. API request sent with:
   - Query text
   - Search mode
   - Similarity threshold
5. Results displayed in `EssentialOilsList`

### Error Handling
- Cancellable requests using `AbortController`
- Fallback mechanisms for search failures
- User-friendly error messages
- Automatic mode switching on errors

### Performance Optimizations
- Request cancellation
- Debounced input
- Limit of 20 search results
- Conditional rendering of loading states

## Technical Stack
- Frontend: React, Next.js
- UI Components: Shadcn/ui
- State Management: React Hooks
- **Search API**: 
  - Endpoint: `/api/essential-oils/search`
  - Supports dual-mode search (text and semantic)
  - Handles request processing and result filtering
  - Implements dynamic search strategies
  - Manages similarity thresholds and search modes
  - Provides fallback mechanisms for search failures

- **Embedding Strategy**:
  - **Implementation**: AI-powered semantic search using vector embeddings
  - **Vector Generation**:
    * Uses OpenAI's `text-embedding-3-small` model
    * Generates 1536-dimensional vector representations
    * Converts search queries and essential oil descriptions into dense vector space
  - **Search Mechanism**:
    * Utilizes Supabase vector similarity search
    * Implements `match_essential_oils` RPC function for vector comparison
    * Calculates cosine similarity between query and oil description vectors
  - **Key Technical Details**:
    * Embedding dimension: 1536
    * Similarity threshold: Configurable (default 0.3)
    * Supports dynamic mode switching between text and semantic search
  - **Performance Considerations**:
    * Pre-computed embeddings stored in Supabase database
    * Efficient vector indexing for fast retrieval
    * Fallback to traditional text search for very short or ambiguous queries
  - **Supported Search Scenarios**:
    * Conceptual matching (e.g., 'calming oil' matches lavender)
    * Contextual understanding of essential oil properties
    * Cross-language and synonym-aware search capabilities

## Future Enhancements
- Implement caching for search results
- Add more advanced filtering options
- Expand semantic search capabilities
- Integrate machine learning for personalized results

## Potential Challenges
- Embedding model accuracy
- Performance with large datasets
- Maintaining low-latency search experience

## Best Practices Demonstrated
- Separation of concerns
- Adaptive user interfaces
- Robust error handling
- Flexible search mechanisms
