import React, { useState, useRef, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { BsRobot } from "react-icons/bs";
import { VscChromeMinimize } from "react-icons/vsc";
import axios from "axios";
import "./ChatBot.css";
import UserService from "../../../services/UserService";

// ─── Constants ───
const CHAT_STORAGE_KEY = "revenue_chat_sessions";
const POPUP_TRANSFER_KEY = "revenue_chat_popup_transfer";
const POPUP_RESTORE_OPEN_KEY = "revenue_chat_restore_popup";
const SCENARIO_PREFILL_KEY = "revenue_chat_scenario_prefill";
const DEPLOYED_API = "https://revenue.radar.bot.api.quation.co.in/chatbot/scenario/ask";
const CONFIRM_API = "https://revenue.radar.bot.api.quation.co.in/chatbot/scenario/confirm";

// ─── Helpers ───
const AiIcon = ({ size = 28, className = "" }) => (
  <BsRobot className={`ai-svg-icon ${className}`} size={size} />
);

const toLabel = (value) =>
  String(value || "")
    .replace(/[_-]+/g, " ")
    .trim()
    .replace(/\b\w/g, (ch) => ch.toUpperCase());

const normalizeKey = (value) =>
  String(value || "").toLowerCase().replace(/[_\s-]+/g, "");

const formatTime = (date) =>
  date.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });

const renderText = (text) =>
  text.split("\n").map((line, li) => {
    const parts = line.split(/(\*\*[^*]+\*\*)/g).map((part, pi) =>
      part.startsWith("**") && part.endsWith("**")
        ? <strong key={pi}>{part.slice(2, -2)}</strong>
        : part
    );
    return <React.Fragment key={li}>{li > 0 && <br />}{parts}</React.Fragment>;
  });

// ─── localStorage helpers ───
const loadSessions = () => {
  try { return JSON.parse(localStorage.getItem(CHAT_STORAGE_KEY)) || []; }
  catch { return []; }
};

const saveSessions = (sessions) =>
  localStorage.setItem(CHAT_STORAGE_KEY, JSON.stringify(sessions));

// ─── JSON parsing ───
const parsePossibleJSON = (value) => {
  if (typeof value !== "string") return null;
  const t = value.trim();
  if (!t.startsWith("{") && !t.startsWith("[")) return null;
  try { return JSON.parse(t); } catch { return null; }
};

const extractEmbeddedJSONObject = (value) => {
  if (typeof value !== "string") return null;
  const start = value.indexOf("{");
  const end = value.lastIndexOf("}");
  if (start === -1 || end === -1 || end <= start) return null;
  const candidate = value.slice(start, end + 1);
  try { return JSON.parse(candidate); } catch { return null; }
};

const deepParseJSON = (value) => {
  if (typeof value === "string") {
    const p = parsePossibleJSON(value) ?? extractEmbeddedJSONObject(value);
    return p ? deepParseJSON(p) : value;
  }
  if (Array.isArray(value)) return value.map(deepParseJSON);
  if (value && typeof value === "object")
    return Object.fromEntries(Object.entries(value).map(([k, v]) => [k, deepParseJSON(v)]));
  return value;
};

const extractListFromLooseString = (text, key) => {
  const re = new RegExp(`["']${key}["']\\s*:\\s*\\[(.*?)\\]`, "is");
  const match = re.exec(String(text || ""));
  if (!match?.[1]) return [];
  return match[1]
    .split(",")
    .map((item) => item.replace(/["'\n\r]/g, "").trim())
    .filter(Boolean);
};

const extractStringFromLooseString = (text, keys) => {
  const source = String(text || "");
  for (const key of keys) {
    const re = new RegExp(`["']${key}["']\\s*:\\s*["']([^"']+)["']`, "i");
    const match = re.exec(source);
    if (match?.[1]) return match[1].trim();
  }
  return "";
};

const deepFindByKeys = (obj, keys) => {
  if (!obj || typeof obj !== "object") return undefined;
  for (const [k, v] of Object.entries(obj))
    if (keys.includes(k)) return v;
  for (const v of Object.values(obj))
    if (v && typeof v === "object") {
      const found = deepFindByKeys(v, keys);
      if (found !== undefined) return found;
    }
  return undefined;
};

// ─── Options extraction ───
const extractOptions = (value) => {
  if (Array.isArray(value)) return value.map(String).filter(Boolean);
  if (typeof value === "string") return value ? [value] : [];
  if (value && typeof value === "object")
    return Object.values(value)
      .flatMap((e) => Array.isArray(e) ? e : typeof e === "string" ? [e] : [])
      .map(String).filter(Boolean);
  return [];
};

const extractMissingFieldData = (raw) => {
  if (!raw) return { fields: [], fieldOptions: {} };
  if (Array.isArray(raw)) return { fields: raw.map(String).filter(Boolean), fieldOptions: {} };
  if (typeof raw === "object") {
    const fields = Object.keys(raw);
    const fieldOptions = Object.fromEntries(
      Object.entries(raw)
        .map(([k, v]) => [k, extractOptions(v)])
        .filter(([, v]) => v.length > 0)
    );
    return { fields, fieldOptions };
  }
  return { fields: [], fieldOptions: {} };
};

const mergeFieldOptions = (...maps) =>
  maps.reduce((acc, cur) => {
    if (!cur || typeof cur !== "object") return acc;
    Object.entries(cur).forEach(([k, v]) => {
      const list = Array.isArray(v) ? v.map(String).filter(Boolean) : [];
      if (list.length) acc[k] = acc[k] ? [...new Set([...acc[k], ...list])] : list;
    });
    return acc;
  }, {});

// ─── Response normalization ───
const normalizeBotResponse = (rawData) => {
  const data = deepParseJSON(parsePossibleJSON(rawData) ?? rawData);

  if (!data || typeof data !== "object") {
    const source = String(data ?? "");
    const textFromLoose = extractStringFromLooseString(source, ["message", "reply", "response", "summary"]);
    const sessionFromLoose = extractStringFromLooseString(source, ["session_id", "sessionId"]);
    const intentFromLoose = extractStringFromLooseString(source, ["intent_type", "intentType", "intent"]);
    const missingFromLoose = extractListFromLooseString(source, "missing_parameters");
    return {
      text: textFromLoose || source || "Got it. Please share more details.",
      recommendations: [],
      missingFields: missingFromLoose,
      fieldOptions: {},
      readyToRun: null,
      intentType: intentFromLoose || null,
      sessionId: sessionFromLoose || null,
      completionCard: null,
    };
  }

  const missingRaw = deepFindByKeys(data, ["missing_fields", "missingFields", "required_fields", "missing_parameters"]);
  const optionsRaw = deepFindByKeys(data, ["missing_field_options", "missingFieldOptions", "field_options"]);
  const readyToRun = deepFindByKeys(data, ["ready_to_run", "readyToRun"]) ?? null;
  const intentType = deepFindByKeys(data, ["intent_type", "intentType", "intent"]) ?? null;
  const sessionId = deepFindByKeys(data, ["session_id", "sessionId"]) ?? null;
  const brand = deepFindByKeys(data, ["brand"]) ?? null;
  const market = deepFindByKeys(data, ["market"]) ?? null;
  const fy = deepFindByKeys(data, ["fy", "financial_year", "financialYear"]) ?? null;
  const timeline = deepFindByKeys(data, ["timeline"]) ?? null;
  const scenarioDetails = deepFindByKeys(data, ["scenario_details", "scenarioDetails"]) ?? null;
  const role = deepFindByKeys(data, ["role"]) ?? null;
  const status = deepFindByKeys(data, ["status"]) ?? null;
  const scenarioName = deepFindByKeys(data, [
    "scenario_name",
    "scenarioName",
    "suggested_scenario_name",
    "suggestedScenarioName",
  ]) ?? null;
  const scenarioTimestamp = deepFindByKeys(data, ["scenario_timestamp", "scenarioTimestamp"]) ?? null;

  const { fields: missingFields, fieldOptions } = extractMissingFieldData(missingRaw);
  const mergedOptions = mergeFieldOptions(fieldOptions, optionsRaw);

  const primaryText = deepFindByKeys(data, [
    "reply","message","response","answer","summary",
    "scenario_name_suggestion","question","next_question","follow_up_question",
  ]) ?? "";

  const recommendations = deepFindByKeys(data, ["recommendations","suggested_questions","followup_options"]) ?? [];

  const text = (typeof primaryText === "string" ? primaryText : "").trim() || "Got it. Please share more details.";

  const parsedMissing = text.match(/please\s+provide\s*:?\s*([^.]+)/i)?.[1]
    ?.split(/,| and /i).map(s => s.trim().replace(/[^a-zA-Z0-9_ -]/g, "")).filter(Boolean) ?? [];

  const completionCard = readyToRun === true
    ? {
        title: "Scenario Ready",
        message: text,
        details: { brand, market, fy, timeline, scenarioDetails },
      }
    : null;

  const confirmPayload = {
    ...(sessionId ? { session_id: String(sessionId) } : {}),
    ...(intentType ? { intent_type: String(intentType) } : {}),
    ...(role ? { role: String(role) } : {}),
    ...(status ? { status: String(status) } : {}),
    ...(brand ? { brand: String(brand) } : {}),
    ...(market ? { market: String(market) } : {}),
    ...(fy ? { fy: String(fy) } : {}),
    ...(timeline ? { timeline: String(timeline) } : {}),
    ...(scenarioDetails ? { scenario_details: scenarioDetails } : {}),
    ...(text ? { message: text } : {}),
    ...(scenarioName ? { scenario_name: String(scenarioName) } : {}),
    ...(scenarioTimestamp ? { scenario_timestamp: String(scenarioTimestamp) } : {}),
    ready_to_run: readyToRun === true,
  };

  return {
    text,
    recommendations: Array.isArray(recommendations) ? recommendations : [],
    missingFields: missingFields.length > 0 ? missingFields : parsedMissing,
    fieldOptions: mergedOptions,
    readyToRun: typeof readyToRun === "boolean" ? readyToRun : null,
    intentType: intentType ? String(intentType) : null,
    sessionId: sessionId ? String(sessionId) : null,
    completionCard,
    confirmPayload,
  };
};

// ─── API ───
const callChatbotAPI = async (message, sessionId = null, signal = undefined) => {
  const payload = { message, ...(sessionId && { session_id: sessionId }) };
  const response = await axios.post(DEPLOYED_API, payload, { signal });
  if (process.env.NODE_ENV !== "production") console.debug("Chatbot API raw response:", response.data);
  return normalizeBotResponse(response.data);
};

const callScenarioConfirmAPI = async (payload, signal = undefined) => {
  const response = await axios.post(CONFIRM_API, payload, { signal });
  return deepParseJSON(parsePossibleJSON(response.data) ?? response.data);
};

const buildScenarioPrefillFromConfirm = (confirmResponse, fallback = {}) => {
  const scenarioName = deepFindByKeys(confirmResponse, ["scenario_name", "scenarioName"]) || fallback?.scenario_name || "";
  const scenarioTimestamp = deepFindByKeys(confirmResponse, ["scenario_timestamp", "scenarioTimestamp"]) || fallback?.scenario_timestamp || "";
  return {
    brand: deepFindByKeys(confirmResponse, ["brand"]) || fallback?.brand || "",
    market: deepFindByKeys(confirmResponse, ["market"]) || fallback?.market || "",
    fy: deepFindByKeys(confirmResponse, ["fy", "financial_year", "financialYear"]) || fallback?.fy || "",
    timeline: deepFindByKeys(confirmResponse, ["timeline"]) || fallback?.timeline || "",
    scenario_name: scenarioName,
    scenario_timestamp: scenarioTimestamp,
  };
};

const mapAnswerToMissingFields = (messageText, lastBotMessage) => {
  const msg = String(messageText || "").trim();
  const missing = Array.isArray(lastBotMessage?.missingFields) ? lastBotMessage.missingFields : [];
  if (!msg || !missing.length) return msg;

  const alreadyLabeled = /^([\w\s-]+)\s*:\s*(.+)$/.test(msg);
  if (alreadyLabeled) return msg;

  const parts = msg.split(",").map((p) => p.trim()).filter(Boolean);
  if (parts.length > 1) {
    const toLabelPairs = parts.slice(0, missing.length).map((value, idx) => `${toLabel(missing[idx])}: ${value}`);
    return toLabelPairs.join("\n");
  }

  const normalizedMissing = missing.map((f) => normalizeKey(f));
  const fieldOptions = lastBotMessage?.fieldOptions || {};
  const extractedPairs = [];
  const pushUniquePair = (fieldName, value) => {
    if (!fieldName || !value) return;
    if (extractedPairs.some((p) => normalizeKey(p.field) === normalizeKey(fieldName))) return;
    extractedPairs.push({ field: fieldName, value: String(value).trim() });
  };

  const findMissingField = (aliases) => {
    const idx = normalizedMissing.findIndex((f) => aliases.some((a) => f.includes(a)));
    return idx >= 0 ? missing[idx] : null;
  };

  const fyMatch = msg.match(/\b(?:fy|financial\s*year)\s*[:\-]?\s*(20\d{2}\s*[-/]\s*\d{2})\b/i)
    || msg.match(/\b(20\d{2}\s*[-/]\s*\d{2})\b/i);
  if (fyMatch?.[1]) {
    const fyField = findMissingField(["fy", "financialyear", "year"]);
    if (fyField) pushUniquePair(fyField, fyMatch[1].replace(/\s+/g, ""));
  }

  const timelineMatch = msg.match(/\b(yearly|half\s*yearly|quarterly|monthly|weekly)\b/i);
  if (timelineMatch?.[1]) {
    const timelineField = findMissingField(["timeline", "frequency", "period"]);
    if (timelineField) pushUniquePair(timelineField, timelineMatch[1].toLowerCase().replace(/\s+/g, " "));
  }

  Object.entries(fieldOptions).forEach(([field, options]) => {
    if (!Array.isArray(options)) return;
    const found = options.find((opt) => {
      const n = String(opt || "").toLowerCase().trim();
      return n && msg.toLowerCase().includes(n);
    });
    if (found) pushUniquePair(field, found);
  });

  if (extractedPairs.length > 0) {
    const usedFields = new Set(extractedPairs.map((p) => normalizeKey(p.field)));
    const remaining = missing.filter((f) => !usedFields.has(normalizeKey(f)));
    const leftoverText = msg
      .replace(/\b(?:fy|financial\s*year)\s*[:\-]?\s*20\d{2}\s*[-/]\s*\d{2}\b/ig, " ")
      .replace(/\b20\d{2}\s*[-/]\s*\d{2}\b/g, " ")
      .replace(/\b(yearly|half\s*yearly|quarterly|monthly|weekly)\b/ig, " ")
      .replace(/\s+/g, " ")
      .trim();
    if (leftoverText && remaining.length > 0) pushUniquePair(remaining[0], leftoverText);
    return extractedPairs.map((p) => `${toLabel(p.field)}: ${p.value}`).join("\n");
  }

  if (missing.length === 1) return `${toLabel(missing[0])}: ${msg}`;
  return `${toLabel(missing[0])}: ${msg}`;
};

const isScenarioMessage = (msg) =>
  normalizeKey(msg?.intentType).includes("scenario") || Array.isArray(msg?.missingFields);

const isScenarioKickoffText = (text) =>
  /\bcreate\s+(?:a\s+)?scenario\b/i.test(String(text || ""));

const extractFieldValuePairs = (text) =>
  String(text || "")
    .split("\n")
    .map((line) => line.trim())
    .filter(Boolean)
    .map((line) => {
      const idx = line.indexOf(":");
      if (idx <= 0) return null;
      return { field: line.slice(0, idx).trim(), value: line.slice(idx + 1).trim() };
    })
    .filter((p) => p?.field && p?.value);

const buildScenarioMessage = (basePrompt, collected, fallback = "") => {
  const base = String(basePrompt || fallback || "").trim();
  const pairs = Object.entries(collected || {})
    .filter(([, value]) => String(value || "").trim())
    .map(([field, value]) => `${toLabel(field)}: ${String(value).trim()}`);
  return [base, ...pairs].filter(Boolean).join(", ").replace(/\s+/g, " ").trim();
};

// ─── Shared send logic ───
const useChatSend = ({ messages, setMessages, setInputValue, setIsTyping, backendSessionId, setBackendSessionId, requestControllerRef, scenarioDraftRef }) => {
  const handleSend = async (text, inputValue) => {
    const msg = (text || inputValue || "").trim();
    if (!msg) return;
    const sessionId = backendSessionId || null;

    setMessages(prev => [...prev, { from: "user", text: msg, time: new Date() }]);
    setInputValue("");
    setIsTyping(true);

    try {
      requestControllerRef.current?.abort?.();
      const controller = new AbortController();
      requestControllerRef.current = controller;
      const lastBotMessage = [...messages].reverse().find((m) => m.from === "bot");
      const mappedMessage = mapAnswerToMissingFields(msg, lastBotMessage);
      const hasKickoff = isScenarioKickoffText(msg);
      const shouldAppendToScenario = !hasKickoff && isScenarioMessage(lastBotMessage) && Array.isArray(lastBotMessage?.missingFields) && lastBotMessage.missingFields.length > 0;
      let outboundMessage = mappedMessage;
      if (hasKickoff) {
        const kickoffPairs = extractFieldValuePairs(mappedMessage);
        const collected = kickoffPairs.reduce((acc, { field, value }) => {
          acc[normalizeKey(field)] = value;
          return acc;
        }, {});
        scenarioDraftRef.current = { basePrompt: msg, collected };
        outboundMessage = buildScenarioMessage(msg, collected, mappedMessage);
      } else if (shouldAppendToScenario) {
        const basePrompt = scenarioDraftRef.current?.basePrompt || "";
        const collected = { ...(scenarioDraftRef.current?.collected || {}) };
        const pairs = extractFieldValuePairs(mappedMessage);
        if (pairs.length > 0) {
          pairs.forEach(({ field, value }) => { collected[normalizeKey(field)] = value; });
        } else if (Array.isArray(lastBotMessage?.missingFields) && lastBotMessage.missingFields.length > 0) {
          collected[normalizeKey(lastBotMessage.missingFields[0])] = mappedMessage;
        }
        scenarioDraftRef.current = { basePrompt: basePrompt || msg, collected };
        outboundMessage = buildScenarioMessage(basePrompt, collected, mappedMessage);
      }
      const reply = await callChatbotAPI(outboundMessage, sessionId, controller.signal);
      if (reply?.sessionId && reply.sessionId !== backendSessionId) setBackendSessionId(reply.sessionId);
      if (reply?.readyToRun === true) scenarioDraftRef.current = { basePrompt: "", collected: {} };
      setMessages(prev => [...prev, { from: "bot", ...reply, time: new Date() }]);
    } catch (error) {
      if (error?.name === "CanceledError" || error?.code === "ERR_CANCELED") return;
      setMessages(prev => [...prev, { from: "bot", text: "Sorry, I couldn't reach the server. Please try again.", recommendations: [], time: new Date() }]);
    } finally {
      requestControllerRef.current = null;
      setIsTyping(false);
    }
  };
  return handleSend;
};

// ─── BotReply component ───
const BotReply = ({ msg, onConfirmScenario, isConfirming, isConfirmed }) => (
  <div className="bot-rich-reply">
    <div className="bot-main-text">{renderText(msg.text || "")}</div>

    {(msg.intentType || typeof msg.readyToRun === "boolean") && (
      <div className="bot-meta-row">
        {msg.intentType && <span className="bot-meta-chip">Intent: {toLabel(msg.intentType)}</span>}
        {typeof msg.readyToRun === "boolean" && (
          <span className={`bot-status-chip ${msg.readyToRun ? "ready" : "pending"}`}>
            {msg.readyToRun ? "Ready to run" : "Awaiting details"}
          </span>
        )}
      </div>
    )}

    {!msg.readyToRun && msg.missingFields?.length > 0 && (
      <div className="bot-missing-fields">
        <div className="bot-missing-title">Almost there. Help me with these quick inputs:</div>
        <div className="bot-missing-list conversational">
          {msg.missingFields.map((field, idx) => (
            <div key={`${field}-${idx}`} className="bot-field-group question-row">
              <div className="bot-question-text">
                <span className="bot-question-bullet">Q{idx + 1}</span>
                <span>What should I use for {toLabel(field)}?</span>
              </div>
              {msg.fieldOptions?.[field]?.length > 0 && (
                <div className="bot-option-list">
                  {msg.fieldOptions[field].slice(0, 8).map((opt, oi) => (
                    <span key={`${field}-${opt}-${oi}`} className="bot-option-pill">{opt}</span>
                  ))}
                </div>
              )}
            </div>
          ))}
        </div>
      </div>
    )}

    {msg.completionCard && (
      <div className="bot-completion-card">
        <div className="bot-completion-title">{msg.completionCard.title}</div>
        <div className="bot-completion-name bot-completion-message">{msg.completionCard.message}</div>
        <div className="bot-completion-name"><span className="bot-completion-label">Brand:</span> {msg.completionCard.details?.brand || "-"}</div>
        <div className="bot-completion-name"><span className="bot-completion-label">Market:</span> {msg.completionCard.details?.market || "-"}</div>
        <div className="bot-completion-name"><span className="bot-completion-label">FY:</span> {msg.completionCard.details?.fy || "-"}</div>
        <div className="bot-completion-name"><span className="bot-completion-label">Timeline:</span> {msg.completionCard.details?.timeline || "-"}</div>
        <div className="bot-completion-name">
          <span className="bot-completion-label">Scenario Details:</span>{" "}
          {Array.isArray(msg.completionCard.details?.scenarioDetails)
            ? msg.completionCard.details.scenarioDetails
                .map((item) => {
                  if (!item || typeof item !== "object") return String(item);
                  return (
                    <div className="bot-completion-detail-item" key={JSON.stringify(item)}>
                      {Object.entries(item).map(([k, v]) => (
                        <div className="bot-completion-detail-row" key={k}>
                          <span className="bot-completion-detail-key">{toLabel(k)}:</span>{" "}
                          <span className="bot-completion-detail-value">{String(v)}</span>
                        </div>
                      ))}
                    </div>
                  );
                })
                
            : (msg.completionCard.details?.scenarioDetails || "-")}
        </div>
        <button
          className="scenario-open-btn"
          type="button"
          onClick={() => onConfirmScenario?.(msg)}
          disabled={Boolean(isConfirming) || Boolean(isConfirmed)}
        >
          {isConfirming ? "Confirming..." : isConfirmed ? "Scenario Confirmed" : "Open Scenario"}
        </button>
        {isConfirming && <div className="scenario-confirming-note">Confirming, please wait a few seconds...</div>}
      </div>
    )}

  </div>
);

// ─── Typing indicator ───
const TypingIndicator = ({ size = 18 }) => (
  <div className="chatbot-msg msg-bot">
    <div className="msg-avatar"><AiIcon size={size} /></div>
    <div className="msg-content">
      <div className="msg-bubble typing-bubble">
        <div className="typing-dots"><span /><span /><span /></div>
      </div>
    </div>
  </div>
);

// ─── Message list ───
const MessageList = ({ messages, isTyping, avatarSize, onSend, onConfirmScenario, confirmingMessageIndex = null, confirmedMessageIndexes = [] }) => (
  <>
    {messages.map((msg, idx) => (
      <div key={idx} className={`chatbot-msg ${msg.from === "bot" ? "msg-bot" : "msg-user"}`}>
        {msg.from === "bot" && <div className="msg-avatar"><AiIcon size={avatarSize} /></div>}
        <div className="msg-content">
          <div className="msg-bubble">
            {msg.from === "bot" ? <BotReply msg={msg} onConfirmScenario={(botMsg) => onConfirmScenario?.(botMsg, idx)} isConfirming={confirmingMessageIndex === idx} isConfirmed={confirmedMessageIndexes.includes(idx)} /> : msg.text}
          </div>
          {msg.from === "bot" && msg.recommendations?.length > 0 && (
            <div className="msg-recommendations enhanced">
              <div className="msg-recommendations-title">Try one of these next:</div>
              {msg.recommendations.map((rec, ri) => (
                <button key={ri} className="msg-rec-btn" onClick={() => onSend(rec)}>{rec}</button>
              ))}
            </div>
          )}
          <span className="msg-time">{formatTime(msg.time)}</span>
        </div>
      </div>
    ))}
    {isTyping && <TypingIndicator size={avatarSize} />}
  </>
);

// ─── Chat Popup ───
const ChatPopup = ({ theme, onClose }) => {
  const navigate = useNavigate();
  const [messages, setMessages] = useState([]);
  const [inputValue, setInputValue] = useState("");
  const [isTyping, setIsTyping] = useState(false);
  const [historyOpen, setHistoryOpen] = useState(false);
  const [savedChats, setSavedChats] = useState([]);
  const [maximizing, setMaximizing] = useState(false);
  const [currentChatId, setCurrentChatId] = useState(`chat_${Date.now()}`);
  const [backendSessionId, setBackendSessionId] = useState(null);
  const [confirmingMessageIndex, setConfirmingMessageIndex] = useState(null);
  const [confirmedMessageIndexes, setConfirmedMessageIndexes] = useState([]);
  const requestControllerRef = useRef(null);
  const scenarioDraftRef = useRef({ basePrompt: "", collected: {} });
  const messagesEndRef = useRef(null);
  const inputRef = useRef(null);

  useEffect(() => { messagesEndRef.current?.scrollIntoView({ behavior: "smooth" }); }, [messages, isTyping]);
  useEffect(() => { setTimeout(() => inputRef.current?.focus(), 100); }, []);

  useEffect(() => {
    try {
      if (localStorage.getItem(POPUP_RESTORE_OPEN_KEY) !== "1") return;
      localStorage.removeItem(POPUP_RESTORE_OPEN_KEY);
      const transferred = localStorage.getItem(POPUP_TRANSFER_KEY);
      if (!transferred) return;
      const parsed = JSON.parse(transferred);
      if (Array.isArray(parsed) && parsed.length) {
        setMessages(parsed.map(m => ({ ...m, time: new Date(m.time) })));
      }
      localStorage.removeItem(POPUP_TRANSFER_KEY);
    } catch { /* ignore */ }
  }, []);

  useEffect(() => {
    if (!messages.length) return;
    const sessions = loadSessions();
    const existing = sessions.find(s => s.id === currentChatId);
    let updated;
    if (existing) {
      updated = sessions.map(s => s.id === currentChatId ? { ...s, messages, backendSessionId, updatedAt: Date.now() } : s);
    } else {
      const raw = messages.find(m => m.from === "user")?.text || "New Chat";
      const stopWords = new Set(["is","the","a","an","in","for","of","to","and","or","how","what","which","show","me","has","vs","does","do","can","all","across","much","goes"]);
      const title = raw.split(/\s+/).filter(w => !stopWords.has(w.toLowerCase()) && w.length > 1).slice(0, 5).join(" ") || raw.slice(0, 30);
      updated = [{ id: currentChatId, title, messages, backendSessionId, createdAt: Date.now(), updatedAt: Date.now() }, ...sessions];
    }
    saveSessions(updated);
  }, [messages, currentChatId, backendSessionId]);

  const handleSend = useChatSend({ messages, setMessages, setInputValue, setIsTyping, backendSessionId, setBackendSessionId, requestControllerRef, scenarioDraftRef });

  const handleStopGenerating = () => {
    requestControllerRef.current?.abort?.();
    requestControllerRef.current = null;
    setIsTyping(false);
    setBackendSessionId(null);
    scenarioDraftRef.current = { basePrompt: "", collected: {} };
  };

  const handleNewChat = () => {
    setCurrentChatId(`chat_${Date.now()}`);
    setBackendSessionId(null);
    scenarioDraftRef.current = { basePrompt: "", collected: {} };
    setMessages([]); setHistoryOpen(false);
    setTimeout(() => inputRef.current?.focus(), 100);
  };

  const handleHistoryToggle = () => {
    if (!historyOpen) setSavedChats(loadSessions().filter(s => s.id !== currentChatId));
    setHistoryOpen(p => !p);
  };

  const loadSavedChat = (session) => {
    setCurrentChatId(session.id);
    setBackendSessionId(session.backendSessionId || null);
    setConfirmedMessageIndexes([]);
    scenarioDraftRef.current = { basePrompt: "", collected: {} };
    setMessages(session.messages.map(m => ({ ...m, time: new Date(m.time) })));
    setHistoryOpen(false);
  };

  const deleteSavedChat = (id) => {
    const updated = loadSessions().filter(s => s.id !== id);
    saveSessions(updated);
    setSavedChats(updated.filter(s => s.id !== currentChatId));
    if (currentChatId === id) { setCurrentChatId(`chat_${Date.now()}`); setBackendSessionId(null); scenarioDraftRef.current = { basePrompt: "", collected: {} }; setMessages([]); }
  };

  const handleMaximize = () => {
    if (messages.length) localStorage.setItem(POPUP_TRANSFER_KEY, JSON.stringify(messages));
    setMaximizing(true);
    setTimeout(() => { navigate("/chatbot"); setMaximizing(false); onClose(); }, 450);
  };

  const handleConfirmScenario = async (msg, messageIndex) => {
    const basePayload = msg?.confirmPayload || {};
    const payload = {
      ...basePayload,
      ...(backendSessionId && !basePayload.session_id ? { session_id: backendSessionId } : {}),
      ready_to_run: true,
    };
    setConfirmingMessageIndex(messageIndex);
    try {
      const confirmResponse = await callScenarioConfirmAPI(payload);
      const prefill = buildScenarioPrefillFromConfirm(confirmResponse, payload);
      localStorage.setItem(SCENARIO_PREFILL_KEY, JSON.stringify(prefill));
      setMessages((prev) => [
        ...prev,
        {
          from: "bot",
          text: deepFindByKeys(confirmResponse, ["message"]) || `Scenario "${prefill.scenario_name || "new scenario"}" confirmed. Opening Scenario Planner...`,
          recommendations: [],
          time: new Date(),
        },
      ]);
      setConfirmedMessageIndexes((prev) => [...new Set([...prev, messageIndex])]);
      onClose?.();
      navigate("/dashboard/simulator");
    } catch {
      setMessages((prev) => [
        ...prev,
        {
          from: "bot",
          text: "I could not confirm this scenario right now. Please try again.",
          recommendations: [],
          time: new Date(),
        },
      ]);
    } finally {
      setConfirmingMessageIndex(null);
    }
  };

  return (
    <div className={`chatbot-popup-overlay ${theme}-theme${maximizing ? " popup-maximizing" : ""}`}>
      <div className={`chatbot-popup ${theme}-theme`}>
        <div className="chatbot-popup-header">
          <span className="chatbot-popup-title"><AiIcon size={22} /> Revenue Chat</span>
          <div className="chatbot-popup-header-actions">
            <button className="chatbot-popup-history-btn" onClick={handleHistoryToggle} title="Saved chats"><i className="fas fa-history" /></button>
            <button className="chatbot-popup-newchat-btn" onClick={handleNewChat} title="New chat"><i className="fas fa-plus" /></button>
            <button className="chatbot-popup-maximize-btn" onClick={handleMaximize} disabled={maximizing} title="Open full page"><i className="fas fa-expand" /></button>
            <button className="chatbot-popup-close-btn" onClick={onClose} title="Close"><i className="fas fa-times" /></button>
          </div>
        </div>

        {historyOpen && (
          <div className="chatbot-popup-history">
            <div className="popup-history-header"><i className="fas fa-clock-rotate-left" /> Recent Chats</div>
            <div className="popup-history-list">
              {savedChats.length === 0
                ? <div className="popup-history-empty"><i className="far fa-comment-dots popup-history-empty-icon" />No saved chats yet</div>
                : savedChats.map(session => (
                  <div key={session.id} className="popup-history-item" onClick={() => loadSavedChat(session)}>
                    <i className="far fa-comment popup-history-item-icon" />
                    <span className="popup-history-title">{session.title}</span>
                    <button className="popup-history-delete" onClick={e => { e.stopPropagation(); deleteSavedChat(session.id); }} title="Delete"><i className="fas fa-trash-alt" /></button>
                  </div>
                ))}
            </div>
          </div>
        )}

        <div className="chatbot-popup-body">
          {messages.length === 0
            ? <div className="chatbot-popup-empty"><AiIcon size={40} className="popup-empty-icon" /><p>Ask me anything about your Revenue!</p></div>
            : <div className="chatbot-popup-messages">
                <MessageList
                  messages={messages}
                  isTyping={isTyping}
                  avatarSize={18}
                  onSend={t => handleSend(t, "")}
                  onConfirmScenario={handleConfirmScenario}
                  confirmingMessageIndex={confirmingMessageIndex}
                  confirmedMessageIndexes={confirmedMessageIndexes}
                />
                <div ref={messagesEndRef} />
              </div>}
        </div>

        <div className="chatbot-popup-input-wrapper">
          <div className="chatbot-popup-input-area">
            <input
              ref={inputRef} type="text" className="chatbot-popup-input"
              placeholder="Ask about your marketing data..."
              value={inputValue} onChange={e => setInputValue(e.target.value)}
              onKeyDown={e => e.key === "Enter" && handleSend(null, inputValue)}
              disabled={isTyping}
            />
            <button className="chatbot-popup-send-btn" onClick={() => handleSend(null, inputValue)} disabled={!inputValue.trim() || isTyping}>
              <i className="fas fa-paper-plane" />
            </button>
            {isTyping && (
              <button className="chatbot-popup-stop-btn" onClick={handleStopGenerating} type="button" title="Stop generating">
                <i className="fas fa-stop" />
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

// ─── Floating button (fixed position; opens/closes popup on click) ───
const ChatBot_API_v2 = ({ theme }) => {
  const [popupOpen, setPopupOpen] = useState(false);

  useEffect(() => {
    try {
      if (localStorage.getItem(POPUP_RESTORE_OPEN_KEY) === "1") setPopupOpen(true);
    } catch { /* ignore */ }
  }, []);

  return (
    <>
      <div
        className={`chatbot-nav-wrapper ${theme}-theme${popupOpen ? " popup-open" : ""}`}
        title="✨ Ask me anything about your Revenue!"
      >
        <button
          type="button"
          className={`chatbot-nav-btn ${theme}-theme`}
          onClick={() => setPopupOpen((p) => !p)}
          aria-expanded={popupOpen}
          aria-label={popupOpen ? "Close Revenue assistant" : "Open Revenue assistant"}
        >
          <span className="chatbot-nav-icon" role="img" aria-label="AI bot"><AiIcon size={38} /></span>
        </button>
      </div>
      {popupOpen && <ChatPopup theme={theme} onClose={() => setPopupOpen(false)} />}
    </>
  );
};

// ─── Full-page ChatBot ───
export const ChatBotPage = ({ theme: themeProp }) => {
  const navigate = useNavigate();
  const theme = themeProp || "light";
  const sidebarUserName =
    UserService.getFullName() ||
    UserService.getUsername() ||
    "Chatbot User";

  const [messages, setMessages] = useState([]);
  const [inputValue, setInputValue] = useState("");
  const [isTyping, setIsTyping] = useState(false);
  const [chatSessions, setChatSessions] = useState(loadSessions);
  const [currentChatId, setCurrentChatId] = useState(() => `chat_${Date.now()}`);
  const [backendSessionId, setBackendSessionId] = useState(null);
  const [confirmingMessageIndex, setConfirmingMessageIndex] = useState(null);
  const [confirmedMessageIndexes, setConfirmedMessageIndexes] = useState([]);
  const requestControllerRef = useRef(null);
  const scenarioDraftRef = useRef({ basePrompt: "", collected: {} });
  const messagesEndRef = useRef(null);
  const inputRef = useRef(null);
  const skipSaveRef = useRef(false);

  useEffect(() => { messagesEndRef.current?.scrollIntoView({ behavior: "smooth" }); }, [messages, isTyping]);
  useEffect(() => { setTimeout(() => inputRef.current?.focus(), 100); }, []);

  useEffect(() => {
    try {
      const transferred = localStorage.getItem(POPUP_TRANSFER_KEY);
      if (transferred) {
        const parsed = JSON.parse(transferred);
        if (Array.isArray(parsed) && parsed.length) setMessages(parsed.map(m => ({ ...m, time: new Date(m.time) })));
        localStorage.removeItem(POPUP_TRANSFER_KEY);
      }
    } catch { /* ignore */ }
  }, []);

  useEffect(() => {
    if (skipSaveRef.current) { skipSaveRef.current = false; return; }
    if (!messages.length) return;
    // Merge onto a FRESH localStorage read, not the `chatSessions` React
    // state — that state only syncs from localStorage once, at mount
    // (useState(loadSessions)), and never re-reads afterward. If a chat was
    // saved from the popup (or another tab) in the meantime, chatSessions
    // here is stale, and writing `prev`-derived data back would silently
    // overwrite/lose that session. ChatPopup's equivalent effect already
    // reads fresh each time — this mirrors that.
    const sessions = loadSessions();
    const existing = sessions.find(s => s.id === currentChatId);
    let updated;
    if (existing) {
      updated = sessions.map(s => s.id === currentChatId ? { ...s, messages, backendSessionId, updatedAt: Date.now() } : s);
    } else {
      const raw = messages.find(m => m.from === "user")?.text || "New Chat";
      const stopWords = new Set(["is","the","a","an","in","for","of","to","and","or","how","what","which","show","me","has","vs","does","do","can","all","across","much","goes"]);
      const title = raw.split(/\s+/).filter(w => !stopWords.has(w.toLowerCase()) && w.length > 1).slice(0, 5).join(" ") || raw.slice(0, 30);
      updated = [{ id: currentChatId, title, messages, backendSessionId, createdAt: Date.now(), updatedAt: Date.now() }, ...sessions];
    }
    saveSessions(updated);
    setChatSessions(updated);
  }, [messages, currentChatId, backendSessionId]);

  // Cross-tab sync: the `storage` event fires in OTHER tabs/windows when
  // localStorage changes here — not this tab — so if the user has the popup
  // open in one tab and the full page in another, saving a chat in one
  // wouldn't otherwise update the other's sidebar until a manual reload.
  useEffect(() => {
    const onStorage = (e) => {
      if (e.key === CHAT_STORAGE_KEY) setChatSessions(loadSessions());
    };
    window.addEventListener("storage", onStorage);
    return () => window.removeEventListener("storage", onStorage);
  }, []);

  const handleSend = useChatSend({ messages, setMessages, setInputValue, setIsTyping, backendSessionId, setBackendSessionId, requestControllerRef, scenarioDraftRef });

  const handleStopGenerating = () => {
    requestControllerRef.current?.abort?.();
    requestControllerRef.current = null;
    setIsTyping(false);
    setBackendSessionId(null);
    scenarioDraftRef.current = { basePrompt: "", collected: {} };
  };

  const handleNewChat = () => {
    setMessages([]); setConfirmedMessageIndexes([]); setCurrentChatId(`chat_${Date.now()}`); setBackendSessionId(null); scenarioDraftRef.current = { basePrompt: "", collected: {} };
    setTimeout(() => inputRef.current?.focus(), 100);
  };

  const loadChat = (session) => {
    skipSaveRef.current = true;
    setCurrentChatId(session.id);
    setBackendSessionId(session.backendSessionId || null);
    setConfirmedMessageIndexes([]);
    scenarioDraftRef.current = { basePrompt: "", collected: {} };
    setMessages(session.messages.map(m => ({ ...m, time: new Date(m.time) })));
  };

  const deleteChat = (id) => {
    setChatSessions(prev => { const u = prev.filter(s => s.id !== id); saveSessions(u); return u; });
    if (currentChatId === id) { setMessages([]); setCurrentChatId(`chat_${Date.now()}`); setBackendSessionId(null); scenarioDraftRef.current = { basePrompt: "", collected: {} }; }
  };

  const handleConfirmScenario = async (msg, messageIndex) => {
    const basePayload = msg?.confirmPayload || {};
    const payload = {
      ...basePayload,
      ...(backendSessionId && !basePayload.session_id ? { session_id: backendSessionId } : {}),
      ready_to_run: true,
    };
    setConfirmingMessageIndex(messageIndex);
    try {
      const confirmResponse = await callScenarioConfirmAPI(payload);
      const prefill = buildScenarioPrefillFromConfirm(confirmResponse, payload);
      localStorage.setItem(SCENARIO_PREFILL_KEY, JSON.stringify(prefill));
      setMessages((prev) => [
        ...prev,
        {
          from: "bot",
          text: deepFindByKeys(confirmResponse, ["message"]) || `Scenario "${prefill.scenario_name || "new scenario"}" confirmed. Opening Scenario Planner...`,
          recommendations: [],
          time: new Date(),
        },
      ]);
      setConfirmedMessageIndexes((prev) => [...new Set([...prev, messageIndex])]);
      navigate("/dashboard/simulator");
    } catch {
      setMessages((prev) => [
        ...prev,
        {
          from: "bot",
          text: "I could not confirm this scenario right now. Please try again.",
          recommendations: [],
          time: new Date(),
        },
      ]);
    } finally {
      setConfirmingMessageIndex(null);
    }
  };

  const handleMinimizeToCockpit = () => {
    try {
      if (messages.length) localStorage.setItem(POPUP_TRANSFER_KEY, JSON.stringify(messages));
      else localStorage.removeItem(POPUP_TRANSFER_KEY);
      localStorage.setItem(POPUP_RESTORE_OPEN_KEY, "1");
    } catch { /* ignore */ }
    navigate("/cockpit");
  };

  const handleBackToBrandCockpit = () => {
    navigate("/cockpit");
  };

  return (
    <div className={`chatbot-page ${theme}-theme`}>
      <aside className="chatbot-sidebar">
        <div className="sidebar-user">
          <div className="sidebar-user-avatar"><i className="fas fa-user" /></div>
          <div className="sidebar-user-info">
            <span className="sidebar-user-name">{sidebarUserName}</span>
            <span className="sidebar-user-role">Chatbot User</span>
          </div>
        </div>
        <button className="sidebar-newchat-btn" onClick={handleNewChat} title="New Chat">
          <i className="fas fa-plus" /> New Chat
        </button>
        <div className="sidebar-divider" />
        <div className="sidebar-header"><i className="fas fa-clock-rotate-left sidebar-header-icon" /><span>Saved Chats</span></div>
        <div className="sidebar-chats">
          {chatSessions.length === 0
            ? <div className="sidebar-no-chats">No saved chats yet</div>
            : chatSessions.map(session => (
              <div key={session.id} className={`sidebar-chat-item ${session.id === currentChatId ? "active" : ""}`} onClick={() => loadChat(session)}>
                <i className="far fa-comment sidebar-chat-icon" />
                <span className="sidebar-chat-title">{session.title}</span>
                <button className="sidebar-chat-delete" onClick={e => { e.stopPropagation(); deleteChat(session.id); }} title="Delete chat">
                  <i className="fas fa-trash-alt" />
                </button>
              </div>
            ))}
        </div>
      </aside>

      <div className="chatbot-main">
        <div className="chatbot-topbar">
          <span className="chatbot-title-text"><AiIcon size={30} /> Revenue Chat</span>
          <div className="chatbot-topbar-actions">
            <button type="button" className="chatbot-topbar-btn chatbot-topbar-btn-primary" onClick={handleBackToBrandCockpit} title="Leave full-page chat and return to Brand Cockpit">
              <i className="fas fa-arrow-left" aria-hidden /> Back to Brand Cockpit
            </button>
            <button
              type="button"
              className="chatbot-topbar-btn chatbot-topbar-btn-icon-only"
              onClick={handleMinimizeToCockpit}
              title="Minimize to floating chat"
              aria-label="Minimize to floating chat"
            >
              <VscChromeMinimize className="chatbot-minimize-icon" size={20} aria-hidden />
            </button>
          </div>
        </div>

        {messages.length === 0 ? (
          <div className="chatbot-empty-state">
            <h2 className="chatbot-empty-title">Where should we begin?</h2>
            <div className="chatbot-center-input-wrapper">
              <div className="chatbot-center-input-area">
                <input
                  ref={inputRef} type="text" className="chatbot-center-input"
                  placeholder="AI-powered marketing intelligence hub — Explore brand performance, media ROI, model accuracy & optimization"
                  value={inputValue} onChange={e => setInputValue(e.target.value)}
                  onKeyDown={e => e.key === "Enter" && handleSend(null, inputValue)}
                />
                <button className="chatbot-center-voice-btn" title="Voice input"><i className="fas fa-microphone" /></button>
                <button className="chatbot-center-send-btn" onClick={() => handleSend(null, inputValue)} disabled={!inputValue.trim()}><i className="fas fa-paper-plane" /></button>
              </div>
            </div>
          </div>
        ) : (
          <>
            <div className="chatbot-body">
              <div className="chatbot-messages">
                <MessageList
                  messages={messages}
                  isTyping={isTyping}
                  avatarSize={24}
                  onSend={t => handleSend(t, "")}
                  onConfirmScenario={handleConfirmScenario}
                  confirmingMessageIndex={confirmingMessageIndex}
                  confirmedMessageIndexes={confirmedMessageIndexes}
                />
                <div ref={messagesEndRef} />
              </div>
            </div>
            <div className="chatbot-input-wrapper">
              <div className="chatbot-input-area">
                <input
                  ref={inputRef} type="text" className="chatbot-input"
                  placeholder="Ask about your marketing data..."
                  value={inputValue} onChange={e => setInputValue(e.target.value)}
                  onKeyDown={e => e.key === "Enter" && handleSend(null, inputValue)}
                  disabled={isTyping}
                />
                <button className="chatbot-send-btn" onClick={() => handleSend(null, inputValue)} disabled={!inputValue.trim() || isTyping}><i className="fas fa-paper-plane" /></button>
                {isTyping && (
                  <button className="chatbot-stop-btn" onClick={handleStopGenerating} type="button" title="Stop generating">
                    <i className="fas fa-stop" />
                  </button>
                )}
              </div>
            </div>
          </>
        )}
      </div>
    </div>
  );
};

export default ChatBot_API_v2;