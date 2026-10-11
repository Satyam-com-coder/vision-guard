import React, { useState } from 'react';
import { Volume2, VolumeX, BellRing } from 'lucide-react';
import { audioSynthesizer } from '../utils/audioSynthesizer';

export const AudioAlertToggle = ({
  isSoundEnabled,
  onToggleSound,
}) => {
  const [testingBeep, setTestingBeep] = useState(false);

  const handleToggle = () => {
    const nextState = !isSoundEnabled;
    audioSynthesizer.setEnabled(nextState);
    onToggleSound(nextState);
    if (nextState) {
      // play a quick confirmation chirp
      audioSynthesizer.testTone();
    }
  };

  const handleTestBeep = (e) => {
    e.stopPropagation();
    setTestingBeep(true);
    audioSynthesizer.trigger880HzAlertBeep();
    setTimeout(() => setTestingBeep(false), 500);
  };

  return (
    <div className="flex items-center gap-2">
      <button
        onClick={handleToggle}
        type="button"
        className={`flex items-center gap-2 px-3 py-1.5 text-xs font-medium rounded-md border transition-all cursor-pointer select-none ${
          isSoundEnabled
            ? 'bg-emerald-950/60 text-emerald-300 border-emerald-500/40 hover:bg-emerald-900/60 shadow-[0_0_12px_rgba(16,185,129,0.15)]'
            : 'bg-neutral-900/80 text-neutral-400 border-neutral-700/60 hover:text-neutral-200 hover:bg-neutral-800/80'
        }`}
        title={isSoundEnabled ? 'Alert audio is active (880Hz synthesiser)' : 'Alert audio is muted'}
      >
        {isSoundEnabled ? (
          <>
            <Volume2 className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
            <span className="font-mono tracking-tight">Alert Sound: ON</span>
            <span className="inline-block w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse ml-0.5" />
          </>
        ) : (
          <>
            <VolumeX className="w-3.5 h-3.5 text-neutral-400 shrink-0" />
            <span className="font-mono tracking-tight text-neutral-400">Alert Sound: OFF</span>
          </>
        )}
      </button>

      <button
        onClick={handleTestBeep}
        type="button"
        className={`hidden sm:inline-flex items-center gap-1.5 px-2.5 py-1.5 text-xs font-medium rounded-md border border-neutral-800 bg-neutral-900/60 text-neutral-300 hover:text-neutral-100 hover:border-neutral-700 hover:bg-neutral-800 transition-colors cursor-pointer ${
          testingBeep ? 'ring-2 ring-emerald-500/40 text-emerald-300' : ''
        }`}
        title="Synthesize 880Hz beep via Web Audio API"
      >
        <BellRing className={`w-3 h-3 ${testingBeep ? 'text-amber-400 animate-bounce' : 'text-neutral-400'}`} />
        <span className="font-mono text-[11px]">880Hz Test</span>
      </button>
    </div>
  );
};

export default AudioAlertToggle;
