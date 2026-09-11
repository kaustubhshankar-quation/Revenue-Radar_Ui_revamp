/**
 * Revenue bot — UI components (popup, full page, message rendering). (UI)
 * WebSocket, hooks, and session logic live in revenueBotChatCore.js.
 */
import React, { useState, useRef, useEffect } from "react";
import { toast } from "react-toastify";
import { useNavigate } from "react-router-dom";
import { VscChromeMinimize } from "react-icons/vsc";
import "./ChatBot.css";
import QuationChatbotAvatar from "./ChatbotIcon";
import UserService from "../../../services/UserService";
import {
  WS_STATUS,
  WS_STATUS_LABELS,
  POPUP_TRANSFER_KEY,
  POPUP_RESTORE_OPEN_KEY,
  revenueBotSocket,
  useRevenueBotWebSocket,
  useChatSend,
  useScenarioConfirm,
  toLabel,
  getMissingFieldPrompt,
  formatScenarioDriver,
  mapWsResponse,
  getWsUserId,
  fetchSessionsApi,
  fetchSessionMessagesApi,
  deleteSessionApi,
} from "./revenueBotChatCore";

// Prefill / session helpers: import from ./revenueBotChatCore (Simulator already does).

// ─── UI helpers ───
// Visual size is bumped vs. the prop because the mascot PNG has internal padding
// around the character, so a 1.6x scale keeps it visually prominent.
const AiIcon = ({ size = 28, className = "" }) => {
  const renderSize = Math.round(size * 1.6);
  return (
    <img
      src="/Assets/Images/revenue-bot-mascot.png"
      alt="Revenue assistant"
      width={renderSize}
      height={renderSize}
      className={`ai-bot-mascot ${className}`}
      draggable={false}
    />
  );
};

const formatTime = (date) =>
  date.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });

// Python datetime strings use a space separator ("2026-06-01 12:00:00.000000")
// which Safari doesn't parse. Normalise to ISO 8601 before constructing Date.
const parseDbDate = (raw) => {
  if (!raw) return new Date();
  const iso = String(raw).replace(" ", "T");
  const d = new Date(iso);
  return isNaN(d.getTime()) ? new Date() : d;
};

// Map a raw WS/DB message list into the bot/user message shape used by the UI.
const restoreWsMessages = (rawMessages) =>
  (rawMessages || []).map((msg) => {
    if (msg.role === "bot" && msg.metadata) {
      const mapped = mapWsResponse(msg.metadata);
      return {
        from: "bot",
        ...mapped,
        // Historical ready-to-run cards are already confirmed or expired
        ...(mapped.readyToRun === true ? { scenarioConfirmed: true } : {}),
        time: parseDbDate(msg.created_at),
      };
    }
    return { from: "user", text: msg.message, time: parseDbDate(msg.created_at) };
  });

const renderText = (text) =>
  text.split("\n").map((line, li) => {
    const parts = line.split(/(\*\*[^*]+\*\*)/g).map((part, pi) =>
      part.startsWith("**") && part.endsWith("**")
        ? <strong key={pi}>{part.slice(2, -2)}</strong>
        : part
    );
    return <React.Fragment key={li}>{li > 0 && <br />}{parts}</React.Fragment>;
  });

// ─── Shared number / change formatters ───
const fmtN = (n) =>
  n == null ? "—" : Number(n).toLocaleString(undefined, { maximumFractionDigits: 0 });

const fmtPct2 = (n) =>
  n == null ? "—" : `${Number(n).toFixed(1)}%`;

const fmtRoi = (n) =>
  n == null ? "—" : Number(n).toFixed(3);

// Signed percentage ("+1.5%" / "-1.5%"); empty string when value is missing.
const fmtPctSigned = (n) =>
  n == null ? "" : `${n > 0 ? "+" : ""}${Number(n).toFixed(1)}%`;

// Renders the driver change (e.g. "▲ 5%" or "▼ 2–8%") from a scenario driver row.
const formatChangeValue = (d) => {
  const ov = d.variable_overrides;
  const sign = d.change_type === "increase" ? "▲" : "▼";
  const unit = d.change_unit || "%";
  if (ov && Object.keys(ov).length > 0) {
    const vals = [...new Set(Object.values(ov))].sort((a, b) => a - b);
    return vals.length > 1
      ? `${sign} ${vals[0]}–${vals[vals.length - 1]}${unit}`
      : `${sign} ${vals[0]}${unit}`;
  }
  return `${sign} ${d.change_value}${unit}`;
};

const focusChatInput = (inputRef) => {
  setTimeout(() => inputRef.current?.focus(), 100);
};

const useChatSessionHandlers = ({
  requestControllerRef,
  inputRef,
  wsUserId,
  currentChatId,
  setMessages,
  setCurrentChatId,
  setIsTyping,
  setLoading,
  updateSessions,
  resetConfirmState,
  onNewChat,
  onBeforeLoadChat,
}) => {
  const setLoadState = setLoading || setIsTyping;

  const handleStopGenerating = () => {
    requestControllerRef.current?.abort?.();
    requestControllerRef.current = null;
    setIsTyping(false);
  };

  const handleNewChat = () => {
    requestControllerRef.current?.abort?.();
    revenueBotSocket.resetSession().catch(() => {});
    resetConfirmState();
    setCurrentChatId(null);
    setMessages([]);
    onNewChat?.();
    focusChatInput(inputRef);
  };

  const loadChat = async (session) => {
    onBeforeLoadChat?.();
    try {
      setLoadState(true);
      const data = await fetchSessionMessagesApi(wsUserId, session.session_id);
      const restored = restoreWsMessages(data.messages);
      setMessages(restored);
      setCurrentChatId(session.session_id);
      resetConfirmState();
      await revenueBotSocket.loadExistingSession(session.session_id).catch(() => {});
    } catch {
      toast.error("Failed to load chat history.");
    } finally {
      setLoadState(false);
    }
  };

  const deleteChat = async (id) => {
    try { await deleteSessionApi(wsUserId, id); } catch { /* ignore */ }
    updateSessions((prev) => prev.filter((s) => s.session_id !== id));
    if (currentChatId === id) {
      setCurrentChatId(null);
      setMessages([]);
      revenueBotSocket.resetSession().catch(() => {});
    }
  };

  return { handleStopGenerating, handleNewChat, loadChat, deleteChat };
};

const WsConnectionStatus = ({ status }) => (
  <span
    className={`chatbot-ws-status chatbot-ws-status--${status}`}
    title={`WebSocket: ${WS_STATUS_LABELS[status] || status}`}
    role="status"
    aria-live="polite"
  >
    <span className="chatbot-ws-status-dot" aria-hidden />
    {WS_STATUS_LABELS[status] || status}
  </span>
);

// ─── Scenario status card (mid-creation review) ───
const ScenarioStatusCard = ({ msg }) => {
  const { scenarioDetails, changesPreview, brand, market, fy, timeline } = msg;
  const hasMeta = brand || market || fy || timeline;
  const hasDetails = scenarioDetails?.length > 0;

  const previewByDriver = {};
  (changesPreview || []).forEach((p) => {
    previewByDriver[(p.driver_name || "").toLowerCase()] = p;
  });

  return (
    <div className="bot-status-card">
      {hasMeta && (
        <div className="bot-status-card-meta">
          {brand   && <span><strong>Brand:</strong> {brand}</span>}
          {market  && <span><strong>Market:</strong> {market}</span>}
          {fy      && <span><strong>FY:</strong> {fy}</span>}
          {timeline && <span><strong>Timeline:</strong> {toLabel(timeline)}</span>}
        </div>
      )}
      {hasDetails ? (
        <table className="bot-status-table">
          <thead>
            <tr>
              <th>Driver</th>
              <th>Change</th>
              {changesPreview?.length > 0 && <><th>Before</th><th>After</th><th>Delta</th></>}
            </tr>
          </thead>
          <tbody>
            {scenarioDetails.map((d, i) => {
              const preview = previewByDriver[(d.driver_name || "").toLowerCase()];
              return (
                <tr key={i}>
                  <td>
                    {toLabel(d.driver_name)}
                    {d.attribute_names?.length > 0 && (
                      <div className="bot-attr-names">
                        {d.attribute_names.map((a, ai) => (
                          <span key={ai} className="bot-attr-tag">
                            {a} <span className={d.change_type === "increase" ? "delta-pos" : "delta-neg"}>
                              {d.change_type === "increase" ? "+" : "-"}{(d.variable_overrides?.[a] ?? d.change_value)}{d.change_unit}
                            </span>
                          </span>
                        ))}
                      </div>
                    )}
                  </td>
                  <td className={d.change_type === "increase" ? "delta-pos" : "delta-neg"}>
                    {formatChangeValue(d)}
                  </td>
                  {changesPreview?.length > 0 && (
                    <>
                      <td>{preview ? fmtN(preview.original_total) : "—"}</td>
                      <td>{preview ? fmtN(preview.new_total) : "—"}</td>
                      <td className={preview?.delta_pct >= 0 ? "delta-pos" : "delta-neg"}>
                        {preview ? fmtPctSigned(preview.delta_pct) : "—"}
                      </td>
                    </>
                  )}
                </tr>
              );
            })}
          </tbody>
        </table>
      ) : (
        <div className="bot-status-empty">No changes set yet. Tell me what you'd like to modify.</div>
      )}
    </div>
  );
};

// ─── Changes summary card (post-confirm) ───
const ChangesSummaryCard = ({ changesSummary }) => {
  if (!changesSummary?.length) return null;

  return (
    <div className="bot-changes-summary-card">
      <div className="bot-changes-summary-title">Changes applied</div>
      <table className="bot-status-table">
        <thead>
          <tr>
            <th>Driver</th>
            <th>Change</th>
            <th>Before</th>
            <th>After</th>
            <th>Delta</th>
          </tr>
        </thead>
        <tbody>
          {changesSummary.map((d, i) => (
            <tr key={i}>
              <td>{toLabel(d.driver_name)}</td>
              <td className={d.change_type === "increase" ? "delta-pos" : "delta-neg"}>
                {formatChangeValue(d)}
              </td>
              <td>{fmtN(d.original_total)}</td>
              <td>{fmtN(d.new_total)}</td>
              <td className={d.delta_pct >= 0 ? "delta-pos" : "delta-neg"}>
                {fmtPctSigned(d.delta_pct)}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

// ─── MAPE card ───
const MapeCard = ({ data }) => {
  const rows = data?.data;
  if (!rows?.length) return null;
  const badge = (pct) => {
    if (pct == null) return null;
    const cls = pct < 10 ? "mape-good" : pct <= 20 ? "mape-ok" : "mape-bad";
    const label = pct < 10 ? "Excellent" : pct <= 20 ? "Good" : "Needs attention";
    return <span className={`mape-badge mape-badge--${cls}`}>{label}</span>;
  };
  return (
    <div className="bot-analytics-card">
      <div className="bot-analytics-card-title">Model Accuracy (MAPE)</div>
      <table className="bot-status-table">
        <thead><tr><th>FY</th><th>MAPE %</th><th>Status</th></tr></thead>
        <tbody>
          {rows.map((r, i) => (
            <tr key={i}>
              <td>{r.fy || "—"}</td>
              <td>{fmtPct2(r.mape_pct)}</td>
              <td>{badge(r.mape_pct)}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

// ─── ROI card ───
const RoiCard = ({ data }) => {
  const rows = data?.data;
  if (!rows?.length) return null;
  return (
    <div className="bot-analytics-card">
      <div className="bot-analytics-card-title">Media ROI by Channel</div>
      <table className="bot-status-table">
        <thead><tr><th>Channel</th><th>Spend</th><th>Contribution</th><th>ROI</th></tr></thead>
        <tbody>
          {rows.map((r, i) => (
            <tr key={i}>
              <td>{toLabel(r.channel || "—")}</td>
              <td>{fmtN(r.total_spend)}</td>
              <td>{fmtN(r.contribution_value)}</td>
              <td className={r.roi > 0 ? "delta-pos" : ""}>{fmtRoi(r.roi)}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

// ─── Contribution card ───
const ContributionCard = ({ data }) => {
  const typeRows = data?.type_breakdown;
  const channelRows = data?.media_channels;
  if (!typeRows?.length) return null;

  return (
    <div className="bot-analytics-card">
      <div className="bot-analytics-card-title">Sales Contribution Breakdown</div>

      <div className="bot-analytics-section-label">By Category</div>
      <table className="bot-status-table">
        <thead><tr><th>Category</th><th>Media %</th><th>Incremental %</th><th>Core %</th></tr></thead>
        <tbody>
          {typeRows.map((r, i) => (
            <tr key={i}>
              <td>{toLabel(r.category || "—")}</td>
              <td>{r.media_sales_pct != null ? fmtPct2(r.media_sales_pct) : "—"}</td>
              <td>{r.incremental_sales_pct != null ? fmtPct2(r.incremental_sales_pct) : "—"}</td>
              <td>{r.core_sales_pct != null ? fmtPct2(r.core_sales_pct) : "—"}</td>
            </tr>
          ))}
        </tbody>
      </table>

      {channelRows?.length > 0 && (
        <>
          <div className="bot-analytics-section-label" style={{ marginTop: 10 }}>Media Channel Breakdown</div>
          <table className="bot-status-table">
            <thead><tr><th>Channel</th><th>Contribution Value</th><th>Contribution %</th></tr></thead>
            <tbody>
              {channelRows.map((r, i) => (
                <tr key={i}>
                  <td>{toLabel(r.channel || "—")}</td>
                  <td>{fmtN(r.contribution_sales_value)}</td>
                  <td>{r.contribution != null ? fmtPct2(Number(r.contribution) * 100) : "—"}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </>
      )}
    </div>
  );
};

// ─── Sales trend card ───
const SalesTrendCard = ({ data }) => {
  const rows = data?.data;
  if (!rows?.length) return null;
  return (
    <div className="bot-analytics-card">
      <div className="bot-analytics-card-title">Sales Volume Trend</div>
      <table className="bot-status-table">
        <thead><tr><th>FY</th><th>Sales Volume</th><th>Change</th></tr></thead>
        <tbody>
          {rows.map((r, i) => {
            const prev = rows[i - 1];
            const chg = prev && prev.sales_volume && r.sales_volume
              ? ((r.sales_volume - prev.sales_volume) / prev.sales_volume) * 100
              : null;
            return (
              <tr key={i}>
                <td>{r.fy || "—"}</td>
                <td>{fmtN(r.sales_volume)}</td>
                <td className={chg == null ? "" : chg >= 0 ? "delta-pos" : "delta-neg"}>
                  {chg == null ? "—" : `${chg > 0 ? "+" : ""}${chg.toFixed(1)}%`}
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
};

// ─── Scenario comparison card ───
const ScenarioComparisonCard = ({ data }) => {
  const rows = data?.data;
  if (!rows?.length) return null;
  const s1 = data.scenario1 || "Scenario 1";
  const s2 = data.scenario2 || "Scenario 2";

  // Group rows by driver_type
  const groups = {};
  rows.forEach((r) => {
    const g = r.driver_type || "Other";
    if (!groups[g]) groups[g] = [];
    groups[g].push(r);
  });

  return (
    <div className="bot-analytics-card">
      <div className="bot-analytics-card-title">Scenario Comparison</div>
      <div className="bot-scenario-compare-names">
        <span className="bot-scenario-tag s1">{s1}</span>
        <span className="bot-scenario-compare-vs">vs</span>
        <span className="bot-scenario-tag s2">{s2}</span>
      </div>
      {Object.entries(groups).map(([group, groupRows]) => (
        <div key={group}>
          <div className="bot-analytics-section-label">{group}</div>
          <table className="bot-status-table">
            <thead>
              <tr>
                <th>Driver</th>
                <th>{s1.length > 20 ? "Base" : s1}</th>
                <th>{s2.length > 20 ? "Modified" : s2}</th>
                <th>Delta</th>
              </tr>
            </thead>
            <tbody>
              {groupRows.map((r, i) => (
                <tr key={i}>
                  <td>{toLabel(r.variable_type || r.attribute_name || "—")}</td>
                  <td>{fmtN(r.scenario1_value)}</td>
                  <td>{fmtN(r.scenario2_value)}</td>
                  <td className={r.delta == null ? "" : r.delta >= 0 ? "delta-pos" : "delta-neg"}>
                    {r.delta == null ? "—" : `${r.delta > 0 ? "+" : ""}${fmtN(r.delta)}`}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      ))}
    </div>
  );
};

// ─── Scenario list card ───
const ScenarioListCard = ({ data }) => {
  const scenarios = data?.scenarios;
  const fmtDate = (dt) => {
    if (!dt) return "—";
    try {
      return new Date(dt).toLocaleDateString(undefined, {
        year: "numeric", month: "short", day: "numeric",
      });
    } catch { return dt; }
  };

  return (
    <div className="bot-analytics-card">
      <div className="bot-analytics-card-title">
        Saved Scenarios{scenarios?.length ? ` (${scenarios.length})` : ""}
      </div>
      {!scenarios?.length ? (
        <div className="bot-status-empty" style={{ padding: "10px 12px" }}>
          No saved scenarios found for this brand / market.
        </div>
      ) : (
        <table className="bot-status-table">
          <thead>
            <tr>
              <th>Scenario Name</th>
              <th>FY</th>
              <th>Timeline</th>
              <th>Saved On</th>
            </tr>
          </thead>
          <tbody>
            {scenarios.map((s, i) => (
              <tr key={i}>
                <td className="scenario-list-name">{s.scenario_name || "—"}</td>
                <td>{s.fy || "—"}</td>
                <td>{toLabel(s.timeline || "—")}</td>
                <td>{fmtDate(s.created_dt)}</td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </div>
  );
};

// ─── Risk warning card (Section 4.5 — core distribution > threshold) ───
const RiskWarningCard = ({ msg, onSend }) => {
  if (msg.reason !== "core_distribution_high") return null;
  return (
    <div className="bot-risk-warning-card">
      <div className="bot-risk-warning-icon">⚠</div>
      <div className="bot-risk-warning-body">
        <div className="bot-risk-warning-title">High-Impact Change Detected</div>
        <div className="bot-risk-warning-text">{msg.text}</div>
        <div className="bot-risk-warning-actions">
          <button
            type="button"
            className="bot-risk-btn bot-risk-btn--confirm"
            onClick={() => onSend?.("Yes, proceed anyway")}
          >
            Yes, proceed anyway
          </button>
          <button
            type="button"
            className="bot-risk-btn bot-risk-btn--cancel"
            onClick={() => onSend?.("Cancel")}
          >
            Cancel
          </button>
        </div>
      </div>
    </div>
  );
};

// ─── Channel data view card (Section 4.6 — show active channels before change) ───
const ChannelDataViewCard = ({ data }) => {
  const channels = data?.channels;
  if (!channels?.length) return null;

  const kw = (data?.channel_keyword || "channel").toUpperCase();
  const fy = data?.fy ? ` · FY ${data.fy}` : "";

  return (
    <div className="bot-analytics-card">
      <div className="bot-analytics-card-title">
        Active {kw} channels{fy}
      </div>
      {channels.map((ch, i) => (
        <div key={i} className="bot-channel-view-row">
          <div className="bot-channel-view-header">
            <span className="bot-channel-view-name">{toLabel(ch.channel)}</span>
            <span className="bot-channel-view-stats">
              {ch.roi != null && <span className="bot-channel-stat">ROI: <strong>{Number(ch.roi).toFixed(3)}</strong></span>}
              {ch.contribution_pct != null && <span className="bot-channel-stat">Contribution: <strong>{Number(ch.contribution_pct).toFixed(1)}%</strong></span>}
              {ch.total_spend != null && <span className="bot-channel-stat">Spend: <strong>{Number(ch.total_spend).toLocaleString(undefined, { maximumFractionDigits: 0 })}</strong></span>}
            </span>
          </div>
          {ch.attributes?.length > 0 && (
            <div className="bot-channel-view-attrs">
              {ch.attributes.map((a, ai) => (
                <span key={ai} className="bot-channel-attr-chip">{a}</span>
              ))}
            </div>
          )}
        </div>
      ))}
      <div className="bot-channel-view-hint">
        You can say <em>"Increase [ATTR_NAME] by X%"</em> to modify a specific variable.
      </div>
    </div>
  );
};

// ─── BotReply component ───
const BotReply = ({ msg, onSend, onPrefill, onConfirmScenario, isConfirming, isConfirmed, onEditRequest }) => {
  const quickReplies = msg.quickReplies?.length ? msg.quickReplies : msg.recommendations;
  const isUnclear = msg.status === "clarification_needed" || msg.intentType === "unclear_query";
  const showMissing = msg.isMissingParams || (msg.missingFields?.length > 0 && !msg.readyToRun);
  const showMeta = !showMissing && (msg.intentType || typeof msg.readyToRun === "boolean" || msg.resolvedRole);
  const scenarioDrivers = Array.isArray(msg.completionCard?.details?.scenarioDetails)
    ? msg.completionCard.details.scenarioDetails
    : [];
  const confirmCardLocked = Boolean(isConfirming || isConfirmed || msg.scenarioConfirmed);
  return (
  <div className="bot-rich-reply">
    {!showMissing && <div className="bot-main-text">{renderText(msg.text || "")}</div>}

    {showMissing && (
      <div className="bot-missing-intro">I need a few more details to build your scenario:</div>
    )}

    {msg.clarifyingQuestion && msg.clarifyingQuestion !== msg.text && !showMissing && (
      <div className="bot-clarifying-question">{renderText(msg.clarifyingQuestion)}</div>
    )}

    {showMeta && (
      <div className="bot-meta-row">
        {msg.intentType && <span className="bot-meta-chip">Intent: {toLabel(msg.intentType)}</span>}
        {msg.analyticsType && (
          <span className="bot-meta-chip bot-meta-chip--analytics">{toLabel(msg.analyticsType)}</span>
        )}
        {msg.resolvedRole && <span className="bot-meta-chip">Role: {toLabel(msg.resolvedRole)}</span>}
        {typeof msg.readyToRun === "boolean" && (
          <span className={`bot-status-chip ${msg.readyToRun ? "ready" : "pending"}`}>
            {msg.readyToRun ? "Ready to run" : "Awaiting details"}
          </span>
        )}
      </div>
    )}

    {msg.errors?.length > 0 && (
      <ul className="bot-error-list">
        {msg.errors.map((err, i) => (
          <li key={`${err}-${i}`}>{err}</li>
        ))}
      </ul>
    )}

    {showMissing && (
      <ul className="bot-missing-questions">
        {msg.missingFields.map((field, idx) => {
          const { question, example } = getMissingFieldPrompt(field, msg.fieldHints, msg.fieldOptions);
          return (
            <li key={`${field}-${idx}`} className="bot-missing-question">
              <span className="bot-missing-question-text">{question}</span>
              {example && <span className="bot-missing-example"> {example}</span>}
            </li>
          );
        })}
      </ul>
    )}

    {msg.analyticsType === "scenario_status" && (
      <ScenarioStatusCard msg={msg} />
    )}

    {msg.analyticsType === "mape" && msg.analyticsData && (
      <MapeCard data={msg.analyticsData} />
    )}

    {msg.analyticsType === "roi" && msg.analyticsData && (
      <RoiCard data={msg.analyticsData} />
    )}

    {msg.analyticsType === "contribution" && msg.analyticsData && (
      <ContributionCard data={msg.analyticsData} />
    )}

    {msg.analyticsType === "sales_trend" && msg.analyticsData && (
      <SalesTrendCard data={msg.analyticsData} />
    )}

    {msg.analyticsType === "scenario_comparison" && msg.analyticsData && (
      <ScenarioComparisonCard data={msg.analyticsData} />
    )}

    {msg.analyticsType === "scenario_list" && msg.analyticsData && (
      <ScenarioListCard data={msg.analyticsData} />
    )}

    {msg.analyticsType === "channel_data_view" && msg.analyticsData && (
      <ChannelDataViewCard data={msg.analyticsData} />
    )}

    {msg.status === "risk_warning" && (
      <RiskWarningCard msg={msg} onSend={onSend} />
    )}

    {msg.isSaved && msg.changesSummary?.length > 0 && (
      <ChangesSummaryCard changesSummary={msg.changesSummary} />
    )}

    {msg.completionCard && (
      <div
        className={`bot-completion-card${confirmCardLocked ? " bot-completion-card--locked" : ""}`}
      >
        {msg.driverWarnings?.length > 0 && (
          <div className="bot-driver-warning">
            <strong>⚠ Drivers not available for this brand:</strong>{" "}
            {msg.driverWarnings.join(", ")} — these will have no effect and will be skipped.
          </div>
        )}
        <div className="bot-completion-title">{msg.completionCard.title}</div>
        {msg.completionCard.suggestedName && (
          <div className="bot-completion-name">
            <span className="bot-completion-label">Suggested name:</span>{" "}
            {msg.completionCard.suggestedName}
          </div>
        )}
        <div className="bot-completion-name bot-completion-message">{msg.completionCard.message}</div>
        <div className="bot-completion-name"><span className="bot-completion-label">Brand:</span> {msg.completionCard.details?.brand || "-"}</div>
        <div className="bot-completion-name"><span className="bot-completion-label">Market:</span> {msg.completionCard.details?.market || "-"}</div>
        <div className="bot-completion-name"><span className="bot-completion-label">FY:</span> {msg.completionCard.details?.fy || "-"}</div>
        <div className="bot-completion-name"><span className="bot-completion-label">Timeline:</span> {msg.completionCard.details?.timeline || "-"}</div>
        {scenarioDrivers.length > 0 && (
          <div className="bot-completion-drivers">
            <span className="bot-completion-label">Changes:</span>
            <ul className="bot-driver-list">
              {scenarioDrivers.map((item, i) => (
                <li key={i}>
                  {formatScenarioDriver(item)}
                  {item.attribute_names?.length > 0 && (
                    <div className="bot-attr-names">
                      {item.attribute_names.map((a, ai) => (
                        <span key={ai} className="bot-attr-tag">
                          {a} <span className={item.change_type === "increase" ? "delta-pos" : "delta-neg"}>
                            {item.change_type === "increase" ? "+" : "-"}{(item.variable_overrides?.[a] ?? item.change_value)}{item.change_unit}
                          </span>
                        </span>
                      ))}
                    </div>
                  )}
                </li>
              ))}
            </ul>
          </div>
        )}
        {msg.readyToRun && msg.confirmPayload && (
          <div className="bot-scenario-actions">
            <button
              type="button"
              className="scenario-open-btn"
              onClick={() => !confirmCardLocked && onConfirmScenario?.(msg)}
              disabled={confirmCardLocked}
            >
              {isConfirming
                ? "Confirming…"
                : confirmCardLocked
                  ? "Scenario confirmed"
                  : "Confirm scenario"}
            </button>
            <button
              type="button"
              className="scenario-edit-btn"
              onClick={() => !confirmCardLocked && onEditRequest?.()}
              disabled={confirmCardLocked}
            >
              Edit
            </button>
          </div>
        )}
        {isConfirming && (
          <div className="scenario-confirming-note">Confirming, please wait a few seconds…</div>
        )}
      </div>
    )}

    {isUnclear && quickReplies?.length > 0 && (
      <div className="msg-recommendations enhanced bot-inline-quick-replies">
        <div className="msg-recommendations-title">Quick replies</div>
        {quickReplies.map((rec, ri) => (
          <button key={ri} type="button" className="msg-rec-btn" onClick={() => onPrefill?.(rec)}>
            {rec}
          </button>
        ))}
      </div>
    )}

  </div>
  );
};

// ─── Typing indicator ───
const TypingIndicator = ({ size = 18 }) => {
  const [elapsed, setElapsed] = useState(0);

  useEffect(() => {
    setElapsed(0);
    const timer = setInterval(() => setElapsed((s) => s + 1), 1000);
    return () => clearInterval(timer);
  }, []);

  const isRefreshHint = elapsed >= 90;
  const label = isRefreshHint
    ? "Please refresh the page and try again."
    : elapsed >= 30
      ? "Still working, please wait…"
      : elapsed > 15
        ? "Analysing your data…"
        : "Thinking";

  return (
    <div className="chatbot-msg msg-bot">
      <div className="msg-avatar"><AiIcon size={size} /></div>
      <div className="msg-content">
        <div className={`msg-bubble typing-bubble${isRefreshHint ? " typing-bubble--refresh-hint" : ""}`}>
          <div className={`typing-thinking${isRefreshHint ? " typing-thinking--refresh-hint" : ""}`} role="status" aria-live="polite">
            {!isRefreshHint && <span className="typing-thinking-ring" aria-hidden />}
            <span className={`typing-thinking-text${isRefreshHint ? " typing-thinking-text--refresh-hint" : ""}`}>
              {label}
            </span>
            {!isRefreshHint && (
              <span className="typing-thinking-dots" aria-hidden>
                <span /><span /><span />
              </span>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

const ChatInput = ({
  inputRef,
  value,
  placeholder,
  disabled,
  isTyping = false,
  showStop = false,
  showVoice = false,
  classes,
  onChange,
  onSend,
  onStop,
}) => (
  <div className={classes.wrapper}>
    <div className={classes.area}>
      <input
        ref={inputRef}
        type="text"
        className={classes.input}
        placeholder={placeholder}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        onKeyDown={(e) => e.key === "Enter" && !disabled && onSend()}
        disabled={disabled}
      />
      {showVoice && (
        <button className={classes.voice} title="Voice input">
          <i className="fas fa-microphone" />
        </button>
      )}
      <button
        className={classes.send}
        onClick={onSend}
        disabled={!value.trim() || disabled}
      >
        <i className="fas fa-paper-plane" />
      </button>
      {showStop && isTyping && (
        <button className={classes.stop} onClick={onStop} type="button" title="Stop generating">
          <i className="fas fa-stop" />
        </button>
      )}
    </div>
  </div>
);

// ─── Message list ───
const MessageList = ({
  messages,
  isTyping,
  avatarSize,
  onSend,
  onPrefill,
  onConfirmScenario,
  onEditRequest,
  confirmingMessageIndex = null,
  confirmedMessageIndexes = [],
}) => (
  <>
    {messages.map((msg, idx) => (
      <div key={idx} className={`chatbot-msg ${msg.from === "bot" ? "msg-bot" : "msg-user"}`}>
        {msg.from === "bot" && <div className="msg-avatar"><AiIcon size={avatarSize} /></div>}
        <div className="msg-content">
          <div className="msg-bubble">
            {msg.from === "bot" ? (
              <BotReply
                msg={msg}
                onSend={onSend}
                onPrefill={onPrefill}
                onConfirmScenario={(botMsg) => onConfirmScenario?.(botMsg, idx)}
                onEditRequest={onEditRequest}
                isConfirming={confirmingMessageIndex === idx}
                isConfirmed={confirmedMessageIndexes.includes(idx) || Boolean(msg.scenarioConfirmed)}
              />
            ) : (
              msg.text
            )}
          </div>
          {msg.from === "bot" &&
            msg.recommendations?.length > 0 &&
            msg.status !== "clarification_needed" &&
            msg.intentType !== "unclear_query" && (
            <div className="msg-recommendations enhanced">
              <div className="msg-recommendations-title">Try one of these next:</div>
              {msg.recommendations.map((rec, ri) => (
                <button key={ri} className="msg-rec-btn" onClick={() => onPrefill?.(rec)}>{rec}</button>
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
  const [historyLoading, setHistoryLoading] = useState(false);
  const [historyOpen, setHistoryOpen] = useState(false);
  const [savedChats, setSavedChats] = useState([]);
  const [maximizing, setMaximizing] = useState(false);
  const [currentChatId, setCurrentChatId] = useState(null);
  const { wsStatus, sendBotMessage } = useRevenueBotWebSocket({ enabled: true });
  const requestControllerRef = useRef(null);
  const messagesEndRef = useRef(null);
  const inputRef = useRef(null);

  useEffect(() => { messagesEndRef.current?.scrollIntoView({ behavior: "smooth" }); }, [messages, isTyping]);
  useEffect(() => { setTimeout(() => inputRef.current?.focus(), 100); }, []);

  // Track the real WS session_id so the history list can exclude the current session
  useEffect(() => {
    const unsub = revenueBotSocket.subscribeSession((sid) => {
      if (sid) setCurrentChatId(sid);
    });
    return unsub;
  }, []);

  useEffect(() => {
    try {
      if (localStorage.getItem(POPUP_RESTORE_OPEN_KEY) !== "1") return;
      localStorage.removeItem(POPUP_RESTORE_OPEN_KEY);
      const transferred = localStorage.getItem(POPUP_TRANSFER_KEY);
      if (!transferred) return;
      const parsed = JSON.parse(transferred);
      if (Array.isArray(parsed) && parsed.length) {
        setMessages(parsed.map((m) => ({ ...m, time: new Date(m.time) })));
      }
      localStorage.removeItem(POPUP_TRANSFER_KEY);
    } catch { /* ignore */ }
  }, []);

  // Auto-restore history when the WS reconnects to an existing session (e.g. after tab switch).
  // currentChatId comes from the CONNECTED event — if the singleton already had a wsSessionId
  // the server returns the same session, so we can reload the stored messages.
  useEffect(() => {
    if (!currentChatId || messages.length > 0) return;
    const uid = getWsUserId();
    if (!uid) return;
    fetchSessionMessagesApi(uid, currentChatId)
      .then((data) => {
        const restored = restoreWsMessages(data.messages);
        if (restored.length > 0) setMessages(restored);
      })
      .catch(() => {});
  }, [currentChatId]); // eslint-disable-line react-hooks/exhaustive-deps

  const {
    confirmingMessageIndex,
    confirmedMessageIndexes,
    handleConfirmScenario,
    resetConfirmState,
  } = useScenarioConfirm({ wsStatus, setMessages, setIsTyping, onClose });

  const handleSend = useChatSend({
    setMessages,
    setInputValue,
    setIsTyping,
    requestControllerRef,
    sendBotMessage,
    wsStatus,
  });

  const inputDisabled = isTyping || historyLoading || wsStatus !== WS_STATUS.CONNECTED;
  const wsUserId = getWsUserId();

  const {
    handleStopGenerating,
    handleNewChat,
    loadChat: loadSavedChat,
    deleteChat: deleteSavedChat,
  } = useChatSessionHandlers({
    requestControllerRef,
    inputRef,
    wsUserId,
    currentChatId,
    setMessages,
    setCurrentChatId,
    setIsTyping,
    setLoading: setHistoryLoading,
    updateSessions: setSavedChats,
    resetConfirmState,
    onNewChat: () => setHistoryOpen(false),
    onBeforeLoadChat: () => setHistoryOpen(false),
  });

  const handleHistoryToggle = async () => {
    if (!historyOpen) {
      try {
        const sessions = await fetchSessionsApi(wsUserId);
        setSavedChats(sessions.filter((s) => s.session_id !== currentChatId));
      } catch { setSavedChats([]); }
    }
    setHistoryOpen((p) => !p);
  };

  const handleMaximize = () => {
    if (messages.length) localStorage.setItem(POPUP_TRANSFER_KEY, JSON.stringify(messages));
    setMaximizing(true);
    setTimeout(() => {
      navigate("/chatbot");
      setMaximizing(false);
      onClose();
    }, 450);
  };

  return (
    <div className={`chatbot-popup-overlay ${theme}-theme${maximizing ? " popup-maximizing" : ""}`}>
      <div className={`chatbot-popup ${theme}-theme`}>
        <div className="chatbot-popup-header">
          <div className="chatbot-popup-title-row">
            <span className="chatbot-popup-title"><AiIcon size={22} /> Revenue Chat</span>
            <WsConnectionStatus status={wsStatus} />
          </div>
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
                : savedChats.map((session) => (
                  <div key={session.session_id} className="popup-history-item" onClick={() => loadSavedChat(session)}>
                    <i className="far fa-comment popup-history-item-icon" />
                    <span className="popup-history-title">{session.title}</span>
                    <button className="popup-history-delete" onClick={(e) => { e.stopPropagation(); deleteSavedChat(session.session_id); }} title="Delete"><i className="fas fa-trash-alt" /></button>
                  </div>
                ))}
            </div>
          </div>
        )}

        <div className="chatbot-popup-body">
          {historyLoading ? (
            <div className="chatbot-popup-empty">
              <div className="chatbot-history-loading"><span className="chatbot-history-loading-dot" /><span className="chatbot-history-loading-dot" /><span className="chatbot-history-loading-dot" /></div>
              <p>Loading conversation…</p>
            </div>
          ) : messages.length === 0
            ? (
              <div className="chatbot-popup-empty">
                <AiIcon size={40} className="popup-empty-icon" />
                <p>Ask me anything about your Revenue!</p>
                {wsStatus === WS_STATUS.CONNECTING && (
                  <p className="chatbot-ws-hint chatbot-ws-hint--pending">Connecting to real-time assistant…</p>
                )}
                {wsStatus === WS_STATUS.ERROR && (
                  <p className="chatbot-ws-hint chatbot-ws-hint--error">Unable to connect. Retrying automatically…</p>
                )}
              </div>
            )
            : <div className="chatbot-popup-messages">
                <MessageList
                  messages={messages}
                  isTyping={isTyping}
                  avatarSize={18}
                  onSend={(t) => handleSend(t, "")}
                  onPrefill={(t) => setInputValue(t)}
                  onConfirmScenario={handleConfirmScenario}
                  onEditRequest={() => inputRef.current?.focus()}
                  confirmingMessageIndex={confirmingMessageIndex}
                  confirmedMessageIndexes={confirmedMessageIndexes}
                />
                <div ref={messagesEndRef} />
              </div>}
        </div>

        <ChatInput
          inputRef={inputRef}
          value={inputValue}
          placeholder="Ask about your marketing data..."
          disabled={inputDisabled}
          isTyping={isTyping}
          showStop
          classes={{
            wrapper: "chatbot-popup-input-wrapper",
            area: "chatbot-popup-input-area",
            input: "chatbot-popup-input",
            send: "chatbot-popup-send-btn",
            stop: "chatbot-popup-stop-btn",
          }}
          onChange={setInputValue}
          onSend={() => handleSend(null, inputValue)}
          onStop={handleStopGenerating}
        />
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
      <div className={`chatbot-nav-wrapper ${theme}-theme${popupOpen ? " popup-open" : ""}`}>
        <QuationChatbotAvatar
          open={popupOpen}
          onClick={() => setPopupOpen((p) => !p)}
          idleTooltip="✨ Ask me anything regarding Revenue!"
          ariaLabel={popupOpen ? "Close Revenue assistant" : "Open Revenue assistant"}
        />
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

  const wsUserId = getWsUserId();
  const [messages, setMessages] = useState([]);
  const [inputValue, setInputValue] = useState("");
  const [isTyping, setIsTyping] = useState(false);
  const [chatSessions, setChatSessions] = useState([]);
  const [currentChatId, setCurrentChatId] = useState(null);
  const { wsStatus, sendBotMessage } = useRevenueBotWebSocket({ enabled: true });
  const requestControllerRef = useRef(null);
  const messagesEndRef = useRef(null);
  const inputRef = useRef(null);

  useEffect(() => { messagesEndRef.current?.scrollIntoView({ behavior: "smooth" }); }, [messages, isTyping]);
  useEffect(() => { setTimeout(() => inputRef.current?.focus(), 100); }, []);

  // Fetch sessions from backend on mount
  useEffect(() => {
    fetchSessionsApi(wsUserId).then(setChatSessions).catch(() => {});
  }, [wsUserId]);

  // Track wsSessionId and refresh sidebar when a new session is assigned
  useEffect(() => {
    const unsub = revenueBotSocket.subscribeSession((sid) => {
      if (sid) {
        setCurrentChatId(sid);
        fetchSessionsApi(wsUserId).then(setChatSessions).catch(() => {});
      }
    });
    return unsub;
  }, [wsUserId]);

  // Restore messages transferred from popup
  useEffect(() => {
    try {
      const transferred = localStorage.getItem(POPUP_TRANSFER_KEY);
      if (transferred) {
        const parsed = JSON.parse(transferred);
        if (Array.isArray(parsed) && parsed.length) {
          setMessages(parsed.map((m) => ({ ...m, time: new Date(m.time) })));
        }
        localStorage.removeItem(POPUP_TRANSFER_KEY);
      }
    } catch { /* ignore */ }
  }, []);

  const {
    confirmingMessageIndex,
    confirmedMessageIndexes,
    handleConfirmScenario,
    resetConfirmState,
  } = useScenarioConfirm({ wsStatus, setMessages, setIsTyping });

  const handleSend = useChatSend({
    setMessages,
    setInputValue,
    setIsTyping,
    requestControllerRef,
    sendBotMessage,
    wsStatus,
  });

  const inputDisabled = isTyping || wsStatus !== WS_STATUS.CONNECTED;

  const {
    handleStopGenerating,
    handleNewChat,
    loadChat,
    deleteChat,
  } = useChatSessionHandlers({
    requestControllerRef,
    inputRef,
    wsUserId,
    currentChatId,
    setMessages,
    setCurrentChatId,
    setIsTyping,
    updateSessions: setChatSessions,
    resetConfirmState,
  });

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
            : chatSessions.map((session) => (
              <div
                key={session.session_id}
                className={`sidebar-chat-item ${session.session_id === currentChatId ? "active" : ""}`}
                onClick={() => loadChat(session)}
              >
                <i className="far fa-comment sidebar-chat-icon" />
                <span className="sidebar-chat-title">{session.title}</span>
                <button
                  className="sidebar-chat-delete"
                  onClick={(e) => { e.stopPropagation(); deleteChat(session.session_id); }}
                  title="Delete chat"
                >
                  <i className="fas fa-trash-alt" />
                </button>
              </div>
            ))}
        </div>
      </aside>

      <div className="chatbot-main">
        <div className="chatbot-topbar">
          <div className="chatbot-topbar-title-row">
            <span className="chatbot-title-text"><AiIcon size={30} /> Revenue Chat</span>
            <WsConnectionStatus status={wsStatus} />
          </div>
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
            {wsStatus === WS_STATUS.CONNECTING && (
              <p className="chatbot-ws-hint chatbot-ws-hint--pending">Connecting to real-time assistant…</p>
            )}
            {wsStatus === WS_STATUS.ERROR && (
              <p className="chatbot-ws-hint chatbot-ws-hint--error">Unable to connect. Retrying automatically…</p>
            )}
            <ChatInput
              inputRef={inputRef}
              value={inputValue}
              placeholder="AI-powered marketing intelligence hub — Explore brand performance, media ROI, model accuracy & optimization"
              disabled={inputDisabled}
              showVoice
              classes={{
                wrapper: "chatbot-center-input-wrapper",
                area: "chatbot-center-input-area",
                input: "chatbot-center-input",
                voice: "chatbot-center-voice-btn",
                send: "chatbot-center-send-btn",
              }}
              onChange={setInputValue}
              onSend={() => handleSend(null, inputValue)}
            />
          </div>
        ) : (
          <>
            <div className="chatbot-body">
              <div className="chatbot-messages">
                <MessageList
                  messages={messages}
                  isTyping={isTyping}
                  avatarSize={24}
                  onSend={(t) => handleSend(t, "")}
                  onPrefill={(t) => setInputValue(t)}
                  onConfirmScenario={handleConfirmScenario}
                  onEditRequest={() => inputRef.current?.focus()}
                  confirmingMessageIndex={confirmingMessageIndex}
                  confirmedMessageIndexes={confirmedMessageIndexes}
                />
                <div ref={messagesEndRef} />
              </div>
            </div>
            <ChatInput
              inputRef={inputRef}
              value={inputValue}
              placeholder="Ask about your marketing data..."
              disabled={inputDisabled}
              isTyping={isTyping}
              showStop
              classes={{
                wrapper: "chatbot-input-wrapper",
                area: "chatbot-input-area",
                input: "chatbot-input",
                send: "chatbot-send-btn",
                stop: "chatbot-stop-btn",
              }}
              onChange={setInputValue}
              onSend={() => handleSend(null, inputValue)}
              onStop={handleStopGenerating}
            />
          </>
        )}
      </div>
    </div>
  );
};

export default ChatBot_API_v2;
