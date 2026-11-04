---
title: Circuit breakers
description: Stop calling a dependency that is failing, give it room to recover, and configure the breaker in plain Java and Spring Boot.
---

Payments normally answers in 100 ms. Today it takes five seconds. Your 800 ms timeout keeps any single request from hanging, but at 100 checkout requests per second, about 80 threads are always stuck waiting on a call that will almost certainly fail. Payments, already struggling, keeps receiving the full load.

**A circuit breaker stops calling a dependency once its recent failures cross a threshold.** For a while, calls fail immediately without touching the network. That frees the caller's threads and gives the dependency room to recover.

The catch is that the breaker makes decisions from a small sample of recent calls. Set it too sensitive and it rejects traffic a healthy service could have handled. Set it too loose and it opens after the damage is done. This article covers how a breaker decides, the strategies it can use, a complete Java and Spring Boot setup, and how it fits with timeouts, retries, and bulkheads.

## How a breaker decides

A breaker is a small state machine wrapped around every call to one dependency. [Figure](#fig-breaker-states) shows its three states and the transitions between them.

```mermaid #fig-breaker-states The circuit breaker state machine. Failures open the breaker, a wait moves it to half-open, and the probe results decide whether it closes or opens again.
flowchart LR
  C[Closed] -->|"failure or slow-call rate over threshold"| O[Open]
  O -->|"wait time passes"| H[Half-open]
  H -->|"probes succeed"| C
  H -->|"probes fail"| O
```

1. **Closed** is the normal state. Calls go through, and the breaker records each outcome.
2. When the failure rate or slow-call rate crosses its threshold, the breaker moves to **open**. Every call is rejected immediately, before any network request is made.
3. After a configured wait, the breaker moves to **half-open** and lets a few probe calls through.
4. If the probes succeed, it returns to **closed**. If they fail, it goes back to **open** and waits again.

| State | Calls | Purpose |
| --- | --- | --- |
| Closed | Allowed and measured | Observe normal traffic |
| Open | Rejected without invoking the dependency | Stop spending resources on likely failures |
| Half-open | A limited number of probes allowed | Check recovery without releasing all traffic |

An open breaker fails in microseconds instead of 800 ms. In Resilience4j the rejection is a `CallNotPermittedException`. By default, the first call after the wait triggers the move to half-open; a setting can make that transition happen on a timer instead.

**A breaker protects the caller first and the dependency second.** It does nothing for the calls already in flight. Those still need [timeouts](/microservices/timeouts-and-retries/).

## How a breaker detects failure

The state machine is the same everywhere. What differs is how the breaker decides it's time to open. Here are three strategies, from simplest to most useful.

### Naive approach: count consecutive failures

**How it works.** Open after N failures in a row, for example five.

**Where it breaks.** One success resets the count. A dependency failing 80% of requests may never produce five failures in a row, so the breaker never opens. It also ignores slow calls entirely.

### Better approach: failure rate over a count-based window

**How it works.** Keep the outcomes of the last N calls, say 20, and open when the failure rate among them reaches a threshold such as 50%.

**Where it breaks.** At low traffic, the window covers a long stretch of time and reacts slowly. Right after startup, two failures out of three calls would look like a 67% failure rate.

### Strong approach: failure and slow-call rates with a minimum sample

**How it works.** Track two rates over a count-based or time-based window: the share of calls that failed, and the share that succeeded but took longer than a slow-call threshold. Evaluate them only after a minimum number of calls, so a handful of early failures can't trip the breaker. Resilience4j supports all of this.

**Where it breaks.** It still only sees what you classify as failure. If 4xx responses count as failures, a client sending bad requests can open the breaker for everyone. Classify carefully, as the examples below do.

The count-based window is a good default. Choose a **time-based window when traffic is bursty** and you care about "the last 10 seconds" rather than "the last 20 calls". Resilience4j also has special states for operations: disabled, forced-open, and metrics-only, which records outcomes without ever rejecting calls.

### Library or proxy

A breaker can live in your code, as with Resilience4j, or in infrastructure, as with Envoy or a service mesh. A library can tell a business error ("card declined") from a provider failure ("connection reset"). A proxy applies protection without code changes, but Envoy's circuit breaking is mainly about limits on connections and pending requests, which behaves more like a [bulkhead](/microservices/bulkheads/). Check the behavior before treating the two as equivalent.

## A Java example

This example targets Java 21 and the Resilience4j 2.x core API. Add `io.github.resilience4j:resilience4j-circuitbreaker` using the compatible version selected by your application's dependency management. The example uses the programmatic API, so it does not require a Spring annotation or starter.

```java
import io.github.resilience4j.circuitbreaker.CircuitBreaker;
import io.github.resilience4j.circuitbreaker.CircuitBreakerConfig;
import java.io.IOException;
import java.net.URI;
import java.net.http.HttpClient;
import java.net.http.HttpRequest;
import java.net.http.HttpResponse;
import java.time.Duration;

public final class PaymentStatusClient {
	private final HttpClient http = HttpClient.newBuilder()
		.connectTimeout(Duration.ofMillis(300))
		.build();

	private final CircuitBreaker breaker = CircuitBreaker.of(
		"payment-status",
		CircuitBreakerConfig.custom()
			.slidingWindowType(CircuitBreakerConfig.SlidingWindowType.COUNT_BASED)
			.slidingWindowSize(20)
			.minimumNumberOfCalls(10)
			.failureRateThreshold(50)
			.slowCallDurationThreshold(Duration.ofMillis(500))
			.slowCallRateThreshold(50)
			.waitDurationInOpenState(Duration.ofSeconds(10))
			.permittedNumberOfCallsInHalfOpenState(3)
			.recordExceptions(IOException.class)
			.build());

	public int status(URI uri) throws Exception {
		try {
			return breaker.executeCallable(() -> {
				var request = HttpRequest.newBuilder(uri)
					.timeout(Duration.ofMillis(800))
					.GET()
					.build();
				var response = http.send(request, HttpResponse.BodyHandlers.discarding());
				if (response.statusCode() >= 500) {
					throw new IOException("Payment status provider failed");
				}
				return response.statusCode();
			});
		} catch (InterruptedException interrupted) {
			Thread.currentThread().interrupt();
			throw interrupted;
		}
	}
}
```

Reuse one client instance so calls share breaker history. Recreating it per request discards the observations. The URI represents a trusted configured provider endpoint, not a caller-controlled destination.

The numbers illustrate a policy, not production defaults. With ten recorded calls, five failures reach a 50% threshold. A response lasting 600 ms counts as slow even if it succeeds. The 800 ms request timeout bounds waiting independently of the slow-call measurement.

This client returns HTTP status codes for the caller to interpret. Here, 4xx responses do not count as provider failures. A production policy must decide how to handle 429, authentication failures, redirects, and provider-specific errors. A breaker cannot infer those meanings from an HTTP response unless the integration translates or classifies it.

## A Spring Boot example

In Spring Boot, configuration can supply the breaker policy while a Spring-managed service owns the HTTP call. This alternative targets the handbook's Java 21 and Spring Boot 4.0 baseline, using Spring Cloud CircuitBreaker with Resilience4j. The plain Java class above remains a separate implementation.

### Dependencies and version alignment

The following `pom.xml` fragment assumes an existing Boot 4.0 application with Boot dependency management. Spring Cloud's 2025.1 release train supports that baseline. The example selects 2025.1.3; check the [Spring Cloud compatibility table](https://spring.io/projects/spring-cloud/) when choosing versions for another application.

```xml
<dependencyManagement>
	<dependencies>
		<dependency>
			<groupId>org.springframework.cloud</groupId>
			<artifactId>spring-cloud-dependencies</artifactId>
			<version>2025.1.3</version>
			<type>pom</type>
			<scope>import</scope>
		</dependency>
	</dependencies>
</dependencyManagement>

<dependencies>
	<dependency>
		<groupId>org.springframework.cloud</groupId>
		<artifactId>spring-cloud-starter-circuitbreaker-resilience4j</artifactId>
	</dependency>
	<dependency>
		<groupId>org.springframework.boot</groupId>
		<artifactId>spring-boot-starter-restclient</artifactId>
	</dependency>
</dependencies>
```

The Cloud starter supplies the factory and Resilience4j integration. The REST client starter supplies Boot's configured `RestClient.Builder`. Their versions come from the respective dependency-management BOMs.

### The Spring service

Place this alternative `PaymentStatusClient` in a package scanned by the application's `@SpringBootApplication`. Its `status("p91")` method calls `GET /payments/p91/status` on the configured provider and returns a successful HTTP status code.

```java
import io.github.resilience4j.circuitbreaker.CallNotPermittedException;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.cloud.circuitbreaker.resilience4j.Resilience4JCircuitBreakerFactory;
import org.springframework.cloud.client.circuitbreaker.CircuitBreaker;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.web.client.HttpServerErrorException;
import org.springframework.web.client.ResourceAccessException;
import org.springframework.web.client.RestClient;
import org.springframework.web.server.ResponseStatusException;

@Service
public class PaymentStatusClient {
	private final RestClient http;
	private final CircuitBreaker breaker;

	public PaymentStatusClient(RestClient.Builder builder,
			Resilience4JCircuitBreakerFactory factory,
			@Value("${payments.base-url}") String baseUrl) {
		this.http = builder.baseUrl(baseUrl).build();
		this.breaker = factory.create("payment-status");
	}

	public int status(String paymentId) {
		return breaker.run(
			() -> http.get()
				.uri("/payments/{id}/status", paymentId)
				.retrieve()
				.toBodilessEntity()
				.getStatusCode().value(),
			this::unavailable);
	}

	private int unavailable(Throwable failure) {
		if (failure instanceof CallNotPermittedException
				|| failure instanceof ResourceAccessException
				|| failure instanceof HttpServerErrorException) {
			throw new ResponseStatusException(HttpStatus.SERVICE_UNAVAILABLE,
				"Payment status is temporarily unavailable", failure);
		}
		if (failure instanceof RuntimeException unexpected) {
			throw unexpected;
		}
		throw new IllegalStateException("Unexpected payment status failure", failure);
	}
}
```

`factory.create("payment-status")` selects the configuration with that exact instance name. Spring's default singleton service reuses the client and breaker across requests. The `CircuitBreaker` import here is Spring Cloud's interface; the factory supplies its Resilience4j implementation. The `run` call explicitly wraps the operation, so this version does not need an AOP annotation.

`retrieve()` turns provider error responses into exceptions. Connection and request-timeout failures become `ResourceAccessException`; provider 5xx responses become `HttpServerErrorException`. The recovery function maps those failures and open-circuit rejection to an unavailable outcome.

An MVC endpoint calling this service can expose that outcome as HTTP 503. Other exceptions propagate for the application to handle through its error contract.

### application.properties

These settings belong in the Spring application's `src/main/resources/application.properties`:

```properties
# Replace this illustrative provider address for your environment.
payments.base-url=https://payments.example.com

# Boot-managed HTTP transport settings, shared by auto-configured clients.
spring.http.clients.imperative.factory=jdk
spring.http.clients.connect-timeout=300ms
spring.http.clients.read-timeout=800ms

# This synchronous example uses transport timeouts and an explicit breaker.
spring.cloud.circuitbreaker.resilience4j.disable-time-limiter=true
spring.cloud.circuitbreaker.bulkhead.resilience4j.enabled=false

# The instance name matches factory.create("payment-status").
resilience4j.circuitbreaker.instances.payment-status.sliding-window-type=COUNT_BASED
resilience4j.circuitbreaker.instances.payment-status.sliding-window-size=20
resilience4j.circuitbreaker.instances.payment-status.minimum-number-of-calls=10
resilience4j.circuitbreaker.instances.payment-status.failure-rate-threshold=50
resilience4j.circuitbreaker.instances.payment-status.slow-call-duration-threshold=500ms
resilience4j.circuitbreaker.instances.payment-status.slow-call-rate-threshold=50
resilience4j.circuitbreaker.instances.payment-status.wait-duration-in-open-state=10s
resilience4j.circuitbreaker.instances.payment-status.permitted-number-of-calls-in-half-open-state=3
resilience4j.circuitbreaker.instances.payment-status.automatic-transition-from-open-to-half-open-enabled=false
resilience4j.circuitbreaker.instances.payment-status.record-exceptions[0]=org.springframework.web.client.ResourceAccessException
resilience4j.circuitbreaker.instances.payment-status.record-exceptions[1]=org.springframework.web.client.HttpServerErrorException
resilience4j.circuitbreaker.instances.payment-status.ignore-exceptions[0]=org.springframework.web.client.HttpClientErrorException
```

### What the properties control

The breaker property names below share the prefix `resilience4j.circuitbreaker.instances.payment-status.`.

| Property                                              | Example value                       | Effect                                                                                                       |
| ----------------------------------------------------- | ----------------------------------- | ------------------------------------------------------------------------------------------------------------ |
| `sliding-window-type`                                 | `COUNT_BASED`                       | Evaluate a recent number of calls. `TIME_BASED` instead uses seconds for the window size.                    |
| `sliding-window-size`                                 | `20`                                | Keep outcomes from the last 20 recorded calls. This is not a concurrency limit.                              |
| `minimum-number-of-calls`                             | `10`                                | Wait for at least 10 recorded calls before evaluating the closed-state failure and slow-call rates.          |
| `failure-rate-threshold`                              | `50`                                | Open when at least half the evaluated calls failed.                                                          |
| `slow-call-duration-threshold`                        | `500ms`                             | Classify a completed call lasting longer than 500 ms as slow.                                                |
| `slow-call-rate-threshold`                            | `50`                                | Open when at least half the evaluated calls were slow, even if they succeeded.                               |
| `wait-duration-in-open-state`                         | `10s`                               | Keep rejecting calls for the recovery wait before allowing the transition toward probes.                     |
| `permitted-number-of-calls-in-half-open-state`        | `3`                                 | Admit up to three recovery probes before deciding whether to close or reopen.                                |
| `automatic-transition-from-open-to-half-open-enabled` | `false`                             | Let an incoming call after the wait trigger the transition. `true` enables a background transition.          |
| `record-exceptions`                                   | Transport and 5xx exception classes | Count these failures toward the threshold. Other exception types count as success unless explicitly ignored. |
| `ignore-exceptions`                                   | `HttpClientErrorException`          | Exclude 4xx errors from both failure and success counts. The exception still reaches the recovery function.  |

The Boot HTTP settings apply to auto-configured clients using the injected builder. With the selected JDK transport, connection timeout bounds establishing a new connection and read timeout uses the transport's request-timeout mechanism. They are not a deadline for the entire business operation. For provider-specific transport settings, use the [HTTP client configuration example](/java-spring/http-clients/#configure-once-call-through-an-adapter).

Spring Cloud's additional TimeLimiter is disabled here so transport timeout behavior is explicit. Its optional automatic bulkhead wrapping is also disabled. Those two settings affect the factory globally in this example. An application with several integrations needs policies appropriate to each one; [bulkheads](/microservices/bulkheads/) remain necessary when concurrency must be bounded.

### Following failure and recovery

Starting from an empty window, five transport or 5xx failures among ten recorded calls reach the 50% threshold and open the breaker. Subsequent calls invoke the recovery function without contacting Payments. After ten seconds, a new request triggers half-open and a limited set of probes determines recovery. Two failures among three probes exceed 50% and reopen the breaker.

A successful 600 ms response counts as slow. The 800 ms transport timeout remains a separate limit. A 4xx response is ignored by this breaker policy and propagates from the recovery function; ignoring an exception changes the statistics, not the caller's outcome. A real integration must decide whether statuses such as 429 deserve different treatment.

The recovery function runs on protected-call failures while closed as well as on open-circuit rejection. It never reports that a payment succeeded. These are illustrative settings and outcomes for understanding the policy, not measurements from a running Spring application.

## Combining with timeouts, retries, and bulkheads

A breaker answers "should I call at all?" It doesn't bound how long a call waits, and it doesn't limit how many calls run at once. Production calls usually wrap all four, in the order [Figure](#fig-decorator-order) shows.

```mermaid #fig-decorator-order A common order for resilience wrappers. Each attempt passes through the breaker, a time limit, and a bulkhead before it reaches Payments.
flowchart LR
  R[Retry] --> CB[Circuit breaker]
  CB --> T[Time limit]
  T --> BH[Bulkhead]
  BH --> P[Payments]
```

Order matters:

- **Retry outside the breaker** exposes every attempt to the breaker, so a burst of retries quickly opens it. Don't retry a `CallNotPermittedException`; the breaker has just told you the answer.
- **Breaker outside the retry** records only the final outcome of each logical call. It opens more slowly, but each recorded failure means the call really failed.
- **Time limit inside the retry** so every attempt is bounded, and all attempts together still fit inside the request deadline.

Resilience4j's Spring Boot annotations apply this order by default: Retry outermost, then CircuitBreaker, RateLimiter, TimeLimiter, and Bulkhead innermost. Whichever order you choose, write it down, because it changes what the breaker's metrics mean.

## Common problems

### Breakers disagree across instances

Breaker state usually lives in memory, so it's per instance. With 20 Orders instances, some may be open while others are still closed and sending traffic. That's normally fine, since each instance protects itself. Don't expect a global switch unless you build one.

### The breaker counts the wrong errors

Counting `400 Bad Request` or `404 Not Found` as failures lets one misbehaving client open the breaker for every user. Record transport errors, timeouts, and 5xx responses. Decide deliberately about `429 Too Many Requests`: it means the provider is protecting itself, which is often a reason to back off rather than to open.

### The fallback lies

A labeled, stale catalog price can be an acceptable fallback. A fabricated "payment succeeded" never is. When no honest fallback exists, return a clear error such as `503 Service Unavailable`.

### The dashboard looks healthy during an outage

An open breaker rejects calls before they reach Payments, so Payments' error rate drops to zero. Monitor breaker transitions, rejected calls, latency, and total traffic together. **A low error rate caused by rejecting every request is not recovery.**

## In interviews

### When to bring it up

Bring up a circuit breaker whenever a synchronous call goes to a dependency that can be slow or down, especially a third party such as a payment provider. Mention it right after timeouts and retries.

### How to introduce it

1. **Name the dependency and the risk.** "If the payment provider slows down, checkout threads pile up waiting on it."
2. **Describe the policy.** "I'd wrap the call in a circuit breaker that opens at a 50% failure or slow-call rate over the last 20 calls."
3. **Say what users see.** "While it's open, checkout returns a clear 'payments are temporarily unavailable' message instead of hanging."
4. **Connect it to the rest.** "The breaker sits outside a timeout, and only one layer retries."

:::tip[In an interview]
Interviewers often ask how a breaker differs from a retry or a bulkhead. Retries try again, bulkheads cap concurrency, and breakers decide whether to call at all.
:::

## Summary

A circuit breaker fails fast when a dependency is clearly unhealthy, then probes to see when it has recovered.

The trade-off is protection against false alarms: it frees your threads and shields the dependency, but a badly tuned breaker rejects calls that would have worked.

In an interview, bring it up for any slow or unreliable synchronous dependency, and describe the thresholds, what users see while it's open, and how it composes with timeouts and retries.

Don't count client errors as failures. A breaker that opens because callers sent bad requests protects nothing.

## Sources

- [Resilience4j: CircuitBreaker](https://resilience4j.readme.io/docs/circuitbreaker)
- [Martin Fowler: Circuit Breaker](https://martinfowler.com/bliki/CircuitBreaker.html)
- [Java 21 HttpRequest.Builder timeout](<https://docs.oracle.com/en/java/javase/21/docs/api/java.net.http/java/net/http/HttpRequest.Builder.html#timeout(java.time.Duration)>)
- [Envoy: circuit breaking](https://www.envoyproxy.io/docs/envoy/latest/intro/arch_overview/upstream/circuit_breaking)
- [Spring Cloud: release-train compatibility](https://spring.io/projects/spring-cloud/)
- [Spring Cloud CircuitBreaker: starters](https://docs.spring.io/spring-cloud-circuitbreaker/reference/spring-cloud-circuitbreaker-resilience4j/starters.html)
- [Spring Cloud CircuitBreaker: properties and TimeLimiter configuration](https://docs.spring.io/spring-cloud-circuitbreaker/reference/spring-cloud-circuitbreaker-resilience4j/circuit-breaker-properties-configuration.html)
- [Spring Cloud CircuitBreaker: bulkhead wrapping](https://docs.spring.io/spring-cloud-circuitbreaker/reference/spring-cloud-circuitbreaker-resilience4j/bulkhead-pattern-supporting.html)
- [Spring Boot 4.0: REST clients and transport properties](https://docs.spring.io/spring-boot/4.0/reference/io/rest-client.html)
