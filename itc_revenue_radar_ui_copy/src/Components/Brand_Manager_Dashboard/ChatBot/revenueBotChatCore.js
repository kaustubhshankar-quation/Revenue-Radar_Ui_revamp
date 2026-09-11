/**
 * Revenue bot — WebSocket connection, message mapping, chat hooks, and session/prefill storage.(Logic)
 * UI lives in ChatBot_API_v2.jsx.
 */
import { useState, useRef, useEffect, useCallback } from "react";
import { toast } from "react-toastify";
import UserService from "../../../services/UserService";

// ─── Constants ───
export const POPUP_TRANSFER_KEY = "revenue_chat_popup_transfer";
export const POPUP_RESTORE_OPEN_KEY = "revenue_chat_restore_popup";
export const SCENARIO_PREFILL_KEY = "revenue_chat_scenario_prefill";
const WS_BASE =
  process.env.REACT_APP_REVENUE_BOT_WS_BASE ||
  "wss://revenue.radar.bot.api.quation.co.in/revenue-bot/ws";

const HTTP_BASE =
  process.env.REACT_APP_REVENUE_BOT_API_BASE ||
  WS_BASE.replace(/^ws(s?)/, "http$1").replace(/\/revenue-bot\/ws.*$/, "");

export const WS_STATUS = {
  CONNECTING: "connecting",
  CONNECTED: "connected",
  DISCONNECTED: "disconnected",
  ERROR: "error",
};

export const WS_STATUS_LABELS = {
  connecting: "Connecting…",
  connected: "Online",
  disconnected: "Offline",
  error: "Connection error",
};

export const WS_REQUEST_TIMEOUT_MS = 60000;

const REVENUE_BOT_ROLE_MAP = [
  { codes: ["adminrole"], role: "ADMIN" },
  { codes: ["BBMNGR"], role: "BBMNGR" },
  { codes: ["OODMNGR"], role: "OODMNGR" },
  { codes: ["CBMNGR"], role: "CBMNGR" },
  { codes: ["MUMNGR"], role: "MUMNGR" },
  { codes: ["SALES"], role: "SALES" },
];

const getRevenueBotRoleCode = () => {
  for (const { codes, role } of REVENUE_BOT_ROLE_MAP) {
    if (UserService.hasRole(codes)) return role;
  }
  return "";
};

/** Backend may return display/session roles (e.g. viewer, brand_manager). Confirm must use Keycloak API codes. */
const API_ROLE_TO_CONFIRM_CODE = {
  admin: "ADMIN",
  adminrole: "ADMIN",
  brand_manager: "BBMNGR",
  bbmngr: "BBMNGR",
  oodles_manager: "OODMNGR",
  oodmngr: "OODMNGR",
  cbmngr: "CBMNGR",
  mumngr: "MUMNGR",
  sales: "SALES",
};

const resolveConfirmRole = (apiRole) => {
  const keycloakRole = getRevenueBotRoleCode();
  if (keycloakRole) return keycloakRole;

  const normalized = String(apiRole || "")
    .toLowerCase()
    .trim()
    .replace(/[\s-]+/g, "_");
  if (!normalized || normalized === "viewer") return "";

  return API_ROLE_TO_CONFIRM_CODE[normalized] || "";
};

const makeAbortError = () => {
  const err = new Error("Aborted");
  err.name = "CanceledError";
  err.code = "ERR_CANCELED";
  return err;
};

export const toLabel = (value) =>
  String(value || "")
    .replace(/[_-]+/g, " ")
    .trim()
    .replace(/\b\w/g, (ch) => ch.toUpperCase());

// ─── Backend session REST API helpers ───
export const fetchSessionsApi = async (userId) => {
  const res = await fetch(`${HTTP_BASE}/revenue-bot/sessions/${encodeURIComponent(userId)}`);
  if (!res.ok) throw new Error("Failed to fetch sessions");
  const data = await res.json();
  return data.sessions || [];
};

export const fetchSessionMessagesApi = async (userId, sessionId) => {
  const res = await fetch(
    `${HTTP_BASE}/revenue-bot/sessions/${encodeURIComponent(userId)}/${encodeURIComponent(sessionId)}`
  );
  if (!res.ok) throw new Error("Failed to fetch messages");
  return res.json();
};

export const deleteSessionApi = async (userId, sessionId) => {
  const res = await fetch(
    `${HTTP_BASE}/revenue-bot/sessions/${encodeURIComponent(userId)}/${encodeURIComponent(sessionId)}`,
    { method: "DELETE" }
  );
  if (!res.ok) throw new Error("Failed to delete session");
  return res.json();
};

// ─── Map WebSocket RESPONSE (backend sends canonical JSON) ───
export const getMissingFieldPrompt = (field, fieldHints, fieldOptions) => {
  if (fieldHints?.[field]) {
    return { question: fieldHints[field], example: null };
  }
  const label = toLabel(field);
  const opts = fieldOptions?.[field];
  if (Array.isArray(opts) && opts.length > 0) {
    return {
      question: `What should I use for ${label}?`,
      example: `e.g. ${opts.join(", ")}`,
    };
  }
  return { question: `What should I use for ${label}?`, example: null };
};

export const formatScenarioDriver = (item) => {
  if (!item || typeof item !== "object") return String(item ?? "");
  const name = toLabel(item.driver_name || "driver");
  const changeType = String(item.change_type || "").toLowerCase();
  const value = item.change_value ?? "";
  const unit = item.change_unit || "%";
  if (!value && value !== 0) return name;
  return `${changeType ? `${changeType} ` : ""}${name} by ${value}${unit}`;
};

const mapFieldOptions = (raw) => {
  const fieldOptions = {};
  const fieldHints = {};
  if (!raw || typeof raw !== "object" || Array.isArray(raw)) return { fieldOptions, fieldHints };
  Object.entries(raw).forEach(([key, value]) => {
    if (Array.isArray(value)) fieldOptions[key] = value.map(String).filter(Boolean);
    else if (typeof value === "string" && value.trim()) fieldHints[key] = value.trim();
  });
  return { fieldOptions, fieldHints };
};

const buildConfirmPayload = (data) => {
  const {
    brand,
    market,
    fy,
    timeline,
    scenario_details: scenarioDetails,
    suggested_scenario_name: suggestedScenarioName,
    scenario_name: scenarioName,
    role,
  } = data;
  const name = suggestedScenarioName || scenarioName;
  if (!name && !brand && !market) return null;
  const confirmRole = resolveConfirmRole(role);

  return {
    action: "confirm",
    role: confirmRole,
    scenario_name: String(name || ""),
    brand: brand ?? null,
    market: market ?? null,
    fy: fy ?? null,
    timeline: timeline ?? null,
    ...(Array.isArray(scenarioDetails) && scenarioDetails.length > 0
      ? { scenario_details: scenarioDetails }
      : {}),
  };
};

export const TIMETYPE_LABELS = { Y: "Yearly", HY: "Half-Yearly", Q: "Quarterly", M: "Monthly" };

export const resolveTimetype = (scenarioName, timeline) => {
  const name = String(scenarioName || "");
  if (name.startsWith("M_")) return "M";
  if (name.startsWith("Y_")) return "Y";
  if (name.startsWith("Q_")) return "Q";
  if (name.startsWith("HY_")) return "HY";
  const value = String(timeline || "").toLowerCase();
  if (value.includes("quarter") || value === "q") return "Q";
  if (value.includes("half") || value === "hy") return "HY";
  if (value.includes("year") || value === "y") return "Y";
  if (value.includes("month") || value === "m") return "M";
  return "";
};

export const buildScenarioPrefillFromConfirm = (reply, fallback = {}) => {
  const scenario_name = reply?.scenarioName || fallback?.scenario_name || "";
  const timeline = reply?.timeline || fallback?.timeline || "";
  const scenario_details =
    fallback?.scenario_details ||
    (Array.isArray(reply?.scenarioDetails) ? reply.scenarioDetails : null);
  return {
    brand: reply?.brand || fallback?.brand || "",
    market: reply?.market || fallback?.market || "",
    fy: reply?.fy || fallback?.fy || "",
    timeline,
    scenario_name,
    scenario_timestamp: reply?.scenarioTimestamp || fallback?.scenario_timestamp || "",
    scenario_details: Array.isArray(scenario_details) ? scenario_details : [],
    scenarionewoldscreen: "old",
    timetype: resolveTimetype(scenario_name, timeline),
    from_chatbot: true,
  };
};

export const saveScenarioPrefill = (prefill) =>
  localStorage.setItem(SCENARIO_PREFILL_KEY, JSON.stringify(prefill));

export const consumeScenarioPrefill = () => {
  try {
    const raw = localStorage.getItem(SCENARIO_PREFILL_KEY);
    if (!raw) return null;
    localStorage.removeItem(SCENARIO_PREFILL_KEY);
    const prefill = JSON.parse(raw);
    return prefill && typeof prefill === "object" ? prefill : null;
  } catch {
    return null;
  }
};

export const mapWsResponse = (data) => {
  const fail = (text, reason = "server_error") => ({
    text,
    quickReplies: [],
    recommendations: [],
    missingFields: [],
    fieldOptions: {},
    fieldHints: {},
    readyToRun: false,
    intentType: null,
    status: "failed",
    reason,
    errors: [text],
    clarifyingQuestion: null,
    resolvedRole: null,
    completionCard: null,
    confirmPayload: null,
    isSaved: false,
    scenarioName: null,
    scenarioTimestamp: null,
    brand: null,
    market: null,
    fy: null,
    timeline: null,
  });

  if (!data || typeof data !== "object") return fail("Got it. Please share more details.");

  const {
    message,
    intent,
    status,
    reason,
    role,
    ready_to_run: readyToRun,
    missing_parameters: missingParameters = [],
    missing_field_options: optionsRaw,
    errors = [],
    clarifying_question: clarifyingQuestion,
    quick_replies: quickReplies = [],
    brand,
    market,
    fy,
    timeline,
    scenario_details: scenarioDetails,
    suggested_scenario_name: suggestedScenarioName,
    scenario_name: scenarioName,
    scenario_timestamp: scenarioTimestamp,
    analytics_type: analyticsType,
    scenario_reset: scenarioReset,
    changes_preview: changesPreview,
    changes_summary: changesSummary,
    driver_warnings: driverWarnings,
    analytics_data: analyticsData,
  } = data;

  const { fieldOptions, fieldHints } = mapFieldOptions(optionsRaw);
  const text = String(message || clarifyingQuestion || "").trim() || "Got it. Please share more details.";
  const missingFields = Array.isArray(missingParameters) ? missingParameters.map(String) : [];
  const errList = Array.isArray(errors) ? errors.map(String).filter(Boolean) : [];
  const replies = Array.isArray(quickReplies) ? quickReplies : [];
  const isSaved = String(status || "").toLowerCase() === "saved";
  const resolvedScenarioName = scenarioName || suggestedScenarioName || null;

  const isMissingParams = reason === "missing_parameters" || (missingFields.length > 0 && readyToRun === false);

  const baseFields = {
    text,
    intentType: intent || null,
    status: status || null,
    reason: reason || null,
    resolvedRole: role || null,
    missingFields,
    fieldOptions,
    fieldHints,
    errors: errList,
    clarifyingQuestion: clarifyingQuestion || null,
    quickReplies: replies,
    recommendations: replies,
    isMissingParams,
    brand: brand || null,
    market: market || null,
    fy: fy || null,
    timeline: timeline || null,
    scenarioName: resolvedScenarioName,
    scenarioTimestamp: scenarioTimestamp || null,
    analyticsType: analyticsType || null,
    scenarioReset: Boolean(scenarioReset),
    scenarioDetails: Array.isArray(scenarioDetails) ? scenarioDetails : null,
    changesPreview: Array.isArray(changesPreview) ? changesPreview : null,
    changesSummary: Array.isArray(changesSummary) ? changesSummary : null,
    driverWarnings: Array.isArray(driverWarnings) && driverWarnings.length > 0 ? driverWarnings : null,
    analyticsData: analyticsData && typeof analyticsData === "object" ? analyticsData : null,
    confirmPayload: null,
    isSaved,
  };

  if (isSaved) {
    return {
      ...baseFields,
      readyToRun: false,
      completionCard: null,
      confirmPayload: null,
    };
  }

  const showCompletionCard = readyToRun === true;

  return {
    ...baseFields,
    readyToRun: typeof readyToRun === "boolean" ? readyToRun : null,
    completionCard: showCompletionCard
      ? {
          title: "Scenario ready to run",
          message: text,
          suggestedName: suggestedScenarioName || scenarioName || null,
          details: { brand, market, fy, timeline, scenarioDetails },
        }
      : null,
    confirmPayload: showCompletionCard ? buildConfirmPayload(data) : null,
  };
};

// ─── WebSocket ───
export const getWsUserId = () => {
  const username = UserService.getUsername();
  const safe = String(username || "test_user").trim().replace(/[^\w.-]/g, "_");
  return safe || "test_user";
};

const buildWsUrl = (sessionId = null) => {
  const base = String(WS_BASE || "").replace(/\/$/, "");
  const url = `${base}/${encodeURIComponent(getWsUserId())}`;
  return sessionId ? `${url}?session_id=${encodeURIComponent(sessionId)}` : url;
};

const createRevenueBotSocket = () => {
  let socket = null;
  let status = WS_STATUS.DISCONNECTED;
  let pending = null;
  let reconnectTimer = null;
  let disconnectTimer = null;   // debounce so React StrictMode double-mount doesn't create ghost sessions
  let reconnectAttempt = 0;
  let shouldStayConnected = false;
  let refCount = 0;
  let wsSessionId = null;
  const statusListeners = new Set();
  const sessionListeners = new Set();

  const notifyStatus = (next) => {
    status = next;
    statusListeners.forEach((fn) => fn(next));
  };

  const clearReconnectTimer = () => {
    if (reconnectTimer) {
      clearTimeout(reconnectTimer);
      reconnectTimer = null;
    }
  };

  const rejectPending = (error) => {
    if (!pending) return;
    const { reject } = pending;
    pending = null;
    reject(error);
  };

  const scheduleReconnect = () => {
    if (!shouldStayConnected) return;
    clearReconnectTimer();
    const delay = Math.min(1000 * 2 ** reconnectAttempt, 15000);
    reconnectAttempt += 1;
    reconnectTimer = setTimeout(() => {
      if (shouldStayConnected) openSocket();
    }, delay);
  };

  const openSocket = () => {
    if (socket && (socket.readyState === WebSocket.OPEN || socket.readyState === WebSocket.CONNECTING)) {
      return;
    }

    notifyStatus(WS_STATUS.CONNECTING);

    try {
      socket = new WebSocket(buildWsUrl(wsSessionId));
    } catch (error) {
      notifyStatus(WS_STATUS.ERROR);
      scheduleReconnect();
      return;
    }

    socket.onopen = () => {
      reconnectAttempt = 0;
      notifyStatus(WS_STATUS.CONNECTED);
    };

    socket.onmessage = (event) => {
      let data;
      try {
        data = JSON.parse(event.data);
      } catch {
        return;
      }

      const eventType = String(data?.event || "").toUpperCase();

      if (eventType === "CONNECTED") {
        wsSessionId = data?.session_id ? String(data.session_id) : wsSessionId;
        sessionListeners.forEach((fn) => fn(wsSessionId));
        return;
      }

      if (eventType === "THINKING" || !pending) return;

      if (eventType === "ERROR") {
        const { reject } = pending;
        pending = null;
        reject(new Error(String(data?.message || "Server error")));
        return;
      }

      if (eventType !== "RESPONSE") return;

      const { resolve } = pending;
      pending = null;
      if (process.env.NODE_ENV !== "production") console.debug("Revenue bot WS response:", data);
      const mapped = mapWsResponse(data);
      mapped.sessionId = wsSessionId;

      resolve(mapped);
    };

    socket.onerror = () => {
      if (status !== WS_STATUS.CONNECTED) notifyStatus(WS_STATUS.ERROR);
    };

    socket.onclose = () => {
      socket = null;
      rejectPending(new Error("WebSocket disconnected"));
      notifyStatus(WS_STATUS.DISCONNECTED);
      scheduleReconnect();
    };
  };

  const connect = () => {
    shouldStayConnected = true;
    reconnectAttempt = 0;
    clearReconnectTimer();
    openSocket();
  };

  const disconnect = () => {
    shouldStayConnected = false;
    refCount = 0;
    clearReconnectTimer();
    rejectPending(new Error("WebSocket closed"));
    if (socket) {
      socket.onclose = null;
      socket.close();
      socket = null;
    }
    wsSessionId = null;
    notifyStatus(WS_STATUS.DISCONNECTED);
  };

  const switchSession = (nextSessionId, pendingErrorMessage) => {
    wsSessionId = nextSessionId;
    if (!shouldStayConnected) return Promise.resolve(wsSessionId || undefined);

    return new Promise((resolve) => {
      const finish = () => {
        clearReconnectTimer();
        reconnectAttempt = 0;
        openSocket();
        const unsub = subscribeStatus((next) => {
          if (next === WS_STATUS.CONNECTED) {
            unsub();
            resolve(wsSessionId);
          }
        });
      };

      rejectPending(new Error(pendingErrorMessage));
      if (socket) {
        socket.onclose = () => {
          socket = null;
          notifyStatus(WS_STATUS.DISCONNECTED);
          finish();
        };
        socket.close();
      } else {
        finish();
      }
    });
  };

  /** Reconnect with a specific existing session_id so the backend restores LLM history + sticky. */
  const loadExistingSession = (sessionId) => switchSession(sessionId, "Session switch");

  /** Close and reopen WebSocket so backend starts a fresh session (after scenario completes or new chat). */
  const resetSession = () => switchSession(null, "Session reset");

  const acquire = () => {
    // Cancel any pending debounced disconnect — rapid acquire→release→acquire (React StrictMode) stays connected
    if (disconnectTimer) {
      clearTimeout(disconnectTimer);
      disconnectTimer = null;
    }
    refCount += 1;
    if (refCount === 1) connect();
  };

  const release = () => {
    refCount = Math.max(0, refCount - 1);
    if (refCount === 0) {
      // Debounce: wait 600ms before actually closing so StrictMode double-mount doesn't create ghost sessions
      disconnectTimer = setTimeout(() => {
        disconnectTimer = null;
        if (refCount === 0) disconnect();
      }, 600);
    }
  };

  const sendPayload = (payload, options = {}) => {
    const { signal = undefined, timeoutMs = WS_REQUEST_TIMEOUT_MS } = options;
    const hasTimeout = timeoutMs != null && timeoutMs > 0;

    return new Promise((resolve, reject) => {
      if (signal?.aborted) {
        reject(makeAbortError());
        return;
      }

      if (!socket || socket.readyState !== WebSocket.OPEN) {
        reject(new Error("WebSocket not connected"));
        return;
      }

      if (pending) {
        pending.reject(new Error("Previous request superseded"));
        pending = null;
      }

      const onAbort = () => {
        if (pending?.resolve === resolve) {
          if (timeoutId != null) clearTimeout(timeoutId);
          pending = null;
        }
        reject(makeAbortError());
      };

      const timeoutId = hasTimeout
        ? setTimeout(() => {
            if (pending?.resolve === resolve) {
              pending = null;
              reject(new Error("Request timed out. Please try again."));
            }
          }, timeoutMs)
        : null;

      signal?.addEventListener("abort", onAbort, { once: true });

      pending = {
        resolve: (value) => {
          if (timeoutId != null) clearTimeout(timeoutId);
          signal?.removeEventListener("abort", onAbort);
          resolve(value);
        },
        reject: (error) => {
          if (timeoutId != null) clearTimeout(timeoutId);
          signal?.removeEventListener("abort", onAbort);
          reject(error);
        },
      };

      socket.send(JSON.stringify(payload));
    });
  };

  const sendMessage = (message, options = {}) => {
    const {
      role = getRevenueBotRoleCode(),
      brand = null,
      market = null,
      fy = null,
      timeline = null,
      signal = undefined,
    } = options;

    return sendPayload(
      {
        message: String(message || "").trim(),
        role: role ?? "",
        brand: brand ?? null,
        market: market ?? null,
        fy: fy ?? null,
        timeline: timeline ?? null,
      },
      { signal }
    );
  };

  const subscribeStatus = (listener) => {
    statusListeners.add(listener);
    listener(status);
    return () => statusListeners.delete(listener);
  };

  const subscribeSession = (listener) => {
    sessionListeners.add(listener);
    if (wsSessionId) listener(wsSessionId);
    return () => sessionListeners.delete(listener);
  };

  return {
    acquire,
    release,
    sendMessage,
    sendPayload,
    resetSession,
    loadExistingSession,
    subscribeStatus,
    subscribeSession,
    getStatus: () => status,
    getSessionId: () => wsSessionId,
  };
};

export const revenueBotSocket = createRevenueBotSocket();
let wsConnectToastShown = false;

const showWsConnectedToast = () => {
  if (wsConnectToastShown) return;
  wsConnectToastShown = true;
  toast.success("Real-time chat enabled — you are online.", {
    position: "top-right",
    autoClose: 4000,
    hideProgressBar: false,
    closeOnClick: true,
    pauseOnHover: true,
  });
};

export const useRevenueBotWebSocket = ({ enabled = true } = {}) => {
  const [wsStatus, setWsStatus] = useState(revenueBotSocket.getStatus());

  useEffect(() => {
    if (!enabled) return undefined;

    revenueBotSocket.acquire();
    const unsubscribe = revenueBotSocket.subscribeStatus((next) => {
      setWsStatus(next);
      if (next === WS_STATUS.CONNECTED) showWsConnectedToast();
      if (next === WS_STATUS.DISCONNECTED || next === WS_STATUS.ERROR) {
        wsConnectToastShown = false;
      }
    });

    return () => {
      unsubscribe();
      revenueBotSocket.release();
    };
  }, [enabled]);

  const sendBotMessage = useCallback(
    (message, options) => revenueBotSocket.sendMessage(message, options),
    []
  );

  return { wsStatus, sendBotMessage };
};

// ─── Shared send logic (backend keeps session on the same WebSocket until confirm saved) ───
export const useChatSend = ({
  setMessages,
  setInputValue,
  setIsTyping,
  requestControllerRef,
  sendBotMessage,
  wsStatus,
  feOverrides = {},
}) => {
  const handleSend = async (text, inputValue) => {
    const msg = (text || inputValue || "").trim();
    if (!msg) return;

    if (wsStatus !== WS_STATUS.CONNECTED) {
      toast.info(
        wsStatus === WS_STATUS.CONNECTING
          ? "Connecting to Revenue assistant…"
          : "Reconnecting to Revenue assistant. Please try again in a moment.",
        { position: "top-right", autoClose: 3000 }
      );
      return;
    }

    setMessages((prev) => [...prev, { from: "user", text: msg, time: new Date() }]);
    setInputValue("");
    setIsTyping(true);

    try {
      requestControllerRef.current?.abort?.();
      const controller = new AbortController();
      requestControllerRef.current = controller;

      const reply = await sendBotMessage(msg, {
        role: getRevenueBotRoleCode(),
        signal: controller.signal,
        ...feOverrides,
      });
      setMessages((prev) => {
        // Lock stale completion cards when a new ready-to-run arrives OR when user resets
        const shouldLock = reply.readyToRun || reply.scenarioReset;
        const base = shouldLock
          ? prev.map((m) =>
              m.from === "bot" && m.readyToRun === true && !m.scenarioConfirmed
                ? { ...m, scenarioConfirmed: true }
                : m
            )
          : prev;
        return [...base, { from: "bot", ...reply, time: new Date() }];
      });
    } catch (error) {
      if (error?.name === "CanceledError" || error?.code === "ERR_CANCELED") return;
      const errText = String(error?.message || "");
      setMessages((prev) => [
        ...prev,
        {
          from: "bot",
          text: errText.includes("WebSocket")
            ? "Sorry, I couldn't reach the assistant. Please check your connection and try again."
            : errText || "Sorry, something went wrong. Please try again.",
          recommendations: [],
          errors: errText ? [errText] : [],
          time: new Date(),
        },
      ]);
    } finally {
      requestControllerRef.current = null;
      setIsTyping(false);
    }
  };
  return handleSend;
};

// Single source of truth for "this card is confirmed" is msg.scenarioConfirmed on the message
// itself; we only track the in-flight index here for the "Confirming…" indicator.
const openSimulatorLoadingTab = () => {
  const tab = window.open("about:blank", "_blank");
  if (!tab) return null;

  try {
    tab.document.title = "Preparing Scenario...";
    // Clone the app's stylesheets (incl. ChatBot.css) into the new tab so it can
    // use the shared .scenario-loading-* classes defined in ChatBot.css.
    document
      .querySelectorAll('style, link[rel="stylesheet"]')
      .forEach((node) => tab.document.head.appendChild(node.cloneNode(true)));

    tab.document.body.className = "scenario-loading-body";
    tab.document.body.innerHTML = `
      <div class="scenario-loading-card">
        <div class="scenario-loading-spinner"></div>
        <h1 class="scenario-loading-title">Preparing Scenario Planner</h1>
        <p class="scenario-loading-text" style="margin-top: 6px;">Please wait while your scenario is being saved...</p>
      </div>
    `;
  } catch {
    // If the browser blocks document access, we still keep the tab for redirect.
  }

  return tab;
};

export const useScenarioConfirm = ({ wsStatus, setMessages, setIsTyping, onClose }) => {
  const [confirmingMessageIndex, setConfirmingMessageIndex] = useState(null);
  const [confirmedMessageIndexes, setConfirmedMessageIndexes] = useState([]);
  const confirmLockRef = useRef(new Set());

  const lockConfirmCard = useCallback(
    (messageIndex) => {
      confirmLockRef.current.add(messageIndex);
      setConfirmedMessageIndexes((prev) => [...new Set([...prev, messageIndex])]);
      setMessages((prev) =>
        prev.map((m, i) => (i === messageIndex ? { ...m, scenarioConfirmed: true } : m))
      );
    },
    [setMessages]
  );

  const handleConfirmScenario = useCallback(
    async (msg, messageIndex) => {
      if (confirmLockRef.current.has(messageIndex) || msg?.scenarioConfirmed) return;

      const basePayload = msg?.confirmPayload;
      if (!basePayload) return;

      const payload = {
        ...basePayload,
        role: resolveConfirmRole(basePayload.role) || getRevenueBotRoleCode(),
      };

      if (!payload.role) {
        toast.error(
          "Your account does not have permission to save scenarios. Please contact your administrator.",
          { position: "top-right", autoClose: 5000 }
        );
        return;
      }

      if (wsStatus !== WS_STATUS.CONNECTED) {
        toast.info("Reconnecting to Revenue assistant. Please try again in a moment.", {
          position: "top-right",
          autoClose: 3000,
        });
        return;
      }

      lockConfirmCard(messageIndex);
      setConfirmingMessageIndex(messageIndex);
      setIsTyping(true);

      const simulatorTab = openSimulatorLoadingTab();

      try {
        const reply = await revenueBotSocket.sendPayload(payload, { timeoutMs: null });
        if (reply.isSaved || String(reply.status || "").toLowerCase() === "saved") {
          const prefill = buildScenarioPrefillFromConfirm(reply, payload);
          saveScenarioPrefill(prefill);
          toast.success(
            reply.text ||
              `Scenario "${prefill.scenario_name || "saved"}" saved. Opening Scenario Planner…`
          );
          await revenueBotSocket.resetSession().catch(() => {});
          onClose?.();
          if (simulatorTab) {
            simulatorTab.location.href = "/dashboard/simulator";
          } else {
            window.open("/dashboard/simulator", "_blank");
          }
          return;
        }
        simulatorTab?.close();

        setMessages((prev) => [
          ...prev,
          {
            from: "bot",
            text: reply.text || "Could not save this scenario. Please try again.",
            errors: reply.errors?.length ? reply.errors : [],
            recommendations: [],
            time: new Date(),
          },
        ]);
      } catch (error) {
        simulatorTab?.close();
        if (error?.name === "CanceledError" || error?.code === "ERR_CANCELED") return;
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
        setIsTyping(false);
      }
    },
    [wsStatus, setMessages, setIsTyping, onClose, lockConfirmCard]
  );

  const resetConfirmState = useCallback(() => {
    confirmLockRef.current.clear();
    setConfirmingMessageIndex(null);
    setConfirmedMessageIndexes([]);
  }, []);

  return {
    confirmingMessageIndex,
    confirmedMessageIndexes,
    handleConfirmScenario,
    resetConfirmState,
  };
};
