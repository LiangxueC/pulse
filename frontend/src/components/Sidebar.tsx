import React from "react";
import "./Sidebar.css";

export const Sidebar: React.FC = () => (
  <aside className="sidebar">
    <div className="sidebar__logo">QB</div>

    <SidebarItem label="Create" icon={<PlusIcon />} />
    <SidebarItem label="Marks" icon={<BookmarkIcon />} />
    <SidebarItem label="Dashboard" icon={<GridIcon />} active />
    <SidebarItem label="Feed" icon={<ZapIcon />} />
    <SidebarItem label="Reports" icon={<ChartIcon />} />
    <SidebarItem label="My apps" icon={<AppsIcon />} />

    <div className="sidebar__divider" />
    <span className="sidebar__pin-label">PINNED</span>

    <div className="sidebar__pin-icon" style={{ background: "#6366F1" }} />
    <div className="sidebar__pin-icon" style={{ background: "#2CA01C" }} />

    <div className="sidebar__divider" />
    <SidebarItem label="More" icon={<DotsIcon />} />
    <SidebarItem label="Customize" icon={<EditIcon />} />
  </aside>
);

interface ItemProps {
  label: string;
  icon: React.ReactNode;
  active?: boolean;
}
const SidebarItem: React.FC<ItemProps> = ({ label, icon, active }) => (
  <div className={`sidebar__item${active ? " sidebar__item--active" : ""}`}>
    {icon}
    <span>{label}</span>
  </div>
);

// ── Icons ──
const PlusIcon = () => (
  <svg width="18" height="18" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <circle cx="12" cy="12" r="10" /><path d="M12 8v8M8 12h8" />
  </svg>
);
const BookmarkIcon = () => (
  <svg width="18" height="18" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path d="M19 21l-7-5-7 5V5a2 2 0 012-2h10a2 2 0 012 2z" />
  </svg>
);
const GridIcon = () => (
  <svg width="18" height="18" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <rect x="3" y="3" width="7" height="7" /><rect x="14" y="3" width="7" height="7" />
    <rect x="14" y="14" width="7" height="7" /><rect x="3" y="14" width="7" height="7" />
  </svg>
);
const ZapIcon = () => (
  <svg width="18" height="18" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path d="M13 2L3 14h9l-1 8 10-12h-9l1-8z" />
  </svg>
);
const ChartIcon = () => (
  <svg width="18" height="18" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <polyline points="22 12 18 12 15 21 9 3 6 12 2 12" />
  </svg>
);
const AppsIcon = () => (
  <svg width="18" height="18" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <rect x="2" y="2" width="9" height="9" rx="1" /><rect x="13" y="2" width="9" height="9" rx="1" />
    <rect x="2" y="13" width="9" height="9" rx="1" /><rect x="13" y="13" width="9" height="9" rx="1" />
  </svg>
);
const DotsIcon = () => (
  <svg width="18" height="18" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <circle cx="5" cy="12" r="1" /><circle cx="12" cy="12" r="1" /><circle cx="19" cy="12" r="1" />
  </svg>
);
const EditIcon = () => (
  <svg width="18" height="18" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path d="M12 20h9M16.5 3.5a2.121 2.121 0 013 3L7 19l-4 1 1-4L16.5 3.5z" />
  </svg>
);