export default async function handler(req, res) {
  // Ensure only POST requests are processed
  if (req.method !== 'POST') {
    return res.status(405).send('Method Not Allowed');
  }
  
  // Access the secret API key stored in Vercel Environment Variables
  const REMOVE_BG_KEY = process.env.REMOVE_BG_KEY;
  if (!REMOVE_BG_KEY) {
    return res.status(500).json({ error: 'Missing Remove.bg API Key' });
  }

  try {
    // Forward the Base64 image JSON directly to Remove.bg
    const response = await fetch('https://api.remove.bg/v1.0/removebg', {
      method: 'POST',
      headers: {
        'X-Api-Key': REMOVE_BG_KEY,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(req.body) 
    });
    
    if (!response.ok) {
      const errText = await response.text();
      console.error('Remove.bg Error:', errText);
      throw new Error('Remove.bg processing failed');
    }
    
    // Receive the transparent PNG as an ArrayBuffer and return it to the frontend
    const arrayBuffer = await response.arrayBuffer();
    
    res.setHeader('Content-Type', 'image/png');
    res.send(Buffer.from(arrayBuffer));
  } catch(error) {
    res.status(500).json({ error: error.message });
  }
}