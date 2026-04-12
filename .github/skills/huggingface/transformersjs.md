---
name: huggingface-transformersjs
description: "Using Hugging Face Transformers.js for running ML models in the browser and Node.js via ONNX Runtime. Use when: running models client-side with @huggingface/transformers; using pipeline API in JavaScript/TypeScript; WebGPU acceleration; browser-based inference; quantized models (q4, q8, fp16); text generation in JS; sentiment analysis in JS; speech recognition in JS; image classification in JS; embeddings in JS; feature extraction in JS; Node.js ML inference. DO NOT USE FOR: Python Transformers library (use huggingface-transformers); fine-tuning models (use huggingface-fine-tuning); training (not supported in JS); Python inference optimization (use huggingface-inference)."
---

# Transformers.js

## Overview

Transformers.js runs Hugging Face models directly in the browser or Node.js using ONNX Runtime. It mirrors the Python Transformers API — same `pipeline()` pattern, same model names — but everything runs client-side with no server needed.

- **Runtime:** ONNX Runtime Web (WASM for CPU, WebGPU for GPU)
- **Package:** `@huggingface/transformers`
- **Model format:** ONNX (converted from PyTorch/TensorFlow via HF Optimum)
- **Compatible models:** Any model tagged `transformers.js` on Hugging Face Hub

---

## 1. Installation

### NPM

```bash
npm i @huggingface/transformers
```

### CDN (Vanilla JS)

```html
<script type="module">
  import { pipeline } from "https://cdn.jsdelivr.net/npm/@huggingface/transformers@3.8.1";
</script>
```

### Import

```javascript
import { pipeline } from "@huggingface/transformers";
```

---

## 2. Pipeline API

The pipeline API is the simplest way to run inference. All pipelines are async.

```javascript
import { pipeline } from "@huggingface/transformers";

// Sentiment analysis
const classifier = await pipeline("sentiment-analysis");
const result = await classifier("I love transformers!");
// [{ label: 'POSITIVE', score: 0.9998 }]

// With a specific model
const pipe = await pipeline("sentiment-analysis", "Xenova/bert-base-multilingual-uncased-sentiment");
const output = await pipe("This product is amazing!");
```

### Supported Tasks

| Task                       | Pipeline String                  | Common ONNX Models                                             |
| -------------------------- | -------------------------------- | -------------------------------------------------------------- |
| Text Classification        | `text-classification`            | `Xenova/distilbert-base-uncased-finetuned-sst-2-english`       |
| Text Generation            | `text-generation`                | `onnx-community/Qwen2.5-0.5B-Instruct`                         |
| Text-to-Text Generation    | `text2text-generation`           | `Xenova/flan-t5-small`                                         |
| Token Classification (NER) | `token-classification`           | `Xenova/bert-base-NER`                                         |
| Question Answering         | `question-answering`             | `Xenova/distilbert-base-uncased-distilled-squad`               |
| Fill Mask                  | `fill-mask`                      | `Xenova/bert-base-uncased`                                     |
| Summarization              | `summarization`                  | `Xenova/distilbart-cnn-6-6`                                    |
| Translation                | `translation`                    | `Xenova/nllb-200-distilled-600M`                               |
| Zero-Shot Classification   | `zero-shot-classification`       | `Xenova/mobilebert-uncased-mnli`                               |
| Feature Extraction         | `feature-extraction`             | `mixedbread-ai/mxbai-embed-xsmall-v1`                          |
| Sentence Similarity        | `sentence-similarity`            | `Xenova/all-MiniLM-L6-v2`                                      |
| Image Classification       | `image-classification`           | `onnx-community/mobilenetv4_conv_small.e2400_r224_in1k`        |
| Object Detection           | `object-detection`               | `Xenova/detr-resnet-50`                                        |
| Image Segmentation         | `image-segmentation`             | `Xenova/segformer-b0-finetuned-ade-512-512`                    |
| Depth Estimation           | `depth-estimation`               | `Xenova/depth-anything-small-hf`                               |
| Background Removal         | `background-removal`             | `briaai/RMBG-1.4`                                              |
| Speech Recognition         | `automatic-speech-recognition`   | `onnx-community/whisper-tiny.en`                               |
| Audio Classification       | `audio-classification`           | `Xenova/wav2vec2-large-xlsr-53-gender-recognition-librispeech` |
| Text-to-Speech             | `text-to-speech`                 | `Xenova/speecht5_tts`                                          |
| Image-to-Text              | `image-to-text`                  | `Xenova/vit-gpt2-image-captioning`                             |
| Document QA                | `document-question-answering`    | `Xenova/donut-base-finetuned-docvqa`                           |
| Zero-Shot Image Class.     | `zero-shot-image-classification` | `Xenova/clip-vit-base-patch32`                                 |
| Zero-Shot Object Detection | `zero-shot-object-detection`     | `Xenova/owlvit-base-patch32`                                   |

---

## 3. Task Examples

### Text Classification

```javascript
const classifier = await pipeline("text-classification", "Xenova/distilbert-base-uncased-finetuned-sst-2-english");
const result = await classifier("I love this product!");
// [{ label: 'POSITIVE', score: 0.9998 }]
```

### Named Entity Recognition

```javascript
const ner = await pipeline("token-classification", "Xenova/bert-base-NER");
const result = await ner("Hugging Face is based in New York City.");
// [{ entity: 'B-ORG', word: 'Hugging', ... }, { entity: 'I-ORG', word: 'Face', ... }, ...]
```

### Text Generation

```javascript
const generator = await pipeline("text-generation", "onnx-community/Qwen2.5-0.5B-Instruct", {
  dtype: "q4",
  device: "webgpu",
});

const messages = [
  { role: "system", content: "You are a helpful assistant." },
  { role: "user", content: "Tell me a funny joke." },
];

const output = await generator(messages, { max_new_tokens: 128 });
console.log(output[0].generated_text.at(-1).content);
```

### Translation

```javascript
const translator = await pipeline("translation", "Xenova/nllb-200-distilled-600M");
const result = await translator("Hello, how are you?", {
  src_lang: "eng_Latn",
  tgt_lang: "fra_Latn",
});
// [{ translation_text: 'Bonjour, comment allez-vous ?' }]
```

### Speech Recognition

```javascript
const transcriber = await pipeline("automatic-speech-recognition", "onnx-community/whisper-tiny.en", {
  device: "webgpu",
});

const output = await transcriber("https://example.com/audio.wav");
console.log(output.text);
```

### Feature Extraction (Embeddings)

```javascript
const extractor = await pipeline("feature-extraction", "mixedbread-ai/mxbai-embed-xsmall-v1", {
  device: "webgpu",
});

const texts = ["Hello world!", "This is an example sentence."];
const embeddings = await extractor(texts, { pooling: "mean", normalize: true });
console.log(embeddings.tolist());
```

### Image Classification

```javascript
const classifier = await pipeline("image-classification", "onnx-community/mobilenetv4_conv_small.e2400_r224_in1k", {
  device: "webgpu",
});

const output = await classifier("https://example.com/cat.jpg");
// [{ label: 'tabby cat', score: 0.92 }, ...]
```

### Zero-Shot Classification

```javascript
const classifier = await pipeline("zero-shot-classification", "Xenova/mobilebert-uncased-mnli");
const result = await classifier("I need to pay my electricity bill", {
  candidate_labels: ["urgent", "finance", "travel"],
});
// { labels: ['finance', 'urgent', 'travel'], scores: [0.85, 0.12, 0.03] }
```

---

## 4. Device and Acceleration

### CPU (WASM) — Default

```javascript
// Default: runs on CPU via WebAssembly
const pipe = await pipeline("sentiment-analysis");
```

### WebGPU

```javascript
// GPU acceleration via WebGPU
const pipe = await pipeline("sentiment-analysis", "Xenova/distilbert-base-uncased-finetuned-sst-2-english", {
  device: "webgpu",
});
```

### Rules

- **WASM (CPU)** is the default and works everywhere
- **WebGPU** provides GPU acceleration — set `device: 'webgpu'`
- WebGPU browser support is ~70% (as of 2024); Chromium has best support
- Firefox: enable `dom.webgpu.enabled` flag
- Safari: enable `WebGPU` feature flag
- **Always provide a WASM fallback** — not all users have WebGPU support

---

## 5. Quantization (dtypes)

Quantized models reduce size and improve load time. Use `dtype` to select precision.

| dtype   | Description                 | Use Case                       |
| ------- | --------------------------- | ------------------------------ |
| `fp32`  | Full precision (32-bit)     | Maximum accuracy               |
| `fp16`  | Half precision (16-bit)     | Default for WebGPU             |
| `q8`    | 8-bit quantized             | Default for WASM               |
| `q4`    | 4-bit quantized             | Smallest size, fastest loading |
| `int8`  | 8-bit integer               | Alternative 8-bit format       |
| `uint8` | Unsigned 8-bit integer      | Alternative 8-bit format       |
| `q4f16` | 4-bit with fp16 activations | WebGPU optimized               |

### Basic Usage

```javascript
// 4-bit quantization
const pipe = await pipeline("sentiment-analysis", "Xenova/distilbert-base-uncased-finetuned-sst-2-english", {
  dtype: "q4",
});
```

### Detecting Available dtypes

```javascript
import { ModelRegistry } from "@huggingface/transformers";

const dtypes = await ModelRegistry.get_available_dtypes("onnx-community/all-MiniLM-L6-v2-ONNX");
console.log(dtypes); // ['fp32', 'fp16', 'int8', 'uint8', 'q8', 'q4']
```

### Auto-Select Smallest dtype

```javascript
import { pipeline, ModelRegistry } from "@huggingface/transformers";

const dtypes = await ModelRegistry.get_available_dtypes("onnx-community/Qwen3-0.6B-ONNX");
const preferred = ["q4", "q8", "fp16", "fp32"];
const dtype = preferred.find((d) => dtypes.includes(d)) ?? "fp32";

const generator = await pipeline("text-generation", "onnx-community/Qwen3-0.6B-ONNX", { dtype });
```

### Per-Module dtypes (Encoder-Decoder Models)

```javascript
import { Florence2ForConditionalGeneration } from "@huggingface/transformers";

const model = await Florence2ForConditionalGeneration.from_pretrained("onnx-community/Florence-2-base-ft", {
  dtype: {
    embed_tokens: "fp16",
    vision_encoder: "fp16",
    encoder_model: "q4",
    decoder_model_merged: "q4",
  },
  device: "webgpu",
});
```

---

## 6. Auto Classes

Load models and tokenizers directly when you need more control than the pipeline API.

```javascript
import { AutoTokenizer, AutoModel, AutoModelForCausalLM } from "@huggingface/transformers";

// Load tokenizer
const tokenizer = await AutoTokenizer.from_pretrained("Xenova/bert-base-uncased");

// Load model
const model = await AutoModel.from_pretrained("Xenova/bert-base-uncased");

// Load with options
const causalModel = await AutoModelForCausalLM.from_pretrained("onnx-community/Qwen2.5-0.5B-Instruct", {
  dtype: "q4",
  device: "webgpu",
});
```

### Available Auto Classes

| Class                                | Task                     |
| ------------------------------------ | ------------------------ |
| `AutoModel`                          | Base model (no head)     |
| `AutoModelForCausalLM`               | Text generation          |
| `AutoModelForSeq2SeqLM`              | Seq-to-seq               |
| `AutoModelForSequenceClassification` | Text classification      |
| `AutoModelForTokenClassification`    | NER, POS tagging         |
| `AutoModelForQuestionAnswering`      | Extractive QA            |
| `AutoModelForMaskedLM`               | Fill-mask                |
| `AutoModelForImageClassification`    | Image classification     |
| `AutoModelForObjectDetection`        | Object detection         |
| `AutoModelForSpeechSeq2Seq`          | Speech recognition       |
| `AutoTokenizer`                      | Tokenizer                |
| `AutoProcessor`                      | Multimodal preprocessing |

---

## 7. Model Caching

Models are cached automatically after first download. In the browser, models are stored in the browser's Cache API. In Node.js, models are cached to the file system.

```javascript
// Models are cached by default — second load is instant
const pipe1 = await pipeline("sentiment-analysis", "Xenova/distilbert-base-uncased-finetuned-sst-2-english");
// Second call uses cached model
const pipe2 = await pipeline("sentiment-analysis", "Xenova/distilbert-base-uncased-finetuned-sst-2-english");
```

### Custom Cache Directory (Node.js)

```javascript
import { env } from "@huggingface/transformers";

// Set custom cache directory
env.cacheDir = "./models";
```

### Disable Remote Models (Offline Mode)

```javascript
import { env } from "@huggingface/transformers";

env.allowRemoteModels = false; // Only use locally cached models
```

---

## 8. Framework Integration

### Next.js

Use Web Workers to avoid blocking the main thread:

```javascript
// worker.js
import { pipeline } from "@huggingface/transformers";

let classifier;

self.onmessage = async (event) => {
  if (!classifier) {
    classifier = await pipeline("sentiment-analysis", "Xenova/distilbert-base-uncased-finetuned-sst-2-english");
  }
  const result = await classifier(event.data.text);
  self.postMessage(result);
};
```

```javascript
// component.jsx
"use client";
import { useEffect, useRef, useState } from "react";

export default function Classifier() {
  const workerRef = useRef(null);
  const [result, setResult] = useState(null);

  useEffect(() => {
    workerRef.current = new Worker(new URL("./worker.js", import.meta.url), { type: "module" });
    workerRef.current.onmessage = (event) => setResult(event.data);
    return () => workerRef.current?.terminate();
  }, []);

  const classify = (text) => workerRef.current?.postMessage({ text });

  return (
    <div>
      <button onClick={() => classify("I love this!")}>Classify</button>
      {result && <p>{JSON.stringify(result)}</p>}
    </div>
  );
}
```

### Vite / Vanilla JS

```javascript
import { pipeline } from "@huggingface/transformers";

const classifier = await pipeline("sentiment-analysis");
const result = await classifier(document.getElementById("input").value);
```

### Node.js

```javascript
import { pipeline } from "@huggingface/transformers";

const classifier = await pipeline("sentiment-analysis");
const result = await classifier("Transformers.js is amazing!");
console.log(result);
```

---

## 9. Progress Callbacks

Track model download progress for better UX:

```javascript
const pipe = await pipeline("sentiment-analysis", "Xenova/distilbert-base-uncased-finetuned-sst-2-english", {
  progress_callback: (progress) => {
    if (progress.status === "progress") {
      console.log(`Downloading: ${progress.file} - ${Math.round(progress.progress)}%`);
    }
  },
});
```

---

## Anti-Patterns

| Anti-Pattern                                     | Why It's Wrong                                     | Correct Approach                                |
| ------------------------------------------------ | -------------------------------------------------- | ----------------------------------------------- |
| Loading models on the main thread in browsers    | Blocks UI, causes freezing                         | Use Web Workers for model loading and inference |
| Not using quantization for browser deployment    | Large downloads, slow loading                      | Use `dtype: 'q4'` or `'q8'` for smaller models  |
| Assuming WebGPU is available everywhere          | Only ~70% browser support                          | Feature-detect and fall back to WASM            |
| Creating new pipeline instances per request      | Re-downloads or re-initializes the model each time | Create pipeline once, reuse for all requests    |
| Using Python model IDs without ONNX versions     | Models must be ONNX-converted for Transformers.js  | Use models tagged `transformers.js` on the Hub  |
| Not setting `max_new_tokens` for text generation | May generate until model max length                | Always set `max_new_tokens`                     |
| Using `fp32` in the browser without need         | Wastes bandwidth and memory                        | Use `q4` or `q8` for browser, `fp16` for WebGPU |
| Ignoring progress callbacks                      | Users see blank screen during model download       | Show download progress with `progress_callback` |
