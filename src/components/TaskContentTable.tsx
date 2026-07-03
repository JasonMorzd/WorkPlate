import { useState, useCallback, useRef } from 'react';
import { Plus, X } from 'lucide-react';

interface TaskContentTableProps {
  headers: string[];
  rows: string[][];
  onChange?: (data: { headers: string[]; rows: string[][] }) => void;
}

export default function TaskContentTable({ headers: initialHeaders, rows: initialRows, onChange }: TaskContentTableProps) {
  const [localHeaders, setLocalHeaders] = useState<string[]>(initialHeaders);
  const [localRows, setLocalRows] = useState<string[][]>(initialRows);
  const onChangeRef = useRef(onChange);
  onChangeRef.current = onChange;

  const flush = useCallback(() => {
    onChangeRef.current?.({ headers: localHeaders, rows: localRows });
  }, [localHeaders, localRows]);

  const addColumn = useCallback(() => {
    setLocalHeaders((h) => {
      const next = [...h, `列${h.length + 1}`];
      setLocalRows((r) => r.map((row) => [...row, '']));
      return next;
    });
  }, []);

  const removeColumn = useCallback((colIdx: number) => {
    setLocalHeaders((h) => h.filter((_, i) => i !== colIdx));
    setLocalRows((r) => r.map((row) => row.filter((_, i) => i !== colIdx)));
  }, []);

  const addRow = useCallback(() => {
    setLocalRows((r) => [...r, new Array(localHeaders.length).fill('')]);
  }, [localHeaders.length]);

  const removeRow = useCallback((rowIdx: number) => {
    setLocalRows((r) => r.filter((_, i) => i !== rowIdx));
  }, []);

  const updateHeader = useCallback((colIdx: number, value: string) => {
    setLocalHeaders((h) => h.map((v, i) => (i === colIdx ? value : v)));
  }, []);

  const updateCell = useCallback((rowIdx: number, colIdx: number, value: string) => {
    setLocalRows((r) => r.map((row, ri) =>
      ri === rowIdx ? row.map((cell, ci) => (ci === colIdx ? value : cell)) : row
    ));
  }, []);

  const safeCols = Math.max(localHeaders.length, 1);
  const displayHeaders = localHeaders.length > 0
    ? localHeaders
    : Array.from({ length: safeCols }, (_, i) => `列${i + 1}`);
  const displayRows = localRows.map((row) =>
    row.length < safeCols ? [...row, ...new Array(safeCols - row.length).fill('')] : row
  );

  return (
    <div className="overflow-x-auto -mx-1">
      <div className="flex items-center gap-1 mb-2">
        <button
          onClick={addColumn}
          className="flex items-center gap-1 px-2 py-1 rounded text-xs text-canvas-muted/50 hover:text-citrine-400 transition-colors"
        >
          <Plus size={11} /> 列
        </button>
        <button
          onClick={addRow}
          className="flex items-center gap-1 px-2 py-1 rounded text-xs text-canvas-muted/50 hover:text-citrine-400 transition-colors"
        >
          <Plus size={11} /> 行
        </button>
        <div className="w-px h-3 bg-canvas-mid/30 mx-1" />
        <span className="text-[10px] text-canvas-muted/30">{safeCols}列 × {displayRows.length}行</span>
      </div>

      <table className="w-full border-collapse text-sm">
        <thead>
          <tr>
            <th className="w-8" />
            {displayHeaders.map((header, ci) => (
              <th key={ci} className="px-1 group min-w-[80px]">
                <div className="flex items-center gap-0.5">
                  <input
                    value={header}
                    onChange={(e) => updateHeader(ci, e.target.value)}
                    onBlur={flush}
                    placeholder="列名"
                    className="flex-1 min-w-0 bg-canvas-warm/50 text-canvas-ink/80 font-normal text-xs px-2 py-1 rounded outline-none placeholder:text-canvas-muted/30 border border-transparent focus:border-citrine-400 focus:bg-white transition-all"
                  />
                  <button
                    onClick={() => removeColumn(ci)}
                    className="opacity-0 group-hover:opacity-100 p-0.5 rounded hover:bg-red-50 transition-all"
                    title="删除列"
                  >
                    <X size={11} className="text-canvas-muted/30 hover:text-red-400" />
                  </button>
                </div>
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {displayRows.map((row, ri) => (
            <tr key={ri} className="group">
              <td className="align-top pt-1.5 pr-1">
                <button
                  onClick={() => removeRow(ri)}
                  className="opacity-0 group-hover:opacity-100 p-0.5 rounded hover:bg-red-50 transition-all"
                  title="删除行"
                >
                  <X size={11} className="text-canvas-muted/30 hover:text-red-400" />
                </button>
              </td>
              {row.map((cell, ci) => (
                <td key={ci} className="px-1 pt-1.5">
                  <input
                    value={cell}
                    onChange={(e) => updateCell(ri, ci, e.target.value)}
                    onBlur={flush}
                    placeholder="..."
                    className="w-full bg-canvas-warm/40 text-canvas-ink/80 text-sm px-2 py-1.5 rounded outline-none placeholder:text-canvas-muted/20 border border-transparent focus:border-canvas-mid/30 focus:bg-white transition-all"
                  />
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
