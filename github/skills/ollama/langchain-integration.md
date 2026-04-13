---
name: ollama-langchain-integration
description: "Using Ollama with LangChain — ChatOllama, OllamaEmbeddings, OllamaLLM; tool calling with local models; structured outputs; local RAG pipelines; agents with Ollama; streaming; temperature and parameter control; multi-turn conversations. Use when: building LangChain apps with local Ollama models; creating local RAG pipelines; running agents without cloud APIs; using Ollama for embeddings in LangChain. DO NOT USE FOR: direct ollama-python library (use ollama-python-integration); REST API (use ollama-rest-api); non-LangChain Python usage (use ollama-python-integration)."
---

# LangChain Integration

## Overview

LangChain provides `ChatOllama` and `OllamaEmbeddings` classes for seamless integration with local Ollama models.

---

## 1. Installation

```bash
pip install langchain langchain-ollama langchain-core
```

---

## 2. ChatOllama — Chat Model

### Basic Usage

```python
from langchain_ollama import ChatOllama

llm = ChatOllama(
    model="llama3.2",
    base_url="http://localhost:11434",  # default
    temperature=0.7,
)

response = llm.invoke("What is Ollama?")
print(response.content)
```

### With Messages

```python
from langchain_core.messages import SystemMessage, HumanMessage

llm = ChatOllama(model="llama3.2", temperature=0.3)

messages = [
    SystemMessage(content="You are a helpful Python tutor."),
    HumanMessage(content="Explain list comprehensions."),
]

response = llm.invoke(messages)
print(response.content)
```

### Parameters

```python
llm = ChatOllama(
    model="llama3.2",
    base_url="http://localhost:11434",
    temperature=0.7,
    num_ctx=4096,
    num_predict=512,
    top_p=0.9,
    top_k=40,
    repeat_penalty=1.1,
    seed=42,
    keep_alive="5m",
)
```

---

## 3. Streaming

```python
from langchain_ollama import ChatOllama

llm = ChatOllama(model="llama3.2")

for chunk in llm.stream("Write a poem about coding"):
    print(chunk.content, end="", flush=True)
```

### Async Streaming

```python
import asyncio
from langchain_ollama import ChatOllama

async def main():
    llm = ChatOllama(model="llama3.2")
    async for chunk in llm.astream("Write a haiku"):
        print(chunk.content, end="", flush=True)

asyncio.run(main())
```

---

## 4. Structured Outputs

```python
from langchain_ollama import ChatOllama
from pydantic import BaseModel, Field

class CodeReview(BaseModel):
    has_bugs: bool = Field(description="Whether the code has bugs")
    severity: str = Field(description="Bug severity: low, medium, high")
    suggestions: list[str] = Field(description="List of improvement suggestions")

llm = ChatOllama(model="llama3.1:8b", temperature=0)
structured_llm = llm.with_structured_output(CodeReview)

result = structured_llm.invoke(
    "Review this code: def add(a, b): return a + b"
)
print(result.has_bugs)
print(result.suggestions)
```

---

## 5. Tool Calling

```python
from langchain_ollama import ChatOllama
from langchain_core.tools import tool

@tool
def get_weather(location: str) -> str:
    """Get the current weather for a location."""
    return f"Sunny, 22°C in {location}"

@tool
def search_docs(query: str) -> str:
    """Search the documentation for a query."""
    return f"Found 3 results for: {query}"

llm = ChatOllama(model="llama3.1:8b", temperature=0)
llm_with_tools = llm.bind_tools([get_weather, search_docs])

response = llm_with_tools.invoke("What's the weather in Paris?")
print(response.tool_calls)
```

---

## 6. OllamaEmbeddings

```python
from langchain_ollama import OllamaEmbeddings

embeddings = OllamaEmbeddings(
    model="nomic-embed-text",
    base_url="http://localhost:11434",
)

# Single text
vector = embeddings.embed_query("What is Ollama?")
print(f"Dimensions: {len(vector)}")

# Batch
vectors = embeddings.embed_documents([
    "First document about AI",
    "Second document about Python",
    "Third document about databases",
])
print(f"Embedded {len(vectors)} documents")
```

---

## 7. Local RAG Pipeline

```python
from langchain_ollama import ChatOllama, OllamaEmbeddings
from langchain_core.documents import Document
from langchain_core.vectorstores import InMemoryVectorStore
from langchain_core.prompts import ChatPromptTemplate

# 1. Setup embeddings and vector store
embeddings = OllamaEmbeddings(model="nomic-embed-text")
vector_store = InMemoryVectorStore(embeddings)

# 2. Add documents
docs = [
    Document(page_content="Ollama runs LLMs locally on your machine."),
    Document(page_content="Ollama supports NVIDIA, AMD, and Apple Silicon GPUs."),
    Document(page_content="Models are stored in ~/.ollama/models by default."),
]
vector_store.add_documents(docs)

# 3. Create retriever
retriever = vector_store.as_retriever(search_kwargs={"k": 2})

# 4. Setup LLM and prompt
llm = ChatOllama(model="llama3.2", temperature=0)

prompt = ChatPromptTemplate.from_messages([
    ("system", "Answer based on the context below.\n\nContext:\n{context}"),
    ("human", "{question}"),
])

# 5. Query
question = "Where are Ollama models stored?"
relevant_docs = retriever.invoke(question)
context = "\n".join(doc.page_content for doc in relevant_docs)

chain = prompt | llm
response = chain.invoke({"context": context, "question": question})
print(response.content)
```

---

## 8. Agent with Ollama

```python
from langchain_ollama import ChatOllama
from langchain_core.tools import tool
from langgraph.prebuilt import create_react_agent

@tool
def calculator(expression: str) -> str:
    """Evaluate a math expression."""
    try:
        return str(eval(expression))  # Use a safe evaluator in production
    except Exception as e:
        return f"Error: {e}"

@tool
def get_date() -> str:
    """Get the current date."""
    from datetime import date
    return str(date.today())

llm = ChatOllama(model="llama3.1:8b", temperature=0)

agent = create_react_agent(
    model=llm,
    tools=[calculator, get_date],
)

result = agent.invoke(
    {"messages": [{"role": "user", "content": "What is 42 * 17?"}]}
)
print(result["messages"][-1].content)
```

---

## 9. Prompt Templates with Ollama

```python
from langchain_ollama import ChatOllama
from langchain_core.prompts import ChatPromptTemplate

llm = ChatOllama(model="llama3.2", temperature=0.3)

prompt = ChatPromptTemplate.from_messages([
    ("system", "You are a {role} who speaks {style}."),
    ("human", "{question}"),
])

chain = prompt | llm

response = chain.invoke({
    "role": "Python expert",
    "style": "concisely with code examples",
    "question": "How do I read a JSON file?",
})
print(response.content)
```

---

## 10. Using OpenAI Compatibility Layer

```python
from langchain_openai import ChatOpenAI

# Use Ollama via OpenAI-compatible endpoint
llm = ChatOpenAI(
    model="llama3.2",
    base_url="http://localhost:11434/v1",
    api_key="ollama",
)

response = llm.invoke("Hello from OpenAI-compatible endpoint!")
print(response.content)
```

---

## 11. Model Selection Guide

| Task                    | Recommended Model       | Notes                          |
| ----------------------- | ----------------------- | ------------------------------ |
| General chat            | `llama3.2:3b`           | Fast, good quality             |
| Complex reasoning       | `llama3.1:8b`           | Better reasoning, tool calling |
| Code generation         | `deepseek-coder-v2:16b` | Strong code quality            |
| Embeddings              | `nomic-embed-text`      | 768 dims, good retrieval       |
| Vision                  | `llava:7b`              | Image understanding            |
| Structured output/tools | `llama3.1:8b`+          | Needs 8b+ for reliable tools   |
