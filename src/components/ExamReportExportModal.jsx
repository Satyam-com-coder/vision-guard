import React from 'react';
import { X, Printer, Download, FileText } from 'lucide-react';

export const ExamReportExportModal = ({
  isOpen,
  onClose,
  telemetry,
  incidents,
  examTimer,
  totalWarnings,
}) => {
  if (!isOpen) return null;

  const handlePrint = () => {
    window.print();
  };

  const handleDownloadJSON = () => {
    const reportData = {
      system: 'Vision-Guard Single-Desk Invigilator Console',
      examination: 'CS-302: Operating Systems',
      hall: 'LH-02',
      session_duration: examTimer,
      desk_id: 'DESK-04',
      candidate_id: 'STU-042',
      candidate_roll_number: '0118ME231042',
      final_integrity_score: telemetry.integrity_score,
      total_warnings_issued: totalWarnings,
      telemetry_state: telemetry,
      incidents_log: incidents,
      generated_at: new Date().toISOString(),
    };

    const blob = new Blob([JSON.stringify(reportData, null, 2)], { type: 'application/json' });
    const link = document.createElement('a');
    link.href = URL.createObjectURL(blob);
    link.download = `OFFICIAL_EXAM_AUDIT_DESK04_${new Date().toISOString().slice(0, 10)}.json`;
    link.click();
  };

  return (
    <div
      role="dialog"
      aria-modal="true"
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-in fade-in"
      onClick={onClose}
    >
      <div
        className="relative w-full max-w-3xl bg-neutral-950 border border-neutral-800 rounded-xl shadow-2xl overflow-hidden flex flex-col max-h-[90vh]"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between px-5 py-3.5 border-b border-neutral-800 bg-neutral-900/80">
          <div className="flex items-center gap-2.5">
            <div className="p-1.5 rounded-md bg-neutral-800 text-sky-400">
              <FileText className="w-4 h-4" />
            </div>
            <div>
              <h3 className="text-sm font-semibold text-neutral-100 font-mono">
                Official Examination Session Incident Report
              </h3>
              <p className="text-xs text-neutral-400 font-mono">
                Candidate: STU-042 · Desk #04 · Hall LH-02
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={handlePrint}
              type="button"
              className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium rounded-md bg-neutral-800 hover:bg-neutral-700 text-neutral-200 border border-neutral-700 transition-colors cursor-pointer"
            >
              <Printer className="w-3.5 h-3.5" />
              <span>Print</span>
            </button>
            <button
              onClick={handleDownloadJSON}
              type="button"
              className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium rounded-md bg-sky-600 hover:bg-sky-500 text-white font-semibold transition-colors cursor-pointer"
            >
              <Download className="w-3.5 h-3.5" />
              <span>Download JSON</span>
            </button>
            <button
              onClick={onClose}
              type="button"
              className="p-1.5 text-neutral-400 hover:text-neutral-100 rounded-md transition-colors cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Report Content */}
        <div className="p-6 overflow-y-auto space-y-6 text-neutral-300 font-mono text-xs">
          {/* Certificate Header Banner */}
          <div className="p-4 rounded-lg bg-neutral-900/60 border border-neutral-800 flex items-center justify-between">
            <div>
              <div className="text-base font-bold text-neutral-100">
                ACADEMIC INTEGRITY AUDIT DOSSIER
              </div>
              <div className="text-neutral-400 mt-1">
                Vision-Guard AI Surveillance Suite · Single-Desk Phase-1 Node
              </div>
            </div>
            <div className="text-right">
              <span className="text-xs text-neutral-400">Final Integrity Score</span>
              <div className={`text-2xl font-black ${
                telemetry.integrity_score > 85
                  ? 'text-emerald-400'
                  : telemetry.integrity_score >= 70
                  ? 'text-amber-400'
                  : 'text-rose-400'
              }`}>
                {telemetry.integrity_score}%
              </div>
            </div>
          </div>

          {/* Key Facts */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
            <div className="p-3 rounded-lg bg-neutral-900/40 border border-neutral-800/80">
              <span className="text-neutral-400 text-[11px] block">Desk & Seat</span>
              <span className="text-neutral-200 font-bold">Desk #04 (Row B, Aisle 2)</span>
            </div>
            <div className="p-3 rounded-lg bg-neutral-900/40 border border-neutral-800/80">
              <span className="text-neutral-400 text-[11px] block">Roll Number</span>
              <span className="text-neutral-200 font-bold">0118ME231042</span>
            </div>
            <div className="p-3 rounded-lg bg-neutral-900/40 border border-neutral-800/80">
              <span className="text-neutral-400 text-[11px] block">Course Code</span>
              <span className="text-neutral-200 font-bold">CS-302 (OS)</span>
            </div>
            <div className="p-3 rounded-lg bg-neutral-900/40 border border-neutral-800/80">
              <span className="text-neutral-400 text-[11px] block">Total Warnings</span>
              <span className="text-neutral-200 font-bold">{totalWarnings}</span>
            </div>
          </div>

          {/* Incident Timeline */}
          <div>
            <h4 className="text-xs font-bold text-neutral-200 uppercase tracking-wider mb-2">
              Captured Anomaly Events Log ({incidents.length})
            </h4>
            <div className="space-y-2">
              {incidents.map((item, idx) => (
                <div
                  key={item.id}
                  className="p-3 rounded-lg bg-neutral-900/50 border border-neutral-800 flex items-center justify-between text-xs"
                >
                  <div className="flex items-center gap-3">
                    <span className="text-neutral-400">#{idx + 1}</span>
                    <span className="text-neutral-400">[{item.timestamp}]</span>
                    <span className="font-semibold text-neutral-200">{item.type}</span>
                    <span className="text-neutral-400 text-[11px]">
                      (Duration: {item.duration}s · Yaw: {item.yaw > 0 ? `+${item.yaw}` : item.yaw}°)
                    </span>
                  </div>
                  <div>
                    <span className={`px-2 py-0.5 rounded text-[10px] ${
                      item.severity === 'CRITICAL'
                        ? 'bg-rose-950 text-rose-300 border border-rose-800'
                        : 'bg-amber-950 text-amber-300 border border-amber-800'
                    }`}>
                      {item.severity}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Invigilator Sign-off */}
          <div className="pt-4 border-t border-neutral-800 grid grid-cols-2 gap-4 text-xs text-neutral-400">
            <div>
              <span>Invigilator Name: _______________________</span>
            </div>
            <div className="text-right">
              <span>Signature & Date: _______________________</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ExamReportExportModal;
