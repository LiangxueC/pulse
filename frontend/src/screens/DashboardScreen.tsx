import React, { useEffect, useState, useCallback } from "react";
import type { Screen, DashboardResponse } from "../types";
import { fetchDashboard, sendReminders, payAllBills } from "../data/api";
import { DashboardSkeleton } from "../components/LoadingSkeleton";
import { ErrorCard, EmptyState } from "../components/ErrorCard";
import "./DashboardScreen.css";
import { PulseAvatar } from "../components/PulseAvatar";

interface Props {
  onNavigate: (s: Screen) => void;
  completedCategories?: string[];
}

export const DashboardScreen: React.FC<Props> = ({
  onNavigate,
  completedCategories = [],
}) => {
  const [data, setData] = useState<DashboardResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [toast, setToast] = useState("");
  const [expanded, setExpanded] = useState(false);

  const load = useCallback(() => {
    setLoading(true);
    setError("");
    fetchDashboard(completedCategories)
      .then(setData)
      .catch(() => setError("Failed to load dashboard data. Is the backend running?"))
      .finally(() => setLoading(false));
  }, [completedCategories.join(",")]);

  useEffect(() => { load(); }, [load]);

  const showToast = (msg: string) => {
    setToast(msg);
    setTimeout(() => setToast(""), 3500);
  };

  if (loading) return <DashboardSkeleton />;
  if (error) return <ErrorCard message={error} onRetry={load} />;
  if (!data) return null;

  const { company, cashFlow, outstandingInvoices, upcomingBills } = data;

  // Health bar: green=100%, yellow=40%, red=10%
  const healthPct = cashFlow.status === "green" ? 60
    : cashFlow.status === "yellow" ? 40 : 10;
  const healthColor = cashFlow.status === "green" ? "#2CA01C"
    : cashFlow.status === "yellow" ? "#F4B000" : "#DC2626";

  return (
    <div className="dashboard">
      <h1 className="dashboard__greeting">Good afternoon, {company.user}!</h1>

      {/* Create Actions */}
      <div className="dashboard__create-bar">
        <span className="dashboard__create-label">Create actions</span>
        <button className="create-btn">Get paid online</button>
        <button className="create-btn">Create invoice</button>
        <button className="create-btn">Record expense</button>
        <button className="create-btn create-btn--primary">Add bank deposit</button>
        <button className="create-btn">Create check</button>
        <a href="#" className="dashboard__show-all">Show all</a>
      </div>

      {/* Pulse Banner */}
      <div className="pulse-banner">
        <div className="pulse-banner__header" onClick={() => setExpanded(e => !e)}>
          <div className="pulse-banner__left">
            <PulseAvatar size={40} />
            <div>
              <div className="pulse-banner__title">Your cash flow assistant Pulse</div>
              <div className="pulse-banner__subtitle">
                See Pulse's analysis of your cash flow situation and how you can resolve any issues Pluse noticed. 
              </div>
            </div>
          </div>
          <button className="pulse-banner__toggle">
            {expanded ? "Hide analysis" : "See analysis"}
            <ChevronIcon open={expanded} />
          </button>
        </div>

        {expanded && (
          <div className="pulse-banner__body">
            <div className="pulse-banner__pin-row">
              <span />
              <button className="pulse-banner__pin">
                <PinIcon /> Pin to dashboard
              </button>
            </div>

            {/* Three panels */}
            <div className="pulse-banner__panels">
              {/* Cash Balance Panel */}
              <div className="pulse-panel">
                <div className="pulse-panel__label">
                  Projected lowest cash balance (30 days)
                </div>
                <div className="pulse-panel__amount">
                  {cashFlow.projectedLowestBalance.toLocaleString("en-US", {
                    minimumFractionDigits: 2,
                  })}
                </div>

                {/* Health bar */}
                <div className="health-bar-wrap">
                  <div className="health-bar-track">
                    <div
                      className="health-bar-fill"
                      style={{ width: `${healthPct}%`, background: healthColor }}
                    />
                  </div>
                  <span className="health-bar-pct">{healthPct}%</span>
                </div>
                <div className="health-bar-status">
                  <strong>Status:</strong> {cashFlow.statusLabel}
                </div>

                <div className="pulse-panel__actions">
                  <button
                    className="pulse-panel__view-btn"
                    onClick={() => onNavigate("detail")}
                  >
                    View status
                  </button>
                  <button
                    className="pulse-panel__archive-btn"
                    onClick={() => onNavigate("archived")}
                  >
                    <ArchiveIcon /> Archived Cases <ArrowRight />
                  </button>
                </div>
              </div>

              {/* Outstanding Invoices Panel */}
              <div className="pulse-panel pulse-panel--border">
                <div className="pulse-panel__section-title">Outstanding Invoices</div>
                <div className="pulse-panel__meta">
                  Next 30 days &nbsp;
                  <span className="pulse-panel__meta-btn">Group by date ▾</span>
                </div>

                {outstandingInvoices.items.length === 0 ? (
                  <EmptyState title="No overdue invoices" subtitle="All caught up!" />
                ) : (
                  <>
                    {outstandingInvoices.items.map((inv) => (
                      <div key={inv.id} className="invoice-row">
                        <div className="invoice-row__avatar" />
                        <div className="invoice-row__info">
                          <div className="invoice-row__name">{inv.company}</div>
                          <div className="invoice-row__due invoice-row__due--overdue">
                            {inv.daysOverdue} day{inv.daysOverdue !== 1 ? "s" : ""} overdue
                          </div>
                        </div>
                        <div className="invoice-row__amount">
                          {inv.amount.toLocaleString("en-US", { minimumFractionDigits: 2 })}
                        </div>
                      </div>
                    ))}
                    <div className="pulse-panel__total">
                      <span>Total overdue:</span>
                      <span>{outstandingInvoices.totalOverdue.toLocaleString("en-US", { minimumFractionDigits: 2 })}</span>
                    </div>
                    <div className="pulse-panel__btns">
                      <button className="btn btn--outline pulse-panel__btn-sm">Select companies</button>
                      <button
                        className="btn pulse-panel__remind-btn"
                        onClick={async () => {
                          try {
                            const res = await sendReminders();
                            showToast(res.message);
                          } catch {
                            showToast("Failed to send reminders.");
                          }
                        }}
                      >
                        Remind all
                      </button>
                    </div>
                  </>
                )}
              </div>

              {/* Upcoming Bills Panel */}
              <div className="pulse-panel pulse-panel--border">
                <div className="pulse-panel__section-title">Upcoming Bills</div>
                <div className="pulse-panel__meta">
                  Next 30 days &nbsp;
                  <span className="pulse-panel__meta-btn">Group by date ▾</span>
                </div>

                {upcomingBills.items.length === 0 ? (
                  <EmptyState title="No upcoming bills" subtitle="Nothing due soon." />
                ) : (
                  <>
                    {upcomingBills.items.map((bill) => (
                      <div key={bill.id} className="invoice-row">
                        <div className="invoice-row__info">
                          <div className="invoice-row__name">{bill.name}</div>
                          <div className="invoice-row__due">{bill.dueDateLabel}</div>
                        </div>
                        <div className="invoice-row__amount">
                          {bill.amount.toLocaleString("en-US", { minimumFractionDigits: 2 })}
                        </div>
                      </div>
                    ))}
                    <div className="pulse-panel__total">
                      <span>Total Due:</span>
                      <span>{upcomingBills.totalDue.toLocaleString("en-US", { minimumFractionDigits: 2 })}</span>
                    </div>
                    <div className="pulse-panel__btns">
                      <button className="btn btn--outline pulse-panel__btn-sm">Select bills</button>
                      <button
                        className="btn pulse-panel__pay-btn"
                        onClick={async () => {
                          try {
                            const res = await payAllBills();
                            showToast(res.message);
                          } catch {
                            showToast("Failed to schedule payments.");
                          }
                        }}
                      >
                        Pay all
                      </button>
                    </div>
                  </>
                )}
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Business at a glance */}
      <div className="dashboard__glance-header">
        <span>Business at a glance</span>
      </div>

      {toast && <div className="dash-toast">{toast}</div>}
    </div>
  );
};

// ── Icons ──
const ChevronIcon: React.FC<{ open: boolean }> = ({ open }) => (
  <svg width="16" height="16" fill="none" stroke="currentColor" viewBox="0 0 24 24"
    style={{ transform: open ? "rotate(180deg)" : "none", transition: "transform 0.2s" }}>
    <polyline points="6 9 12 15 18 9" />
  </svg>
);
const PinIcon = () => (
  <svg width="14" height="14" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0118 0z" />
    <circle cx="12" cy="10" r="3" />
  </svg>
);
const ArchiveIcon = () => (
  <svg width="14" height="14" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <polyline points="21 8 21 21 3 21 3 8" />
    <rect x="1" y="3" width="22" height="5" />
    <line x1="10" y1="12" x2="14" y2="12" />
  </svg>
);
const ArrowRight = () => (
  <svg width="14" height="14" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path d="M5 12h14M12 5l7 7-7 7" />
  </svg>
);