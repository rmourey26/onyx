/** @deprecated Use KronovaIcon from './kronova-icon' instead. */
export function ResenditIcon({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 200 200" fill="none" xmlns="http://www.w3.org/2000/svg" className={className}>
      <g clipPath="url(#clip0_kronova_legacy)">
        {/* Outer circle border */}
        <circle cx="100" cy="100" r="95" stroke="currentColor" strokeWidth="6" fill="none" />

        {/* Asterisk/opposing arrows symbol - 6 rounded arms */}
        <g transform="translate(100, 100)">
          {/* Horizontal right arm */}
          <rect x="10" y="-12" width="50" height="24" rx="12" fill="currentColor" />

          {/* Horizontal left arm */}
          <rect x="-60" y="-12" width="50" height="24" rx="12" fill="currentColor" />

          {/* Diagonal top-right arm */}
          <rect x="10" y="-12" width="50" height="24" rx="12" fill="currentColor" transform="rotate(60)" />

          {/* Diagonal bottom-left arm */}
          <rect x="-60" y="-12" width="50" height="24" rx="12" fill="currentColor" transform="rotate(60)" />

          {/* Diagonal bottom-right arm */}
          <rect x="10" y="-12" width="50" height="24" rx="12" fill="currentColor" transform="rotate(-60)" />

          {/* Diagonal top-left arm */}
          <rect x="-60" y="-12" width="50" height="24" rx="12" fill="currentColor" transform="rotate(-60)" />
        </g>
      </g>
      <defs>
        <clipPath id="clip0_kronova_legacy">
          <rect width="200" height="200" fill="white" />
        </clipPath>
      </defs>
    </svg>
  )
}
