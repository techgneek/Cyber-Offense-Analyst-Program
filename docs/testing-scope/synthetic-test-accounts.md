# Synthetic Test Accounts And Data

This lab clone must not use production identities, customer content, or live credentials. Use only synthetic data for local validation and later Azure testing.

## Recommended Lab Profiles

### Lab Analyst

- `soc2_actor_id`: `lab-analyst-01`
- `soc2_actor_type`: `human`
- `soc2_actor_role`: `analyst`
- `soc2_actor_scope`: `chat:write`
- `soc2_data_classification`: `internal`
- `soc2_auth_method`: `header_assertion`
- `soc2_auth_result`: `success`

### Lab Tester

- `soc2_actor_id`: `lab-tester-01`
- `soc2_actor_type`: `human`
- `soc2_actor_role`: `tester`
- `soc2_actor_scope`: `chat:write,voice:use,redteam:audit`
- `soc2_data_classification`: `internal`
- `soc2_auth_method`: `header_assertion`
- `soc2_auth_result`: `success`

### Lab Observer

- `soc2_actor_id`: `lab-observer-01`
- `soc2_actor_type`: `human`
- `soc2_actor_role`: `observer`
- `soc2_actor_scope`: `read:only`
- `soc2_data_classification`: `public`
- `soc2_auth_method`: `header_assertion`
- `soc2_auth_result`: `success`

## Synthetic Data Sources

- Built-in scenario list from `/api/scenarios`
- Local browser evidence cache
- Local compliance and correction history
- Generated red-team audit history from lab-only test runs

## Data Handling Rules

- Do not import production logs, transcripts, tickets, or customer data.
- Do not reuse live API tokens or service principals.
- Do not store secrets in browser localStorage.
- Keep any seed data readable, disposable, and obviously synthetic.
