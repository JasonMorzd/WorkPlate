import { useState, useEffect, useCallback, useRef } from 'react';

interface TaskContentTextProps {
  text: string;
  onChange?: (text: string) => void;
}

export default function TaskContentText({ text, onChange }: TaskContentTextProps) {
  const [local, setLocal] = useState(text);
  const onChangeRef = useRef(onChange);
  onChangeRef.current = onChange;

  useEffect(() => {
    setLocal(text);
  }, [text]);

  const handleBlur = useCallback(() => {
    onChangeRef.current?.(local);
  }, [local]);

  const handleChange = useCallback((e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setLocal(e.target.value);
  }, []);

  return (
    <textarea
      value={local}
      onChange={handleChange}
      onBlur={handleBlur}
      placeholder="在此输入备注..."
      className="w-full min-h-[100px] bg-canvas-warm/50 text-sm text-canvas-ink/90 leading-relaxed resize-none outline-none rounded-lg p-3 placeholder:text-canvas-muted/30 tracking-wide"
    />
  );
}
