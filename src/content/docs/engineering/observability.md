---
title: Observability and debugging
description: Connect logs, metrics, traces, service objectives, profiling, and a concrete diagnosis loop for backend failures.
---

Observability helps explain a system's internal behavior through its outputs. Instrumentation should answer operational questions: which requests fail, where they wait, what changed, and which users are affected.

## Signals and context

| Signal   | Useful for                               | Main cost or limitation                 |
| -------- | ---------------------------------------- | --------------------------------------- |
| Logs     | Detailed records of events and decisions | Volume, sensitive data, and correlation |
| Metrics  | Aggregated trends and alerting           | High-cardinality labels increase cost   |
| Traces   | Causal paths across operations           | Sampling can omit important executions  |
| Profiles | Where CPU time or allocations accumulate | Capture overhead and interpretation     |

A trace contains spans representing operations. Propagated context connects a server span to downstream calls. Logs can include trace and request identifiers. User IDs or order IDs usually belong in controlled event context rather than metric labels that create a time series per value.

OpenTelemetry supplies instrumentation and telemetry collection interfaces. A storage and analysis backend still needs to receive and retain the signals.

## Latency and objectives

An average hides the distribution. The p99 is a value at or below which roughly 99% of observations fall for the measured population. Percentiles depend on the time window, aggregation, and instrumentation. Averaging per-instance p99 values does not produce the fleet-wide p99.

A service-level indicator measures a user-relevant property, such as successful checkouts within two seconds. A service-level objective sets a target. Its error budget expresses the allowed unsuccessful portion under that definition. An external service-level agreement can have separate contractual terms.

Alert on actionable symptoms. CPU usage can explain a problem, but a high CPU threshold alone may page for a service that is meeting every objective.

## A diagnosis loop

Suppose p99 latency rises while request volume is stable. First identify the affected route, time range, release, and error pattern. Follow a representative trace to distinguish database execution, connection-pool waiting, and remote-call time. Inspect supporting metrics and logs before choosing a fix.

Form a falsifiable hypothesis. If pool acquisition dominates, compare active connections, waiters, transaction duration, and database capacity. Increasing the pool can worsen a database bottleneck. After the change, verify the original symptom under comparable load.

Thread dumps show waiting and contention. Profiles identify expensive computation. Heap analysis identifies retained data. An incident review records contributing conditions and repair actions without assuming one person or one exception explains the whole failure.

Continue with [Spring observability](/java-spring/observability/) and [JVM diagnostics](/java-spring/jvm-internals/).

## Sources

- [OpenTelemetry: signals](https://opentelemetry.io/docs/concepts/signals/)
- [Google SRE: service-level objectives](https://sre.google/sre-book/service-level-objectives/)
- [Prometheus: histograms and summaries](https://prometheus.io/docs/practices/histograms/)
