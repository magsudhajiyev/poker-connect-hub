# Local MongoDB Setup Guide

## Option 1: Install MongoDB Locally (Recommended)

### For macOS:

```bash
# Install MongoDB using Homebrew
brew tap mongodb/brew
brew install mongodb-community

# Start MongoDB
brew services start mongodb-community

# Verify it's running
mongosh
```

### For Windows/Linux:

Follow the official MongoDB installation guide:

- https://www.mongodb.com/docs/manual/installation/

### Connect to Local MongoDB:

Once installed, update your `.env.local` file:

```
MONGODB_URI=mongodb://localhost:27017/poker-connect-hub-dev
```

## Option 2: Use MongoDB Atlas (Free Tier)

1. Go to https://www.mongodb.com/cloud/atlas
2. Create a free account
3. Create a new cluster (M0 - free tier)
4. Name it something like "poker-connect-dev"
5. Set up database access:
   - Create a database user
   - Add your IP address to the IP whitelist
6. Get your connection string and update `.env.local`

## Option 3: Use Docker

Create a `docker-compose.yml` file:

```yaml
version: '3.8'
services:
  mongodb:
    image: mongo:latest
    container_name: poker-connect-mongodb
    ports:
      - '27017:27017'
    environment:
      MONGO_INITDB_DATABASE: poker-connect-hub-dev
    volumes:
      - mongodb_data:/data/db

volumes:
  mongodb_data:
```

Run with:

```bash
docker-compose up -d
```

Connect with:

```
MONGODB_URI=mongodb://localhost:27017/poker-connect-hub-dev
```

## Recommended: Environment-Specific Config

Update your `.env.local` to use a local database:

```env
# Use local MongoDB for development
MONGODB_URI=mongodb://localhost:27017/poker-connect-hub-dev

# Keep your production URI commented for reference
# PROD_MONGODB_URI=mongodb+srv://magsud94:LH9fQ8nucPVV6zZN@pokerconnectprod.odqo5nq.mongodb.net/poker-connect-hub?retryWrites=true&w=majority
```

## Verify Your Setup

1. Start your local MongoDB
2. Update `.env.local` with local connection string
3. Restart your Next.js dev server
4. Check the console for successful connection

## Data Migration (Optional)

If you need some production data locally:

```bash
# Export from production (be careful!)
mongodump --uri="your-prod-uri" --out=./backup

# Import to local
mongorestore --uri="mongodb://localhost:27017" ./backup
```

## Best Practices

1. **Never** use production database for local development
2. Keep separate `.env.local` and `.env.production` files
3. Add `.env.local` to `.gitignore` (should already be there)
4. Use different database names for clarity:
   - Production: `poker-connect-hub`
   - Development: `poker-connect-hub-dev`
   - Test: `poker-connect-hub-test`
