import {inject, lifeCycleObserver, LifeCycleObserver} from '@loopback/core';
import {juggler} from '@loopback/repository';
import {Client, mapping} from 'cassandra-driver';

const config = {
  name: 'cassandra',
  connector: 'memory', // We'll use in-memory connector as base, but override with cassandra-driver
  contactPoints: ['127.0.0.1'],
  localDataCenter: 'datacenter1',
  keyspace: 'test_keyspace',
};

@lifeCycleObserver('datasource')
export class CassandraDataSource extends juggler.DataSource
  implements LifeCycleObserver {
  static dataSourceName = 'cassandra';
  static readonly defaultConfig = config;

  public client: Client;
  public mapper: mapping.Mapper;

  constructor(
    @inject('datasources.config.cassandra', {optional: true})
    dsConfig: object = config,
  ) {
    super(dsConfig);

    // Initialize Cassandra client
    this.client = new Client({
      contactPoints: config.contactPoints,
      localDataCenter: config.localDataCenter,
      keyspace: config.keyspace,
    });

    // Initialize Mapper with model definitions
    this.mapper = new mapping.Mapper(this.client, {
      models: {
        'User': {
          tables: ['users'],
        },
      },
    });
  }

  async init(): Promise<void> {
    try {
      await this.client.connect();
      console.log('✅ Connected to Cassandra successfully!');
      console.log(`   Keyspace: ${config.keyspace}`);
      console.log(`   DataCenter: ${config.localDataCenter}`);
    } catch (error) {
      console.error('❌ Failed to connect to Cassandra:', error);
      throw error;
    }
  }

  async stop(): Promise<void> {
    await this.client.shutdown();
    await super.stop();
    console.log('Cassandra connection closed');
  }
}
