---
name: langchainjs
description: "Unified LangChain.js skill index — covers setup & fundamentals, chat models, prompts & structured outputs, function calling & tools, agents, MCP integration, embeddings & semantic search, and agentic RAG. Use this as the entry point; it delegates to focused sub-skill files for each domain."
---

# LangChain.js Skill Index

## Sub-Skills Reference

| Domain                       | File                                                           | When to use                                                                                              |
| ---------------------------- | -------------------------------------------------------------- | -------------------------------------------------------------------------------------------------------- |
| Setup & Fundamentals         | [setup-and-fundamentals.md](setup-and-fundamentals.md)         | Setting up LangChain.js; first LLM call; understanding message types; comparing model providers          |
| Chat Models                  | [chat-models.md](chat-models.md)                               | Building multi-turn conversations; streaming responses; tuning model parameters; handling errors/retries |
| Prompts & Outputs            | [prompts-and-outputs.md](prompts-and-outputs.md)               | Creating prompt templates; few-shot prompting; structured outputs with Zod; template composition         |
| Function Calling & Tools     | [function-calling-tools.md](function-calling-tools.md)         | Defining tools with Zod schemas; binding tools to models; executing tool calls; provider built-in tools  |
| Agents                       | [agents.md](agents.md)                                         | Building ReAct agents; multi-tool orchestration; agent middleware; conversation summarization            |
| MCP Integration              | [mcp-integration.md](mcp-integration.md)                       | Connecting to MCP servers; HTTP/stdio transports; multi-server agents; building custom MCP servers       |
| Embeddings & Semantic Search | [embeddings-semantic-search.md](embeddings-semantic-search.md) | Loading documents; splitting text; generating embeddings; vector stores; similarity search               |
| Agentic RAG                  | [agentic-rag.md](agentic-rag.md)                               | Building retrieval-augmented agents; dynamic retrieval strategies; RAG as MCP service                    |

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
├─ I need to load documents, split text, or do semantic search
│   └─▶ embeddings-semantic-search.md
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
