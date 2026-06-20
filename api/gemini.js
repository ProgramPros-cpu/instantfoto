export const config = { runtime: 'edge' };

export default async function handler(req) {
  // Only allow POST requests for security
  if (req.method !== 'POST') {
    return new Response('Method Not Allowed', { status: 405 });
  }
  
  // Extract the specific Gemini model from the URL parameters
  const url = new URL(req.url);
  const model = url.searchParams.get('model') || 'gemini-2.5-flash-preview-09-2025';
  
  // Access the secret API key stored in Vercel Environment Variables
  const GEMINI_API_KEY = process.env.GEMINI_API_KEY;
  if (!GEMINI_API_KEY) {
    return new Response(JSON.stringify({ error: 'Missing Gemini API Key' }), { status: 500 });
  }

  const endpoint = `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${GEMINI_API_KEY}`;
  
  try {
    const body = await req.json();
    
    // Relay the request to Google AI Studio
    const response = await fetch(endpoint, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(body)
    });
    
    const data = await response.json();
    
    return new Response(JSON.stringify(data), { 
      status: 200, 
      headers: { 'Content-Type': 'application/json' } 
    });
  } catch (error) {
    console.error('Gemini Proxy Error:', error);
    return new Response(JSON.stringify({ error: 'Failed to call Gemini API' }), { status: 500 });
  }
}