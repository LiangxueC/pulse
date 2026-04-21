import React from "react";
import "./ErrorCard.css";

interface ErrorCardProps {
  message?: string;
  onRetry?: () => void;
}

export const ErrorCard: React.FC<ErrorCardProps> = ({
  message = "Something went wrong. Please try again.",
  onRetry,
}) => (
  <div className="error-card">
    <div className="error-card__icon">
      <AlertIcon />
    </div>
    <div className="error-card__content">
      <p className="error-card__message">{message}</p>
      {onRetry && (
        <button className="error-card__retry" onClick={onRetry}>
          Try again
        </button>
      )}
    </div>
  </div>
);

// Inline version for inside cards
export const InlineError: React.FC<{ message?: string }> = ({
  message = "Failed to load.",
}) => (
  <div className="inline-error">
    <AlertIcon />
    <span>{message}</span>
  </div>
);

// Empty state component
interface EmptyStateProps {
  icon?: React.ReactNode;
  title: string;
  subtitle?: string;
  action?: { label: string; onClick: () => void };
}

export const EmptyState: React.FC<EmptyStateProps> = ({
  icon,
  title,
  subtitle,
  action,
}) => (
  <div className="empty-state">
    <div className="empty-state__icon">
      {icon ?? <EmptyIcon />}
    </div>
    <p className="empty-state__title">{title}</p>
    {subtitle && <p className="empty-state__subtitle">{subtitle}</p>}
    {action && (
      <button className="empty-state__action" onClick={action.onClick}>
        {action.label}
      </button>
    )}
  </div>
);

const AlertIcon = () => (
  <svg width="20" height="20" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <circle cx="12" cy="12" r="10" />
    <line x1="12" y1="8" x2="12" y2="12" />
    <line x1="12" y1="16" x2="12.01" y2="16" />
  </svg>
);

const EmptyIcon = () => (
  <svg width="32" height="32" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <circle cx="12" cy="12" r="10" />
    <path d="M8 12h8M12 8v8" opacity="0.3" />
  </svg>
);