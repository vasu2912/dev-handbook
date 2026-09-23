---
title: Real-time backends
description: Understand push protocols, persistent connections, reconnection, fan-out, and the limits of real-time systems.
sidebar:
  order: 16
---

A normal HTTP request has one direction of initiative. The browser asks a question, and the server returns an answer. That model fits a page load or a form submission. It does not fit a shared board where one person's change must appear on another person's screen while both pages remain open.

A real-time backend gives the server a way to deliver an event without waiting for a new request. The word *real-time* does not promise zero latency. It means the system keeps the delay bounded by the connection, the work needed to publish the event, and the client that renders it.

This page explains the design choices behind that behavior. Read [communication protocols](/system-design/communication-protocols/) first for a shorter comparison of HTTP, TCP, UDP, SSE, WebSockets, RPC, and REST. Use [API design](/backend/api-design/) for the request contracts that carry writes and snapshots.

## Start with the event, not the protocol

Suppose two people have board `412` open. One person moves a task from `todo` to `in-progress`. The backend must do four separate jobs:

- accept and authorize the write;
- persist the new state;
- publish a description of the change;
- deliver that change to every authorized connection watching board `412`.

The last two jobs are the real-time path. They do not replace the ordinary API. A client still needs an initial snapshot, and the server still needs an ordinary write endpoint unless the chosen protocol carries writes too.

Keep the event small and explicit. A useful event might contain an ID, a board ID, a type, a sequence number, and the changed fields.

```json
{
	"id": "evt_1043",
	"sequence": 1043,
	"topic": "board:412",
	"type": "task.moved",
	"data": {"taskId": "task_7", "column": "in-progress"}
}
```

The event is a fact about a committed change. Do not publish an event before the write has a durable outcome. Otherwise a client may render a state that the database later rejects. Committing the database row and publishing separately also creates a dual-write loss window. A process can commit the row and crash before it publishes. A transactional outbox records the row and an outbox entry in one database transaction, while change-data capture can stream committed changes to the event path. Read [asynchronous processing](/system-design/asynchronous-processing/) for the related queue and retry trade-offs.

## Polling pays for waiting

Short polling keeps the existing request-response model. The browser asks `GET /boards/412/changes` every few seconds. The server returns a change or an empty result.

Polling is a sound choice for low-frequency updates, internal tools, and systems where a small delay does not matter. It also gives you a simple recovery path because each request can fetch current state.

Polling has two predictable costs:

- If changes arrive uniformly, the average wait is half the polling interval. A three-second interval therefore has an average wait of about 1.5 seconds. Bursty changes do not follow that average.
- Request work scales with connected clients, not with the number of changes. Ten thousand open boards still create ten thousand polling schedules when no task moves.

Each poll can pass through a load balancer, authentication, logging, application code, serialization, and a database or cache. A shorter interval lowers visible delay but increases that work. On mobile devices, repeated network activity can also wake the radio and consume data.

The useful quantity is the event, not the empty request. Long polling and persistent streams reduce empty requests by keeping a request or connection available while the server waits.

## Long polling reduces empty responses

Long polling starts as a normal request. The server holds it until an event is ready or a timeout expires. It then returns the event, closes the response, and the client opens another request.

The client and server have a reconnect gap. The client must process the response and create the next request. A change can occur during that gap. Long polling does not inherently lose that change. A cursor, event ID, or fresh snapshot can make the gap recoverable. Without one, the implementation has no reliable way to know what the client missed. [RFC 6202](https://www.rfc-editor.org/rfc/rfc6202) describes long polling and its relationship to other HTTP-based push techniques.

Long polling still creates request setup and teardown work. It also keeps many HTTP requests in flight. It is useful when infrastructure handles ordinary HTTP better than long-lived streams, or when the protocol does not support a persistent event connection.

## SSE keeps one HTTP response open

SSE keeps one HTTP response open and sends events as lines of UTF-8 text. The server responds with `Content-Type: text/event-stream` and separates events with a blank line.

```text
id: 1043
event: task.moved
data: {"taskId":"task_7","column":"in-progress"}

```

The standard event fields are `event`, `data`, `id`, and `retry`. The browser's `EventSource` API can reconnect after a broken stream. When the server supplies IDs, the browser sends the last received ID in `Last-Event-ID` on reconnect. The server can then replay events after that ID if it retains them. See the [HTML server-sent events specification](https://html.spec.whatwg.org/multipage/server-sent-events.html).

SSE is one-way on that stream. The server sends updates to the browser. The browser sends a task move through a separate `POST` request. That split works well for notifications, progress output, dashboards, and token streaming. It is often the clearest design when upstream writes do not need a persistent channel.

Do not choose SSE because WebSockets sound more advanced. Choose it when one-way delivery, native browser reconnect behavior, and ordinary HTTP compatibility are the right constraints.

## WebSockets add a bidirectional stream

WebSockets let both sides send messages on one persistent connection. A browser can send a task move and receive another user's change without opening a second request for each message.

The classic browser handshake uses HTTP/1.1. The client sends a `GET` with `Upgrade: websocket` and a random `Sec-WebSocket-Key`. The server returns `101 Switching Protocols` with a derived `Sec-WebSocket-Accept` value. After the handshake, the connection carries WebSocket frames rather than HTTP methods, headers, and status codes. The [WebSocket protocol specification](https://www.rfc-editor.org/rfc/rfc6455) defines the frame format. HTTP/2 uses the extended `CONNECT` method described in [RFC 8441](https://www.rfc-editor.org/rfc/rfc8441).

Frames carry an opcode, a payload length, and message-boundary bits. Text, binary, continuation, close, ping, and pong frames have different opcodes. Small frames have compact headers. That avoids repeating full HTTP headers for every event, but the application still pays for the open connection, buffers, TLS, and any framework objects attached to it.

Browsers mask client-to-server frames with a fresh random key. Masking does not encrypt the message. TLS provides confidentiality. Masking prevents an intermediary from treating attacker-chosen bytes inside a browser WebSocket stream as a new HTTP request.

Ping and pong frames provide a liveness check. A server can send a ping and close the connection when the pong does not arrive before its configured deadline. The WebSocket specification defines the control frames. It does not require a universal 30-second timeout. Pick the interval and deadline with the network path, proxy idle timeouts, and resource cost in mind.

## Resume after a broken connection

TCP can report a connection error, but it cannot tell the application which domain events the client has rendered. A phone can change from Wi-Fi to cellular, a laptop can sleep, and a proxy can close an idle connection. The server may see an idle socket for a while, and an idle socket does not prove that the user is still reachable.

Use heartbeats to detect dead connections and free their resources. Use application-level event IDs to recover the data gap. These solve different problems.

![A client reconnects with its last received event ID](/images/system-design/vector/realtime-connection-lifecycle.svg)

The usual sequence is:

1. Fetch a consistent snapshot.
2. Open a stream from a known cursor.
3. Apply events in sequence order.
4. Store the last event ID after the client applies it.
5. Reconnect with that ID after a disconnect.
6. Replay events after the ID, or return a new snapshot when the replay window has expired.

The snapshot and event log need a clear consistency rule. If the snapshot ends at sequence `100`, the stream must start at `101` or later. If the server cannot provide that boundary, the client can render duplicates or miss a change.

Use exponential backoff with jitter for reconnect attempts. A fixed immediate retry can turn one outage into a reconnect storm. When many clients reconnect after one instance fails, cache the small bootstrap data that clients need at the edge when that data can remain safely stale. Keep authorization and the source of truth at the origin.

## Persistent connections have a resource budget

An open connection consumes more than application heap. The operating system stores socket state and accounts for a file descriptor. The runtime may allocate a task, read and write buffers, timers, and TLS state. A process limit, an OS limit, and the runtime's event mechanism can all cap connections.

Inspect the actual environment. Do not use a single experiment as a universal capacity claim. A load generator can fail first because its own ephemeral source-port range is exhausted, even while the server has file descriptors and memory available. A TCP connection is identified by the source address, source port, destination address, and destination port. Multiple source addresses can increase a test client's available tuples.

Measure at least these limits:

- process and OS file-descriptor limits;
- ephemeral port ranges on load generators;
- process heap and native memory per connection;
- kernel socket memory;
- TLS and buffer costs;
- CPU used by parsing, encryption, heartbeats, and fan-out;
- proxy and load-balancer connection or idle-time limits.

An experiment that reports about 9.7 KB of heap per idle connection describes that program, runtime, buffer configuration, and measurement method. It does not describe every WebSocket server. Event-driven runtimes can avoid one heavyweight task per connection, but they still need memory and kernel state for each socket.

## Scale delivery across instances

A persistent connection has connection affinity. One process owns the socket and its in-memory subscription. A load balancer can send a second browser to another instance. That instance cannot write to the first browser's socket by reading its own memory.

Each subscription maps a connection to a topic or query, such as `board:412`. Horizontal scaling adds instances, but it does not move those local subscriptions. The event path must reach every instance that owns a matching connection.

![Publish and subscribe fan-out across real-time instances](/images/system-design/vector/realtime-pubsub-fanout.svg)

Sticky sessions keep a reconnecting client near its old instance. They can reduce connection movement, but they do not make the other instances aware of that connection. They also make failover harder. Keep the connection local and share events through a broker or another coordination layer.

The flow looks like this:

1. Instance 1 validates and commits the task move.
2. Instance 1 publishes an event for `board:412`.
3. Each subscribed instance receives the event.
4. Each instance finds its local connections subscribed to `board:412`.
5. Each instance writes the event to those sockets.

Redis Pub/Sub, NATS, and Kafka can fill different versions of this role. Redis Pub/Sub provides at-most-once delivery, as the [Redis delivery-semantics documentation](https://redis.io/docs/latest/develop/pubsub/#delivery-semantics) states. If an instance is disconnected when the message is published, that message is gone. A durable stream or log can retain messages and acknowledge consumption, but it adds storage, retention, replay, and duplicate-delivery behavior.

Treat the broker as transport, not as an authorization decision. Each instance must check that the local connection is allowed to receive the topic. Read [authorization](/backend/security/authorization/) for the access-control model. Authenticate when the connection opens, authorize each subscription, and define what happens when a user's permissions change.

## Fan-out is the expensive operation

If 30,000 clients watch one board, one committed change may require 30,000 socket writes. The rough work is proportional to:

```text
events × matching subscribers
```

The broker removes process affinity. It does not remove the writes. Partition the work by recipient ownership, topic, or connection shard when one instance cannot keep up. Track queue depth and write latency for each connection group.

Slow clients need an explicit policy. Bound each client's pending buffer. Drop intermediate state updates when a later snapshot makes them irrelevant, or disconnect the client and let it resume from a cursor. Never let one stalled socket consume unbounded memory for every other client.

This is application-level backpressure. Measure the pending queue and write latency, then choose whether to slow the producer, coalesce state, or disconnect the consumer.

## Choose delivery semantics deliberately

Real-time UI code often combines several semantics. A task move can be optimistic in the local browser, durable in the database, and eventually visible to other browsers. Those are separate states.

| Need | Practical choice | Main cost |
| --- | --- | --- |
| Infrequent updates and simple recovery | Short polling | Empty requests and interval delay |
| Push-like updates through ordinary HTTP | Long polling | Request churn and reconnect gaps |
| Server-to-client stream | SSE | Client-to-server writes use another request |
| Messages in both directions | WebSockets | Connection lifecycle, scaling, and proxy limits |
| Guaranteed recovery after disconnect | Event IDs plus replay log | Retention, cursors, and duplicate handling |
| Many instances with local sockets | Pub/sub broker | Fan-out and broker operations |
| Offline or slow clients | Snapshot plus cursor | State reconciliation and replay policy |

Make retries safe. A lost acknowledgement can cause a client to send the same write again. Use an idempotency key for operations where a duplicate has side effects. See [methods and idempotency](/backend/api-design/methods-and-idempotency/) and [reliability and failure](/system-design/reliability/) for request retry rules.

Ordering needs a scope. TCP preserves bytes on one connection. It does not give one total order across all instances, topics, or clients. If board `412` needs ordered changes, assign a sequence at the board's write owner or another serialized point. Include the sequence in every event. When two clients edit the same logical value, define a conflict rule. Presence and collaborative editing need extra models for online state, concurrent writes, and cursor or document reconciliation.

## Real-time is a product contract

Before choosing a protocol, write down the user-visible contract:

- What delay is acceptable?
- Which events may be dropped or coalesced?
- Must a reconnect replay every event, or only reach a current snapshot?
- What happens when the user is offline?
- Which writes are optimistic, and how does the client show rejection?
- What order must each client observe?
- How does the server authorize a connection and each topic?
- What happens to a slow client?

Once those answers are explicit, the protocol is a narrower decision. Polling may be enough. SSE may be the cleanest choice. WebSockets may be necessary for bidirectional interaction. A durable event log may matter more than either protocol when the client must recover every committed change.

For the surrounding system, connect this page to [load balancing](/system-design/load-balancing/), [availability and consistency](/system-design/availability-and-consistency/), [caching](/system-design/caching/), and [concurrency](/backend/concurrency/). Those pages cover the edge routing, state guarantees, cache behavior, and execution models that determine whether a real-time path remains healthy under load.
