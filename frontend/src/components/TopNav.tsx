import React from "react";
import "./TopNav.css";

interface TopNavProps {
  companyName?: string;
}

export const TopNav: React.FC<TopNavProps> = ({
  companyName = "Sample Company-7-8-25",
}) => (
  <nav className="topnav">
    <div className="topnav__brand">
      <span className="topnav__brand-name">INTUIT quickbooks</span>
      <span className="topnav__divider">|</span>
      <span className="topnav__company">{companyName}</span>
    </div>
    <div className="topnav__search">
      <SearchIcon />
      <span>Search for transactions, contacts, reports, help and more</span>
    </div>
    <div className="topnav__actions">
      <a href="#" className="topnav__contact">Contact experts</a>
      <button className="topnav__icon-btn"><BellIcon /></button>
      <button className="topnav__icon-btn"><SettingsIcon /></button>
      <button className="topnav__icon-btn"><HelpIcon /></button>
      <div className="topnav__avatar">T</div>
    </div>
  </nav>
);

const TABS = [
  { label: "Accounting", color: "#6366F1" },
  { label: "Expenses & Pay Bills", color: "#2CA01C" },
  { label: "Sales & Get Paid", color: "#F59E0B" },
  { label: "Customers", color: "#0EA5E9" },
  { label: "Team", color: "#8B5CF6" },
  { label: "Time", color: "#06B6D4" },
  { label: "Projects", color: "#3B82F6" },
  { label: "Inventory", color: "#6366F1" },
];

export const TabNav: React.FC = () => (
  <div className="tabnav">
    {TABS.map((t, i) => (
      <div key={t.label} className={`tabnav__item${i === 0 ? " tabnav__item--active" : ""}`}>
        <div className="tabnav__dot" style={{ background: t.color }} />
        {t.label}
      </div>
    ))}
  </div>
);

interface BannerProps {
  onClose: () => void;
}
export const SubscribeBanner: React.FC<BannerProps> = ({ onClose }) => (
  <div className="sub-banner">
    Buy now and save 90% for 3 months
    <button className="sub-banner__btn">Subscribe now</button>
    <button className="sub-banner__close" onClick={onClose}>✕</button>
  </div>
);

const SearchIcon = () => (
  <svg width="14" height="14" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <circle cx="11" cy="11" r="8" /><path d="M21 21l-4.35-4.35" />
  </svg>
);
const BellIcon = () => (
  <svg width="18" height="18" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path d="M15 17H20L18.595 15.595A1.026 1.026 0 0118.3 15V11C18.3 8.003 16.4 5.4 13.5 4.6V4a1.5 1.5 0 00-3 0v.6C7.6 5.4 5.7 8.003 5.7 11v4a1.026 1.026 0 01-.295.595L4 17H9M15 17v1a3 3 0 01-6 0v-1M15 17H9" />
  </svg>
);
const SettingsIcon = () => (
  <svg width="18" height="18" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <circle cx="12" cy="12" r="3" />
    <path d="M19.4 15a1.65 1.65 0 00.33 1.82l.06.06a2 2 0 010 2.83 2 2 0 01-2.83 0l-.06-.06a1.65 1.65 0 00-1.82-.33 1.65 1.65 0 00-1 1.51V21a2 2 0 01-4 0v-.09A1.65 1.65 0 009 19.4a1.65 1.65 0 00-1.82.33l-.06.06a2 2 0 01-2.83-2.83l.06-.06A1.65 1.65 0 004.68 15a1.65 1.65 0 00-1.51-1H3a2 2 0 010-4h.09A1.65 1.65 0 004.6 9a1.65 1.65 0 00-.33-1.82l-.06-.06a2 2 0 012.83-2.83l.06.06A1.65 1.65 0 009 4.68a1.65 1.65 0 001-1.51V3a2 2 0 014 0v.09a1.65 1.65 0 001 1.51 1.65 1.65 0 001.82-.33l.06-.06a2 2 0 012.83 2.83l-.06.06A1.65 1.65 0 0019.4 9a1.65 1.65 0 001.51 1H21a2 2 0 010 4h-.09a1.65 1.65 0 00-1.51 1z" />
  </svg>
);
const HelpIcon = () => (
  <svg width="18" height="18" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <circle cx="12" cy="12" r="10" />
    <path d="M9.09 9a3 3 0 015.83 1c0 2-3 3-3 3M12 17h.01" />
  </svg>
);