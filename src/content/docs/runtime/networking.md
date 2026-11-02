---
title: Networking and HTTP connections
description: Follow DNS, TCP, TLS, HTTP versions, connection pools, and the network failures behind a backend request.
---

An HTTP request needs a destination, a transport, and an application-level exchange. DNS resolves names. IP routes packets. TCP or QUIC supplies transport behavior. TLS protects supported exchanges. HTTP defines requests, responses, and representation semantics.

## Connection establishment

For a fresh HTTPS connection over TCP, the client resolves the host, establishes TCP, negotiates TLS, and exchanges HTTP messages. Caches, reused connections, TLS resumption, and protocol selection can shorten or change this sequence.

TCP provides an ordered byte stream with retransmission, flow control, and congestion control. It does not preserve application message boundaries. A read can return part of one message or bytes spanning multiple application messages.

UDP supplies datagrams without TCP's ordered reliable stream. Applications can build additional behavior above it. QUIC uses UDP while providing encrypted connections and reliable streams.

## HTTP versions

| Version  | Connection behavior                                                          |
| -------- | ---------------------------------------------------------------------------- |
| HTTP/1.1 | Persistent connections, usually multiple connections for concurrent requests |
| HTTP/2   | Multiplexed streams over one TCP connection                                  |
| HTTP/3   | HTTP over QUIC with independent transport streams                            |

HTTP/2 avoids HTTP/1.1's application-level request serialization on a connection, but TCP packet loss can delay every stream using that TCP connection. QUIC reduces that cross-stream transport blocking. Resource limits and application dependencies can still create waiting.

## TLS and trust

TLS authenticates the server using certificates and establishes keys for encrypted, integrity-protected traffic. Mutual TLS also authenticates the client certificate. Neither establishes that an authenticated user is authorized to cancel a particular order.

Validate the certificate chain and expected host. Disabling verification to make a request succeed removes the intended identity check.

## Pools and partial failure

Connection reuse avoids repeated handshakes. A pool introduces acquisition waits and capacity limits. Stale connections, idle timeouts, DNS changes, and load-balancer draining can cause failures even when the service is healthy.

A timeout may occur before the server receives a request, during execution, or after it commits but before the response arrives. The client often cannot distinguish those cases. Apply [idempotency and reconciliation](/engineering/api-integrations/) before repeating side effects.

Read [DNS](/system-design/dns/), [communication protocols](/system-design/communication-protocols/), and [timeouts](/microservices/timeouts-and-retries/) for related details.

## Sources

- [RFC 9110: HTTP semantics](https://www.rfc-editor.org/rfc/rfc9110.html)
- [RFC 9113: HTTP/2](https://www.rfc-editor.org/rfc/rfc9113.html)
- [RFC 9114: HTTP/3](https://www.rfc-editor.org/rfc/rfc9114.html)
- [RFC 8446: TLS 1.3](https://www.rfc-editor.org/rfc/rfc8446.html)
