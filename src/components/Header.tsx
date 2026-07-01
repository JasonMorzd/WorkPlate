import { Plus, Trash2, X, CheckSquare, Square } from 'lucide-react';
import { useState } from 'react';
import { useTaskStore } from '@/store/useTaskStore';
import ConfirmDialog from './ConfirmDialog';

export default function Header() {
  const { tasks, addTask, removeTasks, setExpandedTask } = useTaskStore();
  const [batchMode, setBatchMode] = useState(false);
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());
  const [showBatchConfirm, setShowBatchConfirm] = useState(false);

  const handleToggleSelect = (id: string) => {
    setSelectedIds((prev) => {
      const next = new Set(prev);
      if (next.has(id)) {
        next.delete(id);
      } else {
        next.add(id);
      }
      return next;
    });
  };

  const handleBatchDelete = () => {
    removeTasks([...selectedIds]);
    setSelectedIds(new Set());
    setBatchMode(false);
    setShowBatchConfirm(false);
  };

  const handleCancelBatch = () => {
    setBatchMode(false);
    setSelectedIds(new Set());
  };

  const handleSelectAll = () => {
    if (selectedIds.size === tasks.length) {
      setSelectedIds(new Set());
    } else {
      setSelectedIds(new Set(tasks.map((t) => t.id)));
    }
  };

  return (
    <>
      <div className="flex items-center justify-between max-md:px-3 md:px-5 max-md:py-2 md:py-3 shrink-0 border-b border-canvas-mid/40 safe-top">
        <div className="flex items-center gap-2 md:gap-4">
          <div>
            <h1 className="text-sm font-medium text-canvas-ink tracking-widest">工作看板</h1>
            <p className="text-[10px] md:text-xs text-canvas-muted/70 mt-0.5 tracking-wide">
              {batchMode ? `已选 ${selectedIds.size} 项` : '点击卡片查看详情'}
            </p>
          </div>
          {batchMode ? (
            <div className="flex items-center gap-1 md:gap-1.5">
              <button
                onClick={handleSelectAll}
                className="flex items-center gap-1 px-2 md:px-3 py-1 md:py-1.5 rounded-lg text-[10px] md:text-xs text-canvas-muted/70 bg-canvas-warm/50 hover:bg-canvas-warm/80 transition-colors"
              >
                {selectedIds.size === tasks.length ? <CheckSquare size={12} /> : <Square size={12} />}
                全选
              </button>
              <button
                onClick={() => selectedIds.size > 0 && setShowBatchConfirm(true)}
                disabled={selectedIds.size === 0}
                className="flex items-center gap-1 px-2 md:px-3 py-1 md:py-1.5 rounded-lg text-[10px] md:text-xs text-red-500 bg-red-50 border border-red-200 hover:bg-red-100 transition-colors disabled:opacity-30 disabled:cursor-not-allowed"
              >
                <Trash2 size={12} /> 删除选中
              </button>
              <button
                onClick={handleCancelBatch}
                className="p-1 md:p-1.5 rounded-lg text-canvas-muted/60 hover:text-canvas-ink transition-colors"
              >
                <X size={14} />
              </button>
            </div>
          ) : (
            <button
              onClick={() => setBatchMode(true)}
              className="flex items-center gap-1 px-2 md:px-3 py-1 md:py-1.5 rounded-lg text-[10px] md:text-xs text-canvas-muted/70 border border-canvas-mid/40 bg-canvas-warm/40 hover:bg-canvas-warm/60 hover:text-canvas-muted hover:border-canvas-muted/40 transition-all"
            >
              <CheckSquare size={12} /> <span className="hidden md:inline">批量操作</span>
            </button>
          )}
        </div>
        <div className="flex items-center gap-2">
          {!batchMode && (
            <button
              onClick={async (e) => {
                e.stopPropagation();
                const id = await addTask();
                if (id) setExpandedTask(id);
              }}
              className="flex items-center gap-1.5 max-md:px-3 md:px-4 max-md:py-2 md:py-1.5 rounded-xl text-sm font-normal text-canvas-ink bg-citrine-200/80 hover:bg-citrine-300/80 active:scale-95 transition-all duration-300"
            >
              <Plus size={15} /> <span className="max-md:hidden">新建</span>
            </button>
          )}
        </div>
      </div>

      {batchMode && (
        <div className="absolute top-[49px] md:top-[53px] left-0 right-0 bottom-0 z-30 pointer-events-none">
          <div className="absolute inset-0 bg-canvas/80 luminous-overlay pointer-events-auto overflow-auto">
            <div className="flex items-start gap-2 md:gap-3 p-2 md:p-3 flex-wrap safe-bottom">
              {tasks.map((task) => (
                <button
                  key={task.id}
                  onClick={() => handleToggleSelect(task.id)}
                  className={`flex items-center gap-2 px-3 py-2 md:py-1.5 rounded-xl text-xs transition-all ${
                    selectedIds.has(task.id)
                      ? 'bg-red-50 text-red-500 border border-red-200'
                      : 'bg-white text-canvas-muted border border-canvas-mid/60 hover:border-canvas-muted/50'
                  }`}
                >
                  {selectedIds.has(task.id) ? <CheckSquare size={13} /> : <Square size={13} />}
                  <span className="truncate max-w-[120px]">{task.title}</span>
                </button>
              ))}
            </div>
          </div>
        </div>
      )}

      <ConfirmDialog
        open={showBatchConfirm}
        title="批量删除"
        message={`确定要删除选中的 ${selectedIds.size} 个任务吗？此操作不可撤销。`}
        onConfirm={handleBatchDelete}
        onCancel={() => setShowBatchConfirm(false)}
      />
    </>
  );
}
