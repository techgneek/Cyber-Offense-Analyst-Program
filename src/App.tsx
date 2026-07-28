import React, { useState, useEffect, useRef } from "react";
import { AlertTriangle, X, ChevronDown, ChevronUp, BookOpen, ListChecks, MessageSquare, Shield } from "lucide-react";
import { Message, Scenario, Correction, VoiceEvent, ComplianceInfo, ComplianceRecord } from "./types";
import { agentService, buildLiveWebSocketUrl } from "./services/api";
import { ApiRequestError } from "./services/api";
import { OWASP_LLM_TOP_10 } from "./referenceData";

// Subcomponents
import Header from "./components/Header";
import SystemHealthHUD from "./components/SystemHealthHUD";
import ScenarioPanel from "./components/ScenarioPanel";
import LearningCorner from "./components/LearningCorner";
import XssWorkbench from "./components/XssWorkbench";
import ChatPanel from "./components/ChatPanel";
import ReferenceSheet from "./components/ReferenceSheet";
import ComplianceDashboard from "./components/ComplianceDashboard";

const COMPLIANCE_CACHE_KEY = "aetos_compliance_session_records";

const loadComplianceCache = (): ComplianceRecord[] => {
  try {
    const raw = localStorage.getItem(COMPLIANCE_CACHE_KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) ? (parsed as ComplianceRecord[]) : [];
  } catch {
    return [];
  }
};

export default function App() {
  const starterQuestions = [
    "How is prompt injection different from SQL injection?",
    "What are the first guardrails for tool-using AI agents?",
    "How do we secure RAG pipelines against poisoned data?",
  ];

  const [scenarios, setScenarios] = useState<Scenario[]>([]);
  const [activeScenario, setActiveScenario] = useState<Scenario | null>(null);
  const [messages, setMessages] = useState<Message[]>([]);
  const [inputText, setInputText] = useState("");
  const [isGenerating, setIsGenerating] = useState(false);
  const [errorText, setErrorText] = useState<string | null>(null);
  const [isVoiceAvailable, setIsVoiceAvailable] = useState(true);
  const [isComplianceOpen, setIsComplianceOpen] = useState(false);
  const [complianceRecords, setComplianceRecords] = useState<ComplianceRecord[]>(() => loadComplianceCache());
  const [isComplianceLoading, setIsComplianceLoading] = useState(false);
  const [evidenceRefreshCount, setEvidenceRefreshCount] = useState(0);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isMobileScenarioOpen, setIsMobileScenarioOpen] = useState(false);
  const [isMobileReferenceOpen, setIsMobileReferenceOpen] = useState(false);
  const [mobileReferenceExpanded, setMobileReferenceExpanded] = useState<string | null>(null);
  const [isBackendReachable, setIsBackendReachable] = useState(true);
  const [isCheckingBackend, setIsCheckingBackend] = useState(false);
  const [lastFailedRequest, setLastFailedRequest] = useState<{ history: Message[]; userText: string } | null>(null);
  const [hasUserInteracted, setHasUserInteracted] = useState(false);
  const [trainingMode, setTrainingMode] = useState(false);

  // Correction Tracking (Saved to localStorage)
  const [corrections, setCorrections] = useState<Correction[]>(() => {
    const saved = localStorage.getItem("ai_security_corrections");
    return saved ? JSON.parse(saved) : [];
  });

  // Voice Session State
  const [isVoiceConnected, setIsVoiceConnected] = useState(false);
  const [voiceStatus, setVoiceStatus] = useState<"Idle" | "Connecting" | "Active" | "Error">("Idle");
  const [voiceLogs, setVoiceLogs] = useState<{ sender: "user" | "mentor"; text: string; timestamp: Date }[]>([]);
  const [isDictating, setIsDictating] = useState(false);
  const [micStream, setMicStream] = useState<MediaStream | null>(null);

  // Audio Context & Websocket References for Live API
  const wsRef = useRef<WebSocket | null>(null);
  const inputAudioCtxRef = useRef<AudioContext | null>(null);
  const outputAudioCtxRef = useRef<AudioContext | null>(null);
  const nextStartTimeRef = useRef<number>(0);
  const activeSourcesRef = useRef<AudioBufferSourceNode[]>([]);
  const audioProcessorRef = useRef<ScriptProcessorNode | null>(null);

  // Oscilloscope Visualizer Ref
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const animationFrameRef = useRef<number | null>(null);
  const latestAudioDataRef = useRef<Float32Array>(new Float32Array(128));
  const recognitionRef = useRef<any>(null);
  const uiAudioCtxRef = useRef<AudioContext | null>(null);
  const dictationTokenRef = useRef<number>(0);
  const blockDictationResultsRef = useRef<boolean>(false);
  const voiceTranscriptRef = useRef<{ sender: "user" | "mentor"; text: string; timestamp: Date }[]>([]);
  const voiceFlushIntervalRef = useRef<number | null>(null);
  const voiceChatLastAppendRef = useRef<{ sender: "user" | "mentor"; at: number } | null>(null);

  // Fetch scenarios on load via service layer
  useEffect(() => {
    agentService
      .getScenarios()
      .then((data) => {
        setIsBackendReachable(true);
        setScenarios(data);
        if (data.length > 0) {
          handleSelectScenario(data[0]);
        }
      })
      .catch((err) => {
        console.error("Error loading scenarios:", err);
        setIsBackendReachable(false);
        setErrorText("Failed to load scenarios from backend. Make sure the server is fully started.");
      });
  }, []);

  const isLikelyConnectionIssue = (message: string) =>
    /failed to fetch|networkerror|err_connection_refused|load failed|network request failed/i.test(message);

  const checkBackendReachability = async () => {
    setIsCheckingBackend(true);
    try {
      const health = await agentService.getSystemHealth();
      setTrainingMode(!!health.trainingMode);
      setIsBackendReachable(true);
      setErrorText(null);
    } catch {
      setIsBackendReachable(false);
    } finally {
      setIsCheckingBackend(false);
    }
  };

  const appendVoiceTranscript = (sender: "user" | "mentor", text: string) => {
    const timestamp = new Date();
    const now = timestamp.getTime();
    const entry = { sender, text, timestamp };

    setVoiceLogs((prev) => {
      const last = prev[prev.length - 1];
      if (last && last.sender === sender && now - last.timestamp.getTime() < 3000) {
        const updated = [...prev.slice(0, -1), entry];
        voiceTranscriptRef.current = [...voiceTranscriptRef.current.slice(0, -1), entry];
        return updated;
      }

      voiceTranscriptRef.current = [...voiceTranscriptRef.current, entry];
      return [...prev, entry];
    });

    setMessages((prev) => {
      const messageTimestamp = timestamp.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
      const last = prev[prev.length - 1];
      const lastVoice = voiceChatLastAppendRef.current;

      if (last && last.role === sender && lastVoice && lastVoice.sender === sender && now - lastVoice.at < 3000) {
        const updated = [...prev];
        updated[updated.length - 1] = {
          ...last,
          text,
          timestamp: messageTimestamp,
          createdAt: now,
        };
        voiceChatLastAppendRef.current = { sender, at: now };
        return updated;
      }

      voiceChatLastAppendRef.current = { sender, at: now };
      return [
        ...prev,
        {
          id: `voice-${sender}-${now}`,
          role: sender,
          text,
          timestamp: messageTimestamp,
          createdAt: now,
        },
      ];
    });
  };

  const clearVoiceFlushInterval = () => {
    if (voiceFlushIntervalRef.current !== null) {
      window.clearInterval(voiceFlushIntervalRef.current);
      voiceFlushIntervalRef.current = null;
    }
  };

  const flushVoiceTranscriptToChat = () => {
    voiceTranscriptRef.current = [];
    voiceChatLastAppendRef.current = null;
  };

  useEffect(() => {
    let cancelled = false;

    const refreshHealth = async () => {
      try {
        const health = await agentService.getSystemHealth();
        if (cancelled) return;
        setIsVoiceAvailable(health.websocket === "ready");
        setTrainingMode(!!health.trainingMode);
        setIsBackendReachable(true);
      } catch (err) {
        if (cancelled) return;
        setIsVoiceAvailable(false);
        setIsBackendReachable(false);
      }
    };

    refreshHealth();
    const interval = window.setInterval(refreshHealth, 15000);

    return () => {
      cancelled = true;
      window.clearInterval(interval);
    };
  }, []);

  // Save corrections to localStorage
  useEffect(() => {
    localStorage.setItem("ai_security_corrections", JSON.stringify(corrections));
  }, [corrections]);

  useEffect(() => {
    if (!isComplianceOpen) return;

    let isActive = true;
    setIsComplianceLoading(true);

    agentService
      .getComplianceEvidence(120)
      .then((serverRecords) => {
        if (!isActive) return;
        setIsBackendReachable(true);
        setComplianceRecords((prev) => {
          const merged = [...serverRecords, ...prev];
          const seen = new Set<string>();
          const deduped: ComplianceRecord[] = [];

          for (const record of merged) {
            const key = record.evidenceRef || record.id;
            if (seen.has(key)) continue;
            seen.add(key);
            deduped.push(record);
          }

          return deduped.slice(0, 180);
        });
      })
      .catch((err) => {
        console.error("Failed to hydrate compliance evidence:", err);
        const rawMessage = typeof err?.message === "string" ? err.message : "";
        if (isLikelyConnectionIssue(rawMessage)) {
          setIsBackendReachable(false);
        }
      })
      .finally(() => {
        if (isActive) setIsComplianceLoading(false);
      });

    return () => {
      isActive = false;
    };
  }, [isComplianceOpen, evidenceRefreshCount]);

  useEffect(() => {
    try {
      localStorage.setItem(COMPLIANCE_CACHE_KEY, JSON.stringify(complianceRecords.slice(0, 180)));
    } catch {
      // Ignore storage failures (private mode/quota) and keep session functional.
    }
  }, [complianceRecords]);

  useEffect(() => {
    return () => {
      if (recognitionRef.current) {
        try {
          recognitionRef.current.stop();
        } catch (e) {}
      }
      if (uiAudioCtxRef.current) {
        uiAudioCtxRef.current.close().catch(() => {});
        uiAudioCtxRef.current = null;
      }
    };
  }, []);

  useEffect(() => {
    if (!isMobileMenuOpen) return;
    const original = document.body.style.overflow;
    document.body.style.overflow = "hidden";

    return () => {
      document.body.style.overflow = original;
    };
  }, [isMobileMenuOpen]);

  // Handle Scenario Selection
  const handleSelectScenario = (scenario: Scenario) => {
    setActiveScenario(scenario);
    setHasUserInteracted(false);
    setInputText("");
    setMessages([
      {
        id: "sys-welcome",
        role: "mentor",
        text: "Hello, my name is ASARA. I am your AI Security and Research Mentor. Ask me anything about Agentic AI security.",
        timestamp: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
      },
    ]);
  };

  const sendDirectUserText = (text: string) => {
    const trimmed = text.trim();
    if (!trimmed || isGenerating) return;

    if (isDictating) {
      stopDictation(true);
    }

    const userMsg: Message = {
      id: `usr-${Date.now()}`,
      role: "user",
      text: trimmed,
      timestamp: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
    };

    const updatedMessages = [...messages, userMsg];
    setMessages(updatedMessages);
    setInputText("");
    setLastFailedRequest(null);
    setHasUserInteracted(true);

    sendMessageToMentor(updatedMessages, trimmed);
  };

  const submitScenarioPrompt = (scenario: Scenario) => {
    if (!scenario) return;
    sendDirectUserText(scenario.initialPrompt);
  };

  // Send the selected question to chat so users can get coached guidance.
  const handleLoadInitialPrompt = () => {
    if (!activeScenario) return;
    submitScenarioPrompt(activeScenario);
  };

  const handleMobileScenarioSelect = (scenario: Scenario) => {
    setActiveScenario(scenario);
    setIsMobileMenuOpen(false);
    submitScenarioPrompt(scenario);
  };

// Send a message via text API
const handleSendMessage = (e?: React.FormEvent) => {
  if (e) e.preventDefault();
  sendDirectUserText(inputText);
};

  const handleStarterQuestionSelect = (question: string) => {
    sendDirectUserText(question);
  };

  const handleRetryLastMessage = () => {
    if (!lastFailedRequest || isGenerating) return;
    sendMessageToMentor(lastFailedRequest.history, lastFailedRequest.userText);
  };

  const sendMessageToMentor = async (msgHistory: Message[], failedUserText?: string) => {
    setIsGenerating(true);
    setErrorText(null);

    try {
      const data = await agentService.postChatMessage(msgHistory);
      setIsBackendReachable(true);
      setLastFailedRequest(null);

      if (data.compliance) {
        pushComplianceRecord(data.compliance, "chat-success", "chat_message", data.model);
      } else {
        pushComplianceRecord(
          {
            decision: "ALLOW",
            controlIds: ["CC6.1"],
            justification: "Chat response accepted without explicit server compliance metadata.",
            evidenceRef: `chat-local-${Date.now()}`,
            riskLevel: "Low",
            policyVersion: "2026-07-07.1",
          },
          "chat-success",
          "chat_message",
          data.model
        );
      }

      const mentorMsg: Message = {
        id: `mentor-${Date.now()}`,
        role: "mentor",
        text: data.text,
        timestamp: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
        correction: data.correction || undefined,
      };

      if (data.correction) {
        // Append unique corrections
        setCorrections((prev) => {
          const exists = prev.some(
            (c) => c.original.toLowerCase() === data.correction!.original.toLowerCase()
          );
          if (exists) return prev;
          return [data.correction!, ...prev];
        });
      }

      setMessages((prev) => [...prev, mentorMsg]);
    } catch (err: any) {
      console.error(err);
      const rawMessage = typeof err?.message === "string" ? err.message : "";
      const isConnectionIssue = isLikelyConnectionIssue(rawMessage);
      setErrorText(
        isConnectionIssue
          ? "Temporary connection issue. Your draft is still in the input box, so you can retry in a moment."
          : (rawMessage || "Failed to reach your AI Security mentor.")
      );
      if (isConnectionIssue) {
        setIsBackendReachable(false);
      }

      const typedErr = err as ApiRequestError;
      if (typedErr.compliance) {
        pushComplianceRecord(typedErr.compliance, "chat-error", "chat_message");
      }

      // Restore unsent text when a request fails so the user can retry quickly.
      if (failedUserText && !inputText.trim()) {
        setInputText(failedUserText);
      }

      if (failedUserText) {
        setLastFailedRequest({ history: msgHistory, userText: failedUserText });
      }
    } finally {
      setIsGenerating(false);
    }
  };

  const pushComplianceRecord = (
    compliance: ComplianceInfo,
    source: "chat-success" | "chat-error" | "voice-event",
    action: string,
    model?: string
  ) => {
    const record: ComplianceRecord = {
      id: `cmp-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
      timestamp: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit", second: "2-digit" }),
      source,
      action,
      model,
      ...compliance,
    };

    setComplianceRecords((prev) => [record, ...prev].slice(0, 120));
  };

  // Clear Correction history
  const handleResetCorrections = () => {
    setCorrections([]);
    localStorage.removeItem("ai_security_corrections");
  };

  const playUiTone = (kind: "voice" | "dictation", active: boolean) => {
    try {
      const AudioCtor = (window.AudioContext || (window as any).webkitAudioContext) as typeof AudioContext;
      if (!uiAudioCtxRef.current) {
        uiAudioCtxRef.current = new AudioCtor();
      }

      const ctx = uiAudioCtxRef.current;
      if (!ctx) return;

      const oscillator = ctx.createOscillator();
      const gain = ctx.createGain();

      const baseFreq = kind === "voice" ? 520 : 760;
      oscillator.type = "sine";
      oscillator.frequency.setValueAtTime(active ? baseFreq : baseFreq - 180, ctx.currentTime);

      gain.gain.setValueAtTime(0.0001, ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.06, ctx.currentTime + 0.01);
      gain.gain.exponentialRampToValueAtTime(0.0001, ctx.currentTime + 0.11);

      oscillator.connect(gain);
      gain.connect(ctx.destination);

      oscillator.start();
      oscillator.stop(ctx.currentTime + 0.12);
    } catch (e) {
      // Ignore UI tone failures and keep UX functional.
    }
  };

  const stopDictation = (blockFutureResults = true) => {
    if (blockFutureResults) {
      blockDictationResultsRef.current = true;
    }

    dictationTokenRef.current += 1;

    if (recognitionRef.current) {
      try {
        recognitionRef.current.stop();
      } catch (e) {}
      recognitionRef.current = null;
    }

    setIsDictating(false);
  };

  // Helper: Base64 converter for Int16 buffer
  const base64ArrayBuffer = (arrayBuffer: ArrayBuffer) => {
    let binary = "";
    const bytes = new Uint8Array(arrayBuffer);
    const len = bytes.byteLength;
    for (let i = 0; i < len; i++) {
      binary += String.fromCharCode(bytes[i]);
    }
    return window.btoa(binary);
  };

  // Draw simulated or real audio visualizer on canvas
  const drawVisualizer = () => {
    if (!canvasRef.current) return;
    const canvas = canvasRef.current;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const width = canvas.width;
    const height = canvas.height;

    // Deep cosmos backplane
    ctx.fillStyle = "rgb(2, 6, 23)";
    ctx.fillRect(0, 0, width, height);

    // Grid details
    ctx.strokeStyle = "rgba(99, 102, 241, 0.08)";
    ctx.lineWidth = 1;
    ctx.beginPath();
    ctx.moveTo(0, height / 2);
    ctx.lineTo(width, height / 2);
    ctx.stroke();

    // Waves rendering
    ctx.lineWidth = 2.5;
    ctx.beginPath();

    const data = latestAudioDataRef.current;
    const sliceWidth = width / data.length;
    let x = 0;

    for (let i = 0; i < data.length; i++) {
      const v = data[i];
      const y = (v * 1.5 * height) / 2 + height / 2;

      if (i === 0) {
        ctx.moveTo(x, y);
      } else {
        ctx.lineTo(x, y);
      }

      x += sliceWidth;
    }

    ctx.lineTo(width, height / 2);

    // Dynamic wave glow colors
    if (voiceStatus === "Active") {
      ctx.strokeStyle = "rgba(59, 130, 246, 0.95)"; // Vivid Royal Blue
      ctx.shadowBlur = 8;
      ctx.shadowColor = "rgba(59, 130, 246, 0.5)";
    } else {
      ctx.strokeStyle = "rgba(99, 102, 241, 0.3)"; // Ambient deep glow
      ctx.shadowBlur = 0;
    }
    ctx.stroke();
    // Reset shadow
    ctx.shadowBlur = 0;

    // Slow decay of visual wave when disconnected
    if (!isVoiceConnected) {
      const time = Date.now() * 0.005;
      const simulatedData = new Float32Array(128);
      for (let i = 0; i < 128; i++) {
        simulatedData[i] =
          Math.sin(i * 0.15 + time) * 0.12 * Math.sin(i * 0.08 + time * 0.5);
      }
      latestAudioDataRef.current = simulatedData;
    }

    animationFrameRef.current = requestAnimationFrame(drawVisualizer);
  };

  // Start Visualizer Loop
  useEffect(() => {
    drawVisualizer();
    return () => {
      if (animationFrameRef.current) {
        cancelAnimationFrame(animationFrameRef.current);
      }
    };
  }, [isVoiceConnected, voiceStatus]);

  // Handle Voice Connection / Disconnection (Gemini Live API)
  const toggleVoiceSession = async () => {
    const shouldStart = !isVoiceConnected;
    playUiTone("voice", shouldStart);

    if (shouldStart) {
      await startVoiceSession();
    } else {
      stopVoiceSession();
    }
  };

  const startVoiceSession = async () => {
    setHasUserInteracted(true);

    if (!isVoiceAvailable) {
      setVoiceStatus("Error");
      setErrorText("Voice chat is unavailable on this deployment because the /api/live WebSocket bridge is not enabled.");
      return;
    }

    setVoiceStatus("Connecting");
    setErrorText(null);
    setVoiceLogs([]);

    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      setMicStream(stream);

      const inputContext = new (window.AudioContext || (window as any).webkitAudioContext)({ sampleRate: 16000 });
      const outputContext = new (window.AudioContext || (window as any).webkitAudioContext)({ sampleRate: 24000 });

      inputAudioCtxRef.current = inputContext;
      outputAudioCtxRef.current = outputContext;
      voiceTranscriptRef.current = [];
      voiceChatLastAppendRef.current = null;
      await inputContext.resume();
      await outputContext.resume();
      nextStartTimeRef.current = 0;

      const actorId = localStorage.getItem("soc2_actor_id") || "recon_user";
      const actorType = localStorage.getItem("soc2_actor_type") || "human";
      const actorRole = localStorage.getItem("soc2_actor_role") || "analyst";
      const actorScope = localStorage.getItem("soc2_actor_scope") || "chat:write";
      const dataClassification = localStorage.getItem("soc2_data_classification") || "internal";
      const authMethod = localStorage.getItem("soc2_auth_method") || "header_assertion";
      const authResult = localStorage.getItem("soc2_auth_result") || "success";

      const params = new URLSearchParams({
        actorId,
        actorType,
        actorRole,
        actorScope,
        dataClassification,
        authMethod,
        authResult,
        action: "voice_session_start",
      });

      const wsUrl = buildLiveWebSocketUrl(params);
      const ws = new WebSocket(wsUrl);
      wsRef.current = ws;

      ws.onopen = () => {
        setIsVoiceConnected(true);
        setVoiceStatus("Active");

        const source = inputContext.createMediaStreamSource(stream);
        const processor = inputContext.createScriptProcessor(4096, 1, 1);
        audioProcessorRef.current = processor;

        source.connect(processor);
        processor.connect(inputContext.destination);

        processor.onaudioprocess = (e) => {
          if (ws.readyState !== WebSocket.OPEN) return;

          const float32Data = e.inputBuffer.getChannelData(0);
          latestAudioDataRef.current = float32Data;

          const int16Data = new Int16Array(float32Data.length);
          for (let i = 0; i < float32Data.length; i++) {
            const val = Math.max(-1, Math.min(1, float32Data[i]));
            int16Data[i] = val < 0 ? val * 0x8000 : val * 0x7FFF;
          }

          const base64 = base64ArrayBuffer(int16Data.buffer);
          ws.send(JSON.stringify({ audio: base64 }));
        };
      };

      ws.onmessage = (event) => {
        try {
          const msg = JSON.parse(event.data) as VoiceEvent;

          if (msg.type === "audio" && msg.audio) {
            playIncomingAudio(msg.audio);
          }

          if (msg.type === "interrupted") {
            handleVoiceInterruption();
          }

          if (msg.type === "transcript" && msg.text) {
            appendVoiceTranscript(msg.sender || "mentor", msg.text);
          }

          if (msg.type === "correction" && msg.correction) {
            setCorrections((prev) => {
              const exists = prev.some(
                (c) => c.original.toLowerCase() === msg.correction!.original.toLowerCase()
              );
              if (exists) return prev;
              return [msg.correction!, ...prev];
            });
          }

          if (msg.type === "error") {
            setVoiceStatus("Error");
            setErrorText(msg.error || "Voice session failed.");
          }

          if (msg.type === "compliance" && msg.compliance) {
            pushComplianceRecord(msg.compliance, "voice-event", "voice_session", "gemini-3.1-flash-live-preview");
          }
        } catch (e) {
          console.error("Error reading websocket message:", e);
        }
      };

      ws.onerror = (err) => {
        console.error("WS error:", err);
        setVoiceStatus("Error");
        setErrorText("Voice connection error. This deployed backend does not expose /api/live WebSocket support.");
      };

      ws.onclose = () => {
        stopVoiceSession();
      };
    } catch (err: any) {
      console.error(err);
      setVoiceStatus("Error");
      setErrorText("Microphone access denied, or this deployment cannot open the /api/live WebSocket endpoint.");
      stopVoiceSession();
    }
  };

  const stopVoiceSession = () => {
    setIsVoiceConnected(false);
    setVoiceStatus("Idle");
    clearVoiceFlushInterval();
    flushVoiceTranscriptToChat();

    if (micStream) {
      micStream.getTracks().forEach((track) => track.stop());
      setMicStream(null);
    }

    if (audioProcessorRef.current) {
      try {
        audioProcessorRef.current.disconnect();
      } catch (e) {}
      audioProcessorRef.current = null;
    }

    if (inputAudioCtxRef.current) {
      inputAudioCtxRef.current.close().catch(() => {});
      inputAudioCtxRef.current = null;
    }
    if (outputAudioCtxRef.current) {
      outputAudioCtxRef.current.close().catch(() => {});
      outputAudioCtxRef.current = null;
    }

    if (wsRef.current) {
      try {
        wsRef.current.close();
      } catch (e) {}
      wsRef.current = null;
    }

    activeSourcesRef.current.forEach((src) => {
      try {
        src.stop();
      } catch (e) {}
    });
    activeSourcesRef.current = [];
    nextStartTimeRef.current = 0;
  };

  const toggleDictation = () => {
    setHasUserInteracted(true);

    const SpeechRecognitionCtor =
      (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;

    if (!SpeechRecognitionCtor) {
      setErrorText("Speech-to-text is not supported in this browser.");
      return;
    }

    if (isDictating && recognitionRef.current) {
      playUiTone("dictation", false);
      stopDictation(true);
      return;
    }

    const recognition = new SpeechRecognitionCtor();
    const token = dictationTokenRef.current + 1;
    dictationTokenRef.current = token;
    blockDictationResultsRef.current = false;

    recognitionRef.current = recognition;
    recognition.lang = "en-US";
    recognition.interimResults = true;
    recognition.continuous = false;

    let finalTranscript = "";

    recognition.onstart = () => {
      if (dictationTokenRef.current !== token) return;
      setIsDictating(true);
      setErrorText(null);
      playUiTone("dictation", true);
    };

    recognition.onresult = (event: any) => {
      if (dictationTokenRef.current !== token || blockDictationResultsRef.current) return;

      let interimTranscript = "";
      for (let i = event.resultIndex; i < event.results.length; i++) {
        const transcriptChunk = event.results[i][0].transcript;
        if (event.results[i].isFinal) {
          finalTranscript += transcriptChunk;
        } else {
          interimTranscript += transcriptChunk;
        }
      }

      const composed = `${finalTranscript} ${interimTranscript}`.trim();
      setInputText(composed);
    };

    recognition.onerror = () => {
      if (dictationTokenRef.current !== token) return;
      setErrorText("Speech-to-text capture failed. Please check microphone permissions.");
      setIsDictating(false);
      playUiTone("dictation", false);
    };

    recognition.onend = () => {
      if (dictationTokenRef.current !== token) return;
      if (recognitionRef.current === recognition) {
        recognitionRef.current = null;
      }
      setIsDictating(false);
      playUiTone("dictation", false);
    };

    try {
      recognition.start();
    } catch (e) {
      if (dictationTokenRef.current === token) {
        setIsDictating(false);
        setErrorText("Unable to start speech-to-text right now.");
        playUiTone("dictation", false);
      }
    }
  };

  const playIncomingAudio = (base64Data: string) => {
    const outputCtx = outputAudioCtxRef.current;
    if (!outputCtx) return;

    try {
      if (outputCtx.state === "suspended") {
        void outputCtx.resume();
      }

      const binary = window.atob(base64Data);
      const bytes = new Uint8Array(binary.length);
      for (let i = 0; i < binary.length; i++) {
        bytes[i] = binary.charCodeAt(i);
      }

      const int16Array = new Int16Array(bytes.buffer);
      const float32Array = new Float32Array(int16Array.length);
      for (let i = 0; i < int16Array.length; i++) {
        float32Array[i] = int16Array[i] / 32768;
      }

      const buffer = outputCtx.createBuffer(1, float32Array.length, 24000);
      buffer.copyToChannel(float32Array, 0);

      const source = outputCtx.createBufferSource();
      source.buffer = buffer;
      source.connect(outputCtx.destination);

      latestAudioDataRef.current = float32Array;

      const now = outputCtx.currentTime;
      let startTime = nextStartTimeRef.current;
      if (startTime < now) {
        startTime = now + 0.05;
      }

      source.start(startTime);
      nextStartTimeRef.current = startTime + buffer.duration;

      activeSourcesRef.current.push(source);
      source.onended = () => {
        activeSourcesRef.current = activeSourcesRef.current.filter((s) => s !== source);
      };
    } catch (e) {
      console.error("Failed playing output voice chunk:", e);
    }
  };

  const handleVoiceInterruption = () => {
    activeSourcesRef.current.forEach((src) => {
      try {
        src.stop();
      } catch (e) {}
    });
    activeSourcesRef.current = [];
    nextStartTimeRef.current = 0;
  };

  return (
    <div className="min-h-screen bg-slate-950 bg-[radial-gradient(ellipse_80%_80%_at_50%_-20%,rgba(99,102,241,0.15),rgba(255,255,255,0))] text-slate-100 flex flex-col font-sans select-none antialiased grid-overlay relative">
      {/* HUD Header */}
      <Header
        isVoiceConnected={isVoiceConnected}
        voiceAvailable={isVoiceAvailable}
        onToggleCompliance={() => setIsComplianceOpen((prev) => !prev)}
        complianceCount={complianceRecords.length}
        onOpenMobileMenu={() => setIsMobileMenuOpen(true)}
      />

      {!isBackendReachable && (
        <div className="w-full border-b border-amber-700/60 bg-amber-950/40 px-4 py-2.5 flex items-center justify-between gap-3 sticky top-[69px] z-30">
          <p className="text-[11px] text-amber-200 leading-relaxed">
            Backend connection issue detected. Chat requests may fail until the service is reachable.
          </p>
          <button
            onClick={checkBackendReachability}
            disabled={isCheckingBackend}
            className="shrink-0 px-3 py-1.5 rounded-md border border-amber-600 text-[11px] font-semibold text-amber-100 hover:bg-amber-900/40 disabled:opacity-60"
          >
            {isCheckingBackend ? "Checking..." : "Retry Connection"}
          </button>
        </div>
      )}

      {isMobileMenuOpen && (
        <div className="fixed inset-0 z-40 xl:hidden">
          <button
            className="absolute inset-0 bg-slate-950/70 backdrop-blur-sm"
            onClick={() => setIsMobileMenuOpen(false)}
            aria-label="Close mobile menu overlay"
          />

          <aside className="absolute left-0 top-0 h-full w-[88%] max-w-sm bg-slate-950 border-r border-slate-800 p-4 flex flex-col gap-3 overflow-y-auto custom-scrollbar">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <h2 className="text-xs uppercase tracking-widest text-slate-300 font-bold">Mobile Mission Menu</h2>
              <button
                onClick={() => setIsMobileMenuOpen(false)}
                className="inline-flex items-center justify-center w-8 h-8 rounded-lg border border-slate-700 bg-slate-900 text-slate-200"
                aria-label="Close mobile menu"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <button
              onClick={() => setIsMobileMenuOpen(false)}
              className="w-full text-left px-3 py-2.5 rounded-lg border border-slate-700 bg-slate-900/70 text-slate-200 hover:bg-slate-800 transition-colors inline-flex items-center gap-2"
            >
              <MessageSquare className="w-4 h-4 text-blue-400" />
              Back To Chat
            </button>

            <button
              onClick={() => {
                setIsComplianceOpen(true);
                setIsMobileMenuOpen(false);
              }}
              className="w-full text-left px-3 py-2.5 rounded-lg border border-slate-700 bg-slate-900/70 text-slate-200 hover:bg-slate-800 transition-colors inline-flex items-center gap-2"
            >
              <Shield className="w-4 h-4 text-emerald-400" />
              Compliance Dashboard
            </button>

            <div className="rounded-lg border border-slate-800 bg-slate-900/50 overflow-hidden">
              <button
                onClick={() => setIsMobileScenarioOpen((v) => !v)}
                className="w-full px-3 py-2.5 flex items-center justify-between text-left"
              >
                <span className="inline-flex items-center gap-2 text-slate-200">
                  <ListChecks className="w-4 h-4 text-blue-400" />
                  20 Common Questions
                </span>
                {isMobileScenarioOpen ? <ChevronUp className="w-4 h-4 text-slate-400" /> : <ChevronDown className="w-4 h-4 text-slate-400" />}
              </button>

              {isMobileScenarioOpen && (
                <div className="max-h-64 overflow-y-auto custom-scrollbar border-t border-slate-800 p-2 space-y-1.5">
                  {scenarios.map((scenario) => (
                    <button
                      key={`mob-scen-${scenario.id}`}
                      onClick={() => handleMobileScenarioSelect(scenario)}
                      className="w-full text-left px-2.5 py-2 rounded-md bg-slate-900 border border-slate-800 hover:border-blue-700/70 hover:bg-slate-800 transition-colors"
                    >
                      <p className="text-[11px] font-semibold text-slate-200 leading-snug">{scenario.title}</p>
                      <p className="text-[10px] text-slate-500 mt-1">{scenario.category}</p>
                    </button>
                  ))}
                </div>
              )}
            </div>

            <div className="rounded-lg border border-slate-800 bg-slate-900/50 overflow-hidden">
              <button
                onClick={() => setIsMobileReferenceOpen((v) => !v)}
                className="w-full px-3 py-2.5 flex items-center justify-between text-left"
              >
                <span className="inline-flex items-center gap-2 text-slate-200">
                  <BookOpen className="w-4 h-4 text-indigo-400" />
                  OWASP LLM Top 10
                </span>
                {isMobileReferenceOpen ? <ChevronUp className="w-4 h-4 text-slate-400" /> : <ChevronDown className="w-4 h-4 text-slate-400" />}
              </button>

              {isMobileReferenceOpen && (
                <div className="max-h-64 overflow-y-auto custom-scrollbar border-t border-slate-800 p-2 space-y-1.5">
                  {OWASP_LLM_TOP_10.map((item) => {
                    const expanded = mobileReferenceExpanded === item.code;
                    return (
                      <div key={`mob-ref-${item.code}`} className="rounded-md border border-slate-800 bg-slate-900">
                        <button
                          onClick={() => setMobileReferenceExpanded((prev) => (prev === item.code ? null : item.code))}
                          className="w-full text-left px-2.5 py-2 flex items-center justify-between"
                        >
                          <span className="text-[11px] text-slate-200 font-semibold">{item.code} - {item.name}</span>
                          {expanded ? <ChevronUp className="w-3.5 h-3.5 text-slate-400" /> : <ChevronDown className="w-3.5 h-3.5 text-slate-400" />}
                        </button>
                        {expanded && (
                          <p className="px-2.5 pb-2 text-[10px] leading-relaxed text-slate-400">{item.description}</p>
                        )}
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          </aside>
        </div>
      )}

      {/* Main Grid Layout */}
      <main className="flex-1 w-full max-w-7xl mx-auto p-4 md:p-6 grid grid-cols-1 xl:grid-cols-12 gap-6 overflow-y-auto xl:overflow-hidden">
        
        {/* Left Column: Scenarios + Diagnostics + Logbook */}
        <div className="hidden xl:flex xl:col-span-3 flex-col gap-6 h-full min-w-0">
          <ScenarioPanel
            scenarios={scenarios}
            activeScenario={activeScenario}
            onSelectScenario={handleSelectScenario}
            onLoadInitialPrompt={handleLoadInitialPrompt}
          />
          
          <SystemHealthHUD isVoiceConnected={isVoiceConnected} />

          <LearningCorner
            corrections={corrections}
            onResetCorrections={handleResetCorrections}
          />

          {trainingMode && (
            <XssWorkbench />
          )}
        </div>

        {/* Center Column: Interactive Command Chat with text + voice input */}
        <div className="col-span-1 xl:col-span-6 min-w-0 h-full">
          <ChatPanel
            messages={messages}
            inputText={inputText}
            isGenerating={isGenerating}
            activeScenario={activeScenario}
            isVoiceConnected={isVoiceConnected}
            isDictating={isDictating}
            voiceStatus={voiceStatus}
            isVoiceAvailable={isVoiceAvailable}
            voiceLogs={voiceLogs}
            starterQuestions={starterQuestions}
            showStarterPrompts={!hasUserInteracted}
            onInputChange={(value) => {
              if (!hasUserInteracted && value.trim().length > 0) {
                setHasUserInteracted(true);
              }
              setInputText(value);
            }}
            onSubmitMessage={handleSendMessage}
            onToggleVoice={toggleVoiceSession}
            onToggleDictation={toggleDictation}
            onStarterQuestionSelect={handleStarterQuestionSelect}
          />
        </div>

        {/* Right Column: AI Security Reference Library */}
        <div className="hidden xl:flex xl:col-span-3 flex-col gap-6 min-w-0 self-start">
          <div className="w-full">
            <ReferenceSheet />
          </div>
        </div>
      </main>

      <ComplianceDashboard
        isOpen={isComplianceOpen}
        records={complianceRecords}
        isLoading={isComplianceLoading}
        onClose={() => setIsComplianceOpen(false)}
        onRefreshEvidence={() => setEvidenceRefreshCount((c) => c + 1)}
      />

      {/* Floating Critical Alert banner */}
      {errorText && (
        <div className="fixed bottom-4 right-4 md:bottom-6 md:right-6 max-w-sm bg-red-950/90 backdrop-blur-md border border-red-800 p-4 rounded-xl shadow-2xl flex gap-3 items-start z-50">
          <AlertTriangle className="w-5 h-5 text-red-400 shrink-0 mt-0.5" />
          <div className="flex-1">
            <h4 className="text-xs font-bold text-red-200 uppercase tracking-widest font-mono">
              // INTERCEPT_ALERT
            </h4>
            <p className="text-[11px] text-red-300 mt-1 leading-relaxed">{errorText}</p>
            {lastFailedRequest && (
              <button
                onClick={handleRetryLastMessage}
                disabled={isGenerating}
                className="mt-2 px-3 py-1.5 rounded-md border border-red-600 bg-red-900/40 text-[11px] font-semibold text-red-100 hover:bg-red-900/60 disabled:opacity-60"
              >
                {isGenerating ? "Retrying..." : "Retry Last Message"}
              </button>
            )}
          </div>
          <button
            onClick={() => setErrorText(null)}
            className="text-red-400 hover:text-red-200 shrink-0 cursor-pointer p-0.5"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      )}
    </div>
  );
}