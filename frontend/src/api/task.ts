// src/api/task.ts
import { authenticatedAPI } from './apiWithAuth';

export type TaskStatus = 'backlog' | 'in_progress' | 'in_review' | 'done' | 'wont_do';

export interface Task {
  id: number;
  title: string;
  why: string | null;
  what: string | null;
  how: string | null;
  acceptance_criteria: string | null;
  status: TaskStatus;
  user_id: number;
  created_at: string;
  updated_at?: string;
  due_date?: string;
  sort_order: number;
}

export interface CreateTaskData {
  title: string;
  why?: string;
  what?: string;
  how?: string;
  acceptance_criteria?: string;
  status?: TaskStatus;
  due_date?: string;
}

export async function createTask(taskData: CreateTaskData) {
  return authenticatedAPI.request<{ task: Task }>('/tasks', {
    method: 'POST',
    body: taskData,
  });
}

export async function getTasks() {
  return authenticatedAPI.request<{ tasks: Task[] }>('/tasks', {
    method: 'GET',
  });
}

export async function getTask(taskId: number) {
  return authenticatedAPI.request<{ task: Task }>(`/tasks/${taskId}`, {
    method: 'GET',
  });
}

export async function updateTask(taskId: number, taskData: Partial<CreateTaskData>) {
  return authenticatedAPI.request<{ task: Task }>(`/tasks/${taskId}`, {
    method: 'PUT',
    body: taskData,
  });
}

export async function updateTaskStatus(taskId: number, status: TaskStatus) {
  return authenticatedAPI.request<{ task: Task }>(`/tasks/${taskId}`, {
    method: 'PUT',
    body: { status },
  });
}

export async function deleteTask(taskId: number) {
  return authenticatedAPI.request<{ message: string }>(`/tasks/${taskId}`, {
    method: 'DELETE',
  });
}

export async function reorderTask(taskId: number, targetStatus: TaskStatus, targetPosition: number) {
  return authenticatedAPI.request<{ task: Task }>(`/tasks/${taskId}/reorder`, {
    method: 'POST',
    body: {
      target_status: targetStatus,
      target_position: targetPosition,
    },
  });
}