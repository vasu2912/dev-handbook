# Backend study notes coverage

Research date: 2026-10-17.

The requested format is explanatory revision notes. Each topic explains its purpose, mechanism, relevant types, tradeoffs, and failure behavior. Implementation examples appear where they make the mechanism concrete. This is not a question bank or a prediction of interview frequency.

## Scope evidence

[Amazon's software-development interview guide](https://amazon.jobs/content/en-gb/how-we-hire/interview-prep/software-development-topics) lists programming languages, data structures, algorithms, object-oriented design, databases, distributed computing, operating systems, and internet topics. It also stresses application of knowledge and says that role-specific preparation should be clarified with the recruiter. That supports the broad subject families, not a universal syllabus.

The technical expansion follows primary sources rather than copying interview answer collections. [Microsoft's architecture pattern catalog](https://learn.microsoft.com/en-us/azure/architecture/patterns/) informs pattern terminology. [Resilience4j](https://resilience4j.readme.io/docs/circuitbreaker), PostgreSQL, Java, Kafka, Docker, Kubernetes, RFCs, and the other sources linked from each note support implementation-specific behavior.

## Existing and added coverage

| Subject family       | Existing material retained                                                        | Added explanations                                                                                                      |
| -------------------- | --------------------------------------------------------------------------------- | ----------------------------------------------------------------------------------------------------------------------- |
| Application design   | Request lifecycle, controllers, services, repositories, middleware                | Object design, composition, SOLID, named patterns                                                                       |
| APIs                 | REST, URLs, CRUD, methods, pagination                                             | Idempotency contracts, webhooks, evolution, file uploads                                                                |
| Security             | Sessions, JWT, access control, injection, XSS, CSRF                               | OAuth, OIDC, PKCE, token audiences                                                                                      |
| Data                 | Database selection, sharding, replication overview, index reference               | SQL, normalization, MVCC, isolation, locks, plans, migration, recovery, cache races                                     |
| Distributed systems  | Consistency, availability, reliability, rate limiting, queues, real-time delivery | Service boundaries, gateways, gRPC, breakers, bulkheads, sagas, outbox, CQRS, event sourcing, fencing, Kafka, migration |
| Java                 | Language essentials and Spring implementation track                               | Collections, JVM, garbage collection, Java Memory Model, virtual threads                                                |
| CS foundations       | Threads, event loops, goroutines, races                                           | OS scheduling, memory, storage, network connections, data structures, algorithm patterns                                |
| Engineering practice | Spring testing, observability, runtime operations                                 | General testing boundaries, containers, Kubernetes, Git, CI, release safety, diagnostics, integration contracts         |
| AI systems           | Existing Agentic AI track                                                         | Linked from the study map without duplicating its content                                                               |

## Depth and limitations

The public entry point is `src/content/docs/guides/backend-study-map.md`. It links both retained and new notes. New material keeps the existing routes and heading anchors intact.

High-level notes group related mechanisms where their differences are the learning objective. They are not complete textbooks on SQL, operating systems, algorithms, Kubernetes, or every Java API. The circuit-breaker note includes a plain Java Resilience4j core example and a Spring Boot 4.0 example using Spring Cloud CircuitBreaker, with its dependency baseline and properties explained. Example thresholds are illustrative rather than recommended production settings.

Additional subjects can be expanded when the intended role requires them: deeper individual algorithms, database-specific internals, cloud-provider services, broker-specific operations, and additional language runtimes. The current map makes the covered depth visible rather than labeling those areas universally complete.
