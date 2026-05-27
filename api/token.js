// api/token.js
export default async function handler(req, res) {
  // Enable CORS
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');

  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const apiKey = process.env.ASSEMBLYAI_API_KEY;
    
    if (!apiKey) {
      console.error('ASSEMBLYAI_API_KEY not set');
      return res.status(500).json({ error: 'API key not configured on server' });
    }

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
      return res.status(response.status).json({ error: 'Failed to get token from AssemblyAI' });
    }

    const data = await response.json();
    return res.status(200).json({ token: data.token });

  } catch (error) {
    console.error('Token handler error:', error);
    return res.status(500).json({ error: error.message });
  }
}
