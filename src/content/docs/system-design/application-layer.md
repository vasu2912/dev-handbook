---
title: The application layer
description: Separate request handling from business work and discoverable services.
sidebar:
  order: 11
---

Separating the web layer from the application layer lets each scale and change independently. Adding an API can require more application workers without requiring more web servers. Application workers can also run [asynchronous processing](/system-design/asynchronous-processing/) outside the request path.

<div data-anatomy="system-design--application-layer-1"></div>

*Concept redrawn from [Introduction to architecting systems for scale](http://lethain.com/introduction-to-architecting-systems-for-scale/#platform_layer).* 

The single-responsibility principle favors small, autonomous modules that cooperate through explicit interfaces. A small service should have one business purpose and a clear owner. Splitting a system too early still adds deployment and operational work, so split where independent scaling or ownership pays for that cost.

## Microservices

Microservices are independently deployable processes that communicate through a defined, lightweight interface to serve a business goal. A social product might separate user profiles, follows, feeds, search, and photo uploads.

The useful property is independent change and scaling. The cost is distributed failure, versioned interfaces, deployment coordination, and more difficult local debugging. A modular monolith can provide clear ownership and interfaces without network calls when those costs do not pay back.

## Service discovery

Service discovery records service names, addresses, and ports so one service can find another. Tools such as [Consul](https://www.consul.io/docs/index.html), [etcd](https://etcd.io/docs/), and [ZooKeeper](https://zookeeper.apache.org/) provide discovery primitives. Health checks, often an HTTP endpoint, keep unhealthy registrations out of routing.

Consul and etcd also provide key-value storage that can hold configuration and shared coordination data. Keep configuration ownership and update rules explicit. A discovery system is itself a dependency that needs replication and failure handling.

For the structure inside one backend, read the [backend architecture deep dive](/backend/architecture/request-lifecycle/). For network choices between services, see [communication protocols](/system-design/communication-protocols/).

## Costs and failure modes

Loosely coupled services require changes to architecture, operations, testing, and team process. A deployment can succeed while a network call, timeout, or incompatible version fails at runtime. Track service health and request identity across the calls that make up one user operation.

## Further reading

- [Introduction to architecting systems for scale](http://lethain.com/introduction-to-architecting-systems-for-scale/)
- [Service-oriented architecture](https://en.wikipedia.org/wiki/Service-oriented_architecture)
- [Introduction to ZooKeeper](http://www.slideshare.net/sauravhaloi/introduction-to-apache-zookeeper)
