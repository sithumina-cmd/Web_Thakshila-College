import React, { useState } from 'react';

export default function SchoolCrest({
  size = 52,
  className = '',
  src = '/Pictures/School Logo.png',
  hasBorder = false
}) {
  const [imageError, setImageError] = useState(false);

  if (!imageError && src) {
    return (
      <img
        src={src}
        alt="Thakshila College Gampaha Logo"
        width={size}
        height={size}
        className={`school-official-logo ${className}`}
        style={{
          width: `${size}px`,
          height: `${size}px`,
          objectFit: 'contain',
          borderRadius: '50%',
          border: hasBorder ? '2px solid #f59e0b' : 'none',
          boxShadow: hasBorder ? '0 2px 8px rgba(76, 5, 25, 0.25)' : 'none',
          background: 'transparent',
          padding: hasBorder ? '2px' : '0',
          display: 'inline-block',
          verticalAlign: 'middle'
        }}
        onError={() => setImageError(true)}
      />
    );
  }

  // Graceful SVG Fallback
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 120 120"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={className}
      aria-label="Thakshila College Gampaha Crest"
    >
      <defs>
        <linearGradient id="crestGold" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#FFE082" />
          <stop offset="50%" stopColor="#F59E0B" />
          <stop offset="100%" stopColor="#B45309" />
        </linearGradient>
        <linearGradient id="crestMaroon" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#881337" />
          <stop offset="100%" stopColor="#4C0519" />
        </linearGradient>
      </defs>

      <circle
        cx="60"
        cy="58"
        r="52"
        fill="url(#crestMaroon)"
        stroke="url(#crestGold)"
        strokeWidth="4"
      />
      <circle
        cx="60"
        cy="58"
        r="46"
        stroke="#FCD34D"
        strokeWidth="1.2"
        strokeDasharray="3 3"
        opacity="0.7"
      />

      <path
        d="M32 28H88V58C88 79 75 92 60 99C45 92 32 79 32 58V28Z"
        fill="#5B081E"
        stroke="url(#crestGold)"
        strokeWidth="3.5"
      />

      <path
        d="M60 33C60 33 66 40 66 45C66 48.5 63.3 51 60 51C56.7 51 54 48.5 54 45C54 40 60 33 60 33Z"
        fill="#FDE047"
      />
      <path
        d="M60 37C60 37 63 41 63 44.5C63 46.5 61.7 48 60 48C58.3 48 57 46.5 57 44.5C57 41 60 37 60 37Z"
        fill="#F97316"
      />

      <path d="M49 52H71L67 57H53L49 52Z" fill="url(#crestGold)" />
      <rect x="58" y="57" width="4" height="7" fill="url(#crestGold)" />
      <path d="M52 64H68L70 67H50L52 64Z" fill="url(#crestGold)" />

      <path
        d="M44 72C49 70 55 71 60 74C65 71 71 70 76 72V83C71 81 65 82 60 85C55 82 49 81 44 83V72Z"
        fill="#FEF3C7"
        stroke="#F59E0B"
        strokeWidth="1.8"
      />
      <line x1="60" y1="74" x2="60" y2="85" stroke="#B45309" strokeWidth="1.5" />

      <path
        d="M22 100C35 106 85 106 98 100L94 111C78 116 42 116 26 111L22 100Z"
        fill="url(#crestGold)"
      />
      <text
        x="60"
        y="110"
        textAnchor="middle"
        fill="#4C0519"
        fontSize="8.5"
        fontWeight="800"
        fontFamily="Plus Jakarta Sans, sans-serif"
        letterSpacing="1"
      >
        THAKSHILA
      </text>
    </svg>
  );
}
