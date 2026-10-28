import { Router } from 'express';
import { z } from 'zod';
import { prisma } from '../lib/prisma.js';
import { monthRange } from '../lib/date.js';

export const dashboardRouter = Router();

const querySchema = z.object({
  month: z.string().regex(/^\d{4}-(0[1-9]|1[0-2])$/).optional(),
});

dashboardRouter.get('/', async (request, response, next) => {
  try {
    const { month } = querySchema.parse(request.query);
    const { start, end } = monthRange(month);
    const currentMonth = { occurredAt: { gte: start, lt: end } };

    const [allIncome, allExpense, monthIncome, monthExpense, recentTransactions, expenseGroups] =
      await Promise.all([
        prisma.transaction.aggregate({ where: { type: 'INCOME' }, _sum: { amount: true } }),
        prisma.transaction.aggregate({ where: { type: 'EXPENSE' }, _sum: { amount: true } }),
        prisma.transaction.aggregate({
          where: { type: 'INCOME', ...currentMonth },
          _sum: { amount: true },
        }),
        prisma.transaction.aggregate({
          where: { type: 'EXPENSE', ...currentMonth },
          _sum: { amount: true },
        }),
        prisma.transaction.findMany({
          take: 6,
          orderBy: { occurredAt: 'desc' },
          include: { category: true },
        }),
        prisma.transaction.groupBy({
          by: ['categoryId'],
          where: { type: 'EXPENSE', ...currentMonth },
          _sum: { amount: true },
          orderBy: { _sum: { amount: 'desc' } },
          take: 4,
        }),
      ]);

    const categories = expenseGroups.length
      ? await prisma.category.findMany({
          where: { id: { in: expenseGroups.map((item) => item.categoryId) } },
        })
      : [];
    const categoryById = new Map(categories.map((category) => [category.id, category]));

    const income = allIncome._sum.amount ?? 0;
    const expense = allExpense._sum.amount ?? 0;

    response.json({
      balance: income - expense,
      monthIncome: monthIncome._sum.amount ?? 0,
      monthExpense: monthExpense._sum.amount ?? 0,
      recentTransactions,
      expenseBreakdown: expenseGroups.map((item) => ({
        category: categoryById.get(item.categoryId),
        amount: item._sum.amount ?? 0,
      })),
    });
  } catch (error) {
    next(error);
  }
});
