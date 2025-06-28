const mongoose = require('mongoose');

async function fixIndexes() {
  try {
    // Connect to MongoDB
    await mongoose.connect('mongodb://localhost:27017/poker_connect_hub');
    console.log('Connected to MongoDB');

    const db = mongoose.connection.db;
    const collection = db.collection('users');

    // List current indexes
    const indexes = await collection.indexes();
    console.log('\nCurrent indexes:');
    indexes.forEach((index) => {
      console.log(`- ${index.name}:`, index.key);
    });

    // Drop the problematic googleId index
    try {
      await collection.dropIndex('googleId_1');
      console.log('\n✓ Dropped googleId_1 index');
    } catch (error) {
      console.log('\n! Could not drop googleId_1 index:', error.message);
    }

    // Create the new sparse index
    await collection.createIndex(
      { googleId: 1 },
      {
        unique: true,
        sparse: true,
        name: 'googleId_sparse_1',
      },
    );
    console.log('✓ Created new sparse index on googleId');

    // Ensure other indexes exist
    await collection.createIndex({ email: 1 }, { unique: true });
    console.log('✓ Ensured unique index on email');

    await collection.createIndex({ username: 1 }, { unique: true, sparse: true });
    console.log('✓ Ensured sparse unique index on username');

    // List final indexes
    const finalIndexes = await collection.indexes();
    console.log('\nFinal indexes:');
    finalIndexes.forEach((index) => {
      console.log(`- ${index.name}:`, index.key);
    });

    await mongoose.disconnect();
    console.log('\n✓ Disconnected from MongoDB');
  } catch (error) {
    console.error('Error:', error);
    await mongoose.disconnect();
  }
}

fixIndexes();
