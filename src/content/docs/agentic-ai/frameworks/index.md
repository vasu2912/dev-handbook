---
title: Choose an agent framework
description: Compare direct SDK code, graph orchestration, chain libraries, and multi-agent frameworks without letting the framework define the architecture.
---

A framework packages model calls, tool definitions, state, tracing, checkpoints, or agent coordination. Choose it after defining the execution model.

## Start with the seam you need

| Need | Suitable starting point |
|---|---|
| A few model calls and tools | Provider SDK plus application code |
| Explicit branches, checkpoints, and resumable state | Graph or durable-workflow framework |
| Retrieval components and provider adapters | LLM application library |
| Role-based agent conversations | Multi-agent framework, after proving the need |
| Standard host-to-capability protocol | MCP SDK |

The smallest dependency that exposes the required seam is easier to debug and upgrade.

## LangChain

LangChain packages model interfaces, prompts, retrievers, tools, callbacks, and composable runnable operations. It can speed integration work. Keep domain policy and durable state outside opaque chains.

## LangGraph

LangGraph represents execution as nodes, edges, state, and checkpoints. It fits workflows that need explicit branching, human pauses, resumability, or controlled parallel paths. The graph does not decide which business rules belong in deterministic code.

## AutoGen and CrewAI-style systems

Conversation-oriented frameworks make role-based multi-agent designs easy to express. They can also make termination, budget, context sharing, and error recovery less obvious. Use them when agent conversation is part of the solution, not as a substitute for modules and functions.

## MCP SDKs

An MCP SDK implements protocol types, transports, and helpers. It does not supply agent planning or tool policy. Choose an SDK version that implements the protocol revision your host and server target.

The TypeScript SDK v2 implements MCP `2026-07-28`. Older v1 examples use the 2025 session-based era and different package structure.

## Evaluate portability at your own boundaries

Wrap framework-specific model, tool, checkpoint, and trace types at a small number of application seams. Keep tool business logic callable without the agent framework. Store durable state in a form you can inspect and migrate.

## Questions to answer before adoption

- Can execution resume after process failure?
- Can the system cancel in-flight model and tool work?
- Can you inspect and migrate stored state?
- Can policy reject a tool call before execution?
- Can traces cross framework and service boundaries?
- Can one task enforce a total cost and step budget?
- What changes when the framework or protocol version upgrades?

## Sources

- [LangChain documentation](https://docs.langchain.com/)
- [LangGraph documentation](https://docs.langchain.com/oss/python/langgraph/overview)
- [Microsoft AutoGen documentation](https://microsoft.github.io/autogen/)
- [CrewAI documentation](https://docs.crewai.com/)
- [MCP TypeScript SDK v2](https://ts.sdk.modelcontextprotocol.io/v2/)

*Framework links last reviewed: September 23, 2026.*
