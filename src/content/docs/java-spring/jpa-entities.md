---
title: JPA and entity lifecycle
description: Understand entity state, dirty checking, and relationship ownership without exposing persistence details to callers.
---

A JPA entity is an object whose identity and state correspond to stored data. It is not an HTTP response model. Most persistence surprises come from treating an entity as an ordinary object without asking whether a persistence context still manages it.

## Separate the persistence roles

Jakarta Persistence, usually called JPA, defines the mapping and lifecycle contract. Hibernate implements that contract and generates SQL. Spring Data JPA builds repository implementations and query conventions on top. Spring Boot configures those components from the dependencies and application settings.

In the Spring Boot 4.0 baseline, persistence annotations come from `jakarta.persistence`, not `javax.persistence`. A repository method can hide the mechanics of finding an entity, but it does not remove persistence-context rules or define the transaction for a multi-step use case.

Keep request and response DTOs separate from entities. An entity can contain internal fields, bidirectional relationships, and lazy associations that trigger queries during serialization. A DTO selects the data the caller may see and does not depend on an open database session. Java records fit many DTOs well.

For updates, accept a command DTO, load the entity, check permissions and business rules, and change the permitted fields. Binding an incoming object graph directly to persistence makes it too easy to replace fields or relationships the caller does not own.

## Know which object is managed

An `EntityManager` represents a persistence context. Within that context, one entity type and primary key identify at most one managed object instance. Loading the same row twice does not normally produce two independently tracked copies.

A new entity has not entered a persistence context. A managed entity participates in change tracking. Detachment ends that tracking, not the object's lifetime. A removed entity is scheduled for deletion.

<div data-anatomy="java-spring--jpa-entities-1"></div>

`find` loads a stored row into the managed state. Closing or clearing the context detaches its entities. `merge` is intentionally not a detached-to-managed arrow in this diagram, because it returns a managed copy rather than attaching the supplied object.

Changing a detached object does not update the database. `merge` copies its state into a managed instance and returns that instance. The argument itself does not become managed. Broadly merging a stale object can overwrite newer state, so loading and applying a specific command is usually easier to reason about.

A persistence context is not a cross-request cache or a thread-safe workspace. Pass IDs or DTOs to background work, then load entities in that work's own transaction.

## Distinguish flush from commit

Hibernate detects changes to managed entities through dirty checking. This partial Spring service shows the boundary. Assume customer `7` already has name `Ada`, there are no concurrent writers, and the method runs through the service proxy in an ordinary read-write transaction. The entity's `name` field maps to `customers.name`. Imports and the entity mapping are omitted.

```java
@PersistenceContext
private EntityManager em;

@Transactional
public String changeThenDetach() {
	Customer customer = em.find(Customer.class, 7L);
	customer.setName("Ada Lovelace");
	em.flush(); // Sends the managed change, but does not commit.
	em.detach(customer);
	customer.setName("Augusta Ada"); // Changes only the detached object.
	em.flush(); // No tracked change for this object.
	return customer.getName();
}
```

Illustrative SQL and transaction outcome, with cache effects and unrelated columns omitted:

```sql
SELECT id, name FROM customers WHERE id = 7; -- Ada
UPDATE customers SET name = 'Ada Lovelace' WHERE id = 7;
-- No UPDATE for 'Augusta Ada'.
COMMIT;
-- A fresh read after the service call returns:
SELECT name FROM customers WHERE id = 7; -- Ada Lovelace
```

The caller receives `Augusta Ada`, while the committed row contains `Ada Lovelace`. Returning an object's field does not prove that Hibernate saved it. No repository `save` call is needed for the first change because the entity was managed.

<section class="walkthrough" aria-label="Managed and detached entity changes">
<section data-scenario="Managed change reaches the database">
<p><strong>Managed change reaches the database</strong></p>
<ol class="walkthrough-steps">
<li><strong>Load customer 7</strong><p>The persistence context tracks the loaded Customer. Its Java name and the stored name are both Ada.</p></li>
<li><strong>Mutate the managed entity</strong><p>setName changes the Java field to Ada Lovelace. Hibernate tracks the change. A setter does not itself require an immediate SQL update.</p></li>
<li><strong>Flush, then commit</strong><p>Flush sends the UPDATE within the current transaction. If the service returns normally and commit succeeds, a new transaction reads Ada Lovelace. A rollback after flush would still undo the update.</p><div data-anatomy="java-spring--jpa-entities-2"></div></li>
</ol>
</section>
<section data-scenario="Detached change stays in memory">
<p><strong>Detached change stays in memory</strong></p>
<ol class="walkthrough-steps">
<li><strong>Flush the first name change</strong><p>Start with the worked example's load, mutation, and first flush. The transaction has written Ada Lovelace, but has not committed.</p></li>
<li><strong>Detach, then mutate again</strong><p>detach removes this object from the persistence context. setName now changes its field to Augusta Ada without creating another tracked update.</p></li>
<li><strong>Compare the object and stored row</strong><p>The second flush adds no UPDATE for this object. After a successful commit, the returned name is Augusta Ada but a fresh database read returns Ada Lovelace.</p><div data-anatomy="java-spring--jpa-entities-3"></div></li>
</ol>
</section>
</section>

A flush synchronizes pending changes with the database by executing SQL. A commit completes the database transaction. Flush can happen before commit, including before a query whose result depends on pending changes. Calling `flush()` or `saveAndFlush()` does not make the transaction durable or immune to rollback.

This timing explains why a constraint violation may appear at a later query or when the transaction commits rather than at the setter that caused it. Handle the failure at the transaction boundary. After a persistence failure, continuing to use the same unit of work is not a recovery strategy.

## Model ownership and deletion deliberately

In a bidirectional one-to-many relationship, the many-to-one side owns the foreign-key mapping. The collection's `mappedBy` names that owning property. Updating only the inverse collection does not reliably update the foreign key. Relationship methods should keep both Java sides consistent.

Ownership and cascading answer different questions. Ownership determines which mapping writes the relationship. Cascading propagates operations such as persist or remove to related entities. It is not the same as a database foreign key's delete action.

Use cascades where lifetimes agree. An order may own its line items, but deleting an order must not delete a shared product. `orphanRemoval` deletes a privately owned child when it leaves the relationship. Neither `CascadeType.ALL` nor orphan removal is a general fix for mapping errors.

Continue with [transactions](/java-spring/transactions/) and [queries and fetching](/java-spring/queries-fetching/).

## Sources

- [Jakarta Persistence EntityManager lifecycle](https://jakarta.ee/specifications/persistence/3.2/apidocs/jakarta.persistence/jakarta/persistence/EntityManager.html)
- [Jakarta Persistence one-to-many relationships](https://jakarta.ee/specifications/persistence/3.2/apidocs/jakarta.persistence/jakarta/persistence/OneToMany.html)
- [Spring Boot 4.0 SQL and JPA support](https://docs.spring.io/spring-boot/4.0/reference/data/sql.html)
