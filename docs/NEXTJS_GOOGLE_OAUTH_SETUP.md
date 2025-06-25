# Google OAuth Setup for Next.js Migration

This guide will help you set up Google OAuth for your migrated Next.js application.

## Prerequisites
- A Google account
- Access to [Google Cloud Console](https://console.cloud.google.com)

## Step 1: Create a Google Cloud Project

1. Go to [Google Cloud Console](https://console.cloud.google.com)
2. Click on the project dropdown at the top
3. Click "New Project"
4. Enter a project name (e.g., "Poker Connect Hub")
5. Click "Create"

## Step 2: Enable Google+ API

1. In the Google Cloud Console, go to "APIs & Services" > "Library"
2. Search for "Google+ API"
3. Click on it and press "Enable"

## Step 3: Create OAuth 2.0 Credentials

1. Go to "APIs & Services" > "Credentials"
2. Click "Create Credentials" > "OAuth client ID"
3. If prompted, configure the OAuth consent screen first:
   - Choose "External" user type
   - Fill in the required fields:
     - App name: "Poker Connect Hub"
     - User support email: Your email
     - Developer contact: Your email
   - Add scopes: `email`, `profile`, `openid`
   - Save and continue

4. Now create the OAuth client ID:
   - Application type: "Web application"
   - Name: "Poker Connect Hub Web Client"
   
5. Add Authorized JavaScript origins:
   ```
   http://localhost:3000
   http://localhost:3001
   https://your-domain.vercel.app
   ```

6. Add Authorized redirect URIs:
   ```
   http://localhost:3000/api/auth/callback/google
   http://localhost:3001/api/auth/callback/google
   https://your-domain.vercel.app/api/auth/callback/google
   ```

7. Click "Create"

## Step 4: Copy Your Credentials

After creating the OAuth client, you'll see:
- **Client ID**: Something like `123456789012-abcdefghijklmnop.apps.googleusercontent.com`
- **Client Secret**: A long string of characters

## Step 5: Update Your .env.local File

Replace the placeholder values in your `.env.local` file:

```env
# Google OAuth Configuration
NEXT_PUBLIC_GOOGLE_CLIENT_ID=YOUR_ACTUAL_CLIENT_ID_HERE
GOOGLE_CLIENT_ID=YOUR_ACTUAL_CLIENT_ID_HERE
GOOGLE_CLIENT_SECRET=YOUR_ACTUAL_CLIENT_SECRET_HERE

# NextAuth Configuration
NEXTAUTH_URL=http://localhost:3000
NEXTAUTH_SECRET=GENERATE_WITH_COMMAND_BELOW
AUTH_SECRET=SAME_AS_NEXTAUTH_SECRET
```

### Generate NextAuth Secret

Run this command in your terminal to generate a secure secret:
```bash
openssl rand -base64 32
```

Copy the output and use it for both `NEXTAUTH_SECRET` and `AUTH_SECRET`.

## Step 6: Restart Your Development Server

After updating `.env.local`, restart your Next.js development server:

```bash
# Stop the server (Ctrl+C) then:
npm run dev
```

## Step 7: Test Authentication

1. Navigate to http://localhost:3000
2. Click "Get Started" or "Create Account"
3. Click "Continue with Google"
4. You should see Google's OAuth consent screen
5. Sign in with your Google account
6. You should be redirected back to your app

## Troubleshooting

### "Access blocked: Authorization Error"
- Make sure you've added the correct redirect URIs in Google Console
- Ensure your Client ID and Secret are correctly copied (no extra spaces)
- Check that you've restarted the dev server after updating `.env.local`

### "redirect_uri_mismatch"
- The redirect URI must match EXACTLY what's in Google Console
- For Next.js with NextAuth, the pattern is: `{NEXTAUTH_URL}/api/auth/callback/google`
- Wait 5-10 minutes after updating Google Console for changes to propagate

### Still getting "invalid_client"?
- Double-check that you're using the Client ID, not the project ID
- Ensure the Client Secret is complete (they can be quite long)
- Make sure there are no quotes around the values in `.env.local`

## Production Deployment

When deploying to Vercel:

1. Add your production domain to Google Console:
   - Authorized JavaScript origins: `https://your-domain.vercel.app`
   - Authorized redirect URIs: `https://your-domain.vercel.app/api/auth/callback/google`

2. Set environment variables in Vercel:
   - Go to your Vercel project settings
   - Navigate to "Environment Variables"
   - Add all the variables from `.env.local`
   - Make sure `NEXTAUTH_URL` is set to your production URL

## Security Notes

- Never commit `.env.local` to version control
- Keep your Client Secret secure
- In production, use HTTPS URLs only
- Regularly rotate your secrets