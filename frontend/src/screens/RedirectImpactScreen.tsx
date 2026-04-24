import React, { useEffect, useState } from "react";
import type { Screen, SuggestedStep, RedirectImpact } from "../types";
import { fetchRedirectImpact, fetchCashRedirects } from "../data/api";
import { CashFlowChart } from "../components/CashFlowChart";
import { GenericSkeleton } from "../components/LoadingSkeleton";
import { ErrorCard } from "../components/ErrorCard";
import "./RedirectImpactScreen.css";

interface Props {
  redirectId: string;
  selectedSteps: SuggestedStep[];
  onNavigate: (s: Screen) => void;
  onFinish: (skippedSteps: SuggestedStep[]) => void;
}

export const RedirectImpactScreen: React.FC<Props> = ({
  redirectId,
  selectedSteps,
  onNavigate,
  onFinish,
}) => {
  const [impact, setImpact] = useState<RedirectImpact | null>(null);
  const [redirectLabel, setRedirectLabel] = useState("");
  const [hideBalance, setHideBalance] = useState(true);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const load = () => {
    setLoading(true);
    setError("");
    Promise.all([
      fetchRedirectImpact(redirectId),
      fetchCashRedirects(),
    ])
      .then(([impactData, { redirects }]) => {
        setImpact(impactData);
        const r = redirects.find((x) => x.id === redirectId);
        if (r) setRedirectLabel(r.text);
      })
      .catch(() =>
        setError("Failed to load impact data. Please try again.")
      )
      .finally(() => setLoading(false));
  };

  useEffect(() => { load(); }, [redirectId]);

  const handleFinish = () => {
    const skipped = selectedSteps.filter(
      (s) => s.category !== "subscriptions"
    );
    onFinish(skipped);
  };

  if (loading) return <GenericSkeleton />;
  if (error) return <ErrorCard message={error} onRetry={load} />;

  return (
    <div className="ri">
      {/* Toggle */}
      <div className="ri__toggle-row">
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

      {/* Pulse agent */}
      <div className="ri__agent">
        <div className="ri__agent-dot" />
        <div className="ri__agent-text">
          <p>I see you've chosen to "{redirectLabel}"</p>
          <p>
            <strong>
              I've outlined how this move would benefit your projected lowest
              cash balance over the next 30 days.
            </strong>
          </p>
        </div>
      </div>

      {/* Impact comparison */}
      {impact && (
        <div className="card ri__impact-card">
          <div className="section-title ri__impact-title">
            HOW WOULD THIS IMPACT CASH FLOW?
          </div>
          <div className="ri__charts">
            <div className="ri__chart-col">
              <div className="ri__chart-wrap">
                <CashFlowChart
                  data={impact.currentData}
                  targetMinimumBuffer={40000}
                  safeZoneThreshold={48000}
                />
              </div>
              <p className="ri__chart-label">
                Current projected lowest cash balance
              </p>
            </div>
            <div className="ri__chart-col">
              <div className="ri__chart-wrap">
                <CashFlowChart
                  data={impact.newData}
                  targetMinimumBuffer={40000}
                  safeZoneThreshold={48000}
                />
              </div>
              <p className="ri__chart-label">
                New projected lowest cash balance
              </p>
            </div>
          </div>
          <p className="ri__impact-desc">{impact.description}</p>
        </div>
      )}

      <p className="ri__finish-hint">
        <strong>
          Please review and click 'Finish' if this issue is done and I'll
          close this case.
        </strong>
      </p>

      {/* Nav */}
      <div className="ri__action-row">
        <button
          className="back-link"
          onClick={() => onNavigate("cashRedirects")}
        >
          <BackIcon /> Back
        </button>
        <button
          className="btn btn--ghost ri__finish-btn"
          onClick={handleFinish}
        >
          Finish
        </button>
      </div>
    </div>
  );
};

const BackIcon = () => (
  <svg width="16" height="16" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path d="M19 12H5M12 19l-7-7 7-7" />
  </svg>
);