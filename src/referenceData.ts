export interface ReferenceItem {
  code: string;
  name: string;
  description: string;
  mitigations: string[];
}

export interface FrameworkReference {
  code: string;
  name: string;
  description: string;
  focus: string;
  url?: string;
}

export const OWASP_LLM_TOP_10: ReferenceItem[] = [
  {
    code: "LLM01",
    name: "Prompt Injection",
    description: "Manipulating an LLM's behavior via crafted inputs, causing it to bypass safety filters or execute malicious commands (Direct/Indirect).",
    mitigations: [
      "Treat LLM outputs as untrusted and separate them from system code.",
      "Use robust system instructions and model-enforced boundaries.",
      "Implement prompt firewalls and dual-LLM evaluation patterns."
    ]
  },
  {
    code: "LLM02",
    name: "Insecure Output Handling",
    description: "Accepting LLM outputs without validation, leading to security flaws like XSS, CSRF, or Remote Code Execution in downstream systems.",
    mitigations: [
      "Sanitize and encode all LLM-generated output before rendering it.",
      "Treat LLM output as user input: validate schemas and parameters.",
      "Do not feed raw LLM outputs directly into execution command shells."
    ]
  },
  {
    code: "LLM03",
    name: "Training Data Poisoning",
    description: "Malicious tampering of training data or fine-tuning datasets, causing the model to exhibit backdoors or security vulnerabilities.",
    mitigations: [
      "Verify the supply chain of all data sources and datasets.",
      "Apply strict content moderation and data cleaning before training.",
      "Conduct adversarial testing on the trained model for poisoned behavior."
    ]
  },
  {
    code: "LLM04",
    name: "Model Denial of Service",
    description: "Interacting with the LLM in a resource-heavy manner, leading to resource exhaustion, elevated API costs, or service degradation.",
    mitigations: [
      "Implement strict rate limiting based on client IP or user session.",
      "Set sensible max token limits on prompts and generated outputs.",
      "Monitor response times and resource utilization per-request."
    ]
  },
  {
    code: "LLM05",
    name: "Supply Chain Vulnerabilities",
    description: "Risks from third-party pre-trained models, libraries, training pipelines, and plugins that contain security flaws or backdoors.",
    mitigations: [
      "Only pull pre-trained models and packages from certified registries.",
      "Utilize Software Bill of Materials (SBOM) and scan packages for CVEs.",
      "Verify hashes and sign all fine-tuned model artifacts."
    ]
  },
  {
    code: "LLM06",
    name: "Sensitive Information Disclosure",
    description: "The LLM revealing confidential data, proprietary secrets, PII, or intellectual property in its generated responses.",
    mitigations: [
      "Filter sensitive data from training sets or RAG retrieval sources.",
      "Implement robust output scrubbing (PII filters) on model responses.",
      "Enforce least-privilege data access: LLMs should not query what users cannot."
    ]
  },
  {
    code: "LLM07",
    name: "Insecure Plugin Design",
    description: "LLM plugins or extensions accepting model instructions blindly, failing to validate inputs, or lacking authorization checks.",
    mitigations: [
      "Verify authorization on every plugin or API call independent of LLM.",
      "Enforce parameterized inputs and avoid raw string executions.",
      "Avoid general write permissions on filesystems and external databases."
    ]
  },
  {
    code: "LLM08",
    name: "Excessive Agency",
    description: "Granting LLM agents too much autonomy, broad tool write permissions, or capabilities to execute irreversible actions without approval.",
    mitigations: [
      "Implement Human-in-the-Loop (HITL) authorization for critical tool actions.",
      "Apply least-privilege principles to API tokens and database roles.",
      "Isolate execution environments (sandboxing container runtimes)."
    ]
  },
  {
    code: "LLM09",
    name: "Overreliance",
    description: "Overtrusting model outputs without verification can cause operators to approve insecure actions, misclassify incidents, or miss malicious behavior.",
    mitigations: [
      "Require analyst verification checkpoints for high-impact decisions.",
      "Display confidence and provenance indicators for model-backed conclusions.",
      "Train users to validate model recommendations against telemetry evidence."
    ]
  },
  {
    code: "LLM10",
    name: "Model Theft",
    description: "Attackers can extract model weights, prompts, or proprietary behavior through endpoint abuse, replay attacks, or unprotected inference interfaces.",
    mitigations: [
      "Enforce strong authentication, authorization, and request throttling on model endpoints.",
      "Use watermarking, model fingerprinting, and anomaly detection for extraction attempts.",
      "Protect artifacts at rest and in transit with encryption and strict access controls."
    ]
  }
];

export const OWASP_AGENTIC_AI_RISKS: ReferenceItem[] = [
  {
    code: "OAA01",
    name: "Unbounded Tool Execution",
    description: "Allowing agents to call arbitrary external tools or APIs without rigorous syntax and argument schema checking.",
    mitigations: [
      "Enforce strict schema validation on all tool argument calls.",
      "Run agents inside ephemeral sandboxes (Docker, gVisor).",
      "Reject wildcard API parameters from the model."
    ]
  },
  {
    code: "OAA02",
    name: "Multi-Agent Cascade Failure",
    description: "A security compromise in one agent cascading into others due to implicit trust or shared, unvalidated communications.",
    mitigations: [
      "Treat multi-agent message buses as untrusted input boundaries.",
      "Do not grant downstream agents inherited elevated privileges.",
      "Establish strict conversation loop limits to prevent cost cascades."
    ]
  },
  {
    code: "OAA03",
    name: "Agent Memory Poisoning",
    description: "An attacker injecting malicious instructions into the agent's long-term or short-term memory, affecting future decisions.",
    mitigations: [
      "Sanitize all inputs written to semantic memory stores.",
      "Enable audit tracing on memory updates with clear authorship flags.",
      "Regularly clear or expire untrusted conversational state logs."
    ]
  },
  {
    code: "OAA04",
    name: "Lack of Auditing & Log Integrity",
    description: "Failing to log critical agent decisions, tool invocations, and model reasonings, preventing post-incident forensics.",
    mitigations: [
      "Implement read-only external trace logging for every agent action.",
      "Log full prompt, thought process, tool call, and tool output.",
      "Set alerts for high-risk tool usage (e.g. database deletes, git push)."
    ]
  }
];

export const MENTOR_RULES = [
  {
    id: "rule-1",
    category: "Autonomy",
    title: "Enforce Least Privilege",
    description: "An agent should never run with credentials that can perform destructive actions globally. Tools must be restricted to minimal schemas."
  },
  {
    id: "rule-2",
    category: "Control",
    title: "Human-in-the-Loop (HITL)",
    description: "High-impact actions (deleting files, moving funds, committing code) MUST have manual confirmation. The model must ask, not assume."
  },
  {
    id: "rule-3",
    category: "Monitoring",
    title: "Inspect Model Outputs",
    description: "Never execute output text directly in a shell or interpreter. Use strict syntax validators and intermediate sandbox buffers."
  },
  {
    id: "rule-4",
    category: "Containment",
    title: "Hard Kill-Switches",
    description: "When an agent behaves maliciously, do not negotiate via prompt edits. Revoke credentials immediately and suspend the container runtime."
  }
];

export const AI_SECURITY_FRAMEWORKS: FrameworkReference[] = [
  {
    code: "NIST",
    name: "NIST AI RMF",
    description: "Risk-based framework for governing AI systems across map, measure, manage, and govern functions.",
    focus: "Enterprise AI risk governance and controls",
    url: "https://www.nist.gov/itl/ai-risk-management-framework"
  },
  {
    code: "OWASP-LLM",
    name: "OWASP Top 10 for LLM Applications",
    description: "Application-security-centric threat model and mitigation baseline for LLM-integrated systems.",
    focus: "LLM application vulnerabilities and secure design",
    url: "https://owasp.org/www-project-top-10-for-large-language-model-applications/"
  },
  {
    code: "OWASP-AGENTIC",
    name: "OWASP Agentic AI Risks",
    description: "Threat model for autonomous and tool-using AI agents with focus on execution boundaries and control planes.",
    focus: "Agent autonomy, tools, and orchestration security",
    url: "https://owasp.org/www-project-agentic-ai-risks/"
  },
  {
    code: "MITRE",
    name: "MITRE ATLAS",
    description: "Adversarial threat matrix mapping tactics and techniques used to attack machine learning systems.",
    focus: "Adversary behavior mapping and detection engineering",
    url: "https://atlas.mitre.org/"
  },
  {
    code: "ISO42001",
    name: "ISO/IEC 42001",
    description: "Management system standard defining governance requirements for trustworthy AI development and operation.",
    focus: "AI management systems and compliance posture",
    url: "https://www.iso.org/standard/81230.html"
  },
  {
    code: "CISA",
    name: "CISA AI Security Guidance",
    description: "Operational guidance for deploying and defending AI systems in enterprise and critical infrastructure contexts.",
    focus: "Operational hardening and incident readiness",
    url: "https://www.cisa.gov/ai"
  }
];
