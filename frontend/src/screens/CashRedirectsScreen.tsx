import React, { useEffect, useState } from "react";
import type { Screen, CashRedirect } from "../types";
import { fetchCashRedirects } from "../data/api";
import { GenericSkeleton } from "../components/LoadingSkeleton";
import { ErrorCard } from "../components/ErrorCard";
import "./CashRedirectsScreen.css";

interface Props {
  onNavigate: (s: Screen) => void;
  onRedirectSelected: (id: string) => void;
}

export const CashRedirectsScreen: React.FC<Props> = ({
  onNavigate,
  onRedirectSelected,
}) => {
  const [redirects, setRedirects] = useState<CashRedirect[]>([]);
  const [selected, setSelected] = useState<Set<string>>(new Set());
  const [hideBalance, setHideBalance] = useState(true);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const load = () => {
    setLoading(true);
    setError("");
    fetchCashRedirects()
      .then((r) => setRedirects(r.redirects))
      .catch(() => setError("Failed to load redirect options. Please try again."))
      .finally(() => setLoading(false));
  };

  useEffect(() => { load(); }, []);

  const toggleSelect = (id: string) => {
    setSelected((prev) => {
      const next = new Set(prev);
      next.has(id) ? next.delete(id) : next.add(id);
      return next;
    });
  };

  const handleNext = () => {
    if (selected.size === 0) return;
    const firstId = Array.from(selected)[0];
    onRedirectSelected(firstId);
    onNavigate("redirectImpact");
  };

  if (loading) return <GenericSkeleton />;
  if (error) return <ErrorCard message={error} onRetry={load} />;

  return (
    <div className="cr">
      {/* Toggle */}
      <div className="cr__toggle-row">
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

      {/* Pulse agent */}
      <div className="cr__agent">
        <div className="cr__agent-dot" />
        <div className="cr__agent-text">
          <p>Here are some suggestions for how you can redirect the money you save.</p>
          <p>
            <strong>
              Click on one or multiple to see how that would affect your
              projected lowest cash balance over the next 14 days.
            </strong>
          </p>
        </div>
      </div>

      {/* Options */}
      <div className="card cr__card">
        <div className="section-title cr__card-title">SUGGESTED CASH REDIRECTS</div>
        {redirects.map((r) => (
          <div
            key={r.id}
            className="cr__item"
            onClick={() => toggleSelect(r.id)}
          >
            <span className="cr__item-text">{r.text}</span>
            <div
              className={`cr__checkbox${
                selected.has(r.id) ? " cr__checkbox--checked" : ""
              }`}
            >
              {selected.has(r.id) && <CheckIcon />}
            </div>
          </div>
        ))}
      </div>

      {/* Nav */}
      <div className="cr__action-row">
        <button
          className="back-link"
          onClick={() => onNavigate("takeAction")}
        >
          <BackIcon /> Back
        </button>
        <button
          className={`btn cr__next-btn${
            selected.size > 0 ? " cr__next-btn--active" : ""
          }`}
          onClick={handleNext}
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
const CheckIcon = () => (
  <svg width="12" height="12" fill="none" stroke="white" strokeWidth="2.5" viewBox="0 0 24 24">
    <polyline points="20 6 9 17 4 12" />
  </svg>
);