// api/token.js
export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  
  if (req.method === 'OPTIONS') {
    res.setHeader('Access-Control-Allow-Methods', 'GET, OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
    return res.status(200).end();
  }

  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const apiKey = process.env.ASSEMBLYAI_API_KEY;
    
    if (!apiKey) {
      console.error('ASSEMBLYAI_API_KEY not set in environment');
      return res.status(500).json({ error: 'API key not configured on server' });
    }

    // Must get a real token from AssemblyAI - API key directly won't work for WebSocket
    const response = await fetch('https://api.assemblyai.com/v2/realtime/token', {
      method: 'POST',
      headers: {
        'Authorization': apiKey,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({ expires_in: 1800 })
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error('AssemblyAI token error:', response.status, errorText);
      return res.status(response.status).json({ 
        error: 'Failed to get token from AssemblyAI',
        details: errorText
      });
    }

    const data = await response.json();
    console.log('Token obtained successfully, expires in 1800 seconds');
    return res.status(200).json({ token: data.token });

  } catch (error) {
    console.error('Token handler error:', error);
    return res.status(500).json({ error: error.message });
  }
}
