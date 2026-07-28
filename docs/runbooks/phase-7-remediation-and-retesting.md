# Phase 7 Remediation And Retesting Runbook

This runbook describes the follow-up pass for the isolated AetosAI lab. The goal is to take the validated findings from Phase 6, apply the smallest remediation changes needed, and rerun the relevant checks to confirm the result.

Use [the Phase 7 checklist](phase-7-checklist.md) while working through the remediation steps.
If you want a guided learning version first, use [the Phase 7 practice exercise](phase-7-practice-exercise.md).

## Scope

Start with the validated finding that has already been closed in the workbook:

- F-001 - Express fingerprinting and missing hardening headers

If additional validated findings are added later, include them only when they can be remediated and retested without broadening the lab scope.

## Remediation Goals

- Keep the change set small and traceable.
- Preserve the lab-only origin and evidence model.
- Remove any implementation detail that is unnecessary for the assessment story.
- Re-run only the scans or checks that prove the remediation worked.

## Remediation Actions

For F-001, the intended remediation is already reflected in the application and finding record:

- Disable the `X-Powered-By` header.
- Add baseline hardening headers at the application layer.
- Keep CORS and origin handling limited to the approved lab environment.

## Retest Checks

Use the smallest relevant set of checks that proves the remediation result:

- `curl -sI http://127.0.0.1:3000/`
- `curl -sI http://127.0.0.1:3000/api/health`
- `curl -i http://127.0.0.1:3000/api/health`
- `curl -i http://127.0.0.1:3000/api/scenarios`

If you need a broader pass, rerun the safe discovery and passive review steps from Phase 6, but avoid introducing active testing unless a new finding requires it.

## Evidence To Capture

- Before-and-after header output.
- Any screenshot or export that proves the issue is no longer present.
- The updated finding record and workbook row.
- A short note describing exactly what changed and what was rechecked.

## Metrics To Update

- Open versus remediated findings
- Retest pass rate
- False-positive rate
- Findings inside and outside SLA
- Risk reduction before and after remediation

## Exit Criteria

Phase 7 is complete when the remediated findings have been retested, the evidence is stored, the workbook is current, and the metrics summary reflects the new state.