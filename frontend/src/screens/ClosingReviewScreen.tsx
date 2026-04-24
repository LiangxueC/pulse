import React, { useState } from "react";
import type { Screen, SuggestedStep } from "../types";
import { PulseAvatar } from "../components/PulseAvatar";
import "./ClosingReviewScreen.css";

interface Props {
  skippedSteps: SuggestedStep[];
  onNavigate: (s: Screen) => void;
  onSkipAndFinish: () => void;
  onApplySelected: (step: SuggestedStep) => void;
}

export const ClosingReviewScreen: React.FC<Props> = ({
  skippedSteps,
  onNavigate,
  onSkipAndFinish,
  onApplySelected,
}) => {
  const [selected, setSelected] = useState<string | null>(
    skippedSteps.length === 1 ? skippedSteps[0].id : null
  );
  const [hideBalance, setHideBalance] = useState(true);

  const handleApply = () => {
    const step = skippedSteps.find((s) => s.id === selected);
    if (step) onApplySelected(step);
  };

  const selectedStep = skippedSteps.find((s) => s.id === selected);

  return (
    <div className="crev">
      {/* Toggle */}
      <div className="crev__toggle-row">
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

      {/* Pulse message — case closed */}
      <div className="crev__agent">
        <PulseAvatar />
        <div className="crev__agent-text">
          <p>Ok great! I'll go ahead and close this case!</p>
          <p>
            <strong>
              I see that there was a suggested next step that you didn't take.
              If you would like to revisit it, select it and click 'Apply
              selected action.' I'll open a new case for that.
            </strong>
          </p>
        </div>
      </div>

      {/* Skipped steps */}
      <div className="card crev__card">
        <div className="section-title crev__card-title">SUGGESTED NEXT STEPS</div>
        {skippedSteps.map((step) => (
          <div
            key={step.id}
            className={`crev__item${selected === step.id ? " crev__item--selected" : ""}`}
            onClick={() => setSelected(selected === step.id ? null : step.id)}
          >
            <span className="crev__item-text">{step.text}</span>
            <div className={`crev__checkbox${selected === step.id ? " crev__checkbox--checked" : ""}`}>
              {selected === step.id && <CheckIcon />}
            </div>
          </div>
        ))}
      </div>

      {/* Follow-up question — only shown when a step is selected */}
      {selectedStep && (
        <div className="crev__followup">
          <PulseAvatar size={32} />
          <div className="crev__followup-text">
            <p>
              Would you like to start a new case for{" "}
              <strong>"{selectedStep.text}"</strong>?
            </p>
            <p>
              I'll walk you through it the same way — you can choose to handle
              it yourself or let me take action for you.
            </p>
          </div>
        </div>
      )}

      {/* Action row */}
      <div className="crev__action-row">
        <button className="back-link" onClick={() => onNavigate("redirectImpact")}>
          <BackIcon /> Back
        </button>
        <div className="crev__btns">
          <button
            className="crev__btn crev__btn--outline"
            onClick={handleApply}
            disabled={!selected}
          >
            <BackIcon /> Apply selected action
          </button>
          <button
            className="crev__btn crev__btn--green"
            onClick={onSkipAndFinish}
          >
            Skip and finish <ForwardIcon />
          </button>
        </div>
      </div>

      <p className="crev__disclaimer">
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