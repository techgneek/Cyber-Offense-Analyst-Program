# Insecure CORS Policy Worksheet

Use this worksheet as the next hands-on step when practicing remediation and retesting.

## Goal

Show the full loop for a realistic OWASP Top 10 misconfiguration:

1. Confirm the bad behavior.
2. Apply the smallest safe fix.
3. Retest the same request.
4. Save the evidence.

## Step 1: Capture The Before State

Run the request with an untrusted origin and record the response.

```bash
curl -i -H 'Origin: https://example.com' http://127.0.0.1:3000/api/health
```

What to look for:

- Does the response reflect `https://example.com` in `Access-Control-Allow-Origin`?
- Does the response include `Vary: Origin`?
- Does the response avoid exposing a broad wildcard policy?

Save or confirm the screenshot:

- [CORS - GET :api:health (example.com).png](../../../Evidence%20screenshots/CORS%20-%20GET%20:api:health%20(example.com).png)

## Step 2: Apply The Fix

Make the narrowest safe change.

Example intent:

- Keep `FRONTEND_ORIGINS` limited to the approved lab frontend.
- Preserve local development origins only where needed.
- Avoid wildcard origin behavior unless the lab explicitly needs it.

If you want to practice the code change, make the adjustment in the CORS allowlist logic and restart the app.

## Step 3: Retest The Same Endpoint

Run the same request again after the fix.

```bash
curl -i -H 'Origin: https://example.com' http://127.0.0.1:3000/api/health
curl -i -H 'Origin: http://localhost:3000' http://127.0.0.1:3000/api/health
```

Expected result:

- The trusted local origin is reflected.
- The untrusted origin is not reflected.

Save or confirm the screenshot:

- [CORS - GET :api:health.png](../../../Evidence%20screenshots/CORS%20-%20GET%20:api:health.png)

## Step 4: Write The Notes

Use three short lines in the case file:

- What was the issue?
- What changed?
- What proved it?

## Step 5: Update Tracking

Record the result in the workbook and metrics summary:

- Mark the retest as passed.
- Note the remediation as complete.
- Add the evidence file names to the case file.

## Coaching Prompt

If you want the mentor to guide you, open the scenario called:

- How Do We Remediate An Insecure CORS Policy?
