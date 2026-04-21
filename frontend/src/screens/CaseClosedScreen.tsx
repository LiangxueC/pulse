import React, { useEffect } from "react";
import type { Screen, SuggestedStep } from "../types";
import { closeCase } from "../data/api";
import "./CaseClosedScreen.css";

interface Props {
  onNavigate: (s: Screen) => void;
  stepsTaken?: SuggestedStep[];
  stepsSkipped?: SuggestedStep[];
}

export const CaseClosedScreen: React.FC<Props> = ({
  onNavigate,
  stepsTaken = [],
  stepsSkipped = [],
}) => {
  useEffect(() => {
    // Archive this case on the backend when screen mounts
    closeCase(stepsTaken, stepsSkipped).catch(console.error);
  }, []);

  return (
    <div className="cc">
      <div className="cc__toggle-row">
        <span>Show cash balance</span>
        <label className="toggle">
          <input type="checkbox" />
          <span className="toggle__slider" />
        </label>
      </div>

      <div className="cc__agent">
        <div className="cc__agent-dot" />
        <div className="cc__agent-text">
          Ok great! I've gone ahead and closed this case. You can revisit it through the{" "}
          <button className="cc__link" onClick={() => onNavigate("archived")}>
            Archived Cases
          </button>{" "}
          page.
        </div>
      </div>

      <button
        className="btn btn--ghost cc__back-btn"
        onClick={() => onNavigate("dashboard")}
      >
        Back to dashboard
      </button>
    </div>
  );
};