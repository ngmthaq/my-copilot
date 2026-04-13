---
name: huggingface-fine-tuning
description: "Fine-tuning Hugging Face models with the Trainer API and custom training loops. Use when: training a model on custom data; configuring TrainingArguments; using callbacks; checkpointing; resuming training; distributed training with Accelerate; mixed precision training; gradient accumulation; learning rate scheduling. DO NOT USE FOR: parameter-efficient fine-tuning like LoRA (use huggingface-peft); dataset preparation (use huggingface-datasets); inference optimization (use huggingface-inference)."
---

# Fine-Tuning

## Overview

This skill covers full fine-tuning of Hugging Face models using the Trainer API and custom PyTorch training loops, including distributed training, mixed precision, and best practices.

---

## 1. Trainer API (Recommended)

### Basic Text Classification

```python
from transformers import (
    AutoTokenizer,
    AutoModelForSequenceClassification,
    Trainer,
    TrainingArguments,
)
from datasets import load_dataset

# Load dataset
dataset = load_dataset("imdb")

# Load tokenizer and model
tokenizer = AutoTokenizer.from_pretrained("distilbert-base-uncased")
model = AutoModelForSequenceClassification.from_pretrained(
    "distilbert-base-uncased",
    num_labels=2,
)

# Tokenize dataset
def tokenize_fn(examples):
    return tokenizer(examples["text"], padding="max_length", truncation=True, max_length=512)

tokenized_dataset = dataset.map(tokenize_fn, batched=True)

# Define training arguments
training_args = TrainingArguments(
    output_dir="./results",
    num_train_epochs=3,
    per_device_train_batch_size=16,
    per_device_eval_batch_size=64,
    learning_rate=2e-5,
    weight_decay=0.01,
    eval_strategy="epoch",
    save_strategy="epoch",
    load_best_model_at_end=True,
    metric_for_best_model="accuracy",
    logging_dir="./logs",
    logging_steps=100,
    fp16=True,
    push_to_hub=False,
)

# Define metrics
import evaluate
accuracy_metric = evaluate.load("accuracy")

def compute_metrics(eval_pred):
    logits, labels = eval_pred
    predictions = logits.argmax(axis=-1)
    return accuracy_metric.compute(predictions=predictions, references=labels)

# Create Trainer
trainer = Trainer(
    model=model,
    args=training_args,
    train_dataset=tokenized_dataset["train"],
    eval_dataset=tokenized_dataset["test"],
    compute_metrics=compute_metrics,
)

# Train
trainer.train()

# Evaluate
results = trainer.evaluate()
print(results)

# Save
trainer.save_model("./final-model")
tokenizer.save_pretrained("./final-model")
```

---

## 2. TrainingArguments Reference

### Essential Parameters

| Parameter                       | Description                        | Typical Value      |
| ------------------------------- | ---------------------------------- | ------------------ |
| `output_dir`                    | Directory for checkpoints and logs | `"./results"`      |
| `num_train_epochs`              | Number of training epochs          | 1–5                |
| `per_device_train_batch_size`   | Batch size per GPU for training    | 8–32               |
| `per_device_eval_batch_size`    | Batch size per GPU for evaluation  | 32–64              |
| `learning_rate`                 | Initial learning rate              | 1e-5 to 5e-5       |
| `weight_decay`                  | L2 regularization                  | 0.01–0.1           |
| `warmup_steps` / `warmup_ratio` | Learning rate warmup               | 100–500 / 0.05–0.1 |

### Evaluation & Saving

| Parameter                | Description                                | Typical Value        |
| ------------------------ | ------------------------------------------ | -------------------- |
| `eval_strategy`          | When to evaluate (`"epoch"`, `"steps"`)    | `"epoch"`            |
| `eval_steps`             | Evaluate every N steps (if strategy=steps) | 500                  |
| `save_strategy`          | When to save (`"epoch"`, `"steps"`)        | `"epoch"`            |
| `save_total_limit`       | Maximum checkpoints to keep                | 2–3                  |
| `load_best_model_at_end` | Load best checkpoint after training        | `True`               |
| `metric_for_best_model`  | Metric to use for best model selection     | `"accuracy"`, `"f1"` |
| `greater_is_better`      | Whether higher metric = better             | `True` for accuracy  |

### Performance & Memory

| Parameter                     | Description                       | Typical Value           |
| ----------------------------- | --------------------------------- | ----------------------- |
| `fp16`                        | Use FP16 mixed precision          | `True` (NVIDIA GPUs)    |
| `bf16`                        | Use BF16 mixed precision          | `True` (Ampere+ GPUs)   |
| `gradient_accumulation_steps` | Accumulate gradients over N steps | 2–8                     |
| `gradient_checkpointing`      | Trade compute for memory          | `True` for large models |
| `dataloader_num_workers`      | Parallel data loading workers     | 4–8                     |
| `optim`                       | Optimizer                         | `"adamw_torch"`         |

### Logging

| Parameter       | Description               | Typical Value              |
| --------------- | ------------------------- | -------------------------- |
| `logging_dir`   | TensorBoard log directory | `"./logs"`                 |
| `logging_steps` | Log every N steps         | 50–100                     |
| `report_to`     | Logging integrations      | `"tensorboard"`, `"wandb"` |

---

## 3. Causal LM Fine-Tuning (Text Generation)

```python
from transformers import (
    AutoTokenizer,
    AutoModelForCausalLM,
    Trainer,
    TrainingArguments,
    DataCollatorForLanguageModeling,
)
from datasets import load_dataset

model_id = "meta-llama/Llama-3.1-8B"
tokenizer = AutoTokenizer.from_pretrained(model_id)
tokenizer.pad_token = tokenizer.eos_token  # Required for padding

model = AutoModelForCausalLM.from_pretrained(
    model_id,
    torch_dtype=torch.bfloat16,
    device_map="auto",
)

# Load and tokenize dataset
dataset = load_dataset("your-dataset")

def tokenize_fn(examples):
    return tokenizer(
        examples["text"],
        truncation=True,
        max_length=2048,
    )

tokenized_dataset = dataset.map(tokenize_fn, batched=True, remove_columns=dataset["train"].column_names)

# Data collator handles dynamic padding and label creation
data_collator = DataCollatorForLanguageModeling(tokenizer=tokenizer, mlm=False)

training_args = TrainingArguments(
    output_dir="./results",
    num_train_epochs=1,
    per_device_train_batch_size=2,
    gradient_accumulation_steps=8,  # Effective batch size = 2 * 8 = 16
    learning_rate=2e-5,
    lr_scheduler_type="cosine",
    warmup_ratio=0.05,
    bf16=True,
    gradient_checkpointing=True,
    save_strategy="steps",
    save_steps=500,
    save_total_limit=3,
    logging_steps=50,
)

trainer = Trainer(
    model=model,
    args=training_args,
    train_dataset=tokenized_dataset["train"],
    data_collator=data_collator,
)

trainer.train()
```

---

## 4. Seq2Seq Fine-Tuning (Summarization / Translation)

```python
from transformers import (
    AutoTokenizer,
    AutoModelForSeq2SeqLM,
    Seq2SeqTrainer,
    Seq2SeqTrainingArguments,
    DataCollatorForSeq2Seq,
)

model_id = "google/flan-t5-base"
tokenizer = AutoTokenizer.from_pretrained(model_id)
model = AutoModelForSeq2SeqLM.from_pretrained(model_id)

def preprocess_fn(examples):
    inputs = tokenizer(examples["source"], max_length=512, truncation=True)
    labels = tokenizer(text_target=examples["target"], max_length=128, truncation=True)
    inputs["labels"] = labels["input_ids"]
    return inputs

tokenized_dataset = dataset.map(preprocess_fn, batched=True)
data_collator = DataCollatorForSeq2Seq(tokenizer, model=model)

training_args = Seq2SeqTrainingArguments(
    output_dir="./results",
    num_train_epochs=3,
    per_device_train_batch_size=8,
    per_device_eval_batch_size=16,
    learning_rate=3e-5,
    predict_with_generate=True,   # Use generate() during eval
    generation_max_length=128,
    eval_strategy="epoch",
    save_strategy="epoch",
    fp16=True,
)

trainer = Seq2SeqTrainer(
    model=model,
    args=training_args,
    train_dataset=tokenized_dataset["train"],
    eval_dataset=tokenized_dataset["validation"],
    data_collator=data_collator,
    compute_metrics=compute_metrics,
)

trainer.train()
```

---

## 5. Custom Training Loop

```python
import torch
from torch.utils.data import DataLoader
from transformers import AutoTokenizer, AutoModelForSequenceClassification, get_scheduler
from tqdm import tqdm

# Setup
model_id = "distilbert-base-uncased"
tokenizer = AutoTokenizer.from_pretrained(model_id)
model = AutoModelForSequenceClassification.from_pretrained(model_id, num_labels=2)
device = torch.device("cuda" if torch.cuda.is_available() else "cpu")
model.to(device)

# DataLoader
train_dataloader = DataLoader(tokenized_dataset["train"], shuffle=True, batch_size=16)

# Optimizer and scheduler
optimizer = torch.optim.AdamW(model.parameters(), lr=2e-5, weight_decay=0.01)
num_training_steps = len(train_dataloader) * 3  # 3 epochs
lr_scheduler = get_scheduler("linear", optimizer=optimizer, num_warmup_steps=100, num_training_steps=num_training_steps)

# Training loop
model.train()
for epoch in range(3):
    total_loss = 0
    for batch in tqdm(train_dataloader, desc=f"Epoch {epoch + 1}"):
        batch = {k: v.to(device) for k, v in batch.items()}
        outputs = model(**batch)
        loss = outputs.loss

        loss.backward()
        torch.nn.utils.clip_grad_norm_(model.parameters(), max_norm=1.0)
        optimizer.step()
        lr_scheduler.step()
        optimizer.zero_grad()

        total_loss += loss.item()

    avg_loss = total_loss / len(train_dataloader)
    print(f"Epoch {epoch + 1} — Avg Loss: {avg_loss:.4f}")
```

---

## 6. Callbacks

```python
from transformers import TrainerCallback, EarlyStoppingCallback

# Built-in early stopping
trainer = Trainer(
    ...,
    callbacks=[EarlyStoppingCallback(early_stopping_patience=3)],
)

# Custom callback
class LoggingCallback(TrainerCallback):
    def on_log(self, args, state, control, logs=None, **kwargs):
        if logs:
            print(f"Step {state.global_step}: {logs}")

    def on_epoch_end(self, args, state, control, **kwargs):
        print(f"Epoch {state.epoch} completed")

    def on_save(self, args, state, control, **kwargs):
        print(f"Checkpoint saved at step {state.global_step}")
```

---

## 7. Resuming Training

```python
# Resume from a checkpoint
trainer.train(resume_from_checkpoint="./results/checkpoint-1500")

# Resume from latest checkpoint
trainer.train(resume_from_checkpoint=True)
```

---

## 8. Distributed Training with Accelerate

```bash
# Configure accelerate (interactive)
accelerate config

# Launch training script
accelerate launch train.py

# Launch with specific config
accelerate launch --num_processes=4 --mixed_precision=bf16 train.py

# Multi-GPU on single machine
accelerate launch --multi_gpu --num_processes=4 train.py

# DeepSpeed ZeRO Stage 2
accelerate launch --use_deepspeed --deepspeed_config ds_config.json train.py
```

### DeepSpeed Config (ZeRO Stage 2)

```json
{
  "bf16": { "enabled": true },
  "zero_optimization": {
    "stage": 2,
    "offload_optimizer": { "device": "cpu" },
    "allgather_partitions": true,
    "allgather_bucket_size": 2e8,
    "reduce_scatter": true,
    "reduce_bucket_size": 2e8
  },
  "gradient_accumulation_steps": 4,
  "train_micro_batch_size_per_gpu": 4
}
```

---

## 9. Memory Optimization

```python
# Gradient checkpointing — trades compute for memory
training_args = TrainingArguments(
    ...,
    gradient_checkpointing=True,
    gradient_checkpointing_kwargs={"use_reentrant": False},
)

# Gradient accumulation — simulates larger batch sizes
training_args = TrainingArguments(
    ...,
    per_device_train_batch_size=2,
    gradient_accumulation_steps=8,   # Effective batch = 2 * 8 * num_gpus
)

# 8-bit optimizer (saves optimizer memory)
training_args = TrainingArguments(
    ...,
    optim="adamw_bnb_8bit",  # Requires bitsandbytes
)
```

---

## Rules

- **Always set `save_total_limit`** — unbounded checkpoints fill disk quickly for large models
- **Use `gradient_checkpointing=True`** for models > 1B parameters — cuts activation memory by ~60%
- **Use `bf16=True` on Ampere+ GPUs** instead of `fp16` — better numerical stability
- **Set `pad_token = eos_token`** for causal LMs — most causal LMs don't have a pad token by default
- **Monitor loss curves** — if loss doesn't decrease after warmup, learning rate is likely too high
- **Use `eval_strategy="epoch"`** for small datasets, `"steps"` for large datasets with long epochs

---

## Anti-Patterns

| Anti-Pattern                                        | Why It's Wrong                                  | Correct Approach                                  |
| --------------------------------------------------- | ----------------------------------------------- | ------------------------------------------------- |
| Not setting `save_total_limit`                      | Disk fills with multi-GB checkpoints            | Set `save_total_limit=2` or `3`                   |
| Using `fp16=True` on CPU                            | FP16 is GPU-only                                | Omit `fp16` when training on CPU                  |
| Large batch size + OOM error                        | Exceeds GPU memory                              | Reduce batch size, use gradient accumulation      |
| Not tokenizing with same model tokenizer            | Vocabulary mismatch causes errors               | Always use the tokenizer from the same checkpoint |
| Training for too many epochs on small data          | Overfitting                                     | Use early stopping + validation monitoring        |
| Not using `gradient_checkpointing` for large models | OOM on models that could fit with checkpointing | Enable gradient checkpointing for large models    |
