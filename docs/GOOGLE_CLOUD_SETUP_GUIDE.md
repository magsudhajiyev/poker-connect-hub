# Google Cloud Console Setup Guide

This guide will walk you through setting up Google OAuth credentials for your Poker Connect Hub authentication system.

## Prerequisites

- A Google account
- The Poker Connect Hub project with authentication implementation completed

## Step 1: Create a Google Cloud Project

1. **Go to Google Cloud Console**
   - Navigate to: https://console.cloud.google.com/
   - Sign in with your Google account

2. **Create a New Project**
   - Click on the project dropdown at the top of the page
   - Click "New Project"
   - Enter project name: `poker-connect-hub`
   - Click "Create"
   - Wait for the project to be created and select it

## Step 2: Enable Required APIs

1. **Enable Google+ API**
   - In the left sidebar, go to "APIs & Services" > "Library"
   - Search for "Google+ API"
   - Click on it and press "Enable"

2. **Enable Identity Toolkit API**
   - Search for "Identity Toolkit API"
   - Click on it and press "Enable"

## Step 3: Configure OAuth Consent Screen

1. **Go to OAuth Consent Screen**
   - In the left sidebar, go to "APIs & Services" > "OAuth consent screen"

2. **Choose User Type**
   - Select "External" (for testing with any Google account)
   - Click "Create"

3. **Fill App Information**
   - App name: `Poker Connect Hub`
   - User support email: Your email address
   - App logo: (Optional - you can upload a logo later)
   - App domain: Leave blank for now
   - Authorized domains: Add `localhost` for development
   - Developer contact information: Your email address
   - Click "Save and Continue"

4. **Scopes**
   - Click "Add or Remove Scopes"
   - Add these scopes:
     - `../auth/userinfo.email`
     - `../auth/userinfo.profile`
   - Click "Update" then "Save and Continue"

5. **Test Users (if needed)**
   - For external apps in testing mode, add your email as a test user
   - Click "Add Users" and enter your email
   - Click "Save and Continue"

6. **Summary**
   - Review your settings
   - Click "Back to Dashboard"

## Step 4: Create OAuth 2.0 Credentials

1. **Go to Credentials**
   - In the left sidebar, go to "APIs & Services" > "Credentials"

2. **Create OAuth Client ID**
   - Click "Create Credentials" > "OAuth client ID"
   - Application type: "Web application"
   - Name: `Poker Connect Hub Web Client`

3. **Configure Authorized Origins and Redirect URIs**
   
   **Authorized JavaScript origins:**
   ```
   http://localhost:5173
   http://localhost:3000
   ```

   **Authorized redirect URIs:**
   ```
   http://localhost:3000/auth/google/callback
   ```

4. **Create and Download**
   - Click "Create"
   - A modal will appear with your Client ID and Client Secret
   - **IMPORTANT**: Copy these values immediately - you'll need them for your environment variables

## Step 5: Configure Environment Variables

### Backend Environment (.env)

Create or update `/backend/.env`:

```bash
# Google OAuth Configuration
GOOGLE_CLIENT_ID=your-google-client-id-here
GOOGLE_CLIENT_SECRET=your-google-client-secret-here

# JWT Configuration
JWT_SECRET=your-super-secure-64-character-secret-key-for-jwt-tokens-here
JWT_EXPIRES_IN=15m
JWT_REFRESH_EXPIRES_IN=7d

# Session Configuration
SESSION_SECRET=your-32-character-session-secret-here

# Database Configuration
DATABASE_URL=mongodb://localhost:27017/poker_connect_hub

# Application URLs
FRONTEND_URL=http://localhost:5173
PORT=3000

# Environment
NODE_ENV=development
```

### Frontend Environment (.env)

Create or update `/.env`:

```bash
# Google OAuth Configuration
VITE_GOOGLE_CLIENT_ID=your-google-client-id-here

# API Configuration
VITE_API_URL=http://localhost:3000

# Environment
VITE_NODE_ENV=development
```

## Step 6: Generate Secure Secrets

### JWT Secret (64 characters)
```bash
# In terminal, run:
node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"
```

### Session Secret (32 characters)
```bash
# In terminal, run:
node -e "console.log(require('crypto').randomBytes(16).toString('hex'))"
```

## Step 7: Set Up MongoDB Database

### Install MongoDB (if not already installed)

**macOS:**
```bash
brew install mongodb/brew/mongodb-community
brew services start mongodb/brew/mongodb-community
```

**Ubuntu/Debian:**
```bash
sudo apt update
sudo apt install -y mongodb
sudo systemctl start mongod
sudo systemctl enable mongod
```

**Windows:**
Download and install from: https://www.mongodb.com/try/download/community

### Verify MongoDB is Running

```bash
# Check if MongoDB is running
mongosh --eval "db.runCommand({ connectionStatus: 1 })"

# Or simply connect
mongosh
```

### Database Configuration

MongoDB will automatically create the database when the first document is inserted. No manual database creation is needed.

Your DATABASE_URL should be:
```bash
DATABASE_URL=mongodb://localhost:27017/poker_connect_hub
```

For MongoDB with authentication (optional):
```bash
DATABASE_URL=mongodb://username:password@localhost:27017/poker_connect_hub
```

## Step 8: Test the Setup

### Start the Backend
```bash
cd backend
npm install
npm run start:dev
```

### Start the Frontend
```bash
# In project root
npm run dev
```

### Test Authentication Flow

1. Navigate to: http://localhost:5173/auth
2. Click "Continue with Google"
3. You should be redirected to Google's OAuth consent screen
4. Grant permissions
5. You should be redirected back to your app and see the dashboard

## Troubleshooting

### Common Issues

1. **"redirect_uri_mismatch" error**
   - Double-check your redirect URI in Google Cloud Console
   - Ensure it matches exactly: `http://localhost:3000/auth/google/callback`

2. **"This app isn't verified" warning**
   - This is normal for development
   - Click "Advanced" > "Go to Poker Connect Hub (unsafe)"

3. **"Access blocked" error**
   - Make sure your app is in "Testing" mode in OAuth consent screen
   - Add your email as a test user

4. **Database connection errors**
   - Ensure MongoDB is running
   - Check your DATABASE_URL format
   - Verify MongoDB service is accessible

5. **Environment variables not loading**
   - Restart both backend and frontend after adding .env files
   - Check file names are exactly `.env` (not `.env.txt`)

### Debug Mode

Enable debug logging in backend:
```typescript
// In your main.ts or app.module.ts
app.useLogger(['error', 'warn', 'debug', 'verbose']);
```

## Security Notes for Production

When deploying to production:

1. **Update Authorized Origins:**
   - Add your production domain
   - Remove localhost entries

2. **Update Redirect URIs:**
   - Add your production callback URL
   - Remove localhost entries

3. **Environment Variables:**
   - Use different, secure secrets
   - Set NODE_ENV=production
   - Use HTTPS URLs

4. **OAuth Consent Screen:**
   - Complete app verification process
   - Add privacy policy and terms of service URLs

## Next Steps

After successful setup:

1. Test the complete authentication flow
2. Verify user data is stored in database
3. Test logout functionality
4. Implement protected routes
5. Add user ownership to poker hands

---

**Need Help?**

If you encounter issues:
1. Check the browser console for errors
2. Check backend logs for authentication errors
3. Verify all environment variables are set correctly
4. Ensure database is running and accessible