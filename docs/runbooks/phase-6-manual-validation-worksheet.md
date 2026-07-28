# Phase 6 Manual Validation Worksheet

Use this worksheet during the first safe validation pass after passive discovery. Keep the work limited to the isolated lab and the synthetic test accounts defined in the rules of engagement.

## Goal

Confirm whether the passive observations are real, reproducible, and relevant enough to record as findings or retest evidence.

## Validation Targets

- Response headers on `/` and `/api/health`
- CORS and origin handling on API responses
- TLS behavior on the generated Azure hostname
- Visible error handling on a small set of safe requests
- WebSocket upgrade behavior on `/api/live`

## Safe Request Set

Record request and response details for:

- `GET /`
- `GET /api/health`
- `GET /api/scenarios`
- `POST /api/chat`
- `GET /api/live` handshake only

## Observation Fields

For each request, capture:

- Timestamp
- Tool used
- Target hostname or IP
- Request path and method
- Response status code
- Response headers of interest
- Any visible error text
- Whether authentication evidence was required
- Whether the result is reproducible

## Manual Review Questions

Ask these questions while reviewing the response:

1. Does the response reveal unnecessary implementation details?
2. Are baseline hardening headers present?
3. Is the allowed origin list aligned with the lab environment only?
4. Are synthetic headers accepted and logged as expected?
5. Does the response leak data that should stay local to the lab?

## Evidence Rules

- Capture only the minimum evidence needed to support the finding.
- Keep screenshots and exports in the designated findings folders.
- Do not paste production values into notes or screenshots.
- Redact secrets before storing any artifact.

## Retest Criteria

A candidate finding is ready for retest when:

- The issue is reproducible in the lab.
- The impacted endpoint is clearly identified.
- The impact can be described without speculation.
- A remediation change can be tested without touching production.

## Suggested Reporting Path

1. Update the finding template.
2. Add the row to the analyst workbook.
3. Record before-and-after evidence.
4. Mark the retest result once the remediation is applied.
