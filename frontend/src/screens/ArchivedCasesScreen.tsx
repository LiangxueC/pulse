import React, { useEffect, useState, useCallback } from "react";
import type { Screen, ArchivedCase } from "../types";
import { fetchArchivedCases, deleteCase, deleteCases } from "../data/api";
import { GenericSkeleton } from "../components/LoadingSkeleton";
import { ErrorCard, EmptyState } from "../components/ErrorCard";
import { CaseDetailScreen } from "./CaseDetailScreen";
import "./ArchivedCasesScreen.css";

interface Props { onNavigate: (s: Screen) => void; }

export const ArchivedCasesScreen: React.FC<Props> = ({ onNavigate }) => {
  const [cases, setCases] = useState<ArchivedCase[]>([]);
  const [selected, setSelected] = useState<Set<string>>(new Set());
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [selectedCase, setSelectedCase] = useState<ArchivedCase | null>(null);

  const load = useCallback(async (q = "") => {
    setLoading(true);
    setError("");
    try {
      const { items } = await fetchArchivedCases(q);
      setCases(items);
    } catch {
      setError("Failed to load archived cases. Please try again.");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { load(); }, [load]);

  useEffect(() => {
    const t = setTimeout(() => load(search), 300);
    return () => clearTimeout(t);
  }, [search, load]);

  // ── If a case is selected, show the detail screen ──
  if (selectedCase) {
    return (
      <CaseDetailScreen
        caseData={selectedCase}
        onNavigate={(s) => {
          if (s === "archived") {
            setSelectedCase(null);
          } else {
            onNavigate(s);
          }
        }}
      />
    );
  }

  const toggleSelect = (id: string) => {
    setSelected((prev) => {
      const next = new Set(prev);
      next.has(id) ? next.delete(id) : next.add(id);
      return next;
    });
  };

  const allSelected = cases.length > 0 && selected.size === cases.length;
  const toggleAll = () =>
    setSelected(allSelected ? new Set() : new Set(cases.map((c) => c.id)));

  const handleDeleteSingle = async (id: string) => {
    try {
      await deleteCase(id);
      setCases((prev) => prev.filter((c) => c.id !== id));
      setSelected((prev) => {
        const n = new Set(prev);
        n.delete(id);
        return n;
      });
    } catch {
      setError("Failed to delete case. Please try again.");
    }
  };

  const handleDeleteSelected = async () => {
    try {
      await deleteCases(Array.from(selected));
      setCases((prev) => prev.filter((c) => !selected.has(c.id)));
      setSelected(new Set());
    } catch {
      setError("Failed to delete selected cases. Please try again.");
    }
  };

  return (
    <div className="arch">
      <button className="back-link" onClick={() => onNavigate("dashboard")}>
        <BackIcon /> Back to Dashboard
      </button>

      <h1 className="arch__title">Archived Cases</h1>

      {/* Search */}
      <div className="arch__search">
        <SearchIcon />
        <input
          className="arch__search-input"
          placeholder="Search"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />
        {search && (
          <button
            className="arch__search-clear"
            onClick={() => setSearch("")}
          >
            ✕
          </button>
        )}
      </div>

      {/* Error */}
      {error && (
        <ErrorCard message={error} onRetry={() => load(search)} />
      )}

      {!error && (
        <>
          {/* Select all row — only show when there are cases */}
          {cases.length > 0 && !loading && (
            <div className="arch__select-row">
              <label className="arch__select-all">
                <input
                  type="checkbox"
                  checked={allSelected}
                  onChange={toggleAll}
                  className="arch__checkbox"
                />
                Select all
              </label>
              {selected.size > 0 && (
                <div className="arch__bulk-actions">
                  <span className="arch__selected-count">
                    {selected.size} selected
                  </span>
                  <button
                    className="arch__delete-btn"
                    onClick={handleDeleteSelected}
                    aria-label="Delete selected"
                  >
                    <TrashIcon />
                  </button>
                </div>
              )}
            </div>
          )}

          {/* Content */}
          {loading ? (
            <GenericSkeleton />
          ) : cases.length === 0 ? (
            <EmptyState
              title={search ? "No cases match your search" : "No archived cases yet"}
              subtitle={
                search
                  ? "Try a different search term."
                  : "Completed cases will appear here after you close them."
              }
              action={
                search
                  ? { label: "Clear search", onClick: () => setSearch("") }
                  : undefined
              }
            />
          ) : (
            <div className="arch__list">
              {cases.map((c) => (
                <div key={c.id} className="arch__item">
                  {/* Checkbox — stops propagation so it doesn't open the case */}
                  <div
                    className={`arch__item-check${
                      selected.has(c.id) ? " arch__item-check--checked" : ""
                    }`}
                    onClick={(e) => {
                      e.stopPropagation();
                      toggleSelect(c.id);
                    }}
                  >
                    {selected.has(c.id) && <CheckIcon />}
                  </div>

                  {/* Label — click to open case detail */}
                  <span
                    className="arch__item-label arch__item-label--clickable"
                    onClick={() => setSelectedCase(c)}
                  >
                    {c.label}
                  </span>

                  {/* Delete button */}
                  <button
                    className="arch__item-del"
                    aria-label="Delete"
                    onClick={(e) => {
                      e.stopPropagation();
                      handleDeleteSingle(c.id);
                    }}
                  >
                    <TrashIcon />
                  </button>
                </div>
              ))}
            </div>
          )}
        </>
      )}
    </div>
  );
};

// ── Icons ──
const BackIcon = () => (
  <svg width="16" height="16" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path d="M19 12H5M12 19l-7-7 7-7" />
  </svg>
);
const SearchIcon = () => (
  <svg width="16" height="16" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <circle cx="11" cy="11" r="8" />
    <path d="M21 21l-4.35-4.35" />
  </svg>
);
const TrashIcon = () => (
  <svg width="16" height="16" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <polyline points="3 6 5 6 21 6" />
    <path d="M19 6v14a2 2 0 01-2 2H7a2 2 0 01-2-2V6m3 0V4a1 1 0 011-1h4a1 1 0 011 1v2" />
  </svg>
);
const CheckIcon = () => (
  <svg width="12" height="12" fill="none" stroke="white" strokeWidth="2.5" viewBox="0 0 24 24">
    <polyline points="20 6 9 17 4 12" />
  </svg>
);