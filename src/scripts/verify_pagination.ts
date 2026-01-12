import {CassandraDataSource} from '../datasources/cassandra.datasource';
import {User} from '../models/user.model';
import {UserRepository} from '../repositories/user.repository';

async function main() {
  console.log('🚀 Starting Verification Script...');

  // 1. Initialize DataSource
  console.log('Initializing DataSource...');
  const dataSource = new CassandraDataSource();
  await dataSource.init();

  // 2. Initialize Repository
  console.log('Initializing Repository...');
  const repo = new UserRepository(dataSource);

  try {
    // 3. Clean up existing users (optional, but good for clean state)
    // NOTE: In a real prod DB we wouldn't do this, but for verification it helps.
    // However, since we don't have a 'deleteAll', we'll just add new unique users and verify them.

    // 4. Create Test Users
    console.log('Creating 5 test users...');
    const createdUsers: User[] = [];
    for (let i = 0; i < 5; i++) {
      const user = await repo.create({
        name: `TestUser_${Date.now()}_${i}`,
        email: `test${Date.now()}_${i}@example.com`,
        age: 20 + i,
      });
      createdUsers.push(user);
      console.log(`  Created: ${user.name}`);
    }

    // 5. Test Pagination
    console.log('\nTesting Pagination (Limit: 2)...');

    // Page 1
    const page1 = await repo.findAll({limit: 2});
    console.log(`  Page 1 returned ${page1.users.length} users.`);
    if (page1.users.length !== 2) throw new Error('Page 1 should have 2 users');
    if (!page1.nextPageState) throw new Error('Page 1 should have a nextPageState');
    console.log('  Page 1 Users:', page1.users.map(u => u.name));

    // Page 2
    const page2 = await repo.findAll({limit: 2}, page1.nextPageState);
    console.log(`  Page 2 returned ${page2.users.length} users.`);
    // Note: We might get fewer than 2 if we reached the end of ALL users in the DB,
    // but since we just added 5, we expect at least 2 users (unless there were 0 before).
    // Let's assume there are at least the 5 we created.
    console.log('  Page 2 Users:', page2.users.map(u => u.name));

    // Verify Page 2 users are different from Page 1
    const p1Ids = new Set(page1.users.map(u => u.id));
    const p2Ids = new Set(page2.users.map(u => u.id));
    for (const id of p2Ids) {
      if (p1Ids.has(id)) throw new Error(`Overlap detected! User ${id} is in both Page 1 and Page 2`);
    }
    console.log('  ✅ Page 1 and Page 2 are distinct.');

    // Page 3
    if (page2.nextPageState) {
      const page3 = await repo.findAll({limit: 2}, page2.nextPageState);
      console.log(`  Page 3 returned ${page3.users.length} users.`);
      console.log('  Page 3 Users:', page3.users.map(u => u.name));
    }

    console.log('\n✅ Verification Successful!');

  } catch (error) {
    console.error('❌ Verification Failed:', error);
  } finally {
    // 6. Cleanup / Stop
    await dataSource.stop();
  }
}

main().catch(err => {
  console.error(err);
  process.exit(1);
});
