import React, { useEffect, useState } from "react";
import type {
  Screen,
  SuggestedStep,
  Subscription,
  CashRedirect,
  RedirectImpact,
} from "../types";
import {
  fetchSubscriptionRanking,
  fetchCashRedirects,
  fetchRedirectImpact,
} from "../data/api";
import { CashFlowChart } from "../components/CashFlowChart";
import { GenericSkeleton } from "../components/LoadingSkeleton";
import { ErrorCard } from "../components/ErrorCard";
import { PulseAvatar } from "../components/PulseAvatar";
import "./TakeActionScreen.css";

interface Props {
  selectedSteps: SuggestedStep[];
  onNavigate: (s: Screen) => void;
  onFinish?: (skippedSteps: SuggestedStep[]) => void;
}

const TAB_LABELS: Record<string, string> = {
  subscriptions: "Reducing Subscriptions",
  payroll: "Payroll vs Revenue",
};

export const TakeActionScreen: React.FC<Props> = ({
  selectedSteps,
  onNavigate,
  onFinish,
}) => {
  const [subscriptions, setSubscriptions] = useState<Subscription[]>([]);
  const [redirects, setRedirects] = useState<CashRedirect[]>([]);
  const [selectedRedirectId, setSelectedRedirectId] = useState<string>("");
  const [impact, setImpact] = useState<RedirectImpact | null>(null);
  const [activeTab, setActiveTab] = useState(
    selectedSteps[0]?.category ?? "subscriptions"
  );
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

  useEffect(() => {
    load();
  }, []);

  const handleRedirectSelect = async (id: string) => {
    // Toggle off if already selected
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

  const handleFinish = () => {
    const skipped = selectedSteps.filter((s) => s.category !== activeTab);
    if(onFinish)
    {
      onFinish(skipped);
    } else {
      if(skipped.length > 0) {
        onNavigate("closingReview");
      } else {
        onNavigate("caseClosed");
      }
    }
  };

  if (loading) return <GenericSkeleton />;
  if (error) return <ErrorCard message={error} onRetry={load} />;

  const tabs = selectedSteps.map((s) => ({
    key: s.category,
    label: TAB_LABELS[s.category] ?? s.category,
  }));

  const recommended = subscriptions.find((s) => s.recommended);
  const selectedRedirectObj = redirects.find(
    (r) => r.id === selectedRedirectId
  );

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

      {/* Tabs — only if multiple steps selected */}
      {tabs.length > 1 && (
        <div className="ta__tabs">
          {tabs.map((t) => (
            <button
              key={t.key}
              className={`ta__tab${
                activeTab === t.key ? " ta__tab--active" : ""
              }`}
              onClick={() => setActiveTab(t.key)}
            >
              {t.label}
            </button>
          ))}
        </div>
      )}

      {/* ── SUBSCRIPTIONS TAB ── */}
      {activeTab === "subscriptions" && (
        <>
          {/* Section 1: Steps recap */}
          <div className="card ta__steps-recap">
            <div className="section-title ta__steps-recap-title">
              SUGGESTED NEXT STEPS
            </div>
            {selectedSteps.map((step) => (
              <div key={step.id} className="ta__recap-row">
                <span className="ta__recap-text">{step.text}</span>
                <div
                  className={`ta__recap-check${
                    step.category === activeTab
                      ? " ta__recap-check--checked"
                      : ""
                  }`}
                >
                  {step.category === activeTab && <CheckIcon />}
                </div>
              </div>
            ))}
          </div>

          {/* Section 2: Subscription ranking */}
          <div className="ta__agent">
            <PulseAvatar />
            <div className="ta__agent-text">
              <p>
                I've ranked the subscriptions based on cost, repetition and
                overlap with other tools, and finally by how little value we
                see in your QuickBooks data.
              </p>
              <p>
                <strong>
                  I recommend you keep{" "}
                  {recommended?.name ?? "Asana"} as your main tool and pause
                  the others.
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

          {/* Section 3: Cash redirects */}
          <div className="ta__agent">
            <PulseAvatar />
            <div className="ta__agent-text">
              <p>
                Here are some suggestions for how you can redirect the money
                you save.
              </p>
              <p>
                <strong>
                  Click on one or multiple to see how that would affect your
                  projected lowest cash balance over the next 30 days.
                </strong>
              </p>
            </div>
          </div>

          <div className="card ta__redirects-card">
            <div className="section-title ta__redirects-title">
              SUGGESTED CASH REDIRECTS
            </div>
            {redirects.map((r) => (
              <div
                key={r.id}
                className={`ta__redirect-row${
                  selectedRedirectId === r.id
                    ? " ta__redirect-row--selected"
                    : ""
                }`}
                onClick={() => handleRedirectSelect(r.id)}
              >
                <span className="ta__redirect-text">{r.text}</span>
                <div
                  className={`ta__redirect-check${
                    selectedRedirectId === r.id
                      ? " ta__redirect-check--checked"
                      : ""
                  }`}
                >
                  {selectedRedirectId === r.id && <CheckIcon />}
                </div>
              </div>
            ))}
          </div>

          {/* Section 4: Impact chart — shows as soon as a redirect is selected */}
          {selectedRedirectId && (
            <>
              <div className="ta__agent">
                <PulseAvatar />
                <div className="ta__agent-text">
                  <p>
                    I see you've chosen to "
                    {selectedRedirectObj?.text ?? "this option"}."
                  </p>
                  <p>
                    <strong>
                      I've outlined how this move would benefit your projected
                      lowest cash balance over the next 30 days.
                    </strong>
                  </p>
                </div>
              </div>

              <div className="card ta__impact-card">
                <div className="section-title ta__impact-title">
                  HOW WOULD THIS IMPACT CASH FLOW?
                </div>

                {impactLoading ? (
                  <div className="ta__impact-loading">
                    Loading projection…
                  </div>
                ) : impact ? (
                  <>
                    <div className="ta__charts">
                      <div className="ta__chart-col">
                        <div className="ta__chart-wrap">
                          <CashFlowChart
                            data={impact.currentData}
                            targetMinimumBuffer={40000}
                            safeZoneThreshold={48000}
                          />
                        </div>
                        <p className="ta__chart-label">
                          Current projected lowest cash balance
                        </p>
                      </div>
                      <div className="ta__chart-col">
                        <div className="ta__chart-wrap">
                          <CashFlowChart
                            data={impact.newData}
                            targetMinimumBuffer={40000}
                            safeZoneThreshold={48000}
                          />
                        </div>
                        <p className="ta__chart-label">
                          New projected lowest cash balance
                        </p>
                      </div>
                    </div>
                    <p className="ta__impact-desc">{impact.description}</p>
                  </>
                ) : (
                  <div className="ta__impact-loading">
                    Could not load projection. Please try again.
                  </div>
                )}
              </div>

              <p className="ta__finish-hint">
                <strong>
                  Please review and click 'Finish' if this issue is done and
                  I'll close this case.
                </strong>
              </p>
            </>
          )}
        </>
      )}

      {/* ── PAYROLL TAB ── */}
      {activeTab === "payroll" && (
        <div className="ta__agent">
          <PulseAvatar />
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

        {selectedRedirectId ? (
    <button
      className="btn btn--green ta__finish-btn"
      onClick={handleFinish}
          >
            Finish
          </button>
        ) : (
          <button
            className="btn btn--ghost ta__next-btn"
            onClick={() => onNavigate("cashRedirects")}
          >
            Next
          </button>
        )}
      </div>

      <p className="ta__disclaimer">
        *Pulse is AI and can make mistakes. Important information should always
        be checked before proceeding.
      </p>
    </div>
  );
};

// ── Icons ──
const BackIcon = () => (
  <svg width="16" height="16" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path d="M19 12H5M12 19l-7-7 7-7" />
  </svg>
);
const CheckIcon = () => (
  <svg
    width="12"
    height="12"
    fill="none"
    stroke="white"
    strokeWidth="2.5"
    viewBox="0 0 24 24"
  >
    <polyline points="20 6 9 17 4 12" />
  </svg>
);