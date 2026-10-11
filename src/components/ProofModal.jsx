import React, { useState } from 'react';
import { X, Download, CheckCircle2, AlertTriangle, ShieldAlert, Clock, User, Compass, FileText } from 'lucide-react';

export const ProofModal = ({
  isOpen,
  onClose,
  incident,
  onUpdateStatus,
}) => {
  const [invigilatorNote, setInvigilatorNote] = useState('');
  const [isSaved, setIsSaved] = useState(false);

  if (!isOpen || !incident) return null;

  const handleSaveStatus = (status) => {
    if (onUpdateStatus) {
      onUpdateStatus(incident.id, status, invigilatorNote);
    }
    setIsSaved(true);
    setTimeout(() => {
      setIsSaved(false);
      onClose();
    }, 400);
  };

  const handleDownloadProof = () => {
    const canvas = document.createElement('canvas');
    canvas.width = 1280;
    canvas.height = 720;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const img = new Image();
    img.crossOrigin = 'anonymous';
    img.onload = () => {
      ctx.drawImage(img, 0, 0, 1280, 720);

      // Add evidence overlay banner
      ctx.fillStyle = 'rgba(10, 15, 25, 0.85)';
      ctx.fillRect(0, 0, 1280, 80);
      ctx.fillRect(0, 640, 1280, 80);

      // Top Header
      ctx.fillStyle = '#ef4444';
      ctx.font = 'bold 24px monospace';
      ctx.fillText('[VISION-GUARD EVIDENCE VAULT - TEMPORAL VIOLATION]', 30, 48);

      ctx.fillStyle = '#e2e8f0';
      ctx.font = '18px monospace';
      ctx.fillText(`DESK: ${incident.desk_id}  |  STUDENT: ${incident.student_id}  |  TIME: ${incident.timestamp}`, 700, 48);

      // Bottom Telemetry
      ctx.fillStyle = '#38bdf8';
      ctx.font = '20px monospace';
      ctx.fillText(`ANOMALY: ${incident.type.toUpperCase()}  |  DURATION: ${incident.duration}s  |  YAW: ${incident.yaw}°  |  PITCH: ${incident.pitch}°`, 30, 688);

      // Target bounding box overlay in red
      ctx.strokeStyle = '#ef4444';
      ctx.lineWidth = 4;
      ctx.strokeRect(480, 220, 280, 340);

      const link = document.createElement('a');
      link.download = `EVIDENCE_${incident.desk_id.replace(/\s+/g, '_')}_${incident.timestamp.replace(/:/g, '')}.png`;
      link.href = canvas.toDataURL('image/png');
      link.click();
    };
    img.src = incident.proof_image;
  };

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-labelledby="proof-modal-title"
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-in fade-in duration-150"
      onClick={onClose}
    >
      <div
        className="relative w-full max-w-4xl bg-neutral-950 border border-neutral-800 rounded-xl shadow-2xl overflow-hidden flex flex-col max-h-[92vh]"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Modal Header */}
        <div className="flex items-center justify-between px-5 py-3.5 border-b border-neutral-800 bg-neutral-900/70">
          <div className="flex items-center gap-3">
            <div className="p-1.5 rounded-md bg-rose-950/70 text-rose-400 border border-rose-800/50">
              <ShieldAlert className="w-4 h-4" />
            </div>
            <div>
              <h2 id="proof-modal-title" className="text-sm font-semibold text-neutral-100 flex items-center gap-2">
                <span>Violation Evidence Frame</span>
                <span className="text-xs font-mono text-neutral-400 font-normal">
                  ID: {incident.id}
                </span>
              </h2>
              <p className="text-xs text-neutral-400 font-mono">
                Temporal Anomaly Capture · Auto-saved by solvePnP Filter
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={handleDownloadProof}
              type="button"
              className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium rounded-md bg-neutral-800 hover:bg-neutral-700 text-neutral-200 border border-neutral-700 transition-colors cursor-pointer"
            >
              <Download className="w-3.5 h-3.5" />
              <span>Export PNG</span>
            </button>
            <button
              onClick={onClose}
              type="button"
              className="p-1.5 text-neutral-400 hover:text-neutral-100 hover:bg-neutral-800 rounded-md transition-colors cursor-pointer"
              aria-label="Close dialog"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Modal Body */}
        <div className="p-5 overflow-y-auto space-y-5">
          {/* Snapshot Container with CCTV HUD styling */}
          <div className="relative rounded-lg overflow-hidden border border-neutral-800 bg-black aspect-video group">
            <img
              src={incident.proof_image}
              alt={`Violation capture for ${incident.desk_id}`}
              className="w-full h-full object-cover"
              referrerPolicy="no-referrer"
            />

            {/* Red tracking bounding box and vector simulation */}
            <div className="absolute inset-0 pointer-events-none">
              <div className="absolute top-[22%] left-[42%] w-[26%] h-[48%] border-2 border-rose-500/80 rounded-sm shadow-[0_0_15px_rgba(244,63,94,0.4)]">
                <div className="absolute -top-1 -left-1 w-2.5 h-2.5 border-t-2 border-l-2 border-rose-400" />
                <div className="absolute -top-1 -right-1 w-2.5 h-2.5 border-t-2 border-r-2 border-rose-400" />
                <div className="absolute -bottom-1 -left-1 w-2.5 h-2.5 border-b-2 border-l-2 border-rose-400" />
                <div className="absolute -bottom-1 -right-1 w-2.5 h-2.5 border-b-2 border-r-2 border-rose-400" />

                <svg className="absolute inset-0 w-full h-full overflow-visible" aria-hidden="true">
                  <line
                    x1="50%"
                    y1="40%"
                    x2={incident.yaw > 0 ? '110%' : '-10%'}
                    y2="30%"
                    stroke="#f43f5e"
                    strokeWidth="3"
                    strokeDasharray="4 3"
                  />
                  <circle
                    cx={incident.yaw > 0 ? '110%' : '-10%'}
                    cy="30%"
                    r="4"
                    fill="#f43f5e"
                  />
                </svg>

                <div className="absolute top-2 left-2 bg-rose-950/90 border border-rose-500/50 text-[10px] font-mono px-1.5 py-0.5 text-rose-300 rounded">
                  HEAD RAY: {incident.yaw > 0 ? `+${incident.yaw}°` : `${incident.yaw}°`}
                </div>
              </div>

              <div className="absolute top-3 left-3 bg-neutral-950/85 backdrop-blur-md px-3 py-1.5 rounded border border-neutral-800 text-xs font-mono text-neutral-200 flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-rose-500 animate-ping" />
                <span className="font-semibold text-rose-400">REC SNAPSHOT</span>
                <span className="text-neutral-400">·</span>
                <span>{incident.timestamp}</span>
                <span className="text-neutral-400">·</span>
                <span>{incident.desk_id}</span>
              </div>

              <div className="absolute bottom-3 right-3 bg-neutral-950/85 backdrop-blur-md px-3 py-1.5 rounded border border-neutral-800 text-[11px] font-mono text-neutral-300">
                Yaw: <span className="text-rose-400 font-bold">{incident.yaw > 0 ? `+${incident.yaw}` : incident.yaw}°</span> · Pitch: <span className="text-neutral-200">+{incident.pitch}°</span> · Roll: <span className="text-neutral-200">{incident.roll}°</span>
              </div>
            </div>
          </div>

          {/* Telemetry Breakdown Details */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-3 text-xs">
            <div className="p-3 rounded-lg bg-neutral-900/60 border border-neutral-800">
              <div className="text-neutral-400 flex items-center gap-1.5 mb-1">
                <User className="w-3.5 h-3.5 text-neutral-400" />
                <span>Candidate / Desk</span>
              </div>
              <div className="font-semibold text-neutral-100 font-mono">{incident.student_id}</div>
              <div className="text-neutral-400 font-mono text-[11px]">{incident.desk_id} (Row B, Aisle 2)</div>
            </div>

            <div className="p-3 rounded-lg bg-neutral-900/60 border border-neutral-800">
              <div className="text-neutral-400 flex items-center gap-1.5 mb-1">
                <Clock className="w-3.5 h-3.5 text-neutral-400" />
                <span>Timestamp & Duration</span>
              </div>
              <div className="font-semibold text-neutral-100 font-mono">{incident.timestamp}</div>
              <div className="text-amber-400 font-mono text-[11px]">
                Violation: {incident.duration}s (&gt;2.0s limit)
              </div>
            </div>

            <div className="p-3 rounded-lg bg-neutral-900/60 border border-neutral-800">
              <div className="text-neutral-400 flex items-center gap-1.5 mb-1">
                <Compass className="w-3.5 h-3.5 text-neutral-400" />
                <span>Euler Deviation</span>
              </div>
              <div className="font-semibold text-rose-400 font-mono">
                {incident.type}
              </div>
              <div className="text-neutral-400 font-mono text-[11px]">
                Yaw {incident.yaw > 0 ? `+${incident.yaw}` : incident.yaw}° / Pitch {incident.pitch}°
              </div>
            </div>

            <div className="p-3 rounded-lg bg-neutral-900/60 border border-neutral-800">
              <div className="text-neutral-400 flex items-center gap-1.5 mb-1">
                <AlertTriangle className="w-3.5 h-3.5 text-rose-400" />
                <span>Current Status</span>
              </div>
              <div className="font-semibold font-mono">
                <span className={`px-2 py-0.5 rounded text-[11px] ${
                  incident.status === 'FLAGGED'
                    ? 'bg-rose-950/80 text-rose-300 border border-rose-800/60'
                    : incident.status === 'DISMISSED'
                    ? 'bg-neutral-800 text-neutral-400 border border-neutral-700'
                    : 'bg-emerald-950/80 text-emerald-300 border border-emerald-800/60'
                }`}>
                  {incident.status}
                </span>
              </div>
              <div className="text-neutral-400 text-[11px] mt-1">Severity: {incident.severity}</div>
            </div>
          </div>

          {/* Invigilator Notes & Review Decision */}
          <div className="p-4 rounded-lg bg-neutral-900/50 border border-neutral-800 space-y-3">
            <div className="flex items-center gap-2 text-xs font-semibold text-neutral-200">
              <FileText className="w-4 h-4 text-neutral-400" />
              <span>Invigilator Audit Note</span>
            </div>
            <textarea
              value={invigilatorNote}
              onChange={(e) => setInvigilatorNote(e.target.value)}
              placeholder="Add observation note (e.g., Persistent lateral glance toward neighboring desk paper; candidate issued 1st verbal warning)..."
              rows={2}
              className="w-full text-xs font-mono bg-neutral-950 border border-neutral-800 rounded-md p-2.5 text-neutral-200 focus:outline-none focus:border-neutral-600 transition-colors"
            />

            <div className="flex flex-wrap items-center justify-between gap-3 pt-1">
              <div className="text-[11px] text-neutral-400">
                Action will update the session audit log and academic integrity report.
              </div>
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => handleSaveStatus('DISMISSED')}
                  className="px-3 py-1.5 text-xs font-medium rounded-md bg-neutral-800 hover:bg-neutral-700 text-neutral-300 border border-neutral-700 transition-colors cursor-pointer"
                >
                  Dismiss as False Positive
                </button>
                <button
                  type="button"
                  onClick={() => handleSaveStatus('FLAGGED')}
                  className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium rounded-md bg-rose-600 hover:bg-rose-500 text-white font-semibold transition-colors cursor-pointer shadow-md"
                >
                  <CheckCircle2 className="w-3.5 h-3.5" />
                  <span>Confirm Violation Flag</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProofModal;
