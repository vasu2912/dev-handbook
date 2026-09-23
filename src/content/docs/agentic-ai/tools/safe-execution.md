---
title: Safe tool execution
description: Validate, authorize, approve, sandbox, retry, and audit tool calls without trusting model output.
---

A safe tool path treats the model's call as a request from an untrusted planner. The application decides whether the request can become an effect.

![A safe tool call moves from model proposal through validation, authorization, approval, execution, and verification](/images/agentic-ai/vector/safe-tool-execution.svg)

## Validate more than the schema

A valid argument object can still be wrong. Check identifiers against authoritative state. Check relationships between fields. Apply size, path, query, and time limits.

For a filesystem tool, normalize the requested path and verify that it remains inside an allowed root. For SQL, expose a narrow query operation or a read-only data service rather than arbitrary statements. For Kubernetes, map approved operations to scoped service accounts rather than passing through unrestricted commands.

## Authorize the caller and the action

The tool needs the effective user or workload identity. It also needs the tenant and requested resource. Do not let a model invent these values as ordinary arguments.

An authorization decision should answer: may this identity perform this action on this resource under the current conditions?

## Separate reads from writes

Read tools can still expose sensitive data or create load, but write tools add external effects. Mark the distinction in metadata and policy.

Require confirmation for effects that are costly, destructive, externally visible, difficult to reverse, or broader than the user's original request. Show the person the exact action, target, and expected consequence.

## Retry according to what is known

A connection timeout does not prove that the server did nothing. Retrying a payment or ticket creation can duplicate the effect.

Use an idempotency key tied to the logical operation. Store the first result and return it for later requests with the same key. If the dependency does not support idempotency, reconcile by stable external identity before retrying.

## Sandbox powerful tools

A code-execution tool needs limits on filesystem access, processes, CPU, memory, time, network destinations, and credentials. A container alone is not a complete boundary when it has broad mounts, host networking, or privileged access.

Prefer short-lived environments. Start from a known image, mount only required inputs, and collect explicit outputs.

## Audit the decision and the effect

Record the actor, tenant, agent version, tool name, normalized arguments, policy decision, approval, idempotency key, start time, end time, result status, and external operation identifier. Redact secrets and personal data according to policy.

An audit record should let an operator distinguish “the model proposed it,” “the policy approved it,” and “the external system confirmed it.”

## Sources

- [OWASP Agentic AI threats and mitigations](https://genai.owasp.org/resource/agentic-ai-threats-and-mitigations/)
- [NIST AI 600-1 Generative AI Profile](https://nvlpubs.nist.gov/nistpubs/ai/NIST.AI.600-1.pdf)
