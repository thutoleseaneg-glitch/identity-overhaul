
import React, { useState, useEffect, useCallback } from 'react';
import { UserState, DailyData, Contact } from './types';
import { LandingPage } from './components/LandingPage';
import { Dashboard } from './components/Dashboard';
import { ConsentModal } from './components/ConsentModal';
import { getLifeInsights } from './services/gemini';
import { exportToJSON, exportToCSV } from './services/exportService';

const App: React.FC = () => {
  const [user, setUser] = useState<UserState>(() => {
    const saved = localStorage.getItem('id_overhaul_user');
    const session = localStorage.getItem('id_session_token');
    
    // Auto-login if session token exists
    const initialUser = saved ? JSON.parse(saved) : {
      entries: {},
      contacts: [],
      consent: false,
      theme: 'dark',
      plan: 'free',
      isLoggedIn: false
    };

    if (session && initialUser.profile) {
      initialUser.isLoggedIn = true;
    }

    return initialUser;
  });

  const [viewDate, setViewDate] = useState(new Date());
  const [insights, setInsights] = useState<string[]>([]);
  const [isInsightLoading, setIsInsightLoading] = useState(false);

  useEffect(() => {
    localStorage.setItem('id_overhaul_user', JSON.stringify(user));
    document.body.setAttribute('data-theme', user.theme);
  }, [user]);

  const refreshInsights = useCallback(async () => {
    if (!user.consent || (Object.keys(user.entries).length === 0 && user.contacts.length === 0)) return;
    setIsInsightLoading(true);
    try {
      const newInsights = await getLifeInsights(user);
      setInsights(newInsights);
    } catch (err) {
      console.error("Failed to fetch insights:", err);
    } finally {
      setIsInsightLoading(false);
    }
  }, [user.consent, user.entries, user.contacts]);

  useEffect(() => {
    if (user.isLoggedIn && user.consent) {
      refreshInsights();
    }
  }, [user.isLoggedIn, user.consent, refreshInsights]);

  const handleLogin = (name: string, email: string) => {
    setUser(prev => ({
      ...prev,
      isLoggedIn: true,
      profile: { name, email }
    }));
  };

  const handleLogout = () => {
    localStorage.removeItem('id_session_token');
    setUser(prev => ({ ...prev, isLoggedIn: false }));
  };

  const handleDaySave = (data: Partial<DailyData>, date: Date) => {
    const key = date.toISOString().split('T')[0];
    
    // If new contacts are added in the daily log, update global list
    let updatedContacts = [...user.contacts];
    if (data.network?.newContacts) {
      updatedContacts = [...updatedContacts, ...data.network.newContacts];
    }

    setUser(prev => ({
      ...prev,
      contacts: updatedContacts,
      entries: {
        ...prev.entries,
        [key]: {
          ...prev.entries[key],
          ...data,
          categories: Array.from(new Set([...(prev.entries[key]?.categories || []), ...(data.categories || [])]))
        }
      }
    }));
  };

  if (!user.isLoggedIn) {
    return (
      <LandingPage 
        onLogin={handleLogin} 
        theme={user.theme} 
        toggleTheme={() => setUser(p => ({ ...p, theme: p.theme === 'light' ? 'dark' : 'light' }))} 
      />
    );
  }

  return (
    <>
      {!user.consent && <ConsentModal onAccept={() => setUser(prev => ({ ...prev, consent: true }))} />}
      <Dashboard 
        user={user}
        insights={insights}
        isInsightLoading={isInsightLoading}
        viewDate={viewDate}
        setViewDate={setViewDate}
        onDaySave={handleDaySave}
        onLogout={handleLogout}
        onRefreshInsights={refreshInsights}
        onThemeToggle={() => setUser(p => ({ ...p, theme: p.theme === 'light' ? 'dark' : 'light' }))}
        onExport={(format) => format === 'csv' ? exportToCSV(user) : exportToJSON(user, insights)}
      />
    </>
  );
};

export default App;
