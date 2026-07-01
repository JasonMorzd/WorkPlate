import { X, Pin, PinOff, Trash2, Type, List, Star } from 'lucide-react';
import { useState } from 'react';
import type { Task, TaskContent } from '@/types';
import TaskProgress from './TaskProgress';
import TaskContentText from './TaskContentText';
import TaskContentForm from './TaskContentForm';
import { useTaskStore } from '@/store/useTaskStore';
import ConfirmDialog from './ConfirmDialog';

interface TaskCardDetailProps {
  task: Task;
  onClose: () => void;
}

export default function TaskCardDetail({ task, onClose }: TaskCardDetailProps) {
  const { updateTask, markTaskDeleting, togglePin, toggleImportant } = useTaskStore();
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);

  const isProgressMode = task.progress >= 0 && task.progress <= 100;

  return (
    <>
      <div className="w-full max-w-2xl mx-auto rounded-2xl overflow-hidden"
        style={{ boxShadow: '0 4px 40px rgba(62,58,54,0.08), 0 0 0 1px rgba(62,58,54,0.05)' }}>
        <div className="p-7 space-y-5 bg-white">
          <div className="flex items-start justify-between gap-4">
            <input
              value={task.title}
              onChange={(e) => updateTask(task.id, { title: e.target.value })}
              className="flex-1 text-xl font-normal bg-canvas-warm/40 text-canvas-ink outline-none placeholder:text-canvas-muted/30 tracking-wide rounded-lg px-3 py-2 border border-canvas-mid/30 focus:bg-white focus:border-citrine-400 focus:shadow-sm transition-all"
              placeholder="输入任务标题..."
              onClick={(e) => e.stopPropagation()}
            />
            <div className="flex items-center gap-1 shrink-0">
              <button
                onClick={(e) => { e.stopPropagation(); toggleImportant(task.id); }}
                className={`p-2 rounded-lg transition-colors ${
                  task.isImportant ? 'text-citrine-500 bg-citrine-50' : 'text-canvas-muted/35 hover:text-citrine-400 hover:bg-citrine-50/50'
                }`}
                title={task.isImportant ? '取消重要' : '标记重要'}
              >
                <Star size={16} className={task.isImportant ? 'fill-citrine-500' : ''} />
              </button>
              <button
                onClick={(e) => { e.stopPropagation(); togglePin(task.id); }}
                className={`p-2 rounded-lg transition-colors ${
                  task.isPinned ? 'text-citrine-500 bg-citrine-50' : 'text-canvas-muted/35 hover:text-citrine-400 hover:bg-citrine-50/50'
                }`}
                title={task.isPinned ? '取消置顶' : '置顶'}
              >
                {task.isPinned ? <Pin size={16} /> : <PinOff size={16} />}
              </button>
              <button
                onClick={(e) => { e.stopPropagation(); setShowDeleteConfirm(true); }}
                className="p-2 rounded-lg text-canvas-muted/35 hover:text-red-400 hover:bg-red-50/60 transition-colors"
                title="删除"
              >
                <Trash2 size={16} />
              </button>
              <button
                onClick={(e) => { e.stopPropagation(); onClose(); }}
                className="p-2 rounded-lg text-canvas-muted/35 hover:text-canvas-muted hover:bg-canvas-warm/60 transition-colors"
                title="关闭"
              >
                <X size={16} />
              </button>
            </div>
          </div>

          <div className="flex items-center gap-4 text-sm">
            <div className="flex items-center gap-1 bg-canvas-warm/60 rounded-lg p-0.5">
              <button
                onClick={(e) => { e.stopPropagation(); updateTask(task.id, { progress: 0 }); }}
                className={`px-3 py-1.5 rounded-md text-xs transition-all ${
                  isProgressMode ? 'bg-white text-canvas-ink shadow-sm' : 'text-canvas-muted/50 hover:text-canvas-muted'
                }`}
              >
                进度模式
              </button>
              <button
                onClick={(e) => { e.stopPropagation(); updateTask(task.id, { progress: -1 }); }}
                className={`px-3 py-1.5 rounded-md text-xs transition-all ${
                  task.progress === -1 ? 'bg-white text-canvas-ink shadow-sm' : 'text-canvas-muted/50 hover:text-canvas-muted'
                }`}
              >
                长期任务
              </button>
              <button
                onClick={(e) => { e.stopPropagation(); updateTask(task.id, { progress: 101 }); }}
                className={`px-3 py-1.5 rounded-md text-xs transition-all ${
                  task.progress === 101 ? 'bg-citrine-50 text-citrine-500 shadow-sm' : 'text-canvas-muted/50 hover:text-citrine-400'
                }`}
              >
                已完成
              </button>
            </div>
            <button
              onClick={(e) => {
                e.stopPropagation();
                const newContent: TaskContent = task.content.type === 'text'
                  ? { type: 'form', fields: [] }
                  : { type: 'text', text: '' };
                updateTask(task.id, { content: newContent });
              }}
              className="flex items-center gap-1 text-canvas-muted/50 hover:text-canvas-muted transition-colors ml-auto"
            >
              {task.content.type === 'text' ? <List size={13} /> : <Type size={13} />}
              <span className="text-xs">{task.content.type === 'text' ? '切换表单' : '切换文本'}</span>
            </button>
          </div>

          <div className="space-y-4">
            <TaskProgress
              progress={task.progress}
              hue={task.hue}
              onChange={(progress) => updateTask(task.id, { progress })}
            />
            <div className="pt-1">
              {task.content.type === 'text' ? (
                <TaskContentText
                  text={task.content.text}
                  onChange={(text) => updateTask(task.id, { content: { type: 'text', text } })}
                />
              ) : (
                <TaskContentForm
                  fields={task.content.fields}
                  onChange={(fields) => updateTask(task.id, { content: { type: 'form', fields } })}
                />
              )}
            </div>
          </div>
        </div>
      </div>

      <ConfirmDialog
        open={showDeleteConfirm}
        title="删除任务"
        message={`确定要删除「${task.title}」吗？此操作不可撤销。`}
        onConfirm={() => { setShowDeleteConfirm(false); markTaskDeleting(task.id); onClose(); }}
        onCancel={() => setShowDeleteConfirm(false)}
      />
    </>
  );
}
