export interface Task {
  id: string;
  title: string;
  importance: number;
  isImportant: boolean;
  progress: number;
  hue: number;
  content: TaskContent;
  isPinned: boolean;
  createdAt: number;
}

export type TaskContent = TextContent | TableContent;

export interface TextContent {
  type: 'text';
  text: string;
}

export interface TableContent {
  type: 'table';
  headers: string[];
  rows: string[][];
}
