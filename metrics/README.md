# Metrics

This directory is reserved for lightweight lab metrics and summaries. The numbers should be derived from validated findings, workbook records, and closure evidence so the reporting stays tied to real analyst activity.

The live source is the [analyst investigation workbook](../findings/analyst-investigation-workbook.csv). Its three records are separate findings: F-001 is the baseline header-hardening finding, while AF-001 and AF-002 are the two featured application-security findings.

## Initial Metrics To Track

- Findings by severity
- Findings by tool
- Findings by OWASP category
- Validated versus unvalidated findings
- False-positive rate
- Open versus remediated findings
- Findings inside and outside SLA
- Mean time to remediate
- Retest pass rate
- Risk reduction before and after remediation

## Phase 7 Summary

- [Phase 7 metrics summary](phase-7-summary.md)

## Notes

Keep the first version simple. A spreadsheet or CSV summary is enough until the lab has a stable stream of validated findings.

Do not infer undocumented dates, SLA outcomes, severities, or scores when calculating metrics. Report those fields as not documented until closure evidence provides them.
