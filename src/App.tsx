import { useEffect, useState } from 'react';
import type { User } from '@supabase/supabase-js';
import { supabase } from '@/lib/supabase';
import { AuthContext } from '@/lib/auth';
import { useTaskStore } from '@/store/useTaskStore';
import AuthPage from '@/components/AuthPage';
import Header from '@/components/Header';
import TaskGrid from '@/components/TaskGrid';
import FrostedOverlay from '@/components/FrostedOverlay';
import { LogOut } from 'lucide-react';

export default function App() {
  const [user, setUser] = useState<User | null>(null);
  const [authLoading, setAuthLoading] = useState(true);
  const { loadTasks, subscribeToChanges } = useTaskStore();
  const loading = useTaskStore((s) => s.loading);

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      setUser(session?.user ?? null);
      setAuthLoading(false);
    });

    const { data: listener } = supabase.auth.onAuthStateChange((_event, session) => {
      setUser(session?.user ?? null);
    });

    return () => listener.subscription.unsubscribe();
  }, []);

  useEffect(() => {
    if (user) {
      loadTasks();
      const unsubscribe = subscribeToChanges();
      return unsubscribe;
    }
  }, [user]);

  const signOut = async () => {
    await supabase.auth.signOut();
    useTaskStore.setState({ tasks: [] });
  };

  if (authLoading) {
    return (
      <div className="w-full h-full flex items-center justify-center bg-canvas">
        <p className="text-sm text-canvas-muted/40 tracking-wide">加载中...</p>
      </div>
    );
  }

  if (!user) {
    return <AuthPage />;
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
