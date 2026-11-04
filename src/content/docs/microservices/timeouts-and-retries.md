---
title: Timeouts, retries, and fallbacks
description: Stop a slow dependency from taking your service down with it, retry only what is safe to repeat, and degrade without lying to the user.
---

Payments usually answers in 100 ms. Today a slow database query makes it hang. Every checkout request now waits on Payments, Tomcat's 200 worker threads fill up within seconds, and the store stops serving pages that have nothing to do with payments.

**A timeout bounds one wait. A deadline bounds the whole operation. A retry gives a transient failure a second chance.** Together they keep one slow dependency from taking everything else down.

The catch is that retries add load at the worst possible moment, and they can repeat work that should happen once, like a charge. This article covers how to set timeouts, how to split a deadline across calls, which failures to retry and how, and what to return when the dependency stays down.

## Timeouts

Set an explicit timeout on every remote call. Many clients wait forever by default. Java's `HttpClient`, for example, has no request timeout unless you set one.

A single remote call has several separate waits, and clients name them differently:

| Limit | What it bounds |
| --- | --- |
| Pool acquisition timeout | Waiting to borrow a connection from the client's pool |
| Connection timeout | Establishing a new TCP and TLS connection |
| Read or response timeout | Waiting for response data, as the client defines it |
| Overall deadline | Every attempt, delay, and processing step for the operation |

[Figure](#fig-timeout-stages) shows the order in which these waits happen during one call.

```mermaid #fig-timeout-stages The stages of one remote call. Each stage can stall, and each needs its own limit.
flowchart LR
  A[Borrow connection] --> B[Connect]
  B --> C[Send request]
  C --> D[Read response]
```

Read the client's documentation for what each setting actually bounds. A socket read timeout often resets every time a chunk of data arrives, so a server that sends one byte per second never trips it. You need a timeout on the whole request as well.

**How to choose a value.** Start from the dependency's observed p99 latency and add headroom. If Payments' p99 is 250 ms, a 400 ms timeout cuts off the slow tail without failing normal requests. A 30-second default protects nothing: by the time it fires, the caller's own user has given up.

**A timeout does not mean the work failed.** It means you stopped waiting. Payments may still complete the charge after Orders times out. That uncertainty drives everything about retries.

## Deadlines and budgets

A deadline is the total time the caller is willing to spend. Every timeout and retry delay must fit inside it.

Suppose checkout has a one-second budget:

```text
attempt 1 timeout                   300 ms
backoff delay                       100 ms
attempt 2 timeout                   300 ms
left for everything else            300 ms
```

Connection setup, serialization, and your own processing come out of that last 300 ms, too. [Figure](#fig-deadline-budget) shows how the budget shrinks at each hop.

```mermaid #fig-deadline-budget A one-second deadline passed down through the gateway and Orders. Each service gets only the time that remains.
sequenceDiagram
  participant U as User
  participant G as Gateway
  participant O as Orders
  participant P as Payments
  U->>G: checkout (deadline 1000 ms)
  G->>O: create order (900 ms left)
  O->>P: authorize (600 ms left)
  P-->>O: authorized
  O-->>G: created
  G-->>U: 201 Created
```

**Pass the remaining budget down; never hand each service a fresh second.** gRPC does this automatically: a deadline set by the client travels with the call and shrinks as time passes. Over HTTP, send the remaining budget in a header your services agree on. A service whose budget is already spent should fail immediately instead of starting work nobody will wait for.

## Retries

Retry only when the failure is likely to be transient and repeating the operation is safe.

**Usually worth retrying:** connection refused or reset, a timeout on an idempotent operation, `503 Service Unavailable`, and `429 Too Many Requests` after the `Retry-After` delay.

**Not worth retrying:** `400`, `401`, `403`, `404`, `409`, and `422`. The same request will fail the same way. Fix the request instead.

**Retry non-idempotent calls only with an idempotency key.** A timed-out `POST /payments` may have charged the card. Send a stable [idempotency key](/engineering/api-integrations/) with every attempt so Payments recognizes the repeat and returns the first result.

There are three common ways to space out retries, from simplest to most robust.

### Naive approach: retry immediately

**How it works.** On failure, send the request again right away, up to three times.

**Where it breaks.** If Payments is failing because it's overloaded, immediate retries triple its load at the moment it can least handle it. A brief hiccup becomes an outage.

### Better approach: exponential backoff

**How it works.** Wait longer before each attempt: 100 ms, then 200 ms, then 400 ms, up to a cap.

**Where it breaks.** Every client that failed at the same moment also retries at the same moment. Five thousand clients that failed together at 12:00:00.000 all come back together at 12:00:00.100. The load arrives in synchronized waves.

### Strong approach: capped backoff with full jitter and a retry budget

**How it works.** Pick a random delay between zero and the capped exponential value:

```text
delay = random(0, min(cap, base × 2^attempt))
```

The randomness spreads clients across the whole window, so waves never form. Then add a **retry budget**: retries may be at most a fixed share of traffic, such as 10%. When the budget is spent, fail fast. The AWS SDKs and gRPC's retry throttling both use a token bucket for this.

**Where it breaks.** Jitter and budgets protect the dependency, but every retry still spends the caller's deadline. Three attempts can't fit in a budget sized for one.

[Figure](#fig-retry-decision) combines these rules into one decision.

```mermaid #fig-retry-decision The retry decision. A failed call is retried only if the error is transient, the operation is safe to repeat, and both the deadline and the retry budget allow it.
flowchart TD
  F[Call failed] --> R[Is the error transient?]
  R -->|no| E1[Return the error]
  R -->|yes| S[Is it safe to repeat?]
  S -->|no| E2[Return the error]
  S -->|yes| B[Deadline and retry budget left?]
  B -->|no| E3[Return the error]
  B -->|yes| W[Wait with jitter, then retry]
```

The naive approach is never right for a shared dependency. Choose between the other two by asking **how many clients can fail at the same moment?** With one batch job, backoff is enough. With thousands of service instances, you need jitter and a budget.

### Retry amplification

Retries multiply across layers. If the gateway, Orders, and the Payments client each allow three attempts, one user request can become 3 × 3 × 3 = 27 calls to Payments. **Pick one layer to own retries for each dependency**, usually the client closest to it, and set the others to a single attempt.

## Fallbacks

When retries run out, return the most useful honest answer.

- **Cached data**, labeled as possibly stale: yesterday's recommendations, the last known shipping estimate.
- **A reduced page**: hide the reviews widget when Reviews is down.
- **A pending state**: "We're confirming your payment" with a way to check later, instead of an error.

**A fallback may be weaker than the real answer, never false.** A fallback must never report a successful payment that didn't happen. A security check must fail closed: if the authorization service times out, the answer is "denied", not "allowed".

:::caution[Common mistake]
A fallback that hides an outage can be worse than an error. If checkout quietly falls back to "free shipping" whenever Shipping times out, you'll find out from the finance report.
:::

## In Java

Set both timeouts on the JDK client:

```java
var client = HttpClient.newBuilder()
    .connectTimeout(Duration.ofMillis(300))   // establishing the connection
    .build();
var request = HttpRequest.newBuilder(uri)
    .timeout(Duration.ofMillis(800))          // waiting for the response
    .build();
```

Resilience4j's Retry module handles attempts, backoff, and jitter. Its TimeLimiter bounds how long you wait for asynchronous work, but cancelling the wait does not guarantee that the remote work stops. Pair retries with a [circuit breaker](/microservices/circuit-breakers/) so a dependency that is clearly down gets no retries at all.

## Common problems

### No timeout at all

The default "wait forever" turns one hung dependency into exhausted thread pools across every caller. Grep your HTTP, database, and cache clients for timeout settings and set every one explicitly.

### Inner timeouts longer than outer ones

The gateway gives up after 2 seconds, but Orders waits 5 seconds for Payments. Orders keeps working for 3 seconds on a request nobody is waiting for. Each layer's timeout must be shorter than its caller's.

### Retrying what changes state

A retried `POST` without an idempotency key creates two orders or two charges. Only retry operations that are idempotent by design or protected by a key.

## In interviews

### When to bring it up

Bring up timeouts and retries whenever your design has a synchronous call to another service or a third party, especially payments. It's one of the first things interviewers probe after you draw an arrow between two services.

### How to introduce it

1. **Set the timeout from data.** "Payments' p99 is about 250 ms, so I'd time out at 400 ms."
2. **Fit retries in the deadline.** "Checkout has one second, so one retry with jittered backoff fits."
3. **Make the retry safe.** "The authorize call carries an idempotency key, so a retry after a timeout can't double-charge."
4. **Say what the user sees.** "If Payments stays down, the order goes to a pending state and we confirm by email."

:::tip[In an interview]
When you say "retry", expect the follow-up "what if the first attempt actually succeeded?" Have the idempotency key in your answer before they ask.
:::

## Summary

Timeouts stop waiting, deadlines cap the whole operation, and retries give transient failures another chance.

The trade-off is resilience against load and duplication: every retry adds traffic to a struggling dependency and risks repeating a side effect.

In an interview, bring these up for every synchronous call to another service: give a timeout from p99 latency, a retry policy that fits the deadline, an idempotency key, and a fallback.

Don't retry without jitter, a budget, and a single owning layer. Uncoordinated retries turn a slow dependency into a dead one.

## Sources

- [AWS Builders' Library: timeouts, retries, and backoff with jitter](https://aws.amazon.com/builders-library/timeouts-retries-and-backoff-with-jitter/)
- [gRPC: deadlines](https://grpc.io/docs/guides/deadlines/)
- [Resilience4j: Retry](https://resilience4j.readme.io/docs/retry)
