-- Create keyspace if not exists
CREATE KEYSPACE IF NOT EXISTS test_keyspace
WITH replication = {
  'class': 'SimpleStrategy',
  'replication_factor': 1
};

-- Use the keyspace
USE test_keyspace;

-- Create users table
CREATE TABLE IF NOT EXISTS users (
  id UUID PRIMARY KEY,
  name TEXT,
  email TEXT,
  age INT,
  created_at TIMESTAMP
);

-- Create index on email for faster lookups (optional)
CREATE INDEX IF NOT EXISTS ON users (email);
