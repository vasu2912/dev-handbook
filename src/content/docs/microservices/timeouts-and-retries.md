---
title: Timeouts, retries, and fallbacks
description: Bound remote waiting, retry transient failures safely, and preserve meaning when dependencies fail.
---

A timeout bounds one wait. A deadline bounds the whole operation. A retry spends more of the remaining budget on another attempt. These policies belong together because a retry that completes after the caller gives up is wasted work.

## Timeout types

| Limit                    | What it bounds                                         |
| ------------------------ | ------------------------------------------------------ |
| Connection timeout       | Establishing a connection                              |
| Pool acquisition timeout | Waiting to borrow a connection                         |
| Read or response timeout | Waiting for data, according to the client's definition |
| Overall deadline         | All attempts, delays, and processing for the operation |

Timeout names vary by client. A socket read timeout might reset when another chunk arrives and therefore fail to bound the entire response.

For a one-second checkout budget, two attempts capped at 300 ms each plus a 100 ms delay leave 300 ms for other work. Connection acquisition and response processing also consume time. Propagate the remaining budget rather than granting a fresh second at every service.

## Retry eligibility

Retry when the failure can recover and repeated execution preserves correctness. A timeout after a payment request does not establish whether the charge happened. A stable [idempotency key](/engineering/api-integrations/) lets the provider reconcile repeated attempts.

Validation errors normally need a corrected request. Transient connection failures and selected overload responses may qualify for retry, subject to the operation and provider contract.

Exponential backoff increases the delay between attempts. With full jitter, choose a random delay between zero and a capped exponential maximum. Jitter spreads synchronized callers across time.

Three layers that each permit three total attempts can create 27 downstream attempts for one user request. Put retry ownership at a deliberate layer. Limit attempts, elapsed time, and retry traffic.

## Fallback behavior

A fallback supplies an explicitly weaker result: cached recommendations, an unavailable optional widget, or a pending operation. State freshness and completeness when they affect the reader's decision.

A required authorization check cannot safely become permission granted because its service timed out. Propagate a meaningful failure when no valid fallback exists.

In Java, configure transport timeouts on the HTTP client and request. Resilience4j Retry controls repeated calls. Its TimeLimiter controls waiting for asynchronous work, but cancellation does not guarantee that remote work stops. Connect this policy to [circuit breakers](/microservices/circuit-breakers/).

## Sources

- [AWS Builders' Library: timeouts, retries, and backoff with jitter](https://aws.amazon.com/builders-library/timeouts-retries-and-backoff-with-jitter/)
- [gRPC: deadlines](https://grpc.io/docs/guides/deadlines/)
- [Resilience4j: Retry](https://resilience4j.readme.io/docs/retry)
