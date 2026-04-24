import React, { useState } from "react";
import type { Screen, SuggestedStep } from "../types";
import { PulseAvatar } from "../components/PulseAvatar";
import "./ActionChoiceScreen.css";

interface Props {
  selectedSteps: SuggestedStep[];
  onNavigate: (s: Screen) => void;
  onDoItMyself: (steps: SuggestedStep[]) => void;
  onTakeAction: (steps: SuggestedStep[]) => void;
}

export const ActionChoiceScreen: React.FC<Props> = ({
  selectedSteps,
  onNavigate,
  onDoItMyself,
  onTakeAction,
}) => {
  const [hideBalance, setHideBalance] = useState(true);

  const stepSummary =
    selectedSteps.length === 1
      ? `"${selectedSteps[0].text}"`
      : selectedSteps.map((s) => `"${s.text}"`).join(" and ");

  return (
    <div className="ac">
      {/* Toggle */}
      <div className="ac__toggle-row">
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
      <div className="ac__agent">
        <PulseAvatar />
        <div className="ac__agent-text">
          <p>I see you've chosen to {stepSummary}.</p>
          <p>
            <strong>
              Would you like me to take action for you or would you like to do
              it yourself?
            </strong>
          </p>
        </div>
      </div>

      {/* Steps summary */}
      <div className="card ac__steps-card">
        <div className="section-title ac__steps-title">SUGGESTED NEXT STEPS</div>
        {selectedSteps.map((step) => (
          <div key={step.id} className="ac__step">
            <div className="ac__step-checkbox ac__step-checkbox--checked">
              <CheckIcon />
            </div>
            <span className="ac__step-text">{step.text}</span>
          </div>
        ))}
      </div>

      {/* Action row — new button style */}
      <div className="ac__action-row">
        <button
          className="ac__btn ac__btn--outline"
          onClick={() => onDoItMyself(selectedSteps)}
        >
          <BackIcon /> Do it myself
        </button>
        <button
          className="ac__btn ac__btn--green"
          onClick={() => onTakeAction(selectedSteps)}
        >
          Take action for me <ForwardIcon />
        </button>
      </div>

      <p className="ac__disclaimer">
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