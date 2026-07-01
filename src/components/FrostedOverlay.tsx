import { useTaskStore } from '@/store/useTaskStore';
import TaskCardDetail from './TaskCardDetail';

export default function FrostedOverlay() {
  const { expandedTaskId, tasks, setExpandedTask } = useTaskStore();

  if (!expandedTaskId) return null;

  const task = tasks.find((t) => t.id === expandedTaskId);
  if (!task) return null;

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-8"
      onClick={() => setExpandedTask(null)}
    >
      <div className="absolute inset-0 bg-canvas/85 luminous-overlay" />
      <div
        className="relative z-10 animate-in"
        onClick={(e) => e.stopPropagation()}
      >
        <TaskCardDetail task={task} onClose={() => setExpandedTask(null)} />
      </div>
    </div>
  );
}
