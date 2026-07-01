import { useState, useEffect, useCallback, useRef } from 'react';
import type { FormField } from '@/types';
import { Plus, X } from 'lucide-react';

interface TaskContentFormProps {
  fields: FormField[];
  onChange?: (fields: FormField[]) => void;
}

export default function TaskContentForm({ fields, onChange }: TaskContentFormProps) {
  const [localFields, setLocalFields] = useState<FormField[]>(fields);
  const onChangeRef = useRef(onChange);
  onChangeRef.current = onChange;

  useEffect(() => {
    setLocalFields(fields);
  }, [fields]);

  const sync = useCallback((updated: FormField[]) => {
    setLocalFields(updated);
  }, []);

  const flushToParent = useCallback(() => {
    onChangeRef.current?.(localFields);
  }, [localFields]);

  const addField = useCallback(() => {
    const newField: FormField = {
      id: `field-${Date.now()}`,
      label: '',
      value: '',
      type: 'text',
    };
    const next = [...localFields, newField];
    sync(next);
  }, [localFields, sync]);

  const removeField = useCallback((fieldId: string) => {
    onChangeRef.current?.(localFields.filter((f) => f.id !== fieldId));
  }, [localFields]);

  const updateField = useCallback((fieldId: string, updates: Partial<FormField>) => {
    setLocalFields((prev) => prev.map((f) => (f.id === fieldId ? { ...f, ...updates } : f)));
  }, []);

  const handleFieldBlur = useCallback(() => {
    onChangeRef.current?.(localFields);
  }, [localFields]);

  return (
    <div className="space-y-2">
      {localFields.map((field) => (
        <div key={field.id} className="flex items-start gap-2 group">
          <div className="flex-1 space-y-1">
            <div className="flex items-center gap-2">
              <input
                value={field.label}
                onChange={(e) => updateField(field.id, { label: e.target.value })}
                onBlur={handleFieldBlur}
                placeholder="字段名"
                className="w-24 bg-canvas-warm/70 text-canvas-muted text-xs px-2 py-1 rounded outline-none placeholder:text-canvas-muted/30"
              />
              <select
                value={field.type}
                onChange={(e) => {
                  updateField(field.id, { type: e.target.value as FormField['type'] });
                  setTimeout(handleFieldBlur, 0);
                }}
                className="bg-canvas-warm/70 text-canvas-muted/70 text-xs px-1 py-1 rounded outline-none"
              >
                <option value="text">文本</option>
                <option value="textarea">多行</option>
                <option value="number">数字</option>
                <option value="select">选择</option>
              </select>
              <button
                onClick={() => removeField(field.id)}
                className="opacity-0 group-hover:opacity-100 transition-opacity"
              >
                <X size={13} className="text-canvas-muted/30 hover:text-red-400" />
              </button>
            </div>
            {field.type === 'textarea' ? (
              <textarea
                value={field.value}
                onChange={(e) => updateField(field.id, { value: e.target.value })}
                onBlur={handleFieldBlur}
                placeholder="输入内容..."
                className="w-full bg-canvas-warm/50 text-sm text-canvas-ink/90 px-2 py-1.5 rounded outline-none min-h-[60px] resize-none placeholder:text-canvas-muted/30 tracking-wide"
              />
            ) : field.type === 'select' ? (
              <div className="flex items-center gap-2">
                <select
                  value={field.value}
                  onChange={(e) => {
                    updateField(field.id, { value: e.target.value });
                    setTimeout(handleFieldBlur, 0);
                  }}
                  className="flex-1 bg-canvas-warm/50 text-sm text-canvas-ink/90 px-2 py-1.5 rounded outline-none"
                >
                  <option value="">请选择</option>
                  {field.options?.map((opt) => (
                    <option key={opt} value={opt}>{opt}</option>
                  ))}
                </select>
                <input
                  value={field.options?.join(', ') || ''}
                  onChange={(e) => updateField(field.id, { options: e.target.value.split(', ').filter(Boolean) })}
                  onBlur={handleFieldBlur}
                  placeholder="选项（逗号分隔）"
                  className="w-32 bg-canvas-warm/50 text-canvas-muted/60 text-xs px-2 py-1 rounded outline-none placeholder:text-canvas-muted/30"
                />
              </div>
            ) : (
              <input
                type={field.type === 'number' ? 'number' : 'text'}
                value={field.value}
                onChange={(e) => updateField(field.id, { value: e.target.value })}
                onBlur={handleFieldBlur}
                placeholder="输入内容..."
                className="w-full bg-canvas-warm/50 text-sm text-canvas-ink/90 px-2 py-1.5 rounded outline-none placeholder:text-canvas-muted/30 tracking-wide"
              />
            )}
          </div>
        </div>
      ))}
      <button
        onClick={addField}
        className="flex items-center gap-1 text-xs text-canvas-muted/50 hover:text-citrine-400 transition-colors mt-1"
      >
        <Plus size={12} /> 添加字段
      </button>
    </div>
  );
}
