# Authentication Troubleshooting Guide

## Common Authentication Issues

### 1. Page Refreshes After Login But User Remains on Sign-In Page

This issue typically occurs when:
- Cookies are not being set properly
- CORS is misconfigured
- Browser is blocking third-party cookies
- Environment variables are incorrect

### Debugging Steps

1. **Open Browser Developer Console**
   - Check for any errors in the console
   - Look for network errors or CORS issues
   - Verify API calls are returning 200 status codes

2. **Check Network Tab**
   - Verify the `/auth/login` request succeeds
   - Check response headers for `Set-Cookie` headers
   - Ensure cookies have correct domain and path

3. **Verify Environment Variables**
   ```bash
   # Frontend (.env.local)
   NEXT_PUBLIC_API_URL=http://localhost:3001  # Must match backend URL
   NEXTAUTH_URL=http://localhost:5173         # Must match frontend URL
   
   # Backend (.env)
   FRONTEND_URL=http://localhost:5173         # Must match frontend URL
   ALLOWED_ORIGINS=http://localhost:5173,http://localhost:3000
   ```

4. **Browser Cookie Settings**
   - Ensure cookies are enabled
   - Check if third-party cookies are blocked
   - Try in incognito/private mode
   - Clear existing cookies and try again

### Production Considerations

1. **HTTPS Required**
   - Both frontend and backend must use HTTPS in production
   - Secure cookies won't work over HTTP

2. **Same-Site Cookie Policy**
   - If frontend and backend are on different domains, adjust `sameSite` policy
   - Current setting is `lax` which works for same-site requests

3. **CORS Configuration**
   - Ensure production domains are added to `ALLOWED_ORIGINS`
   - Verify `credentials: true` is set in CORS config

### Testing Authentication Flow

Run the test script to verify backend authentication:
```bash
node test-auth-frontend.js
```

This will test:
- Registration
- Cookie setting
- Authentication verification
- Logout
- Login

### Console Debugging

The application now includes extensive logging:
- API request/response details
- Cookie information
- Authentication state changes
- Middleware decisions

Look for these log messages:
- "Login successful, verifying authentication..."
- "Authentication verified"
- "Cookies should be set"

### Common Fixes

1. **Clear Browser Data**
   ```
   - Clear cookies for localhost
   - Clear local storage
   - Clear session storage
   ```

2. **Restart Services**
   ```bash
   # Kill all Node processes
   pkill -f node
   
   # Restart frontend and backend
   npm run dev:all
   ```

3. **Verify MongoDB Connection**
   - Ensure MongoDB is running
   - Check connection string in backend .env

4. **Check Browser Console Errors**
   - Network errors indicate CORS issues
   - 401 errors indicate authentication failure
   - 500 errors indicate server issues

### Still Having Issues?

1. Check the middleware logs in the browser console
2. Verify cookies in Application > Cookies in DevTools
3. Test with a different browser
4. Ensure no browser extensions are blocking cookies
5. Check if running behind a proxy or VPN