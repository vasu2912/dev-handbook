---
title: "Agent protocols: MCP and A2A"
description: "Why agent systems need two protocols: MCP for agent-to-tool context, A2A for agent-to-agent tasks, and where each one ends."
---

Two integration problems recur in every agent platform. An agent needs context from tools, databases, and content sources. Independent agents, often owned by different teams or vendors, need to hand work to each other. The industry settled on one open protocol for each problem, and the division between them is a common interview topic.

## MCP: agent to tool

The [Model Context Protocol](/agentic-ai/mcp/) standardizes how an application exposes tools, resources, and prompts to a model. The host controls the model and the trust boundary; the MCP server is a capability provider. MCP does not decide anything. The model proposes tool calls and the application authorizes them.

## A2A: agent to agent

The Agent2Agent (A2A) protocol, created by Google in April 2025 and hosted by the Linux Foundation since June 2025, standardizes communication between independent agents. Its current specification is version 1.0.0.

The core objects:

| Object | Purpose |
|---|---|
| Agent Card | A JSON document at a well-known URI describing identity, skills, endpoint, and authentication requirements |
| Task | The unit of work with a stateful lifecycle, identified by a unique ID |
| Message | One turn between client and remote agent, with a role and one or more parts |
| Part | A typed content item: text, file, or structured data |
| Artifact | A task output the remote agent produces |

The protocol assumes the agents are **opaque**: they collaborate through declared capabilities and exchanged data without exposing their memory, plans, tools, or internal logic. That is the sharpest contrast with in-process subagents, which share a loop, a context, and a policy framework by design.

Practical properties:

- Transport is HTTP(S). The protocol defines JSON-RPC, gRPC, and REST bindings over the same abstract operations.
- Long-running work is first-class: streaming updates over SSE, asynchronous push notifications, and task cancellation.
- Authentication uses standard web mechanisms such as OAuth, carried over ordinary HTTP, so enterprise identity tooling applies.

## Choosing the boundary

The two protocols answer different questions:

| Question | MCP | A2A |
|---|---|---|
| Who talks to whom | An application (host) to tools and context sources | An agent to another agent |
| What is exchanged | Tool calls, resources, prompts, completion input | Tasks, messages, artifacts |
| Trust model | The host authorizes every capability against the user's identity | Both sides are independent systems with their own authority |
| Visibility | The host sees and vets tool behavior | Remote agents keep their internals opaque |
| Typical owner | Platform team exposing capabilities | Different teams or vendors exposing services |

A rule of thumb: if the other side should be able to see and control the details, expose an MCP tool. If the other side is an autonomous system whose internals you should not see, expose an A2A endpoint.

When agents live in the same process or same trust domain, an ordinary function call or in-process [subagent](/agentic-ai/multi-agent/subagents/) is cheaper and easier to test. Cross a protocol boundary only when ownership, trust, or lifecycle differs. Every remote call adds serialization, failure modes, and an identity problem.

## Enterprise concerns

Adopting A2A in an organization raises the same questions as any service mesh:

- **Discovery and governance**: who publishes Agent Cards, who curates the registry, and how are cards verified against what actually runs?
- **Identity**: on whose behalf does a remote agent act, and how does the user's authority propagate through a chain of agents?
- **Audit**: a task handed to an opaque agent still needs a trace in your observability system. Correlate task IDs across systems.
- **Versioning**: Agent Cards describe capabilities; changing them is a contract change like any API evolution.

## Sources

- [A2A Protocol specification v1.0.0](https://a2a-protocol.org/v1.0.0/specification)
- [Linux Foundation launches the Agent2Agent Protocol project](https://www.linuxfoundation.org/press/linux-foundation-launches-the-agent2agent-protocol-project-to-enable-secure-intelligent-communication-between-ai-agents)
- [A2A project on GitHub](https://github.com/a2aproject/A2A)
- [Model Context Protocol specification](https://modelcontextprotocol.io/specification/2026-07-28)

*Last verified: October 17, 2026.*
