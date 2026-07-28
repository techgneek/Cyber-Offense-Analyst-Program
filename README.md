<h1 align="center">Cyber Offense Analyst Program</h1>

<p align="center">
  A lifecycle-first security program showcase built to look and read like an enterprise investigation workflow.
</p>

<p align="center">
  <img src="docs/assets/aetosai-hero.png" alt="Cyber Offense Analyst Program hero image" width="1100" />
</p>

<p align="center">
  <img src="docs/assets/aetosai-architecture.svg" alt="Cyber Offense Analyst Program workflow diagram" width="1100" />
</p>

## Program Scope

This repository has been intentionally trimmed down to the artifacts that support the case-study narrative:

- the main README
- the visual evidence used in the narrative
- the hero / architecture visuals that support the opening section

The goal is to present a clean, visually appealing lifecycle program without shipping the application source code, infrastructure, deployment scripts, or CI/CD machinery.

## Inception State vs Completion State

| Inception State | Completion State |
| --- | --- |
| No focused case-study narrative. | A single, readable lifecycle story from discovery through closure. |
| Too much implementation detail for a program showcase. | A trimmed repository with visuals and ticket-style evidence. |
| Findings, evidence, and ownership lived in separate places. | Findings, visuals, and remediation flow are shown together in the main README. |
| The repo looked like a software project. | The repo now reads like an enterprise analyst program. |

## Security Testing Scenarios

Each scenario is written like an enterprise ticket: source, owner, priority, risk, remediation, and validation all appear in one place.

### 1) AF-001 — Broken Access Control on Tenant-Scoped Evidence Lookup

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

#### AF-001 Visual evidence

| Before | After |
| --- | --- |
| ![AF-001 code before](Evidence%20Screenshots/BAC-code-before.png) | ![AF-001 code after](Evidence%20Screenshots/BAC-code-after.png) |
| ![AF-001 Burp before](Evidence%20Screenshots/BAC-before-tenant-mismatch.png) | ![AF-001 Burp after](Evidence%20Screenshots/BAC-after-tenant-mismatch-fix.png) |
| ![AF-001 webapp after](Evidence%20Screenshots/BAC-webapp-after-403.png) |  |

#### AF-001 Ownership snapshot

| Field | Value |
| --- | --- |
| Finding ID | AF-001 |
| Owner | API owner |
| Risk | Unauthorized access to tenant-scoped evidence |
| Ticket | `issues/AF-001-broken-access-control.md` |
| Priority | P1 |
| Discovery-phase handoff | Ticket prepared for remediation planning and implementation in the next section |

### 2) AF-002 — Stored XSS in the Training Note Board

| Ticket Field | AF-002 Detail |
| --- | --- |
| Ticket source | `issues/AF-002-stored-xss-training-board.md` |
| Finding ID | AF-002 |
| Ticket phase | Discovery → Investigation → Remediation → Validation |
| Endpoint | `POST /api/training/xss-notes` and the notes rendering path in the web UI |
| Ownership and priority | Suggested owner: frontend/application owner, Priority: P1 |
| Problem statement | Stored note content was rendered as HTML, allowing untrusted markup to behave like executable browser content |
| OWASP linkage | OWASP A03: Injection / A08: Software and Data Integrity Failures |
| Risk statement | Persisted markup can execute in the browser, alter what analysts see, and weaken trust in the evidence trail |
| Recommended remediation | Render stored note content as inert text or sanitize the sink before display |
| Validation plan | Capture the vulnerable response, fix the sink, replay the same note path, and verify the payload is now harmless text |
| Definition of done | The same content renders safely, the workbook is updated, and the finding is closed with before/after evidence |

#### AF-002 Visual evidence

<p align="center">
  <table>
    <tr>
      <td align="center"><img src="Evidence%20Screenshots/XSS%20-%20:api:training:%20Before.png" alt="AF-002 Burp before" width="480" /></td>
      <td align="center"><img src="Evidence%20Screenshots/XSS%20-%20:api:training:%20After.png" alt="AF-002 Burp after" width="480" /></td>
    </tr>
    <tr>
      <td align="center"><img src="Evidence%20Screenshots/XSS-before-browser-vulnerable-state.png" alt="AF-002 browser before" width="480" /></td>
      <td align="center"><img src="Evidence%20Screenshots/XSS-after-browser-fixed-state.png" alt="AF-002 browser after" width="480" /></td>
    </tr>
  </table>
</p>

#### AF-002 Ownership snapshot

| Field | Value |
| --- | --- |
| Finding ID | AF-002 |
| Owner | Frontend/application owner |
| Risk | Stored browser-side execution from untrusted note content |
| Ticket | `issues/AF-002-stored-xss-training-board.md` |
| Priority | P1 |
| Discovery-phase handoff | Ticket prepared for remediation planning and implementation in the next section |

## Finding Intake, Risk Mapping, and Ownership

The repository now focuses on showing how a real enterprise workflow records a finding, assigns an owner, validates the fix, and closes the loop.

### What gets recorded

| Core Field | Why it matters |
| --- | --- |
| Finding ID and title | Gives the ticket a stable identity |
| Source and endpoint | Shows where the issue was observed |
| Owner and priority | Makes the handoff actionable |
| Evidence and reproduction steps | Lets another reviewer confirm the issue |
| Mapping to OWASP / CWE / ATT&CK | Connects the finding to industry language |
| Retest evidence and final disposition | Proves the case is closed, not just described |

### Ownership pattern

| Finding ID | Owner | Priority | Status |
| --- | --- | --- | --- |
| AF-001 | API owner | P1 | Closed |
| AF-002 | Frontend/application owner | P1 | Closed |

## Remediation and Validation Proof

The visual flow matters as much as the ticket text.

### Visual remediation workflow

| Stage | What the reviewer sees | Evidence |
| --- | --- | --- |
| Before | Vulnerable request or browser state | Burp capture, browser screenshot, code snapshot |
| Fix | Minimum code or configuration change | Diff, commit, or config update |
| After | Same path retested | Replayed Burp request, browser retest |
| Closure | Finding marked resolved | Workbook entry, report update, closure note |

### What the proof should show

- the vulnerable behavior in Burp or the browser
- the code or configuration change that removed the weakness
- the same path retested after the fix
- a final browser or HTTP result proving the behavior changed
- a workbook or finding record that marks the issue as closed only after the retest passes

## Evidence Index

| Area | Evidence |
| --- | --- |
| AF-001 | `Evidence Screenshots/BAC-code-before.png`, `Evidence Screenshots/BAC-before-tenant-mismatch.png`, `Evidence Screenshots/BAC-code-after.png`, `Evidence Screenshots/BAC-after-tenant-mismatch-fix.png`, `Evidence Screenshots/BAC-webapp-after-403.png` |
| AF-002 | `Evidence Screenshots/XSS - :api:training: Before.png`, `Evidence Screenshots/XSS-before-browser-vulnerable-state.png`, `Evidence Screenshots/XSS - :api:training: After.png`, `Evidence Screenshots/XSS-after-browser-fixed-state.png` |

Use the evidence index to keep the before / fix / after chain obvious at a glance.

## Lessons Learned / Program Outcome

This project is meant to show a complete Cyber Offense Analyst workflow rather than just a vulnerable app.

### What the program demonstrates

- how to assess an application before touching infrastructure
- how to capture evidence before, during, and after remediation
- how to document findings in a way that supports real analyst review
- how to connect evidence, ownership, and closure into a repeatable workflow

### What a reviewer should take away

- the program is intentional, isolated, and lab-only
- the workflow is repeatable
- the evidence is tied to real requests, real responses, and real code changes
- the repository is organized around a practical analyst lifecycle, not a toy demo

### Current outcome

The case study now reads as a full lifecycle: assess the risk, capture the evidence, assign ownership, remediate the issue, retest, and close it with supporting visuals.

## Program Demos and Supporting Notes

The repo intentionally keeps only the assets needed to tell the story visually.

- Hero image: `docs/assets/aetosai-hero.png`
- Architecture image: `docs/assets/aetosai-architecture.svg`
- Visual evidence: `Evidence Screenshots/`
