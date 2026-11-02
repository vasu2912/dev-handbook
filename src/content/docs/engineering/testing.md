---
title: Testing boundaries and behavior
description: Compare testing levels, doubles, failure scenarios, concurrency tests, and realistic performance measurements.
---

A test checks a claim about observable behavior. The right test includes the components whose interaction could invalidate that claim. Starting the whole application is unnecessary for a pure calculation but useful when the claim concerns HTTP serialization or real database behavior.

## Testing levels

| Level       | Example claim                                            | Typical limitation                              |
| ----------- | -------------------------------------------------------- | ----------------------------------------------- |
| Unit        | A discount policy rejects an invalid quantity            | Does not verify framework wiring                |
| Integration | A repository enforces a real unique constraint           | Narrow integration can miss the full user path  |
| Contract    | A provider's response remains compatible with a consumer | Does not prove the production workflow succeeds |
| End-to-end  | A user can place and retrieve an order                   | More dependencies and harder diagnosis          |

These labels vary between teams. State the included boundary rather than relying on the label alone. A test pyramid suggests many focused checks and fewer broad scenarios, but the actual distribution follows the system's risks.

## Doubles and assertions

A stub supplies a chosen response. A fake provides a simplified implementation. A mock verifies expected interactions. A spy records calls, sometimes while delegating to real behavior. An in-memory fake cannot establish PostgreSQL locking semantics.

Assert the behavior that matters. Verifying an email-sending adapter was invoked can be meaningful at that boundary. Verifying every internal helper call makes a test fail when implementation changes without changing behavior.

Deterministic tests control time, randomness, identifiers, and external responses. A clock abstraction lets a test cross an expiry boundary without waiting. Sleeps make concurrency tests slower without proving that the relevant interleaving occurred.

## Failure and concurrency

Test duplicate requests, timeouts after commit, partial failure, stale versions, and recovery after restart where those outcomes matter. Use barriers or latches to arrange competing operations. Verify the invariant, such as stock never becoming negative, using the real storage mechanism when storage owns the guarantee.

Contract tests catch incompatible schemas, not every semantic change. A field remaining a string does not prove its meaning stayed the same.

## Performance testing

Load tests examine behavior under a workload. Stress tests exceed expected capacity. Soak tests examine longer-term resource behavior. Use representative data, arrival patterns, and dependency limits.

Report throughput, errors, queueing, and latency percentiles together. A test whose clients wait before sending their next request can reduce offered load as the server slows, concealing some overload behavior. Benchmarks also need warmup and protection against optimization artifacts.

Read [Spring testing](/java-spring/testing/) for executable framework and PostgreSQL examples.

## Sources

- [Martin Fowler: practical test pyramid](https://martinfowler.com/articles/practical-test-pyramid.html)
- [JUnit user guide](https://docs.junit.org/current/overview.html)
- [Testcontainers for Java](https://java.testcontainers.org/)
- [Grafana k6: test types](https://grafana.com/docs/k6/latest/testing-guides/test-types/)
