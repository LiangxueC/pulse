import React, { useState } from "react";
import type { Screen, ArchivedCase } from "../types";
import { CashFlowChart } from "../components/CashFlowChart";
import { PulseAvatar } from "../components/PulseAvatar";
import "./CaseDetailScreen.css";

interface Props {
  caseData: ArchivedCase;
  onNavigate: (s: Screen) => void;
}

const TAB_LABELS: Record<string, string> = {
  subscriptions: "Reducing Subscriptions",
  payroll: "Payroll vs Revenue",
  invoices: "Late Invoices",
};

// Mock case detail — in production this would come from the backend
const CASE_DETAILS: Record<string, {
  tabs: string[];
  stepsTaken: string[];
  stepsSkipped: string[];
  redirectChosen: string;
  currentData: { day: number; balance: number }[];
  newData: { day: number; balance: number }[];
  impactDesc: string;
}> = {
  default: {
    tabs: ["subscriptions"],
    stepsTaken: [
      "Pick one main tool that's most beneficial, pause the others, and redirect that money into something that moves the business forward.",
    ],
    stepsSkipped: [
      "Slow down hiring, trim hours where possible, and make sure future payroll increases are tied to revenue growth.",
    ],
    redirectChosen: "Add the monthly savings directly into an emergency-like reserve.",
    currentData: [
      { day: 0, balance: 52000 }, { day: 1, balance: 51500 }, { day: 2, balance: 50000 },
      { day: 3, balance: 48000 }, { day: 4, balance: 46500 }, { day: 5, balance: 45200 },
      { day: 6, balance: 44800 }, { day: 7, balance: 45500 }, { day: 8, balance: 47000 },
      { day: 9, balance: 48200 }, { day: 10, balance: 47500 }, { day: 11, balance: 46000 },
      { day: 12, balance: 44500 }, { day: 13, balance: 43200 }, { day: 14, balance: 42500 },
    ],
    newData: [
      { day: 0, balance: 52000 }, { day: 1, balance: 51800 }, { day: 2, balance: 51000 },
      { day: 3, balance: 49200 }, { day: 4, balance: 48000 }, { day: 5, balance: 47100 },
      { day: 6, balance: 46700 }, { day: 7, balance: 47400 }, { day: 8, balance: 48700 },
      { day: 9, balance: 49800 }, { day: 10, balance: 49200 }, { day: 11, balance: 47800 },
      { day: 12, balance: 46200 }, { day: 13, balance: 45000 }, { day: 14, balance: 43200 },
    ],
    impactDesc: "Keeping $100/month in reserve raises your projected lowest cash balance over the next 14 days by about $70, moving you further toward your target buffer.",
  }
};

export const CaseDetailScreen: React.FC<Props> = ({ caseData, onNavigate }) => {
  const detail = CASE_DETAILS[caseData.id] ?? CASE_DETAILS["default"];
  const [activeTab, setActiveTab] = useState(detail.tabs[0]);

  return (
    <div className="cd">
      <button className="back-link" onClick={() => onNavigate("archived")}>
        <BackIcon /> Back to Archived Cases
      </button>

      <h1 className="cd__title">Case Summary</h1>
      <p className="cd__date">{caseData.label}</p>

      {/* Tabs */}
      {detail.tabs.length > 1 && (
        <div className="cd__tabs">
          {detail.tabs.map(t => (
            <button
              key={t}
              className={`cd__tab${activeTab === t ? " cd__tab--active" : ""}`}
              onClick={() => setActiveTab(t)}
            >
              {TAB_LABELS[t] ?? t}
            </button>
          ))}
        </div>
      )}

      {/* Summary agent message */}
      <div className="cd__agent">
        <PulseAvatar />
        <p className="cd__agent-text">Here's a summary of what happened in this case.</p>
      </div>

      {/* Steps taken */}
      <div className="card cd__card">
        <div className="section-title cd__card-title">SUGGESTED NEXT STEPS</div>
        {detail.stepsTaken.map((s, i) => (
          <div key={i} className="cd__step-row">
            <span className="cd__step-text">{s}</span>
            <div className="cd__step-check cd__step-check--checked"><CheckIcon /></div>
          </div>
        ))}
        {detail.stepsSkipped.map((s, i) => (
          <div key={i} className="cd__step-row">
            <span className="cd__step-text">{s}</span>
            <div className="cd__step-check" />
          </div>
        ))}
      </div>

      {/* Subscription ranking recap */}
      <div className="cd__agent">
        <PulseAvatar />
        <div className="cd__agent-text">
          <p>I've ranked the subscriptions based on cost, repetition and overlap with other tools, and finally by how little value we see in your QuickBooks data.</p>
          <p><strong>I recommend you keep Asana as your main tool and pause the others.</strong></p>
        </div>
      </div>

      <div className="card cd__ranking-card">
        <div className="section-title cd__card-title">SUBSCRIPTION PRIORITY RANKING</div>
        {["Asana", "Clickup", "Notion", "Mailchimp", "iStock"].map((name, i) => (
          <div
            key={name}
            className={`cd__ranking-row${i === 0 ? " cd__ranking-row--keep" : " cd__ranking-row--pause"}`}
          >
            {name}
          </div>
        ))}
      </div>

      {/* Cash redirect recap */}
      <div className="cd__agent">
        <PulseAvatar />
        <div className="cd__agent-text">
          <p>Here are some suggestions for how you can redirect the money you save.</p>
          <p><strong>Click on one or multiple to see how that would affect your projected lowest cash balance over the next 14 days.</strong></p>
        </div>
      </div>

      <div className="card cd__redirect-card">
        <div className="section-title cd__card-title">SUGGESTED CASH REDIRECTS</div>
        {[
          "Add the monthly savings directly into an emergency-like reserve.",
          "Redirect the money into the best-performing ad or content channels (e.g., paid search, targeted social ads, content creation) to accelerate sign-ups or sales.",
          "Use the savings to buy or build one productive tool (e.g., an automation that reduces manual work) that compounds savings over time, even if it costs something upfront.",
        ].map((text, i) => (
          <div key={i} className="cd__redirect-row">
            <span className="cd__redirect-text">{text}</span>
            <div className={`cd__redirect-check${i === 0 ? " cd__redirect-check--checked" : ""}`}>
              {i === 0 && <CheckIcon />}
            </div>
          </div>
        ))}
      </div>

      {/* Impact charts */}
      <div className="cd__agent">
        <PulseAvatar />
        <div className="cd__agent-text">
          <p>I see you've chosen to "{detail.redirectChosen}"</p>
          <p><strong>I've outlined how this move would benefit your projected lowest cash balance over the next 14 days.</strong></p>
        </div>
      </div>

      <div className="card cd__impact-card">
        <div className="section-title cd__card-title">HOW WOULD THIS IMPACT CASH FLOW?</div>
        <div className="cd__charts">
          <div className="cd__chart-col">
            <div className="cd__chart-wrap">
              <CashFlowChart data={detail.currentData} targetMinimumBuffer={40000} safeZoneThreshold={48000} />
            </div>
            <p className="cd__chart-label">Current projected lowest cash balance</p>
          </div>
          <div className="cd__chart-col">
            <div className="cd__chart-wrap">
              <CashFlowChart data={detail.newData} targetMinimumBuffer={40000} safeZoneThreshold={48000} />
            </div>
            <p className="cd__chart-label">New projected lowest cash balance</p>
          </div>
        </div>
        <p className="cd__impact-desc">{detail.impactDesc}</p>
      </div>

      <p className="cd__disclaimer">*Pulse is AI and can make mistakes. Important information should always be checked before proceeding.*</p>
    </div>
  );
};

const BackIcon = () => (
  <svg width="16" height="16" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path d="M19 12H5M12 19l-7-7 7-7" />
  </svg>
);
const CheckIcon = () => (
  <svg width="12" height="12" fill="none" stroke="white" strokeWidth="2.5" viewBox="0 0 24 24">
    <polyline points="20 6 9 17 4 12" />
  </svg>
);