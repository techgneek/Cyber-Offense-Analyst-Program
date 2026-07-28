export interface Correction {
  original: string;
  corrected: string;
  why: string;
}

export interface Message {
  id: string;
  role: "user" | "mentor";
  text: string;
  timestamp: string;
  createdAt?: number;
  correction?: Correction;
}

export interface Scenario {
  id: string;
  title: string;
  difficulty: "Easy" | "Medium" | "High" | "Critical";
  category: string;
  description: string;
  initialPrompt: string;
  trainingOnly?: boolean;
}

export interface TrainingXssNote {
  id: string;
  author: string;
  body: string;
  createdAt: string;
}

export interface VoiceEvent {
  type: "transcript" | "audio" | "interrupted" | "correction" | "status" | "error" | "compliance";
  sender?: "user" | "mentor";
  text?: string;
  audio?: string;
  interrupted?: boolean;
  correction?: Correction;
  status?: string;
  error?: string;
  compliance?: ComplianceInfo;
}

export interface ComplianceInfo {
  decision: "ALLOW" | "DENY" | "N/A";
  controlIds: string[];
  justification: string;
  evidenceRef: string;
  riskLevel: "Low" | "Medium" | "High" | "N/A";
  incidentId?: string;
  policyVersion?: string;
}

export interface ComplianceRecord extends ComplianceInfo {
  id: string;
  timestamp: string;
  source: "chat-success" | "chat-error" | "voice-event" | "server-evidence";
  action: string;
  model?: string;
  eventType?: string;
  hits?: string[];
  suspicionScore?: number;
  eventsCount?: number;
  shadowSessionKey?: string;
  route?: string;
  method?: string;
  testerBypass?: boolean;
  anchor?: string;
  activeSessions?: number;
  containedSessions?: number;
  escalatedSessions?: number;
  totalSuspicion?: number;
  before?: {
    suspicionScore?: number;
    contained?: boolean;
    events?: number;
  };
  // DoS protection fields
  dosControl?: string;
  requestsInWindow?: number;
  limitRpm?: number;
  payloadChars?: number;
  limitChars?: number;
  dosActorId?: string;
  // Red team audit fields
  auditId?: string;
  owaspRisk?: string;
  auditResult?: "PASS" | "FAIL";
  testNotes?: string;
  testLayer?: string;
  auditPassed?: number;
  auditFailed?: number;
  auditTotal?: number;
  severity?: "Critical" | "High" | "Medium" | "Low";
  cwe?: string;
  vectors?: Array<{
    id: string;
    description: string;
    attempted: string;
    blocked: boolean;
    mechanism: string;
  }>;
}

export interface RedTeamHistoryEntry {
  auditId: string;
  timestamp: string;
  passed: number;
  failed: number;
  total: number;
  results: Array<{
    owasp: string;
    title: string;
    result: "PASS" | "FAIL";
    severity?: "Critical" | "High" | "Medium" | "Low";
    cwe?: string;
  }>;
}
