---
name: langchainjs-chunking-strategies
description: "LangChain.js text splitting & chunking strategies — RecursiveCharacterTextSplitter, TokenTextSplitter, MarkdownTextSplitter, HTMLSectionSplitter, code splitting by language, chunk size tuning, overlap optimization, metadata preservation. Use when: splitting documents into chunks; choosing chunking strategy; optimizing chunk sizes; preserving document structure during splitting; language-aware code splitting. DO NOT USE FOR: loading documents (use langchainjs-document-parsers); storing chunks in vector databases (use langchainjs-vector-stores); retrieval chains (use langchainjs-retrieval)."
---

# Text Splitting & Chunking Strategies

## Overview

Chunking breaks large documents into smaller pieces for embedding and retrieval. The strategy and parameters directly impact retrieval quality — too large and chunks lose precision, too small and chunks lose context.

---

## 1. RecursiveCharacterTextSplitter (Default)

The most versatile splitter. Recursively tries splitting by `\n\n`, `\n`, ` `, then individual characters.

```javascript
import { RecursiveCharacterTextSplitter } from "langchain/text_splitter";

const splitter = new RecursiveCharacterTextSplitter({
  chunkSize: 1000, // Target characters per chunk
  chunkOverlap: 200, // Characters shared between consecutive chunks
  separators: ["\n\n", "\n", " ", ""], // Default hierarchy
});

// Split raw text
const chunks = await splitter.createDocuments(
  ["Your long text here..."], // texts array
  [{ source: "article.txt" }], // optional metadata array
);

// Split loaded documents (preserves metadata)
const chunks2 = await splitter.splitDocuments(docs);
```

---

## 2. TokenTextSplitter

Splits by token count instead of character count. Better alignment with LLM token limits.

```javascript
import { TokenTextSplitter } from "langchain/text_splitter";

const splitter = new TokenTextSplitter({
  chunkSize: 500, // Tokens per chunk
  chunkOverlap: 50, // Token overlap
  encodingName: "cl100k_base", // Tokenizer (GPT-4 / GPT-3.5)
});

const chunks = await splitter.splitDocuments(docs);
```

### When to Use Token Splitting

- When you need precise control over token counts
- When chunks will be passed directly to LLMs with strict token limits
- When character count doesn't accurately represent token usage

### Installation

```bash
npm install @dqbd/tiktoken
```

---

## 3. MarkdownTextSplitter

Splits Markdown respecting its structure (headers, code blocks, lists).

```javascript
import { MarkdownTextSplitter } from "langchain/text_splitter";

const splitter = new MarkdownTextSplitter({
  chunkSize: 1000,
  chunkOverlap: 200,
});

const chunks = await splitter.createDocuments([markdownText]);
```

### MarkdownHeaderTextSplitter (Structure-Aware)

```javascript
import { MarkdownHeaderTextSplitter } from "langchain/text_splitter";

const splitter = new MarkdownHeaderTextSplitter({
  headersToSplitOn: [
    ["#", "header_1"],
    ["##", "header_2"],
    ["###", "header_3"],
  ],
});

const markdownText = `
# Introduction
This is the intro section.

## Getting Started
Follow these steps to begin.

### Prerequisites
You need Node.js 18+.

## API Reference
The API uses REST conventions.
`;

const chunks = await splitter.splitText(markdownText);
// chunks[0].metadata → { header_1: "Introduction" }
// chunks[1].metadata → { header_1: "Introduction", header_2: "Getting Started" }
```

### Two-Stage Splitting (Markdown + Character)

```javascript
// Stage 1: Split by headers
const mdSplitter = new MarkdownHeaderTextSplitter({
  headersToSplitOn: [
    ["#", "h1"],
    ["##", "h2"],
    ["###", "h3"],
  ],
});
const mdChunks = await mdSplitter.splitText(markdownText);

// Stage 2: Further split large sections
const charSplitter = new RecursiveCharacterTextSplitter({
  chunkSize: 500,
  chunkOverlap: 100,
});
const finalChunks = await charSplitter.splitDocuments(mdChunks);
// Header metadata is preserved through both stages
```

---

## 4. HTML Splitting

```javascript
import { RecursiveCharacterTextSplitter } from "langchain/text_splitter";

// HTML-aware splitting — respects HTML structure
const htmlSplitter = RecursiveCharacterTextSplitter.fromLanguage("html", {
  chunkSize: 1000,
  chunkOverlap: 200,
});

const chunks = await htmlSplitter.createDocuments([htmlContent]);
```

---

## 5. Code Splitting

Split code files respecting language syntax boundaries (functions, classes).

```javascript
import { RecursiveCharacterTextSplitter, SupportedTextSplitterLanguage } from "langchain/text_splitter";

// JavaScript code splitter
const jsSplitter = RecursiveCharacterTextSplitter.fromLanguage("js", {
  chunkSize: 1000,
  chunkOverlap: 200,
});

const jsCode = `
class Calculator {
  add(a, b) {
    return a + b;
  }

  multiply(a, b) {
    return a * b;
  }
}

function main() {
  const calc = new Calculator();
  const result = calc.add(1, 2);
  console.log(result);
}
`;

const chunks = await jsSplitter.createDocuments([jsCode]);
```

### Supported Languages

```javascript
// Common languages - use string identifiers
"js"; // JavaScript
"ts"; // TypeScript
"python"; // Python
"java"; // Java
"go"; // Go
"rust"; // Rust
"cpp"; // C++
"c"; // C
"ruby"; // Ruby
"scala"; // Scala
"swift"; // Swift
"markdown"; // Markdown
"latex"; // LaTeX
"html"; // HTML
"sol"; // Solidity
```

---

## 6. Chunk Size Tuning Guide

### General Recommendations

| Use Case               | Chunk Size | Overlap | Splitter                             |
| ---------------------- | ---------- | ------- | ------------------------------------ |
| Q&A over documentation | 500–1000   | 100–200 | `RecursiveCharacterTextSplitter`     |
| Code search            | 1000–1500  | 100–200 | `fromLanguage()`                     |
| Legal / regulatory     | 1000–1500  | 200–300 | `RecursiveCharacterTextSplitter`     |
| Chat / conversational  | 300–500    | 50–100  | `RecursiveCharacterTextSplitter`     |
| Markdown docs          | 500–1000   | 100–200 | `MarkdownHeaderTextSplitter` + split |

### Overlap Rule of Thumb

Use **10–20%** of chunk size as overlap:

| Chunk Size | Recommended Overlap |
| ---------- | ------------------- |
| 300        | 30–60               |
| 500        | 50–100              |
| 1000       | 100–200             |
| 1500       | 150–300             |

---

## 7. Preserving Metadata Through Splitting

```javascript
import { Document } from "@langchain/core/documents";

// Original document with rich metadata
const doc = new Document({
  pageContent: "Very long document content...",
  metadata: {
    source: "handbook.pdf",
    page: 5,
    department: "engineering",
    version: "2.1",
  },
});

// All splitters preserve metadata on chunks
const splitter = new RecursiveCharacterTextSplitter({
  chunkSize: 500,
  chunkOverlap: 100,
});
const chunks = await splitter.splitDocuments([doc]);

// Each chunk retains original metadata
for (const chunk of chunks) {
  console.log(chunk.metadata);
  // → { source: "handbook.pdf", page: 5, department: "engineering", version: "2.1" }
}
```

### Adding Chunk-Specific Metadata

```javascript
chunks.forEach((chunk, i) => {
  chunk.metadata.chunkIndex = i;
  chunk.metadata.chunkTotal = chunks.length;
});
```

---

## 8. Evaluating Chunk Quality

```javascript
function analyzeChunks(chunks) {
  const sizes = chunks.map((c) => c.pageContent.length);
  return {
    totalChunks: chunks.length,
    avgSize: Math.round(sizes.reduce((a, b) => a + b, 0) / sizes.length),
    minSize: Math.min(...sizes),
    maxSize: Math.max(...sizes),
    tinyChunks: sizes.filter((s) => s < 100).length,
    largeChunks: sizes.filter((s) => s > 1500).length,
  };
}

const stats = analyzeChunks(chunks);
console.log(stats);
// If too many tiny chunks → increase chunkSize or overlap
// If too many large chunks → decrease chunkSize
```

---

## Anti-Patterns

| Anti-Pattern                                | Correct Approach                                               |
| ------------------------------------------- | -------------------------------------------------------------- |
| Same chunk size for all document types      | Tune chunk size per use case (see tuning guide)                |
| Zero overlap between chunks                 | Use 10–20% overlap to preserve boundary context                |
| Using character splitter for code           | Use `fromLanguage()` to respect syntax boundaries              |
| Splitting Markdown without header awareness | Use `MarkdownHeaderTextSplitter` to keep structure as metadata |
| Very tiny chunks (< 100 chars)              | Minimum 200–300 chars for meaningful retrieval                 |
| Very large chunks (> 2000 chars)            | Chunks lose precision; break into 500–1000 range               |
| Not analyzing chunk distribution            | Use `analyzeChunks()` to validate parameters                   |
