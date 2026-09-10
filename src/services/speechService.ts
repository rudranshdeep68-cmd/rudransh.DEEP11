import { VoicePreset } from '../types';

export class SpeechService {
  private synth: SpeechSynthesis | null = null;
  private recognition: any = null;
  private isListening: boolean = false;
  private currentPreset: VoicePreset = 'cinematic';
  private rate: number = 0.98;
  private pitch: number = 0.92;
  private volume: number = 1.0;
  private selectedVoice: SpeechSynthesisVoice | null = null;
  private onResultCallback: ((text: string, isFinal: boolean) => void) | null = null;
  private onStateChangeCallback: ((isListening: boolean, isSpeaking: boolean) => void) | null = null;
  private isSpeakingState: boolean = false;

  constructor() {
    if (typeof window !== 'undefined') {
      if ('speechSynthesis' in window) {
        this.synth = window.speechSynthesis;
        this.loadVoices();
        if (window.speechSynthesis.onvoiceschanged !== undefined) {
          window.speechSynthesis.onvoiceschanged = () => this.loadVoices();
        }
      }

      // Initialize Web Speech API
      const SpeechRecognition =
        (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
      if (SpeechRecognition) {
        try {
          this.recognition = new SpeechRecognition();
          this.recognition.continuous = true;
          this.recognition.interimResults = true;
          this.recognition.lang = 'en-US';

          this.recognition.onstart = () => {
            this.isListening = true;
            this.notifyState();
          };

          this.recognition.onend = () => {
            this.isListening = false;
            this.notifyState();
          };

          this.recognition.onresult = (event: any) => {
            let interimTranscript = '';
            let finalTranscript = '';

            for (let i = event.resultIndex; i < event.results.length; ++i) {
              if (event.results[i].isFinal) {
                finalTranscript += event.results[i][0].transcript;
              } else {
                interimTranscript += event.results[i][0].transcript;
              }
            }

            if (finalTranscript.trim() && this.onResultCallback) {
              this.onResultCallback(finalTranscript.trim(), true);
            } else if (interimTranscript.trim() && this.onResultCallback) {
              this.onResultCallback(interimTranscript.trim(), false);
            }
          };

          this.recognition.onerror = (_err: any) => {
            // Graceful fallback on recognition error
            this.isListening = false;
            this.notifyState();
          };
        } catch {
          this.recognition = null;
        }
      }
    }
  }

  private loadVoices() {
    if (!this.synth) return;
    const voices = this.synth.getVoices();
    // Prefer authoritative, deep male or robotic English voices
    const preferred = voices.find(
      (v) =>
        v.name.includes('Daniel') ||
        v.name.includes('Google UK English Male') ||
        v.name.includes('David') ||
        v.name.includes('Guy') ||
        v.name.includes('Natural') ||
        (v.lang.startsWith('en') && v.name.toLowerCase().includes('male'))
    );
    this.selectedVoice = preferred || voices.find((v) => v.lang.startsWith('en')) || voices[0] || null;
  }

  public setVoicePreset(preset: VoicePreset) {
    this.currentPreset = preset;
    switch (preset) {
      case 'cinematic':
        this.pitch = 0.88;
        this.rate = 0.95;
        this.volume = 1.0;
        break;
      case 'standard':
        this.pitch = 1.0;
        this.rate = 1.0;
        this.volume = 0.95;
        break;
      case 'command':
        this.pitch = 0.95;
        this.rate = 1.15;
        this.volume = 1.0;
        break;
      case 'friendly':
        this.pitch = 1.08;
        this.rate = 1.02;
        this.volume = 0.95;
        break;
      case 'deep':
        this.pitch = 0.72;
        this.rate = 0.92;
        this.volume = 1.0;
        break;
      case 'dark':
        this.pitch = 0.6;
        this.rate = 0.88;
        this.volume = 1.0;
        break;
      case 'whisper':
        this.pitch = 0.9;
        this.rate = 0.9;
        this.volume = 0.35;
        break;
    }
  }

  public setCustomTuning(rate: number, pitch: number, volume: number) {
    this.rate = rate;
    this.pitch = pitch;
    this.volume = volume;
  }

  public speak(text: string): Promise<void> {
    return new Promise((resolve) => {
      if (!this.synth || typeof window === 'undefined') {
        resolve();
        return;
      }

      // Interrupt previous speech
      this.synth.cancel();

      const utterance = new SpeechSynthesisUtterance(text);
      if (this.selectedVoice) {
        utterance.voice = this.selectedVoice;
      }
      utterance.pitch = this.pitch;
      utterance.rate = this.rate;
      utterance.volume = this.volume;

      utterance.onstart = () => {
        this.isSpeakingState = true;
        this.notifyState();
      };

      utterance.onend = () => {
        this.isSpeakingState = false;
        this.notifyState();
        resolve();
      };

      utterance.onerror = () => {
        this.isSpeakingState = false;
        this.notifyState();
        resolve();
      };

      this.synth.speak(utterance);
    });
  }

  public stopSpeaking() {
    if (this.synth) {
      this.synth.cancel();
      this.isSpeakingState = false;
      this.notifyState();
    }
  }

  public startListening(onResult: (text: string, isFinal: boolean) => void): boolean {
    if (!this.recognition) return false;
    this.onResultCallback = onResult;
    try {
      this.recognition.start();
      return true;
    } catch {
      return false;
    }
  }

  public stopListening() {
    if (this.recognition && this.isListening) {
      try {
        this.recognition.stop();
      } catch {
        // Ignore
      }
      this.isListening = false;
      this.notifyState();
    }
  }

  public isSupported(): { stt: boolean; tts: boolean } {
    return {
      stt: Boolean(this.recognition),
      tts: Boolean(this.synth),
    };
  }

  public subscribeState(callback: (isListening: boolean, isSpeaking: boolean) => void) {
    this.onStateChangeCallback = callback;
  }

  private notifyState() {
    if (this.onStateChangeCallback) {
      this.onStateChangeCallback(this.isListening, this.isSpeakingState);
    }
  }
}

export const speechService = new SpeechService();
