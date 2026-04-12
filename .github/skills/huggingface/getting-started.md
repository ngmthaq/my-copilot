---
name: huggingface-getting-started
description: "Installing Hugging Face libraries (transformers, datasets, hub, accelerate, peft, diffusers) and authenticating with HF tokens. Use when: setting up a new project with Hugging Face; logging in to the Hub; configuring environment variables; using huggingface-cli; troubleshooting installation. DO NOT USE FOR: model inference (use huggingface-transformers); fine-tuning (use huggingface-fine-tuning); dataset loading (use huggingface-datasets)."
---

# Getting Started with Hugging Face

## Overview

This skill covers installing the Hugging Face ecosystem, authenticating with the Hub, and configuring your environment for development.

---

## 1. Installation

### Core Libraries

```bash
# Essential — Transformers + PyTorch
pip install transformers torch

# With TensorFlow backend
pip install transformers tensorflow

# With JAX/Flax backend
pip install transformers jax jaxlib flax

# Full ecosystem
pip install transformers datasets huggingface_hub accelerate evaluate peft diffusers
```

### Individual Packages

| Package           | Purpose                                    | Install                       |
| ----------------- | ------------------------------------------ | ----------------------------- |
| `transformers`    | Models, tokenizers, pipelines              | `pip install transformers`    |
| `datasets`        | Dataset loading and processing             | `pip install datasets`        |
| `huggingface_hub` | Hub API, model uploads/downloads           | `pip install huggingface_hub` |
| `accelerate`      | Distributed training, mixed precision      | `pip install accelerate`      |
| `evaluate`        | Metrics computation                        | `pip install evaluate`        |
| `peft`            | Parameter-efficient fine-tuning (LoRA)     | `pip install peft`            |
| `diffusers`       | Diffusion models (Stable Diffusion)        | `pip install diffusers`       |
| `tokenizers`      | Fast tokenizer implementations             | `pip install tokenizers`      |
| `safetensors`     | Safe model serialization format            | `pip install safetensors`     |
| `bitsandbytes`    | 8-bit/4-bit quantization                   | `pip install bitsandbytes`    |
| `optimum`         | Inference optimization (ONNX, OpenVINO)    | `pip install optimum`         |
| `trl`             | Reinforcement learning from human feedback | `pip install trl`             |

### Version Pinning

```bash
# Pin specific versions in requirements.txt
transformers==4.46.0
datasets==3.1.0
huggingface_hub==0.26.0
accelerate==1.1.0
```

### GPU Requirements

```bash
# Check CUDA availability
python -c "import torch; print(torch.cuda.is_available())"

# Check GPU info
python -c "import torch; print(torch.cuda.get_device_name(0))"
```

---

## 2. Authentication

### Methods

```bash
# Method 1: CLI login (interactive — stores token in ~/.cache/huggingface/token)
huggingface-cli login

# Method 2: CLI login with token directly
huggingface-cli login --token hf_xxxxxxxxxxxxxxxxxxxxx

# Method 3: Environment variable
export HF_TOKEN=hf_xxxxxxxxxxxxxxxxxxxxx
```

### Programmatic Login

```python
from huggingface_hub import login

# Interactive prompt
login()

# Direct token
login(token="hf_xxxxxxxxxxxxxxxxxxxxx")

# From environment variable (reads HF_TOKEN automatically)
# No explicit login needed — most HF libraries check HF_TOKEN
```

### Token Types

| Type         | Scope                            | When to Use                              |
| ------------ | -------------------------------- | ---------------------------------------- |
| Read         | Download models and datasets     | CI/CD, read-only access                  |
| Write        | Upload models, create repos      | Development, model publishing            |
| Fine-grained | Scoped to specific repos/actions | Production, principle of least privilege |

### Rules

- **Never hardcode tokens** in source code — use environment variables or `huggingface-cli login`
- **Use read tokens** in CI/CD pipelines — only write tokens when publishing
- **Use fine-grained tokens** in production — scope to the minimum required permissions
- **Store tokens securely** — use `.env` files (gitignored) or secret managers

---

## 3. CLI Reference

```bash
# Login
huggingface-cli login

# Logout
huggingface-cli logout

# Check current user
huggingface-cli whoami

# Download a model
huggingface-cli download meta-llama/Llama-3-8B --local-dir ./llama3

# Download specific files
huggingface-cli download meta-llama/Llama-3-8B config.json tokenizer.json --local-dir ./llama3

# Upload a folder to Hub
huggingface-cli upload my-org/my-model ./output --repo-type model

# Create a repo
huggingface-cli repo create my-model --type model

# Check environment
huggingface-cli env

# Scan cache
huggingface-cli scan-cache

# Delete cached models
huggingface-cli delete-cache
```

---

## 4. Environment Variables

| Variable                   | Purpose                                                      | Default                |
| -------------------------- | ------------------------------------------------------------ | ---------------------- |
| `HF_TOKEN`                 | Authentication token                                         | None                   |
| `HF_HOME`                  | Root cache directory                                         | `~/.cache/huggingface` |
| `HF_HUB_CACHE`             | Hub cache (models, datasets)                                 | `$HF_HOME/hub`         |
| `TRANSFORMERS_CACHE`       | Transformers model cache (deprecated)                        | `$HF_HUB_CACHE`        |
| `HF_DATASETS_CACHE`        | Datasets cache                                               | `$HF_HOME/datasets`    |
| `HF_HUB_OFFLINE`           | Offline mode (1 = no network calls)                          | `0`                    |
| `HF_HUB_DISABLE_TELEMETRY` | Disable telemetry                                            | `0`                    |
| `TOKENIZERS_PARALLELISM`   | Tokenizer parallelism (set `false` to suppress fork warning) | `true`                 |

```bash
# Example .env file
HF_TOKEN=hf_xxxxxxxxxxxxxxxxxxxxx
HF_HOME=/data/hf_cache
TOKENIZERS_PARALLELISM=false
```

---

## 5. Cache Management

```python
from huggingface_hub import scan_cache_dir

# Scan cache
cache_info = scan_cache_dir()
print(f"Total size: {cache_info.size_on_disk_str}")
for repo in cache_info.repos:
    print(f"{repo.repo_id}: {repo.size_on_disk_str}")
```

```bash
# View cache usage
huggingface-cli scan-cache

# Interactive deletion
huggingface-cli delete-cache

# Symlink cache for shared storage (useful on clusters)
export HF_HUB_CACHE=/shared/hf_cache
```

### Rules

- **Set HF_HOME** on shared machines to a shared directory — avoids duplicate downloads
- **Use offline mode** (`HF_HUB_OFFLINE=1`) in production — ensures no unexpected network calls
- **Clean cache regularly** on CI runners — model weights can consume significant disk space

---

## 6. Verifying Installation

```python
import transformers
import datasets
import huggingface_hub
import torch

print(f"Transformers: {transformers.__version__}")
print(f"Datasets: {datasets.__version__}")
print(f"Hub: {huggingface_hub.__version__}")
print(f"PyTorch: {torch.__version__}")
print(f"CUDA available: {torch.cuda.is_available()}")
if torch.cuda.is_available():
    print(f"GPU: {torch.cuda.get_device_name(0)}")
    print(f"CUDA version: {torch.version.cuda}")
```

---

## Anti-Patterns

| Anti-Pattern                                  | Why It's Wrong                             | Correct Approach                            |
| --------------------------------------------- | ------------------------------------------ | ------------------------------------------- |
| `pip install transformers` without backend    | No deep learning framework installed       | `pip install transformers torch`            |
| Hardcoding `hf_xxx` token in source code      | Security risk, token leak                  | Use `HF_TOKEN` env var or `huggingface-cli` |
| Using `latest` or unpinned versions           | Reproducibility issues across environments | Pin versions in `requirements.txt`          |
| Downloading models on every run in production | Slow startup, network dependency           | Pre-download and set `HF_HUB_OFFLINE=1`     |
| Ignoring `TOKENIZERS_PARALLELISM` warning     | Fork safety warning clutters logs          | Set `TOKENIZERS_PARALLELISM=false`          |
