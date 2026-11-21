import React, { Suspense, lazy } from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AppLayout } from './components/layout/AppLayout';
import { Radio } from 'lucide-react';

// Code-split pages for high performance and fast initial load
const Home = lazy(() => import('./pages/Home').then((m) => ({ default: m.Home })));
const Chat = lazy(() => import('./pages/Chat').then((m) => ({ default: m.Chat })));
const Memory = lazy(() => import('./pages/Memory').then((m) => ({ default: m.Memory })));
const Intelligence = lazy(() => import('./pages/Intelligence').then((m) => ({ default: m.Intelligence })));
const PCControl = lazy(() => import('./pages/PCControl').then((m) => ({ default: m.PCControl })));
const Settings = lazy(() => import('./pages/Settings').then((m) => ({ default: m.Settings })));

const PageLoadingFallback: React.FC = () => (
  <div className="flex flex-col items-center justify-center min-h-[60vh] gap-3">
    <div className="w-10 h-10 rounded-xl flex items-center justify-center bg-blue-600/20 text-cyan-400 border border-cyan-400/40 shadow-[0_0_15px_rgba(34,211,238,0.3)] animate-pulse">
      <Radio size={20} className="animate-spin" />
    </div>
    <span className="text-xs font-mono tracking-widest text-cyan-300 uppercase">
      INITIALIZING NEURAL SUBSYSTEM...
    </span>
  </div>
);

export function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<AppLayout />}>
          <Route
            index
            element={
              <Suspense fallback={<PageLoadingFallback />}>
                <Home />
              </Suspense>
            }
          />
          <Route
            path="chat"
            element={
              <Suspense fallback={<PageLoadingFallback />}>
                <Chat />
              </Suspense>
            }
          />
          <Route
            path="memory"
            element={
              <Suspense fallback={<PageLoadingFallback />}>
                <Memory />
              </Suspense>
            }
          />
          <Route
            path="intelligence"
            element={
              <Suspense fallback={<PageLoadingFallback />}>
                <Intelligence />
              </Suspense>
            }
          />
          <Route
            path="pc-control"
            element={
              <Suspense fallback={<PageLoadingFallback />}>
                <PCControl />
              </Suspense>
            }
          />
          <Route
            path="settings"
            element={
              <Suspense fallback={<PageLoadingFallback />}>
                <Settings />
              </Suspense>
            }
          />
          <Route path="*" element={<Navigate to="/" replace />} />
        </Route>
      </Routes>
    </BrowserRouter>
  );
}

export default App;
