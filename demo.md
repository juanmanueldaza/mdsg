# MDSG Demo Script

This document walks you through testing the MDSG application locally.

## Prerequisites Check

Before starting, ensure you have:

- Node.js (v16 or later)
- A GitHub account
- Git installed

## Step 1: Install Dependencies

```bash
npm install
```

Expected output: Dependencies should install without errors.

## Step 2: Create GitHub OAuth App

1. Visit https://github.com/settings/applications/new
2. Fill in:
   - Application name: `MDSG Demo`
   - Homepage URL: `http://localhost:3001`
   - Authorization callback URL: `http://localhost:3001`
3. Click "Register application"
4. Copy the Client ID and Client Secret

## Step 3: Configure Environment

```bash
cp .env.example .env
```

Edit `.env` and add your credentials:

```
GITHUB_CLIENT_ID=your_actual_client_id
GITHUB_CLIENT_SECRET=your_actual_client_secret
PORT=3001
```

## Step 4: Start the Servers

### Terminal 1 - Backend Server

```bash
npm run server
```

Expected output: "OAuth server running on http://localhost:3001"

### Terminal 2 - Frontend Server

```bash
npm run dev
```

Expected output: "Local: http://localhost:3000"

## Step 5: Test the Application

1. Visit http://localhost:3000
2. You should see the MDSG interface with "Login with GitHub" button
3. Click "Login with GitHub"
4. Authorize the application on GitHub
5. You should be redirected back and see the markdown editor

## Step 6: Test Site Creation

1. Write some markdown content in the editor:

```markdown
# My Test Site

This is a **test site** created with MDSG.

## Features

- Simple markdown editing
- Live preview
- One-click deployment

Check out my [GitHub](https://github.com/yourusername) profile!
```

2. Watch the live preview update as you type
3. Click "Deploy to GitHub Pages"
4. Wait for the deployment to complete
5. Visit the generated site URL

## Expected Results

After successful deployment:

- New repository created: `https://github.com/yourusername/mdsg-site`
- Live site available: `https://yourusername.github.io/mdsg-site`
- Site contains your markdown content converted to HTML
- Site includes basic styling and MDSG footer

## Troubleshooting

### Common Issues

**1. "Failed to authenticate"**

- Check GitHub OAuth app callback URL is exactly `http://localhost:3001`
- Verify .env file has correct credentials
- Ensure both servers are running

**2. "Repository name already exists"**

- Delete existing `mdsg-site` repository on GitHub
- Or wait for error handling to suggest alternatives

**3. "Rate limit exceeded"**

- GitHub API limits requests
- Wait 1 hour and try again
- Check GitHub API usage in your account settings

**4. "Permission denied"**

- Ensure you granted "repo" permissions during OAuth
- Try logging out and logging in again

### Debug Steps

1. Check browser console for errors
2. Check server terminal for error messages
3. Verify GitHub OAuth app configuration
4. Test GitHub API access manually

## Success Criteria

✅ Frontend loads without errors
✅ Backend server starts successfully
✅ GitHub OAuth flow works
✅ User can authenticate
✅ Markdown editor is functional
✅ Live preview updates correctly
✅ Site deployment succeeds
✅ Generated site is accessible
✅ Site contains expected content

## Performance Test

Create multiple sites to test:

1. Different repository names
2. Various markdown content
3. Error recovery scenarios

## Security Test

1. Verify tokens are not exposed in frontend
2. Check OAuth flow follows best practices
3. Ensure repository permissions are minimal
4. Test logout functionality

## Demo Complete

If all tests pass, the MDSG application is working correctly and ready for production deployment.

## Next Steps for Production

1. Deploy backend to cloud service (Heroku, Railway, etc.)
2. Update GitHub OAuth app with production URLs
3. Set up proper error monitoring
4. Implement user analytics
5. Add more markdown features
