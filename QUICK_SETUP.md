# 🚀 Quick Setup Guide - Google Authentication

Ready to test your Google authentication? Follow these steps:

## 1. Set Up Google Cloud Console (5 minutes)

### Create Project & Enable APIs
1. Go to [Google Cloud Console](https://console.cloud.google.com/)
2. Create new project: `poker-connect-hub`
3. Enable APIs: `Google+ API` and `Identity Toolkit API`

### Configure OAuth Consent Screen
1. Go to "OAuth consent screen"
2. Choose "External", App name: `Poker Connect Hub`
3. Add your email as developer contact

### Create OAuth Credentials
1. Go to "Credentials" > "Create Credentials" > "OAuth client ID"
2. Application type: "Web application"
3. **Authorized JavaScript origins:**
   ```
   http://localhost:5173
   http://localhost:3000
   ```
4. **Authorized redirect URIs:**
   ```
   http://localhost:3000/auth/google/callback
   ```

## 2. Configure Environment Variables

### Backend (.env)
Copy `backend/.env.example` to `backend/.env` and update:
```bash
cp backend/.env.example backend/.env
```

Update with your Google credentials:
```bash
GOOGLE_CLIENT_ID=your-client-id-from-google-cloud
GOOGLE_CLIENT_SECRET=your-client-secret-from-google-cloud

# Generate secure secrets:
JWT_SECRET=$(node -e "console.log(require('crypto').randomBytes(32).toString('hex'))")
SESSION_SECRET=$(node -e "console.log(require('crypto').randomBytes(16).toString('hex'))")
```

### Frontend (.env)
Copy `.env.example` to `.env` and update:
```bash
cp .env.example .env
```

Update with your Google Client ID:
```bash
VITE_GOOGLE_CLIENT_ID=your-client-id-from-google-cloud
```

## 3. Set Up Database

### Install MongoDB
```bash
# macOS
brew install mongodb/brew/mongodb-community
brew services start mongodb/brew/mongodb-community

# Ubuntu/Debian
sudo apt update
sudo apt install -y mongodb
sudo systemctl start mongod
sudo systemctl enable mongod

# Windows
# Download and install from: https://www.mongodb.com/try/download/community
```

### Verify MongoDB is Running
```bash
# Check if MongoDB is running
mongosh --eval "db.runCommand({ connectionStatus: 1 })"
```

## 4. Start the Application

### Install Dependencies & Start Backend
```bash
cd backend
npm install
npm run start:dev
```

### Start Frontend (in new terminal)
```bash
npm run dev
```

## 5. Test Authentication

1. Open: http://localhost:5173/auth
2. Click "Continue with Google"
3. Complete OAuth flow
4. You should see the dashboard with your profile

## ✅ Quick Verification Checklist

- [ ] Google Cloud project created
- [ ] OAuth credentials configured with correct URLs
- [ ] Backend `.env` file with Google credentials
- [ ] Frontend `.env` file with Google Client ID
- [ ] PostgreSQL database running
- [ ] Backend running on http://localhost:3000
- [ ] Frontend running on http://localhost:5173
- [ ] Can sign in with Google successfully

## 🔧 Common Issues

**"redirect_uri_mismatch"**: Check redirect URIs in Google Cloud Console  
**"This app isn't verified"**: Click "Advanced" > "Go to Poker Connect Hub (unsafe)"  
**Database errors**: Ensure MongoDB is running and accessible  
**Environment variables not loading**: Restart both servers after adding .env files

## 📚 Detailed Documentation

For complete setup instructions, see: [Google Cloud Setup Guide](./docs/GOOGLE_CLOUD_SETUP_GUIDE.md)