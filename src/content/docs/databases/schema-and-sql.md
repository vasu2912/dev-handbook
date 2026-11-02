---
title: Schema design and SQL
description: Explain relational keys, normalization, constraints, joins, grouping, NULL, and window functions with order data.
---

A relational schema expresses facts and the relationships between them. A row's identity, valid values, and references belong in database constraints when they must hold for every writer.

## Keys and normalization

A primary key identifies one row. A candidate key is any minimal set of columns that can uniquely identify it. A foreign key references a qualifying unique key in another table, or in the same table. A surrogate ID supplies technical identity; a natural key comes from the domain.

Normalization reduces dependencies that cause update anomalies. If every order row repeats a customer's current email, changing that email requires many updates. Separate customers from orders and join through customer identity. Historical shipping addresses may deliberately be copied onto orders because they describe the purchase at that time.

First normal form uses values from the intended column domains without repeating column groups. Second normal form removes dependencies on part of a composite candidate key. Third normal form addresses transitive dependencies of non-key attributes on keys. The functional dependencies, not just the number of tables, determine normalization.

```sql
CREATE TABLE customer (
	id bigint PRIMARY KEY,
	email text NOT NULL UNIQUE
);

CREATE TABLE purchase_order (
	id bigint PRIMARY KEY,
	customer_id bigint NOT NULL REFERENCES customer(id),
	total numeric(12, 2) NOT NULL CHECK (total >= 0),
	created_at timestamptz NOT NULL
);
```

The unique constraint arbitrates concurrent email registrations. An application-level lookup before insertion cannot supply the same guarantee by itself.

## Joins and aggregation

An inner join returns matches. A left join preserves unmatched left rows and supplies NULL for right-side columns. A right-side filter in `WHERE` can remove those unmatched rows. Put a condition in `ON` when it defines which right rows qualify as matches.

```sql
SELECT c.id, count(o.id) AS order_count
FROM customer AS c
LEFT JOIN purchase_order AS o ON o.customer_id = c.id
GROUP BY c.id
HAVING count(o.id) >= 2;
```

`WHERE` filters input rows. `HAVING` filters groups. `count(*)` counts rows, while `count(o.id)` excludes NULL, which matters for unmatched customers.

## Window functions and NULL

Window functions compute across related rows while retaining each row. This query numbers each customer's orders, newest first, with a deterministic tie-breaker:

```sql
SELECT id, customer_id,
	row_number() OVER (
		PARTITION BY customer_id ORDER BY created_at DESC, id DESC
	) AS sequence
FROM purchase_order;
```

`row_number` assigns distinct positions. `rank` leaves gaps after ties. `dense_rank` does not leave those gaps. Aggregate window results also depend on their window frame.

NULL represents an absent or unknown value. `column = NULL` does not test for absence; use `IS NULL`. `WHERE` keeps true conditions, so unknown comparisons disappear. `NOT IN` can produce surprising results when its input contains NULL; a correctly correlated `NOT EXISTS` often expresses the intended anti-join more clearly.

## Sources

- [PostgreSQL: constraints](https://www.postgresql.org/docs/current/ddl-constraints.html)
- [PostgreSQL: table expressions](https://www.postgresql.org/docs/current/queries-table-expressions.html)
- [PostgreSQL: window functions](https://www.postgresql.org/docs/current/tutorial-window.html)
