---
name: ollama-performance-tuning
description: "Optimizing Ollama performance — GPU layer offloading (num_gpu), context length (num_ctx), concurrent requests (OLLAMA_NUM_PARALLEL), memory management, batch size (num_batch), model keep-alive, hardware requirements, quantization selection, multi-model serving, monitoring. Use when: models run slowly; running out of memory; optimizing for throughput; configuring GPU usage; serving multiple models; choosing between speed and quality. DO NOT USE FOR: installing Ollama (use ollama-getting-started); model downloads (use ollama-model-management); API usage (use ollama-rest-api)."
---

# Performance Tuning

## Overview

Ollama performance depends on GPU/CPU resources, model size, quantization, context length, and concurrency settings.

---

## 1. GPU Offloading

### Control GPU Layers

```dockerfile
# In Modelfile — offload all layers to GPU
PARAMETER num_gpu 99

# CPU only (no GPU)
PARAMETER num_gpu 0

# Partial offload (first 20 layers on GPU)
PARAMETER num_gpu 20
```

### Via API

```bash
curl http://localhost:11434/api/generate -d '{
  "model": "llama3.2",
  "prompt": "Hello",
  "options": {"num_gpu": 99}
}'
```

### Via Python

```python
import ollama

response = ollama.chat(
    model="llama3.2",
    messages=[{"role": "user", "content": "Hello"}],
    options={"num_gpu": 99},
)
```

### GPU Memory Requirements (Approximate)

| Model Size | q4_K_M  | q8_0    | fp16    |
| ---------- | ------- | ------- | ------- |
| 1B         | ~0.8 GB | ~1.2 GB | ~2 GB   |
| 3B         | ~2.0 GB | ~3.5 GB | ~6 GB   |
| 7B         | ~4.5 GB | ~7.5 GB | ~14 GB  |
| 13B        | ~8 GB   | ~14 GB  | ~26 GB  |
| 34B        | ~20 GB  | ~35 GB  | ~68 GB  |
| 70B        | ~40 GB  | ~70 GB  | ~140 GB |

---

## 2. Context Length

Context length directly affects memory usage and speed.

```dockerfile
# Default: 2048
PARAMETER num_ctx 2048

# Larger context (more memory, slower)
PARAMETER num_ctx 4096
PARAMETER num_ctx 8192
PARAMETER num_ctx 16384
PARAMETER num_ctx 32768
```

### Memory Impact

| num_ctx | Additional Memory (7B model) | Use Case            |
| ------- | ---------------------------- | ------------------- |
| 2048    | Baseline                     | Short conversations |
| 4096    | +~0.5 GB                     | Standard chat       |
| 8192    | +~1.0 GB                     | Document analysis   |
| 16384   | +~2.0 GB                     | Long documents      |
| 32768   | +~4.0 GB                     | Very long context   |

### Rule of Thumb

- Start with `num_ctx=2048` (default)
- Increase only if you need longer context
- Each doubling roughly doubles KV-cache memory

---

## 3. Concurrency

### Parallel Requests

```bash
# Allow 4 concurrent requests to the same model
export OLLAMA_NUM_PARALLEL=4

# Allow multiple models loaded simultaneously
export OLLAMA_MAX_LOADED_MODELS=2
```

### Concurrency Impact

| Setting                    | Default | Effect                                         |
| -------------------------- | ------- | ---------------------------------------------- |
| `OLLAMA_NUM_PARALLEL`      | 1       | Requests to same model processed in parallel   |
| `OLLAMA_MAX_LOADED_MODELS` | 1       | Number of models kept in memory simultaneously |

**Trade-off:** More parallel requests = more memory per model (shared KV-cache). Start with 1 and increase based on available memory.

---

## 4. Batch Size

```dockerfile
# Prompt processing batch size
PARAMETER num_batch 512   # default
PARAMETER num_batch 1024  # faster prompt processing, more memory
PARAMETER num_batch 256   # less memory, slower prompt processing
```

- Higher `num_batch` = faster prompt evaluation, more memory
- Lower `num_batch` = slower prompt evaluation, less memory
- Default (512) is good for most cases

---

## 5. Keep-Alive (Model Loading)

Model loading is expensive. Control how long models stay in memory:

```bash
# Environment variable (default: 5m)
export OLLAMA_KEEP_ALIVE=10m

# Per-request
curl http://localhost:11434/api/generate -d '{
  "model": "llama3.2",
  "prompt": "Hello",
  "keep_alive": "30m"
}'

# Keep loaded indefinitely
curl http://localhost:11434/api/generate -d '{
  "model": "llama3.2",
  "prompt": "Hello",
  "keep_alive": "-1"
}'

# Unload immediately after response
curl http://localhost:11434/api/generate -d '{
  "model": "llama3.2",
  "prompt": "Hello",
  "keep_alive": "0"
}'
```

### Recommendations

| Scenario                        | keep_alive | Why                                    |
| ------------------------------- | ---------- | -------------------------------------- |
| Interactive chat session        | `30m`      | Avoid reload between messages          |
| Batch processing                | `0`        | Free memory after each batch           |
| Always-on API server            | `-1`       | Never unload                           |
| Multiple models, limited memory | `1m`       | Quick unload to free memory for others |

---

## 6. Quantization Selection

Choose quantization based on your hardware constraints:

```
Available memory → Choose quantization
│
├── < 4 GB VRAM   → q4_0 (1B-3B models)
├── 4-8 GB VRAM   → q4_K_M (3B-7B models)
├── 8-16 GB VRAM  → q4_K_M (7B-13B) or q8_0 (7B)
├── 16-24 GB VRAM → q8_0 (13B) or q4_K_M (34B)
└── 24+ GB VRAM   → q8_0 (34B) or q4_K_M (70B)
```

### Speed vs Quality

| Priority        | Choose                | Notes                              |
| --------------- | --------------------- | ---------------------------------- |
| Maximum speed   | Smallest model + q4_0 | Sacrifice quality for throughput   |
| Balanced        | q4_K_M (default)      | Best trade-off for most use cases  |
| Maximum quality | Larger model + q8_0   | Sacrifice speed for better outputs |

---

## 7. Monitoring Performance

### Check Running Models

```bash
ollama ps

# Output includes:
# - Model name
# - Memory usage
# - GPU/CPU split
# - Time until unload
```

### Measure Tokens Per Second

From API response:

```python
import ollama

response = ollama.generate(model="llama3.2", prompt="Hello world", stream=False)

eval_count = response["eval_count"]
eval_duration = response["eval_duration"]  # nanoseconds
tokens_per_sec = eval_count / (eval_duration / 1e9)
print(f"Generation speed: {tokens_per_sec:.1f} tokens/sec")

prompt_eval_count = response["prompt_eval_count"]
prompt_eval_duration = response["prompt_eval_duration"]
prompt_tps = prompt_eval_count / (prompt_eval_duration / 1e9)
print(f"Prompt processing: {prompt_tps:.1f} tokens/sec")
```

### System Monitoring

```bash
# GPU utilization (NVIDIA)
watch -n 1 nvidia-smi

# Memory usage
watch -n 1 'ollama ps'

# macOS - Activity Monitor or:
sudo powermetrics --samplers gpu_power
```

---

## 8. Hardware Recommendations

### Minimum Requirements

| Model Size | RAM (CPU) | VRAM (GPU) | Notes                          |
| ---------- | --------- | ---------- | ------------------------------ |
| 1B-3B      | 4 GB      | 2 GB       | Runs on most modern hardware   |
| 7B         | 8 GB      | 6 GB       | Good starting point            |
| 13B        | 16 GB     | 10 GB      | Noticeable quality improvement |
| 34B        | 32 GB     | 24 GB      | Requires decent GPU            |
| 70B        | 64 GB     | 48 GB      | Needs high-end or multi-GPU    |

### Apple Silicon Guide

| Chip      | Unified Memory | Recommended Max Model  |
| --------- | -------------- | ---------------------- |
| M1 (8GB)  | 8 GB           | 7B q4_K_M              |
| M1 (16GB) | 16 GB          | 13B q4_K_M             |
| M2 (24GB) | 24 GB          | 34B q4_K_M or 13B q8_0 |
| M3 Pro    | 18-36 GB       | 34B q4_K_M             |
| M3 Max    | 36-128 GB      | 70B q4_K_M             |
| M4 Ultra  | 128-192 GB     | 70B q8_0 or 405B q4    |

---

## 9. Common Performance Issues

| Symptom                   | Likely Cause                | Fix                                                  |
| ------------------------- | --------------------------- | ---------------------------------------------------- |
| Slow first response       | Model loading from disk     | Use `keep_alive: "-1"` or pre-warm model             |
| Slow generation           | CPU-only inference          | Check `ollama ps` for GPU%, use `num_gpu: 99`        |
| Out of memory             | Model + context too large   | Reduce `num_ctx`, use smaller quant, or model        |
| Slow prompt processing    | Large context, small batch  | Increase `num_batch`                                 |
| Multiple models thrashing | Loading/unloading models    | Increase `OLLAMA_MAX_LOADED_MODELS` or reduce models |
| Degraded quality          | Too aggressive quantization | Try q8_0 instead of q4_0                             |

### Pre-Warm a Model

```bash
# Load model into memory without generating
curl http://localhost:11434/api/generate -d '{
  "model": "llama3.2",
  "keep_alive": "-1"
}'
```

---

## 10. Production Deployment Checklist

```bash
# 1. Set environment variables
export OLLAMA_HOST=0.0.0.0:11434
export OLLAMA_NUM_PARALLEL=4
export OLLAMA_MAX_LOADED_MODELS=1
export OLLAMA_KEEP_ALIVE=-1

# 2. Pre-pull required models
ollama pull llama3.2:3b
ollama pull nomic-embed-text

# 3. Pre-warm models
curl http://localhost:11434/api/generate -d '{"model":"llama3.2:3b","keep_alive":"-1"}'
curl http://localhost:11434/api/embed -d '{"model":"nomic-embed-text","input":"warmup"}'

# 4. Verify GPU is active
ollama ps

# 5. Monitor
watch -n 5 'ollama ps'
```
