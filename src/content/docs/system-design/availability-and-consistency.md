---
title: Availability and consistency
description: Understand the CAP trade-off when a distributed system loses communication.
sidebar:
  order: 4
---

## CAP theorem

CAP describes the guarantees a distributed data system can provide during a network partition. It names three properties:

- **Consistency:** every read returns the most recent write or an error.
- **Availability:** every request receives a response, without a promise that it contains the newest value.
- **Partition tolerance:** the system continues operating despite messages being lost or delayed between nodes.

Networks fail, so a practical distributed system must tolerate partitions. During the partition, the design chooses whether to preserve consistency or availability. CAP does not say that a system permanently chooses only two properties. It describes the choice made while communication is broken.

![CAP theorem: consistency, availability, and partition tolerance](/images/system-design/vector/cap-tradeoffs.svg)

*Concept redrawn from [CAP theorem revisited](https://robertgreiner.com/cap-theorem-revisited/).* 

### CP: consistency and partition tolerance

A CP design waits for the required nodes to respond. If the partition prevents that response, the operation returns a timeout or another error. CP fits data where accepting a stale or conflicting value would be worse than refusing the operation, such as an inventory reservation or a transaction.

### AP: availability and partition tolerance

An AP design returns the best value available on a reachable node. That value may be stale. When communication returns, replicas propagate writes and reconcile state. AP fits systems that must keep serving during dependency failures and can explain or tolerate [eventual consistency](/system-design/consistency-patterns/).

CAP is a constraint on one failure mode, not a complete database-selection rule. Define the business invariant first, then choose the guarantee for each operation. [Databases](/system-design/databases/) and [availability patterns](/system-design/availability-patterns/) apply this choice to storage and traffic.

## Further reading

- [CAP theorem revisited](https://robertgreiner.com/cap-theorem-revisited/)
- [A plain English introduction to CAP theorem](http://ksat.me/a-plain-english-introduction-to-cap-theorem)
- [CAP FAQ](https://github.com/henryr/cap-faq)
