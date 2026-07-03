import { useEffect, useState, useCallback } from 'react';
import type { User } from '@supabase/supabase-js';
import { supabase } from '@/lib/supabase';
import { AuthContext } from '@/lib/auth';
import { useTaskStore } from '@/store/useTaskStore';
import AuthPage from '@/components/AuthPage';
import SetPasswordPage from '@/components/SetPasswordPage';
import Header from '@/components/Header';
import TaskGrid from '@/components/TaskGrid';
import FrostedOverlay from '@/components/FrostedOverlay';
import { LogOut } from 'lucide-react';

const PW_SKIP_KEY = 'wp_pw_skip';

export default function App() {
  const [user, setUser] = useState<User | null>(null);
  const [authLoading, setAuthLoading] = useState(true);
  const [showSetPassword, setShowSetPassword] = useState(false);
  const { loadTasks, subscribeToChanges } = useTaskStore();

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      const u = session?.user ?? null;
      setUser(u);
      if (u) {
        const skipped = localStorage.getItem(PW_SKIP_KEY);
        if (!skipped) {
          setShowSetPassword(true);
          return;
        }
      }
      setAuthLoading(false);
    });

    const { data: listener } = supabase.auth.onAuthStateChange((_event, session) => {
      const u = session?.user ?? null;
      setUser(u);
      if (u) {
        const skipped = localStorage.getItem(PW_SKIP_KEY);
        if (!skipped) {
          setShowSetPassword(true);
          return;
        }
        setAuthLoading(false);
      }
    });

    return () => listener.subscription.unsubscribe();
  }, []);

  const handleSetPasswordDone = useCallback(() => {
    localStorage.setItem(PW_SKIP_KEY, '1');
    setShowSetPassword(false);
    setAuthLoading(false);
  }, []);

  useEffect(() => {
    if (user && !showSetPassword && !authLoading) {
      loadTasks();
      const unsubscribe = subscribeToChanges();
      return unsubscribe;
    }
  }, [user, showSetPassword, authLoading]);

  const signOut = async () => {
    await supabase.auth.signOut();
    useTaskStore.setState({ tasks: [] });
  };

  if (authLoading && !showSetPassword) {
    return (
      <div className="w-full h-full flex items-center justify-center bg-canvas">
        <p className="text-sm text-canvas-muted/40 tracking-wide">加载中...</p>
      </div>
    );
  }

  if (!user) {
    return <AuthPage />;
  }

  if (showSetPassword) {
    return (
      <SetPasswordPage
        email={user.email || ''}
        onDone={handleSetPasswordDone}
      />
    );
  }

  return (
    <AuthContext.Provider value={{ user, loading: authLoading, signOut }}>
      <div className="w-full h-full flex flex-col bg-canvas">
        <div className="flex items-center justify-end px-5 py-3 border-b border-canvas-mid/40 shrink-0">
          <div className="flex items-center gap-3">
            <span className="text-xs text-canvas-muted/50 tracking-wide">{user.email}</span>
            <button
              onClick={signOut}
              className="flex items-center gap-1 px-2.5 py-1 rounded-lg text-xs text-canvas-muted/50 hover:text-red-400 hover:bg-red-50/50 transition-colors"
            >
              <LogOut size={13} /> 退出
            </button>
          </div>
        </div>
        <Header />
        <TaskGrid />
        <FrostedOverlay />
      </div>
    </AuthContext.Provider>
  );
}
