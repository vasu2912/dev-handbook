---
title: OAuth and OpenID Connect
description: Distinguish delegated API access from user identity, then follow authorization code with PKCE and token validation.
---

OAuth 2.0 defines delegated authorization: a client obtains permission to access a protected resource. OpenID Connect adds an identity layer for authenticating a user. A signed JWT is a token format, not a complete login protocol.

## Roles and token types

| Term                 | Role                                                                |
| -------------------- | ------------------------------------------------------------------- |
| Resource owner       | Entity that can authorize access, commonly the user                 |
| Client               | Application requesting access                                       |
| Authorization server | Authenticates as required and issues authorization grants or tokens |
| Resource server      | API that accepts valid access tokens                                |
| ID token             | Identity assertion intended for the OpenID Connect client           |
| Refresh token        | Credential used to obtain replacement access tokens                 |

An access token is intended for a resource server. An ID token is intended for the client that requested authentication. Accepting an ID token as an API access token confuses those audiences.

## Authorization code with PKCE

The client creates a verifier and sends its derived challenge with the authorization request. The browser visits the authorization server. After authentication and consent as required, the server returns a short-lived code to a registered redirect URI. The client exchanges the code with the verifier for tokens.

PKCE binds code redemption to the initiating client instance's verifier. It does not replace redirect validation, transport security, or the protocol's request-binding protections. Use a maintained OAuth or OIDC library to handle state, nonce, and response validation correctly for the chosen flow.

Public clients cannot keep a client secret confidential. Machine-to-machine access can use the client-credentials grant when no end-user delegation is involved. The password grant is unsuitable under current security guidance, and the implicit grant is discouraged in favor of code-based flows.

## API validation and authorization

A JWT-validating API checks the trusted issuer, expected audience, signature with an allowed algorithm, expiry, and other required claims. Decoding the payload does not validate it. Opaque access tokens can require introspection instead of local JWT verification.

Token validity establishes an identity and permissions asserted by the issuer. The API still enforces ownership and tenant access for the specific resource. Scopes alone do not prove that the caller owns order 42.

Short access-token lifetimes limit some exposure. Refresh tokens need protected storage and replay defenses appropriate to the client type. Key rotation, revocation behavior, browser session security, and logout require explicit policies.

Connect this to [authentication](/backend/security/authentication/) and [authorization](/backend/security/authorization/).

## Sources

- [RFC 9700: OAuth security best current practice](https://www.rfc-editor.org/rfc/rfc9700.html)
- [OpenID Connect Core](https://openid.net/specs/openid-connect-core-1_0.html)
- [RFC 7636: PKCE](https://www.rfc-editor.org/rfc/rfc7636.html)
