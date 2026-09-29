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
  notice: Notice | null;
  showNotice: (notice: Notice) => void;
  dismissNotice: () => void;
};

export type Notice = { title: string; text: string; tone: 'success' | 'warning' };

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
  const [notice, setNotice] = useState<Notice | null>(null);

  // On a failed refresh keep the last list rather than blanking the page.
  const refreshWork = useCallback(async () => {
    try {
      setWorkItems(await api.getWork());
    } catch {
      // The next refresh will try again.
    }
  }, []);

  // Reopen the previous session after a page reload instead of asking to log in again.
  // Only a rejected token logs out; if the server is simply not running yet, keep the login.
  useEffect(() => {
    if (!api.hasSession()) return;
    api.getProfile()
      .then((restored) => {
        setProfile(restored);
        return refreshWork();
      })
      .catch((error) => {
        if (error instanceof api.ApiError && error.status === 401) api.logout();
      })
      .finally(() => setIsRestoring(false));
  }, [refreshWork]);

  // Progress changes on the server when the wristband reports DONE, so keep the list fresh
  // while signed in: every 15 seconds while the tab is visible, and when it becomes visible again.
  useEffect(() => {
    if (!profile) return;
    const refreshIfVisible = () => {
      if (document.visibilityState === 'visible') void refreshWork();
    };
    const interval = window.setInterval(refreshIfVisible, 15000);
    document.addEventListener('visibilitychange', refreshIfVisible);
    window.addEventListener('focus', refreshIfVisible);
    return () => {
      window.clearInterval(interval);
      document.removeEventListener('visibilitychange', refreshIfVisible);
      window.removeEventListener('focus', refreshIfVisible);
    };
  }, [profile, refreshWork]);

  useEffect(() => {
    if (!notice) return;
    const timer = window.setTimeout(() => setNotice(null), 9000);
    return () => window.clearTimeout(timer);
  }, [notice]);

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
    notice,
    showNotice: setNotice,
    dismissNotice: () => setNotice(null),
  }), [profile, isRestoring, isDarkTheme, workItems, refreshWork, notice]);

  return <SessionContext.Provider value={value}>{children}</SessionContext.Provider>;
}

export function useSession() {
  const session = useContext(SessionContext);
  if (!session) throw new Error('useSession must be used inside SessionProvider');
  return session;
}
