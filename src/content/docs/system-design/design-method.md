---
title: A method for designing systems
description: A four-step method for defining scope, sketching components, and scaling a system.
sidebar:
  order: 2
---

System design starts as an **open-ended problem**. You lead by defining scope, then narrowing the design.

Use these four steps to guide the design.

<div data-anatomy="system-design--design-method-1"></div>
## Define use cases, constraints, and assumptions

Gather requirements and scope the problem. Record assumptions.

Record:

- Who will use it?
- How will they use it?
- How many users are there?
- What does the system do?
- What are the inputs and outputs?
- How much data do we expect?
- How many requests per second?
- What is the read-to-write ratio?

## Sketch the high-level design

Sketch the main components and connections. Justify each idea. Do not dive into details yet.

## Define the core components

Dive into each core component. For a URL shortener, discuss:

- generating and storing a hash of the full URL (MD5, Base62, collisions)
- translating a hashed URL back (database lookup)
- SQL or NoSQL
- database schema
- API and object-oriented design

## Scale the design

Find and fix bottlenecks. Ask: do you need a load balancer, horizontal scaling, caching, or sharding?

:::caution[Iterate, do not jump]
State that you will iterate: 1) benchmark, 2) profile, 3) fix the bottleneck, 4) repeat. Do not jump straight from the initial design to the final design.
:::

## Back-of-the-envelope calculations

You may be asked to estimate by hand. Use:

- the [powers of two table](/system-design/appendix/#powers-of-two-table)
- the [latency numbers](/system-design/appendix/#latency-numbers-every-programmer-should-know)

:::note[A handy conversion]
- 2.5 million seconds per month
- 1 request per second = 2.5 million requests per month
- 40 requests per second = 100 million requests per month
- 400 requests per second = 1 billion requests per month
:::

## Keep the trade-off visible

:::note[Everything is a trade-off]
Address every bottleneck with the [principles of scalable system design](/system-design/), and name the trade-off for each solution you propose.
:::

## Further reading

- [How to structure a system design discussion](https://web.archive.org/web/20210505130322/https://www.palantir.com/2011/10/how-to-rock-a-systems-design-interview/)
- [System design overview](http://www.hiredintech.com/system-design)
- [System design template](https://leetcode.com/discuss/career/229177/My-System-Design-Template)
