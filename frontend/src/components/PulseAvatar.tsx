import React from "react";
import pulseLogo from "../assets/pulse-logo.png";

interface Props {
  size?: number;
}

export const PulseAvatar: React.FC<Props> = ({ size = 40 }) => (
  <div
    style={{
      width: size,
      height: size,
      borderRadius: "50%",
      background: "linear-gradient(135deg, #2CA01C, #1a7a10)",
      display: "flex",
      alignItems: "center",
      justifyContent: "center",
      flexShrink: 0,
    }}
  >
    <img
      src={pulseLogo}
      alt="Pulse"
      style={{
        width: size * 1.1,
        height: size * 1.1,
        objectFit: "contain",
      }}
    />
  </div>
);