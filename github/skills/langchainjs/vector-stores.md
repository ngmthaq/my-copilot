---
name: langchainjs-vector-stores
description: "LangChain.js vector store integrations — MemoryVectorStore, Chroma, FAISS, Pinecone, PGVector, Weaviate, Qdrant. Covers creation, persistence, metadata filtering, batch operations, index management, and production deployment. Use when: choosing a vector store; setting up persistent storage; filtering by metadata; deploying vector search to production; migrating between stores. DO NOT USE FOR: loading documents (use langchainjs-document-parsers); splitting text (use langchainjs-chunking-strategies); building retrieval chains (use langchainjs-retrieval)."
---

# Vector Store Integrations

## Overview

Vector stores hold embeddings and support similarity search. Choose based on deployment needs: in-memory for prototyping, local persistent for development, and managed cloud services for production.

---

## 1. Vector Store Selection Guide

| Store               | Type              | Persistence | Best For                          | Scaling             |
| ------------------- | ----------------- | ----------- | --------------------------------- | ------------------- |
| `MemoryVectorStore` | In-memory         | No          | Prototyping, testing              | Small datasets      |
| `Chroma`            | Local/Server      | Yes         | Development, small-medium apps    | Medium              |
| `FaissStore`        | Local             | Yes (file)  | Fast local search, large datasets | Large (single node) |
| `PineconeStore`     | Managed cloud     | Yes         | Production, serverless            | Very large          |
| `PGVectorStore`     | PostgreSQL ext.   | Yes         | Existing Postgres infrastructure  | Large               |
| `WeaviateStore`     | Self-hosted/Cloud | Yes         | Hybrid search (vector + keyword)  | Very large          |
| `QdrantVectorStore` | Self-hosted/Cloud | Yes         | High performance, filtering       | Very large          |

---

## 2. MemoryVectorStore (Prototyping)

```javascript
import { MemoryVectorStore } from "langchain/vectorstores/memory";
import { OpenAIEmbeddings } from "@langchain/openai";

const embeddings = new OpenAIEmbeddings();

// Create from documents
const vectorStore = await MemoryVectorStore.fromDocuments(chunks, embeddings);

// Search
const results = await vectorStore.similaritySearch("query", 4);

// Add more documents later
await vectorStore.addDocuments(newChunks);

// Create empty and populate later
const emptyStore = new MemoryVectorStore(embeddings);
await emptyStore.addDocuments(chunks);
```

---

## 3. Chroma (Local Persistent)

```javascript
import { Chroma } from "@langchain/community/vectorstores/chroma";

// Persistent local storage
const vectorStore = await Chroma.fromDocuments(chunks, embeddings, {
  collectionName: "my_collection",
  url: "http://localhost:8000", // Chroma server URL
  collectionMetadata: { "hnsw:space": "cosine" },
});

// Load existing collection
const existingStore = new Chroma(embeddings, {
  collectionName: "my_collection",
  url: "http://localhost:8000",
});

// Search with metadata filter
const results = await vectorStore.similaritySearch("query", 4, {
  category: "technical",
});

// Delete documents
await vectorStore.delete({ ids: ["doc_id_1", "doc_id_2"] });
```

### Installation

```bash
npm install @langchain/community chromadb
```

---

## 4. FAISS (High Performance Local)

```javascript
import { FaissStore } from "@langchain/community/vectorstores/faiss";

// Create from documents
const vectorStore = await FaissStore.fromDocuments(chunks, embeddings);

// Save to disk
await vectorStore.save("./faiss_index");

// Load from disk
const loadedStore = await FaissStore.load("./faiss_index", embeddings);

// Merge two FAISS stores
const store1 = await FaissStore.fromDocuments(chunks1, embeddings);
const store2 = await FaissStore.fromDocuments(chunks2, embeddings);
await store1.mergeFrom(store2);

// Search with scores
const resultsWithScores = await vectorStore.similaritySearchWithScore("query", 4);
for (const [doc, score] of resultsWithScores) {
  console.log(`Score: ${score.toFixed(4)} — ${doc.pageContent.slice(0, 80)}`);
}
```

### Installation

```bash
npm install faiss-node
```

---

## 5. Pinecone (Managed Cloud)

```javascript
import { PineconeStore } from "@langchain/pinecone";
import { Pinecone } from "@pinecone-database/pinecone";

// Initialize Pinecone client
const pinecone = new Pinecone({ apiKey: process.env.PINECONE_API_KEY });
const index = pinecone.Index("my-index");

// Create vector store from documents
const vectorStore = await PineconeStore.fromDocuments(chunks, embeddings, {
  pineconeIndex: index,
  namespace: "my-namespace", // Optional logical partition
});

// Load existing
const existingStore = await PineconeStore.fromExistingIndex(embeddings, {
  pineconeIndex: index,
  namespace: "my-namespace",
});

// Search with metadata filter
const results = await vectorStore.similaritySearch("query", 4, {
  category: { $eq: "technical" },
});

// Delete by IDs
await vectorStore.delete({ ids: ["id_1", "id_2"] });
```

### Installation

```bash
npm install @langchain/pinecone @pinecone-database/pinecone
```

---

## 6. PGVector (PostgreSQL)

```javascript
import { PGVectorStore } from "@langchain/community/vectorstores/pgvector";

const config = {
  postgresConnectionOptions: {
    host: "localhost",
    port: 5432,
    user: "myuser",
    password: "mypassword",
    database: "mydb",
  },
  tableName: "documents",
  columns: {
    idColumnName: "id",
    vectorColumnName: "vector",
    contentColumnName: "content",
    metadataColumnName: "metadata",
  },
};

// Create table and vector store
const vectorStore = await PGVectorStore.initialize(embeddings, config);
await vectorStore.addDocuments(chunks);

// Or create from documents
const vectorStore2 = await PGVectorStore.fromDocuments(chunks, embeddings, config);

// Metadata filtering
const results = await vectorStore.similaritySearch("query", 4, {
  category: { $eq: "technical" },
});
```

### Installation

```bash
npm install @langchain/community pg
# Ensure pgvector extension is installed in PostgreSQL:
# CREATE EXTENSION IF NOT EXISTS vector;
```

---

## 7. Weaviate (Hybrid Search)

```javascript
import { WeaviateStore } from "@langchain/weaviate";
import weaviate from "weaviate-client";

const client = await weaviate.connectToLocal();

const vectorStore = await WeaviateStore.fromDocuments(chunks, embeddings, {
  client,
  indexName: "Documents",
  textKey: "text",
});

// Hybrid search (vector + keyword BM25)
const results = await vectorStore.similaritySearch("query", 4);

await client.close();
```

### Installation

```bash
npm install @langchain/weaviate weaviate-client
```

---

## 8. Qdrant

```javascript
import { QdrantVectorStore } from "@langchain/qdrant";

const vectorStore = await QdrantVectorStore.fromDocuments(chunks, embeddings, {
  url: "http://localhost:6333",
  collectionName: "my_documents",
});

// Search with filter
const results = await vectorStore.similaritySearch("query", 4, {
  must: [{ key: "metadata.category", match: { value: "technical" } }],
});
```

### Installation

```bash
npm install @langchain/qdrant @qdrant/js-client-rest
```

---

## 9. Common Operations Across All Stores

### Adding Documents

```javascript
// Add documents after creation
await vectorStore.addDocuments(newDocuments);
```

### Similarity Search Variants

```javascript
// Basic search
const results = await vectorStore.similaritySearch("query", 4);

// Search with scores
const resultsWithScores = await vectorStore.similaritySearchWithScore("query", 4);
for (const [doc, score] of resultsWithScores) {
  console.log(`Score: ${score} — ${doc.pageContent.slice(0, 80)}`);
}

// Maximum Marginal Relevance (diverse results)
const mmrResults = await vectorStore.maxMarginalRelevanceSearch("query", {
  k: 4,
  fetchK: 20, // Fetch 20 candidates, pick 4 diverse ones
  lambda: 0.5, // 0 = max diversity, 1 = max relevance
});
```

### Converting to Retriever

```javascript
// Simple retriever
const retriever = vectorStore.asRetriever({ k: 4 });
const docs = await retriever.invoke("query");

// Retriever with MMR search type
const mmrRetriever = vectorStore.asRetriever({
  searchType: "mmr",
  k: 4,
  fetchK: 20,
});

// Retriever with score threshold
const thresholdRetriever = vectorStore.asRetriever({
  searchType: "similarity",
  k: 10,
  filter: undefined,
  scoreThreshold: 0.7,
});
```

---

## 10. Batch Operations

```javascript
// Batch insert with progress tracking
const BATCH_SIZE = 500;

for (let i = 0; i < chunks.length; i += BATCH_SIZE) {
  const batch = chunks.slice(i, i + BATCH_SIZE);
  await vectorStore.addDocuments(batch);
  console.log(`Inserted ${Math.min(i + BATCH_SIZE, chunks.length)}/${chunks.length}`);
}
```

---

## 11. Metadata Filtering Patterns

Most stores support common filter operators:

```javascript
// Exact match
const filter = { category: "technical" };

// Comparison (Pinecone, PGVector, Qdrant)
const filter2 = { price: { $gt: 100 } };
const filter3 = { status: { $in: ["active", "pending"] } };

// Compound filters
const filter4 = {
  $and: [{ category: { $eq: "technical" } }, { date: { $gte: "2024-01-01" } }],
};

const results = await vectorStore.similaritySearch("query", 4, filter);
```

---

## Anti-Patterns

| Anti-Pattern                                        | Correct Approach                                            |
| --------------------------------------------------- | ----------------------------------------------------------- |
| Using `MemoryVectorStore` in production             | Use persistent stores (Chroma, Pinecone, PGVector)          |
| Not matching embedding dimensions to index          | Verify dimension matches (1536 for ada-002, 3072 for large) |
| Inserting all documents in one call                 | Batch insert to manage memory and API rate limits           |
| Ignoring metadata during insertion                  | Attach metadata for filtering, attribution, and debugging   |
| Recreating the index on every application start     | Load existing index/collection; create only on first setup  |
| Using similarity search when results are repetitive | Use MMR for diversity in results                            |
| No score threshold for quality control              | Filter by score threshold to avoid irrelevant results       |
| Mixing embedding models in the same collection      | Use one consistent embedding model per collection           |
