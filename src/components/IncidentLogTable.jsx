import React, { useState } from 'react';
import { ShieldAlert, AlertTriangle, Eye, Download, Search } from 'lucide-react';

export const IncidentLogTable = ({
  incidents,
  onViewProof,
}) => {
  const [filterSeverity, setFilterSeverity] = useState('ALL');
  const [searchQuery, setSearchQuery] = useState('');

  const filteredIncidents = incidents.filter((item) => {
    const matchesFilter = filterSeverity === 'ALL' || item.severity === filterSeverity;
    const matchesSearch =
      searchQuery === '' ||
      item.type.toLowerCase().includes(searchQuery.toLowerCase()) ||
      item.timestamp.includes(searchQuery) ||
      item.desk_id.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesFilter && matchesSearch;
  });

  const handleExportCSV = () => {
    if (incidents.length === 0) return;
    const headers = ['ID', 'Timestamp', 'Desk', 'Candidate', 'Incident Type', 'Euler Summary', 'Yaw', 'Pitch', 'Duration (s)', 'Severity', 'Status'];
    const rows = incidents.map((item) => [
      item.id,
      item.timestamp,
      item.desk_id,
      item.student_id,
      `"${item.type}"`,
      `"${item.euler_summary}"`,
      item.yaw,
      item.pitch,
      item.duration,
      item.severity,
      item.status,
    ]);

    const csvContent = [headers.join(','), ...rows.map((r) => r.join(','))].join('\n');
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    link.href = URL.createObjectURL(blob);
    link.download = `VISION_GUARD_LOG_DESK04_${new Date().toISOString().slice(0, 10)}.csv`;
    link.click();
  };

  return (
    <div className="bg-neutral-900/60 border border-neutral-800 rounded-xl overflow-hidden flex flex-col">
      {/* Table Header Bar */}
      <div className="p-4 border-b border-neutral-800 flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-neutral-900/80">
        <div>
          <div className="flex items-center gap-2">
            <h3 className="text-sm font-semibold text-neutral-100 tracking-tight">
              Real-Time Incident Audit Feed
            </h3>
            <span className="font-mono text-xs px-2 py-0.5 rounded bg-neutral-800 text-neutral-300 border border-neutral-700/60 tabular-nums">
              {incidents.length} Events
            </span>
          </div>
          <p className="text-xs text-neutral-400 mt-0.5">
            Append-only temporal anomaly ledger tracked by solvePnP head deviation filters
          </p>
        </div>

        {/* Filter & Export Controls */}
        <div className="flex items-center flex-wrap gap-2">
          {/* Search Box */}
          <div className="relative">
            <Search className="w-3.5 h-3.5 text-neutral-500 absolute left-2.5 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search feed..."
              className="pl-8 pr-2.5 py-1 text-xs font-mono bg-neutral-950 border border-neutral-800 rounded-md text-neutral-200 placeholder:text-neutral-500 focus:outline-none focus:border-neutral-600 w-32 sm:w-36 transition-colors"
            />
          </div>

          {/* Severity Segmented Filter */}
          <div className="flex items-center p-0.5 bg-neutral-950 border border-neutral-800 rounded-md">
            <button
              onClick={() => setFilterSeverity('ALL')}
              type="button"
              className={`px-2 py-1 text-[11px] font-medium rounded transition-colors cursor-pointer ${
                filterSeverity === 'ALL'
                  ? 'bg-neutral-800 text-neutral-100 shadow-sm'
                  : 'text-neutral-400 hover:text-neutral-200'
              }`}
            >
              All
            </button>
            <button
              onClick={() => setFilterSeverity('CRITICAL')}
              type="button"
              className={`px-2 py-1 text-[11px] font-medium rounded transition-colors cursor-pointer ${
                filterSeverity === 'CRITICAL'
                  ? 'bg-rose-950 text-rose-300 border border-rose-800/40'
                  : 'text-neutral-400 hover:text-neutral-200'
              }`}
            >
              Critical
            </button>
            <button
              onClick={() => setFilterSeverity('WARNING')}
              type="button"
              className={`px-2 py-1 text-[11px] font-medium rounded transition-colors cursor-pointer ${
                filterSeverity === 'WARNING'
                  ? 'bg-amber-950 text-amber-300 border border-amber-800/40'
                  : 'text-neutral-400 hover:text-neutral-200'
              }`}
            >
              Warning
            </button>
          </div>

          {/* Export CSV button */}
          <button
            onClick={handleExportCSV}
            type="button"
            className="inline-flex items-center gap-1.5 px-2.5 py-1 text-xs font-medium rounded-md bg-neutral-800 hover:bg-neutral-700 text-neutral-200 border border-neutral-700 transition-colors cursor-pointer"
            title="Download incident log as CSV"
          >
            <Download className="w-3.5 h-3.5 text-neutral-400" />
            <span className="hidden sm:inline">Export CSV</span>
          </button>
        </div>
      </div>

      {/* Table Content */}
      <div className="overflow-x-auto">
        <table className="w-full text-left text-xs">
          <thead>
            <tr className="border-b border-neutral-800 bg-neutral-950/70 text-neutral-400 font-mono text-[11px]">
              <th className="py-2.5 px-4 font-medium">Timestamp</th>
              <th className="py-2.5 px-3 font-medium">Desk & Candidate</th>
              <th className="py-2.5 px-3 font-medium">Incident Classification</th>
              <th className="py-2.5 px-3 font-medium">Duration</th>
              <th className="py-2.5 px-3 font-medium">Euler Angle</th>
              <th className="py-2.5 px-3 font-medium">Severity</th>
              <th className="py-2.5 px-4 font-medium text-right">Evidence Action</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-neutral-800/70 font-mono">
            {filteredIncidents.length === 0 ? (
              <tr>
                <td colSpan={7} className="py-8 text-center text-neutral-500 font-mono">
                  {searchQuery || filterSeverity !== 'ALL'
                    ? 'No incidents match current filter.'
                    : 'No violations detected. Candidate is fully compliant.'}
                </td>
              </tr>
            ) : (
              filteredIncidents.map((inc) => {
                const isCritical = inc.severity === 'CRITICAL';
                return (
                  <tr
                    key={inc.id}
                    className={`hover:bg-neutral-800/40 transition-colors ${
                      isCritical ? 'bg-rose-950/15' : ''
                    }`}
                  >
                    {/* Timestamp */}
                    <td className="py-3 px-4 font-mono text-neutral-300 tabular-nums whitespace-nowrap">
                      <span className="text-neutral-500">[{inc.timestamp}]</span>
                    </td>

                    {/* Desk & Candidate */}
                    <td className="py-3 px-3 whitespace-nowrap">
                      <div className="font-semibold text-neutral-200">{inc.desk_id}</div>
                      <div className="text-[10px] text-neutral-400">{inc.student_id}</div>
                    </td>

                    {/* Incident Type */}
                    <td className="py-3 px-3">
                      <div className="font-medium text-neutral-200">{inc.type}</div>
                      {inc.invigilator_note && (
                        <div className="text-[10px] text-neutral-400 truncate max-w-xs">
                          Note: {inc.invigilator_note}
                        </div>
                      )}
                    </td>

                    {/* Duration */}
                    <td className="py-3 px-3 tabular-nums whitespace-nowrap">
                      <span
                        className={
                          inc.duration >= 2.0
                            ? 'text-rose-400 font-semibold'
                            : 'text-amber-400'
                        }
                      >
                        {inc.duration.toFixed(1)}s
                      </span>
                    </td>

                    {/* Euler Angle */}
                    <td className="py-3 px-3 tabular-nums whitespace-nowrap">
                      <span className="text-neutral-300">
                        {inc.yaw > 0 ? `+${inc.yaw.toFixed(1)}°` : `${inc.yaw.toFixed(1)}°`}
                      </span>
                      <span className="text-neutral-500 text-[10px] ml-1">
                        (Pitch {inc.pitch.toFixed(1)}°)
                      </span>
                    </td>

                    {/* Severity Badge */}
                    <td className="py-3 px-3 whitespace-nowrap">
                      {isCritical ? (
                        <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-[10px] font-semibold bg-rose-950/80 text-rose-300 border border-rose-800/60">
                          <ShieldAlert className="w-3 h-3 text-rose-400" />
                          <span>CRITICAL</span>
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-[10px] font-semibold bg-amber-950/80 text-amber-300 border border-amber-800/60">
                          <AlertTriangle className="w-3 h-3 text-amber-400" />
                          <span>WARNING</span>
                        </span>
                      )}
                    </td>

                    {/* Action Button */}
                    <td className="py-3 px-4 text-right whitespace-nowrap">
                      <button
                        onClick={() => onViewProof(inc)}
                        type="button"
                        className={`inline-flex items-center gap-1 px-2.5 py-1 text-xs font-medium rounded-md transition-all cursor-pointer ${
                          isCritical
                            ? 'bg-rose-900/60 hover:bg-rose-800 text-rose-200 border border-rose-700/60 shadow-[0_0_8px_rgba(244,63,94,0.15)]'
                            : 'bg-neutral-800 hover:bg-neutral-700 text-neutral-300 border border-neutral-700'
                        }`}
                      >
                        <Eye className="w-3 h-3" />
                        <span>VIEW PROOF</span>
                      </button>
                    </td>
                  </tr>
                );
              })
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default IncidentLogTable;
