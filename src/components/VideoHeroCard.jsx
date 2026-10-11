import React, { useRef, useEffect, useState } from 'react';
import { Camera, RefreshCw } from 'lucide-react';

export const VideoHeroCard = ({
  telemetry,
  onTriggerDeviation,
  onCaptureSnapshot,
  isAutoSimulating,
  onToggleAutoSim,
}) => {
  const canvasRef = useRef(null);
  const videoElemRef = useRef(null);
  const [useWebcam, setUseWebcam] = useState(false);
  const [webcamError, setWebcamError] = useState(null);

  const { traffic_light, metrics, status, violation_duration } = telemetry;
  const isRed = traffic_light.red;
  const isAmber = traffic_light.amber;
  const isGreen = traffic_light.green;

  // Webcam stream activation
  useEffect(() => {
    let stream = null;
    if (useWebcam) {
      navigator.mediaDevices
        ?.getUserMedia({ video: { width: 1280, height: 720 }, audio: false })
        .then((s) => {
          stream = s;
          if (videoElemRef.current) {
            videoElemRef.current.srcObject = s;
            videoElemRef.current.play().catch(() => {});
          }
          setWebcamError(null);
        })
        .catch(() => {
          setWebcamError('Camera access not granted or unavailable in this environment.');
          setUseWebcam(false);
        });
    } else {
      if (videoElemRef.current && videoElemRef.current.srcObject) {
        const s = videoElemRef.current.srcObject;
        s.getTracks().forEach((t) => t.stop());
        videoElemRef.current.srcObject = null;
      }
    }

    return () => {
      if (stream) {
        stream.getTracks().forEach((t) => t.stop());
      }
    };
  }, [useWebcam]);

  // Real-time canvas render for solvePnP head vector ray & 3D face mesh
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let animId;

    const render = () => {
      const width = canvas.width;
      const height = canvas.height;
      ctx.clearRect(0, 0, width, height);

      // Face center coordinates on Desk #04 candidate (student in front)
      // When yaw > 0, looking right; when yaw < 0, looking left
      const centerX = width * 0.64;
      const centerY = height * 0.44;

      // Dynamic head box offset based on Euler angles
      const yawRad = (metrics.yaw * Math.PI) / 180;
      const pitchRad = (metrics.pitch * Math.PI) / 180;
      const rollRad = (metrics.roll * Math.PI) / 180;

      // Color scheme based on status
      let strokeColor = 'rgba(16, 185, 129, 0.85)'; // Green
      let fillColor = 'rgba(16, 185, 129, 0.12)';
      let rayColor = '#10b981';

      if (isRed) {
        strokeColor = 'rgba(239, 68, 68, 0.95)'; // Red
        fillColor = 'rgba(239, 68, 68, 0.2)';
        rayColor = '#ef4444';
      } else if (isAmber) {
        strokeColor = 'rgba(245, 158, 11, 0.9)'; // Amber
        fillColor = 'rgba(245, 158, 11, 0.15)';
        rayColor = '#f59e0b';
      }

      ctx.save();
      ctx.translate(centerX, centerY);
      ctx.rotate(rollRad);

      const boxW = width * 0.18;
      const boxH = height * 0.32;

      // 1. Draw 3D Face Bounding Box
      ctx.strokeStyle = strokeColor;
      ctx.lineWidth = 2;
      ctx.fillStyle = fillColor;
      ctx.strokeRect(-boxW / 2, -boxH / 2, boxW, boxH);
      ctx.fillRect(-boxW / 2, -boxH / 2, boxW, boxH);

      // Corner markers on bounding box
      const cLen = 14;
      ctx.strokeStyle = isRed ? '#f87171' : isAmber ? '#fbbf24' : '#34d399';
      ctx.lineWidth = 3;

      // Top Left
      ctx.beginPath();
      ctx.moveTo(-boxW / 2, -boxH / 2 + cLen);
      ctx.lineTo(-boxW / 2, -boxH / 2);
      ctx.lineTo(-boxW / 2 + cLen, -boxH / 2);
      ctx.stroke();

      // Top Right
      ctx.beginPath();
      ctx.moveTo(boxW / 2 - cLen, -boxH / 2);
      ctx.lineTo(boxW / 2, -boxH / 2);
      ctx.lineTo(boxW / 2, -boxH / 2 + cLen);
      ctx.stroke();

      // Bottom Left
      ctx.beginPath();
      ctx.moveTo(-boxW / 2, boxH / 2 - cLen);
      ctx.lineTo(-boxW / 2, boxH / 2);
      ctx.lineTo(-boxW / 2 + cLen, boxH / 2);
      ctx.stroke();

      // Bottom Right
      ctx.beginPath();
      ctx.moveTo(boxW / 2 - cLen, boxH / 2);
      ctx.lineTo(boxW / 2, -boxH / 2);
      ctx.lineTo(boxW / 2, -boxH / 2 - cLen);
      ctx.stroke();

      // 2. Face Mesh Landmarks (Nose, Eyes, Mouth contour simulation)
      const noseShiftX = Math.sin(yawRad) * (boxW * 0.4);
      const noseShiftY = Math.sin(pitchRad) * (boxH * 0.3);

      ctx.strokeStyle = isRed ? 'rgba(239, 68, 68, 0.6)' : isAmber ? 'rgba(245, 158, 11, 0.6)' : 'rgba(56, 189, 248, 0.5)';
      ctx.lineWidth = 1;

      // Eye line
      ctx.beginPath();
      ctx.moveTo(-boxW * 0.35 + noseShiftX * 0.5, -boxH * 0.15 + noseShiftY * 0.5);
      ctx.lineTo(boxW * 0.35 + noseShiftX * 0.5, -boxH * 0.15 + noseShiftY * 0.5);
      ctx.stroke();

      // Nose bridge line
      ctx.beginPath();
      ctx.moveTo(noseShiftX * 0.3, -boxH * 0.15 + noseShiftY * 0.5);
      ctx.lineTo(noseShiftX, noseShiftY);
      ctx.stroke();

      // Mouth line
      ctx.beginPath();
      ctx.moveTo(-boxW * 0.25 + noseShiftX * 0.4, boxH * 0.22 + noseShiftY * 0.7);
      ctx.lineTo(boxW * 0.25 + noseShiftX * 0.4, boxH * 0.22 + noseShiftY * 0.7);
      ctx.stroke();

      // Chin point
      ctx.beginPath();
      ctx.arc(noseShiftX * 0.2, boxH * 0.4 + noseShiftY * 0.8, 2, 0, Math.PI * 2);
      ctx.fillStyle = rayColor;
      ctx.fill();

      // 3. solvePnP Head Vector Ray Projection (Z-axis Gaze Vector)
      const rayLength = width * 0.24;
      const rayEndX = noseShiftX + Math.sin(yawRad) * rayLength;
      const rayEndY = noseShiftY - Math.sin(pitchRad) * rayLength * 0.5;

      ctx.strokeStyle = rayColor;
      ctx.lineWidth = 3;
      ctx.setLineDash(isRed ? [6, 4] : []);
      ctx.beginPath();
      ctx.moveTo(noseShiftX, noseShiftY);
      ctx.lineTo(rayEndX, rayEndY);
      ctx.stroke();
      ctx.setLineDash([]);

      // Ray tip arrow / targeting head
      ctx.fillStyle = rayColor;
      ctx.beginPath();
      ctx.arc(rayEndX, rayEndY, 5, 0, Math.PI * 2);
      ctx.fill();

      // Ray target reticle if in deviation
      if (isAmber || isRed) {
        ctx.strokeStyle = rayColor;
        ctx.lineWidth = 1.5;
        ctx.beginPath();
        ctx.arc(rayEndX, rayEndY, 12, 0, Math.PI * 2);
        ctx.stroke();
      }

      ctx.restore();

      // 4. On-canvas Violation Strobe or Warning Banner
      if (isRed) {
        ctx.fillStyle = 'rgba(239, 68, 68, 0.85)';
        ctx.fillRect(20, 20, 290, 32);
        ctx.fillStyle = '#ffffff';
        ctx.font = 'bold 12px monospace';
        ctx.fillText(`! VIOLATION >2.0s: ${violation_duration.toFixed(1)}s`, 32, 41);
      } else if (isAmber) {
        ctx.fillStyle = 'rgba(245, 158, 11, 0.85)';
        ctx.fillRect(20, 20, 260, 32);
        ctx.fillStyle = '#ffffff';
        ctx.font = 'bold 12px monospace';
        ctx.fillText(`TRANSIENT DEV: ${violation_duration.toFixed(1)}s <2.0s`, 32, 41);
      }

      animId = requestAnimationFrame(render);
    };

    animId = requestAnimationFrame(render);

    return () => {
      cancelAnimationFrame(animId);
    };
  }, [metrics, isRed, isAmber, isGreen, violation_duration]);

  return (
    <div className="bg-neutral-900/60 border border-neutral-800 rounded-xl overflow-hidden flex flex-col shadow-lg">
      {/* Stream Header & Active Indicator */}
      <div className="px-4 py-3 bg-neutral-900/90 border-b border-neutral-800 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-2">
            <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-pulse" />
            <h3 className="text-sm font-bold font-mono tracking-tight text-neutral-100">
              [Desk #04: Active]
            </h3>
          </div>
          <span className="hidden sm:inline-block text-xs font-mono text-neutral-400">
            Node: CAM-LH02-04 · solvePnP Mesh
          </span>
        </div>

        {/* Traffic-Light 3-Dot Widget (Point 2.A) */}
        <div className="flex items-center gap-3 bg-neutral-950/90 px-3 py-1.5 rounded-lg border border-neutral-800/80">
          <span className="text-[11px] font-mono text-neutral-400 uppercase tracking-wider hidden xs:inline">
            Status
          </span>
          <div className="flex items-center gap-2.5">
            {/* Green Dot: Glows when candidate is facing forward in focused compliance */}
            <div
              className={`w-3.5 h-3.5 rounded-full transition-all duration-300 ${
                isGreen
                  ? 'bg-emerald-500 shadow-[0_0_12px_#10b981] opacity-100 scale-110 ring-2 ring-emerald-400/50'
                  : 'bg-emerald-950 border border-emerald-900/60 opacity-25'
              }`}
              title="Green Dot: Facing forward in focused compliance"
            />

            {/* Amber Dot: Pulses when head deviation is detected for duration < 2.0s */}
            <div
              className={`w-3.5 h-3.5 rounded-full transition-all duration-300 ${
                isAmber
                  ? 'bg-amber-400 shadow-[0_0_14px_#f59e0b] opacity-100 scale-110 animate-pulse ring-2 ring-amber-400/60'
                  : 'bg-amber-950 border border-amber-900/60 opacity-25'
              }`}
              title="Amber Dot: Head deviation detected (< 2.0s)"
            />

            {/* Red Dot: Flashes/strobes when continuous violation exceeds 2.0 seconds */}
            <div
              className={`w-3.5 h-3.5 rounded-full transition-all duration-200 ${
                isRed
                  ? 'bg-rose-500 shadow-[0_0_18px_#ef4444] opacity-100 scale-125 animate-ping ring-2 ring-rose-400'
                  : 'bg-rose-950 border border-rose-900/60 opacity-25'
              }`}
              title="Red Dot: Continuous violation exceeds 2.0 seconds"
            />
          </div>
        </div>
      </div>

      {/* Hero Video Canvas Container */}
      <div className="relative aspect-video bg-black overflow-hidden select-none">
        {/* Background Stream: Simulated high-res CCTV or Real Webcam */}
        {useWebcam ? (
          <video
            ref={videoElemRef}
            playsInline
            muted
            className="w-full h-full object-cover"
          />
        ) : (
          <img
            src="/src/assets/images/desk_exam_stream_1791710644374.jpg"
            alt="Live stream from Desk #04"
            className="w-full h-full object-cover"
            referrerPolicy="no-referrer"
          />
        )}

        {/* CRT Scanline & Lens Vignette Overlay */}
        <div className="absolute inset-0 bg-radial from-transparent via-transparent to-black/60 pointer-events-none" />

        {/* 3D solvePnP & Face Mesh Canvas Overlay */}
        <canvas
          ref={canvasRef}
          width={960}
          height={540}
          className="absolute inset-0 w-full h-full pointer-events-none"
        />

        {/* Live HUD Telemetry Overlay (Bottom Strip) */}
        <div className="absolute bottom-3 left-3 right-3 flex flex-wrap items-center justify-between gap-2 pointer-events-none">
          <div className="bg-neutral-950/85 backdrop-blur-md px-3 py-1.5 rounded-md border border-neutral-800 text-xs font-mono text-neutral-200 flex items-center gap-2">
            <span className="text-sky-400 font-semibold">HUD</span>
            <span className="text-neutral-500">·</span>
            <span>
              Yaw:{' '}
              <strong className={Math.abs(metrics.yaw) > 25 ? 'text-amber-400' : 'text-neutral-100'}>
                {metrics.yaw > 0 ? `+${metrics.yaw.toFixed(1)}°` : `${metrics.yaw.toFixed(1)}°`}
              </strong>
            </span>
            <span className="text-neutral-500">·</span>
            <span>
              Pitch:{' '}
              <strong className="text-neutral-100">
                {metrics.pitch > 0 ? `+${metrics.pitch.toFixed(1)}°` : `${metrics.pitch.toFixed(1)}°`}
              </strong>
            </span>
            <span className="text-neutral-500">·</span>
            <span>
              Roll:{' '}
              <strong className="text-neutral-100">
                {metrics.roll > 0 ? `+${metrics.roll.toFixed(1)}°` : `${metrics.roll.toFixed(1)}°`}
              </strong>
            </span>
            <span className="text-neutral-500">·</span>
            <span>
              FPS: <strong className="text-emerald-400 tabular-nums">{metrics.fps}</strong>
            </span>
          </div>

          <div className="bg-neutral-950/85 backdrop-blur-md px-2.5 py-1.5 rounded-md border border-neutral-800 text-[11px] font-mono text-neutral-400 flex items-center gap-2">
            <span>solvePnP / 6-DoF</span>
            <span className="text-neutral-600">|</span>
            <span>{useWebcam ? 'LIVE CAMERA' : 'STREAM: /video_feed'}</span>
          </div>
        </div>
      </div>

      {/* Bottom Toolstrip: Simulation & Camera Control Bar */}
      <div className="p-3 bg-neutral-950/80 border-t border-neutral-800 flex flex-wrap items-center justify-between gap-2 text-xs">
        {/* Quick Simulation Trigger Buttons */}
        <div className="flex items-center flex-wrap gap-1.5 font-mono">
          <span className="text-neutral-400 text-[11px] mr-1 hidden sm:inline">Simulate Pose:</span>

          <button
            onClick={() => onTriggerDeviation('NORMAL')}
            type="button"
            className={`px-2.5 py-1 rounded text-xs font-medium border transition-colors cursor-pointer ${
              status === 'NORMAL'
                ? 'bg-emerald-950 text-emerald-300 border-emerald-600'
                : 'bg-neutral-900 text-neutral-400 border-neutral-800 hover:text-neutral-200 hover:bg-neutral-800'
            }`}
          >
            Nominal (0°)
          </button>

          <button
            onClick={() => onTriggerDeviation('WARNING')}
            type="button"
            className={`px-2.5 py-1 rounded text-xs font-medium border transition-colors cursor-pointer ${
              status === 'WARNING'
                ? 'bg-amber-950 text-amber-300 border-amber-600 animate-pulse'
                : 'bg-neutral-900 text-neutral-400 border-neutral-800 hover:text-amber-300 hover:bg-neutral-800'
            }`}
          >
            Glance &lt;2.0s
          </button>

          <button
            onClick={() => onTriggerDeviation('ALERT')}
            type="button"
            className={`px-2.5 py-1 rounded text-xs font-medium border transition-colors cursor-pointer ${
              status === 'ALERT'
                ? 'bg-rose-950 text-rose-300 border-rose-600 animate-pulse'
                : 'bg-neutral-900 text-neutral-400 border-neutral-800 hover:text-rose-300 hover:bg-neutral-800'
            }`}
          >
            Violation &gt;2.0s (880Hz)
          </button>
        </div>

        {/* Right Tools: Auto Mode, Camera Toggle, Manual Snapshot */}
        <div className="flex items-center gap-2">
          {/* Auto Loop Simulation Toggle */}
          <button
            onClick={() => onToggleAutoSim(!isAutoSimulating)}
            type="button"
            className={`px-2.5 py-1 rounded text-xs font-mono font-medium border transition-colors cursor-pointer flex items-center gap-1.5 ${
              isAutoSimulating
                ? 'bg-sky-950/80 text-sky-300 border-sky-700'
                : 'bg-neutral-900 text-neutral-400 border-neutral-800 hover:text-neutral-200'
            }`}
            title="Automatically run periodic exam candidate behavior simulation"
          >
            <RefreshCw className={`w-3 h-3 ${isAutoSimulating ? 'animate-spin' : ''}`} />
            <span>{isAutoSimulating ? 'Auto Mode: ON' : 'Auto Mode: OFF'}</span>
          </button>

          {/* Webcam Toggle */}
          <button
            onClick={() => setUseWebcam(!useWebcam)}
            type="button"
            className={`px-2.5 py-1 rounded text-xs font-mono font-medium border transition-colors cursor-pointer flex items-center gap-1.5 ${
              useWebcam
                ? 'bg-purple-950 text-purple-300 border-purple-700'
                : 'bg-neutral-900 text-neutral-400 border-neutral-800 hover:text-neutral-200'
            }`}
            title="Toggle user webcam feed for testing"
          >
            <Camera className="w-3 h-3" />
            <span className="hidden sm:inline">{useWebcam ? 'Webcam' : 'Sim Stream'}</span>
          </button>

          {/* Capture Snapshot Button */}
          {onCaptureSnapshot && (
            <button
              onClick={onCaptureSnapshot}
              type="button"
              className="px-2.5 py-1 rounded text-xs font-medium bg-neutral-800 hover:bg-neutral-700 text-neutral-200 border border-neutral-700 transition-colors cursor-pointer"
              title="Capture instant violation proof frame"
            >
              Capture Frame
            </button>
          )}
        </div>
      </div>
      {webcamError && (
        <div className="px-4 py-1.5 bg-rose-950/70 text-rose-300 text-xs font-mono border-t border-rose-900/50">
          {webcamError}
        </div>
      )}
    </div>
  );
};

export default VideoHeroCard;
