export type TransactionType = 'INCOME' | 'EXPENSE';

export type Category = {
  id: number;
  name: string;
  icon: string;
  color: string;
  type: TransactionType;
};

export type Transaction = {
  id: string;
  amount: number;
  note: string | null;
  type: TransactionType;
  occurredAt: string;
  createdAt: string;
  updatedAt: string;
  categoryId: number;
  category: Category;
};

export type DashboardData = {
  balance: number;
  monthIncome: number;
  monthExpense: number;
  recentTransactions: Transaction[];
  expenseBreakdown: Array<{ category: Category; amount: number }>;
};

export type TransactionList = {
  items: Transaction[];
  total: number;
  limit: number;
  offset: number;
};

export type TransactionInput = {
  amount: number;
  type: TransactionType;
  categoryId: number;
  note?: string | null;
  occurredAt?: string;
};
