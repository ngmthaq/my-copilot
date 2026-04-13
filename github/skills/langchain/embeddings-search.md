---
name: langchain-embeddings-search
description: "LangChain document processing, embeddings, and semantic search — TextLoader, RecursiveCharacterTextSplitter, chunk overlap, Document metadata, AzureOpenAIEmbeddings, InMemoryVectorStore, similarity_search, cosine similarity, batch processing. Use when: loading documents from files; splitting text into chunks; creating embeddings; storing in vector databases; performing semantic search; building the foundation for RAG. DO NOT USE FOR: building RAG agents (use langchain-agentic-rag); prompt templates (use langchain-prompts-templates); MCP tool integration (use langchain-mcp)."
---

# Documents, Embeddings & Semantic Search

## Overview

This skill covers the complete document processing pipeline: loading documents from various sources, splitting them into chunks, creating vector embeddings, storing them in vector databases, and performing semantic similarity search.

---

## 1. Document Loaders

### TextLoader

```python
from langchain_community.document_loaders import TextLoader

loader = TextLoader("./data/sample.txt")
docs = loader.load()

print(docs[0].page_content)  # The text content
print(docs[0].metadata)       # {'source': './data/sample.txt'}
```

### Document Object

Every loaded document has two properties:

| Property       | Type   | Description                               |
| -------------- | ------ | ----------------------------------------- |
| `page_content` | `str`  | The actual text content                   |
| `metadata`     | `dict` | Source info, category, date, author, etc. |

---

## 2. Text Splitting

### RecursiveCharacterTextSplitter

```python
from langchain_text_splitters import RecursiveCharacterTextSplitter

splitter = RecursiveCharacterTextSplitter(
    chunk_size=500,      # Target size in characters
    chunk_overlap=100,   # Overlap between chunks (preserves context)
)

chunks = splitter.create_documents([long_text])
print(f"Split into {len(chunks)} chunks")
```

### Splitting Loaded Documents

```python
loader = TextLoader("./data/sample.txt")
docs = loader.load()
chunks = splitter.split_documents(docs)
# Metadata is preserved in each chunk
```

### Chunk Size Trade-offs

| Small Chunks (200-300)       | Large Chunks (1000+)      |
| ---------------------------- | ------------------------- |
| More precise retrieval       | More context per chunk    |
| Better for specific Q&A      | Better for complex topics |
| May lose surrounding context | Less precise matching     |
| More chunks to store/search  | Fewer chunks              |

### Chunk Overlap

Without overlap, sentences split at boundaries lose context. Start with **20% of chunk size** (e.g., 100 chars for 500-char chunks).

---

## 3. Document Metadata

```python
from langchain_core.documents import Document

doc = Document(
    page_content="LangChain is a framework...",
    metadata={
        "source": "langchain-guide.md",
        "category": "tutorial",
        "date": "2024-01-15",
        "author": "Tech Team",
    },
)

# Metadata is preserved when splitting
chunks = splitter.split_documents([doc])
print(chunks[0].metadata)  # Original metadata retained
```

---

## 4. Embeddings

Embeddings convert text into numerical vectors that capture semantic meaning.

### Creating Embeddings with Azure OpenAI

```python
import os
from dotenv import load_dotenv
from langchain_openai import AzureOpenAIEmbeddings

load_dotenv()

def get_embeddings_endpoint():
    """Remove /openai/v1 suffix if present."""
    endpoint = os.getenv("AI_ENDPOINT", "")
    if endpoint.endswith("/openai/v1"):
        endpoint = endpoint.replace("/openai/v1", "")
    return endpoint

embeddings = AzureOpenAIEmbeddings(
    azure_endpoint=get_embeddings_endpoint(),
    api_key=os.getenv("AI_API_KEY"),
    model=os.getenv("AI_EMBEDDING_MODEL", "text-embedding-ada-002"),
    api_version="2024-02-01",
)
```

### Single vs Batch Embedding

```python
# Single query embedding
query_embedding = embeddings.embed_query("What is LangChain?")

# Batch embedding (preferred — faster and cheaper)
texts = ["Text 1", "Text 2", "Text 3"]
batch_embeddings = embeddings.embed_documents(texts)

print(f"Dimensions: {len(query_embedding)}")  # e.g., 1536
```

### Cosine Similarity

```python
import math

def cosine_similarity(a: list[float], b: list[float]) -> float:
    dot_product = sum(x * y for x, y in zip(a, b))
    mag_a = math.sqrt(sum(x * x for x in a))
    mag_b = math.sqrt(sum(x * x for x in b))
    return dot_product / (mag_a * mag_b)

# Similar meanings → score > 0.8
# Different topics  → score < 0.5
```

---

## 5. Vector Stores

### InMemoryVectorStore

```python
from langchain_core.documents import Document
from langchain_core.vectorstores import InMemoryVectorStore

docs = [
    Document(page_content="LangChain is a framework for building AI applications"),
    Document(page_content="Python is a popular programming language"),
    Document(page_content="Agents can use tools to solve complex problems"),
    Document(page_content="Vector databases store embeddings for fast similarity search"),
]

# Create vector store from documents
vector_store = InMemoryVectorStore.from_documents(docs, embeddings)
```

### Similarity Search

```python
# Basic search — returns top k documents
results = vector_store.similarity_search("How do I build AI apps?", k=2)
for doc in results:
    print(doc.page_content)

# Search with scores
results_with_scores = vector_store.similarity_search_with_score("AI apps", k=4)
for doc, score in results_with_scores:
    print(f"Score: {score:.4f} — {doc.page_content}")
```

### Understanding Scores

| Score Range | Meaning          |
| ----------- | ---------------- |
| > 0.8       | Very similar     |
| 0.5 – 0.8   | Somewhat related |
| < 0.5       | Different topics |

---

## 6. Complete Pipeline

```python
from langchain_community.document_loaders import TextLoader
from langchain_text_splitters import RecursiveCharacterTextSplitter
from langchain_core.vectorstores import InMemoryVectorStore

# 1. Load
loader = TextLoader("./data/knowledge_base.txt")
docs = loader.load()

# 2. Split
splitter = RecursiveCharacterTextSplitter(chunk_size=500, chunk_overlap=100)
chunks = splitter.split_documents(docs)

# 3. Embed & Store
vector_store = InMemoryVectorStore.from_documents(chunks, embeddings)

# 4. Search
results = vector_store.similarity_search("How do agents work?", k=3)
```

---

## 7. Anti-Patterns

| Anti-Pattern                                      | Correct Approach                                            |
| ------------------------------------------------- | ----------------------------------------------------------- |
| Embedding texts one at a time in a loop           | Use `embed_documents()` for batch processing                |
| Using very small chunks (< 100 chars)             | Start with 500 chars, adjust based on results               |
| Zero chunk overlap                                | Use 20% overlap to preserve context at boundaries           |
| Ignoring metadata on documents                    | Attach source, category, date for filtering and attribution |
| Using keyword matching instead of semantic search | Use vector similarity — finds meaning, not just exact words |
| Creating a new embeddings model instance per call | Reuse a single instance across your application             |
