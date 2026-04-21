import React, { useEffect, useState } from "react";
import type { Screen, SuggestedStep, Subscription } from "../types";
import { fetchSubscriptionRanking } from "../data/api";
import "./DoItMyselfScreen.css";

interface Props {
  selectedSteps: SuggestedStep[];
  onNavigate: (s: Screen) => void;
  onFinish: (skippedSteps: SuggestedStep[]) => void;
}

const TAB_LABELS: Record<string, string> = {
  subscriptions: "Reducing Subscriptions",
  payroll: "Payroll vs Revenue",
};

const SUBSCRIPTION_STEPS = [
  {
    id: "dim-s1",
    title: "1. Pick the one tool your team really relies on.",
    body: "Start with the software that people actually use every week and that solves the biggest job for the business.",
  },
  {
    id: "dim-s2",
    title: "2. Pause the extra tools that do the same thing.",
    body: "Log into each redundant tool and downgrade or pause your subscription. Most tools let you pause without losing data.",
  },
  {
    id: "dim-s3",
    title: "3. Use the money you save on something that helps now.",
    body: "Redirect the freed-up cash toward a growth channel, emergency reserve, or a key hire — whatever moves the needle most right now.",
  },
  {
    id: "dim-s4",
    title: "4. Watch the next 7–10 days",
    body: "Check your cash balance in 7–10 days to confirm the savings are showing up and nothing was missed.",
  },
];

const PAYROLL_STEPS = [
  {
    id: "dim-p1",
    title: "1. Review your current headcount and hours.",
    body: "List all full-time, part-time, and contractor roles. Identify which roles are directly tied to revenue-generating work.",
  },
  {
    id: "dim-p2",
    title: "2. Pause or delay any open hires.",
    body: "Put a hold on job postings that aren't critical. Revisit them once monthly revenue shows a consistent upward trend.",
  },
  {
    id: "dim-p3",
    title: "3. Trim hours where possible.",
    body: "For hourly or part-time staff, reduce shifts temporarily. Communicate transparently so you retain trust and can scale back up.",
  },
  {
    id: "dim-p4",
    title: "4. Tie future raises to revenue milestones.",
    body: "Set a clear rule: payroll increases only when monthly revenue grows by a defined percentage, keeping burn proportional to income.",
  },
];

export const DoItMyselfScreen: React.FC<Props> = ({
  selectedSteps,
  onNavigate,
  onFinish,
}) => {
  const [subscriptions, setSubscriptions] = useState<Subscription[]>([]);
  const [activeTab, setActiveTab] = useState(selectedSteps[0]?.category ?? "subscriptions");
  const [expandedStep, setExpandedStep] = useState<string | null>("dim-s1");
  const [hideBalance, setHideBalance] = useState(true);

  useEffect(() => {
    fetchSubscriptionRanking().then((r) => setSubscriptions(r.subscriptions));
  }, []);

  const tabs = selectedSteps.map((s) => ({
    key: s.category,
    label: TAB_LABELS[s.category] ?? s.category,
  }));

  const steps = activeTab === "subscriptions" ? SUBSCRIPTION_STEPS : PAYROLL_STEPS;

  const handleAllDone = () => {
    const skipped = selectedSteps.filter((s) => s.category !== activeTab);
    onFinish(skipped);
  };

  const toggleStep = (id: string) => {
    setExpandedStep((prev) => (prev === id ? null : id));
  };

  return (
    <div className="dim">
      {/* Toggle */}
      <div className="dim__toggle-row">
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

      {/* Tabs */}
      {tabs.length > 1 && (
        <div className="dim__tabs">
          {tabs.map((t) => (
            <button
              key={t.key}
              className={`dim__tab${activeTab === t.key ? " dim__tab--active" : ""}`}
              onClick={() => {
                setActiveTab(t.key);
                setExpandedStep(
                  t.key === "subscriptions" ? "dim-s1" : "dim-p1"
                );
              }}
            >
              {t.label}
            </button>
          ))}
        </div>
      )}

      {/* Summary section */}
      <div className="dim__agent">
        <div className="dim__agent-dot" />
        <p className="dim__agent-text">Here's a step-by-step process you can use:</p>
      </div>

      {/* Subscription list (only for subscriptions tab) */}
      {activeTab === "subscriptions" && subscriptions.length > 0 && (
        <div className="dim__sub-list">
          <p className="dim__sub-label"><strong>The subscriptions are:</strong></p>
          <ul className="dim__sub-ul">
            {subscriptions.map((s) => (
              <li key={s.id}>{s.name}</li>
            ))}
          </ul>
        </div>
      )}

      {/* Step-by-step accordion */}
      <div className="card dim__accordion">
        <div className="dim__task-header">
          <strong>
            Task:{" "}
            {activeTab === "subscriptions"
              ? "Pick one main tool that's most beneficial, pause the others, and redirect that money into something that moves the business forward."
              : "Slow down hiring, trim hours where possible, and make sure future payroll increases are tied to revenue growth."}
          </strong>
        </div>

        {steps.map((step) => (
          <div key={step.id} className="dim__step">
            <button
              className="dim__step-header"
              onClick={() => toggleStep(step.id)}
            >
              <span className="dim__step-title">{step.title}</span>
              <span className="dim__step-chevron">
                {expandedStep === step.id ? <ChevronUp /> : <ChevronDown />}
              </span>
            </button>
            {expandedStep === step.id && (
              <div className="dim__step-body">{step.body}</div>
            )}
          </div>
        ))}
      </div>

      {/* Nav */}
      <div className="dim__action-row">
        <button className="back-link" onClick={() => onNavigate("actionChoice")}>
          <BackIcon /> Back
        </button>
        <button className="btn btn--ghost dim__done-btn" onClick={handleAllDone}>
          All done
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
const ChevronUp = () => (
  <svg width="16" height="16" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <polyline points="18 15 12 9 6 15" />
  </svg>
);
const ChevronDown = () => (
  <svg width="16" height="16" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <polyline points="6 9 12 15 18 9" />
  </svg>
);