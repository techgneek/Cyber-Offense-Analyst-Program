# Application Assessment

## Purpose

This assessment records the confirmed shape of the current AetosAI codebase so the Cyber Offense Analyst Lab can be built around facts from the repository instead of assumptions.

The application is already a non-trivial single-service web app, and the safest low-cost Azure path is to keep it containerized and deploy it to Azure Container Apps with scale-to-zero for idle periods.

## Confirmed Facts

### Stack And Runtime

- Language: TypeScript
- Frontend: React 19
- Build tool: Vite 8
- Server runtime: Node.js with Express
- WebSocket support: `ws`
- AI provider: Google Gemini via `@google/genai`
- Package manager: npm
- Dev command: `npm run dev`
- Build command: `npm run build`
- Start command: `npm start`
- Listen port: `3000`
- Bind address: `0.0.0.0`

### Packaging And Deployment

- A multi-stage [Dockerfile](../Dockerfile) already exists.
- The runtime container exposes port 3000 and runs the compiled server bundle in production.
- Terraform already exists under [infrastructure/](../infrastructure).
- The lab Terraform environment is wired for Azure Container Apps, not a VM-first design.
- GitHub Actions workflows already exist for deploy, security CI, dependency review, container security, and Terraform security.

### Routes And Behavior

Confirmed server routes include:

- `GET /api/scenarios`
- `GET /api/training/cors-check`
- `GET /api/tenants/:tenantId/compliance/evidence/:evidenceId`
- `GET /api/health`
- `GET /api/compliance/evidence`
- `GET /api/compliance/controls`
- `GET /api/compliance/chain/verify`
- `GET /api/shadow/status`
- `POST /api/shadow/exit`
- `POST /api/redteam/audit`
- `GET /api/redteam/history`
- `POST /api/chat`
- `GET /api/live` through WebSocket upgrade

The production build serves the frontend bundle from the compiled output and the server also handles the API and WebSocket bridge.

### Environment Variables

Confirmed runtime inputs and toggles include:

- `GEMINI_API_KEY`
- `TEXT_CHAT_MODELS`
- `SOC2_ENFORCEMENT_ENABLED`
- `SOC2_ENFORCEMENT_STRICT`
- `LAB_TRAINING_MODE`
- `FRONTEND_ORIGINS`
- `SHADOW_CONTAINMENT_ENABLED`
- `SHADOW_TESTER_TOKEN`
- `DOS_RATE_LIMIT_RPM`
- `DOS_MAX_PAYLOAD_CHARS`
- `DOS_MAX_HISTORY_TURNS`
- `NODE_ENV`
- `DISABLE_HMR`

### Authentication And Authorization Model

The app does not use a conventional identity provider in the inspected code. Instead, it depends on actor metadata and policy headers such as:

- `x-actor-id`
- `x-actor-type`
- `x-actor-role`
- `x-actor-scope`
- `x-data-classification`
- `x-auth-method`
- `x-auth-result`
- `x-shadow-session-id`
- `x-shadow-tester-token`

The backend applies SOC 2 policy checks and shadow containment logic around these values. The training-only tenant evidence route now returns `403 Forbidden` for low-privilege access.

### Storage And State

Confirmed state handling is lightweight:

- Server-side evidence is stored in memory.
- No relational database, Redis cache, or ORM is currently wired into the inspected app.
- Client-side compliance history and correction data are stored in browser localStorage.
- The app therefore does not require a database for the current lab baseline.

### External Services

The only confirmed external AI dependency is Google Gemini through `GEMINI_API_KEY`.

## Existing Security Tooling

The repo already includes a strong baseline for repository security and lab hygiene:

- CodeQL in [`.github/workflows/security-ci.yml`](../.github/workflows/security-ci.yml)
- Gitleaks secret scanning in CI and local hooks
- Dependabot for dependency updates
- npm audit capture in CI
- Docker image security checks in [`.github/workflows/container-security.yml`](../.github/workflows/container-security.yml)
- Terraform security checks in [`.github/workflows/terraform-security.yml`](../.github/workflows/terraform-security.yml)
- Deployment workflow in [`.github/workflows/deploy-security-lab.yml`](../.github/workflows/deploy-security-lab.yml)

## Hosting Recommendation

Recommended Azure target: Azure Container Apps.

Reasoning:

- The app already has a Dockerfile, so container deployment is straightforward.
- The app is a single-process Node service, which fits Container Apps well.
- Scale-to-zero lowers idle cost for a lab that will not run continuously.
- WebSocket support is already part of the app architecture.
- The current Terraform environment is already shaped around Container Apps.

Azure App Service would also work technically, but it is not the cheapest practical choice for this lab once containerization is already in place. A VM is not justified for the current runtime surface.

## Charges That Can Continue While Stopped

If the lab is stopped rather than destroyed, these items can still incur cost:

- Log Analytics workspace
- Container Apps environment, depending on configuration and retained services
- Storage accounts introduced later for findings or evidence
- Any Key Vault, database, or other supporting service added in later phases

Stopping the app reduces compute cost, but it does not automatically make the lab free.

## Safe-Cloning Risks

The main risks to address before Azure deployment are:

- Gemini API credentials must be lab-only and never reused from production.
- Frontend origin allowlists must remain isolated from the production host.
- The app should continue treating browser localStorage as disposable lab state.
- Training mode must stay disabled by default.
- No production data, logs, or secrets should be copied into the lab.

## Repository Structure To Keep

The current repo already matches the lab pattern well enough that it should be extended, not reorganized aggressively.

Keep the existing top-level structure and continue using:

- [docs/](../docs)
- [findings/](../findings)
- [infrastructure/](../infrastructure)
- [metrics/](../metrics)
- [scripts/](../scripts)
- [.github/workflows/](../.github/workflows)

Do not move the application into a new folder unless a future phase genuinely requires it.

## Phase 0 Implementation Plan

1. Confirm the repository facts needed for lab design.
2. Record the assessment in this document.
3. Use the assessment to drive the next phase only after review.
4. Preserve the existing application and security tooling baseline.

## What Remains After Phase 0

The remaining work is the normal phased lab build-out:

1. Phase 1: local lab validation and sanitized environment setup.
2. Phase 2: Azure infrastructure and hosting deployment.
3. Phase 3: lifecycle scripts and stop/start/destroy automation.
4. Phase 4: CI/CD hardening and security scan integration.
5. Phase 5 onward: threat model, scope, initial assessment, remediation, and optional training mode.
