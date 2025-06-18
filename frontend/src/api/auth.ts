// src/api/auth.ts
import { apiRequest, APIResponse } from './base';

const AUTH_BASE = '/auth';

export function loginUser(data: {
  email: string;
  password: string;
}): Promise<APIResponse> {
  return apiRequest(`${AUTH_BASE}/login`, {
    method: 'POST',
    body: data,
  });
}

export function registerUser(data: {
  username: string;
  email: string;
  password: string;
}): Promise<APIResponse> {
  return apiRequest(`${AUTH_BASE}/register`, {
    method: 'POST',
    body: data,
  });
}
