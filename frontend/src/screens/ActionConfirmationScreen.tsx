import React, { useEffect, useState } from "react";
import type { Screen, SuggestedStep } from "../types";
import { executeAction, sendActionFeedback } from "../data/api";
import { Skeleton } from "../components/LoadingSkeleton";
import { ErrorCard } from "../components/ErrorCard";
import "./ActionConfirmationScreen.css";
import { PulseAvatar } from "../components/PulseAvatar";

interface Props {
  selectedSteps: SuggestedStep[];
  onNavigate: (s: Screen) => void;
  onFinish: (skippedSteps: SuggestedStep[]) => void;
}

interface ActionResult {
  summary: string;
  bullets: string[];
  impact: string;
  monthlySaving?: number;
  balanceLift?: number;
}

export const ActionConfirmationScreen: React.FC<Props> = ({
  selectedSteps,
  onNavigate,
  onFinish,
}) => {
  const [result, setResult] = useState<ActionResult | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [feedback, setFeedback] = useState("");
  const [feedbackLoading, setFeedbackLoading] = useState(false);
  const [feedbackReply, setFeedbackReply] = useState("");

  const load = () => {
  const step = selectedSteps[0];
  if (!step) {
    setLoading(false);
    return;
  }
  setLoading(true);
  setError("");
  executeAction(step.category, step.text)
    .then((data) => {
      // Guard against backend returning an error object
      if (!data.summary) {
        setError(`No action handler found for category "${step.category}". Please try again.`);
        return;
      }
      setResult({
        summary: data.summary,
        bullets: data.bullets,
        impact: data.impact,
        monthlySaving: data.monthlySaving,
        balanceLift: data.balanceLift,
      });
    })
    .catch(() => {
      setError("Failed to execute action. Please try again.");
    })
    .finally(() => setLoading(false));
};

  useEffect(() => { load(); }, [selectedSteps]);

  const handleAllDone = () => {
    const skipped = selectedSteps.slice(1);
    onFinish(skipped);
  };

  const handleFeedbackSubmit = async () => {
    if (!feedback.trim() || !result) return;
    const text = feedback;
    setFeedback("");
    setFeedbackLoading(true);
    try {
      const { reply } = await sendActionFeedback(
        text,
        selectedSteps[0]?.category ?? "subscriptions",
        result
      );
      setFeedbackReply(reply);
    } catch {
      setFeedbackReply("Sorry, I couldn't process that right now. Please try again.");
    } finally {
      setFeedbackLoading(false);
    }
  };

  // Full screen error (failed to execute)
  if (error) return <ErrorCard message={error} onRetry={load} />;

  return (
    <div className="acf">
      {/* Pulse agent */}
      <div className="acf__agent">
        <PulseAvatar size={40} />
        <p className="acf__agent-text">
          I've completed the action! Please review and let me know if this
          issue is done:
        </p>
      </div>

      {/* Result card */}
      <div className="card acf__result-card">
        {loading ? (
          <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
            <Skeleton height="16px" width="80%" />
            <Skeleton height="14px" width="60%" />
            <Skeleton height="14px" width="70%" />
            <Skeleton height="14px" width="50%" />
            <Skeleton
              height="16px"
              width="90%"
              style={{ marginTop: 8 }}
            />
          </div>
        ) : result ? (
          <>
            <p className="acf__result-summary">{result.summary}</p>
            {result.bullets.length > 0 && (
              <ul className="acf__result-bullets">
                {result.bullets.map((b, i) => (
                  <li key={i}>{b}</li>
                ))}
              </ul>
            )}
            <p className="acf__result-impact">
              {result.impact.includes("higher than before") ? (
                <>
                  {result.impact.split("Your projected")[0]}
                  <strong>
                    Your projected
                    {result.impact.split("Your projected")[1]}
                  </strong>
                </>
              ) : (
                result.impact
              )}
            </p>
          </>
        ) : null}
      </div>

      {/* Feedback reply from Pulse */}
      {feedbackReply && (
        <div className="acf__feedback-reply">
          <PulseAvatar size={28} />
          <p className="acf__feedback-reply-text">{feedbackReply}</p>
        </div>
      )}

      {/* Bottom actions */}
      <div className="acf__action-row">
        <button
          className="btn btn--ghost acf__done-btn"
          onClick={handleAllDone}
          disabled={loading}
        >
          All done
        </button>
        <div className="acf__feedback-wrap">
          <input
            className="acf__feedback-input"
            placeholder={
              feedbackLoading
                ? "Pulse is thinking…"
                : "What should I change?"
            }
            value={feedback}
            disabled={feedbackLoading || loading}
            onChange={(e) => setFeedback(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && handleFeedbackSubmit()}
          />
          <button
            className="acf__feedback-send"
            onClick={handleFeedbackSubmit}
            disabled={!feedback.trim() || feedbackLoading || loading}
          >
            <SendIcon />
          </button>
        </div>
      </div>
    </div>
  );
};

const SendIcon = () => (
  <svg width="16" height="16" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <line x1="22" y1="2" x2="11" y2="13" />
    <polygon points="22 2 15 22 11 13 2 9 22 2" />
  </svg>
);