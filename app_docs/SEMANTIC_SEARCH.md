# Semantic Search for Essential Oils

This document outlines the implementation of a semantic search system for essential oils using OpenAI embeddings, pgvector, and Redis caching.

## Overview

The system enables users to search for essential oils using natural language queries. It leverages:

- **OpenAI's text-embedding-ada-002** for generating vector embeddings
- **PostgreSQL with pgvector** for vector similarity search
- **Redis** for caching embeddings and search results
- **Next.js API Routes** for the backend API

## Database Schema

### Essential Oils Table
```sql
CREATE TABLE public.essential_oils (
    id UUID PRIMARY KEY,
    name_english TEXT NOT NULL,
    name_scientific TEXT,
    name_portuguese TEXT,
    general_description TEXT,
    embedding VECTOR(1536),  -- OpenAI embedding vector
    -- other fields...
);

-- Create index for vector search
CREATE INDEX ON essential_oils USING ivfflat (embedding vector_cosine_ops) WITH (lists = 100);
```

### Search Function

```sql
CREATE OR REPLACE FUNCTION public.get_essential_oils(
    p_query_embedding VECTOR(1536),
    p_match_threshold FLOAT,
    p_match_count INT
)
RETURNS TABLE (
    id UUID,
    name_english TEXT,
    name_scientific TEXT,
    name_portuguese TEXT,
    general_description TEXT,
    similarity FLOAT
)
LANGUAGE plpgsql
AS $$
BEGIN
    RETURN QUERY
    SELECT
        eo.id,
        eo.name_english,
        eo.name_scientific,
        eo.name_portuguese,
        eo.general_description,
        1 - (eo.embedding <=> p_query_embedding) AS similarity
    FROM
        public.essential_oils eo
    WHERE
        eo.embedding IS NOT NULL
        AND (eo.embedding <=> p_query_embedding) < (1 - p_match_threshold)
    ORDER BY
        eo.embedding <=> p_query_embedding
    LIMIT p_match_count;
END;
$$;
```

## API Endpoints

### Search Oils

**Endpoint:** `POST /api/semantic-search`

**Request Body:**
```json
{
  "query": "calming lavender oil",
  "matchCount": 5,
  "matchThreshold": 0.7
}
```

**Response:**
```json
{
  "results": [
    {
      "id": "uuid-here",
      "name_english": "Lavender",
      "name_scientific": "Lavandula angustifolia",
      "similarity": 0.92
    }
  ]
}
```

## Client-Side Usage

### React Hook

```typescript
const { search, results, isLoading, error } = useSemanticSearch();

// Example usage:
await search("calming oil for sleep", {
  matchCount: 5,
  matchThreshold: 0.7
});
```

### Search Component

```tsx
<OilSearch 
  onSelectOil={(oil) => {
    // Handle selected oil
  }} 
  placeholder="Search for an essential oil..."
/>
```

## Caching Strategy

### Embedding Cache
- **Key Format:** `oil_embedding:{base64(query)}`
- **TTL:** 7 days
- **Purpose:** Cache OpenAI embeddings for search queries

### Search Result Cache
- **Key Format:** `oil_search:{base64(query:matchCount:matchThreshold)}`
- **TTL:** 1 hour
- **Purpose:** Cache search results for common queries

### Cache Invalidation
Cache is automatically invalidated when:
1. An essential oil is created, updated, or deleted
2. The TTL expires
3. Manual invalidation is triggered

## Performance Considerations

1. **Indexing**: The `ivfflat` index on the embedding column ensures fast similarity searches.
2. **Batch Processing**: For bulk operations, process embeddings in batches.
3. **Rate Limiting**: Implement rate limiting on the API to prevent abuse.
4. **Edge Caching**: Consider using a CDN for global low-latency access.

## Error Handling

The system handles the following error cases:
- Missing or invalid API keys
- Database connection issues
- Rate limiting
- Invalid input parameters

## Monitoring and Logging

Log the following events:
- Cache hits/misses
- Search query performance
- Error conditions
- Cache invalidation events

## Security Considerations

1. **API Keys**: Store API keys in environment variables
2. **Input Validation**: Validate all user inputs
3. **Rate Limiting**: Implement rate limiting on the API
4. **Error Handling**: Don't expose sensitive information in error responses

## Future Improvements

1. **Hybrid Search**: Combine semantic search with keyword search
2. **User Feedback**: Implement feedback mechanism to improve search quality
3. **Personalization**: Personalize search results based on user preferences
4. **Multi-language Support**: Support for non-English queries

## Troubleshooting

### Common Issues

1. **No results returned**
   - Check if embeddings are generated for all oils
   - Verify the match threshold isn't set too high

2. **Slow search performance**
   - Ensure the pgvector index is properly created
   - Check Redis connection and cache hit rate

3. **Authentication errors**
   - Verify API keys are correctly set in environment variables
   - Check for rate limiting

## Related Documents

- [Database Schema Documentation](./DATABASE_SCHEMA.md)
- [API Reference](./API_REFERENCE.md)
- [Performance Benchmarks](./PERFORMANCE.md)

## Changelog

### [1.0.0] - 2025-05-20
- Initial implementation of semantic search
- Added Redis caching layer
- Created API endpoints and React hooks
