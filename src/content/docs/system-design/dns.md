---
title: Domain name system (DNS)
description: Understand name resolution, records, caching, and traffic routing.
sidebar:
  order: 7
---

The Domain Name System (DNS) translates a name such as `www.example.com` to an IP address. DNS is hierarchical. A resolver learns which authoritative servers to query, then caches answers for the record's time to live (TTL).

<div data-anatomy="system-design--dns-1"></div>

*Concept redrawn from [DNS security presentation](http://www.slideshare.net/srikrupa5/dns-security-presentation-issa).* 

Your router or internet service provider usually supplies the recursive resolver. The browser and operating system may cache the answer too. A low TTL lets changes propagate sooner, but increases lookup traffic. A high TTL reduces lookup traffic, but leaves stale addresses in caches for longer.

## Common records

| Record | Purpose | Example |
| --- | --- | --- |
| `NS` | Names the authoritative servers for a domain or subdomain. | `example.com` -> `ns1.example.net` |
| `MX` | Names mail servers that accept messages. | `example.com` -> `mail.example.com` |
| `A` | Maps a name to an IPv4 address. | `www.example.com` -> `192.0.2.10` |
| `CNAME` | Maps a name to another name, which then resolves to an address. | `example.com` -> `www.example.com` |

Managed providers such as [Cloudflare DNS](https://www.cloudflare.com/dns/) and [Amazon Route 53](https://aws.amazon.com/route53/) host authoritative DNS and can apply routing policies:

- Weighted round robin sends a chosen share of requests to each destination. It can balance clusters of different sizes, keep a destination out during maintenance, or support an A/B test.
- Latency-based routing sends a client to a destination with a measured low network latency.
- Geolocation-based routing chooses a destination from the client's location.

DNS routing is coarse. Resolvers cache answers, so a changed policy does not affect every client at once. Use a load balancer when you need per-request health checks or fast routing changes.

## Costs and failure modes

A cache miss adds a lookup delay, though browser, OS, and resolver caches reduce it. DNS management has several layers of delegation, and public DNS providers themselves can be targets for denial-of-service attacks. If a resolver or authoritative provider is unavailable, clients may fail before reaching the application even when the application is healthy.

## Further reading

- [DNS architecture](https://technet.microsoft.com/en-us/library/dd197427(v=ws.10).aspx)
- [DNS articles](https://support.dnsimple.com/categories/dns/)
