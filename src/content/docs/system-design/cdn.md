---
title: Content delivery networks (CDNs)
description: Serve content from edge locations closer to users and reduce origin load.
sidebar:
  order: 8
---

A content delivery network (CDN) is a globally distributed network of proxy servers. It serves content from an edge location near the user. Static HTML, CSS, JavaScript, images, and video are common CDN content. Some CDNs also cache dynamic responses.

<div data-anatomy="system-design--cdn-1"></div>

*Concept redrawn from [Why use a CDN](https://www.creative-artworks.eu/why-use-a-content-delivery-network-cdn/).* 

<div data-anatomy="system-design--cdn-2"></div>

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
