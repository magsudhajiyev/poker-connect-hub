# Deployment Guidelines

This document outlines the steps to follow before deploying the Poker Connect Hub application.

## Pre-Deployment Checklist

### 1. Clean all console.logs and debug files

- Remove all `console.log` statements from production code
- Remove any debug/test files that were created during development
- Keep only necessary logging (errors/warnings)

### 2. Check for unused imports and variables

- Run linter to identify unused imports
- Remove all unused variables
- Clean up any commented-out code

### 3. Ensure no functionality is broken

- Test all critical user flows:
  - User authentication (login/logout)
  - Hand sharing functionality
  - Feed page loading (posts and hands)
  - Hand view page
  - Onboarding flow
  - Post creation, editing, and deletion
  - Like functionality on posts
  - Comment functionality on posts
  - User profile posts tab
- Verify API endpoints are working correctly:
  - `/api/posts/*` endpoints for CRUD operations
  - Dynamic route parameters are properly awaited

### 4. Ensure no TypeScript errors

- Run `npm run build` to check for TypeScript compilation errors
- Fix any type errors that appear

### 5. Check and fix 'any' type usage

**IMPORTANT**: TypeScript's `any` type defeats the purpose of type safety and should be avoided.

- Search for all occurrences of `any` types:
  ```bash
  find . -name "*.ts" -o -name "*.tsx" | grep -v node_modules | grep -v .next | xargs grep -n "any"
  ```
- Replace `any` types with proper type definitions:
  - For API responses: Create interface types for the expected data structure
  - For error handling: Use proper error types (e.g., `AxiosError<ApiErrorResponse>`)
  - For MongoDB documents: Create document interfaces extending base types
  - For React event handlers: Use proper event types (e.g., `React.MouseEvent`)
  - For third-party libraries: Check if @types packages are available
- Common replacements:
  - `catch (error: any)` → `catch (error)` or `catch (error: unknown)`
  - `(item: any)` → Create proper interface for the item
  - `Record<string, any>` → Define specific object shape
- If changing would risk breaking functionality:
  - Skip the change temporarily
  - Add `// TODO: Replace any with proper type` comment
  - Document it in `/deployment/tech-debt.md` for future fixing

### 6. Run build command

- Execute `npm run build`
- Ensure build completes without errors
- Check build output size and warnings
- Fix any runtime errors related to:
  - Dynamic route params must be awaited in Next.js 13+
  - React Hook dependency warnings

### 7. Merge branch back to main

- Create pull request from feature branch to main
- Review all changes
- Merge using appropriate strategy (squash/merge)

### 8. Verify main branch

- Switch to main branch
- Pull latest changes
- Run the application locally
- Perform quick smoke tests

### 9. Deploy main branch

- Push to production environment
- Monitor deployment logs
- Verify application is running correctly in production

## Post-Deployment

- Monitor error logs
- Check performance metrics
- Be ready to rollback if critical issues arise
