import { Router } from 'express';
import { z } from 'zod';
import { prisma } from '../lib/prisma.js';

export const categoriesRouter = Router();

const querySchema = z.object({
  type: z.enum(['INCOME', 'EXPENSE']).optional(),
});

categoriesRouter.get('/', async (request, response, next) => {
  try {
    const query = querySchema.parse(request.query);
    const categories = await prisma.category.findMany({
      where: query.type ? { type: query.type } : undefined,
      orderBy: [{ type: 'asc' }, { name: 'asc' }],
    });

    response.json(categories);
  } catch (error) {
    next(error);
  }
});
