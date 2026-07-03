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

const PW_SET_KEY = 'wp_pw_set';

function isNewUser(user: User): boolean {
  const created = new Date(user.created_at).getTime();
  const now = Date.now();
  return now - created < 30_000;
}

export default function App() {
  const [user, setUser] = useState<User | null>(null);
  const [authLoading, setAuthLoading] = useState(true);
  const [showSetPassword, setShowSetPassword] = useState(false);
  const { loadTasks, subscribeToChanges, tasks } = useTaskStore();

  const [batchMode, setBatchMode] = useState(false);
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      const u = session?.user ?? null;
      setUser(u);
      setAuthLoading(false);
    });

    const { data: listener } = supabase.auth.onAuthStateChange((event, session) => {
      const u = session?.user ?? null;
      setUser(u);

      if (event === 'SIGNED_IN' && u) {
        const alreadySet = localStorage.getItem(PW_SET_KEY);
        if (!alreadySet && isNewUser(u)) {
          setShowSetPassword(true);
          return;
        }
      }

      if (!u) {
        setAuthLoading(false);
      }
    });

    return () => listener.subscription.unsubscribe();
  }, []);

  const handleSetPasswordDone = useCallback(() => {
    localStorage.setItem(PW_SET_KEY, '1');
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

  const handleToggleSelect = useCallback((id: string) => {
    setSelectedIds((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  }, []);

  const handleSelectAll = useCallback(() => {
    if (selectedIds.size === tasks.length) {
      setSelectedIds(new Set());
    } else {
      setSelectedIds(new Set(tasks.map((t) => t.id)));
    }
  }, [selectedIds.size, tasks]);

  const handleCancelBatch = useCallback(() => {
    setBatchMode(false);
    setSelectedIds(new Set());
  }, []);

  if (authLoading && !showSetPassword) {
    return (
      <div className="w-full h-full flex items-center justify-center bg-canvas">
        <p className="text-sm text-canvas-muted tracking-wide">加载中...</p>
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
            <span className="text-sm text-canvas-muted tracking-wide">{user.email}</span>
            <button
              onClick={signOut}
              className="flex items-center gap-1 px-2.5 py-1 rounded-lg text-sm text-canvas-muted hover:text-red-400 hover:bg-red-50/50 transition-colors"
            >
              <LogOut size={15} /> 退出
            </button>
          </div>
        </div>
        <Header
          batchMode={batchMode}
          selectedIds={selectedIds}
          onEnterBatch={() => setBatchMode(true)}
          onSelectAll={handleSelectAll}
          onCancelBatch={handleCancelBatch}
        />
        <TaskGrid
          batchMode={batchMode}
          selectedIds={selectedIds}
          onToggleSelect={handleToggleSelect}
        />
        <FrostedOverlay batchMode={batchMode} />
      </div>
    </AuthContext.Provider>
  );
}
