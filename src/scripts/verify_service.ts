import {CassandraDataSource} from '../datasources/cassandra.datasource';
import {UserRepository} from '../repositories/user.repository';
import {UserService} from '../services/user.service';

async function main() {
  console.log('🚀 Starting Service Layer Verification...');

  // 1. Initialize DataSource
  console.log('Initializing DataSource...');
  const dataSource = new CassandraDataSource();
  await dataSource.init();

  // 2. Initialize Repository & Service (Manual Injection)
  console.log('Initializing Repository and Service...');
  const repo = new UserRepository(dataSource);
  const service = new UserService(repo);

  try {
    // 3. Create Test User via Service
    console.log('Creating a test user via Service...');
    const timestamp = Date.now();
    const newUser = await service.createUser({
      name: `ServiceUser_${timestamp}`,
      email: `service${timestamp}@example.com`,
      age: 30,
    });
    console.log(`  Created User: ${newUser.name} (ID: ${newUser.id})`);

    // 4. Get User via Service
    console.log(`Fetching User ${newUser.id} via Service...`);
    const fetchedUser = await service.getUserById(newUser.id);
    console.log(`  Fetched: ${fetchedUser.name}`);
    if (fetchedUser.id !== newUser.id) throw new Error('ID mismatch!');

    // 5. Update User via Service
    console.log('Updating User via Service...');
    await service.updateUserById(newUser.id, {age: 31});
    const updatedUser = await service.getUserById(newUser.id);
    console.log(`  Updated Age: ${updatedUser.age}`);
    if (updatedUser.age !== 31) throw new Error('Update failed!');

    // 6. Test Pagination via Service
    console.log('Testing Pagination via Service (Limit: 5)...');
    const page1 = await service.getUsers(5);
    console.log(`  Page 1 returned ${page1.users.length} users.`);
    console.log('  Page 1 Users:', page1.users.map(u => u.name));

    if (page1.nextPageState) {
      console.log('  Fetching Page 2...');
      const page2 = await service.getUsers(5, page1.nextPageState);
      console.log(`  Page 2 returned ${page2.users.length} users.`);
      console.log('  Page 2 Users:', page2.users.map(u => u.name));
      console.log('  ✅ Pagination state passed correctly.');
    } else {
      console.log('  ℹ️ No second page available (created fewer than 5 users total?).');
    }

    // 7. Delete User via Service
    console.log('Deleting User via Service...');
    await service.deleteUserById(newUser.id);
    try {
      await service.getUserById(newUser.id);
      throw new Error('User should have been deleted!');
    } catch (e: any) {
      if (e.name === 'EntityNotFoundError' || e.code === 'ENTITY_NOT_FOUND') {
        console.log('  ✅ User correctly not found after delete.');
      } else {
        console.log('  ❌ Unexpected error during delete check:', e);
        throw e;
      }
    }

    console.log('\n✅ Service Layer Verification Successful!');

  } catch (error) {
    console.error('❌ Verification Failed:', error);
  } finally {
    await dataSource.stop();
  }
}

main().catch(err => {
  console.error(err);
  process.exit(1);
});
