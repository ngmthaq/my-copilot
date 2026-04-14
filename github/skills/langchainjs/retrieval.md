---
name: langchainjs-retrieval
description: "LangChain.js retrieval patterns & chains — retrievers, retrieval chains (LCEL), contextual compression, multi-query retrieval, parent document retrieval, ensemble retrieval, self-query retrieval, conversational retrieval, long-context reorder, citation extraction. Use when: building retrieval pipelines; combining retrieval with LLM generation; implementing advanced retrieval strategies; adding conversational memory to RAG; improving retrieval quality. DO NOT USE FOR: loading documents (use langchainjs-document-parsers); splitting text (use langchainjs-chunking-strategies); vector store setup (use langchainjs-vector-stores); agentic RAG with agents (use langchainjs-agentic-rag)."
---

# Retrieval Patterns & Chains

## Overview

Retrieval connects vector stores to LLM generation. LangChain.js provides multiple retrieval strategies — from simple similarity search to advanced patterns like multi-query, contextual compression, and conversational retrieval with memory.

---

## 1. Basic Retriever

Every vector store can be converted to a retriever:

```javascript
// Simple retriever from vector store
const retriever = vectorStore.asRetriever({ k: 4 });

// Invoke the retriever
const docs = await retriever.invoke("What is LangChain?");
for (const doc of docs) {
  console.log(doc.pageContent.slice(0, 100));
}
```

### Retriever Search Types

```javascript
// Similarity (default)
const simRetriever = vectorStore.asRetriever({
  searchType: "similarity",
  k: 4,
});

// Maximum Marginal Relevance (diversity)
const mmrRetriever = vectorStore.asRetriever({
  searchType: "mmr",
  k: 4,
  fetchK: 20,
  lambda: 0.5,
});

// Score threshold (precision)
const thresholdRetriever = vectorStore.asRetriever({
  searchType: "similarity",
  k: 10,
  scoreThreshold: 0.7,
});
```

---

## 2. Basic Retrieval Chain (LCEL)

The simplest RAG chain: retrieve documents, stuff them into the prompt, generate an answer.

```javascript
import { ChatPromptTemplate } from "@langchain/core/prompts";
import {
  RunnablePassthrough,
  RunnableSequence,
} from "@langchain/core/runnables";
import { StringOutputParser } from "@langchain/core/output_parsers";
import { ChatOpenAI } from "@langchain/openai";

const model = new ChatOpenAI({ modelName: "gpt-4o-mini" });

const prompt = ChatPromptTemplate.fromMessages([
  [
    "system",
    "Answer the question based only on the following context:\n\n{context}",
  ],
  ["human", "{question}"],
]);

function formatDocs(docs) {
  return docs.map((doc) => doc.pageContent).join("\n\n");
}

// RAG chain using LCEL
const ragChain = RunnableSequence.from([
  {
    context: retriever.pipe(formatDocs),
    question: new RunnablePassthrough(),
  },
  prompt,
  model,
  new StringOutputParser(),
]);

const answer = await ragChain.invoke("What is LangChain?");
console.log(answer);
```

---

## 3. Retrieval Chain with Sources

```javascript
import { RunnableParallel } from "@langchain/core/runnables";

function formatDocsWithSources(docs) {
  return docs
    .map((doc, i) => {
      const source = doc.metadata.source ?? "unknown";
      return `[${i + 1}] (${source})\n${doc.pageContent}`;
    })
    .join("\n\n");
}

const promptWithSources = ChatPromptTemplate.fromMessages([
  [
    "system",
    "Answer the question based on the context below. Cite sources using [n] notation.\n\n{context}",
  ],
  ["human", "{question}"],
]);

const ragChainWithSources = RunnableSequence.from([
  new RunnableParallel({
    context: retriever.pipe(formatDocsWithSources),
    question: new RunnablePassthrough(),
  }),
  promptWithSources,
  model,
  new StringOutputParser(),
]);

const answer = await ragChainWithSources.invoke("What is LangChain?");
```

---

## 4. Multi-Query Retrieval

Generates multiple query variations to improve recall — catches results that a single query might miss.

```javascript
import { MultiQueryRetriever } from "langchain/retrievers/multi_query";
import { ChatOpenAI } from "@langchain/openai";

const llm = new ChatOpenAI({ modelName: "gpt-4o-mini", temperature: 0 });

const multiQueryRetriever = MultiQueryRetriever.fromLLM({
  llm,
  retriever: vectorStore.asRetriever({ k: 4 }),
});

// Generates 3 query variations, retrieves for each, deduplicates results
const docs = await multiQueryRetriever.invoke(
  "What are the benefits of using LangChain?",
);
```

### How It Works

```
Original query: "What are the benefits of using LangChain?"

Generated queries:
1. "What advantages does LangChain offer for AI development?"
2. "Why should developers use LangChain framework?"
3. "What problems does LangChain solve?"

→ Searches all 3 queries, combines and deduplicates results
→ Higher recall than single query
```

---

## 5. Contextual Compression

Compresses retrieved documents to keep only the relevant portions.

```javascript
import { ContextualCompressionRetriever } from "langchain/retrievers/contextual_compression";
import { LLMChainExtractor } from "langchain/retrievers/document_compressors/chain_extract";
import { ChatOpenAI } from "@langchain/openai";

const llm = new ChatOpenAI({ modelName: "gpt-4o-mini", temperature: 0 });

// LLM-based compressor — extracts relevant portions
const compressor = LLMChainExtractor.fromLLM(llm);

const compressionRetriever = new ContextualCompressionRetriever({
  baseCompressor: compressor,
  baseRetriever: vectorStore.asRetriever({ k: 6 }),
});

// Retrieved docs are compressed to only relevant content
const docs = await compressionRetriever.invoke("What is LangChain?");
```

### Embeddings-Based Filtering (No LLM Cost)

```javascript
import { EmbeddingsFilter } from "langchain/retrievers/document_compressors/embeddings_filter";

const embeddingsFilter = new EmbeddingsFilter({
  embeddings: new OpenAIEmbeddings(),
  similarityThreshold: 0.7,
});

const compressionRetriever = new ContextualCompressionRetriever({
  baseCompressor: embeddingsFilter,
  baseRetriever: vectorStore.asRetriever({ k: 10 }),
});
```

---

## 6. Parent Document Retrieval

Retrieves small chunks for precision, then returns the larger parent document for full context.

```javascript
import { ParentDocumentRetriever } from "langchain/retrievers/parent_document";
import { RecursiveCharacterTextSplitter } from "langchain/text_splitter";
import { InMemoryStore } from "@langchain/core/stores";
import { MemoryVectorStore } from "langchain/vectorstores/memory";

// Small chunks for search accuracy
const childSplitter = new RecursiveCharacterTextSplitter({
  chunkSize: 200,
  chunkOverlap: 50,
});

// Larger chunks for context
const parentSplitter = new RecursiveCharacterTextSplitter({
  chunkSize: 1000,
  chunkOverlap: 200,
});

const parentRetriever = new ParentDocumentRetriever({
  vectorstore: new MemoryVectorStore(embeddings),
  docstore: new InMemoryStore(),
  childSplitter,
  parentSplitter,
});

// Add documents (auto-creates parent-child relationships)
await parentRetriever.addDocuments(docs);

// Search finds small chunks but returns parent documents
const results = await parentRetriever.invoke("specific detail query");
// Returns larger parent chunks that contain the matching small chunks
```

### How It Works

```
Original Document (2000 chars)
├── Parent Chunk 1 (1000 chars)
│   ├── Child Chunk 1a (200 chars) ← Searched for matches
│   ├── Child Chunk 1b (200 chars)
│   └── Child Chunk 1c (200 chars) ← Match found!
│       → Returns Parent Chunk 1 (full 1000 chars)
└── Parent Chunk 2 (1000 chars)
    ├── Child Chunk 2a (200 chars)
    └── Child Chunk 2b (200 chars)
```

---

## 7. Ensemble Retrieval

Combines multiple retrievers for better results.

```javascript
import { EnsembleRetriever } from "langchain/retrievers/ensemble";

// Combine vector retriever with another retriever
const vectorRetriever = vectorStore.asRetriever({ k: 4 });
const secondRetriever = vectorStore2.asRetriever({ k: 4 });

const ensembleRetriever = new EnsembleRetriever({
  retrievers: [vectorRetriever, secondRetriever],
  weights: [0.5, 0.5],
});

const docs = await ensembleRetriever.invoke("LangChain agents tutorial");
```

---

## 8. Self-Query Retrieval

Converts natural language queries into structured filters automatically.

```javascript
import { SelfQueryRetriever } from "langchain/retrievers/self_query";
import { FunctionalTranslator } from "@langchain/core/structured_query";
import { ChatOpenAI } from "@langchain/openai";

const attributeInfo = [
  {
    name: "category",
    description: "The document category: 'technical', 'business', 'legal'",
    type: "string",
  },
  {
    name: "year",
    description: "The year the document was published",
    type: "number",
  },
  {
    name: "author",
    description: "The author of the document",
    type: "string",
  },
];

const llm = new ChatOpenAI({ modelName: "gpt-4o-mini", temperature: 0 });

const selfQueryRetriever = SelfQueryRetriever.fromLLM({
  llm,
  vectorStore,
  documentContents: "Company internal documentation",
  attributeInfo,
  structuredQueryTranslator: new FunctionalTranslator(),
});

// Natural language → structured filter + semantic search
const docs = await selfQueryRetriever.invoke(
  "technical documents from 2024 about APIs",
);
// Automatically filters: category="technical", year=2024, semantic search for "APIs"
```

---

## 9. Conversational Retrieval (RAG with Memory)

```javascript
import {
  ChatPromptTemplate,
  MessagesPlaceholder,
} from "@langchain/core/prompts";
import { RunnablePassthrough } from "@langchain/core/runnables";
import { StringOutputParser } from "@langchain/core/output_parsers";
import { HumanMessage, AIMessage } from "@langchain/core/messages";

// Prompt with chat history
const prompt = ChatPromptTemplate.fromMessages([
  [
    "system",
    "Answer based on the context and chat history. If you don't know, say so.\n\nContext:\n{context}",
  ],
  new MessagesPlaceholder("chatHistory"),
  ["human", "{question}"],
]);

// Contextualize question based on history
const contextualizePrompt = ChatPromptTemplate.fromMessages([
  [
    "system",
    "Given the chat history and latest question, reformulate the question to be standalone.",
  ],
  new MessagesPlaceholder("chatHistory"),
  ["human", "{question}"],
]);

async function contextualizeQuestion(input) {
  if (!input.chatHistory || input.chatHistory.length === 0) {
    return input.question;
  }
  const chain = contextualizePrompt.pipe(model).pipe(new StringOutputParser());
  return chain.invoke(input);
}

function formatDocs(docs) {
  return docs.map((d) => d.pageContent).join("\n\n");
}

// Conversational RAG chain
async function conversationalRag(question, chatHistory) {
  const standaloneQuestion = await contextualizeQuestion({
    question,
    chatHistory,
  });
  const relevantDocs = await retriever.invoke(standaloneQuestion);
  const context = formatDocs(relevantDocs);

  const chain = prompt.pipe(model).pipe(new StringOutputParser());
  return chain.invoke({ context, question, chatHistory });
}

// Usage with chat history
const chatHistory = [];

const answer1 = await conversationalRag("What is LangChain?", chatHistory);
chatHistory.push(new HumanMessage("What is LangChain?"));
chatHistory.push(new AIMessage(answer1));

const answer2 = await conversationalRag(
  "What tools does it support?",
  chatHistory,
);
// "it" → contextualizer rewrites to "What tools does LangChain support?"
```

---

## 10. Long-Context Reorder

When passing many documents to an LLM, documents in the middle get less attention ("lost in the middle"). Reorder so the most relevant ones are at the start and end.

```javascript
function reorderDocuments(docs) {
  const reordered = [];
  for (let i = 0; i < docs.length; i++) {
    if (i % 2 === 0) {
      reordered.push(docs[i]);
    } else {
      reordered.unshift(docs[i]);
    }
  }
  return reordered;
}

const docs = await retriever.invoke("query");
const reorderedDocs = reorderDocuments(docs);
// Most relevant docs are now at the start and end (not buried in the middle)
```

---

## 11. Retrieval Strategy Selection Guide

```
What retrieval pattern do you need?
│
├── Simple Q&A, no conversation history?
│   └── → Basic Retrieval Chain (Section 2)
│
├── Need source citations in answers?
│   └── → Retrieval Chain with Sources (Section 3)
│
├── Single query misses relevant results?
│   └── → Multi-Query Retrieval (Section 4)
│
├── Retrieved chunks contain too much irrelevant text?
│   └── → Contextual Compression (Section 5)
│
├── Need precise search but full-context answers?
│   └── → Parent Document Retrieval (Section 6)
│
├── Need both keyword and semantic matching?
│   └── → Ensemble Retrieval (Section 7)
│
├── Users query with metadata-like filters naturally?
│   └── → Self-Query Retrieval (Section 8)
│
├── Multi-turn conversation with retrieval?
│   └── → Conversational Retrieval (Section 9)
│
└── Passing many documents to LLM?
    └── → Long-Context Reorder (Section 10)
```

---

## Anti-Patterns

| Anti-Pattern                                           | Correct Approach                                             |
| ------------------------------------------------------ | ------------------------------------------------------------ |
| Always using basic similarity retrieval                | Choose strategy based on use case (see selection guide)      |
| Stuffing too many documents into prompt                | Use compression, reorder, or limit k to manage context size  |
| No source attribution in generated answers             | Include sources in prompt and instruct model to cite them    |
| Ignoring chat history in multi-turn RAG                | Use conversational retrieval with question contextualization |
| Only using vector search for all queries               | Use ensemble for better coverage                             |
| Large k with no quality filtering                      | Combine with score threshold or compression                  |
| Not contextualizing follow-up questions                | Rewrite questions using chat history before retrieval        |
| Using parent retriever with same size parent and child | Parent should be 3–5× larger than child chunks               |
