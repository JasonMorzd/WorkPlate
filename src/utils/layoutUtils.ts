import type { Task } from '@/types';

export function sortTasks(tasks: Task[]): Task[] {
  return [...tasks].sort((a, b) => {
    if (a.isPinned !== b.isPinned) {
      return a.isPinned ? -1 : 1;
    }
    if (a.isImportant !== b.isImportant) {
      return a.isImportant ? -1 : 1;
    }
    return b.createdAt - a.createdAt;
  });
}
