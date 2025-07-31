// src/api/base.ts
export type APIResponse<T = any> = {
  status: 'success' | 'error';
  data?: T;
  error?: string;
  errors?: string[];
};

interface RequestOptions {
  method?: 'GET' | 'POST' | 'PUT' | 'DELETE';
  body?: any;
  headers?: Record<string, string>;
}

const BASE_URL = 'http://127.0.0.1:5001';

export async function apiRequest<T = any>(
  endpoint: string,
  { method = 'GET', body, headers = {} }: RequestOptions = {}
): Promise<APIResponse<T>> {
  try {
    const res = await fetch(`${BASE_URL}${endpoint}`, {
      method,
      headers: {
        'Content-Type': 'application/json',
        ...headers,
      },
      body: body ? JSON.stringify(body) : undefined,
    });

    const json = await res.json();

    if (!res.ok) {
      return { status: 'error', error: json.error || 'Request failed' };
    }

    return { status: 'success', data: json };
  } catch (err: any) {
    return { status: 'error', error: err.message || 'Unexpected error' };
  }
}
