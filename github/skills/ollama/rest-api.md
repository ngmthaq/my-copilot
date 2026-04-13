---
name: ollama-rest-api
description: "Ollama REST API endpoints — generate completions, chat completions, embeddings, model management (pull, push, create, delete, copy, list, show), blob operations, running models; streaming and non-streaming responses; JSON mode; multimodal image input; raw mode; keep-alive control; OpenAI-compatible endpoint. Use when: calling Ollama from HTTP clients (curl, fetch, axios); building web backends that use Ollama; understanding request/response formats; using the OpenAI compatibility layer. DO NOT USE FOR: Python library usage (use ollama-python-integration); LangChain integration (use ollama-langchain-integration); CLI commands (use ollama-model-management)."
---

# REST API

## Overview

Ollama exposes a REST API on `http://localhost:11434`. All endpoints accept JSON and support streaming.

---

## 1. Generate Completion — `POST /api/generate`

### Non-Streaming

```bash
curl http://localhost:11434/api/generate -d '{
  "model": "llama3.2",
  "prompt": "Why is the sky blue?",
  "stream": false
}'
```

**Response:**

```json
{
  "model": "llama3.2",
  "response": "The sky appears blue because...",
  "done": true,
  "total_duration": 1234567890,
  "load_duration": 123456,
  "prompt_eval_count": 10,
  "eval_count": 50,
  "eval_duration": 987654321
}
```

### Streaming (Default)

```bash
curl http://localhost:11434/api/generate -d '{
  "model": "llama3.2",
  "prompt": "Why is the sky blue?"
}'
```

Each line is a JSON object with a `response` token. The final object has `"done": true`.

### JSON Mode

```bash
curl http://localhost:11434/api/generate -d '{
  "model": "llama3.2",
  "prompt": "List 3 colors as JSON with name and hex fields",
  "format": "json",
  "stream": false
}'
```

### With Images (Multimodal)

```bash
curl http://localhost:11434/api/generate -d '{
  "model": "llava",
  "prompt": "What is in this image?",
  "images": ["<base64-encoded-image>"],
  "stream": false
}'
```

### Parameters

| Field        | Type     | Description                                           |
| ------------ | -------- | ----------------------------------------------------- |
| `model`      | string   | **Required.** Model name                              |
| `prompt`     | string   | The prompt text                                       |
| `images`     | string[] | Base64-encoded images (for multimodal models)         |
| `format`     | string   | `"json"` for JSON output                              |
| `stream`     | boolean  | Stream response (default: `true`)                     |
| `raw`        | boolean  | Skip template formatting                              |
| `system`     | string   | Override system prompt                                |
| `context`    | int[]    | Context from previous response (for conversation)     |
| `keep_alive` | string   | How long to keep model loaded (`"5m"`, `"0"`, `"-1"`) |
| `options`    | object   | Model parameters (temperature, num_ctx, etc.)         |

### Options Object

```json
{
  "options": {
    "temperature": 0.7,
    "top_p": 0.9,
    "top_k": 40,
    "num_ctx": 4096,
    "num_predict": 256,
    "repeat_penalty": 1.1,
    "seed": 42,
    "stop": ["<|end|>"]
  }
}
```

---

## 2. Chat Completion — `POST /api/chat`

### Non-Streaming

```bash
curl http://localhost:11434/api/chat -d '{
  "model": "llama3.2",
  "messages": [
    {"role": "system", "content": "You are a helpful assistant."},
    {"role": "user", "content": "What is Ollama?"}
  ],
  "stream": false
}'
```

**Response:**

```json
{
  "model": "llama3.2",
  "message": {
    "role": "assistant",
    "content": "Ollama is a tool for running LLMs locally..."
  },
  "done": true,
  "total_duration": 1234567890,
  "eval_count": 75
}
```

### Multi-Turn Conversation

```bash
curl http://localhost:11434/api/chat -d '{
  "model": "llama3.2",
  "messages": [
    {"role": "system", "content": "You are a Python expert."},
    {"role": "user", "content": "What is a decorator?"},
    {"role": "assistant", "content": "A decorator is a function that wraps another function..."},
    {"role": "user", "content": "Show me an example."}
  ],
  "stream": false
}'
```

### With Images

```bash
curl http://localhost:11434/api/chat -d '{
  "model": "llava",
  "messages": [
    {
      "role": "user",
      "content": "Describe this image",
      "images": ["<base64-encoded-image>"]
    }
  ],
  "stream": false
}'
```

### Tool Calling

```bash
curl http://localhost:11434/api/chat -d '{
  "model": "llama3.1:8b",
  "messages": [
    {"role": "user", "content": "What is the weather in London?"}
  ],
  "tools": [
    {
      "type": "function",
      "function": {
        "name": "get_weather",
        "description": "Get current weather for a location",
        "parameters": {
          "type": "object",
          "properties": {
            "location": {
              "type": "string",
              "description": "City name"
            }
          },
          "required": ["location"]
        }
      }
    }
  ],
  "stream": false
}'
```

**Response (tool call):**

```json
{
  "message": {
    "role": "assistant",
    "content": "",
    "tool_calls": [
      {
        "function": {
          "name": "get_weather",
          "arguments": { "location": "London" }
        }
      }
    ]
  },
  "done": true
}
```

---

## 3. Embeddings — `POST /api/embed`

```bash
curl http://localhost:11434/api/embed -d '{
  "model": "nomic-embed-text",
  "input": "Ollama is a tool for running LLMs locally"
}'
```

**Response:**

```json
{
  "model": "nomic-embed-text",
  "embeddings": [[0.123, -0.456, 0.789, ...]],
  "total_duration": 123456789
}
```

### Batch Embeddings

```bash
curl http://localhost:11434/api/embed -d '{
  "model": "nomic-embed-text",
  "input": [
    "First document text",
    "Second document text",
    "Third document text"
  ]
}'
```

---

## 4. Model Management Endpoints

### List Models — `GET /api/tags`

```bash
curl http://localhost:11434/api/tags
```

### Show Model Info — `POST /api/show`

```bash
curl http://localhost:11434/api/show -d '{"model": "llama3.2"}'
```

### Pull a Model — `POST /api/pull`

```bash
curl http://localhost:11434/api/pull -d '{
  "model": "llama3.2",
  "stream": false
}'
```

### Create a Model — `POST /api/create`

```bash
curl http://localhost:11434/api/create -d '{
  "model": "my-custom-model",
  "modelfile": "FROM llama3.2\nSYSTEM You are a helpful assistant.",
  "stream": false
}'
```

### Copy a Model — `POST /api/copy`

```bash
curl http://localhost:11434/api/copy -d '{
  "source": "llama3.2",
  "destination": "my-llama"
}'
```

### Delete a Model — `DELETE /api/delete`

```bash
curl -X DELETE http://localhost:11434/api/delete -d '{
  "model": "my-llama"
}'
```

### List Running Models — `GET /api/ps`

```bash
curl http://localhost:11434/api/ps
```

---

## 5. OpenAI-Compatible Endpoints

Ollama provides OpenAI-compatible endpoints for drop-in replacement:

### Chat Completions

```bash
curl http://localhost:11434/v1/chat/completions -d '{
  "model": "llama3.2",
  "messages": [
    {"role": "user", "content": "Hello!"}
  ]
}'
```

### Completions

```bash
curl http://localhost:11434/v1/completions -d '{
  "model": "llama3.2",
  "prompt": "Hello!"
}'
```

### Embeddings

```bash
curl http://localhost:11434/v1/embeddings -d '{
  "model": "nomic-embed-text",
  "input": "Hello world"
}'
```

### List Models

```bash
curl http://localhost:11434/v1/models
```

### Using with OpenAI SDK

```python
from openai import OpenAI

client = OpenAI(
    base_url="http://localhost:11434/v1",
    api_key="ollama",  # any non-empty string
)

response = client.chat.completions.create(
    model="llama3.2",
    messages=[{"role": "user", "content": "Hello!"}],
)
print(response.choices[0].message.content)
```

---

## 6. Keep-Alive Control

Control how long a model stays loaded in memory:

```bash
# Keep loaded for 10 minutes
curl http://localhost:11434/api/generate -d '{
  "model": "llama3.2",
  "prompt": "Hello",
  "keep_alive": "10m"
}'

# Unload immediately after response
curl http://localhost:11434/api/generate -d '{
  "model": "llama3.2",
  "prompt": "Hello",
  "keep_alive": "0"
}'

# Keep loaded indefinitely
curl http://localhost:11434/api/generate -d '{
  "model": "llama3.2",
  "prompt": "Hello",
  "keep_alive": "-1"
}'
```

---

## 7. Response Duration Fields

| Field                  | Description                             |
| ---------------------- | --------------------------------------- |
| `total_duration`       | Total time (nanoseconds)                |
| `load_duration`        | Time to load model (nanoseconds)        |
| `prompt_eval_count`    | Number of tokens in the prompt          |
| `prompt_eval_duration` | Time to process prompt (nanoseconds)    |
| `eval_count`           | Number of tokens generated              |
| `eval_duration`        | Time to generate response (nanoseconds) |

### Calculate Tokens per Second

```
tokens_per_second = eval_count / (eval_duration / 1_000_000_000)
```
