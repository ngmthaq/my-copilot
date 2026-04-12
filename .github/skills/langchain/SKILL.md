---
name: langchain
description: "Unified LangChain skill index — covers installation & setup, chat models (ChatOpenAI, messages, streaming, temperature), prompts & templates (ChatPromptTemplate, FewShotChatMessagePromptTemplate, structured outputs), function calling & tools (@tool, bind_tools, Pydantic schemas), agents (create_agent, ReAct pattern, middleware), MCP integration (MultiServerMCPClient, transports, custom servers), documents & embeddings (loaders, splitting, vector stores, semantic search), and agentic RAG (retrieval tools, intelligent decision-making). Use this as the entry point; it delegates to focused sub-skill files for each domain."
---

# LangChain Skill Index

## Sub-Skills Reference

| Domain              | File                                         | When to use                                                                                                                                                |
| ------------------- | -------------------------------------------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Getting Started     | [getting-started.md](getting-started.md)     | Installing LangChain packages; configuring environment variables; first LLM call; understanding architecture and components                                |
| Chat Models         | [chat-models.md](chat-models.md)             | Using ChatOpenAI; message types (System, Human, AI); streaming; temperature and max_tokens; token tracking; init_chat_model(); with_retry()                |
| Prompts & Templates | [prompts-templates.md](prompts-templates.md) | ChatPromptTemplate; PromptTemplate; FewShotChatMessagePromptTemplate; structured outputs with Pydantic; output parsers; message formatting                 |
| Tools               | [tools.md](tools.md)                         | @tool decorator; Pydantic schemas for parameters; bind_tools(); 3-step execution pattern; ToolMessage; multi-tool systems                                  |
| Agents              | [agents.md](agents.md)                       | create_agent(); ReAct pattern (Reason→Act→Observe); manual agent loops; AgentMiddleware; DynamicModelMiddleware; ToolErrorMiddleware; troubleshooting      |
| MCP                 | [mcp.md](mcp.md)                             | Model Context Protocol; MultiServerMCPClient; streamable HTTP and stdio transports; multi-server agents; custom MCP servers; error handling and retries    |
| Embeddings & Search | [embeddings-search.md](embeddings-search.md) | Document loaders; text splitting; chunking strategies; embeddings (AzureOpenAIEmbeddings); vector stores (InMemoryVectorStore); semantic similarity search |
| Agentic RAG         | [agentic-rag.md](agentic-rag.md)             | Agentic RAG vs Traditional RAG; retrieval tools from vector stores; intelligent search decisions; citations; RAG vs Prompt Engineering decision framework  |

---

## Quick Decision Guide

```
What are you trying to do?
│
├── Install LangChain or set up a new project?
│   └── → getting-started.md
│
├── Work with chat models and messages?
│   └── → chat-models.md
│
├── Create prompt templates or structured outputs?
│   └── → prompts-templates.md
│
├── Give an LLM access to external functions?
│   ├── Custom tools you write?           → tools.md
│   └── Tools from MCP servers?           → mcp.md
│
├── Build an autonomous agent?
│   ├── Basic agent with create_agent()?  → agents.md
│   └── Agent that searches documents?    → agentic-rag.md
│
├── Process documents or do semantic search?
│   └── → embeddings-search.md
│
└── Connect to external services via MCP?
    └── → mcp.md
```

---

## How to Use

1. Identify the domain from the table or decision guide above.
2. Open the linked sub-skill file.
3. Each sub-skill contains setup instructions, code patterns, best practices, and anti-patterns.
4. Combine multiple sub-skills when your task spans domains (e.g., tools.md + agents.md for an agent with custom tools).
