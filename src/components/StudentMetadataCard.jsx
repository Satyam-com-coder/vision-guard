import React from 'react';
import { User, Shield, AlertOctagon, Clock, Gauge } from 'lucide-react';

export const StudentMetadataCard = ({
  telemetry,
  examTimer,
  totalWarnings,
  onIssueWarning,
  onRecalibrate,
}) => {
  const { integrity_score, metrics } = telemetry;

  // Color dynamic shift: Green (>85%), Amber (70%–85%), Red (<70%)
  const getIntegrityColor = (score) => {
    if (score > 85) {
      return {
        bar: 'bg-emerald-500',
        text: 'text-emerald-400',
        label: 'NOMINAL INTEGRITY',
      };
    } else if (score >= 70) {
      return {
        bar: 'bg-amber-500',
        text: 'text-amber-400',
        label: 'MODERATE SUSPICION',
      };
    } else {
      return {
        bar: 'bg-rose-500',
        text: 'text-rose-400',
        label: 'CRITICAL INTEGRITY BREACH',
      };
    }
  };

  const integrityTheme = getIntegrityColor(integrity_score);

  return (
    <div className="bg-neutral-900/60 border border-neutral-800 rounded-xl p-5 flex flex-col justify-between space-y-4">
      {/* Top Header: Desk & Candidate Header */}
      <div>
        <div className="flex items-center justify-between pb-3 border-b border-neutral-800">
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-lg bg-neutral-800/80 border border-neutral-700/60 text-sky-400">
              <User className="w-4 h-4" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-sm font-bold text-neutral-100 font-mono tracking-tight">
                  Desk #04
                </h3>
                <span className="text-[11px] font-mono px-2 py-0.5 rounded bg-sky-950/60 text-sky-300 border border-sky-800/50">
                  Row B, Aisle 2
                </span>
              </div>
              <p className="text-xs text-neutral-400 font-mono mt-0.5">
                Roll No: <span className="text-neutral-200">0118ME231042</span> · Candidate: <span className="text-neutral-200">STU-042</span>
              </p>
            </div>
          </div>

          {/* Exam Live Clock */}
          <div className="text-right">
            <div className="flex items-center justify-end gap-1.5 text-xs text-neutral-400 font-mono">
              <Clock className="w-3.5 h-3.5 text-neutral-400" />
              <span>LIVE CLOCK</span>
            </div>
            <div className="text-base font-bold font-mono text-emerald-400 tabular-nums tracking-wider mt-0.5">
              {examTimer}
            </div>
          </div>
        </div>

        {/* Paper & Module Metadata */}
        <div className="mt-3.5 grid grid-cols-2 gap-2 text-xs font-mono">
          <div className="p-2.5 rounded-lg bg-neutral-950/60 border border-neutral-800/80">
            <span className="text-neutral-400 block text-[11px] mb-0.5">Paper / Course</span>
            <span className="text-neutral-200 font-semibold truncate block">
              CS-302 (Operating Systems)
            </span>
          </div>
          <div className="p-2.5 rounded-lg bg-neutral-950/60 border border-neutral-800/80">
            <span className="text-neutral-400 block text-[11px] mb-0.5">Hall & Room</span>
            <span className="text-neutral-200 font-semibold block">
              LH-02 · North Wing
            </span>
          </div>
        </div>
      </div>

      {/* Dynamic Integrity Progress Bar (Point C - Feature 2) */}
      <div className="p-4 rounded-xl bg-neutral-950/80 border border-neutral-800 space-y-2.5">
        <div className="flex items-center justify-between text-xs">
          <div className="flex items-center gap-1.5">
            <Shield className={`w-4 h-4 ${integrityTheme.text}`} />
            <span className="font-bold tracking-tight text-neutral-200">
              INTEGRITY SCORE
            </span>
          </div>
          <div className="flex items-center gap-2 font-mono">
            <span className={`text-lg font-black tabular-nums ${integrityTheme.text}`}>
              {integrity_score}%
            </span>
          </div>
        </div>

        {/* Progress Bar Container */}
        <div className="w-full bg-neutral-800/80 h-3 rounded-full overflow-hidden p-0.5 border border-neutral-700/50">
          <div
            className={`h-full rounded-full transition-all duration-500 ease-out ${integrityTheme.bar}`}
            style={{ width: `${Math.max(5, Math.min(100, integrity_score))}%` }}
          />
        </div>

        {/* Score Threshold Scale Marks */}
        <div className="flex justify-between items-center text-[10px] font-mono text-neutral-400 pt-0.5">
          <span className="text-rose-400">&lt;70% Critical</span>
          <span className="text-amber-400">70%–85% Caution</span>
          <span className="text-emerald-400">&gt;85% Focused</span>
        </div>
      </div>

      {/* Warnings & Live Numerical Telemetry HUD */}
      <div className="grid grid-cols-2 gap-2 text-xs font-mono">
        {/* Warnings Card */}
        <div className="p-3 rounded-lg bg-neutral-950/60 border border-neutral-800 flex items-center justify-between">
          <div>
            <span className="text-[11px] text-neutral-400 block">Total Warnings</span>
            <span className="text-lg font-bold text-neutral-100 tabular-nums">
              {String(totalWarnings).padStart(2, '0')}
            </span>
          </div>
          <div className={`p-2 rounded-lg border ${
            totalWarnings > 0 ? 'bg-amber-950/60 text-amber-400 border-amber-800/40' : 'bg-neutral-800 text-neutral-400 border-neutral-700'
          }`}>
            <AlertOctagon className="w-4 h-4" />
          </div>
        </div>

        {/* Stream Telemetry Card */}
        <div className="p-3 rounded-lg bg-neutral-950/60 border border-neutral-800 flex items-center justify-between">
          <div>
            <span className="text-[11px] text-neutral-400 block">Stream Telemetry</span>
            <span className="text-xs font-semibold text-neutral-200">
              {metrics.fps} FPS · solvePnP
            </span>
          </div>
          <div className="p-2 rounded-lg bg-neutral-800 border border-neutral-700 text-sky-400">
            <Gauge className="w-4 h-4" />
          </div>
        </div>
      </div>

      {/* Invigilator Action Controls */}
      <div className="pt-1 flex items-center gap-2">
        <button
          onClick={onIssueWarning}
          type="button"
          className="flex-1 py-2 px-3 text-xs font-medium rounded-lg bg-neutral-800 hover:bg-neutral-700 text-amber-300 border border-amber-700/40 hover:border-amber-600 transition-colors cursor-pointer flex items-center justify-center gap-1.5"
        >
          <AlertOctagon className="w-3.5 h-3.5 text-amber-400" />
          <span>Issue Verbal Warning</span>
        </button>

        <button
          onClick={onRecalibrate}
          type="button"
          className="py-2 px-3 text-xs font-medium rounded-lg bg-neutral-800 hover:bg-neutral-700 text-neutral-300 border border-neutral-700 transition-colors cursor-pointer"
          title="Reset Euler angle baseline"
        >
          Recalibrate
        </button>
      </div>
    </div>
  );
};

export default StudentMetadataCard;
