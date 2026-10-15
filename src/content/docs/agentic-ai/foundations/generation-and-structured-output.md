---
title: Sampling and structured output
description: Understand temperature, top-p, top-k, stop conditions, JSON Schema, and the limits of format guarantees.
---

The model produces a probability distribution over possible next tokens. A decoding strategy turns that distribution into one selected token.

The strategy affects variation. It does not turn an unsupported answer into a supported one.

<div data-anatomy="agentic-ai--foundations--generation-and-structured-output-1"></div>

## Greedy and sampled decoding

Greedy decoding selects the highest-probability token at each step. Sampling draws from the distribution. Provider implementations may expose several controls:

- **Temperature** rescales logits before probabilities are calculated. Lower values concentrate probability on likely tokens. Higher values flatten the distribution.
- **Top-p** keeps the smallest set of tokens whose cumulative probability reaches a threshold, then samples from that set.
- **Top-k** keeps a fixed number of the highest-probability candidates.
- **Stop sequences** end generation when configured text appears.

Exact behavior and allowed ranges depend on the model API. A temperature of zero is often more repeatable, but it does not promise identical output across model versions, infrastructure changes, or providers.

## Structured output constrains shape

A structured-output feature asks the model to produce data that matches a declared schema. A tool call is a common example. The model emits a tool name and arguments rather than executing the operation itself.

```json
{
  "type": "object",
  "properties": {
    "invoiceId": { "type": "string", "pattern": "^inv_[0-9]+$" },
    "reason": { "type": "string", "minLength": 1 }
  },
  "required": ["invoiceId", "reason"],
  "additionalProperties": false
}
```

Schema validation can prove that both fields exist and that `invoiceId` has the requested form. It cannot prove that the invoice exists, belongs to the caller, or may be refunded.

## Validate in layers

Production code needs separate checks:

1. **Syntax.** The output parses.
2. **Schema.** Types, required fields, and structural constraints match.
3. **Semantics.** Identifiers exist and values make sense together.
4. **Authorization.** The caller may perform this action on this resource.
5. **Execution policy.** The action satisfies approval, budget, and risk rules.

Returning valid JSON solves only the first part of this sequence.

## Repair has limits

An application can ask the model to repair invalid output, but every repair consumes time and tokens. A bounded retry is reasonable for a recoverable format error. Repeated semantic errors usually point to an unclear schema, a poor tool description, missing context, or a task the selected model does not handle reliably.

Record invalid attempts in evaluation data. Do not hide them behind unlimited repair loops.

## Sources

- [JSON Schema 2020-12](https://json-schema.org/draft/2020-12)
- [OpenAI Structured Outputs](https://platform.openai.com/docs/guides/structured-outputs)
- [Anthropic tool use](https://docs.anthropic.com/en/docs/agents-and-tools/tool-use/overview)
