---
title: Observability and troubleshooting
description: Use Actuator, logs, metrics, and traces to explain service behavior without exposing secrets or creating unbounded telemetry.
---

A process can be alive while every useful request fails. A fast average can hide a slow minority. Useful observability connects user-visible outcomes to the resource or dependency that explains them, rather than treating a green health endpoint as proof of service quality.

## Actuator is an operational interface

`spring-boot-starter-actuator` supplies operational endpoints and instrumentation. Availability of an endpoint depends on both permitted endpoint access and exposure over HTTP or JMX. Exposure is not authorization. In Boot 4.0, only health is exposed by default.

Expose a small, intentional set. The `metrics` endpoint helps inspect recorded meters. A Prometheus scrape endpoint also needs `micrometer-registry-prometheus`. Neither requires public access to environment properties, bean listings, or heap dumps.

Defining a custom `SecurityFilterChain` makes Boot's security auto-configuration back off, including its management rules. Protect operational endpoints through deliberate authorization and network restrictions. A separate management port is useful isolation, not an access-control policy. Sanitization of configuration values also does not make every diagnostic endpoint safe to publish.

## Health answers a routing decision

Liveness asks whether restarting this instance could help. It must not depend on a shared database or remote API. Otherwise, one dependency failure can trigger restarts across every healthy application instance.

Readiness asks whether this instance should receive traffic. Boot's readiness group does not automatically include dependency health checks. Include a dependency only when its failure makes routing traffic to this instance undesirable. If every replica depends on the same database, marking every replica unready removes all capacity without repairing the database.

The probe groups are enabled automatically in Kubernetes and can be enabled elsewhere with `management.endpoint.health.probes.enabled=true`. Their routes are `/actuator/health/liveness` and `/actuator/health/readiness`.

When management runs separately, a healthy management listener can hide a broken application listener. `management.endpoint.health.probes.add-additional-paths=true` also exposes `/livez` and `/readyz` on the main port. Probe responses should reveal little, and a successful probe still does not establish that every business operation works.

## Metrics summarize, traces explain

Micrometer records measurements through `MeterRegistry`. Counters track events, timers record duration and count, and gauges sample current state. Start with request rate, failures, and latency distributions, then correlate them with connection-pool pressure, executor queues, JVM memory, and garbage collection.

Tag combinations create distinct time series. Route templates such as `/accounts/{id}` are bounded. Raw URLs, account IDs, trace IDs, and exception messages are not. Those values can exhaust both application memory and telemetry storage when used as metric tags.

Micrometer Observation connects instrumentation to metrics and tracing. Low-cardinality tags can appear in both. High-cardinality observation values belong only to traces, subject to privacy and retention rules. Add observations around meaningful operations rather than duplicating the framework's controller instrumentation.

Tracing also needs a supported bridge and exporter. Boot 4.0 provides dedicated tracing starters, including `spring-boot-starter-opentelemetry` for OTLP. Sampling means a missing trace is not proof that a request never ran. Use Boot-managed HTTP client builders for automatic propagation, and configure context propagation when execution crosses an asynchronous boundary.

## Investigate one slow request in context

First distinguish latency measured at the client or proxy from application processing time. A delay before a request reaches the application does not appear as controller execution.

### An illustrative 1.2-second order request

The following scenario is invented teaching data, not measurements from this handbook. A Java 21, Boot 4.0 service uses HikariCP and sends traces through `spring-boot-starter-opentelemetry` to a local OTLP HTTP collector. Actuator comes from `spring-boot-starter-actuator`. The collector and a trace viewer are separate prerequisites.

This `application.properties` fragment enables a local investigation. Sampling every trace and exposing metrics are deliberate diagnostic settings, not production recommendations. Keep these endpoints on an authenticated operational network. The sample assumes authorized access through a local tunnel.

```properties
spring.application.name=orders
spring.datasource.hikari.pool-name=orders
spring.datasource.hikari.maximum-pool-size=10
management.endpoints.web.exposure.include=health,metrics
management.tracing.sampling.probability=1.0
management.opentelemetry.tracing.export.otlp.endpoint=http://localhost:4318/v1/traces
```

The HTTP span is framework instrumentation. This scenario also assumes explicit child spans around connection acquisition and SQL execution, plus a Boot-built HTTP client for the inventory call. Actuator alone does not create this detailed JDBC waterfall. Without those child spans, pool metrics support a hypothesis about waiting but cannot attribute 900 ms to this request.

<figure>
<svg viewBox="0 0 600 350" width="100%" role="img" aria-labelledby="slow-trace-title slow-trace-desc" xmlns="http://www.w3.org/2000/svg">
<title id="slow-trace-title">Illustrative order trace waterfall</title>
<desc id="slow-trace-desc">The HTTP request lasts 1200 milliseconds. Connection acquisition starts at 20 milliseconds and takes 900. SQL runs from 920 to 960. Inventory HTTP runs from 960 to 1100. The remaining 160 milliseconds are outside these child spans.</desc>
<rect x="0" y="0" width="600" height="350" rx="8" fill="var(--diagram-bg)"/>
<g fill="var(--diagram-muted)" font-size="20" font-family="sans-serif"><text x="24" y="30">Elapsed time</text><text x="210" y="30">0</text><text x="356" y="30">600</text><text x="491" y="30">1,200 ms</text></g>
<g stroke="var(--diagram-border)" stroke-dasharray="4 4"><path d="M220 45V290M385 45V290M550 45V290"/></g>
<g fill="var(--diagram-ink)" font-size="20" font-family="sans-serif"><text x="24" y="78">POST /orders</text><text x="24" y="145">Acquire</text><text x="24" y="212">SQL</text><text x="24" y="279">Inventory HTTP</text></g>
<rect x="220" y="54" width="330" height="32" rx="4" fill="var(--diagram-accent-fill)" stroke="var(--diagram-accent)"/>
<rect x="225.5" y="121" width="247.5" height="32" rx="4" fill="var(--diagram-yellow-bg)" stroke="var(--diagram-yellow-stroke)"/>
<rect x="473" y="188" width="11" height="32" rx="2" fill="var(--diagram-green-bg)" stroke="var(--diagram-green-stroke)"/>
<rect x="484" y="255" width="38.5" height="32" rx="3" fill="var(--diagram-purple-bg)" stroke="var(--diagram-purple)"/>
<g fill="var(--diagram-ink)" font-size="20" font-family="sans-serif"><text x="319" y="77">1,200 ms</text><text x="310" y="144">900 ms</text><text x="398" y="212">40 ms</text><text x="399" y="279">140 ms</text></g>
<text x="24" y="327" fill="var(--diagram-muted)" font-size="20" font-family="sans-serif">Most measured time is before SQL starts.</text>
</svg>
<figcaption>Illustrative trace <code>4bf92f3577b34da6a3ce929d0e0e4736</code>. Child spans do not cover all local work.</figcaption>
</figure>

The request's log lines carry that same `traceId`. With Micrometer Tracing, Boot includes trace and span correlation IDs by default. The fields below are an illustrative normalized log view, not Boot's literal default console format. The application supplies the event and elapsed-time fields.

```text
12:00:00.920 traceId=4bf92f3577b34da6a3ce929d0e0e4736 spanId=00f067aa0ba902b7 event=connection_acquired elapsed_ms=900 pool=orders
12:00:01.200 traceId=4bf92f3577b34da6a3ce929d0e0e4736 spanId=b9c7c989f97918e1 event=request_finished route=/orders status=201 elapsed_ms=1200
```

Inspect the pool while the slowdown is happening. These commands assume an authorized tunnel to the application's Actuator listener at `localhost:8080`. Query the bounded pool tag, not a trace ID.

```sh
curl --get 'http://localhost:8080/actuator/metrics/hikaricp.connections.active' --data-urlencode 'tag=pool:orders'
curl --get 'http://localhost:8080/actuator/metrics/hikaricp.connections.pending' --data-urlencode 'tag=pool:orders'
curl --get 'http://localhost:8080/actuator/metrics/hikaricp.connections.max' --data-urlencode 'tag=pool:orders'
```

Illustrative response to the pending query at `12:00:00.500`:

```json
{
	"name": "hikaricp.connections.pending",
	"measurements": [{"statistic": "VALUE", "value": 7.0}],
	"availableTags": []
}
```

The active and max queries both return a `VALUE` of `10.0` in this scenario. Separate HTTP queries are not an atomic snapshot. A metrics backend's time series gives better evidence of sustained saturation than three isolated reads.

| Observation | What it supports | What remains a hypothesis |
| --- | --- | --- |
| Acquire child span takes 900 ms | This request spends most of its duration obtaining a connection | Why other requests held every connection |
| Active equals max and pending is 7 nearby in time | The pool has no spare connections and callers are waiting | Whether the configured pool is undersized |
| This request's SQL span takes 40 ms | Its instrumented SQL section is much shorter than acquisition | Other transactions may still have slow queries or lock waits |
| Completion log reports 201 at 1,200 ms | The application finishes successfully but slowly | What latency the client sees before and after the server span |

The next useful question is what holds the ten connections. Inspect transaction duration, database lock waits, and whether remote calls occur while a transaction holds a connection. Increasing the pool before answering that question can move the waiting to PostgreSQL. When local time remains unexplained, a thread dump or Java Flight Recorder capture can distinguish blocked work from CPU execution.

### Keep correlation out of metric tags

The trace ID joins one request's evidence. It is not a metric dimension. Even this small example would create a new time series per request if `traceId` became a tag.

| Value | Suitable use | Reason |
| --- | --- | --- |
| `route=/orders`, `method=POST`, `pool=orders` | Metric tags and spans | Values come from a bounded set |
| `traceId=4bf92f…` | Logs and trace lookup | Unique per trace |
| Order ID or raw URL | A trace or log only when necessary and safe | Unbounded values, possibly personal data |
| Access token or request body | Omit or redact at the source | Correlation does not justify secret exposure |

Keep tokens, passwords, and personal data out of logs. Avoid logging the same exception at every layer. A missing sampled trace is not evidence that a request never ran.

Continue with [running services](/java-spring/running-services/), [HTTP clients](/java-spring/http-clients/), and [schema and pools](/java-spring/schema-pools/).

## Sources

- [Actuator endpoints and health groups](https://docs.spring.io/spring-boot/4.0/reference/actuator/endpoints.html)
- [Spring Boot observability](https://docs.spring.io/spring-boot/4.0/reference/actuator/observability.html)
- [Micrometer tracing in Spring Boot](https://docs.spring.io/spring-boot/4.0/reference/actuator/tracing.html)
- [Java 21 diagnostic commands](https://docs.oracle.com/en/java/javase/21/docs/specs/man/jcmd.html)
