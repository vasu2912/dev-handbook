---
title: Spring Boot backend development
description: Understand the framework boundaries, data behavior, and operational decisions behind a Spring Boot service.
---

Spring Boot assembles an application. It does not decide what a valid order is, whether a caller may cancel it, or what should happen when a payment provider times out. Those decisions remain in your code even when the framework supplies most of the plumbing.

These notes explain the behavior behind that plumbing. They use Java 21 and Spring Boot 4.0 as the example baseline, with Spring MVC and a relational database as the usual request path. This is a chosen baseline, not a claim that Java 21 is Boot's minimum or that Boot 4.0 is the newest release. Check your application's managed dependency versions before copying version-sensitive APIs.

## Follow one operation through the application

Consider an authenticated caller creating an order for two units of product `7`. The examples across this section reuse orders, inventory, and payments, but each page states its own starting conditions. Follow the links in this map to inspect a boundary.

<ol class="learning-flow" aria-label="Order creation boundaries">
<li><a href="/java-spring/security/">Identify and authorize</a><p>Input: bearer token and requested action. Output: caller identity and an access decision. An authenticated caller still needs permission to place this order.</p></li>
<li><a href="/java-spring/validation-errors/">Read the request</a><p>Input: product 7, quantity 2. Output: validated request data. Invalid JSON or a nonpositive quantity stops here.</p></li>
<li><a href="/java-spring/request-handling/">Invoke the use case</a><p>The controller passes the caller and input to the service. The service owns pricing, availability, and other business decisions.</p></li>
<li><a href="/java-spring/transactions/">Record one atomic change</a><p>Reserve inventory, insert the order, and record pending delivery in one database transaction. A failure rolls back those writes together.</p></li>
<li><a href="/java-spring/events-messaging/">Deliver committed work</a><p>A worker publishes the outbox event after commit. Delivery can repeat, so the consumer must recognize an already processed event.</p></li>
<li><a href="/java-spring/http-clients/">Cross a remote boundary</a><p>A payment provider has its own state and failure rules. A timeout does not prove the charge failed. Reconcile using the operation's stable identity.</p></li>
</ol>

The HTTP exchange might look like this. The response is illustrative: this service records a pending order and completes payment separately.

```http
POST /orders HTTP/1.1
Content-Type: application/json
Authorization: Bearer <access-token>

{"productId":7,"quantity":2}
```

```http
HTTP/1.1 201 Created
Location: /orders/42
Content-Type: application/json

{"id":42,"status":"PENDING"}
```

`201` means the order resource was created. It does not claim that payment or event delivery has finished. Compare the response with the database and worker states, rather than treating a successful HTTP status as proof that every downstream action succeeded.

The map does not put every action inside one database transaction. An email provider cannot roll back a sent email because the order insert later fails. A broker message needs a deliberate delivery design if it must agree with a committed row.

Most difficult Spring bugs occur where these boundaries meet. A method call bypasses a proxy. A lazy relationship loads during serialization. A background task loses the request's security context. Learning the annotation name is only the beginning of understanding the behavior.

## Start with the question in front of you

- If an application will not start, read [what Spring Boot does](/java-spring/spring-boot/), [beans and dependency injection](/java-spring/beans/), and [configuration and profiles](/java-spring/configuration/).
- If an endpoint behaves unexpectedly, follow [request handling](/java-spring/request-handling/), [validation and error responses](/java-spring/validation-errors/), and [Spring Security](/java-spring/security/).
- If data is missing, stale, or expensive to load, read [JPA and entity lifecycle](/java-spring/jpa-entities/), [transaction boundaries](/java-spring/transactions/), and [queries and fetching](/java-spring/queries-fetching/).
- If work crosses a process boundary, read [calling external services](/java-spring/http-clients/) and [application events and messaging](/java-spring/events-messaging/).
- If behavior differs under load or in production, read [testing](/java-spring/testing/), [observability](/java-spring/observability/), and [running a service](/java-spring/running-services/).

[Java essentials](/java-spring/java-essentials/) and [proxies](/java-spring/proxies/) support all of these paths. Neither requires a catalogue of language features or annotation attributes to be useful.

## Read for limits, not magic

For each mechanism, ask what it guarantees and what remains outside the guarantee. A singleton bean gives one shared instance per container and bean definition, not exclusive access. A cache avoids repeated work, not stale data. An asynchronous call changes where work runs, not whether it survives a crash.

This is also useful interview preparation. Explaining why a transaction failed to roll back or why a query produced N+1 requests demonstrates a usable model. Memorizing definitions without tracing an operation does not.

The generic ideas behind [services](/backend/architecture/services/), [HTTP and APIs](/backend/http-and-apis/), and [databases](/system-design/databases/) stay in their existing handbook sections. These pages explain how Spring applies them, where defaults matter, and which decisions the application must make explicitly.

## Sources

- [Spring Boot 4.0 system requirements](https://docs.spring.io/spring-boot/4.0/system-requirements.html)
- [Spring Framework reference](https://docs.spring.io/spring-framework/reference/index.html)
