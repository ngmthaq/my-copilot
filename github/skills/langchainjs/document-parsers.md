---
name: langchainjs-document-parsers
description: "LangChain.js document parsers & loaders — TextLoader, PDFLoader, CSVLoader, JSONLoader, CheerioWebBaseLoader, DirectoryLoader, DocxLoader, NotionLoader, GithubRepoLoader, PuppeteerWebBaseLoader, multi-format pipelines, custom loaders, metadata enrichment. Use when: loading documents from files (PDF, CSV, JSON, HTML, DOCX, etc.); scraping web pages; loading directories of mixed files; building custom loaders; enriching metadata. DO NOT USE FOR: splitting/chunking text (use langchainjs-chunking-strategies); embeddings or vector stores (use langchainjs-vector-stores); retrieval chains (use langchainjs-retrieval)."
---

# Document Parsers & Loaders

## Overview

Document loaders convert raw data sources (files, URLs, APIs) into LangChain `Document` objects with `pageContent` and `metadata`. Each loader handles a specific format and preserves source metadata for attribution and filtering.

---

## 1. Core Document Object

```javascript
import { Document } from "@langchain/core/documents";

const doc = new Document({
  pageContent: "The actual text content of the document.",
  metadata: {
    source: "report.pdf",
    page: 0,
    category: "finance",
    author: "Jane Doe",
  },
});
```

| Property      | Type     | Description                            |
| ------------- | -------- | -------------------------------------- |
| `pageContent` | `string` | The text content                       |
| `metadata`    | `object` | Arbitrary key-value pairs for tracking |

---

## 2. Text Files

```javascript
import { TextLoader } from "langchain/document_loaders/fs/text";

const loader = new TextLoader("./data/readme.txt");
const docs = await loader.load();
// docs[0].metadata → { source: "./data/readme.txt" }
```

---

## 3. PDF Files

```javascript
import { PDFLoader } from "@langchain/community/document_loaders/fs/pdf";

// Each page as separate document
const loader = new PDFLoader("./data/report.pdf");
const pages = await loader.load();
// pages[0].metadata → { source: "./data/report.pdf", pdf: {...}, loc: { pageNumber: 1 } }

// Single document (all pages merged)
const singleLoader = new PDFLoader("./data/report.pdf", {
  splitPages: false,
});
const [doc] = await singleLoader.load();
```

### Installation

```bash
npm install pdf-parse
```

---

## 4. CSV Files

```javascript
import { CSVLoader } from "@langchain/community/document_loaders/fs/csv";

// Default — each row becomes a Document
const loader = new CSVLoader("./data/employees.csv");
const docs = await loader.load();
// docs[0].pageContent → "name: John\nemail: john@example.com\nrole: Engineer"

// Specify which column to use as content
const customLoader = new CSVLoader("./data/employees.csv", {
  column: "description", // only this column as pageContent
});
```

### Installation

```bash
npm install d3-dsv
```

---

## 5. JSON Files

```javascript
import { JSONLoader } from "langchain/document_loaders/fs/json";

// Load all text values from JSON
const loader = new JSONLoader("./data/messages.json");
const docs = await loader.load();

// Load specific JSON path using JSON Pointer
const specificLoader = new JSONLoader(
  "./data/messages.json",
  "/messages/*/text",
);
const docs2 = await specificLoader.load();
// Extracts text field from each item in messages array
```

### JSON Structure Example

```json
{
  "messages": [
    { "sender": "Alice", "text": "Hello, how can I help?" },
    { "sender": "Bob", "text": "I need help with billing." }
  ]
}
```

---

## 6. HTML Files

```javascript
// Cheerio-based HTML loader (no browser needed)
import { CheerioWebBaseLoader } from "@langchain/community/document_loaders/web/cheerio";

const loader = new CheerioWebBaseLoader("./data/page.html");
const docs = await loader.load();
```

### Installation

```bash
npm install cheerio
```

---

## 7. Word Documents (DOCX)

```javascript
import { DocxLoader } from "@langchain/community/document_loaders/fs/docx";

const loader = new DocxLoader("./data/document.docx");
const docs = await loader.load();
```

### Installation

```bash
npm install mammoth
```

---

## 8. Web Pages

### CheerioWebBaseLoader (lightweight, no browser)

```javascript
import { CheerioWebBaseLoader } from "@langchain/community/document_loaders/web/cheerio";

const loader = new CheerioWebBaseLoader("https://example.com/article");
const docs = await loader.load();
// metadata → { source: "https://example.com/article" }

// With CSS selector to target specific content
const selectiveLoader = new CheerioWebBaseLoader(
  "https://example.com/article",
  {
    selector: "article", // only load <article> content
  },
);
```

### PuppeteerWebBaseLoader (full browser, JavaScript-rendered pages)

```javascript
import { PuppeteerWebBaseLoader } from "@langchain/community/document_loaders/web/puppeteer";

const loader = new PuppeteerWebBaseLoader("https://example.com/spa", {
  launchOptions: { headless: "new" },
  gotoOptions: { waitUntil: "networkidle0" },
});
const docs = await loader.load();
```

### Installation

```bash
npm install cheerio
# For Puppeteer:
npm install puppeteer
```

---

## 9. Directory Loading

```javascript
import { DirectoryLoader } from "langchain/document_loaders/fs/directory";
import { TextLoader } from "langchain/document_loaders/fs/text";
import { PDFLoader } from "@langchain/community/document_loaders/fs/pdf";
import { CSVLoader } from "@langchain/community/document_loaders/fs/csv";

// Map file extensions to loaders
const loader = new DirectoryLoader("./data/docs/", {
  ".txt": (path) => new TextLoader(path),
  ".pdf": (path) => new PDFLoader(path),
  ".csv": (path) => new CSVLoader(path),
});

const docs = await loader.load();
// Each document's metadata includes the source file path
```

---

## 10. GitHub Repository

```javascript
import { GithubRepoLoader } from "@langchain/community/document_loaders/web/github";

const loader = new GithubRepoLoader("https://github.com/owner/repo", {
  branch: "main",
  recursive: true,
  unknown: "warn",
  ignorePaths: ["node_modules", "*.lock", "dist"],
  accessToken: process.env.GITHUB_TOKEN,
});

const docs = await loader.load();
```

### Installation

```bash
npm install @octokit/rest
```

---

## 11. Notion

```javascript
import { NotionLoader } from "@langchain/community/document_loaders/fs/notion";

// Load from exported Notion workspace directory
const loader = new NotionLoader("./data/notion-export/");
const docs = await loader.load();
```

---

## 12. Custom Loaders

```javascript
import { Document } from "@langchain/core/documents";
import { BaseDocumentLoader } from "langchain/document_loaders/base";

class CustomAPILoader extends BaseDocumentLoader {
  constructor(apiUrl, apiKey) {
    super();
    this.apiUrl = apiUrl;
    this.apiKey = apiKey;
  }

  async load() {
    const response = await fetch(this.apiUrl, {
      headers: { Authorization: `Bearer ${this.apiKey}` },
    });

    if (!response.ok) {
      throw new Error(`API request failed: ${response.status}`);
    }

    const data = await response.json();

    return data.items.map(
      (item) =>
        new Document({
          pageContent: item.content,
          metadata: {
            source: this.apiUrl,
            id: item.id,
            title: item.title ?? "",
          },
        }),
    );
  }
}

// Usage
const loader = new CustomAPILoader(
  "https://api.example.com/articles",
  "your-api-key",
);
const docs = await loader.load();
```

---

## 13. Metadata Enrichment

```javascript
function enrichMetadata(docs, category) {
  return docs.map((doc) => {
    doc.metadata.category = category;
    doc.metadata.loadedAt = new Date().toISOString();
    doc.metadata.charCount = doc.pageContent.length;
    doc.metadata.wordCount = doc.pageContent.split(/\s+/).length;
    return doc;
  });
}

const docs = await loader.load();
const enrichedDocs = enrichMetadata(docs, "technical");
```

---

## 14. Loader Selection Guide

| File Type   | Loader                   | Package Required |
| ----------- | ------------------------ | ---------------- |
| `.txt`      | `TextLoader`             | —                |
| `.pdf`      | `PDFLoader`              | `pdf-parse`      |
| `.csv`      | `CSVLoader`              | `d3-dsv`         |
| `.json`     | `JSONLoader`             | —                |
| `.html`     | `CheerioWebBaseLoader`   | `cheerio`        |
| `.docx`     | `DocxLoader`             | `mammoth`        |
| Web URL     | `CheerioWebBaseLoader`   | `cheerio`        |
| SPA / JS    | `PuppeteerWebBaseLoader` | `puppeteer`      |
| Directory   | `DirectoryLoader`        | —                |
| GitHub repo | `GithubRepoLoader`       | `@octokit/rest`  |
| Notion      | `NotionLoader`           | —                |

---

## Anti-Patterns

| Anti-Pattern                                      | Correct Approach                                                 |
| ------------------------------------------------- | ---------------------------------------------------------------- |
| Loading PDFs as plain text with `TextLoader`      | Use `PDFLoader` — it handles PDF structure and pagination        |
| Using Puppeteer for static HTML pages             | Use `CheerioWebBaseLoader` — faster & lighter for static content |
| Loading entire GitHub repos without `ignorePaths` | Filter out `node_modules`, lock files, and build outputs         |
| Ignoring metadata from loaders                    | Preserve and enrich metadata for filtering and attribution       |
| Loading all pages of a large PDF into LLM at once | Split into chunks first, then use retrieval                      |
| Not validating API responses in custom loaders    | Check `response.ok` and throw meaningful errors                  |
| Hardcoding file paths                             | Use environment variables or configuration for paths             |
