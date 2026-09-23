---
title: Queries and fetching
description: Choose query results and fetch plans that keep database work bounded and visible.
---

A repository method describes the data you want. Its generated SQL determines how much work the database performs. Correct results on a small dataset do not prove that a query has an acceptable cost.

## Choose a result before a query style

Derived methods such as `findByStatus` work well for short, stable predicates. Once a method name hides grouping, joins, or business meaning, an explicit `@Query` is easier to review. JPQL refers to entities and their properties. Native SQL refers to database tables and gives access to database-specific features at the cost of portability.

Bind values as parameters. Do not concatenate caller input into query text. For dynamic sorting or filtering, expose supported fields and operations rather than accepting arbitrary query fragments.

Return an entity when the use case needs its behavior or plans to modify it. Return a projection when the caller needs selected values. Spring Data supports interface projections and constructor-based DTO projections, including Java records. A scalar DTO can avoid loading an entire managed entity graph.

Projection does not automatically mean cheap. Nested properties can introduce joins and materialize more data than the top-level result suggests. Inspect the SQL rather than inferring it from a small Java interface.

## Fetch for the operation

Lazy associations defer loading until accessed. That keeps an unused relationship from costing a query, but a loop that accesses the relationship for every result can produce N+1 queries. One query loads N orders, then separate queries load their lines.

Eager mapping does not guarantee one SQL statement. Changing every association to eager often loads unused data and can still produce secondary selects. Keep the general mapping restrained and choose a fetch plan for the operation.

A fetch join asks Hibernate to load an association in the query. An entity graph names the attributes the operation needs without embedding the fetch plan in JPQL. Spring Data's `@EntityGraph` supports named graphs and ad hoc attribute paths.

Consider three pending orders, IDs `101`, `102`, and `103`, with two, one, and zero lines respectively. `PurchaseOrder.lines` is lazy. These partial Java examples run inside a read-only service transaction with a fresh persistence context. Assume no second-level cache, collection batching, subselect fetching, or other eager associations, so the query count isolates this relationship.

```java
// Repository fragment.
@Query("select o from PurchaseOrder o where o.status = :status order by o.id")
List<PurchaseOrder> findForSummary(@Param("status") String status);

// Service method body: the loop accesses each lazy collection.
List<PurchaseOrder> orders = repository.findForSummary("PENDING");
List<OrderSummary> summaries = orders.stream()
		.map(o -> new OrderSummary(o.getId(), o.getLines().size()))
		.toList();

// DTO declaration, shown separately from the method body.
record OrderSummary(Long id, int lineCount) {}
```

Illustrative SQL, with aliases and unused columns omitted:

```sql
SELECT id, status FROM orders WHERE status = 'PENDING' ORDER BY id;
SELECT id, order_id FROM order_lines WHERE order_id = 101;
SELECT id, order_id FROM order_lines WHERE order_id = 102;
SELECT id, order_id FROM order_lines WHERE order_id = 103;
```

The empty collection still needs a query to establish that it is empty. The result is `[(101, 2), (102, 1), (103, 0)]`, after four SELECTs. Replace the repository query with a fetch join when the operation actually needs the lines:

```java
// Replacement repository method; the service mapping is unchanged.
@Query("""
		select o from PurchaseOrder o
		left join fetch o.lines
		where o.status = :status order by o.id
		""")
List<PurchaseOrder> findForSummary(@Param("status") String status);
```

```sql
-- Illustrative SQL for the replacement query.
SELECT o.id, o.status, l.id, l.order_id
FROM orders o LEFT JOIN order_lines l ON l.order_id = o.id
WHERE o.status = 'PENDING'
ORDER BY o.id;
```

| Fetch plan | Root SELECTs | Collection SELECTs | SQL result rows | DTO result |
| --- | --- | --- | --- | --- |
| Lazy loop | 1 | 3 | 3 roots + 3 lines | `(101, 2), (102, 1), (103, 0)` |
| Left fetch join | 1 | 0 | 4 joined rows | Same three summaries |

The join returns two rows for order `101`, one for `102`, and one null-extended row for `103`. Hibernate 7 removes duplicate root entities from a fetch-join result. The left join preserves the empty order. If you need only counts, a grouped scalar DTO query can avoid loading line entities altogether.

Fetching several collections together can multiply rows through a Cartesian product. A smaller number of deliberate queries can cost less than one enormous join.

## Page roots without expanding every collection

A collection join produces multiple SQL rows per root entity. Applying a row limit does not naturally mean returning that many complete roots. Hibernate may fetch all matching rows and apply pagination in memory when a collection fetch join and pagination are combined. A page of twenty results can therefore read thousands of rows.

For the dataset above, a SQL row limit of two on the join could return only order `101`'s two rows, not two orders. Fetch all lines for a bounded set of root IDs instead. This partial service-method body uses `EntityManager`, pages by increasing ID, and returns DTOs before leaving the transaction:

```java
List<Long> ids = em.createQuery("""
		select o.id from PurchaseOrder o
		where o.status = :status order by o.id
		""", Long.class)
		.setParameter("status", "PENDING")
		.setFirstResult(0)
		.setMaxResults(2)
		.getResultList();
if (ids.isEmpty()) {
	return List.of();
}

List<PurchaseOrder> fetched = em.createQuery("""
		select o from PurchaseOrder o left join fetch o.lines
		where o.id in :ids
		""", PurchaseOrder.class)
		.setParameter("ids", ids)
		.getResultList();
Map<Long, PurchaseOrder> byId = fetched.stream()
		.collect(Collectors.toMap(PurchaseOrder::getId, Function.identity()));
return ids.stream()
		.map(byId::get)
		.map(o -> new OrderSummary(o.getId(), o.getLines().size()))
		.toList();
```

Illustrative SQL for this page:

```sql
SELECT id FROM orders WHERE status = 'PENDING'
ORDER BY id OFFSET 0 ROWS FETCH FIRST 2 ROWS ONLY; -- 101, 102

SELECT o.id, o.status, l.id, l.order_id
FROM orders o LEFT JOIN order_lines l ON l.order_id = o.id
WHERE o.id IN (101, 102); -- 3 joined rows, no row limit here
```

The result is `[(101, 2), (102, 1)]` after two SELECTs, with complete collections for both roots. The second query's `IN` clause does not preserve ID order, so the Java code restores it explicitly. This example assumes the selected orders remain present between reads. If concurrent deletes or a changing result set matter, choose database-supported snapshot semantics or define how the API handles the missing roots. A transaction at `READ_COMMITTED` alone does not promise one snapshot across both queries.

A scalar DTO query may avoid the collection-fetch problem entirely. An entity graph that fetches a collection does not automatically avoid it. Also account for the count query a `Page` may need. When callers only need to know whether more results exist, a `Slice` avoids requiring a total count.

## Keep SQL inside the data-access operation

Spring Boot 4.0 enables Open EntityManager in View by default for applicable web applications. The open persistence context allows lazy loads after the service transaction ends. It does not extend that transaction or give response serialization a consistent database snapshot.

For service-oriented APIs, `spring.jpa.open-in-view=false` makes the boundary clearer. Fetch required data and map the DTO inside the service operation. Fix missing fetch plans rather than restoring OSIV to silence a lazy-initialization failure.

Inspect generated SQL, query counts, rows returned, and the database execution plan with representative data. Include DTO mapping and serialization when looking for accidental queries. Bind-value logging can expose sensitive data, so enable it only in controlled environments.

Continue with [JPA entities](/java-spring/jpa-entities/) and [transactions](/java-spring/transactions/).

## Sources

- [Spring Data JPA 4.0 query methods and entity graphs](https://docs.spring.io/spring-data/jpa/reference/4.0/jpa/query-methods.html)
- [Spring Data JPA 4.0 projections](https://docs.spring.io/spring-data/jpa/reference/4.0/repositories/projections.html)
- [Hibernate HQL association fetching and pagination](https://docs.hibernate.org/orm/7.1/querylanguage/html_single/)
- [Spring Boot 4.0 Open EntityManager in View](https://docs.spring.io/spring-boot/4.0/reference/data/sql.html#data.sql.jpa-and-spring-data.open-entity-manager-in-view)
