import { useTaskStore } from '@/store/useTaskStore';
import TaskCardDetail from './TaskCardDetail';

interface FrostedOverlayProps {
  batchMode?: boolean;
}

export default function FrostedOverlay({ batchMode }: FrostedOverlayProps) {
  const { expandedTaskId, tasks, setExpandedTask } = useTaskStore();

  if (!expandedTaskId || batchMode) return null;

  const task = tasks.find((t) => t.id === expandedTaskId);
  if (!task) return null;

  return (
    <div
      className="fixed inset-0 z-50 flex items-end max-md:items-end md:items-center justify-center max-md:p-0 md:p-4"
      onClick={() => setExpandedTask(null)}
    >
      <div className="absolute inset-0 bg-canvas/85 luminous-overlay" />
      <div
        className="relative z-10 max-md:w-full md:animate-in animate-slide-up max-md:rounded-t-2xl max-md:overflow-hidden"
        onClick={(e) => e.stopPropagation()}
      >
        <TaskCardDetail task={task} onClose={() => setExpandedTask(null)} />
      </div>
    </div>
  );
}
