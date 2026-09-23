---
title: Validation and error responses
description: Separate input constraints from business rules and make failures consistent across MVC and security boundaries.
---

A valid JSON document can still describe an impossible operation. Spring MVC handles conversion and input constraints. The application decides whether the requested operation is allowed in its current state. Keeping those decisions separate makes errors easier to explain without exposing implementation details.

## Input shape is not a business rule

Request DTOs define the data an endpoint accepts. Jakarta Bean Validation constraints express required values, lengths, ranges, and relationships between fields. With `spring-boot-starter-validation` present, MVC can validate a DTO before calling the controller.

This DTO and controller fragment omits imports. `AccountService.create` is an application method that stores the account or throws the application's `EmailAlreadyUsed` exception. Its returned `AccountResponse` is a response DTO, not an entity. The security chain must admit the request before MVC can validate it.

```java
record CreateAccountRequest(
	@NotBlank @Size(max = 100) String name,
	@NotBlank @Email String email
) {}

@RestController
class AccountController {
	private final AccountService accounts;

	AccountController(AccountService accounts) {
		this.accounts = accounts;
	}

	@PostMapping("/accounts")
	@ResponseStatus(HttpStatus.CREATED)
	AccountResponse create(@Valid @RequestBody CreateAccountRequest request) {
		return accounts.create(request.name(), request.email());
	}
}
```

`@Email` checks a format, not mailbox ownership or delivery. A uniqueness query also cannot guarantee that another transaction will not insert the same email. The use case owns that decision, with a database constraint as the final concurrency safeguard.

Keep stateful rules such as eligibility and ownership near the operation that uses them. Custom constraint validators can use dependencies, but hiding database calls in DTO validation makes their timing and cost harder to see.

These failures stop at different stages. The table assumes the controller above and the advice below.

| Failure stage | Example input | Controller called? | HTTP result and owner |
| --- | --- | --- | --- |
| JSON conversion | Truncated body `{"name":` | No | 400, MVC message converter failure. |
| Parameter conversion | `?page=abc` for an `int page` parameter on another endpoint | No | 400, MVC type conversion. Bean Validation has no integer to inspect. |
| Bean Validation | `{"name":"","email":"not-an-address"}` | No | 400, DTO constraint violations. |
| Business operation | Valid name and email, but that email is already registered | Yes | 409, the service's `EmailAlreadyUsed` failure translated by advice. |

For the invalid DTO, the following request produces the problem JSON shown later. Neither `accounts.create` nor a uniqueness query needs to run.

```http
POST /accounts HTTP/1.1
Content-Type: application/json
Accept: application/problem+json

{"name":"","email":"not-an-address"}
```

## Validation has two MVC paths

`@Valid @RequestBody CreateAccountRequest request` triggers validation of the bound object. Add `@Valid` to nested fields that need cascaded validation. `@Valid` is not itself a constraint, and annotations do nothing when an object is merely constructed with `new`.

In the Boot 4.0 baseline, Spring Framework 7 includes MVC method validation introduced in Framework 6.1. Constraints placed directly on controller parameters, such as `@Min(1) @RequestParam int page`, use this built-in path. Class-level `@Validated` is unnecessary for that path and instead selects proxy-based validation.

Individual argument validation raises `MethodArgumentNotValidException`. Method validation raises `HandlerMethodValidationException` and can include nested DTO violations too. An API error handler needs both. Input violations are client errors. A return-value constraint violation is a server contract failure, not something the client can repair.

An immediately following `BindingResult` permits local handling of errors for that argument. With method validation, MVC calls the controller only when all violations have corresponding error parameters. Otherwise, centralized exception handling applies.

Outside MVC, class-level `@Validated` enables Spring-driven method validation on managed beans when method-validation support is configured. It uses an AOP proxy and normally raises `ConstraintViolationException`. Self-invocation bypasses the proxy. Do not translate every service constraint violation to HTTP 400 without deciding whether it represents bad input or a programming error.

## Give errors a stable meaning

`@RestControllerAdvice` centralizes MVC exception translation. `ProblemDetail` represents RFC 9457 fields such as `type`, `title`, `status`, `detail`, and `instance`. A stable problem type or application code is safer for client logic than matching human-readable text.

Boot's `spring.mvc.problemdetails.enabled=true` configures problem responses for built-in MVC exceptions. Alternatively, an advice extending `ResponseEntityExceptionHandler` can customize those failures. If separate advice overrides Boot's handler, its ordering must take precedence over Boot's order of zero.

Field-error extensions can contain safe field paths and constraint codes. Avoid rejected secrets, internal class names, SQL, and stack traces. Translate known business failures deliberately, such as a state conflict to 409. Unexpected failures need a generic 500 response and an internal diagnostic record, not the raw exception message.

This advice fragment owns MVC error handling by extending `ResponseEntityExceptionHandler`; it does not also need Boot's problem-details property. The base class handles built-in MVC failures, including both validation exceptions. This override adds field codes for the individual DTO path used by `create`.

```java
@RestControllerAdvice
class ApiErrors extends ResponseEntityExceptionHandler {
	record FieldIssue(String field, String code) {}

	@Override
	protected ResponseEntity<Object> handleMethodArgumentNotValid(
			MethodArgumentNotValidException ex, HttpHeaders headers,
			HttpStatusCode status, WebRequest request) {
		var errors = ex.getBindingResult().getFieldErrors().stream()
			.map(error -> new FieldIssue(error.getField(), error.getCode()))
			.sorted(Comparator.comparing(FieldIssue::field)
				.thenComparing(FieldIssue::code))
			.toList();
		ProblemDetail problem = ProblemDetail.forStatusAndDetail(
			status, "Correct the invalid fields and retry.");
		problem.setTitle("Invalid request");
		problem.setProperty("code", "INVALID_INPUT");
		problem.setProperty("errors", errors);
		return handleExceptionInternal(ex, problem, headers, status, request);
	}

	@ExceptionHandler(EmailAlreadyUsed.class)
	ProblemDetail emailAlreadyUsed() {
		ProblemDetail problem = ProblemDetail.forStatusAndDetail(
			HttpStatus.CONFLICT, "An account already uses this email.");
		problem.setTitle("Account conflict");
		problem.setProperty("code", "EMAIL_ALREADY_USED");
		return problem;
	}
}
```

With the standard MVC Jackson converter, the invalid request receives the following body. Property order is illustrative. `ProblemDetail` extensions become top-level JSON fields, and MVC supplies `instance` from the request path.

```http
HTTP/1.1 400 Bad Request
Content-Type: application/problem+json

{
	"type": "about:blank",
	"title": "Invalid request",
	"status": 400,
	"detail": "Correct the invalid fields and retry.",
	"instance": "/accounts",
	"code": "INVALID_INPUT",
	"errors": [
		{"field": "email", "code": "Email"},
		{"field": "name", "code": "NotBlank"}
	]
}
```

This field list covers the shown DTO's field constraints. It does not normalize class-level constraints or method-validation results. Those still receive the base handler's problem response, without this custom `errors` extension. An API that promises field errors for every validation path must define both mappings.

For an admitted request with valid fields, if `AccountService.create` throws `EmailAlreadyUsed`, the second handler instead returns 409 with `code: "EMAIL_ALREADY_USED"`. There is no field-validation failure to repair. Only expose that distinction where account-existence disclosure is acceptable; public registration may need a non-enumerating response policy.

The example does not translate every database exception into that business failure. Only the known email-uniqueness conflict belongs in this contract. A lost database connection is not a duplicate email.

## The failure may precede the controller

Malformed JSON, missing required parameters, and failed type conversion occur before controller invocation but still belong to MVC exception handling. Advice is not limited to exceptions thrown inside the method body.

Servlet filters run outside MVC. Spring Security uses an authentication entry point and an access-denied handler for its rejections. Those components need compatible error bodies if the API promises one contract. Controller advice alone cannot provide that guarantee.

Cover malformed input, both validation paths, a known business failure, and an authentication rejection as distinct client-visible cases. Matching only status codes misses incompatible bodies and accidental disclosure.

Continue with [request handling](/java-spring/request-handling/), [security](/java-spring/security/), and [testing](/java-spring/testing/).

## Sources

- [Spring MVC validation](https://docs.spring.io/spring-framework/reference/web/webmvc/mvc-controller/ann-validation.html)
- [Spring-driven method validation](https://docs.spring.io/spring-framework/reference/core/validation/beanvalidation.html)
- [Spring MVC error responses](https://docs.spring.io/spring-framework/reference/web/webmvc/mvc-ann-rest-exceptions.html)
- [Spring Security servlet architecture](https://docs.spring.io/spring-security/reference/7.0/servlet/architecture.html)
