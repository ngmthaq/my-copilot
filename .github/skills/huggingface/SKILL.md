---
name: huggingface
description: "Unified Hugging Face skill index — covers installation & authentication, Transformers (pipelines, AutoModel, AutoTokenizer), fine-tuning (Trainer API, TrainingArguments), Datasets (loading, processing, streaming), Model Hub (uploading, model cards, versioning), inference optimization (quantization, batching, ONNX), tokenizers (encoding, padding, truncation), Diffusers (Stable Diffusion, schedulers), PEFT (LoRA, QLoRA, adapters), and evaluation (metrics, benchmarks). Use this as the entry point; it delegates to focused sub-skill files for each domain."
---

# Hugging Face Skill Index

## Sub-Skills Reference

| Domain          | File                                     | When to use                                                                                                                                           |
| --------------- | ---------------------------------------- | ----------------------------------------------------------------------------------------------------------------------------------------------------- |
| Getting Started | [getting-started.md](getting-started.md) | Installing transformers/hub libraries; authenticating with HF token; environment setup; first-time configuration; `huggingface-cli` usage             |
| Transformers    | [transformers.md](transformers.md)       | Using pipeline API; loading models with AutoModel/AutoTokenizer; text generation; classification; NER; summarization; translation; question answering |
| Fine-Tuning     | [fine-tuning.md](fine-tuning.md)         | Training or fine-tuning models with Trainer API; TrainingArguments; custom training loops; callbacks; checkpointing; distributed training             |
| Datasets        | [datasets.md](datasets.md)               | Loading datasets from Hub or local files; map/filter/select; streaming; data collators; train/test splits; dataset cards                              |
| Model Hub       | [model-hub.md](model-hub.md)             | Uploading models to Hub; creating model cards; versioning; repo management; `push_to_hub`; private repos; organizations                               |
| Inference       | [inference.md](inference.md)             | Local inference optimization; quantization (bitsandbytes, GPTQ, AWQ); ONNX Runtime; batched inference; Inference API; Text Generation Inference       |
| Tokenizers      | [tokenizers.md](tokenizers.md)           | Tokenizer types (BPE, WordPiece, Unigram); encoding/decoding; padding and truncation strategies; special tokens; custom tokenizers                    |
| Diffusers       | [diffusers.md](diffusers.md)             | Stable Diffusion; image generation; img2img; inpainting; schedulers; ControlNet; LoRA for diffusion; SDXL                                             |
| PEFT            | [peft.md](peft.md)                       | LoRA; QLoRA; prefix tuning; prompt tuning; adapter methods; parameter-efficient fine-tuning; merging adapters                                         |
| Evaluation      | [evaluation.md](evaluation.md)           | Computing metrics (accuracy, F1, BLEU, ROUGE); evaluate library; benchmarks; model comparison; leaderboards                                           |

---

## Quick Decision Guide

```
What are you trying to do?
│
├── Install libraries or authenticate with Hugging Face?
│   └── → getting-started.md
│
├── Run a pre-trained model for inference?
│   ├── Text tasks (generation, classification, NER, QA)?  → transformers.md
│   └── Image generation (Stable Diffusion)?               → diffusers.md
│
├── Fine-tune a model on custom data?
│   ├── Full fine-tuning?                → fine-tuning.md
│   └── Parameter-efficient (LoRA)?      → peft.md
│
├── Load or process a dataset?
│   └── → datasets.md
│
├── Upload a model or manage Hub repos?
│   └── → model-hub.md
│
├── Optimize inference speed or reduce model size?
│   └── → inference.md
│
├── Understand or customize tokenization?
│   └── → tokenizers.md
│
└── Evaluate model performance or compute metrics?
    └── → evaluation.md
```

---

## How to Use

1. **Identify your goal** — use the Quick Decision Guide above or the Sub-Skills table to find the right domain.
2. **Load the sub-skill file** — read the relevant `.md` file (e.g. `fine-tuning.md`) in full before generating code or explanations.
3. **Follow its patterns** — apply the conventions, examples, and anti-patterns shown in the sub-skill.
4. **Load multiple sub-skills** when the task spans domains — for example, fine-tuning requires both `fine-tuning.md` (Trainer API) and `datasets.md` (data loading/processing).

> Sub-skill files are co-located in this folder. Always reference them by their relative path (e.g. `transformers.md`).
