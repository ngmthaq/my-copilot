---
name: langchain-retrieval
description: "LangChain retrieval patterns & chains — retrievers, retrieval chains, contextual compression, multi-query retrieval, parent document retrieval, ensemble retrieval, self-query retrieval, conversational retrieval, long-context reorder, citation extraction. Use when: building retrieval pipelines; combining retrieval with LLM generation; implementing advanced retrieval strategies; adding conversational memory to RAG; improving retrieval quality. DO NOT USE FOR: loading documents (use langchain-document-parsers); splitting text (use langchain-chunking-strategies); vector store setup (use langchain-vector-stores); agentic RAG with agents (use langchain-agentic-rag)."
---

# Retrieval Patterns & Chains

## Overview

Retrieval connects vector stores to LLM generation. LangChain provides multiple retrieval strategies — from simple similarity search to advanced patterns like multi-query, contextual compression, and conversational retrieval with memory.

---

## 1. Basic Retriever

Every vector store can be converted to a retriever:

```python
# Simple retriever from vector store
retriever = vector_store.as_retriever(search_kwargs={"k": 4})

# Invoke the retriever
docs = retriever.invoke("What is LangChain?")
for doc in docs:
    print(doc.page_content[:100])
```

### Retriever Search Types

```python
# Similarity (default)
retriever = vector_store.as_retriever(
    search_type="similarity",
    search_kwargs={"k": 4},
)

# Maximum Marginal Relevance (diversity)
retriever = vector_store.as_retriever(
    search_type="mmr",
    search_kwargs={"k": 4, "fetch_k": 20, "lambda_mult": 0.5},
)

# Score threshold (precision)
retriever = vector_store.as_retriever(
    search_type="similarity_score_threshold",
    search_kwargs={"score_threshold": 0.7, "k": 10},
)
```

---

## 2. Basic Retrieval Chain (Stuff Pattern)

The simplest RAG chain: retrieve documents, stuff them into the prompt, generate an answer.

```python
from langchain_core.prompts import ChatPromptTemplate
from langchain_core.runnables import RunnablePassthrough
from langchain_core.output_parsers import StrOutputParser
from langchain_openai import ChatOpenAI

model = ChatOpenAI(model="gpt-4o-mini")

prompt = ChatPromptTemplate.from_messages([
    ("system", "Answer the question based only on the following context:\n\n{context}"),
    ("human", "{question}"),
])

def format_docs(docs):
    return "\n\n".join(doc.page_content for doc in docs)

# RAG chain using LCEL
rag_chain = (
    {"context": retriever | format_docs, "question": RunnablePassthrough()}
    | prompt
    | model
    | StrOutputParser()
)

answer = rag_chain.invoke("What is LangChain?")
print(answer)
```

---

## 3. Retrieval Chain with Sources

```python
from langchain_core.runnables import RunnablePassthrough, RunnableParallel

def format_docs_with_sources(docs):
    formatted = []
    for i, doc in enumerate(docs):
        source = doc.metadata.get("source", "unknown")
        formatted.append(f"[{i+1}] ({source})\n{doc.page_content}")
    return "\n\n".join(formatted)

prompt_with_sources = ChatPromptTemplate.from_messages([
    ("system",
     "Answer the question based on the context below. "
     "Cite sources using [n] notation.\n\n{context}"),
    ("human", "{question}"),
])

rag_chain_with_sources = (
    RunnableParallel(
        context=retriever | format_docs_with_sources,
        question=RunnablePassthrough(),
    )
    | prompt_with_sources
    | model
    | StrOutputParser()
)

answer = rag_chain_with_sources.invoke("What is LangChain?")
```

---

## 4. Multi-Query Retrieval

Generates multiple query variations to improve recall — catches results that a single query might miss.

```python
from langchain.retrievers.multi_query import MultiQueryRetriever
from langchain_openai import ChatOpenAI

llm = ChatOpenAI(model="gpt-4o-mini", temperature=0)

multi_query_retriever = MultiQueryRetriever.from_llm(
    retriever=vector_store.as_retriever(search_kwargs={"k": 4}),
    llm=llm,
)

# Generates 3 query variations, retrieves for each, deduplicates results
docs = multi_query_retriever.invoke("What are the benefits of using LangChain?")
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

```python
from langchain.retrievers import ContextualCompressionRetriever
from langchain.retrievers.document_compressors import LLMChainExtractor
from langchain_openai import ChatOpenAI

llm = ChatOpenAI(model="gpt-4o-mini", temperature=0)

# LLM-based compressor — extracts relevant portions
compressor = LLMChainExtractor.from_llm(llm)

compression_retriever = ContextualCompressionRetriever(
    base_compressor=compressor,
    base_retriever=vector_store.as_retriever(search_kwargs={"k": 6}),
)

# Retrieved docs are compressed to only relevant content
docs = compression_retriever.invoke("What is LangChain?")
```

### Filter-Based Compression (No LLM Cost)

```python
from langchain.retrievers.document_compressors import EmbeddingsFilter
from langchain_openai import OpenAIEmbeddings

embeddings_filter = EmbeddingsFilter(
    embeddings=OpenAIEmbeddings(),
    similarity_threshold=0.7,  # Only keep chunks above threshold
)

compression_retriever = ContextualCompressionRetriever(
    base_compressor=embeddings_filter,
    base_retriever=vector_store.as_retriever(search_kwargs={"k": 10}),
)
```

---

## 6. Parent Document Retrieval

Retrieves small chunks for precision, then returns the larger parent document for full context.

```python
from langchain.retrievers import ParentDocumentRetriever
from langchain_text_splitters import RecursiveCharacterTextSplitter
from langchain.storage import InMemoryStore
from langchain_core.vectorstores import InMemoryVectorStore

# Small chunks for search accuracy
child_splitter = RecursiveCharacterTextSplitter(chunk_size=200, chunk_overlap=50)

# Larger chunks for context
parent_splitter = RecursiveCharacterTextSplitter(chunk_size=1000, chunk_overlap=200)

# Store for parent documents
docstore = InMemoryStore()

parent_retriever = ParentDocumentRetriever(
    vectorstore=InMemoryVectorStore(embeddings),
    docstore=docstore,
    child_splitter=child_splitter,
    parent_splitter=parent_splitter,
)

# Add documents (automatically creates parent-child relationships)
parent_retriever.add_documents(docs)

# Search finds small chunks but returns parent documents
results = parent_retriever.invoke("specific detail query")
# Returns larger parent chunks that contain the matching small chunks
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

Combines multiple retrievers (e.g., vector + keyword) for better results.

```python
from langchain.retrievers import EnsembleRetriever
from langchain_community.retrievers import BM25Retriever

# Keyword-based retriever
bm25_retriever = BM25Retriever.from_documents(chunks, k=4)

# Vector-based retriever
vector_retriever = vector_store.as_retriever(search_kwargs={"k": 4})

# Combine with weights
ensemble_retriever = EnsembleRetriever(
    retrievers=[bm25_retriever, vector_retriever],
    weights=[0.4, 0.6],  # 40% keyword, 60% semantic
)

docs = ensemble_retriever.invoke("LangChain agents tutorial")
```

### Installation

```bash
pip install rank-bm25
```

---

## 8. Self-Query Retrieval

Converts natural language queries into structured filters automatically.

```python
from langchain.retrievers.self_query.base import SelfQueryRetriever
from langchain.chains.query_constructor.schema import AttributeInfo
from langchain_openai import ChatOpenAI

metadata_field_info = [
    AttributeInfo(
        name="category",
        description="The document category: 'technical', 'business', 'legal'",
        type="string",
    ),
    AttributeInfo(
        name="year",
        description="The year the document was published",
        type="integer",
    ),
    AttributeInfo(
        name="author",
        description="The author of the document",
        type="string",
    ),
]

llm = ChatOpenAI(model="gpt-4o-mini", temperature=0)

self_query_retriever = SelfQueryRetriever.from_llm(
    llm=llm,
    vectorstore=vector_store,
    document_contents="Company internal documentation",
    metadata_field_info=metadata_field_info,
)

# Natural language → structured filter + semantic search
docs = self_query_retriever.invoke("technical documents from 2024 about APIs")
# Automatically filters: category="technical", year=2024, semantic search for "APIs"
```

---

## 9. Conversational Retrieval (RAG with Memory)

```python
from langchain_core.prompts import ChatPromptTemplate, MessagesPlaceholder
from langchain_core.messages import HumanMessage, AIMessage

# Prompt with chat history
prompt = ChatPromptTemplate.from_messages([
    ("system",
     "Answer based on the context and chat history. "
     "If you don't know, say so.\n\nContext:\n{context}"),
    MessagesPlaceholder(variable_name="chat_history"),
    ("human", "{question}"),
])

# Contextualize question based on history
contextualize_prompt = ChatPromptTemplate.from_messages([
    ("system",
     "Given the chat history and latest question, "
     "reformulate the question to be standalone."),
    MessagesPlaceholder(variable_name="chat_history"),
    ("human", "{question}"),
])

def contextualize_question(input_dict):
    """Rewrite question using chat history for better retrieval."""
    if not input_dict.get("chat_history"):
        return input_dict["question"]
    chain = contextualize_prompt | model | StrOutputParser()
    return chain.invoke(input_dict)

def format_docs(docs):
    return "\n\n".join(doc.page_content for doc in docs)

# Conversational RAG chain
conversational_rag = (
    RunnablePassthrough.assign(
        context=lambda x: format_docs(
            retriever.invoke(contextualize_question(x))
        )
    )
    | prompt
    | model
    | StrOutputParser()
)

# Usage with chat history
chat_history = []

answer1 = conversational_rag.invoke({
    "question": "What is LangChain?",
    "chat_history": chat_history,
})
chat_history.append(HumanMessage(content="What is LangChain?"))
chat_history.append(AIMessage(content=answer1))

answer2 = conversational_rag.invoke({
    "question": "What tools does it support?",  # "it" → resolved to "LangChain"
    "chat_history": chat_history,
})
```

---

## 10. Long-Context Reorder

When passing many documents to an LLM, documents in the middle get less attention. This reorders documents so the most relevant ones are at the start and end.

```python
from langchain_community.document_transformers import LongContextReorder

reordering = LongContextReorder()

docs = retriever.invoke("query")
reordered_docs = reordering.transform_documents(docs)
# Most relevant docs are now at the start and end (not buried in the middle)
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
| Only using vector search for all queries               | Use ensemble (BM25 + vector) for better coverage             |
| Large k with no quality filtering                      | Combine with score threshold or compression                  |
| Not contextualizing follow-up questions                | Rewrite questions using chat history before retrieval        |
| Using parent retriever with same size parent and child | Parent should be 3-5× larger than child chunks               |
