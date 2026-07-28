# Training Mode

Training mode is a separate, explicitly enabled track for controlled vulnerable practice.

## Default State

- Disabled by default.
- Off in the normal lab deployment.
- Only available when `LAB_TRAINING_MODE=true`.

## Current Training Exercise

- [Broken access control remediation report](../aa/broken-access-control/report.md)
- [Broken access control remediation](../aa/broken-access-control/README.md)
- [How Do We Fix A Training-Only Insecure CORS Route?](../aa/insecure-cors-policy/README.md)

## What Training Mode Is For

- Practicing discovery and remediation on intentionally vulnerable lab behavior.
- Capturing before-and-after evidence.
- Learning how to document the investigation trail without touching production systems.

## What Training Mode Is Not For

- Production deployment.
- Shared credentials or production data.
- Unscoped testing outside the isolated lab.

## Recommended Workflow

1. Turn on `LAB_TRAINING_MODE` only in the isolated training environment.
2. Open the training scenario in the app.
3. Capture the bad behavior.
4. Apply the smallest fix.
5. Retest the same request.
6. Save the screenshots and note the outcome.