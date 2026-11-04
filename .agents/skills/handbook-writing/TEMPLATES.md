# Page templates

Outlines for each page type. Headings in angle brackets are filled in per article; the rest are literal. Write headings in sentence case. Each template lists the H2s in order, then what goes inside them.

| Type | Use for | Typical length |
| --- | --- | --- |
| Concept | An idea with several strategies: caching, sharding, idempotency, consistency | 8 to 15 min |
| Technology | One tool and what it is good for: Redis, Kafka, Postgres, Elasticsearch | 10 to 15 min |
| Pattern | A recurring design problem solved across many systems: real-time updates, scaling reads, contention | 10 to 15 min |
| Design walkthrough | Designing one system end to end: a URL shortener, a ticketing system, a feed | 15 to 25 min |
| Guide | Orientation and study paths: how to use the handbook, a learning map | 3 to 6 min |

## Concept

```markdown
<opening: situation, pain, idea, catch, roadmap>

## <What it is, or where it applies>
Types, layers, or places the idea shows up. One H3 per type, each with the
explanation loop and a diagram.

## <How it works / Strategies>
One H3 per strategy. Put the default first and say it is the default.

## Common problems
One H3 per failure mode: what it is, the most common cause, how to detect it,
then "Here's how to handle it:" with bold-led bullets.

## In interviews
### When to bring it up
The signals in a problem that call for this idea, and the signal that says
not yet.
### How to introduce it
Numbered steps. Each step has a bold header and one sample sentence the reader
could say, in quotes, written as "we" or "I'll".

## Summary
<the four-paragraph ending>
```

## Technology

```markdown
<opening: why this tool is worth knowing, then the one property that decides
whether it fits (for Redis: in memory, so durability is the question)>

## <Tool> basics
The data model and the handful of commands or APIs that matter. Short code
blocks with comments.

## How it runs
Deployment shapes (single node, replicas, cluster) and how data is split.
Include the numbers: throughput per node, latency, limits.

## What it's good for
One H3 per use, named "<Tool> as a <role>" or "<Tool> for <job>". Each starts
with the simplest version, then "If you need X, use Y." Each ends with a
"use this when" line.

## Limits and how to work around them
One H3 per limit, each with bold-led remediations and the cost of each. End
with an H3 "When not to use <tool>": a few direct sentences.

## Summary
<the four-paragraph ending>
```

## Pattern

```markdown
<opening: the user-visible behavior that needs the pattern, in a familiar
product, and why the obvious approach fails at scale>

## The problem
State the constraint precisely, with numbers.

## The solution
Layer the solution. One H3 per layer (for example client connection, then
server fan-out). Inside each layer, an option ladder or a sequence of H4s
named "<Option>: the <role>", such as "Long polling: the simple fallback".

## When to use it
### Signals in a problem
### When not to use it

## Questions interviewers ask
One H3 per question, written as the question in quotes:
### "What happens when a client reconnects after a minute offline?"
Answer with the explanation loop.

## Summary
<the four-paragraph ending>
```

## Design walkthrough

```markdown
<opening: one paragraph on what the system does, framed for a reader who has
used it, and what makes it hard>

## Requirements
### Functional requirements
Two or three core requirements as "Users should be able to…". Then a bold
"Out of scope:" list.
### Non-functional requirements
Measurable targets: latency, availability, scale, consistency. Then a bold
"Out of scope:" list.
### Scale estimate
Back-of-envelope math in a text code block. Include it only when a number
changes a design decision, and say which decision.

## Core entities
Numbered, bold entity names with a one-line definition each.

## API
Endpoints in a code block as `METHOD /path -> Response`, then a short paragraph
on the choices (resource naming, where the user identity comes from).

## High-level design
One H3 per functional requirement, numbered "1) Users should be able to…".
Each has a lead-in sentence, a diagram, and a numbered request walkthrough
naming each component in bold.

## Deep dives
One H3 per hard question, numbered and phrased as a question:
"1) How do we stop two people from booking the same seat?"
Each holds an option ladder. A `:::note[Related pattern]` callout links to the
pattern article when one applies.

### Final design
One diagram that combines the deep-dive choices, with one or two sentences.

## What a strong answer covers
### Mid-level
### Senior
### Staff
For each level: the breadth versus depth balance, which deep dives the
candidate should drive, and a closing bold "The bar:" sentence stating the
minimum for this problem.
```

## Guide

```markdown
<opening: who the guide is for and the outcome, in two or three sentences>

## <The path, map, or method>
Numbered steps or an ordered list of articles, each with one line on why it
comes at that point.

## If you're short on time
The minimum path, in one paragraph.

## Next step
One link and one sentence on why it comes next.
```
