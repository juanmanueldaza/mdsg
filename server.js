// Simple OAuth proxy server for MDSG
// This handles the GitHub OAuth flow securely

import express from 'express';
import cors from 'cors';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

const app = express();
const PORT = process.env.PORT || 3001;

// GitHub OAuth configuration
const GITHUB_CLIENT_ID = process.env.GITHUB_CLIENT_ID;
const GITHUB_CLIENT_SECRET = process.env.GITHUB_CLIENT_SECRET;

if (!GITHUB_CLIENT_ID || !GITHUB_CLIENT_SECRET) {
  console.error('Please set GITHUB_CLIENT_ID and GITHUB_CLIENT_SECRET environment variables');
  process.exit(1);
}

app.use(cors());
app.use(express.json());

// Serve static files from parent directory (for development)
const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
app.use(express.static(__dirname));

// OAuth callback endpoint
app.post('/auth/github', async (req, res) => {
  const { code } = req.body;

  if (!code) {
    return res.status(400).json({ error: 'Authorization code required' });
  }

  try {
    // Exchange code for access token
    const tokenResponse = await fetch('https://github.com/login/oauth/access_token', {
      method: 'POST',
      headers: {
        'Accept': 'application/json',
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        client_id: GITHUB_CLIENT_ID,
        client_secret: GITHUB_CLIENT_SECRET,
        code: code,
      }),
    });

    const tokenData = await tokenResponse.json();

    if (tokenData.error) {
      return res.status(400).json({ error: tokenData.error_description });
    }

    res.json({ access_token: tokenData.access_token });
  } catch (error) {
    console.error('OAuth error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Health check
app.get('/health', (req, res) => {
  res.json({ status: 'ok' });
});

app.listen(PORT, () => {
  console.log(`OAuth server running on http://localhost:${PORT}`);
  console.log(`Configure your GitHub OAuth app callback URL to: http://localhost:${PORT}`);
});
