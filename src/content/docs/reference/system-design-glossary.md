---
title: System design glossary
description: Definitions for the terms used across the system design notes.
sidebar:
  order: 5
---

The canonical language for these notes. Terms are defined here and linked from the topic notes.

## General

**Scalability**:
A system scales when more resources increase its performance in proportion. A scalable system stays fast as load grows. ([performance and scalability](/system-design/performance-and-scalability/))

**Performance**:
How fast the system answers one request. A performance problem makes the system slow for one user.

**Latency**:
The time to perform one action or produce one result. ([latency and throughput](/system-design/latency-and-throughput/))

**Throughput**:
The number of actions or results per unit of time. Aim for maximum throughput with acceptable latency.

**Availability**:
The share of time a service works. Measured in nines: 99.9% is three nines. ([availability patterns](/system-design/availability-patterns/))

**Consistency**:
Every read returns the most recent write or an error. ([availability vs consistency](/system-design/availability-and-consistency/))

**Partition tolerance**:
The system keeps working when the network splits nodes into partitions.

**Trade-off**:
A choice between two costs. In system design, every decision is a trade-off.

## Distributed systems

**CAP theorem**:
A distributed system can support only two of three guarantees at once: consistency, availability, partition tolerance. Networks fail, so you must support partition tolerance, and choose between consistency and availability. ([availability vs consistency](/system-design/availability-and-consistency/))

**CP system**:
Consistency and partition tolerance. Reads and writes are atomic. Reads may time out during a partition.

**AP system**:
Availability and partition tolerance. Reads return the most available version, which may be stale. Writes may spread slowly.

**Fail-over**:
A standby server takes over when the active server fails. Active-passive or active-active. ([availability patterns](/system-design/availability-patterns/))

**Replication**:
Keeping copies of data on multiple servers. Master-slave or master-master. ([database](/system-design/databases/))

**Federation**:
Splitting databases by function. Forums, users, and products live in separate databases.

**Sharding**:
Splitting one table across databases. Each database holds only a subset of the rows.

**Denormalization**:
Writing redundant copies of data into multiple tables to avoid expensive joins. Read speed improves; write speed and consistency cost.

**Eventual consistency**:
After a write, reads eventually see it, usually within milliseconds. Data replicates asynchronously. ([consistency patterns](/system-design/consistency-patterns/))

**Strong consistency**:
After a write, all reads see it. Data replicates synchronously.

**Weak consistency**:
After a write, reads may or may not see it. A best-effort approach.

## Data stores

**ACID**:
The properties of a relational transaction: atomicity, consistency, isolation, durability. ([database](/system-design/databases/))

**BASE**:
The properties often used to describe NoSQL stores: basically available, soft state, eventual consistency. BASE chooses availability over consistency.

**Key-value store**:
A store that maps keys to values with O(1) reads and writes. The basis for a document store.

**Document store**:
A key-value store where values are documents (JSON, XML). Queries can reach into the document structure.

**Wide column store**:
A nested map of row keys to columns, each with a timestamp. Used for very large data sets.

**Graph database**:
Each node is a record; each arc is a relationship. Good for many-to-many relationships such as a social network.

**SQL tuning**:
Optimizing a relational database: tighten the schema, add indices, avoid joins, partition tables.

## Networking

**DNS**:
Domain Name System. Translates a name such as `www.example.com` into an IP address. ([dns](/system-design/dns/))

**CDN**:
Content delivery network. A global set of proxy servers that serves content near the user. ([cdn](/system-design/cdn/))

**Load balancer**:
Distributes incoming requests across computing resources. Prevents overloading and removes single points of failure. ([load balancer](/system-design/load-balancing/))

**Reverse proxy**:
A web server that centralizes internal services and gives one public interface. ([reverse proxy](/system-design/reverse-proxy/))

**TCP**:
A connection-oriented protocol. Guarantees ordered, uncorrupted delivery. Slower than UDP.

**UDP**:
A connectionless protocol. No delivery guarantee, no congestion control. Fast, good for real-time use.

**RPC**:
Remote procedure call. Runs a procedure on a remote server as if it were local.

**REST**:
An architectural style. A client acts on resources through URIs and HTTP verbs. Stateless and cacheable.

**Horizontal scaling**:
Adding more machines to share load. Prefer it over vertical scaling (a bigger machine).

## Caching

**Cache**:
A fast store that holds recent or hot data to avoid recomputing or re-fetching it. ([cache](/system-design/caching/))

**Cache hit / miss**:
A hit returns the stored value. A miss forces a fetch from the source of truth.

**Cache-aside (lazy loading)**:
The application checks the cache, and loads and stores the value on a miss. ([cache](/system-design/caching/))

**Write-through**:
The application writes to the cache; the cache writes to the database synchronously.

**Write-behind (write-back)**:
The application writes to the cache; the cache writes to the database asynchronously. Fast writes, possible data loss.

**Refresh-ahead**:
The cache refreshes hot entries before they expire.

**TTL**:
Time to live. The period an entry stays valid before it expires.

**Cache invalidation**:
Removing or updating stale cache entries. A difficult problem in any cached system.

## Queueing

**Message queue**:
Receives, holds, and delivers messages between producers and workers. ([asynchronism](/system-design/asynchronous-processing/))

**Task queue**:
Receives tasks and their data, runs them, and delivers results.

**Back pressure**:
Limiting a queue size so it does not grow past memory. Clients get a busy signal (HTTP 503) and retry later.
## Security

**Authentication**:
Verifying *who* a user is: proving identity, usually with a password or token. ([authentication](/backend/security/authentication/))

**Authorization**:
Deciding *what* an authenticated user may do: permissions and roles. ([authorization](/backend/security/authorization/))

**Session**:
A server-side record of an authenticated user, keyed by a random session ID stored in a cookie. ([authentication](/backend/security/authentication/))

**JWT**:
JSON Web Token. A signed, stateless token with a header, payload, and signature. ([authentication](/backend/security/authentication/))

**Hashing**:
A one-way function: any input produces a fixed-length output. The same input always gives the same output; you cannot reverse it.

**Salt**:
A random per-user string added to a password before hashing, so equal passwords do not share a hash.

**Rainbow table**:
A precomputed map of common password → hash, used to reverse simple hashes.

**Slow hash**:
A deliberately slow hashing function (Argon2id, bcrypt) with a cost factor, used to make brute force expensive.

**Rate limiting**:
Capping how many requests a client can make, to stop brute force and abuse. ([authentication](/backend/security/authentication/))

**SQL injection**:
Untrusted input treated as SQL code. Prevented with parameterized queries. ([injection attacks](/backend/security/injection-attacks/))

**Injection attack**:
A class of attack where data is interpreted as code (SQL, shell, HTML).

**XSS**:
Cross-site scripting. An attacker runs JavaScript in a victim's browser. ([xss and csrf](/backend/security/xss-and-csrf/))

**CSRF**:
Cross-site request forgery. A request is forged using the victim's cookies.

**BOLA**:
Broken object level authorization. A user accesses an object they do not own. ([authorization](/backend/security/authorization/))

**BFLA**:
Broken function level authorization. A user reaches a function meant for a higher role.

**CSP**:
Content Security Policy. An HTTP header that restricts which scripts may run. ([xss and csrf](/backend/security/xss-and-csrf/))

**Least privilege**:
Giving each user and component only the access they need. ([security](/backend/security/))
## Concurrency

**Concurrency**:
Dealing with multiple tasks at once by structuring the program to start, pause, and resume them. Works on one core. ([concurrency vs parallelism](/backend/concurrency/concurrency-and-parallelism/))

**Parallelism**:
Executing multiple instructions at the same instant. Needs multiple CPU cores. ([concurrency vs parallelism](/backend/concurrency/concurrency-and-parallelism/))

**IO-bound**:
A task that waits on an external resource: database, network, disk, logging. The CPU is idle during the wait. ([concurrency vs parallelism](/backend/concurrency/concurrency-and-parallelism/))

**CPU-bound**:
A task that does real computation: parsing, encryption, image/video processing. Uses CPU cycles. ([concurrency vs parallelism](/backend/concurrency/concurrency-and-parallelism/))

**Thread**:
An independent piece of execution managed by the operating system. Has its own stack and instruction pointer. ([threads](/backend/concurrency/threads/))

**Event loop**:
A single thread that runs callbacks in a loop, checking for completed IO and resuming tasks. No context switching. ([event loop](/backend/concurrency/event-loop/))

**Goroutine**:
A lightweight virtual thread scheduled by the Go runtime (not the OS), mapped onto a few OS threads. ([goroutines](/backend/concurrency/goroutines/))

**Context switch**:
The work of saving one thread's CPU state and loading another's. Pure overhead: 1–10 µs each. ([threads](/backend/concurrency/threads/))

**Preemptive scheduling**:
The OS pausing a thread before it finishes, whether the thread likes it or not. ([threads](/backend/concurrency/threads/))

**Blocking operation**:
An IO call where the CPU has nothing to do, so the thread blocks and the scheduler switches away.

**async/await**:
Syntax for the event loop: `await` hands control back until the IO completes. Compiles to a state machine. ([event loop](/backend/concurrency/event-loop/))

**Race condition**:
A bug where the outcome depends on the interleaving of operations on shared state. ([race conditions](/backend/concurrency/race-conditions/))

**Mutex (lock)**:
A mutual-exclusion lock: only one thread can enter the critical section at a time. ([race conditions](/backend/concurrency/race-conditions/))

**Channel**:
A Go primitive where goroutines pass messages instead of sharing memory. One owner writes; everyone else sends.

**Deadlock**:
Two threads each waiting for the other's lock: neither can proceed.
## API design

**REST**:
Representational State Transfer. An architectural style where resources have representations (JSON/XML/HTML) whose state is transferred between client and server over HTTP, under a set of constraints. ([rest theory](/backend/api-design/rest/))

**Resource**:
A noun your API serves: a collection (books) or one item (a book). ([api design overview](/backend/api-design/))

**Endpoint (route)**:
A URL path plus an HTTP method, mapping to one operation.

**Idempotency**:
Performing the same operation many times has the same effect as once. GET/PUT/PATCH/DELETE are idempotent; POST is not. ([http methods idempotency](/backend/api-design/methods-and-idempotency/))

**Slug**:
A URL-safe, human-readable identifier: lowercase, hyphens instead of spaces (`harry-potter`). ([url design](/backend/api-design/url-design/))

**Pagination**:
Returning a list one slice at a time, via `page` and `limit` params plus `total`/`totalPages` metadata. ([list apis](/backend/api-design/list-apis/))

**Status code**:
The HTTP code describing the result: 200 OK, 201 Created, 204 No Content, 404 Not Found. ([crud endpoints](/backend/api-design/crud-endpoints/))

**Custom action**:
A non-CRUD operation (e.g. "archive"), expressed as POST on a sub-path. ([http methods idempotency](/backend/api-design/methods-and-idempotency/))

**HATEOAS**:
Hypermedia as the engine of application state: a uniform-interface sub-constraint where links drive client actions.

**Stateless**:
Each request carries all the information needed; the server stores no client context between requests.

**Cacheable**:
A response explicitly labeled cacheable or not, so clients can cache to reduce load.
## Backend architecture

**Handler / Controller**:
The first layer a request hits. Extracts input, binds JSON, validates, transforms, calls the service, and sends the response with the right status code. ([handlers controllers](/backend/architecture/handlers-and-controllers/))

**Service**:
The layer that does the actual processing and orchestration. HTTP-agnostic: takes data, processes, returns data. ([services](/backend/architecture/services/))

**Repository**:
The database layer. Constructs a query, runs it, returns the result. One method, one kind of data. ([repositories](/backend/architecture/repositories/))

**Middleware**:
A function that runs in the middle of the request lifecycle (at boundaries). Gets request, response, and `next()`; handles cross-cutting concerns like CORS, auth, logging, rate limiting. ([middleware](/backend/architecture/middleware/))

**Request context**:
Per-request shared state (key-value) readable by every middleware and handler: e.g. userId, requestId, deadline. ([request context](/backend/architecture/request-context/))

**Binding**:
Deserializing a JSON request body into the language's native format (struct / dict / class).

**Orchestration**:
The service layer's job: calling multiple repositories and combining their results into one response.
