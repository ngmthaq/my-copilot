---
name: ollama-modelfile
description: "Creating custom Ollama models with Modelfile — FROM, PARAMETER, SYSTEM, TEMPLATE, ADAPTER, LICENSE, MESSAGE directives; importing GGUF models; fine-tuned model packaging; custom system prompts; parameter overrides; chat templates with Go templating. Use when: creating a custom model with a specific persona; importing a GGUF file; adjusting default parameters; building specialized assistants; packaging fine-tuned models. DO NOT USE FOR: downloading existing models (use ollama-model-management); API calls (use ollama-rest-api); Python usage (use ollama-python-integration)."
---

# Modelfile

## Overview

A Modelfile defines a custom Ollama model. It specifies the base model, system prompt, parameters, and template format.

---

## 1. Basic Structure

```dockerfile
# Comment
FROM <base-model>
PARAMETER <name> <value>
SYSTEM """<system prompt>"""
TEMPLATE """<template>"""
ADAPTER <path>
LICENSE """<license>"""
MESSAGE <role> <content>
```

---

## 2. FROM — Base Model

```dockerfile
# From an existing Ollama model
FROM llama3.2:3b

# From a local GGUF file
FROM ./my-model.gguf

# From a Safetensors directory
FROM ./my-model/
```

---

## 3. PARAMETER — Model Parameters

```dockerfile
# Generation parameters
PARAMETER temperature 0.7
PARAMETER top_p 0.9
PARAMETER top_k 40
PARAMETER repeat_penalty 1.1
PARAMETER seed 42
PARAMETER stop "<|end|>"
PARAMETER stop "<|user|>"

# Context and GPU
PARAMETER num_ctx 4096
PARAMETER num_gpu 99

# Advanced
PARAMETER num_predict -1
PARAMETER mirostat 0
PARAMETER mirostat_eta 0.1
PARAMETER mirostat_tau 5.0
PARAMETER num_batch 512
PARAMETER num_keep 24
```

### Parameter Reference

| Parameter        | Default | Description                                        |
| ---------------- | ------- | -------------------------------------------------- |
| `temperature`    | 0.8     | Randomness (0.0 = deterministic, 1.0+ = creative)  |
| `top_p`          | 0.9     | Nucleus sampling threshold                         |
| `top_k`          | 40      | Top-K sampling (0 = disabled)                      |
| `repeat_penalty` | 1.1     | Penalize repeated tokens                           |
| `seed`           | 0       | Random seed (0 = random)                           |
| `num_ctx`        | 2048    | Context window size in tokens                      |
| `num_predict`    | -1      | Max tokens to generate (-1 = unlimited, -2 = fill) |
| `num_gpu`        | auto    | Number of layers to offload to GPU (99 = all)      |
| `stop`           | (none)  | Stop sequences (can specify multiple)              |
| `num_batch`      | 512     | Batch size for prompt processing                   |
| `mirostat`       | 0       | Mirostat sampling (0=off, 1=v1, 2=v2)              |
| `mirostat_eta`   | 0.1     | Mirostat learning rate                             |
| `mirostat_tau`   | 5.0     | Mirostat target entropy                            |
| `num_keep`       | 24      | Tokens to keep from initial prompt                 |

---

## 4. SYSTEM — System Prompt

```dockerfile
SYSTEM """You are a senior Python developer. You write clean, well-tested code following PEP 8 conventions. Always include type hints and docstrings."""
```

### Multi-line System Prompt

```dockerfile
SYSTEM """You are a helpful coding assistant specializing in web development.

Rules:
- Always use TypeScript
- Prefer functional programming patterns
- Include error handling in every example
- Explain your reasoning step by step"""
```

---

## 5. TEMPLATE — Chat Template

Templates use Go templating syntax to format messages for the model.

```dockerfile
TEMPLATE """{{ if .System }}<|system|>
{{ .System }}<|end|>
{{ end }}{{ if .Prompt }}<|user|>
{{ .Prompt }}<|end|>
{{ end }}<|assistant|>
{{ .Response }}<|end|>
"""
```

### Template Variables

| Variable                | Description                          |
| ----------------------- | ------------------------------------ |
| `{{ .System }}`         | System message content               |
| `{{ .Prompt }}`         | User message content                 |
| `{{ .Response }}`       | Assistant response content           |
| `{{ .First }}`          | True if first message                |
| `{{ range .Messages }}` | Iterate over messages                |
| `{{ .Role }}`           | Message role (system/user/assistant) |
| `{{ .Content }}`        | Message content                      |

### Chat-Style Template (Messages Array)

```dockerfile
TEMPLATE """{{- range .Messages }}
{{- if eq .Role "system" }}<|system|>
{{ .Content }}<|end|>
{{- else if eq .Role "user" }}<|user|>
{{ .Content }}<|end|>
{{- else if eq .Role "assistant" }}<|assistant|>
{{ .Content }}<|end|>
{{- end }}
{{- end }}<|assistant|>
"""
```

---

## 6. ADAPTER — LoRA/QLoRA Adapters

```dockerfile
# Apply a LoRA adapter
FROM llama3.2:3b
ADAPTER ./my-lora-adapter.gguf

# Apply a Safetensors adapter
ADAPTER ./my-adapter/
```

---

## 7. MESSAGE — Seed Conversations

Pre-seed the model with example conversations:

```dockerfile
MESSAGE user "What is your name?"
MESSAGE assistant "I am CodeHelper, a programming assistant specializing in Python and JavaScript."

MESSAGE user "How should I handle errors?"
MESSAGE assistant "Always use try/except blocks with specific exception types. Log errors with proper context and re-raise when appropriate."
```

---

## 8. LICENSE

```dockerfile
LICENSE """MIT License. Copyright 2024..."""
```

---

## 9. Complete Examples

### Python Expert

```dockerfile
FROM llama3.2:3b
PARAMETER temperature 0.3
PARAMETER num_ctx 4096
PARAMETER stop "<|end|>"

SYSTEM """You are a senior Python developer with expertise in:
- FastAPI and Flask web frameworks
- SQLAlchemy and async database access
- pytest testing patterns
- Clean architecture and SOLID principles

Always provide type hints, error handling, and brief explanations."""
```

### Creative Writer

```dockerfile
FROM llama3.1:8b
PARAMETER temperature 0.9
PARAMETER top_p 0.95
PARAMETER repeat_penalty 1.2
PARAMETER num_ctx 8192

SYSTEM """You are a creative writing assistant. You help with storytelling, world-building, character development, and prose refinement. Your writing is vivid, engaging, and original."""
```

### Code Review Bot

```dockerfile
FROM deepseek-coder-v2:16b
PARAMETER temperature 0.1
PARAMETER num_ctx 8192

SYSTEM """You are a code reviewer. Analyze code for:
1. Bugs and logic errors
2. Security vulnerabilities
3. Performance issues
4. Style and readability

Be direct and actionable. Rate severity as: critical, warning, or suggestion."""
```

---

## 10. Build & Run

```bash
# Create the custom model
ollama create my-python-expert -f ./Modelfile

# Run it
ollama run my-python-expert

# Verify the modelfile
ollama show my-python-expert --modelfile
```

### Import a GGUF File

```bash
# 1. Create a minimal Modelfile
echo 'FROM ./my-model.gguf' > Modelfile

# 2. Build
ollama create my-model -f Modelfile

# 3. Run
ollama run my-model
```
