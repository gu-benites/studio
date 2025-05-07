
import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

export async function POST(request: NextRequest) {
  const aromarxBaseUrl = process.env.AROMARX_BASE_URL;
  const aromarxApiKey = process.env.AROMARX_API_KEY;

  if (!aromarxBaseUrl || !aromarxApiKey) {
    console.error('AROMARX_BASE_URL or AROMARX_API_KEY is not defined in environment variables.');
    return NextResponse.json({ error: 'Internal server configuration error.' }, { status: 500 });
  }

  try {
    const requestBody = await request.json();

    if (!requestBody || typeof requestBody !== 'object') {
      return NextResponse.json({ error: 'Invalid request body.' }, { status: 400 });
    }
    
    // Ensure `step` is present in the payload, as it's crucial for the external API.
    if (!requestBody.step) {
        return NextResponse.json({ error: 'Missing "step" in request payload.' }, { status: 400 });
    }

    const externalApiResponse = await fetch(aromarxBaseUrl, {
      method: 'POST',
      headers: {
        'apikey': aromarxApiKey,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(requestBody),
    });

    if (!externalApiResponse.ok) {
      let errorBody;
      try {
        errorBody = await externalApiResponse.json();
      } catch (e) {
        errorBody = await externalApiResponse.text();
      }
      console.error(`External API error: ${externalApiResponse.status}`, errorBody);
      return NextResponse.json(
        { error: 'Failed to fetch data from external API.', details: errorBody },
        { status: externalApiResponse.status }
      );
    }

    const data = await externalApiResponse.json();
    return NextResponse.json(data);

  } catch (error: any) {
    console.error('Error in API proxy route:', error);
    return NextResponse.json({ error: 'Internal server error during API proxy.', details: error.message }, { status: 500 });
  }
}
