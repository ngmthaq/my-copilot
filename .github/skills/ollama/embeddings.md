---
name: ollama-embeddings
description: "Ollama embedding models — nomic-embed-text, mxbai-embed-large, all-minilm, snowflake-arctic-embed; generating embeddings via API and Python; vector similarity search; cosine similarity; document chunking strategies; building RAG document pipelines; choosing embedding dimensions. Use when: selecting an embedding model; generating text embeddings for search or RAG; computing similarity between texts; building a vector search pipeline. DO NOT USE FOR: LangChain vector stores (use ollama-langchain-integration); general model management (use ollama-model-management); chat completions (use ollama-rest-api or ollama-python-integration)."
---

# Embeddings

## Overview

Ollama supports dedicated embedding models for converting text into dense vector representations used in semantic search and RAG pipelines.

---

## 1. Available Embedding Models

| Model                    | Dimensions | Size   | Strengths                            |
| ------------------------ | ---------- | ------ | ------------------------------------ |
| `nomic-embed-text`       | 768        | 274 MB | Best general-purpose, fast           |
| `mxbai-embed-large`      | 1024       | 670 MB | Higher quality, larger context       |
| `all-minilm`             | 384        | 45 MB  | Fastest, smallest, lightweight tasks |
| `snowflake-arctic-embed` | 1024       | 670 MB | Strong retrieval benchmarks          |
| `bge-large`              | 1024       | 670 MB | Good for English retrieval           |
| `bge-m3`                 | 1024       | 1.2 GB | Multilingual, multi-granularity      |

### Quick Selection

```
Need embeddings?
│
├── Fastest / smallest?        → all-minilm (384d, 45MB)
├── Best balance?              → nomic-embed-text (768d, 274MB)
├── Highest quality?           → mxbai-embed-large (1024d, 670MB)
└── Multilingual?              → bge-m3 (1024d, 1.2GB)
```

---

## 2. Pull an Embedding Model

```bash
ollama pull nomic-embed-text
ollama pull mxbai-embed-large
ollama pull all-minilm
```

---

## 3. Generate Embeddings

### REST API

```bash
# Single text
curl http://localhost:11434/api/embed -d '{
  "model": "nomic-embed-text",
  "input": "Ollama runs LLMs locally"
}'

# Batch
curl http://localhost:11434/api/embed -d '{
  "model": "nomic-embed-text",
  "input": [
    "First document",
    "Second document",
    "Third document"
  ]
}'
```

### Python

```python
import ollama

# Single text
response = ollama.embed(
    model="nomic-embed-text",
    input="Ollama runs LLMs locally",
)
vector = response["embeddings"][0]
print(f"Dimensions: {len(vector)}")

# Batch
response = ollama.embed(
    model="nomic-embed-text",
    input=[
        "First document about AI",
        "Second document about databases",
        "Third document about web development",
    ],
)
print(f"Embedded {len(response['embeddings'])} documents")
```

---

## 4. Cosine Similarity

```python
import ollama
import numpy as np

def cosine_similarity(a: list[float], b: list[float]) -> float:
    a, b = np.array(a), np.array(b)
    return float(np.dot(a, b) / (np.linalg.norm(a) * np.linalg.norm(b)))

# Embed texts
texts = [
    "Python is a programming language",
    "JavaScript is used for web development",
    "A cat sat on the mat",
]
query = "What programming languages exist?"

response = ollama.embed(model="nomic-embed-text", input=[query] + texts)
query_emb = response["embeddings"][0]
doc_embs = response["embeddings"][1:]

# Rank by similarity
similarities = [
    (text, cosine_similarity(query_emb, emb))
    for text, emb in zip(texts, doc_embs)
]
similarities.sort(key=lambda x: x[1], reverse=True)

for text, score in similarities:
    print(f"{score:.4f}  {text}")
```

---

## 5. Document Chunking Strategies

### Fixed-Size Chunks

```python
def chunk_text(text: str, chunk_size: int = 500, overlap: int = 50) -> list[str]:
    chunks = []
    start = 0
    while start < len(text):
        end = start + chunk_size
        chunks.append(text[start:end])
        start = end - overlap
    return chunks

text = "Long document content..."
chunks = chunk_text(text, chunk_size=500, overlap=50)
```

### Sentence-Based Chunks

```python
import re

def chunk_by_sentences(text: str, max_sentences: int = 5) -> list[str]:
    sentences = re.split(r'(?<=[.!?])\s+', text)
    chunks = []
    for i in range(0, len(sentences), max_sentences):
        chunk = " ".join(sentences[i:i + max_sentences])
        chunks.append(chunk)
    return chunks
```

### With LangChain Text Splitters

```python
from langchain_text_splitters import RecursiveCharacterTextSplitter

splitter = RecursiveCharacterTextSplitter(
    chunk_size=500,
    chunk_overlap=50,
    separators=["\n\n", "\n", ". ", " ", ""],
)

chunks = splitter.split_text(long_text)
```

### Chunking Guidelines

| Parameter  | Recommendation                                  |
| ---------- | ----------------------------------------------- |
| Chunk size | 200–1000 characters (500 default)               |
| Overlap    | 10–20% of chunk size                            |
| Strategy   | `RecursiveCharacterTextSplitter` for most cases |
| Separators | Paragraphs → sentences → words                  |

---

## 6. Simple Vector Search Pipeline

```python
import ollama
import numpy as np

class SimpleVectorStore:
    def __init__(self, model: str = "nomic-embed-text"):
        self.model = model
        self.documents: list[str] = []
        self.embeddings: list[list[float]] = []

    def add_documents(self, docs: list[str]) -> None:
        response = ollama.embed(model=self.model, input=docs)
        self.documents.extend(docs)
        self.embeddings.extend(response["embeddings"])

    def search(self, query: str, k: int = 3) -> list[tuple[str, float]]:
        response = ollama.embed(model=self.model, input=query)
        query_emb = np.array(response["embeddings"][0])

        similarities = []
        for doc, emb in zip(self.documents, self.embeddings):
            emb_arr = np.array(emb)
            score = float(
                np.dot(query_emb, emb_arr)
                / (np.linalg.norm(query_emb) * np.linalg.norm(emb_arr))
            )
            similarities.append((doc, score))

        similarities.sort(key=lambda x: x[1], reverse=True)
        return similarities[:k]

# Usage
store = SimpleVectorStore()
store.add_documents([
    "Python is great for data science and machine learning.",
    "JavaScript powers interactive web applications.",
    "Rust provides memory safety without garbage collection.",
    "SQL is the standard language for relational databases.",
])

results = store.search("Which language is best for AI?", k=2)
for doc, score in results:
    print(f"{score:.4f}  {doc}")
```

---

## 7. RAG Pipeline with Embeddings

```python
import ollama

class SimpleRAG:
    def __init__(
        self,
        embed_model: str = "nomic-embed-text",
        chat_model: str = "llama3.2",
    ):
        self.embed_model = embed_model
        self.chat_model = chat_model
        self.store = SimpleVectorStore(embed_model)

    def add_knowledge(self, documents: list[str]) -> None:
        self.store.add_documents(documents)

    def query(self, question: str, k: int = 3) -> str:
        # Retrieve relevant documents
        results = self.store.search(question, k=k)
        context = "\n".join(doc for doc, _ in results)

        # Generate answer
        response = ollama.chat(
            model=self.chat_model,
            messages=[
                {
                    "role": "system",
                    "content": (
                        "Answer based on the context below. "
                        "If the context doesn't contain the answer, say so.\n\n"
                        f"Context:\n{context}"
                    ),
                },
                {"role": "user", "content": question},
            ],
        )
        return response["message"]["content"]

# Usage
rag = SimpleRAG()
rag.add_knowledge([
    "Ollama was first released in 2023.",
    "Ollama supports NVIDIA CUDA, AMD ROCm, and Apple Metal.",
    "Models are stored in ~/.ollama/models by default.",
    "The Ollama API runs on port 11434.",
])

answer = rag.query("What GPUs does Ollama support?")
print(answer)
```

---

## 8. Embedding Best Practices

| Practice                              | Why                                                   |
| ------------------------------------- | ----------------------------------------------------- |
| Use the same model for embed + query  | Different models produce incompatible vectors         |
| Normalize long texts with chunking    | Embeddings lose detail on very long texts             |
| Batch embed when possible             | Reduces API overhead                                  |
| Cache embeddings                      | Avoid re-computing for static documents               |
| Prefix queries with `"search_query:"` | Some models (nomic) use prefixes for better retrieval |

### Nomic Prefix Convention

```python
# nomic-embed-text uses task prefixes for better results
query_text = "search_query: What is Ollama?"
doc_text = "search_document: Ollama runs LLMs locally."
```
