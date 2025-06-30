# Quick Backend Deployment Guide

## Current Issue

Your Google OAuth is failing because there's no backend deployed. The frontend is trying to reach backend endpoints that don't exist.

## Fastest Solution: Deploy to Railway

### 1. Prepare Backend for Deployment

First, ensure your backend has a start script in `package.json`:

```bash
cd backend
npm run build
```

### 2. Deploy to Railway

1. Go to [railway.app](https://railway.app) and sign up
2. Create a new project
3. Choose "Deploy from GitHub repo"
4. Select your repository and choose the `/backend` directory as root
5. Railway will auto-detect it's a Node.js app

### 3. Set Environment Variables in Railway

Add these in the Railway dashboard:

```env
NODE_ENV=production
PORT=3001
FRONTEND_URL=https://www.pokerconnect.me
ALLOWED_ORIGINS=https://www.pokerconnect.me,https://pokerconnect.me

# Use same Google OAuth as frontend
GOOGLE_CLIENT_ID=331809105538-0kjt6kt37ibvdgeshfto3e4tg17t56l8.apps.googleusercontent.com
GOOGLE_CLIENT_SECRET=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

# Generate these
JWT_SECRET=<generate-with-openssl-rand-hex-32>
JWT_EXPIRES_IN=59m
JWT_REFRESH_EXPIRES_IN=7d
SESSION_SECRET=<generate-with-openssl-rand-hex-32>

# MongoDB Atlas (create free cluster at mongodb.com/cloud/atlas)
MONGODB_URI=mongodb+srv://username:password@cluster.mongodb.net/poker-connect-hub

# Security
BCRYPT_SALT_ROUNDS=12
```

### 4. Get Your Backend URL

After deployment, Railway will give you a URL like:

- `https://your-app-name.up.railway.app`

### 5. Update Vercel Environment Variables

**THIS IS CRITICAL:**

1. Go to your Vercel project settings
2. Navigate to Environment Variables
3. Update or add: `NEXT_PUBLIC_API_URL=https://your-app-name.up.railway.app`
4. Redeploy your frontend

### 6. Verify It Works

1. Check backend is running: `https://your-backend-url.up.railway.app/`
2. Clear browser cookies and cache
3. Try Google OAuth again

## Alternative: Deploy to Render

1. Go to [render.com](https://render.com)
2. New > Web Service
3. Connect GitHub repo, select `/backend` directory
4. Build Command: `npm install && npm run build`
5. Start Command: `npm run start:prod`
6. Add same environment variables
7. Get URL and update Vercel

## Common Issues

### "Cannot find module" errors

Make sure to run `npm run build` before `npm run start:prod`

### CORS errors

Ensure `FRONTEND_URL` and `ALLOWED_ORIGINS` include your production domain

### MongoDB connection fails

- Whitelist all IPs (0.0.0.0/0) in MongoDB Atlas
- Ensure connection string includes `?retryWrites=true&w=majority`

## Need Help?

The main issue is that `NEXT_PUBLIC_API_URL` in Vercel is currently set to your frontend URL. It MUST be set to your backend URL for the app to work.
