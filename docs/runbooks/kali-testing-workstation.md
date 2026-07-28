# Kali Testing Workstation Setup

Use the Kali VM as the authorized offensive-security workstation for the lab. Do not run active testing from the production workstation unless you intentionally mirror the same tooling and scope controls there.

## Purpose

This runbook keeps the tester side simple: connect to the Kali VM, verify the tools, and use the VM for passive discovery, baseline scanning, and manual validation once the Azure lab endpoint is available.

## SSH Access

If the Kali VM exposes SSH, connect from this workstation with the VM's lab-only address or hostname.

Example pattern:

```bash
ssh <kali-user>@<kali-hostname-or-ip>
```

If SSH is not enabled, use the local console or VM remote access path already configured on the host machine.

## Tool Checks On Kali

Verify the tools before starting the assessment:

```bash
nmap --version
zap-baseline.py -h
burpsuite
```

If Burp Suite Community is not installed, install it from the Kali package repositories or the approved installer path for that VM.

## Assessment Flow

1. Confirm the lab hostname and synthetic test account details.
2. Run passive discovery against the lab endpoint.
3. Run ZAP Baseline before any active testing.
4. Use Burp Suite for controlled manual inspection only.
5. Record any validated finding in the finding template and workbook.

## Safety Rules

- Keep all activity within the isolated lab scope.
- Do not target production systems from the Kali VM.
- Do not launch destructive payloads or high-volume scans.
- Preserve evidence in the lab findings workflow only.
