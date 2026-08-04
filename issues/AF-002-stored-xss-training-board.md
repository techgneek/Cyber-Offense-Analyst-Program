# AF-002 Ticket Walkthrough

## Ticket Summary

| Ticket Field | AF-002 Detail |
| --- | --- |
| Ticket source | `issues/AF-002-stored-xss-training-board.md` |
| Finding ID | AF-002 |
| Ticket phase | Discovery → Investigation → Remediation → Validation |
| Final status | Closed; remediation and retesting complete |
| Endpoint | `POST /api/training/xss-notes` and the notes rendering path in the web UI |
| Ownership and priority | Suggested owner: frontend/application owner, Priority: P1 |
| Problem statement | Stored note content was rendered as HTML, allowing untrusted markup to behave like executable browser content |
| OWASP linkage | OWASP A03: Injection / A08: Software and Data Integrity Failures |
| Risk statement | Persisted markup can execute in the browser, alter what analysts see, and weaken trust in the evidence trail |
| Recommended remediation | Render stored note content as inert text or sanitize the sink before display |
| Validation plan | Capture the vulnerable response, fix the sink, replay the same note path, and verify the payload is now harmless text |
| Definition of done | The same content renders safely, the workbook is updated, and the finding is closed with before/after evidence |

## AF-002 Risk and Control Mapping

| Mapping Area | AF-002 Context |
| --- | --- |
| OWASP mapping | `docs/aa/stored-xss-training/README.md` maps AF-002 to Injection and data-integrity risks because untrusted content is persisted and then replayed to the browser. |
| Secure SDLC / NIST context | The remediation and retest flow is documented in `docs/reports/phase-7-remediation-and-retesting.md` as a secure SDLC control loop. |
| Findings report linkage | The findings workbook and closed finding artifacts preserve the evidence trail and closure status. |

## AF-002 Ownership Snapshot

| Field | Value |
| --- | --- |
| Finding ID | AF-002 |
| Owner | Frontend/application owner |
| Risk | Stored browser-side execution from untrusted note content |
| Ticket | `issues/AF-002-stored-xss-training-board.md` |
| Priority | P1 |
| Closure state | Remediation complete; passing retest evidence recorded; final status Closed |
| Validation reference | Before/after evidence for the training note board in `Evidence Screenshots/` |

## Visual Evidence

| Before proof (vulnerable state) | After proof (remediated state) |
| --- | --- |
| ![AF-002 Burp before](../Evidence%20Screenshots/XSS%20-%20:api:training:%20Before.png) | ![AF-002 Burp after](../Evidence%20Screenshots/XSS%20-%20:api:training:%20After.png) |
| ![AF-002 browser before](../Evidence%20Screenshots/XSS-before-browser-vulnerable-state.png) | ![AF-002 browser after](../Evidence%20Screenshots/XSS-after-browser-fixed-state.png) |

## Full Vulnerability Reports

- `reports/appsec-findings-report.md`
- `reports/owasp-top-10-mapping.md`
- `reports/remediation-plan.md`
- `reports/secure-sdlc-nist-mapping.md`
- `issues/`
