---
title: Distributed consensus
description: Replicated state machines, Raft leader election and log replication, quorums, read consistency, and where consensus fits next to sagas and locks.
---

Consensus is the problem of getting several machines to agree on one ordered history of commands, even when some of them crash and messages get lost or delayed. A service that solves it is the foundation for replicated state machines: every replica applies the same commands in the same order, so they end with the same state.

That foundation holds up systems you already run. etcd, which stores all of Kubernetes' cluster state, is a consensus service. Kafka's KRaft mode runs its metadata on a Raft implementation. CockroachDB, Consul, and TiKV all use Raft.

## Terms, leaders, and quorums

Raft (Ongaro and Ousterhout, 2014) is the consensus algorithm interviews expect, because it was designed to be explainable. Servers are followers, candidates, or leaders. Time is divided into **terms** with increasing numbers, and each term has at most one leader.

A leader serves client requests, replicates log entries, and sends heartbeats. When a follower hears nothing for a randomized election timeout, it becomes a candidate, increments the term, and requests votes. A majority of the cluster makes it leader.

Two quorum rules carry all the safety:

1. Each server votes for at most one candidate per term. One majority per term.
2. Majorities of any two terms overlap in at least one server, so a new leader cannot be elected without a voter that saw all committed entries.

Clusters of 2f+1 servers tolerate f failures. That is why three or five is the answer and four buys nothing over three: the same failure tolerance with more machines. Losing quorum means losing availability for writes until enough servers return. The system chooses consistency, and the partition hands availability to the majority side. See [availability and consistency](/system-design/availability-and-consistency/).

## Log replication and the commit rule

The leader appends a client command to its log and sends `AppendEntries` to followers. Once a **majority** has stored the entry, the entry is committed, the leader applies it and answers the client.

One subtlety matters for correctness. Raft counts replicas only for entries from the **current** term. An entry left uncommitted from an earlier term commits only when a later entry from the current term commits. The rule exists because a leader cannot know whether an old entry was already applied somewhere; committing it by counting replicas could later conflict with a different leader's history. The election restriction closes the loop: a server denies its vote unless the candidate's log is at least as up to date as its own, so a newly elected leader has every committed entry.

Interviewers like the follow-up: "Why not just elect the candidate with the longest log?" Because the longest log can contain uncommitted entries from a stale term, and electing it could overwrite committed history. The restriction compares (term, index) of the last entry, not length.

## Reads without breaking linearizability

A leader that answers reads from local state can lie to a client if it has been partitioned away while a new leader serves writes. Three standard fixes:

- **Quorum read**: confirm leadership with a round of heartbeats before answering.
- **ReadIndex**: record the current commit index, confirm leadership once, then serve the read at that index.
- **Lease reads**: the leader holds a time-bounded lease, so within the lease it serves reads locally. Clock assumptions make this a tradeoff.

Followers can serve reads at a known-applied index, which returns stale or consistent data depending on how strictly the index is enforced. State which behavior your system chose; "the follower read" is not one behavior.

## Consensus is not two-phase commit

| Question | Consensus (Raft) | Two-phase commit |
|---|---|---|
| Decides | An ordered log all replicas agree on | Whether a group of participants all commit one transaction |
| Failure behavior | Tolerates minority failures; fails over | Blocks if the coordinator dies mid-protocol |
| Where it lives | Inside one system (etcd, Kafka metadata, a database node group) | Across systems that own their own resources |

They compose: a system can use Raft internally to make its own state fault-tolerant, and still participate in a saga or outbox pattern at higher levels. See [sagas](/microservices/sagas/) and [outbox and delivery](/microservices/outbox-and-delivery/).

## Where it meets the rest of the handbook

- **Split-brain and fencing**: a deposed leader that still believes it is leader is the canonical use case for fencing tokens. Raft terms are fencing tokens by construction. See [distributed locks](/microservices/distributed-locks/).
- **Configuration stores**: "store cluster state in etcd/ZooKeeper" is the practical answer to application-level leadership; building your own election is a red flag.
- **Client semantics**: Raft gives exactly-once application semantics only when the client supplies a deduplication ID across retries, the same idempotency discipline as any distributed system. See [API integration contracts](/engineering/api-integrations/).

## Sources

- [In Search of an Understandable Consensus Algorithm (Raft), USENIX ATC 2014](https://www.usenix.org/system/files/conference/atc14/atc14-paper-ongaro.pdf)
- [The Raft site with the paper, visualizations, and implementations](https://raft.github.io/)
- [etcd documentation: Raft in etcd](https://etcd.io/docs/v3.5/learning/design-learner/)
- [Apache Kafka KRaft documentation](https://kafka.apache.org/documentation/#kraft)
- [MIT 6.824 Lecture: Raft](https://pdos.csail.mit.edu/6.824/notes/l-raft2.txt)
