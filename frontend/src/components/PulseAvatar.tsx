import React from "react";

interface Props {
  size?: number;
}

export const PulseAvatar: React.FC<Props> = ({ size = 40 }) => (
  <img
    src="/pulse-logo.png"
    alt="Pulse"
    style={{
      width: size,
      height: size,
      borderRadius: "50%",
      objectFit: "cover",
      flexShrink: 0,
    }}
  />
);