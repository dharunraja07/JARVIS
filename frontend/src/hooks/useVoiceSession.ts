import { useCallback, useEffect, useState } from 'react';
import { useJarvisStore } from '../store/useJarvisStore';
import { livekitService } from '../services/livekit/livekitService';
import type { AssistantState } from '../types';

export function useVoiceSession() {
  const {
    assistantState,
    setAssistantState,
    audioLevel,
    setAudioLevel,
    currentTranscript,
    setCurrentTranscript,
    addMessage,
    showToast,
    preferences,
  } = useJarvisStore();

  const [isLiveKitConnected, setIsLiveKitConnected] = useState(false);

  useEffect(() => {
    livekitService.setCallbacks({
      onStateChange: (state: AssistantState) => {
        setAssistantState(state);
        setIsLiveKitConnected(livekitService.isConnected());
      },
      onAudioLevel: (level: number) => {
        setAudioLevel(level);
      },
      onTranscript: (text: string, isFinal: boolean, sender: 'user' | 'jarvis') => {
        if (!text.trim()) return;

        if (isFinal) {
          addMessage({ sender, text });
          setCurrentTranscript('');
        } else {
          setCurrentTranscript(text);
        }
      },
      onError: (err: string) => {
        showToast(err, 'error');
      },
    });

    return () => {
      // Don't disconnect on brief tab switches
    };
  }, [
    setAssistantState,
    setAudioLevel,
    setCurrentTranscript,
    addMessage,
    showToast,
  ]);

  const connectToVoice = useCallback(async () => {
    const companionUrl = preferences.companionApiUrl || 'http://127.0.0.1:8000';
    try {
      showToast('Connecting to LiveKit Voice Mesh...', 'info');
      const success = await livekitService.fetchTokenAndConnect(companionUrl, 'jarvis-room');
      if (success) {
        showToast('Connected to JARVIS voice session.', 'success');
        setIsLiveKitConnected(true);
      }
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Voice connection failed.';
      showToast(msg, 'error');
    }
  }, [preferences.companionApiUrl, showToast]);

  const disconnectVoice = useCallback(async () => {
    await livekitService.disconnect();
    setIsLiveKitConnected(false);
    showToast('Voice session disconnected.', 'info');
  }, [showToast]);

  const toggleMic = useCallback(async () => {
    if (!livekitService.isConnected()) {
      await connectToVoice();
      return;
    }

    if (livekitService.isMicrophoneActive()) {
      await livekitService.disableMicrophone();
    } else {
      await livekitService.enableMicrophone();
    }
  }, [connectToVoice]);

  const sendTextMessage = useCallback(
    async (text: string) => {
      if (!text.trim()) return;

      // Add user message to UI
      addMessage({ sender: 'user', text });

      if (livekitService.isConnected()) {
        const sent = await livekitService.sendTextMessage(text);
        if (!sent) {
          showToast('Failed to dispatch message to LiveKit room.', 'warning');
        }
      } else {
        // Not connected to LiveKit: inform user cleanly
        showToast(
          'LiveKit Agent not connected. Click the microphone or connect in Settings to initiate voice dialogue.',
          'info'
        );
      }
    },
    [addMessage, showToast]
  );

  return {
    assistantState,
    audioLevel,
    currentTranscript,
    isListening: assistantState === 'listening',
    isLiveKitConnected,
    connectToVoice,
    disconnectVoice,
    toggleMic,
    sendTextMessage,
    setAssistantState,
  };
}
