---
title: Spring request handling
description: Follow a request through Spring MVC and keep HTTP behavior separate from domain decisions.
---

Spring MVC turns an HTTP request into a method call. The framework resolves the route, converts input, invokes the controller, and serializes the result. Your application still defines who may act, which inputs are acceptable, and what the operation means.

## Follow the request before the controller

In a servlet application, the embedded server accepts the connection and dispatches the request through servlet filters. Spring Security participates here through its filter chain. A request can be rejected before MVC looks for a controller.

<ol class="learning-flow" aria-label="Order quote request flow">
<li><a href="/java-spring/security/">1. Security filters</a><p>Accept credentials and authorize POST /order-quotes, or stop before MVC.</p></li>
<li><a href="https://docs.spring.io/spring-framework/reference/web/webmvc/mvc-servlet.html">2. DispatcherServlet</a><p>Find OrderController.quote for the method and path.</p></li>
<li><a href="/java-spring/validation-errors/">3. Convert and validate</a><p>Read JSON into OrderRequest. Reject malformed JSON or a nonpositive quantity.</p></li>
<li><a href="#keep-the-controller-thin">4. Controller</a><p>Pass the validated quantity to OrderService.</p></li>
<li><a href="#keep-the-controller-thin">5. Service</a><p>Enforce the per-order limit and calculate the quote.</p></li>
<li><a href="#make-failures-deliberate">6. Response conversion</a><p>Write the quote as JSON, or translate a known failure into a problem response.</p></li>
</ol>

`DispatcherServlet` coordinates MVC processing. A handler mapping identifies the endpoint, and a handler adapter invokes it. Argument resolvers supply path variables, query parameters, and supported application arguments. HTTP message converters read a request body or write a response body, commonly as JSON.

Filters operate at the servlet boundary. MVC interceptors participate around mapped handlers and can inspect handler metadata. Neither is a replacement for resource-level authorization in the use case. An interceptor is also not the right foundation for a separate authentication system beside Spring Security.

## Keep the controller thin

A controller translates HTTP into an application call. It should not contain queries, transaction orchestration, or a second copy of the domain model.

Consider an order quote for one product priced at EUR 12.50. This Java fragment omits imports and application startup. It requires MVC's JSON converter and `spring-boot-starter-validation`. The quote calculates a price but creates no order and reserves no stock.

```java
record OrderRequest(@Min(1) int quantity) {}
record OrderQuote(int quantity, BigDecimal total, String currency) {}

@RestController
class OrderController {
	private final OrderService orders;

	OrderController(OrderService orders) {
		this.orders = orders;
	}

	@PostMapping("/order-quotes")
	OrderQuote quote(@Valid @RequestBody OrderRequest request) {
		return orders.quote(request.quantity());
	}
}

@Service
class OrderService {
	private static final BigDecimal UNIT_PRICE = new BigDecimal("12.50");

	OrderQuote quote(int quantity) {
		if (quantity > 20) {
			throw new OrderLimitExceeded();
		}
		return new OrderQuote(quantity,
			UNIT_PRICE.multiply(BigDecimal.valueOf(quantity)), "EUR");
	}
}

class OrderLimitExceeded extends RuntimeException {}
```

Assuming the security chain admits the request, this input reaches the service with `quantity == 2`:

```http
POST /order-quotes HTTP/1.1
Content-Type: application/json
Accept: application/json

{"quantity":2}
```

The controller returns an `OrderQuote`, not a JSON string. The message converter writes the following response. JSON property order and numeric formatting are not part of the contract.

```http
HTTP/1.1 200 OK
Content-Type: application/json

{"quantity":2,"total":25.00,"currency":"EUR"}
```

The explicit constructor makes the required dependency visible. A response DTO keeps the HTTP contract independent of persistence entities and lazy relationships. For a customer-specific operation, accept the authenticated `Principal` and pass its identity into an authorized service lookup. Knowing an order ID is not permission to read it.

## Put transaction scope near the use case

Place the transaction around the operation whose changes must agree. A command that updates an account and records an audit entry needs a boundary that covers the complete invariant, not two independent repository transactions.

The controller should not keep a database transaction open while formatting a response or waiting on unrelated remote work. A database commit does not atomically publish a broker message. An outbox records the intent to publish in the same database transaction, then delivers it separately.

## Make failures deliberate

Malformed JSON, failed type conversion, and request validation can fail before the controller method executes. Expected application failures belong in a consistent error contract, commonly implemented with `@RestControllerAdvice`.

The quote service's limit is a business rule, separate from the DTO's positive-number constraint. This advice fragment gives that known failure a deliberate 409 contract:

```java
@RestControllerAdvice
class OrderErrors {
	@ExceptionHandler(OrderLimitExceeded.class)
	ProblemDetail orderLimit() {
		ProblemDetail problem = ProblemDetail.forStatusAndDetail(
			HttpStatus.CONFLICT, "An order can contain at most 20 units.");
		problem.setTitle("Order limit exceeded");
		problem.setProperty("code", "ORDER_LIMIT_EXCEEDED");
		return problem;
	}
}
```

| Request body | Last stage reached | Observable outcome |
| --- | --- | --- |
| `{"quantity":` | JSON conversion | 400. Neither controller nor service runs. |
| `{"quantity":0}` | DTO validation | 400. The service does not run. |
| `{"quantity":21}` | Service rule | 409 with `code: "ORDER_LIMIT_EXCEEDED"` from the advice above. |
| `{"quantity":2}` | Response conversion | 200 with a EUR 25.00 quote. No order is stored. |

The 400 response body depends on the application's MVC error configuration. The [validation chapter](/java-spring/validation-errors/) makes that contract explicit. The malformed and domain-failure cases have different owners even when both arrive through the same URL.

Security-filter failures need Spring Security's entry point or access-denied handling. Controller advice does not automatically handle every exception thrown earlier in the filter chain.

Unexpected failures should produce a generic response and an internal diagnostic record with a correlation identifier. SQL, stack traces, and internal class names do not belong in the client response.

## Choose an execution model deliberately

Spring MVC fits blocking application code, including ordinary JDBC and JPA access. Servlet asynchronous processing can release the initial request thread, but it does not make a blocking database call nonblocking.

WebFlux is a different, reactive web stack. It needs a compatible approach throughout the request path to benefit from nonblocking execution. Adding WebFlux to a blocking application is not a general performance fix.

Continue with [validation and error responses](/java-spring/validation-errors/) and [transaction boundaries](/java-spring/transactions/). [HTTP and APIs](/backend/http-and-apis/) explains the underlying protocol contract.

## Sources

- [Spring MVC DispatcherServlet](https://docs.spring.io/spring-framework/reference/web/webmvc/mvc-servlet.html)
- [Annotated controllers](https://docs.spring.io/spring-framework/reference/web/webmvc/mvc-controller.html)
- [Spring Security servlet architecture](https://docs.spring.io/spring-security/reference/servlet/architecture.html)
- [Request body conversion and validation](https://docs.spring.io/spring-framework/reference/web/webmvc/mvc-controller/ann-methods/requestbody.html)
- [ProblemDetail response handling](https://docs.spring.io/spring-framework/reference/web/webmvc/mvc-ann-rest-exceptions.html)
