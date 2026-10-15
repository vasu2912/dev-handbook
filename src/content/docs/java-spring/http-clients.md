---
title: Calling external services
description: Choose an HTTP client and bound the cost of slow, failed, or repeated remote calls.
---

Spring Boot 4.0 uses Spring Framework 7.0, where `RestTemplate` is deprecated in favor of `RestClient`. Use `RestClient` for imperative calls and `WebClient` for non-blocking or streaming work. Neither makes a remote operation part of your database transaction.

## Configure once, call through an adapter

Build reusable clients from Boot's injected builders. The builder preserves Boot customizations such as message converters and observations. The request factory owns transport behavior. This configuration fragment deliberately selects the JDK transport instead of letting classpath changes select it. Imports and the enclosing `@Configuration` class are omitted:

```java
@Bean(destroyMethod = "close")
java.net.http.HttpClient catalogTransport() {
	return java.net.http.HttpClient.newBuilder()
		.connectTimeout(Duration.ofMillis(500))
		.build();
}

@Bean
RestClient catalogHttp(RestClient.Builder builder,
		@Qualifier("catalogTransport") java.net.http.HttpClient transport) {
	var factory = new JdkClientHttpRequestFactory(transport);
	factory.setReadTimeout(Duration.ofSeconds(2));
	return builder.baseUrl("https://catalog.example.com")
		.requestFactory(factory)
		.build();
}
```

Spring closes the Java 21 `HttpClient` bean on shutdown. The injected builder still supplies Boot's client customizations, but the explicit factory replaces Boot's transport selection and transport settings. The URL is illustrative. Externalize the provider URL and credentials in a real application.

Connection timeout bounds establishment of a new connection. The JDK factory's read timeout uses the JDK request-timeout mechanism. These settings do not establish a deadline for the whole business operation, including retries and application work. Other transports may measure read inactivity instead. A pooled transport can also wait for a connection before attempting a call. Bound that wait and concurrent calls separately.

This adapter method fragment assumes an injected `@Qualifier("catalogHttp") RestClient http`. The provider contract defines `404` as a missing product and requires a JSON body for `200`:

```java
record ProductResponse(String id, String name) {}

public Optional<ProductResponse> find(String id) {
	try {
		var product = http.get()
			.uri("/products/{id}", id)
			.accept(MediaType.APPLICATION_JSON)
			.retrieve()
			.body(ProductResponse.class);
		if (product == null) {
			throw new RestClientException("Catalog returned an empty product response");
		}
		return Optional.of(product);
	} catch (HttpClientErrorException.NotFound missing) {
		return Optional.empty();
	}
}
```

The adapter maps one known provider response, not every failure. With `retrieve()`, error statuses raise exceptions by default. `exchange()` gives direct response access and does not apply those status handlers.

| Input or provider response | Observable adapter outcome | Meaning |
| --- | --- | --- |
| `find("p7")`, `200 {"id":"p7","name":"Desk"}` | `Optional[ProductResponse[id=p7, name=Desk]]` | Product found |
| `find("absent")`, `404` | `Optional.empty` | Known absence, not an outage |
| `find("p7")`, `401` | HTTP client exception escapes | Fix credentials, do not pretend the product is absent |
| `find("p7")`, `503` | HTTP server exception escapes | Provider unavailable |
| Connection failure or response timeout | `ResourceAccessException` escapes | Transport failed, not a provider status |
| `200` with no body | `RestClientException` escapes | Provider contract violation |

The outcomes above are illustrative, not captured network output. An application boundary can map unavailable-provider errors to its public error contract without exposing provider bodies or credentials.

HTTP service interfaces reduce repetitive request construction. This alternative interface fragment assumes separate registration backed by the same configured client:

```java
interface CatalogClient {
	@GetExchange("/products/{id}")
	ProductResponse find(@PathVariable("id") String id);
}
```

The proxy does not supply a timeout, retry policy, or local transaction guarantee. Keep provider-specific statuses and data shapes behind the application adapter whichever client syntax you choose.

## Separate rejection from uncertainty

Compare two attempts to charge order `o42`. The following timeline uses an illustrative provider, not the catalog endpoint. Times show the order of events, not measured latency.

<div data-anatomy="java-spring--http-clients-1"></div>

| Time | Connection refused before any request bytes | Timeout after provider accepts payment |
| --- | --- | --- |
| t0 | Caller attempts a connection | Caller sends `POST /payments`, key `pay-o42` |
| t1 | Connection cannot be established | Provider commits payment `p91` |
| t2 | Caller receives a transport error | Response is lost. Caller times out |
| Known state | This attempt sent no payment request | Caller has no confirmed result. Provider has payment `p91` |
| Next decision | Correct connectivity and apply a safe retry policy | Reuse the same supported key or query the provider before deciding |

A generic transport exception does not prove that the failure happened before sending. Proxies, prior attempts, and dropped responses can make the outcome uncertain. Do not classify every `ResourceAccessException` as "payment never happened."

This payment call fragment assumes an injected `payments` client, an application-defined `PaymentRequest`, and a provider that implements the key contract below:

```java
payments.post()
	.uri("/payments")
	.header("Idempotency-Key", "pay-o42")
	.contentType(MediaType.APPLICATION_JSON)
	.body(new PaymentRequest("o42", 2500, "USD"))
	.retrieve()
	.toBodilessEntity();
```

Persist the key with the logical payment intent before the first attempt. Reuse that key and the same amount, currency, and order across retries and process restarts. A new key for each attempt defeats deduplication. An in-memory map of keys does not survive deployment.

The provider must recognize the key for this endpoint and account, handle concurrent requests with the same key, and retain the result for the retry window. After that retention window, do not assume the key still prevents another charge. Stripe's documented idempotency behavior is one concrete example, not a universal HTTP guarantee. Without a supported contract, reconcile the uncertain payment through a provider lookup or manual recovery instead of blindly repeating it.

## Protect the caller's capacity

Retry only failures that the operation can safely repeat. Limit attempts and elapsed time, use backoff with jitter, and respect provider retry guidance. One layer should own retries. Retrying at several layers multiplies traffic.

A circuit breaker rejects new calls after configured failure or slow-call thresholds, then permits trial calls to detect recovery. It does not impose a concurrency limit or replace transport timeouts. A separate concurrency limit protects local capacity even while the breaker is closed. A fallback must preserve the use case's meaning, not fabricate success.

A large connection pool can overwhelm the provider. A small pool with an unbounded pending queue moves the overload into your service. Keep response buffering bounded, and close response streams when using streaming APIs.

Avoid waiting on HTTP inside a database transaction. The wait can retain a connection and locks, and a later rollback cannot undo the remote operation. Separate remote work from short database transactions, or persist an intent for durable delivery.

Continue with [transactions](/java-spring/transactions/), [events and messaging](/java-spring/events-messaging/), and [observability](/java-spring/observability/).

## Sources

- [Spring REST clients and HTTP service interfaces](https://docs.spring.io/spring-framework/reference/integration/rest-clients.html)
- [Spring Boot 4.0 REST clients](https://docs.spring.io/spring-boot/4.0/reference/io/rest-client.html)
- [JDK request factory timeout API, Spring Framework 7.0](https://docs.spring.io/spring-framework/docs/7.0.x/javadoc-api/org/springframework/http/client/JdkClientHttpRequestFactory.html)
- [Stripe idempotent requests](https://docs.stripe.com/api/idempotent_requests)
- [WebClient transport configuration](https://docs.spring.io/spring-framework/reference/web/webflux-webclient/client-builder.html)
- [Resilience4j retry](https://resilience4j.readme.io/docs/retry) and [circuit breaker](https://resilience4j.readme.io/docs/circuitbreaker)
