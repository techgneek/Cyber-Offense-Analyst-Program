# Cyber Offense Analyst Case Study Completion Plan

> **For Hermes:** Use this as a phase-by-phase roadmap only. Do not implement anything until the corresponding phase is explicitly selected.

**Goal:** Turn the existing AetosAI lab into a fully told Cyber Offense Analyst case study with a single linear README, complete supporting docs, and a clearly explained CI/CD security pipeline.

**Architecture:** The repository already has most of the technical building blocks: a local lab app, Terraform scaffolding, lifecycle scripts, evidence-driven XSS/BAC case studies, and multiple GitHub Actions workflows. The remaining work is primarily about completing the narrative flow, filling a few documentation gaps, and making CI/CD a first-class part of the case study story. The plan below completes the project one phase at a time, with each phase ending in review before moving on.

**Tech Stack:** React + Vite + TypeScript, Node/Express, Terraform, Azure, GitHub Actions, Burp Suite, ZAP, Kali Linux, shell/PowerShell lifecycle scripts, Markdown documentation.

---

## Current State Summary

### Confirmed already present
- Local application and lab-mode behavior
- Terraform structure under `infrastructure/`
- Lifecycle scripts under `scripts/`
- Main `README.md` and AA documentation tree
- Stored XSS and broken access control evidence sets
- `docs/application-assessment.md`
- `docs/testing-scope/rules-of-engagement.md`
- `findings/templates/analyst-investigation-workbook.csv`
- Existing GitHub Actions workflows for deploy, security CI, dependency review, Terraform security, and container security

### Main gaps
- The main `README.md` is not yet a single linear case-study walkthrough
- The CI/CD story needs to be explained as a core chapter, not just as scattered workflows
- A dedicated ZAP baseline workflow is not yet confirmed
- The threat model / testing-scope narrative is not yet integrated into the main README flow
- The final case study needs a polished end-to-end “identify → assess → build → deploy → test → remediate → validate” structure

---

## Phase 1: Lock the case-study narrative structure

**Objective:** Decide the final linear structure for the main README so the whole repo reads like a Cyber Offense Analyst program simulation rather than a collection of separate artifacts.

**Outcome:** A final table of contents and section order for the main README.

**Proposed README spine:**
1. Title + mission statement
2. Inception state vs completion state
3. Table of contents
4. Architecture at a glance
5. Application assessment
6. Build and deployment flow
7. CI/CD and security testing coverage
8. Analyst lifecycle
9. Testing scope and rules of engagement
10. Threat model and trust boundaries
11. Security testing scenarios
12. Finding intake, risk mapping, and ownership
13. Remediation and validation proof
14. Evidence index
15. Metrics and reporting
16. Lessons learned / program outcome

**Tasks:**
1. Define the final README sequence from repository overview through validation.
2. Decide where the following belong in the linear flow:
   - application assessment
   - lab architecture
   - lifecycle controls
   - CI/CD and GitHub Actions
   - testing scope and rules of engagement
   - threat model
   - initial assessment
   - remediation and validation
3. Decide which existing subdocs remain linked out versus summarized in the README.
4. Confirm that the README starts with the secure baseline story and only references training material later, if at all.

**Completion criteria:**
- The README outline is agreed before any further edits.
- The intended story arc is explicit and linear.
- The README spine is concise enough to guide implementation without guessing.


---

## Phase 2: Complete the main README as the case-study spine

**Objective:** Rework the main README into a single story that mirrors the VM lifecycle format the user prefers, but tailored to the Cyber Offense Analyst lab.

**Outcome:** A polished top-level README that tells the full story in order.

**Tasks:**
1. Add a concise project introduction that frames the repo as a Cyber Offense Analyst lab simulation.
2. Present the repository assessment in a way that reads like discovery, not just a checklist.
3. Add the Azure hosting recommendation and environmental separation narrative.
4. Explain the lifecycle automation commands in sequence: deploy, start, stop, status, destroy.
5. Add a clear CI/CD chapter that explains what GitHub Actions does and why it matters.
6. Add the testing scope / rules of engagement chapter.
7. Add the threat-model chapter or a strong summary with links to the deeper docs.
8. Add the initial assessment, remediation, and validation story in a linear order.
9. Place the stored XSS and broken access control case studies where they support the narrative instead of interrupting it.
10. Keep any training-mode material clearly separate from the secure baseline.

**Completion criteria:**
- The README reads top-to-bottom like a complete case study.
- CI/CD is a visible pillar of the narrative.
- The document no longer feels like separate mini-projects stitched together.

---

## Phase 3: Finish the CI/CD story as a first-class chapter

**Objective:** Make the GitHub Actions pipeline a visible part of the case study, not an afterthought.

**Outcome:** README text and workflow references that explain the pipeline clearly.

**Tasks:**
1. Summarize the current workflows in the README.
2. Explain the purpose of each existing workflow at a high level.
3. Confirm whether a dedicated ZAP baseline workflow exists; if not, treat that as a planned gap in the narrative.
4. Decide how deployment, validation, and security scanning are staged in the pipeline.
5. Clarify what is blocking vs advisory in the first phase of the lab.
6. Tie the pipeline back to the Cyber Offense Analyst learning goals.

**Completion criteria:**
- The CI/CD chapter explains the why and the how.
- The reader understands what security checks run and when.
- Any missing workflow is clearly identified as a gap or future phase.

---

## Phase 4: Align the supporting documentation with the README story

**Objective:** Make the supporting docs feel like they belong to the same case study instead of separate artifacts.

**Outcome:** The docs tree and README cross-links support the same narrative flow.

**Tasks:**
1. Ensure `docs/application-assessment.md` is referenced from the README at the right point in the story.
2. Ensure `docs/testing-scope/rules-of-engagement.md` is linked where testing authorization is discussed.
3. Ensure `docs/aa/README.md` is positioned as the deeper investigation archive.
4. Ensure the stored XSS and BAC docs are indexed from the main case-study story.
5. Ensure the findings workbook and metrics docs are mentioned as operational artifacts.

**Completion criteria:**
- Readers can move from the README into deeper docs without losing the flow.
- The supporting docs are clearly part of one program rather than disconnected references.

---

## Phase 5: Decide the remaining security automation gaps

**Objective:** Determine whether the repo needs any additional security workflows to match the intended case-study story.

**Outcome:** A gap list, not an implementation list.

**Tasks:**
1. Review the existing workflow set against the original goal list.
2. Decide whether `zap-baseline.yml` is required for the final narrative.
3. Decide whether any workflow documentation needs updating to explain current behavior more clearly.
4. Confirm that the deploy workflow is clearly lab-only and not production-oriented.
5. Identify any workflow references that should be added to the README’s CI/CD section.

**Completion criteria:**
- Every missing automation item is identified as either “must add later” or “not needed for this case study.”
- The repo’s current workflow set is aligned with the story you want to tell.

---

## Phase 6: Tighten the evidence and findings story

**Objective:** Make the evidence trail and finding management feel like an analyst workflow.

**Outcome:** A clear reporting and validation story that matches the case-study tone.

**Tasks:**
1. Ensure the XSS and BAC evidence indexes are easy to understand from the main README.
2. Make the findings workbook and metrics references feel like real analyst outputs.
3. Ensure remediation and retest evidence are called out as final proof, not just artifact names.
4. Confirm that the CVE/CWE/OWASP/ATT&CK mappings are presented sensibly and only where appropriate.
5. Make sure the distinction between “before”, “fix”, and “after” is explicit in the prose.

**Completion criteria:**
- A reader can tell exactly how evidence supports each finding.
- The analyst workflow is obvious.

---

## Phase 7: Final review and polish

**Objective:** Do a final editorial pass so the case study reads like a finished portfolio piece.

**Outcome:** Finalized README and linked docs.

**Tasks:**
1. Review tone for consistency and clarity.
2. Remove duplicate or overlapping explanations.
3. Confirm the sequence matches the intended lifecycle.
4. Verify that the README titles and headings are English, concise, and professional.
5. Ensure the case study still respects the lab-only and non-production boundaries.
6. Confirm no section overpromises what is actually implemented.

**Completion criteria:**
- The README feels complete and intentional.
- The project can be handed to a reviewer without extra verbal explanation.

---

## Phase-by-Phase Execution Rule

Do not start the next phase until the current phase is reviewed and approved.

That keeps the project from drifting and makes it easy to check progress against the original Cyber Offense Analyst goals.

---

## Recommended Next Move

Start with **Phase 1** and finalize the README structure before touching content.
