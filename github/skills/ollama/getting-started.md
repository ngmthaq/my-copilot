---
name: ollama-getting-started
description: "Installing Ollama on macOS, Linux, and Windows; pulling your first model; running interactive chat; verifying GPU support; understanding the Ollama server daemon. Use when: setting up Ollama for the first time; checking if Ollama is running; troubleshooting installation. DO NOT USE FOR: model customization (use ollama-modelfile); REST API calls (use ollama-rest-api); Python scripting (use ollama-python-integration)."
---

# Getting Started with Ollama

## Overview

Ollama is a tool for running large language models locally. It manages model downloads, GPU acceleration, and serves a local API.

---

## 1. Installation

### macOS

```bash
# Download from official site
# https://ollama.com/download

# Or via Homebrew
brew install ollama
```

### Linux

```bash
curl -fsSL https://ollama.com/install.sh | sh
```

### Windows

Download the installer from [https://ollama.com/download](https://ollama.com/download).

### Docker

```bash
# CPU only
docker run -d -v ollama:/root/.ollama -p 11434:11434 --name ollama ollama/ollama

# NVIDIA GPU
docker run -d --gpus=all -v ollama:/root/.ollama -p 11434:11434 --name ollama ollama/ollama
```

---

## 2. Starting Ollama

```bash
# Start the Ollama server (runs as daemon)
ollama serve

# On macOS, launching the app starts the server automatically
# On Linux with systemd:
sudo systemctl start ollama
sudo systemctl enable ollama   # auto-start on boot
```

### Verify Ollama is Running

```bash
# Check the server
curl http://localhost:11434

# Should return: "Ollama is running"
```

---

## 3. First Model Run

```bash
# Pull and run a model (downloads on first use)
ollama run llama3.2

# Pull a specific size
ollama run llama3.2:1b
ollama run llama3.2:3b

# Run with a prompt directly
ollama run llama3.2 "Explain what Ollama is in one sentence"
```

### Interactive Chat

```
>>> What is a closure in JavaScript?
A closure is a function that retains access to variables from its outer scope...

>>> /bye
```

### Useful Chat Commands

| Command  | Description            |
| -------- | ---------------------- |
| `/bye`   | Exit the chat          |
| `/set`   | Set session parameters |
| `/show`  | Show model info        |
| `/clear` | Clear chat context     |
| `/help`  | Show help              |

---

## 4. Verify GPU Support

```bash
# Check if GPU is detected
ollama ps

# Shows loaded models with GPU layer info:
# NAME          ID           SIZE    PROCESSOR
# llama3.2:3b   abc123...    2.0 GB  100% GPU
```

### GPU Requirements

| GPU Type      | Support              | Notes                        |
| ------------- | -------------------- | ---------------------------- |
| NVIDIA        | CUDA (compute ≥ 5.0) | Most GeForce/RTX cards       |
| AMD           | ROCm                 | Linux only, select GPUs      |
| Apple Silicon | Metal                | M1/M2/M3/M4, automatic       |
| Intel         | Partial              | Limited, check compatibility |

---

## 5. Environment Variables

| Variable                   | Default            | Description                      |
| -------------------------- | ------------------ | -------------------------------- |
| `OLLAMA_HOST`              | `127.0.0.1:11434`  | Server bind address              |
| `OLLAMA_MODELS`            | `~/.ollama/models` | Model storage directory          |
| `OLLAMA_NUM_PARALLEL`      | `1`                | Max concurrent requests          |
| `OLLAMA_MAX_LOADED_MODELS` | `1`                | Max models loaded in memory      |
| `OLLAMA_KEEP_ALIVE`        | `5m`               | How long to keep model in memory |
| `OLLAMA_DEBUG`             | `false`            | Enable debug logging             |
| `OLLAMA_ORIGINS`           | (none)             | Allowed CORS origins             |

### Configure for Remote Access

```bash
# Allow connections from any host
OLLAMA_HOST=0.0.0.0:11434 ollama serve

# Or set in systemd service
sudo systemctl edit ollama
# Add:
# [Service]
# Environment="OLLAMA_HOST=0.0.0.0:11434"
```

---

## 6. Model Storage Locations

| OS      | Default Path                     |
| ------- | -------------------------------- |
| macOS   | `~/.ollama/models`               |
| Linux   | `~/.ollama/models`               |
| Windows | `C:\Users\<user>\.ollama\models` |
| Docker  | `/root/.ollama/models`           |

---

## 7. Quick Verification Checklist

```bash
# 1. Server running?
curl http://localhost:11434

# 2. Can pull a model?
ollama pull llama3.2:1b

# 3. Can run inference?
ollama run llama3.2:1b "Hello, world!"

# 4. GPU working?
ollama ps
```
