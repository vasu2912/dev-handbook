---
title: Agent architecture decision guide
description: Choose between ordinary code, workflows, agents, tools, subagents, RAG, fine-tuning, and MCP.
---

## Pick the least variable design that works

| Need | Default choice | Reason |
|---|---|---|
| Known inputs and complete rules | Ordinary code | The behavior can be specified and tested directly. |
| Known sequence with one or more judgment steps | Workflow with model steps | Code keeps control of the path. |
| Next step depends on evidence discovered at runtime | Bounded agent | The model chooses among allowed actions. |
| External fact must be current or attributable | Retrieval | Evidence can change without retraining the model. |
| Repeated output form or domain behavior must change | Fine-tuning evaluation candidate | Training may change behavior, but it does not provide current facts. |
| One operation with a stable contract | Tool | A tool is cheaper and easier to govern than another agent. |
| A task needs isolated instructions, context, or tools | Subagent | Isolation can justify delegation overhead. |
| Many hosts need a standard connection to capabilities | MCP server | The protocol separates integration contracts from one model provider. |

## Agent or workflow

Choose a workflow when you can draw the path before execution. A model can still classify, extract, summarize, or draft inside a workflow.

Choose an agent when a fixed path would need many brittle branches because each observation changes the useful next action. Add a maximum step count, a budget, and an explicit completion test before adding tools.

## Tool or subagent

Use a tool when the work has a stable input and output contract. `get_invoice(invoice_id)` is a tool even if its implementation is complicated.

Use a subagent when the delegated work benefits from an independent loop. A research subagent may search, inspect several sources, and return evidence. If it only calls one search endpoint once, it should probably remain a tool.

## One agent or several

Start with one agent. Add another only when at least one condition is true:

- The second role needs a smaller context.
- It needs different tools or permissions.
- It can run independently in parallel.
- Its result can be evaluated through a clear contract.
- Isolation prevents one task's untrusted data from affecting another role.

Do not add agents merely to give ordinary modules human job titles.

## RAG or fine-tuning

Use retrieval for changing facts, private documents, citations, and access-controlled knowledge. Use fine-tuning to change repeatable model behavior after an evaluation set shows that prompting is insufficient.

The two techniques can be combined. Fine-tuning does not replace authorization or make retrieved evidence trustworthy.

## MCP or a direct API integration

Use a direct integration when one application owns both sides and the contract is unlikely to be reused.

Consider MCP when several hosts need the same tools or resources, capability discovery matters, or a standard client-server boundary reduces repeated adapters. MCP does not remove the need for domain authorization, validation, or safe tool design.
