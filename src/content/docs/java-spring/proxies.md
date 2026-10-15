---
title: Proxies and annotation behavior
description: Understand when Spring's transaction, cache, async, and method-security behavior runs around a method call.
---

Many Spring annotations describe behavior that a proxy applies around a method call. The annotation does not rewrite the method body. A caller holds a proxy, the proxy invokes matching interceptors, and those interceptors decide when or whether to call the target object.

That distinction explains why the same method can behave differently when called through an injected bean and when called directly inside its own class.

## The reference determines the call path

Compare two entry points on the same bean. These partial application classes assume Spring's `@Service`, `@Component`, `@Transactional`, and `TransactionSynchronizationManager` from `org.springframework.transaction.support`:

```java
@Service
class TransactionProbe {
	@Transactional
	public boolean insideTransaction() {
		return TransactionSynchronizationManager.isActualTransactionActive();
	}

	public boolean throughThis() {
		return this.insideTransaction();
	}
}

@Component
class ProbeCaller {
	private final TransactionProbe probe;

	ProbeCaller(TransactionProbe probe) {
		this.probe = probe;
	}

	public void compare() {
		System.out.println(probe.insideTransaction());
		System.out.println(probe.throughThis());
	}
}
```

Assume these classes are scanned, proxy-based transaction management is enabled, and a transaction manager such as `JdbcTransactionManager` is configured with a working datasource. Invoke `compare()` on a managed `ProbeCaller` after startup, with **no transaction already active**. Expected output:

```text
true
false
```

Both calls use the injected `probe` reference. Only the first call crosses the proxy at the annotated method. Follow the state changes below:

<section class="walkthrough" aria-label="Compare injected and self-invoked transactional calls">
<section data-scenario="Injected annotated method">
<h3>Injected annotated method</h3>
<ol class="walkthrough-steps">
<li><strong>Caller holds the proxy</strong><p>ProbeCaller invokes probe.insideTransaction(). No transaction is active before the call.</p></li>
<li><strong>The interceptor opens a transaction</strong><p>The proxy finds transaction metadata on insideTransaction(). The transaction manager begins a transaction before invoking the target.</p><div data-anatomy="java-spring--proxies-1"></div></li>
<li><strong>The target returns true</strong><p>The transaction probe observes an active transaction. On normal return, the interceptor commits, releases resources, and returns true to the caller. The caller then prints true.</p></li>
</ol>
</section>
<section data-scenario="Self-invoked annotated method">
<h3>Self-invoked annotated method</h3>
<ol class="walkthrough-steps">
<li><strong>The unannotated entry point is called</strong><p>ProbeCaller invokes probe.throughThis(). The reference is still a proxy, but throughThis() has no transaction annotation, so this entry does not open a transaction.</p></li>
<li><strong>The target calls itself</strong><p>Inside throughThis(), this refers to the target. Calling this.insideTransaction() does not return through the proxy, so its transaction interceptor never gets this inner call.</p><div data-anatomy="java-spring--proxies-2"></div></li>
<li><strong>The target returns false</strong><p>The probe observes no active transaction. It returns false through throughThis(), and the caller prints false. The annotation is present, but the necessary interception boundary is missing.</p></li>
</ol>
</section>
</section>

Omitting `this` changes nothing. Self-invocation also bypasses the inner method's cache, async, or method-security interceptor. It does not undo behavior already applied to the outer call.

If a transactional `placeOrder` method calls an internal method marked `REQUIRES_NEW`, the outer transaction can still be active. The internal call does not create a separate transaction. The boolean probe would return `true` in that case, so it cannot prove that `REQUIRES_NEW` ran. The missing inner boundary is the failure, not necessarily the absence of every transaction.

When two operations need different interception boundaries, put the independently invoked operation on a separate bean and inject it. A programmatic API, such as `TransactionTemplate`, can also express a local transaction boundary directly. Self-injection and `AopContext.currentProxy()` hide the design problem behind framework-aware calls.

Objects created with `new` do not receive proxy behavior merely because their classes contain annotations. Initialization callbacks also run before the final proxy is ready. Do not depend on interception inside `@PostConstruct`.

## JDK and class proxies expose different methods

A JDK dynamic proxy implements interfaces and intercepts calls through those interfaces. It is not an instance of the concrete implementation class. Injecting the interface keeps callers independent of that implementation and avoids concrete-type assumptions.

A class-based proxy is a generated subclass, using Spring's repackaged CGLIB support. It cannot subclass a final class. It cannot advise final or private methods because it cannot override them. An inherited package-private method from another package is also inaccessible for this purpose. Static methods are not instance calls through a proxy.

Spring Framework ordinarily favors interface proxies when suitable interfaces exist. Boot 4.0's AOP auto-configuration defaults to class proxies. `spring.aop.proxy-target-class=false` selects interface proxying where possible. Other proxy configuration can affect that choice, so an interface's presence alone does not prove that a bean uses a JDK proxy.

Framework 7.0 unifies more proxy processors under global proxy defaults, including async processing. It also supports per-bean proxy selection through `@Proxyable`. Neither change removes self-invocation or subclassing restrictions.

## Visibility depends on the intercepted feature

Do not reduce proxy behavior to either "all methods work" or "only public methods work." The proxy must be able to intercept a method, and the feature must recognize its metadata.

Since Framework 6.0, class-based transaction proxies support protected and package-visible transactional methods by default. Interface-based transactional methods must be public and declared on the proxied interface. This applies to the Framework 7.0 baseline used by Boot 4.0.

Proxy-based caching still expects public annotated methods. Private methods are not a safe place for any proxy-enforced boundary. Public use-case methods on concrete service classes are the least surprising place for annotations shared across these features.

## Interceptors need infrastructure and ordering

`@Transactional` needs transaction-management infrastructure and a transaction manager. `@Cacheable` needs enabled caching and a cache provider. `@Async` needs async support and an executor. Method authorization needs `@EnableMethodSecurity`; the security starter alone does not enable it.

Multiple interceptors can apply to one call. A cache hit can skip the target method, and async advice changes where execution occurs. Verify the intended order when combining caching, transactions, and authorization. A cached result must not bypass an authorization decision that should run for every caller.

AspectJ weaving modifies bytecode rather than relying on these proxy call paths. It can intercept self-invocation, but requires different build or runtime infrastructure. It is not what Boot's ordinary proxy configuration enables.

Continue with [transactions](/java-spring/transactions/), [caching](/java-spring/caching/), and [security](/java-spring/security/).

## Sources

- [Spring proxying mechanisms](https://docs.spring.io/spring-framework/reference/core/aop/proxying.html)
- [Boot 4.0 AOP defaults](https://docs.spring.io/spring-boot/4.0/reference/features/aop.html)
- [Transactional method visibility](https://docs.spring.io/spring-framework/reference/data-access/transaction/declarative/annotations.html)
- [Caching annotations](https://docs.spring.io/spring-framework/reference/integration/cache/annotations.html)
- [Async annotation support](https://docs.spring.io/spring-framework/reference/integration/scheduling.html)
- [Method security](https://docs.spring.io/spring-security/reference/servlet/authorization/method-security.html)
