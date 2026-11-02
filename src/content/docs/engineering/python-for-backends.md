---
title: "Python for AI backends"
description: "The Python that AI backend and agentic AI interviews actually test: async, the GIL, typing, Pydantic, and FastAPI service design."
---

Agentic AI engineering runs on Python. The model SDKs, agent frameworks, PyTorch, and vLLM are Python-first, so coding rounds for AI-adjacent backend roles usually are too. This page covers the Python that interviews test, with the same emphasis on mechanisms and failure modes as the rest of the handbook.

## Async: one thread, many waits

Python's asyncio runs coroutines on an event loop, the same model as the [Node event loop](/backend/concurrency/event-loop/). Coroutines yield control at `await` points. The loop interleaves them, so one process can hold thousands of open connections: LLM streams, database calls, HTTP clients.

The failure modes are also the same, plus a few:

- **One blocking call freezes every request.** `time.sleep`, a synchronous database driver, or CPU-heavy work inside a coroutine stalls the loop. Run blocking work in an executor (`asyncio.to_thread` or a process pool), and pick async-native libraries: `httpx.AsyncClient`, `asyncpg`, `redis.asyncio`.
- **Cancellation is an exception.** When a request is cancelled or times out, the loop throws `asyncio.CancelledError` into the coroutine. It inherits from `BaseException`, so a broad `except Exception:` swallows it and leaves tasks running. Catch `CancelledError` separately, clean up, and re-raise.
- **`asyncio.TaskGroup`** (Python 3.11+) gives structured concurrency: child tasks are cancelled when one fails, so nothing leaks.
- **Async generators** drive token streaming. An LLM streaming endpoint is an async generator of chunks piped into a server-sent events response.

## The GIL and free-threaded Python

The GIL lets only one thread execute Python bytecode at a time. Threads still help with I/O concurrency, but CPU-parallel work needs processes (`multiprocessing`), C extensions that release the GIL, or, since Python 3.14, a build without a GIL at all.

Free-threaded CPython follows PEP 703 and is officially supported as of Python 3.14 (PEP 779), with single-threaded performance within roughly 5 to 10 percent of the standard build. The catch for backends: native extensions and libraries must be audited and rebuilt for thread safety, so most deployments still run the GIL build. Multiple interpreters per process (PEP 734) offer a middle path with opt-in sharing.

Interview framing: name the three escapes from the GIL (processes, releasing extensions, free-threading), then say which one your workload picks and why.

## Typing and validation

Python types are optional, gradual, and checked by external tools (mypy or pyright), not at import time. What makes types load-bearing in an AI backend is validation at boundaries:

- **Pydantic** models validate request bodies, configuration, and tool arguments, and generate JSON Schema from the same classes.
- **Structured output round-trips through Pydantic.** Declare the tool or response schema as a Pydantic model, pass its schema to the model API, and validate every response before use. The [structured output](/agentic-ai/foundations/generation-and-structured-output/) contract and the type system line up.
- **Config via Pydantic Settings** fails at startup with a named missing variable, not at 2am with a `None` deep in a call chain.

Python 3.14 made this smoother with deferred annotation evaluation (PEP 649), removing the old forward-reference string dance.

## FastAPI and the service boundary

FastAPI is the default Python HTTP framework for AI services: ASGI-based, async, with dependency injection and automatic OpenAPI schemas. Interviews probe how a FastAPI service grows up:

- **Dependencies** carry database sessions, auth context, and clients. Request-scoped dependencies substitute cleanly in tests.
- **Background work needs a broker, not `BackgroundTasks`.** `BackgroundTasks` runs in the same process after the response, which is fine for a log write and wrong for a job that must survive a deploy. Long work goes to a queue with workers, the same rule as any [asynchronous processing](/system-design/asynchronous-processing/) design.
- **Worker count and the loop.** Uvicorn runs one event loop per worker process. CPU-bound work in a request blocks that loop, so scale with workers and offload heavy steps.
- **Streaming responses** use SSE from an async generator, which is how token streaming and agent progress reach the browser. See [real-time backends](/system-design/real-time-backends/).

## Packaging and environments

Tooling moved to `uv` for dependency resolution and lockfiles, with `pyproject.toml` as the project file. Pin the interpreter, lock dependencies, and build slim Docker images; AI dependency trees are large and reproducibility matters when a vulnerability advisory lands. The [containers](/engineering/containers-and-kubernetes/) rules apply unchanged.

## The questions interviews ask

- Why does one `time.sleep` in a route handler take down a whole worker?
- Where do requests actually run in parallel with the GIL, and where only concurrently?
- What happens to an in-flight task when a client disconnects, and what does your `except` block do to it?
- How do Pydantic models, JSON Schema, and LLM structured output connect?
- Why is `BackgroundTasks` not a job system?

## Sources

- [Python asyncio documentation](https://docs.python.org/3/library/asyncio.html)
- [PEP 703: Making the Global Interpreter Lock Optional](https://peps.python.org/pep-0703/)
- [PEP 779: Free-threaded Python is officially supported](https://peps.python.org/pep-0779/)
- [What's new in Python 3.14](https://docs.python.org/3.14/whatsnew/3.14.html)
- [Pydantic documentation](https://docs.pydantic.dev/latest/)
- [FastAPI documentation](https://fastapi.tiangolo.com/)

*Last verified: October 17, 2026.*
