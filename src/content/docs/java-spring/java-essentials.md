---
title: Java essentials for Spring applications
description: Use Java's object, value, exception, and concurrency contracts without relying on framework annotations to change them.
---

Spring manages objects, but Java still determines their identity, mutability, and method behavior. Most application code needs a small set of these rules more often than it needs another annotation. This chapter uses Java 21 without preview features.

## Composition makes dependencies replaceable

An interface describes operations that callers can use without depending on a particular implementation. Composition gives an object collaborators instead of inheriting their implementation. A checkout service can accept a `PaymentGateway` and delegate payment work without extending a provider-specific client.

Keep interfaces at meaningful boundaries, such as persistence or a remote provider. An interface that duplicates every public method of one implementation adds navigation without necessarily hiding anything. Constructor injection works with concrete classes too. Spring does not require a service interface.

Inheritance ties a subclass to superclass behavior and overridable methods. Use it for a genuine subtype contract, not to share a few helper methods. A collaborator usually makes that reuse easier to change and test independently.

## Records describe values, not deep immutability

A record declares a fixed set of components and supplies accessors, a canonical constructor, `equals`, `hashCode`, and `toString`. Its component fields are final. The referenced objects may still change.

Compare these record declarations. They assume `List` from `java.util`:

```java
record UnsafeSummary(String id, List<String> itemNames) {}

record OrderSummary(String id, List<String> itemNames) {
	OrderSummary {
		itemNames = List.copyOf(itemNames);
	}
}
```

This method-body fragment assumes those records and `ArrayList` from `java.util`:

```java
var names = new ArrayList<>(List.of("Tea"));
var unsafe = new UnsafeSummary("o-1", names);
var safe = new OrderSummary("o-1", names);
names.add("Cake");
System.out.println(unsafe.itemNames());
System.out.println(safe.itemNames());
try {
	safe.itemNames().add("Coffee");
} catch (UnsupportedOperationException ex) {
	System.out.println("record list rejects mutation");
}
```

Expected output:

```text
[Tea, Cake]
[Tea]
record list rejects mutation
```

| Reference after `names.add("Cake")` | What it points to | Can the caller add an item? |
| --- | --- | --- |
| `names` | Original list containing Tea and Cake | Yes |
| `unsafe.itemNames()` | The same original list | Yes, despite the final record field |
| `safe.itemNames()` | Unmodifiable snapshot containing Tea | No |

`List.copyOf` prevents changes through the original mutable reference and rejects null elements. The strings here are immutable. A list of mutable line objects would still expose those objects, so the copy would not make the complete DTO immutable.

Records fit request and response values whose components define their meaning. They are final classes, so they cannot be subclassed for class-based Spring proxies. Generated `toString` also includes component values. A record containing credentials must not be logged indiscriminately.

## Equality must remain stable in collections

`==` compares object references. `equals` expresses logical equality, and equal objects must have equal hash codes. Override `equals` and `hashCode` together when defining a value type. Generated record implementations use all components, so mutable components can make a record's equality change over time.

A mutable list is a short example of a broken map key. This method-body fragment assumes `ArrayList`, `HashMap`, and `List` from `java.util`:

```java
var key = new ArrayList<>(List.of("A"));
var orders = new HashMap<List<String>, String>();
orders.put(key, "order-42");
System.out.println(orders.get(key));
key.set(0, "B");
System.out.println(orders.get(key));
System.out.println(orders.size());
key.set(0, "A");
System.out.println(orders.get(key));
```

Expected output for this Java 21 `HashMap` example:

```text
order-42
null
1
order-42
```

The entry is still stored, but mutation changed the key's hash code. Lookup now searches using a different hash. Restoring the old value happens to restore lookup here. It is not a repair strategy. The `Map` contract does not specify behavior when a key changes in a way that affects equality while stored.

A `HashSet` has the same stability requirement. An entity whose identifier changes after insertion into a set is a common source of this error. Prefer stable identifiers or immutable value objects as keys. Arrays are another trap in records because their ordinary equality compares identity, not element contents.

## Exceptions preserve failure, resources preserve ownership

Checked exceptions must be caught or declared. Unchecked exceptions include `RuntimeException` and its subclasses. That compiler distinction does not tell you whether a particular operation can recover.

Catch an exception where the caller can make a useful decision or translate it into the application's failure contract. Preserve the original cause when translating. Catching a database exception and returning an empty result turns failure into apparently valid data.

Use try-with-resources for `AutoCloseable` resources that the current operation owns. It closes resources even when the body throws. If both the body and cleanup fail, the cleanup failure is suppressed on the original exception. Garbage collection does not replace timely release of files or connections. Do not close a shared resource whose lifetime belongs to the application container.

## Shared objects need a concurrency contract

A final field prevents reassignment, not concurrent mutation. Local variables are private to a method invocation, but a local reference can still point to a shared object. Stateless services with immutable inputs reduce the state that needs coordination.

When state must be shared, choose synchronization or concurrency utilities around the complete invariant. A thread-safe map makes individual operations safe. It does not make an arbitrary sequence of reads and writes atomic. Virtual threads do not change these rules.

Continue with [beans](/java-spring/beans/), [JPA entities](/java-spring/jpa-entities/), and [async jobs](/java-spring/async-jobs/).

## Sources

- [Java 21 record contract](https://docs.oracle.com/en/java/javase/21/docs/api/java.base/java/lang/Record.html)
- [Unmodifiable lists](https://docs.oracle.com/en/java/javase/21/docs/api/java.base/java/util/List.html#unmodifiable)
- [Map key contract](https://docs.oracle.com/en/java/javase/21/docs/api/java.base/java/util/Map.html)
- [Java exception rules](https://docs.oracle.com/javase/specs/jls/se21/html/jls-11.html)
- [Try-with-resources](https://docs.oracle.com/javase/tutorial/essential/exceptions/tryResourceClose.html)
- [Java concurrency utilities](https://docs.oracle.com/en/java/javase/21/docs/api/java.base/java/util/concurrent/package-summary.html)
