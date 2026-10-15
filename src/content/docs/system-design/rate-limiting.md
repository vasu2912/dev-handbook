---
title: Rate limiting with a token bucket
description: See how burst capacity and refill speed determine which requests a token bucket admits.
---

A rate limiter decides whether a request may proceed. A token bucket separates two choices: how large a burst you permit and how quickly that allowance recovers.

## Try a burst, then let the bucket refill

This bucket starts with 20 tokens. Every request costs one token. Send a burst of 25: 20 requests pass, and 5 are rejected. Then advance one second. At the default refill speed, 5 new tokens become available.

<div data-figure="token-bucket"></div>

**Play traffic** sends 8 requests per simulation second. The bucket refills at 5 tokens per second, so its initial allowance eventually runs out. Pause to inspect the counters, or change the refill speed to compare the outcomes. The moving tile samples traffic; the counters include every request. **Next second** advances refill while traffic is paused. **Reset** restores the original settings and clears the counters.

## Capacity permits bursts; refill sets the sustained rate

Capacity is the maximum stored allowance. Refill speed is the rate at which that allowance recovers. Unused refill is discarded when the bucket is full.

A bucket with capacity 20 and refill speed 5 per second can admit a burst of 20 immediately. Over a time interval of `t` seconds, its available allowance is at most `20 + 5 × t`. That bound includes the initial stored credits. It does not mean 20 requests are allowed in every second.

Credits can be fractional. After an empty bucket refills for 0.1 seconds at 5 tokens per second, it holds 0.5 tokens. A request that costs one token is still rejected. After another 0.1 seconds, it can admit one request. Rejected requests consume no credits.

The basic update is:

```text
tokens = min(capacity, tokens + refill_rate × elapsed_seconds)
if tokens >= request_cost:
    tokens -= request_cost
    admit the request
else:
    reject the request
```

## Rejection does not create a queue

This example rejects excess requests immediately. An HTTP API commonly responds with `429 Too Many Requests`. It can include a `Retry-After` hint when the next useful retry time is known. See [HTTP and APIs](/backend/http-and-apis/) for response semantics.

A traffic shaper may instead delay work in a queue. That is a separate policy with queue limits, waiting time, and cancellation behavior. The gate in this figure represents an admission decision, not a running request or a queue.

## Choose where the allowance lives

A production limiter needs a key, such as an account, API key, or route. A per-instance bucket gives each application instance its own allowance. A shared limit needs coordinated state and an atomic refill-and-spend operation so concurrent requests cannot spend the same credit.

Decide what happens if that shared state is unavailable. Rejecting every request protects the limit but harms availability. Admitting every request preserves access but can overload the protected service. The right policy depends on the endpoint. See [middleware](/backend/architecture/middleware/) for request admission and [security](/system-design/security-overview/) for layered controls.

## Source

[RFC 3290, Appendix A.2](https://www.rfc-editor.org/rfc/rfc3290.html#appendix-A.2) describes token-bucket behavior for network traffic. This explainer applies the same credit accounting to requests with a fixed cost of one token.
