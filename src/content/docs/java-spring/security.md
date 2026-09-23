---
title: Spring Security
description: Understand Spring Security's request boundary, identity context, and authorization responsibilities without building a separate authentication system.
---

Spring Security establishes identity and enforces access rules before a request reaches MVC. The application still owns resource permissions. An authenticated user with the right role may have no right to read the account named in the URL.

## The filter chain establishes identity

A `SecurityFilterChain` bean configures servlet security through `HttpSecurity`. Spring Security's `FilterChainProxy` selects the first matching chain, then invokes its filters in order. Multiple chains are alternatives, not rules that accumulate. A request outside every chain has no Spring Security protection, so coverage needs a deliberate fallback.

Authentication produces an `Authentication` containing the principal and granted authorities. The `SecurityContext` holds that result. Its usual thread-local storage belongs to the current execution, not to a singleton service field. Controllers can receive `Principal` or an authenticated principal argument rather than parsing credentials themselves.

A thread switch does not automatically transfer identity to arbitrary background work. Pass the identity needed by the use case explicitly or use Spring Security's supported context propagation. Never treat an unverified header or a decoded token payload as an authenticated identity.

Declaring a custom chain makes Boot's default web security configuration back off. That includes taking responsibility for management endpoints as well as application routes.

<ol class="learning-flow" aria-label="Bearer request security flow">
<li><a href="https://docs.spring.io/spring-security/reference/7.0/servlet/architecture.html">1. Select one chain</a><p>FilterChainProxy chooses the first matching SecurityFilterChain.</p></li>
<li><a href="#sessions-and-bearer-tokens-solve-different-problems">2. Verify the bearer token</a><p>A presented JWT must pass signature, issuer, time, and configured audience checks. An invalid token stops here with 401.</p></li>
<li><a href="#authorization-belongs-at-two-levels">3. Authorize the route</a><p>The request rule checks granted authorities. A missing required scope stops an authenticated caller with 403.</p></li>
<li><a href="/java-spring/request-handling/">4. Enter MVC and the service</a><p>The controller runs only after the filters allow it. The service still checks ownership when reading a named resource.</p></li>
</ol>

This is the decision flow for the read-only bearer example below, not an exhaustive list of filters. In particular, CSRF and other exploit protections can reject other kinds of request earlier.

## Authorization belongs at two levels

Request authorization handles broad rules, such as public routes and authenticated administration endpoints. Method authorization protects service entry points and can use arguments in decisions. `@EnableMethodSecurity` enables this support. Adding the security starter alone does not activate `@PreAuthorize`.

Method security normally uses proxies. Calls that bypass the proxy, including self-invocation, bypass that interception. Resource checks must protect the actual operation, regardless of which controller calls it.

A role such as `ACCOUNT_READER` is not ownership. Check the authenticated subject against the requested account and tenant, ideally as part of the authorized lookup. Apply equivalent constraints to lists and updates. A client-supplied owner ID is input, not evidence of permission.

## Sessions and bearer tokens solve different problems

A session associates an opaque browser cookie with server-side authentication state. It supports server-side invalidation but needs a session-sharing strategy when requests reach different instances. Cookie security attributes and CSRF protection remain part of the design.

An OAuth resource server accepts access tokens issued elsewhere. Spring Security supports JWT verification and opaque-token introspection. Use that support rather than writing a token filter. JWT acceptance requires trusted signing keys and appropriate issuer, lifetime, and audience checks. A valid signature alone does not establish that the token was issued for this API.

Local JWT verification avoids a network lookup on every request but makes immediate revocation harder. Introspection introduces a dependency on the authorization server. Neither model removes resource authorization, and neither requires the API to become an authorization server.

When the application stores passwords, `PasswordEncoder` provides adaptive one-way hashing and verification. `DelegatingPasswordEncoder` records the encoding identifier so stored hashes can migrate. Plaintext, reversible encryption, and fast general-purpose hashes are not password-storage strategies. Tune verification cost under realistic load without weakening the encoding to fix capacity problems.

### A read-only bearer API

This configuration fragment is for a dedicated API with two GET routes. It accepts access tokens only through the standard `Authorization: Bearer` header. It does not authenticate from cookies, HTTP Basic, or a login form. `STATELESS` prevents Spring Security from using an HTTP session to persist authentication; it does not prevent unrelated application code from creating a session.

The example keeps CSRF protection enabled. The GET handlers must not change server state. Adding a POST route requires an explicit CSRF decision, not copying a global `csrf.disable()` call. A browser application that authenticates with cookies needs a session and CSRF design of its own.

The Java fragment omits imports and startup. It requires Spring Security's resource-server and JOSE dependencies, MVC, and a trusted issuer configured through Boot. No other `SecurityFilterChain` is assumed.

```java
@Configuration
class ApiSecurity {
	@Bean
	SecurityFilterChain api(HttpSecurity http) throws Exception {
		return http
			.sessionManagement(session -> session
				.sessionCreationPolicy(SessionCreationPolicy.STATELESS))
			.formLogin(form -> form.disable())
			.httpBasic(basic -> basic.disable())
			.logout(logout -> logout.disable())
			.authorizeHttpRequests(authorize -> authorize
				.requestMatchers(HttpMethod.GET, "/api/ping").permitAll()
				.requestMatchers(HttpMethod.GET, "/api/profile")
					.hasAuthority("SCOPE_profile:read")
				.anyRequest().denyAll())
			.oauth2ResourceServer(resource -> resource
				.jwt(Customizer.withDefaults()))
			.build();
	}
}

@RestController
class ProfileController {
	@GetMapping("/api/ping")
	Map<String, String> ping() {
		return Map.of("status", "ok");
	}

	@GetMapping("/api/profile")
	Map<String, String> profile(Principal principal) {
		return Map.of("subject", principal.getName());
	}
}
```

Boot configures the decoder with these application properties. `TOKEN_ISSUER` must be the trusted HTTPS issuer's exact identifier, and `API_AUDIENCE` must be this API's registered audience. They are deployment inputs, not values supplied by an incoming request.

```properties
spring.security.oauth2.resourceserver.jwt.issuer-uri=${TOKEN_ISSUER}
spring.security.oauth2.resourceserver.jwt.audiences=${API_AUDIENCE}
```

The issuer must provide supported discovery metadata and signing keys. The example uses Boot's decoder configuration, not a custom decoder that silently omits the audience validator. It assumes the issuer supplies a nonempty `sub` claim and a `scope` claim such as `profile:read`. Spring maps that scope to `SCOPE_profile:read` and uses `sub` as the default authentication name.

For a valid access token whose subject is `user-42` and scope includes `profile:read`, the exchange is:

```http
GET /api/profile HTTP/1.1
Authorization: Bearer <access-token-from-the-trusted-issuer>
Accept: application/json
```

```http
HTTP/1.1 200 OK
Content-Type: application/json

{"subject":"user-42"}
```

The token notation is illustrative, not a token you can send. The response shows only the caller's own subject, so this handler does not perform a cross-user resource lookup.

| GET request | Anonymous, no token | Valid token without `profile:read` | Valid token with `profile:read` |
| --- | --- | --- | --- |
| `/api/ping` | 200, `{"status":"ok"}` | 200, same body | 200, same body |
| `/api/profile` | 401, bearer challenge | 403, insufficient permission | 200, authenticated subject |
| `/api/unlisted` | 401, bearer challenge | 403 | 403 |

An invalid token is different from no token. The bearer filter rejects an invalid presented token with 401 even on `/api/ping`; `permitAll` does not skip authentication filters. These security failures do not invoke the controller. The default handlers supply bearer challenges, not this handbook's MVC problem-JSON contract.

The chain matches all requests and denies any route not listed. That includes management endpoints and direct requests to `/error`. A service with management routes or error dispatches must define those rules deliberately. This fragment is not a complete production authentication system: token issuance, TLS deployment, credential storage, revocation policy, and cross-origin browser access remain separate decisions.

## Browser protections and failure responses

CORS controls which origins a browser permits to read cross-origin responses. It is not authentication and does not restrict non-browser clients. Integrate CORS before authentication so preflight requests can be evaluated without a session cookie. Keep allowed origins, methods, and credential use explicit.

CSRF concerns credentials that browsers attach automatically. Spring Security protects unsafe methods by default. A JSON API or stateless server is not, by itself, a reason to disable it. A bearer-only design that never authenticates through automatically attached credentials needs a different CSRF assessment from a cookie-authenticated application.

For an API, missing or invalid credentials normally produce 401 with the appropriate authentication challenge. An authenticated caller without permission normally receives 403. Browser login flows may redirect instead, and CSRF rejection can also produce 403. Configure entry-point and access-denied responses deliberately. MVC advice does not automatically handle filter failures.

Continue with [validation and errors](/java-spring/validation-errors/), [testing](/java-spring/testing/), and [observability](/java-spring/observability/).

## Sources

- [Servlet security architecture](https://docs.spring.io/spring-security/reference/7.0/servlet/architecture.html)
- [Method security](https://docs.spring.io/spring-security/reference/7.0/servlet/authorization/method-security.html)
- [OAuth resource server](https://docs.spring.io/spring-security/reference/7.0/servlet/oauth2/resource-server/index.html)
- [Password storage](https://docs.spring.io/spring-security/reference/7.0/features/authentication/password-storage.html)
- [CORS integration](https://docs.spring.io/spring-security/reference/7.0/servlet/integrations/cors.html) and [CSRF protection](https://docs.spring.io/spring-security/reference/7.0/servlet/exploits/csrf.html)
- [Request authorization rules](https://docs.spring.io/spring-security/reference/7.0/servlet/authorization/authorize-http-requests.html)
- [JWT resource-server configuration and audience validation](https://docs.spring.io/spring-security/reference/7.0/servlet/oauth2/resource-server/jwt.html)
- [Stateless session policy](https://docs.spring.io/spring-security/reference/7.0/servlet/authentication/session-management.html)
