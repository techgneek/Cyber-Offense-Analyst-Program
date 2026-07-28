# Cryptographic Failures Example Ticket

## Title
Sensitive Evidence and Secret Material Were Exposed Through Weak Handling, Then Protected by Narrower Storage and Retrieval Controls

## Summary
This training-only investigation documents a cryptographic-failures scenario in the lab where sensitive values were handled too loosely for the object they protected. The remediation tightened how the value is stored and returned so the same workflow no longer exposes the secret material in transit or in the response body.

## Impact
- Sensitive values were exposed with weaker-than-necessary protection before remediation.
- The lab flow risked disclosing secret material to anyone who could reach the training route or supporting evidence path.
- After the fix, the same request path no longer returns the sensitive value directly and instead requires the intended protected handling.

## Evidence Index

| Artifact | Purpose |
| --- | --- |
| `Evidence Screenshots/CF-code-before.png` | Vulnerable code path before the protection update |
| `Evidence Screenshots/CF-code-after.png` | Updated code path with narrower handling of the sensitive value |
| `Evidence Screenshots/CF-before-request.png` | Before-state request showing the weak handling behavior |
| `Evidence Screenshots/CF-after-request.png` | After-state request showing the protected behavior |
| `Evidence Screenshots/CF-verification.png` | Final validation screenshot for the remediated path |

## Findings Mapping

| Framework | Mapping | Notes |
| --- | --- | --- |
| OWASP Top 10 | A02 Cryptographic Failures | Direct fit |
| CWE | CWE-311 Missing Encryption of Sensitive Data | Sensitive value handling lacked sufficient protection |
| CWE | CWE-312 Cleartext Storage of Sensitive Information | Applicable where the value was exposed without adequate guarding |
| CWE | CWE-326 Inadequate Encryption Strength | Applicable if the original protection was too weak for the data class |
| CVE | N/A | Custom lab code; no public CVE assigned |
| MITRE ATT&CK | N/A | No clean ATT&CK mapping is needed for this storage/protection exercise |

## DevSecOps Lifecycle

| Phase | What happened in this lab | Evidence / artifact |
| --- | --- | --- |
| Plan | Defined a lab-only scenario around sensitive-value handling and agreed the proof would stay archive-only | This ticket and the related AA archive |
| Code | Narrowed how the sensitive value is stored, transmitted, or returned | Remediated application path |
| Build | Verified the app still builds after the protection change | Lab build output |
| Test | Replayed the same request before and after the fix to confirm the value is no longer exposed | Before/after request screenshots |
| Release | Packaged the fixed lab build for deployment or local validation | Fixed lab artifact |
| Deploy | Updated the lab runtime to the remediated version | Lab deployment record |
| Operate | Kept the training route available for review without exposing the secret directly | Running lab instance |
| Monitor | Confirmed the remediated flow no longer emits the sensitive material in logs or responses | Verification screenshot |
| Remediate | Documented the narrow fix and preserved the investigation trail | This ticket |

## Remediation Notes
The fix keeps the change narrow: sensitive material is no longer handled as a freely returned value, and the path now uses the intended protected representation or retrieval flow. The rest of the lab behavior remains unchanged.

## Retest Result
The same request path that previously exposed the protected value now returns the remediated behavior instead of the sensitive material. The verification screenshot shows the protected handling is in place and the original exposure is no longer present.