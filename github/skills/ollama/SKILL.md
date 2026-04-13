---
name: ollama
description: "Unified Ollama skill index — covers installation & setup, model management (pull, list, remove, copy, show), Modelfile authoring (custom models, system prompts, parameters, adapters), REST API (generate, chat, embeddings, blobs, model endpoints), Python library integration (ollama-python, sync/async clients, streaming), LangChain integration (ChatOllama, OllamaEmbeddings, local agents), embeddings (text-embedding models, vector search, RAG pipelines), and performance tuning (GPU layers, context length, concurrency, memory optimization). Use this as the entry point; it delegates to focused sub-skill files for each domain."
---

# Ollama Skill Index

## Sub-Skills Reference

| Domain                | File                                                 | When to use                                                                                                                                        |
| --------------------- | ---------------------------------------------------- | -------------------------------------------------------------------------------------------------------------------------------------------------- |
| Getting Started       | [getting-started.md](getting-started.md)             | Installing Ollama on macOS/Linux/Windows; pulling your first model; running interactive chat; verifying GPU support                                |
| Model Management      | [model-management.md](model-management.md)           | Pulling, listing, removing, copying, inspecting models; model naming conventions; storage locations; model library; quantization variants          |
| Modelfile             | [modelfile.md](modelfile.md)                         | Creating custom models; FROM/PARAMETER/SYSTEM/TEMPLATE/ADAPTER/LICENSE/MESSAGE directives; fine-tuned model import; GGUF integration               |
| REST API              | [rest-api.md](rest-api.md)                           | HTTP endpoints for generate, chat, embeddings, model management; streaming responses; JSON mode; multimodal (vision); raw mode; keep-alive control |
| Python Integration    | [python-integration.md](python-integration.md)       | ollama-python library; sync and async clients; generate, chat, embeddings; streaming; custom client configuration; error handling                  |
| LangChain Integration | [langchain-integration.md](langchain-integration.md) | ChatOllama; OllamaEmbeddings; tool calling with local models; local RAG pipelines; agents with Ollama; structured outputs                          |
| Embeddings            | [embeddings.md](embeddings.md)                       | Text embedding models; nomic-embed-text; mxbai-embed-large; vector stores; similarity search; RAG document pipelines; chunking strategies          |
| Performance Tuning    | [performance-tuning.md](performance-tuning.md)       | GPU layers (num_gpu); context length (num_ctx); concurrency; memory management; batch size; model loading; keep-alive; hardware requirements       |

---

## Quick Decision Guide

```
What are you trying to do?
│
├── Install Ollama or get started?
│   └── → getting-started.md
│
├── Download, list, or remove models?
│   └── → model-management.md
│
├── Create a custom model with system prompt or parameters?
│   └── → modelfile.md
│
├── Call Ollama from an HTTP client (curl, fetch, etc.)?
│   └── → rest-api.md
│
├── Use Ollama from Python?
│   ├── Direct ollama-python library?    → python-integration.md
│   └── Through LangChain?              → langchain-integration.md
│
├── Generate embeddings for search or RAG?
│   ├── Embedding model selection?       → embeddings.md
│   └── LangChain vector pipeline?       → langchain-integration.md
│
└── Optimize speed, memory, or GPU usage?
    └── → performance-tuning.md
```
