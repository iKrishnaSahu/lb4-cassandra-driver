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

## API Reference

### 1. Create User

**Endpoint**: `POST /users`

**Request Body**:

- `name` (string, required): Full name of the user.
- `email` (string, required): Email address.
- `age` (number, optional): User's age.

**Example**:

```json
{
  "name": "Tony Stark",
  "email": "tony@stark.com",
  "age": 45
}
```

**Response**: (200 OK)

```json
{
  "id": "d64ca376-dbe8-44d6-8536-b724bc5a40a2",
  "name": "Tony Stark",
  "email": "tony@stark.com",
  "age": 45,
  "createdAt": "2026-01-11T08:32:55.097Z"
}
```

**Example Request**:

```bash
curl -X POST http://localhost:3000/users \
  -H 'Content-Type: application/json' \
  -d '{
    "name": "Tony Stark",
    "email": "tony@stark.com",
    "age": 45
  }'
```

### 2. Get Users (Pagination)

**Endpoint**: `GET /users`

**Query Parameters**:

- `filter` (object, optional): JSON object for filtering (e.g., `{"where":{"name":"Tony Stark"}}`).
- `limit` (number, optional): Number of results to return (fetch size).
- `pageState` (string, optional): Base64 encoded state string to fetch the next page.

**Response**: (200 OK)

```json
{
  "users": [
    {
      "id": "...",
      "name": "Tony Stark",
      "email": "tony@stark.com"
      ...
    }
  ],
  "nextPageState": "..."
}
```

**Example Request**:

```bash
curl "http://localhost:3000/users?limit=10"
```

**Example Request (with Filter)**:

```bash
# Filter by name "Tony Stark"
# URL encoded filter={"where":{"name":"Tony Stark"}}
curl -g "http://localhost:3000/users?filter=%7B%22where%22%3A%7B%22name%22%3A%22Tony%20Stark%22%7D%7D"
```

_(Note: Pass `nextPageState` to the next request's `pageState` param to fetch the next set of results.)_

### 3. Get User by ID

**Endpoint**: `GET /users/{id}`

**Path Parameters**:

- `id` (string, required): The UUID of the user.

**Response**: (200 OK)

```json
{
  "id": "...",
  "name": "Tony Stark",
  "email": "..."
  ...
}
```

**Example Request**:

```bash
curl http://localhost:3000/users/d64ca376-dbe8-44d6-8536-b724bc5a40a2
```

### 4. Count Users

**Endpoint**: `GET /users/count`

**Response**: (200 OK)

```json
{
  "count": 42
}
```

**Example Request**:

```bash
curl http://localhost:3000/users/count
```

### 5. Update User

**Endpoint**: `PATCH /users/{id}`

**Path Parameters**:

- `id` (string, required): The UUID of the user.

**Request Body**:

- `name` (string, optional)
- `email` (string, optional)
- `age` (number, optional)

**Response**: (204 No Content)

**Example Request**:

```bash
curl -X PATCH http://localhost:3000/users/d64ca376-dbe8-44d6-8536-b724bc5a40a2 \
  -H 'Content-Type: application/json' \
  -d '{"age": 46}'
```

### 6. Delete User

**Endpoint**: `DELETE /users/{id}`

**Path Parameters**:

- `id` (string, required): The UUID of the user.

**Response**: (204 No Content)

**Example Request**:

```bash
curl -X DELETE http://localhost:3000/users/d64ca376-dbe8-44d6-8536-b724bc5a40a2
```

## Verification Test Output

The following output confirms the functionality of the Service Layer calling the Cassandra Repository.
Ran via `npx ts-node src/scripts/verify_service.ts`:

```text
🚀 Starting Service Layer Verification...
Initializing DataSource...
✅ Connected to Cassandra successfully!
   Keyspace: test_keyspace
   DataCenter: datacenter1
Initializing Repository and Service...
Creating a test user via Service...
  Created User: ServiceUser_1768120375097 (ID: d64ca376-dbe8-44d6-8536-b724bc5a40a2)
Fetching User d64ca376-dbe8-44d6-8536-b724bc5a40a2 via Service...
  Fetched: ServiceUser_1768120375097
Updating User via Service...
  Updated Age: 31
Testing Pagination via Service (Limit: 5)...
  Page 1 returned 5 users.
  Page 1 Users: [
  'Tony Stark',
  'ServiceUser_1768120375097',
  'Hulk',
  'Legolas',
  'Marty McFly'
]
Deleting User via Service...
  ✅ User correctly not found after delete.

✅ Service Layer Verification Successful!
Cassandra connection closed
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
