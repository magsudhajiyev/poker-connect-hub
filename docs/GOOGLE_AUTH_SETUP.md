# Google Authentication Setup Guide

## Prerequisites
1. Google Cloud Console account
2. Basic understanding of OAuth 2.0 flow
3. Poker Connect Hub application running locally

## Phase 1: Google Cloud Console Setup

### Step 1: Create New Project
1. Go to [Google Cloud Console](https://console.cloud.google.com/)
2. Click "Select a project" → "New Project"
3. Project name: `poker-connect-hub`
4. Click "Create"

### Step 2: Enable Required APIs
1. Navigate to "APIs & Services" → "Library"
2. Search and enable:
   - **Google+ API** (for user profile info)
   - **Google Identity Toolkit API** (for authentication)

### Step 3: Configure OAuth Consent Screen
1. Go to "APIs & Services" → "OAuth consent screen"
2. Choose "External" user type → "Create"
3. Fill in required fields:
   - App name: `Poker Connect Hub`
   - User support email: `your-email@example.com`
   - Developer contact: `your-email@example.com`
4. Add scopes:
   - `../auth/userinfo.email`
   - `../auth/userinfo.profile`
5. Save and continue

### Step 4: Create OAuth 2.0 Credentials
1. Go to "APIs & Services" → "Credentials"
2. Click "Create Credentials" → "OAuth 2.0 Client IDs"
3. Application type: "Web application"
4. Name: `Poker Connect Hub Web Client`
5. Authorized JavaScript origins:
   ```
   http://localhost:5173
   https://your-production-domain.com
   ```
6. Authorized redirect URIs:
   ```
   http://localhost:3000/auth/google/callback
   https://api.your-production-domain.com/auth/google/callback
   ```
7. Click "Create"
8. **Save the Client ID and Client Secret** - you'll need these!

## Phase 2: Environment Configuration

### Backend Environment Variables
Create/update `backend/.env`:
```bash
# Google OAuth
GOOGLE_CLIENT_ID=your-google-client-id-here
GOOGLE_CLIENT_SECRET=your-google-client-secret-here

# JWT Configuration
JWT_SECRET=your-super-secret-jwt-key-at-least-32-chars
JWT_EXPIRES_IN=15m
JWT_REFRESH_EXPIRES_IN=7d

# Session Security
SESSION_SECRET=your-session-secret-at-least-32-chars

# Database
DATABASE_URL=postgresql://postgres:password@localhost:5432/poker_connect_hub

# CORS
FRONTEND_URL=http://localhost:5173
BACKEND_URL=http://localhost:3000

# Security
NODE_ENV=development
BCRYPT_SALT_ROUNDS=12
```

### Frontend Environment Variables
Create/update `frontend/.env`:
```bash
VITE_GOOGLE_CLIENT_ID=your-google-client-id-here
VITE_API_URL=http://localhost:3000
VITE_APP_URL=http://localhost:5173
```

## Phase 3: Database Setup

### PostgreSQL Installation (if needed)
```bash
# macOS
brew install postgresql
brew services start postgresql

# Ubuntu/Debian
sudo apt-get install postgresql postgresql-contrib

# Windows
# Download from https://www.postgresql.org/download/windows/
```

### Create Database
```sql
-- Connect to PostgreSQL
psql postgres

-- Create database
CREATE DATABASE poker_connect_hub;

-- Create user (optional)
CREATE USER poker_user WITH PASSWORD 'your_password';
GRANT ALL PRIVILEGES ON DATABASE poker_connect_hub TO poker_user;

-- Exit
\q
```

## Phase 4: Security Configuration

### Generate Secure Secrets
```bash
# Generate JWT secret
node -e "console.log(require('crypto').randomBytes(64).toString('hex'))"

# Generate session secret
node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"
```

### CORS Configuration Notes
- **Development**: Allow `localhost:5173` (Vite dev server)
- **Production**: Restrict to your actual domain
- **Credentials**: Must be `true` for cookie-based auth

## Phase 5: Testing OAuth Flow

### Test URLs
1. **Start OAuth**: `http://localhost:3000/auth/google`
2. **Callback**: `http://localhost:3000/auth/google/callback`
3. **User Profile**: `http://localhost:3000/auth/me`
4. **Logout**: `http://localhost:3000/auth/logout`

### Expected Flow
1. User clicks "Sign in with Google"
2. Redirects to Google OAuth consent
3. User grants permissions
4. Google redirects to `/auth/google/callback`
5. Backend creates/updates user record
6. Backend sets secure HTTP-only cookies
7. Backend redirects to frontend dashboard
8. Frontend checks auth status on load

## Security Checklist

- [ ] OAuth credentials are in environment variables (not hardcoded)
- [ ] JWT secrets are cryptographically secure (64+ characters)
- [ ] HTTPS in production (SSL certificates)
- [ ] HTTP-only cookies for token storage
- [ ] CSRF protection enabled
- [ ] Rate limiting on auth endpoints
- [ ] Database connections are encrypted
- [ ] Authorized redirect URIs are whitelisted
- [ ] OAuth scopes are minimal (only email + profile)

## Troubleshooting

### Common Issues

1. **"redirect_uri_mismatch" error**
   - Check that your redirect URI exactly matches what's in Google Console
   - Include the protocol (http/https)
   - Verify port numbers

2. **CORS errors**
   - Ensure `withCredentials: true` in frontend requests
   - Backend CORS must allow credentials
   - Origin URLs must match exactly

3. **Cookies not set**
   - Check `sameSite` and `secure` cookie settings
   - Verify HTTPS in production
   - Ensure domain matches

4. **Database connection fails**
   - Verify PostgreSQL is running
   - Check DATABASE_URL format
   - Ensure database exists

### Debug Commands
```bash
# Check PostgreSQL status
brew services list | grep postgresql

# Test database connection
psql postgresql://postgres:password@localhost:5432/poker_connect_hub

# Check environment variables
echo $GOOGLE_CLIENT_ID

# Test backend endpoints
curl http://localhost:3000/auth/google
```

## Next Steps
After completing this setup:
1. Install backend dependencies
2. Create User entity and auth module
3. Implement Google OAuth strategy
4. Add frontend OAuth integration
5. Test complete authentication flow

---

*Keep this document updated as the authentication system evolves.*