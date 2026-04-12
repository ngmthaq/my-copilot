---
name: langchain-chat-models
description: "Working with LangChain chat models — ChatOpenAI, message types (SystemMessage, HumanMessage, AIMessage), streaming, temperature & max_tokens, token tracking, init_chat_model(), with_retry(), multi-turn conversations. Use when: configuring LLM parameters; building conversations; streaming responses; switching between providers; handling retries. DO NOT USE FOR: prompt templates (use langchain-prompts-templates); tool binding (use langchain-tools); building agents (use langchain-agents)."
---

# Chat Models

## Overview

Chat models are the core interface for interacting with LLMs in LangChain. They accept messages and return AI-generated responses.

---

## 1. Basic Setup

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

## 2. Message Types

LangChain uses typed message objects for structured conversations:

| Message Type    | Import                                              | Purpose                             |
| --------------- | --------------------------------------------------- | ----------------------------------- |
| `SystemMessage` | `from langchain_core.messages import SystemMessage` | Sets behavior/persona for the model |
| `HumanMessage`  | `from langchain_core.messages import HumanMessage`  | User input                          |
| `AIMessage`     | `from langchain_core.messages import AIMessage`     | Model response (for multi-turn)     |
| `ToolMessage`   | `from langchain_core.messages import ToolMessage`   | Tool execution result               |

### Multi-Turn Conversation

```python
from langchain_core.messages import SystemMessage, HumanMessage, AIMessage

messages = [
    SystemMessage(content="You are a helpful Python tutor."),
    HumanMessage(content="What is a list comprehension?"),
    AIMessage(content="A list comprehension is a concise way to create lists..."),
    HumanMessage(content="Can you show me an example?"),
]

response = model.invoke(messages)
print(response.content)
```

### Tuple Shorthand

```python
# Equivalent to using message objects
messages = [
    ("system", "You are a helpful assistant."),
    ("human", "What is Python?"),
]
response = model.invoke(messages)
```

---

## 3. Model Parameters

```python
model = ChatOpenAI(
    model=os.getenv("AI_MODEL"),
    base_url=os.getenv("AI_ENDPOINT"),
    api_key=os.getenv("AI_API_KEY"),
    temperature=0.7,     # 0.0 = deterministic, 1.0 = creative
    max_tokens=500,      # Maximum response length
)
```

| Parameter     | Default | Range           | Description                                     |
| ------------- | ------- | --------------- | ----------------------------------------------- |
| `temperature` | 1.0     | 0.0 – 2.0       | Controls randomness; lower = more deterministic |
| `max_tokens`  | None    | 1 – model limit | Maximum tokens in the response                  |

### Temperature Guide

| Value | Use Case                                     |
| ----- | -------------------------------------------- |
| 0.0   | Code generation, factual Q&A, deterministic  |
| 0.3   | Balanced — some variation, mostly consistent |
| 0.7   | Creative writing, brainstorming              |
| 1.0+  | Maximum creativity, highly varied outputs    |

---

## 4. Streaming

Stream responses token by token for real-time output:

```python
for chunk in model.stream("Explain quantum computing"):
    print(chunk.content, end="", flush=True)
```

### Async Streaming

```python
import asyncio

async def stream_response():
    async for chunk in model.astream("Explain quantum computing"):
        print(chunk.content, end="", flush=True)

asyncio.run(stream_response())
```

---

## 5. Token Tracking

Monitor token usage for cost management:

```python
response = model.invoke("What is AI?")
print(response.usage_metadata)
# {'input_tokens': 11, 'output_tokens': 42, 'total_tokens': 53}
```

---

## 6. Provider-Agnostic Initialization

Use `init_chat_model()` to switch providers without changing code:

```python
from langchain.chat_models import init_chat_model

# Switch providers by changing parameters only
model = init_chat_model(
    model="gpt-4o",
    model_provider="openai",
    api_key=os.getenv("AI_API_KEY"),
    temperature=0.7,
)
```

| Provider  | `model_provider` value | Example model       |
| --------- | ---------------------- | ------------------- |
| OpenAI    | `"openai"`             | `"gpt-4o"`          |
| Azure     | `"azure_openai"`       | `"gpt-4o"`          |
| Anthropic | `"anthropic"`          | `"claude-3-sonnet"` |
| Google    | `"google_genai"`       | `"gemini-pro"`      |

---

## 7. Retry with Built-In Backoff

```python
# Automatic retry with exponential backoff
reliable_model = model.with_retry(stop_after_attempt=3)
response = reliable_model.invoke("What is AI?")
```

---

## 8. Anti-Patterns

| Anti-Pattern                                       | Correct Approach                                                  |
| -------------------------------------------------- | ----------------------------------------------------------------- |
| Building message lists as raw dicts                | Use `SystemMessage`, `HumanMessage`, `AIMessage` objects          |
| Ignoring token usage when calling expensive models | Check `response.usage_metadata` to track costs                    |
| Setting temperature=0 for creative tasks           | Use 0.7+ for brainstorming; 0.0 for deterministic tasks           |
| Creating new model instances per request           | Reuse a single model instance across calls                        |
| Not using `with_retry()` in production             | Wrap model with `model.with_retry()` for automatic error recovery |
