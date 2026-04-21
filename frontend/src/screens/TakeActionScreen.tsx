import React, { useEffect, useState } from "react";
import type { Screen, SuggestedStep, Subscription } from "../types";
import { fetchSubscriptionRanking } from "../data/api";
import { GenericSkeleton } from "../components/LoadingSkeleton";
import { ErrorCard } from "../components/ErrorCard";
import "./TakeActionScreen.css";

interface Props {
  selectedSteps: SuggestedStep[];
  onNavigate: (s: Screen) => void;
}

const TAB_LABELS: Record<string, string> = {
  subscriptions: "Reducing Subscriptions",
  payroll: "Payroll vs Revenue",
};

export const TakeActionScreen: React.FC<Props> = ({ selectedSteps, onNavigate }) => {
  const [subscriptions, setSubscriptions] = useState<Subscription[]>([]);
  const [activeTab, setActiveTab] = useState(selectedSteps[0]?.category ?? "subscriptions");
  const [hideBalance, setHideBalance] = useState(true);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const load = () => {
    setLoading(true);
    setError("");
    fetchSubscriptionRanking()
      .then((r) => setSubscriptions(r.subscriptions))
      .catch(() => setError("Failed to load subscription data. Please try again."))
      .finally(() => setLoading(false));
  };

  useEffect(() => { load(); }, []);

  if (loading) return <GenericSkeleton />;
  if (error) return <ErrorCard message={error} onRetry={load} />;

  const tabs = selectedSteps.map((s) => ({
    key: s.category,
    label: TAB_LABELS[s.category] ?? s.category,
  }));

  const recommended = subscriptions.find((s) => s.recommended);
  const toBePaused = subscriptions.filter((s) => !s.recommended);

  return (
    <div className="ta">
      {/* Toggle */}
      <div className="ta__toggle-row">
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

      {/* Tabs — only shown if multiple steps selected */}
      {tabs.length > 1 && (
        <div className="ta__tabs">
          {tabs.map((t) => (
            <button
              key={t.key}
              className={`ta__tab${activeTab === t.key ? " ta__tab--active" : ""}`}
              onClick={() => setActiveTab(t.key)}
            >
              {t.label}
            </button>
          ))}
        </div>
      )}

      {activeTab === "subscriptions" && (
        <>
          <div className="ta__agent">
            <div className="ta__agent-dot" />
            <div className="ta__agent-text">
              <p>
                I've ranked the subscriptions based on cost, repetition and
                overlap with other tools, and finally by how little value we
                see in your QuickBooks data.
              </p>
              <p>
                <strong>
                  I recommend you keep {recommended?.name ?? "Asana"} as your
                  main tool and pause the others.
                </strong>
              </p>
            </div>
          </div>

          <div className="card ta__ranking-card">
            <div className="section-title ta__ranking-title">
              SUBSCRIPTION PRIORITY RANKING
            </div>
            {subscriptions.map((sub) => (
              <div
                key={sub.id}
                className={`ta__ranking-row${
                  sub.recommended
                    ? " ta__ranking-row--keep"
                    : " ta__ranking-row--pause"
                }`}
              >
                {sub.name}
              </div>
            ))}
          </div>

          <p className="ta__hint">
            <strong>
              Click next to see suggestions for how you can redirect the money
              saved.
            </strong>
          </p>
        </>
      )}

      {activeTab === "payroll" && (
        <div className="ta__agent">
          <div className="ta__agent-dot" />
          <div className="ta__agent-text">
            <p>
              I see you've chosen to "Slow down hiring, trim hours where
              possible, and make sure future payroll increases are tied to
              revenue growth."
            </p>
            <p>
              <strong>
                Would you like me to take action for you or would you like to
                do it yourself?
              </strong>
            </p>
          </div>
        </div>
      )}

      {/* Nav */}
      <div className="ta__action-row">
        <button
          className="back-link"
          onClick={() => onNavigate("actionChoice")}
        >
          <BackIcon /> Back
        </button>
        <button
          className="btn btn--ghost ta__next-btn"
          onClick={() => onNavigate("cashRedirects")}
        >
          Next
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