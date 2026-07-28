# Phase 6 Initial Security Assessment

## Summary

The first passive assessment pass was completed against the local lab application instance and confirmed that the service started cleanly, reported healthy status, and exposed the documented application routes.

An external passive validation pass was then completed against the Azure-hosted lab endpoint. The deployed app returned healthy responses, preserved the hardening headers, exposed the expected scenarios catalog, and did so without any active exploitation attempts.

## Commands Run

- `npm run dev` with `GEMINI_API_KEY=dummy` and `DISABLE_HMR=true`
- `curl -i http://127.0.0.1:3000/api/health`
- `curl -i http://127.0.0.1:3000/api/scenarios`
- `curl -I http://127.0.0.1:3000/`
- `nmap -sV -Pn -p 3000 127.0.0.1`
- Phase 6 discovery workflow executed against the lab endpoint.

## Tool Availability

- OWASP ZAP baseline tooling was not available in the current workstation environment, so the first pass used the passive checks and service enumeration above.
- Burp Suite manual validation was completed against the Azure lab endpoint and captured in the evidence set above.

## Observations

- The application started and returned a healthy health response.
- The health endpoint reported `websocket: ready` and `chainValid: true`.
- The scenarios endpoint returned the expected scenario catalog.
- Nmap identified the service as `Node.js Express framework` on TCP port 3000.
- The header-hardening issue was remediated locally and retested successfully.
- The root and health responses now include baseline headers such as `X-Content-Type-Options`, `Referrer-Policy`, `X-Frame-Options`, and `Permissions-Policy`, and no longer expose `X-Powered-By`.
- Trusted lab origins are reflected by CORS, while untrusted origins do not receive `Access-Control-Allow-Origin`.
- The Phase 6 discovery helper was updated to accept `host:port` inputs and completed the local passive scan without the earlier Nmap target parsing failure.
- The Azure-hosted endpoint returned `HTTP/2 200` for `/`, `/api/health`, and `/api/scenarios`, preserved the same hardening headers, and reported `chainValid: true` with `websocket: ready`.
- The Azure-hosted endpoint did not echo `Access-Control-Allow-Origin` for the `https://example.com` probe, which matches the server allowlist behavior because only local defaults or explicitly configured `FRONTEND_ORIGINS` values are reflected.
- The `/api/live` Repeater probe is a WebSocket upgrade check rather than a normal JSON API request, so a blank or short-lived response pane is expected after the HTTP/1.1 upgrade attempt.
- Safe Nmap service detection against the live hostname reported TCP port 3000 as filtered, which is consistent with the container app ingress behavior rather than an exposed direct service port.
- The deployed health response reported `gemini: missing_key`, which is expected for the current lab configuration because the secret is intentionally not supplied in this environment.

## Evidence Capture

The manual screenshots were saved in [Evidence screenshots](../../Evidence%20screenshots) to keep the Burp evidence organized and easy to review later.

- `GET :api:health.png` shows the live health response with baseline hardening headers and the service status JSON.
- `CORS - GET :api:health.png` shows the approved lab origin reflected by CORS on `/api/health`.
- `CORS - GET :api:health (example.com).png` shows that an untrusted origin is not reflected by CORS.
- `POST :api:chat.png` shows the harmless chat probe denied with `SOC2_AUTH_REQUIRED` and `401 Unauthorized`.
- `GET :api:live.png` shows the WebSocket upgrade check for `/api/live`, where a blank or short-lived response pane is expected after the HTTP/1.1 upgrade attempt.

Together with the passive scan snapshot below, these captures show that the service is live, the lab origin policy is enforced, the chat endpoint requires explicit authentication evidence, and the WebSocket path is present even when Repeater does not keep a long response body open.

### ZAP Baseline Snapshot

This snapshot ties the passive scan result back to the evidence trail so the assessment reads as one flow:

| Scan Area | What ZAP Found | Takeaway |
| --- | --- | --- |
| Seeded lab paths | 5 in-scope items, including the app root, `robots.txt`, `sitemap.xml`, and static assets | The lab is reachable and the crawler sees the expected surface |
| Static assets | `assets/index-CTlB_shT.css` and `assets/index-LZ6gpdFP.js` | The frontend is loading normally |
| Out-of-scope references | 23 external or framework references were filtered as out of scope | ZAP stayed focused on the lab target instead of chasing third-party URLs |
| Overall result | Passive discovery completed without unexpected in-scope findings | Good baseline evidence for the assessment narrative |

## Recorded Finding

- [F-001 - Express fingerprinting and missing hardening headers](../../findings/closed/F-001-express-fingerprinting-and-missing-hardening-headers.md)

## Scope Notes

- No destructive testing was performed.
- No production endpoint was contacted.
- No brute force, fuzzing, or exploit attempts were made.

## Phase 6 Wrap-Up

Phase 6 is complete for the current lab baseline. The passive discovery, manual validation, evidence capture, and finding retest are all reflected in the report, the workbook, and the screenshots. The next step is to move into the next phase with the current controls, findings, and lab state as the baseline.
