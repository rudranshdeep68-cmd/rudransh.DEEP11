import React, { useState, useRef, useEffect } from 'react';
import { 
  Send, 
  Mic, 
  MicOff, 
  CornerDownLeft, 
  History, 
  Terminal, 
  Sparkles, 
  ShieldAlert,
  ChevronRight,
  Trash2,
  Copy,
  Check
} from 'lucide-react';
import { CommandHistoryItem, ThinkingMode } from '../types';
import { soundEngine } from '../services/soundEngine';
import { QUICK_SUGGESTIONS } from '../data/defaultData';

interface CommandCenterProps {
  mode: ThinkingMode;
  onExecuteCommand: (command: string) => void;
  commandHistory: CommandHistoryItem[];
  onClearHistory: () => void;
  isListening: boolean;
  onToggleListening: () => void;
}

export const CommandCenter: React.FC<CommandCenterProps> = ({
  mode,
  onExecuteCommand,
  commandHistory,
  onClearHistory,
  isListening,
  onToggleListening,
}) => {
  const [inputText, setInputText] = useState<string>('');
  const [historyIndex, setHistoryIndex] = useState<number>(-1);
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const inputRef = useRef<HTMLInputElement | null>(null);
  const feedEndRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    feedEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [commandHistory]);

  const handleSubmit = (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    const trimmed = inputText.trim();
    if (!trimmed) return;

    soundEngine.playClick();
    onExecuteCommand(trimmed);
    setInputText('');
    setHistoryIndex(-1);
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'ArrowUp') {
      e.preventDefault();
      if (commandHistory.length > 0) {
        const nextIndex = historyIndex + 1 < commandHistory.length ? historyIndex + 1 : historyIndex;
        setHistoryIndex(nextIndex);
        const item = commandHistory[commandHistory.length - 1 - nextIndex];
        if (item) setInputText(item.text);
      }
    } else if (e.key === 'ArrowDown') {
      e.preventDefault();
      if (historyIndex > 0) {
        const nextIndex = historyIndex - 1;
        setHistoryIndex(nextIndex);
        const item = commandHistory[commandHistory.length - 1 - nextIndex];
        if (item) setInputText(item.text);
      } else if (historyIndex === 0) {
        setHistoryIndex(-1);
        setInputText('');
      }
    }
  };

  const handleCopy = (id: string, text: string) => {
    navigator.clipboard.writeText(text);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 1500);
  };

  const getBorderColor = () => {
    switch (mode) {
      case 'deep':
        return 'border-cyan-500/40 focus-within:border-cyan-400 focus-within:shadow-[0_0_15px_rgba(6,182,212,0.3)]';
      case 'ultra':
        return 'border-amber-500/40 focus-within:border-amber-400 focus-within:shadow-[0_0_15px_rgba(250,204,21,0.3)]';
      case 'dark':
        return 'border-red-500/40 focus-within:border-red-400 focus-within:shadow-[0_0_15px_rgba(239,68,68,0.35)]';
      default:
        return 'border-cyan-500/40 focus-within:border-cyan-400 focus-within:shadow-[0_0_15px_rgba(0,240,255,0.3)]';
    }
  };

  return (
    <div className="flex flex-col h-full bg-[#030816]/90 rounded-xl border border-cyan-500/20 backdrop-blur-md overflow-hidden select-none">
      {/* Feed Header */}
      <div className="flex items-center justify-between px-3 py-2 border-b border-cyan-500/15 bg-slate-950/70 font-mono-tech text-xs">
        <div className="flex items-center space-x-2">
          <Terminal className="w-3.5 h-3.5 text-cyan-400" />
          <span className="font-orbitron font-semibold text-slate-200 tracking-wider">
            COMMAND TELEMETRY FEED
          </span>
          <span className="text-[10px] text-slate-400">({commandHistory.length} logs)</span>
        </div>

        {commandHistory.length > 0 && (
          <button
            onClick={() => {
              soundEngine.playClick();
              onClearHistory();
            }}
            className="flex items-center space-x-1 text-[11px] text-slate-400 hover:text-red-400 transition-colors"
            title="Clear history"
          >
            <Trash2 className="w-3 h-3" />
            <span>CLEAR</span>
          </button>
        )}
      </div>

      {/* Execution History Feed */}
      <div className="flex-1 p-3 overflow-y-auto space-y-2.5 max-h-64 sm:max-h-72 font-mono-tech text-xs">
        {commandHistory.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-44 text-slate-500 text-center">
            <Sparkles className="w-6 h-6 text-cyan-500/50 mb-2 animate-pulse" />
            <p className="text-slate-400 font-semibold mb-1">ULTRON Command Router Standing By</p>
            <p className="text-[11px] max-w-sm text-slate-500">
              Type any directive, click a quick suggestion below, or toggle the voice microphone to speak.
            </p>
          </div>
        ) : (
          commandHistory.map((item) => (
            <div
              key={item.id}
              className={`p-2.5 rounded-lg border transition-all ${
                item.status === 'emergency'
                  ? 'border-red-500/70 bg-red-950/30 text-red-200'
                  : item.status === 'warning'
                  ? 'border-amber-500/60 bg-amber-950/20 text-amber-200'
                  : 'border-cyan-500/25 bg-slate-950/60 text-slate-200'
              }`}
            >
              {/* Directive Header */}
              <div className="flex items-center justify-between text-[10px] text-slate-400 mb-1">
                <div className="flex items-center space-x-1.5">
                  <span className="px-1.5 py-0.2 rounded bg-cyan-950 text-cyan-300 border border-cyan-500/30 uppercase">
                    {item.source}
                  </span>
                  <span>{item.timestamp}</span>
                </div>

                <button
                  onClick={() => handleCopy(item.id, item.response)}
                  className="hover:text-cyan-300 text-slate-500 transition-colors"
                  title="Copy response"
                >
                  {copiedId === item.id ? <Check className="w-3 h-3 text-emerald-400" /> : <Copy className="w-3 h-3" />}
                </button>
              </div>

              {/* User Prompt */}
              <div className="flex items-start space-x-1.5 font-semibold text-cyan-400 mb-1">
                <ChevronRight className="w-3.5 h-3.5 mt-0.5 shrink-0 text-cyan-400" />
                <span className="break-all">{item.text}</span>
              </div>

              {/* ULTRON Response */}
              <div className="pl-5 text-[11px] text-slate-300 whitespace-pre-wrap leading-relaxed">
                {item.response}
              </div>
            </div>
          ))
        )}
        <div ref={feedEndRef} />
      </div>

      {/* Quick Suggestions Chips */}
      <div className="px-3 py-1.5 bg-slate-950/80 border-t border-cyan-500/15 overflow-x-auto flex items-center space-x-1.5 no-scrollbar">
        <span className="text-[10px] font-mono-tech text-slate-400 shrink-0 uppercase tracking-wider">
          SUGGESTIONS:
        </span>
        {QUICK_SUGGESTIONS.map((sug, i) => (
          <button
            key={i}
            onClick={() => {
              soundEngine.playClick();
              onExecuteCommand(sug);
            }}
            className="px-2 py-0.5 rounded-full text-[10px] font-mono-tech whitespace-nowrap bg-cyan-950/40 hover:bg-cyan-900/60 text-cyan-300 hover:text-white border border-cyan-500/30 hover:border-cyan-400 transition-all shrink-0"
          >
            {sug}
          </button>
        ))}
      </div>

      {/* Permanent Text Command Bar (Section 3) */}
      <form
        onSubmit={handleSubmit}
        className={`relative flex items-center p-2 bg-[#02050f] border-t transition-all ${getBorderColor()}`}
      >
        <div className="pl-2 pr-1 text-cyan-400">
          <Terminal className="w-4 h-4" />
        </div>

        <input
          ref={inputRef}
          type="text"
          value={inputText}
          onChange={(e) => setInputText(e.target.value)}
          onKeyDown={handleKeyDown}
          placeholder='Type a command... (e.g. "Who is your creator?", "Open Chrome", "ULTRON STOP")'
          className="flex-1 bg-transparent px-2 py-1.5 text-sm font-mono-tech text-white placeholder-slate-500 focus:outline-none"
        />

        {/* Voice Push-to-Talk Toggle Button */}
        <button
          type="button"
          onClick={onToggleListening}
          className={`p-2 rounded-lg mr-1 transition-all ${
            isListening
              ? 'bg-red-500/30 text-red-300 border border-red-500 animate-pulse'
              : 'bg-cyan-950/50 hover:bg-cyan-900 text-cyan-300 border border-cyan-500/30'
          }`}
          title={isListening ? 'Stop Listening' : 'Push-to-Talk / Continuous Voice'}
        >
          {isListening ? <Mic className="w-4 h-4" /> : <MicOff className="w-4 h-4" />}
        </button>

        {/* Send Button */}
        <button
          type="submit"
          disabled={!inputText.trim()}
          className="flex items-center space-x-1 px-3 py-1.5 rounded-lg bg-cyan-500/20 hover:bg-cyan-500/30 disabled:opacity-30 disabled:pointer-events-none text-cyan-300 border border-cyan-400/60 font-mono-tech text-xs font-semibold tracking-wider transition-all shadow-[0_0_10px_rgba(0,240,255,0.2)]"
        >
          <span>SEND</span>
          <CornerDownLeft className="w-3.5 h-3.5" />
        </button>
      </form>
    </div>
  );
};
