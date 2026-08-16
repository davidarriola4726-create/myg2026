import React from 'react';

interface MygLogoProps {
  className?: string;
  size?: 'sm' | 'md' | 'lg' | 'xl';
  showText?: boolean;
}

export const MygLogo: React.FC<MygLogoProps> = ({
  className = '',
  size = 'md',
  showText = true,
}) => {
  const sizeMap = {
    sm: 'w-10 h-7',
    md: 'w-16 h-10',
    lg: 'w-28 h-18',
    xl: 'w-44 h-28',
  };

  return (
    <div className={`flex items-center gap-3 ${className}`}>
      <div className={`relative ${sizeMap[size]} flex items-center justify-center shrink-0`}>
        {/* SVG Recreation of the Emblem: Black tire with rim + 3 dynamic red curved swooshes */}
        <svg
          viewBox="0 0 300 180"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
          className="w-full h-full drop-shadow-[0_2px_12px_rgba(220,38,38,0.4)]"
        >
          {/* Tire Outer Shadow / Glow */}
          <ellipse cx="170" cy="90" rx="60" ry="76" fill="#05070A" stroke="#222834" strokeWidth="4" />
          
          {/* White Rim Outer Ring */}
          <ellipse cx="178" cy="90" rx="42" ry="58" fill="#FFFFFF" />
          
          {/* Inner Rim Hub & Spokes (Black) */}
          <ellipse cx="180" cy="90" rx="28" ry="42" fill="#0A0D14" />
          {/* Rim Spoke Details */}
          <path d="M 180 52 L 180 128" stroke="#FFFFFF" strokeWidth="6" strokeLinecap="round" />
          <path d="M 156 70 L 204 110" stroke="#FFFFFF" strokeWidth="6" strokeLinecap="round" />
          <path d="M 156 110 L 204 70" stroke="#FFFFFF" strokeWidth="6" strokeLinecap="round" />
          <circle cx="180" cy="90" r="10" fill="#E2E8F0" stroke="#0F172A" strokeWidth="3" />

          {/* 3 Dynamic Curved Red Swooshes */}
          {/* Top Red Swoosh */}
          <path
            d="M 10 155 C 60 130 110 95 200 48 C 240 28 275 35 295 44 L 285 58 C 240 45 180 62 100 118 C 65 142 35 158 10 155 Z"
            fill="url(#redGrad1)"
          />
          {/* Middle Red Swoosh */}
          <path
            d="M 28 162 C 75 140 125 108 210 68 C 248 50 270 56 288 64 L 278 77 C 235 66 182 82 105 136 C 72 158 48 168 28 162 Z"
            fill="url(#redGrad2)"
          />
          {/* Bottom Red Swoosh */}
          <path
            d="M 52 170 C 95 150 142 122 220 86 C 252 72 268 76 280 82 L 270 94 C 230 84 182 102 110 152 C 82 170 65 175 52 170 Z"
            fill="url(#redGrad3)"
          />

          <defs>
            <linearGradient id="redGrad1" x1="10" y1="100" x2="295" y2="45" gradientUnits="userSpaceOnUse">
              <stop offset="0%" stopColor="#991B1B" />
              <stop offset="40%" stopColor="#DC2626" />
              <stop offset="100%" stopColor="#EF4444" />
            </linearGradient>
            <linearGradient id="redGrad2" x1="28" y1="110" x2="288" y2="65" gradientUnits="userSpaceOnUse">
              <stop offset="0%" stopColor="#B91C1C" />
              <stop offset="40%" stopColor="#DC2626" />
              <stop offset="100%" stopColor="#F87171" />
            </linearGradient>
            <linearGradient id="redGrad3" x1="52" y1="125" x2="280" y2="85" gradientUnits="userSpaceOnUse">
              <stop offset="0%" stopColor="#991B1B" />
              <stop offset="50%" stopColor="#EF4444" />
              <stop offset="100%" stopColor="#FCA5A5" />
            </linearGradient>
          </defs>
        </svg>
      </div>

      {showText && (
        <div className="flex flex-col">
          <div className="flex items-center gap-1.5 font-black tracking-wider leading-none">
            <span className="text-xl sm:text-2xl text-white tracking-widest font-extrabold font-mono">MYG</span>
            <span className="text-xs sm:text-sm font-bold px-1.5 py-0.5 rounded bg-red-600/90 text-white shadow-sm">2026</span>
          </div>
          <span className="text-[10px] sm:text-xs font-semibold text-zinc-400 tracking-wider uppercase mt-0.5">
            Control de Flota y Mantenimiento
          </span>
        </div>
      )}
    </div>
  );
};
