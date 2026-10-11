/**
 * Vision-Guard AI: Single-Desk Invigilator Console
 * Frontend implementation compliant with Production Handover Specification
 */

import React, { useState, useEffect, useRef, useCallback } from 'react';
import {
  ShieldAlert,
  ShieldCheck,
  Video,
  FileSpreadsheet,
  FileText,
  AlertTriangle,
  RefreshCw,
  Clock,
  Radio,
  SlidersHorizontal,
  Layers,
  Sparkles,
  CheckCircle2,
} from 'lucide-react';

import VideoHeroCard from './components/VideoHeroCard';
import StudentMetadataCard from './components/StudentMetadataCard';
import SeatingMiniMap from './components/SeatingMiniMap';
import AudioAlertToggle from './components/AudioAlertToggle';
import IncidentLogTable from './components/IncidentLogTable';
import ProofModal from './components/ProofModal';
import EulerHUDCompass from './components/EulerHUDCompass';
import ExamReportExportModal from './components/ExamReportExportModal';

import { TelemetryPacket, IncidentRecord } from './types/telemetry';
import { audioSynthesizer } from './utils/audioSynthesizer';

export function App() {
  // 1. Initial State from Handover Specification
  const [telemetry, setTelemetry] = useState<TelemetryPacket>({
    desk_id: 'DESK-04',
    student_id: 'STU-042',
    status: 'ALERT',
    traffic_light: {
      green: false,
      amber: false,
      red: true,
    },
    metrics: {
      yaw: 36.2,
      pitch: 11.0,
      roll: -1.5,
      fps: 29,
    },
    integrity_score: 88,
    violation_duration: 2.3,
    audio_alert_trigger: true,
    timestamp: '20:45:10',
  });

  const [isSoundEnabled, setIsSoundEnabled] = useState(true);
  const [totalWarnings, setTotalWarnings] = useState(2);
  const [examSeconds, setExamSeconds] = useState(24 * 60 + 18); // 00:24:18 initial
  const [isAutoSimulating, setIsAutoSimulating] = useState(false);
  const [selectedIncident, setSelectedIncident] = useState<IncidentRecord | null>(null);
  const [isProofModalOpen, setIsProofModalOpen] = useState(false);
  const [isExportModalOpen, setIsExportModalOpen] = useState(false);
  const [showHUDCompass, setShowHUDCompass] = useState(true);

  // 2. Incident Log (Starting with spec-defined baseline items)
  const [incidents, setIncidents] = useState<IncidentRecord[]>([
    {
      id: 'EVT-9042-01',
      timestamp: '20:45:10',
      desk_id: 'Desk #04',
      student_id: 'STU-042',
      type: 'Right Head Glance (36.2°)',
      euler_summary: '(36.2°)',
      yaw: 36.2,
      pitch: 11.0,
      roll: -1.5,
      duration: 2.3,
      severity: 'CRITICAL',
      proof_image: '/src/assets/images/desk_violation_proof_1791710656866.jpg',
      status: 'FLAGGED',
      invigilator_note: 'Persistent lateral gaze toward neighboring row; continuous duration exceeds 2.0s threshold.',
    },
    {
      id: 'EVT-9042-02',
      timestamp: '20:41:02',
      desk_id: 'Desk #04',
      student_id: 'STU-042',
      type: 'Transient Head Tilt (18.1°)',
      euler_summary: '(18.1°)',
      yaw: 18.1,
      pitch: 6.4,
      roll: -0.8,
      duration: 1.1,
      severity: 'WARNING',
      proof_image: '/src/assets/images/desk_exam_stream_1791710644374.jpg',
      status: 'LOGGED',
      invigilator_note: 'Candidate adjusted neck position; resolved under 2 seconds.',
    },
  ]);

  // Format timer into HH:MM:SS
  const formatTimer = (secs: number) => {
    const h = Math.floor(secs / 3600);
    const m = Math.floor((secs % 3600) / 60);
    const s = secs % 60;
    return `${String(h).padStart(2, '0')}:${String(m).padStart(2, '0')}:${String(s).padStart(2, '0')}`;
  };

  // Clock tick
  useEffect(() => {
    const timerInterval = setInterval(() => {
      setExamSeconds((prev) => prev + 1);
    }, 1000);
    return () => clearInterval(timerInterval);
  }, []);

  // Web Audio synthesizer reaction when Red alert is active
  useEffect(() => {
    if (telemetry.status === 'ALERT' && telemetry.audio_alert_trigger && isSoundEnabled) {
      audioSynthesizer.trigger880HzAlertBeep();
    }
  }, [telemetry.status, telemetry.audio_alert_trigger, isSoundEnabled]);

  // 3. Pose / Deviation Trigger Logic
  const handleTriggerDeviation = useCallback((targetStatus: 'NORMAL' | 'WARNING' | 'ALERT') => {
    const now = new Date();
    const timeStr = now.toTimeString().slice(0, 8);

    if (targetStatus === 'NORMAL') {
      setTelemetry((prev) => ({
        ...prev,
        status: 'NORMAL',
        traffic_light: { green: true, amber: false, red: false },
        metrics: {
          yaw: Number((Math.random() * 4 - 2).toFixed(1)),
          pitch: Number((Math.random() * 3 - 1).toFixed(1)),
          roll: Number((Math.random() * 2 - 1).toFixed(1)),
          fps: 29 + Math.floor(Math.random() * 2),
        },
        violation_duration: 0.0,
        audio_alert_trigger: false,
        timestamp: timeStr,
      }));
    } else if (targetStatus === 'WARNING') {
      // Transient Head Tilt < 2.0s
      const duration = 1.2;
      const yawVal = 19.4;
      setTelemetry((prev) => ({
        ...prev,
        status: 'WARNING',
        traffic_light: { green: false, amber: true, red: false },
        metrics: {
          yaw: yawVal,
          pitch: 7.2,
          roll: -1.0,
          fps: 29,
        },
        violation_duration: duration,
        audio_alert_trigger: false,
        timestamp: timeStr,
      }));
    } else if (targetStatus === 'ALERT') {
      // Persistent Violation > 2.0s (Drops integrity score by 5-10% as specified in Feature 2)
      const duration = 2.4;
      const yawVal = 37.8;
      const pitchVal = 12.4;

      setTelemetry((prev) => {
        const nextScore = Math.max(20, prev.integrity_score - (Math.floor(Math.random() * 5) + 5));
        return {
          ...prev,
          status: 'ALERT',
          traffic_light: { green: false, amber: false, red: true },
          metrics: {
            yaw: yawVal,
            pitch: pitchVal,
            roll: -2.1,
            fps: 29,
          },
          integrity_score: nextScore,
          violation_duration: duration,
          audio_alert_trigger: true,
          timestamp: timeStr,
        };
      });

      setTotalWarnings((prev) => prev + 1);

      // Append new event to Incident Feed
      const newIncident: IncidentRecord = {
        id: `EVT-${Date.now().toString().slice(-4)}`,
        timestamp: timeStr,
        desk_id: 'Desk #04',
        student_id: 'STU-042',
        type: `Right Head Glance (${yawVal}°)`,
        euler_summary: `(${yawVal}°)`,
        yaw: yawVal,
        pitch: pitchVal,
        roll: -2.1,
        duration: duration,
        severity: 'CRITICAL',
        proof_image: '/src/assets/images/desk_violation_proof_1791710656866.jpg',
        status: 'FLAGGED',
        invigilator_note: `Candidate continuous right deviation (${duration}s) triggered 880Hz alarm.`,
      };

      setIncidents((prev) => [newIncident, ...prev]);

      if (isSoundEnabled) {
        audioSynthesizer.trigger880HzAlertBeep();
      }
    }
  }, [isSoundEnabled]);

  // 4. Auto Simulation Loop (runs periodic realistic student behaviors)
  useEffect(() => {
    if (!isAutoSimulating) return;

    const interval = setInterval(() => {
      const rand = Math.random();
      if (rand < 0.6) {
        handleTriggerDeviation('NORMAL');
      } else if (rand < 0.85) {
        handleTriggerDeviation('WARNING');
      } else {
        handleTriggerDeviation('ALERT');
      }
    }, 4500);

    return () => clearInterval(interval);
  }, [isAutoSimulating, handleTriggerDeviation]);

  // Micro jitter for FPS and subtle head movement in normal compliance
  useEffect(() => {
    const jitterInterval = setInterval(() => {
      setTelemetry((prev) => {
        if (prev.status === 'NORMAL') {
          return {
            ...prev,
            metrics: {
              ...prev.metrics,
              yaw: Number((Math.sin(Date.now() / 2000) * 3).toFixed(1)),
              pitch: Number((Math.cos(Date.now() / 2500) * 2).toFixed(1)),
              fps: 29 + (Math.random() > 0.5 ? 1 : 0),
            },
          };
        }
        return prev;
      });
    }, 800);

    return () => clearInterval(jitterInterval);
  }, []);

  const handleOpenProof = (incident: IncidentRecord) => {
    setSelectedIncident(incident);
    setIsProofModalOpen(true);
  };

  const handleCaptureManualSnapshot = () => {
    const timeStr = new Date().toTimeString().slice(0, 8);
    const snapRecord: IncidentRecord = {
      id: `SNAP-${Date.now().toString().slice(-4)}`,
      timestamp: timeStr,
      desk_id: 'Desk #04',
      student_id: 'STU-042',
      type: telemetry.status === 'NORMAL' ? 'Proctor Routine Check' : 'Manual Evidence Snapshot',
      euler_summary: `(${telemetry.metrics.yaw}°)`,
      yaw: telemetry.metrics.yaw,
      pitch: telemetry.metrics.pitch,
      roll: telemetry.metrics.roll,
      duration: telemetry.violation_duration || 0.8,
      severity: telemetry.status === 'ALERT' ? 'CRITICAL' : telemetry.status === 'WARNING' ? 'WARNING' : 'RESOLVED',
      proof_image: telemetry.status === 'ALERT'
        ? '/src/assets/images/desk_violation_proof_1791710656866.jpg'
        : '/src/assets/images/desk_exam_stream_1791710644374.jpg',
      status: 'LOGGED',
      invigilator_note: 'Manual camera frame snapshot captured by proctor terminal.',
    };
    setIncidents((prev) => [snapRecord, ...prev]);
    setSelectedIncident(snapRecord);
    setIsProofModalOpen(true);
  };

  const handleUpdateIncidentStatus = (
    incidentId: string,
    newStatus: 'FLAGGED' | 'DISMISSED' | 'REVIEWED',
    note?: string
  ) => {
    setIncidents((prev) =>
      prev.map((item) =>
        item.id === incidentId
          ? { ...item, status: newStatus, invigilator_note: note || item.invigilator_note }
          : item
      )
    );
  };

  return (
    <div className="min-h-screen bg-[#080c14] text-neutral-100 flex flex-col font-sans selection:bg-sky-500/30 selection:text-white">
      {/* ─────────────────────────────────────────────────────────────
          1. MASTER HEADER (Wireframe top bar contract)
          [VISION-GUARD CONSOLE] Exam: CS-302 | Hall: LH-02 | Timer: 00:24:18 | [Alert Sound: ON] [EXPORT]
         ───────────────────────────────────────────────────────────── */}
      <header className="sticky top-0 z-40 bg-[#0c121d]/90 backdrop-blur-md border-b border-neutral-800/80 px-4 lg:px-6 py-3">
        <div className="max-w-[1520px] mx-auto flex flex-col md:flex-row items-start md:items-center justify-between gap-3">
          {/* Brand & Context Breadcrumb */}
          <div className="flex items-center gap-3">
            <div className="flex items-center gap-2">
              <div className="w-2.5 h-2.5 rounded-full bg-emerald-500 shadow-[0_0_8px_#10b981]" />
              <h1 className="text-base font-bold font-mono tracking-tight text-white whitespace-nowrap">
                VISION-GUARD CONSOLE
              </h1>
            </div>

            {/* Contextual Spec Metadata Strip */}
            <div className="hidden sm:flex items-center gap-2 text-xs font-mono text-neutral-400 pl-3 border-l border-neutral-800">
              <span>Exam: <strong className="text-neutral-200">CS-302</strong></span>
              <span className="text-neutral-600">|</span>
              <span>Hall: <strong className="text-neutral-200">LH-02</strong></span>
              <span className="text-neutral-600">|</span>
              <span>Timer: <strong className="text-emerald-400 tabular-nums">{formatTimer(examSeconds)}</strong></span>
            </div>
          </div>

          {/* Right Action Island: Audio Toggle, Telemetry Badge, Export Button */}
          <div className="flex items-center flex-wrap gap-2.5 w-full md:w-auto justify-between md:justify-end">
            {/* Audio Alert Toggle (Point C - Feature 3) */}
            <AudioAlertToggle
              isSoundEnabled={isSoundEnabled}
              onToggleSound={(val: boolean) => setIsSoundEnabled(val)}
            />

            {/* HUD Compass Toggle */}
            <button
              onClick={() => setShowHUDCompass(!showHUDCompass)}
              type="button"
              className={`hidden xl:inline-flex items-center gap-1.5 px-2.5 py-1.5 text-xs font-mono rounded-md border transition-colors cursor-pointer ${
                showHUDCompass
                  ? 'bg-neutral-800 text-neutral-200 border-neutral-700'
                  : 'bg-neutral-900/60 text-neutral-400 border-neutral-800'
              }`}
            >
              <SlidersHorizontal className="w-3.5 h-3.5 text-neutral-400" />
              <span>Euler HUD</span>
            </button>

            {/* Export Report Action */}
            <button
              onClick={() => setIsExportModalOpen(true)}
              type="button"
              className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold rounded-md bg-neutral-800 hover:bg-neutral-700 text-neutral-100 border border-neutral-700 transition-colors cursor-pointer"
            >
              <FileSpreadsheet className="w-3.5 h-3.5 text-sky-400" />
              <span>EXPORT</span>
            </button>
          </div>
        </div>
      </header>

      {/* ─────────────────────────────────────────────────────────────
          2. MAIN WORKSPACE VIEWPORT
         ───────────────────────────────────────────────────────────── */}
      <main className="flex-1 max-w-[1520px] w-full mx-auto p-4 lg:p-6 space-y-6">
        {/* Top 2-Column Grid (Master UI Layout Wireframe) */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-5 items-start">
          {/* Left Column: Live AI Video Stream Card (7 cols) */}
          <div className="lg:col-span-7 xl:col-span-7 space-y-4">
            <VideoHeroCard
              telemetry={telemetry}
              onTriggerDeviation={handleTriggerDeviation}
              onCaptureSnapshot={handleCaptureManualSnapshot}
              isAutoSimulating={isAutoSimulating}
              onToggleAutoSim={setIsAutoSimulating}
            />

            {/* Euler Angles HUD Gauge Dial (Point 2.B HUD telemetry) */}
            {showHUDCompass && (
              <EulerHUDCompass telemetry={telemetry} />
            )}
          </div>

          {/* Right Column: Student Metadata Card & Seating Mini-Map (5 cols) */}
          <div className="lg:col-span-5 xl:col-span-5 space-y-4">
            {/* Student & Bench Console (Point 2.B) */}
            <StudentMetadataCard
              telemetry={telemetry}
              examTimer={formatTimer(examSeconds)}
              totalWarnings={totalWarnings}
              onIssueWarning={() => {
                setTotalWarnings((prev) => prev + 1);
                handleTriggerDeviation('ALERT');
              }}
              onRecalibrate={() => {
                handleTriggerDeviation('NORMAL');
              }}
            />

            {/* Seating Mini-Map Geolocation (Point 2.C - Feature 1) */}
            <SeatingMiniMap
              telemetry={telemetry}
              onSelectDesk={(deskId: string) => {
                if (deskId === 'B4') {
                  // desk 4 selected
                }
              }}
            />
          </div>
        </div>

        {/* ─────────────────────────────────────────────────────────────
            3. AUDIT FEED & RECENT INCIDENTS LOG (Full-Width Bottom Panel)
           ───────────────────────────────────────────────────────────── */}
        <section aria-labelledby="incidents-heading">
          <IncidentLogTable
            incidents={incidents}
            onViewProof={handleOpenProof}
          />
        </section>
      </main>

      {/* ─────────────────────────────────────────────────────────────
          4. FOOTER STATUS BAR
         ───────────────────────────────────────────────────────────── */}
      <footer className="border-t border-neutral-900 bg-[#060910] px-4 lg:px-6 py-3 text-xs font-mono text-neutral-400">
        <div className="max-w-[1520px] mx-auto flex flex-col sm:flex-row items-center justify-between gap-2">
          <div className="flex items-center gap-3">
            <span>VISION-GUARD AI · Single-Desk Phase-1 Console</span>
            <span className="text-neutral-700">|</span>
            <span>solvePnP Ray Tracking: ACTIVE</span>
          </div>
          <div className="flex items-center gap-3">
            <span className="text-neutral-400">Station ID: INVIGILATOR-01</span>
            <span className="text-neutral-700">|</span>
            <span>Hall LH-02 · North Wing</span>
          </div>
        </div>
      </footer>

      {/* Proof Modal Dialog (Point 2.D) */}
      <ProofModal
        isOpen={isProofModalOpen}
        onClose={() => setIsProofModalOpen(false)}
        incident={selectedIncident}
        onUpdateStatus={handleUpdateIncidentStatus}
      />

      {/* Exam Session Report Export Dialog */}
      <ExamReportExportModal
        isOpen={isExportModalOpen}
        onClose={() => setIsExportModalOpen(false)}
        telemetry={telemetry}
        incidents={incidents}
        examTimer={formatTimer(examSeconds)}
        totalWarnings={totalWarnings}
      />
    </div>
  );
}

export default App;
