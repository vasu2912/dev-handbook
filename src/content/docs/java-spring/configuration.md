---
title: Configuration and profiles
description: Resolve deployment settings predictably, bind them to validated types, and keep secrets and business rules separate.
---

External configuration lets the same artifact run in different environments. Spring Boot combines several property sources into an `Environment`, then binds values to application objects. A value in `application.yaml` is a candidate, not necessarily the effective value.

## Precedence explains the value that wins

For common production sources in Boot 4.0, command-line options override Java system properties, which override environment variables, which override configuration files. This is a subset of the full order. `SPRING_APPLICATION_JSON`, servlet sources, and test-specific sources have their own positions.

Within the normal configuration-file search, external files override packaged files. Profile-specific files override non-profile files at the same location level. If several active profiles define the same property, their order matters. Use the documented location and import rules when extending the search rather than assuming all files merge equally.

These two partial files define the same property. Assume they are packaged at the same location, with no other configuration sources supplying `receipts.batch-size`.

`application.yaml`:

```yaml
receipts:
  sender: receipts@example.test
  batch-size: 20
```

`application-prod.yaml`:

```yaml
receipts:
  batch-size: 100
```

Each row below is a separate process launch. `app.jar` stands for the packaged application, and the shell environment is otherwise clear of these settings.

| Launch | Effective `receipts.batch-size` | Winning source |
| --- | --- | --- |
| `java -jar app.jar` | `20` | Base YAML |
| `java -jar app.jar --spring.profiles.active=prod` | `100` | Production-profile YAML |
| `RECEIPTS_BATCHSIZE=60 java -jar app.jar --spring.profiles.active=prod` | `60` | Environment variable |
| `RECEIPTS_BATCHSIZE=60 java -jar app.jar --spring.profiles.active=prod --receipts.batch-size=8` | `8` | Command-line option |

For environment binding, replace dots with underscores, remove hyphens, and uppercase the name. Thus `receipts.batch-size` becomes `RECEIPTS_BATCHSIZE`, not `RECEIPTS_BATCH_SIZE`. Activating `prod` selects a file. It does not make that file outrank environment variables. The `sender` value remains `receipts@example.test` in every row.

`spring.config.location` replaces the default search locations. `spring.config.additional-location` adds locations. Confusing the two can remove the defaults that the deployment expected. List properties also replace the complete list when a higher-priority source supplies one. They do not merge element by element.

When a value is unexpected, find its winning source before editing another file. Actuator's `env` and `configprops` endpoints can assist diagnosis when configured, but they are administrative data and require restricted access. Do not expose them publicly or remove value sanitization to make debugging convenient.

## Bind a configuration contract

Use `@ConfigurationProperties` for a related group of settings instead of scattering string lookups across services. Binding performs type conversion and gives the application a stable Java contract. Configuration objects should describe deployment settings, not look up business data or inject services.

This record fragment binds the settings above. It assumes `ConfigurationProperties` from Boot, `Validated` from Spring, and constraints from `jakarta.validation.constraints`:

```java
@ConfigurationProperties("receipts")
@Validated
public record ReceiptProperties(
	@NotBlank String sender,
	@Min(1) @Max(1000) int batchSize
) {}
```

Register this type through `@ConfigurationPropertiesScan` or `@EnableConfigurationProperties(ReceiptProperties.class)` on a configuration class. The annotation alone does not register the record. A record with its ordinary canonical constructor does not need `@ConstructorBinding` in Boot 4.0. Constructor binding is not the same mechanism as constructing a regular `@Component` or calling an `@Bean` factory method.

A Bean Validation implementation must be present, commonly through `spring-boot-starter-validation`. `@Validated` activates configuration validation. Nested values need `@Valid` for cascading validation and `@NotNull` when the nested value itself is required. Invalid required settings should fail startup rather than wait for the first request.

With the production profile and no overrides, the registered bean contains `sender = "receipts@example.test"` and `batchSize = 100`. In a consumer that receives `ReceiptProperties properties` through its constructor, `properties.batchSize()` returns the integer `100`, not the string `"100"`.

Now launch with a syntactically valid integer that violates the contract:

```sh
RECEIPTS_BATCHSIZE=0 java -jar app.jar --spring.profiles.active=prod
```

With the type registered and a validation implementation present, startup fails during configuration binding. This diagnostic is **illustrative**, not verbatim Boot output:

```text
Could not bind receipts to ReceiptProperties
Property: receipts.batch-size
Value: 0
Constraint: must be greater than or equal to 1
Outcome: application context startup fails
```

The valid `100` in the profile does not act as a fallback. Boot resolves the winning value first, then converts and validates it. `RECEIPTS_BATCHSIZE=many` instead fails integer conversion before a valid record can be supplied. Neither failure should wait until a receipt job runs.

Use explicit units for operational values. A `Duration` bound from `5s` communicates more than an integer whose unit is hidden in a client builder. Defaults are appropriate only when absence has a safe, intentional meaning.

## Profiles select deployment configuration

Profiles select bean definitions and property documents. They fit differences such as local infrastructure and a deployed service endpoint. The `spring.profiles.active` setting itself follows property-source precedence and cannot be declared inside a profile-specific document.

Avoid branching on `environment.acceptsProfiles(...)` inside a business service. Eligibility, pricing, and authorization rules need explicit domain inputs or policy dependencies, not deployment names. Many overlapping profiles also create combinations that nobody exercises. Prefer a small set of named deployment choices and typed settings for independent operational values.

## External does not mean secret

Moving a password out of source code does not protect it by itself. Environment variables can leak through diagnostics, process tooling, or deployment configuration. Command-line secrets can appear in process arguments and shell history.

Use the deployment platform's secret distribution with appropriate access controls. Boot can import mounted secret files through `configtree:`. The property source does not encrypt those files or provide rotation automatically. Required secrets should not have working development credentials as production defaults.

Keep secrets out of logs, exception messages, and generated configuration-object `toString` output. A validated configuration record is still ordinary application data once constructed.

Continue with [Spring Boot](/java-spring/spring-boot/), [beans](/java-spring/beans/), and [running services](/java-spring/running-services/).

## Sources

- [Boot 4.0 externalized configuration](https://docs.spring.io/spring-boot/4.0/reference/features/external-config.html)
- [Configuration-properties validation](https://docs.spring.io/spring-boot/4.0/reference/features/external-config.html#features.external-config.typesafe-configuration-properties.validation)
- [Profiles](https://docs.spring.io/spring-boot/4.0/reference/features/profiles.html)
- [Configuration trees](https://docs.spring.io/spring-boot/4.0/reference/features/external-config.html#features.external-config.files.configtree)
