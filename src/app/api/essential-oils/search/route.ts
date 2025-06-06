
import { createServerClient, type CookieOptions } from '@supabase/ssr';
import { cookies } from 'next/headers';
import { NextRequest, NextResponse } from 'next/server';
import type { Database } from '@/types/supabase';

export async function POST(request: NextRequest) {
  try {
    const { query, threshold = 0.3, limit = 10, mode = 'semantic' } = await request.json();
    
    if (!query) {
      return NextResponse.json({ error: 'Query is required' }, { status: 400 });
    }
    
    const cookieStore = cookies();
    const supabase = createServerClient<Database>(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
      {
        cookies: {
          get(name: string) {
            return cookieStore.get(name)?.value
          },
          // For read-only operations in this route, set/remove might not be strictly necessary
          // but are good to include for completeness if Supabase client internally uses them.
          set(name: string, value: string, options: CookieOptions) {
            // API routes typically don't set cookies on behalf of Supabase auth unless it's an auth flow.
            // If needed, you'd use response.cookies.set(...) on a NextResponse object.
            // cookieStore.set({ name, value, ...options }) // This won't persist for the client
          },
          remove(name: string, options: CookieOptions) {
            // cookieStore.set({ name, value: '', ...options }) // This won't persist for the client
          },
        },
      }
    );
    
    // Fallback to standard text search if mode is 'text' or if OPENAI_API_KEY is not set
    if (mode !== 'semantic' || !process.env.OPENAI_API_KEY) {
      const { data, error } = await supabase
        .from('essential_oils')
        .select('id, name_english, name_scientific, name_portuguese, general_description')
        .ilike('names_concatenated', `%${query}%`)
        .limit(limit);
      
      if (error) {
        console.error('Text search error:', error);
        return NextResponse.json({ error: error.message }, { status: 500 });
      }
      
      return NextResponse.json({ data });
    }
    
    // If mode is semantic and OPENAI_API_KEY is set, perform semantic search
    try {
      // 1. Generate embedding from OpenAI API
      const embeddingResponse = await fetch('https://api.openai.com/v1/embeddings', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${process.env.OPENAI_API_KEY}`
        },
        body: JSON.stringify({
          model: 'text-embedding-3-small',
          input: query
        })
      });
      
      if (!embeddingResponse.ok) {
        const errorData = await embeddingResponse.json();
        throw new Error(`OpenAI API error: ${JSON.stringify(errorData)}`);
      }
      
      const embeddingResult = await embeddingResponse.json();
      const embedding = embeddingResult.data[0].embedding;
      
      // 2. Use the embedding to perform vector search in Supabase
      const { data, error } = await supabase
        .rpc('match_essential_oils', {
          query_embedding: embedding,
          match_threshold: threshold,
          match_count: limit
        });
      
      if (error) {
        console.error('Vector search error:', error);
        return NextResponse.json({ error: error.message }, { status: 500 });
      }
      
      return NextResponse.json({ data });
    } catch (semanticError: any) {
      console.error('Semantic search error:', semanticError);
      
      // Fallback to text search if semantic search fails
      const { data, error } = await supabase
        .from('essential_oils')
        .select('id, name_english, name_scientific, name_portuguese, general_description')
        .ilike('names_concatenated', `%${query}%`)
        .limit(limit);
      
      if (error) {
        console.error('Fallback text search error:', error);
        return NextResponse.json({ error: error.message }, { status: 500 });
      }
      
      return NextResponse.json({ 
        data, 
        warning: 'Semantic search failed, falling back to text search' 
      });
    }
  } catch (error: any) {
    console.error('Search API error:', error);
    return NextResponse.json({ error: error.message || 'An unexpected error occurred' }, { status: 500 });
  }
}

