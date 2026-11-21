import { useCallback, useEffect } from 'react';
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

  const simulateJarvisVoiceResponse = useCallback(
    (prompt: string) => {
      setAssistantState('processing');

      setTimeout(() => {
        setAssistantState('speaking');

        let reply = "I have processed your query, Sir. All systems operating at optimal parameters.";
        const lower = prompt.toLowerCase();

        if (lower.includes('weather')) {
          reply = "Checking atmospheric conditions: Expect moderate temperatures and clear skies today.";
        } else if (lower.includes('system') || lower.includes('cpu') || lower.includes('ram')) {
          reply = "Workstation diagnostics report nominal loads across all 16 logical cores. Memory consumption is stable.";
        } else if (lower.includes('news')) {
          reply = "Latest intelligence reports highlight breakthroughs in multimodal neural agent frameworks.";
        } else if (lower.includes('remember') || lower.includes('memory')) {
          reply = "Understood, Sir. I have indexed that observation into my persistent neural memory bank.";
        } else if (lower.includes('hello') || lower.includes('hi') || lower.includes('jarvis')) {
          reply = "Good day, Sir. I am listening and ready for your command.";
        }

        addMessage({ sender: 'jarvis', text: reply });

        // Reset state after speaking duration
        setTimeout(() => {
          setAssistantState('idle');
        }, 2800);
      }, 1000);
    },
    [setAssistantState, addMessage]
  );

  useEffect(() => {
    livekitService.setCallbacks({
      onStateChange: (state: AssistantState) => {
        setAssistantState(state);
      },
      onAudioLevel: (level: number) => {
        setAudioLevel(level);
      },
      onTranscript: (text: string, isFinal: boolean) => {
        setCurrentTranscript(text);
        if (isFinal && text.trim()) {
          addMessage({ sender: 'user', text });
          simulateJarvisVoiceResponse(text);
        }
      },
      onError: (err: string) => {
        showToast(err, 'error');
      },
    });
  }, [
    setAssistantState,
    setAudioLevel,
    setCurrentTranscript,
    addMessage,
    showToast,
    simulateJarvisVoiceResponse,
  ]);

  const toggleMic = useCallback(async () => {
    if (assistantState === 'listening') {
      livekitService.disableMicrophone();
      setAssistantState('idle');
    } else {
      const ok = await livekitService.enableMicrophone();
      if (!ok) {
        // Fallback simulation toggle
        setAssistantState('listening');
        showToast('Microphone activated in local voice capture mode.', 'info');
      }
    }
  }, [assistantState, setAssistantState, showToast]);

  const sendTextMessage = useCallback(
    (text: string) => {
      if (!text.trim()) return;
      addMessage({ sender: 'user', text });
      simulateJarvisVoiceResponse(text);
    },
    [addMessage, simulateJarvisVoiceResponse]
  );

  const connectLiveKit = useCallback(async () => {
    const { livekitServerUrl, livekitToken } = preferences;
    if (!livekitToken) {
      showToast('Please provide a LiveKit Token in Settings or use Local Voice Mode.', 'warning');
      return;
    }
    await livekitService.connect(livekitServerUrl, livekitToken);
  }, [preferences, showToast]);

  const disconnectLiveKit = useCallback(async () => {
    await livekitService.disconnect();
  }, []);

  return {
    assistantState,
    audioLevel,
    currentTranscript,
    isListening: assistantState === 'listening',
    toggleMic,
    sendTextMessage,
    connectLiveKit,
    disconnectLiveKit,
    setAssistantState,
  };
}
