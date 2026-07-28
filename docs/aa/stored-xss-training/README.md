# Stored XSS Example Ticket

This write-up expands the stored XSS scenario surfaced in the main README’s security testing section. Use the README for the program-level story and this document for the deeper before/fix/after detail.

## Title
Training Note Content Was Rendered Without Sanitization, Then Fixed by Escaping or Sanitizing the Sink

## Summary
This training-only investigation documents a stored cross-site scripting scenario in the lab. A note board intentionally renders note content as HTML so the same payload can be observed before remediation, then validated again after the sink is fixed.

## Impact
- A note body can execute script or event-handler payloads when rendered unsafely.
- The training board demonstrates how a persisted payload can affect later viewers of the same lab page.
- After remediation, the board should render the same content as inert text and no longer execute browser-side script.

## Evidence Index

| Artifact | Purpose |
| --- | --- |
| `Evidence Screenshots/XSS-code-before.png` | Vulnerable render path before sanitization |
| `Evidence Screenshots/XSS-before-note.png` | Stored payload before remediation |
| `Evidence Screenshots/XSS-code-after.png` | Updated render path with escaping or sanitization |
| `Evidence Screenshots/XSS-after-note.png` | Same payload rendered safely after the fix |
| `Evidence Screenshots/XSS-burp-retest.png` | Burp retest showing the payload is no longer executable |

## Findings Mapping

| Framework | Mapping | Notes |
| --- | --- | --- |
| OWASP Top 10 | A03 Injection | XSS remains part of the injection class |
| OWASP Top 10 | A08 Software and Data Integrity Failures | Only if the surrounding flow is used to persist or replay untrusted markup |
| CWE | CWE-79 Improper Neutralization of Input During Web Page Generation | Direct fit |
| CWE | CWE-116 Improper Encoding or Escaping of Output | Primary remediation class |
| CVE | N/A | Custom lab code; no public CVE assigned |
| MITRE ATT&CK | N/A | No clean ATT&CK mapping is required for this lab demonstration |

## DevSecOps Lifecycle

| Phase | What happened in this lab | Evidence / artifact |
| --- | --- | --- |
| Plan | Scoped a training-only stored XSS exercise for the isolated lab | This ticket and the AA archive |
| Code | Added the unsafe training sink and note storage path | `server.ts` and the XSS workbench component |
| Build | Verified the app still builds after adding the training surface | Lab build output |
| Test | Stored the payload and confirmed the browser rendered the unsafe note | Before-state screenshot |
| Release | Packaged the lab build for the XSS exercise | Fixed lab artifact |
| Deploy | Updated the isolated lab runtime | Lab deployment record |
| Operate | Kept the training board available only in the lab environment | Training-mode lab page |
| Monitor | Confirmed the browser behavior through manual retest | Burp and browser screenshots |
| Remediate | Record the fix after sanitizing the sink and retain the evidence trail | This ticket |

## Remediation Notes
The intended fix is narrow: keep the note feature, but render the stored content as escaped text or sanitize the HTML before display. The rest of the training board can remain unchanged.

## Retest Result
After remediation, the same stored payload should appear as inert text and no longer execute in the browser. The retest evidence should show the same note content rendered safely.