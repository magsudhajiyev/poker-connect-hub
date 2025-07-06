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
  - Feed page loading
  - Hand view page
  - Onboarding flow
- Verify API endpoints are working correctly

### 4. Ensure no TypeScript errors

- Run `npm run build` to check for TypeScript compilation errors
- Fix any type errors that appear

### 5. Fix usage of 'any' types

- Replace `any` types with proper type definitions where possible
- If changing would risk breaking functionality:
  - Skip the change
  - Document it in `/deployment/tech-debt.md` for future fixing

### 6. Run build command

- Execute `npm run build`
- Ensure build completes without errors
- Check build output size and warnings

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
