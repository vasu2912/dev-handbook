---
title: What Spring Boot does
description: Separate Spring's programming model from Boot's dependency management, startup, and conditional defaults.
---

Spring Framework supplies the container, web frameworks, transaction support, and integration APIs. Spring Boot assembles those capabilities into an application with managed dependencies, conditional configuration, and a standard startup path. Boot reduces setup. It does not change Java's object model or remove the need to understand the beans it creates.

This handbook uses Java 21 with Spring Boot 4.0 and Spring Framework 7.0. That is the handbook baseline, not a claim that Java 21 is Boot's minimum supported version.

## Dependencies select available capabilities

A starter adds dependencies for a capability. This partial Maven `dependencies` section assumes Boot 4.0 dependency management from the parent or BOM:

```xml
<dependency>
	<groupId>org.springframework.boot</groupId>
	<artifactId>spring-boot-starter-jdbc</artifactId>
</dependency>
<dependency>
	<groupId>com.h2database</groupId>
	<artifactId>h2</artifactId>
	<scope>runtime</scope>
</dependency>
```

The JDBC starter brings Spring JDBC and HikariCP. H2 supplies an embedded database driver for the example below. The starter does not supply every database driver. For JPA repositories and ORM support, `spring-boot-starter-data-jpa` adds those capabilities as well.

The `spring-boot-dependencies` bill of materials, or BOM, selects compatible dependency versions. A BOM manages versions. It does not add every managed library to the application. Starters add dependencies, while the BOM keeps their versions aligned.

Maven projects commonly use `spring-boot-starter-parent`, or import the BOM when another parent is required. Gradle can consume the BOM through its platform support or dependency-management integration. Boot's build plugins provide packaging and execution tasks. Dependency management and executable packaging are separate responsibilities, even when a generated project configures both.

Let the selected Boot release manage Spring Framework versions. Overriding one library can solve a specific compatibility or security requirement, but it also departs from Boot's tested dependency set. Inspect the resolved dependency graph rather than assuming the version written in one build file is the version that runs.

## The application class defines a search boundary

`@SpringBootApplication` combines Boot configuration, component scanning, and auto-configuration. `SpringApplication.run(...)` prepares the environment and creates and refreshes the application context.

Component scanning starts at the annotated class's package and includes its descendants. Put the application class in a named root package above the application's components. A sibling package is not included merely because it belongs to the same project. Using the default package can make scanning far broader than intended.

Component scanning and auto-configuration are different mechanisms. Scanning finds your annotated classes. Auto-configuration imports Boot configuration selected by conditions. Default entity and repository search packages also derive from the application package, but have their own configuration controls. Expanding component scanning alone does not necessarily expand every framework-specific scan.

## Auto-configuration is conditional configuration

With the JDBC and H2 dependencies above, no custom `DataSource`, and no connection settings, Boot can create a pooled `DataSource` backed by an in-memory H2 database. Now add this configuration inside the scanned package. Imports are included because `DataSource` still belongs to `javax.sql`, not `jakarta.sql`:

```java
import com.zaxxer.hikari.HikariDataSource;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;

@Configuration(proxyBeanMethods = false)
class LocalDatabaseConfiguration {
	@Bean
	HikariDataSource dataSource() {
		var pool = new HikariDataSource();
		pool.setJdbcUrl("jdbc:h2:mem:orders;DB_CLOSE_ON_EXIT=FALSE");
		pool.setUsername("sa");
		pool.setPassword("");
		pool.setMaximumPoolSize(4);
		return pool;
	}
}
```

This is a local, disposable database example, not production credentials or storage. `HikariDataSource` implements `javax.sql.DataSource`. Spring registers this bean and infers its `close()` lifecycle method. Boot's default datasource creation backs off because a datasource already exists. JDBC support can still use that bean. Defining one bean does not disable all auto-configuration.

<svg role="img" aria-label="Simplified JDBC startup decision: check JDBC classes, then an application datasource; reuse that bean or create a default when connection details are available" viewBox="0 0 540 300" xmlns="http://www.w3.org/2000/svg" style="max-width:100%;height:auto">
<defs><marker id="boot-decision-arrow" markerWidth="8" markerHeight="8" refX="7" refY="3" orient="auto"><path d="M0 0L0 6L7 3Z" fill="var(--diagram-muted)"/></marker></defs>
<g fill="var(--diagram-bg)" stroke="var(--diagram-border)"><rect x="90" y="10" width="360" height="50" rx="6"/><rect x="90" y="100" width="360" height="50" rx="6"/><rect x="10" y="220" width="245" height="65" rx="6"/><rect x="285" y="220" width="245" height="65" rx="6"/></g>
<g fill="var(--diagram-ink)" text-anchor="middle" font-size="17"><text x="270" y="41">JDBC classes available?</text><text x="270" y="131">Application DataSource exists?</text><text x="132" y="247">Yes: use your bean</text><text x="132" y="271">Default creation backs off</text><text x="408" y="247">No: create a default</text><text x="408" y="271">Needs driver and settings</text><text x="292" y="84">yes</text></g>
<g fill="none" stroke="var(--diagram-muted)" stroke-width="2" marker-end="url(#boot-decision-arrow)"><path d="M270 60V98"/><path d="M190 150V185H132V218"/><path d="M350 150V185H408V218"/></g>
</svg>

The diagram assumes ordinary JDBC auto-configuration, with no R2DBC setup or explicit exclusions. If JDBC classes are missing, that configuration does not apply. If no custom datasource or usable connection details exist, adding a JDBC starter can expose a startup failure rather than create a working database.

Start the packaged application with `java -jar app.jar --debug` to inspect the conditions report. This shortened report is **illustrative**, not verbatim Boot output or an assertion about internal class names:

```text
Positive matches:
  JDBC datasource support: required JDBC classes are present
Negative matches:
  Default pooled datasource creation:
    a DataSource bean named 'dataSource' already exists
```

| Application setup | Expected datasource outcome |
| --- | --- |
| JDBC starter + H2, no custom bean | Boot creates a pooled datasource for embedded H2 |
| Same dependencies + configuration above | The application bean is used, with maximum pool size 4 |
| Same dependencies, but no H2 and no external database settings | Default datasource creation cannot find a usable database |

Conditions commonly inspect available classes, existing beans, and property values. Read the condition for the specific integration. An unrelated bean name or an overly broad configuration exclusion can produce a different result than intended. Negative matches are often normal. Use the report to explain a decision before adding more annotations.

## The server belongs to the application process

In an embedded servlet application, the web application context creates the server through a `ServletWebServerFactory`. The server starts during context initialization. There is no separate application-server installation to configure, but the process still owns ports, connections, shutdown, and resource limits.

Boot also supports reactive web applications and non-web applications. A starter's presence does not make every application architecture appropriate. For blocking MVC and JPA code, understand the servlet request path before introducing a different execution model.

Continue with [beans](/java-spring/beans/), [configuration](/java-spring/configuration/), and [request handling](/java-spring/request-handling/).

## Sources

- [Boot 4.0 build systems and starters](https://docs.spring.io/spring-boot/4.0/reference/using/build-systems.html)
- [The application annotation](https://docs.spring.io/spring-boot/4.0/reference/using/using-the-springbootapplication-annotation.html)
- [Auto-configuration](https://docs.spring.io/spring-boot/4.0/reference/using/auto-configuration.html)
- [SQL databases and datasource configuration](https://docs.spring.io/spring-boot/4.0/reference/data/sql.html)
- [Embedded servlet applications](https://docs.spring.io/spring-boot/4.0/reference/web/servlet.html)
