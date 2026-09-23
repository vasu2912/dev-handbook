---
title: Agentic AI glossary
description: Precise definitions for language-model, retrieval, agent, subagent, tool, and MCP terminology.
---

## A

**Action**  
An operation an agent asks the application to perform. A tool call is one common representation of an action.

**Agent**  
A system in which a model can use observations to choose among bounded actions in pursuit of a goal. The surrounding application supplies the loop, tools, policy, state, and stop conditions.

**Agentic RAG**  
A retrieval process in which a model can decide whether to retrieve, rewrite or split a query, inspect results, and retrieve again within explicit limits.

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

## E

**Embedding**  
A numeric representation used to compare items in a learned feature space. Similarity in that space is useful for retrieval, but it is not proof that two texts state the same fact.

**Elicitation**  
An MCP mechanism for obtaining user input needed to continue a request. Modern MCP carries the request through an `input_required` result and a later retry.

## G

**Grounding**  
Connecting a generated answer to supplied evidence or system state. Grounding reduces unsupported generation but does not guarantee correctness.

## H

**Handoff**  
A transfer of responsibility and selected context from one agent to another.

**Human-in-the-loop**  
A design that stops at a defined point until a person supplies information or approval.

**Human-on-the-loop**  
A design in which a person supervises execution and can intervene without approving every step.

## I

**Idempotency**  
A property that lets repeated requests with the same operation identity produce no additional effect after the first successful application.

**Indirect prompt injection**  
Instructions planted in data that a model later reads, such as a webpage, email, document, or tool result.

## M

**MCP client**  
The protocol component that communicates with one MCP server on behalf of a host.

**MCP host**  
The application that coordinates model access, MCP clients, user consent, and security policy.

**MCP server**  
A program that exposes MCP capabilities such as tools, resources, and prompts.

**Memory**  
Application-managed information saved for later use. A model does not gain durable memory merely because a conversation contains earlier messages.

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

## R

**RAG**  
Retrieval-augmented generation. The application retrieves external material and supplies selected results to a generative model.

**Reranker**  
A model or scoring stage that reorders initial retrieval candidates using a more expensive relevance calculation.

**Resource**  
In MCP, application-controlled context addressed by a URI and read through protocol methods.

## S

**Structured output**  
Model output constrained or validated against a declared structure, often a JSON Schema.

**Subagent**  
An agent invoked by another agent or orchestrator for a bounded task. A subagent has its own instructions, context, tools, budget, or some combination of these.

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
- [NIST AI 600-1 Generative AI Profile](https://nvlpubs.nist.gov/nistpubs/ai/NIST.AI.600-1.pdf)
- [ReAct](https://arxiv.org/abs/2210.03629)
- [Retrieval-Augmented Generation](https://arxiv.org/abs/2005.11401)
