---
name: langchain-document-parsers
description: "LangChain document parsers & loaders — TextLoader, PyPDFLoader, CSVLoader, JSONLoader, UnstructuredHTMLLoader, WebBaseLoader, DirectoryLoader, Docx2txtLoader, BSHTMLLoader, WikipediaLoader, ArxivLoader, multi-format pipelines, custom loaders, metadata enrichment. Use when: loading documents from files (PDF, CSV, JSON, HTML, DOCX, etc.); scraping web pages; loading directories of mixed files; building custom loaders; enriching metadata. DO NOT USE FOR: splitting/chunking text (use langchain-chunking-strategies); embeddings or vector stores (use langchain-vector-stores); retrieval chains (use langchain-retrieval)."
---

# Document Parsers & Loaders

## Overview

Document loaders convert raw data sources (files, URLs, APIs) into LangChain `Document` objects with `page_content` and `metadata`. Each loader handles a specific format and preserves source metadata for attribution and filtering.

---

## 1. Core Document Object

```python
from langchain_core.documents import Document

doc = Document(
    page_content="The actual text content of the document.",
    metadata={
        "source": "report.pdf",
        "page": 0,
        "category": "finance",
        "author": "Jane Doe",
    },
)
```

| Property       | Type   | Description                            |
| -------------- | ------ | -------------------------------------- |
| `page_content` | `str`  | The text content                       |
| `metadata`     | `dict` | Arbitrary key-value pairs for tracking |

---

## 2. Text Files

```python
from langchain_community.document_loaders import TextLoader

loader = TextLoader("./data/readme.txt", encoding="utf-8")
docs = loader.load()
# docs[0].metadata → {"source": "./data/readme.txt"}
```

---

## 3. PDF Files

### PyPDFLoader (page-by-page)

```python
from langchain_community.document_loaders import PyPDFLoader

loader = PyPDFLoader("./data/report.pdf")
pages = loader.load()

# Each page is a separate Document
for page in pages:
    print(f"Page {page.metadata['page']}: {page.page_content[:100]}...")
```

### PyPDFLoader with Single Output

```python
# Load all pages as one document
loader = PyPDFLoader("./data/report.pdf")
pages = loader.load()
full_text = "\n".join([p.page_content for p in pages])

doc = Document(
    page_content=full_text,
    metadata={"source": "./data/report.pdf", "total_pages": len(pages)},
)
```

### Installation

```bash
pip install pypdf
```

---

## 4. CSV Files

```python
from langchain_community.document_loaders import CSVLoader

# Default — each row becomes a Document
loader = CSVLoader("./data/employees.csv")
docs = loader.load()
# docs[0].page_content → "name: John\nemail: john@example.com\nrole: Engineer"

# Specify which column to use as content
loader = CSVLoader(
    "./data/employees.csv",
    csv_args={"delimiter": ","},
    source_column="name",       # column to use as metadata source
    content_columns=["email", "role"],  # columns to include in content
)
```

---

## 5. JSON Files

```python
from langchain_community.document_loaders import JSONLoader

# Load from a JSON file using jq-style schema
loader = JSONLoader(
    file_path="./data/messages.json",
    jq_schema=".messages[]",       # jq expression to extract content
    content_key="text",            # key within each object for page_content
    metadata_func=lambda record, metadata: {
        **metadata,
        "sender": record.get("sender", "unknown"),
        "timestamp": record.get("timestamp", ""),
    },
)
docs = loader.load()
```

### JSON Structure Example

```json
{
  "messages": [
    { "sender": "Alice", "text": "Hello, how can I help?", "timestamp": "2024-01-15T10:00:00Z" },
    { "sender": "Bob", "text": "I need help with billing.", "timestamp": "2024-01-15T10:01:00Z" }
  ]
}
```

### Installation

```bash
pip install jq
```

---

## 6. HTML Files

### BSHTMLLoader (BeautifulSoup)

```python
from langchain_community.document_loaders import BSHTMLLoader

loader = BSHTMLLoader("./data/page.html")
docs = loader.load()
# Strips HTML tags, returns clean text
# metadata → {"source": "./data/page.html", "title": "Page Title"}
```

### UnstructuredHTMLLoader

```python
from langchain_community.document_loaders import UnstructuredHTMLLoader

loader = UnstructuredHTMLLoader("./data/page.html")
docs = loader.load()
```

### Installation

```bash
pip install beautifulsoup4 lxml
# For UnstructuredHTMLLoader:
pip install unstructured
```

---

## 7. Word Documents (DOCX)

```python
from langchain_community.document_loaders import Docx2txtLoader

loader = Docx2txtLoader("./data/document.docx")
docs = loader.load()
```

### Installation

```bash
pip install docx2txt
```

---

## 8. Markdown Files

```python
from langchain_community.document_loaders import UnstructuredMarkdownLoader

loader = UnstructuredMarkdownLoader("./data/readme.md")
docs = loader.load()
```

---

## 9. Web Pages

### WebBaseLoader

```python
from langchain_community.document_loaders import WebBaseLoader

loader = WebBaseLoader("https://example.com/article")
docs = loader.load()
# metadata → {"source": "https://example.com/article", "title": "..."}

# Load multiple URLs
loader = WebBaseLoader(["https://example.com/page1", "https://example.com/page2"])
docs = loader.load()
```

### Installation

```bash
pip install beautifulsoup4
```

---

## 10. Directory Loading

### DirectoryLoader

```python
from langchain_community.document_loaders import DirectoryLoader, TextLoader

# Load all .txt files from a directory
loader = DirectoryLoader(
    "./data/docs/",
    glob="**/*.txt",
    loader_cls=TextLoader,
    show_progress=True,
    use_multithreading=True,
)
docs = loader.load()
```

### Mixed File Types

```python
from langchain_community.document_loaders import (
    DirectoryLoader,
    TextLoader,
    PyPDFLoader,
    CSVLoader,
)

# Load each file type separately
txt_loader = DirectoryLoader("./data/", glob="**/*.txt", loader_cls=TextLoader)
pdf_loader = DirectoryLoader("./data/", glob="**/*.pdf", loader_cls=PyPDFLoader)
csv_loader = DirectoryLoader("./data/", glob="**/*.csv", loader_cls=CSVLoader)

all_docs = []
all_docs.extend(txt_loader.load())
all_docs.extend(pdf_loader.load())
all_docs.extend(csv_loader.load())
```

---

## 11. Wikipedia & Arxiv

```python
# Wikipedia
from langchain_community.document_loaders import WikipediaLoader

loader = WikipediaLoader(query="LangChain", load_max_docs=3)
docs = loader.load()

# Arxiv (academic papers)
from langchain_community.document_loaders import ArxivLoader

loader = ArxivLoader(query="RAG retrieval augmented generation", load_max_docs=5)
docs = loader.load()
```

### Installation

```bash
pip install wikipedia arxiv pymupdf
```

---

## 12. Custom Loaders

```python
from langchain_core.documents import Document
from langchain_community.document_loaders.base import BaseLoader


class CustomAPILoader(BaseLoader):
    """Load documents from a custom REST API."""

    def __init__(self, api_url: str, api_key: str):
        self.api_url = api_url
        self.api_key = api_key

    def load(self) -> list[Document]:
        import requests

        headers = {"Authorization": f"Bearer {self.api_key}"}
        response = requests.get(self.api_url, headers=headers, timeout=30)
        response.raise_for_status()
        items = response.json().get("items", [])

        return [
            Document(
                page_content=item["content"],
                metadata={
                    "source": self.api_url,
                    "id": item["id"],
                    "title": item.get("title", ""),
                },
            )
            for item in items
        ]


# Usage
loader = CustomAPILoader(
    api_url="https://api.example.com/articles",
    api_key="your-api-key",
)
docs = loader.load()
```

---

## 13. Metadata Enrichment

```python
from langchain_core.documents import Document

def enrich_metadata(docs: list[Document], category: str) -> list[Document]:
    """Add extra metadata to loaded documents."""
    for doc in docs:
        doc.metadata["category"] = category
        doc.metadata["loaded_at"] = "2024-01-15"
        # Compute content stats
        doc.metadata["char_count"] = len(doc.page_content)
        doc.metadata["word_count"] = len(doc.page_content.split())
    return docs

docs = loader.load()
docs = enrich_metadata(docs, category="technical")
```

---

## 14. Loader Selection Guide

| File Type | Loader                       | Package Required         |
| --------- | ---------------------------- | ------------------------ |
| `.txt`    | `TextLoader`                 | —                        |
| `.pdf`    | `PyPDFLoader`                | `pypdf`                  |
| `.csv`    | `CSVLoader`                  | —                        |
| `.json`   | `JSONLoader`                 | `jq`                     |
| `.html`   | `BSHTMLLoader`               | `beautifulsoup4`, `lxml` |
| `.docx`   | `Docx2txtLoader`             | `docx2txt`               |
| `.md`     | `UnstructuredMarkdownLoader` | `unstructured`           |
| Web URL   | `WebBaseLoader`              | `beautifulsoup4`         |
| Directory | `DirectoryLoader`            | —                        |
| Wikipedia | `WikipediaLoader`            | `wikipedia`              |
| Arxiv     | `ArxivLoader`                | `arxiv`, `pymupdf`       |

---

## Anti-Patterns

| Anti-Pattern                                        | Correct Approach                                            |
| --------------------------------------------------- | ----------------------------------------------------------- |
| Loading PDFs as plain text with `TextLoader`        | Use `PyPDFLoader` — it handles PDF structure and pagination |
| Not specifying encoding for text files              | Use `encoding="utf-8"` to avoid decode errors               |
| Loading large directories without progress tracking | Use `show_progress=True` and `use_multithreading=True`      |
| Ignoring metadata from loaders                      | Preserve and enrich metadata for filtering and attribution  |
| Loading all pages of a large PDF at once into LLM   | Split into chunks first, then use retrieval                 |
| Not validating API responses in custom loaders      | Use `response.raise_for_status()` and proper error handling |
| Hardcoding file paths                               | Use environment variables or configuration for paths        |
