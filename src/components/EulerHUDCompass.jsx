import React from 'react';
import { Compass } from 'lucide-react';

export const EulerHUDCompass = ({ telemetry }) => {
  const { metrics, status, violation_duration } = telemetry;
  const { yaw, pitch, roll } = metrics;

  // Clamped rotation for compass needle (-90 to +90 degrees)
  const clampedYaw = Math.max(-90, Math.min(90, yaw));
  const isYawDeviation = Math.abs(yaw) > 25;
  const isCriticalYaw = Math.abs(yaw) > 35;

  return (
    <div className="bg-neutral-900/60 border border-neutral-800 rounded-xl p-4 flex flex-col justify-between">
      <div className="flex items-center justify-between pb-3 border-b border-neutral-800">
        <div className="flex items-center gap-2">
          <div className="p-1.5 rounded-md bg-neutral-800 border border-neutral-700 text-sky-400">
            <Compass className="w-3.5 h-3.5" />
          </div>
          <div>
            <h4 className="text-xs font-bold text-neutral-100 font-mono tracking-tight">
              EULER HEAD HUD
            </h4>
            <p className="text-[11px] text-neutral-400 font-mono">
              6-DoF Head Pose Vector Deviation
            </p>
          </div>
        </div>

        <div className="text-[11px] font-mono">
          {status === 'ALERT' ? (
            <span className="text-rose-400 font-semibold flex items-center gap-1">
              <span className="w-2 h-2 rounded-full bg-rose-500 animate-ping" />
              ANGULAR BREACH
            </span>
          ) : status === 'WARNING' ? (
            <span className="text-amber-400 font-semibold">
              YAW DRIFT
            </span>
          ) : (
            <span className="text-emerald-400 font-semibold">
              ALIGNED
            </span>
          )}
        </div>
      </div>

      {/* Visual Compass Needle & Gauges */}
      <div className="grid grid-cols-3 gap-2 my-3 text-center font-mono">
        {/* Yaw Dial */}
        <div className="p-3 rounded-lg bg-neutral-950/80 border border-neutral-800 flex flex-col items-center">
          <span className="text-[10px] text-neutral-400 uppercase tracking-wider mb-1">
            YAW (Z-AXIS)
          </span>

          <div className="relative w-16 h-10 flex items-end justify-center overflow-hidden my-1">
            <div className="w-16 h-16 rounded-full border-2 border-neutral-700/60 border-t-sky-500 relative">
              <div
                className="absolute top-0 left-1/2 w-0.5 h-8 origin-bottom bg-rose-500 transition-transform duration-200"
                style={{
                  transform: `translateX(-50%) rotate(${clampedYaw}deg)`,
                  backgroundColor: isCriticalYaw ? '#f43f5e' : isYawDeviation ? '#fbbf24' : '#10b981',
                }}
              />
            </div>
          </div>

          <span
            className={`text-sm font-bold tabular-nums ${
              isCriticalYaw ? 'text-rose-400' : isYawDeviation ? 'text-amber-400' : 'text-neutral-200'
            }`}
          >
            {yaw > 0 ? `+${yaw.toFixed(1)}°` : `${yaw.toFixed(1)}°`}
          </span>
          <span className="text-[9px] text-neutral-400 mt-0.5">Limit: ±25.0°</span>
        </div>

        {/* Pitch Dial */}
        <div className="p-3 rounded-lg bg-neutral-950/80 border border-neutral-800 flex flex-col items-center">
          <span className="text-[10px] text-neutral-400 uppercase tracking-wider mb-1">
            PITCH (X-AXIS)
          </span>

          <div className="relative w-8 h-10 flex items-center justify-center my-1">
            <div className="w-1 h-8 bg-neutral-800 rounded-full relative">
              <div
                className="absolute left-1/2 -translate-x-1/2 w-3.5 h-1.5 rounded-sm bg-sky-400 transition-all duration-200"
                style={{
                  top: `${Math.max(0, Math.min(26, 13 + pitch * 0.6))}px`,
                }}
              />
            </div>
          </div>

          <span className="text-sm font-bold text-neutral-200 tabular-nums">
            {pitch > 0 ? `+${pitch.toFixed(1)}°` : `${pitch.toFixed(1)}°`}
          </span>
          <span className="text-[9px] text-neutral-400 mt-0.5">Tilt: Elevation</span>
        </div>

        {/* Roll Dial */}
        <div className="p-3 rounded-lg bg-neutral-950/80 border border-neutral-800 flex flex-col items-center">
          <span className="text-[10px] text-neutral-400 uppercase tracking-wider mb-1">
            ROLL (Y-AXIS)
          </span>

          <div className="relative w-10 h-10 flex items-center justify-center my-1">
            <div
              className="w-7 h-7 rounded-full border border-neutral-700 flex items-center justify-center transition-transform duration-200"
              style={{ transform: `rotate(${roll}deg)` }}
            >
              <div className="w-4 h-0.5 bg-sky-400" />
            </div>
          </div>

          <span className="text-sm font-bold text-neutral-200 tabular-nums">
            {roll > 0 ? `+${roll.toFixed(1)}°` : `${roll.toFixed(1)}°`}
          </span>
          <span className="text-[9px] text-neutral-400 mt-0.5">Lateral Cant</span>
        </div>
      </div>

      {/* Anomaly Duration Meter */}
      <div className="p-2.5 rounded-lg bg-neutral-950/80 border border-neutral-800 flex items-center justify-between text-xs font-mono">
        <span className="text-neutral-400">Violation Temporal Filter:</span>
        <div className="flex items-center gap-2">
          <div className="w-20 bg-neutral-800 h-1.5 rounded-full overflow-hidden">
            <div
              className={`h-full transition-all duration-200 ${
                violation_duration >= 2.0 ? 'bg-rose-500' : 'bg-amber-400'
              }`}
              style={{ width: `${Math.min(100, (violation_duration / 2.5) * 100)}%` }}
            />
          </div>
          <span
            className={`font-bold tabular-nums ${
              violation_duration >= 2.0 ? 'text-rose-400' : 'text-neutral-300'
            }`}
          >
            {violation_duration.toFixed(1)}s / 2.0s
          </span>
        </div>
      </div>
    </div>
  );
};

export default EulerHUDCompass;
