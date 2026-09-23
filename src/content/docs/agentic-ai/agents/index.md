---
title: What makes a system an agent
description: Distinguish agents from chatbots, workflows, copilots, automation, and ordinary services.
---

An agent is a system in which a model uses observations to choose among bounded actions in pursuit of a goal. The model is one component. The application supplies tools, state, policy, execution, and stop conditions.

A chatbot that only generates a reply is not necessarily an agent. A workflow that calls a model at one fixed step is not necessarily an agent either. The distinguishing feature is that model output affects what the system does next.

## The minimum useful agent

An agent needs these parts:

- A goal or task
- The current state and relevant context
- A set of allowed actions
- A policy and permission boundary
- An execution loop
- Observations from the environment
- A completion or stop condition

Remove the actions and the system becomes a generator. Remove the loop and it becomes one model-assisted workflow step. Remove the boundaries and it becomes unsafe automation.

## Agents choose paths that workflows predefine

A workflow encodes the route in application code. It may contain branches, retries, and model calls, but the allowed sequence is known in advance.

An agent chooses the next action from the current observation. This helps when the useful route depends on evidence discovered during execution. It also creates more possible trajectories to test.

Use a workflow when you can state the path. Use an agent when enumerating the path would create brittle branches and the model can make the bounded choice reliably enough.

## A copilot leaves action with the user

A copilot proposes text, code, queries, or actions for a person to inspect. An autonomous agent can execute within its granted scope. Many useful systems sit between those ends. They read freely, prepare a plan, and pause before a write.

Autonomy should follow risk. Reading a public manual needs different control than refunding a payment or restarting a production deployment.

## An agent is not a microservice replacement

A microservice exposes a deterministic business capability with defined contracts. An agent can coordinate capabilities when the request is ambiguous or the route is discovered at runtime. It should not absorb domain invariants that the services already enforce.

For example, a support agent may decide which order tool to call. The order service still decides whether an order can be cancelled.

## An environment gives actions meaning

An agent's environment is the state it can observe and affect. For a coding agent, the environment includes repository files, commands, tests, and version-control state. For an operations agent, it can include alerts, logs, metrics, Kubernetes objects, and change-management systems.

Describe the environment before choosing the model. The environment determines the tools, permissions, failure modes, and evidence required for completion.

## Sources

- [ReAct](https://arxiv.org/abs/2210.03629)
- [NIST AI 600-1 Generative AI Profile](https://nvlpubs.nist.gov/nistpubs/ai/NIST.AI.600-1.pdf)
