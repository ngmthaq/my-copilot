---
name: langchain-getting-started
description: "Installing LangChain packages (langchain, langchain-openai, langchain-core) and configuring environment variables for Azure OpenAI or OpenAI. Use when: setting up a new LangChain project; making your first LLM call; understanding the package ecosystem; configuring .env files. DO NOT USE FOR: chat model configuration (use langchain-chat-models); prompt templates (use langchain-prompts-templates); building agents (use langchain-agents)."
---

# Getting Started with LangChain

## Overview

This skill covers installing the LangChain ecosystem, configuring environment variables, and making your first LLM call.

---

## 1. Installation

### Core Packages

```bash
# Essential — LangChain + OpenAI integration
pip install langchain langchain-openai python-dotenv

# Full ecosystem for the course
pip install langchain langchain-openai langchain-core langchain-community python-dotenv pydantic
```

### Package Reference

| Package                    | Purpose                                         | Install                                |
| -------------------------- | ----------------------------------------------- | -------------------------------------- |
| `langchain`                | Core framework, agents, chains                  | `pip install langchain`                |
| `langchain-openai`         | OpenAI and Azure OpenAI integrations            | `pip install langchain-openai`         |
| `langchain-core`           | Base classes, messages, documents, tools        | `pip install langchain-core`           |
| `langchain-community`      | Community integrations (loaders, vector stores) | `pip install langchain-community`      |
| `langchain-text-splitters` | Text chunking utilities                         | `pip install langchain-text-splitters` |
| `langchain-mcp-adapters`   | MCP protocol integration                        | `pip install langchain-mcp-adapters`   |
| `langgraph`                | Stateful agent workflows                        | `pip install langgraph`                |
| `pydantic`                 | Structured outputs, tool schemas                | `pip install pydantic`                 |
| `python-dotenv`            | Environment variable management                 | `pip install python-dotenv`            |

---

## 2. Environment Configuration

### .env File Setup

```bash
# .env
AI_MODEL=gpt-4o
AI_ENDPOINT=https://your-endpoint.openai.azure.com/openai/v1
AI_API_KEY=your-api-key-here
AI_EMBEDDING_MODEL=text-embedding-ada-002
```

### Loading Environment Variables

```python
import os
from dotenv import load_dotenv

load_dotenv()

model_name = os.getenv("AI_MODEL")
endpoint = os.getenv("AI_ENDPOINT")
api_key = os.getenv("AI_API_KEY")
```

---

## 3. First LLM Call

```python
import os
from dotenv import load_dotenv
from langchain_openai import ChatOpenAI

load_dotenv()

model = ChatOpenAI(
    model=os.getenv("AI_MODEL"),
    base_url=os.getenv("AI_ENDPOINT"),
    api_key=os.getenv("AI_API_KEY"),
)

response = model.invoke("What is LangChain?")
print(response.content)
```

---

## 4. Architecture Overview

LangChain's core components:

| Component     | Description                             | Key Classes                                  |
| ------------- | --------------------------------------- | -------------------------------------------- |
| Chat Models   | Interface to LLMs (OpenAI, Azure, etc.) | `ChatOpenAI`                                 |
| Messages      | Structured conversation turns           | `SystemMessage`, `HumanMessage`, `AIMessage` |
| Prompts       | Reusable prompt templates               | `ChatPromptTemplate`, `PromptTemplate`       |
| Tools         | Functions the LLM can call              | `@tool`, `bind_tools()`                      |
| Agents        | Autonomous reasoning loops              | `create_agent()`                             |
| Documents     | Text + metadata containers              | `Document`                                   |
| Embeddings    | Text-to-vector conversion               | `AzureOpenAIEmbeddings`                      |
| Vector Stores | Embedding storage and similarity search | `InMemoryVectorStore`                        |

### Data Flow

```
User Input → Messages → Chat Model → AI Response
                ↑                         ↓
           Prompt Templates          Tool Calls (optional)
                                         ↓
                                    Tool Execution
                                         ↓
                                    Final Response
```

---

## 5. Anti-Patterns

| Anti-Pattern                                  | Correct Approach                                           |
| --------------------------------------------- | ---------------------------------------------------------- |
| Hardcoding API keys in source code            | Use `.env` files with `python-dotenv`                      |
| Installing only `langchain` without providers | Install provider packages like `langchain-openai`          |
| Skipping `load_dotenv()` call                 | Always call `load_dotenv()` before accessing env vars      |
| Using raw OpenAI SDK instead of LangChain     | Use `ChatOpenAI` for consistent interface across providers |
