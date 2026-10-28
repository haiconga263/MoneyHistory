import type {
  Category,
  DashboardData,
  Transaction,
  TransactionInput,
  TransactionList,
  TransactionType,
} from '../types';

const API_URL = process.env.EXPO_PUBLIC_API_URL ?? 'http://localhost:4000/api';

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

  if (response.status === 204) {
    return undefined as T;
  }

  return response.json() as Promise<T>;
}

export const api = {
  getDashboard: () => request<DashboardData>('/dashboard'),
  getCategories: (type?: TransactionType) =>
    request<Category[]>(`/categories${type ? `?type=${type}` : ''}`),
  getTransactions: (type?: TransactionType, search?: string) => {
    const params = new URLSearchParams();
    if (type) params.set('type', type);
    if (search) params.set('search', search);
    const query = params.toString();
    return request<TransactionList>(`/transactions${query ? `?${query}` : ''}`);
  },
  getTransaction: (id: string) => request<Transaction>(`/transactions/${id}`),
  createTransaction: (input: TransactionInput) =>
    request<Transaction>('/transactions', { method: 'POST', body: JSON.stringify(input) }),
  updateTransaction: (id: string, input: Partial<TransactionInput>) =>
    request<Transaction>(`/transactions/${id}`, { method: 'PATCH', body: JSON.stringify(input) }),
  deleteTransaction: (id: string) =>
    request<void>(`/transactions/${id}`, { method: 'DELETE' }),
};
