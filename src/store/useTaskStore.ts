import { create } from 'zustand';
import type { Task } from '@/types';
import { loadTasks, saveTasks } from '@/utils/storageUtils';

interface TaskStore {
  tasks: Task[];
  expandedTaskId: string | null;
  deletingTaskIds: Set<string>;
  addTask: () => void;
  updateTask: (id: string, updates: Partial<Task>) => void;
  toggleImportant: (id: string) => void;
  markTaskDeleting: (id: string) => void;
  removeTasks: (ids: string[]) => void;
  setExpandedTask: (id: string | null) => void;
  togglePin: (id: string) => void;
  initializeDemoData: () => void;
}

let taskCounter = 0;

function generateId(): string {
  taskCounter++;
  return `task-${Date.now()}-${taskCounter}`;
}

export const useTaskStore = create<TaskStore>((set) => ({
  tasks: [],
  expandedTaskId: null,
  deletingTaskIds: new Set(),

  addTask: () => {
    set((state) => {
      const newTask: Task = {
        id: generateId(),
        title: '新任务',
        importance: 50,
        isImportant: false,
        progress: 0,
        hue: Math.floor(Math.random() * 360),
        content: { type: 'text', text: '' },
        isPinned: false,
        createdAt: Date.now(),
      };
      const tasks = [...state.tasks, newTask];
      saveTasks(tasks);
      return { tasks };
    });
  },

  updateTask: (id, updates) => {
    set((state) => {
      const tasks = state.tasks.map((t) =>
        t.id === id ? { ...t, ...updates } : t
      );
      saveTasks(tasks);
      return { tasks };
    });
  },

  toggleImportant: (id) => {
    set((state) => {
      const tasks = state.tasks.map((t) =>
        t.id === id ? { ...t, isImportant: !t.isImportant } : t
      );
      saveTasks(tasks);
      return { tasks };
    });
  },

  markTaskDeleting: (id) => {
    set((state) => {
      const next = new Set(state.deletingTaskIds);
      next.add(id);
      return { deletingTaskIds: next };
    });

    setTimeout(() => {
      set((state) => {
        const tasks = state.tasks.filter((t) => t.id !== id);
        const next = new Set(state.deletingTaskIds);
        next.delete(id);
        saveTasks(tasks);
        return {
          tasks,
          deletingTaskIds: next,
          expandedTaskId: state.expandedTaskId === id ? null : state.expandedTaskId,
        };
      });
    }, 420);
  },

  removeTasks: (ids) => {
    set((state) => {
      const idSet = new Set(ids);
      const tasks = state.tasks.filter((t) => !idSet.has(t.id));
      saveTasks(tasks);
      return {
        tasks,
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
      saveTasks(tasks);
      return { tasks };
    });
  },

  initializeDemoData: () => {
    const saved = loadTasks();
    if (saved.length > 0) {
      set({ tasks: saved });
      return;
    }

    const now = Date.now();
    const demos: Task[] = [
      {
        id: generateId(),
        title: '重要项目规划',
        importance: 80,
        isImportant: true,
        progress: 30,
        hue: 200,
        content: { type: 'text', text: '制定季度项目规划，包括里程碑和时间节点。' },
        isPinned: true,
        createdAt: now + 1000,
      },
      {
        id: generateId(),
        title: '学习新技能',
        importance: 60,
        isImportant: true,
        progress: -1,
        hue: 320,
        content: { type: 'form', fields: [{ id: 'f1', label: '学习目标', value: 'React 高级模式', type: 'text' }, { id: 'f2', label: '截止日期', value: '2026-08-30', type: 'text' }] },
        isPinned: false,
        createdAt: now + 500,
      },
      {
        id: generateId(),
        title: '周报整理',
        importance: 40,
        isImportant: false,
        progress: 101,
        hue: 120,
        content: { type: 'text', text: '上周工作周报已完成提交。' },
        isPinned: false,
        createdAt: now + 300,
      },
      {
        id: generateId(),
        title: '健身计划',
        importance: 30,
        isImportant: false,
        progress: 60,
        hue: 30,
        content: { type: 'text', text: '每周三次有氧运动，两次力量训练。' },
        isPinned: false,
        createdAt: now,
      },
    ];

    set({ tasks: demos });
    saveTasks(demos);
  },
}));
