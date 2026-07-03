import { Table, Star, CheckCircle, Circle } from 'lucide-react';
import { useMemo } from 'react';
import { getTaskBackgroundColor } from '@/utils/colorUtils';
import type { Task } from '@/types';
import { useTaskStore } from '@/store/useTaskStore';

interface TaskCardProps {
  task: Task;
  onClick: () => void;
  isDeleting?: boolean;
  batchMode?: boolean;
  isSelected?: boolean;
  onToggleSelect?: () => void;
}

function getContentPreview(task: Task): string | null {
  if (task.content.type === 'text') {
    const text = task.content.text.trim();
    return text || null;
  }
  if (task.content.type === 'table') {
    const headers = task.content.headers || [];
    const rows = task.content.rows || [];
    if (headers.length === 0 && rows.length === 0) return null;
    const line1 = headers.join(' · ') || ' ';
    const line2 = rows[0]?.join(' · ') || '';
    return line2 ? `${line1}\n${line2}` : line1;
  }
  return null;
}

export default function TaskCard({ task, onClick, isDeleting, batchMode, isSelected, onToggleSelect }: TaskCardProps) {
  const { toggleImportant } = useTaskStore();
  const bgColor = getTaskBackgroundColor(task.hue, task.progress);
  const preview = useMemo(() => getContentPreview(task), [task]);

  const handleClick = () => {
    if (batchMode && onToggleSelect) {
      onToggleSelect();
    } else {
      onClick();
    }
  };

  return (
    <div
      className={`group relative w-full h-full rounded-2xl cursor-pointer overflow-hidden hover:-translate-y-0.5 hover:shadow-md active:translate-y-0 active:shadow-none card-frosted ${isDeleting ? 'animate-card-exit' : ''}`}
      style={{
        backgroundColor: bgColor,
        boxShadow: task.isImportant
          ? '0 0 0 2px rgba(223,183,64,0.35), 4px 4px 16px rgba(62,58,54,0.07)'
          : '4px 4px 12px rgba(62,58,54,0.04)',
        transition: 'transform 0.35s cubic-bezier(0.22, 0.61, 0.36, 1), box-shadow 0.35s ease-out',
        outline: isSelected ? '2px solid rgba(239,68,68,0.5)' : undefined,
      }}
      onClick={(e) => {
        if ((e.target as HTMLElement).closest('[data-action]')) return;
        handleClick();
      }}
    >
      <div className="card-frosted-overlay" />

      {batchMode && (
        <div className="absolute top-3 right-3 z-10">
          {isSelected ? (
            <CheckCircle size={20} className="text-red-400 fill-red-400 drop-shadow-sm" />
          ) : (
            <Circle size={20} className="text-canvas-muted/40" />
          )}
        </div>
      )}

      <div className="relative p-4 flex flex-col h-full">
        <div className="flex-1 min-h-0 flex flex-col">
          <div className="flex items-start gap-1.5 min-w-0 w-full">
            <button
              onClick={(e) => { e.stopPropagation(); toggleImportant(task.id); }}
              className="shrink-0 p-0.5 rounded transition-colors hover:bg-citrine-50/60 mt-0.5"
              title={task.isImportant ? '取消重要' : '标记重要'}
              data-action
            >
              <Star
                size={18}
                className={task.isImportant ? 'text-citrine-400 fill-citrine-400' : 'text-canvas-muted/35 hover:text-citrine-300'}
              />
            </button>
            <div className="flex-1 min-w-0">
              <h3 className="text-lg font-normal text-canvas-ink truncate tracking-wide">
                {task.isPinned && <span className="mr-1 opacity-50">◆</span>}
                {task.title}
              </h3>
            </div>
            {task.content.type === 'table' && (
              <Table size={14} className="text-canvas-muted/50 shrink-0 mt-1" />
            )}
          </div>

          {preview && (
            <p className="text-sm text-canvas-muted leading-relaxed mt-2 whitespace-pre-line overflow-hidden line-clamp-4">
              {preview}
            </p>
          )}
        </div>

        <div className="shrink-0 pt-3">
          {task.progress >= 0 && task.progress <= 100 && (
            <div className="h-[4px] bg-canvas-mid/40 rounded-full overflow-hidden">
              <div
                className="h-full rounded-full"
                style={{
                  width: `${task.progress}%`,
                  backgroundColor: task.progress >= 80 ? '#C8A32F' : '#B0A9A0',
                  transition: 'width 0.15s ease-out, background-color 0.3s ease-out',
                }}
              />
            </div>
          )}
          <div className="text-xs text-canvas-muted tracking-wide mt-1.5">
            {task.progress > 0 && task.progress <= 100
              ? `${task.progress}%`
              : task.progress === 101
                ? '已完成'
                : task.progress === -1
                  ? '长期'
                  : '待开始'}
          </div>
        </div>
      </div>
    </div>
  );
}
