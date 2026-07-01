import { useCallback } from 'react';

interface TaskContentTextProps {
  text: string;
  onChange?: (text: string) => void;
}

export default function TaskContentText({ text, onChange }: TaskContentTextProps) {
  const handleChange = useCallback((e: React.ChangeEvent<HTMLTextAreaElement>) => {
    onChange?.(e.target.value);
  }, [onChange]);

  return (
    <textarea
      value={text}
      onChange={handleChange}
      placeholder="在此输入备注..."
      className="w-full min-h-[100px] bg-canvas-warm/50 text-sm text-canvas-ink/90 leading-relaxed resize-none outline-none rounded-lg p-3 placeholder:text-canvas-muted/30 tracking-wide"
    />
  );
}
