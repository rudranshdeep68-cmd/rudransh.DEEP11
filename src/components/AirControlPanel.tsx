import React, { useRef, useEffect, useState, useCallback } from 'react';
import { 
  Camera, 
  CameraOff, 
  Hand, 
  Eye, 
  Zap, 
  Activity, 
  Sliders, 
  RotateCw, 
  ZoomIn, 
  ZoomOut, 
  MousePointer, 
  Check, 
  X, 
  ShieldAlert,
  Sparkles
} from 'lucide-react';
import { GestureType, ThinkingMode } from '../types';
import { soundEngine } from '../services/soundEngine';

interface AirControlPanelProps {
  mode: ThinkingMode;
  isCameraConnected: boolean;
  setIsCameraConnected: (connected: boolean) => void;
  isAirControlActive: boolean;
  setIsAirControlActive: (active: boolean) => void;
  onExecuteGesture: (gesture: GestureType) => void;
  onEmergencyStop: () => void;
  isRadialMenuOpen: boolean;
  setIsRadialMenuOpen: (open: boolean) => void;
}

export const AirControlPanel: React.FC<AirControlPanelProps> = ({
  mode,
  isCameraConnected,
  setIsCameraConnected,
  isAirControlActive,
  setIsAirControlActive,
  onExecuteGesture,
  onEmergencyStop,
  isRadialMenuOpen,
  setIsRadialMenuOpen,
}) => {
  const videoRef = useRef<HTMLVideoElement | null>(null);
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const [stream, setStream] = useState<MediaStream | null>(null);

  const [activeGesture, setActiveGesture] = useState<GestureType>('index_pointer');
  const [gestureConfidence, setGestureConfidence] = useState<number>(96);
  const [trackedHandsCount, setTrackedHandsCount] = useState<number>(1);
  const [cursorPos, setCursorPos] = useState<{ x: number; y: number }>({ x: 160, y: 110 });
  const [isPinching, setIsPinching] = useState<boolean>(false);
  const [cameraError, setCameraError] = useState<string | null>(null);
  const [fps, setFps] = useState<number>(60);

  // Initialize or terminate actual webcam video stream based on state
  useEffect(() => {
    let activeStream: MediaStream | null = null;

    if (isCameraConnected && isAirControlActive) {
      if (navigator.mediaDevices && navigator.mediaDevices.getUserMedia) {
        navigator.mediaDevices
          .getUserMedia({ video: { width: 320, height: 240, facingMode: 'user' } })
          .then((mediaStream) => {
            activeStream = mediaStream;
            setStream(mediaStream);
            if (videoRef.current) {
              videoRef.current.srcObject = mediaStream;
              videoRef.current.play().catch(() => {});
            }
            setCameraError(null);
          })
          .catch((err) => {
            setCameraError('Camera access denied or unavailable in this environment. Falling back to high-fidelity optical simulator.');
          });
      }
    } else {
      if (stream) {
        stream.getTracks().forEach((track) => track.stop());
        setStream(null);
      }
      if (videoRef.current) {
        videoRef.current.srcObject = null;
      }
    }

    return () => {
      if (activeStream) {
        activeStream.getTracks().forEach((track) => track.stop());
      }
    };
  }, [isCameraConnected, isAirControlActive]);

  // Real-time canvas landmark overlay rendering loop
  useEffect(() => {
    let animationFrameId: number;
    let lastTime = performance.now();
    let frameCount = 0;

    const renderOverlay = () => {
      const canvas = canvasRef.current;
      if (!canvas) return;
      const ctx = canvas.getContext('2d');
      if (!ctx) return;

      const width = canvas.width;
      const height = canvas.height;

      ctx.clearRect(0, 0, width, height);

      if (isAirControlActive) {
        // Draw futuristic targeting HUD grid on canvas
        ctx.strokeStyle = 'rgba(0, 240, 255, 0.15)';
        ctx.lineWidth = 1;
        ctx.beginPath();
        ctx.moveTo(width / 2, 0);
        ctx.lineTo(width / 2, height);
        ctx.moveTo(0, height / 2);
        ctx.lineTo(width, height / 2);
        ctx.stroke();

        // Draw synthetic hand skeleton landmarks around cursorPos
        const cx = cursorPos.x;
        const cy = cursorPos.y;

        // Palm center
        ctx.fillStyle = 'rgba(0, 240, 255, 0.8)';
        ctx.beginPath();
        ctx.arc(cx, cy, 6, 0, Math.PI * 2);
        ctx.fill();

        // 5 finger joint rays
        const fingerOffsets = [
          { x: -28, y: -25 }, // Thumb
          { x: -10, y: -45 }, // Index
          { x: 10, y: -48 },  // Middle
          { x: 26, y: -38 },  // Ring
          { x: 40, y: -20 },  // Pinky
        ];

        fingerOffsets.forEach((offset, idx) => {
          const fx = cx + offset.x;
          const fy = cy + offset.y;

          // Joint line
          ctx.strokeStyle = idx === 1 && activeGesture === 'index_pointer'
            ? 'rgba(0, 255, 200, 0.9)'
            : 'rgba(0, 240, 255, 0.5)';
          ctx.lineWidth = 2;
          ctx.beginPath();
          ctx.moveTo(cx, cy);
          ctx.lineTo(fx, fy);
          ctx.stroke();

          // Joint node
          ctx.fillStyle = idx === 1 && activeGesture === 'index_pointer'
            ? '#00f0ff'
            : 'rgba(255, 255, 255, 0.7)';
          ctx.beginPath();
          ctx.arc(fx, fy, 4, 0, Math.PI * 2);
          ctx.fill();
        });

        // Air Reticle around index tip
        const indexX = cx + fingerOffsets[1].x;
        const indexY = cy + fingerOffsets[1].y;

        ctx.strokeStyle = isPinching ? 'rgba(250, 204, 21, 0.9)' : 'rgba(0, 240, 255, 0.8)';
        ctx.lineWidth = 1.5;
        ctx.beginPath();
        ctx.arc(indexX, indexY, isPinching ? 10 : 16, 0, Math.PI * 2);
        ctx.stroke();

        if (isPinching) {
          ctx.fillStyle = 'rgba(250, 204, 21, 0.3)';
          ctx.beginPath();
          ctx.arc(indexX, indexY, 10, 0, Math.PI * 2);
          ctx.fill();
        }

        // Reticle crosshairs
        ctx.beginPath();
        ctx.moveTo(indexX - 22, indexY);
        ctx.lineTo(indexX - 12, indexY);
        ctx.moveTo(indexX + 12, indexY);
        ctx.lineTo(indexX + 22, indexY);
        ctx.moveTo(indexX, indexY - 22);
        ctx.lineTo(indexX, indexY - 12);
        ctx.moveTo(indexX, indexY + 12);
        ctx.lineTo(indexX, indexY + 22);
        ctx.stroke();
      }

      // FPS calculation
      frameCount++;
      const now = performance.now();
      if (now - lastTime >= 1000) {
        setFps(frameCount);
        frameCount = 0;
        lastTime = now;
      }

      animationFrameId = requestAnimationFrame(renderOverlay);
    };

    renderOverlay();
    return () => cancelAnimationFrame(animationFrameId);
  }, [isAirControlActive, cursorPos, activeGesture, isPinching]);

  const handleTouchpadMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!isAirControlActive) return;
    const rect = e.currentTarget.getBoundingClientRect();
    const x = ((e.clientX - rect.left) / rect.width) * 320;
    const y = ((e.clientY - rect.top) / rect.height) * 220;
    setCursorPos({ x: Math.max(20, Math.min(300, x)), y: Math.max(30, Math.min(190, y)) });
  };

  const triggerGesture = (gesture: GestureType) => {
    soundEngine.playClick();
    setActiveGesture(gesture);
    setGestureConfidence(Math.floor(Math.random() * 8 + 92));

    if (gesture === 'pinch') {
      setIsPinching(true);
      setTimeout(() => setIsPinching(false), 200);
    } else if (gesture === 'open_palm') {
      setIsRadialMenuOpen(true);
      soundEngine.playSuccess();
    } else if (gesture === 'fist') {
      onEmergencyStop();
      return;
    }

    onExecuteGesture(gesture);
  };

  // Section 24: Air Radial Menu Items
  const radialMenuItems = [
    { label: 'THINK', action: () => onExecuteGesture('ok_gesture') },
    { label: 'APPS', action: () => onExecuteGesture('air_tap') },
    { label: 'SYSTEM', action: () => onExecuteGesture('thumb_up') },
    { label: 'FILES', action: () => onExecuteGesture('two_fingers') },
    { label: 'MEDIA', action: () => onExecuteGesture('air_swipe_right') },
    { label: 'CAMERA', action: () => onExecuteGesture('ok_gesture') },
    { label: 'VOICE', action: () => onExecuteGesture('air_push') },
    { label: 'STOP', action: () => onEmergencyStop(), isDanger: true },
  ];

  return (
    <div className="relative p-3 sm:p-4 rounded-xl border border-cyan-500/25 bg-[#040916]/80 backdrop-blur-md">
      {/* Header bar with Camera Connection Toggle & Privacy Indicator */}
      <div className="flex items-center justify-between pb-2 mb-3 border-b border-cyan-500/20 font-mono-tech text-xs">
        <div className="flex items-center space-x-2">
          <Camera className="w-4 h-4 text-cyan-400" />
          <span className="font-orbitron font-semibold text-slate-200 tracking-wider">
            AIR CONTROL ENGINE
          </span>
          <span className="text-[10px] px-1.5 py-0.5 rounded bg-cyan-950 text-cyan-300 border border-cyan-500/30">
            V.4 CV
          </span>
        </div>

        <div className="flex items-center space-x-2">
          {/* Privacy Camera Indicator */}
          <div className="flex items-center space-x-1.5 px-2 py-0.5 rounded border border-slate-800 bg-slate-950/60">
            <div
              className={`w-2 h-2 rounded-full ${
                isAirControlActive
                  ? 'bg-emerald-400 animate-ping'
                  : isCameraConnected
                  ? 'bg-amber-400'
                  : 'bg-red-500'
              }`}
            />
            <span className="text-[10px] text-slate-300">
              {isAirControlActive ? 'CAM: ACTIVE' : isCameraConnected ? 'CAM: READY' : 'CAM: DISCONNECTED'}
            </span>
          </div>

          {/* Toggle Webcam Hardware connection */}
          <button
            onClick={() => {
              const nextState = !isCameraConnected;
              setIsCameraConnected(nextState);
              if (!nextState) {
                setIsAirControlActive(false);
              }
              soundEngine.playClick();
            }}
            className={`px-2 py-0.5 rounded text-[11px] font-mono-tech border transition-all ${
              isCameraConnected
                ? 'border-cyan-500/50 bg-cyan-950/50 text-cyan-300 hover:bg-cyan-900/60'
                : 'border-slate-700 bg-slate-900 text-slate-400 hover:text-slate-200'
            }`}
            title="Toggle Webcam Hardware Connection (Law I / Law II Test)"
          >
            {isCameraConnected ? 'DISCONNECT CAM' : 'CONNECT CAM'}
          </button>
        </div>
      </div>

      {/* Main Air Control Body */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-3">
        {/* Left Column: Visual Viewport with Canvas Hand Tracking */}
        <div className="lg:col-span-7 flex flex-col items-center">
          <div 
            className="relative w-full aspect-4/3 max-w-sm rounded-lg border border-cyan-500/30 bg-slate-950 overflow-hidden cursor-crosshair group shadow-inner"
            onMouseMove={handleTouchpadMouseMove}
          >
            {/* Live Camera Video stream or Holographic Simulation Canvas */}
            <video
              ref={videoRef}
              playsInline
              muted
              className={`absolute inset-0 w-full h-full object-cover transform -scale-x-100 ${
                isAirControlActive && stream ? 'opacity-70' : 'hidden'
              }`}
            />

            {/* Synthetic Canvas HUD for Hand Landmarks & Reticle */}
            <canvas
              ref={canvasRef}
              width={320}
              height={240}
              className="absolute inset-0 w-full h-full pointer-events-none z-10"
            />

            {/* HUD Status Overlay */}
            <div className="absolute top-2 left-2 z-20 font-mono-tech text-[10px] text-cyan-400 bg-black/60 px-2 py-1 rounded border border-cyan-500/20 backdrop-blur-sm">
              <div>MODE: {isAirControlActive ? 'AIR TRACKING' : 'STANDBY'}</div>
              <div>FPS: {fps} | HANDS: {isAirControlActive ? trackedHandsCount : 0}</div>
            </div>

            {/* Inactive State Display */}
            {!isAirControlActive && (
              <div className="absolute inset-0 flex flex-col items-center justify-center p-4 bg-slate-950/90 text-center z-15">
                <CameraOff className="w-8 h-8 text-slate-500 mb-2" />
                <p className="font-mono-tech text-xs text-slate-300 font-semibold mb-1">
                  {!isCameraConnected
                    ? 'LAW I: NO WEBCAM DETECTED'
                    : 'LAW II: WEBCAM READY (STANDBY)'}
                </p>
                <p className="font-mono-tech text-[11px] text-slate-500 max-w-xs mb-3">
                  {!isCameraConnected
                    ? 'Camera is not connected. Gesture engine is disabled. Voice and text operate normally.'
                    : 'Camera hardware detected. Voice "Activate Air Control" or click below to engage.'}
                </p>

                {isCameraConnected && (
                  <button
                    onClick={() => {
                      setIsAirControlActive(true);
                      soundEngine.playSuccess();
                    }}
                    className="px-3 py-1.5 rounded bg-cyan-500/20 hover:bg-cyan-500/30 text-cyan-300 border border-cyan-400 font-mono-tech text-xs font-semibold tracking-wider transition-all shadow-[0_0_12px_rgba(0,240,255,0.3)]"
                  >
                    ACTIVATE AIR CONTROL
                  </button>
                )}
              </div>
            )}

            {cameraError && (
              <div className="absolute bottom-2 inset-x-2 text-[10px] font-mono-tech text-amber-300 bg-amber-950/80 px-2 py-1 rounded border border-amber-500/40 text-center z-20">
                {cameraError}
              </div>
            )}
          </div>

          <span className="mt-1.5 text-[10px] font-mono-tech text-slate-500 text-center">
            [Hover or touch camera window to direct Air Cursor ☝️]
          </span>
        </div>

        {/* Right Column: Section 56 Air Control HUD Telemetry & Gesture Triggers */}
        <div className="lg:col-span-5 flex flex-col justify-between space-y-2">
          {/* Section 56 Telemetry Card */}
          <div className="p-2.5 rounded-lg border border-cyan-500/20 bg-slate-950/70 font-mono-tech text-xs">
            <div className="text-[10px] text-slate-400 uppercase tracking-widest mb-1 font-semibold">
              AIR CONTROL HUD TELEMETRY (SEC. 56)
            </div>

            <div className="grid grid-cols-2 gap-1.5 text-[11px]">
              <div className="text-slate-400">CAMERA:</div>
              <div className={isCameraConnected ? 'text-emerald-400 font-bold' : 'text-red-400 font-bold'}>
                {isCameraConnected ? 'CONNECTED' : 'DISCONNECTED'}
              </div>

              <div className="text-slate-400">AIR CONTROL:</div>
              <div className={isAirControlActive ? 'text-cyan-400 font-bold' : 'text-slate-500 font-bold'}>
                {isAirControlActive ? 'ACTIVE' : 'READY / OFF'}
              </div>

              <div className="text-slate-400">HAND:</div>
              <div className="text-cyan-300 font-bold">RIGHT (PRIMARY)</div>

              <div className="text-slate-400">GESTURE:</div>
              <div className="text-amber-300 font-bold uppercase">{activeGesture.replace('_', ' ')}</div>

              <div className="text-slate-400">CONFIDENCE:</div>
              <div className="text-emerald-400 font-bold">{gestureConfidence}%</div>

              <div className="text-slate-400">ACTION:</div>
              <div className="text-cyan-300 font-bold uppercase">
                {activeGesture === 'pinch' ? 'CLICK' : activeGesture === 'two_fingers' ? 'SCROLL' : 'CURSOR'}
              </div>
            </div>
          </div>

          {/* Quick Gesture Activators (Touch/Click/Key simulation of webcam gestures) */}
          <div className="p-2 rounded-lg border border-cyan-500/20 bg-slate-950/70">
            <div className="text-[10px] font-mono-tech text-slate-400 uppercase tracking-widest mb-1.5 font-semibold">
              GESTURE TEST MATRIX (SEC. 14–22)
            </div>

            <div className="grid grid-cols-4 gap-1">
              <button
                onClick={() => triggerGesture('index_pointer')}
                className="p-1 rounded bg-slate-900 hover:bg-cyan-950 border border-slate-800 hover:border-cyan-500 text-[11px] font-mono-tech text-slate-300 hover:text-cyan-300 flex flex-col items-center"
                title="☝️ Index: Move Cursor"
              >
                <span className="text-sm">☝️</span>
                <span className="text-[9px]">CURSOR</span>
              </button>

              <button
                onClick={() => triggerGesture('pinch')}
                className="p-1 rounded bg-slate-900 hover:bg-cyan-950 border border-slate-800 hover:border-cyan-500 text-[11px] font-mono-tech text-slate-300 hover:text-cyan-300 flex flex-col items-center"
                title="🤏 Pinch: Left Click"
              >
                <span className="text-sm">🤏</span>
                <span className="text-[9px]">CLICK</span>
              </button>

              <button
                onClick={() => triggerGesture('two_fingers')}
                className="p-1 rounded bg-slate-900 hover:bg-cyan-950 border border-slate-800 hover:border-cyan-500 text-[11px] font-mono-tech text-slate-300 hover:text-cyan-300 flex flex-col items-center"
                title="✌️ Two Fingers: Scroll"
              >
                <span className="text-sm">✌️</span>
                <span className="text-[9px]">SCROLL</span>
              </button>

              <button
                onClick={() => triggerGesture('open_palm')}
                className="p-1 rounded bg-slate-900 hover:bg-cyan-950 border border-slate-800 hover:border-cyan-500 text-[11px] font-mono-tech text-slate-300 hover:text-cyan-300 flex flex-col items-center"
                title="🖐️ Open Palm: Air Radial Menu"
              >
                <span className="text-sm">🖐️</span>
                <span className="text-[9px]">RADIAL</span>
              </button>

              <button
                onClick={() => triggerGesture('thumb_up')}
                className="p-1 rounded bg-slate-900 hover:bg-cyan-950 border border-slate-800 hover:border-cyan-500 text-[11px] font-mono-tech text-slate-300 hover:text-cyan-300 flex flex-col items-center"
                title="👍 Thumb Up: Confirm"
              >
                <span className="text-sm">👍</span>
                <span className="text-[9px]">CONFIRM</span>
              </button>

              <button
                onClick={() => triggerGesture('thumb_down')}
                className="p-1 rounded bg-slate-900 hover:bg-cyan-950 border border-slate-800 hover:border-cyan-500 text-[11px] font-mono-tech text-slate-300 hover:text-cyan-300 flex flex-col items-center"
                title="👎 Thumb Down: Cancel"
              >
                <span className="text-sm">👎</span>
                <span className="text-[9px]">CANCEL</span>
              </button>

              <button
                onClick={() => triggerGesture('two_hand_zoom')}
                className="p-1 rounded bg-slate-900 hover:bg-cyan-950 border border-slate-800 hover:border-cyan-500 text-[11px] font-mono-tech text-slate-300 hover:text-cyan-300 flex flex-col items-center"
                title="🤏🤏 Two-Hand Zoom"
              >
                <span className="text-sm">🔍</span>
                <span className="text-[9px]">ZOOM</span>
              </button>

              <button
                onClick={() => triggerGesture('fist')}
                className="p-1 rounded bg-red-950/40 hover:bg-red-900/60 border border-red-500/60 text-[11px] font-mono-tech text-red-300 flex flex-col items-center"
                title="✊ Fist: EMERGENCY STOP"
              >
                <span className="text-sm">✊</span>
                <span className="text-[9px] font-bold">STOP</span>
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* SECTION 24: AIR RADIAL MENU MODAL */}
      {isRadialMenuOpen && (
        <div 
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-md animate-fade-in"
          onClick={() => setIsRadialMenuOpen(false)}
        >
          <div 
            className="relative w-80 h-80 rounded-full border-2 border-cyan-400 bg-[#030919]/95 flex items-center justify-center shadow-[0_0_50px_rgba(0,240,255,0.4)]"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Center close hub */}
            <button
              onClick={() => setIsRadialMenuOpen(false)}
              className="w-20 h-20 rounded-full border border-cyan-400/80 bg-cyan-950/70 hover:bg-cyan-900 text-cyan-300 font-mono-tech text-xs flex flex-col items-center justify-center z-20 transition-all hover:scale-105"
            >
              <X className="w-5 h-5 mb-0.5" />
              <span>DISMISS</span>
            </button>

            {/* Circular spoke items */}
            {radialMenuItems.map((item, idx) => {
              const angle = (idx * 360) / radialMenuItems.length - 90;
              const rad = (angle * Math.PI) / 180;
              const radius = 110;
              const x = Math.cos(rad) * radius;
              const y = Math.sin(rad) * radius;

              return (
                <button
                  key={idx}
                  onClick={() => {
                    item.action();
                    setIsRadialMenuOpen(false);
                  }}
                  style={{
                    transform: `translate(${x}px, ${y}px)`,
                  }}
                  className={`absolute w-14 h-14 rounded-full border flex items-center justify-center font-mono-tech text-[10px] font-bold transition-all hover:scale-115 active:scale-95 shadow-md ${
                    item.isDanger
                      ? 'border-red-500 bg-red-950/80 text-red-300 hover:bg-red-900 shadow-[0_0_15px_rgba(239,68,68,0.5)]'
                      : 'border-cyan-400/80 bg-cyan-950/80 text-cyan-300 hover:bg-cyan-800 shadow-[0_0_15px_rgba(0,240,255,0.4)]'
                  }`}
                >
                  {item.label}
                </button>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
};
