import React, { useState } from 'react';
import { Navigation } from 'lucide-react';

export const SeatingMiniMap = ({
  telemetry,
  onSelectDesk,
}) => {
  const [hoveredDesk, setHoveredDesk] = useState(null);

  // 3x4 Hall Blueprint Grid (Rows A, B, C; Aisles 1, 2, 3, 4)
  // Desk #04 is pinned as B4 (STU-042)
  const desks = [
    { id: 'A1', desk_label: 'Desk #01', row: 'Row A', aisle: 1, student_id: 'STU-011', student_name: 'Priya N.', status: 'COMPLIANT' },
    { id: 'A2', desk_label: 'Desk #02', row: 'Row A', aisle: 2, student_id: 'STU-019', student_name: 'Rohan K.', status: 'COMPLIANT' },
    { id: 'A3', desk_label: 'Desk #03', row: 'Row A', aisle: 3, student_id: 'STU-027', student_name: 'Ananya S.', status: 'COMPLIANT' },
    { id: 'A4', desk_label: 'Desk #04-A', row: 'Row A', aisle: 4, student_id: 'STU-031', student_name: 'Vikram M.', status: 'COMPLIANT' },

    { id: 'B1', desk_label: 'Desk #05', row: 'Row B', aisle: 1, student_id: 'STU-038', student_name: 'Tanvi G.', status: 'COMPLIANT' },
    { id: 'B2', desk_label: 'Desk #06', row: 'Row B', aisle: 2, student_id: 'STU-039', student_name: 'Karan J.', status: 'COMPLIANT' },
    { id: 'B3', desk_label: 'Desk #07', row: 'Row B', aisle: 3, student_id: 'STU-041', student_name: 'Neha R.', status: 'COMPLIANT' },
    {
      id: 'B4',
      desk_label: 'Desk #04',
      row: 'Row B',
      aisle: 4,
      student_id: 'STU-042',
      student_name: 'Candidate (Monitored)',
      status: telemetry.status === 'ALERT' ? 'ALERT' : telemetry.status === 'WARNING' ? 'WARNING' : 'COMPLIANT',
      is_selected: true,
    },

    { id: 'C1', desk_label: 'Desk #09', row: 'Row C', aisle: 1, student_id: 'STU-052', student_name: 'Aditya P.', status: 'COMPLIANT' },
    { id: 'C2', desk_label: 'Desk #10', row: 'Row C', aisle: 2, student_id: 'STU-058', student_name: 'Sneha D.', status: 'COMPLIANT' },
    { id: 'C3', desk_label: 'Desk #11', row: 'Row C', aisle: 3, student_id: 'STU-063', student_name: 'Rahul V.', status: 'COMPLIANT' },
    { id: 'C4', desk_label: 'Desk #12', row: 'Row C', aisle: 4, student_id: 'STU-070', student_name: 'Divya M.', status: 'COMPLIANT' },
  ];

  // Desk #04 status styling based on live telemetry
  const isDesk4Alert = telemetry.traffic_light.red;
  const isDesk4Warning = telemetry.traffic_light.amber;

  const getDeskColor = (desk) => {
    if (desk.id === 'B4') {
      if (isDesk4Alert) {
        return 'bg-rose-950 text-rose-200 border-rose-500 shadow-[0_0_15px_rgba(244,63,94,0.6)] animate-pulse ring-2 ring-rose-500/80';
      }
      if (isDesk4Warning) {
        return 'bg-amber-950 text-amber-200 border-amber-500 shadow-[0_0_12px_rgba(245,158,11,0.5)] animate-pulse ring-2 ring-amber-500/60';
      }
      return 'bg-emerald-950 text-emerald-200 border-emerald-500 shadow-[0_0_12px_rgba(16,185,129,0.4)] ring-2 ring-emerald-500/50';
    }

    return 'bg-neutral-900/90 text-neutral-400 border-neutral-800 hover:border-neutral-700 hover:text-neutral-200 hover:bg-neutral-800/80';
  };

  return (
    <div className="bg-neutral-900/60 border border-neutral-800 rounded-xl p-4 flex flex-col justify-between">
      {/* Blueprint Header */}
      <div className="flex items-center justify-between pb-3 border-b border-neutral-800">
        <div className="flex items-center gap-2">
          <div className="p-1.5 rounded-md bg-neutral-800 border border-neutral-700 text-sky-400">
            <Navigation className="w-3.5 h-3.5" />
          </div>
          <div>
            <h4 className="text-xs font-bold text-neutral-100 font-mono tracking-tight flex items-center gap-2">
              <span>SEATING MINI-MAP</span>
              <span className="text-[10px] text-neutral-400 font-normal">LH-02 Floorplan</span>
            </h4>
            <p className="text-[11px] text-neutral-400 font-mono">
              3×4 Hall Grid · Desk #04 Pinned Geolocation
            </p>
          </div>
        </div>

        {/* Dynamic status pill for pinned desk */}
        <div className="flex items-center gap-1.5 text-[11px] font-mono">
          <span className="text-neutral-400">Desk 04:</span>
          {isDesk4Alert ? (
            <span className="px-1.5 py-0.5 rounded bg-rose-950/80 text-rose-300 border border-rose-800 font-semibold animate-pulse">
              ALERT
            </span>
          ) : isDesk4Warning ? (
            <span className="px-1.5 py-0.5 rounded bg-amber-950/80 text-amber-300 border border-amber-800 font-semibold">
              DEV &lt;2s
            </span>
          ) : (
            <span className="px-1.5 py-0.5 rounded bg-emerald-950/80 text-emerald-300 border border-emerald-800 font-semibold">
              NOMINAL
            </span>
          )}
        </div>
      </div>

      {/* 2D Hall Blueprint Architecture Visualizer */}
      <div className="my-3 p-3 rounded-lg bg-neutral-950/80 border border-neutral-800/90 relative">
        {/* Invigilator Podium / Stage Marker */}
        <div className="w-full mb-3 flex items-center justify-between px-2 py-1 bg-neutral-900/80 rounded border border-neutral-800 text-[10px] font-mono text-neutral-400">
          <div className="flex items-center gap-1.5">
            <div className="w-1.5 h-1.5 rounded-full bg-sky-400" />
            <span className="tracking-wider">INVIGILATOR PODIUM & BOARD</span>
          </div>
          <span className="text-[9px] text-neutral-400">FRONT OF HALL</span>
        </div>

        {/* 3x4 Desks Grid */}
        <div className="grid grid-cols-4 gap-2">
          {desks.map((desk) => {
            const isPinned = desk.id === 'B4';
            return (
              <button
                key={desk.id}
                onClick={() => onSelectDesk && onSelectDesk(desk.id)}
                onMouseEnter={() => setHoveredDesk(desk.id)}
                onMouseLeave={() => setHoveredDesk(null)}
                type="button"
                className={`relative p-2 rounded-lg border text-center transition-all cursor-pointer font-mono ${getDeskColor(
                  desk
                )}`}
              >
                {/* Pinned Marker Badge */}
                {isPinned && (
                  <span className="absolute -top-1.5 -right-1.5 flex h-3.5 w-3.5">
                    <span
                      className={`animate-ping absolute inline-flex h-full w-full rounded-full opacity-75 ${
                        isDesk4Alert
                          ? 'bg-rose-400'
                          : isDesk4Warning
                          ? 'bg-amber-400'
                          : 'bg-emerald-400'
                      }`}
                    />
                    <span
                      className={`relative inline-flex rounded-full h-3.5 w-3.5 text-[8px] font-bold text-white items-center justify-center ${
                        isDesk4Alert
                          ? 'bg-rose-600'
                          : isDesk4Warning
                          ? 'bg-amber-600'
                          : 'bg-emerald-600'
                      }`}
                    >
                      ★
                    </span>
                  </span>
                )}

                <div className="text-[11px] font-bold leading-none">
                  {desk.id === 'B4' ? 'Desk 04' : desk.id}
                </div>
                <div className="text-[9px] text-neutral-400 mt-1 leading-none">
                  {desk.student_id ? desk.student_id : 'Empty'}
                </div>
              </button>
            );
          })}
        </div>

        {/* Hall Exit Door & Aisle Marker */}
        <div className="mt-2.5 pt-2 border-t border-neutral-800/80 flex items-center justify-between text-[10px] font-mono text-neutral-400">
          <span>Row A · Row B · Row C</span>
          <span className="text-neutral-400 flex items-center gap-1">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-500/70" />
            EXIT / ENTRANCE
          </span>
        </div>
      </div>

      {/* Blueprint Legend & Metadata */}
      <div className="flex items-center justify-between text-[11px] font-mono text-neutral-400 pt-1">
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-1.5">
            <span className="w-2 h-2 rounded-full bg-emerald-500" />
            <span>Compliant</span>
          </div>
          <div className="flex items-center gap-1.5">
            <span className="w-2 h-2 rounded-full bg-amber-500" />
            <span>Dev &lt;2s</span>
          </div>
          <div className="flex items-center gap-1.5">
            <span className="w-2 h-2 rounded-full bg-rose-500" />
            <span>Violation</span>
          </div>
        </div>
        <span className="text-neutral-400">12 Desks Total</span>
      </div>
    </div>
  );
};

export default SeatingMiniMap;
