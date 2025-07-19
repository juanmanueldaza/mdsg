# MDSG API Documentation

## 🤖 Agent Navigation Hub

**Primary Reference**: `../copilot-instructions.md` → API section
**Cross-References**: 
- `architecture.md` → API architecture patterns
- `security.md` → API security implementation
- `testing.md` → API testing strategies
- `deployment.md` → API deployment configuration

## Overview

MDSG provides both frontend and backend APIs for creating and managing GitHub Pages sites from markdown content. The system uses a secure OAuth proxy pattern to handle GitHub integration while maintaining client-side simplicity.

> **Agent Alert**: Current API consists of working OAuth server (server.js) + client-side MDSG class methods
> **Current Status**: Basic GitHub integration working, advanced API features planned

## Table of Contents

- [Authentication API](#authentication-api)
- [GitHub Proxy API](#github-proxy-api)
- [Frontend JavaScript API](#frontend-javascript-api)
- [Error Handling](#error-handling)
- [Rate Limiting](#rate-limiting)
- [Security](#security)

## Authentication API

### OAuth Flow

#### Initiate GitHub OAuth

**Endpoint**: Manual redirect to GitHub
**URL**: `https://github.com/login/oauth/authorize`

**Parameters**:
```
client_id: string (GitHub App Client ID)
scope: string (repo,user)
state: string (CSRF protection)
redirect_uri: string (OAuth callback URL)
```

**Example**:
```
https://github.com/login/oauth/authorize?
  client_id=Ov23liKZ8KgfLQDZFGSR&
  scope=repo,user&
  state=random_state_string&
  redirect_uri=https://mdsg.daza.ar/auth/github/callback
```

#### OAuth Callback

**Endpoint**: `GET /auth/github/callback`
**Description**: Handles GitHub OAuth callback and creates user session

**Query Parameters**:
- `code` (string, required): GitHub authorization code
- `state` (string, optional): CSRF protection state

**Response**: Redirects to frontend with session data
```
https://mdsg.daza.ar/?session=SESSION_TOKEN&token_id=TOKEN_ID
```

**Error Response**: Redirects with error parameters
```
https://mdsg.daza.ar/?error=auth_failed&message=Authentication%20failed
```

#### Logout

**Endpoint**: `POST /auth/logout`
**Description**: Invalidates user session and cleans up tokens

**Request Body**:
```json
{
  "token_id": "uuid-token-identifier"
}
```

**Response**:
```json
{
  "success": true
}
```

**Error Response**:
```json
{
  "error": "Logout failed"
}
```

## GitHub Proxy API

### Proxy GitHub API Calls

**Endpoint**: `POST /api/github/:endpoint`
**Description**: Securely proxy GitHub API requests with rate limiting

**URL Parameters**:
- `endpoint` (string): GitHub API endpoint path

**Request Body**:
```json
{
  "token_id": "uuid-token-identifier",
  "method": "GET|POST|PUT|DELETE",
  "data": {} // Optional request data for non-GET requests
}
```

**Response**: Proxies GitHub API response directly

**Example - Get User Info**:
```bash
POST /api/github/user
Content-Type: application/json

{
  "token_id": "abc123-def456-ghi789",
  "method": "GET"
}
```

**Example - Create Repository**:
```bash
POST /api/github/user/repos
Content-Type: application/json

{
  "token_id": "abc123-def456-ghi789",
  "method": "POST",
  "data": {
    "name": "my-new-site",
    "description": "Created with MDSG",
    "public": true,
    "auto_init": true
  }
}
```

### Common GitHub Endpoints

#### User Information
- `GET /api/github/user` - Get authenticated user info
- `GET /api/github/user/repos` - List user repositories

#### Repository Management
- `POST /api/github/user/repos` - Create repository
- `GET /api/github/repos/:owner/:repo` - Get repository info
- `DELETE /api/github/repos/:owner/:repo` - Delete repository

#### Content Management
- `GET /api/github/repos/:owner/:repo/contents/:path` - Get file content
- `PUT /api/github/repos/:owner/:repo/contents/:path` - Create/update file
- `DELETE /api/github/repos/:owner/:repo/contents/:path` - Delete file

#### GitHub Pages
- `POST /api/github/repos/:owner/:repo/pages` - Enable GitHub Pages
- `GET /api/github/repos/:owner/:repo/pages` - Get Pages info

## Frontend JavaScript API

### MDSG Class

The main application class provides the core functionality:

```javascript
const mdsg = new MDSG();
```

#### Authentication Methods

##### `checkAuth()`
**Description**: Check current authentication status
**Returns**: `void`
**Side Effects**: Updates UI based on auth state

```javascript
mdsg.checkAuth();
```

##### `loginWithGitHub()`
**Description**: Initiate GitHub OAuth flow
**Returns**: `void`
**Side Effects**: Shows token input interface

```javascript
mdsg.loginWithGitHub();
```

##### `fetchUser(token)`
**Description**: Fetch user information from GitHub
**Parameters**:
- `token` (string): GitHub access token

**Returns**: `Promise<Object>` - User data
**Throws**: `Error` on API failure

```javascript
try {
  const user = await mdsg.fetchUser(token);
  console.log(user.login); // GitHub username
} catch (error) {
  console.error('Failed to fetch user:', error);
}
```

##### `logout()`
**Description**: Log out user and clear session
**Returns**: `void`
**Side Effects**: Clears localStorage and resets UI

```javascript
mdsg.logout();
```

#### Content Management Methods

##### `parseMarkdown(markdown)`
**Description**: Parse markdown content to HTML
**Parameters**:
- `markdown` (string): Raw markdown content

**Returns**: `string` - Parsed HTML
**Security**: Sanitizes output to prevent XSS

```javascript
const html = mdsg.parseMarkdown('# Hello **World**');
// Returns: '<h1>Hello <strong>World</strong></h1>'
```

##### `updatePreview()`
**Description**: Update live preview with current editor content
**Returns**: `void`
**Side Effects**: Updates preview pane DOM

```javascript
mdsg.updatePreview();
```

##### `autoSave()`
**Description**: Save current content to localStorage
**Returns**: `void`
**Side Effects**: Updates localStorage and UI status

```javascript
mdsg.autoSave();
```

#### Deployment Methods

##### `deployToGitHub()`
**Description**: Deploy current content to GitHub Pages
**Returns**: `Promise<Object>` - Deployment result
**Throws**: `Error` on deployment failure

```javascript
try {
  const result = await mdsg.deployToGitHub();
  console.log('Site URL:', result.html_url);
} catch (error) {
  console.error('Deployment failed:', error);
}
```

##### `createRepository(name, options)`
**Description**: Create new GitHub repository
**Parameters**:
- `name` (string): Repository name
- `options` (Object): Repository configuration

**Returns**: `Promise<Object>` - Repository data
**Throws**: `Error` on creation failure

```javascript
const repo = await mdsg.createRepository('my-site', {
  description: 'My awesome site',
  private: false
});
```

##### `enablePages(owner, repo)`
**Description**: Enable GitHub Pages for repository
**Parameters**:
- `owner` (string): Repository owner
- `repo` (string): Repository name

**Returns**: `Promise<Object>` - Pages configuration
**Throws**: `Error` on setup failure

```javascript
const pages = await mdsg.enablePages('username', 'my-site');
console.log('Pages URL:', pages.html_url);
```

#### Utility Methods

##### `showError(message, type)`
**Description**: Display user-friendly error message
**Parameters**:
- `message` (string): Error message
- `type` (string): Error type ('error', 'warning', 'info')

**Returns**: `void`
**Side Effects**: Shows error UI element

```javascript
mdsg.showError('Failed to save content', 'error');
```

##### `isValidToken(token)`
**Description**: Validate GitHub token format
**Parameters**:
- `token` (string): Token to validate

**Returns**: `boolean` - Validation result

```javascript
const isValid = mdsg.isValidToken('ghp_1234567890');
```

### Event Handling

The MDSG class automatically sets up event listeners for UI interactions:

#### Editor Events
- `input` on markdown editor → `updatePreview()` + `autoSave()`
- `click` on deploy button → `deployToGitHub()`
- `click` on clear button → Clear editor content

#### Authentication Events
- `click` on login button → `loginWithGitHub()`
- `click` on logout button → `logout()`
- `click` on save token → Token validation and user fetch

### Local Storage API

MDSG uses localStorage for client-side persistence:

#### Stored Data
```javascript
// Authentication
localStorage.getItem('github_token')        // GitHub access token
localStorage.getItem('github_token_type')   // Token type (usually 'bearer')
localStorage.getItem('github_token_scope')  // Token scope
localStorage.getItem('oauth_state')         // OAuth CSRF state

// Content
localStorage.getItem('mdsg_content')        // Current markdown content
localStorage.getItem('mdsg_auto_save')      // Auto-save timestamp
```

#### Storage Helper
```javascript
class Storage {
  static set(key, value) {
    try {
      localStorage.setItem(key, JSON.stringify(value));
    } catch (error) {
      console.warn('Storage failed:', error);
    }
  }
  
  static get(key, defaultValue = null) {
    try {
      const item = localStorage.getItem(key);
      return item ? JSON.parse(item) : defaultValue;
    } catch (error) {
      return defaultValue;
    }
  }
}
```

## Error Handling

### Error Response Format

All API endpoints return consistent error formats:

```json
{
  "error": "error_code",
  "message": "Human-readable error description"
}
```

### Common Error Codes

#### Authentication Errors
- `auth_failed` - OAuth authentication failed
- `invalid_token` - Invalid or expired token
- `token_expired` - Token has expired
- `insufficient_scope` - Token lacks required permissions

#### API Errors
- `rate_limit_exceeded` - Too many requests
- `invalid_request` - Malformed request
- `not_found` - Resource not found
- `permission_denied` - Insufficient permissions

#### GitHub API Errors
- `repository_exists` - Repository name already taken
- `pages_already_enabled` - GitHub Pages already configured
- `quota_exceeded` - GitHub API quota exceeded

### Error Handling Examples

#### Frontend Error Handling
```javascript
try {
  await mdsg.deployToGitHub();
} catch (error) {
  if (error.status === 401) {
    // Handle authentication error
    mdsg.showError('Please log in again', 'warning');
    mdsg.logout();
  } else if (error.status === 409) {
    // Handle repository conflict
    mdsg.showError('Repository name already exists', 'error');
  } else {
    // Generic error handling
    mdsg.showError('Deployment failed. Please try again.', 'error');
  }
}
```

#### Backend Error Handling
```javascript
// Rate limiting error
{
  "error": "Too many requests",
  "message": "Rate limit exceeded. Please try again later."
}

// Validation error
{
  "error": "Invalid authorization code",
  "message": "The authorization code is invalid or missing."
}
```

## Rate Limiting

### Default Limits
- **OAuth endpoints**: 10 requests per 15 minutes per IP
- **GitHub proxy**: 30 requests per 15 minutes per token
- **Health check**: No limit

### Rate Limit Headers
Rate limit information is not currently exposed in response headers but is tracked server-side.

### Handling Rate Limits
```javascript
// Client should implement exponential backoff
async function apiCall(endpoint, data, retries = 3) {
  try {
    return await fetch(endpoint, { body: JSON.stringify(data) });
  } catch (error) {
    if (error.status === 429 && retries > 0) {
      const delay = Math.pow(2, 3 - retries) * 1000; // 1s, 2s, 4s
      await new Promise(resolve => setTimeout(resolve, delay));
      return apiCall(endpoint, data, retries - 1);
    }
    throw error;
  }
}
```

## Security

### Authentication Security
- OAuth 2.0 with PKCE-like state parameter
- Session tokens with expiration
- Secure token storage (server-side only)
- Automatic token cleanup

### API Security
- CORS with specific origin allowlist
- Input validation on all endpoints
- Rate limiting per client/token
- Security headers (HSTS, XSS protection)

### Data Protection
- No sensitive data in frontend
- Personal access tokens stored securely
- Automatic session expiration
- CSRF protection

### Best Practices

#### Token Handling
```javascript
// ✅ Good: Validate token format
if (!mdsg.isValidToken(token)) {
  throw new Error('Invalid token format');
}

// ❌ Bad: Expose token in frontend
console.log('Token:', token); // Never do this
```

#### Input Validation
```javascript
// ✅ Good: Validate all inputs
function validateRepositoryName(name) {
  return /^[a-zA-Z0-9._-]+$/.test(name) && name.length <= 100;
}

// ❌ Bad: Trust user input
const repo = await createRepository(userInput); // Dangerous
```

#### Error Messages
```javascript
// ✅ Good: Generic error messages
mdsg.showError('Operation failed. Please try again.');

// ❌ Bad: Expose internal details
mdsg.showError(`Database error: ${error.stack}`); // Information leak
```

## Health Check

### Endpoint
**URL**: `GET /health`
**Description**: Check server status and health

**Response**:
```json
{
  "status": "ok",
  "timestamp": "2023-12-07T10:30:00.000Z",
  "environment": "production"
}
```

**Usage**:
```bash
curl https://api.mdsg.daza.ar/health
```

## Usage Examples

### Complete Deployment Flow

```javascript
// 1. Initialize MDSG
const mdsg = new MDSG();

// 2. Check authentication
mdsg.checkAuth();

// 3. If not authenticated, login
if (!mdsg.authenticated) {
  mdsg.loginWithGitHub();
  // User completes OAuth flow
}

// 4. Create content
const markdown = `
# My Awesome Site

Welcome to my site built with MDSG!

## Features
- Fast deployment
- GitHub Pages hosting
- Markdown content
`;

// 5. Update editor and preview
document.getElementById('markdown-editor').value = markdown;
mdsg.updatePreview();

// 6. Deploy to GitHub
try {
  const result = await mdsg.deployToGitHub();
  console.log('Deployed to:', result.html_url);
} catch (error) {
  console.error('Deployment failed:', error);
}
```

### Custom Integration

```javascript
// Custom markdown parsing
class CustomMDSG extends MDSG {
  parseMarkdown(markdown) {
    // Add custom parsing logic
    let html = super.parseMarkdown(markdown);
    
    // Add syntax highlighting
    html = html.replace(
      /<code class="language-(\w+)">(.*?)<\/code>/gs,
      (match, lang, code) => {
        return `<code class="hljs language-${lang}">${highlightCode(code, lang)}</code>`;
      }
    );
    
    return html;
  }
}

const customMdsg = new CustomMDSG();
```

## API Versioning

Currently, MDSG uses implicit versioning. Future versions may implement explicit API versioning:

```
/api/v1/github/user
/api/v2/github/user
```

Version information will be included in response headers:
```
API-Version: 1.0
```

## Changelog

### v1.0.0 (Current)
- Initial API implementation
- GitHub OAuth integration
- Basic repository operations
- Markdown parsing and deployment

### Planned Features
- Explicit API versioning
- Webhook support for automated deployments
- Custom domain management API
- Bulk operations support
- Advanced markdown features API