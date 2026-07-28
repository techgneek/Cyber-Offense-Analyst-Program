# Insecure CORS Policy Remediation

## Overview

This investigation package demonstrates how to spot, remediate, and retest a common OWASP Top 10 security misconfiguration: an insecure CORS policy.

Use it as the main example in the repository README when you want one concrete case, then keep the deeper notes here in the AA archive.

For the hands-on worksheet, open [the CORS remediation worksheet](worksheet.md).

## What The Scenario Looks Like

The lab backend is expected to allow only approved frontend origins such as `http://localhost:3000` during local testing. A risky configuration would reflect an untrusted origin instead of rejecting it.

The practice question for the mentor is:

- How Do We Remediate An Insecure CORS Policy?

## Recommended Learning Order

1. Read the worksheet.
2. Capture the before-state screenshot.
3. Apply or verify the fix.
4. Retest the same endpoint.
5. Write the short case notes.

## Before State

Capture a request that sends a hostile or unapproved origin, such as `https://example.com`, and note the response headers.

The evidence should answer one question:

- Does the server reflect the untrusted origin or keep it out of the response?

## Remediation

Keep the fix narrow:

- Restrict `FRONTEND_ORIGINS` to approved lab origins.
- Preserve the allowlist behavior for local development.
- Avoid broad wildcard origin settings unless the lab explicitly requires them.

## Retest

Re-run the same request with the same hostile origin and confirm that the response no longer reflects it.

Recommended proof points:

- `curl -i -H 'Origin: https://example.com' http://127.0.0.1:3000/api/health`
- `curl -i -H 'Origin: http://localhost:3000' http://127.0.0.1:3000/api/health`

## Evidence To Store

Use the existing screenshot set in [Evidence screenshots](../../../Evidence%20screenshots) as the visual record for this investigation.

Helpful files already in the repository:

- `CORS - GET :api:health.png`
- `CORS - GET :api:health (example.com).png`

## What To Write In The Case File

Keep the write-up short and factual:

- What was the bad behavior?
- What change fixed it?
- What proved the fix worked?

## Suggested Outcome

When the issue is remediated, the response should only reflect approved lab origins and should not echo untrusted third-party origins.