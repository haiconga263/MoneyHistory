import type {
  Category,
  DashboardData,
  Transaction,
  TransactionInput,
  TransactionList,
  TransactionType,
} from './types';

const API_URL = (import.meta.env.VITE_API_URL ?? '/api').replace(/\/$/, '');

async function request<T>(path: string, options?: RequestInit): Promise<T> {
  const response = await fetch(`${API_URL}${path}`, {
    ...options,
    headers: {
      'Content-Type': 'application/json',
      ...options?.headers,
    },
  });

  if (!response.ok) {
    const body = await response.json().catch(() => null);
    throw new Error(body?.message ?? 'Không thể kết nối máy chủ.');
  }

  if (response.status === 204) return undefined as T;
  return response.json() as Promise<T>;
}

export const api = {
  getDashboard: (month: string) => request<DashboardData>(`/dashboard?month=${month}`),
  getCategories: () => request<Category[]>('/categories'),
  getTransactions: (type?: TransactionType, search?: string) => {
    const params = new URLSearchParams({ limit: '100' });
    if (type) params.set('type', type);
    if (search) params.set('search', search);
    return request<TransactionList>(`/transactions?${params.toString()}`);
  },
  createTransaction: (input: TransactionInput) =>
    request<Transaction>('/transactions', { method: 'POST', body: JSON.stringify(input) }),
  updateTransaction: (id: string, input: Partial<TransactionInput>) =>
    request<Transaction>(`/transactions/${id}`, { method: 'PATCH', body: JSON.stringify(input) }),
  deleteTransaction: (id: string) => request<void>(`/transactions/${id}`, { method: 'DELETE' }),
};
