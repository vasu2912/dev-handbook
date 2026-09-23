---
title: Content delivery networks (CDNs)
description: Serve content from edge locations closer to users and reduce origin load.
sidebar:
  order: 8
---

A content delivery network (CDN) is a globally distributed network of proxy servers. It serves content from an edge location near the user. Static HTML, CSS, JavaScript, images, and video are common CDN content. Some CDNs also cache dynamic responses.

![Content delivery network diagram](/images/system-design/vector/cdn-edge-network.svg)

*Concept redrawn from [Why use a CDN](https://www.creative-artworks.eu/why-use-a-content-delivery-network-cdn/).* 

<svg role="img" aria-label="Push CDN uploads content before a request, while pull CDN fetches content on the first request" viewBox="0 0 760 190" xmlns="http://www.w3.org/2000/svg" style="max-width:100%;height:auto;font-family:-apple-system,'Segoe UI',sans-serif;margin:20px 0"><rect width="760" height="190" rx="8" fill="var(--diagram-bg)"/><text x="190" y="25" text-anchor="middle" font-weight="700" fill="var(--diagram-ink)">Push CDN</text><text x="570" y="25" text-anchor="middle" font-weight="700" fill="var(--diagram-ink)">Pull CDN</text><g font-size="12" text-anchor="middle" fill="var(--diagram-ink)"><rect x="50" y="50" width="80" height="35" rx="4" fill="var(--diagram-accent-fill)"/><text x="90" y="72">Origin</text><rect x="160" y="50" width="90" height="35" rx="4" fill="var(--diagram-neutral)"/><text x="205" y="72">Edge</text><rect x="270" y="50" width="80" height="35" rx="4" fill="var(--diagram-neutral-light)"/><text x="310" y="72">User</text><path d="M130 67h25M250 67h15" stroke="var(--diagram-accent)" stroke-width="2"/><text x="190" y="105" fill="var(--diagram-accent)">upload before request</text><rect x="430" y="50" width="80" height="35" rx="4" fill="var(--diagram-accent-fill)"/><text x="470" y="72">Origin</text><rect x="540" y="50" width="90" height="35" rx="4" fill="var(--diagram-neutral)"/><text x="585" y="72">Edge</text><rect x="650" y="50" width="80" height="35" rx="4" fill="var(--diagram-neutral-light)"/><text x="690" y="72">User</text><path d="M650 95H635M535 95H515M515 125H535" stroke="var(--diagram-muted)" stroke-width="2"/><text x="585" y="116" fill="var(--diagram-red-text)">miss fetches origin</text><text x="690" y="116" fill="var(--diagram-green)">later requests hit edge</text></g></svg>

CDNs improve performance in two ways. The user travels a shorter network distance to an edge. The origin does not handle requests satisfied by the edge. DNS normally directs the client to the appropriate CDN location.

## Push CDNs

A push CDN receives content when your origin changes it. Your deployment uploads the file, chooses its expiry, and points clients at the CDN URL. Push delivery avoids the first-user cache miss and uploads only new or changed files. It uses more CDN storage and requires the origin or deployment process to manage uploads.

Push delivery fits smaller sites and content that changes infrequently. A release can publish a versioned filename, such as `app.8f3c.js`, so old and new content do not share a cache key.

## Pull CDNs

A pull CDN fetches content from the origin when the first user requests it. The edge stores the response until its TTL expires. The first request is slower, but the CDN stores only content users request.

Pull delivery fits high-traffic sites with a large set of content. Expiry can cause repeated origin fetches even when a file did not change. Cache-control headers and explicit invalidation control that trade-off.

| Strategy | First request | Storage | Origin work | Good fit |
| --- | --- | --- | --- | --- |
| Push | Fast because content is preloaded | Higher | Publish-time upload | Smaller, stable content sets |
| Pull | Slower on a miss | Lower | First request after expiry | Large, frequently requested content |

## Costs and failure modes

CDN traffic costs money, so compare the fee with the origin bandwidth and compute it replaces. A cached response can be stale until its TTL ends. Changing application URLs, cache headers, and invalidation rules adds deployment work. Do not cache personalized or private responses under a shared key.

See [DNS](/system-design/dns/) for routing to an edge and [caching](/system-design/caching/) for cache update strategies.

## Further reading

- [Globally distributed content delivery](https://figshare.com/articles/Globally_distributed_content_delivery/6605972)
- [The differences between push and pull CDNs](https://www.geeksforgeeks.org/system-design/pull-cdn-vs-push-cdn/)
