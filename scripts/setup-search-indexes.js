/**
 * Database Index Setup Script for User Search
 * Run this script to ensure optimal search performance
 */

const { MongoClient } = require('mongodb');

async function setupSearchIndexes() {
  const uri = process.env.MONGODB_URI;

  if (!uri) {
    console.error('MONGODB_URI environment variable not set');
    process.exit(1);
  }

  const client = new MongoClient(uri);

  try {
    await client.connect();
    console.log('Connected to MongoDB');

    const db = client.db();

    // Create indexes for onboardinganswers collection
    const onboardingCollection = db.collection('onboardinganswers');

    // Create indexes for username search
    await onboardingCollection.createIndex({ username: 1 });
    await onboardingCollection.createIndex({ username: 'text' });
    await onboardingCollection.createIndex({ userId: 1 }); // For joins

    console.log('✅ Created indexes for onboardinganswers collection');

    // Verify User collection indexes (handled by Mongoose schema)
    const userCollection = db.collection('users');
    const userIndexes = await userCollection.listIndexes().toArray();
    console.log(
      '📋 User collection indexes:',
      userIndexes.map((idx) => idx.name),
    );

    // Verify onboarding collection indexes
    const onboardingIndexes = await onboardingCollection.listIndexes().toArray();
    console.log(
      '📋 Onboarding collection indexes:',
      onboardingIndexes.map((idx) => idx.name),
    );

    console.log('🚀 Search index setup completed successfully!');
  } catch (error) {
    console.error('❌ Error setting up indexes:', error);
    process.exit(1);
  } finally {
    await client.close();
  }
}

setupSearchIndexes();
