import React, { useState, useEffect } from 'react';
import { X, ShieldAlert, Cpu, Sparkles, CheckCircle, ArrowRight } from 'lucide-react';
import { ThinkingMode } from '../types';
import { soundEngine } from '../services/soundEngine';

interface ThinkingModeModalProps {
  isOpen: boolean;
  onClose: () => void;
  mode: ThinkingMode;
}

export const ThinkingModeModal: React.FC<ThinkingModeModalProps> = ({ isOpen, onClose, mode }) => {
  const [activeStage, setActiveStage] = useState<number>(0);

  useEffect(() => {
    if (!isOpen) {
      setActiveStage(0);
      return;
    }
    const timer = setInterval(() => {
      setActiveStage((prev) => (prev < 5 ? prev + 1 : prev));
    }, 700);
    return () => clearInterval(timer);
  }, [isOpen, mode]);

  if (!isOpen || mode === 'normal') return null;

  const ultraStages = [
    { title: 'UNDERSTAND', desc: 'Parsing multi-modal intent, contextual memory, and goal dependencies.' },
    { title: 'PLAN', desc: 'Decomposing task into deterministic tool sequences without arbitrary shell execution.' },
    { title: 'ANALYZE', desc: 'Calculating execution path efficiency and verifying local hardware safety.' },
    { title: 'VERIFY', desc: 'Simulating state transitions and ensuring no destructive actions without confirmation.' },
    { title: 'EXECUTE', desc: 'Dispatching sandboxed commands to local desktop ecosystem.' },
    { title: 'CHECK', desc: 'Confirming window states, process health, and parity across displays.' },
  ];

  const deepStages = [
    { title: 'ANALYZING', desc: 'Multi-threaded heuristic tree expansion on on-device neural core.' },
    { title: 'CHECKING', desc: 'Cross-verifying memory context and application index parameters.' },
    { title: 'VERIFYING', desc: 'Finalizing deterministic conclusion with optimal confidence parity.' },
  ];

  const darkStages = [
    { title: 'SECURITY AUDIT', desc: 'Inspecting running processes, open ports, and file signatures.' },
    { title: 'RISK VERIFICATION', desc: 'Confirming zero unauthenticated external connections.' },
    { title: 'INTEGRITY LOCK', desc: 'Defensive hardening active. Creator RUDRANSH authority absolute.' },
  ];

  const stages = mode === 'ultra' ? ultraStages : mode === 'dark' ? darkStages : deepStages;

  const getTheme = () => {
    switch (mode) {
      case 'ultra':
        return {
          border: 'border-amber-500/50',
          title: 'ULTRA THINK COGNITIVE MATRIX (SEC. 31)',
          accent: 'text-amber-300',
          bg: 'bg-amber-950/20',
          indicator: 'bg-amber-400',
          boxShadow: 'shadow-[0_0_60px_rgba(250,204,21,0.25)]',
        };
      case 'dark':
        return {
          border: 'border-red-500/50',
          title: 'DARK THINK DEFENSE & SECURITY MATRIX (SEC. 32)',
          accent: 'text-red-400',
          bg: 'bg-red-950/30',
          indicator: 'bg-red-500',
          boxShadow: 'shadow-[0_0_60px_rgba(239,68,68,0.3)]',
        };
      default:
        return {
          border: 'border-cyan-500/50',
          title: 'DEEP THINK MULTIDIMENSIONAL NEURAL CORE (SEC. 30)',
          accent: 'text-cyan-300',
          bg: 'bg-cyan-950/20',
          indicator: 'bg-cyan-400',
          boxShadow: 'shadow-[0_0_60px_rgba(0,240,255,0.25)]',
        };
    }
  };

  const theme = getTheme();

  return (
    <div 
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-md animate-fade-in select-none"
      onClick={onClose}
    >
      <div 
        className={`relative w-full max-w-2xl rounded-2xl border ${theme.border} bg-[#030714]/98 ${theme.boxShadow} overflow-hidden font-mono-tech text-xs`}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between px-5 py-3.5 border-b border-slate-800 bg-slate-950/80">
          <div className="flex items-center space-x-2">
            <Cpu className={`w-5 h-5 ${theme.accent} animate-pulse`} />
            <div>
              <h2 className="font-orbitron font-bold text-sm text-white tracking-wider">
                {theme.title}
              </h2>
              <p className="text-[11px] text-slate-400">STRUCTURED ON-DEVICE REASONING</p>
            </div>
          </div>

          <button
            onClick={() => {
              soundEngine.playClick();
              onClose();
            }}
            className="p-1.5 rounded-lg border border-slate-700 bg-slate-900/60 hover:bg-slate-800 text-slate-400 hover:text-white transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 space-y-4">
          <p className="text-slate-300 text-xs leading-relaxed">
            {mode === 'ultra' && 'Ultra Think initiates an uncompromising 6-stage structured problem-solving pipeline without exposing private internal reasoning tokens.'}
            {mode === 'deep' && 'Deep Think engages multi-threaded cognitive heuristic passes with glowing neural concentric resonance.'}
            {mode === 'dark' && 'Dark Think enforces defensive security auditing, verifying system integrity and screening for suspicious anomalies.'}
          </p>

          {/* Stage Progress Blocks */}
          <div className="space-y-2.5">
            {stages.map((stage, idx) => {
              const isCompleted = activeStage > idx;
              const isCurrent = activeStage === idx;

              return (
                <div
                  key={idx}
                  className={`p-3 rounded-xl border transition-all ${
                    isCurrent
                      ? `${theme.border} ${theme.bg} shadow-md`
                      : isCompleted
                      ? 'border-emerald-500/30 bg-emerald-950/10 text-slate-300'
                      : 'border-slate-800/80 bg-slate-950/40 text-slate-500'
                  }`}
                >
                  <div className="flex items-center justify-between mb-1">
                    <div className="flex items-center space-x-2">
                      <span className={`font-bold ${isCurrent ? theme.accent : isCompleted ? 'text-emerald-400' : 'text-slate-500'}`}>
                        {idx + 1}. {stage.title}
                      </span>
                      {isCurrent && (
                        <span className="text-[9px] px-1.5 py-0.2 rounded bg-white/10 uppercase tracking-widest animate-pulse">
                          PROCESSING
                        </span>
                      )}
                    </div>
                    {isCompleted && <CheckCircle className="w-3.5 h-3.5 text-emerald-400" />}
                  </div>
                  <p className="text-[11px] text-slate-400">{stage.desc}</p>
                </div>
              );
            })}
          </div>

          <div className="pt-2 flex justify-end">
            <button
              onClick={() => {
                soundEngine.playSuccess();
                onClose();
              }}
              className="px-4 py-2 rounded-lg bg-cyan-500/20 hover:bg-cyan-500/30 text-cyan-300 border border-cyan-400/60 font-semibold"
            >
              CONFIRM & RETURN TO HUD
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
