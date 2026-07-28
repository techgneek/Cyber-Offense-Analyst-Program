# Stored XSS Worksheet

Use this worksheet to practice the full stored XSS discovery, evidence capture, remediation, and retest flow.

## Before State

- Open the training board in lab mode.
- Submit a note with a harmless stored XSS payload such as `<img src=x onerror=alert(1)>`.
- Capture the rendered note and the browser behavior.

Suggested evidence:

- `Evidence Screenshots/XSS-code-before.png`
- `Evidence Screenshots/XSS-before-note.png`

## Remediation

- Keep the feature, but change the sink so note content is escaped or sanitized.
- Avoid broad rewrites outside the note-rendering path.

For the current lab implementation, the vulnerable sink is the training board in [src/components/XssWorkbench.tsx](../../../src/components/XssWorkbench.tsx).

## Retest

- Re-submit the same payload.
- Confirm the browser no longer executes the payload.
- Capture the safe render and the updated code path.

Suggested evidence:

- `Evidence Screenshots/XSS-code-after.png`
- `Evidence Screenshots/XSS-after-note.png`
- `Evidence Screenshots/XSS-burp-retest.png`

## Notes

- Keep this exercise in the archive and training mode only.
- Do not move it into the main README unless you later decide it should become the featured example.