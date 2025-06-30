# Backend Deployment Guide

## Overview
This guide explains how to deploy the Poker Connect Hub NestJS backend to various cloud platforms.

## Prerequisites
- MongoDB database (MongoDB Atlas recommended for production)
- Node.js 18+ runtime support
- Environment variables configured

## Environment Variables Required for Production

```env
# Server Configuration
NODE_ENV=production
PORT=3001  # Or use platform's PORT variable

# Frontend URL for CORS
FRONTEND_URL=https://www.pokerconnect.me
ALLOWED_ORIGINS=https://www.pokerconnect.me,https://pokerconnect.me

# MongoDB Configuration
MONGODB_URI=mongodb+srv://username:password@cluster.mongodb.net/poker-connect-hub

# Google OAuth Configuration
GOOGLE_CLIENT_ID=your-google-client-id
GOOGLE_CLIENT_SECRET=your-google-client-secret

# JWT Configuration
JWT_SECRET=your-secure-jwt-secret
JWT_EXPIRES_IN=59m
JWT_REFRESH_EXPIRES_IN=7d

# Session Security
SESSION_SECRET=your-secure-session-secret

# Security
BCRYPT_SALT_ROUNDS=12

# OpenAI Configuration (optional)
OPENAI_API_KEY=your-openai-api-key
```

## Deployment Options

### Option 1: Deploy to Render.com (Recommended)

1. Create a new account at [render.com](https://render.com)
2. Create a new Web Service
3. Connect your GitHub repository
4. Configure the service:
   - **Environment**: Node
   - **Build Command**: `npm install && npm run build`
   - **Start Command**: `npm run start:prod`
   - **Root Directory**: `backend`
5. Add environment variables from the list above
6. Deploy!

### Option 2: Deploy to Railway.app

1. Create account at [railway.app](https://railway.app)
2. Create new project from GitHub
3. Select the repository and configure:
   - **Root Directory**: `/backend`
   - **Build Command**: `npm install && npm run build`
   - **Start Command**: `npm run start:prod`
4. Add environment variables
5. Generate domain and deploy

### Option 3: Deploy to Heroku

1. Install Heroku CLI
2. Create `Procfile` in backend directory:
   ```
   web: npm run start:prod
   ```
3. Deploy:
   ```bash
   cd backend
   heroku create your-app-name
   heroku config:set NODE_ENV=production
   # Set other environment variables
   git push heroku main
   ```

### Option 4: Deploy to AWS Elastic Beanstalk

1. Install AWS CLI and EB CLI
2. Initialize Elastic Beanstalk:
   ```bash
   cd backend
   eb init -p node.js-18 poker-connect-backend
   eb create poker-connect-env
   ```
3. Configure environment variables in AWS Console
4. Deploy: `eb deploy`

## Post-Deployment Steps

1. **Update Frontend Environment Variables on Vercel**:
   - Go to your Vercel project settings
   - Add/Update: `NEXT_PUBLIC_API_URL=https://your-backend-url.com`

2. **Configure MongoDB Atlas** (if not done):
   - Create free cluster at [mongodb.com](https://www.mongodb.com/atlas)
   - Whitelist your backend's IP address
   - Create database user and get connection string

3. **Update Google OAuth Redirect URIs**:
   - Go to [Google Cloud Console](https://console.cloud.google.com)
   - Add your backend URL to authorized redirect URIs:
     - `https://your-backend-url.com/auth/google/callback`

4. **Test the Deployment**:
   - Health check: `https://your-backend-url.com/health`
   - Auth endpoints: `https://your-backend-url.com/auth/status`

## Monitoring and Logs

- Most platforms provide built-in logging
- Consider adding monitoring with services like:
  - Sentry for error tracking
  - New Relic for performance monitoring
  - LogDNA for log aggregation

## Troubleshooting

### CORS Issues
- Ensure `FRONTEND_URL` and `ALLOWED_ORIGINS` include your production domain
- Check that credentials are enabled in CORS configuration

### MongoDB Connection Issues
- Verify connection string format
- Check IP whitelist in MongoDB Atlas
- Ensure database user has correct permissions

### Authentication Issues
- Verify all auth-related environment variables are set
- Check Google OAuth redirect URIs match your backend URL
- Ensure JWT_SECRET is the same across deployments