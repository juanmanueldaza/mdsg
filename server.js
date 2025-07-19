import express from 'express';
import cors from 'cors';
import crypto from 'crypto';
import { URL } from 'url';

const app = express();
const PORT = process.env.PORT || 3000;

// Environment variables with secure defaults
const GITHUB_CLIENT_ID = process.env.GITHUB_CLIENT_ID || 'Ov23liKZ8KgfLQDZFGSR';
const GITHUB_CLIENT_SECRET = process.env.GITHUB_CLIENT_SECRET;
const JWT_SECRET =
  process.env.JWT_SECRET || crypto.randomBytes(32).toString('hex');
const FRONTEND_URL = process.env.FRONTEND_URL || 'http://localhost:5173';
const NODE_ENV = process.env.NODE_ENV || 'development';

// Security: Ensure required environment variables in production
if (NODE_ENV === 'production' && !GITHUB_CLIENT_SECRET) {
  console.error('GITHUB_CLIENT_SECRET is required in production');
  process.exit(1);
}

// Rate limiting store (in-memory for simplicity, use Redis in production)
const rateLimitStore = new Map();

// Security middleware
app.use(express.json({ limit: '10kb' })); // Limit payload size
app.use(express.urlencoded({ extended: true, limit: '10kb' }));

// CORS configuration
app.use(
  cors({
    origin:
      NODE_ENV === 'production'
        ? ['https://mdsg.daza.ar', 'https://juanmanueldaza.github.io']
        : [FRONTEND_URL, 'http://localhost:5173', 'http://127.0.0.1:5173'],
    credentials: true,
    methods: ['GET', 'POST'],
    allowedHeaders: ['Content-Type', 'Authorization'],
  })
);

// Security headers
app.use((req, res, next) => {
  res.setHeader('X-Content-Type-Options', 'nosniff');
  res.setHeader('X-Frame-Options', 'DENY');
  res.setHeader('X-XSS-Protection', '1; mode=block');
  res.setHeader('Referrer-Policy', 'strict-origin-when-cross-origin');

  if (NODE_ENV === 'production') {
    res.setHeader(
      'Strict-Transport-Security',
      'max-age=31536000; includeSubDomains'
    );
  }

  next();
});

// Rate limiting middleware
const rateLimit = (windowMs = 15 * 60 * 1000, maxRequests = 10) => {
  return (req, res, next) => {
    const clientId = req.ip || req.connection.remoteAddress;
    const now = Date.now();

    if (!rateLimitStore.has(clientId)) {
      rateLimitStore.set(clientId, { requests: 1, resetTime: now + windowMs });
      return next();
    }

    const clientData = rateLimitStore.get(clientId);

    if (now > clientData.resetTime) {
      rateLimitStore.set(clientId, { requests: 1, resetTime: now + windowMs });
      return next();
    }

    if (clientData.requests >= maxRequests) {
      return res.status(429).json({
        error: 'Too many requests',
        message: 'Rate limit exceeded. Please try again later.',
      });
    }

    clientData.requests++;
    next();
  };
};

// Input validation utilities
const validateUrl = url => {
  try {
    new URL(url);
    return true;
  } catch {
    return false;
  }
};
const validateGitHubCode = code => {
  return (
    typeof code === 'string' &&
    code.length > 0 &&
    code.length < 100 &&
    /^[a-zA-Z0-9_-]+$/.test(code)
  );
};

// Simple JWT-like token creation (for session management)
const createSessionToken = userData => {
  const payload = JSON.stringify({
    login: userData.login,
    id: userData.id,
    avatar_url: userData.avatar_url,
    exp: Date.now() + 24 * 60 * 60 * 1000, // 24 hours
  });

  const signature = crypto
    .createHmac('sha256', JWT_SECRET)
    .update(payload)
    .digest('base64url');

  return `${Buffer.from(payload).toString('base64url')}.${signature}`;
};

// Verify session token
const verifySessionToken = token => {
  try {
    const [payloadB64, signature] = token.split('.');
    const payload = JSON.parse(Buffer.from(payloadB64, 'base64url').toString());

    const expectedSignature = crypto
      .createHmac('sha256', JWT_SECRET)
      .update(JSON.stringify(payload))
      .digest('base64url');

    if (signature !== expectedSignature) {
      return null;
    }

    if (Date.now() > payload.exp) {
      return null;
    }

    return payload;
  } catch {
    return null;
  }
};

// Health check endpoint
app.get('/health', (req, res) => {
  res.json({
    status: 'ok',
    timestamp: new Date().toISOString(),
    environment: NODE_ENV,
  });
});

// OAuth callback endpoint
app.get('/auth/github/callback', rateLimit(), async (req, res) => {
  try {
    const { code, state } = req.query;

    // Input validation
    if (!validateGitHubCode(code)) {
      return res.status(400).json({
        error: 'Invalid authorization code',
        message: 'The authorization code is invalid or missing.',
      });
    }

    // Exchange code for access token
    const tokenResponse = await fetch(
      'https://github.com/login/oauth/access_token',
      {
        method: 'POST',
        headers: {
          Accept: 'application/json',
          'Content-Type': 'application/json',
          'User-Agent': 'MDSG/1.0.0',
        },
        body: JSON.stringify({
          client_id: GITHUB_CLIENT_ID,
          client_secret: GITHUB_CLIENT_SECRET,
          code: code,
        }),
      }
    );

    if (!tokenResponse.ok) {
      throw new Error(`GitHub token exchange failed: ${tokenResponse.status}`);
    }

    const tokenData = await tokenResponse.json();

    if (tokenData.error) {
      throw new Error(
        `GitHub OAuth error: ${tokenData.error_description || tokenData.error}`
      );
    }

    // Fetch user data
    const userResponse = await fetch('https://api.github.com/user', {
      headers: {
        Authorization: `token ${tokenData.access_token}`,
        Accept: 'application/vnd.github.v3+json',
        'User-Agent': 'MDSG/1.0.0',
      },
    });

    if (!userResponse.ok) {
      throw new Error(`GitHub user fetch failed: ${userResponse.status}`);
    }

    const userData = await userResponse.json();

    // Create session token (contains only public user info)
    const sessionToken = createSessionToken(userData);

    // Store the actual GitHub token securely (in production, use encrypted database/Redis)
    // For now, we'll create a mapping ID and store it in memory
    const tokenId = crypto.randomUUID();
    rateLimitStore.set(`token_${tokenId}`, {
      github_token: tokenData.access_token,
      user_id: userData.id,
      created_at: Date.now(),
      expires_at: Date.now() + 24 * 60 * 60 * 1000,
    });

    // Redirect back to frontend with session token
    const redirectUrl = new URL(FRONTEND_URL);
    redirectUrl.searchParams.set('session', sessionToken);
    redirectUrl.searchParams.set('token_id', tokenId);

    res.redirect(redirectUrl.toString());
  } catch (error) {
    console.error('OAuth callback error:', error.message);

    // Redirect to frontend with error (don't expose internal error details)
    const redirectUrl = new URL(FRONTEND_URL);
    redirectUrl.searchParams.set('error', 'auth_failed');
    redirectUrl.searchParams.set(
      'message',
      'Authentication failed. Please try again.'
    );

    res.redirect(redirectUrl.toString());
  }
});

// GitHub API proxy endpoint (for authenticated requests)
app.post(
  '/api/github/:endpoint(*)',
  rateLimit(15 * 60 * 1000, 30),
  async (req, res) => {
    try {
      const { endpoint } = req.params;
      const { token_id, method = 'GET' } = req.body;

      // Validate token_id
      if (!token_id || typeof token_id !== 'string') {
        return res.status(401).json({ error: 'Invalid token identifier' });
      }

      // Retrieve GitHub token
      const tokenData = rateLimitStore.get(`token_${token_id}`);
      if (!tokenData || Date.now() > tokenData.expires_at) {
        return res.status(401).json({ error: 'Token expired or invalid' });
      }

      // Validate endpoint
      if (!/^[a-zA-Z0-9\/_-]+$/.test(endpoint)) {
        return res.status(400).json({ error: 'Invalid API endpoint' });
      }

      // Make request to GitHub API
      const githubResponse = await fetch(`https://api.github.com/${endpoint}`, {
        method: method.toUpperCase(),
        headers: {
          Authorization: `token ${tokenData.github_token}`,
          Accept: 'application/vnd.github.v3+json',
          'User-Agent': 'MDSG/1.0.0',
          'Content-Type': 'application/json',
        },
        body:
          method !== 'GET' ? JSON.stringify(req.body.data || {}) : undefined,
      });

      const responseData = await githubResponse.json();

      res.status(githubResponse.status).json(responseData);
    } catch (error) {
      console.error('GitHub API proxy error:', error.message);
      res.status(500).json({
        error: 'Internal server error',
        message: 'An error occurred while processing your request.',
      });
    }
  }
);

// Logout endpoint
app.post('/auth/logout', (req, res) => {
  try {
    const { token_id } = req.body;

    if (token_id) {
      rateLimitStore.delete(`token_${token_id}`);
    }

    res.json({ success: true });
  } catch (error) {
    console.error('Logout error:', error.message);
    res.status(500).json({ error: 'Logout failed' });
  }
});

// Error handling middleware
app.use((error, req, res, next) => {
  console.error('Server error:', error);

  res.status(500).json({
    error: 'Internal server error',
    message:
      NODE_ENV === 'development' ? error.message : 'Something went wrong.',
  });
});

// 404 handler
app.use((req, res) => {
  res.status(404).json({
    error: 'Not found',
    message: 'The requested endpoint does not exist.',
  });
});

// Cleanup expired tokens periodically
setInterval(
  () => {
    const now = Date.now();
    for (const [key, value] of rateLimitStore.entries()) {
      if (
        key.startsWith('token_') &&
        value.expires_at &&
        now > value.expires_at
      ) {
        rateLimitStore.delete(key);
      }
    }
  },
  60 * 60 * 1000
); // Every hour

// Start server
app.listen(PORT, () => {
  console.log(`🚀 MDSG OAuth server running on port ${PORT}`);
  console.log(`📝 Environment: ${NODE_ENV}`);
  console.log(`🔗 Frontend URL: ${FRONTEND_URL}`);
  console.log(`🔑 GitHub Client ID: ${GITHUB_CLIENT_ID}`);

  if (NODE_ENV === 'development') {
    console.log(
      `💡 OAuth callback URL: http://localhost:${PORT}/auth/github/callback`
    );
  }
});

export default app;
