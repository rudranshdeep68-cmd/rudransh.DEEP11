import React, { useEffect, useState } from 'react';
import { 
  Shield, 
  Activity, 
  Volume2, 
  VolumeX, 
  Sliders, 
  BookOpen, 
  OctagonAlert, 
  Lock,
  Cpu
} from 'lucide-react';
import { ThinkingMode } from '../types';
import { soundEngine } from '../services/soundEngine';

interface HeaderHUDProps {
  mode: ThinkingMode;
  setMode: (mode: ThinkingMode) => void;
  onEmergencyStop: () => void;
  onOpenBlueprint: () => void;
  onOpenSettings: () => void;
  isListening: boolean;
  isSpeaking: boolean;
}

export const HeaderHUD: React.FC<HeaderHUDProps> = ({
  mode,
  setMode,
  onEmergencyStop,
  onOpenBlueprint,
  onOpenSettings,
  isListening,
  isSpeaking,
}) => {
  const [currentTime, setCurrentTime] = useState<string>('');
  const [isMuted, setIsMuted] = useState<boolean>(soundEngine.getMuted());

  useEffect(() => {
    const updateClock = () => {
      const now = new Date();
      setCurrentTime(
        now.toLocaleTimeString([], { hour12: false, hour: '2-digit', minute: '2-digit', second: '2-digit' })
      );
    };
    updateClock();
    const interval = setInterval(updateClock, 1000);
    return () => clearInterval(interval);
  }, []);

  const handleToggleMute = () => {
    const muted = soundEngine.toggleMute();
    setIsMuted(muted);
    if (!muted) {
      soundEngine.playClick();
    }
  };

  const getModeColor = () => {
    switch (mode) {
      case 'deep':
        return 'text-cyan-300 border-cyan-500/50 bg-cyan-950/30';
      case 'ultra':
        return 'text-amber-300 border-amber-500/50 bg-amber-950/30';
      case 'dark':
        return 'text-red-400 border-red-500/50 bg-red-950/30';
      default:
        return 'text-cyan-400 border-cyan-500/40 bg-cyan-950/20';
    }
  };

  return (
    <header className="relative z-30 flex items-center justify-between px-4 py-2 border-b border-cyan-500/20 bg-[#040814]/90 backdrop-blur-md select-none">
      {/* Left: Brand Identity & Creator Badge */}
      <div className="flex items-center space-x-3">
        <div className="flex items-center space-x-2">
          <div className="relative flex items-center justify-center w-8 h-8 rounded border border-cyan-400/60 bg-cyan-950/40">
            <Cpu className="w-5 h-5 text-cyan-400 animate-pulse" />
            <div className="absolute inset-0 rounded border border-cyan-400/20 animate-ping" />
          </div>
          <div>
            <div className="flex items-center space-x-1.5">
              <span className="font-orbitron font-bold tracking-wider text-sm sm:text-base text-white">
                ULTRON <span className="text-cyan-400">V.4</span>
              </span>
              <span className="text-[10px] uppercase font-mono-tech px-1.5 py-0.5 rounded bg-cyan-900/60 text-cyan-300 border border-cyan-400/30">
                LOCAL-FIRST
              </span>
            </div>
            <p className="text-[11px] font-mono-tech text-cyan-400/70 tracking-widest uppercase">
              SOVEREIGN DESKTOP INTELLIGENCE
            </p>
          </div>
        </div>

        {/* Absolute Creator Loyalty Badge */}
        <div 
          className="hidden md:flex items-center space-x-1.5 px-2.5 py-1 rounded border border-cyan-500/30 bg-cyan-950/30 text-cyan-300 font-mono-tech text-xs"
          title="Unyielding loyalty to creator RUDRANSH"
        >
          <Lock className="w-3 h-3 text-cyan-400" />
          <span className="text-slate-400 text-[10px]">CREATOR:</span>
          <span className="font-bold tracking-wide text-cyan-300">RUDRANSH</span>
        </div>
      </div>

      {/* Middle: Thinking Mode Quick Selectors */}
      <div className="flex items-center space-x-1 sm:space-x-1.5 bg-slate-900/70 p-1 rounded-lg border border-slate-800">
        <button
          onClick={() => {
            setMode('normal');
            soundEngine.playModeSwitch('normal');
          }}
          className={`px-2.5 py-1 rounded text-xs font-mono-tech uppercase transition-all ${
            mode === 'normal'
              ? 'bg-cyan-500/20 text-cyan-300 border border-cyan-500/60 font-semibold shadow-[0_0_10px_rgba(0,240,255,0.3)]'
              : 'text-slate-400 hover:text-cyan-300 hover:bg-slate-800/60'
          }`}
        >
          Normal
        </button>

        <button
          onClick={() => {
            setMode('deep');
            soundEngine.playModeSwitch('deep');
          }}
          className={`px-2.5 py-1 rounded text-xs font-mono-tech uppercase transition-all ${
            mode === 'deep'
              ? 'bg-cyan-700/30 text-cyan-200 border border-cyan-400 font-semibold shadow-[0_0_12px_rgba(6,182,212,0.4)]'
              : 'text-slate-400 hover:text-cyan-200 hover:bg-slate-800/60'
          }`}
        >
          Deep Think
        </button>

        <button
          onClick={() => {
            setMode('ultra');
            soundEngine.playModeSwitch('ultra');
          }}
          className={`px-2.5 py-1 rounded text-xs font-mono-tech uppercase transition-all ${
            mode === 'ultra'
              ? 'bg-amber-500/20 text-amber-300 border border-amber-400 font-semibold shadow-[0_0_14px_rgba(251,191,36,0.4)]'
              : 'text-slate-400 hover:text-amber-300 hover:bg-slate-800/60'
          }`}
        >
          Ultra Think
        </button>

        <button
          onClick={() => {
            setMode('dark');
            soundEngine.playModeSwitch('dark');
          }}
          className={`px-2.5 py-1 rounded text-xs font-mono-tech uppercase transition-all ${
            mode === 'dark'
              ? 'bg-red-500/20 text-red-300 border border-red-500 font-semibold shadow-[0_0_14px_rgba(239,68,68,0.4)]'
              : 'text-slate-400 hover:text-red-400 hover:bg-slate-800/60'
          }`}
        >
          Dark Think
        </button>
      </div>

      {/* Right: State indicators, audio, clock, emergency stop */}
      <div className="flex items-center space-x-2 sm:space-x-3">
        {/* Voice activity badge */}
        {(isListening || isSpeaking) && (
          <div className="hidden lg:flex items-center space-x-1 px-2 py-0.5 rounded border border-cyan-500/40 bg-cyan-950/40 text-cyan-300 text-xs font-mono-tech">
            <Activity className="w-3.5 h-3.5 animate-spin text-cyan-400" />
            <span>{isSpeaking ? 'SPEAKING' : 'LISTENING'}</span>
          </div>
        )}

        {/* Master Blueprint 1-210 button */}
        <button
          onClick={onOpenBlueprint}
          className="flex items-center space-x-1.5 px-2.5 py-1 rounded border border-cyan-500/40 bg-cyan-950/30 hover:bg-cyan-900/50 text-cyan-300 font-mono-tech text-xs transition-colors"
          title="Explore 1-210 Master Feature Index"
        >
          <BookOpen className="w-3.5 h-3.5" />
          <span className="hidden sm:inline">1–210 BLUEPRINT</span>
        </button>

        {/* Audio Mute toggle */}
        <button
          onClick={handleToggleMute}
          className={`p-1.5 rounded border transition-colors ${
            isMuted
              ? 'border-slate-700 bg-slate-900 text-slate-500'
              : 'border-cyan-500/40 bg-cyan-950/30 text-cyan-300 hover:bg-cyan-900/50'
          }`}
          title={isMuted ? 'Unmute Audio SFX' : 'Mute Audio SFX'}
        >
          {isMuted ? <VolumeX className="w-4 h-4" /> : <Volume2 className="w-4 h-4" />}
        </button>

        {/* Settings button */}
        <button
          onClick={onOpenSettings}
          className="p-1.5 rounded border border-cyan-500/30 bg-cyan-950/30 hover:bg-cyan-900/50 text-cyan-300 transition-colors"
          title="ULTRON Settings & Voice Tuning"
        >
          <Sliders className="w-4 h-4" />
        </button>

        {/* System Clock */}
        <div className="hidden xl:block font-mono-tech text-xs text-slate-400 px-2 py-1 rounded bg-slate-950/60 border border-slate-800">
          {currentTime || '00:00:00'}
        </div>

        {/* EMERGENCY STOP BUTTON (LAW & SAFETY) */}
        <button
          onClick={onEmergencyStop}
          className="flex items-center space-x-1 px-3 py-1 rounded bg-red-600/20 hover:bg-red-600/40 text-red-400 border border-red-500/80 font-mono-tech font-bold text-xs tracking-wider transition-all shadow-[0_0_12px_rgba(239,68,68,0.35)]"
          title="Emergency Stop: Abort all automation, Air Control, and tasks immediately"
        >
          <OctagonAlert className="w-3.5 h-3.5 text-red-400 animate-pulse" />
          <span>STOP (✊)</span>
        </button>
      </div>
    </header>
  );
};
