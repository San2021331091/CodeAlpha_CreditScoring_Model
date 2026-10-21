"use client";
import React from "react";
import { getScoreTierColor } from "@/lib/utils";
import { Badge } from "@/components/ui/badge";

interface ScoreGaugeProps {
  score: number;
  riskTier: string;
  defaultProbability: number;
}
export const ScoreGauge: React.FC<ScoreGaugeProps> = ({
  score,
  riskTier,
  defaultProbability,
}): React.JSX.Element => {

  const tierStyle = getScoreTierColor(score);
  // Normalize score between 300 and 850 to an angle from -90 deg to +90 deg (semi-circle)
  const clampedScore = Math.max(300, Math.min(850, score));
  const normalized = (clampedScore - 300) / (850 - 300); // 0.0 to 1.0
  const needleRotation = -90 + normalized * 180; // -90 deg to +90 deg

  return (
    <div className="flex flex-col items-center justify-center relative p-6">
      {/* SVG Arc Gauge */}
      <div className="relative w-72 h-44 flex items-center justify-center">
        <svg
          viewBox="0 0 240 140"
          className="w-full h-full overflow-visible"
        >
          {/* Gradient definitions */}
          <defs>
            <linearGradient id="gaugeGradient" x1="0%" y1="0%" x2="100%" y2="0%">
              <stop offset="0%" stopColor="#f43f5e" />     {/* Poor: Red/Rose */}
              <stop offset="35%" stopColor="#f59e0b" />    {/* Fair: Amber */}
              <stop offset="65%" stopColor="#3b82f6" />    {/* Good: Blue */}
              <stop offset="100%" stopColor="#10b981" />   {/* Excellent: Emerald */}
            </linearGradient>
            <filter id="glow" x="-20%" y="-20%" width="140%" height="140%">
              <feGaussianBlur stdDeviation="4" result="blur" />
              <feComposite in="SourceGraphic" in2="blur" operator="over" />
            </filter>
          </defs>
          {/* Background track */}
          <path
            d="M 30 120 A 90 90 0 0 1 210 120"
            fill="none"
            stroke="rgba(51, 65, 85, 0.4)"
            strokeWidth="16"
            strokeLinecap="round"
          />

          {/* Active Colored Arc */}
          <path
            d="M 30 120 A 90 90 0 0 1 210 120"
            fill="none"
            stroke="url(#gaugeGradient)"
            strokeWidth="16"
            strokeLinecap="round"
            strokeDasharray="282.7"
            strokeDashoffset="0"
            filter="url(#glow)"
          />

          {/* Needle pivot circle */}
          <circle cx="120" cy="120" r="10" fill="#1e293b" stroke="#64748b" strokeWidth="3" />

          {/* Pointer Needle */}
          <g transform={`rotate(${needleRotation} 120 120)`}>
            <polygon
              points="120,38 124,120 116,120"
              fill="#f8fafc"
              className="transition-transform duration-700 ease-out"
            />
            <circle cx="120" cy="120" r="4" fill="#38bdf8" />
          </g>

          {/* Ticks and Score Range Labels */}
          <text x="22" y="136" fill="#94a3b8" fontSize="10" fontWeight="600">300</text>
          <text x="80" y="44" fill="#f59e0b" fontSize="8" fontWeight="500">580</text>
          <text x="146" y="44" fill="#3b82f6" fontSize="8" fontWeight="500">670</text>
          <text x="206" y="136" fill="#10b981" fontSize="10" fontWeight="600">850</text>
        </svg>

        {/* Central Display */}
        <div className="absolute bottom-1 flex flex-col items-center">
          <span className="text-4xl font-extrabold tracking-tight text-white drop-shadow-md">
            {score}
          </span>
          <span className="text-xs uppercase tracking-widest text-slate-400 font-medium">
            Credit score
          </span>
        </div>
      </div>

      {/* Badges */}
      <div className="mt-4 flex items-center gap-3">
        <Badge
          variant="outline"
          className={`rounded-full px-3.5 py-1 ${tierStyle.badge}`}
        >
          {riskTier} Tier
        </Badge>
        <Badge
          variant="outline"
          className="rounded-full border-slate-700 bg-slate-800/80 px-3.5 py-1 font-medium text-slate-300"
        >
          Default Risk: {(defaultProbability * 100).toFixed(1)}%
        </Badge>
      </div>
    </div>
  );
};
