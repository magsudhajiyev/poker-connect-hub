# Vercel Authentication Fix

## Changes Made

1. **Updated auth.ts**:
   - Added proper redirect callback to handle production redirects
   - Added explicit cookie configuration with domain `.pokerconnect.me`
   - Enabled debug mode temporarily (can be controlled via NEXTAUTH_DEBUG env var)
   - Added `trustHost: true` for Vercel deployment

2. **Updated SignInForm.tsx**:
   - Changed from `redirectTo` to `callbackUrl` parameter (NextAuth v5 syntax)
   - Added explicit `redirect: true` parameter

3. **Created Debug Route**:
   - Added `/api/auth/debug` endpoint to verify auth state
   - Visit `https://www.pokerconnect.me/api/auth/debug` to check session status

## Action Items for You

### 1. Update Vercel Environment Variables

Please update these in your Vercel dashboard:

```
NEXT_PUBLIC_API_URL=https://www.pokerconnect.me
NEXT_PUBLIC_APP_URL=https://www.pokerconnect.me
```

(Optional) Add this for debugging:

```
NEXTAUTH_DEBUG=true
```

### 2. Verify Google OAuth Settings

In your Google Cloud Console, ensure these redirect URIs are authorized:

- `https://www.pokerconnect.me/api/auth/callback/google`
- `https://poker-connect-hub.vercel.app/api/auth/callback/google` (if you still use the Vercel subdomain)

### 3. Deploy to Vercel

Push these changes and let Vercel redeploy:

```bash
git add -A
git commit -m "fix: Vercel authentication redirect issue"
git push
```

### 4. Test the Fix

1. Clear your browser cookies for pokerconnect.me
2. Visit https://www.pokerconnect.me/api/auth/debug (should show no session)
3. Go to https://www.pokerconnect.me/auth/signin
4. Sign in with Google
5. You should be redirected to /feed
6. Visit the debug endpoint again to verify session exists

### 5. Troubleshooting

If it still doesn't work:

1. Check the browser's Network tab during sign-in
2. Look for the `/api/auth/callback/google` request
3. Check if cookies are being set properly
4. Visit the debug endpoint to see what's happening

The debug endpoint will show:

- If environment variables are set
- If a session exists
- Cookie information
- Other helpful debugging data

### 6. Once Fixed

After confirming everything works:

1. Remove `NEXTAUTH_DEBUG=true` from Vercel env vars
2. You can delete the debug route if desired

## Why This Should Work

1. The redirect callback explicitly handles production URLs
2. Cookie domain is set to `.pokerconnect.me` to work with www subdomain
3. `trustHost: true` tells NextAuth to trust the host header from Vercel
4. Using correct NextAuth v5 syntax in signIn()
