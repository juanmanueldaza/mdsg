# MDSG Quick Start Guide

Get MDSG running locally in 5 minutes!

## Prerequisites

- Node.js v16+ installed
- GitHub account
- Terminal/command line access

## Step 1: Install and Run

```bash
# Install dependencies
npm install

# Start the backend OAuth server (Terminal 1)
npm run server

# Start the frontend (Terminal 2) 
npm run dev
```

## Step 2: Create GitHub OAuth App

1. **Go to**: https://github.com/settings/applications/new

2. **Fill in the form**:
   - **Application name**: `MDSG Local Dev`
   - **Homepage URL**: `http://localhost:3000`
   - **Authorization callback URL**: `http://localhost:3000`

3. **Click "Register application"**

4. **Copy your Client ID** (looks like: `Ov23liKZ8KgfLQDZFGSR`)

5. **Generate Client Secret** (click "Generate a new client secret")

## Step 3: Configure OAuth

### Frontend Setup
1. Visit `http://localhost:3000`
2. You'll see "OAuth Setup Required"
3. Paste your **Client ID** and click Save

### Backend Setup
1. Copy `.env.example` to `.env`
2. Edit `.env` file:
```bash
GITHUB_CLIENT_ID=your_client_id_here
GITHUB_CLIENT_SECRET=your_client_secret_here
PORT=3001
```

3. Restart the backend server:
```bash
# Stop with Ctrl+C, then restart
npm run server
```

## Step 4: Test the App

1. Visit `http://localhost:3000`
2. Click "Continue with GitHub"
3. Authorize the app on GitHub
4. Start writing markdown!
5. Click "Deploy to GitHub Pages"
6. Your site will be live at `https://yourusername.github.io/mdsg-site`

## Troubleshooting

**❌ "404 Not Found" during OAuth**
- Check your OAuth app callback URL is exactly `http://localhost:3000`
- Make sure you're using the correct Client ID

**❌ "Authentication failed"**
- Verify your Client Secret is correct in `.env`
- Restart the backend server after changing `.env`

**❌ "Permission denied"**
- Make sure you granted "repo" permission during OAuth
- Try logging out and logging in again

**❌ "Repository already exists"**
- Delete your old `mdsg-site` repository on GitHub
- Or the app will automatically try `mdsg-site-1`, `mdsg-site-2`, etc.

## Success! 🎉

You should now be able to:
- ✅ Login with GitHub
- ✅ Write markdown with live preview  
- ✅ Deploy to GitHub Pages
- ✅ See your site live on the internet

## Next Steps

- Customize your site content
- Try different markdown features
- Deploy multiple sites
- Share your site URL with friends!

Need help? Check the full `SETUP_GUIDE.md` for detailed instructions.