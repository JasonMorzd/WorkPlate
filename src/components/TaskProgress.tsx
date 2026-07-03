import { useState, useCallback } from 'react';

interface TaskProgressProps {
  progress: number;
  hue: number;
  onChange?: (progress: number) => void;
}

export default function TaskProgress({ progress, hue, onChange }: TaskProgressProps) {
  const [local, setLocal] = useState(progress);

  const handleChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const val = Number(e.target.value);
    setLocal(val);
  }, []);

  const handleCommit = useCallback(() => {
    onChange?.(local);
  }, [local, onChange]);

  if (progress === -1) {
    return (
      <span className="inline-block text-sm px-3 py-1 rounded-full bg-canvas-warm/80 text-canvas-muted tracking-wide">
        长期跟踪中
      </span>
    );
  }

  if (progress === 101) {
    return (
      <span className="inline-block text-sm px-3 py-1 rounded-full bg-citrine-50 text-citrine-500 tracking-wide">
        已完成
      </span>
    );
  }

  const fillColor = `hsl(${hue}, ${Math.max(5, 65 - (local / 100) * 55)}%, 52%)`;

  return (
    <div className="flex items-center gap-3">
      <div className="relative flex-1 h-2 bg-canvas-mid/50 rounded-full overflow-hidden group cursor-pointer">
        <div
          className="absolute inset-y-0 left-0 rounded-full"
          style={{ width: `${local}%`, backgroundColor: fillColor }}
        />
        <input
          type="range"
          min={0}
          max={100}
          value={local}
          onChange={handleChange}
          onMouseUp={handleCommit}
          onTouchEnd={handleCommit}
          className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
        />
      </div>
      <span className="text-base text-canvas-ink w-10 text-right tabular-nums font-normal">{local}%</span>
    </div>
  );
}
