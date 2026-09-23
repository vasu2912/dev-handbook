---
title: Design a DevOps investigation agent
description: Design a read-first incident agent that correlates alerts, metrics, logs, deployments, and Kubernetes state before approved remediation.
---

The agent receives a production alert, gathers evidence, proposes a cause, and recommends a runbook. It performs remediation only when policy and approval allow the exact action.

## Separate investigation from remediation

The default tool set is read-only:

- Read the alert and service ownership
- Query bounded metrics and logs
- Read deployment history
- Inspect Kubernetes workloads and events
- Read recent code changes and incidents

Remediation tools live behind a separate permission and approval boundary.

## Anchor the task in time and scope

The orchestrator records service, environment, alert start, tenant if relevant, and investigation window. Every query inherits this scope. A log tool enforces maximum time range and result size.

The model may refine a query. It may not expand from one service to the whole cluster without policy approval.

## Correlate observations through identifiers

Use deployment version, trace ID, pod, node, request ID, and timestamp to connect evidence. Preserve links to raw observations.

The agent can state a probable cause only with cited evidence and an uncertainty level. Contradictory signals remain visible.

## Map remediation to runbooks

Expose narrow actions such as `restartDeployment`, `rollbackRelease`, or `scaleDeploymentWithinLimit`. Each tool validates namespace, workload allowlist, change ticket, current state, maximum scale, and user permission.

Do not expose arbitrary `kubectl`, cloud administrator APIs, or shell access to production.

## Approve the normalized effect

The approval screen shows the environment, resource, current version, proposed version or action, expected user impact, rollback path, and evidence. An old approval cannot authorize a changed target.

Use an idempotency key for the remediation. After execution, verify rollout and service health. If verification fails, follow the predefined rollback or escalation path.

## Design for unavailable telemetry

If logs or metrics are unavailable, the agent reports the evidence gap. It does not treat missing telemetry as proof that the service is healthy.

Circuit breakers prevent a failing telemetry backend from consuming the whole incident budget. The task can return partial findings and escalation instructions.

## Evaluate with incident replays

Replay known incidents in a safe environment. Score evidence selection, probable-cause quality, forbidden actions, time to useful finding, tool load, approval behavior, and remediation verification.

Include malicious log lines and issue comments to test indirect prompt injection.
