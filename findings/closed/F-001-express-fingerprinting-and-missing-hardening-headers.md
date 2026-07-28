# F-001 - Express Fingerprinting And Missing Hardening Headers

## Finding ID

F-001

## Title

Express fingerprinting header is exposed and baseline hardening headers are not present on the lab root and health responses.

## Source Tool

curl

## Discovery Date

2026-07-24

## Affected Asset

Local AetosAI lab application service

## Affected Endpoint

`/` and `/api/health`

## Environment

Local lab validation environment

## Description

The application responses include `X-Powered-By: Express`, which reveals the backend framework. The observed responses also do not include common defensive headers such as `Content-Security-Policy`, `X-Content-Type-Options`, `Referrer-Policy`, `Permissions-Policy`, or `X-Frame-Options` in the captured passive checks.

## Technical Evidence

Observed with `curl -I http://127.0.0.1:3000/` and `curl -I http://127.0.0.1:3000/api/health` after remediation.

Captured headers now include:

- `X-Content-Type-Options: nosniff`
- `Referrer-Policy: no-referrer`
- `X-Frame-Options: DENY`
- `Permissions-Policy: camera=(), microphone=(), geolocation=(), payment=()`
- `Access-Control-Allow-Methods: GET,POST,PUT,PATCH,DELETE,OPTIONS`
- `Access-Control-Allow-Headers: Content-Type, Authorization, x-actor-id, x-actor-type, x-actor-role, x-actor-scope, x-data-classification, x-auth-method, x-auth-result, x-shadow-session-id, x-shadow-tester-token`

`X-Powered-By` is no longer present in the responses.

## Reproduction Steps

1. Start the local lab application.
2. Run `curl -I http://127.0.0.1:3000/`.
3. Run `curl -i http://127.0.0.1:3000/api/health`.
4. Review the response headers.

## Preconditions

- The lab application is running locally or in the isolated lab environment.
- The tester is using only the authorized lab system.

## Business Impact

The framework fingerprint and missing hardening headers increase information disclosure and make the lab easier to profile. This is a low-severity issue in a controlled lab, but it is still useful to track and remediate because it establishes a security baseline for later Azure deployment.

## Likelihood

Medium

## Severity

Low

## CVSS Vector

N/A for this baseline hardening observation

## CVE Or CWE

CWE-200

## OWASP Category

OWASP Top 10: Security Misconfiguration

## OWASP API Category

API8 Security Misconfiguration

## MITRE ATT&CK Mapping

Not applicable

## False-Positive Assessment

Low likelihood of false positive. The header output was directly observed in the live response before and after remediation.

## Recommended Remediation

- Disable the `X-Powered-By` header.
- Add baseline hardening headers at the application or proxy layer.
- Review CORS and origin handling after Azure deployment.

## Compensating Controls

- Isolated lab subscription
- Synthetic test accounts only
- Non-production endpoint scope

## Owner

Lab owner / application maintainer

## Target Remediation Date

Before the first external lab exposure

## SLA Status

Closed

## Retest Evidence

`curl -sI http://127.0.0.1:3000/` and `curl -sI http://127.0.0.1:3000/api/health` both returned the baseline headers listed above and did not return `X-Powered-By`.

## Final Disposition

Closed