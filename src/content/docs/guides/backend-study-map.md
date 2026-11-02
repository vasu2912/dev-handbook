---
title: Backend interview study map
description: A subject map for revising backend mechanisms, types, tradeoffs, and implementation details without a question bank.
---

Use these notes to understand a topic well enough to explain its behavior, compare alternatives, and trace an example. Start with the high-level model, then follow implementation details when they clarify a guarantee or failure mode.

The map combines existing handbook material with focused notes on backend interview subjects. The selection is informed by [Amazon's published software-development interview topics](https://amazon.jobs/content/en-gb/how-we-hire/interview-prep/software-development-topics) and the primary technical sources linked from each note. It is a study scope, not a claim about how frequently a company asks about a subject.

## Programming and execution

| Subject                | Notes                                                                                           |
| ---------------------- | ----------------------------------------------------------------------------------------------- |
| Data structures        | [Arrays, maps, trees, heaps, graphs, and complexity](/runtime/data-structures/)                 |
| Algorithms             | [Search, sorting, traversal, greedy choices, and dynamic programming](/runtime/algorithms/)     |
| Operating systems      | [Processes, scheduling, I/O, synchronization, and deadlocks](/runtime/processes-and-io/)        |
| Memory and persistence | [Virtual memory, pages, stacks, heaps, files, and durable writes](/runtime/memory-and-storage/) |
| Networking             | [DNS, TCP, TLS, HTTP versions, and connection reuse](/runtime/networking/)                      |
| Concurrency models     | [Threads, event loops, goroutines, and shared-state races](/backend/concurrency/)               |

## APIs and application design

| Subject                          | Notes                                                                                                                                                       |
| -------------------------------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Request architecture             | [Routing, controllers, services, repositories, and middleware](/backend/architecture/)                                                                      |
| HTTP APIs                        | [Resources, methods, status codes, pagination, and consistency](/backend/api-design/)                                                                       |
| Integration contracts            | [Idempotency keys, webhooks, compatibility, and uploads](/engineering/api-integrations/)                                                                    |
| Object design                    | [Encapsulation, composition, SOLID, and design patterns](/engineering/object-design/)                                                                       |
| Authentication and authorization | [Security foundations](/backend/security/), [OAuth and OIDC](/backend/security/oauth-and-oidc/)                                                             |
| Web vulnerabilities              | [Injection](/backend/security/injection-attacks/), [XSS and CSRF](/backend/security/xss-and-csrf/), [misconfiguration](/backend/security/misconfiguration/) |

## Data and distributed behavior

| Subject                     | Notes                                                                                                                                                       |
| --------------------------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Relational modeling and SQL | [Keys, normalization, joins, grouping, NULL, and windows](/databases/schema-and-sql/)                                                                       |
| Transaction internals       | [ACID, MVCC, isolation, optimistic updates, and locks](/databases/transactions-and-locking/)                                                                |
| Query performance           | [Index types, composite indexes, and query plans](/databases/indexes-and-query-plans/)                                                                      |
| Database operations         | [Migrations, replication, backups, and recovery](/databases/migrations-and-recovery/)                                                                       |
| Database selection          | [SQL, NoSQL, replication, sharding, and denormalization](/system-design/databases/)                                                                         |
| Caching                     | [Placement](/system-design/caching/), [patterns, invalidation, and overload](/databases/cache-patterns/)                                                    |
| Distributed guarantees      | [Availability and consistency](/system-design/availability-and-consistency/), [consistency patterns](/system-design/consistency-patterns/)                  |
| Scaling and routing         | [Load balancing](/system-design/load-balancing/), [DNS](/system-design/dns/), [CDNs](/system-design/cdn/), [reverse proxies](/system-design/reverse-proxy/) |

## Microservices patterns

| Subject               | Notes                                                                                                                                                                                 |
| --------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Architecture choices  | [Monoliths, modular monoliths, service boundaries, and ownership](/microservices/service-boundaries/)                                                                                 |
| Service communication | [Discovery, gateways, REST, gRPC, and meshes](/microservices/discovery-and-gateways/)                                                                                                 |
| Resilience            | [Circuit breakers with Java](/microservices/circuit-breakers/), [timeouts and retries](/microservices/timeouts-and-retries/), [bulkheads and backpressure](/microservices/bulkheads/) |
| Traffic control       | [Rate-limiting algorithms and distributed enforcement](/system-design/rate-limiting/)                                                                                                 |
| Distributed workflows | [Two-phase commit, sagas, and compensation](/microservices/sagas/)                                                                                                                    |
| Reliable messaging    | [Outbox, CDC, deduplication, and delivery guarantees](/microservices/outbox-and-delivery/)                                                                                            |
| Brokers and streams   | [Kafka partitions, consumer groups, offsets, and replay](/microservices/message-brokers/)                                                                                             |
| Data patterns         | [CQRS, event sourcing, projections, and snapshots](/microservices/cqrs-and-event-sourcing/)                                                                                           |
| Coordination          | [Distributed leases, ownership, and fencing](/microservices/distributed-locks/)                                                                                                       |
| Replicated state      | [Consensus with Raft: terms, quorums, commit rules, and reads](/system-design/consensus/)                                                                                             |
| Migration             | [Strangler fig, anti-corruption layers, and compatible releases](/microservices/migration/)                                                                                           |
| Live updates          | [WebSockets, SSE, reconnection, and fan-out](/system-design/real-time-backends/)                                                                                                      |

## Java and Spring

Begin with [Java essentials](/java-spring/java-essentials/), then connect [collections internals](/java-spring/collections-internals/), [JVM execution and garbage collection](/java-spring/jvm-internals/), and [Java concurrency and virtual threads](/java-spring/concurrency-internals/).

The [Spring Boot track](/java-spring/) covers dependency injection, configuration, proxies, request handling, validation, security, JPA, transactions, query fetching, connection pools, HTTP clients, asynchronous work, events, caching, tests, and production behavior. Read annotations alongside their boundaries: proxy interception, transaction ownership, thread context, and persistence lifecycle.

## Delivery and production

- [Testing](/engineering/testing/) connects claims to unit, integration, contract, end-to-end, and load-test boundaries.
- [Containers and Kubernetes](/engineering/containers-and-kubernetes/) covers images, storage, workloads, discovery, probes, and resource limits.
- [Git and delivery](/engineering/git-and-delivery/) covers history, CI, artifacts, release strategies, and rollback.
- [Observability and debugging](/engineering/observability/) covers signals, latency distributions, service objectives, and diagnosis.
- [Python for AI backends](/engineering/python-for-backends/) covers asyncio, the GIL, typing and Pydantic, and FastAPI service design.
- [Engineering with AI assistants](/engineering/ai-assisted-engineering/) covers ownership, verification, and the measured risks of AI-written code.
- [System-design walkthroughs](/system-design/walkthroughs/) combine requirements, data, capacity, failure, and tradeoffs in larger examples.

For roles involving AI systems, the separate [Agentic AI track](/agentic-ai/) covers LLM foundations, RAG, tool execution, orchestration, MCP, security, and production evaluation.

Inside the Agentic AI track, read [inference and serving internals](/agentic-ai/foundations/inference-and-serving/), [reasoning models](/agentic-ai/foundations/reasoning-models/), [multimodal models](/agentic-ai/foundations/multimodal/), [fine-tuning and adaptation](/agentic-ai/foundations/fine-tuning/), and [vector index internals](/agentic-ai/foundations/vector-indexes/) as the depth topics that 2026 AI-engineering interviews add to the model basics.

## A revision method

For each topic, explain the mechanism, identify its alternatives, trace a normal operation, and then change one assumption. Follow a timeout after commit, a duplicate message, an expired lease, or a stale read. The failure path reveals what the mechanism actually guarantees.

The notes intentionally vary in depth. A bounded concept such as circuit breaking has a focused explanation and implementation example. Broad subjects such as algorithms provide an overview and sources for deeper study. No finite topic map covers every role or every interview.
