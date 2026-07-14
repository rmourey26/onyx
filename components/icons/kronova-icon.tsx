export function KronovaIcon({ className }: { className?: string }) {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100" className={className}>
      <defs>
        <linearGradient id="kronovaIconGradient" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" style={{ stopColor: "#0047AB" }} />
          <stop offset="50%" style={{ stopColor: "#0088CC" }} />
          <stop offset="100%" style={{ stopColor: "#00CED1" }} />
        </linearGradient>
        <linearGradient id="kronovaIconGradientReverse" x1="100%" y1="0%" x2="0%" y2="100%">
          <stop offset="0%" style={{ stopColor: "#00CED1" }} />
          <stop offset="100%" style={{ stopColor: "#0047AB" }} />
        </linearGradient>
        <filter id="glow">
          <feGaussianBlur stdDeviation="2" result="coloredBlur" />
          <feMerge>
            <feMergeNode in="coloredBlur" />
            <feMergeNode in="SourceGraphic" />
          </feMerge>
        </filter>
      </defs>

      {/* Background circle with subtle glow */}
      <circle
        cx="50"
        cy="50"
        r="46"
        fill="none"
        stroke="url(#kronovaIconGradient)"
        strokeWidth="3"
        filter="url(#glow)"
      />

      {/* Abstract K with neural network aesthetic */}
      <g transform="translate(50, 50)">
        {/* Vertical line of K */}
        <line
          x1="-15"
          y1="-25"
          x2="-15"
          y2="25"
          stroke="url(#kronovaIconGradient)"
          strokeWidth="5"
          strokeLinecap="round"
        />

        {/* Diagonal arms of K */}
        <line
          x1="-15"
          y1="0"
          x2="20"
          y2="-25"
          stroke="url(#kronovaIconGradient)"
          strokeWidth="5"
          strokeLinecap="round"
        />
        <line
          x1="-15"
          y1="0"
          x2="20"
          y2="25"
          stroke="url(#kronovaIconGradient)"
          strokeWidth="5"
          strokeLinecap="round"
        />

        {/* Connection nodes */}
        <circle cx="-15" cy="-25" r="5" fill="url(#kronovaIconGradient)" />
        <circle cx="-15" cy="0" r="6" fill="url(#kronovaIconGradient)" />
        <circle cx="-15" cy="25" r="5" fill="url(#kronovaIconGradient)" />
        <circle cx="20" cy="-25" r="5" fill="url(#kronovaIconGradientReverse)" />
        <circle cx="20" cy="25" r="5" fill="url(#kronovaIconGradientReverse)" />
      </g>
    </svg>
  )
}

// Keep the old export for backward compatibility
export { KronovaIcon as ResenditIcon }
