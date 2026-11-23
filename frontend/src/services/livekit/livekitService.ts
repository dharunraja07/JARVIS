import {
  Room,
  RoomEvent,
  Track,
  RemoteTrack,
  RemoteParticipant,
  Participant,
  type TranscriptionSegment,
} from 'livekit-client';
import type { AssistantState } from '../../types';
import { getApiBaseUrl, getClientDeviceType } from '../api/apiConfig';

export interface LiveKitCallbacks {
  onStateChange: (state: AssistantState) => void;
  onAudioLevel: (level: number) => void;
  onTranscript: (text: string, isFinal: boolean, sender: 'user' | 'jarvis') => void;
  onError: (error: string) => void;
}

class LiveKitVoiceService {
  private room: Room | null = null;
  private audioContext: AudioContext | null = null;
  private analyser: AnalyserNode | null = null;
  private animFrameId: number | null = null;
  private isMicActive: boolean = false;
  private callbacks: LiveKitCallbacks | null = null;
  private attachedAudioElements: HTMLMediaElement[] = [];

  public setCallbacks(callbacks: LiveKitCallbacks) {
    this.callbacks = callbacks;
  }

  public getRoom(): Room | null {
    return this.room;
  }

  public isConnected(): boolean {
    return this.room !== null && this.room.state === 'connected';
  }

  /**
   * Fetch a secure, short-lived JWT token from the backend companion API
   * and connect to the LiveKit voice room. Never exposes secrets to frontend.
   */
  public async fetchTokenAndConnect(
    companionUrl?: string,
    roomName: string = 'jarvis-room',
    identity?: string
  ): Promise<boolean> {
    this.callbacks?.onStateChange('connecting');

    const targetUrl = companionUrl || getApiBaseUrl();
    const deviceType = getClientDeviceType();

    try {
      const params = new URLSearchParams({ room: roomName, device: deviceType });
      if (identity) params.set('identity', identity);

      const res = await fetch(`${targetUrl}/api/livekit/token?${params.toString()}`, {
        headers: {
          Accept: 'application/json',
          'X-JARVIS-CLIENT-DEVICE': deviceType,
        },
      });

      if (!res.ok) {
        const errJson = await res.json().catch(() => ({}));
        throw new Error(errJson.error || `Companion token endpoint returned status ${res.status}`);
      }

      const { serverUrl, token } = await res.json();
      if (!serverUrl || !token) {
        throw new Error('Malformed token response from companion API.');
      }

      return await this.connect(serverUrl, token);
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Failed to connect via companion API.';
      this.callbacks?.onError(msg);
      this.callbacks?.onStateChange('error');
      return false;
    }
  }

  public async connect(url: string, token: string): Promise<boolean> {
    if (!url || !token) {
      this.callbacks?.onError('LiveKit Server URL and Token required.');
      this.callbacks?.onStateChange('error');
      return false;
    }

    try {
      this.callbacks?.onStateChange('connecting');

      if (this.room) {
        await this.disconnect();
      }

      this.room = new Room({
        adaptiveStream: true,
        dynacast: true,
      });

      this.setupRoomEvents();

      // Connect to LiveKit Room
      await this.room.connect(url, token);

      // Unlock browser audio playback
      try {
        await this.room.startAudio();
      } catch (err) {
        console.warn('[LiveKit] startAudio error:', err);
      }

      // Enable microphone on room connection
      await this.enableMicrophone();

      // Attach any tracks from participants already in the room
      this.room.remoteParticipants.forEach((p) => {
        p.trackPublications.forEach((pub) => {
          if (pub.track && pub.track.kind === Track.Kind.Audio) {
            const el = pub.track.attach();
            el.autoplay = true;
            el.style.display = 'none';
            document.body.appendChild(el);
            this.attachedAudioElements.push(el);
            el.play().catch(() => {});
          }
        });
      });

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
    this.cleanupAudio();

    if (this.room) {
      try {
        await this.room.disconnect();
      } catch {
        // ignore
      }
      this.room = null;
    }

    this.isMicActive = false;
    this.callbacks?.onStateChange('disconnected');
    this.callbacks?.onAudioLevel(0);
  }

  public async enableMicrophone(): Promise<boolean> {
    if (!this.room || this.room.state !== 'connected') {
      // Local preview capture when room is not yet connected
      try {
        const stream = await navigator.mediaDevices.getUserMedia({
          audio: {
            echoCancellation: true,
            noiseSuppression: true,
            autoGainControl: true,
          },
        });
        this.setupAudioAnalysis(stream);
        this.isMicActive = true;
        this.callbacks?.onStateChange('listening');
        return true;
      } catch (err) {
        const msg = err instanceof Error ? err.message : 'Microphone access denied.';
        this.callbacks?.onError(msg);
        return false;
      }
    }

    try {
      await this.room.localParticipant.setMicrophoneEnabled(true);
      const publication = this.room.localParticipant.getTrackPublication(Track.Source.Microphone);
      if (publication?.track?.mediaStreamTrack) {
        const stream = new MediaStream([publication.track.mediaStreamTrack]);
        this.setupAudioAnalysis(stream);
      }
      this.isMicActive = true;
      this.callbacks?.onStateChange('listening');
      return true;
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Microphone publication error.';
      this.callbacks?.onError(msg);
      return false;
    }
  }

  public async disableMicrophone() {
    if (this.room && this.room.state === 'connected') {
      try {
        await this.room.localParticipant.setMicrophoneEnabled(false);
      } catch {
        // ignore
      }
    }
    this.isMicActive = false;
    this.stopAudioAnalysis();
    this.callbacks?.onStateChange('idle');
    this.callbacks?.onAudioLevel(0);
  }

  public async toggleMicrophone() {
    if (this.isMicActive) {
      await this.disableMicrophone();
    } else {
      await this.enableMicrophone();
    }
  }

  public isMicrophoneActive(): boolean {
    return this.isMicActive;
  }

  public async sendTextMessage(text: string): Promise<boolean> {
    if (!this.room || this.room.state !== 'connected') {
      return false;
    }

    const payload = new TextEncoder().encode(
      JSON.stringify({
        type: 'user_message',
        text,
        timestamp: new Date().toISOString(),
      })
    );

    try {
      await this.room.localParticipant.publishData(payload, { reliable: true });
      return true;
    } catch (err) {
      console.warn('Failed to publish text message to room:', err);
      return false;
    }
  }

  private setupRoomEvents() {
    if (!this.room) return;

    this.room.on(RoomEvent.Reconnecting, () => {
      this.callbacks?.onStateChange('connecting');
    });

    this.room.on(RoomEvent.Reconnected, () => {
      this.callbacks?.onStateChange('idle');
    });

    this.room.on(RoomEvent.Disconnected, () => {
      this.callbacks?.onStateChange('disconnected');
      this.cleanupAudio();
    });

    // Remote Track Subscribed: Attach audio element so user can hear assistant speech!
    this.room.on(
      RoomEvent.TrackSubscribed,
      (track: RemoteTrack, _pub, participant: RemoteParticipant) => {
        if (track.kind === Track.Kind.Audio) {
          const audioElement = track.attach();
          audioElement.autoplay = true;
          audioElement.style.display = 'none';
          document.body.appendChild(audioElement);
          this.attachedAudioElements.push(audioElement);

          audioElement.play().catch((err) => {
            console.warn('[LiveKit] Audio autoplay blocked:', err);
          });

          // Listen for audio levels from remote track
          track.on('audioPlaybackStarted', () => {
            this.callbacks?.onStateChange('speaking');
          });

          // Detect when audio stops playing
          audioElement.onended = () => {
            this.callbacks?.onStateChange('idle');
          };
        }

        if (participant.isAgent || participant.identity.includes('agent')) {
          this.callbacks?.onStateChange('idle');
        }
      }
    );

    // Track Unsubscribed: Detach and remove audio element
    this.room.on(RoomEvent.TrackUnsubscribed, (track: RemoteTrack) => {
      if (track.kind === Track.Kind.Audio) {
        track.detach().forEach((el) => {
          el.remove();
          this.attachedAudioElements = this.attachedAudioElements.filter((a) => a !== el);
        });
        this.callbacks?.onStateChange('idle');
      }
    });

    // Real-time Active Speakers Detection
    this.room.on(RoomEvent.ActiveSpeakersChanged, (speakers: Participant[]) => {
      if (speakers.length === 0) {
        if (this.room?.state === 'connected' && !this.isMicActive) {
          this.callbacks?.onStateChange('idle');
        }
        return;
      }

      const isRemoteAgentSpeaking = speakers.some(
        (s) => s.isAgent || s.identity.includes('agent') || s.identity !== this.room?.localParticipant.identity
      );

      if (isRemoteAgentSpeaking) {
        this.callbacks?.onStateChange('speaking');
      } else if (this.isMicActive) {
        this.callbacks?.onStateChange('listening');
      }
    });

    // Real-time Transcriptions from LiveKit Agents STT
    this.room.on(
      RoomEvent.TranscriptionReceived,
      (transcriptions: TranscriptionSegment[], participant?: Participant) => {
        for (const segment of transcriptions) {
          const isAgent = Boolean(participant?.isAgent || participant?.identity.includes('agent'));
          this.callbacks?.onTranscript(
            segment.text,
            segment.final,
            isAgent ? 'jarvis' : 'user'
          );
        }
      }
    );

    // Data packets (chat messages / agent telemetry)
    this.room.on(RoomEvent.DataReceived, (payload: Uint8Array, participant?: RemoteParticipant) => {
      try {
        const decoded = new TextDecoder().decode(payload);
        const data = JSON.parse(decoded);
        const text = data.text || data.message || data.transcript;
        if (text) {
          const isAgent = Boolean(participant?.isAgent || participant?.identity.includes('agent'));
          this.callbacks?.onTranscript(text, true, isAgent ? 'jarvis' : 'user');
        }
      } catch {
        const text = new TextDecoder().decode(payload);
        if (text) {
          this.callbacks?.onTranscript(text, true, 'jarvis');
        }
      }
    });
  }

  private setupAudioAnalysis(stream: MediaStream) {
    try {
      const AudioCtx =
        window.AudioContext ||
        (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
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

        // When user speaks into mic, indicate listening state
        if (normalized > 0.12 && this.isMicActive && this.room?.state === 'connected') {
          this.callbacks?.onStateChange('listening');
        }

        this.animFrameId = requestAnimationFrame(updateMeter);
      };

      updateMeter();
    } catch (err) {
      console.warn('Audio analysis setup notice:', err);
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

  private cleanupAudio() {
    this.attachedAudioElements.forEach((el) => {
      el.pause();
      el.srcObject = null;
      el.remove();
    });
    this.attachedAudioElements = [];
  }
}

export const livekitService = new LiveKitVoiceService();
