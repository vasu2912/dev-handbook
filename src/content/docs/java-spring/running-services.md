---
title: Running a Spring Boot service
description: Package, start, stop, diagnose, and upgrade a Spring Boot service with deliberate runtime limits.
---

A deployable service needs more than a successful build. It must start with the intended configuration, accept traffic only when ready, stop without abandoning ordinary work, and leave enough evidence to explain failure. The Java 21 runtime and Spring Boot 4.0 application participate in that contract together.

## The artifact and configuration are separate

Boot's Maven and Gradle plugins package executable jars with application dependencies. `java -jar service.jar` launches that artifact with its embedded server. Boot 4 removed embedded Unix launch-script support for fully executable jars, not ordinary executable jars launched by Java.

A container image adds the runtime and operating-system dependencies. Boot supports Dockerfiles and Cloud Native Buildpacks. Buildpacks reduce hand-maintained runtime setup. A Dockerfile gives more control but makes base-image updates and process behavior your responsibility. In either case, use reproducible versions, run without unnecessary privileges, and keep credentials out of image layers.

Promote the same built artifact between environments. Supply environment-specific URLs, credentials, and limits externally through the configuration mechanisms described in [configuration](/java-spring/configuration/). A profile name is not a secret-management system. Validate required configuration at startup rather than accepting traffic with a missing dependency setting.

## Startup is not readiness

During startup, Spring creates the context and initializes the application. Database migrations and `ApplicationRunner` or `CommandLineRunner` work can delay readiness even after the web server has started. A listening port or a startup log line is therefore insufficient evidence that the service can take traffic.

Keep essential initialization bounded and fail startup on unrecoverable configuration errors. Long-running imports and recurring work belong outside startup. Boot's startup tracking can identify expensive initialization steps when the delay is inside the context rather than a remote dependency.

Readiness is a signal for a configured router or orchestrator. It does not remove traffic from an arbitrary load balancer by itself. Liveness informs restart decisions. Give slow startup enough time without masking a process that never becomes ready, and ensure probes exercise the application listener where possible. Shared dependency failure should not trigger a restart loop across all instances.

## Shutdown needs time and signal delivery

Boot 4.0 enables graceful shutdown by default for its supported embedded servers. Closing the context stops new requests and permits in-flight requests to finish within the configured grace period. `spring.lifecycle.timeout-per-shutdown-phase` controls each shutdown phase, not one universal deadline for every activity.

The process must receive `SIGTERM`. A launcher that swallows signals or a supervisor that kills the process immediately defeats graceful shutdown. The surrounding termination budget must cover traffic withdrawal and application shutdown phases.

HTTP draining does not make background work durable. Consumers and executors need coordinated stop behavior. Work that can outlive the grace period needs durable state and safe redelivery, not an assumption that shutdown always finishes it.

### Follow one deployment through its lifecycle

The diagram describes a deployment whose router is explicitly configured to honor readiness or target deregistration. The withdrawal step belongs to that platform. Boot controls its own availability state and server shutdown, not every upstream connection.

<figure>
<div data-anatomy="java-spring--running-services-1"></div>
<figcaption>One deliberate sequence. Some platforms begin withdrawal and signal delivery concurrently; verify their actual termination contract.</figcaption>
</figure>

For a local lifecycle exercise, assume `service.jar` is a Java 21, Boot 4.0 MVC application with `spring-boot-starter-actuator`. Supply its required application and database settings separately. Save this properties fragment in `runtime/application-prod.properties`. Keep credentials out of that file if it is version controlled.

```properties
server.shutdown=graceful
spring.lifecycle.timeout-per-shutdown-phase=20s
management.endpoints.web.exposure.include=health
management.endpoint.health.probes.enabled=true
management.endpoint.health.probes.add-additional-paths=true
```

This makes `/readyz` and `/livez` available on the application port. The application's security policy must allow the intended probe caller without exposing sensitive health details. Start the artifact in a POSIX shell; the captured PID belongs to this Java process.

```sh
java -Xmx512m -XX:NativeMemoryTracking=summary -jar service.jar \
	--spring.config.additional-location=file:./runtime/ \
	--spring.profiles.active=prod &
SERVICE_PID=$!
curl -i http://localhost:8080/readyz
```

Before the listener starts, the connection can fail. While the application is refusing traffic, readiness returns HTTP 503. After startup work completes and readiness accepts traffic, the expected response is HTTP 200 with `{"status":"UP"}`. These are expected states, not captured output. Polling only after startup may miss the brief 503 state entirely. A probe timeout also needs a policy at the router.

In the same shell, terminate the local process and wait for it to exit:

```sh
kill -TERM "$SERVICE_PID"
wait "$SERVICE_PID"
```

The expected outcome is that the embedded server stops accepting new requests while already accepted work can finish within the 20-second HTTP shutdown phase. Requests longer than that are not guaranteed to finish. Server logs can report drain completion, but they do not prove that every client received its response. Check client results as well as server logs when exercising in-flight work.

This local sequence has no load balancer. For a deployment, confirm target withdrawal in the actual router before treating termination as safe. An illustrative outer budget is 45 seconds: 10 seconds for withdrawal propagation, 20 seconds for HTTP draining, and 15 seconds for other shutdown work and margin. If several lifecycle phases each consume their full timeout, 45 seconds may be insufficient. Measure the complete termination path.

## Memory limits cover more than the heap

On Linux, Java 21 HotSpot recognizes container memory and processor limits by default. `-Xmx` caps the heap. It does not cap total process memory. Metaspace, code cache, direct buffers, native libraries, and platform-thread stacks also need space.

Leave measured headroom below the container limit. A container can kill the process even when heap usage looks healthy. CPU quotas can also extend pauses and request latency without increasing application work. More threads cannot create more CPU or database capacity.

The following is an illustrative planning budget for a container limited to 1,024 MiB. Only the heap row is capped by the example's JVM flag. The other rows are allowances to check under load, not JVM reservations or promised maxima.

| Memory category | Allowance | What consumes it |
| --- | ---: | --- |
| Java heap, `-Xmx512m` | 512 MiB | Live objects and allocation space |
| Metaspace | 128 MiB | Class metadata and class loaders |
| JIT code cache | 64 MiB | Compiled machine code |
| Other native memory | 128 MiB | Thread stacks, direct buffers, JVM and native libraries |
| Unallocated margin | 192 MiB | Peaks and memory charged to the container outside these estimates |
| Container total | 1,024 MiB | All categories, not just the heap |

Suppose heap usage is 420 MiB but container memory reaches 990 MiB. That is evidence of little container headroom, not proof of a Java heap leak. Increasing `-Xmx` reduces the remaining allowance and may make the next container kill more likely. Compare the container's memory measurements with JVM heap and native-memory evidence.

Use thread dumps to inspect repeated blocking and contention, Java Flight Recorder for time-based CPU and allocation evidence, and heap analysis for retained objects. `jcmd` exposes commands such as `Thread.print`, `JFR.start`, and `GC.heap_dump` for an authorized local process. Heap dumps can pause the JVM, consume substantial disk space, and contain secrets. Restrict access and retention. Native Memory Tracking must be enabled before it can explain JVM native-memory categories.

The earlier launch enables Native Memory Tracking at summary level. In that shell, these Java 21 diagnostic commands inspect the same process. They require a compatible JDK tool installation and permission to attach.

```sh
jcmd "$SERVICE_PID" GC.heap_info
jcmd "$SERVICE_PID" VM.native_memory summary scale=MB
```

Run them before terminating the service. Native Memory Tracking distinguishes reserved address space from committed memory. It does not account for every third-party native allocation, and its totals are not the same measurement as container RSS or cgroup memory. Use container-level evidence for the enforced limit.

## Upgrades change runtime behavior too

Upgrade through supported release lines and read their migration guides. For Boot 3 to 4, first update to the latest 3.5 maintenance release and remove deprecated API use. Boot 4 changes module and package structure, uses Framework 7, and raises the servlet baseline to 6.1.

Verify configuration binding, database migrations, authentication, readiness, and shutdown against the actual artifact. Recheck memory and latency under representative load after changing the JDK, server, or persistence provider. Keep rollback compatible with already-applied schema changes. An older jar cannot undo an incompatible database migration.

Continue with [observability](/java-spring/observability/) and [asynchronous work](/java-spring/async-jobs/).

## Sources

- [Container images](https://docs.spring.io/spring-boot/4.0/reference/packaging/container-images/index.html)
- [Graceful shutdown](https://docs.spring.io/spring-boot/4.0/reference/web/graceful-shutdown.html)
- [Application availability and probes](https://docs.spring.io/spring-boot/4.0/reference/actuator/endpoints.html)
- [Java 21 runtime options](https://docs.oracle.com/en/java/javase/21/docs/specs/man/java.html) and [diagnostic commands](https://docs.oracle.com/en/java/javase/21/docs/specs/man/jcmd.html)
- [Spring Boot 4.0 migration guide](https://github.com/spring-projects/spring-boot/wiki/Spring-Boot-4.0-Migration-Guide)
