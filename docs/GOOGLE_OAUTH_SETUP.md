# Google OAuth Setup Guide

This guide will help you configure Google OAuth for both development and production environments.

## Prerequisites

- Google Cloud Console account
- Your application deployed to production (for production OAuth)

## Step 1: Access Google Cloud Console

1. Go to [Google Cloud Console](https://console.cloud.google.com/)
2. Create a new project or select an existing one
3. Make sure billing is enabled (OAuth is free, but required)

## Step 2: Enable Google+ API

1. Go to "APIs & Services" > "Enabled APIs"
2. Click "+ ENABLE APIS AND SERVICES"
3. Search for "Google+ API"
4. Click on it and press "ENABLE"

## Step 3: Create OAuth 2.0 Credentials

1. Go to "APIs & Services" > "Credentials"
2. Click "+ CREATE CREDENTIALS" > "OAuth client ID"
3. If prompted, configure the OAuth consent screen first:
   - Choose "External" user type
   - Fill in the required fields:
     - App name: Poker Connect Hub
     - User support email: your-email@example.com
     - Developer contact: your-email@example.com
   - Add scopes: email, profile, openid
   - Add test users if in development

## Step 4: Configure OAuth Client

1. Application type: "Web application"
2. Name: "Poker Connect Hub Production" (or "Development")
3. Authorized JavaScript origins:

   ```
   # For Development:
   http://localhost:3000

   # For Production:
   https://www.pokerconnect.me
   https://pokerconnect.me
   ```

4. Authorized redirect URIs:

   ```
   # For Development:
   http://localhost:3000/api/auth/callback/google

   # For Production:
   https://www.pokerconnect.me/api/auth/callback/google
   https://pokerconnect.me/api/auth/callback/google
   ```

5. Click "CREATE"
6. Save your Client ID and Client Secret

## Step 5: Common Issues and Solutions

### "Access Denied" Error

This usually means:

1. **Redirect URI mismatch**: Double-check that your redirect URIs match exactly (including trailing slashes)
2. **Domain not verified**: For production, you may need to verify domain ownership
3. **OAuth consent screen not configured**: Make sure the consent screen is properly set up
4. **Application in testing mode**: If your app is in testing mode, only test users can sign in

### Backend Not Connected

The current error indicates the backend isn't deployed. You need to:

1. Deploy the backend service (see DEPLOYMENT.md)
2. Update `NEXT_PUBLIC_API_URL` in your production environment
3. Ensure the backend has the same Google OAuth credentials

## Step 6: Testing

1. Clear your browser cookies
2. Try signing in with Google
3. Check browser console for errors
4. Verify backend logs for any issues

## Environment Variables Needed

For Vercel deployment, add these in the dashboard:

```bash
GOOGLE_CLIENT_ID=your-client-id-here
GOOGLE_CLIENT_SECRET=your-client-secret-here
NEXTAUTH_URL=https://www.pokerconnect.me
NEXTAUTH_SECRET=generate-with-openssl-rand-base64-32
AUTH_SECRET=same-as-nextauth-secret
```

## Security Notes

- Never commit Client Secret to git
- Use different OAuth apps for dev/staging/production
- Regularly rotate your secrets
- Monitor usage in Google Cloud Console
