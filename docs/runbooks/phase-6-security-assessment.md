# Phase 6 Security Assessment Runbook

This runbook describes the first non-destructive security assessment pass for the isolated AetosAI lab. It is intentionally limited to passive discovery, baseline scanning, and manual validation of findings that occur within the lab scope.

## Prerequisites

- The lab is deployed into its isolated Azure subscription and resource group.
- The lab hostname or container app URL is known.
- Synthetic test accounts are configured.
- The rules of engagement have been reviewed.
- The test workstation is the authorized Kali VM.
- The Kali workstation setup has been reviewed in [kali-testing-workstation.md](kali-testing-workstation.md).

## Assessment Sequence

### 1. Passive Discovery

Review the application surface without sending destructive payloads.

Suggested checks:

- Open the lab hostname in a browser and record visible routes and controls.
- Inspect page source, loaded scripts, and response headers.
- Verify TLS configuration and the generated Azure endpoint.
- Enumerate documented API routes from the app and docs.

You can also run the helper script from the lab repo once the lab hostname is known:

```bash
Phase 6 discovery workflow against the lab endpoint.
```

The helper accepts a hostname, `host:port`, or full URL and will use the safe service-detection port for Nmap.

### 2. Safe Service Enumeration

Use Nmap service detection only against the lab hostname or IP. If you run the helper script above, it includes the same safe service detection step.

Suggested command pattern:

```bash
nmap -sV -Pn <lab-hostname-or-ip>
```

### 3. OWASP ZAP Baseline Scan

Run a baseline-only ZAP scan first.

Suggested command pattern:

```bash
zap-baseline.py -t https://<lab-hostname> -r zap-baseline-report.html
```

### 4. Manual Request And Response Review

Inspect a small number of representative requests:

- `GET /api/health`
- `GET /api/scenarios`
- `POST /api/chat`
- `GET /api/live` handshake behavior

Focus on:

- Response headers
- Cache behavior
- CORS and origin handling
- Authentication evidence in headers
- Visible error handling

### 5. Manual Validation In Burp Suite

Use Burp Suite Community on the Kali VM only for passive inspection or controlled, in-scope replay of requests.

Do not use Burp to launch destructive or high-volume attacks in the first assessment pass.

### 6. Record Findings

Capture validated issues in [../../findings/templates/finding-template.md](../../findings/templates/finding-template.md) and log tracking rows in [../../findings/templates/analyst-investigation-workbook.csv](../../findings/templates/analyst-investigation-workbook.csv).

## Initial Validation Targets

The first assessment pass should prefer non-destructive checks such as:

- Missing or weak security headers
- Origin and CORS misconfiguration
- Excessive information disclosure in health or error responses
- Weak session or identity evidence for lab-only flows
- Misconfigured TLS or endpoint exposure

## Do Not Do In Phase 6

- Active exploitation of production systems
- Destructive fuzzing
- Uncontrolled brute force
- Denial-of-service testing
- Attempts to bypass lab guardrails

## Evidence Expectations

- Include tool name and date.
- Include the tested endpoint or host.
- Include the specific request and response details that justified the finding.
- Preserve screenshots or exports only when needed for remediation tracking.
