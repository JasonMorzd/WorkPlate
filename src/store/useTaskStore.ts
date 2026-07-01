import { create } from 'zustand';
import type { Task } from '@/types';
import { supabase } from '@/lib/supabase';

interface TaskStore {
  tasks: Task[];
  expandedTaskId: string | null;
  deletingTaskIds: Set<string>;
  loading: boolean;
  addTask: () => void;
  updateTask: (id: string, updates: Partial<Task>) => void;
  toggleImportant: (id: string) => void;
  markTaskDeleting: (id: string) => void;
  removeTasks: (ids: string[]) => void;
  setExpandedTask: (id: string | null) => void;
  togglePin: (id: string) => void;
  loadTasks: () => Promise<void>;
  subscribeToChanges: () => () => void;
}

let taskCounter = 0;

function generateId(): string {
  taskCounter++;
  return `task-${Date.now()}-${taskCounter}`;
}

export const useTaskStore = create<TaskStore>((set, get) => ({
  tasks: [],
  expandedTaskId: null,
  deletingTaskIds: new Set(),
  loading: true,

  addTask: async () => {
    const { data: userData } = await supabase.auth.getUser();
    const userId = userData.user?.id;
    if (!userId) return;

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
  },

  updateTask: async (id, updates) => {
    const dbUpdates: Record<string, any> = {};
    if (updates.title !== undefined) dbUpdates.title = updates.title;
    if (updates.importance !== undefined) dbUpdates.importance = updates.importance;
    if (updates.isImportant !== undefined) dbUpdates.is_important = updates.isImportant;
    if (updates.progress !== undefined) dbUpdates.progress = updates.progress;
    if (updates.hue !== undefined) dbUpdates.hue = updates.hue;
    if (updates.content !== undefined) dbUpdates.content = updates.content;
    if (updates.isPinned !== undefined) dbUpdates.is_pinned = updates.isPinned;

    if (Object.keys(dbUpdates).length > 0) {
      await supabase.from('tasks').update(dbUpdates).eq('id', id);
    }

    set((state) => ({
      tasks: state.tasks.map((t) => (t.id === id ? { ...t, ...updates } : t)),
    }));
  },

  toggleImportant: (id) => {
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
    set((state) => {
      const next = new Set(state.deletingTaskIds);
      next.add(id);
      return { deletingTaskIds: next };
    });

    setTimeout(async () => {
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
      set({ tasks, loading: false });
    } else {
      set({ loading: false });
    }
  },

  subscribeToChanges: () => {
    const channel = supabase
      .channel('tasks-changes')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'tasks' }, () => {
        get().loadTasks();
      })
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  },
}));
