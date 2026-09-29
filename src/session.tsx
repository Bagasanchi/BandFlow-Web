import { createContext, useCallback, useContext, useEffect, useMemo, useState, type ReactNode } from 'react';
import * as api from './api';

type Session = {
  profile: api.ApiProfile | null;
  isRestoring: boolean;
  isDarkTheme: boolean;
  workItems: api.WorkItem[];
  setDarkTheme: (isDark: boolean) => void;
  signIn: (email: string, password: string) => Promise<api.ApiProfile>;
  signOut: () => void;
  setProfile: (profile: api.ApiProfile) => void;
  refreshWork: () => Promise<void>;
};

const SessionContext = createContext<Session | null>(null);
const themeKey = 'bandflow_theme';

function readStoredTheme() {
  try {
    return localStorage.getItem(themeKey) !== 'light';
  } catch {
    return true;
  }
}

export function SessionProvider({ children }: { children: ReactNode }) {
  const [profile, setProfile] = useState<api.ApiProfile | null>(null);
  const [isRestoring, setIsRestoring] = useState(api.hasSession());
  const [isDarkTheme, setIsDarkTheme] = useState(readStoredTheme);
  const [workItems, setWorkItems] = useState<api.WorkItem[]>([]);

  const refreshWork = useCallback(async () => {
    try {
      setWorkItems(await api.getWork());
    } catch {
      setWorkItems([]);
    }
  }, []);

  // Reopen the previous session after a page reload instead of asking to log in again.
  useEffect(() => {
    if (!api.hasSession()) return;
    api.getProfile()
      .then((restored) => {
        setProfile(restored);
        return refreshWork();
      })
      .catch(() => api.logout())
      .finally(() => setIsRestoring(false));
  }, [refreshWork]);

  // Colors come from CSS variables keyed by these attributes (see index.css).
  useEffect(() => {
    document.documentElement.dataset.theme = isDarkTheme ? 'dark' : 'light';
    document.documentElement.dataset.role = profile?.role ?? 'worker';
    document.documentElement.style.colorScheme = isDarkTheme ? 'dark' : 'light';
  }, [isDarkTheme, profile?.role]);

  const value = useMemo<Session>(() => ({
    profile,
    isRestoring,
    isDarkTheme,
    workItems,
    setDarkTheme: (isDark) => {
      setIsDarkTheme(isDark);
      try {
        localStorage.setItem(themeKey, isDark ? 'dark' : 'light');
      } catch {
        // Theme still applies for this visit.
      }
    },
    signIn: async (email, password) => {
      await api.login(email, password);
      const signedIn = await api.getProfile();
      setProfile(signedIn);
      await refreshWork();
      return signedIn;
    },
    signOut: () => {
      api.logout();
      setProfile(null);
      setWorkItems([]);
    },
    setProfile,
    refreshWork,
  }), [profile, isRestoring, isDarkTheme, workItems, refreshWork]);

  return <SessionContext.Provider value={value}>{children}</SessionContext.Provider>;
}

export function useSession() {
  const session = useContext(SessionContext);
  if (!session) throw new Error('useSession must be used inside SessionProvider');
  return session;
}
