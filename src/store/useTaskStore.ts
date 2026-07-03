import { create } from 'zustand';
import type { Task } from '@/types';
import { supabase } from '@/lib/supabase';

interface PendingUpdate {
  timer: ReturnType<typeof setTimeout> | null;
  fields: Record<string, any>;
}

const pendingSync = new Map<string, PendingUpdate>();

let dirtyUntil = 0;

function markDirty() {
  dirtyUntil = Date.now() + 3000;
}

function debounceSync(id: string, fields: Record<string, any>) {
  const existing = pendingSync.get(id);
  if (existing?.timer) clearTimeout(existing.timer);

  const merged = { ...(existing?.fields || {}), ...fields };

  const timer = setTimeout(async () => {
    markDirty();
    await supabase.from('tasks').update(merged).eq('id', id);
    pendingSync.delete(id);
  }, 800);

  pendingSync.set(id, { timer, fields: merged });
}

function toDbFields(updates: Partial<Task>): Record<string, any> {
  const db: Record<string, any> = {};
  if (updates.title !== undefined) db.title = updates.title;
  if (updates.importance !== undefined) db.importance = updates.importance;
  if (updates.isImportant !== undefined) db.is_important = updates.isImportant;
  if (updates.progress !== undefined) db.progress = updates.progress;
  if (updates.hue !== undefined) db.hue = updates.hue;
  if (updates.content !== undefined) db.content = updates.content;
  if (updates.isPinned !== undefined) db.is_pinned = updates.isPinned;
  return db;
}

function tasksEqual(a: Task[], b: Task[]): boolean {
  if (a.length !== b.length) return false;
  for (let i = 0; i < a.length; i++) {
    if (a[i].id !== b[i].id) return false;
    if (a[i].title !== b[i].title) return false;
    if (a[i].importance !== b[i].importance) return false;
    if (a[i].isImportant !== b[i].isImportant) return false;
    if (a[i].progress !== b[i].progress) return false;
    if (a[i].hue !== b[i].hue) return false;
    if (a[i].isPinned !== b[i].isPinned) return false;
    if (a[i].createdAt !== b[i].createdAt) return false;
    if (JSON.stringify(a[i].content) !== JSON.stringify(b[i].content)) return false;
  }
  return true;
}

interface TaskStore {
  tasks: Task[];
  expandedTaskId: string | null;
  deletingTaskIds: Set<string>;
  loading: boolean;
  addTask: () => Promise<string | null>;
  updateTask: (id: string, updates: Partial<Task>) => void;
  toggleImportant: (id: string) => void;
  markTaskDeleting: (id: string) => void;
  removeTasks: (ids: string[]) => void;
  setExpandedTask: (id: string | null) => void;
  togglePin: (id: string) => void;
  loadTasks: () => Promise<void>;
  subscribeToChanges: () => () => void;
}

export const useTaskStore = create<TaskStore>((set, get) => ({
  tasks: [],
  expandedTaskId: null,
  deletingTaskIds: new Set(),
  loading: true,

  addTask: async () => {
    const { data: userData } = await supabase.auth.getUser();
    const userId = userData.user?.id;
    if (!userId) return null;

    const newTask: Task = {
      id: crypto.randomUUID(),
      title: '新任务',
      importance: 50,
      isImportant: false,
      progress: 0,
      hue: Math.floor(Math.random() * 360),
      content: { type: 'text', text: '' },
      isPinned: false,
      createdAt: Date.now(),
    };

    markDirty();

    await supabase.from('tasks').insert({
      id: newTask.id,
      user_id: userId,
      title: newTask.title,
      importance: newTask.importance,
      is_important: newTask.isImportant,
      progress: newTask.progress,
      hue: newTask.hue,
      content: newTask.content,
      is_pinned: newTask.isPinned,
      created_at: newTask.createdAt,
    });

    set((state) => ({ tasks: [...state.tasks, newTask] }));
    return newTask.id;
  },

  updateTask: (id, updates) => {
    markDirty();

    const dbFields = toDbFields(updates);
    if (Object.keys(dbFields).length > 0) {
      debounceSync(id, dbFields);
    }

    set((state) => ({
      tasks: state.tasks.map((t) => (t.id === id ? { ...t, ...updates } : t)),
    }));
  },

  toggleImportant: (id) => {
    markDirty();
    set((state) => {
      const tasks = state.tasks.map((t) =>
        t.id === id ? { ...t, isImportant: !t.isImportant } : t
      );
      const updated = tasks.find((t) => t.id === id);
      if (updated) {
        supabase.from('tasks').update({ is_important: updated.isImportant }).eq('id', id);
      }
      return { tasks };
    });
  },

  markTaskDeleting: (id) => {
    const existing = pendingSync.get(id);
    if (existing?.timer) {
      clearTimeout(existing.timer);
      pendingSync.delete(id);
    }

    set((state) => {
      const next = new Set(state.deletingTaskIds);
      next.add(id);
      return { deletingTaskIds: next };
    });

    setTimeout(async () => {
      markDirty();
      await supabase.from('tasks').delete().eq('id', id);
      set((state) => {
        const tasks = state.tasks.filter((t) => t.id !== id);
        const next = new Set(state.deletingTaskIds);
        next.delete(id);
        return {
          tasks,
          deletingTaskIds: next,
          expandedTaskId: state.expandedTaskId === id ? null : state.expandedTaskId,
        };
      });
    }, 420);
  },

  removeTasks: async (ids) => {
    for (const id of ids) {
      const existing = pendingSync.get(id);
      if (existing?.timer) {
        clearTimeout(existing.timer);
        pendingSync.delete(id);
      }
    }
    markDirty();
    await supabase.from('tasks').delete().in('id', ids);
    set((state) => {
      const idSet = new Set(ids);
      return {
        tasks: state.tasks.filter((t) => !idSet.has(t.id)),
        expandedTaskId: state.expandedTaskId && idSet.has(state.expandedTaskId) ? null : state.expandedTaskId,
      };
    });
  },

  setExpandedTask: (id) => {
    set({ expandedTaskId: id });
  },

  togglePin: (id) => {
    markDirty();
    set((state) => {
      const tasks = state.tasks.map((t) =>
        t.id === id ? { ...t, isPinned: !t.isPinned } : t
      );
      const updated = tasks.find((t) => t.id === id);
      if (updated) {
        supabase.from('tasks').update({ is_pinned: updated.isPinned }).eq('id', id);
      }
      return { tasks };
    });
  },

  loadTasks: async () => {
    const { data: userData } = await supabase.auth.getUser();
    const userId = userData.user?.id;
    if (!userId) {
      set({ loading: false });
      return;
    }

    const { data } = await supabase
      .from('tasks')
      .select('*')
      .eq('user_id', userId)
      .order('created_at', { ascending: false });

    if (data) {
      const tasks: Task[] = data.map((row: any) => ({
        id: row.id,
        title: row.title,
        importance: row.importance,
        isImportant: row.is_important,
        progress: row.progress,
        hue: row.hue,
        content: row.content,
        isPinned: row.is_pinned,
        createdAt: row.created_at,
      }));

      const current = get().tasks;
      if (!tasksEqual(current, tasks)) {
        set({ tasks, loading: false });
      } else {
        set({ loading: false });
      }
    } else {
      set({ loading: false });
    }
  },

  subscribeToChanges: () => {
    const channel = supabase
      .channel('tasks-changes')
      .on('postgres_changes',
        { event: '*', schema: 'public', table: 'tasks' },
        () => {
          if (Date.now() < dirtyUntil) return;
          get().loadTasks();
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  },
}));
