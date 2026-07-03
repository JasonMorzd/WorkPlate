import { useTaskStore } from '@/store/useTaskStore';
import { sortTasks } from '@/utils/layoutUtils';
import TaskCard from './TaskCard';

interface GridItem {
  id: string;
  colSpan: number;
  rowSpan: number;
  colStart: number;
  rowStart: number;
}

function packGrid(items: { id: string; important: boolean }[], cols: number): GridItem[] {
  const grid: (string | null)[][] = [];
  const MAX_ROWS = 50;

  for (let r = 0; r < MAX_ROWS; r++) {
    grid[r] = new Array(cols).fill(null);
  }

  const placed: GridItem[] = [];

  for (const item of items) {
    const cSpan = item.important ? 2 : 1;
    const rSpan = item.important ? 2 : 1;
    let found = false;

    for (let r = 0; r < MAX_ROWS && !found; r++) {
      for (let c = 0; c <= cols - cSpan; c++) {
        if (canPlace(grid, r, c, cSpan, rSpan)) {
          fillGrid(grid, r, c, cSpan, rSpan, item.id);
          placed.push({
            id: item.id,
            colSpan: cSpan,
            rowSpan: rSpan,
            colStart: c + 1,
            rowStart: r + 1,
          });
          found = true;
          break;
        }
      }
    }

    if (!found) {
      let r = findFreeRow(grid);
      for (let c = 0; c < cols; c++) {
        if (!grid[r]?.[c]) {
          fillGrid(grid, r, c, cSpan, rSpan, item.id);
          placed.push({
            id: item.id,
            colSpan: cSpan,
            rowSpan: rSpan,
            colStart: c + 1,
            rowStart: r + 1,
          });
          break;
        }
      }
    }
  }

  return placed;
}

function canPlace(grid: (string | null)[][], row: number, col: number, cSpan: number, rSpan: number): boolean {
  for (let r = row; r < row + rSpan; r++) {
    for (let c = col; c < col + cSpan; c++) {
      if (grid[r]?.[c] !== null) return false;
    }
  }
  return true;
}

function fillGrid(grid: (string | null)[][], row: number, col: number, cSpan: number, rSpan: number, id: string) {
  for (let r = row; r < row + rSpan; r++) {
    for (let c = col; c < col + cSpan; c++) {
      if (!grid[r]) grid[r] = [];
      grid[r][c] = id;
    }
  }
}

function findFreeRow(grid: (string | null)[][]): number {
  for (let r = grid.length - 1; r >= 0; r--) {
    if (grid[r]?.some((cell) => cell === null)) return r;
  }
  return grid.length;
}

function computeMaxRow(items: GridItem[]): number {
  let maxR = 0;
  for (const item of items) {
    maxR = Math.max(maxR, item.rowStart + item.rowSpan - 1);
  }
  return maxR;
}

function determineCols(taskCount: number, importantCount: number): number {
  if (taskCount <= 1) return 1;
  if (taskCount <= 2) return 2;
  if (taskCount <= 4) return importantCount > 0 ? 3 : 2;
  if (taskCount <= 6) return importantCount > 1 ? 4 : 3;
  if (taskCount <= 9) return importantCount > 2 ? 5 : 4;
  return importantCount > 3 ? 6 : 5;
}

interface TaskGridProps {
  batchMode: boolean;
  selectedIds: Set<string>;
  onToggleSelect: (id: string) => void;
}

export default function TaskGrid({ batchMode, selectedIds, onToggleSelect }: TaskGridProps) {
  const { tasks, deletingTaskIds, setExpandedTask } = useTaskStore();
  const sorted = sortTasks(tasks);

  if (sorted.length === 0 && deletingTaskIds.size === 0) {
    return (
      <div className="flex-1 flex items-center justify-center">
        <p className="text-sm text-canvas-muted tracking-wide">暂无任务，点击右上角「新建」开始</p>
      </div>
    );
  }

  const importantCount = sorted.filter((t) => t.isImportant).length;
  const cols = determineCols(sorted.length, importantCount);

  const layout = packGrid(
    sorted.map((t) => ({ id: t.id, important: t.isImportant })),
    cols,
  );
  const maxRow = computeMaxRow(layout);
  const layoutMap = new Map(layout.map((l) => [l.id, l]));

  return (
    <div className="flex-1 max-md:p-2 max-md:pt-0 p-4 overflow-auto min-h-0 card-scroll">
      <div
        className="grid gap-4 max-md:gap-2.5 w-full min-h-full auto-rows-fr"
        style={{
          gridTemplateColumns: `repeat(${cols}, 1fr)`,
          gridTemplateRows: `repeat(${maxRow}, 1fr)`,
        }}
      >
        {sorted.map((task) => {
          const l = layoutMap.get(task.id);
          const isDeleting = deletingTaskIds.has(task.id);
          const isSelected = selectedIds.has(task.id);
          return (
            <div
              key={task.id}
              className="rounded-2xl overflow-hidden"
              style={{
                gridColumn: l ? `${l.colStart} / span ${l.colSpan}` : 'auto',
                gridRow: l ? `${l.rowStart} / span ${l.rowSpan}` : 'auto',
                transition: isDeleting ? 'none' : 'grid-column 0.6s cubic-bezier(0.22, 0.61, 0.36, 1), grid-row 0.6s cubic-bezier(0.22, 0.61, 0.36, 1)',
              }}
            >
              <TaskCard
                task={task}
                isDeleting={isDeleting}
                batchMode={batchMode}
                isSelected={isSelected}
                onClick={() => setExpandedTask(task.id)}
                onToggleSelect={() => onToggleSelect(task.id)}
              />
            </div>
          );
        })}
      </div>
    </div>
  );
}
