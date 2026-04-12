---
name: huggingface-evaluation
description: "Evaluating model performance with the Hugging Face evaluate library and standard metrics. Use when: computing accuracy, F1, BLEU, ROUGE, perplexity, or other metrics; benchmarking models; comparing model performance; creating evaluation pipelines; using the evaluate library; model selection based on metrics. DO NOT USE FOR: training models (use huggingface-fine-tuning); dataset processing (use huggingface-datasets)."
---

# Evaluation

## Overview

This skill covers computing metrics, benchmarking models, and evaluating model performance using the Hugging Face `evaluate` library and manual metric computation.

---

## 1. Evaluate Library Basics

```bash
pip install evaluate
```

```python
import evaluate

# List all available metrics
metrics_list = evaluate.list_evaluation_modules(module_type="metric")
print(metrics_list[:10])

# Load a metric
accuracy = evaluate.load("accuracy")

# Compute
results = accuracy.compute(predictions=[0, 1, 1, 0], references=[0, 1, 0, 0])
print(results)
# {'accuracy': 0.75}
```

---

## 2. Common Metrics

### Classification Metrics

```python
import evaluate

# Accuracy
accuracy = evaluate.load("accuracy")
results = accuracy.compute(predictions=[0, 1, 1, 0, 1], references=[0, 1, 0, 0, 1])
# {'accuracy': 0.8}

# F1 Score
f1 = evaluate.load("f1")
results = f1.compute(predictions=[0, 1, 1, 0, 1], references=[0, 1, 0, 0, 1])
# {'f1': 0.8}

# F1 — multiclass
results = f1.compute(predictions=preds, references=labels, average="weighted")
results = f1.compute(predictions=preds, references=labels, average="macro")

# Precision and Recall
precision = evaluate.load("precision")
recall = evaluate.load("recall")
p = precision.compute(predictions=preds, references=labels, average="weighted")
r = recall.compute(predictions=preds, references=labels, average="weighted")

# Multiple metrics at once
clf_metrics = evaluate.combine(["accuracy", "f1", "precision", "recall"])
results = clf_metrics.compute(predictions=preds, references=labels)
```

### Text Generation Metrics

```python
# BLEU (machine translation)
bleu = evaluate.load("bleu")
results = bleu.compute(
    predictions=["the cat sat on the mat"],
    references=[["the cat is on the mat"]],
)
# {'bleu': 0.61, 'precisions': [...], 'brevity_penalty': 1.0, ...}

# SacreBLEU (standardized BLEU)
sacrebleu = evaluate.load("sacrebleu")
results = sacrebleu.compute(
    predictions=["the cat sat on the mat"],
    references=[["the cat is on the mat"]],
)

# ROUGE (summarization)
rouge = evaluate.load("rouge")
results = rouge.compute(
    predictions=["The cat sat on the mat."],
    references=["The cat is on the mat."],
)
# {'rouge1': 0.857, 'rouge2': 0.714, 'rougeL': 0.857, 'rougeLsum': 0.857}

# BERTScore (semantic similarity)
bertscore = evaluate.load("bertscore")
results = bertscore.compute(
    predictions=["The weather is nice today."],
    references=["It is a beautiful day."],
    lang="en",
)
# {'precision': [...], 'recall': [...], 'f1': [...]}

# METEOR
meteor = evaluate.load("meteor")
results = meteor.compute(
    predictions=["the cat sat on the mat"],
    references=["the cat is on the mat"],
)
```

### Perplexity

```python
# Perplexity (language model quality)
perplexity = evaluate.load("perplexity", module_type="metric")
results = perplexity.compute(
    predictions=["The cat sat on the mat.", "Random nonsense gibberish."],
    model_id="gpt2",
)
# {'mean_perplexity': 12.34, 'perplexities': [8.5, 16.2]}

# Manual perplexity computation
import torch
from transformers import AutoModelForCausalLM, AutoTokenizer

model = AutoModelForCausalLM.from_pretrained("gpt2")
tokenizer = AutoTokenizer.from_pretrained("gpt2")

inputs = tokenizer("The cat sat on the mat.", return_tensors="pt")
with torch.no_grad():
    outputs = model(**inputs, labels=inputs["input_ids"])
    perplexity = torch.exp(outputs.loss).item()
print(f"Perplexity: {perplexity:.2f}")
```

### Token Classification Metrics (NER)

```python
# seqeval for NER/POS tagging
seqeval = evaluate.load("seqeval")
results = seqeval.compute(
    predictions=[["O", "B-PER", "I-PER", "O", "B-LOC"]],
    references=[["O", "B-PER", "I-PER", "O", "B-LOC"]],
)
# {'PER': {'precision': 1.0, 'recall': 1.0, 'f1': 1.0}, 'LOC': {...}, 'overall_accuracy': 1.0, ...}
```

---

## 3. Metrics Reference

| Metric      | Task                | Range | Higher Is Better |
| ----------- | ------------------- | ----- | ---------------- |
| Accuracy    | Classification      | 0–1   | Yes              |
| F1          | Classification      | 0–1   | Yes              |
| Precision   | Classification      | 0–1   | Yes              |
| Recall      | Classification      | 0–1   | Yes              |
| BLEU        | Translation         | 0–1   | Yes              |
| SacreBLEU   | Translation         | 0–100 | Yes              |
| ROUGE-1/2/L | Summarization       | 0–1   | Yes              |
| BERTScore   | Semantic similarity | 0–1   | Yes              |
| METEOR      | Translation         | 0–1   | Yes              |
| Perplexity  | Language modeling   | 1–∞   | No (lower)       |
| Exact Match | QA                  | 0–1   | Yes              |
| SQuAD       | QA                  | 0–100 | Yes              |
| seqeval     | NER/POS             | 0–1   | Yes              |
| WER         | Speech recognition  | 0–∞   | No (lower)       |
| CER         | Speech recognition  | 0–∞   | No (lower)       |

---

## 4. Using Metrics with Trainer

```python
import evaluate
import numpy as np
from transformers import Trainer, TrainingArguments

# Load metrics
accuracy = evaluate.load("accuracy")
f1 = evaluate.load("f1")

def compute_metrics(eval_pred):
    logits, labels = eval_pred
    predictions = np.argmax(logits, axis=-1)
    acc = accuracy.compute(predictions=predictions, references=labels)
    f1_score = f1.compute(predictions=predictions, references=labels, average="weighted")
    return {**acc, **f1_score}

training_args = TrainingArguments(
    ...,
    eval_strategy="epoch",
    metric_for_best_model="f1",
    greater_is_better=True,
    load_best_model_at_end=True,
)

trainer = Trainer(
    model=model,
    args=training_args,
    compute_metrics=compute_metrics,
    ...,
)
```

### For Seq2Seq Models

```python
import evaluate
import numpy as np

rouge = evaluate.load("rouge")

def compute_metrics(eval_pred):
    predictions, labels = eval_pred
    # Replace -100 in labels (padding) with pad_token_id
    labels = np.where(labels != -100, labels, tokenizer.pad_token_id)

    decoded_preds = tokenizer.batch_decode(predictions, skip_special_tokens=True)
    decoded_labels = tokenizer.batch_decode(labels, skip_special_tokens=True)

    # Strip whitespace
    decoded_preds = [pred.strip() for pred in decoded_preds]
    decoded_labels = [label.strip() for label in decoded_labels]

    results = rouge.compute(predictions=decoded_preds, references=decoded_labels)
    return results
```

---

## 5. Batch Evaluation

```python
# For large evaluation sets, add predictions in batches
accuracy = evaluate.load("accuracy")

for batch in eval_dataloader:
    predictions = model(**batch).logits.argmax(-1)
    accuracy.add_batch(predictions=predictions, references=batch["labels"])

results = accuracy.compute()
```

---

## 6. Model Comparison

```python
import evaluate

# Evaluate multiple models on the same data
models_to_compare = [
    "distilbert-base-uncased-finetuned-sst-2-english",
    "textattack/bert-base-uncased-SST-2",
    "cardiffnlp/twitter-roberta-base-sentiment-latest",
]

from transformers import pipeline

results = {}
accuracy = evaluate.load("accuracy")

for model_name in models_to_compare:
    pipe = pipeline("text-classification", model=model_name, device=0)
    predictions = pipe(test_texts, batch_size=32)
    pred_labels = [1 if p["label"] == "POSITIVE" else 0 for p in predictions]
    score = accuracy.compute(predictions=pred_labels, references=test_labels)
    results[model_name] = score["accuracy"]

# Print comparison
for model_name, acc in sorted(results.items(), key=lambda x: x[1], reverse=True):
    print(f"{model_name}: {acc:.4f}")
```

---

## 7. Custom Metrics

```python
import evaluate
import numpy as np

# Create a custom metric using evaluate.Metric
class CustomF1(evaluate.Metric):
    def _info(self):
        return evaluate.MetricInfo(
            description="Custom F1 with threshold",
            citation="",
            features=datasets.Features({
                "predictions": datasets.Value("float32"),
                "references": datasets.Value("int32"),
            }),
        )

    def _compute(self, predictions, references, threshold=0.5):
        binary_preds = [1 if p > threshold else 0 for p in predictions]
        tp = sum(1 for p, r in zip(binary_preds, references) if p == 1 and r == 1)
        fp = sum(1 for p, r in zip(binary_preds, references) if p == 1 and r == 0)
        fn = sum(1 for p, r in zip(binary_preds, references) if p == 0 and r == 1)
        precision = tp / (tp + fp) if (tp + fp) > 0 else 0
        recall = tp / (tp + fn) if (tp + fn) > 0 else 0
        f1 = 2 * (precision * recall) / (precision + recall) if (precision + recall) > 0 else 0
        return {"f1": f1, "precision": precision, "recall": recall}
```

---

## 8. Evaluation without evaluate Library

```python
# Using scikit-learn directly
from sklearn.metrics import (
    accuracy_score,
    f1_score,
    precision_score,
    recall_score,
    classification_report,
    confusion_matrix,
)

predictions = model.predict(test_data)
pred_labels = predictions.argmax(axis=-1)

print(f"Accuracy: {accuracy_score(test_labels, pred_labels):.4f}")
print(f"F1: {f1_score(test_labels, pred_labels, average='weighted'):.4f}")
print(classification_report(test_labels, pred_labels, target_names=label_names))
print(confusion_matrix(test_labels, pred_labels))
```

---

## Rules

- **Use `evaluate.combine()`** when computing multiple metrics — cleaner than loading each separately
- **Always specify `average` for multiclass** F1/precision/recall — default may not be what you expect
- **Replace `-100` labels** before decoding in seq2seq evaluation — Transformers uses -100 for padding in labels
- **Use `add_batch()`** for large evaluation sets — avoids loading all predictions into memory at once
- **Report the right metric** for the task — accuracy for balanced, F1 for imbalanced, ROUGE for summarization
- **Set `metric_for_best_model`** in TrainingArguments — ensures best model is saved based on evaluation

---

## Anti-Patterns

| Anti-Pattern                               | Why It's Wrong                               | Correct Approach                                 |
| ------------------------------------------ | -------------------------------------------- | ------------------------------------------------ |
| Using accuracy on imbalanced data          | Majority-class classifier gets high accuracy | Use F1, precision, recall                        |
| Not specifying `average` for multiclass F1 | Default behavior may not match intent        | Explicitly set `average="weighted"` or `"macro"` |
| Evaluating on training data                | Measures memorization, not generalization    | Always evaluate on held-out test/validation set  |
| Computing BLEU on single sentences         | BLEU is unreliable on single examples        | Compute on corpus level (aggregate)              |
| Ignoring -100 labels in seq2seq decoding   | Tokenizer tries to decode padding token -100 | Replace -100 with `pad_token_id` before decoding |
| Comparing models on different test sets    | Unfair comparison                            | Use the exact same test set for all models       |
