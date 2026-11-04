---
title: Discovery, gateways, and communication
description: Follow a request from the internet to the right service instance, and choose between HTTP, gRPC, and messaging for each call.
---

Orders needs to call Payments. Yesterday Payments ran on three machines. This morning autoscaling raised it to eight, and a deploy replaced the original three. Any IP address written into Orders' configuration is already wrong.

Three pieces of infrastructure solve this together. **Service discovery** turns the name `payments` into a list of healthy instances. A **load balancer** picks one of them. An **API gateway** is the single front door that external clients use to reach all of it.

The catch is that each piece adds a hop, a cache, and sometimes its own retry policy. When those layers disagree, you get stale routes and retry storms. This article follows one request through every layer, then covers how to choose between HTTP, gRPC, and messaging for each call.

## Following one request

[Figure](#fig-request-path) follows a checkout request from a phone to the Payments service.

```mermaid #fig-request-path One checkout request from a phone to a Payments instance, through the gateway, Orders, and service discovery.
flowchart LR
  App[Mobile app] --> GW[API gateway]
  GW --> O[Orders]
  O --> D[DNS or registry]
  O --> PA[Payments instance A]
  O --> PB[Payments instance B]
```

1. The **mobile app** sends `POST /orders` to `api.shop.example`.
2. The **API gateway** terminates TLS, checks the access token, applies a rate limit, and routes `/orders` to the Orders service.
3. **Orders** needs Payments, so it resolves the name `payments` through **DNS or a registry**.
4. The answer lists the ready instances. A load balancer, in the client or in the platform, picks **instance A** or **instance B**.

Each step has its own failure mode, which is why the rest of this article takes them one at a time.

## Service discovery

On Kubernetes, use a Service and its DNS name by default. Reach for a separate registry only when you run outside a platform that provides one.

### Server-side discovery

The caller uses one stable address, and the platform routes to a live instance.

**How it works.** In Kubernetes, a Service named `payments` in the `shop` namespace gets the DNS name `payments.shop.svc.cluster.local` and a stable virtual IP. The platform tracks which Pods are ready in EndpointSlices. kube-proxy routes each new connection to one of the ready Pods. A Pod that fails its readiness probe is removed from the list, so in [Figure](#fig-kubernetes-service) Pod 3 receives no traffic.

```mermaid #fig-kubernetes-service Server-side discovery in Kubernetes. Orders connects to the Service's stable address, and traffic reaches only Pods that pass their readiness probe.
flowchart LR
  O[Orders] -->|"payments.shop.svc"| VIP[Service virtual IP]
  VIP --> P1[Pod 1 ready]
  VIP --> P2[Pod 2 ready]
  VIP -.-> P3[Pod 3 not ready]
```

The upside is that callers need no discovery library: any language that can resolve DNS and open a connection works. The downside is that balancing happens per connection, not per request.

**Where it breaks.** gRPC and other HTTP/2 clients keep one long-lived connection and send every request over it. Behind a standard Kubernetes Service, that pins all of Orders' traffic to one Payments Pod while the others sit idle. Fix it with client-side load balancing over a headless Service, a service mesh, or a maximum connection age that forces periodic reconnects.

### Client-side discovery

The caller asks a registry for the instance list and balances requests itself.

**How it works.** Each instance registers with a registry such as Consul or Eureka and sends heartbeats. The client library fetches the list, caches it, and spreads requests across instances.

The upside is per-request balancing and no extra hop. The downside is that every service, in every language, needs the client library, and the cached list can lag behind reality by a heartbeat interval or more.

Use this when **you run outside Kubernetes, or need request-level balancing that the platform doesn't provide**.

**Discovery tells you where instances were a moment ago, not that they are healthy now.** DNS answers are cached, too. The JVM, for example, caches successful lookups for 30 seconds by default. An instance can disappear between the lookup and the call, so every call still needs a [timeout](/microservices/timeouts-and-retries/).

## The API gateway

The gateway is the single entry point for traffic from outside: browsers, mobile apps, and partner integrations. Kong, NGINX, Envoy, AWS API Gateway, and Spring Cloud Gateway are common choices.

**How it works.** For every external request, the gateway:

1. Terminates TLS.
2. Validates the access token and attaches the caller's identity.
3. Applies [rate limits](/system-design/rate-limiting/) per client.
4. Routes by path or host: `/orders/**` to Orders, `/catalog/**` to Catalog.
5. Optionally combines several backend calls into one response.

A **backend for frontend** (BFF) is a gateway built for one client. The mobile BFF returns compact payloads for slow networks. The web BFF can return richer pages. Each is owned by the team that builds that client. [Figure](#fig-bff) shows a web BFF and a mobile BFF in front of the same services.

```mermaid #fig-bff Backends for frontends. Each client app gets its own gateway, shaped for its screens and owned by the team that builds it.
flowchart LR
  W[Web app] --> WB[Web BFF]
  M[Mobile app] --> MB[Mobile BFF]
  WB --> O[Orders]
  WB --> C[Catalog]
  MB --> O
  MB --> C
```

The trade-off is one more hop and one more component that must be highly available. **Keep business rules out of the gateway.** The gateway can check that a token is valid, but whether user 7 may read order 42 is a decision for Orders, which owns that data.

## Service mesh

A mesh moves service-to-service networking concerns out of application code and into proxies that run beside each service. Istio and Linkerd are the common choices.

**How it works.** Every Pod gets a sidecar proxy, or a node-level proxy in newer designs. Orders sends its request to its local proxy, which encrypts it with mutual TLS and forwards it to the proxy beside Payments. The proxies apply timeouts, retries, and traffic splitting, and they emit metrics and traces for every call. [Figure](#fig-mesh) shows one call through the mesh.

```mermaid #fig-mesh A call through a service mesh. Each service talks only to its local proxy, and the proxies encrypt traffic with mutual TLS.
flowchart LR
  O[Orders] --> SO[Orders proxy]
  SO -->|"mutual TLS"| SP[Payments proxy]
  SP --> P[Payments]
```

The upside is consistent security and telemetry across every service and language without code changes. The downside is an extra proxy on each side of every call, extra memory in every Pod, and a complex control plane to operate.

**Where it breaks.** A mesh can retry a timed-out `POST /payments`, but it cannot know whether the charge already happened. Only the application knows whether an operation is [idempotent](/backend/api-design/methods-and-idempotency/). Configure mesh retries only for operations that are safe to repeat.

Use a mesh when **you run dozens of services, in several languages, and need uniform mutual TLS and telemetry**. With five services in one language, a shared client library is usually simpler.

## Choosing how services talk

Every call between services is either synchronous, where the caller waits for an answer, or asynchronous, where the caller hands off work and moves on. [Figure](#fig-sync-async) shows both in one checkout.

```mermaid #fig-sync-async Synchronous and asynchronous calls in one checkout. Orders waits for Payments' answer, while Fulfillment receives OrderPlaced later through the broker.
sequenceDiagram
  participant O as Orders
  participant P as Payments
  participant B as Broker
  participant F as Fulfillment
  O->>P: authorize (waits for answer)
  P-->>O: authorized
  O->>B: publish OrderPlaced
  B-->>F: OrderPlaced (later)
```

Checkout must know whether the payment succeeded before it confirms the order, so that call is synchronous. Fulfillment can start packing a few seconds later, so it reacts to an event.

### HTTP with JSON

This is the default for anything external and for most internal calls. Every language, proxy, and debugging tool understands it, and you can call it with `curl`. See [HTTP and APIs](/backend/http-and-apis/) for the protocol details. The downside is loose contracts: a renamed field fails at runtime, not at build time, unless you publish a schema such as OpenAPI.

Use this when **the API is public, or simplicity and tooling matter more than raw efficiency**.

### gRPC

Services define methods and messages in Protocol Buffers, and code generation produces typed clients and servers. gRPC runs over HTTP/2, encodes messages in a compact binary format, and supports four call types: unary, server streaming, client streaming, and bidirectional streaming. Deadlines are built in and travel with the call to downstream services.

The downside is tooling: browsers can't call gRPC directly without a proxy, and binary payloads are harder to inspect. Use this when **internal services make many small calls and benefit from typed contracts, streaming, or deadline propagation**.

### Messaging

The caller publishes a message to a broker such as Kafka, RabbitMQ, or Amazon SQS, and one or more consumers process it later. The caller doesn't wait, and it keeps working while consumers are down.

The downside is a new state the user can see ("your order is being processed"), plus duplicates, ordering questions, and lag to monitor. Use this when **the caller doesn't need the result to respond, or several services care about the same event**. See [Kafka and message brokers](/microservices/message-brokers/).

**Pick the style per interaction, not per system.** Most systems use all three.

## Common problems

### Retry storms across layers

The gateway retries three times, the mesh retries three times, and the client library retries three times. One failing request becomes 27 calls to an already struggling service. Choose one layer to own retries for each call, and keep the others at one attempt. See [timeouts and retries](/microservices/timeouts-and-retries/).

### Errors during deploys

A Pod receives traffic before it has warmed up, or keeps receiving it after it has started shutting down. Here's how to handle it:

- **Readiness probes** that pass only when the service can actually serve, including its own dependencies' connection pools.
- **Graceful shutdown**: stop accepting new connections, finish in-flight requests, then exit. A short pre-stop delay gives endpoint updates time to spread.
- **Connection age limits** so long-lived connections move to new Pods.

### The gateway becomes a monolith

Teams add "just one rule" to the gateway until it holds pricing logic and every release needs the gateway team. Keep the gateway to routing, authentication, and traffic policy. Put aggregation in BFFs owned by client teams.

## In interviews

### When to bring it up

Draw the gateway as soon as you have external clients and more than one service. Bring up discovery and load balancing when you scale a service horizontally. Mention a mesh only when the system has many services and needs uniform mutual TLS or telemetry.

### How to introduce it

1. **Draw the entry point.** "Clients hit an API gateway that terminates TLS, validates tokens, and routes by path."
2. **Name discovery.** "Inside the cluster, services call each other by Kubernetes Service names."
3. **Pick sync or async per edge.** "Orders calls Payments synchronously because it needs the result. Fulfillment consumes OrderPlaced from Kafka."
4. **Say who owns retries.** "Only the Orders client retries Payments, with an idempotency key, inside the request deadline."

:::tip[In an interview]
If you choose gRPC behind a Kubernetes Service, say how you'll balance load. Interviewers who know gRPC will ask why one Pod is getting all the traffic.
:::

## Summary

Discovery finds instances, load balancers pick one, gateways guard the front door, and a mesh standardizes the calls between services.

The trade-off is control against hops. Each layer adds latency, caches, and policies that must agree with each other.

In an interview, draw the gateway for external traffic, name how services find each other, and justify sync or async for each edge by whether the caller needs the answer now.

Don't stack retries in every layer. Pick one owner per call, and let the others fail fast.

## Sources

- [Kubernetes: Service](https://kubernetes.io/docs/concepts/services-networking/service/)
- [gRPC: core concepts](https://grpc.io/docs/what-is-grpc/core-concepts/)
- [Microsoft: Gateway Routing pattern](https://learn.microsoft.com/en-us/azure/architecture/patterns/gateway-routing)
