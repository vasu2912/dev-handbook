---
title: Multimodal models
description: How vision, audio, and image-generation models work, what they cost, and where they fit in backend and agent systems.
---

Text models take text tokens. Multimodal systems convert other signals into that same token world, then apply the same machinery: encode, attend, generate. The conversions explain most of their practical behavior.

## Images become patches

A vision transformer splits an image into fixed-size patches, flattens each patch into a vector, and processes the sequence like text tokens. Classification models attach a class head. Vision-language models feed the patch vectors into the same context as text tokens, which is why a multimodal chat model can answer questions about a screenshot: the image is in its context window.

Two consequences matter in production:

- **Context cost.** Each image consumes a budget of tokens that depends on resolution. Providers document the math, and it is large enough to matter for agents that read screenshots.
- **Grounding is weaker.** An image contributes many correlated values at once. A model can miss a small detail that a text paragraph would have stated.

For retrieval, **CLIP** trains an image encoder and a text encoder to map matching images and captions to nearby vectors. That shared space powers image search and multimodal RAG without needing text captions for every image.

## Documents are a pipeline problem

PDFs, forms, and slides mix text, layout, tables, and scans. A backend that feeds them to a model usually runs a pipeline:

1. Extract raw text and layout (page geometry, reading order, table structure).
2. Optionally render pages to images for a vision model when scans or figures carry the content.
3. Chunk with structure awareness, not fixed character counts.
4. Attach metadata (page, section, table title) so retrieval can filter.

[OCR errors, merged table cells, and broken reading order](/agentic-ai/rag/retrieval-pipeline/) corrupt the index quietly. Evaluate ingestion with documents from your own corpus, not with clean samples.

## Diffusion models generate images

Diffusion models learn to reverse a gradual noising process. Training corrupts images with noise; the model learns to predict and remove it. Generation starts from pure noise and denoises step by step toward a coherent image. **Latent diffusion** (the basis for Stable Diffusion) runs that process in a compressed latent space, which is why consumer GPUs could run it.

| Family | How it generates | Where you meet it |
|---|---|---|
| Autoregressive | Predicts next token (text, or image tokens) | Chat models, image models such as early DALL-E and Parti |
| Diffusion | Iterative denoising from noise | Image generation (Stable Diffusion, DALL-E 2/3, Imagen), video generation |
| Diffusion language models | Denoise token sequences in parallel | An emerging research and product category; the open LLaDA and commercial Mercury models |

Interviewers rarely require diffusion math, but the contrast is worth having ready: diffusion generates everything at once through refinement and is naturally parallel; autoregression generates left to right and is naturally streaming. Flow matching, used by recent models such as Stable Diffusion 3, reformulates the same idea with a simpler training objective.

## Audio and voice agents

Speech pipelines come in two shapes:

- **Cascade**: speech-to-text (for example, Whisper, an encoder-decoder trained on large-scale weakly supervised audio), then a text model, then text-to-speech. Each stage is testable and swappable, and total latency is the sum of the stages.
- **Speech-to-speech**: one model consumes audio and emits audio directly, as in real-time voice APIs. Fewer stages means lower latency and preserved tone, but you lose the free transcript and per-stage control.

Voice adds engineering constraints that pure text agents never face: turn-taking and interruption (barge-in), endpointing (deciding the user finished speaking), and a much tighter latency budget, because more than a second of delay feels broken in conversation. Tool calls inside a voice agent need the same approval boundaries as any other agent, plus a plan for what the caller hears while approval waits.

## Where backends meet multimodality

- **Moderation and PII**: images and audio carry sensitive content that text filters miss. Guardrails must cover every modality the system accepts.
- **Cost control**: cap image count and resolution per request; reject oversized media at the boundary.
- **Caching**: media-derived features (patch embeddings, transcriptions) can be cached by content hash even when model output cannot.
- **Evaluation**: test with noisy scans, dialects, accents, and adversarial images, not only clean inputs.

## Sources

- [An Image is Worth 16x16 Words: Transformers for Image Recognition at Scale (ViT)](https://arxiv.org/abs/2010.11929)
- [Learning Transferable Visual Models From Natural Language Supervision (CLIP)](https://arxiv.org/abs/2103.00020)
- [Denoising Diffusion Probabilistic Models](https://arxiv.org/abs/2006.11239)
- [High-Resolution Image Synthesis with Latent Diffusion Models](https://arxiv.org/abs/2112.10752)
- [Robust Speech Recognition via Large-Scale Weak Supervision (Whisper)](https://arxiv.org/abs/2212.04356)
- [LLaDA: Large Language Diffusion Models](https://arxiv.org/abs/2502.09992)
- [Flamingo: a Visual Language Model for Few-Shot Learning](https://arxiv.org/abs/2204.14198)

*Last verified: October 17, 2026.*
