---
title: Beans and dependency injection
description: Understand how Spring constructs application objects, chooses dependencies, and manages their lifetime.
---

A Spring bean is an object managed by the application context. The context reads bean definitions, resolves dependencies, creates objects, and applies lifecycle callbacks and post-processors. A class does not become a bean merely because another bean uses it. An object created with `new` remains an ordinary Java object unless you explicitly register it.

## Make dependencies visible

Constructor injection makes required collaborators part of an object's construction contract. A service cannot exist without the dependencies it needs, and a unit test can supply them without starting Spring. With one constructor, Spring does not require `@Autowired`.

Consider these application type fragments in a scanned package. They assume Spring's `@Component` and `@Service`. The senders return a delivery description so that the selected implementation is visible without making a network call:

```java
interface ReceiptSender {
	String send(String orderId);
}

@Component("email")
class EmailReceiptSender implements ReceiptSender {
	public String send(String orderId) {
		return "email receipt for " + orderId;
	}
}

@Component("archive")
class ArchiveReceiptSender implements ReceiptSender {
	public String send(String orderId) {
		return "archived receipt for " + orderId;
	}
}

@Service
class ReceiptService {
	private final ReceiptSender sender;

	ReceiptService(ReceiptSender sender) {
		this.sender = sender;
	}

	public String issue(String orderId) {
		return sender.send(orderId);
	}
}
```

The context cannot construct `ReceiptService`. Both `email` and `archive` match `ReceiptSender`, neither is primary, and the parameter name `sender` does not select either bean. Startup fails with an unsatisfied dependency caused by `NoUniqueBeanDefinitionException`. This summary is illustrative, not verbatim log output:

```text
ReceiptService needs one ReceiptSender.
Eligible beans: email, archive.
No single candidate selected; context startup fails.
```

Replace the constructor with this fragment. `Qualifier` comes from `org.springframework.beans.factory.annotation`:

```java
ReceiptService(@Qualifier("email") ReceiptSender sender) {
	this.sender = sender;
}
```

Startup now resolves the dependency. Calling `issue("o-42")` on the injected `ReceiptService` returns `email receipt for o-42`. Both sender beans still exist. The qualifier narrows this injection point; it does not remove `archive` from the context.

<svg role="img" aria-label="ReceiptService requires a ReceiptSender. The email qualifier selects EmailReceiptSender while ArchiveReceiptSender remains registered but is not injected here" viewBox="0 0 500 220" xmlns="http://www.w3.org/2000/svg" style="max-width:100%;height:auto">
<defs><marker id="beans-arrow" markerWidth="8" markerHeight="8" refX="7" refY="3" orient="auto"><path d="M0 0L0 6L7 3Z" fill="var(--diagram-muted)"/></marker></defs>
<g fill="var(--diagram-bg)" stroke="var(--diagram-border)"><rect x="10" y="85" width="170" height="50" rx="6"/><rect x="285" y="15" width="205" height="70" rx="6"/><rect x="285" y="140" width="205" height="70" rx="6"/></g>
<g font-size="17" text-anchor="middle" fill="var(--diagram-ink)"><text x="95" y="116">ReceiptService</text><text x="387" y="43">EmailReceiptSender</text><text x="387" y="68">bean: email</text><text x="387" y="168">ArchiveReceiptSender</text><text x="387" y="193">bean: archive</text><text x="233" y="38">selected</text><text x="232" y="205">unused here</text></g>
<path d="M180 104L280 51" fill="none" stroke="var(--diagram-green)" stroke-width="2" marker-end="url(#beans-arrow)"/><path d="M180 120L280 173" fill="none" stroke="var(--diagram-muted)" stroke-dasharray="5 5"/>
</svg>

`@Primary` identifies a genuine default for single-valued injection across callers. Prefer a qualifier when a particular caller needs a specific role. Missing dependencies also normally fail startup. Keep dependencies in final fields, but remember that a final reference does not make the collaborator thread-safe.

## Choose who declares the bean

Stereotypes such as `@Component`, `@Service`, and `@Repository` register application classes through component scanning. Their names communicate responsibility. `@Repository` also participates in persistence exception translation when the relevant infrastructure is enabled.

An `@Bean` method declares an object explicitly, which fits library classes you cannot annotate and construction that needs configuration. This alternative registration fragment assumes the types above, with `@Service` removed from `ReceiptService` so it is not registered twice:

```java
@Configuration(proxyBeanMethods = false)
class ReceiptConfiguration {
	@Bean
	ReceiptService receiptService(@Qualifier("email") ReceiptSender sender) {
		return new ReceiptService(sender);
	}
}
```

With `proxyBeanMethods = false`, calling another `@Bean` method directly is an ordinary Java call, not a lookup of the managed bean. Method parameters avoid that distinction and make the dependency explicit. Do not register the same implementation through both scanning and a factory method unless you intend two bean definitions.

## Scope controls reuse, not concurrency

The default singleton scope means one instance per bean definition per container. It does not mean one instance per Java class across the JVM. Request threads commonly call the same singleton service concurrently.

A `currentUser` field on a singleton allows one request to overwrite another request's state. The following interleaving needs no unusual timing:

| Step | Request A | Request B | Shared singleton field |
| --- | --- | --- | --- |
| 1 | Assigns `currentUser = "alice"` | | `alice` |
| 2 | Pauses before creating the receipt | Assigns `currentUser = "bob"` | `bob` |
| 3 | Reads `currentUser` and creates Bob's receipt | | `bob` |

Keep request data in method arguments and local variables. For example, `issue(String orderId)` above stores no order ID on the service between calls.

| Design | What is reused? | Where does request data belong? |
| --- | --- | --- |
| Stateless singleton service | One service shared by requests A and B | Separate method arguments and locals for A and B |
| Singleton with a mutable `currentUser` field | One service and one shared field | Unsafe without an appropriate concurrency design |
| `@RequestScope` bean in a web application | One target instance for request A, another for B | State belongs to that request, not later background work |

Request scope is a lifetime rule, not a general thread-safety guarantee. Session scope also does not serialize simultaneous requests from the same session.

Prototype scope creates an instance each time the container resolves that bean. A prototype injected into a singleton is resolved once during the singleton's construction. It is not recreated for each service call. An `ObjectProvider` can obtain a new instance when needed. A scoped proxy can instead resolve the current request-scoped target, but only while that scope is active.

## Lifecycle and dependency cycles

Initialization callbacks such as `@PostConstruct` run after dependency injection. Destruction callbacks such as `@PreDestroy` release managed resources when the context closes normally. Boot 4 uses the `jakarta.annotation` package. The container does not call destruction callbacks for prototype instances, so their owner must release resources.

Do not rely on transactional or asynchronous interception inside initialization callbacks. The bean is still being initialized, and the final proxy is not the object executing that callback.

A constructor cycle has no valid construction order. If `OrderService` requires `PaymentService` and the reverse is also true, extract the shared rule or move orchestration into a third service. Setter injection or lazy lookup may postpone the cycle, but it leaves the responsibilities tangled.

Continue with [Java essentials](/java-spring/java-essentials/), [configuration](/java-spring/configuration/), and [proxies](/java-spring/proxies/).

## Sources

- [Dependency injection](https://docs.spring.io/spring-framework/reference/core/beans/dependencies/factory-collaborators.html)
- [Qualifier-based candidate selection](https://docs.spring.io/spring-framework/reference/core/beans/annotation-config/autowired-qualifiers.html)
- [Java-based container configuration](https://docs.spring.io/spring-framework/reference/core/beans/java.html)
- [Bean scopes](https://docs.spring.io/spring-framework/reference/core/beans/factory-scopes.html)
- [Bean lifecycle callbacks](https://docs.spring.io/spring-framework/reference/core/beans/factory-nature.html)
