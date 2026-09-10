export type ThinkingMode = 'normal' | 'deep' | 'ultra' | 'dark';

export type VoicePreset = 
  | 'cinematic' 
  | 'standard' 
  | 'command' 
  | 'friendly' 
  | 'deep' 
  | 'dark' 
  | 'whisper';

export type GestureType = 
  | 'index_pointer'      // ☝️ Cursor
  | 'pinch'              // 🤏 Click
  | 'pinch_hold'         // 🤏 Drag
  | 'two_fingers'        // ✌️ Scroll
  | 'thumb_up'           // 👍 Confirm
  | 'thumb_down'         // 👎 Cancel
  | 'ok_gesture'         // 👌 Toggle
  | 'open_palm'          // 🖐️ Air Menu / Pause
  | 'fist'               // ✊ Emergency Stop
  | 'two_hand_zoom'      // 🤏🤏 Zoom
  | 'two_hand_rotate'    // 🔄 Rotate
  | 'two_hand_grab'      // 🤲 Grab
  | 'air_push'           // 🌬️ Push
  | 'air_pull'           // 🫴 Pull
  | 'air_tap'            // 👆 Tap
  | 'air_swipe_left'     // 👈 Previous
  | 'air_swipe_right'    // 👉 Next
  | 'air_swipe_up'       // 👆 Maximize
  | 'air_swipe_down';    // 👇 Minimize

export interface DiscoveredApp {
  id: string;
  name: string;
  category: 'browser' | 'development' | 'media' | 'system' | 'gaming' | 'productivity';
  icon: string;
  executable: string;
  description: string;
  isOpen: boolean;
  isMinimized: boolean;
  isMaximized: boolean;
  position: { x: number; y: number; width: number; height: number };
  monitor: 1 | 2;
}

export interface FileItem {
  id: string;
  name: string;
  type: 'txt' | 'pdf' | 'docx' | 'py' | 'json' | 'image' | 'folder';
  size: string;
  modified: string;
  content?: string;
  path: string;
}

export interface SystemMetrics {
  cpu: number;
  ram: number;
  ramUsedGb: number;
  ramTotalGb: number;
  gpu: number;
  gpuTemp: number;
  diskUsedPercent: number;
  battery: number;
  isCharging: boolean;
  networkUpKbps: number;
  networkDownKbps: number;
  activeProcessesCount: number;
}

export interface CommandHistoryItem {
  id: string;
  text: string;
  timestamp: string;
  source: 'voice' | 'text' | 'air_gesture';
  status: 'success' | 'warning' | 'error' | 'executing' | 'emergency';
  response: string;
}

export interface FeatureBlueprintItem {
  id: number;
  section: string;
  name: string;
  description: string;
  status: 'active' | 'ready' | 'simulated' | 'future_2050';
}
