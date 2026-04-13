---
name: langchain-vector-stores
description: "LangChain vector store integrations — InMemoryVectorStore, Chroma, FAISS, Pinecone, PGVector, Weaviate, Qdrant, Milvus. Covers creation, persistence, metadata filtering, batch operations, index management, and production deployment. Use when: choosing a vector store; setting up persistent storage; filtering by metadata; deploying vector search to production; migrating between stores. DO NOT USE FOR: loading documents (use langchain-document-parsers); splitting text (use langchain-chunking-strategies); building retrieval chains (use langchain-retrieval)."
---

# Vector Store Integrations

## Overview

Vector stores hold embeddings and support similarity search. Choose based on deployment needs: in-memory for prototyping, local persistent for development, and managed cloud services for production.

---

## 1. Vector Store Selection Guide

| Store                 | Type              | Persistence | Best For                          | Scaling             |
| --------------------- | ----------------- | ----------- | --------------------------------- | ------------------- |
| `InMemoryVectorStore` | In-memory         | No          | Prototyping, testing              | Small datasets      |
| `Chroma`              | Local/Server      | Yes         | Development, small-medium apps    | Medium              |
| `FAISS`               | Local             | Yes (file)  | Fast local search, large datasets | Large (single node) |
| `Pinecone`            | Managed cloud     | Yes         | Production, serverless            | Very large          |
| `PGVector`            | PostgreSQL ext.   | Yes         | Existing Postgres infrastructure  | Large               |
| `Weaviate`            | Self-hosted/Cloud | Yes         | Hybrid search (vector + keyword)  | Very large          |
| `Qdrant`              | Self-hosted/Cloud | Yes         | High performance, filtering       | Very large          |
| `Milvus`              | Self-hosted/Cloud | Yes         | ML pipelines, very large scale    | Very large          |

---

## 2. InMemoryVectorStore (Prototyping)

```python
from langchain_core.vectorstores import InMemoryVectorStore
from langchain_openai import AzureOpenAIEmbeddings

embeddings = AzureOpenAIEmbeddings(
    azure_endpoint=os.getenv("AZURE_OPENAI_ENDPOINT"),
    api_key=os.getenv("AZURE_OPENAI_API_KEY"),
    model="text-embedding-ada-002",
    api_version="2024-02-01",
)

# Create from documents
vector_store = InMemoryVectorStore.from_documents(chunks, embeddings)

# Search
results = vector_store.similarity_search("query", k=4)

# Add more documents later
vector_store.add_documents(new_chunks)
```

---

## 3. Chroma (Local Persistent)

```python
from langchain_chroma import Chroma

# Persistent local storage
vector_store = Chroma.from_documents(
    documents=chunks,
    embedding=embeddings,
    collection_name="my_collection",
    persist_directory="./chroma_db",
)

# Load existing collection
vector_store = Chroma(
    collection_name="my_collection",
    embedding_function=embeddings,
    persist_directory="./chroma_db",
)

# Search with metadata filter
results = vector_store.similarity_search(
    "query",
    k=4,
    filter={"category": "technical"},
)

# Delete documents
vector_store.delete(ids=["doc_id_1", "doc_id_2"])
```

### Chroma Server Mode

```python
# Connect to a remote Chroma server
import chromadb

client = chromadb.HttpClient(host="localhost", port=8000)

vector_store = Chroma(
    client=client,
    collection_name="my_collection",
    embedding_function=embeddings,
)
```

### Installation

```bash
pip install langchain-chroma
```

---

## 4. FAISS (High Performance Local)

```python
from langchain_community.vectorstores import FAISS

# Create from documents
vector_store = FAISS.from_documents(chunks, embeddings)

# Save to disk
vector_store.save_local("./faiss_index")

# Load from disk
vector_store = FAISS.load_local(
    "./faiss_index",
    embeddings,
    allow_dangerous_deserialization=True,
)

# Merge two FAISS stores
vector_store_1 = FAISS.from_documents(chunks_1, embeddings)
vector_store_2 = FAISS.from_documents(chunks_2, embeddings)
vector_store_1.merge_from(vector_store_2)

# Search with scores
results = vector_store.similarity_search_with_score("query", k=4)
for doc, score in results:
    print(f"Score: {score:.4f} — {doc.page_content[:80]}")
```

### Installation

```bash
pip install faiss-cpu
# or for GPU acceleration:
pip install faiss-gpu
```

---

## 5. Pinecone (Managed Cloud)

```python
from langchain_pinecone import PineconeVectorStore
from pinecone import Pinecone, ServerlessSpec

# Initialize Pinecone client
pc = Pinecone(api_key=os.getenv("PINECONE_API_KEY"))

# Create index (one-time setup)
if "my-index" not in pc.list_indexes().names():
    pc.create_index(
        name="my-index",
        dimension=1536,   # Must match embedding dimension
        metric="cosine",
        spec=ServerlessSpec(cloud="aws", region="us-east-1"),
    )

index = pc.Index("my-index")

# Create vector store
vector_store = PineconeVectorStore.from_documents(
    documents=chunks,
    embedding=embeddings,
    index_name="my-index",
    namespace="my-namespace",  # Optional logical partition
)

# Load existing
vector_store = PineconeVectorStore(
    index=index,
    embedding=embeddings,
    namespace="my-namespace",
)

# Search with metadata filter
results = vector_store.similarity_search(
    "query",
    k=4,
    filter={"category": {"$eq": "technical"}},
)
```

### Installation

```bash
pip install langchain-pinecone pinecone
```

---

## 6. PGVector (PostgreSQL)

```python
from langchain_postgres import PGVector

CONNECTION_STRING = "postgresql+psycopg://user:password@localhost:5432/mydb"

# Create vector store
vector_store = PGVector.from_documents(
    documents=chunks,
    embedding=embeddings,
    collection_name="my_documents",
    connection=CONNECTION_STRING,
    pre_delete_collection=False,  # Set True to reset
)

# Load existing
vector_store = PGVector(
    embeddings=embeddings,
    collection_name="my_documents",
    connection=CONNECTION_STRING,
)

# Metadata filtering with SQL-like operators
results = vector_store.similarity_search(
    "query",
    k=4,
    filter={"category": {"$eq": "technical"}},
)
```

### Installation

```bash
pip install langchain-postgres psycopg[binary]
# Ensure pgvector extension is installed in PostgreSQL:
# CREATE EXTENSION IF NOT EXISTS vector;
```

---

## 7. Weaviate (Hybrid Search)

```python
from langchain_weaviate import WeaviateVectorStore
import weaviate

# Connect to Weaviate
client = weaviate.connect_to_local()  # or connect_to_weaviate_cloud()

# Create vector store
vector_store = WeaviateVectorStore.from_documents(
    documents=chunks,
    embedding=embeddings,
    client=client,
    index_name="Documents",
)

# Hybrid search (vector + keyword BM25)
results = vector_store.similarity_search(
    "query",
    k=4,
    alpha=0.5,  # 0 = pure keyword, 1 = pure vector
)

client.close()
```

### Installation

```bash
pip install langchain-weaviate weaviate-client
```

---

## 8. Qdrant

```python
from langchain_qdrant import QdrantVectorStore
from qdrant_client import QdrantClient

# Local in-memory
client = QdrantClient(":memory:")

# Or connect to server
client = QdrantClient(url="http://localhost:6333")

vector_store = QdrantVectorStore.from_documents(
    documents=chunks,
    embedding=embeddings,
    collection_name="my_documents",
    url="http://localhost:6333",
)

# Advanced filtering
from qdrant_client.models import Filter, FieldCondition, MatchValue

results = vector_store.similarity_search(
    "query",
    k=4,
    filter=Filter(
        must=[FieldCondition(key="metadata.category", match=MatchValue(value="technical"))]
    ),
)
```

### Installation

```bash
pip install langchain-qdrant qdrant-client
```

---

## 9. Common Operations Across All Stores

### Adding Documents

```python
# Add documents after creation
vector_store.add_documents(new_documents)

# Add with explicit IDs
vector_store.add_documents(new_documents, ids=["id_1", "id_2", "id_3"])
```

### Similarity Search Variants

```python
# Basic search
results = vector_store.similarity_search("query", k=4)

# Search with scores
results = vector_store.similarity_search_with_score("query", k=4)

# Search with relevance scores (normalized 0-1)
results = vector_store.similarity_search_with_relevance_scores("query", k=4)

# Maximum Marginal Relevance (diverse results)
results = vector_store.max_marginal_relevance_search(
    "query",
    k=4,
    fetch_k=20,   # Fetch 20 candidates, pick 4 diverse ones
    lambda_mult=0.5,  # 0 = max diversity, 1 = max relevance
)
```

### Converting to Retriever

```python
# Simple retriever
retriever = vector_store.as_retriever(search_kwargs={"k": 4})
docs = retriever.invoke("query")

# Retriever with search type
retriever = vector_store.as_retriever(
    search_type="mmr",
    search_kwargs={"k": 4, "fetch_k": 20},
)

# Retriever with score threshold
retriever = vector_store.as_retriever(
    search_type="similarity_score_threshold",
    search_kwargs={"score_threshold": 0.7, "k": 10},
)
```

---

## 10. Batch Operations

```python
# Batch insert with progress tracking
BATCH_SIZE = 500

for i in range(0, len(chunks), BATCH_SIZE):
    batch = chunks[i:i + BATCH_SIZE]
    vector_store.add_documents(batch)
    print(f"Inserted {min(i + BATCH_SIZE, len(chunks))}/{len(chunks)}")
```

---

## 11. Metadata Filtering Patterns

Metadata filtering varies by store but most support common operators:

```python
# Exact match
filter = {"category": "technical"}

# Comparison operators (Pinecone, PGVector, Qdrant)
filter = {"price": {"$gt": 100}}
filter = {"status": {"$in": ["active", "pending"]}}

# Compound filters
filter = {
    "$and": [
        {"category": {"$eq": "technical"}},
        {"date": {"$gte": "2024-01-01"}},
    ]
}

results = vector_store.similarity_search("query", k=4, filter=filter)
```

---

## Anti-Patterns

| Anti-Pattern                                        | Correct Approach                                            |
| --------------------------------------------------- | ----------------------------------------------------------- |
| Using `InMemoryVectorStore` in production           | Use persistent stores (Chroma, Pinecone, PGVector)          |
| Not matching embedding dimensions to index          | Verify dimension matches (1536 for ada-002, 3072 for large) |
| Inserting all documents in one call                 | Batch insert to manage memory and API rate limits           |
| Ignoring metadata during insertion                  | Attach metadata for filtering, attribution, and debugging   |
| Recreating the index on every application start     | Load existing index/collection; create only on first setup  |
| Using similarity search when results are repetitive | Use MMR for diversity in results                            |
| No score threshold for quality control              | Filter by score threshold to avoid irrelevant results       |
| Mixing embedding models in the same collection      | Use one consistent embedding model per collection           |
