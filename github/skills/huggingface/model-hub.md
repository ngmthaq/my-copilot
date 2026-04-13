---
name: huggingface-model-hub
description: "Managing models and repositories on the Hugging Face Hub. Use when: uploading models with push_to_hub; creating model cards; managing repos; versioning models; downloading specific files; working with organizations; configuring private repos; using the Hub API programmatically. DO NOT USE FOR: loading models for inference (use huggingface-transformers); fine-tuning (use huggingface-fine-tuning)."
---

# Model Hub

## Overview

This skill covers uploading, downloading, versioning, and managing models and repositories on the Hugging Face Hub using the `huggingface_hub` library and Transformers integration.

---

## 1. Uploading Models

### Using Trainer (Simplest)

```python
from transformers import TrainingArguments, Trainer

training_args = TrainingArguments(
    output_dir="./results",
    push_to_hub=True,
    hub_model_id="my-org/my-model",      # Optional: defaults to output_dir name
    hub_strategy="every_save",            # Upload at every save
    hub_token="hf_xxx",                   # Optional: uses cached token if logged in
    hub_private_repo=True,                # Optional: create private repo
)

trainer = Trainer(model=model, args=training_args, ...)
trainer.train()
trainer.push_to_hub(commit_message="Training complete")
```

### Using save_pretrained + push_to_hub

```python
# Save and push model
model.push_to_hub("my-org/my-model", commit_message="Initial upload")
tokenizer.push_to_hub("my-org/my-model")

# Push with private visibility
model.push_to_hub("my-org/my-model", private=True)

# Save locally first, then push
model.save_pretrained("./my-model")
tokenizer.save_pretrained("./my-model")

from huggingface_hub import HfApi
api = HfApi()
api.upload_folder(
    folder_path="./my-model",
    repo_id="my-org/my-model",
    repo_type="model",
    commit_message="Upload model weights",
)
```

### Using huggingface_hub API

```python
from huggingface_hub import HfApi, create_repo

api = HfApi()

# Create repo
create_repo("my-org/my-model", repo_type="model", private=True)

# Upload a single file
api.upload_file(
    path_or_fileobj="./model.safetensors",
    path_in_repo="model.safetensors",
    repo_id="my-org/my-model",
    commit_message="Upload model weights",
)

# Upload entire folder
api.upload_folder(
    folder_path="./my-model",
    repo_id="my-org/my-model",
    repo_type="model",
    ignore_patterns=["*.pyc", "__pycache__", ".git"],
)

# Upload large files with multi-part upload
api.upload_large_folder(
    folder_path="./large-model",
    repo_id="my-org/my-large-model",
    repo_type="model",
)
```

---

## 2. Downloading Models

```python
from huggingface_hub import hf_hub_download, snapshot_download

# Download a single file
filepath = hf_hub_download(
    repo_id="meta-llama/Llama-3.1-8B",
    filename="config.json",
)

# Download specific files
filepath = hf_hub_download(
    repo_id="meta-llama/Llama-3.1-8B",
    filename="model-00001-of-00004.safetensors",
    local_dir="./llama3",
)

# Download entire repo (snapshot)
local_path = snapshot_download(
    repo_id="meta-llama/Llama-3.1-8B",
    local_dir="./llama3",
)

# Download with pattern filter
local_path = snapshot_download(
    repo_id="meta-llama/Llama-3.1-8B",
    allow_patterns=["*.safetensors", "config.json", "tokenizer*"],
    local_dir="./llama3",
)

# Download specific revision
local_path = snapshot_download(
    repo_id="meta-llama/Llama-3.1-8B",
    revision="v1.0",
    local_dir="./llama3",
)
```

---

## 3. Repository Management

```python
from huggingface_hub import HfApi, create_repo, delete_repo, move_repo, update_repo_visibility

api = HfApi()

# Create repo
create_repo("my-org/my-model", repo_type="model", private=True)

# Create dataset repo
create_repo("my-org/my-dataset", repo_type="dataset")

# Create space
create_repo("my-org/my-app", repo_type="space", space_sdk="gradio")

# List repos
models = api.list_models(author="my-org", sort="downloads", direction=-1)
for model in models:
    print(f"{model.modelId}: {model.downloads} downloads")

# Get repo info
info = api.model_info("meta-llama/Llama-3.1-8B")
print(f"Downloads: {info.downloads}")
print(f"Tags: {info.tags}")
print(f"Pipeline tag: {info.pipeline_tag}")

# Update visibility
update_repo_visibility("my-org/my-model", private=False)

# Delete repo (irreversible)
delete_repo("my-org/my-model", repo_type="model")

# Delete specific files
api.delete_file("old_weights.bin", repo_id="my-org/my-model")
```

---

## 4. Model Cards

### README.md Template

````markdown
---
language:
  - en
license: apache-2.0
library_name: transformers
tags:
  - text-classification
  - sentiment-analysis
datasets:
  - imdb
metrics:
  - accuracy
  - f1
pipeline_tag: text-classification
model-index:
  - name: my-sentiment-model
    results:
      - task:
          type: text-classification
          name: Sentiment Analysis
        dataset:
          name: IMDb
          type: imdb
        metrics:
          - type: accuracy
            value: 0.934
          - type: f1
            value: 0.931
---

# My Sentiment Model

## Model Description

Fine-tuned DistilBERT for binary sentiment classification on the IMDb dataset.

## Intended Use

Sentiment analysis of English movie reviews.

## Training Data

Trained on the [IMDb dataset](https://huggingface.co/datasets/imdb) (25k train, 25k test).

## Training Procedure

- Base model: `distilbert-base-uncased`
- Epochs: 3
- Learning rate: 2e-5
- Batch size: 16

## Evaluation Results

| Metric   | Value |
| -------- | ----- |
| Accuracy | 0.934 |
| F1       | 0.931 |

## How to Use

\```python
from transformers import pipeline
classifier = pipeline("text-classification", model="my-org/my-sentiment-model")
result = classifier("This movie was fantastic!")
\```
````

### Programmatic Model Card

```python
from huggingface_hub import ModelCard, ModelCardData

card_data = ModelCardData(
    language="en",
    license="apache-2.0",
    library_name="transformers",
    tags=["text-classification"],
    datasets=["imdb"],
    metrics=["accuracy"],
    pipeline_tag="text-classification",
)

card = ModelCard.from_template(
    card_data,
    model_id="my-org/my-model",
    model_description="Fine-tuned DistilBERT for sentiment analysis.",
    developers="My Team",
    repo="https://github.com/my-org/my-model",
)

card.push_to_hub("my-org/my-model")
```

---

## 5. Versioning with Tags and Branches

```python
from huggingface_hub import HfApi

api = HfApi()

# Create a tag (version)
api.create_tag("my-org/my-model", tag="v1.0", tag_message="First release")

# Create a branch
api.create_branch("my-org/my-model", branch="experimental")

# Upload to a specific branch
api.upload_folder(
    folder_path="./model-v2",
    repo_id="my-org/my-model",
    revision="experimental",
)

# List tags
refs = api.list_repo_refs("my-org/my-model")
for tag in refs.tags:
    print(f"Tag: {tag.name} -> {tag.target_commit}")

# Load a specific version
from transformers import AutoModel
model = AutoModel.from_pretrained("my-org/my-model", revision="v1.0")
```

---

## 6. Spaces (Gradio / Streamlit)

```python
from huggingface_hub import create_repo

# Create Gradio space
create_repo("my-org/my-demo", repo_type="space", space_sdk="gradio")

# Create Streamlit space
create_repo("my-org/my-demo", repo_type="space", space_sdk="streamlit")

# Upload app files
api.upload_file(
    path_or_fileobj="app.py",
    path_in_repo="app.py",
    repo_id="my-org/my-demo",
    repo_type="space",
)
```

---

## Rules

- **Always include a model card** (README.md) — required for discoverability and responsible AI
- **Use SafeTensors format** for model weights — safer and faster than pickle-based formats
- **Tag releases** instead of overwriting — enables reproducibility and rollback
- **Use organizations** for team models — better access control than personal repos
- **Set `private=True`** for unreleased models — prevents accidental public exposure
- **Include `pipeline_tag`** in model card metadata — enables one-click inference on the Hub

---

## Anti-Patterns

| Anti-Pattern                               | Why It's Wrong                            | Correct Approach                              |
| ------------------------------------------ | ----------------------------------------- | --------------------------------------------- |
| Uploading without a model card             | No documentation, no discoverability      | Always create README.md with metadata         |
| Uploading `.bin` instead of `.safetensors` | Pickle format is insecure, slower to load | Save with `safe_serialization=True`           |
| Overwriting model files without versioning | No rollback, no reproducibility           | Use tags for releases                         |
| Hardcoding Hub token in upload scripts     | Security risk                             | Use `huggingface-cli login` or `HF_TOKEN` env |
| Uploading **pycache** or .git folders      | Pollutes repo with unnecessary files      | Use `ignore_patterns` in `upload_folder()`    |
