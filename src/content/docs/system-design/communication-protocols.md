---
title: Communication protocols
description: Choose HTTP, TCP, UDP, RPC, REST, or a real-time connection by the guarantees the caller needs.
sidebar:
  order: 15
---

<div data-anatomy="system-design--communication-protocols-1"></div>

*Concept redrawn from [OSI 7 layer model](http://www.escotal.com/osilayer.html).* 

The [API design deep dive](/backend/api-design/) covers resource URLs, methods, idempotency, CRUD, and pagination. This page focuses on the protocols beneath those interface choices.

## HTTP

HTTP encodes and transports data between a client and server. It is a request-response protocol. Requests and responses can cross routers, proxies, load balancers, caches, encryption terminators, and compression layers while retaining the information needed to process the request.

| Method | Typical use | Idempotent | Safe | Cacheable |
| --- | --- | --- | --- | --- |
| `GET` | Read a resource | Yes | Yes | Yes |
| `POST` | Create a resource or trigger a process | No | No | When the response provides freshness information |
| `PUT` | Create or replace a resource | Yes | No | Rarely, when freshness information is present |
| `PATCH` | Partially update a resource | No | No | Rarely, when freshness information is present |
| `DELETE` | Delete a resource | Yes | No | No |

Idempotent means that repeating the same request has the same intended result as sending it once. It does not mean that every response body is identical. HTTP runs at the application layer over transports such as TCP and UDP.

## TCP

TCP establishes and closes a connection with a handshake. Sequence numbers, checksums, acknowledgements, retransmission, flow control, and congestion control deliver a reliable ordered byte stream. Lost packets are resent. Repeated timeouts can close the connection.

Reliability costs time and memory. A server that keeps many TCP connections open needs memory for connection state. Connection pooling reduces setup work, including for connections to a cache such as Memcached. TCP fits web servers, databases, SMTP, FTP, SSH, and other workloads where complete data matters more than the latest possible packet.

Choose TCP when every byte must arrive intact or you want the transport to estimate and share network capacity.

<div data-anatomy="system-design--communication-protocols-2"></div>

*Concept redrawn from [How to make a multiplayer game](http://www.wildbunny.co.uk/blog/2012/10/09/how-to-make-a-multi-player-game-part-1/).* 

## UDP

UDP sends connectionless datagrams. A datagram may arrive out of order, arrive more than once, or never arrive. UDP has no built-in congestion control, so applications that use it must decide how to handle loss and rate.

UDP can broadcast to devices on a subnet. DHCP uses this property before a client has an IP address. VoIP, video chat, streaming, and real-time games often prefer a late packet to a lost moment, so they use UDP with application-specific recovery.

Choose UDP when low latency matters more than complete delivery, when late data is worse than lost data, or when the application needs its own error correction.

<div data-anatomy="system-design--communication-protocols-3"></div>

*Concept redrawn from [How to make a multiplayer game](http://www.wildbunny.co.uk/blog/2012/10/09/how-to-make-a-multi-player-game-part-1/).* 

## Real-time connections

Short polling sends repeated requests at a fixed interval. It is simple and works with ordinary HTTP, but empty responses consume connection and server resources and updates wait for the next interval.

Long polling holds one request open until data is available or a timeout occurs, then the client reconnects. It reduces empty responses but keeps server connections open.

Server-sent events (SSE) keeps one HTTP response open and streams server-to-client events with `text/event-stream`. It supports one-way updates and automatic reconnect patterns. The client still sends ordinary requests upstream.

WebSockets begin with an HTTP upgrade handshake and then keep a bidirectional message connection. They fit chat, presence, collaborative editing, and games. Proxies, load balancing, connection limits, and reconnect state become part of the design.

<div data-anatomy="system-design--communication-protocols-4"></div>

| Pattern | Direction | Connection | Good fit |
| --- | --- | --- | --- |
| Short polling | Client requests | Repeated short requests | Low-frequency updates and simple infrastructure |
| Long polling | Server replies when ready | Held request | Push-like updates without a protocol upgrade |
| SSE | Server pushes | Held HTTP response | One-way event streams |
| WebSocket | Both directions | Upgraded persistent connection | Interactive, low-latency sessions |

For the system-design consequences of these choices, continue with [real-time backends](/system-design/real-time-backends/). That explanation covers event IDs, replay, heartbeats, connection budgets, and fan-out across instances.

## RPC

Remote procedure call (RPC) makes a procedure execute in another address space, usually on a server. A client stub marshals the procedure ID and arguments, the communication layer sends them, and the server stub unmarshals them before calling the implementation. The response follows the same path in reverse.

Remote calls are slower and less reliable than local calls. Keep that difference visible in the interface. Protobuf, Thrift, and Avro are common serialization or RPC technologies.

```text
GET /someoperation?data=anId

POST /anotheroperation
{"data":"anId", "anotherdata":"another value"}
```

RPC exposes behavior and can fit internal traffic where a generated native client, compact encoding, or tailored error model matters. A native SDK fits when the target platform is known and the library should control how callers access logic and errors.

RPC clients can become tightly coupled to the server implementation. Every new operation may need a new procedure. Debugging and caching can require special tooling.

<div data-anatomy="system-design--communication-protocols-5"></div>

*Concept redrawn from [Puncsky’s system design notes](http://www.puncsky.com/blog/2016-02-13-crack-the-system-design-interview).* 

## REST

REST is an architectural style in which clients act on resources managed by a server. A REST interface is stateless and cacheable. It identifies resources with URIs, changes representations with HTTP methods and bodies, uses HTTP status codes for errors, and can expose discoverable links through HATEOAS.

```http
GET /people/1234

PUT /people/1234
{"display_name":"Ada"}
```

REST exposes data through a uniform interface and works well for public HTTP APIs. Stateless requests also simplify horizontal scaling and partitioning.

REST becomes awkward when a domain action does not map cleanly to a resource, when one screen needs deeply nested data and many round trips, or when a broad response adds fields that older clients do not need. Query parameters, a request body, a purpose-built endpoint, or RPC may express that operation more clearly.

| Operation | RPC style | REST style |
| --- | --- | --- |
| Sign up | `POST /signup` | `POST /persons` |
| Resign | `POST /resign {"person_id":"1234"}` | `DELETE /persons/1234` |
| Read a person | `GET /readPerson?person_id=1234` | `GET /persons/1234` |
| Read items | `GET /readUsersItemsList?person_id=1234` | `GET /persons/1234/items` |
| Add an item | `POST /addItemToUsersItemsList {"person_id":"1234","item_id":"456"}` | `POST /persons/1234/items {"item_id":"456"}` |
| Update an item | `POST /modifyItem {"item_id":"456","key":"value"}` | `PUT /items/456 {"key":"value"}` |
| Delete an item | `POST /removeItem {"item_id":"456"}` | `DELETE /items/456` |

Choose the interface that keeps the caller's contract small and the server's implementation replaceable. See [API design](/backend/api-design/) for detailed resource and method choices.

## Further reading

- [Networking for game programming](https://gafferongames.com/post/udp_vs_tcp/)
- [Do you really know why you prefer REST over RPC](https://apihandyman.io/do-you-really-know-why-you-prefer-rest-over-rpc/)
- [Thrift](https://code.facebook.com/posts/1468950976659943/)
