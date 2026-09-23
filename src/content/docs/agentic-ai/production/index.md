---
title: Production readiness
description: Turn an agent prototype into a bounded, observable, evaluated, and recoverable service.
---

A prototype proves that one path can work. A production agent must also handle the wrong path, a slow dependency, a duplicate request, an unsafe instruction, a model update, and a partial result.

## Define the contract before the model

State the user-visible task, success condition, allowed actions, data scope, maximum latency, cost budget, and failure behavior. These constraints determine whether an agent is appropriate.

For an incident investigator, “find the cause” is not enough. A better contract names the services it may inspect, the time range, whether it may change production, the evidence required for a conclusion, and what it returns when evidence is incomplete.

## Version every behavior input

Record the model identifier, prompt version, tool schemas, retrieval configuration, policy version, MCP server version, and orchestrator release. Without these identifiers, a trace cannot explain why behavior changed.

Pin versions where the provider supports it. Run regression evaluation before a model or prompt change reaches production.

## Separate control, execution, and records

The orchestrator controls the path. Tools perform bounded operations. Durable state and audit records capture commitments. This separation makes recovery and permission review possible.

Avoid one function that sends the entire conversation to a model, executes whatever JSON returns, and stores only the final message. It erases the boundaries needed for production operation.

## Design degraded behavior

Decide what happens when the model provider, retrieval index, MCP server, or tool is unavailable. A fallback model may have different tool accuracy and context limits. A cached answer may violate freshness or access requirements.

Sometimes the correct degraded result is a clear failure with no action taken.

## Release through evaluation and observation

Offline evaluation checks known tasks before release. A small controlled rollout reveals production distributions, latency, and tool behavior. Online monitoring detects regressions after release.

Keep a rollback path for prompts, models, policies, tools, and server connections. A tool kill switch should not require waiting for a new application deployment.

Continue with [reliability](/agentic-ai/production/reliability/), [observability](/agentic-ai/production/observability/), [evaluation](/agentic-ai/production/evaluation/), and [performance and cost](/agentic-ai/production/performance-and-cost/).
