# Broken Access Control Burp Workflow

Use this workflow to run the training exercise end to end in Burp Suite Community.

## Goal

Find the evidence lookup weakness, capture the before state, apply the fix, retest, and record the result.

## Preconditions

- Training mode is enabled in the isolated lab: `LAB_TRAINING_MODE=true`.
- The app is running locally or in the isolated Azure lab.
- Burp Suite is configured as the browser proxy.
- You are using only synthetic test identities and lab data.

## Step 1: Identify A Real Object

Open the compliance evidence list first so you can select a concrete record ID and note the owner actor ID from the response.

In Burp:

1. Open the browser through Burp Proxy.
2. Browse to the app and open the compliance evidence panel or request the evidence endpoint directly.
3. In Proxy > HTTP history, find the `GET /api/compliance/evidence?limit=5` request.
4. Send the request to Repeater.
5. Confirm the response includes one or more `evidenceId` values.

Request example:

```http
GET /api/compliance/evidence?limit=5 HTTP/1.1
Host: 127.0.0.1:3000
X-Actor-Id: lab-analyst-01
X-Actor-Type: human
X-Actor-Role: analyst
X-Actor-Scope: read:only
X-Data-Classification: internal
X-Auth-Method: header_assertion
X-Auth-Result: success
```

From the response, copy one `evidenceId` value and the corresponding `actorId` value. Those two values let you build a realistic tenant/object request.

What to highlight:

- the selected `evidenceId`
- the `actorId` tied to that record
- the fact that this is a real object record, not a synthetic placeholder

## Step 2: Capture The Before State

Send the training-only lookup with a tenant ID that does not match the selected record owner.

In Burp Repeater:

1. Edit the path so the tenant segment is different from the owner you just found.
2. Keep the same `evidenceId`.
3. Keep the request headers consistent so the tenant mismatch is obvious.
4. Send the request and inspect the response body.

Request example:

```http
GET /api/tenants/<different-tenant>/compliance/evidence/<evidenceId> HTTP/1.1
Host: 127.0.0.1:3000
X-Actor-Id: lab-observer-01
X-Actor-Type: human
X-Actor-Role: observer
X-Actor-Scope: read:only
X-Data-Classification: internal
X-Auth-Method: header_assertion
X-Auth-Result: success
```

What to capture:

- the request
- the response code
- the leaked evidence body if the route returns it
- the actor identity and scope
- the tenant ID used in the path
- the record owner actor ID from the list response

What to highlight in the screenshot:

- the tenant in the URL path
- the evidence ID in the URL path
- the `200 OK` status line
- the leaked record body showing the object returned anyway

Expected vulnerable behavior in training mode:

- `200 OK`
- response includes the selected record instead of denying access
- the path clearly shows the tenant/object mismatch

Suggested screenshot name:

- `BROKEN-ACCESS-before.png`

## Step 3: Apply The Fix

The remediation should add object-level authorization logic so the route only returns the record when the actor is allowed to read that specific evidence item.

In code review, the reviewer should look for the actual ownership check at the route boundary, not just comments or logging.

Keep the fix narrow:

- check the actor identity and scope
- check that the tenant in the path matches the record owner or an approved access rule
- deny unauthorized access with `403 Forbidden`
- preserve the rest of the training system unchanged

## Step 4: Retest The Same Request

Re-run the same request from Step 2.

In Burp Repeater:

1. Re-send the same request after the fix is deployed.
2. Confirm the status changes to `403 Forbidden`.
3. Confirm the body no longer includes the record payload.

Expected retest result after the fix:

- `403 Forbidden`
- no evidence body is returned

What to highlight in the screenshot:

- the same URL path as before
- the changed status code
- the absence of the leaked object payload

Suggested screenshot name:

- `BROKEN-ACCESS-after.png`

## Step 5: Record Validation Notes

Write down:

- which `evidenceId` you used
- which tenant ID you used
- which actor and scope you used
- the response before the fix
- the response after the fix
- the OWASP and CWE mapping

## Step 6: Update The Workbook

Record the finding in the workbook with:

- `OWASP Top 10: Broken Access Control`
- `API1 Broken Object Level Authorization`
- `CWE-639` or `CWE-284`
- the selected evidence ID
- the before/after response codes
