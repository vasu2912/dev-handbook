---
title: Learning paths
description: Choose an order through the Agentic AI handbook based on what you already know and what you need to build.
---

The subject is easier when you learn it as a dependency chain. Tools make little sense before structured output. Agent memory makes little sense before context. MCP makes little sense before tool boundaries and authorization.

## If language models are new to you

Read these pages in order:

1. [How language models generate text](/agentic-ai/foundations/llms/)
2. [Tokens and context windows](/agentic-ai/foundations/tokens-and-context/)
3. [Transformers and attention](/agentic-ai/foundations/transformers-and-attention/)
4. [Sampling and structured output](/agentic-ai/foundations/generation-and-structured-output/)
5. [Embeddings and semantic search](/agentic-ai/foundations/embeddings/)
6. [Retrieval-augmented generation](/agentic-ai/rag/)
7. [What makes a system an agent](/agentic-ai/agents/)

After that foundation, follow the backend engineer path.

## If you build backend services

Start with the boundary between model output and application authority:

1. [Tools and function calls](/agentic-ai/tools/)
2. [Safe tool execution](/agentic-ai/tools/safe-execution/)
3. [The agent loop](/agentic-ai/agents/agent-loop/)
4. [Context engineering and memory](/agentic-ai/context-and-memory/)
5. [Durable execution](/agentic-ai/orchestration/durable-execution/)
6. [MCP mental model](/agentic-ai/mcp/)
7. [Agent security](/agentic-ai/security/)
8. [Production readiness](/agentic-ai/production/)

The ideas should feel familiar. Idempotency, scoped credentials, queues, checkpoints, and tracing do not stop mattering because an LLM chose the next operation.

## If you design agent platforms

Concentrate on decisions that affect many teams:

- [Planning and control](/agentic-ai/agents/planning-and-control/)
- [Agent orchestration](/agentic-ai/orchestration/)
- [Multi-agent systems](/agentic-ai/multi-agent/)
- [MCP transports and lifecycle](/agentic-ai/mcp/transports-and-lifecycle/)
- [MCP security and operations](/agentic-ai/mcp/security-and-operations/)
- [Reliability](/agentic-ai/production/reliability/)
- [Observability](/agentic-ai/production/observability/)
- [Evaluation](/agentic-ai/production/evaluation/)
- [Performance and cost](/agentic-ai/production/performance-and-cost/)

Then compare the design walkthroughs. They use the same concepts under different risk and latency constraints.

## If you need a working example

The tutorials are deliberately small:

- [Build a bounded tool agent](/agentic-ai/tutorials/tool-agent/)
- [Build a small RAG system](/agentic-ai/tutorials/rag/)
- [Build an MCP server](/agentic-ai/tutorials/mcp-server/)
- [Build a subagent workflow](/agentic-ai/tutorials/subagents/)

Each tutorial has one visible result. The explanation pages contain the deeper reasoning, so the tutorials can stay focused on the build.

## If you are preparing for a design discussion

Read the [architecture decision guide](/agentic-ai/reference/decision-guide/) first. Pick one walkthrough and explain it aloud:

- [Enterprise assistant](/agentic-ai/walkthroughs/enterprise-assistant/)
- [Coding agent](/agentic-ai/walkthroughs/coding-agent/)
- [DevOps investigation agent](/agentic-ai/walkthroughs/devops-agent/)

A useful explanation names the trust boundary, the source of truth, the stop condition, the recovery point, and the evidence used to judge success.
