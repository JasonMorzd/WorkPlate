import { useCallback } from 'react';

interface TaskProgressProps {
  progress: number;
  hue: number;
  onChange?: (progress: number) => void;
}

export default function TaskProgress({ progress, hue, onChange }: TaskProgressProps) {
  const handleChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const val = Number(e.target.value);
    onChange?.(val);
  }, [onChange]);

  if (progress === -1) {
    return (
      <span className="inline-block text-xs px-3 py-1 rounded-full bg-canvas-warm/80 text-canvas-muted/80 tracking-wide">
        长期跟踪中
      </span>
    );
  }

  if (progress === 101) {
    return (
      <span className="inline-block text-xs px-3 py-1 rounded-full bg-citrine-50 text-citrine-500 tracking-wide">
        已完成
      </span>
    );
  }

  const fillColor = `hsl(${hue}, ${Math.max(5, 65 - (progress / 100) * 55)}%, 52%)`;

  return (
    <div className="flex items-center gap-3">
      <div className="relative flex-1 h-2 bg-canvas-mid/40 rounded-full overflow-hidden group cursor-pointer">
        <div
          className="absolute inset-y-0 left-0 rounded-full"
          style={{ width: `${progress}%`, backgroundColor: fillColor, transition: 'width 0.08s ease-out, background-color 0.3s ease-out' }}
        />
        <input
          type="range"
          min={0}
          max={100}
          value={progress}
          onChange={handleChange}
          className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
        />
      </div>
      <span className="text-sm text-canvas-muted/70 w-10 text-right tabular-nums font-normal">{progress}%</span>
    </div>
  );
}
