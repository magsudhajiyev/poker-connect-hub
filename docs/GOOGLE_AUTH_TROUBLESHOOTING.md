# Google OAuth Authentication Troubleshooting Guide

## Common Issues and Solutions

### 1. "Authentication Failed" Error After Selecting Google Account

#### Symptoms:
- You click "Continue with Google"
- Select your Google account
- Get redirected back with an authentication error
- URL shows: `http://localhost:5173/auth?error=authentication_failed`

#### Solutions:

##### A. Check MongoDB Connection
The most common cause is MongoDB not running or being inaccessible.

```bash
# Check if MongoDB is running
pgrep -x mongod

# If not running, start it:
# macOS with Homebrew:
brew services start mongodb-community

# Linux:
sudo systemctl start mongod

# Windows:
net start MongoDB
```

Test the connection:
```bash
cd backend
node test-mongodb.js
```

##### B. Verify Environment Variables

Frontend `.env`:
```env
VITE_GOOGLE_CLIENT_ID=your-actual-google-client-id
VITE_API_URL=http://localhost:3000
VITE_APP_URL=http://localhost:5173
```

Backend `backend/.env`:
```env
# Must match the frontend's GOOGLE_CLIENT_ID
GOOGLE_CLIENT_ID=same-google-client-id-as-frontend
GOOGLE_CLIENT_SECRET=your-google-client-secret
FRONTEND_URL=http://localhost:5173
DATABASE_URL=mongodb://localhost:27017/poker_connect_hub
```

##### C. Google Console Configuration

1. Go to [Google Cloud Console](https://console.cloud.google.com/)
2. Select your project
3. Go to "APIs & Services" → "Credentials"
4. Click on your OAuth 2.0 Client ID
5. Verify these settings:

**Authorized JavaScript origins:**
- `http://localhost:5173`
- `http://localhost:3000`

**Authorized redirect URIs:**
- `http://localhost:3000/auth/google/callback` (MUST be exact)

### 2. Database Connection Errors

#### Error Message:
`Database connection error. Please ensure MongoDB is running and try again.`

#### Solution:
1. Ensure MongoDB is installed and running
2. Check the DATABASE_URL in `backend/.env`
3. Default URL should be: `mongodb://localhost:27017/poker_connect_hub`
4. If using MongoDB Atlas or remote DB, ensure the connection string is correct

### 3. CORS Errors

#### Symptoms:
- Browser console shows CORS errors
- Requests blocked by CORS policy

#### Solution:
The backend is already configured for CORS, but ensure:
1. Frontend is running on `http://localhost:5173`
2. Backend is running on `http://localhost:3000`
3. No proxy settings interfering with requests

### 4. WebSocket Errors (Vite)

#### Error:
`RangeError: Invalid WebSocket frame: RSV1 must be clear`

#### Solution:
This is a Vite dev server issue, not related to authentication. It's safe to ignore, but you can fix it by:
1. Stopping all services (Ctrl+C)
2. Running: `npm run dev:all`

### 5. Cookies Not Being Set

#### Symptoms:
- Authentication seems successful but dashboard shows "not authenticated"
- `/auth/me` returns 401

#### Solution:
1. Check browser developer tools → Application → Cookies
2. Look for `access_token` and `refresh_token` cookies
3. If missing, check:
   - Backend CORS configuration allows credentials
   - Frontend axios has `withCredentials: true`
   - Not using Safari with strict privacy settings

## Debugging Steps

### 1. Check Backend Logs
When attempting to log in, watch the backend console for:
```
✅ MongoDB connected successfully
Google OAuth validation started for: [google-id]
Processing Google profile: [email]
Google OAuth validation successful for: [email]
Google auth callback: Authentication successful, redirecting to dashboard
```

If you see errors instead, they will indicate the specific problem.

### 2. Check Network Tab
1. Open browser Developer Tools → Network tab
2. Attempt login
3. Look for:
   - `/auth/google` - Should redirect to Google
   - Google OAuth flow
   - `/auth/google/callback` - Should return 302 redirect
   - Check if cookies are set in the response

### 3. Manual Database Check
```bash
# Connect to MongoDB
mongosh

# Use the database
use poker_connect_hub

# Check if users collection exists
show collections

# Check for your user
db.users.findOne({email: "your-email@gmail.com"})
```

## Still Having Issues?

1. **Clear all data and try again:**
   ```bash
   # Stop all services
   # Clear browser cookies and cache
   # Restart services
   npm run dev:all
   ```

2. **Check all error messages:**
   - Backend console
   - Frontend console (browser dev tools)
   - Network tab responses

3. **Verify all prerequisites:**
   - Node.js installed
   - MongoDB installed and running
   - All npm packages installed (`npm install` in both root and backend)
   - Environment variables properly set

## Need More Help?

If you're still experiencing issues:
1. Check the exact error message in the backend console
2. Note any error details shown in the browser
3. Verify your Google OAuth credentials are correct
4. Ensure MongoDB is accessible at the configured URL