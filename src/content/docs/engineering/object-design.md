---
title: Object design and patterns
description: Explain encapsulation, composition, SOLID, common design patterns, and low-level design through an order workflow.
---

Object design assigns state and decisions to components with clear responsibilities. A useful interface hides details that callers do not need while making important guarantees visible.

## Encapsulation and composition

An order can expose `cancel()` rather than allowing any caller to assign a status. The operation can reject cancellation after shipment and record the relevant transition. Encapsulation protects an invariant, not merely private fields with public setters.

Composition builds behavior by collaborating with other objects. Inheritance adds a subtype relationship and should preserve what callers expect of the base type. Reusing a few lines is not enough reason to expose a subtype whose behavior violates that contract.

## SOLID as design constraints

| Principle             | Practical reading                                                                     |
| --------------------- | ------------------------------------------------------------------------------------- |
| Single responsibility | Group decisions that change for the same reason                                       |
| Open-closed           | Introduce extension points where variation is real                                    |
| Liskov substitution   | Subtypes preserve the behavioral promises of their abstraction                        |
| Interface segregation | Callers depend on operations relevant to their job                                    |
| Dependency inversion  | Policy depends on a suitable abstraction rather than a volatile implementation detail |

Dependency injection supplies collaborators. Dependency inversion concerns the direction and meaning of dependencies. A dependency-injection container does not guarantee a good dependency structure.

## Patterns and the problem they solve

- Strategy selects an interchangeable algorithm, such as a shipping-price policy.
- Factory centralizes creation when callers should not know construction details.
- Adapter translates an external provider's interface into the application's own contract.
- Decorator adds behavior around an existing contract, such as timing a payment client.
- State makes state-dependent transitions explicit when conditionals become hard to reason about.
- Observer notifies interested participants, but in-process notification does not provide durable delivery.

A pattern adds names and indirection. Use it when the problem requires that variation or boundary. One implementation does not automatically need a factory, interface, and registry.

## Following one operation

For order placement, identify the invariant, inputs, state transition, collaborators, and failure outcomes. The order model can own legal transitions. A pricing strategy can calculate a quote. A payment adapter translates provider errors. A repository hides persistence behavior without hiding whether a transaction is required.

Keep the local state machine distinct from remote effects. An object method cannot atomically roll back a charge just because its database write failed. Continue with [services](/backend/architecture/services/), [sagas](/microservices/sagas/), and [the object-oriented walkthrough](/system-design/walkthroughs/object-oriented-design/).

## Sources

- [Martin Fowler: inversion of control and dependency injection](https://martinfowler.com/articles/injection.html)
- [Robert C. Martin: design principles and patterns](https://www.objectmentor.com/resources/articles/Principles_and_Patterns.pdf)
