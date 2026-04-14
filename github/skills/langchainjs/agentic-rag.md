---
name: langchainjs-agentic-rag
description: "LangChain.js agentic RAG — agent-driven retrieval, retrieval tools from vector stores, dynamic retrieval strategies (similarity, MMR, score threshold), RAG as MCP service. Use when: building agents that decide when to retrieve context; comparing retrieval strategies; serving RAG as MCP tool. DO NOT USE FOR: basic similarity search (use embeddings-semantic-search); agents without retrieval (use agents)."
---

# LangChain.js Agentic RAG

## 1. Traditional RAG vs Agentic RAG

```
Traditional RAG:
  User Query → Always Retrieve → Generate Answer
  (retrieves every time, even when unnecessary)

Agentic RAG:
  User Query → Agent Decides → Retrieve if needed → Generate Answer
  (agent reasons about when retrieval is useful)
```

**Agentic RAG advantages:**

- Agent decides **when** to retrieve (skips retrieval for general knowledge)
- Agent can **refine queries** before searching
- Agent can **combine retrieval with other tools** (web search, calculation)
- Agent can **retrieve multiple times** with different queries

---

## 2. Creating a Retrieval Tool

```javascript
import { tool } from "@langchain/core/tools";
import { z } from "zod";
import { MemoryVectorStore } from "langchain/vectorstores/memory";
import { OpenAIEmbeddings } from "@langchain/openai";

// Assume vectorStore is already populated with documents
const vectorStore = await MemoryVectorStore.fromDocuments(
  chunks,
  new OpenAIEmbeddings(),
);

// Wrap vector store as an agent tool
const retrievalTool = tool(
  async ({ query }) => {
    const results = await vectorStore.similaritySearch(query, 4);
    return results
      .map((doc, i) => `[${i + 1}] ${doc.pageContent}`)
      .join("\n\n");
  },
  {
    name: "search_knowledge_base",
    description:
      "Search the internal knowledge base for relevant information. Use this when the user asks about topics covered in our documentation.",
    schema: z.object({
      query: z.string().describe("The search query to find relevant documents"),
    }),
  },
);
```

---

## 3. Agentic RAG Agent

```javascript
import { createAgent } from "langchain";
import { ChatOpenAI } from "@langchain/openai";

const model = new ChatOpenAI({ modelName: "gpt-4o-mini" });

const agent = createAgent({
  model,
  tools: [retrievalTool],
  prompt: `You are a helpful assistant with access to a knowledge base.
Use the search_knowledge_base tool when the user asks about specific topics.
For general questions, answer from your own knowledge.
Always cite the relevant documents when using retrieved information.`,
});

// Agent decides whether to retrieve
const result1 = await agent.invoke({
  messages: [{ role: "user", content: "What does our docs say about agents?" }],
});
// → Agent uses retrievalTool

const result2 = await agent.invoke({
  messages: [{ role: "user", content: "What is 2 + 2?" }],
});
// → Agent answers directly, no retrieval needed
```

---

## 4. Multi-Tool RAG Agent

```javascript
import { tool } from "@langchain/core/tools";
import { z } from "zod";

// Web search tool
const webSearchTool = tool(
  async ({ query }) => {
    return `Web results for: ${query}`;
  },
  {
    name: "web_search",
    description:
      "Search the web for current information not in the knowledge base",
    schema: z.object({
      query: z.string().describe("Web search query"),
    }),
  },
);

// Combine retrieval with other tools
const agent = createAgent({
  model,
  tools: [retrievalTool, webSearchTool],
  prompt: `You have access to:
1. search_knowledge_base — for internal documentation
2. web_search — for current/external information

Use search_knowledge_base first for documentation questions.
Use web_search for current events or topics not in the knowledge base.
You may use both tools for comprehensive answers.`,
});
```

---

## 5. Retrieval Strategies

### Similarity Search (Default)

```javascript
// Returns the k most similar documents
const results = await vectorStore.similaritySearch(query, 4);
```

### Maximum Marginal Relevance (MMR)

```javascript
// Returns diverse results — balances relevance and diversity
const retriever = vectorStore.asRetriever({
  searchType: "mmr",
  k: 4,
  fetchK: 20, // fetch 20 candidates, pick 4 diverse ones
  lambda: 0.5, // 0 = max diversity, 1 = max relevance
});

const results = await retriever.invoke(query);
```

### Score Threshold

```javascript
// Only return documents above a minimum similarity score
const retriever = vectorStore.asRetriever({
  searchType: "similarity",
  k: 10,
  filter: undefined,
  scoreThreshold: 0.7, // minimum similarity score (0-1)
});
```

### Strategy Selection Guide

```
Which retrieval strategy?
│
├─ Simple Q&A with focused topics
│   └─▶ Similarity Search (default, fast)
│
├─ Topics that overlap; results are too repetitive
│   └─▶ MMR (diverse results from broad corpus)
│
└─ High precision needed; irrelevant results are costly
    └─▶ Score Threshold (filter out low-confidence matches)
```

---

## 6. RAG as MCP Service

Serve your RAG pipeline as an MCP tool server:

```javascript
import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { StreamableHTTPServerTransport } from "@modelcontextprotocol/sdk/server/streamableHttp.js";
import { MemoryVectorStore } from "langchain/vectorstores/memory";
import { OpenAIEmbeddings } from "@langchain/openai";
import express from "express";
import { z } from "zod";

const app = express();
app.use(express.json());

// Initialize vector store (load your documents here)
const vectorStore = await MemoryVectorStore.fromDocuments(
  chunks,
  new OpenAIEmbeddings(),
);

// Create MCP server with retrieval tool
const mcpServer = new McpServer({
  name: "rag-service",
  version: "1.0.0",
});

mcpServer.tool(
  "search_docs",
  "Search internal documentation for relevant information",
  { query: z.string().describe("Search query") },
  async ({ query }) => {
    const results = await vectorStore.similaritySearch(query, 4);
    return {
      content: [
        {
          type: "text",
          text: results
            .map((doc, i) => `[${i + 1}] ${doc.pageContent}`)
            .join("\n\n"),
        },
      ],
    };
  },
);

// HTTP transport endpoint
const transports = {};
app.post("/mcp", async (req, res) => {
  const transport = new StreamableHTTPServerTransport({
    sessionIdGenerator: undefined,
  });
  transports[transport.sessionId] = transport;
  await mcpServer.connect(transport);
  await transport.handleRequest(req, res);
});

app.listen(3001, () => {
  console.log("RAG MCP server on http://localhost:3001/mcp");
});
```

---

## Anti-Patterns

- **Always retrieving** — agentic RAG's key advantage is selective retrieval; don't force retrieval on every query
- **Single retrieval per query** — agents can search multiple times with refined queries; allow iterative retrieval
- **Ignoring retrieval strategy** — default similarity search isn't always best; use MMR for diverse topics, score threshold for precision
- **No source citation** — always instruct the agent to cite retrieved documents
- **Huge k values** — retrieving too many documents floods the context; start with k=3-5
- **Missing tool description** — the agent's decision to retrieve depends on the tool description; make it specific
