import cors from 'cors';
import express, { type NextFunction, type Request, type Response } from 'express';
import { ZodError } from 'zod';
import { categoriesRouter } from './routes/categories.js';
import { dashboardRouter } from './routes/dashboard.js';
import { transactionsRouter } from './routes/transactions.js';

export const app = express();

app.use(cors());
app.use(express.json({ limit: '100kb' }));

app.get('/health', (_request, response) => {
  response.json({ status: 'ok' });
});

app.use('/api/dashboard', dashboardRouter);
app.use('/api/categories', categoriesRouter);
app.use('/api/transactions', transactionsRouter);

app.use((_request, response) => {
  response.status(404).json({ message: 'Không tìm thấy đường dẫn.' });
});

app.use((error: unknown, _request: Request, response: Response, _next: NextFunction) => {
  if (error instanceof ZodError) {
    response.status(400).json({
      message: 'Dữ liệu không hợp lệ.',
      issues: error.issues,
    });
    return;
  }

  const status =
    typeof error === 'object' && error !== null && 'status' in error
      ? Number(error.status)
      : 500;
  const message = error instanceof Error ? error.message : 'Lỗi máy chủ.';

  if (status >= 500) {
    console.error(error);
  }

  response.status(status).json({ message });
});
