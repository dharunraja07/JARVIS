import React, { useState } from 'react';
import { useJarvisStore } from '../store/useJarvisStore';
import { useTheme } from '../hooks/useTheme';
import {
  Settings as SettingsIcon,
  Moon,
  Sun,
  Globe,
  Volume2,
  Server,
  Shield,
  Save,
  Check,
} from 'lucide-react';
import { Button } from '../components/common/Button';
import { livekitService } from '../services/livekit/livekitService';

export const Settings: React.FC = () => {
  const { preferences, updatePreferences, showToast, assistantState } = useJarvisStore();
  const { theme, toggleTheme } = useTheme();

  const [form, setForm] = useState({
    language: preferences.language,
    autoSpeak: preferences.autoSpeak,
    voiceSpeed: preferences.voiceSpeed,
    livekitServerUrl: preferences.livekitServerUrl,
    livekitToken: preferences.livekitToken,
    companionApiUrl: preferences.companionApiUrl,
    lowPowerMode: preferences.lowPowerMode,
    soundEffects: preferences.soundEffects,
  });

  const [isSaved, setIsSaved] = useState(false);
  const [testingLiveKit, setTestingLiveKit] = useState(false);

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    updatePreferences(form);
    setIsSaved(true);
    showToast('Preferences successfully updated and saved to storage.', 'success');
    setTimeout(() => setIsSaved(false), 2000);
  };

  const handleTestLiveKit = async () => {
    if (!form.livekitToken) {
      showToast('Please enter a LiveKit Token to test connection.', 'warning');
      return;
    }
    setTestingLiveKit(true);
    const success = await livekitService.connect(form.livekitServerUrl, form.livekitToken);
    setTestingLiveKit(false);
    if (success) {
      showToast('LiveKit connection established successfully!', 'success');
    }
  };

  return (
    <div className="p-4 md:p-6 max-w-4xl mx-auto space-y-6">
      {/* Header */}
      <div className="flex items-center gap-3 pb-2 border-b border-blue-500/20">
        <div className="p-2.5 rounded-xl bg-blue-600/20 text-cyan-400 border border-cyan-500/30">
          <SettingsIcon size={22} />
        </div>
        <div>
          <h2 className="text-xl font-bold text-slate-100 light:text-slate-900 tracking-wide">
            System Configuration & Settings
          </h2>
          <p className="text-xs font-mono text-slate-400">
            J.A.R.V.I.S. INTERFACE // PREFERENCES // SECURE INTEGRATIONS
          </p>
        </div>
      </div>

      <form onSubmit={handleSave} className="space-y-6">
        {/* Appearance & Theme Section */}
        <div className="p-5 rounded-2xl glass-panel border border-slate-700/60 space-y-4">
          <h3 className="text-sm font-semibold text-slate-200 light:text-slate-800 flex items-center gap-2">
            <Sun size={16} className="text-amber-400" /> Visual Identity & Theme
          </h3>

          <div className="flex items-center justify-between p-3 rounded-xl bg-slate-900/60 border border-slate-800">
            <div>
              <p className="text-sm font-medium text-slate-200 light:text-slate-800">
                Interface Color Scheme
              </p>
              <p className="text-xs text-slate-400">
                Current theme is {theme === 'dark' ? 'Futuristic Deep Dark (#070B14)' : 'Clean High-Contrast Light'}
              </p>
            </div>
            <button
              type="button"
              onClick={toggleTheme}
              className="px-4 py-2 rounded-xl text-xs font-mono flex items-center gap-2 bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 transition-all"
            >
              {theme === 'dark' ? <Moon size={14} className="text-cyan-400" /> : <Sun size={14} className="text-amber-400" />}
              {theme === 'dark' ? 'Dark Mode' : 'Light Mode'}
            </button>
          </div>
        </div>

        {/* Assistant Linguistics Section */}
        <div className="p-5 rounded-2xl glass-panel border border-slate-700/60 space-y-4">
          <h3 className="text-sm font-semibold text-slate-200 light:text-slate-800 flex items-center gap-2">
            <Globe size={16} className="text-cyan-400" /> Assistant Linguistics & Language
          </h3>

          <div className="space-y-3">
            <label className="block text-xs font-mono text-slate-400 uppercase">
              Conversational Dialect
            </label>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              {(['English', 'Tamil', 'Tanglish'] as const).map((lang) => (
                <button
                  type="button"
                  key={lang}
                  onClick={() => setForm({ ...form, language: lang })}
                  className={`p-3 rounded-xl border text-left transition-all ${
                    form.language === lang
                      ? 'bg-blue-600/20 border-cyan-400 text-cyan-300 shadow-md shadow-cyan-500/10'
                      : 'bg-slate-900/60 border-slate-800 text-slate-400 hover:text-slate-200'
                  }`}
                >
                  <p className="text-sm font-bold font-mono">{lang}</p>
                  <p className="text-[11px] text-slate-400 mt-1">
                    {lang === 'English' && 'Global English dialect'}
                    {lang === 'Tamil' && 'தமிழ் பேச்சு வடிவம்'}
                    {lang === 'Tanglish' && 'Tamil + English blend'}
                  </p>
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Voice & Speech Pipeline Section */}
        <div className="p-5 rounded-2xl glass-panel border border-slate-700/60 space-y-4">
          <h3 className="text-sm font-semibold text-slate-200 light:text-slate-800 flex items-center gap-2">
            <Volume2 size={16} className="text-cyan-400" /> Voice & Audio Neural Pipeline
          </h3>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs font-mono">
            <div className="p-3 rounded-xl bg-slate-900/60 border border-slate-800 space-y-1">
              <span className="text-slate-400">SPEECH-TO-TEXT (STT)</span>
              <p className="text-sm font-bold text-slate-200">Cartesia Ink-Whisper</p>
              <span className="text-[10px] text-cyan-400">Sub-150ms Streamed Inference</span>
            </div>
            <div className="p-3 rounded-xl bg-slate-900/60 border border-slate-800 space-y-1">
              <span className="text-slate-400">TEXT-TO-SPEECH (TTS)</span>
              <p className="text-sm font-bold text-slate-200">Google Gemini-3.8-Flash-TTS</p>
              <span className="text-[10px] text-cyan-400">Expressive Neural Audio Synthesis</span>
            </div>
          </div>
        </div>

        {/* LiveKit Cloud & Server Connection */}
        <div className="p-5 rounded-2xl glass-panel border border-slate-700/60 space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-semibold text-slate-200 light:text-slate-800 flex items-center gap-2">
              <Server size={16} className="text-blue-400" /> LiveKit Voice Cloud WebRTC Mesh
            </h3>
            <span className="text-xs font-mono text-cyan-400 uppercase">
              STATUS: {assistantState.toUpperCase()}
            </span>
          </div>

          <div className="space-y-3">
            <div>
              <label className="block text-xs font-mono text-slate-400 mb-1">
                LIVEKIT SERVER WEBSOCKET URL
              </label>
              <input
                type="text"
                value={form.livekitServerUrl}
                onChange={(e) => setForm({ ...form, livekitServerUrl: e.target.value })}
                placeholder="wss://your-project.livekit.cloud"
                className="w-full py-2.5 px-3 rounded-xl glass-panel border border-cyan-500/30 text-sm font-mono text-slate-100 focus:outline-none"
              />
            </div>

            <div>
              <label className="block text-xs font-mono text-slate-400 mb-1">
                LIVEKIT ACCESS TOKEN (CLIENT TOKEN)
              </label>
              <input
                type="password"
                value={form.livekitToken}
                onChange={(e) => setForm({ ...form, livekitToken: e.target.value })}
                placeholder="eyJhbGciOi..."
                className="w-full py-2.5 px-3 rounded-xl glass-panel border border-cyan-500/30 text-sm font-mono text-slate-100 focus:outline-none"
              />
              <p className="text-[11px] text-slate-400 mt-1">
                Never commit API secrets. For development, generate a client token from LiveKit Cloud console.
              </p>
            </div>

            <div className="pt-1">
              <Button
                type="button"
                variant="secondary"
                size="sm"
                onClick={handleTestLiveKit}
                disabled={testingLiveKit}
              >
                {testingLiveKit ? 'Connecting...' : 'Test LiveKit Connection'}
              </Button>
            </div>
          </div>
        </div>

        {/* Save Changes Button */}
        <div className="flex justify-end pt-2">
          <Button
            type="submit"
            variant="glow"
            icon={isSaved ? <Check size={16} /> : <Save size={16} />}
          >
            {isSaved ? 'Settings Saved!' : 'Save System Settings'}
          </Button>
        </div>

        {/* About J.A.R.V.I.S. */}
        <div className="p-5 rounded-2xl glass-panel border border-blue-500/20 space-y-3">
          <div className="flex items-center gap-2 text-sm font-bold text-slate-100">
            <Shield size={18} className="text-cyan-400" /> About J.A.R.V.I.S. Mark VII
          </div>
          <p className="text-xs text-slate-300 leading-relaxed">
            J.A.R.V.I.S. (Just A Rather Very Intelligent System) is an autonomous personal AI voice
            assistant engineered with LiveKit Agents SDK, Google Gemma 4 31B instruction-tuned neural
            model, Cartesia audio transcription, Gemini neural speech synthesis, and SQLite persistent
            episodic memory.
          </p>
          <div className="text-[11px] font-mono text-slate-400 flex flex-wrap gap-4 pt-1">
            <span>Core: v4.2 Production</span>
            <span>Frontend: React 19 + Vite + Tailwind v4</span>
            <span>Client: Windows 11</span>
          </div>
        </div>
      </form>
    </div>
  );
};
