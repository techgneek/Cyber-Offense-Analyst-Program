# Broken Access Control Remediation

This write-up expands the broken access control scenario surfaced in the main README’s security testing section. Use the README for the program-level story and this document for the deeper before/fix/after detail.

## Overview

This investigation package is the archive home for a training exercise focused on broken access control and IDOR-style evidence lookup.

The concrete resource is the compliance evidence store, because it already holds real object-like records that make the exercise realistic.

## Featured Training Question

- How Do We Fix Broken Access Control On Evidence Lookup?

## What The Scenario Looks Like

A request asks for a specific evidence record by ID. In the training edition, the vulnerable route will return that record even if the requesting actor should not be allowed to see it.
The request path is intentionally multi-tenant shaped so the broken access is easy to spot in Burp: the tenant in the path does not match the owner of the object being returned.

That gives us a realistic object-level authorization problem to fix, document, and retest.

## Practice Goal

Show how the case changes when the route is protected with an authorization check.

For the exact Burp steps, use [the Burp workflow](burp-workflow.md).
For the ticket-style writeup, use [the example ticket](example-ticket.md).

## Suggested Learning Flow

1. Capture the before state.
2. Show the unauthorized lookup.
3. Add the access-control check.
4. Retest the same lookup.
5. Record the evidence.

For the realistic request shape, use `/api/tenants/<tenantId>/compliance/evidence/<evidenceId>`.

## Evidence To Store

Use the repository evidence folder for screenshots and notes tied to the exercise.

Suggested evidence order:

1. `Evidence Screenshots/BAC-code-before.png`
2. `Evidence Screenshots/BAC-before-tenant-mismatch.png`
3. `Evidence Screenshots/BAC-code-after.png`
4. `Evidence Screenshots/BAC-after-tenant-mismatch-fix.png`
5. `Evidence Screenshots/BAC-webapp-after-403.png`

## Case File Questions

- Which object was exposed?
- What access rule should have applied?
- What proof showed the fix worked?
