---
name: langchain-chunking-strategies
description: "LangChain text splitting & chunking strategies — RecursiveCharacterTextSplitter, TokenTextSplitter, MarkdownHeaderTextSplitter, HTMLSectionSplitter, SemanticChunker, CodeTextSplitter, chunk size tuning, overlap optimization, metadata preservation. Use when: splitting documents into chunks; choosing chunking strategy; optimizing chunk sizes; preserving document structure during splitting; semantic chunking. DO NOT USE FOR: loading documents (use langchain-document-parsers); storing chunks in vector databases (use langchain-vector-stores); retrieval chains (use langchain-retrieval)."
---

# Text Splitting & Chunking Strategies

## Overview

Chunking breaks large documents into smaller pieces for embedding and retrieval. The strategy and parameters directly impact retrieval quality — too large and chunks lose precision, too small and chunks lose context.

---

## 1. RecursiveCharacterTextSplitter (Default)

The most versatile splitter. Recursively tries splitting by `\n\n`, `\n`, ` `, then individual characters.

```python
from langchain_text_splitters import RecursiveCharacterTextSplitter

splitter = RecursiveCharacterTextSplitter(
    chunk_size=1000,      # Target characters per chunk
    chunk_overlap=200,    # Characters shared between consecutive chunks
    length_function=len,  # How to measure chunk size
    separators=["\n\n", "\n", " ", ""],  # Default separator hierarchy
)

# Split raw text
chunks = splitter.create_documents(
    texts=["Your long text here..."],
    metadatas=[{"source": "article.txt"}],  # Optional metadata
)

# Split loaded documents (preserves metadata)
chunks = splitter.split_documents(docs)
```

---

## 2. TokenTextSplitter

Splits by token count instead of character count. Better alignment with LLM token limits.

```python
from langchain_text_splitters import TokenTextSplitter

splitter = TokenTextSplitter(
    chunk_size=500,       # Tokens per chunk
    chunk_overlap=50,     # Token overlap
    encoding_name="cl100k_base",  # Tokenizer (GPT-4 / GPT-3.5)
)

chunks = splitter.split_documents(docs)
```

### When to Use Token Splitting

- When you need precise control over token counts
- When chunks will be passed directly to LLMs with strict token limits
- When character count doesn't accurately represent token usage (e.g., CJK text)

### Installation

```bash
pip install tiktoken
```

---

## 3. MarkdownHeaderTextSplitter

Splits Markdown by headers, preserving document structure as metadata.

```python
from langchain_text_splitters import MarkdownHeaderTextSplitter

headers_to_split_on = [
    ("#", "header_1"),
    ("##", "header_2"),
    ("###", "header_3"),
]

splitter = MarkdownHeaderTextSplitter(
    headers_to_split_on=headers_to_split_on,
    strip_headers=False,  # Keep headers in content
)

markdown_text = """
# Introduction
This is the intro section.

## Getting Started
Follow these steps to begin.

### Prerequisites
You need Python 3.10+.

## API Reference
The API uses REST conventions.
"""

chunks = splitter.split_text(markdown_text)
# chunks[0].metadata → {"header_1": "Introduction"}
# chunks[1].metadata → {"header_1": "Introduction", "header_2": "Getting Started"}
# chunks[2].metadata → {"header_1": "Introduction", "header_2": "Getting Started", "header_3": "Prerequisites"}
```

### Two-Stage Splitting (Markdown + Character)

```python
# Stage 1: Split by headers
md_splitter = MarkdownHeaderTextSplitter(headers_to_split_on=headers_to_split_on)
md_chunks = md_splitter.split_text(markdown_text)

# Stage 2: Further split large sections
char_splitter = RecursiveCharacterTextSplitter(chunk_size=500, chunk_overlap=100)
final_chunks = char_splitter.split_documents(md_chunks)
# Header metadata is preserved through both stages
```

---

## 4. HTMLSectionSplitter

Splits HTML by structural elements (headers, sections).

```python
from langchain_text_splitters import HTMLSectionSplitter

headers_to_split_on = [
    ("h1", "header_1"),
    ("h2", "header_2"),
    ("h3", "header_3"),
]

splitter = HTMLSectionSplitter(headers_to_split_on=headers_to_split_on)

html_text = """
<h1>Main Title</h1>
<p>Introduction paragraph.</p>
<h2>Section One</h2>
<p>Details about section one.</p>
<h2>Section Two</h2>
<p>Details about section two.</p>
"""

chunks = splitter.split_text(html_text)
# Preserves section hierarchy in metadata
```

### Installation

```bash
pip install lxml
```

---

## 5. Code Splitting

Split code files respecting language syntax boundaries (functions, classes, etc.).

```python
from langchain_text_splitters import (
    Language,
    RecursiveCharacterTextSplitter,
)

# Python code splitter
python_splitter = RecursiveCharacterTextSplitter.from_language(
    language=Language.PYTHON,
    chunk_size=1000,
    chunk_overlap=100,
)

python_code = """
class Calculator:
    def add(self, a, b):
        return a + b

    def multiply(self, a, b):
        return a * b

def main():
    calc = Calculator()
    result = calc.add(1, 2)
    print(result)
"""

chunks = python_splitter.create_documents([python_code])
```

### Supported Languages

```python
# Common languages
Language.PYTHON
Language.JAVASCRIPT
Language.TYPESCRIPT
Language.JAVA
Language.GO
Language.RUST
Language.CPP
Language.C
Language.RUBY
Language.SCALA
Language.SWIFT
Language.MARKDOWN
Language.LATEX
Language.HTML
Language.SOL   # Solidity
```

---

## 6. SemanticChunker

Splits text based on semantic similarity between sentences — groups semantically related content together.

```python
from langchain_experimental.text_splitter import SemanticChunker
from langchain_openai import OpenAIEmbeddings

embeddings = OpenAIEmbeddings()

# Percentile-based breakpoint (default)
splitter = SemanticChunker(
    embeddings,
    breakpoint_threshold_type="percentile",
    breakpoint_threshold_amount=95,  # Split at top 5% dissimilarity
)

chunks = splitter.create_documents([long_text])
```

### Breakpoint Strategies

| Strategy             | Parameter                         | Description                                       |
| -------------------- | --------------------------------- | ------------------------------------------------- |
| `percentile`         | `breakpoint_threshold_amount=95`  | Split where dissimilarity exceeds 95th percentile |
| `standard_deviation` | `breakpoint_threshold_amount=3`   | Split at 3 standard deviations above mean         |
| `interquartile`      | `breakpoint_threshold_amount=1.5` | Split at 1.5× IQR above Q3                        |
| `gradient`           | `breakpoint_threshold_amount=95`  | Split at steepest changes in similarity           |

### When to Use Semantic Chunking

- Documents with topics that don't follow structural boundaries
- When you need chunks that represent complete ideas
- Trade-off: slower (requires embeddings per sentence) but higher retrieval quality

### Installation

```bash
pip install langchain-experimental
```

---

## 7. Chunk Size Tuning Guide

### General Recommendations

| Use Case               | Chunk Size | Overlap | Splitter                             |
| ---------------------- | ---------- | ------- | ------------------------------------ |
| Q&A over documentation | 500–1000   | 100–200 | `RecursiveCharacterTextSplitter`     |
| Code search            | 1000–1500  | 100–200 | `from_language()`                    |
| Legal / regulatory     | 1000–1500  | 200–300 | `RecursiveCharacterTextSplitter`     |
| Chat / conversational  | 300–500    | 50–100  | `RecursiveCharacterTextSplitter`     |
| Markdown docs          | 500–1000   | 100–200 | `MarkdownHeaderTextSplitter` + split |
| Semantic grouping      | auto       | N/A     | `SemanticChunker`                    |

### Overlap Rule of Thumb

Use **10–20%** of chunk size as overlap:

| Chunk Size | Recommended Overlap |
| ---------- | ------------------- |
| 300        | 30–60               |
| 500        | 50–100              |
| 1000       | 100–200             |
| 1500       | 150–300             |

---

## 8. Preserving Metadata Through Splitting

```python
from langchain_core.documents import Document

# Original document with rich metadata
doc = Document(
    page_content="Very long document content...",
    metadata={
        "source": "handbook.pdf",
        "page": 5,
        "department": "engineering",
        "version": "2.1",
    },
)

# All splitters preserve metadata on chunks
splitter = RecursiveCharacterTextSplitter(chunk_size=500, chunk_overlap=100)
chunks = splitter.split_documents([doc])

# Each chunk retains the original metadata
for chunk in chunks:
    print(chunk.metadata)
    # → {"source": "handbook.pdf", "page": 5, "department": "engineering", "version": "2.1"}
```

### Adding Chunk-Specific Metadata

```python
for i, chunk in enumerate(chunks):
    chunk.metadata["chunk_index"] = i
    chunk.metadata["chunk_total"] = len(chunks)
```

---

## 9. Evaluating Chunk Quality

```python
def analyze_chunks(chunks: list) -> dict:
    """Analyze chunk distribution to tune parameters."""
    sizes = [len(c.page_content) for c in chunks]
    return {
        "total_chunks": len(chunks),
        "avg_size": sum(sizes) / len(sizes),
        "min_size": min(sizes),
        "max_size": max(sizes),
        "tiny_chunks": sum(1 for s in sizes if s < 100),
        "large_chunks": sum(1 for s in sizes if s > 1500),
    }

stats = analyze_chunks(chunks)
print(stats)
# If too many tiny chunks → increase chunk_size or overlap
# If too many large chunks → decrease chunk_size
```

---

## Anti-Patterns

| Anti-Pattern                                | Correct Approach                                               |
| ------------------------------------------- | -------------------------------------------------------------- |
| Same chunk size for all document types      | Tune chunk size per use case (see tuning guide)                |
| Zero overlap between chunks                 | Use 10–20% overlap to preserve boundary context                |
| Using character splitter for code           | Use `from_language()` to respect syntax boundaries             |
| Splitting Markdown without header awareness | Use `MarkdownHeaderTextSplitter` to keep structure as metadata |
| Very tiny chunks (< 100 chars)              | Minimum 200–300 chars for meaningful retrieval                 |
| Very large chunks (> 2000 chars)            | Chunks lose precision; break into 500–1000 range               |
| Not analyzing chunk distribution            | Use `analyze_chunks()` to validate parameters                  |
| Semantic chunking on short documents        | Semantic chunking shines on 5000+ char documents               |
