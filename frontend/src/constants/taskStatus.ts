// src/constants/taskStatus.ts
import { TaskStatus } from '../api/task';

export const TASK_STATUS_CONFIG = {
  backlog: { label: '🧠 Backlog', emoji: '🧠' },
  in_progress: { label: '🔨 In Progress', emoji: '🔨' },
  in_review: { label: '🧐 In Review', emoji: '🧐' },
  done: { label: '✅ Done', emoji: '✅' },
  wont_do: { label: '🚫 Won\'t Do', emoji: '🚫' }
} as const;

export const TASK_STATUS_ORDER: TaskStatus[] = ['backlog', 'in_progress', 'in_review', 'done', 'wont_do'];

export const TASK_STATUS_OPTIONS: { value: TaskStatus; label: string }[] = [
  { value: 'backlog', label: '🧠 Backlog' },
  { value: 'in_progress', label: '🔨 In Progress' },
  { value: 'in_review', label: '🧐 In Review' },
  { value: 'done', label: '✅ Done' },
  { value: 'wont_do', label: '🚫 Won\'t Do' }
];

export function getStatusLabel(status: TaskStatus): string {
  return TASK_STATUS_CONFIG[status]?.label || status;
}

export function getStatusEmoji(status: TaskStatus): string {
  return TASK_STATUS_CONFIG[status]?.emoji || '';
}