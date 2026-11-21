import { Room, RoomEvent, Track } from 'livekit-client';
import type { AssistantState } from '../../types';

export interface LiveKitCallbacks {
  onStateChange: (state: AssistantState) => void;
  onAudioLevel: (level: number) => void;
  onTranscript: (text: string, isFinal: boolean) => void;
  onError: (error: string) => void;
}

class LiveKitVoiceService {
  private room: Room | null = null;
  private audioContext: AudioContext | null = null;
  private analyser: AnalyserNode | null = null;
  private mediaStream: MediaStream | null = null;
  private animFrameId: number | null = null;
  private isMicActive: boolean = false;
  private callbacks: LiveKitCallbacks | null = null;

  public setCallbacks(callbacks: LiveKitCallbacks) {
    this.callbacks = callbacks;
  }

  public async connect(url: string, token: string): Promise<boolean> {
    if (!url || !token) {
      if (this.callbacks) {
        this.callbacks.onError('LiveKit Server URL and Token required.');
      }
      return false;
    }

    try {
      this.callbacks?.onStateChange('connecting');
      this.room = new Room({
        adaptiveStream: true,
        dynacast: true,
      });

      this.setupRoomEvents();
      await this.room.connect(url, token);
      await this.enableMicrophone();
      this.callbacks?.onStateChange('idle');
      return true;
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Failed to connect to LiveKit.';
      this.callbacks?.onError(msg);
      this.callbacks?.onStateChange('error');
      return false;
    }
  }

  public async disconnect() {
    this.stopAudioAnalysis();
    if (this.mediaStream) {
      this.mediaStream.getTracks().forEach((track) => track.stop());
      this.mediaStream = null;
    }
    if (this.room) {
      await this.room.disconnect();
      this.room = null;
    }
    this.isMicActive = false;
    this.callbacks?.onStateChange('disconnected');
    this.callbacks?.onAudioLevel(0);
  }

  public async enableMicrophone(): Promise<boolean> {
    try {
      this.mediaStream = await navigator.mediaDevices.getUserMedia({
        audio: {
          echoCancellation: true,
          noiseSuppression: true,
          autoGainControl: true,
        },
      });

      this.setupAudioAnalysis(this.mediaStream);
      this.isMicActive = true;
      this.callbacks?.onStateChange('listening');
      return true;
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Microphone access denied.';
      this.callbacks?.onError(msg);
      this.callbacks?.onStateChange('error');
      return false;
    }
  }

  public disableMicrophone() {
    if (this.mediaStream) {
      this.mediaStream.getAudioTracks().forEach((t) => {
        t.enabled = false;
      });
    }
    this.isMicActive = false;
    this.stopAudioAnalysis();
    this.callbacks?.onStateChange('idle');
    this.callbacks?.onAudioLevel(0);
  }

  public toggleMicrophone() {
    if (this.isMicActive) {
      this.disableMicrophone();
    } else {
      this.enableMicrophone();
    }
  }

  public isMicrophoneActive(): boolean {
    return this.isMicActive;
  }

  private setupAudioAnalysis(stream: MediaStream) {
    try {
      const AudioCtx = window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
      this.audioContext = new AudioCtx();
      const source = this.audioContext.createMediaStreamSource(stream);
      this.analyser = this.audioContext.createAnalyser();
      this.analyser.fftSize = 64;
      this.analyser.smoothingTimeConstant = 0.8;
      source.connect(this.analyser);

      const bufferLength = this.analyser.frequencyBinCount;
      const dataArray = new Uint8Array(bufferLength);

      const updateMeter = () => {
        if (!this.analyser) return;
        this.analyser.getByteFrequencyData(dataArray);

        let sum = 0;
        for (let i = 0; i < bufferLength; i++) {
          sum += dataArray[i];
        }
        const average = sum / bufferLength;
        const normalized = Math.min(1, average / 128);

        this.callbacks?.onAudioLevel(normalized);

        // If speaking volume is detected, update state
        if (normalized > 0.15 && this.isMicActive) {
          this.callbacks?.onStateChange('listening');
        }

        this.animFrameId = requestAnimationFrame(updateMeter);
      };

      updateMeter();
    } catch (err) {
      console.warn('Audio analysis setup failed:', err);
    }
  }

  private stopAudioAnalysis() {
    if (this.animFrameId) {
      cancelAnimationFrame(this.animFrameId);
      this.animFrameId = null;
    }
    if (this.audioContext && this.audioContext.state !== 'closed') {
      this.audioContext.close().catch(() => {});
      this.audioContext = null;
    }
  }

  private setupRoomEvents() {
    if (!this.room) return;

    this.room.on(RoomEvent.Disconnected, () => {
      this.callbacks?.onStateChange('disconnected');
    });

    this.room.on(RoomEvent.TrackSubscribed, (track) => {
      if (track.kind === Track.Kind.Audio) {
        this.callbacks?.onStateChange('speaking');
      }
    });

    this.room.on(RoomEvent.TrackUnsubscribed, (track) => {
      if (track.kind === Track.Kind.Audio) {
        this.callbacks?.onStateChange('idle');
      }
    });
  }
}

export const livekitService = new LiveKitVoiceService();
