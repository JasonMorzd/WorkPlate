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

export type TaskContent = TextContent | FormContent;

export interface TextContent {
  type: 'text';
  text: string;
}

export interface FormContent {
  type: 'form';
  fields: FormField[];
}

export interface FormField {
  id: string;
  label: string;
  value: string;
  type: 'text' | 'textarea' | 'number' | 'select';
  options?: string[];
}
