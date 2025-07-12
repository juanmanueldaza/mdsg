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
  console.error(
    'Please set GITHUB_CLIENT_ID and GITHUB_CLIENT_SECRET environment variables'
  );
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

  // Validate required parameters
  if (!code) {
    console.log('OAuth attempt missing authorization code');
    return res.status(400).json({
      error: 'Authorization code required',
      details: 'The authorization code from GitHub is missing',
    });
  }

  if (typeof code !== 'string' || code.trim().length === 0) {
    console.log('OAuth attempt with invalid authorization code format');
    return res.status(400).json({
      error: 'Invalid authorization code format',
      details: 'Authorization code must be a non-empty string',
    });
  }

  console.log(
    `Processing OAuth token exchange for code: ${code.substring(0, 8)}...`
  );

  try {
    // Exchange code for access token
    const tokenResponse = await fetch(
      'https://github.com/login/oauth/access_token',
      {
        method: 'POST',
        headers: {
          Accept: 'application/json',
          'Content-Type': 'application/json',
          'User-Agent': 'MDSG-OAuth-Server',
        },
        body: JSON.stringify({
          client_id: GITHUB_CLIENT_ID,
          client_secret: GITHUB_CLIENT_SECRET,
          code: code.trim(),
        }),
      }
    );

    if (!tokenResponse.ok) {
      console.error(
        `GitHub API responded with status: ${tokenResponse.status}`
      );
      return res.status(502).json({
        error: 'GitHub API error',
        details: `GitHub returned status ${tokenResponse.status}`,
      });
    }

    const tokenData = await tokenResponse.json();

    if (tokenData.error) {
      console.error(
        'GitHub OAuth error:',
        tokenData.error,
        tokenData.error_description
      );
      return res.status(400).json({
        error: tokenData.error_description || tokenData.error,
        details: 'GitHub rejected the authorization code',
      });
    }

    if (!tokenData.access_token) {
      console.error('GitHub response missing access token:', tokenData);
      return res.status(502).json({
        error: 'Invalid response from GitHub',
        details: 'GitHub did not return an access token',
      });
    }

    console.log('OAuth token exchange successful');
    res.json({
      access_token: tokenData.access_token,
      token_type: tokenData.token_type || 'bearer',
      scope: tokenData.scope,
    });
  } catch (error) {
    console.error('OAuth error:', error.message);
    res.status(500).json({
      error: 'Internal server error',
      details: 'Failed to process OAuth request',
    });
  }
});

// Health check endpoint
app.get('/health', (req, res) => {
  res.json({
    status: 'ok',
    timestamp: new Date().toISOString(),
    service: 'MDSG OAuth Server',
    version: '1.0.0',
    endpoints: {
      oauth: '/auth/github',
      health: '/health',
    },
    environment: {
      port: PORT,
      node_version: process.version,
      github_client_configured: !!GITHUB_CLIENT_ID,
    },
  });
});

// 404 handler for unknown routes
app.use((req, res) => {
  res.status(404).json({
    error: 'Not found',
    details: `Route ${req.method} ${req.path} not found`,
    available_endpoints: ['/auth/github', '/health'],
  });
});

// Global error handler
app.use((error, req, res, next) => {
  console.error('Unhandled error:', error);
  res.status(500).json({
    error: 'Internal server error',
    details: 'An unexpected error occurred',
  });
});

app.listen(PORT, () => {
  console.log(`🚀 MDSG OAuth Server started successfully`);
  console.log(`📍 Server URL: http://localhost:${PORT}`);
  console.log(`🔧 GitHub OAuth app callback URL: http://localhost:${PORT}`);
  console.log(
    `🔑 GitHub Client ID: ${GITHUB_CLIENT_ID ? 'Configured' : 'Missing'}`
  );
  console.log(`🗂️  Available endpoints:`);
  console.log(`   POST /auth/github - OAuth token exchange`);
  console.log(`   GET  /health      - Health check`);
  console.log(`✅ Ready to handle OAuth requests!`);
});
