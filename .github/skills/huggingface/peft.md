---
name: huggingface-peft
description: "Parameter-Efficient Fine-Tuning (PEFT) with Hugging Face. Use when: applying LoRA or QLoRA to fine-tune large models; prefix tuning; prompt tuning; adapter methods; merging adapters; IA3; training large models on consumer GPUs; reducing trainable parameters. DO NOT USE FOR: full fine-tuning (use huggingface-fine-tuning); inference optimization without training (use huggingface-inference)."
---

# PEFT (Parameter-Efficient Fine-Tuning)

## Overview

This skill covers the Hugging Face `peft` library for fine-tuning large models efficiently by training only a small fraction of parameters using methods like LoRA, QLoRA, prefix tuning, and adapters.

---

## 1. LoRA (Low-Rank Adaptation)

### Basic LoRA

```python
from peft import LoraConfig, get_peft_model, TaskType
from transformers import AutoModelForCausalLM, AutoTokenizer

model_id = "meta-llama/Llama-3.1-8B"
model = AutoModelForCausalLM.from_pretrained(model_id, torch_dtype=torch.bfloat16, device_map="auto")
tokenizer = AutoTokenizer.from_pretrained(model_id)

# Configure LoRA
lora_config = LoraConfig(
    r=16,                          # Rank (trade-off: higher = more capacity, more parameters)
    lora_alpha=32,                 # Scaling factor (typically 2x rank)
    lora_dropout=0.05,             # Dropout for regularization
    bias="none",                   # Don't train biases
    task_type=TaskType.CAUSAL_LM,  # Task type
    target_modules=["q_proj", "k_proj", "v_proj", "o_proj"],  # Which modules to adapt
)

# Apply LoRA
model = get_peft_model(model, lora_config)

# Check trainable parameters
model.print_trainable_parameters()
# trainable params: 6,553,600 || all params: 8,030,261,248 || trainable%: 0.0816
```

### LoRA Parameters Guide

| Parameter        | Description                                | Recommended Values  |
| ---------------- | ------------------------------------------ | ------------------- |
| `r`              | Rank of low-rank decomposition             | 8–64 (16 is common) |
| `lora_alpha`     | Scaling factor (effective scale = alpha/r) | 2x rank (16–128)    |
| `lora_dropout`   | Dropout probability                        | 0.0–0.1             |
| `target_modules` | Modules to apply LoRA to                   | Attention layers    |
| `bias`           | Bias training strategy                     | `"none"` or `"all"` |

### Common Target Modules by Architecture

| Architecture     | Target Modules                         |
| ---------------- | -------------------------------------- |
| LLaMA / Mistral  | `q_proj`, `k_proj`, `v_proj`, `o_proj` |
| GPT-2 / GPT-NeoX | `c_attn`, `c_proj`                     |
| BERT / RoBERTa   | `query`, `key`, `value`                |
| T5               | `q`, `k`, `v`, `o`                     |
| Falcon           | `query_key_value`, `dense`             |

---

## 2. QLoRA (Quantized LoRA)

QLoRA combines 4-bit quantization with LoRA for training large models on consumer GPUs.

```python
from transformers import AutoModelForCausalLM, BitsAndBytesConfig
from peft import LoraConfig, get_peft_model, prepare_model_for_kbit_training
import torch

# 4-bit quantization config
bnb_config = BitsAndBytesConfig(
    load_in_4bit=True,
    bnb_4bit_quant_type="nf4",
    bnb_4bit_compute_dtype=torch.bfloat16,
    bnb_4bit_use_double_quant=True,
)

# Load quantized model
model = AutoModelForCausalLM.from_pretrained(
    "meta-llama/Llama-3.1-70B",
    quantization_config=bnb_config,
    device_map="auto",
)

# Prepare for k-bit training (enables gradient checkpointing, casts norms to float32)
model = prepare_model_for_kbit_training(model)

# Apply LoRA
lora_config = LoraConfig(
    r=16,
    lora_alpha=32,
    lora_dropout=0.05,
    bias="none",
    task_type="CAUSAL_LM",
    target_modules=["q_proj", "k_proj", "v_proj", "o_proj", "gate_proj", "up_proj", "down_proj"],
)

model = get_peft_model(model, lora_config)
model.print_trainable_parameters()
```

### QLoRA Memory Requirements (Approximate)

| Model Size | FP16    | 4-bit QLoRA | Consumer GPU        |
| ---------- | ------- | ----------- | ------------------- |
| 7B         | ~14 GB  | ~6 GB       | RTX 3080 (10 GB)    |
| 13B        | ~26 GB  | ~10 GB      | RTX 3090 (24 GB)    |
| 70B        | ~140 GB | ~40 GB      | 2x RTX 3090 (48 GB) |

---

## 3. Training with PEFT + Trainer

```python
from transformers import Trainer, TrainingArguments, DataCollatorForLanguageModeling

tokenizer.pad_token = tokenizer.eos_token

training_args = TrainingArguments(
    output_dir="./lora-output",
    num_train_epochs=3,
    per_device_train_batch_size=4,
    gradient_accumulation_steps=4,
    learning_rate=2e-4,           # Higher LR for LoRA (vs 2e-5 for full FT)
    lr_scheduler_type="cosine",
    warmup_ratio=0.05,
    bf16=True,
    logging_steps=25,
    save_strategy="epoch",
    save_total_limit=2,
    gradient_checkpointing=True,
    gradient_checkpointing_kwargs={"use_reentrant": False},
    optim="paged_adamw_8bit",     # Memory-efficient optimizer
)

data_collator = DataCollatorForLanguageModeling(tokenizer=tokenizer, mlm=False)

trainer = Trainer(
    model=model,
    args=training_args,
    train_dataset=tokenized_dataset["train"],
    data_collator=data_collator,
)

trainer.train()

# Save LoRA adapter (small — only a few MB)
trainer.save_model("./lora-adapter")
tokenizer.save_pretrained("./lora-adapter")
```

---

## 4. Training with TRL (SFTTrainer)

```python
from trl import SFTTrainer, SFTConfig
from peft import LoraConfig

lora_config = LoraConfig(
    r=16,
    lora_alpha=32,
    lora_dropout=0.05,
    bias="none",
    task_type="CAUSAL_LM",
    target_modules=["q_proj", "k_proj", "v_proj", "o_proj"],
)

sft_config = SFTConfig(
    output_dir="./sft-output",
    num_train_epochs=3,
    per_device_train_batch_size=4,
    gradient_accumulation_steps=4,
    learning_rate=2e-4,
    bf16=True,
    max_seq_length=2048,
    packing=True,          # Pack multiple short examples into one sequence
    dataset_text_field="text",
)

trainer = SFTTrainer(
    model=model,
    args=sft_config,
    train_dataset=dataset["train"],
    peft_config=lora_config,
)

trainer.train()
```

---

## 5. Loading and Using LoRA Adapters

```python
from peft import PeftModel, AutoPeftModelForCausalLM
from transformers import AutoModelForCausalLM, AutoTokenizer

# Method 1: Load adapter on top of base model
base_model = AutoModelForCausalLM.from_pretrained("meta-llama/Llama-3.1-8B", torch_dtype=torch.bfloat16, device_map="auto")
model = PeftModel.from_pretrained(base_model, "./lora-adapter")

# Method 2: Auto loading
model = AutoPeftModelForCausalLM.from_pretrained("./lora-adapter", torch_dtype=torch.bfloat16, device_map="auto")

# Inference
tokenizer = AutoTokenizer.from_pretrained("./lora-adapter")
inputs = tokenizer("Hello, how are you?", return_tensors="pt").to(model.device)
outputs = model.generate(**inputs, max_new_tokens=100)
print(tokenizer.decode(outputs[0], skip_special_tokens=True))
```

---

## 6. Merging Adapters

```python
from peft import PeftModel

# Load base + adapter
base_model = AutoModelForCausalLM.from_pretrained("meta-llama/Llama-3.1-8B", torch_dtype=torch.bfloat16)
peft_model = PeftModel.from_pretrained(base_model, "./lora-adapter")

# Merge LoRA weights into base model
merged_model = peft_model.merge_and_unload()

# Save merged model (full-size, no adapter dependency)
merged_model.save_pretrained("./merged-model")
tokenizer.save_pretrained("./merged-model")

# Push merged model to Hub
merged_model.push_to_hub("my-org/my-merged-model")
```

---

## 7. Multiple Adapters

```python
from peft import PeftModel

# Load base model
model = AutoModelForCausalLM.from_pretrained("meta-llama/Llama-3.1-8B", torch_dtype=torch.bfloat16, device_map="auto")

# Load first adapter
model = PeftModel.from_pretrained(model, "./adapter-1", adapter_name="code")

# Load second adapter
model.load_adapter("./adapter-2", adapter_name="chat")

# Switch between adapters
model.set_adapter("code")    # Use code adapter
model.set_adapter("chat")    # Use chat adapter

# Disable adapters (use base model)
with model.disable_adapter():
    outputs = model.generate(**inputs)
```

---

## 8. Other PEFT Methods

### Prefix Tuning

```python
from peft import PrefixTuningConfig, get_peft_model

config = PrefixTuningConfig(
    task_type="CAUSAL_LM",
    num_virtual_tokens=20,   # Number of virtual prefix tokens
)

model = get_peft_model(model, config)
```

### Prompt Tuning

```python
from peft import PromptTuningConfig, PromptTuningInit, get_peft_model

config = PromptTuningConfig(
    task_type="CAUSAL_LM",
    num_virtual_tokens=20,
    prompt_tuning_init=PromptTuningInit.TEXT,
    prompt_tuning_init_text="Classify the sentiment of the following text:",
    tokenizer_name_or_path=model_id,
)

model = get_peft_model(model, config)
```

### IA3

```python
from peft import IA3Config, get_peft_model

config = IA3Config(
    task_type="CAUSAL_LM",
    target_modules=["k_proj", "v_proj", "down_proj"],
    feedforward_modules=["down_proj"],
)

model = get_peft_model(model, config)
```

### Method Comparison

| Method        | Trainable Params | Quality   | Speed    | Use Case                       |
| ------------- | ---------------- | --------- | -------- | ------------------------------ |
| LoRA          | ~0.1%            | Excellent | Fast     | General fine-tuning            |
| QLoRA         | ~0.1%            | Excellent | Moderate | Large models on consumer GPUs  |
| Prefix Tuning | ~0.01%           | Good      | Fast     | Few-shot adaptation            |
| Prompt Tuning | ~0.001%          | Moderate  | Fastest  | Task-specific prompting        |
| IA3           | ~0.01%           | Good      | Fast     | Few-shot, minimal modification |

---

## Rules

- **Use QLoRA** for models > 13B on consumer GPUs — 4-bit quantization makes 70B models trainable on 24GB VRAM
- **Use `prepare_model_for_kbit_training()`** before applying LoRA to quantized models
- **Set higher learning rate** for LoRA (2e-4) than full fine-tuning (2e-5)
- **Target all attention projections** for best quality — `q_proj`, `k_proj`, `v_proj`, `o_proj`
- **Merge adapters** before production deployment — eliminates runtime overhead of adapter loading
- **Save adapters separately** during training — they're only a few MB vs multi-GB for full models

---

## Anti-Patterns

| Anti-Pattern                                  | Why It's Wrong                        | Correct Approach                              |
| --------------------------------------------- | ------------------------------------- | --------------------------------------------- |
| Full fine-tuning 70B model on single GPU      | Requires ~280 GB VRAM in FP32         | Use QLoRA (4-bit + LoRA)                      |
| Setting `r=256` "for better quality"          | Extreme ranks lose efficiency benefit | Use `r=16-64`, increase if quality is lacking |
| Not calling `prepare_model_for_kbit_training` | Gradient issues with quantized models | Always call it for 4-bit/8-bit models         |
| Using full fine-tuning learning rate for LoRA | 2e-5 is too low for adapter training  | Use 1e-4 to 3e-4 for LoRA                     |
| Deploying with separate adapter files         | Extra loading overhead in production  | Merge adapters with `merge_and_unload()`      |
| Only targeting `q_proj`                       | Misses other attention projections    | Target all attn projections for best results  |
