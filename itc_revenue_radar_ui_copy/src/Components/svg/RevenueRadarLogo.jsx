import React, { useId } from "react";

const RevenueRadarLogo = ({
  theme = "dark",
  width = 260,
  height = 90,
  className = "",
  showTagline = true,
  animated = true,
}) => {
  const isDark = theme === "dark";
  const uid = useId();

  const gradId = `rr-bars-${uid}`;
  const lineClass = animated ? "rr-logo-line animated" : "rr-logo-line";
  const arrowClass = animated ? "rr-logo-arrow animated" : "rr-logo-arrow";

  const bgFill = isDark ? "#0F172A" : "#FFFFFF";
  const primaryText = isDark ? "#F8FAFC" : "#03363D";
  const outlinedTextFill = isDark ? "#0F172A" : "#FFFFFF";
  const outlinedTextStroke = isDark ? "#34D399" : "#12B886";
  const accent = isDark ? "#34D399" : "#12B886";
  const tagline = isDark ? "#CBD5E1" : "#1F2937";
  const border = isDark ? "rgba(148,163,184,0.14)" : "rgba(15,23,42,0.08)";

  return (
    <div
      className={`rr-logo-wrap ${className}`}
      style={{
        display: "inline-flex",
        alignItems: "center",
        lineHeight: 0,
      }}
    >
      <svg
        width={width}
        height={height}
        viewBox="0 0 520 180"
        xmlns="http://www.w3.org/2000/svg"
        role="img"
        aria-label="Revenue Radar"
      >
        <defs>
          <linearGradient id={gradId} x1="40" y1="140" x2="170" y2="20">
            <stop offset="0%" stopColor={isDark ? "#34D399" : "#12B886"} />
            <stop offset="100%" stopColor={isDark ? "#10B981" : "#0B8F74"} />
          </linearGradient>

          <style>
            {`
              .rr-logo-line {
                stroke-dasharray: 220;
                stroke-dashoffset: 0;
              }

              .rr-logo-arrow {
                opacity: 1;
              }

              .rr-logo-line.animated {
                stroke-dashoffset: 220;
                animation: rrLogoDraw 2.4s ease-out infinite;
              }

              .rr-logo-arrow.animated {
                opacity: 0;
                animation: rrLogoShow 2.4s ease-out infinite;
              }

              @keyframes rrLogoDraw {
                0% { stroke-dashoffset: 220; }
                55% { stroke-dashoffset: 220; }
                100% { stroke-dashoffset: 0; }
              }

              @keyframes rrLogoShow {
                0%, 70% { opacity: 0; }
                100% { opacity: 1; }
              }
            `}
          </style>
        </defs>

        <rect
          x="1"
          y="1"
          width="518"
          height="178"
          rx="20"
          fill={bgFill}
          stroke={border}
          strokeWidth="2"
        />

        <rect x="40" y="110" width="22" height="30" rx="3" fill={`url(#${gradId})`} />
        <rect x="75" y="95" width="22" height="45" rx="3" fill={`url(#${gradId})`} />
        <rect x="110" y="70" width="22" height="70" rx="3" fill={`url(#${gradId})`} />
        <rect x="145" y="30" width="22" height="110" rx="3" fill={`url(#${gradId})`} />

        <path
          className={lineClass}
          d="M30 100 C60 90, 85 80, 105 60 S140 40, 160 12"
          stroke={accent}
          strokeWidth="6"
          fill="none"
          strokeLinecap="round"
        />

        <path
          className={arrowClass}
          d="M145 18 L160 12 L155 28"
          stroke={accent}
          strokeWidth="6"
          fill="none"
          strokeLinecap="round"
          strokeLinejoin="round"
        />

        <text
          x="190"
          y="70"
          fill={primaryText}
          fontSize="48"
          fontWeight="800"
          fontFamily="Inter, Segoe UI, sans-serif"
        >
          Revenue
        </text>

        <text
          x="190"
          y="125"
          fill={outlinedTextFill}
          stroke={outlinedTextStroke}
          strokeWidth="3.5"
          fontSize="52"
          fontWeight="800"
          fontFamily="Inter, Segoe UI, sans-serif"
        >
          Radar
        </text>

        {showTagline && (
          <text
            x="40"
            y="165"
            fill={tagline}
            fontSize="22"
            fontWeight="600"
            fontFamily="Inter, Segoe UI, sans-serif"
          >
            Powered By Quation
          </text>
        )}
      </svg>
    </div>
  );
};

export default RevenueRadarLogo;