---
name: nosql
description: "Unified NoSQL skill index — covers document databases (MongoDB), key-value stores (Redis), wide-column stores (Cassandra), graph databases (Neo4j), data modeling, indexing, query patterns, consistency models, scaling & sharding, and performance optimization. Use this as the entry point; it delegates to focused sub-skill files for each domain."
---

# NoSQL Skill

## Overview

This file is the top-level entry point for all NoSQL-related topics. It identifies the right sub-skill file to consult based on what the user is trying to accomplish. Each sub-skill file contains clear patterns, examples, and best practices for its domain.

---

## What is NoSQL?

NoSQL databases store data in formats other than relational tables. They trade some SQL features (like strict schemas and joins) for flexibility, speed, and horizontal scalability.

**Four main types:**

| Type        | Best For                           | Examples              |
| ----------- | ---------------------------------- | --------------------- |
| Document    | Flexible, nested data              | MongoDB, Firestore    |
| Key-Value   | Fast lookups, caching, sessions    | Redis, DynamoDB       |
| Wide-Column | Time-series, write-heavy workloads | Cassandra, HBase      |
| Graph       | Relationships between entities     | Neo4j, Amazon Neptune |

---

## Sub-Skills Reference

| Domain             | File                                                       | When to use                                                                                      |
| ------------------ | ---------------------------------------------------------- | ------------------------------------------------------------------------------------------------ |
| Document Databases | [document-databases.md](document-databases.md)             | MongoDB CRUD, schemas, aggregation pipelines, embedded vs referenced documents                   |
| Key-Value Stores   | [key-value-stores.md](key-value-stores.md)                 | Redis caching, session storage, pub/sub, TTL, common data structures                             |
| Wide-Column Stores | [wide-column-stores.md](wide-column-stores.md)             | Cassandra table design, CQL queries, partition keys, write-heavy workloads                       |
| Graph Databases    | [graph-databases.md](graph-databases.md)                   | Neo4j nodes/edges, Cypher queries, relationship traversal, social/recommendation graphs          |
| Data Modeling      | [data-modeling.md](data-modeling.md)                       | Embedding vs referencing, denormalization, schema design patterns, modeling for query patterns   |
| Indexing           | [indexing.md](indexing.md)                                 | Index types, compound indexes, sparse/partial indexes, when to index, index pitfalls             |
| Query Patterns     | [query-patterns.md](query-patterns.md)                     | CRUD queries, aggregations, pagination, full-text search, filtering, sorting across NoSQL types  |
| Consistency Models | [consistency-models.md](consistency-models.md)             | CAP theorem, eventual vs strong consistency, ACID vs BASE, read/write consistency levels         |
| Scaling & Sharding | [scaling-sharding.md](scaling-sharding.md)                 | Horizontal scaling, sharding strategies, replica sets, partition key selection, replication      |
| Performance        | [performance-optimization.md](performance-optimization.md) | Query optimization, connection pooling, caching strategies, avoiding common performance pitfalls |

---

## Quick Decision Guide

```
What are you trying to do?
│
├── Store and query flexible, document-style data (JSON-like)?
│   └── → document-databases.md
│
├── Cache data, store sessions, or use pub/sub messaging?
│   └── → key-value-stores.md
│
├── Handle time-series data or extremely high write throughput?
│   └── → wide-column-stores.md
│
├── Model or traverse relationships between entities?
│   └── → graph-databases.md
│
├── Decide how to structure/model your data for NoSQL?
│   └── → data-modeling.md
│
├── Speed up queries by adding indexes?
│   └── → indexing.md
│
├── Write CRUD queries, aggregations, or pagination?
│   └── → query-patterns.md
│
├── Understand consistency guarantees or CAP theorem trade-offs?
│   └── → consistency-models.md
│
├── Scale horizontally, set up sharding or replication?
│   └── → scaling-sharding.md
│
└── Diagnose slow queries or optimize overall performance?
    └── → performance-optimization.md
```

---

## How to Use This Skill

1. **Identify the goal** using the Quick Decision Guide above.
2. **Load the corresponding sub-skill file** with `read_file`.
3. **Follow the patterns and examples** in that file to produce the response.
4. **Load multiple sub-skill files** when the task spans domains — for example, designing a new collection involves `data-modeling.md` + `indexing.md` + `query-patterns.md`.
