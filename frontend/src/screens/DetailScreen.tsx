import React, { useEffect, useState, useCallback } from "react";
import type { Screen, CashFlowDetailResponse, Reason, ModalContent, SuggestedStep } from "../types";
import { fetchCashFlowDetail, fetchReasonExplanation } from "../data/api";
import { CashFlowChart } from "../components/CashFlowChart";
import { Modal } from "../components/Modal";
import { DetailSkeleton } from "../components/LoadingSkeleton";
import { ErrorCard, EmptyState } from "../components/ErrorCard";
import "./DetailScreen.css";

interface Props {
  onNavigate: (s: Screen) => void;
  onStepsSelected?: (steps: SuggestedStep[]) => void;
}

export const DetailScreen: React.FC<Props> = ({ onNavigate, onStepsSelected }) => {
  const [data, setData] = useState<CashFlowDetailResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [modal, setModal] = useState<ModalContent | null>(null);
  const [llmLoading, setLlmLoading] = useState<string | null>(null);
  const [selectedSteps, setSelectedSteps] = useState<Set<string>>(new Set());
  const [customSteps, setCustomSteps] = useState<string[]>([]);
  const [addingCustom, setAddingCustom] = useState(false);
  const [customInput, setCustomInput] = useState("");
  const [hideTop, setHideTop] = useState(false);
  const [showReasons, setShowReasons] = useState(false);

  const load = useCallback(() => {
    setLoading(true);
    setError("");
    fetchCashFlowDetail()
      .then(setData)
      .catch(() => setError("Failed to load cash flow details. Please try again."))
      .finally(() => setLoading(false));
  }, []);

  useEffect(() => { load(); }, [load]);

  const handleReasonInfo = async (reason: Reason) => {
    if (reason.modalContent) { setModal(reason.modalContent); return; }
    setLlmLoading(reason.id);
    try {
      const { explanation } = await fetchReasonExplanation(reason.id);
      setModal({ title: "Cash Flow Impact", body: [explanation] });
    } catch {
      setModal({ title: "Cash Flow Impact", body: ["Could not load explanation right now."] });
    } finally { setLlmLoading(null); }
  };

  const toggleStep = (id: string) => {
    setSelectedSteps((prev) => {
      const next = new Set(prev);
      next.has(id) ? next.delete(id) : next.add(id);
      return next;
    });
  };

  const handleAddCustom = () => {
    if (!customInput.trim()) return;
    setCustomSteps((prev) => [...prev, customInput.trim()]);
    setCustomInput("");
    setAddingCustom(false);
  };

  const handleContinue = () => {
    if (!data) return;
    const chosen = [
      ...data.suggestedNextSteps.filter((s) => selectedSteps.has(s.id)),
      ...customSteps
        .filter((t) => selectedSteps.has(`custom-${t}`))
        .map((t, i) => ({ id: `custom-${i}`, text: t, category: "subscriptions" })),
    ];
    if (chosen.length === 0) return;
    onStepsSelected?.(chosen);
    setTimeout(() => onNavigate("actionChoice"), 0);
  };

  if (loading) return <DetailSkeleton />;
  if (error) return <ErrorCard message={error} onRetry={load} />;
  if (!data) return null;

  const { cashFlow, reasons, suggestedNextSteps } = data;
  const canContinue = selectedSteps.size > 0;

  const healthPct = cashFlow.status === "green" ? 100
    : cashFlow.status === "yellow" ? 40 : 10;
  const healthColor = cashFlow.status === "green" ? "#2CA01C"
    : cashFlow.status === "yellow" ? "#F4B000" : "#DC2626";

  const grayReasons = reasons.filter(r => r.actionType === "gray");

  return (
    <div className="detail">
      {modal && <Modal title={modal.title} body={modal.body} onClose={() => setModal(null)} />}

      <button className="back-link" onClick={() => onNavigate("dashboard")}>
        <BackIcon /> Back to Dashboard
      </button>

      <h1 className="detail__heading">Your cash balance status</h1>

      {/* Sticky top section */}
      {!hideTop && (
        <div className="two-col detail__top-section">
          {/* Balance + health bar */}
          <div className="card detail__balance-card">
            <div className="section-title detail__balance-section-title">
              PROJECTED LOWEST CASH BALANCE (14 DAYS):
            </div>
            <div className="detail__amount">
              {cashFlow.projectedLowestBalance.toLocaleString("en-US", { minimumFractionDigits: 2 })}
            </div>

            <div className="detail__health-bar-wrap">
              <div className="detail__health-track">
                <div
                  className="detail__health-fill"
                  style={{ width: `${healthPct}%`, background: healthColor }}
                />
              </div>
              <span className="detail__health-pct">{healthPct}%</span>
            </div>
            <div className="detail__health-status">
              <strong>Status:</strong> {cashFlow.statusLabel}
            </div>

            {/* Reasons found button */}
            <button
              className="detail__reasons-btn"
              onClick={() => setShowReasons(r => !r)}
            >
              {grayReasons.length} reason{grayReasons.length !== 1 ? "s" : ""} found
            </button>
          </div>

          {/* Chart */}
          <div className="card detail__chart-card">
            <div className="section-title" style={{ marginBottom: 16 }}>
              PROJECTED CASH BALANCE OVER NEXT 14 DAYS
            </div>
            <div className="detail__chart-wrap">
              <CashFlowChart
                data={cashFlow.projectedBalanceOverTime}
                targetMinimumBuffer={cashFlow.targetMinimumBuffer}
                safeZoneThreshold={cashFlow.safeZoneThreshold}
              />
            </div>
          </div>
        </div>
      )}

      {/* Hide/Show toggle */}
      <div className="detail__hide-row">
        <label className="toggle">
          <input
            type="checkbox"
            checked={hideTop}
            onChange={(e) => setHideTop(e.target.checked)}
          />
          <span className="toggle__slider" />
        </label>
        <span>{hideTop ? "Show" : "Hide"} cash balance</span>
      </div>

      {/* Reasons + Steps */}
      <div className="two-col">
        {/* Reasons */}
        <div className="card">
          <div className="section-title" style={{ marginBottom: 12 }}>REASON</div>
          {reasons.length === 0 ? (
            <EmptyState title="No issues detected" subtitle="Your cash flow looks healthy." />
          ) : (
            reasons.map((r) => (
              <div key={r.id} className="reason-row">
                <span className="reason-row__text">{r.text}</span>
                <button
                  className={`reason-tag reason-tag--${r.actionType}`}
                  onClick={() => handleReasonInfo(r)}
                  disabled={llmLoading === r.id}
                >
                  {llmLoading === r.id ? "Loading…" : r.actionLabel}
                </button>
              </div>
            ))
          )}
        </div>

        {/* Suggested Next Steps */}
        <div className="card detail__steps-card">
          <div className="detail__steps-header">
            <div className="section-title">SUGGESTED NEXT STEPS</div>
            <button
              className="btn btn--green detail__apply-btn-top"
              onClick={handleContinue}
              disabled={!canContinue}
            >
              Apply suggestions &rsaquo;
            </button>
          </div>

          {suggestedNextSteps.length === 0 && customSteps.length === 0 ? (
            <EmptyState title="No steps suggested" subtitle="Add your own action below." />
          ) : (
            <>
              {suggestedNextSteps.map((s) => (
                <div key={s.id} className="detail__step-row" onClick={() => toggleStep(s.id)}>
                  <span className="detail__step-text">{s.text}</span>
                  <div className="detail__step-right">
                    <button
                      className="step-row__info"
                      onClick={(e) => {
                        e.stopPropagation();
                        setModal({ title: "Why This Step Helps", body: [s.text] });
                      }}
                    >
                      i
                    </button>
                    <div className={`detail__step-checkbox${selectedSteps.has(s.id) ? " detail__step-checkbox--checked" : ""}`}>
                      {selectedSteps.has(s.id) && <CheckIcon />}
                    </div>
                  </div>
                </div>
              ))}

              {customSteps.map((text, i) => {
                const id = `custom-${text}`;
                return (
                  <div key={i} className="detail__step-row" onClick={() => toggleStep(id)}>
                    <span className="detail__step-text">{text}</span>
                    <div className="detail__step-right">
                      <div className={`detail__step-checkbox${selectedSteps.has(id) ? " detail__step-checkbox--checked" : ""}`}>
                        {selectedSteps.has(id) && <CheckIcon />}
                      </div>
                    </div>
                  </div>
                );
              })}
            </>
          )}

          {addingCustom ? (
            <div className="detail__add-row">
              <input
                className="detail__add-input"
                placeholder="Describe your action…"
                value={customInput}
                onChange={(e) => setCustomInput(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && handleAddCustom()}
                autoFocus
              />
              <button className="detail__add-confirm" onClick={handleAddCustom}>Add</button>
              <button className="detail__add-cancel" onClick={() => { setAddingCustom(false); setCustomInput(""); }}>✕</button>
            </div>
          ) : (
            <button className="detail__add-option" onClick={() => setAddingCustom(true)}>
              <PlusCircleIcon /> Add another option
            </button>
          )}
        </div>
      </div>

      {/* Disclaimer */}
      <p className="detail__disclaimer">
        *Pulse is AI and can make mistakes. Important information should always be checked before proceeding.*
      </p>
    </div>
  );
};

const BackIcon = () => (<svg width="16" height="16" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path d="M19 12H5M12 19l-7-7 7-7" /></svg>);
const CheckIcon = () => (<svg width="12" height="12" fill="none" stroke="white" strokeWidth="2.5" viewBox="0 0 24 24"><polyline points="20 6 9 17 4 12" /></svg>);
const PlusCircleIcon = () => (<svg width="18" height="18" fill="none" stroke="currentColor" viewBox="0 0 24 24"><circle cx="12" cy="12" r="10" /><line x1="12" y1="8" x2="12" y2="16" /><line x1="8" y1="12" x2="16" y2="12" /></svg>);