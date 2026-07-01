import type { Task } from '@/types';

const STORAGE_KEY = 'work-kanban-tasks';

export function loadTasks(): Task[] {
  try {
    const data = localStorage.getItem(STORAGE_KEY);
    if (data) {
      return JSON.parse(data);
    }
  } catch {
    console.warn('Failed to load tasks from localStorage');
  }
  return [];
}

export function saveTasks(tasks: Task[]): void {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(tasks));
  } catch {
    console.warn('Failed to save tasks to localStorage');
  }
}
