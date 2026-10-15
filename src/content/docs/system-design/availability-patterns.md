---
title: Availability patterns
description: Use failover, replication, and availability math to keep a service reachable.
sidebar:
  order: 6
---

Two complementary patterns support high availability: failover and replication. Failover changes which node serves traffic. Replication keeps more than one copy of data or compute state.

## Failover

### Active-passive

In active-passive failover, the active server serves traffic and sends heartbeats to a passive server on standby. If heartbeats stop, the passive server takes the active server's IP address and resumes service. A hot standby is already running and reduces downtime. A cold standby must start first and takes longer.

Only one node handles traffic at a time. Older systems may call this master-slave failover.

### Active-active

In active-active failover, both nodes handle traffic. A DNS service, load balancer, or application routing logic knows about both nodes. If one node fails, the other absorbs its traffic. Older systems may call this master-master failover.

<div data-anatomy="system-design--availability-patterns-1"></div>

*Concept redrawn from [Scalable system design patterns](http://horicky.blogspot.com/2010/10/scalable-system-design-patterns.html).* 

Failover adds hardware and operational complexity. If the active node fails before it replicates a new write, the system may lose that write. Test promotion, stale state, and the return of the recovered node.

## Replication

Replication keeps multiple copies available. [Database replication](/system-design/databases/) covers master-replica and multi-master designs, including replication lag and conflict resolution.

## Availability in numbers

Availability is usually expressed as uptime percentage. A service with 99.99% uptime has "four nines". The remaining percentage is the allowed downtime for the stated measurement period.

| Availability | Per year | Per month | Per week | Per day |
| --- | ---: | ---: | ---: | ---: |
| 99.9% | 8h 45m 57s | 43m 49.7s | 10m 4.8s | 1m 26.4s |
| 99.99% | 52m 35.7s | 4m 23s | 1m 5s | 8.6s |

An availability target is a budget for failed time, not a guarantee that failures become impossible. Define whether the measurement includes planned maintenance, dependency failures, and degraded responses.

## Components in sequence and in parallel

If a request needs both `Foo` and `Bar`, their availabilities multiply:

```text
Availability(total) = Availability(Foo) * Availability(Bar)
```

Two components at 99.9% availability provide 99.8% when they are both required.

If either of two parallel components can serve the request, the combined availability is:

```text
Availability(total) = 1 - (1 - Availability(Foo)) * (1 - Availability(Bar))
```

Two independent components at 99.9% availability provide 99.9999% in parallel. Independence is an assumption. A shared network, deployment, or operator can still fail both nodes.

## Further reading

- [Scalability, availability, stability, patterns](http://www.slideshare.net/jboner/scalability-availability-stability-patterns/)
- [Availability](https://en.wikipedia.org/wiki/Availability)
