---
title: Testing Spring applications
description: Choose tests that expose business, HTTP, security, and database failures without loading Spring for every assertion.
---

A Spring context is useful when the behavior depends on Spring. It adds little to a pricing rule or state transition that can run as ordinary Java. The useful distinction is which real boundary a test exercises, not how many annotations it carries.

## Start with the behavior you can isolate

The smallest useful test reaches the boundary where the suspected failure lives. More infrastructure does not automatically make the assertion stronger.

| Test boundary | Real behavior exercised | What it cannot establish |
| --- | --- | --- |
| Plain Java service | Business decisions and state transitions | Spring proxies, JSON, SQL |
| MVC slice with `MockMvc` | Routing, binding, validation, response serialization, included filters | Socket behavior or omitted application configuration |
| Service proxy with PostgreSQL | Transaction completion, constraints, actual JDBC writes | Production contention or HTTP behavior |
| Full context with `RANDOM_PORT` | Real HTTP listener and configured application path | External production systems replaced by fixtures |

Mocks describe responses you chose. They cannot prove that a repository query works, JSON maps correctly, or a transaction rolls back. Replacing every collaborator in a `@SpringBootTest` often pays the context startup cost while testing little integration.

### A shipping threshold without Spring

This complete service uses cents and adds a 500-cent delivery fee below a 5,000-cent subtotal. Save it as `src/main/java/example/PricingService.java`. The MVC example below reuses the same class.

```java
package example;

public class PricingService {
	public long totalCents(long subtotalCents) {
		if (subtotalCents < 0) {
			throw new IllegalArgumentException("Subtotal must not be negative");
		}
		return subtotalCents < 5_000 ? subtotalCents + 500 : subtotalCents;
	}
}
```

Save this complete test as `src/test/java/example/PricingServiceTest.java`. It needs JUnit Jupiter and AssertJ, both supplied by `spring-boot-starter-test`. No application context or helper fixture is required.

```java
package example;

import org.junit.jupiter.api.Test;
import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;

class PricingServiceTest {
	private final PricingService pricing = new PricingService();

	@Test
	void deliveryBecomesFreeAtTheThreshold() {
		assertThat(pricing.totalCents(4_999)).isEqualTo(5_499);
		assertThat(pricing.totalCents(5_000)).isEqualTo(5_000);
	}

	@Test
	void negativeSubtotalIsRejected() {
		assertThatThrownBy(() -> pricing.totalCents(-1))
			.isInstanceOf(IllegalArgumentException.class);
	}
}
```

The boundary assertions fail if `<` becomes `<=`. The rejection assertion fails if a negative subtotal becomes a payable quote. Neither assertion repeats a mock's configured answer.

## Slices exercise framework boundaries

`@WebMvcTest` loads MVC infrastructure and selected web components, not the whole service layer. With `MockMvc`, it can exercise routing, conversion, validation, serialization, advice, and included security filters without opening a socket. Supply controller collaborators with focused imports or Spring Framework's `@MockitoBean`.

A slice is not proof that production configuration was discovered. Explicitly include the application's security configuration when testing its rules. Do not disable filters merely to make requests pass. Cover anonymous access, insufficient permission, and allowed access, including another user's resource. For cookie-authenticated state-changing requests, distinguish a missing CSRF token from an authorization denial.

`@WithMockUser` and mock JWT request support establish a test identity. They test downstream authorization, not password verification, token signatures, or issuer configuration. Authentication integration needs separate coverage of the real configured mechanism with controlled credentials and keys.

`@DataJpaTest` concentrates on mappings and queries. It normally supplies a test transaction and can replace the datasource with an embedded database. Check which database actually runs before treating that result as production evidence.

### Reject invalid JSON before pricing

These examples target Java 21 and Boot 4.0's managed JUnit 6 and Testcontainers 2 dependencies. This Gradle dependency fragment assumes the Boot 4.0 plugin and its dependency management are already configured. It supplies all three examples on this page. A compatible Docker runtime is also required for PostgreSQL.

```groovy
dependencies {
	implementation 'org.springframework.boot:spring-boot-starter-webmvc'
	implementation 'org.springframework.boot:spring-boot-starter-validation'
	implementation 'org.springframework.boot:spring-boot-starter-jdbc'
	runtimeOnly 'org.postgresql:postgresql'
	testImplementation 'org.springframework.boot:spring-boot-starter-test'
	testImplementation 'org.springframework.boot:spring-boot-starter-webmvc-test'
	testImplementation 'org.springframework.boot:spring-boot-starter-jdbc-test'
	testImplementation 'org.springframework.boot:spring-boot-testcontainers'
	testImplementation 'org.testcontainers:testcontainers-postgresql'
}

tasks.named('test') {
	useJUnitPlatform()
}
```

Save this controller as `src/main/java/example/QuoteController.java`. The response is a calculated total, not an echo of the request. `@NotNull` distinguishes a missing subtotal from zero.

```java
package example;

import jakarta.validation.Valid;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.PositiveOrZero;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RestController;

@RestController
public class QuoteController {
	private final PricingService pricing;

	public QuoteController(PricingService pricing) {
		this.pricing = pricing;
	}

	@PostMapping("/quotes")
	public Quote quote(@Valid @RequestBody QuoteRequest request) {
		return new Quote(pricing.totalCents(request.subtotalCents()));
	}

	public record QuoteRequest(@NotNull @PositiveOrZero Long subtotalCents) {}
	public record Quote(long totalCents) {}
}
```

Save the test as `src/test/java/example/QuoteControllerTest.java`. `@ContextConfiguration` supplies the two real classes explicitly, so this standalone slice needs no application entry point. The example has no security dependency. In a secured application, include its security configuration and authenticate the request rather than disabling filters.

```java
package example;

import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.webmvc.test.autoconfigure.WebMvcTest;
import org.springframework.http.MediaType;
import org.springframework.test.context.ContextConfiguration;
import org.springframework.test.web.servlet.MockMvc;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

@WebMvcTest(QuoteController.class)
@ContextConfiguration(classes = {QuoteController.class, PricingService.class})
class QuoteControllerTest {
	@Autowired MockMvc mvc;

	@Test
	void missingSubtotalIsBadRequest() throws Exception {
		mvc.perform(post("/quotes")
				.contentType(MediaType.APPLICATION_JSON).content("{}"))
			.andExpect(status().isBadRequest());
	}

	@Test
	void validSubtotalIncludesDeliveryInJson() throws Exception {
		mvc.perform(post("/quotes")
				.contentType(MediaType.APPLICATION_JSON)
				.content("{\"subtotalCents\":4000}"))
			.andExpect(status().isOk())
			.andExpect(jsonPath("$.totalCents").value(4500));
	}
}
```

Expected outcomes are HTTP 400 for `{}` and HTTP 200 with `{"totalCents":4500}` for the valid request. Removing `@Valid` lets the missing value reach unboxing in the controller and fails the first test. The test does not pin Boot's default error wording or claim to test servlet error dispatch.

## Full context does not always mean a server

`@SpringBootTest` loads the application context. Its default mock web environment does not start an embedded server. Adding `@AutoConfigureMockMvc` exercises the configured MVC application in-process.

`webEnvironment = RANDOM_PORT` starts a real server and exercises HTTP through the container. That matters for servlet error dispatch and other container behavior that MockMvc cannot reproduce. Keep a small number of these tests around important integration paths rather than repeating every controller case.

Boot 4.0 modularized test support. Use the technology test starters, such as `spring-boot-starter-webmvc-test` and `spring-boot-starter-security-test`. `WebMvcTest` and `AutoConfigureMockMvc` now live in `org.springframework.boot.webmvc.test.autoconfigure`. `DataJpaTest` lives in `org.springframework.boot.data.jpa.test.autoconfigure`. Boot 3 import examples and the old `@MockBean` pattern are not the baseline. Boot 4 uses JUnit 6 and Framework's `@MockitoBean`.

## Real persistence exposes rollback blind spots

Testcontainers runs real database services with disposable state. Match the production engine and a deliberate version, and run the same schema migrations. Boot's `@ServiceConnection`, supplied by `spring-boot-testcontainers`, connects supported containers to auto-configuration. Container lifetime must cover the cached application context that uses it. Spring-managed container beans align those lifecycles.

H2 cannot establish compatibility with PostgreSQL or MySQL locking, SQL dialects, indexes, and constraints. A real engine still does not reproduce production data volume or contention automatically.

A test-managed transaction rolls back by default. That can hide commit-time failures and prevent after-commit listeners from running. Flush to expose deferred SQL errors, but remember that flush is not commit. Exercise a real commit and inspect state in a fresh transaction when that is the contract.

With `RANDOM_PORT`, the server runs on a different thread and transaction from the test. Rolling back the test transaction does not undo server writes. Use isolated data and deliberate cleanup. Test rollback through the Spring-managed service proxy, not by assuming the test's own rollback proves application transaction behavior.

### Inspect a rollback and a commit in PostgreSQL

This example uses JDBC so the transaction result is visible without a persistence context. Save the complete service as `src/main/java/example/TransferService.java`. A missing destination throws after the debit. Both writes must share one transaction.

```java
package example;

import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.transaction.annotation.Transactional;

public class TransferService {
	private final JdbcTemplate jdbc;

	public TransferService(JdbcTemplate jdbc) {
		this.jdbc = jdbc;
	}

	@Transactional
	public void transfer(long source, long destination, long cents) {
		if (cents <= 0 || source == destination) {
			throw new IllegalArgumentException("Invalid transfer");
		}
		int debited = jdbc.update("""
			update account set balance_cents = balance_cents - ?
			where id = ? and balance_cents >= ?
			""", cents, source, cents);
		if (debited != 1) {
			throw new IllegalStateException("Source missing or insufficient funds");
		}
		int credited = jdbc.update("""
			update account set balance_cents = balance_cents + ? where id = ?
			""", cents, destination);
		if (credited != 1) {
			throw new IllegalArgumentException("Destination missing");
		}
	}
}
```

Save this complete test as `src/test/java/example/TransferServiceTest.java`. Its nested configuration starts only JDBC infrastructure, the real service, and a Spring-managed PostgreSQL container. The `org.testcontainers.postgresql` import and `testcontainers-postgresql` artifact are the Testcontainers 2 forms.

The schema below is an explicit teaching fixture, created in a disposable database. It is not a substitute for testing your application's production migrations. The chosen `postgres:17.6` tag makes the engine assumption visible. Use your production version when adapting the example.

```java
package example;

import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.autoconfigure.EnableAutoConfiguration;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.boot.testcontainers.service.connection.ServiceConnection;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.jdbc.core.JdbcTemplate;
import org.testcontainers.postgresql.PostgreSQLContainer;
import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;

@SpringBootTest(classes = TransferServiceTest.Config.class,
	webEnvironment = SpringBootTest.WebEnvironment.NONE)
class TransferServiceTest {
	@Configuration(proxyBeanMethods = false)
	@EnableAutoConfiguration
	static class Config {
		@Bean
		@ServiceConnection
		PostgreSQLContainer postgres() {
			return new PostgreSQLContainer("postgres:17.6");
		}

		@Bean
		TransferService transfers(JdbcTemplate jdbc) {
			return new TransferService(jdbc);
		}
	}

	@Autowired TransferService transfers;
	@Autowired JdbcTemplate jdbc;

	@BeforeEach
	void accounts() {
		jdbc.execute("""
			create table if not exists account (
				id bigint primary key,
				balance_cents bigint not null check (balance_cents >= 0)
			)
			""");
		jdbc.execute("truncate table account");
		jdbc.update("insert into account values (1, 10000), (2, 2000)");
	}

	@Test
	void failedCreditRollsBackDebitButSuccessfulTransferCommits() {
		assertThatThrownBy(() -> transfers.transfer(1, 99, 3_000))
			.isInstanceOf(IllegalArgumentException.class);
		assertThat(balance(1)).isEqualTo(10_000L);
		assertThat(balance(2)).isEqualTo(2_000L);

		transfers.transfer(1, 2, 3_000);
		assertThat(balance(1)).isEqualTo(7_000L);
		assertThat(balance(2)).isEqualTo(5_000L);
	}

	private long balance(long accountId) {
		return jdbc.queryForObject(
			"select balance_cents from account where id = ?", Long.class, accountId);
	}
}
```

There is deliberately no `@Transactional` on the test. Each balance query runs after the service transaction ends, in a new database transaction. A pool may reuse the physical connection. Removing the service's annotation leaves the first debit committed, so the 10,000-cent assertion fails. The successful call proves that writes survive return from the proxy.

Expected database states, not captured test-run output:

| Point | Account 1 | Account 2 | Observable result |
| --- | --- | --- | --- |
| Fixture committed | 10,000 | 2,000 | Both rows exist |
| Transfer to missing account 99 fails | 10,000 | 2,000 | Earlier debit rolled back |
| Transfer to account 2 returns | 7,000 | 5,000 | Both changes committed |

In a Gradle project containing these files, run `./gradlew test --tests 'example.*Test'`. The expected result is five successful test methods. The fixture assumes ordinary sequential execution within this class. Do not share its truncation-based setup with concurrently running tests against the same database.

Continue with [transactions](/java-spring/transactions/), [security](/java-spring/security/), and [validation and errors](/java-spring/validation-errors/).

## Sources

- [Testing Spring Boot applications](https://docs.spring.io/spring-boot/4.0/reference/testing/spring-boot-applications.html)
- [Testcontainers integration](https://docs.spring.io/spring-boot/4.0/reference/testing/testcontainers.html)
- [Spring Boot 4.0 migration guide](https://github.com/spring-projects/spring-boot/wiki/Spring-Boot-4.0-Migration-Guide)
- [Boot test slices and package names](https://docs.spring.io/spring-boot/4.0/appendix/test-auto-configuration/slices.html)
- [Testcontainers PostgreSQL module](https://java.testcontainers.org/modules/databases/postgres/)
