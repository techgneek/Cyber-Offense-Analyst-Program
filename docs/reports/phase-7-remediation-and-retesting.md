# Phase 7 Remediation And Retesting

## Summary

Phase 7 focused on the smallest practical remediation set for the validated lab finding from Phase 6. The goal was to confirm that the previously observed header exposure was removed, the hardening headers remained in place, and the lab narrative still matched the actual runtime behavior.

## Remediation Target

- F-001 - Express fingerprinting and missing hardening headers

## Remediation Outcome

The finding was remediated by disabling framework fingerprinting and adding baseline response hardening. The application and finding record now reflect the closed state, and the retest evidence confirms that the header exposure is no longer present.

## Retest Checks

The following checks were used to confirm the remediation result:

- `curl -sI http://127.0.0.1:3000/`
- `curl -sI http://127.0.0.1:3000/api/health`
- `curl -i http://127.0.0.1:3000/api/health`

The retest confirmed that `X-Powered-By` is absent and the baseline headers remain present on the lab root and health responses.

## Evidence Capture

This phase uses the same evidence trail as the earlier assessment notes, with the before-and-after response headers serving as the primary proof of remediation.

For the lab record, the important result is that the remediation is observable in the live service and in the closed finding entry.

## Metrics Update

| Metric | Before Phase 7 | After Phase 7 |
| --- | --- | --- |
| Open findings | 1 | 0 |
| Remediated findings | 0 | 1 |
| Retest pass rate | 0% | 100% |
| Closed findings | 0 | 1 |

## Exit Status

Phase 7 is complete for the current lab baseline. The remediation has been applied, the retest checks passed, and the repo now carries a closed finding record plus a simple metrics summary.