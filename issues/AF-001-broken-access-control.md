# AF-001 Ticket Walkthrough

## Ticket Summary

| Ticket Field | AF-001 Detail |
| --- | --- |
| Ticket source | `issues/AF-001-broken-access-control.md` |
| Finding ID | AF-001 |
| Ticket phase | Discovery → Investigation → Remediation → Validation |
| Endpoint | `GET /api/tenants/:tenantId/compliance/evidence/:evidenceId` |
| Ownership and priority | Suggested owner: API owner, Priority: P1 |
| Problem statement | Tenant-scoped evidence lookup exposed data that should have been blocked by authorization |
| OWASP linkage | OWASP A01: Broken Access Control / API1: Broken Object Level Authorization |
| Risk statement | Unauthorized object access can expose tenant-specific evidence and undermine tenant isolation |
| Recommended remediation | Add an authorization guard, restrict object access by tenant, and validate the caller’s entitlement before returning the evidence record |
| Validation plan | Capture the vulnerable request, apply the authorization fix, replay the same request, and record the after-state evidence |
| Definition of done | The same request returns `403 Forbidden`, the workbook is updated, and the finding is closed with before/after evidence |

## AF-001 Risk and Control Mapping

| Mapping Area | AF-001 Context |
| --- | --- |
| OWASP mapping | `docs/aa/broken-access-control/README.md` maps AF-001 to Broken Access Control because the API exposes data beyond the caller’s authorization boundary. |
| Secure SDLC / NIST context | `docs/reports/phase-6-initial-security-assessment.md` and `docs/reports/phase-7-remediation-and-retesting.md` capture the discovery, remediation, and retest phases in the secure SDLC flow. |
| Findings report linkage | `findings/closed/F-001-express-fingerprinting-and-missing-hardening-headers.md` shows how validated findings are tracked in the repo. |

## AF-001 Ownership Snapshot

| Field | Value |
| --- | --- |
| Finding ID | AF-001 |
| Owner | API owner |
| Risk | Unauthorized access to tenant-scoped evidence |
| Ticket | `issues/AF-001-broken-access-control.md` |
| Priority | P1 |
| Discovery-phase handoff | Ticket prepared for remediation planning and implementation in the next section |
| Validation reference | Before/after evidence for the tenant-mismatch request in `Evidence Screenshots/` |

## Visual Evidence

<p align="center">
  <table>
    <tr>
      <th align="center">Before proof</th>
      <th align="center">After proof</th>
    </tr>
    <tr>
      <td align="center"><img src="../Evidence%20Screenshots/BAC-code-before.png" alt="AF-001 code before" width="480" /></td>
      <td align="center"><img src="../Evidence%20Screenshots/BAC-code-after.png" alt="AF-001 code after" width="480" /></td>
    </tr>
    <tr>
      <td align="center"><img src="../Evidence%20Screenshots/BAC-before-tenant-mismatch.png" alt="AF-001 Burp before" width="480" /></td>
      <td align="center"><img src="../Evidence%20Screenshots/BAC-webapp-after-403.png" alt="AF-001 webapp after" width="480" /></td>
    </tr>
  </table>
</p>

## Full Vulnerability Reports

- `reports/appsec-findings-report.md`
- `reports/owasp-top-10-mapping.md`
- `reports/remediation-plan.md`
- `reports/secure-sdlc-nist-mapping.md`
- `issues/`
