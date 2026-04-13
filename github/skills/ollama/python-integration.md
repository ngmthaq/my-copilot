---
name: ollama-python-integration
description: "Using the ollama-python library — installation, sync and async clients, generate, chat, embeddings, streaming, custom client configuration, model management, error handling, multimodal inputs, tool calling. Use when: calling Ollama from Python scripts; building Python applications with local LLMs; async Ollama usage; streaming responses in Python. DO NOT USE FOR: LangChain integration (use ollama-langchain-integration); REST API with curl/HTTP (use ollama-rest-api); CLI commands (use ollama-model-management)."
---

# Python Integration

## Overview

The `ollama` Python library provides a native interface to the Ollama API with sync and async support.

---

## 1. Installation

```bash
pip install ollama
```

---

## 2. Generate — Simple Completion

### Non-Streaming

```python
import ollama

response = ollama.generate(
    model="llama3.2",
    prompt="Explain what Python decorators are.",
)
print(response["response"])
```

### Streaming

```python
import ollama

stream = ollama.generate(
    model="llama3.2",
    prompt="Explain what Python decorators are.",
    stream=True,
)
for chunk in stream:
    print(chunk["response"], end="", flush=True)
```

---

## 3. Chat — Conversational API

### Single Turn

```python
import ollama

response = ollama.chat(
    model="llama3.2",
    messages=[
        {"role": "system", "content": "You are a helpful assistant."},
        {"role": "user", "content": "What is Ollama?"},
    ],
)
print(response["message"]["content"])
```

### Multi-Turn Conversation

```python
import ollama

messages = [
    {"role": "system", "content": "You are a Python expert."},
]

def chat(user_message: str) -> str:
    messages.append({"role": "user", "content": user_message})
    response = ollama.chat(model="llama3.2", messages=messages)
    assistant_message = response["message"]["content"]
    messages.append({"role": "assistant", "content": assistant_message})
    return assistant_message

print(chat("What is a list comprehension?"))
print(chat("Show me a more complex example."))
```

### Streaming Chat

```python
import ollama

stream = ollama.chat(
    model="llama3.2",
    messages=[{"role": "user", "content": "Write a haiku about coding."}],
    stream=True,
)
for chunk in stream:
    print(chunk["message"]["content"], end="", flush=True)
```

---

## 4. JSON Mode

```python
import json
import ollama

response = ollama.chat(
    model="llama3.2",
    messages=[
        {
            "role": "user",
            "content": "List 3 programming languages with name and year fields.",
        }
    ],
    format="json",
)
data = json.loads(response["message"]["content"])
print(data)
```

---

## 5. Embeddings

```python
import ollama

# Single text
response = ollama.embed(model="nomic-embed-text", input="Hello world")
embedding = response["embeddings"][0]
print(f"Dimensions: {len(embedding)}")

# Batch
response = ollama.embed(
    model="nomic-embed-text",
    input=["First document", "Second document", "Third document"],
)
for i, emb in enumerate(response["embeddings"]):
    print(f"Doc {i}: {len(emb)} dimensions")
```

---

## 6. Multimodal (Vision)

```python
import ollama
import base64
from pathlib import Path

# From file path
response = ollama.chat(
    model="llava",
    messages=[
        {
            "role": "user",
            "content": "What is in this image?",
            "images": ["./photo.jpg"],
        }
    ],
)
print(response["message"]["content"])

# From base64
image_data = base64.b64encode(Path("photo.jpg").read_bytes()).decode()
response = ollama.chat(
    model="llava",
    messages=[
        {
            "role": "user",
            "content": "Describe this image.",
            "images": [image_data],
        }
    ],
)
print(response["message"]["content"])
```

---

## 7. Tool Calling

```python
import ollama

def get_weather(location: str) -> str:
    return f"The weather in {location} is sunny, 22°C."

tools = [
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
                        "description": "City name",
                    }
                },
                "required": ["location"],
            },
        },
    }
]

available_functions = {"get_weather": get_weather}

# Step 1: Send message with tools
response = ollama.chat(
    model="llama3.1:8b",
    messages=[{"role": "user", "content": "What's the weather in Tokyo?"}],
    tools=tools,
)

# Step 2: Handle tool calls
if response["message"].get("tool_calls"):
    for tool_call in response["message"]["tool_calls"]:
        func_name = tool_call["function"]["name"]
        func_args = tool_call["function"]["arguments"]
        result = available_functions[func_name](**func_args)
        print(f"Tool result: {result}")
```

---

## 8. Custom Client

```python
from ollama import Client

# Custom host
client = Client(host="http://192.168.1.100:11434")

response = client.chat(
    model="llama3.2",
    messages=[{"role": "user", "content": "Hello!"}],
)
print(response["message"]["content"])
```

### With Timeout

```python
import httpx
from ollama import Client

client = Client(
    host="http://localhost:11434",
    timeout=httpx.Timeout(300.0, connect=10.0),
)
```

---

## 9. Async Client

```python
import asyncio
from ollama import AsyncClient

async def main():
    client = AsyncClient()

    # Non-streaming
    response = await client.chat(
        model="llama3.2",
        messages=[{"role": "user", "content": "Hello!"}],
    )
    print(response["message"]["content"])

    # Streaming
    stream = await client.chat(
        model="llama3.2",
        messages=[{"role": "user", "content": "Write a poem."}],
        stream=True,
    )
    async for chunk in stream:
        print(chunk["message"]["content"], end="", flush=True)

asyncio.run(main())
```

---

## 10. Model Management from Python

```python
import ollama

# List models
models = ollama.list()
for model in models["models"]:
    print(f"{model['name']} — {model['size'] / 1e9:.1f} GB")

# Pull a model
ollama.pull("llama3.2:1b")

# Show model info
info = ollama.show("llama3.2")
print(info["modelfile"])

# Create a custom model
ollama.create(
    model="my-assistant",
    modelfile="FROM llama3.2\nSYSTEM You are a helpful assistant.",
)

# Copy a model
ollama.copy("llama3.2", "my-llama")

# Delete a model
ollama.delete("my-llama")

# List running models
running = ollama.ps()
print(running)
```

---

## 11. Options / Parameters

```python
import ollama

response = ollama.chat(
    model="llama3.2",
    messages=[{"role": "user", "content": "Write a creative story."}],
    options={
        "temperature": 0.9,
        "top_p": 0.95,
        "num_ctx": 4096,
        "num_predict": 512,
        "repeat_penalty": 1.2,
        "seed": 42,
    },
)
```

---

## 12. Error Handling

```python
import ollama
from ollama import ResponseError

try:
    response = ollama.chat(
        model="nonexistent-model",
        messages=[{"role": "user", "content": "Hello"}],
    )
except ResponseError as e:
    print(f"Ollama error: {e.error}")
    print(f"Status code: {e.status_code}")
except Exception as e:
    print(f"Connection error: {e}")
```

### Common Errors

| Error                 | Cause                             | Fix                                   |
| --------------------- | --------------------------------- | ------------------------------------- |
| `ResponseError` (404) | Model not found                   | Run `ollama pull <model>` first       |
| `ConnectionError`     | Ollama server not running         | Run `ollama serve`                    |
| `TimeoutError`        | Request took too long             | Increase timeout or use smaller model |
| Out of memory         | Model too large for available RAM | Use smaller model or quantization     |
