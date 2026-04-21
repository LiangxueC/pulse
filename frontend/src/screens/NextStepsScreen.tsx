import React, { useEffect, useState } from "react";
import type { Screen, CashFlowDetailResponse, SuggestedStep } from "../types";
import { fetchCashFlowDetail } from "../data/api";
import { CashFlowChart } from "../components/CashFlowChart";
import "./NextStepsScreen.css";

interface Props {
  onNavigate: (s: Screen) => void;
  onStepsSelected: (steps: SuggestedStep[]) => void;
}

export const NextStepsScreen: React.FC<Props> = ({ onNavigate, onStepsSelected }) => {
  const [data, setData] = useState<CashFlowDetailResponse | null>(null);
  const [selected, setSelected] = useState<Set<string>>(new Set());
  const [hideBalance, setHideBalance] = useState(false);

  useEffect(() => { fetchCashFlowDetail().then(setData); }, []);

  const toggleStep = (id: string) => {
    setSelected((prev) => {
      const next = new Set(prev);
      next.has(id) ? next.delete(id) : next.add(id);
      return next;
    });
  };

  const handleNext = () => {
    if (selected.size === 0) return;
    onStepsSelected(data!.suggestedNextSteps.filter((s) => selected.has(s.id)));
    onNavigate("actionChoice");
  };

  if (!data) return <div className="ns-loading">Loading…</div>;
  const { cashFlow } = data;

  return (
    <div className="ns">
      <div className="two-col" style={{ marginBottom: 8 }}>
        <div className="card ns__balance-card">
          <p className="ns__balance-label">Your projected lowest cash balance:</p>
          <div className="ns__amount" style={{ filter: hideBalance ? "blur(8px)" : "none" }}>
            {cashFlow.projectedLowestBalance.toLocaleString("en-US", { minimumFractionDigits: 2 })}
          </div>
          <div className="status-bar">
            <AlertIcon />
            <span className="status-bar__text"><strong>Status:</strong> {cashFlow.statusLabel}</span>
            <span className="status-bar__issues"><strong>{cashFlow.issueCount}</strong> issues</span>
          </div>
        </div>
        <div className="card ns__chart-card">
          <div className="section-title" style={{ marginBottom: 12 }}>PROJECTED CASH BALANCE OVER NEXT 14 DAYS</div>
          <div style={{ position: "relative", height: 160 }}>
            <CashFlowChart data={cashFlow.projectedBalanceOverTime} targetMinimumBuffer={cashFlow.targetMinimumBuffer} safeZoneThreshold={cashFlow.safeZoneThreshold} />
          </div>
        </div>
      </div>

      <div className="ns__toggle-row">
        <span>{hideBalance ? "Show" : "Hide"} cash balance</span>
        <label className="toggle">
          <input type="checkbox" checked={hideBalance} onChange={(e) => setHideBalance(e.target.checked)} />
          <span className="toggle__slider" />
        </label>
      </div>

      <div className="ns__agent">
        <div className="ns__agent-dot" />
        <p className="ns__agent-text">
          Now that I've explained the reason behind your health bar status and suggested next steps,{" "}
          <strong>what next steps do you want to take?</strong>
        </p>
      </div>

      <div className="card ns__steps-card">
        <div className="section-title ns__steps-title">SUGGESTED NEXT STEPS</div>
        {data.suggestedNextSteps.map((step) => (
          <div key={step.id} className="ns__step" onClick={() => toggleStep(step.id)}>
            <div className={`ns__step-checkbox${selected.has(step.id) ? " ns__step-checkbox--checked" : ""}`}>
              {selected.has(step.id) && <CheckIcon />}
            </div>
            <span className="ns__step-text">{step.text}</span>
          </div>
        ))}
      </div>

      <div className="ns__action-row">
        <button className="back-link" onClick={() => onNavigate("detail")}><BackIcon /> Back</button>
        <button className={`btn ns__next-btn${selected.size > 0 ? " ns__next-btn--active" : ""}`} onClick={handleNext}>Next</button>
      </div>
    </div>
  );
};

const AlertIcon = () => (<svg width="18" height="18" fill="none" stroke="currentColor" viewBox="0 0 24 24" style={{ flexShrink: 0 }}><circle cx="12" cy="12" r="10" /><line x1="12" y1="8" x2="12" y2="12" /><line x1="12" y1="16" x2="12.01" y2="16" /></svg>);
const BackIcon = () => (<svg width="16" height="16" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path d="M19 12H5M12 19l-7-7 7-7" /></svg>);
const CheckIcon = () => (<svg width="12" height="12" fill="none" stroke="white" strokeWidth="2.5" viewBox="0 0 24 24"><polyline points="20 6 9 17 4 12" /></svg>);