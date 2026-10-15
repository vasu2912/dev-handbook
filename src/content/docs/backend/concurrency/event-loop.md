---
title: Event loop
description: See how one thread interleaves many I/O tasks with callbacks, and why blocking the loop stalls every request.
sidebar:
  order: 4
---

An event loop runs one thread that repeatedly checks for work and invokes callbacks. When a task starts a database query or another I/O operation, it registers what to run when the result is ready and gives control back to the loop.

```text
run task -> start I/O -> register callback -> run another task
                                      ^
                         I/O completes, callback becomes ready
```

Operating systems expose readiness mechanisms such as `epoll` on Linux, `kqueue` on macOS, and `IOCP` on Windows. The runtime uses them to learn which sockets can make progress, then runs the associated callbacks.


<div data-anatomy="backend--concurrency--event-loop-1"></div>


## Why one thread can hold many tasks

The event loop has one execution stack and does not switch between OS threads. Each waiting task stores a small amount of continuation state rather than a full OS thread stack. Thousands of I/O-bound tasks can therefore remain in flight with low scheduling overhead.

The trade-off is strict. A CPU-heavy callback blocks the only loop thread. Every other request waits until that callback returns. Keep callbacks short and move expensive computation to a worker thread or process.

## `async` and `await` express callbacks

Callback style makes the control handoff visible:

```javascript
db.query("SELECT * FROM users", userId, function (err, user) {
	if (err) throw err;
	sendResponse(user);
});
```

`async` and `await` flatten the same control flow:

```javascript
async function handleRequest(req) {
	const user = await db.query("SELECT * FROM users", req.userId);
	sendResponse(user);
}
```

At `await`, the function yields. The runtime stores the continuation and resumes it when the promise settles. The function looks synchronous, but the event loop remains available to other tasks.

An async function can be understood as a state machine. Each `await` is a state transition, and the code after it is the continuation for the I/O operation. If the thread blocks on synchronous CPU work, the state machine cannot advance and every in-flight request stalls.

Compare this model with [goroutines](/backend/concurrency/goroutines/) and [threads](/backend/concurrency/threads/).
