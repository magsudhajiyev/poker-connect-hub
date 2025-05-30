#!/bin/bash

# Exit script on first error
set -e

echo "📦 Installing dependencies..."
npm install

echo "🔨 Building the Vite app..."
npm run build

echo "🚚 Deploying to public_html..."
rm -rf ~/public_html/*
cp -r dist/* ~/public_html/

echo "✅ Deployment complete!"
