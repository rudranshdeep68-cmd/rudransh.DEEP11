import React, { useState } from 'react';
import { X, Sliders, Volume2, Mic, Hand, Lock, Play } from 'lucide-react';
import { VoicePreset } from '../types';
import { speechService } from '../services/speechService';
import { soundEngine } from '../services/soundEngine';

interface SettingsModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const SettingsModal: React.FC<SettingsModalProps> = ({ isOpen, onClose }) => {
  const [selectedPreset, setSelectedPreset] = useState<VoicePreset>('cinematic');
  const [rate, setRate] = useState<number>(0.95);
  const [pitch, setPitch] = useState<number>(0.88);
  const [volume, setVolume] = useState<number>(1.0);
  const [wakeWord, setWakeWord] = useState<string>('ULTRON');

  if (!isOpen) return null;

  const handlePresetChange = (preset: VoicePreset) => {
    setSelectedPreset(preset);
    speechService.setVoicePreset(preset);
    soundEngine.playClick();
  };

  const handleTestVoice = () => {
    speechService.setCustomTuning(rate, pitch, volume);
    soundEngine.playWake();
    speechService.speak('ULTRON online. All systems nominal. Welcome, boss.');
  };

  return (
    <div 
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-fade-in select-none"
      onClick={onClose}
    >
      <div 
        className="relative w-full max-w-xl rounded-2xl border border-cyan-500/40 bg-[#040816]/98 shadow-[0_0_50px_rgba(0,240,255,0.25)] overflow-hidden font-mono-tech text-xs"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between px-5 py-3.5 border-b border-cyan-500/25 bg-slate-950/80">
          <div className="flex items-center space-x-2">
            <Sliders className="w-5 h-5 text-cyan-400" />
            <div>
              <h2 className="font-orbitron font-bold text-sm text-white tracking-wider">
                ULTRON V.4 SYSTEM SETTINGS
              </h2>
              <p className="text-[11px] text-cyan-400/80">VOICE, GESTURES & PERMISSION CALIBRATION</p>
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

        {/* Body */}
        <div className="p-5 space-y-4 max-h-[75vh] overflow-y-auto">
          {/* Creator Profile Readout */}
          <div className="p-3 rounded-xl border border-cyan-500/30 bg-cyan-950/20 flex items-center justify-between">
            <div className="flex items-center space-x-2.5">
              <Lock className="w-4 h-4 text-cyan-400" />
              <div>
                <div className="text-[10px] text-slate-400">CREATOR AUTHORITY</div>
                <div className="text-sm font-bold text-white tracking-wide">RUDRANSH, BOSS.</div>
              </div>
            </div>
            <span className="text-[10px] px-2 py-0.5 rounded bg-emerald-950 text-emerald-300 border border-emerald-500/40 font-semibold">
              UNALTERABLE LAW
            </span>
          </div>

          {/* Voice Presets (Section 1 & 33) */}
          <div className="space-y-2">
            <label className="text-[11px] text-slate-300 font-semibold uppercase flex items-center space-x-1.5">
              <Volume2 className="w-3.5 h-3.5 text-cyan-400" />
              <span>Voice Preset (Section 1 & 33)</span>
            </label>

            <div className="grid grid-cols-2 sm:grid-cols-4 gap-1.5">
              {[
                { id: 'cinematic', label: 'Cinematic Voice' },
                { id: 'standard', label: 'Standard' },
                { id: 'command', label: 'Command' },
                { id: 'friendly', label: 'Friendly' },
                { id: 'deep', label: 'Deep Voice' },
                { id: 'dark', label: 'Dark Voice' },
                { id: 'whisper', label: 'Whisper Mode' },
              ].map((p) => (
                <button
                  key={p.id}
                  onClick={() => handlePresetChange(p.id as VoicePreset)}
                  className={`p-2 rounded-lg border text-[11px] font-semibold transition-all ${
                    selectedPreset === p.id
                      ? 'border-cyan-400 bg-cyan-950/50 text-cyan-300 shadow-[0_0_12px_rgba(0,240,255,0.25)]'
                      : 'border-slate-800 bg-slate-900/50 text-slate-400 hover:text-slate-200'
                  }`}
                >
                  {p.label}
                </button>
              ))}
            </div>
          </div>

          {/* Audio Sliders */}
          <div className="space-y-3 p-3 rounded-xl border border-slate-800 bg-slate-950/50">
            <div>
              <div className="flex justify-between text-[11px] text-slate-400 mb-1">
                <span>Speed / Rate:</span>
                <span className="text-cyan-400">{rate}x</span>
              </div>
              <input
                type="range"
                min="0.6"
                max="1.4"
                step="0.05"
                value={rate}
                onChange={(e) => setRate(parseFloat(e.target.value))}
                className="w-full accent-cyan-400 cursor-pointer"
              />
            </div>

            <div>
              <div className="flex justify-between text-[11px] text-slate-400 mb-1">
                <span>Pitch:</span>
                <span className="text-cyan-400">{pitch}</span>
              </div>
              <input
                type="range"
                min="0.5"
                max="1.5"
                step="0.05"
                value={pitch}
                onChange={(e) => setPitch(parseFloat(e.target.value))}
                className="w-full accent-cyan-400 cursor-pointer"
              />
            </div>

            <div>
              <div className="flex justify-between text-[11px] text-slate-400 mb-1">
                <span>Volume:</span>
                <span className="text-cyan-400">{Math.round(volume * 100)}%</span>
              </div>
              <input
                type="range"
                min="0"
                max="1"
                step="0.05"
                value={volume}
                onChange={(e) => setVolume(parseFloat(e.target.value))}
                className="w-full accent-cyan-400 cursor-pointer"
              />
            </div>

            <button
              onClick={handleTestVoice}
              className="w-full mt-2 py-2 rounded-lg bg-cyan-500/20 hover:bg-cyan-500/30 text-cyan-300 border border-cyan-400/60 font-semibold flex items-center justify-center space-x-1.5 transition-all"
            >
              <Play className="w-3.5 h-3.5" />
              <span>TEST VOICE SYNTHESIS</span>
            </button>
          </div>

          {/* Wake Word */}
          <div className="space-y-1.5">
            <label className="text-[11px] text-slate-300 font-semibold uppercase flex items-center space-x-1.5">
              <Mic className="w-3.5 h-3.5 text-cyan-400" />
              <span>Wake Word</span>
            </label>
            <input
              type="text"
              value={wakeWord}
              onChange={(e) => setWakeWord(e.target.value)}
              className="w-full px-3 py-2 rounded-lg bg-slate-900 border border-slate-800 text-cyan-300 focus:outline-none focus:border-cyan-400"
            />
          </div>
        </div>
      </div>
    </div>
  );
};
