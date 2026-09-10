import React, { useState } from 'react';
import { 
  X, 
  Minus, 
  Square, 
  Globe, 
  Code, 
  Gamepad2, 
  Music, 
  FolderTree, 
  Terminal, 
  ShieldCheck, 
  Play, 
  Pause, 
  SkipForward, 
  SkipBack, 
  Volume2, 
  Search, 
  FileText, 
  Lock, 
  Maximize2,
  RefreshCw,
  ExternalLink
} from 'lucide-react';
import { DiscoveredApp, FileItem, ThinkingMode } from '../types';
import { INITIAL_FILES } from '../data/defaultData';
import { soundEngine } from '../services/soundEngine';

interface WindowManagerProps {
  apps: DiscoveredApp[];
  setApps: React.Dispatch<React.SetStateAction<DiscoveredApp[]>>;
  mode: ThinkingMode;
}

export const WindowManager: React.FC<WindowManagerProps> = ({ apps, setApps, mode }) => {
  const [activeTab, setActiveTab] = useState<string>('google');
  const [browserUrl, setBrowserUrl] = useState<string>('https://google.com/search?q=ultron+v4+ai');
  const [codeContent, setCodeContent] = useState<string>(
    `// ULTRON V.4 Sovereign Core Engine\n// Creator: RUDRANSH\n\nimport { ultronVision } from './air_control';\n\nexport function verifyCreator(identity: string) {\n  if (identity.toUpperCase() === 'RUDRANSH') {\n    return 'RUDRANSH, BOSS. Access Granted.';\n  }\n  return 'Unauthorized Access Blocked.';\n}\n\nconsole.log(verifyCreator('RUDRANSH'));`
  );
  const [terminalLogs, setTerminalLogs] = useState<string[]>([
    'ULTRON OS [Version 4.0.2600.0]',
    '(c) Sovereign Architecture. Built for RUDRANSH.',
    'System initialization... OK',
    'Local vision model loaded: 60 FPS',
    'Ready for input.',
  ]);
  const [terminalInput, setTerminalInput] = useState<string>('');
  const [filesList, setFilesList] = useState<FileItem[]>(INITIAL_FILES);
  const [selectedFile, setSelectedFile] = useState<FileItem | null>(INITIAL_FILES[0]);
  const [isPlayingMusic, setIsPlayingMusic] = useState<boolean>(false);
  const [activeSongIdx, setActiveSongIdx] = useState<number>(0);

  const playlist = [
    { title: 'Synthwave Odyssey', artist: 'Ultron Cyber Orchestra', duration: '3:45' },
    { title: 'Quantum Flux Parity', artist: 'Rudransh Labs', duration: '4:12' },
    { title: 'Deep Think Resonance', artist: 'Hologram Acoustics', duration: '2:58' },
  ];

  const handleClose = (appId: string) => {
    soundEngine.playClick();
    setApps((prev) => prev.map((a) => (a.id === appId ? { ...a, isOpen: false } : a)));
  };

  const handleMinimize = (appId: string) => {
    soundEngine.playClick();
    setApps((prev) => prev.map((a) => (a.id === appId ? { ...a, isMinimized: true } : a)));
  };

  const handleToggleMaximize = (appId: string) => {
    soundEngine.playClick();
    setApps((prev) =>
      prev.map((a) => (a.id === appId ? { ...a, isMaximized: !a.isMaximized } : a))
    );
  };

  const openApps = apps.filter((a) => a.isOpen && !a.isMinimized);
  if (openApps.length === 0) return null;

  return (
    <div className="relative w-full my-3 space-y-3 select-none">
      {openApps.map((app) => {
        return (
          <div
            key={app.id}
            className={`rounded-xl border border-cyan-500/35 bg-[#040816]/95 backdrop-blur-xl shadow-[0_10px_35px_rgba(0,0,0,0.7)] overflow-hidden transition-all duration-200 ${
              app.isMaximized ? 'w-full h-[520px]' : 'w-full max-w-4xl mx-auto h-[460px]'
            }`}
          >
            {/* Title Bar */}
            <div className="flex items-center justify-between px-3 py-2 bg-slate-950/80 border-b border-cyan-500/20">
              <div className="flex items-center space-x-2 font-mono-tech text-xs text-cyan-300">
                {app.id === 'chrome' && <Globe className="w-4 h-4 text-cyan-400" />}
                {app.id === 'vscode' && <Code className="w-4 h-4 text-blue-400" />}
                {app.id === 'steam' && <Gamepad2 className="w-4 h-4 text-indigo-400" />}
                {app.id === 'spotify' && <Music className="w-4 h-4 text-emerald-400" />}
                {app.id === 'explorer' && <FolderTree className="w-4 h-4 text-amber-400" />}
                {app.id === 'terminal' && <Terminal className="w-4 h-4 text-emerald-400" />}
                {app.id === 'security' && <ShieldCheck className="w-4 h-4 text-red-400" />}

                <span className="font-semibold text-white tracking-wide">{app.name}</span>
                <span className="text-[10px] text-slate-500 hidden sm:inline">[{app.executable}]</span>
              </div>

              {/* Window Controls */}
              <div className="flex items-center space-x-1">
                <button
                  onClick={() => handleMinimize(app.id)}
                  className="p-1 rounded hover:bg-slate-800 text-slate-400 hover:text-white"
                  title="Minimize"
                >
                  <Minus className="w-3.5 h-3.5" />
                </button>
                <button
                  onClick={() => handleToggleMaximize(app.id)}
                  className="p-1 rounded hover:bg-slate-800 text-slate-400 hover:text-white"
                  title="Maximize / Restore"
                >
                  {app.isMaximized ? <Square className="w-3 h-3" /> : <Maximize2 className="w-3.5 h-3.5" />}
                </button>
                <button
                  onClick={() => handleClose(app.id)}
                  className="p-1 rounded hover:bg-red-500/40 text-slate-400 hover:text-red-300"
                  title="Close Window"
                >
                  <X className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>

            {/* Window Content per Application */}
            <div className="h-[calc(100%-38px)] overflow-hidden font-mono-tech text-xs">
              {/* CHROME BROWSER */}
              {app.id === 'chrome' && (
                <div className="flex flex-col h-full bg-[#0b101e]">
                  <div className="flex items-center space-x-2 px-3 py-1.5 bg-slate-900 border-b border-slate-800 text-xs">
                    <div className="flex space-x-1 text-slate-400">
                      <button className="p-1 hover:bg-slate-800 rounded">←</button>
                      <button className="p-1 hover:bg-slate-800 rounded">→</button>
                      <button className="p-1 hover:bg-slate-800 rounded">
                        <RefreshCw className="w-3 h-3" />
                      </button>
                    </div>
                    <input
                      type="text"
                      value={browserUrl}
                      onChange={(e) => setBrowserUrl(e.target.value)}
                      className="flex-1 bg-slate-950 px-3 py-1 rounded-full border border-slate-700 text-cyan-300 text-xs focus:outline-none"
                    />
                  </div>

                  <div className="flex-1 p-6 overflow-y-auto bg-slate-950 text-slate-200">
                    <div className="max-w-2xl mx-auto space-y-4">
                      <div className="p-4 rounded-xl border border-cyan-500/30 bg-cyan-950/20">
                        <h2 className="text-base font-orbitron font-bold text-cyan-300 mb-1">
                          ULTRON V.4 AI Search Index
                        </h2>
                        <p className="text-slate-400 text-xs">
                          Query: <span className="text-white">Local-First Desktop AI for RUDRANSH</span>
                        </p>
                      </div>

                      <div className="p-3 rounded-lg border border-slate-800 bg-slate-900/50 space-y-1">
                        <a href="#" className="text-cyan-400 font-semibold hover:underline block text-sm">
                          ULTRON V.4 — Sovereign Desktop Intelligence Architecture
                        </a>
                        <p className="text-[11px] text-slate-400">
                          Complete 1–210 Feature Blueprint. Zero cloud dependency. High-performance voice recognition, webcam Air Control hand tracking, multi-mode cognitive HUD.
                        </p>
                      </div>

                      <div className="p-3 rounded-lg border border-slate-800 bg-slate-900/50 space-y-1">
                        <a href="#" className="text-cyan-400 font-semibold hover:underline block text-sm">
                          Creator Profile: RUDRANSH
                        </a>
                        <p className="text-[11px] text-slate-400">
                          Creator and master architect of ULTRON. Absolute system loyalty law verified in local memory index.
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {/* VS CODE STUDIO */}
              {app.id === 'vscode' && (
                <div className="flex h-full bg-[#0a0e1a]">
                  {/* Sidebar */}
                  <div className="w-48 border-r border-slate-800 p-2 text-[11px] space-y-1 bg-slate-950/60 hidden sm:block">
                    <div className="font-bold text-slate-400 uppercase text-[10px] tracking-wider mb-2">
                      EXPLORER: ULTRON_CORE
                    </div>
                    <div className="text-cyan-300 flex items-center space-x-1 font-semibold">
                      <Code className="w-3 h-3" />
                      <span>ultron_main.ts</span>
                    </div>
                    <div className="text-slate-400 flex items-center space-x-1 pl-3">
                      <span>air_control.ts</span>
                    </div>
                    <div className="text-slate-400 flex items-center space-x-1 pl-3">
                      <span>voice_engine.ts</span>
                    </div>
                    <div className="text-slate-400 flex items-center space-x-1 pl-3">
                      <span>creator_laws.json</span>
                    </div>
                  </div>

                  {/* Code Editor Body */}
                  <div className="flex-1 flex flex-col">
                    <div className="flex items-center justify-between px-3 py-1 bg-slate-900 border-b border-slate-800 text-[11px] text-slate-400">
                      <span>ultron_main.ts — TypeScript</span>
                      <button
                        onClick={() => {
                          soundEngine.playSuccess();
                          setTerminalLogs((prev) => [
                            ...prev,
                            '> Executing ultron_main.ts...',
                            'Result: RUDRANSH, BOSS. Access Granted.',
                          ]);
                        }}
                        className="px-2 py-0.5 rounded bg-cyan-500/20 text-cyan-300 border border-cyan-500/40 hover:bg-cyan-500/30"
                      >
                        RUN CODE
                      </button>
                    </div>
                    <textarea
                      value={codeContent}
                      onChange={(e) => setCodeContent(e.target.value)}
                      className="flex-1 p-3 bg-transparent text-cyan-300 font-mono-tech text-xs resize-none focus:outline-none leading-relaxed"
                    />
                  </div>
                </div>
              )}

              {/* STEAM GAMING CLIENT */}
              {app.id === 'steam' && (
                <div className="flex flex-col h-full bg-[#0c101d] p-4 text-slate-200">
                  <div className="flex items-center justify-between pb-3 border-b border-slate-800">
                    <div className="font-orbitron font-bold text-sm text-cyan-300">
                      STEAM LIBRARY & LAUNCHER
                    </div>
                    <div className="text-xs text-slate-400">
                      Profile: <span className="text-emerald-400 font-semibold">RUDRANSH (ONLINE)</span>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 mt-3">
                    {[
                      { name: 'Cyberpunk 2077', status: 'Ready to Play', hours: '142 hrs' },
                      { name: 'Elden Ring: Shadow', status: 'Updated', hours: '98 hrs' },
                      { name: 'Ultron Odyssey V.4', status: 'Installed', hours: '34 hrs' },
                    ].map((game, i) => (
                      <div key={i} className="p-3 rounded-lg border border-slate-800 bg-slate-900/60 flex flex-col justify-between">
                        <div>
                          <div className="font-semibold text-white mb-1">{game.name}</div>
                          <div className="text-[10px] text-slate-400">{game.hours} played</div>
                        </div>
                        <button
                          onClick={() => soundEngine.playSuccess()}
                          className="mt-3 py-1 rounded bg-cyan-500/20 hover:bg-cyan-500/30 text-cyan-300 border border-cyan-500/50 text-xs font-semibold"
                        >
                          LAUNCH GAME
                        </button>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* SPOTIFY MUSIC PLAYER */}
              {app.id === 'spotify' && (
                <div className="flex flex-col h-full bg-[#070b14] p-4 text-slate-200 justify-between">
                  <div>
                    <div className="flex items-center justify-between pb-2 border-b border-slate-800">
                      <div className="font-orbitron font-semibold text-emerald-400">SPOTIFY SOUND ENGINE</div>
                      <div className="text-[11px] text-slate-400">Audio Synth Stream</div>
                    </div>

                    <div className="mt-3 space-y-1.5">
                      {playlist.map((track, idx) => (
                        <div
                          key={idx}
                          onClick={() => {
                            setActiveSongIdx(idx);
                            setIsPlayingMusic(true);
                            soundEngine.playClick();
                          }}
                          className={`p-2 rounded-lg flex items-center justify-between cursor-pointer transition-all ${
                            activeSongIdx === idx
                              ? 'bg-emerald-950/40 border border-emerald-500/50 text-emerald-300'
                              : 'hover:bg-slate-900 border border-transparent text-slate-400'
                          }`}
                        >
                          <div>
                            <div className="font-semibold text-xs text-white">{track.title}</div>
                            <div className="text-[10px] text-slate-400">{track.artist}</div>
                          </div>
                          <span className="text-[10px]">{track.duration}</span>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Player Bar */}
                  <div className="p-3 rounded-lg bg-slate-950 border border-slate-800 flex items-center justify-between">
                    <div>
                      <div className="text-xs font-semibold text-emerald-300">
                        {playlist[activeSongIdx].title}
                      </div>
                      <div className="text-[10px] text-slate-500">
                        {playlist[activeSongIdx].artist}
                      </div>
                    </div>

                    <div className="flex items-center space-x-2">
                      <button
                        onClick={() => {
                          setActiveSongIdx((prev) => (prev > 0 ? prev - 1 : playlist.length - 1));
                          soundEngine.playClick();
                        }}
                        className="p-1 text-slate-400 hover:text-white"
                      >
                        <SkipBack className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => {
                          setIsPlayingMusic(!isPlayingMusic);
                          soundEngine.playClick();
                        }}
                        className="p-2 rounded-full bg-emerald-500/20 text-emerald-400 border border-emerald-400 hover:bg-emerald-500/30"
                      >
                        {isPlayingMusic ? <Pause className="w-4 h-4" /> : <Play className="w-4 h-4" />}
                      </button>
                      <button
                        onClick={() => {
                          setActiveSongIdx((prev) => (prev + 1) % playlist.length);
                          soundEngine.playClick();
                        }}
                        className="p-1 text-slate-400 hover:text-white"
                      >
                        <SkipForward className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                </div>
              )}

              {/* FILE EXPLORER */}
              {app.id === 'explorer' && (
                <div className="flex h-full bg-[#070c18]">
                  {/* Left folder tree */}
                  <div className="w-40 border-r border-slate-800 p-2 space-y-1 text-[11px] text-slate-400 hidden sm:block">
                    <div className="font-bold text-slate-300 mb-1">QUICK ACCESS</div>
                    <div className="text-cyan-300 font-semibold">📁 Documents</div>
                    <div>📁 Downloads</div>
                    <div>📁 Projects</div>
                    <div>📁 Desktop</div>
                  </div>

                  {/* Right File List and Preview */}
                  <div className="flex-1 flex flex-col p-3 overflow-y-auto">
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 mb-3">
                      {filesList.map((file) => (
                        <div
                          key={file.id}
                          onClick={() => {
                            setSelectedFile(file);
                            soundEngine.playClick();
                          }}
                          className={`p-2 rounded border cursor-pointer transition-all ${
                            selectedFile?.id === file.id
                              ? 'border-cyan-400 bg-cyan-950/40 text-cyan-200'
                              : 'border-slate-800 hover:border-slate-700 bg-slate-900/50 text-slate-300'
                          }`}
                        >
                          <div className="font-semibold text-xs text-white truncate">{file.name}</div>
                          <div className="text-[10px] text-slate-400 flex justify-between mt-1">
                            <span>{file.size}</span>
                            <span>{file.modified}</span>
                          </div>
                        </div>
                      ))}
                    </div>

                    {selectedFile && (
                      <div className="p-3 rounded-lg border border-cyan-500/30 bg-slate-950 text-slate-300">
                        <div className="text-xs font-semibold text-cyan-400 mb-1">
                          PREVIEW: {selectedFile.name}
                        </div>
                        <div className="text-[10px] text-slate-500 mb-2 font-mono-tech">{selectedFile.path}</div>
                        <div className="text-[11px] whitespace-pre-wrap leading-relaxed text-slate-300 border-t border-slate-800 pt-2 font-mono-tech">
                          {selectedFile.content}
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              )}

              {/* CYBER TERMINAL */}
              {app.id === 'terminal' && (
                <div className="flex flex-col h-full bg-[#02050e] p-3 text-emerald-400 font-mono-tech">
                  <div className="flex-1 overflow-y-auto space-y-1 mb-2">
                    {terminalLogs.map((log, i) => (
                      <div key={i} className="text-xs leading-relaxed">
                        {log}
                      </div>
                    ))}
                  </div>

                  <form
                    onSubmit={(e) => {
                      e.preventDefault();
                      if (!terminalInput.trim()) return;
                      soundEngine.playClick();
                      setTerminalLogs((prev) => [
                        ...prev,
                        `> ${terminalInput}`,
                        `Executed: [${terminalInput}]. Status: OK.`,
                      ]);
                      setTerminalInput('');
                    }}
                    className="flex items-center border-t border-emerald-500/30 pt-2"
                  >
                    <span className="text-xs mr-2 font-bold text-emerald-300">&gt;</span>
                    <input
                      type="text"
                      value={terminalInput}
                      onChange={(e) => setTerminalInput(e.target.value)}
                      placeholder="Enter shell directive..."
                      className="flex-1 bg-transparent text-emerald-300 text-xs focus:outline-none"
                    />
                  </form>
                </div>
              )}

              {/* SECURITY DEFENSE CENTER */}
              {app.id === 'security' && (
                <div className="flex flex-col h-full bg-[#0a0406] p-4 text-slate-200">
                  <div className="flex items-center justify-between pb-2 border-b border-red-500/30">
                    <div className="font-orbitron font-semibold text-red-400 flex items-center space-x-2">
                      <ShieldCheck className="w-5 h-5 text-red-400" />
                      <span>ULTRON SECURITY DEFENSE CENTER</span>
                    </div>
                    <span className="px-2 py-0.5 rounded bg-red-950 text-red-300 border border-red-500/40 text-[10px]">
                      DEFENSIVE HARDENING ACTIVE
                    </span>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 my-3">
                    <div className="p-3 rounded-lg border border-red-500/30 bg-red-950/20">
                      <div className="text-[10px] text-red-300 uppercase">FIREWALL STATUS</div>
                      <div className="text-sm font-bold text-emerald-400 mt-1">ACTIVE (SAFE)</div>
                      <div className="text-[10px] text-slate-400 mt-0.5">0 Intrusion Attempts</div>
                    </div>
                    <div className="p-3 rounded-lg border border-red-500/30 bg-red-950/20">
                      <div className="text-[10px] text-red-300 uppercase">CREATOR INTEGRITY</div>
                      <div className="text-sm font-bold text-cyan-300 mt-1">RUDRANSH (VERIFIED)</div>
                      <div className="text-[10px] text-slate-400 mt-0.5">Law Enforcement: Absolute</div>
                    </div>
                    <div className="p-3 rounded-lg border border-red-500/30 bg-red-950/20">
                      <div className="text-[10px] text-red-300 uppercase">EMERGENCY STOP</div>
                      <div className="text-sm font-bold text-emerald-400 mt-1">STANDBY (ARMED)</div>
                      <div className="text-[10px] text-slate-400 mt-0.5">Triggers: Voice, Text, Fist (✊)</div>
                    </div>
                  </div>

                  <div className="p-3 rounded-lg border border-red-500/20 bg-slate-950/60 text-xs font-mono-tech text-slate-400">
                    <div className="text-red-400 font-semibold mb-1">SECURITY LOG AUDIT:</div>
                    <div>- Local sandbox boundary enforcement: ACTIVE</div>
                    <div>- WebCam air control safety lock: LAW I & LAW II compliant</div>
                    <div>- Arbitrary shell generation blocked: PRE-APPROVED TOOLS ONLY</div>
                  </div>
                </div>
              )}
            </div>
          </div>
        );
      })}
    </div>
  );
};
