# Deployment Guide for Poker Connect Hub

This guide covers deploying both the frontend (Next.js) and backend (NestJS) applications.

## ⚠️ IMPORTANT: Backend Deployment Required

**The application will NOT work properly without a deployed backend.** Currently experiencing issues because:

- `NEXT_PUBLIC_API_URL` is incorrectly set to the frontend URL
- No backend service is running to handle authentication
- Google OAuth will fail without backend endpoints

## Overview

- **Frontend**: Deployed on Vercel (already done at www.pokerconnect.me)
- **Backend**: MUST be deployed to a Node.js hosting service
- **Database**: MongoDB Atlas or similar cloud MongoDB service

## Frontend Deployment (Vercel) ✅

Already deployed, but here's the configuration needed:

### Environment Variables in Vercel Dashboard

```bash
# Google OAuth
GOOGLE_CLIENT_ID=your-google-client-id
GOOGLE_CLIENT_SECRET=your-google-client-secret

# NextAuth
NEXTAUTH_URL=https://www.pokerconnect.me
NEXTAUTH_SECRET=generate-with-openssl-rand-base64-32
AUTH_SECRET=same-as-nextauth-secret

# API Configuration (⚠️  CRITICAL - UPDATE after backend deployment)
# This MUST point to your deployed backend URL, NOT the frontend URL!
NEXT_PUBLIC_API_URL=https://your-backend-url.com  # e.g., https://poker-backend.railway.app
NEXT_PUBLIC_APP_URL=https://www.pokerconnect.me

# MongoDB (for NextAuth sessions if using database adapter)
MONGODB_URI=mongodb+srv://username:password@cluster.mongodb.net/poker-connect-hub

# Optional
OPENAI_API_KEY=your-openai-api-key
```

## Backend Deployment (Required) 🚨

The backend is currently not deployed, which is why Google OAuth isn't working.

### Option 1: Deploy to Railway (Recommended)

1. Create account at [railway.app](https://railway.app)
2. Install Railway CLI: `npm install -g @railway/cli`
3. In the `/backend` directory:
   ```bash
   cd backend
   railway login
   railway init
   railway up
   ```
4. Add environment variables in Railway dashboard:

   ```bash
   NODE_ENV=production
   PORT=3001
   FRONTEND_URL=https://www.pokerconnect.me

   # Google OAuth
   GOOGLE_CLIENT_ID=same-as-frontend
   GOOGLE_CLIENT_SECRET=same-as-frontend

   # JWT
   JWT_SECRET=generate-random-string
   JWT_EXPIRES_IN=59m
   JWT_REFRESH_EXPIRES_IN=7d

   # Session
   SESSION_SECRET=generate-random-string

   # Database
   MONGODB_URI=your-production-mongodb-uri

   # Security
   BCRYPT_SALT_ROUNDS=12
   ```

### Option 2: Deploy to Render

1. Create account at [render.com](https://render.com)
2. New > Web Service
3. Connect your GitHub repo
4. Configure:
   - Name: poker-connect-hub-backend
   - Root Directory: backend
   - Build Command: `npm install && npm run build`
   - Start Command: `npm run start:prod`
5. Add same environment variables as above

### Option 3: Deploy to Heroku

1. Install Heroku CLI
2. In the `/backend` directory:
   ```bash
   cd backend
   heroku create your-app-name
   heroku config:set NODE_ENV=production
   # Set all other env vars
   git push heroku main
   ```

## MongoDB Atlas Setup

1. Go to [MongoDB Atlas](https://www.mongodb.com/cloud/atlas)
2. Create a free cluster
3. Configure:
   - Add your backend service IP to whitelist (or 0.0.0.0/0 for any IP)
   - Create database user
   - Get connection string
4. Update `MONGODB_URI` in both frontend and backend

## Post-Deployment Steps

### 1. Update Frontend Environment

Once backend is deployed:

1. Go to Vercel dashboard
2. Update `NEXT_PUBLIC_API_URL` with your backend URL
3. Redeploy the frontend

### 2. Test the Integration

```bash
# Test backend health
curl https://your-backend-url.com/

# Test auth endpoints
curl https://your-backend-url.com/auth/me
```

### 3. Update CORS Settings

Ensure backend allows requests from:

- https://www.pokerconnect.me
- https://pokerconnect.me

### 4. Monitor Logs

- Vercel: Check function logs in dashboard
- Backend: Check your hosting provider's logs
- Use error tracking service (Sentry, LogRocket)

## Troubleshooting

### "Access Denied" on Google OAuth

1. Check Google Cloud Console redirect URIs
2. Verify backend is running and accessible
3. Check CORS configuration
4. Ensure all environment variables are set

### 404 on Backend Routes

1. Backend not deployed or not running
2. Wrong `NEXT_PUBLIC_API_URL` in frontend
3. Proxy rewrite rules not working

### Cookie/Session Issues

1. Ensure `sameSite` and `secure` settings are correct for production
2. Check domain settings in cookies
3. Verify HTTPS is working properly

## CI/CD Setup (Optional)

### GitHub Actions for Backend

Create `.github/workflows/deploy-backend.yml`:

```yaml
name: Deploy Backend

on:
  push:
    branches: [main]
    paths:
      - 'backend/**'

jobs:
  deploy:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      - name: Deploy to Railway
        run: |
          cd backend
          npm install -g @railway/cli
          railway up
        env:
          RAILWAY_TOKEN: ${{ secrets.RAILWAY_TOKEN }}
```

## Security Checklist

- [ ] All secrets in environment variables (not in code)
- [ ] HTTPS enabled on all domains
- [ ] CORS properly configured
- [ ] Rate limiting enabled
- [ ] Input validation on all endpoints
- [ ] MongoDB connection uses SSL
- [ ] Regular security updates

## Monitoring

1. Set up uptime monitoring (UptimeRobot, Pingdom)
2. Configure error tracking (Sentry)
3. Set up performance monitoring (New Relic, DataDog)
4. Enable logging aggregation (LogDNA, Papertrail)
