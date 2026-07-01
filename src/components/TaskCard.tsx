import { List, Trash2, Star } from 'lucide-react';
import { useState, useMemo } from 'react';
import { getTaskBackgroundColor } from '@/utils/colorUtils';
import type { Task } from '@/types';
import { useTaskStore } from '@/store/useTaskStore';
import ConfirmDialog from './ConfirmDialog';

interface TaskCardProps {
  task: Task;
  onClick: () => void;
  isDeleting?: boolean;
}

function getContentPreview(task: Task): string | null {
  if (task.content.type === 'text') {
    const text = task.content.text.trim();
    return text || null;
  }
  if (task.content.type === 'form' && task.content.fields.length > 0) {
    return task.content.fields.map((f) => f.label || '未命名').join(' · ');
  }
  return null;
}

export default function TaskCard({ task, onClick, isDeleting }: TaskCardProps) {
  const { markTaskDeleting, toggleImportant } = useTaskStore();
  const [showConfirm, setShowConfirm] = useState(false);

  const bgColor = getTaskBackgroundColor(task.hue, task.progress);
  const preview = useMemo(() => getContentPreview(task), [task]);

  return (
    <>
      <div
        className={`group relative w-full h-full rounded-2xl cursor-pointer overflow-hidden hover:-translate-y-0.5 hover:shadow-md active:translate-y-0 active:shadow-none card-frosted ${isDeleting ? 'animate-card-exit' : ''}`}
        style={{
          backgroundColor: bgColor,
          boxShadow: task.isImportant
            ? '0 0 0 2px rgba(223,183,64,0.35), 4px 4px 16px rgba(62,58,54,0.07)'
            : '4px 4px 12px rgba(62,58,54,0.04)',
          transition: 'transform 0.35s cubic-bezier(0.22, 0.61, 0.36, 1), box-shadow 0.35s ease-out',
        }}
        onClick={(e) => {
          if ((e.target as HTMLElement).closest('[data-action]')) return;
          onClick();
        }}
      >
        <div className="card-frosted-overlay" />

        <button
          onClick={(e) => { e.stopPropagation(); setShowConfirm(true); }}
          className="absolute top-3 right-3 p-1 rounded-lg opacity-0 group-hover:opacity-100 text-canvas-muted/50 hover:text-red-400 hover:bg-red-50/60 transition-all duration-200 z-10"
          title="删除"
          data-action
        >
          <Trash2 size={14} />
        </button>

        <div className="relative p-4 flex flex-col h-full">
          <div className="flex items-start gap-1.5 min-w-0 w-full">
            <button
              onClick={(e) => { e.stopPropagation(); toggleImportant(task.id); }}
              className="shrink-0 p-0.5 rounded transition-colors hover:bg-citrine-50/60 mt-0.5"
              title={task.isImportant ? '取消重要' : '标记重要'}
              data-action
            >
              <Star
                size={16}
                className={task.isImportant ? 'text-citrine-400 fill-citrine-400' : 'text-canvas-muted/20 hover:text-citrine-300'}
              />
            </button>
            <div className="flex-1 min-w-0">
              <h3 className="text-base font-normal text-canvas-ink truncate tracking-wide">
                {task.isPinned && <span className="mr-1 opacity-50">◆</span>}
                {task.title}
              </h3>
              {preview && (
                <p className="text-xs text-canvas-muted/50 leading-relaxed mt-1 line-clamp-2">
                  {preview}
                </p>
              )}
            </div>
            {task.content.type === 'form' && (
              <List size={12} className="text-canvas-muted/40 shrink-0 mt-1" />
            )}
          </div>

          <div className="mt-auto pt-2">
            {task.progress >= 0 && task.progress <= 100 && (
              <div className="h-[4px] bg-canvas-mid/30 rounded-full overflow-hidden">
                <div
                  className="h-full rounded-full"
                  style={{
                    width: `${task.progress}%`,
                    backgroundColor: task.progress >= 80 ? '#C8A32F' : '#D5D0C9',
                    transition: 'width 0.15s ease-out, background-color 0.3s ease-out',
                  }}
                />
              </div>
            )}
            <div className="text-xs text-canvas-muted/60 tracking-wide mt-1.5">
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

      <ConfirmDialog
        open={showConfirm}
        title="删除任务"
        message={`确定要删除「${task.title}」吗？此操作不可撤销。`}
        onConfirm={() => { setShowConfirm(false); markTaskDeleting(task.id); }}
        onCancel={() => setShowConfirm(false)}
      />
    </>
  );
}
