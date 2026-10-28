import { Prisma } from '@prisma/client';
import { Router } from 'express';
import { z } from 'zod';
import { prisma } from '../lib/prisma.js';

export const transactionsRouter = Router();

const transactionBodySchema = z.object({
  amount: z.number().int().positive().max(1_000_000_000_000),
  type: z.enum(['INCOME', 'EXPENSE']),
  categoryId: z.number().int().positive(),
  note: z.string().trim().max(120).optional().nullable(),
  occurredAt: z.iso.datetime().optional(),
});

const updateBodySchema = transactionBodySchema.partial().refine(
  (value) => Object.keys(value).length > 0,
  'Cần ít nhất một trường để cập nhật.',
);

const querySchema = z.object({
  type: z.enum(['INCOME', 'EXPENSE']).optional(),
  search: z.string().trim().optional(),
  limit: z.coerce.number().int().min(1).max(100).default(50),
  offset: z.coerce.number().int().min(0).default(0),
});

async function assertCategoryType(categoryId: number, type: 'INCOME' | 'EXPENSE') {
  const category = await prisma.category.findUnique({ where: { id: categoryId } });
  if (!category) {
    const error = new Error('Danh mục không tồn tại.');
    Object.assign(error, { status: 400 });
    throw error;
  }
  if (category.type !== type) {
    const error = new Error('Danh mục không phù hợp với loại giao dịch.');
    Object.assign(error, { status: 400 });
    throw error;
  }
}

transactionsRouter.get('/', async (request, response, next) => {
  try {
    const { type, search, limit, offset } = querySchema.parse(request.query);
    const where: Prisma.TransactionWhereInput = {
      ...(type ? { type } : {}),
      ...(search
        ? {
            OR: [
              { note: { contains: search } },
              { category: { name: { contains: search } } },
            ],
          }
        : {}),
    };

    const [items, total] = await Promise.all([
      prisma.transaction.findMany({
        where,
        include: { category: true },
        orderBy: { occurredAt: 'desc' },
        take: limit,
        skip: offset,
      }),
      prisma.transaction.count({ where }),
    ]);

    response.json({ items, total, limit, offset });
  } catch (error) {
    next(error);
  }
});

transactionsRouter.get('/:id', async (request, response, next) => {
  try {
    const transaction = await prisma.transaction.findUnique({
      where: { id: request.params.id },
      include: { category: true },
    });

    if (!transaction) {
      response.status(404).json({ message: 'Không tìm thấy giao dịch.' });
      return;
    }

    response.json(transaction);
  } catch (error) {
    next(error);
  }
});

transactionsRouter.post('/', async (request, response, next) => {
  try {
    const input = transactionBodySchema.parse(request.body);
    await assertCategoryType(input.categoryId, input.type);

    const transaction = await prisma.transaction.create({
      data: {
        ...input,
        note: input.note || null,
        occurredAt: input.occurredAt ? new Date(input.occurredAt) : undefined,
      },
      include: { category: true },
    });

    response.status(201).json(transaction);
  } catch (error) {
    next(error);
  }
});

transactionsRouter.patch('/:id', async (request, response, next) => {
  try {
    const input = updateBodySchema.parse(request.body);
    const existing = await prisma.transaction.findUnique({ where: { id: request.params.id } });
    if (!existing) {
      response.status(404).json({ message: 'Không tìm thấy giao dịch.' });
      return;
    }

    const type = input.type ?? existing.type;
    const categoryId = input.categoryId ?? existing.categoryId;
    await assertCategoryType(categoryId, type);

    const transaction = await prisma.transaction.update({
      where: { id: request.params.id },
      data: {
        ...input,
        note: input.note === undefined ? undefined : input.note || null,
        occurredAt: input.occurredAt ? new Date(input.occurredAt) : undefined,
      },
      include: { category: true },
    });

    response.json(transaction);
  } catch (error) {
    next(error);
  }
});

transactionsRouter.delete('/:id', async (request, response, next) => {
  try {
    const existing = await prisma.transaction.findUnique({ where: { id: request.params.id } });
    if (!existing) {
      response.status(404).json({ message: 'Không tìm thấy giao dịch.' });
      return;
    }

    await prisma.transaction.delete({ where: { id: request.params.id } });
    response.status(204).send();
  } catch (error) {
    next(error);
  }
});
