import React, { useState, useEffect } from 'react';
import { 
  Cpu, 
  Flame, 
  Fingerprint, 
  Activity, 
  Terminal, 
  Folder, 
  Music, 
  Camera, 
  Mic, 
  Sliders, 
  ShieldAlert,
  Play
} from 'lucide-react';
import { ThinkingMode } from '../types';
import { soundEngine } from '../services/soundEngine';

interface CoreOrbHUDProps {
  mode: ThinkingMode;
  isListening: boolean;
  isSpeaking: boolean;
  isAirControlActive: boolean;
  onExecuteCommand: (cmd: string) => void;
  onOpenAirRadial: () => void;
}

export const CoreOrbHUD: React.FC<CoreOrbHUDProps> = ({
  mode,
  isListening,
  isSpeaking,
  isAirControlActive,
  onExecuteCommand,
  onOpenAirRadial,
}) => {
  const [pulsePhase, setPulsePhase] = useState(0);

  useEffect(() => {
    const interval = setInterval(() => {
      setPulsePhase((prev) => (prev + 1) % 100);
    }, 50);
    return () => clearInterval(interval);
  }, []);

  const getThemeColors = () => {
    switch (mode) {
      case 'deep':
        return {
          glow: 'rgba(6, 182, 212, 0.45)',
          coreRing: 'border-cyan-400',
          accent: 'text-cyan-300',
          bgRadial: 'from-cyan-950/40 via-slate-950/80 to-transparent',
          label: 'DEEP THINK COGNITION MATRIX',
        };
      case 'ultra':
        return {
          glow: 'rgba(250, 204, 21, 0.5)',
          coreRing: 'border-amber-400',
          accent: 'text-amber-300',
          bgRadial: 'from-amber-950/30 via-slate-950/80 to-transparent',
          label: 'ULTRA THINK 6-STAGE ENGINE',
        };
      case 'dark':
        return {
          glow: 'rgba(239, 68, 68, 0.5)',
          coreRing: 'border-red-500',
          accent: 'text-red-400',
          bgRadial: 'from-red-950/40 via-slate-950/80 to-transparent',
          label: 'DARK DEFENSE SECURITY MATRIX',
        };
      default:
        return {
          glow: 'rgba(0, 240, 255, 0.45)',
          coreRing: 'border-cyan-400',
          accent: 'text-cyan-400',
          bgRadial: 'from-cyan-950/30 via-slate-950/80 to-transparent',
          label: 'ULTRON V.4 CORE ONLINE',
        };
    }
  };

  const theme = getThemeColors();

  // Virtual Air Buttons from Section 23 of Blueprint
  const airButtons = [
    { label: 'SYSTEM', icon: Cpu, cmd: 'system diagnostics' },
    { label: 'VOICE', icon: Mic, cmd: 'ULTRON' },
    { label: 'CAMERA', icon: Camera, cmd: 'activate air control' },
    { label: 'GESTURES', icon: Fingerprint, cmd: 'open air gestures' },
    { label: 'THINK', icon: Activity, cmd: 'deep think' },
    { label: 'APPS', icon: Terminal, cmd: 'open chrome' },
    { label: 'MEDIA', icon: Music, cmd: 'open spotify' },
    { label: 'FILES', icon: Folder, cmd: 'open explorer' },
    { label: 'RADIAL', icon: Sliders, action: onOpenAirRadial },
    { label: 'STOP', icon: ShieldAlert, cmd: 'ULTRON STOP' },
  ];

  return (
    <div className="relative flex flex-col items-center justify-center p-4 sm:p-6 select-none overflow-hidden">
      {/* Background holographic grid radar glow */}
      <div className={`absolute inset-0 bg-radial ${theme.bgRadial} pointer-events-none`} />

      {/* Main Reactor Orb Hologram */}
      <div className="relative flex items-center justify-center w-56 h-56 sm:w-72 sm:h-72 my-2">
        {/* Outermost rotating tick ring */}
        <div 
          className={`absolute inset-0 rounded-full border border-dashed ${theme.coreRing} opacity-25`}
          style={{ transform: `rotate(${pulsePhase * 3.6}deg)` }}
        />

        {/* Counter-rotating segmented ring */}
        <div 
          className={`absolute inset-3 rounded-full border-2 border-t-transparent border-b-transparent ${theme.coreRing} opacity-40`}
          style={{ transform: `rotate(-${pulsePhase * 2.4}deg)` }}
        />

        {/* Third holographic orbit */}
        <div 
          className="absolute inset-7 rounded-full border border-cyan-500/20"
          style={{ transform: `rotate(${pulsePhase * 1.8}deg)` }}
        />

        {/* Core glow bubble */}
        <div 
          className="absolute inset-10 rounded-full bg-cyan-950/40 blur-xl transition-all duration-300"
          style={{ boxShadow: `0 0 45px ${theme.glow}` }}
        />

        {/* Center Reactor Heart */}
        <div className="relative flex flex-col items-center justify-center w-32 h-32 sm:w-40 sm:h-40 rounded-full border border-cyan-400/50 bg-[#030816]/90 shadow-inner z-10">
          <div className="relative flex items-center justify-center">
            <Cpu className={`w-10 h-10 sm:w-12 sm:h-12 ${theme.accent} ${isSpeaking ? 'animate-bounce' : 'animate-pulse'}`} />
            {isSpeaking && (
              <div className="absolute inset-0 rounded-full bg-cyan-400/20 animate-ping" />
            )}
          </div>

          <span className="mt-2 font-orbitron font-bold text-xs sm:text-sm tracking-widest text-white">
            ULTRON
          </span>
          <span className="font-mono-tech text-[10px] tracking-wider text-slate-400">
            {isSpeaking ? 'SPEAKING' : isListening ? 'LISTENING...' : 'READY'}
          </span>
        </div>

        {/* Animated Sound Waveform Bars around core */}
        <div className="absolute inset-0 flex items-center justify-between px-2 pointer-events-none">
          {[40, 65, 30, 85, 45, 95, 55, 75, 35, 60].map((h, i) => {
            const dynamicHeight = isSpeaking || isListening
              ? Math.max(12, (h * (Math.sin((pulsePhase + i * 10) * 0.1) + 1.2)) / 2)
              : Math.max(8, h * 0.25);
            return (
              <div
                key={i}
                className="w-1 rounded-full bg-cyan-400/70 transition-all duration-75"
                style={{
                  height: `${dynamicHeight}px`,
                  boxShadow: `0 0 8px ${theme.glow}`,
                }}
              />
            );
          })}
        </div>
      </div>

      {/* Mode Sub-Banner */}
      <div className="mt-1 flex items-center space-x-2 text-center">
        <span className="font-mono-tech text-xs tracking-widest uppercase font-semibold text-slate-300">
          STATUS: <span className={theme.accent}>{theme.label}</span>
        </span>
        {isAirControlActive && (
          <span className="px-1.5 py-0.2 rounded bg-emerald-500/20 text-emerald-300 border border-emerald-500/50 text-[10px] font-mono-tech">
            AIR CONTROL ON
          </span>
        )}
      </div>

      {/* SECTION 23: Virtual Air Buttons */}
      <div className="mt-4 w-full max-w-4xl">
        <div className="flex items-center justify-between mb-1.5 px-2">
          <span className="text-[11px] font-mono-tech text-slate-400 tracking-wider uppercase">
            VIRTUAL AIR BUTTONS (TOUCH / AIR GESTURE COMPATIBLE)
          </span>
          <span className="text-[10px] font-mono-tech text-cyan-400/80">
            SEC. 23 BLUEPRINT
          </span>
        </div>

        <div className="grid grid-cols-5 sm:grid-cols-10 gap-1.5 p-2 rounded-xl bg-slate-950/60 border border-cyan-500/20 backdrop-blur-md">
          {airButtons.map((btn, idx) => {
            const Icon = btn.icon;
            return (
              <button
                key={idx}
                onClick={() => {
                  soundEngine.playClick();
                  if (btn.action) {
                    btn.action();
                  } else if (btn.cmd) {
                    onExecuteCommand(btn.cmd);
                  }
                }}
                className="flex flex-col items-center justify-center p-2 rounded-lg border border-cyan-500/25 bg-[#071124]/70 hover:bg-cyan-950/60 hover:border-cyan-400 text-slate-300 hover:text-cyan-300 transition-all hover:scale-105 active:scale-95 group"
                title={`Air Button: ${btn.label}`}
              >
                <Icon className="w-4 h-4 mb-1 text-cyan-400 group-hover:text-cyan-300" />
                <span className="font-mono-tech text-[10px] tracking-wider font-semibold">
                  {btn.label}
                </span>
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
};
