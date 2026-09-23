---
title: Databases
description: Choose relational or NoSQL storage, then scale reads, writes, and data placement.
sidebar:
  order: 12
---

![Database scaling patterns](/images/system-design/vector/database-scaling-patterns.svg)

*Original redraw based on [Scaling up to your first 10 million users](https://www.youtube.com/watch?v=kKjm4ehYiMs).* 

## Relational databases

A relational database stores data in tables and relates rows through keys. SQL gives you joins, constraints, indexes, and transactions. ACID describes four transaction properties:

- **Atomicity:** a transaction commits all its changes or none of them.
- **Consistency:** a committed transaction moves the database from one valid state to another according to its constraints.
- **Isolation:** concurrent transactions produce the same result as an equivalent serial execution, within the database's isolation level.
- **Durability:** a committed transaction survives a crash.

Relational systems scale through replication, federation, sharding, denormalization, and query tuning. Choose the simplest technique that addresses the measured bottleneck.

## Replication

### Master-replica replication

The primary accepts reads and writes, then replicates writes to one or more read replicas. Replicas can forward changes to more replicas in a tree. If the primary fails, the system can continue serving reads until an operator or an automated process promotes a replica.

![Master-replica database replication](/images/system-design/vector/database-master-replica.svg)

*Original redraw based on [Scalability, availability, stability, patterns](http://www.slideshare.net/jboner/scalability-availability-stability-patterns/).* 

Promotion needs a clear owner and a way to prevent two primaries from accepting writes. A write can be lost if the primary fails before replication. Replicas can also lag, so a read immediately after a write may need the primary or a session-level consistency rule.

### Multi-primary replication

Multiple primaries accept reads and writes and coordinate changes. If one fails, another can continue serving writes.

![Multi-primary database replication](/images/system-design/vector/database-multi-primary.svg)

*Original redraw based on [Scalability, availability, stability, patterns](http://www.slideshare.net/jboner/scalability-availability-stability-patterns/).* 

Multi-primary systems need routing or application logic to choose a write node. Synchronous coordination adds write latency. Asynchronous coordination permits conflicts and weaker consistency. Conflict resolution gets harder as nodes and network distance increase.

Both models add hardware and operational work. Replicas replay writes, so a write-heavy workload can leave less capacity for reads. More replicas also create more replication work and lag. Some systems apply writes in parallel on the primary but replay them sequentially on a replica.

## Federation

Federation, also called functional partitioning, splits data by function. A product might use separate `forums`, `users`, and `products` databases. Each database handles less traffic, keeps a larger fraction of its data in memory, and can write in parallel without one central write queue.

![Federated databases by function](/images/system-design/vector/database-federation.svg)

*Original redraw based on [Scaling up to your first 10 million users](https://www.youtube.com/watch?v=kKjm4ehYiMs).* 

Federation works when functions have clear ownership. It works poorly when one query needs huge tables or joins across functions. The application must select a database, and cross-database joins need explicit coordination or application-side assembly.

## Sharding

Sharding distributes rows across databases. Each shard owns a subset of the data. A users table might shard by user ID, last-name prefix, or geography.

![Database sharding](/images/system-design/vector/database-sharding.svg)

*Original redraw based on [Scalability, availability, stability, patterns](http://www.slideshare.net/jboner/scalability-availability-stability-patterns/).* 

Sharding reduces traffic and index size per database. It can increase cache locality and allow writes to proceed in parallel. Replicate each shard if losing one shard would lose data.

The shard key is an application contract. A poor key creates a hot shard, for example when a small set of power users receives most traffic. Rebalancing moves data and adds coordination. Consistent hashing can reduce how much data moves when the shard set changes. Queries and joins across shards require fan-out, aggregation, and failure handling.

## Denormalization

Denormalization stores redundant copies to avoid an expensive join on reads. A materialized view can maintain that copy for you. This can help when reads outnumber writes by 100:1 or 1,000:1, or when distributed joins are too expensive.

The write path must update each copy, and constraints or reconciliation jobs must detect drift. Redundant data uses more storage. Under heavy writes, a normalized schema may be faster and safer.

## Query tuning

Benchmark and profile before changing a schema or index. A load generator such as [ApacheBench](https://httpd.apache.org/docs/2.4/programs/ab.html) simulates traffic. A slow-query log shows which queries consume time.

### Tighten the schema

- Choose `CHAR` for genuinely fixed-length values and `VARCHAR` for variable-length values. The storage engine's behavior matters more than a blanket rule.
- Use `TEXT` for large text blocks and a separate object store for large binary objects. Store the object location in the database.
- Use an integer type that fits the range. Use `DECIMAL` for currency instead of a binary floating-point type.
- Add `NOT NULL` when a value is required. It documents the invariant and can improve query planning.
- Do not choose `VARCHAR(255)` by habit. Length-prefix and character-set storage rules vary by database.

### Use indexes deliberately

An index can speed columns used for filtering, grouping, ordering, or joining. B-tree indexes keep keys sorted and usually provide logarithmic lookup plus ordered scans.

<svg role="img" aria-label="A B-tree reaches a matching row through a few branches, while a table scan checks rows in sequence" viewBox="0 0 760 190" xmlns="http://www.w3.org/2000/svg" style="max-width:100%;height:auto;font-family:-apple-system,'Segoe UI',sans-serif;margin:20px 0"><rect width="760" height="190" rx="8" fill="var(--diagram-bg)"/><g font-size="12" text-anchor="middle" fill="var(--diagram-ink)"><text x="190" y="25" font-weight="700" fill="var(--diagram-green)">B-tree lookup, O(log N)</text><rect x="150" y="45" width="80" height="30" rx="4" fill="var(--diagram-white)" stroke="var(--diagram-green)"/><text x="190" y="65">root</text><rect x="100" y="100" width="80" height="30" rx="4" fill="var(--diagram-white)" stroke="var(--diagram-green)"/><text x="140" y="120">branch</text><rect x="200" y="100" width="80" height="30" rx="4" fill="var(--diagram-white)" stroke="var(--diagram-green)"/><text x="240" y="120">match</text><path d="M170 75l-30 25M210 75l30 25" stroke="var(--diagram-green)" stroke-width="2"/><text x="570" y="25" font-weight="700" fill="var(--diagram-red-text)">Full scan, O(N)</text><rect x="520" y="45" width="100" height="95" rx="4" fill="var(--diagram-white)" stroke="var(--diagram-red)"/><path d="M520 68h100M520 91h100M520 114h100" stroke="var(--diagram-red-stroke)"/><text x="570" y="62">row 1</text><text x="570" y="85">row 2</text><text x="570" y="108">...</text><text x="570" y="132">row N</text></g></svg>

An index consumes memory and storage. Inserts and updates become slower because the index must change too. For a bulk load, it can be faster to load rows first and rebuild indexes afterward. Confirm the plan with the database's query planner.

### Avoid expensive joins and hot tables

Denormalize only where measured reads justify the duplicate data. Partition a table when a hot subset would otherwise evict useful data from memory. Keep the partition key aligned with common queries.

### Treat query caches carefully

A query cache stores a result under a hash of the query. Invalidating that result is difficult when any row in a complex query changes. MySQL removed its server query cache in 8.0 after deprecating it in 5.7.20 because mutex contention could hurt performance. An application cache such as Redis or Memcached gives the application more control.

## NoSQL databases

NoSQL is a family of key-value, document, wide-column, and graph stores. Many denormalize data and leave joins to application code. Many favor availability and eventual consistency over multi-row ACID transactions, although individual products differ.

BASE is a common description:

- **Basically available:** the system provides a response.
- **Soft state:** state can change as replicas converge, even without a new client request.
- **Eventual consistency:** replicas converge if new updates stop.

### Key-value stores

The abstraction is a hash table. A key-value store often provides near-constant-time reads and writes from memory or SSD. Ordered keys can support range reads. Limited operations keep the store fast but move richer query logic into the application.

Redis and Memcached are common examples. See [caching](/system-design/caching/) for their role between an application and durable storage.

### Document stores

A document store keeps an object's data together in a JSON, XML, or binary document. It can query fields inside the document. Collections, tags, or metadata group documents, and documents in one collection can have different fields.

MongoDB, CouchDB, and DynamoDB support document-shaped data with different query and transaction models. Document stores fit data whose shape changes or whose access pattern reads one object at a time.

### Wide-column stores

The basic abstraction is a nested map:

```text
ColumnFamily<RowKey, Columns<ColumnKey, Value, Timestamp>>
```

A column family groups columns like a table. Columns with one row key form a row. Timestamps support versioning and conflict resolution. Bigtable introduced the model, which influenced HBase and Cassandra. Ordered row keys make selected ranges efficient. Wide-column stores fit very large, high-throughput data sets when the query model is known in advance.

![Wide-column data model](/images/system-design/vector/database-wide-column.svg)

*Original redraw based on [SQL & NoSQL, a brief history](http://blog.grio.com/2015/11/sql-nosql-a-brief-history.html).* 

### Graph databases

A graph database stores nodes and relationships between nodes. It fits many-to-many relationships such as social graphs, where traversals would require many relational joins.

![Graph database model](/images/system-design/vector/database-graph.svg)

*Original redraw based on [Graph database](https://en.wikipedia.org/wiki/File:GraphDatabase_PropertyGraph.png).* 

Graph stores are less uniform than relational systems, so tools and operational experience may be harder to find. Choose one when relationship traversal is the dominant access pattern.

## SQL or NoSQL

![Transition from relational databases to NoSQL systems](/images/system-design/vector/database-sql-nosql.svg)

*Original redraw based on [Transitioning from RDBMS to NoSQL](https://www.infoq.com/articles/Transition-RDBMS-NoSQL/).* 

| Prefer SQL when | Prefer a NoSQL model when |
| --- | --- |
| Data has a stable schema and relationships. | Data is semi-structured or changes shape. |
| You need joins, constraints, and transactions. | You can model reads without joins. |
| Index lookups and established tooling matter. | The data set is many TB or PB, or needs very high write throughput. |
| The team benefits from a mature ecosystem. | A specialized key-value, document, wide-column, or graph model fits. |

NoSQL can fit clickstream and log ingestion, leaderboards, shopping carts, frequently accessed hot data, and metadata tables. These are workload examples, not a rule that one database must own them. [Consistency patterns](/system-design/consistency-patterns/) and [caching](/system-design/caching/) determine what readers can observe.

## Further reading

- [Scalability, availability, stability, patterns](http://www.slideshare.net/jboner/scalability-availability-stability-patterns/)
- [NoSQL patterns](http://horicky.blogspot.com/2009/11/nosql-patterns.html)
- [Consistent hashing](http://www.paperplanes.de/2011/12/9/the-magic-of-consistent-hashing.html)
