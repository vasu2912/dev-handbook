---
title: Data and storage
description: How to choose and use storage by starting with access patterns, ownership, and failure behavior.
sidebar:
  order: 21
---

Choose storage from the data's access patterns and correctness needs. The product label on a database tells you less than the reads, writes, constraints, and recovery work your system requires.

The application-facing owner of those reads and writes is usually a [repository](/backend/architecture/repositories/). A [service](/backend/architecture/services/) composes repository operations when a use case needs business rules or a transaction.

## Start with the access pattern

Write down the queries before choosing an index or store.

- Which fields identify a record?
- Which queries must stay fast as the table grows?
- Does a read need the latest committed value?
- Can a result be stale for a few seconds?
- Does the write span one record or several?

Those answers expose the required keys, indexes, transactions, and cache rules.

## Keep ownership clear

One module should own the rules for reading and writing a kind of data. The rest of the application should call that module through a small interface.

```ts
type AccountStore = {
	findVisibleById(input: {
		accountId: string;
		viewerId: string;
	}): Promise<Account | null>;
};
```

The interface says what callers need. The implementation can use SQL, a remote store, or a test adapter without spreading query details through route handlers.

## Add a cache only when its rules are clear

A cache can lower read latency and database load. It also adds stale data, invalidation, eviction, and stampede behavior.

Before adding one, state:

1. Which reads may be stale?
2. How long may a value stay stale?
3. Which write invalidates the value?
4. What happens when the cache is empty or unavailable?

If you cannot answer those questions, keep the database as the source of truth and measure the real bottleneck first.

Continue with [databases](/system-design/databases/), [caching](/system-design/caching/), and [availability and consistency](/system-design/availability-and-consistency/) for system-design trade-offs. For how a storage call fits into a request, read [the request lifecycle](/backend/architecture/request-lifecycle/).
