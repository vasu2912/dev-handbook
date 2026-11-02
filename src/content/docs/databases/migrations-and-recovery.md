---
title: Migrations, replication, and recovery
description: Explain compatible schema changes, replication lag, write-ahead logging, backups, and recovery objectives.
---

A schema migration changes the contract shared by application versions and stored data. During a rolling deployment, old and new processes can run simultaneously. A schema valid only for the newest process can break requests that still reach the old one.

## Expand and contract

For a field replacement, first add the new representation while preserving the old contract. Deploy code that can handle the transition. Backfill existing data in bounded batches. Move readers to the new representation, then remove the old field after old readers are gone.

The backfill must handle concurrent writes, restarts, and partial progress. A single transaction updating millions of rows can hold locks and create heavy replication and vacuum work. Adding a constraint or building an index also has product-specific lock behavior.

Tools such as Flyway and Liquibase track migration history. They do not prove that a migration avoids long locks or remains compatible with old application versions. A forward repair can be safer than a down migration after destructive state changes.

## Write-ahead logging and replication

A write-ahead log records changes needed for crash recovery before the corresponding data pages are considered safely persisted under the durability policy. Recovery replays logged changes after interruption.

Replication copies changes to other nodes. Asynchronous replicas can lag behind committed writes, so routing the next read to a replica may miss an order just created. Synchronous acknowledgment can reduce specific loss windows at an availability or latency cost. Define exactly which nodes and persistence conditions acknowledge a commit.

Replication does not replace backup. An accidental delete can propagate to every replica. Failover also needs safe writer selection so two primaries do not accept incompatible writes.

## Backup and restore

| Approach                       | Main property                                                  |
| ------------------------------ | -------------------------------------------------------------- |
| Logical dump                   | Exports database objects and data for reconstruction           |
| Physical backup                | Copies database storage using a supported consistent procedure |
| Base backup plus archived logs | Supports recovery to an eligible point in time                 |

Recovery point objective describes tolerable data loss. Recovery time objective describes tolerable recovery duration. A nightly backup alone cannot promise recovery to a point five minutes before failure.

A successful backup command is incomplete evidence. A restore drill checks that the data, logs, credentials, encryption keys, and procedure actually recover a usable application. See [database architecture](/system-design/databases/) for replication and sharding choices.

## Sources

- [PostgreSQL: modifying tables](https://www.postgresql.org/docs/current/ddl-alter.html)
- [PostgreSQL: write-ahead logging](https://www.postgresql.org/docs/current/wal-intro.html)
- [PostgreSQL: backup and restore](https://www.postgresql.org/docs/current/backup.html)
- [PostgreSQL: warm standby and replication](https://www.postgresql.org/docs/current/warm-standby.html)
