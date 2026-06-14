import { useCallback, useEffect, useMemo, useState, lazy, Suspense } from 'react';
import Sidebar from './components/layout/Sidebar';
import MobileHeader from './components/layout/MobileHeader';
import MobileNav from './components/layout/MobileNav';
import OnboardingPage from './pages/OnboardingPage';
import { APP_NAME, APP_PAGES } from './constants';
import { useWellnessApi } from './hooks/useWellnessApi';
import { usePageFocus } from './hooks/useFocusTrap';
import {
  loadProfile,
  saveProfile,
  loadCheckIns,
  saveCheckIn,
  loadJournals,
  saveJournal,
  loadChatMessages,
  saveChatMessages,
  clearAllData,
} from './utils/profile';
import { computeWellnessStats } from './utils/wellness';

const HomePage = lazy(() => import('./pages/HomePage'));
const CheckInPage = lazy(() => import('./pages/CheckInPage'));
const JournalPage = lazy(() => import('./pages/JournalPage'));
const DashboardPage = lazy(() => import('./pages/DashboardPage'));
const ExercisesPage = lazy(() => import('./pages/ExercisesPage'));
const ChatPage = lazy(() => import('./pages/ChatPage'));
const SettingsPage = lazy(() => import('./pages/SettingsPage'));

const pageFallback = (
  <div className="glass-card animate-pulse motion-reduce:animate-none" role="status" aria-live="polite">
    <p className="text-sm text-slate-500">Loading…</p>
  </div>
);

export default function App() {
  const [profile, setProfile] = useState(() => loadProfile());
  const [activePage, setActivePage] = useState(APP_PAGES.HOME);
  const [checkIns, setCheckIns] = useState(() => loadCheckIns());
  const [journals, setJournals] = useState(() => loadJournals());
  const [chatMessages, setChatMessages] = useState(() => loadChatMessages());
  const [emergencyExercise, setEmergencyExercise] = useState(null);
  const { loading, analyzeJournal, sendChat } = useWellnessApi();

  const stats = useMemo(() => computeWellnessStats(checkIns), [checkIns]);
  const isChatPage = activePage === APP_PAGES.CHAT;

  usePageFocus(activePage);

  useEffect(() => {
    document.body.classList.toggle('high-contrast', !!profile.highContrast);
    document.body.classList.toggle('font-dyslexia', !!profile.dyslexiaFont);
  }, [profile.highContrast, profile.dyslexiaFont]);

  const handleOnboardingComplete = useCallback((data) => {
    setProfile(saveProfile(data));
    setActivePage(APP_PAGES.HOME);
  }, []);

  const handleOnboardingSkip = useCallback((data) => {
    setProfile(saveProfile({ ...data, userName: '', userAge: '' }));
    setActivePage(APP_PAGES.HOME);
  }, []);

  const handleNavigate = useCallback((pageId) => {
    setActivePage(pageId);
    if (pageId !== APP_PAGES.EXERCISES) setEmergencyExercise(null);
    try { window.scrollTo({ top: 0, behavior: 'smooth' }); } catch { /* jsdom */ }
  }, []);

  const handleEmergencyCalm = useCallback(() => {
    setEmergencyExercise('breath-478');
    setActivePage(APP_PAGES.EXERCISES);
    try { window.scrollTo({ top: 0, behavior: 'smooth' }); } catch { /* jsdom */ }
  }, []);

  const handleCheckIn = useCallback(async (metrics) => {
    const entry = {
      id: crypto.randomUUID(),
      timestamp: new Date().toISOString(),
      date: new Date().toISOString(),
      metrics,
      ...metrics,
    };
    setCheckIns(saveCheckIn(entry));
    return true;
  }, []);

  const handleJournalSave = useCallback((entry) => {
    const saved = { ...entry, id: crypto.randomUUID() };
    setJournals(saveJournal(saved));
  }, []);

  const handleJournalAnalyze = useCallback(
    async (text) =>
      analyzeJournal({
        journalText: text,
        exam: profile.selectedExam,
        userName: profile.userName,
        userAge: profile.userAge,
      }),
    [analyzeJournal, profile]
  );

  const handleChatSend = useCallback(
    async (text) => {
      const userMsg = { id: crypto.randomUUID(), role: 'user', text };
      const next = [...chatMessages, userMsg];
      setChatMessages(next);

      const reply = await sendChat({
        message: text,
        exam: profile.selectedExam,
        userName: profile.userName,
        history: chatMessages,
      });

      if (reply) {
        const withReply = [...next, { id: crypto.randomUUID(), role: 'assistant', text: reply }];
        setChatMessages(withReply);
        saveChatMessages(withReply);
      }
    },
    [chatMessages, sendChat, profile]
  );

  const handleSettingsSave = useCallback((data) => {
    setProfile(saveProfile(data));
  }, []);

  const handleReset = useCallback(() => {
    clearAllData();
    setProfile(loadProfile());
    setCheckIns([]);
    setJournals([]);
    setChatMessages([]);
    setActivePage(APP_PAGES.HOME);
  }, []);

  const pageContent = useMemo(() => {
    switch (activePage) {
      case APP_PAGES.HOME:
        return <HomePage profile={profile} stats={stats} onNavigate={handleNavigate} />;
      case APP_PAGES.CHECK_IN:
        return <CheckInPage onSubmit={handleCheckIn} loading={loading} />;
      case APP_PAGES.JOURNAL:
        return (
          <JournalPage
            journals={journals}
            onSave={handleJournalSave}
            onAnalyze={handleJournalAnalyze}
            loading={loading}
          />
        );
      case APP_PAGES.DASHBOARD:
        return <DashboardPage profile={profile} stats={stats} checkIns={checkIns} />;
      case APP_PAGES.EXERCISES:
        return <ExercisesPage initialExerciseId={emergencyExercise} />;
      case APP_PAGES.CHAT:
        return (
          <ChatPage profile={profile} messages={chatMessages} onSend={handleChatSend} loading={loading} />
        );
      case APP_PAGES.SETTINGS:
        return <SettingsPage profile={profile} onSave={handleSettingsSave} onReset={handleReset} />;
      default:
        return <HomePage profile={profile} stats={stats} onNavigate={handleNavigate} />;
    }
  }, [
    activePage,
    profile,
    stats,
    checkIns,
    journals,
    chatMessages,
    loading,
    emergencyExercise,
    handleNavigate,
    handleCheckIn,
    handleJournalSave,
    handleJournalAnalyze,
    handleChatSend,
    handleSettingsSave,
    handleReset,
  ]);

  if (!profile.onboardingComplete) {
    return <OnboardingPage onComplete={handleOnboardingComplete} onSkip={handleOnboardingSkip} />;
  }

  return (
    <div className="app-shell">
      <div className="app-bg" aria-hidden="true">
        <div className="app-bg-orb -left-32 top-0 h-96 w-96 bg-amber-500/8" />
        <div className="app-bg-orb -right-24 top-1/4 h-80 w-80 bg-violet-500/8" />
        <div className="app-bg-orb bottom-0 left-1/3 h-64 w-64 bg-amber-600/5" />
      </div>

      <Sidebar
        activePage={activePage}
        onNavigate={handleNavigate}
        onEmergencyCalm={handleEmergencyCalm}
        userName={profile.userName}
        selectedExam={profile.selectedExam}
      />

      <MobileHeader
        userName={profile.userName}
        selectedExam={profile.selectedExam}
        activePage={activePage}
        onNavigate={handleNavigate}
        onEmergencyCalm={handleEmergencyCalm}
      />

      <div className="app-content">
        <a href="#main-content" className="skip-link">Skip to main content</a>

        <main
          id="main-content"
          className={isChatPage ? 'app-main app-main-chat' : 'app-main'}
        >
          <Suspense fallback={pageFallback}>{pageContent}</Suspense>
        </main>

        <footer className="app-footer">
          <p className="text-xs text-slate-500">
            {APP_NAME} supports reflection — not a substitute for professional mental health care.
          </p>
        </footer>
      </div>

      <MobileNav activePage={activePage} onNavigate={handleNavigate} />
    </div>
  );
}
