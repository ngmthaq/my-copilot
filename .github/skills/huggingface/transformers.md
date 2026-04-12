---
name: huggingface-transformers
description: "Using Hugging Face Transformers library for NLP, vision, and multimodal tasks. Use when: running inference with pipeline API; loading models with AutoModel/AutoTokenizer; text generation; text classification; named entity recognition; summarization; translation; question answering; image classification; zero-shot classification; feature extraction. DO NOT USE FOR: fine-tuning models (use huggingface-fine-tuning); optimizing inference speed (use huggingface-inference); image generation with diffusion (use huggingface-diffusers)."
---

# Transformers

## Overview

This skill covers the Transformers library for loading and using pre-trained models across NLP, vision, and multimodal tasks using the pipeline API and Auto classes.

---

## 1. Pipeline API (Quick Start)

The pipeline API is the simplest way to use a pre-trained model for inference.

```python
from transformers import pipeline

# Text generation
generator = pipeline("text-generation", model="meta-llama/Llama-3.1-8B-Instruct")
result = generator("Explain quantum computing in simple terms:", max_new_tokens=200)
print(result[0]["generated_text"])

# Text classification (sentiment)
classifier = pipeline("text-classification", model="distilbert/distilbert-base-uncased-finetuned-sst-2-english")
result = classifier("I love this product!")
# [{'label': 'POSITIVE', 'score': 0.9998}]

# Named Entity Recognition
ner = pipeline("ner", model="dslim/bert-base-NER", aggregation_strategy="simple")
result = ner("Hugging Face is based in New York City.")
# [{'entity_group': 'ORG', 'word': 'Hugging Face', ...}, {'entity_group': 'LOC', 'word': 'New York City', ...}]

# Summarization
summarizer = pipeline("summarization", model="facebook/bart-large-cnn")
result = summarizer(long_text, max_length=130, min_length=30)

# Translation
translator = pipeline("translation_en_to_fr", model="Helsinki-NLP/opus-mt-en-fr")
result = translator("Hello, how are you?")

# Question Answering
qa = pipeline("question-answering", model="deepset/roberta-base-squad2")
result = qa(question="What is the capital of France?", context="France is a country in Europe. Paris is the capital.")

# Zero-Shot Classification
classifier = pipeline("zero-shot-classification", model="facebook/bart-large-mnli")
result = classifier("I need to pay my electricity bill", candidate_labels=["urgent", "finance", "travel"])

# Fill Mask
unmasker = pipeline("fill-mask", model="bert-base-uncased")
result = unmasker("The capital of France is [MASK].")

# Image Classification
classifier = pipeline("image-classification", model="google/vit-base-patch16-224")
result = classifier("image.jpg")

# Feature Extraction (embeddings)
extractor = pipeline("feature-extraction", model="sentence-transformers/all-MiniLM-L6-v2")
embeddings = extractor("This is a sentence.")
```

### Pipeline Tasks Reference

| Task                       | Pipeline String                | Common Models                                     |
| -------------------------- | ------------------------------ | ------------------------------------------------- |
| Text Generation            | `text-generation`              | `meta-llama/Llama-3.1-8B-Instruct`, `gpt2`        |
| Text Classification        | `text-classification`          | `distilbert-base-uncased-finetuned-sst-2-english` |
| Token Classification (NER) | `ner` / `token-classification` | `dslim/bert-base-NER`                             |
| Question Answering         | `question-answering`           | `deepset/roberta-base-squad2`                     |
| Summarization              | `summarization`                | `facebook/bart-large-cnn`, `google/pegasus-xsum`  |
| Translation                | `translation_xx_to_yy`         | `Helsinki-NLP/opus-mt-en-fr`                      |
| Fill Mask                  | `fill-mask`                    | `bert-base-uncased`, `roberta-base`               |
| Zero-Shot Classification   | `zero-shot-classification`     | `facebook/bart-large-mnli`                        |
| Conversational             | `conversational`               | `facebook/blenderbot-400M-distill`                |
| Feature Extraction         | `feature-extraction`           | `sentence-transformers/all-MiniLM-L6-v2`          |
| Image Classification       | `image-classification`         | `google/vit-base-patch16-224`                     |
| Object Detection           | `object-detection`             | `facebook/detr-resnet-50`                         |
| Image Segmentation         | `image-segmentation`           | `facebook/mask2former-swin-base-coco-panoptic`    |
| Automatic Speech Recog.    | `automatic-speech-recognition` | `openai/whisper-large-v3`                         |

---

## 2. Auto Classes

Auto classes automatically select the correct model architecture based on the checkpoint name.

### Loading Models and Tokenizers

```python
from transformers import AutoTokenizer, AutoModel, AutoModelForCausalLM, AutoModelForSequenceClassification

# Load tokenizer
tokenizer = AutoTokenizer.from_pretrained("bert-base-uncased")

# Load base model (no task-specific head)
model = AutoModel.from_pretrained("bert-base-uncased")

# Load model for causal language modeling (text generation)
model = AutoModelForCausalLM.from_pretrained("meta-llama/Llama-3.1-8B-Instruct")

# Load model for sequence classification
model = AutoModelForSequenceClassification.from_pretrained(
    "distilbert-base-uncased",
    num_labels=3,
)

# Load with specific dtype and device
model = AutoModelForCausalLM.from_pretrained(
    "meta-llama/Llama-3.1-8B-Instruct",
    torch_dtype=torch.float16,
    device_map="auto",
)
```

### Auto Classes Reference

| Class                                | Task                                    |
| ------------------------------------ | --------------------------------------- |
| `AutoModel`                          | Base model (no head)                    |
| `AutoModelForCausalLM`               | Text generation                         |
| `AutoModelForSeq2SeqLM`              | Seq-to-seq (translation, summarization) |
| `AutoModelForSequenceClassification` | Text classification                     |
| `AutoModelForTokenClassification`    | NER, POS tagging                        |
| `AutoModelForQuestionAnswering`      | Extractive QA                           |
| `AutoModelForMaskedLM`               | Fill-mask                               |
| `AutoModelForImageClassification`    | Image classification                    |
| `AutoModelForObjectDetection`        | Object detection                        |
| `AutoModelForSpeechSeq2Seq`          | Speech recognition                      |
| `AutoTokenizer`                      | Tokenizer                               |
| `AutoFeatureExtractor`               | Image/audio preprocessing               |
| `AutoProcessor`                      | Multimodal preprocessing                |
| `AutoConfig`                         | Model configuration                     |

---

## 3. Text Generation

### Basic Generation

```python
from transformers import AutoTokenizer, AutoModelForCausalLM
import torch

model_id = "meta-llama/Llama-3.1-8B-Instruct"
tokenizer = AutoTokenizer.from_pretrained(model_id)
model = AutoModelForCausalLM.from_pretrained(
    model_id,
    torch_dtype=torch.float16,
    device_map="auto",
)

# Encode input
inputs = tokenizer("The meaning of life is", return_tensors="pt").to(model.device)

# Generate
outputs = model.generate(
    **inputs,
    max_new_tokens=100,
    temperature=0.7,
    top_p=0.9,
    do_sample=True,
)

# Decode output
text = tokenizer.decode(outputs[0], skip_special_tokens=True)
print(text)
```

### Chat Template (Instruct Models)

```python
messages = [
    {"role": "system", "content": "You are a helpful assistant."},
    {"role": "user", "content": "Explain quantum computing simply."},
]

# Apply chat template
input_ids = tokenizer.apply_chat_template(
    messages,
    add_generation_prompt=True,
    return_tensors="pt",
).to(model.device)

outputs = model.generate(
    input_ids,
    max_new_tokens=256,
    temperature=0.7,
    top_p=0.9,
    do_sample=True,
)

# Decode only the new tokens
response = tokenizer.decode(outputs[0][input_ids.shape[-1]:], skip_special_tokens=True)
print(response)
```

### Generation Parameters

| Parameter              | Description                                     | Typical Value     |
| ---------------------- | ----------------------------------------------- | ----------------- |
| `max_new_tokens`       | Maximum number of tokens to generate            | 100–2048          |
| `temperature`          | Randomness (0 = deterministic, higher = random) | 0.1–1.0           |
| `top_p`                | Nucleus sampling threshold                      | 0.9–0.95          |
| `top_k`                | Top-k sampling                                  | 50                |
| `do_sample`            | Enable sampling (False = greedy)                | True for creative |
| `num_beams`            | Beam search width                               | 1–5               |
| `repetition_penalty`   | Penalize repeated tokens                        | 1.0–1.5           |
| `no_repeat_ngram_size` | Block repeated n-grams                          | 2–3               |

---

## 4. Streaming Generation

```python
from transformers import TextStreamer, TextIteratorStreamer
from threading import Thread

# Simple streaming to stdout
streamer = TextStreamer(tokenizer, skip_prompt=True, skip_special_tokens=True)
model.generate(**inputs, max_new_tokens=256, streamer=streamer)

# Iterator-based streaming (for web apps)
streamer = TextIteratorStreamer(tokenizer, skip_prompt=True, skip_special_tokens=True)
generation_kwargs = dict(inputs, max_new_tokens=256, streamer=streamer)

thread = Thread(target=model.generate, kwargs=generation_kwargs)
thread.start()

for text_chunk in streamer:
    print(text_chunk, end="", flush=True)
```

---

## 5. Device and Dtype Management

```python
import torch
from transformers import AutoModelForCausalLM

# Automatic device mapping (recommended for large models)
model = AutoModelForCausalLM.from_pretrained(
    "meta-llama/Llama-3.1-8B-Instruct",
    device_map="auto",              # Automatically distributes across GPUs/CPU
    torch_dtype=torch.float16,      # Half precision (saves 50% memory)
)

# Explicit device placement
model = AutoModelForCausalLM.from_pretrained("gpt2").to("cuda:0")

# BFloat16 (better numerical stability on Ampere+ GPUs)
model = AutoModelForCausalLM.from_pretrained(
    "meta-llama/Llama-3.1-8B-Instruct",
    torch_dtype=torch.bfloat16,
    device_map="auto",
)

# CPU only
model = AutoModelForCausalLM.from_pretrained("gpt2", device_map="cpu")
```

### Rules

- **Use `device_map="auto"`** for models larger than your single GPU — Accelerate splits layers across devices
- **Use `torch.float16`** or `torch.bfloat16` for inference — full `float32` wastes memory with negligible quality gain
- **Prefer `bfloat16`** on Ampere+ GPUs (A100, RTX 30xx/40xx) — better numerical range than `float16`
- **Set `torch_dtype` at load time** — converting after loading doubles peak memory

---

## 6. Saving and Loading Models Locally

```python
# Save model and tokenizer
model.save_pretrained("./my-model")
tokenizer.save_pretrained("./my-model")

# Load from local path
model = AutoModelForCausalLM.from_pretrained("./my-model")
tokenizer = AutoTokenizer.from_pretrained("./my-model")
```

---

## Anti-Patterns

| Anti-Pattern                                      | Why It's Wrong                                       | Correct Approach                              |
| ------------------------------------------------- | ---------------------------------------------------- | --------------------------------------------- |
| Loading in `float32` for inference                | Wastes GPU memory, no quality benefit                | Use `torch_dtype=torch.float16` or `bfloat16` |
| Not using `device_map="auto"` for large models    | Manual device placement is error-prone               | Use `device_map="auto"` with Accelerate       |
| Decoding without `skip_special_tokens=True`       | Output contains `<s>`, `</s>`, `[PAD]` tokens        | Always set `skip_special_tokens=True`         |
| Using `model.generate()` without `max_new_tokens` | May generate until max model length (slow, wasteful) | Always set `max_new_tokens`                   |
| Using base model for instruction following        | Base models are not instruction-tuned                | Use `-Instruct` or `-Chat` variants           |
| Ignoring chat templates for instruct models       | Wrong prompt format degrades quality                 | Use `tokenizer.apply_chat_template()`         |
