// api/token.js - Copy this to your OmniNote project
export default async function handler(req, res) {
  // Enable CORS for your frontend
  res.setHeader('Access-Control-Allow-Origin', '*');
  
  if (req.method === 'OPTIONS') {
    res.setHeader('Access-Control-Allow-Methods', 'GET, OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
    return res.status(200).end();
  }

  if (req.method !== 'GET') {
    return res.status(405).json({ 
      error: 'Method not allowed', 
      message: 'This endpoint only accepts GET requests' 
    });
  }

  try {
    const apiKey = process.env.ASSEMBLYAI_API_KEY;
    
    if (!apiKey) {
      console.error('ASSEMBLYAI_API_KEY environment variable is missing');
      return res.status(500).json({ 
        error: 'API key not configured',
        message: 'Please add ASSEMBLYAI_API_KEY to your Vercel environment variables'
      });
    }

    console.log('Requesting token from AssemblyAI...');
    
    // Try the standard token endpoint first
    let response = await fetch('https://api.assemblyai.com/v2/realtime/token', {
      method: 'POST',
      headers: {
        'Authorization': apiKey,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({ expires_in: 1800 })
    });

    // If token endpoint fails, return the API key directly as token
    if (!response.ok) {
      console.log(`Token endpoint returned ${response.status}, falling back to direct API key`);
      // Return the API key - it works directly in WebSocket URL for newer accounts
      return res.status(200).json({ 
        token: apiKey,
        message: 'Using direct API key (token endpoint fallback)'
      });
    }

    const data = await response.json();
    console.log('Token obtained successfully from AssemblyAI');
    return res.status(200).json({ token: data.token });

  } catch (error) {
    console.error('Token handler error:', error.message);
    // Fallback: return API key directly
    const apiKey = process.env.ASSEMBLYAI_API_KEY;
    if (apiKey) {
      console.log('Error occurred, falling back to direct API key');
      return res.status(200).json({ 
        token: apiKey,
        message: 'Using direct API key (error fallback)'
      });
    }
    return res.status(500).json({ 
      error: error.message,
      message: 'Check server logs for more details'
    });
  }
}
