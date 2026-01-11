import {inject} from '@loopback/core';
import {DataObject, EntityNotFoundError} from '@loopback/repository';
import {mapping, types} from 'cassandra-driver';
import {CassandraDataSource} from '../datasources/cassandra.datasource';
import {User} from '../models';

export class UserRepository {
  private userMapper: mapping.ModelMapper<User>;
  private cassandraDataSource: CassandraDataSource;

  constructor(
    @inject('datasources.cassandra') dataSource: CassandraDataSource,
  ) {
    this.cassandraDataSource = dataSource;
    // Get the ModelMapper for User from the Mapper instance
    this.userMapper = dataSource.mapper.forModel('User');
  }

  // Create a new user
  async create(entity: DataObject<User>): Promise<User> {
    const id = types.Uuid.random().toString();
    const user = {
      id,
      name: entity.name,
      email: entity.email,
      age: entity.age,
      createdAt: (entity.createdAt as Date) ?? new Date(),
    };

    await this.userMapper.insert(user);

    return new User(user);
  }

  // Find all users with Cassandra's native cursor-based pagination
  async findAll(limit?: number, pageState?: string): Promise<{users: User[], nextPageState?: string}> {
    // Use Cassandra's native pagination with fetchSize and pageState in options
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const options: mapping.MappingExecutionOptions = {};

    if (limit) {
      options.fetchSize = limit;
    }

    if (pageState) {
      // pageState goes in options, not as separate parameter
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      options.pageState = Buffer.from(pageState, 'base64') as any;
    }

    // findAll signature: findAll(docInfo, executionOptions)
    const result = await this.userMapper.findAll({}, options);

    const users = result.toArray().map((user: User) => new User({
      id: user.id.toString(),
      name: user.name,
      email: user.email,
      age: user.age,
      createdAt: user.createdAt,
    }));

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const nextPageStateRaw = (result as any).pageState;
    let nextPageState: string | undefined;

    if (nextPageStateRaw) {
      if (Buffer.isBuffer(nextPageStateRaw)) {
        nextPageState = nextPageStateRaw.toString('base64');
      } else {
        // Assume it's a hex string from the driver
        nextPageState = Buffer.from(nextPageStateRaw, 'hex').toString('base64');
      }
    }

    return {users, nextPageState};
  }

  // Find user by ID
  async findById(id: string): Promise<User> {
    const result = await this.userMapper.get({id});

    if (!result) {
      throw new EntityNotFoundError(User, id);
    }

    return new User({
      id: result.id.toString(),
      name: result.name,
      email: result.email,
      age: result.age,
      createdAt: result.createdAt,
    });
  }

  // Update user
  async updateById(id: string, data: Partial<User>): Promise<void> {
    // First get the existing user
    const existing = await this.userMapper.get({id});

    if (!existing) {
      throw new EntityNotFoundError(User, id);
    }

    // Merge existing data with updates
    const updated = {
      id: existing.id, // Mapper handles type conversion
      name: data.name ?? existing.name,
      email: data.email ?? existing.email,
      age: data.age ?? existing.age,
      createdAt: existing.createdAt,
    };

    await this.userMapper.update(updated);
  }

  // Delete user
  async deleteById(id: string): Promise<void> {
    await this.userMapper.remove({id});
  }

  // Count total users
  async countAll(): Promise<number> {
    const client = this.cassandraDataSource.client;
    if (!client) {
      throw new Error('Cassandra client is not available');
    }
    const query = 'SELECT COUNT(*) FROM users';
    const result = await client.execute(query);

    // Validate result
    if (!result?.rows || result.rows.length === 0) {
      throw new Error('No result returned from count query');
    }

    // Cassandra returns a Long type for count, convert to number
    const countValue = result.rows[0]['count'];
    if (countValue === undefined || countValue === null) {
      return 0;
    }

    return typeof countValue === 'number' ? countValue : countValue.toNumber();
  }
}
