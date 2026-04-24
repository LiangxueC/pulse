import React, { useEffect, useState } from "react";
import type { Screen, SuggestedStep, Subscription, CashRedirect, RedirectImpact } from "../types";
import { fetchSubscriptionRanking, fetchCashRedirects, fetchRedirectImpact } from "../data/api";
import { CashFlowChart } from "../components/CashFlowChart";
import { GenericSkeleton } from "../components/LoadingSkeleton";
import { ErrorCard } from "../components/ErrorCard";
import { PulseAvatar } from "../components/PulseAvatar";
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
    body: "For hourly or part-time staff, reduce shifts temporarily. Communicate transparently so you retain trust.",
  },
  {
    id: "dim-p4",
    title: "4. Tie future raises to revenue milestones.",
    body: "Set a clear rule: payroll increases only when monthly revenue grows by a defined percentage.",
  },
];

export const DoItMyselfScreen: React.FC<Props> = ({
  selectedSteps,
  onNavigate,
  onFinish,
}) => {
  const [subscriptions, setSubscriptions] = useState<Subscription[]>([]);
  const [redirects, setRedirects] = useState<CashRedirect[]>([]);
  const [selectedRedirectId, setSelectedRedirectId] = useState<string>("");
  const [impact, setImpact] = useState<RedirectImpact | null>(null);
  const [activeTab, setActiveTab] = useState(selectedSteps[0]?.category ?? "subscriptions");
  const [expandedStep, setExpandedStep] = useState<string | null>("dim-s1");
  const [hideBalance, setHideBalance] = useState(true);
  const [loading, setLoading] = useState(true);
  const [impactLoading, setImpactLoading] = useState(false);
  const [error, setError] = useState("");

  const load = () => {
    setLoading(true);
    setError("");
    Promise.all([fetchSubscriptionRanking(), fetchCashRedirects()])
      .then(([subData, redirectData]) => {
        setSubscriptions(subData.subscriptions);
        setRedirects(redirectData.redirects);
      })
      .catch(() => setError("Failed to load data. Please try again."))
      .finally(() => setLoading(false));
  };

  useEffect(() => { load(); }, []);

  const handleRedirectSelect = async (id: string) => {
    if (selectedRedirectId === id) {
      setSelectedRedirectId("");
      setImpact(null);
      return;
    }
    setSelectedRedirectId(id);
    setImpactLoading(true);
    setImpact(null);
    try {
      const data = await fetchRedirectImpact(id);
      setImpact(data);
    } catch {
      setImpact(null);
    } finally {
      setImpactLoading(false);
    }
  };

  const handleAllDone = () => {
    const skipped = selectedSteps.filter((s) => s.category !== activeTab);
    onFinish(skipped);
  };

  const toggleStep = (id: string) => {
    setExpandedStep((prev) => (prev === id ? null : id));
  };

  if (loading) return <GenericSkeleton />;
  if (error) return <ErrorCard message={error} onRetry={load} />;

  const tabs = selectedSteps.map((s) => ({
    key: s.category,
    label: TAB_LABELS[s.category] ?? s.category,
  }));

  const steps = activeTab === "subscriptions" ? SUBSCRIPTION_STEPS : PAYROLL_STEPS;
  const selectedRedirectObj = redirects.find((r) => r.id === selectedRedirectId);

  return (
    <div className="dim">
      {/* Toggle */}
      <div className="dim__toggle-row">
        <span>{hideBalance ? "Show" : "Hide"} cash balance</span>
        <label className="toggle">
          <input
            type="checkbox"
            checked={hideBalance}
            onChange={(e) => setHideBalance(e.target.checked)}
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
                setExpandedStep(t.key === "subscriptions" ? "dim-s1" : "dim-p1");
                setSelectedRedirectId("");
                setImpact(null);
              }}
            >
              {t.label}
            </button>
          ))}
        </div>
      )}

      {/* ── SUBSCRIPTIONS TAB ── */}
      {activeTab === "subscriptions" && (
        <>
          {/* Agent intro */}
          <div className="dim__agent">
            <PulseAvatar />
            <p className="dim__agent-text">Here's a step-by-step process you can use:</p>
          </div>

          {/* Subscription list */}
          {subscriptions.length > 0 && (
            <div className="dim__sub-list">
              <p className="dim__sub-label"><strong>The subscriptions are:</strong></p>
              <ul className="dim__sub-ul">
                {subscriptions.map((s) => <li key={s.id}>{s.name}</li>)}
              </ul>
            </div>
          )}

          {/* Accordion */}
          <div className="card dim__accordion">
            <div className="dim__task-header">
              <strong>Task: Pick one main tool that's most beneficial, pause the others, and redirect that money into something that moves the business forward.</strong>
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

          {/* Cash redirects */}
          <div className="dim__agent">
            <PulseAvatar />
            <div className="dim__agent-text-block">
              <p>Here are some suggestions for how you can redirect the money you save.</p>
              <p><strong>Click on one or multiple to see how that would affect your projected lowest cash balance over the next 30 days.</strong></p>
            </div>
          </div>

          <div className="card dim__redirects-card">
            <div className="section-title dim__redirects-title">
              SUGGESTED CASH REDIRECTS
            </div>
            {redirects.map((r) => (
              <div
                key={r.id}
                className={`dim__redirect-row${selectedRedirectId === r.id ? " dim__redirect-row--selected" : ""}`}
                onClick={() => handleRedirectSelect(r.id)}
              >
                <span className="dim__redirect-text">{r.text}</span>
                <div className={`dim__redirect-check${selectedRedirectId === r.id ? " dim__redirect-check--checked" : ""}`}>
                  {selectedRedirectId === r.id && <CheckIcon />}
                </div>
              </div>
            ))}
          </div>

          {/* Impact chart — shows after redirect is selected */}
          {selectedRedirectId && (
            <>
              <div className="dim__agent">
                <PulseAvatar />
                <div className="dim__agent-text-block">
                  <p>I see you've chosen to "{selectedRedirectObj?.text ?? "this option"}."</p>
                  <p><strong>I've outlined how this move would benefit your projected lowest cash balance over the next 30 days.</strong></p>
                </div>
              </div>

              <div className="card dim__impact-card">
                <div className="section-title dim__impact-title">
                  HOW WOULD THIS IMPACT CASH FLOW?
                </div>
                {impactLoading ? (
                  <div className="dim__impact-loading">Loading projection…</div>
                ) : impact ? (
                  <>
                    <div className="dim__charts">
                      <div className="dim__chart-col">
                        <div className="dim__chart-wrap">
                          <CashFlowChart
                            data={impact.currentData}
                            targetMinimumBuffer={40000}
                            safeZoneThreshold={48000}
                          />
                        </div>
                        <p className="dim__chart-label">Current projected lowest cash balance</p>
                      </div>
                      <div className="dim__chart-col">
                        <div className="dim__chart-wrap">
                          <CashFlowChart
                            data={impact.newData}
                            targetMinimumBuffer={40000}
                            safeZoneThreshold={48000}
                          />
                        </div>
                        <p className="dim__chart-label">New projected lowest cash balance</p>
                      </div>
                    </div>
                    <p className="dim__impact-desc">{impact.description}</p>
                  </>
                ) : (
                  <div className="dim__impact-loading">Could not load projection.</div>
                )}
              </div>

              <p className="dim__finish-hint">
                <strong>Please review and click 'All done' if this issue is resolved.</strong>
              </p>
            </>
          )}
        </>
      )}

      {/* ── PAYROLL TAB ── */}
      {activeTab === "payroll" && (
        <>
          <div className="dim__agent">
            <PulseAvatar />
            <p className="dim__agent-text">Here's a step-by-step process you can use:</p>
          </div>

          <div className="card dim__accordion">
            <div className="dim__task-header">
              <strong>Task: Slow down hiring, trim hours where possible, and make sure future payroll increases are tied to revenue growth.</strong>
            </div>
            {PAYROLL_STEPS.map((step) => (
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
        </>
      )}

      {/* Nav */}
      <div className="dim__action-row">
        <button className="back-link" onClick={() => onNavigate("actionChoice")}>
          <BackIcon /> Back
        </button>
        <button
          className={`btn dim__done-btn${
            activeTab === "subscriptions" && !selectedRedirectId
              ? ""
              : " dim__done-btn--active"
          }`}
          onClick={handleAllDone}
          disabled={activeTab === "subscriptions" && !selectedRedirectId}
        >
          All done
        </button>
      </div>

      <p className="dim__disclaimer">
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
const CheckIcon = () => (
  <svg width="12" height="12" fill="none" stroke="white" strokeWidth="2.5" viewBox="0 0 24 24">
    <polyline points="20 6 9 17 4 12" />
  </svg>
);