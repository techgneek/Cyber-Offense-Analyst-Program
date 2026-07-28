# Broken Access Control Example Ticket

## Title
Tenant-Scoped Compliance Evidence Lookup Returned Object Data Before Authorization, Then Returned `403 Forbidden` After the Fix

## Summary
A training-only evidence lookup route allowed a low-privilege actor to retrieve tenant-scoped compliance evidence by ID. The route was then updated with a narrow authorization check so the same request now returns `403 Forbidden` instead of leaking the record.

## Impact
- Unauthorised tenant-scoped object access was possible before remediation.
- The response exposed compliance evidence data to a low-privilege actor.
- After the fix, the same request is denied and no object body is returned.

## Evidence Index

| Artifact | Purpose |
| --- | --- |
| `Evidence Screenshots/BAC-code-before.png` | Vulnerable code path before the authorization check |
| `Evidence Screenshots/BAC-code-after.png` | Remediated code path with the authorization guard |
| `Evidence Screenshots/BAC-before-tenant-mismatch.png` | Burp before-state showing the tenant-mismatched request and `200 OK` |
| `Evidence Screenshots/BAC-after-tenant-mismatch-fix.png` | Burp after-state showing the same route returning `403 Forbidden` |
| `Evidence Screenshots/BAC-webapp-after-403.png` | Final webapp verification showing the fixed behavior |

## Findings Mapping

| Framework | Mapping | Notes |
| --- | --- | --- |
| OWASP Top 10 | A01 Broken Access Control | Direct fit |
| OWASP API Security Top 10 | API1 Broken Object Level Authorization | Direct fit |
| CWE | CWE-639 Authorization Bypass Through User-Controlled Key | Strong fit for object lookup by ID |
| CWE | CWE-284 Improper Access Control | Broad control failure category |
| CVE | N/A | This is custom lab code, so there is no public CVE assigned |
| MITRE ATT&CK | T1190 Exploit Public-Facing Application | Closest fit for an exposed web application route; note that pure IDOR does not always map cleanly to a single ATT&CK technique |

## DevSecOps Lifecycle

| Phase | What happened in this lab | Evidence / artifact |
| --- | --- | --- |
| Plan | Defined a safe lab-only broken-access-control scenario and scoped it to a non-production Azure target | `docs/aa/broken-access-control/README.md` |
| Code | Identified the vulnerable route and then added a narrow authorization guard | `server.ts` |
| Build | Verified the application still builds after the fix | `npm run build` |
| Test | Replayed the tenant-scoped request in Burp before and after the fix | Burp screenshots in `Evidence Screenshots/` |
| Release | Built and pushed the fixed container image to the lab registry | `cyberoffenselabjd4des.azurecr.io/aetos-ai-security-mentor:bac-403-fix` |
| Deploy | Updated the Azure Container App to run the fixed image | Azure Container App revision update |
| Operate | Confirmed the running app still serves the lab route and health endpoints | Azure live app |
| Monitor | Kept the lab health and evidence endpoints available for validation and review | `/api/health`, `/api/compliance/evidence` |
| Remediate | Preserved the fix and documented the finding for future reuse | this ticket and the report/worksheet |

## Remediation Notes
The route now checks the caller’s role and scope before returning tenant-scoped evidence. If the caller is not authorized, the route returns `403 Forbidden` with a short denial response and does not leak the evidence body.

## Retest Result
The same tenant-scoped request that previously returned `200 OK` now returns:

```json
{
  "code": "FORBIDDEN",
  "error": "Forbidden",
  "message": "Tenant access denied"
}
```

## DevSecOps Takeaway
This example shows the full lifecycle in one lab ticket: define the control failure, reproduce it safely, fix the code, rebuild and redeploy the container, then verify the resulting security behavior with the same request and evidence trail.
