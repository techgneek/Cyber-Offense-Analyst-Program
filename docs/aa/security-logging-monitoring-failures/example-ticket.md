# Security Logging and Monitoring Failures Example Ticket

## Title
Lab Activity Lacked Sufficient Audit Visibility, Then Was Updated to Emit Clearer Security Telemetry and Reviewable Evidence

## Summary
This training-only investigation covers a security-logging-and-monitoring-failures scenario in the lab where a security-relevant action did not produce enough telemetry for reliable review. The remediation added narrow logging and evidence capture so the same action can now be observed, correlated, and reviewed without changing the core lab workflow.

## Impact
- Security-relevant activity could occur without enough audit visibility to support review.
- Missing or weak telemetry made it harder to confirm whether the control was triggered, denied, or investigated.
- After the fix, the lab produces clearer evidence for the same action path and supports follow-up analysis.

## Evidence Index

| Artifact | Purpose |
| --- | --- |
| `Evidence Screenshots/SLMF-code-before.png` | Before-state code path with insufficient telemetry |
| `Evidence Screenshots/SLMF-code-after.png` | After-state code path with improved logging and monitoring |
| `Evidence Screenshots/SLMF-before-event.png` | Before-state event or request showing limited audit visibility |
| `Evidence Screenshots/SLMF-after-event.png` | After-state event or request showing the added telemetry |
| `Evidence Screenshots/SLMF-verification.png` | Final validation screenshot for the monitored behavior |

## Findings Mapping

| Framework | Mapping | Notes |
| --- | --- | --- |
| OWASP Top 10 | A09 Security Logging and Monitoring Failures | Direct fit |
| CWE | CWE-778 Insufficient Logging | Primary fit for the missing audit trail |
| CWE | CWE-223 Omission of Security-Relevant Information | Applicable where important context was not captured |
| CWE | CWE-779 Logging of Excessive Detail | Only if the lab needed to balance visibility with data minimization |
| CVE | N/A | Custom lab code; no public CVE assigned |
| MITRE ATT&CK | N/A | No clean ATT&CK mapping is required for this telemetry-gap exercise |

## DevSecOps Lifecycle

| Phase | What happened in this lab | Evidence / artifact |
| --- | --- | --- |
| Plan | Defined a lab-only monitoring gap and decided to preserve the investigation in the archive | This ticket and the AA archive |
| Code | Added the narrow telemetry needed to make the security event observable | Updated application path |
| Build | Verified the app still builds after the logging change | Lab build output |
| Test | Replayed the same action before and after the fix to confirm the event is now visible | Before/after event screenshots |
| Release | Packaged the updated lab build with the telemetry change | Fixed lab artifact |
| Deploy | Updated the lab runtime to the monitored version | Lab deployment record |
| Operate | Kept the workflow available while exposing the security event for review | Running lab instance |
| Monitor | Confirmed the event now appears in logs, metrics, or audit evidence | Verification screenshot |
| Remediate | Documented the new logging behavior and preserved the evidence trail | This ticket |

## Remediation Notes
The fix adds only the telemetry required for review: meaningful security events are now captured with enough context to support audit and incident triage, while the underlying lab behavior remains the same.

## Retest Result
The same security-relevant action that previously lacked visibility now produces reviewable telemetry and evidence. The verification screenshot shows the monitoring gap has been closed for the lab scenario.