# Rules Of Engagement

## Purpose

This document defines the authorized scope for the isolated AetosAI security lab. The lab exists to support legitimate defensive testing and analyst training only.

## Authorized Targets

- The Azure lab resource group created for this project
- The lab container app and its generated Azure hostname
- The lab Log Analytics workspace and related lab-only telemetry
- The synthetic test accounts and headers defined for the lab
- The lab copy of the AetosAI application running in the isolated environment

## Prohibited Targets

- The live production AetosAI application
- `aetosai.io` and any production subdomains
- Production GitHub secrets, deployment environments, or release workflows
- Production databases, logs, customer conversations, or customer files
- Any third-party system not owned by the project owner

## Permitted Test Types

- Passive attack-surface discovery
- Header review and security control inspection
- Safe API enumeration within the lab scope
- OWASP ZAP Baseline scans
- Manual Burp Suite inspection of lab traffic
- Nmap service detection against the lab hostname or IP
- SAST, SCA, secrets scanning, container scanning, and IaC scanning on the lab repository
- Validation of documented findings in the lab only

## Prohibited Test Types

- Denial-of-service testing beyond the built-in lab guardrails
- Uncontrolled brute force or resource exhaustion
- Testing against production systems or production identities
- Destructive attacks against shared Azure services
- Malware execution or payloads that would impact other systems
- Credential theft or reuse of real credentials
- Any attempt to bypass safety controls outside the lab

## Test Accounts

Use only synthetic test identities and headers from [synthetic-test-accounts.md](synthetic-test-accounts.md).

Recommended profiles:

- `lab-analyst-01`
- `lab-tester-01`
- `lab-observer-01`

## Testing Hours

- Testing may be conducted during scheduled lab windows or any agreed training session.
- If a stricter schedule is later required, record it here before any active testing begins.

## Data Handling Rules

- Never import production data into the lab.
- Never store production secrets, tokens, or API keys in the lab.
- Never copy customer PII, conversations, or logs into the test environment.
- Use synthetic evidence and lab-only findings records.
- Keep screenshots and exports limited to what is needed for remediation tracking.

## Emergency Stop Procedure

If testing becomes unsafe, exceed scope, or creates an unexpected risk:

1. Stop the active test immediately.
2. Stop the lab using the lifecycle command or Azure portal control for the relevant hosting service.
3. Preserve current evidence and notes.
4. Report the issue before resuming any testing.

## Evidence Handling Requirements

- Record discovery time, tested endpoint, tool used, and exact conditions.
- Store evidence in the findings workflow or the designated evidence folder only.
- Do not alter evidence after capture except to redact sensitive data.
- Preserve before-and-after proof for any remediation validation.
- Keep evidence tied to the lab environment and the synthetic test profile used.
