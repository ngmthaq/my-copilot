---
name: langchainjs-embeddings-semantic-search
description: "LangChain.js embeddings & semantic search — document loaders, text splitting, chunking strategies, embeddings, vector stores, similarity search. Use when: loading documents; splitting text into chunks; generating embeddings; building vector stores; performing semantic search. DO NOT USE FOR: agentic retrieval (use agentic-rag); general agents (use agents)."
---

# LangChain.js Embeddings & Semantic Search

## 1. Loading Documents

```javascript
import { TextLoader } from "langchain/document_loaders/fs/text";

// Load a text file
const loader = new TextLoader("./data/document.txt");
const docs = await loader.load();

// Each document: { pageContent: string, metadata: { source: string } }
console.log(docs[0].pageContent);
console.log(docs[0].metadata.source); // "./data/document.txt"
```

### Other Loaders

```javascript
// PDF loader
import { PDFLoader } from "@langchain/community/document_loaders/fs/pdf";
const pdfLoader = new PDFLoader("./data/document.pdf");

// CSV loader
import { CSVLoader } from "@langchain/community/document_loaders/fs/csv";
const csvLoader = new CSVLoader("./data/data.csv");

// Web page loader
import { CheerioWebBaseLoader } from "@langchain/community/document_loaders/web/cheerio";
const webLoader = new CheerioWebBaseLoader("https://example.com");

// All loaders return Document[] with pageContent + metadata
const docs = await pdfLoader.load();
```

---

## 2. Text Splitting

```javascript
import { RecursiveCharacterTextSplitter } from "langchain/text_splitter";

const splitter = new RecursiveCharacterTextSplitter({
  chunkSize: 1000, // max characters per chunk
  chunkOverlap: 200, // overlap between consecutive chunks
});

const chunks = await splitter.splitDocuments(docs);

// Each chunk retains original metadata
console.log(chunks.length); // number of chunks
console.log(chunks[0].pageContent); // chunk text
console.log(chunks[0].metadata.source); // original file source
```

### Chunk Overlap Explained

```
Document: "ABCDEFGHIJKLMNOPQRSTUVWXYZ"
chunkSize: 10, chunkOverlap: 3

Chunk 1: "ABCDEFGHIJ"
Chunk 2: "HIJKLMNOPQ"  ← overlaps "HIJ" with chunk 1
Chunk 3: "OPQRSTUVWX"  ← overlaps "OPQ" with chunk 2

Overlap preserves context at chunk boundaries.
```

### Splitting Strategies

```javascript
// For code — splits on language-specific boundaries
import { RecursiveCharacterTextSplitter } from "langchain/text_splitter";

const codeSplitter = RecursiveCharacterTextSplitter.fromLanguage("js", {
  chunkSize: 1000,
  chunkOverlap: 200,
});

// For Markdown — splits on headers
const markdownSplitter = RecursiveCharacterTextSplitter.fromLanguage("markdown", {
  chunkSize: 1000,
  chunkOverlap: 200,
});
```

---

## 3. Generating Embeddings

```javascript
import { OpenAIEmbeddings } from "@langchain/openai";

const embeddings = new OpenAIEmbeddings({
  modelName: "text-embedding-3-small", // or "text-embedding-3-large"
});

// Embed a single text
const vector = await embeddings.embedQuery("What is LangChain?");
console.log(vector.length); // 1536 (dimension count)

// Embed multiple texts (batch)
const vectors = await embeddings.embedDocuments(["First document text", "Second document text", "Third document text"]);
```

---

## 4. Vector Stores

```javascript
import { MemoryVectorStore } from "langchain/vectorstores/memory";
import { OpenAIEmbeddings } from "@langchain/openai";

const embeddings = new OpenAIEmbeddings();

// Create vector store from documents
const vectorStore = await MemoryVectorStore.fromDocuments(
  chunks, // split documents
  embeddings, // embedding model
);

// Or create empty and add documents later
const vectorStore2 = new MemoryVectorStore(embeddings);
await vectorStore2.addDocuments(chunks);
```

### Persistent Vector Stores

```javascript
// Chroma (local persistent store)
import { Chroma } from "@langchain/community/vectorstores/chroma";

const vectorStore = await Chroma.fromDocuments(chunks, embeddings, {
  collectionName: "my-collection",
  url: "http://localhost:8000",
});

// Pinecone (cloud vector store)
import { PineconeStore } from "@langchain/pinecone";
import { Pinecone } from "@pinecone-database/pinecone";

const pinecone = new Pinecone();
const index = pinecone.Index("my-index");

const vectorStore = await PineconeStore.fromDocuments(chunks, embeddings, {
  pineconeIndex: index,
});
```

---

## 5. Similarity Search

```javascript
// Basic similarity search — returns top k results
const results = await vectorStore.similaritySearch(
  "How does LangChain handle agents?", // query
  3, // k — number of results
);

// Each result is a Document with pageContent and metadata
for (const doc of results) {
  console.log(doc.pageContent);
  console.log(doc.metadata);
  console.log("---");
}

// Similarity search with scores
const resultsWithScores = await vectorStore.similaritySearchWithScore("How does LangChain handle agents?", 3);

for (const [doc, score] of resultsWithScores) {
  console.log(`Score: ${score}`);
  console.log(`Content: ${doc.pageContent}`);
}
```

---

## 6. Complete RAG Pipeline

```javascript
import { TextLoader } from "langchain/document_loaders/fs/text";
import { RecursiveCharacterTextSplitter } from "langchain/text_splitter";
import { MemoryVectorStore } from "langchain/vectorstores/memory";
import { OpenAIEmbeddings } from "@langchain/openai";
import { ChatOpenAI } from "@langchain/openai";
import { ChatPromptTemplate } from "@langchain/core/prompts";

// 1. Load documents
const loader = new TextLoader("./data/knowledge-base.txt");
const docs = await loader.load();

// 2. Split into chunks
const splitter = new RecursiveCharacterTextSplitter({
  chunkSize: 1000,
  chunkOverlap: 200,
});
const chunks = await splitter.splitDocuments(docs);

// 3. Create vector store
const embeddings = new OpenAIEmbeddings();
const vectorStore = await MemoryVectorStore.fromDocuments(chunks, embeddings);

// 4. Search for relevant context
const query = "How do agents work in LangChain?";
const relevantDocs = await vectorStore.similaritySearch(query, 3);
const context = relevantDocs.map((d) => d.pageContent).join("\n\n");

// 5. Generate answer with context
const model = new ChatOpenAI({ modelName: "gpt-4o-mini" });
const prompt = ChatPromptTemplate.fromMessages([
  ["system", "Answer based on the following context:\n\n{context}"],
  ["human", "{question}"],
]);

const chain = prompt.pipe(model);
const answer = await chain.invoke({ context, question: query });
console.log(answer.content);
```

---

## 7. Batch Processing for Large Datasets

```javascript
// Process documents in batches to manage memory and API limits
const BATCH_SIZE = 100;

for (let i = 0; i < chunks.length; i += BATCH_SIZE) {
  const batch = chunks.slice(i, i + BATCH_SIZE);
  await vectorStore.addDocuments(batch);
  console.log(`Processed ${Math.min(i + BATCH_SIZE, chunks.length)}/${chunks.length}`);
}
```

---

## Anti-Patterns

- **Chunks too large** — large chunks dilute relevance; keep chunks focused (500-1500 chars)
- **No chunk overlap** — zero overlap loses context at boundaries; use 10-20% overlap
- **Ignoring metadata** — metadata enables filtering; preserve and use it
- **Embedding entire documents** — always split first, then embed chunks
- **Using MemoryVectorStore in production** — it's in-memory only; use persistent stores (Chroma, Pinecone) for production
- **Not batching large datasets** — embedding APIs have rate limits; process in batches
