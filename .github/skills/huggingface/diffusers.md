---
name: huggingface-diffusers
description: "Using the Hugging Face Diffusers library for image generation. Use when: generating images with Stable Diffusion; img2img; inpainting; configuring schedulers; using ControlNet; applying LoRA to diffusion models; SDXL; Stable Diffusion 3; Flux; video generation; image editing. DO NOT USE FOR: NLP tasks (use huggingface-transformers); fine-tuning language models (use huggingface-fine-tuning)."
---

# Diffusers

## Overview

This skill covers the Hugging Face `diffusers` library for image and video generation using diffusion models including Stable Diffusion, SDXL, and Flux.

---

## 1. Text-to-Image

### Stable Diffusion

```python
from diffusers import StableDiffusionPipeline, DPMSolverMultistepScheduler
import torch

pipe = StableDiffusionPipeline.from_pretrained(
    "stabilityai/stable-diffusion-2-1",
    torch_dtype=torch.float16,
).to("cuda")

# Use faster scheduler
pipe.scheduler = DPMSolverMultistepScheduler.from_config(pipe.scheduler.config)

image = pipe(
    prompt="A photorealistic cat wearing a tiny top hat, studio lighting",
    negative_prompt="blurry, low quality, distorted",
    num_inference_steps=25,
    guidance_scale=7.5,
    width=768,
    height=768,
).images[0]

image.save("output.png")
```

### SDXL

```python
from diffusers import StableDiffusionXLPipeline

pipe = StableDiffusionXLPipeline.from_pretrained(
    "stabilityai/stable-diffusion-xl-base-1.0",
    torch_dtype=torch.float16,
    variant="fp16",
).to("cuda")

image = pipe(
    prompt="A majestic mountain landscape at sunset",
    negative_prompt="blurry, cartoon, low quality",
    num_inference_steps=30,
    guidance_scale=7.0,
    width=1024,
    height=1024,
).images[0]
```

### SDXL with Refiner

```python
from diffusers import StableDiffusionXLPipeline, StableDiffusionXLImg2ImgPipeline

# Base
base = StableDiffusionXLPipeline.from_pretrained(
    "stabilityai/stable-diffusion-xl-base-1.0",
    torch_dtype=torch.float16,
    variant="fp16",
).to("cuda")

# Refiner
refiner = StableDiffusionXLImg2ImgPipeline.from_pretrained(
    "stabilityai/stable-diffusion-xl-refiner-1.0",
    torch_dtype=torch.float16,
    variant="fp16",
).to("cuda")

# Generate base image
image = base(
    prompt="A detailed portrait of an astronaut",
    num_inference_steps=40,
    denoising_end=0.8,
    output_type="latent",
).images

# Refine
image = refiner(
    prompt="A detailed portrait of an astronaut",
    image=image,
    num_inference_steps=40,
    denoising_start=0.8,
).images[0]
```

### Flux

```python
from diffusers import FluxPipeline

pipe = FluxPipeline.from_pretrained(
    "black-forest-labs/FLUX.1-schnell",
    torch_dtype=torch.bfloat16,
).to("cuda")

image = pipe(
    prompt="A cat holding a sign that says hello world",
    num_inference_steps=4,
    guidance_scale=0.0,
    width=1024,
    height=1024,
).images[0]
```

---

## 2. Image-to-Image

```python
from diffusers import StableDiffusionImg2ImgPipeline
from PIL import Image

pipe = StableDiffusionImg2ImgPipeline.from_pretrained(
    "stabilityai/stable-diffusion-2-1",
    torch_dtype=torch.float16,
).to("cuda")

init_image = Image.open("input.png").resize((768, 768))

image = pipe(
    prompt="A fantasy castle on a hill, detailed oil painting",
    image=init_image,
    strength=0.75,    # 0.0 = no change, 1.0 = full regeneration
    guidance_scale=7.5,
    num_inference_steps=30,
).images[0]
```

---

## 3. Inpainting

```python
from diffusers import StableDiffusionInpaintPipeline
from PIL import Image

pipe = StableDiffusionInpaintPipeline.from_pretrained(
    "stabilityai/stable-diffusion-2-inpainting",
    torch_dtype=torch.float16,
).to("cuda")

image = Image.open("photo.png").resize((512, 512))
mask = Image.open("mask.png").resize((512, 512))  # White = area to inpaint

result = pipe(
    prompt="A red sports car",
    image=image,
    mask_image=mask,
    num_inference_steps=30,
    guidance_scale=7.5,
).images[0]
```

---

## 4. Schedulers

Schedulers control the denoising process and affect quality and speed.

```python
from diffusers import (
    DDPMScheduler,
    DDIMScheduler,
    PNDMScheduler,
    EulerDiscreteScheduler,
    EulerAncestralDiscreteScheduler,
    DPMSolverMultistepScheduler,
    LCMScheduler,
)

# Change scheduler
pipe.scheduler = DPMSolverMultistepScheduler.from_config(pipe.scheduler.config)
```

### Scheduler Comparison

| Scheduler                         | Steps Needed | Quality | Speed   | Notes                        |
| --------------------------------- | ------------ | ------- | ------- | ---------------------------- |
| `DDPMScheduler`                   | 50–1000      | Best    | Slowest | Original diffusion scheduler |
| `DDIMScheduler`                   | 20–50        | Good    | Fast    | Deterministic                |
| `EulerDiscreteScheduler`          | 20–30        | Good    | Fast    | Popular default              |
| `EulerAncestralDiscreteScheduler` | 20–30        | Good    | Fast    | Stochastic variant           |
| `DPMSolverMultistepScheduler`     | 15–25        | Good    | Faster  | Best speed/quality tradeoff  |
| `LCMScheduler`                    | 4–8          | Good    | Fastest | Requires LCM LoRA/distilled  |

---

## 5. ControlNet

```python
from diffusers import StableDiffusionControlNetPipeline, ControlNetModel
from PIL import Image

# Load ControlNet (e.g., Canny edge detection)
controlnet = ControlNetModel.from_pretrained(
    "lllyasviel/sd-controlnet-canny",
    torch_dtype=torch.float16,
)

pipe = StableDiffusionControlNetPipeline.from_pretrained(
    "stable-diffusion-v1-5/stable-diffusion-v1-5",
    controlnet=controlnet,
    torch_dtype=torch.float16,
).to("cuda")

# Generate canny edges from input image
import cv2
import numpy as np

image = np.array(Image.open("input.png"))
edges = cv2.Canny(image, 100, 200)
control_image = Image.fromarray(edges)

result = pipe(
    prompt="A beautiful house, detailed, photorealistic",
    image=control_image,
    num_inference_steps=30,
).images[0]
```

### ControlNet Models

| Model                    | Condition Type        |
| ------------------------ | --------------------- |
| `sd-controlnet-canny`    | Canny edges           |
| `sd-controlnet-depth`    | Depth maps            |
| `sd-controlnet-openpose` | Human poses           |
| `sd-controlnet-seg`      | Semantic segmentation |
| `sd-controlnet-scribble` | Scribbles/sketches    |

---

## 6. LoRA for Diffusion

```python
from diffusers import StableDiffusionXLPipeline

pipe = StableDiffusionXLPipeline.from_pretrained(
    "stabilityai/stable-diffusion-xl-base-1.0",
    torch_dtype=torch.float16,
).to("cuda")

# Load LoRA weights
pipe.load_lora_weights("path/to/lora", weight_name="lora_weights.safetensors")

# Adjust LoRA scale
pipe.fuse_lora(lora_scale=0.8)

# Generate
image = pipe("A portrait in the style of <lora-trigger>").images[0]

# Unload LoRA
pipe.unfuse_lora()
pipe.unload_lora_weights()

# Multiple LoRAs
pipe.load_lora_weights("style_lora", weight_name="style.safetensors", adapter_name="style")
pipe.load_lora_weights("detail_lora", weight_name="detail.safetensors", adapter_name="detail")
pipe.set_adapters(["style", "detail"], adapter_weights=[0.7, 0.5])
```

---

## 7. Memory Optimization

```python
# Enable attention slicing (reduces VRAM usage)
pipe.enable_attention_slicing()

# Enable VAE slicing (for high-res images)
pipe.enable_vae_slicing()

# Enable VAE tiling (for very high-res images)
pipe.enable_vae_tiling()

# Offload to CPU when not in use (sequential)
pipe.enable_sequential_cpu_offload()

# Model CPU offload (faster than sequential)
pipe.enable_model_cpu_offload()

# Use xformers memory efficient attention
pipe.enable_xformers_memory_efficient_attention()
```

### VRAM Requirements (Approximate)

| Model          | FP32   | FP16   | With CPU Offload |
| -------------- | ------ | ------ | ---------------- |
| SD 1.5         | ~8 GB  | ~4 GB  | ~2 GB            |
| SD 2.1         | ~10 GB | ~5 GB  | ~3 GB            |
| SDXL           | ~16 GB | ~8 GB  | ~4 GB            |
| Flux.1-schnell | ~24 GB | ~12 GB | ~6 GB            |

---

## 8. Batch Generation

```python
# Generate multiple images
images = pipe(
    prompt=["A red car", "A blue house", "A green tree"],
    num_inference_steps=25,
    guidance_scale=7.5,
).images

# Same prompt, different seeds
import torch

generator = [torch.Generator("cuda").manual_seed(i) for i in range(4)]
images = pipe(
    prompt="A beautiful sunset over the ocean",
    num_images_per_prompt=4,
    generator=generator,
    num_inference_steps=25,
).images
```

---

## Rules

- **Use `torch.float16`** for inference — most diffusion models work well in half precision
- **Use `DPMSolverMultistepScheduler`** as default — best speed/quality balance
- **Always set `negative_prompt`** — improves quality by steering away from common artifacts
- **Use `enable_model_cpu_offload()`** on low-VRAM GPUs — faster than `sequential_cpu_offload`
- **Set a fixed seed** for reproducible results — use `torch.Generator("cuda").manual_seed(42)`
- **Use SDXL or Flux** for best quality — SD 1.5 is outdated for production use

---

## Anti-Patterns

| Anti-Pattern                              | Why It's Wrong                                     | Correct Approach                          |
| ----------------------------------------- | -------------------------------------------------- | ----------------------------------------- |
| Using FP32 for diffusion inference        | Wastes VRAM, no quality benefit                    | Use `torch_dtype=torch.float16`           |
| Too many inference steps (100+)           | Diminishing returns past ~30 steps                 | Use 20-30 steps with DPMSolver            |
| No negative prompt                        | More artifacts, lower quality                      | Always set negative prompt                |
| Generating at odd resolutions             | Distorted results (models train at specific sizes) | Use standard resolutions (512, 768, 1024) |
| Loading entire model to GPU with low VRAM | OOM error                                          | Use `enable_model_cpu_offload()`          |
| Using old SD 1.5 for production           | Lower quality, outdated                            | Use SDXL or Flux for best results         |
