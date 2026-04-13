---
name: langchainjs
description: "Unified LangChain.js skill index — covers setup & fundamentals, chat models, prompts & structured outputs, function calling & tools, agents, MCP integration, document parsers (PDF, CSV, JSON, HTML, web, directory, GitHub loaders), chunking strategies (recursive, token, markdown, code splitting), vector stores (Chroma, FAISS, Pinecone, PGVector, Qdrant), retrieval patterns (multi-query, contextual compression, parent document, ensemble, conversational RAG), embeddings & semantic search, and agentic RAG. Use this as the entry point; it delegates to focused sub-skill files for each domain."
---

# LangChain.js Skill Index

## Sub-Skills Reference

| Domain                       | File                                                           | When to use                                                                                                           |
| ---------------------------- | -------------------------------------------------------------- | --------------------------------------------------------------------------------------------------------------------- |
| Setup & Fundamentals         | [setup-and-fundamentals.md](setup-and-fundamentals.md)         | Setting up LangChain.js; first LLM call; understanding message types; comparing model providers                       |
| Chat Models                  | [chat-models.md](chat-models.md)                               | Building multi-turn conversations; streaming responses; tuning model parameters; handling errors/retries              |
| Prompts & Outputs            | [prompts-and-outputs.md](prompts-and-outputs.md)               | Creating prompt templates; few-shot prompting; structured outputs with Zod; template composition                      |
| Function Calling & Tools     | [function-calling-tools.md](function-calling-tools.md)         | Defining tools with Zod schemas; binding tools to models; executing tool calls; provider built-in tools               |
| Agents                       | [agents.md](agents.md)                                         | Building ReAct agents; multi-tool orchestration; agent middleware; conversation summarization                         |
| MCP Integration              | [mcp-integration.md](mcp-integration.md)                       | Connecting to MCP servers; HTTP/stdio transports; multi-server agents; building custom MCP servers                    |
| Document Parsers             | [document-parsers.md](document-parsers.md)                     | PDF, CSV, JSON, HTML, DOCX loaders; web scraping (Cheerio, Puppeteer); DirectoryLoader; GitHub/Notion; custom loaders |
| Chunking Strategies          | [chunking-strategies.md](chunking-strategies.md)               | RecursiveCharacterTextSplitter; TokenTextSplitter; MarkdownHeaderTextSplitter; code splitting; chunk size tuning      |
| Vector Stores                | [vector-stores.md](vector-stores.md)                           | MemoryVectorStore; Chroma; FAISS; Pinecone; PGVector; Weaviate; Qdrant; metadata filtering; batch operations          |
| Retrieval                    | [retrieval.md](retrieval.md)                                   | Retrieval chains; multi-query; contextual compression; parent document; ensemble; self-query; conversational RAG      |
| Embeddings & Semantic Search | [embeddings-semantic-search.md](embeddings-semantic-search.md) | Quick-start pipeline: loaders → splitting → embeddings → vector stores → similarity search                            |
| Agentic RAG                  | [agentic-rag.md](agentic-rag.md)                               | Building retrieval-augmented agents; dynamic retrieval strategies; RAG as MCP service                                 |

---

## Quick Decision Guide

```
What is your goal?
│
├─ I need to set up LangChain.js or make my first LLM call
│   └─▶ setup-and-fundamentals.md
│
├─ I need multi-turn conversations, streaming, or model parameter tuning
│   └─▶ chat-models.md
│
├─ I need prompt templates, few-shot examples, or structured JSON output
│   └─▶ prompts-and-outputs.md
│
├─ I need the LLM to call external functions or APIs
│   └─▶ function-calling-tools.md
│
├─ I need an autonomous agent that reasons and acts in a loop
│   └─▶ agents.md
│
├─ I need to connect to MCP servers or build an MCP-powered agent
│   └─▶ mcp-integration.md
│
├─ I need to load documents from files, URLs, or APIs
│   └─▶ document-parsers.md
│
├─ I need to split/chunk documents for embedding
│   └─▶ chunking-strategies.md
│
├─ I need to store and search embeddings
│   ├─ Choose a vector store?            → vector-stores.md
│   └─ Quick end-to-end pipeline?        → embeddings-semantic-search.md
│
├─ I need retrieval chains or advanced RAG patterns
│   ├─ Standard retrieval pipeline?      → retrieval.md
│   └─ Agent-driven retrieval?           → agentic-rag.md
│
└─ I need an agent that retrieves context dynamically before answering
    └─▶ agentic-rag.md
```

---

## How to Use

1. **Identify your goal** — use the Quick Decision Guide above or the Sub-Skills table to find the right domain.
2. **Load the sub-skill file** — read the relevant `.md` file in full before generating code or explanations.
3. **Follow its patterns** — apply the conventions, examples, and anti-patterns shown in the sub-skill.
4. **Load multiple sub-skills** when the task spans domains — for example, building a RAG agent requires both `agents.md` and `embeddings-semantic-search.md` (or use `agentic-rag.md` directly).

> Sub-skill files are co-located in this folder. Always reference them by their relative path (e.g. `agents.md`).
