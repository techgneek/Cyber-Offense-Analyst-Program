# Phase 7 Checklist

Use this checklist while working remediation and retesting for the isolated AetosAI lab.

## Step 1: Confirm The Target

- Confirm the validated finding is still the one being worked.
- Confirm the remediation is limited to the lab baseline.
- Confirm the evidence path is ready before making changes.

## Step 2: Apply The Smallest Fix

- Keep the change set narrow and reviewable.
- Avoid introducing unrelated cleanup into the same pass.
- Preserve the lab-only origin and origin allowlist behavior.

## Step 3: Retest The Result

- Rerun the exact checks that proved the issue before.
- Capture before-and-after proof for the same endpoints.
- Record whether the header, control, or behavior now matches the expected state.

## Step 4: Update Evidence And Metrics

- Update the finding record.
- Update the workbook row.
- Save the evidence in the lab report trail.
- Update the phase metrics summary.