---
name: huggingface-tokenizers
description: "Understanding and customizing Hugging Face tokenizers. Use when: working with BPE, WordPiece, or Unigram tokenizers; encoding and decoding text; padding and truncation strategies; special tokens; building custom tokenizers from scratch; training tokenizers on custom data; fast vs slow tokenizers; token-to-word alignment. DO NOT USE FOR: model inference (use huggingface-transformers); dataset tokenization pipelines (use huggingface-datasets)."
---

# Tokenizers

## Overview

This skill covers the Hugging Face `tokenizers` and `transformers` tokenizer APIs including encoding/decoding, padding, truncation, special tokens, and training custom tokenizers.

---

## 1. Tokenizer Types

| Algorithm     | How It Works                                | Used By                   |
| ------------- | ------------------------------------------- | ------------------------- |
| BPE           | Merges most frequent byte pairs iteratively | GPT-2, LLaMA, Falcon      |
| WordPiece     | Merges pairs maximizing likelihood          | BERT, DistilBERT, Electra |
| Unigram       | Removes tokens minimizing loss iteratively  | T5, ALBERT, XLNet         |
| SentencePiece | Language-agnostic, operates on raw text     | LLaMA, T5, mBART          |

---

## 2. Basic Encoding and Decoding

```python
from transformers import AutoTokenizer

tokenizer = AutoTokenizer.from_pretrained("bert-base-uncased")

# Encode text to token IDs
encoded = tokenizer("Hello, how are you?")
print(encoded)
# {'input_ids': [101, 7592, 1010, 2129, 2024, 2017, 1029, 102],
#  'token_type_ids': [0, 0, 0, 0, 0, 0, 0, 0],
#  'attention_mask': [1, 1, 1, 1, 1, 1, 1, 1]}

# Get tokens (subwords)
tokens = tokenizer.tokenize("Hello, how are you?")
print(tokens)
# ['hello', ',', 'how', 'are', 'you', '?']

# Convert tokens to IDs
ids = tokenizer.convert_tokens_to_ids(tokens)

# Decode back to text
text = tokenizer.decode(encoded["input_ids"])
print(text)
# '[CLS] hello, how are you? [SEP]'

text = tokenizer.decode(encoded["input_ids"], skip_special_tokens=True)
print(text)
# 'hello, how are you?'

# Batch encoding
batch = tokenizer(["Hello world", "How are you?"], return_tensors="pt", padding=True)
```

---

## 3. Padding and Truncation

### Padding Strategies

```python
# Pad to longest in batch
tokenizer(texts, padding=True)                     # Same as padding="longest"
tokenizer(texts, padding="longest")

# Pad to max model length
tokenizer(texts, padding="max_length", max_length=512)

# No padding
tokenizer(texts, padding=False)
```

### Truncation Strategies

```python
# Truncate to max model length
tokenizer(texts, truncation=True)                  # Truncates to model max

# Truncate to specific length
tokenizer(texts, truncation=True, max_length=256)

# For pair inputs (e.g., QA): truncate only second sequence
tokenizer(questions, contexts, truncation="only_second", max_length=512)
```

### Combined

```python
# Recommended: truncate + dynamic padding (with DataCollator)
encoded = tokenizer(texts, truncation=True, max_length=512)

# For direct use: truncate + pad to fixed length
encoded = tokenizer(texts, truncation=True, padding="max_length", max_length=512, return_tensors="pt")
```

### Padding Side

```python
# Left padding (required for batched generation with causal LMs)
tokenizer.padding_side = "left"

# Right padding (default, for classification/encoding)
tokenizer.padding_side = "right"
```

---

## 4. Special Tokens

```python
# View special tokens
print(tokenizer.special_tokens_map)
# {'unk_token': '[UNK]', 'sep_token': '[SEP]', 'pad_token': '[PAD]',
#  'cls_token': '[CLS]', 'mask_token': '[MASK]'}

# Access specific tokens
print(tokenizer.cls_token)        # '[CLS]'
print(tokenizer.cls_token_id)     # 101
print(tokenizer.sep_token)        # '[SEP]'
print(tokenizer.pad_token)        # '[PAD]'
print(tokenizer.eos_token)        # None (BERT doesn't have EOS)
print(tokenizer.bos_token)        # None (BERT doesn't have BOS)

# Add pad token (common for causal LMs that lack one)
tokenizer.pad_token = tokenizer.eos_token

# Add custom special tokens
special_tokens = {"additional_special_tokens": ["<CUSTOM1>", "<CUSTOM2>"]}
num_added = tokenizer.add_special_tokens(special_tokens)

# IMPORTANT: resize model embeddings after adding tokens
model.resize_token_embeddings(len(tokenizer))

# Add regular tokens (non-special)
num_added = tokenizer.add_tokens(["newword1", "newword2"])
model.resize_token_embeddings(len(tokenizer))
```

---

## 5. Token-to-Word Alignment

```python
# Word IDs — maps each token to its original word index
encoding = tokenizer("Hello, how are you?", return_offsets_mapping=True)

# Offset mapping — character-level start/end positions
print(encoding["offset_mapping"])
# [(0, 0), (0, 5), (5, 6), (7, 10), (11, 14), (15, 18), (18, 19), (0, 0)]
# First and last are special tokens (CLS, SEP)

# Word IDs (fast tokenizers only)
encoding = tokenizer("Hello, how are you?", return_offsets_mapping=True)
word_ids = encoding.word_ids()
print(word_ids)
# [None, 0, 1, 2, 3, 4, 5, None]  — None for special tokens
```

---

## 6. Fast vs Slow Tokenizers

```python
from transformers import AutoTokenizer

# Fast tokenizer (Rust-based, default when available)
tokenizer = AutoTokenizer.from_pretrained("bert-base-uncased")
print(tokenizer.is_fast)  # True

# Force slow tokenizer (Python-based)
tokenizer = AutoTokenizer.from_pretrained("bert-base-uncased", use_fast=False)
print(tokenizer.is_fast)  # False
```

### Fast Tokenizer Extra Features

| Feature             | Fast           | Slow             |
| ------------------- | -------------- | ---------------- |
| Speed               | 10-100x faster | Baseline         |
| `word_ids()`        | Yes            | No               |
| `offset_mapping`    | Yes            | No               |
| `overflow` handling | Yes            | Limited          |
| Batch encoding      | Yes (parallel) | Yes (sequential) |

---

## 7. Training a Custom Tokenizer

```python
from tokenizers import Tokenizer, models, trainers, pre_tokenizers, normalizers

# Create a BPE tokenizer from scratch
tokenizer = Tokenizer(models.BPE(unk_token="[UNK]"))

# Normalizer (lowercase, unicode normalization)
tokenizer.normalizer = normalizers.Sequence([
    normalizers.NFD(),
    normalizers.Lowercase(),
    normalizers.StripAccents(),
])

# Pre-tokenizer (split on whitespace and punctuation)
tokenizer.pre_tokenizer = pre_tokenizers.Whitespace()

# Trainer
trainer = trainers.BpeTrainer(
    vocab_size=30000,
    min_frequency=2,
    special_tokens=["[UNK]", "[CLS]", "[SEP]", "[PAD]", "[MASK]"],
)

# Train from files
tokenizer.train(files=["corpus.txt"], trainer=trainer)

# Train from iterator
def batch_iterator(dataset, batch_size=1000):
    for i in range(0, len(dataset), batch_size):
        yield dataset[i:i + batch_size]["text"]

tokenizer.train_from_iterator(batch_iterator(dataset), trainer=trainer)

# Save
tokenizer.save("tokenizer.json")

# Wrap as HuggingFace tokenizer
from transformers import PreTrainedTokenizerFast
hf_tokenizer = PreTrainedTokenizerFast(
    tokenizer_object=tokenizer,
    unk_token="[UNK]",
    cls_token="[CLS]",
    sep_token="[SEP]",
    pad_token="[PAD]",
    mask_token="[MASK]",
)
hf_tokenizer.save_pretrained("./my-tokenizer")
```

---

## 8. Chat Templates

```python
# Apply chat template for instruct models
messages = [
    {"role": "system", "content": "You are a helpful assistant."},
    {"role": "user", "content": "Hello!"},
]

# Format as string
formatted = tokenizer.apply_chat_template(messages, tokenize=False, add_generation_prompt=True)
print(formatted)

# Tokenize directly
input_ids = tokenizer.apply_chat_template(messages, return_tensors="pt", add_generation_prompt=True)

# Custom chat template (Jinja2)
tokenizer.chat_template = """{% for message in messages %}
{% if message['role'] == 'user' %}User: {{ message['content'] }}
{% elif message['role'] == 'assistant' %}Assistant: {{ message['content'] }}
{% endif %}{% endfor %}Assistant:"""
```

---

## Rules

- **Always use the tokenizer from the same checkpoint** as the model — vocabulary mismatch causes errors
- **Resize embeddings** after adding tokens — `model.resize_token_embeddings(len(tokenizer))`
- **Use fast tokenizers** by default — 10-100x faster, more features
- **Set `padding_side="left"`** for batched generation with causal LMs
- **Use `truncation=True`** when input can exceed model's max length — prevents silent truncation errors
- **Use `skip_special_tokens=True`** when decoding for human-readable output

---

## Anti-Patterns

| Anti-Pattern                                    | Why It's Wrong                                 | Correct Approach                                |
| ----------------------------------------------- | ---------------------------------------------- | ----------------------------------------------- |
| Using a different tokenizer than the model      | Token IDs don't match vocabulary               | Always load tokenizer from same checkpoint      |
| Adding tokens without resizing embeddings       | Index out-of-bounds errors                     | Call `model.resize_token_embeddings()`          |
| Right-padding for batched causal LM generation  | Corrupts generation for shorter sequences      | Set `tokenizer.padding_side = "left"`           |
| Not setting `pad_token` for causal LMs          | Padding fails (most causal LMs lack pad token) | Set `tokenizer.pad_token = tokenizer.eos_token` |
| Ignoring `max_length` for variable-length input | Exceeds model max context, cryptic errors      | Always set `truncation=True, max_length=N`      |
| Using slow tokenizer when fast is available     | Unnecessarily slow                             | Use default (fast) or set `use_fast=True`       |
