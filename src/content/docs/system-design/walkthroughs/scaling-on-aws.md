---
title: Scale a service on AWS
description: An iterative scaling path from one server to load balancing, caching, replicas, and autoscaling.
sidebar:
  order: 8
---

The canonical iterative-scaling example. Watch how a design evolves: benchmark → profile → fix → repeat. The AWS specifics are not required: the principles apply anywhere.

## Define use cases and constraints

### Use cases

- **User** makes a read or write request; the service processes, stores data, and returns results.
- The service must evolve from a few users to millions.
- **Service** has high availability.

### Constraints and assumptions

- Traffic is not evenly distributed; relational data is needed.
- 10 million users, 1 billion writes/month, 100 billion reads/month → **100:1 read:write**.
- 1 KB per write → **1 TB**/month, 36 TB in 3 years.
- **400 writes/s**, **40,000 reads/s**.

## Sketch the high-level design

![Initial AWS service architecture](/images/system-design/vector/scaling-aws-initial.svg)

## Define the core components (the journey)

### Start with a single box

- One EC2 instance: a web server + a MySQL database.
- **Vertical scaling**: pick a bigger box; monitor CPU, memory, IO, network.
- Assign a public static IP (Elastic IP) and a [DNS](/system-design/) (Route 53).
- Secure the server: open only ports 80/443 (and 22 to whitelisted IPs); block outbound connections.

:::caution[Vertical scaling limits]
Expensive, no redundancy, no failover. The alternative is [horizontal scaling](/system-design/load-balancing/).
:::

### Users+: split the box

Benchmarks show MySQL eating memory/CPU and user content filling disk.

- Move static content to an **Object Store** (S3).
- Move MySQL to its own box (RDS) with multiple availability zones and encryption at rest.
- Use a VPC: public subnet for the web server, private subnet for everything else.

### Users++: scale the web tier

The single web server bottlenecks at peak.

- Add a **load balancer** (ELB or HAProxy) with active-active/passive in multiple availability zones.
- Terminate SSL at the balancer.
- Add multiple **web servers**; separate web servers from [application servers](/system-design/) (web servers run as [reverse proxies](/system-design/load-balancing/)).
- Add **master-slave failover** for MySQL.
- Move static (and some dynamic) content to a **[CDN](/system-design/)** (CloudFront).

### Users+++: scale the database

Read-heavy (100:1) → the database suffers on reads.

- Add a **memory cache** (ElastiCache) for hot content and sessions (web servers become stateless → autoscalable).
- Add **MySQL read replicas** to relieve the write master; split reads and writes in the app.

### Users++++: autoscale

Traffic spikes during business hours.

- Add **autoscaling**: a group per web/app server type, min/max instances, trigger on CPU/latency/network (CloudWatch).
- Automate DevOps (Chef, Puppet, Ansible); monitor host, aggregate, and log levels.

![AWS scaling journey](/images/system-design/vector/scaling-aws-journey.svg)

:::tip[The pattern to memorize]
single box → vertical → split storage/DB → horizontal + LB + CDN → cache + read replicas → autoscale. Each step fixes the bottleneck the previous step revealed.
:::

## Additional talking points

- SQL scaling patterns (sharding, federation) beyond read replicas: see [database](/system-design/databases/).
- Cache strategies: see [cache](/system-design/caching/).
- Security hardening at each step: see [security](/backend/security/).

---
