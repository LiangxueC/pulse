import React, { useState } from "react";
import type { Screen, SuggestedStep } from "../types";
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
  const [selected, setSelected] = useState<string | null>(null);

  const handleApply = () => {
    const step = skippedSteps.find((s) => s.id === selected);
    if (step) onApplySelected(step);
  };

  return (
    <div className="crev">
      <div className="crev__toggle-row">
        <span>Show cash balance</span>
        <label className="toggle">
          <input type="checkbox" />
          <span className="toggle__slider" />
        </label>
      </div>

      <div className="crev__agent">
        <div className="crev__agent-dot" />
        <div className="crev__agent-text">
          <p>Ok great! I'll go ahead and close this case!</p>
          <p><strong>I see that there was a suggested next step that you didn't take. If you would like to revisit it, select it and click 'Apply selected action.' I'll open a new case for that.</strong></p>
        </div>
      </div>

      <div className="card crev__card">
        <div className="section-title crev__card-title">SUGGESTED NEXT STEPS</div>
        {skippedSteps.map((step) => (
          <div
            key={step.id}
            className="crev__item"
            onClick={() => setSelected(selected === step.id ? null : step.id)}
          >
            <span className="crev__item-text">{step.text}</span>
            <div className={`crev__checkbox${selected === step.id ? " crev__checkbox--checked" : ""}`}>
              {selected === step.id && <CheckIcon />}
            </div>
          </div>
        ))}
      </div>

      <div className="crev__action-row">
        <button className="back-link" onClick={() => onNavigate("redirectImpact")}>
          <BackIcon /> Back
        </button>
        <div className="crev__btns">
          <button className="btn btn--ghost crev__btn" onClick={handleApply} disabled={!selected}>
            Apply selected action
          </button>
          <button className="btn btn--ghost crev__btn" onClick={onSkipAndFinish}>
            Skip and finish
          </button>
        </div>
      </div>
    </div>
  );
};

const BackIcon = () => (<svg width="16" height="16" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path d="M19 12H5M12 19l-7-7 7-7" /></svg>);
const CheckIcon = () => (<svg width="12" height="12" fill="none" stroke="white" strokeWidth="2.5" viewBox="0 0 24 24"><polyline points="20 6 9 17 4 12" /></svg>);