# Broken Access Control Remediation Report

## Summary

This training exercise demonstrates a real broken-access-control condition in the lab: a request can fetch a specific compliance evidence record by ID without checking whether the requesting actor is authorized to view it.

The evidence trail is designed to mirror a real Burp investigation and remediation cycle:

1. capture the vulnerable before-state response,
2. capture the vulnerable code path,
3. apply the narrow authorization check,
4. redeploy the lab image, and
5. retest the same tenant-scoped route until it returns `403 Forbidden`.

The objective is to walk through the same workflow a reviewer would expect in the field: capture the before state, apply the narrowest fix, retest the same object lookup, and record the result in the case file.

## Targeted Resource

- Compliance evidence lookup route in training mode
- Route pattern: `/api/tenants/:tenantId/compliance/evidence/:evidenceId`

## Before State

Observed behavior in training mode:

- A request for a valid evidence ID returns the record even when the tenant in the path does not match the record owner.
- The response includes the underlying object payload instead of denying access.
- The issue is object-level rather than route-level, because the route exists but lacks authorization enforcement for the requested record.

What the screenshot should show:

- the tenant ID in the path
- the evidence ID in the path
- the `200 OK` status
- the returned record body
- the mismatch between requested tenant and record owner

## Live Validation Notes

The live Azure lab was validated with the following evidence set:

- Before-state code screenshot: `Evidence Screenshots/BAC-code-before.png`
- After-state code screenshot: `Evidence Screenshots/BAC-code-after.png`
- Before-state Burp screenshot: `Evidence Screenshots/BAC-before-tenant-mismatch.png`
- After-state Burp screenshot: `Evidence Screenshots/BAC-after-tenant-mismatch-fix.png`
- Live after-state response screenshot: `Evidence Screenshots/BAC-webapp-after-403.png`

Observed before-state response:

- `200 OK` for a seeded evidence lookup against a tenant-scoped path
- The object body was returned instead of a denial

Observed after-state response:

- `403 Forbidden`
- JSON body:

```json
{
  "code": "FORBIDDEN",
  "error": "Forbidden",
  "message": "Tenant access denied"
}
```

The fix is implemented in the route so the low-privilege actor can no longer retrieve tenant-scoped evidence without passing the authorization check.

## Remediation Plan

The fix should be narrow and explicit:

1. Require an allowed actor identity and scope before returning the record.
2. Verify that the requested tenant matches the record owner or that the actor has an approved read scope for compliance evidence.
3. Return `403 Forbidden` for unauthorized requests.
4. Preserve the rest of the training mode behavior unchanged.

## Retest Plan

Retest the same evidence ID with:

- an approved actor and scope
- an unapproved actor and scope
- a tenant ID that matches the record owner
- a tenant ID that does not match the record owner

Expected results:

- Approved request: returns the record.
- Unapproved request: returns `403 Forbidden` and does not leak the record.

What the after screenshot should show:

- the same tenant/object route
- the `403 Forbidden` status
- no record payload in the body

## Evidence To Capture

Use the existing screenshot workflow to store:

- before-state request and response
- remediation code or configuration change
- after-state request and response
- any verification showing the unauthorized lookup is blocked

The visual story should make the broken access obvious without extra explanation: the wrong tenant path returned data before the fix and stops returning it after the fix.

## Framework Mapping

### OWASP Top 10

- A01 Broken Access Control

### OWASP API Security Top 10

- API1 Broken Object Level Authorization

### CWE

- CWE-639 Authorization Bypass Through User-Controlled Key
- CWE-284 Improper Access Control

### MITRE ATT&CK

No direct ATT&CK mapping is required for this specific authorization-control exercise.

## Workbook Notes

When you document the result, include:

- the evidence ID that was requested
- the tenant ID that was requested
- the actor identity and scope used for the test
- the response code before and after the fix
- the final disposition

## Outcome

This exercise is complete only when the unauthorized evidence lookup is blocked and the retest proves the fix without changing the rest of the lab baseline.