---
name: ollama-model-management
description: "Managing Ollama models — pulling, listing, removing, copying, inspecting, and pushing models; model naming conventions; quantization variants (q4_0, q4_K_M, q8_0, fp16); model library browsing; storage management. Use when: downloading new models; cleaning up disk space; inspecting model details; understanding quantization trade-offs; copying or renaming models. DO NOT USE FOR: creating custom models (use ollama-modelfile); API calls (use ollama-rest-api); Python scripting (use ollama-python-integration)."
---

# Model Management

## Overview

Ollama manages models locally with simple CLI commands. Models are pulled from the Ollama library and stored on disk.

---

## 1. Core Commands

### Pull a Model

```bash
# Pull the default (latest) tag
ollama pull llama3.2

# Pull a specific size/variant
ollama pull llama3.2:1b
ollama pull llama3.2:3b

# Pull a specific quantization
ollama pull llama3.2:3b-instruct-q4_K_M

# Pull by digest
ollama pull llama3.2@sha256:abc123...
```

### List Models

```bash
ollama list

# Output:
# NAME                ID           SIZE    MODIFIED
# llama3.2:3b         abc123def    2.0 GB  2 hours ago
# codellama:7b        def456ghi    3.8 GB  5 days ago
# nomic-embed-text    ghi789jkl    274 MB  1 week ago
```

### Remove a Model

```bash
ollama rm llama3.2:3b
ollama rm codellama:7b
```

### Copy a Model

```bash
# Create a copy with a new name
ollama cp llama3.2:3b my-llama:latest
```

### Show Model Info

```bash
ollama show llama3.2:3b

# Show specific sections
ollama show llama3.2:3b --modelfile     # Show Modelfile
ollama show llama3.2:3b --parameters    # Show parameters
ollama show llama3.2:3b --template      # Show template
ollama show llama3.2:3b --license       # Show license
ollama show llama3.2:3b --system        # Show system prompt
```

### List Running Models

```bash
ollama ps

# Output:
# NAME          ID           SIZE     PROCESSOR     UNTIL
# llama3.2:3b   abc123def    2.0 GB   100% GPU      4 minutes from now
```

---

## 2. Model Naming Convention

```
<model-name>:<tag>

Examples:
  llama3.2                → llama3.2:latest
  llama3.2:3b             → 3-billion parameter variant
  llama3.2:3b-instruct-q4_K_M  → specific quantization
  username/model:tag      → user-published model
```

### Tag Components

| Component    | Description                         | Examples                         |
| ------------ | ----------------------------------- | -------------------------------- |
| Size         | Parameter count                     | `1b`, `3b`, `7b`, `13b`, `70b`   |
| Type         | Instruct, chat, code, text variants | `instruct`, `chat`, `code`       |
| Quantization | Compression level                   | `q4_0`, `q4_K_M`, `q8_0`, `fp16` |

---

## 3. Quantization Variants

| Quantization | Bits | Quality        | Speed   | Memory | When to Use                  |
| ------------ | ---- | -------------- | ------- | ------ | ---------------------------- |
| `q4_0`       | 4    | Lower          | Fastest | Least  | Low-memory environments      |
| `q4_K_M`     | 4    | Good (default) | Fast    | Low    | Best balance for most users  |
| `q5_K_M`     | 5    | Better         | Medium  | Medium | When you need better quality |
| `q8_0`       | 8    | High           | Slower  | More   | Quality-critical tasks       |
| `fp16`       | 16   | Highest        | Slowest | Most   | Research, fine-tuning base   |

### Rule of Thumb

- **Default (no quant specified)**: Usually `q4_K_M` — good for most use cases
- **Constrained memory**: Use `q4_0` or smaller models
- **Quality matters**: Use `q8_0` or `fp16`

---

## 4. Popular Models

### Chat / General Purpose

| Model         | Sizes               | Notes                         |
| ------------- | ------------------- | ----------------------------- |
| `llama3.2`    | 1b, 3b              | Meta's latest small models    |
| `llama3.1`    | 8b, 70b, 405b       | Meta's larger models          |
| `gemma2`      | 2b, 9b, 27b         | Google's open models          |
| `mistral`     | 7b                  | Fast, strong reasoning        |
| `mixtral`     | 8x7b, 8x22b         | Mixture of experts            |
| `phi3`        | mini (3.8b), medium | Microsoft's compact models    |
| `qwen2.5`     | 0.5b–72b            | Alibaba's multilingual models |
| `deepseek-r1` | 1.5b–671b           | Deep reasoning model          |

### Code

| Model               | Sizes        | Notes                  |
| ------------------- | ------------ | ---------------------- |
| `codellama`         | 7b, 13b, 34b | Meta's code model      |
| `deepseek-coder-v2` | 16b, 236b    | Strong code generation |
| `starcoder2`        | 3b, 7b, 15b  | BigCode's code model   |
| `qwen2.5-coder`     | 1.5b–32b     | Alibaba's code model   |

### Embeddings

| Model                    | Dimensions | Notes                           |
| ------------------------ | ---------- | ------------------------------- |
| `nomic-embed-text`       | 768        | Good general-purpose embeddings |
| `mxbai-embed-large`      | 1024       | Higher quality, larger          |
| `all-minilm`             | 384        | Fast, lightweight               |
| `snowflake-arctic-embed` | 1024       | Strong retrieval performance    |

### Vision (Multimodal)

| Model             | Sizes        | Notes                |
| ----------------- | ------------ | -------------------- |
| `llava`           | 7b, 13b, 34b | Visual understanding |
| `llama3.2-vision` | 11b, 90b     | Meta's vision model  |
| `moondream`       | 1.8b         | Tiny vision model    |

---

## 5. Storage Management

```bash
# Check model storage size
du -sh ~/.ollama/models

# List models sorted by size
ollama list | sort -k3 -h

# Remove unused models
ollama rm <model-name>

# Change storage location
export OLLAMA_MODELS=/path/to/custom/directory
```

---

## 6. Pushing Models (Publishing)

```bash
# Login (requires ollama.com account)
# Set up at https://ollama.com/signup

# Tag your model with your username
ollama cp my-custom-model username/my-custom-model

# Push to the library
ollama push username/my-custom-model
```
