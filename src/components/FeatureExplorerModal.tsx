import React, { useState } from 'react';
import { X, Search, BookOpen, CheckCircle, Zap, Shield, Sparkles } from 'lucide-react';
import { FEATURES_BLUEPRINT } from '../data/defaultData';
import { soundEngine } from '../services/soundEngine';

interface FeatureExplorerModalProps {
  isOpen: boolean;
  onClose: () => void;
  onRunFeatureTest: (featureName: string) => void;
}

export const FeatureExplorerModal: React.FC<FeatureExplorerModalProps> = ({
  isOpen,
  onClose,
  onRunFeatureTest,
}) => {
  const [searchTerm, setSearchTerm] = useState<string>('');
  const [selectedSection, setSelectedSection] = useState<string>('All');

  if (!isOpen) return null;

  const sections = ['All', 'Core', 'Intelligence', 'Thinking Modes', 'Voice', 'Voice Tuning', 'Voice Experience', 'Command Center', 'Webcam System', 'Air Gestures', 'Air Control', '2050 Vision'];

  const filteredFeatures = FEATURES_BLUEPRINT.filter((item) => {
    const matchesSection = selectedSection === 'All' || item.section === selectedSection;
    const matchesSearch =
      item.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      item.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
      item.id.toString() === searchTerm.trim();
    return matchesSection && matchesSearch;
  });

  return (
    <div 
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-fade-in select-none"
      onClick={onClose}
    >
      <div 
        className="relative w-full max-w-4xl max-h-[85vh] flex flex-col rounded-2xl border border-cyan-500/40 bg-[#040816]/98 shadow-[0_0_50px_rgba(0,240,255,0.25)] overflow-hidden"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between px-5 py-3.5 border-b border-cyan-500/25 bg-slate-950/80">
          <div className="flex items-center space-x-2">
            <BookOpen className="w-5 h-5 text-cyan-400" />
            <div>
              <h2 className="font-orbitron font-bold text-sm sm:text-base text-white tracking-wider">
                ULTRON V.4 — COMPLETE 1–210 FEATURE BLUEPRINT
              </h2>
              <p className="font-mono-tech text-[11px] text-cyan-400/80">
                MASTER SPECIFICATION INDEX | CREATOR: RUDRANSH
              </p>
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

        {/* Search & Category Filter */}
        <div className="p-4 border-b border-slate-800 space-y-3 bg-slate-950/40 font-mono-tech text-xs">
          <div className="relative">
            <Search className="w-4 h-4 absolute left-3 top-2.5 text-slate-400" />
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Search feature by name, keyword, or #ID (e.g. 'Air Control', 'Creator', '3', 'Fist')..."
              className="w-full pl-9 pr-4 py-2 rounded-lg bg-slate-900 border border-cyan-500/30 text-white placeholder-slate-500 focus:outline-none focus:border-cyan-400"
            />
          </div>

          {/* Section pills */}
          <div className="flex items-center space-x-1.5 overflow-x-auto pb-1 no-scrollbar">
            {sections.map((sec) => (
              <button
                key={sec}
                onClick={() => {
                  setSelectedSection(sec);
                  soundEngine.playClick();
                }}
                className={`px-2.5 py-1 rounded-full text-[11px] whitespace-nowrap transition-all ${
                  selectedSection === sec
                    ? 'bg-cyan-500/20 text-cyan-300 border border-cyan-400 font-semibold'
                    : 'bg-slate-900 text-slate-400 border border-slate-800 hover:text-slate-200'
                }`}
              >
                {sec}
              </button>
            ))}
          </div>
        </div>

        {/* Feature List Table */}
        <div className="flex-1 overflow-y-auto p-4 space-y-2 font-mono-tech text-xs">
          <div className="text-[11px] text-slate-500 mb-2">
            Showing {filteredFeatures.length} of {FEATURES_BLUEPRINT.length} indexed capabilities:
          </div>

          {filteredFeatures.map((item) => (
            <div
              key={item.id}
              className="p-3 rounded-xl border border-slate-800/80 hover:border-cyan-500/40 bg-slate-950/60 hover:bg-cyan-950/20 transition-all flex items-center justify-between group"
            >
              <div className="flex items-start space-x-3 max-w-2xl">
                <span className="px-2 py-0.5 rounded bg-cyan-950 text-cyan-300 border border-cyan-500/40 font-bold text-[10px] shrink-0 mt-0.5">
                  #{item.id}
                </span>

                <div>
                  <div className="flex items-center space-x-2">
                    <span className="font-semibold text-white group-hover:text-cyan-300 text-sm">
                      {item.name}
                    </span>
                    <span className="text-[10px] text-slate-500 px-1.5 py-0.2 rounded border border-slate-800">
                      {item.section}
                    </span>
                  </div>
                  <p className="text-[11px] text-slate-400 mt-0.5 leading-relaxed">
                    {item.description}
                  </p>
                </div>
              </div>

              <div className="flex items-center space-x-2 shrink-0 ml-3">
                <span className="px-2 py-0.5 rounded-full text-[10px] uppercase font-bold tracking-wider bg-emerald-950/80 text-emerald-300 border border-emerald-500/40">
                  {item.status}
                </span>

                <button
                  onClick={() => {
                    soundEngine.playSuccess();
                    onRunFeatureTest(item.name);
                    onClose();
                  }}
                  className="px-2.5 py-1 rounded bg-cyan-500/20 hover:bg-cyan-500/30 text-cyan-300 border border-cyan-500/50 text-[10px] font-semibold transition-all shadow-sm"
                >
                  TRIGGER
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
