import React, { useEffect, useState } from "react";
import type { Screen } from "../types";
import { fetchPayrollSummary } from "../data/api";
import { PulseAvatar } from "../components/PulseAvatar";
import { Skeleton } from "../components/LoadingSkeleton";
import "./PayrollSummaryScreen.css";

interface Props {
  onNavigate: (s: Screen) => void;
  onFinish: () => void;
}

export const PayrollSummaryScreen: React.FC<Props> = ({ onNavigate, onFinish }) => {
  const [summary, setSummary] = useState("");
  const [loading, setLoading] = useState(true);
  const [hideBalance, setHideBalance] = useState(true);

  useEffect(() => {
    fetchPayrollSummary()
      .then((data) => setSummary(data.summary))
      .catch(() =>
        setSummary(
          "Slowing down hiring and tying payroll increases to revenue growth will help stabilize your cash floor over the next 30 days. Focus on reviewing open roles this week and defer any non-critical hires."
        )
      )
      .finally(() => setLoading(false));
  }, []);

  return (
    <div className="ps">
      <div className="ps__toggle-row">
        <span>{hideBalance ? "Show" : "Hide"} cash balance</span>
        <label className="toggle">
          <input
            type="checkbox"
            checked={!hideBalance}
            onChange={(e) => setHideBalance(!e.target.checked)}
          />
          <span className="toggle__slider" />
        </label>
      </div>

      {/* Pulse summary */}
      <div className="ps__agent">
        <PulseAvatar />
        <div className="ps__agent-text">
          <p>I've noted your commitment to slow down hiring and tie payroll increases to revenue growth.</p>
          <p><strong>Here's what this means for your cash flow:</strong></p>
        </div>
      </div>

      {/* Summary card */}
      <div className="card ps__summary-card">
        {loading ? (
          <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
            <Skeleton height="16px" width="90%" />
            <Skeleton height="14px" width="80%" />
            <Skeleton height="14px" width="85%" />
            <Skeleton height="14px" width="70%" />
          </div>
        ) : (
          <p className="ps__summary-text">{summary}</p>
        )}
      </div>

      <p className="ps__finish-hint">
        <strong>Please review and click 'All done' if this looks good and I'll close this case.</strong>
      </p>

      <div className="ps__action-row">
        <button className="back-link" onClick={() => onNavigate("actionChoice")}>
          <BackIcon /> Back
        </button>
        <button
          className="ps__done-btn"
          onClick={onFinish}
          disabled={loading}
        >
          All done
        </button>
      </div>

      <p className="ps__disclaimer">
        *Pulse is AI and can make mistakes. Important information should always be checked before proceeding.
      </p>
    </div>
  );
};

const BackIcon = () => (
  <svg width="16" height="16" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path d="M19 12H5M12 19l-7-7 7-7" />
  </svg>
);