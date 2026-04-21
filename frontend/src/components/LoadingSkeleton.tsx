import React from "react";
import "./LoadingSkeleton.css";

interface SkeletonProps {
  width?: string;
  height?: string;
  borderRadius?: string;
  style?: React.CSSProperties;
}

export const Skeleton: React.FC<SkeletonProps> = ({
  width = "100%",
  height = "16px",
  borderRadius = "4px",
  style,
}) => (
  <div
    className="skeleton"
    style={{ width, height, borderRadius, ...style }}
  />
);

// Pre-built skeleton layouts for each screen
export const DashboardSkeleton: React.FC = () => (
  <div className="skeleton-dashboard">
    <Skeleton width="300px" height="32px" style={{ margin: "0 auto 24px" }} />
    <div className="skeleton-create-bar">
      {[1,2,3,4].map(i => <Skeleton key={i} width="120px" height="34px" borderRadius="20px" />)}
    </div>
    <div className="skeleton-three-col">
      {[1,2,3].map(i => (
        <div key={i} className="skeleton-card">
          <Skeleton width="60%" height="12px" style={{ marginBottom: 16 }} />
          <Skeleton width="50%" height="40px" style={{ marginBottom: 16 }} />
          <Skeleton height="50px" borderRadius="8px" style={{ marginBottom: 12 }} />
          {[1,2,3].map(j => (
            <div key={j} className="skeleton-row">
              <Skeleton width="32px" height="32px" borderRadius="50%" />
              <div style={{ flex: 1 }}>
                <Skeleton width="60%" height="12px" style={{ marginBottom: 6 }} />
                <Skeleton width="40%" height="10px" />
              </div>
              <Skeleton width="60px" height="12px" />
            </div>
          ))}
        </div>
      ))}
    </div>
  </div>
);

export const DetailSkeleton: React.FC = () => (
  <div className="skeleton-detail">
    <Skeleton width="140px" height="16px" style={{ marginBottom: 20 }} />
    <div className="skeleton-two-col">
      <div className="skeleton-card">
        <Skeleton width="70%" height="14px" style={{ marginBottom: 16 }} />
        <Skeleton width="50%" height="44px" style={{ marginBottom: 16 }} />
        <Skeleton height="52px" borderRadius="8px" />
      </div>
      <div className="skeleton-card">
        <Skeleton width="80%" height="12px" style={{ marginBottom: 16 }} />
        <Skeleton height="200px" borderRadius="6px" />
      </div>
    </div>
    <div className="skeleton-two-col">
      <div className="skeleton-card">
        <Skeleton width="40%" height="12px" style={{ marginBottom: 16 }} />
        {[1,2,3].map(i => (
          <div key={i} className="skeleton-row" style={{ paddingBottom: 12 }}>
            <Skeleton height="14px" style={{ flex: 1 }} />
            <Skeleton width="80px" height="24px" borderRadius="20px" />
          </div>
        ))}
      </div>
      <div className="skeleton-card">
        <Skeleton width="50%" height="12px" style={{ marginBottom: 16 }} />
        {[1,2].map(i => (
          <div key={i} className="skeleton-row" style={{ paddingBottom: 12 }}>
            <Skeleton height="14px" style={{ flex: 1 }} />
            <Skeleton width="24px" height="24px" borderRadius="50%" />
          </div>
        ))}
        <Skeleton height="44px" borderRadius="8px" style={{ marginTop: 12 }} />
      </div>
    </div>
  </div>
);

export const GenericSkeleton: React.FC = () => (
  <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
    <Skeleton width="140px" height="16px" />
    <div className="skeleton-card">
      <Skeleton width="60%" height="20px" style={{ marginBottom: 16 }} />
      {[1,2,3].map(i => (
        <div key={i} className="skeleton-row" style={{ paddingBottom: 12 }}>
          <Skeleton height="14px" style={{ flex: 1 }} />
          <Skeleton width="80px" height="14px" />
        </div>
      ))}
    </div>
    <div className="skeleton-card">
      <Skeleton width="80%" height="14px" style={{ marginBottom: 12 }} />
      <Skeleton width="90%" height="14px" style={{ marginBottom: 12 }} />
      <Skeleton width="70%" height="14px" />
    </div>
  </div>
);