import React from 'react';

// Small dotted SVG as data-URL (color param)
const patternDataUrl = (hex = '#4f46e5') =>
    `url("data:image/svg+xml,${encodeURIComponent(`
    <svg xmlns='http://www.w3.org/2000/svg' width='40' height='40' viewBox='0 0 40 40'>
      <defs>
        <pattern id='dots' width='8' height='8' patternUnits='userSpaceOnUse'>
          <circle cx='1' cy='1' r='1' fill='${hex}' opacity='0.22'/>
        </pattern>
      </defs>
      <rect width='100%' height='100%' fill='url(#dots)' />
    </svg>
  `)}")`;

export default function Background({
    children,
    gradient = 'from-indigo-50 via-violet-50 to-white', // tailwind gradient stops
    patternColor = '#4f46e5',
    sparkles = true, // soft sparkles overlay
    className = '',
}) {
    return (
        <div className={`relative min-h-screen bg-linear-to-b/shorter from-indigo-400 to-teal-400  ${gradient} ${className}`}>
            {/* Dotted Pattern */}
            <div
                className="pointer-events-none absolute inset-0 opacity-70"
                style={{ backgroundImage: patternDataUrl(patternColor) }}
            />
            {/* Soft sparkles/blur blobs (optional) */}
            {sparkles && (
                <div
                    className="pointer-events-none absolute inset-0 opacity-60"
                    style={{
                        backgroundImage: `
              radial-gradient(120px 60px at 20% 10%, rgba(99,102,241,0.09), transparent 55%),
              radial-gradient(100px 60px at 90% 20%, rgba(16,185,129,0.09), transparent 55%),
              radial-gradient(140px 90px at 30% 90%, rgba(236,72,153,0.08), transparent 55%)
            `,
                    }}
                />
            )}
            {/* Content */}
            <div className="relative z-10">{children}</div>
        </div>
        
    );
}