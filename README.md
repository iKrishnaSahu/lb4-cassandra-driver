# LoopBack 4 + Cassandra Integration

A LoopBack 4 application integrated with Apache Cassandra using cassandra-driver.

## Prerequisites

- Node.js 20+
- Apache Cassandra running locally on port 9042
- npm or yarn

## Setup

### 1. Install Dependencies

```bash
npm install
```

### 2. Setup Cassandra Database

Make sure Cassandra is running, then execute the schema script:

```bash
cqlsh -f schema.cql
```

Or manually create the keyspace and table:

```cql
CREATE KEYSPACE IF NOT EXISTS test_keyspace
WITH replication = {
  'class': 'SimpleStrategy',
  'replication_factor': 1
};

USE test_keyspace;

CREATE TABLE IF NOT EXISTS users (
  id UUID PRIMARY KEY,
  name TEXT,
  email TEXT,
  age INT,
  created_at TIMESTAMP
);
```

### 3. Build and Start

```bash
npm run build
npm start
```

The application will start on `http://localhost:3000`

## API Endpoints

### REST API Explorer

Visit `http://localhost:3000/explorer` to see all available endpoints.

### User CRUD Operations

#### Create User

```bash
POST /users
Content-Type: application/json

{
  "name": "John Doe",
  "email": "john@example.com",
  "age": 30
}
```

#### Get All Users

```bash
GET /users
```

#### Get User by ID

```bash
GET /users/{id}
```

#### Update User

```bash
PATCH /users/{id}
Content-Type: application/json

{
  "name": "Jane Doe",
  "age": 31
}
```

#### Delete User

```bash
DELETE /users/{id}
```

## Configuration

Cassandra connection settings are in `src/datasources/cassandra.datasource.ts`:

```typescript
const config = {
  contactPoints: ['127.0.0.1'],
  localDataCenter: 'datacenter1',
  keyspace: 'test_keyspace',
};
```

## Development

```bash
# Watch mode
npm run build:watch

# Run tests
npm test

# Lint and fix
npm run lint:fix
```

## Project Structure

```
src/
├── controllers/       # REST API endpoints
│   └── user.controller.ts
├── datasources/      # Database connections
│   └── cassandra.datasource.ts
├── models/          # Data models
│   └── user.model.ts
├── repositories/    # Data access layer
│   └── user.repository.ts
└── application.ts   # Main application
```

## Features

✅ Cassandra integration with cassandra-driver
✅ Full CRUD operations
✅ RESTful API with OpenAPI documentation
✅ TypeScript support
✅ Auto-generated API explorer
✅ Lifecycle management (connection/disconnection)
