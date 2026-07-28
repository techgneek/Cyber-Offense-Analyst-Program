# Broken Access Control Worksheet

Use this worksheet when practicing a broken-access-control remediation and retest.

## Before State

- Identify the object or record being requested.
- Capture who requested it.
- Show why the request should not be allowed.

If you are using Burp, first pull a valid `evidenceId` and `actorId` from `/api/compliance/evidence?limit=5`, then replay that ID against `/api/tenants/<other-tenant>/compliance/evidence/<evidenceId>` with a low-privilege actor.

## Remediation

- Add the ownership or scope check.
- Keep the change narrow and explicit.
- Avoid changing unrelated behavior.

For this lab, the authorization guard lives in `server.ts` for:

`GET /api/tenants/:tenantId/compliance/evidence/:evidenceId`

The fix returns `403 Forbidden` when the actor does not have an allowed evidence-read role or scope.

## Retest

- Re-run the same request.
- Confirm unauthorized access is denied.
- Capture before-and-after evidence.

In Burp, the retest should show `403 Forbidden` after the tenant-to-record authorization check is in place.

## Notes

- The route now enforces a role/scope authorization check before returning tenant-scoped evidence.
- Proof collected:
  - before-state Burp screenshot: `Evidence Screenshots/BAC-before-tenant-mismatch.png`
  - before-state code screenshot: `Evidence Screenshots/BAC-code-before.png`
  - after-state code screenshot: `Evidence Screenshots/BAC-code-after.png`
  - after-state Burp screenshot: `Evidence Screenshots/BAC-after-tenant-mismatch-fix.png`
  - live after-state response screenshot: `Evidence Screenshots/BAC-webapp-after-403.png`
- Reviewer summary: the training-only evidence lookup was originally an IDOR-style object-level authorization issue, but the route now denies access unless the actor has an approved read scope or role.
