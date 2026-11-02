---
title: Containers and Kubernetes
description: Explain images, Linux isolation, volumes, Compose, Pods, Deployments, Services, probes, and resource limits.
---

A container runs a process with isolation and resource controls. An image packages its filesystem and startup configuration. A virtual machine supplies a guest operating system. Linux containers normally share the host kernel; Docker Desktop commonly provides that kernel through a virtual machine.

## Images and runtime state

Image layers support reuse and caching. A container adds writable runtime state, but replacing the container can discard that state. Volumes provide a separate storage lifecycle. Bind mounts expose a host path and carry its environment-specific assumptions.

A multi-stage build separates compilation tools from the final runtime image. Secrets copied into an earlier image layer can remain recoverable even after a later layer deletes them. Supply secrets through an appropriate runtime or build-secret mechanism.

```dockerfile
FROM eclipse-temurin:21-jre
WORKDIR /app
COPY --chown=10001:10001 app.jar /app/app.jar
USER 10001:10001
ENTRYPOINT ["java", "-jar", "/app/app.jar"]
```

This illustrative runtime image expects an already-built executable JAR. It does not compile the project. Production builds need an explicit image update policy and can pin a digest for reproducibility. The process must handle termination and have any required writable directories provisioned deliberately.

Docker Compose describes a group of local services, networks, and volumes. Startup order alone does not prove that a database is ready for queries.

## Kubernetes objects

| Object                | Responsibility                                                          |
| --------------------- | ----------------------------------------------------------------------- |
| Pod                   | One or more containers sharing a scheduling and network context         |
| Deployment            | Manages replaceable application replicas and rollout                    |
| Service               | Stable discovery and routing to selected endpoints                      |
| ConfigMap             | Non-secret configuration                                                |
| Secret                | Sensitive configuration object requiring access and storage protections |
| PersistentVolumeClaim | Request for persistent storage                                          |

A Secret's base64 representation is encoding, not encryption. Restrict access and configure the cluster's storage protections.

## Health and capacity

Readiness controls whether an instance should receive traffic. Liveness determines when restarting may help. A startup probe gives slow initialization a separate allowance. Making liveness fail whenever a database is down can trigger a restart storm without repairing the database.

Resource requests inform scheduling. Limits constrain consumption, with different CPU and memory enforcement behavior. JVM heap is only part of process memory. Autoscaling needs a useful signal, warmup capacity, and dependencies capable of accepting the extra load.

Read [running Spring services](/java-spring/running-services/) for shutdown and memory behavior, and [networking](/runtime/networking/) for connection lifecycle.

## Sources

- [Docker: containers](https://docs.docker.com/get-started/docker-concepts/the-basics/what-is-a-container/)
- [Docker: multi-stage builds](https://docs.docker.com/build/building/multi-stage/)
- [Kubernetes: workload resources](https://kubernetes.io/docs/concepts/workloads/)
- [Kubernetes: probes](https://kubernetes.io/docs/concepts/configuration/liveness-readiness-startup-probes/)
- [Kubernetes: resource management](https://kubernetes.io/docs/concepts/configuration/manage-resources-containers/)
