import {inject} from '@loopback/core';
import {DataObject, EntityNotFoundError, Filter} from '@loopback/repository';
import {mapping, QueryOptions, types} from 'cassandra-driver';
import {CassandraDataSource} from '../datasources/cassandra.datasource';
import {User} from '../models';
import {CassandraUtils} from '../utils/cassandra.util';

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
  // Find all users with Cassandra's native cursor-based pagination and filtering
  async findAll(filter?: Filter<User>, pageState?: string): Promise<{users: User[], nextPageState?: string}> {
    const client = this.cassandraDataSource.client;
    if (!client) {
      throw new Error('Cassandra client is not available');
    }

    let query = 'SELECT * FROM users';
    const params: unknown[] = [];

    // Build WHERE clause using utility
    const {query: whereClause, params: whereParams} = CassandraUtils.buildWhereClause(filter);

    if (whereClause) {
      query += whereClause;
      params.push(...whereParams);
    }

    const options: QueryOptions = {
      prepare: true,
    };

    if (filter?.limit) {
      options.fetchSize = filter.limit;
    }

    if (pageState) {
      options.pageState = pageState;
    }

    const result = await client.execute(query, params, options);

    const users = result.rows.map(row => {
      return new User({
        id: row.id.toString(),
        name: row.name,
        email: row.email,
        age: row.age,
        createdAt: row.created_at, // Cassandra driver returns lowercase column names
      });
    });

    const nextPageStateRaw = result.pageState;
    let nextPageState: string | undefined;

    if (nextPageStateRaw) {
      // driver returns pageState as a hex string or Buffer depending on version/config
      nextPageState = nextPageStateRaw;
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
