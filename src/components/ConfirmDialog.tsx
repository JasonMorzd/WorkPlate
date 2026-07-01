interface ConfirmDialogProps {
  open: boolean;
  title: string;
  message: string;
  onConfirm: () => void;
  onCancel: () => void;
}

export default function ConfirmDialog({ open, title, message, onConfirm, onCancel }: ConfirmDialogProps) {
  if (!open) return null;

  return (
    <div className="fixed inset-0 z-[60] flex items-center justify-center p-4" onClick={onCancel}>
      <div className="absolute inset-0 bg-canvas-ink/10 luminous-overlay" />
      <div
        className="relative z-10 bg-white rounded-2xl p-6 w-full max-w-sm animate-scale-in"
        style={{ boxShadow: '0 4px 32px rgba(62,58,54,0.1), 0 0 0 1px rgba(62,58,54,0.05)' }}
        onClick={(e) => e.stopPropagation()}
      >
        <h3 className="text-base font-medium text-canvas-ink mb-2 tracking-wide">{title}</h3>
        <p className="text-sm text-canvas-muted/80 mb-6 leading-relaxed">{message}</p>
        <div className="flex gap-3 justify-end">
          <button
            onClick={onCancel}
            className="px-4 py-2 rounded-xl text-sm text-canvas-muted bg-canvas-warm/80 hover:bg-canvas-warm transition-colors"
          >
            取消
          </button>
          <button
            onClick={onConfirm}
            className="px-4 py-2 rounded-xl text-sm text-white bg-red-400 hover:bg-red-500 transition-colors"
          >
            确认删除
          </button>
        </div>
      </div>
    </div>
  );
}
