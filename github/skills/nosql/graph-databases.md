---
name: nosql-graph-databases
description: "Graph database patterns — Neo4j nodes and relationships, Cypher queries, traversal patterns, and use cases. Use when working with Neo4j, Amazon Neptune, or any graph database."
---

# Graph Databases

## Overview

Graph databases store data as **nodes** (entities) and **relationships** (edges between entities). They excel at queries that involve traversing connections — things that are slow and complex in SQL with many joins.

**Use graph databases for:** social networks, recommendation engines, fraud detection, access control, knowledge graphs.

```
SQL:   users JOIN follows JOIN users JOIN posts ... (many JOINs)
Neo4j: MATCH (u)-[:FOLLOWS]->()-[:LIKED]->(p:Post) RETURN p  (one traversal)
```

---

## 1. Core Concepts

| Concept          | Description                             | Example                      |
| ---------------- | --------------------------------------- | ---------------------------- |
| **Node**         | An entity (like a table row)            | `(:User {name: 'Alice'})`    |
| **Label**        | A type tag on a node                    | `User`, `Product`, `Post`    |
| **Relationship** | A directed edge between two nodes       | `[:FOLLOWS]`, `[:PURCHASED]` |
| **Property**     | A key-value attribute on a node or edge | `{name: 'Alice', age: 30}`   |

---

## 2. Cypher Query Language

Cypher uses ASCII-art patterns to describe graph traversals.

```
(node)-[:RELATIONSHIP]->(node)
```

### Create Nodes & Relationships

```cypher
-- Create a user node
CREATE (:User {id: '1', name: 'Alice', email: 'alice@example.com'})

-- Create two users and a relationship between them
CREATE (a:User {name: 'Alice'})-[:FOLLOWS]->(b:User {name: 'Bob'})

-- MERGE: create only if not exists (upsert)
MERGE (u:User {id: '42'})
ON CREATE SET u.name = 'Carol', u.createdAt = datetime()
ON MATCH SET u.lastSeen = datetime()
```

### Read (MATCH)

```cypher
-- Find all users
MATCH (u:User) RETURN u

-- Find user by property
MATCH (u:User {name: 'Alice'}) RETURN u

-- Find who Alice follows
MATCH (alice:User {name: 'Alice'})-[:FOLLOWS]->(followed:User)
RETURN followed.name

-- Find Alice's followers
MATCH (follower:User)-[:FOLLOWS]->(alice:User {name: 'Alice'})
RETURN follower.name

-- Mutual friends (friends of friends)
MATCH (alice:User {name: 'Alice'})-[:FOLLOWS]->(mid:User)-[:FOLLOWS]->(suggestion:User)
WHERE NOT (alice)-[:FOLLOWS]->(suggestion)
  AND alice <> suggestion
RETURN DISTINCT suggestion.name
```

### Update

```cypher
-- Update a property
MATCH (u:User {name: 'Alice'})
SET u.age = 31
RETURN u

-- Add a new relationship
MATCH (a:User {name: 'Alice'}), (b:User {name: 'Carol'})
CREATE (a)-[:FOLLOWS]->(b)

-- Update relationship property
MATCH (a:User)-[r:PURCHASED]->(p:Product {id: '99'})
SET r.quantity = r.quantity + 1
```

### Delete

```cypher
-- Delete a node (must delete its relationships first)
MATCH (u:User {name: 'Alice'})
DETACH DELETE u   -- DETACH removes all relationships automatically

-- Delete just a relationship
MATCH (a:User {name: 'Alice'})-[r:FOLLOWS]->(b:User {name: 'Bob'})
DELETE r
```

---

## 3. Common Query Patterns

### Shortest Path

```cypher
-- Shortest connection between Alice and Dave
MATCH path = shortestPath(
  (alice:User {name: 'Alice'})-[:FOLLOWS*]-(dave:User {name: 'Dave'})
)
RETURN path, length(path) AS hops
```

### Recommendations ("Users who liked X also liked...")

```cypher
MATCH (u:User {id: $userId})-[:LIKED]->(p:Product)<-[:LIKED]-(similar:User)
MATCH (similar)-[:LIKED]->(rec:Product)
WHERE NOT (u)-[:LIKED]->(rec)
RETURN rec.name, count(*) AS score
ORDER BY score DESC
LIMIT 10
```

### Role-Based Access Check

```cypher
MATCH (u:User {id: $userId})-[:HAS_ROLE]->(r:Role)-[:CAN_ACCESS]->(res:Resource {id: $resourceId})
RETURN count(*) > 0 AS hasAccess
```

---

## 4. Node.js with neo4j-driver

```typescript
import neo4j from "neo4j-driver";

const driver = neo4j.driver(
  process.env.NEO4J_URI!,
  neo4j.auth.basic(process.env.NEO4J_USER!, process.env.NEO4J_PASSWORD!),
);

async function getUserFollowers(userId: string) {
  const session = driver.session();
  try {
    const result = await session.run(
      `MATCH (follower:User)-[:FOLLOWS]->(u:User {id: $userId})
       RETURN follower.name AS name, follower.id AS id`,
      { userId },
    );
    return result.records.map((r) => ({
      id: r.get("id"),
      name: r.get("name"),
    }));
  } finally {
    await session.close(); // always close the session
  }
}

// For write transactions
async function followUser(fromId: string, toId: string) {
  const session = driver.session();
  try {
    await session.executeWrite((tx) =>
      tx.run(
        `MATCH (a:User {id: $fromId}), (b:User {id: $toId})
         MERGE (a)-[:FOLLOWS]->(b)`,
        { fromId, toId },
      ),
    );
  } finally {
    await session.close();
  }
}
```

---

## 5. When to Use (and When Not To)

**Use graph databases when:**

- Queries traverse relationships (friends-of-friends, shortest path, recommendations)
- Relationship data is as important as entity data
- You have a highly connected domain (social, fraud, permissions)

**Don't use graph databases when:**

- Your data is simple and tabular with few relationships
- You need high-volume simple lookups (use Redis or MongoDB)
- Your team has no Cypher experience and the relational model fits

---

## 6. Common Gotchas

- **Always close sessions** — use `try/finally` or Neo4j's `executeRead`/`executeWrite` helpers.
- **Avoid returning whole graph** — `RETURN *` on a large traversal can return enormous data. Use `LIMIT` and only return needed fields.
- **Integer handling** — Neo4j integers are 64-bit; the JS driver returns them as `neo4j.Integer`, not plain `number`. Use `.toNumber()` or configure `disableLosslessIntegers: true`.
- **Direction in relationships** — `(a)-[:FOLLOWS]->(b)` is directional. `(a)-[:FOLLOWS]-(b)` is undirected (matches both directions).
