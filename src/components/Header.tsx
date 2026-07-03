import { Plus, Trash2, X, CheckSquare, Square, LogOut } from 'lucide-react';
import { useState } from 'react';
import { useTaskStore } from '@/store/useTaskStore';
import ConfirmDialog from './ConfirmDialog';

interface HeaderProps {
  batchMode: boolean;
  selectedIds: Set<string>;
  onEnterBatch: () => void;
  onSelectAll: () => void;
  onCancelBatch: () => void;
  email: string;
  onSignOut: () => void;
}

export default function Header({ batchMode, selectedIds, onEnterBatch, onSelectAll, onCancelBatch, email, onSignOut }: HeaderProps) {
  const { tasks, addTask, removeTasks, setExpandedTask } = useTaskStore();
  const [showBatchConfirm, setShowBatchConfirm] = useState(false);

  const handleBatchDelete = () => {
    removeTasks([...selectedIds]);
    setShowBatchConfirm(false);
    onCancelBatch();
  };

  return (
    <>
      <div className="flex items-center justify-between max-md:px-3 md:px-5 max-md:py-2 md:py-2.5 shrink-0 border-b border-canvas-mid/40 safe-top">
        <div className="flex items-center gap-2 md:gap-4">
          <h1 className="text-sm font-medium text-canvas-ink tracking-widest">工作看板</h1>
          {batchMode ? (
            <div className="flex items-center gap-1 md:gap-1.5">
              <button
                onClick={onSelectAll}
                className="flex items-center gap-1 px-2 md:px-3 py-1 md:py-1.5 rounded-lg text-xs text-canvas-muted/70 bg-canvas-warm/50 hover:bg-canvas-warm/80 transition-colors"
              >
                {selectedIds.size === tasks.length ? <CheckSquare size={13} /> : <Square size={13} />}
                全选
              </button>
              <button
                onClick={() => selectedIds.size > 0 && setShowBatchConfirm(true)}
                disabled={selectedIds.size === 0}
                className="flex items-center gap-1 px-2 md:px-3 py-1 md:py-1.5 rounded-lg text-xs text-red-500 bg-red-50 border border-red-200 hover:bg-red-100 transition-colors disabled:opacity-30 disabled:cursor-not-allowed"
              >
                <Trash2 size={13} /> 删除选中
              </button>
              <button
                onClick={onCancelBatch}
                className="p-1 md:p-1.5 rounded-lg text-canvas-muted/60 hover:text-canvas-ink transition-colors"
              >
                <X size={15} />
              </button>
            </div>
          ) : (
            <button
              onClick={onEnterBatch}
              className="flex items-center gap-1 px-2 md:px-3 py-1 md:py-1.5 rounded-lg text-xs text-canvas-muted/70 border border-canvas-mid/40 bg-canvas-warm/40 hover:bg-canvas-warm/60 hover:text-canvas-muted hover:border-canvas-muted/40 transition-all"
            >
              <CheckSquare size={13} /> <span className="hidden md:inline">批量操作</span>
            </button>
          )}
        </div>
        <div className="flex items-center gap-2 md:gap-3">
          {!batchMode && (
            <button
              onClick={async (e) => {
                e.stopPropagation();
                const id = await addTask();
                if (id) setExpandedTask(id);
              }}
              className="flex items-center gap-1.5 max-md:px-3 md:px-4 max-md:py-1.5 md:py-1.5 rounded-xl text-sm font-normal text-canvas-ink bg-citrine-200/80 hover:bg-citrine-300/80 active:scale-95 transition-all duration-300"
            >
              <Plus size={15} /> <span className="max-md:hidden">新建</span>
            </button>
          )}
          <span className="text-xs text-canvas-muted/50 tracking-wide max-md:hidden">{email}</span>
          <button
            onClick={onSignOut}
            className="flex items-center gap-1 px-2 py-1 rounded-lg text-xs text-canvas-muted/50 hover:text-red-400 hover:bg-red-50/50 transition-colors max-md:hidden"
          >
            <LogOut size={13} /> 退出
          </button>
        </div>
      </div>

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
