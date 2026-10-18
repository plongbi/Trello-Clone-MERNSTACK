const { MongoClient } = require('mongodb');
const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '.env') });

async function migrate() {
  const client = new MongoClient(process.env.MONGODB_URI);
  try {
    console.log('Connecting to database...');
    await client.connect();
    const db = client.db(process.env.DATABASE_NAME);
    console.log('Connected successfully to database:', process.env.DATABASE_NAME);

    // 1. Đồng bộ cho collection "users"
    console.log('\n--- MIGRATING USERS ---');
    const userStarredRes = await db.collection('users').updateMany(
      { starredBoards: { $exists: false } },
      { $set: { starredBoards: [] } }
    );
    console.log(`Updated users missing starredBoards: ${userStarredRes.modifiedCount}`);

    const userRecentRes = await db.collection('users').updateMany(
      { recentBoards: { $exists: false } },
      { $set: { recentBoards: [] } }
    );
    console.log(`Updated users missing recentBoards: ${userRecentRes.modifiedCount}`);

    // 2. Đồng bộ cho collection "boards"
    console.log('\n--- MIGRATING BOARDS ---');
    const boardWorkspaceRes = await db.collection('boards').updateMany(
      { workspaceId: { $exists: false } },
      { $set: { workspaceId: null } }
    );
    console.log(`Updated boards missing workspaceId: ${boardWorkspaceRes.modifiedCount}`);

    // 3. Đồng bộ cho collection "cards"
    console.log('\n--- MIGRATING CARDS ---');
    const cardDueDateRes = await db.collection('cards').updateMany(
      { dueDate: { $exists: false } },
      { $set: { dueDate: null } }
    );
    console.log(`Updated cards missing dueDate: ${cardDueDateRes.modifiedCount}`);

    const cardChecklistsRes = await db.collection('cards').updateMany(
      { checklists: { $exists: false } },
      { $set: { checklists: [] } }
    );
    console.log(`Updated cards missing checklists: ${cardChecklistsRes.modifiedCount}`);

    const cardLabelsRes = await db.collection('cards').updateMany(
      { labels: { $exists: false } },
      { $set: { labels: [] } }
    );
    console.log(`Updated cards missing labels: ${cardLabelsRes.modifiedCount}`);

    console.log('\nMigration completed successfully!');
  } catch (error) {
    console.error('Error during migration:', error);
  } finally {
    await client.close();
    console.log('Database connection closed.');
  }
}

migrate();
