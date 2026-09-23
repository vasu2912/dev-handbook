---
title: Load balancing
description: Distribute requests across healthy resources while preserving capacity and availability.
sidebar:
  order: 9
---

A load balancer distributes incoming requests to application servers, databases, or other computing resources. It returns the selected resource's response to the client. Health checks keep traffic away from unhealthy nodes. Distribution prevents one node from taking all traffic and removes a single server as the only point of failure.

![Load-balancing architecture](/images/system-design/vector/load-balancing.svg)

*Concept redrawn from [Scalable system design patterns](http://horicky.blogspot.com/2010/10/scalable-system-design-patterns.html).* 

<svg role="img" aria-label="Layer 4 routes by IP and port, while layer 7 routes by HTTP path and headers" viewBox="0 0 760 180" xmlns="http://www.w3.org/2000/svg" style="max-width:100%;height:auto;font-family:-apple-system,'Segoe UI',sans-serif;margin:20px 0"><rect width="760" height="180" rx="8" fill="var(--diagram-bg)"/><g font-size="12" text-anchor="middle" fill="var(--diagram-ink)"><text x="190" y="25" font-weight="700">Layer 4</text><text x="570" y="25" font-weight="700">Layer 7</text><rect x="35" y="55" width="70" height="32" rx="4" fill="var(--diagram-neutral)"/><text x="70" y="76">Client</text><rect x="145" y="48" width="90" height="46" rx="4" fill="var(--diagram-accent-fill)"/><text x="190" y="68">LB</text><text x="190" y="83" font-size="10">IP + port</text><rect x="275" y="40" width="60" height="30" rx="4" fill="var(--diagram-green-bg)"/><text x="305" y="60">S1</text><rect x="275" y="80" width="60" height="30" rx="4" fill="var(--diagram-green-bg)"/><text x="305" y="100">S2</text><path d="M105 71h35M235 65l35-10M235 80l35 15" stroke="var(--diagram-muted)" stroke-width="2"/><rect x="415" y="55" width="70" height="32" rx="4" fill="var(--diagram-neutral)"/><text x="450" y="76">Client</text><rect x="525" y="48" width="90" height="46" rx="4" fill="var(--diagram-yellow-bg)"/><text x="570" y="68">LB</text><text x="570" y="83" font-size="10">path + headers</text><rect x="655" y="40" width="70" height="30" rx="4" fill="var(--diagram-green-bg)"/><text x="690" y="60">API pool</text><rect x="655" y="80" width="70" height="30" rx="4" fill="var(--diagram-purple-bg)"/><text x="690" y="100">static pool</text><path d="M485 71h35M615 65l35-10M615 80l35 15" stroke="var(--diagram-muted)" stroke-width="2"/></g></svg>

Hardware load balancers exist, but software such as [HAProxy](https://www.haproxy.org/) and [NGINX](https://nginx.org/) can fill the role. Common routing policies include random choice, least loaded, round robin, weighted round robin, and a session or cookie key.

Load balancers can terminate TLS. They decrypt client traffic, so backend nodes do not each need an X.509 certificate or the CPU cost of a TLS handshake. Protect the hop from the load balancer to the backend when that network is not trusted.

Session persistence routes one client's requests to the same instance. It can help legacy applications that keep sessions in process memory. A shared session store, such as a [database](/system-design/databases/) or [cache](/system-design/caching/), usually makes horizontal scaling less fragile.

## Layer 4 and layer 7

Layer 4 load balancing uses transport information such as source and destination IP addresses and ports. It forwards TCP or UDP packets, often with network address translation, without reading the application payload. It is fast and protocol-agnostic, but cannot route on a URL or cookie.

Layer 7 load balancing terminates the connection and parses application data. It can route by HTTP path, headers, message fields, or cookies. For example, it can send `/video/*` to video nodes and billing requests to a hardened pool. Parsing and terminating connections use more CPU and memory.

| Choice | Can inspect | Strength | Cost |
| --- | --- | --- | --- |
| Layer 4 | IP, port, transport state | Low overhead and works for many protocols | Cannot make content-aware decisions |
| Layer 7 | HTTP path, headers, cookies, payload metadata | Precise routing and TLS termination | More processing and protocol coupling |

## Horizontal scaling

Scaling out adds commodity nodes. It often costs less and provides more failure isolation than scaling up one large machine. A horizontally scaled application node should be stateless. Store sessions, profile pictures, and other user data in a shared system rather than local disk or process memory.

Each added application node also creates more downstream connections. Size the database, cache, and connection pools for the new concurrency.

## Costs and failure modes

A load balancer can become a bottleneck if its capacity or configuration is wrong. One load balancer is still a single point of failure. Multiple balancers, active-passive or active-active, improve availability but add health checks, routing, and failover state. See [availability patterns](/system-design/availability-patterns/) and [reverse proxies](/system-design/reverse-proxy/) for adjacent choices.

## Further reading

- [NGINX architecture](https://www.nginx.com/blog/inside-nginx-how-we-designed-for-performance-scale/)
- [Layer 4 load balancing](https://www.nginx.com/resources/glossary/layer-4-load-balancing/)
- [Layer 7 load balancing](https://www.nginx.com/resources/glossary/layer-7-load-balancing/)
