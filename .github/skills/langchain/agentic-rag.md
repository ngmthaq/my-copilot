---
name: langchain-agentic-rag
description: "LangChain Agentic RAG — Agentic RAG vs Traditional RAG, retrieval tools from vector stores with @tool, create_agent() with retrieval tools, intelligent search decisions, citations, RAG vs Prompt Engineering decision framework. Use when: building agents that decide when to search documents; combining agents with document retrieval; comparing RAG approaches; deciding between RAG and prompt engineering. DO NOT USE FOR: basic document processing (use langchain-embeddings-search); basic agents without retrieval (use langchain-agents); tool creation (use langchain-tools)."
---

# Building Agentic RAG Systems

## Overview

Agentic RAG combines agents with document retrieval. Unlike Traditional RAG that always searches, Agentic RAG lets the agent decide when retrieval is necessary — answering directly when it has the knowledge, or searching documents when additional context is needed.

---

## 1. Traditional RAG vs Agentic RAG

| Aspect       | Traditional RAG                      | Agentic RAG                               |
| ------------ | ------------------------------------ | ----------------------------------------- |
| Search       | ALWAYS searches every query          | Only searches when needed                 |
| Efficiency   | Wastes API calls on simple questions | Fast for simple, thorough for complex     |
| Cost         | Embedding + search on every query    | Lower cost — searches only when necessary |
| Intelligence | Rigid, predictable pipeline          | Adaptive, makes decisions                 |
| Complexity   | Simple 2-step pipeline               | Requires agent loop                       |

### Traditional RAG Flow

```
User Question → ALWAYS Search → Retrieve Docs → Generate Answer
```

### Agentic RAG Flow

```
User Question → Agent Decides → [Search if needed] → Generate Answer
```

### The Difference in Action

```
"What is 2 + 2?"
  Traditional RAG: 🔍 Searches vector store (wastes time) → Answers "4"
  Agentic RAG:     🧠 Answers directly "4" (no search needed)

"What was Q3 revenue?"
  Traditional RAG: 🔍 Searches vector store → Answers "$1.2M"
  Agentic RAG:     📚 Searches documents → Answers "$1.2M based on Q3 financial report"
```

---

## 2. Traditional RAG Pattern (Baseline)

```python
from langchain_core.messages import SystemMessage, HumanMessage

def traditional_rag(question: str) -> str:
    # Step 1: ALWAYS retrieve documents (even if not needed!)
    retrieved_docs = vector_store.similarity_search(question, k=2)
    context = "\n".join([doc.page_content for doc in retrieved_docs])

    # Step 2: Generate answer with context
    messages = [
        SystemMessage(content="Answer based on the provided context."),
        HumanMessage(content=f"Context:\n{context}\n\nQuestion: {question}"),
    ]
    return model.invoke(messages).content
```

---

## 3. Agentic RAG Pattern

### Step 1: Set Up Vector Store

```python
import os
from dotenv import load_dotenv
from langchain_core.documents import Document
from langchain_core.vectorstores import InMemoryVectorStore
from langchain_openai import AzureOpenAIEmbeddings

load_dotenv()

embeddings = AzureOpenAIEmbeddings(
    azure_endpoint=get_embeddings_endpoint(),
    api_key=os.getenv("AI_API_KEY"),
    model=os.getenv("AI_EMBEDDING_MODEL", "text-embedding-ada-002"),
    api_version="2024-02-01",
)

docs = [
    Document(page_content="Q3 2024 revenue was $1.2 million", metadata={"source": "financials.txt"}),
    Document(page_content="The API uses OAuth 2.0 authentication", metadata={"source": "api-docs.txt"}),
    Document(page_content="Company headquarters is in Seattle, WA", metadata={"source": "about.txt"}),
]

vector_store = InMemoryVectorStore.from_documents(docs, embeddings)
```

### Step 2: Create Retrieval Tool

```python
from langchain_core.tools import tool

@tool
def search_company_docs(query: str) -> str:
    """Search company documentation for specific information about
    revenue, API details, company information, etc.
    Use this when you need to look up specific company data.
    """
    results = vector_store.similarity_search(query, k=2)
    return "\n\n".join([
        f"[{doc.metadata['source']}]: {doc.page_content}"
        for doc in results
    ])
```

### Step 3: Create Agent with Retrieval Tool

```python
from langchain.agents import create_agent
from langchain_openai import ChatOpenAI

model = ChatOpenAI(
    model=os.getenv("AI_MODEL"),
    base_url=os.getenv("AI_ENDPOINT"),
    api_key=os.getenv("AI_API_KEY"),
)

agent = create_agent(
    model,
    tools=[search_company_docs],
    system_prompt=(
        "You are a helpful assistant with access to company documents. "
        "Use the search tool when you need specific company information. "
        "For general knowledge questions, answer directly."
    ),
)
```

### Step 4: Query the Agent

```python
from langchain_core.messages import HumanMessage

queries = [
    "What is 2 + 2?",                    # → Agent answers directly
    "What was Q3 revenue?",              # → Agent searches documents
    "What is the capital of France?",    # → Agent answers directly
    "Where is the company headquarters?", # → Agent searches documents
]

for query in queries:
    response = agent.invoke({"messages": [HumanMessage(content=query)]})
    print(f"Q: {query}")
    print(f"A: {response['messages'][-1].content}\n")
```

---

## 4. RAG vs Prompt Engineering Decision Framework

| Factor           | Prompt Engineering        | RAG                                  |
| ---------------- | ------------------------- | ------------------------------------ |
| Data Size        | Small (fits in prompt)    | Large (1000s of documents)           |
| Update Frequency | Rarely changes            | Frequently updates                   |
| Need Citations   | No                        | Yes                                  |
| Example          | FAQ bot with 20 questions | Customer support with 10,000 manuals |

### Decision Tree

```
1. Does all your data fit easily in the prompt?     → Prompt Engineering
2. Large knowledge base that doesn't fit?           → RAG
3. Data updates frequently?                         → RAG
4. Need source citations?                           → RAG
```

---

## 5. When to Use Each Approach

**Use Traditional RAG when:**

- Every question requires searching your documents
- You want predictable, simple behavior
- Example: "Search our legal database for cases about X"

**Use Agentic RAG when:**

- Questions mix general knowledge and custom data
- You want optimal performance and cost
- Example: "What is the capital of France and what's our Paris office address?"

---

## 6. Anti-Patterns

| Anti-Pattern                                       | Correct Approach                                                     |
| -------------------------------------------------- | -------------------------------------------------------------------- |
| Always searching for every query (traditional RAG) | Use Agentic RAG — let the agent decide when to search                |
| Vague retrieval tool description                   | Be specific: describe what data the tool searches and when to use it |
| Skipping citations from retrieved documents        | Include `[source]` metadata in tool output for attribution           |
| Using RAG when data fits in the prompt             | Use Prompt Engineering for small, static datasets                    |
| Not including metadata in retrieval results        | Return `[source]: content` format so agent can cite sources          |
| No system prompt guiding search vs direct answer   | Tell the agent when to search vs answer from knowledge               |
