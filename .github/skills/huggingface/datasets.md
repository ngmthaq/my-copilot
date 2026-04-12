---
name: huggingface-datasets
description: "Loading and processing datasets with the Hugging Face Datasets library. Use when: loading datasets from the Hub or local files; map/filter/select operations; streaming large datasets; data collators; train/test splits; creating dataset cards; uploading datasets; working with CSV, JSON, Parquet, or Arrow files. DO NOT USE FOR: tokenization details (use huggingface-tokenizers); model training (use huggingface-fine-tuning)."
---

# Datasets

## Overview

This skill covers the Hugging Face `datasets` library for loading, processing, transforming, and sharing datasets efficiently using Apache Arrow for memory-mapped storage.

---

## 1. Loading Datasets

### From the Hub

```python
from datasets import load_dataset

# Full dataset
dataset = load_dataset("imdb")

# Specific split
train = load_dataset("imdb", split="train")

# Specific config/subset
dataset = load_dataset("glue", "mrpc")

# With streaming (no download)
dataset = load_dataset("allenai/c4", split="train", streaming=True)

# Specific revision
dataset = load_dataset("squad", revision="v2.0")

# Trust remote code (for datasets with custom loading scripts)
dataset = load_dataset("bigcode/the-stack", trust_remote_code=True)
```

### From Local Files

```python
# CSV
dataset = load_dataset("csv", data_files="data.csv")
dataset = load_dataset("csv", data_files={"train": "train.csv", "test": "test.csv"})

# JSON / JSONL
dataset = load_dataset("json", data_files="data.jsonl")

# Parquet
dataset = load_dataset("parquet", data_files="data.parquet")

# Text files (one example per line)
dataset = load_dataset("text", data_files="corpus.txt")

# From a directory of files
dataset = load_dataset("csv", data_dir="./data/")

# From pandas DataFrame
from datasets import Dataset
import pandas as pd

df = pd.read_csv("data.csv")
dataset = Dataset.from_pandas(df)

# From Python dict
dataset = Dataset.from_dict({
    "text": ["Hello world", "Foo bar"],
    "label": [0, 1],
})
```

---

## 2. Dataset Structure

```python
# DatasetDict — contains multiple splits
dataset = load_dataset("imdb")
print(dataset)
# DatasetDict({
#     train: Dataset({ features: ['text', 'label'], num_rows: 25000 })
#     test: Dataset({ features: ['text', 'label'], num_rows: 25000 })
# })

# Access splits
train = dataset["train"]
test = dataset["test"]

# Access rows
first_row = train[0]                # Single row (dict)
batch = train[0:10]                 # Slice (dict of lists)
column = train["text"]              # Entire column (list)

# Features (schema)
print(train.features)
# {'text': Value(dtype='string'), 'label': ClassLabel(names=['neg', 'pos'])}

# Info
print(len(train))                   # Number of rows
print(train.column_names)           # Column names
print(train.num_rows)               # Same as len()
```

---

## 3. Processing — Map, Filter, Select

### Map (Transform)

```python
# Map a function over all examples
def preprocess(example):
    example["text"] = example["text"].lower()
    return example

dataset = dataset.map(preprocess)

# Batched map (much faster)
def tokenize_batch(examples):
    return tokenizer(examples["text"], padding="max_length", truncation=True, max_length=512)

dataset = dataset.map(tokenize_batch, batched=True, batch_size=1000)

# Map with multiple return values
def add_length(example):
    example["length"] = len(example["text"])
    return example

dataset = dataset.map(add_length)

# Remove columns after map
dataset = dataset.map(tokenize_batch, batched=True, remove_columns=["text"])

# Parallel processing
dataset = dataset.map(tokenize_batch, batched=True, num_proc=4)
```

### Filter

```python
# Keep only examples matching a condition
dataset = dataset.filter(lambda x: len(x["text"]) > 100)

# Batched filter
dataset = dataset.filter(lambda x: [l > 100 for l in x["length"]], batched=True)

# Parallel filter
dataset = dataset.filter(lambda x: x["label"] == 1, num_proc=4)
```

### Select and Sort

```python
# Select specific indices
subset = dataset.select(range(1000))

# Shuffle
dataset = dataset.shuffle(seed=42)

# Sort
dataset = dataset.sort("length")

# Unique values
unique_labels = dataset.unique("label")
```

---

## 4. Train/Test Splits

```python
# Split a single dataset into train/test
split_dataset = dataset.train_test_split(test_size=0.2, seed=42)
# DatasetDict({'train': ..., 'test': ...})

# Stratified split (preserves label distribution)
split_dataset = dataset.train_test_split(test_size=0.2, seed=42, stratify_by_column="label")

# Create train/validation/test from a single split
train_testvalid = dataset.train_test_split(test_size=0.2, seed=42)
test_valid = train_testvalid["test"].train_test_split(test_size=0.5, seed=42)

from datasets import DatasetDict
final_dataset = DatasetDict({
    "train": train_testvalid["train"],
    "validation": test_valid["train"],
    "test": test_valid["test"],
})
```

---

## 5. Column Operations

```python
# Rename columns
dataset = dataset.rename_column("old_name", "new_name")

# Remove columns
dataset = dataset.remove_columns(["unnecessary_col1", "unnecessary_col2"])

# Add column
import numpy as np
dataset = dataset.add_column("random_scores", np.random.rand(len(dataset)))

# Cast column type
from datasets import ClassLabel, Value
dataset = dataset.cast_column("label", ClassLabel(names=["negative", "positive"]))
dataset = dataset.cast_column("score", Value("float32"))

# Flatten nested features
dataset = dataset.flatten()
```

---

## 6. Streaming Datasets

```python
# Stream — no download, processes on-the-fly
dataset = load_dataset("allenai/c4", split="train", streaming=True)

# Iterate
for example in dataset:
    process(example)
    break  # Just one example

# Take first N examples
subset = dataset.take(1000)

# Skip first N examples
remaining = dataset.skip(1000)

# Shuffle with buffer
shuffled = dataset.shuffle(seed=42, buffer_size=10_000)

# Map and filter work the same way
processed = dataset.map(tokenize_fn).filter(lambda x: x["length"] > 50)

# Interleave multiple streams
from datasets import interleave_datasets
en = load_dataset("mc4", "en", split="train", streaming=True)
fr = load_dataset("mc4", "fr", split="train", streaming=True)
combined = interleave_datasets([en, fr], probabilities=[0.7, 0.3], seed=42)
```

### When to Stream

- Dataset is very large (>10 GB) and you don't need random access
- You only need a subset of a large dataset
- Disk space is limited
- You want to start processing immediately without downloading

---

## 7. Data Collators

Data collators handle dynamic padding and batching during training.

```python
from transformers import DataCollatorWithPadding, DataCollatorForLanguageModeling, DataCollatorForSeq2Seq

# Dynamic padding for classification (pads to longest in batch)
data_collator = DataCollatorWithPadding(tokenizer=tokenizer)

# Language modeling (causal LM — labels = shifted inputs)
data_collator = DataCollatorForLanguageModeling(tokenizer=tokenizer, mlm=False)

# Masked language modeling (BERT-style — mlm=True, mlm_probability sets mask rate)
data_collator = DataCollatorForLanguageModeling(tokenizer=tokenizer, mlm=True, mlm_probability=0.15)

# Seq2Seq (encoder-decoder models)
data_collator = DataCollatorForSeq2Seq(tokenizer=tokenizer, model=model)
```

---

## 8. Saving and Loading Locally

```python
# Save to disk (Arrow format)
dataset.save_to_disk("./my_dataset")

# Load from disk
from datasets import load_from_disk
dataset = load_from_disk("./my_dataset")

# Save as CSV / JSON / Parquet
dataset.to_csv("output.csv")
dataset.to_json("output.jsonl")
dataset.to_parquet("output.parquet")
dataset.to_pandas().to_excel("output.xlsx")
```

---

## 9. Uploading to Hub

```python
# Push dataset to Hub
dataset.push_to_hub("my-org/my-dataset")

# Push with private visibility
dataset.push_to_hub("my-org/my-dataset", private=True)

# Push specific split
dataset["train"].push_to_hub("my-org/my-dataset", split="train")
```

---

## Rules

- **Use `batched=True`** in `.map()` — batched processing is 10–100x faster than row-by-row
- **Use `num_proc`** for CPU-bound operations — parallelizes across CPU cores
- **Use `remove_columns`** in `.map()` — drop original text columns after tokenization to save memory
- **Use streaming** for datasets > 10 GB — avoids downloading the entire dataset
- **Set `seed` for reproducibility** — always pass `seed` to `shuffle()` and `train_test_split()`
- **Use `DataCollatorWithPadding`** instead of `padding="max_length"` in tokenization — dynamic padding is more efficient

---

## Anti-Patterns

| Anti-Pattern                                     | Why It's Wrong                                    | Correct Approach                                  |
| ------------------------------------------------ | ------------------------------------------------- | ------------------------------------------------- |
| Row-by-row `.map()` without `batched=True`       | 10–100x slower                                    | Always use `batched=True`                         |
| Padding to `max_length` during tokenization      | Wastes memory on short sequences                  | Use `DataCollatorWithPadding` for dynamic padding |
| Not removing original columns after `.map()`     | Keeps unused text columns, wastes memory          | Use `remove_columns` parameter                    |
| Loading entire massive dataset without streaming | OOM or long download times                        | Use `streaming=True` for large datasets           |
| Not setting `seed` in shuffle/split              | Non-reproducible data splits                      | Always set `seed=42` (or any fixed value)         |
| Using pandas for large datasets                  | Memory-inefficient (copies entire dataset to RAM) | Use HF `datasets` with Arrow backend              |
