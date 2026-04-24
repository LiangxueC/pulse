import React, { useEffect, useState } from "react";
import type { Screen, SuggestedStep } from "../types";
import { closeCase, fetchCashFlowDetail } from "../data/api";
import { PulseAvatar } from "../components/PulseAvatar";
import "./CaseClosedScreen.css";

interface Props {
  onNavigate: (s: Screen) => void;
  stepsTaken?: SuggestedStep[];
  stepsSkipped?: SuggestedStep[];
  completedCategories?: string[];
  onStartNewCase?: (step: SuggestedStep) => void;
}

export const CaseClosedScreen: React.FC<Props> = ({
  onNavigate,
  stepsTaken = [],
  stepsSkipped = [],
  completedCategories = [],
  onStartNewCase,
}) => {
  const [remainingSteps, setRemainingSteps] = useState<SuggestedStep[]>([]);
  const [selected, setSelected] = useState<string | null>(null);
  const [hideBalance, setHideBalance] = useState(true);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    closeCase(stepsTaken, stepsSkipped).catch(console.error);
    fetchCashFlowDetail(completedCategories)
      .then((data) => {
        const takenIds = new Set(stepsTaken.map((s) => s.id));
        const remaining = data.suggestedNextSteps.filter((s) => !takenIds.has(s.id));
        setRemainingSteps(remaining);
        if (remaining.length === 1) setSelected(remaining[0].id);
      })
      .catch(() => setRemainingSteps([]))
      .finally(() => setLoading(false));
  }, []);

  const selectedStep = remainingSteps.find((s) => s.id === selected);

  const handleStartNewCase = () => {
    if (!selectedStep || !onStartNewCase) return;
    onStartNewCase(selectedStep);
  };

  return (
    <div className="cc">
      <div className="cc__toggle-row">
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

      {/* Case closed */}
      <div className="cc__agent">
        <PulseAvatar />
        <div className="cc__agent-text">
          <p>
            Ok great! I've gone ahead and closed this case. You can revisit it
            through the{" "}
            <button className="cc__link" onClick={() => onNavigate("archived")}>
              Archived Cases
            </button>{" "}
            page.
          </p>
        </div>
      </div>

      {/* Remaining steps */}
      {!loading && remainingSteps.length > 0 && (
        <>
          <div className="cc__agent">
            <PulseAvatar />
            <div className="cc__agent-text">
              <p>
                I see that there was a suggested next step that you didn't take.
                If you would like to revisit it, select it and click{" "}
                <strong>'Apply selected action.'</strong> I'll open a new case
                for that.
              </p>
            </div>
          </div>

          <div className="card cc__steps-card">
            <div className="section-title cc__steps-title">SUGGESTED NEXT STEPS</div>
            {remainingSteps.map((step) => (
              <div
                key={step.id}
                className={`cc__step-row${selected === step.id ? " cc__step-row--selected" : ""}`}
                onClick={() => setSelected(selected === step.id ? null : step.id)}
              >
                <span className="cc__step-text">{step.text}</span>
                <div className={`cc__step-check${selected === step.id ? " cc__step-check--checked" : ""}`}>
                  {selected === step.id && <CheckIcon />}
                </div>
              </div>
            ))}
          </div>

          {/* Three buttons — Back, Apply selected action, Skip and finish */}
          <div className="cc__action-row">
            <button className="back-link cc__back" onClick={() => onNavigate("redirectImpact")}>
              <BackIcon /> Back
            </button>
            <div className="cc__btns">
              <button
                className="cc__btn cc__btn--green"
                onClick={handleStartNewCase}
                disabled={!selected}
              >
                <BackIcon /> Apply selected action
              </button>
              <button
                className="cc__btn cc__btn--green"
                onClick={() => onNavigate("dashboard")}
              >
                Skip and finish <ForwardIcon />
              </button>
            </div>
          </div>
        </>
      )}

      {/* No remaining issues */}
      {!loading && remainingSteps.length === 0 && (
        <>
          <div className="cc__agent">
            <PulseAvatar />
            <div className="cc__agent-text">
              <p>
                <strong>
                  You've addressed all suggested steps. Your cash flow is in
                  good shape — keep an eye on it over the next few days.
                </strong>
              </p>
            </div>
          </div>
          <button
            className="cc__btn cc__btn--green cc__solo-btn"
            onClick={() => onNavigate("dashboard")}
          >
            Back to dashboard
          </button>
        </>
      )}

      {loading && (
        <div className="cc__loading">Checking for remaining issues…</div>
      )}

      <p className="cc__disclaimer">
        *Pulse is AI and can make mistakes. Important information should always
        be checked before proceeding.
      </p>
    </div>
  );
};

const BackIcon = () => (
  <svg width="14" height="14" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path d="M19 12H5M12 19l-7-7 7-7" />
  </svg>
);
const ForwardIcon = () => (
  <svg width="14" height="14" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path d="M5 12h14M12 5l7 7-7 7" />
  </svg>
);
const CheckIcon = () => (
  <svg width="12" height="12" fill="none" stroke="white" strokeWidth="2.5" viewBox="0 0 24 24">
    <polyline points="20 6 9 17 4 12" />
  </svg>
);