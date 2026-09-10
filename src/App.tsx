import React, { useState, useEffect, useCallback } from 'react';
import { ThinkingMode, DiscoveredApp, CommandHistoryItem, GestureType } from './types';
import { INITIAL_APPS } from './data/defaultData';
import { HeaderHUD } from './components/HeaderHUD';
import { CoreOrbHUD } from './components/CoreOrbHUD';
import { AirControlPanel } from './components/AirControlPanel';
import { CommandCenter } from './components/CommandCenter';
import { WindowManager } from './components/WindowManager';
import { FeatureExplorerModal } from './components/FeatureExplorerModal';
import { SettingsModal } from './components/SettingsModal';
import { ThinkingModeModal } from './components/ThinkingModeModal';
import { executeCommand } from './services/commandRouter';
import { soundEngine } from './services/soundEngine';
import { speechService } from './services/speechService';

export default function App() {
  const [mode, setMode] = useState<ThinkingMode>('normal');
  const [apps, setApps] = useState<DiscoveredApp[]>(INITIAL_APPS);
  const [isCameraConnected, setIsCameraConnected] = useState<boolean>(false);
  const [isAirControlActive, setIsAirControlActive] = useState<boolean>(false);
  const [commandHistory, setCommandHistory] = useState<CommandHistoryItem[]>([]);
  const [activeModal, setActiveModal] = useState<'blueprint' | 'settings' | 'thinking' | null>(null);
  const [isRadialMenuOpen, setIsRadialMenuOpen] = useState<boolean>(false);

  const [isListening, setIsListening] = useState<boolean>(false);
  const [isSpeaking, setIsSpeaking] = useState<boolean>(false);

  // Subscribe to speech synthesis & recognition state
  useEffect(() => {
    speechService.subscribeState((listening, speaking) => {
      setIsListening(listening);
      setIsSpeaking(speaking);
    });

    // Play startup chime and signature greeting
    const timer = setTimeout(() => {
      soundEngine.playStartup();
      speechService.speak('ULTRON online. Systems initialized. Welcome, boss.');
      // Add initial welcome to command feed
      setCommandHistory([
        {
          id: 'init-1',
          text: 'SYSTEM BOOT: ULTRON V.4',
          timestamp: new Date().toLocaleTimeString([], { hour12: false, hour: '2-digit', minute: '2-digit' }),
          source: 'text',
          status: 'success',
          response: 'ULTRON online. Systems initialized. Ready for commands, boss. Creator: RUDRANSH.',
        },
      ]);
    }, 600);

    return () => clearTimeout(timer);
  }, []);

  // Emergency Stop Handler (Law of Safety)
  const handleEmergencyStop = useCallback(() => {
    soundEngine.playEmergency();
    speechService.stopSpeaking();
    speechService.stopListening();
    setIsAirControlActive(false);
    setIsRadialMenuOpen(false);

    // Minimize apps
    setApps((prev) => prev.map((a) => ({ ...a, isMinimized: true })));

    setCommandHistory((prev) => [
      ...prev,
      {
        id: `stop-${Date.now()}`,
        text: 'EMERGENCY STOP (✊)',
        timestamp: new Date().toLocaleTimeString([], { hour12: false, hour: '2-digit', minute: '2-digit' }),
        source: 'text',
        status: 'emergency',
        response: 'Automation stopped. All background tasks and gesture control halted immediately, boss.',
      },
    ]);
  }, []);

  // Execute Command via Unified Command Router
  const handleExecuteCommand = useCallback(
    (commandText: string, source: 'text' | 'voice' | 'air_gesture' = 'text') => {
      const result = executeCommand(commandText, {
        mode,
        setMode: (newMode) => {
          setMode(newMode);
          if (newMode !== 'normal') {
            setActiveModal('thinking');
          }
        },
        apps,
        setApps,
        isAirControlActive,
        setIsAirControlActive,
        isCameraConnected,
        setIsCameraConnected,
        onEmergencyStop: handleEmergencyStop,
        setActiveModal,
      });

      setCommandHistory((prev) => [
        ...prev,
        {
          id: `cmd-${Date.now()}`,
          text: commandText,
          timestamp: new Date().toLocaleTimeString([], { hour12: false, hour: '2-digit', minute: '2-digit' }),
          source,
          status: result.status,
          response: result.message,
        },
      ]);
    },
    [mode, apps, isAirControlActive, isCameraConnected, handleEmergencyStop]
  );

  // Toggle voice recognition
  const handleToggleListening = () => {
    if (isListening) {
      speechService.stopListening();
      soundEngine.playClick();
    } else {
      soundEngine.playWake();
      const started = speechService.startListening((text, isFinal) => {
        if (isFinal) {
          handleExecuteCommand(text, 'voice');
        }
      });
      if (!started) {
        // Fallback simulation if browser blocks mic permission in iframe
        handleExecuteCommand('Who is your creator?', 'voice');
      }
    }
  };

  // Handle Air Gestures execution
  const handleExecuteGesture = (gesture: GestureType) => {
    switch (gesture) {
      case 'index_pointer':
        soundEngine.playClick();
        break;
      case 'pinch':
        soundEngine.playClick();
        break;
      case 'two_fingers':
        soundEngine.playClick();
        break;
      case 'thumb_up':
        soundEngine.playSuccess();
        handleExecuteCommand('Confirmed by Air Gesture', 'air_gesture');
        break;
      case 'thumb_down':
        soundEngine.playClick();
        handleExecuteCommand('Action canceled by gesture', 'air_gesture');
        break;
      case 'open_palm':
        setIsRadialMenuOpen(true);
        break;
      case 'fist':
        handleEmergencyStop();
        break;
      case 'two_hand_zoom':
        soundEngine.playSuccess();
        handleExecuteCommand('maximize window', 'air_gesture');
        break;
      default:
        soundEngine.playClick();
        break;
    }
  };

  return (
    <div className="relative min-h-screen flex flex-col bg-[#03060d] text-slate-100 hud-grid-pattern hud-scanline overflow-x-hidden font-sans">
      {/* Top Header HUD Bar */}
      <HeaderHUD
        mode={mode}
        setMode={(newMode) => {
          setMode(newMode);
          if (newMode !== 'normal') setActiveModal('thinking');
        }}
        onEmergencyStop={handleEmergencyStop}
        onOpenBlueprint={() => setActiveModal('blueprint')}
        onOpenSettings={() => setActiveModal('settings')}
        isListening={isListening}
        isSpeaking={isSpeaking}
      />

      {/* Main Workspace Stage */}
      <main className="flex-1 w-full max-w-7xl mx-auto px-3 sm:px-4 py-3 flex flex-col space-y-4">
        {/* Central Futuristic Reactor Orb & Air Buttons */}
        <CoreOrbHUD
          mode={mode}
          isListening={isListening}
          isSpeaking={isSpeaking}
          isAirControlActive={isAirControlActive}
          onExecuteCommand={handleExecuteCommand}
          onOpenAirRadial={() => setIsRadialMenuOpen(true)}
        />

        {/* Active Desktop Windows (Chrome, VS Code, Steam, Spotify, Explorer, Terminal) */}
        <WindowManager apps={apps} setApps={setApps} mode={mode} />

        {/* Dual-Column Control Center: Air Control Panel + Permanent Text Command Omnibar */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-4">
          {/* Air Control Webcam & Hand Tracking (Section 13 & 56) */}
          <div className="lg:col-span-6">
            <AirControlPanel
              mode={mode}
              isCameraConnected={isCameraConnected}
              setIsCameraConnected={setIsCameraConnected}
              isAirControlActive={isAirControlActive}
              setIsAirControlActive={setIsAirControlActive}
              onExecuteGesture={handleExecuteGesture}
              onEmergencyStop={handleEmergencyStop}
              isRadialMenuOpen={isRadialMenuOpen}
              setIsRadialMenuOpen={setIsRadialMenuOpen}
            />
          </div>

          {/* Permanent Text Command Center (Section 3) */}
          <div className="lg:col-span-6">
            <CommandCenter
              mode={mode}
              onExecuteCommand={handleExecuteCommand}
              commandHistory={commandHistory}
              onClearHistory={() => setCommandHistory([])}
              isListening={isListening}
              onToggleListening={handleToggleListening}
            />
          </div>
        </div>
      </main>

      {/* Footer Status Line */}
      <footer className="px-4 py-2 border-t border-cyan-500/15 bg-[#02050f]/80 backdrop-blur-md flex items-center justify-between font-mono-tech text-[11px] text-slate-400 select-none">
        <div className="flex items-center space-x-2">
          <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
          <span>ULTRON V.4 SOVEREIGN ARCHITECTURE</span>
          <span className="hidden sm:inline text-slate-600">|</span>
          <span className="hidden sm:inline">OFFLINE-FIRST CORE</span>
        </div>

        <div className="flex items-center space-x-3">
          <span className="text-cyan-400 font-bold">RUDRANSH, BOSS.</span>
          <span className="text-slate-600">|</span>
          <span>LAW ENFORCEMENT NOMINAL</span>
        </div>
      </footer>

      {/* MODALS */}
      <FeatureExplorerModal
        isOpen={activeModal === 'blueprint'}
        onClose={() => setActiveModal(null)}
        onRunFeatureTest={(feat) => handleExecuteCommand(`Test Feature: ${feat}`)}
      />

      <SettingsModal
        isOpen={activeModal === 'settings'}
        onClose={() => setActiveModal(null)}
      />

      <ThinkingModeModal
        isOpen={activeModal === 'thinking'}
        onClose={() => setActiveModal(null)}
        mode={mode}
      />
    </div>
  );
}
