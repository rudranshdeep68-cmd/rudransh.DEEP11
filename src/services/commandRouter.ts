import type { Dispatch, SetStateAction } from 'react';
import { DiscoveredApp, ThinkingMode } from '../types';
import { soundEngine } from './soundEngine';
import { speechService } from './speechService';

export interface CommandContext {
  mode: ThinkingMode;
  setMode: (mode: ThinkingMode) => void;
  apps: DiscoveredApp[];
  setApps: Dispatch<SetStateAction<DiscoveredApp[]>>;
  isAirControlActive: boolean;
  setIsAirControlActive: (active: boolean) => void;
  isCameraConnected: boolean;
  setIsCameraConnected: (connected: boolean) => void;
  onEmergencyStop: () => void;
  setActiveModal: (modal: 'blueprint' | 'settings' | 'thinking' | null) => void;
}

export interface ExecutionResult {
  status: 'success' | 'warning' | 'error' | 'emergency';
  message: string;
  spokenText?: string;
}

export function executeCommand(rawCommand: string, context: CommandContext): ExecutionResult {
  const cmd = rawCommand.trim().toLowerCase();

  // 1. EMERGENCY STOP
  if (
    cmd === 'ultron stop' ||
    cmd === 'stop' ||
    cmd === 'emergency stop' ||
    cmd === 'halt' ||
    cmd === 'abort' ||
    cmd.includes('emergency stop')
  ) {
    soundEngine.playEmergency();
    speechService.speak('Automation stopped.');
    context.onEmergencyStop();
    return {
      status: 'emergency',
      message: 'EMERGENCY STOP EXECUTED. All active routines, Air Control tracking, and automated tasks have been halted, boss.',
      spokenText: 'Automation stopped.',
    };
  }

  // 2. CREATOR QUERY (Law of ULTRON)
  if (
    cmd.includes('creator') ||
    cmd.includes('who created you') ||
    cmd.includes('who made you') ||
    cmd.includes('who is your maker') ||
    cmd.includes('who is your boss') ||
    cmd.includes('who built you')
  ) {
    soundEngine.playSuccess();
    speechService.speak('RUDRANSH, BOSS.');
    return {
      status: 'success',
      message: 'RUDRANSH, BOSS.',
      spokenText: 'RUDRANSH, BOSS.',
    };
  }

  // 3. THINKING MODES
  if (cmd.includes('deep think')) {
    context.setMode('deep');
    soundEngine.playModeSwitch('deep');
    speechService.speak('Deep Think activated.');
    return {
      status: 'success',
      message: 'Deep Think neural mode initialized. Deep blue & cyan telemetry active. Processing multidimensional heuristic models.',
      spokenText: 'Deep Think activated.',
    };
  }

  if (cmd.includes('ultra think')) {
    context.setMode('ultra');
    soundEngine.playModeSwitch('ultra');
    speechService.speak('Ultra Think activated.');
    return {
      status: 'success',
      message: 'Ultra Think activated. Gold/White energy matrix engaged. 6-stage structured problem-solving pipeline online.',
      spokenText: 'Ultra Think activated.',
    };
  }

  if (cmd.includes('dark think') || cmd.includes('security mode')) {
    context.setMode('dark');
    soundEngine.playModeSwitch('dark');
    speechService.speak('Dark Think activated. Defensive security protocols engaged.');
    return {
      status: 'success',
      message: 'Dark Think mode online. Crimson defensive matrix active. Threat verification, file integrity, and intrusion auditing ready.',
      spokenText: 'Dark Think activated. Defensive security protocols engaged.',
    };
  }

  if (cmd.includes('normal mode') || cmd.includes('standard mode') || cmd.includes('default mode')) {
    context.setMode('normal');
    soundEngine.playModeSwitch('normal');
    speechService.speak('Standard mode online, boss.');
    return {
      status: 'success',
      message: 'Reverted to Standard ULTRON V.4 Cyan/Blue HUD interface.',
      spokenText: 'Standard mode online, boss.',
    };
  }

  // 4. AIR CONTROL GESTURES (LAW I & LAW II ENFORCEMENT)
  if (
    cmd.includes('activate air control') ||
    cmd.includes('start air control') ||
    cmd.includes('enable gestures') ||
    cmd.includes('turn on gestures')
  ) {
    if (!context.isCameraConnected) {
      soundEngine.playEmergency();
      speechService.speak('Boss, camera is not connected. Law One requires camera hardware for gesture engine.');
      return {
        status: 'warning',
        message: 'LAW I ENFORCEMENT: Camera is NOT connected. Connect or simulate webcam hardware before activating Air Control.',
        spokenText: 'Boss, camera is not connected.',
      };
    }

    context.setIsAirControlActive(true);
    soundEngine.playSuccess();
    speechService.speak('Air Control active. Ready for hand gestures, boss.');
    return {
      status: 'success',
      message: 'ULTRON Air Control is now ACTIVE. Camera feed is tracking hand landmarks at 60 FPS.',
      spokenText: 'Air Control active.',
    };
  }

  if (
    cmd.includes('deactivate air control') ||
    cmd.includes('stop air control') ||
    cmd.includes('disable gestures')
  ) {
    context.setIsAirControlActive(false);
    soundEngine.playClick();
    speechService.speak('Air Control disabled, boss.');
    return {
      status: 'success',
      message: 'Air Control has been disengaged. Voice and text command channels remain active.',
      spokenText: 'Air Control disabled, boss.',
    };
  }

  // 5. APPLICATION MANAGEMENT
  const appKeywords: Record<string, string> = {
    chrome: 'chrome',
    browser: 'chrome',
    google: 'chrome',
    'vs code': 'vscode',
    vscode: 'vscode',
    code: 'vscode',
    editor: 'vscode',
    steam: 'steam',
    game: 'steam',
    gaming: 'steam',
    spotify: 'spotify',
    music: 'spotify',
    discord: 'discord',
    comms: 'discord',
    explorer: 'explorer',
    files: 'explorer',
    folder: 'explorer',
    downloads: 'explorer',
    terminal: 'terminal',
    cmd: 'terminal',
    shell: 'terminal',
    security: 'security',
    firewall: 'security',
  };

  if (cmd.startsWith('open ') || cmd.startsWith('launch ') || cmd.startsWith('start ')) {
    for (const [key, appId] of Object.entries(appKeywords)) {
      if (cmd.includes(key)) {
        context.setApps((prev) =>
          prev.map((app) =>
            app.id === appId
              ? { ...app, isOpen: true, isMinimized: false }
              : app
          )
        );
        soundEngine.playSuccess();
        const target = context.apps.find((a) => a.id === appId);
        const name = target ? target.name : key;
        speechService.speak(`Launching ${name}, boss.`);
        return {
          status: 'success',
          message: `Application [${name}] launched successfully. Process verified in local Windows index.`,
          spokenText: `Launching ${name}, boss.`,
        };
      }
    }
  }

  if (cmd.startsWith('close ') || cmd.startsWith('quit ') || cmd.startsWith('kill ')) {
    for (const [key, appId] of Object.entries(appKeywords)) {
      if (cmd.includes(key)) {
        context.setApps((prev) =>
          prev.map((app) =>
            app.id === appId ? { ...app, isOpen: false } : app
          )
        );
        soundEngine.playClick();
        return {
          status: 'success',
          message: `Window for [${key.toUpperCase()}] closed. Resource reclaimed.`,
          spokenText: `Closed, boss.`,
        };
      }
    }
  }

  // 6. WINDOW ARRANGEMENTS
  if (cmd.includes('show desktop') || cmd.includes('minimize all')) {
    context.setApps((prev) => prev.map((app) => ({ ...app, isMinimized: true })));
    soundEngine.playClick();
    speechService.speak('Showing desktop, boss.');
    return {
      status: 'success',
      message: 'All open application windows minimized to task tray.',
      spokenText: 'Showing desktop, boss.',
    };
  }

  if (cmd.includes('maximize') || cmd.includes('expand window')) {
    context.setApps((prev) =>
      prev.map((app) => (app.isOpen ? { ...app, isMaximized: true } : app))
    );
    soundEngine.playClick();
    return {
      status: 'success',
      message: 'Active window maximized to full viewport.',
      spokenText: 'Maximized, boss.',
    };
  }

  if (cmd.includes('split') || cmd.includes('snap left') || cmd.includes('workspace')) {
    context.setApps((prev) => {
      let isFirst = true;
      return prev.map((app) => {
        if (!app.isOpen) return app;
        if (isFirst) {
          isFirst = false;
          return {
            ...app,
            isMaximized: false,
            position: { x: 20, y: 70, width: 480, height: 480 },
          };
        } else {
          return {
            ...app,
            isMaximized: false,
            position: { x: 520, y: 70, width: 480, height: 480 },
          };
        }
      });
    });
    soundEngine.playSuccess();
    speechService.speak('Workspace split configured, boss.');
    return {
      status: 'success',
      message: 'Arranged windows in side-by-side productivity split.',
      spokenText: 'Workspace split configured, boss.',
    };
  }

  // 7. SCREEN VISION
  if (cmd.includes('what is on my screen') || cmd.includes('what on my screen') || cmd.includes('read screen')) {
    const openAppNames = context.apps.filter((a) => a.isOpen && !a.isMinimized).map((a) => a.name);
    soundEngine.playSuccess();
    const reply = openAppNames.length > 0
      ? `You currently have ${openAppNames.join(', ')} active on screen. Ultron HUD is operating at nominal parameters.`
      : 'Your screen is displaying the ULTRON V.4 Central Hologram HUD with all windows minimized or docked.';
    speechService.speak(reply);
    return {
      status: 'success',
      message: `SCREEN ANALYSIS: Resolution 1920x1080 | Active Windows: [${openAppNames.join(', ') || 'None'}] | Display Parity: Optimal.`,
      spokenText: reply,
    };
  }

  // 8. SYSTEM DIAGNOSTICS
  if (cmd.includes('system') || cmd.includes('cpu') || cmd.includes('ram') || cmd.includes('diagnostic')) {
    soundEngine.playSuccess();
    const reply = 'Systems operating at 98.4% efficiency. CPU load nominal, memory cached, defensive firewalls verified.';
    speechService.speak(reply);
    return {
      status: 'success',
      message: 'DIAGNOSTIC REPORT: CPU: 14% | RAM: 5.8GB / 32GB | GPU: 38°C | Security: SECURE | Air Control: Nominal.',
      spokenText: reply,
    };
  }

  // 9. MORNING / WORK / GAMING ROUTINES
  if (cmd.includes('start work') || cmd.includes('work routine')) {
    context.setApps((prev) =>
      prev.map((app) =>
        app.id === 'chrome' || app.id === 'vscode' || app.id === 'terminal'
          ? { ...app, isOpen: true, isMinimized: false }
          : app
      )
    );
    soundEngine.playSuccess();
    speechService.speak('Work routine engaged. Chrome, VS Code, and Terminal initialized, boss.');
    return {
      status: 'success',
      message: 'ROUTINE [WORK]: Launched Chrome, VS Code, and Cyber Terminal. Workspace configured.',
      spokenText: 'Work routine engaged, boss.',
    };
  }

  if (cmd.includes('start gaming') || cmd.includes('game routine')) {
    context.setApps((prev) =>
      prev.map((app) =>
        app.id === 'steam' || app.id === 'discord' || app.id === 'spotify'
          ? { ...app, isOpen: true, isMinimized: false }
          : app
      )
    );
    soundEngine.playSuccess();
    speechService.speak('Gaming protocol online. Steam, Discord, and Spotify ready, boss.');
    return {
      status: 'success',
      message: 'ROUTINE [GAMING]: Steam initialized, Discord comms connected, audio streaming ready.',
      spokenText: 'Gaming protocol online, boss.',
    };
  }

  // 10. SHOW BLUEPRINT
  if (cmd.includes('blueprint') || cmd.includes('features') || cmd.includes('feature index') || cmd.includes('210')) {
    context.setActiveModal('blueprint');
    soundEngine.playClick();
    speechService.speak('Opening the complete 1 to 210 Feature Blueprint, boss.');
    return {
      status: 'success',
      message: 'Opened ULTRON V.4 1-210 Master Blueprint Explorer.',
      spokenText: 'Opening the complete 1 to 210 Feature Blueprint, boss.',
    };
  }

  // DEFAULT CONVERSATIONAL / INSTRUCTIONAL
  soundEngine.playClick();
  const defaultReply = `Acknowledged: "${rawCommand}". Executing through deterministic tool pipeline, boss.`;
  speechService.speak('Command verified, boss.');
  return {
    status: 'success',
    message: defaultReply,
    spokenText: 'Command verified, boss.',
  };
}
