---
title: Agentic AI glossary
description: Precise definitions for language-model, retrieval, agent, subagent, tool, and MCP terminology.
---

## A

**Action**  
An operation an agent asks the application to perform. A tool call is one common representation of an action.

**Agent**  
A system in which a model can use observations to choose among bounded actions in pursuit of a goal. The surrounding application supplies the loop, tools, policy, state, and stop conditions.

**Agent Card**  
In A2A, a JSON document published at a well-known URI that describes an agent's identity, skills, endpoint, and authentication requirements.

**Agentic RAG**  
A retrieval process in which a model can decide whether to retrieve, rewrite or split a query, inspect results, and retrieve again within explicit limits.

**ANN (approximate nearest-neighbor search)**  
An index strategy that finds most of the true nearest vectors in exchange for a tunable recall guarantee, enabling search over large embedding corpora.

**Autonomy**  
The set of decisions a system may make without approval. Autonomy is a property of the whole system, not the model alone.

## C

**Checkpoint**  
A durable record from which an execution can resume without repeating completed effects.

**Chunk**  
A portion of a source document stored as one retrievable unit.

**Context**  
The input available to the model for one generation. It can include instructions, messages, retrieved text, tool definitions, state, and tool results.

**Context window**  
The model-specific limit on tokens considered for a request, including input and generated output according to the provider's accounting rules.

## D

**Decode**  
The generation phase that produces output tokens one at a time, reading the accumulated KV cache each step. Decode is usually memory-bandwidth bound.

**Diffusion model**  
A generative model that learns to reverse a gradual noising process, producing images, audio, or video by iterative denoising. Diffusion language models apply the same idea to token sequences.

**Distillation**  
Training a smaller model to reproduce a larger model's outputs, trading quality for serving cost.

## E

**Embedding**  
A numeric representation used to compare items in a learned feature space. Similarity in that space is useful for retrieval, but it is not proof that two texts state the same fact.

**Elicitation**  
An MCP mechanism for obtaining user input needed to continue a request. Modern MCP carries the request through an `input_required` result and a later retry.

## G

**GraphRAG**  
Retrieval that builds a knowledge graph with extracted entities and relationships, plus community summaries, so global and multi-hop questions can be answered from structure rather than chunk similarity.

**Grounding**  
Connecting a generated answer to supplied evidence or system state. Grounding reduces unsupported generation but does not guarantee correctness.

**Guardrail**  
A check that runs around a model call, inspecting input or output content against policy. Guardrails complement authorization in application code; they do not replace it.

## H

**Handoff**  
A transfer of responsibility and selected context from one agent to another.

**HNSW**  
Hierarchical navigable small world. A graph-based ANN index with sparse upper layers and dense lower layers; high recall at low latency with high memory use.

**Human-in-the-loop**  
A design that stops at a defined point until a person supplies information or approval.

**Human-on-the-loop**  
A design in which a person supervises execution and can intervene without approving every step.

**Human-on-the-loop**  
A design in which a person supervises execution and can intervene without approving every step.

## I

**Idempotency**  
A property that lets repeated requests with the same operation identity produce no additional effect after the first successful application.

**Indirect prompt injection**  
Instructions planted in data that a model later reads, such as a webpage, email, document, or tool result.

## K

**KV cache**  
The stored attention keys and values for the processed sequence, reused while decoding. It grows with sequence length and batch size and usually dominates accelerator memory at serving scale.

## L

**LoRA**  
Low-rank adaptation. Fine-tuning that trains small low-rank matrices on a frozen base model; the resulting adapter is far smaller than the model and can be served alongside many others.

## M

**MCP client**  
The protocol component that communicates with one MCP server on behalf of a host.

**MCP host**  
The application that coordinates model access, MCP clients, user consent, and security policy.

**MCP server**  
A program that exposes MCP capabilities such as tools, resources, and prompts.

**Memory**  
Application-managed information saved for later use. A model does not gain durable memory merely because a conversation contains earlier messages.

**Multimodal**  
A system that processes more than one signal type, such as text and images or audio, typically by converting each into tokens or vectors the model can process together.

## O

**Observation**  
Information returned to the agent after an action or environment query.

**Orchestration**  
The code that controls execution order, branching, budgets, retries, checkpoints, approvals, and termination.

## P

**Prompt injection**  
Input crafted to make a model treat untrusted content as instructions that override the application's intended policy.

**Prompt**  
In ordinary LLM use, input instructions and content sent to a model. In MCP, a prompt is a server-exposed, user-controlled template that a client can retrieve.

**Prefill**  
The processing phase that runs every input token through the model and builds the KV cache. Prefill is compute bound and its duration shows up as time to first token.

## Q

**Quantization**  
Storing weights, and sometimes the KV cache, in fewer bits (FP8, INT8, INT4) to reduce memory and increase throughput, with a quality cost to evaluate.

## R

**RAG**  
Retrieval-augmented generation. The application retrieves external material and supplies selected results to a generative model.

**Reasoning model**  
A model class that generates internal reasoning tokens before the visible answer, spending test-time compute for accuracy on hard tasks at a latency and cost premium.

**Reranker**  
A model or scoring stage that reorders initial retrieval candidates using a more expensive relevance calculation.

**Resource**  
In MCP, application-controlled context addressed by a URI and read through protocol methods.

## S

**Structured output**  
Model output constrained or validated against a declared structure, often a JSON Schema.

**Subagent**  
An agent invoked by another agent or orchestrator for a bounded task. A subagent has its own instructions, context, tools, budget, or some combination of these.

**Speculative decoding**  
Drafting several tokens with a small model and verifying them with the target model in one pass, reducing latency without changing the exact-variant output distribution.

**Test-time compute**  
Additional computation spent per request at inference time, such as longer reasoning chains, to improve quality. It is billed as output tokens and adds latency.

**TTFT / TPOT**  
Time to first token (queueing plus prefill) and time per output token (decode). The two latency metrics that map to serving phases.

## T

**Tool**  
A named operation with declared inputs and outputs that lets an agent inspect or change an external environment.

**Tool calling**  
The process in which a model emits a structured request and application code decides whether and how to execute the corresponding tool.

**Trajectory**  
The ordered sequence of model decisions, tool calls, observations, state changes, and outputs produced during an agent run.

## V

**Vector database**  
A data system that indexes vectors and supports nearest-neighbor search, often with metadata filtering. It may complement rather than replace a relational database.

## W

**Working memory**  
The selected state and intermediate information available during the current task. It is usually a subset of all stored history.

## Sources

- [MCP specification 2026-07-28](https://modelcontextprotocol.io/specification/2026-07-28)
- [A2A Protocol specification v1.0.0](https://a2a-protocol.org/v1.0.0/specification)
- [vLLM paper (PagedAttention, SOSP 2023)](https://arxiv.org/abs/2309.06180)
- [NIST AI 600-1 Generative AI Profile](https://nvlpubs.nist.gov/nistpubs/ai/NIST.AI.600-1.pdf)
- [ReAct](https://arxiv.org/abs/2210.03629)
- [Retrieval-Augmented Generation](https://arxiv.org/abs/2005.11401)
