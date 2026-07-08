import { useEffect, useState, useCallback, useRef } from 'react';
import type { User } from '@supabase/supabase-js';
import { supabase } from '@/lib/supabase';
import { AuthContext } from '@/lib/auth';
import { useTaskStore } from '@/store/useTaskStore';
import AuthPage from '@/components/AuthPage';
import SetPasswordPage from '@/components/SetPasswordPage';
import Header from '@/components/Header';
import TaskGrid from '@/components/TaskGrid';
import FrostedOverlay from '@/components/FrostedOverlay';

function pwKey(uid: string) {
  return `wp_pw_set_${uid}`;
}

export default function App() {
  const [user, setUser] = useState<User | null>(null);
  const [authLoading, setAuthLoading] = useState(true);
  const [showSetPassword, setShowSetPassword] = useState(false);
  const { loadTasks, subscribeToChanges, tasks } = useTaskStore();

  const [batchMode, setBatchMode] = useState(false);
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());

  const userRef = useRef<User | null>(null);
  userRef.current = user;

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      const u = session?.user ?? null;
      setUser(u);
      if (u) {
        const alreadySet = localStorage.getItem(pwKey(u.id));
        if (!alreadySet) {
          setShowSetPassword(true);
          return;
        }
      }
      setAuthLoading(false);
    });

    const { data: listener } = supabase.auth.onAuthStateChange((event, session) => {
      const u = session?.user ?? null;
      setUser(u);

      if (event === 'USER_UPDATED' && u) {
        localStorage.setItem(pwKey(u.id), '1');
        setShowSetPassword(false);
        setAuthLoading(false);
        return;
      }

      if ((event === 'SIGNED_IN') && u) {
        if (sessionStorage.getItem('wp_just_registered')) {
          sessionStorage.removeItem('wp_just_registered');
          localStorage.setItem(pwKey(u.id), '1');
          setAuthLoading(false);
          return;
        }
        const alreadySet = localStorage.getItem(pwKey(u.id));
        if (!alreadySet) {
          setShowSetPassword(true);
          return;
        }
        setAuthLoading(false);
        return;
      }

      if (!u) {
        setAuthLoading(false);
      }
    });

    return () => listener.subscription.unsubscribe();
  }, []);

  const handleSetPasswordDone = useCallback(() => {
    const currentUser = userRef.current;
    if (currentUser) {
      localStorage.setItem(pwKey(currentUser.id), '1');
    }
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
        <Header
          batchMode={batchMode}
          selectedIds={selectedIds}
          onEnterBatch={() => setBatchMode(true)}
          onSelectAll={handleSelectAll}
          onCancelBatch={handleCancelBatch}
          email={user.email || ''}
          onSignOut={signOut}
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
