---
name: huggingface-inference
description: "Optimizing Hugging Face model inference for speed and efficiency. Use when: quantizing models (bitsandbytes, GPTQ, AWQ); using ONNX Runtime; batched inference; Inference API; Text Generation Inference (TGI); vLLM; Flash Attention; KV cache optimization; model compilation with torch.compile; serving models in production. DO NOT USE FOR: basic model loading and pipelines (use huggingface-transformers); training (use huggingface-fine-tuning)."
---

# Inference Optimization

## Overview

This skill covers techniques for optimizing Hugging Face model inference including quantization, batching, ONNX export, Flash Attention, and production serving with TGI and vLLM.

---

## 1. Quantization with bitsandbytes

### 4-bit Quantization (QLoRA-style)

```python
from transformers import AutoModelForCausalLM, AutoTokenizer, BitsAndBytesConfig
import torch

quantization_config = BitsAndBytesConfig(
    load_in_4bit=True,
    bnb_4bit_quant_type="nf4",              # NormalFloat4 (recommended)
    bnb_4bit_compute_dtype=torch.bfloat16,  # Compute in bfloat16
    bnb_4bit_use_double_quant=True,         # Double quantization (saves ~0.4 bits/param)
)

model = AutoModelForCausalLM.from_pretrained(
    "meta-llama/Llama-3.1-70B-Instruct",
    quantization_config=quantization_config,
    device_map="auto",
)
tokenizer = AutoTokenizer.from_pretrained("meta-llama/Llama-3.1-70B-Instruct")
```

### 8-bit Quantization

```python
quantization_config = BitsAndBytesConfig(load_in_8bit=True)

model = AutoModelForCausalLM.from_pretrained(
    "meta-llama/Llama-3.1-70B-Instruct",
    quantization_config=quantization_config,
    device_map="auto",
)
```

### GPTQ Quantization

```python
from transformers import AutoModelForCausalLM, GPTQConfig

# Load a pre-quantized GPTQ model
model = AutoModelForCausalLM.from_pretrained(
    "TheBloke/Llama-2-7B-GPTQ",
    device_map="auto",
)

# Quantize a model yourself
quantization_config = GPTQConfig(
    bits=4,
    dataset="c4",
    tokenizer=tokenizer,
)

model = AutoModelForCausalLM.from_pretrained(
    "meta-llama/Llama-3.1-8B",
    quantization_config=quantization_config,
    device_map="auto",
)
model.save_pretrained("./llama3-gptq-4bit")
```

### AWQ Quantization

```python
from transformers import AutoModelForCausalLM, AwqConfig

# Load pre-quantized AWQ model
model = AutoModelForCausalLM.from_pretrained(
    "TheBloke/Llama-2-7B-AWQ",
    device_map="auto",
)
```

### Quantization Comparison

| Method             | Bits | Speed    | Quality   | GPU Memory     | Requires Calibration |
| ------------------ | ---- | -------- | --------- | -------------- | -------------------- |
| bitsandbytes 4-bit | 4    | Moderate | Good      | ~75% reduction | No                   |
| bitsandbytes 8-bit | 8    | Good     | Very Good | ~50% reduction | No                   |
| GPTQ               | 4    | Fast     | Good      | ~75% reduction | Yes                  |
| AWQ                | 4    | Fast     | Good      | ~75% reduction | Yes                  |
| None (FP16)        | 16   | Baseline | Best      | Baseline       | No                   |

---

## 2. Flash Attention

```python
# Enable Flash Attention 2 (requires flash-attn package)
# pip install flash-attn --no-build-isolation

model = AutoModelForCausalLM.from_pretrained(
    "meta-llama/Llama-3.1-8B-Instruct",
    torch_dtype=torch.bfloat16,
    device_map="auto",
    attn_implementation="flash_attention_2",
)

# SDPA (Scaled Dot-Product Attention) — built into PyTorch 2.0+
model = AutoModelForCausalLM.from_pretrained(
    "meta-llama/Llama-3.1-8B-Instruct",
    torch_dtype=torch.bfloat16,
    device_map="auto",
    attn_implementation="sdpa",
)
```

### When to Use

| Implementation      | When to Use                                   |
| ------------------- | --------------------------------------------- |
| `flash_attention_2` | Long sequences, Ampere+ GPUs, maximum speed   |
| `sdpa`              | PyTorch 2.0+, broad compatibility, good speed |
| `eager`             | Debugging, custom attention masks, older GPUs |

---

## 3. torch.compile

```python
import torch
from transformers import AutoModelForCausalLM

model = AutoModelForCausalLM.from_pretrained(
    "meta-llama/Llama-3.1-8B-Instruct",
    torch_dtype=torch.bfloat16,
    device_map="auto",
)

# Compile the model (first inference is slow, subsequent are faster)
model = torch.compile(model, mode="reduce-overhead")

# Generate (first call triggers compilation)
outputs = model.generate(**inputs, max_new_tokens=100)
```

---

## 4. Batched Inference

```python
from transformers import AutoTokenizer, AutoModelForCausalLM
import torch

tokenizer = AutoTokenizer.from_pretrained("meta-llama/Llama-3.1-8B-Instruct")
tokenizer.pad_token = tokenizer.eos_token  # Set pad token
tokenizer.padding_side = "left"             # Left-pad for generation

model = AutoModelForCausalLM.from_pretrained(
    "meta-llama/Llama-3.1-8B-Instruct",
    torch_dtype=torch.bfloat16,
    device_map="auto",
)

prompts = [
    "What is machine learning?",
    "Explain quantum computing.",
    "What is the capital of France?",
]

# Tokenize batch with padding
inputs = tokenizer(prompts, return_tensors="pt", padding=True, truncation=True).to(model.device)

# Generate
with torch.no_grad():
    outputs = model.generate(**inputs, max_new_tokens=100)

# Decode
responses = tokenizer.batch_decode(outputs, skip_special_tokens=True)
for prompt, response in zip(prompts, responses):
    print(f"Q: {prompt}\nA: {response}\n")
```

---

## 5. ONNX Runtime

```bash
pip install optimum[onnxruntime-gpu]
```

```python
from optimum.onnxruntime import ORTModelForSequenceClassification, ORTModelForCausalLM
from transformers import AutoTokenizer

# Export and load for classification
model = ORTModelForSequenceClassification.from_pretrained(
    "distilbert-base-uncased-finetuned-sst-2-english",
    export=True,  # Auto-export to ONNX
)
tokenizer = AutoTokenizer.from_pretrained("distilbert-base-uncased-finetuned-sst-2-english")

inputs = tokenizer("I love this!", return_tensors="pt")
outputs = model(**inputs)

# Export and save ONNX model
model.save_pretrained("./onnx-model")

# Load saved ONNX model
model = ORTModelForSequenceClassification.from_pretrained("./onnx-model")

# Use with pipeline
from transformers import pipeline
pipe = pipeline("text-classification", model=model, tokenizer=tokenizer)
result = pipe("This is great!")
```

---

## 6. Inference API (Serverless)

```python
from huggingface_hub import InferenceClient

client = InferenceClient(token="hf_xxxxxxxxxxxxxxxxxxxxx")

# Text generation
response = client.text_generation(
    "Explain quantum computing:",
    model="meta-llama/Llama-3.1-8B-Instruct",
    max_new_tokens=200,
)
print(response)

# Chat completion (OpenAI-compatible)
response = client.chat_completion(
    model="meta-llama/Llama-3.1-8B-Instruct",
    messages=[
        {"role": "user", "content": "What is machine learning?"}
    ],
    max_tokens=200,
)
print(response.choices[0].message.content)

# Streaming
for token in client.text_generation(
    "Once upon a time",
    model="meta-llama/Llama-3.1-8B-Instruct",
    max_new_tokens=100,
    stream=True,
):
    print(token, end="")

# Embeddings
embeddings = client.feature_extraction("Hello world", model="sentence-transformers/all-MiniLM-L6-v2")

# Image generation
image = client.text_to_image("A cat wearing a top hat")
image.save("cat.png")
```

---

## 7. Text Generation Inference (TGI)

```bash
# Run TGI with Docker
docker run --gpus all --shm-size 1g -p 8080:80 \
    -v $PWD/data:/data \
    ghcr.io/huggingface/text-generation-inference:latest \
    --model-id meta-llama/Llama-3.1-8B-Instruct \
    --quantize bitsandbytes-nf4 \
    --max-input-tokens 4096 \
    --max-total-tokens 8192
```

```python
# Client
from huggingface_hub import InferenceClient

client = InferenceClient("http://localhost:8080")

response = client.text_generation(
    "What is deep learning?",
    max_new_tokens=200,
    temperature=0.7,
)
```

---

## 8. vLLM

```bash
pip install vllm
```

```python
from vllm import LLM, SamplingParams

llm = LLM(
    model="meta-llama/Llama-3.1-8B-Instruct",
    dtype="bfloat16",
    tensor_parallel_size=1,  # Number of GPUs
)

sampling_params = SamplingParams(
    temperature=0.7,
    top_p=0.9,
    max_tokens=200,
)

prompts = ["What is machine learning?", "Explain gravity."]
outputs = llm.generate(prompts, sampling_params)

for output in outputs:
    print(output.outputs[0].text)
```

```bash
# Serve as OpenAI-compatible API
vllm serve meta-llama/Llama-3.1-8B-Instruct \
    --dtype bfloat16 \
    --port 8000
```

---

## 9. KV Cache Optimization

```python
# Static KV cache (faster for fixed-length generation)
model.generation_config.cache_implementation = "static"

# Offload KV cache to CPU (for very long sequences)
model.generation_config.cache_implementation = "offloaded"
```

---

## Rules

- **Use 4-bit quantization** for models > 13B on consumer GPUs — enables running 70B models on 24GB VRAM
- **Use Flash Attention 2** when available — 2-4x faster attention, especially for long sequences
- **Left-pad for batched generation** — causal LMs generate tokens from the right, so left-padding is required
- **Use `torch.no_grad()`** during inference — disables gradient computation, saves memory
- **Profile before optimizing** — measure actual bottlenecks before applying techniques
- **Use TGI or vLLM** for production serving — they handle batching, KV cache, and scheduling automatically

---

## Anti-Patterns

| Anti-Pattern                                           | Why It's Wrong                              | Correct Approach                                  |
| ------------------------------------------------------ | ------------------------------------------- | ------------------------------------------------- |
| Running 70B model in FP16 without quantization         | Requires ~140 GB VRAM                       | Use 4-bit quantization (~35 GB)                   |
| Right-padding for batched generation                   | Corrupts generation for shorter sequences   | Set `tokenizer.padding_side = "left"`             |
| Not using `torch.no_grad()` during inference           | Wastes memory on gradient computation       | Wrap inference in `torch.no_grad()`               |
| Installing `flash-attn` without `--no-build-isolation` | Build fails due to dependency conflicts     | Use `pip install flash-attn --no-build-isolation` |
| Building custom serving infrastructure                 | Complex, slow, no batching optimization     | Use TGI or vLLM for production                    |
| Using `torch.compile` for single inference             | Compilation overhead exceeds inference time | Only use when amortized over many inferences      |
