---
title: Reverse proxies
description: Centralize public traffic while hiding and protecting internal servers.
sidebar:
  order: 10
---

A reverse proxy is a web server that accepts public requests and forwards them to an internal server. Clients see one public address. The proxy chooses a backend and returns its response.

![Reverse proxy diagram](/images/system-design/vector/reverse-proxy.svg)

*Concept redrawn from [Wikipedia](https://upload.wikimedia.org/wikipedia/commons/6/67/Reverse_proxy_h2g2bob.svg).* 

A reverse proxy can provide:

- Security controls such as hiding backend addresses, denying IPs, and limiting connections per client.
- TLS termination, so backend nodes do not each manage an X.509 certificate.
- Compression of responses.
- Caching for cacheable responses.
- Direct delivery of static HTML, CSS, JavaScript, images, and videos.
- A stable public interface while internal servers scale or change.

## Reverse proxy and load balancer

A load balancer distributes work across multiple servers that perform the same function. A reverse proxy can be useful with one backend because it still provides TLS termination, caching, compression, and a public-to-private seam. NGINX and HAProxy can act as both a layer 7 reverse proxy and a load balancer.

The distinction is about the role you need. When the primary problem is choosing among healthy instances, use load-balancing behavior. When the primary problem is mediating all public traffic, a reverse proxy may be enough.

## Costs and failure modes

The proxy adds another process, configuration, and place where timeouts can be wrong. A single proxy is a single point of failure. Run multiple proxies and test their failover if the proxy is part of the availability target.

See the [request lifecycle](/backend/architecture/request-lifecycle/) for how a request moves through backend modules and [security](/system-design/security-overview/) for controls at each layer.

## Further reading

- [Reverse proxy vs load balancer](https://www.nginx.com/resources/glossary/reverse-proxy-vs-load-balancer/)
- [NGINX architecture](https://www.nginx.com/blog/inside-nginx-how-we-designed-for-performance-scale/)
