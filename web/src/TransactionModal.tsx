import { useEffect, useMemo, useState, type FormEvent } from 'react';
import { ArrowDownLeft, ArrowUpRight, X } from 'lucide-react';
import { api } from './api';
import { CategoryIcon } from './CategoryIcon';
import { toDateInput } from './format';
import type { Category, Transaction, TransactionInput, TransactionType } from './types';

type Props = {
  categories: Category[];
  transaction: Transaction | null;
  initialType?: TransactionType;
  onClose: () => void;
  onSaved: () => void;
};

export function TransactionModal({ categories, transaction, initialType = 'EXPENSE', onClose, onSaved }: Props) {
  const [type, setType] = useState<TransactionType>(transaction?.type ?? initialType);
  const [amount, setAmount] = useState(transaction ? String(transaction.amount) : '');
  const [categoryId, setCategoryId] = useState(transaction?.categoryId ?? 0);
  const [occurredAt, setOccurredAt] = useState(
    transaction ? toDateInput(transaction.occurredAt) : toDateInput(new Date().toISOString()),
  );
  const [note, setNote] = useState(transaction?.note ?? '');
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');

  const availableCategories = useMemo(
    () => categories.filter((category) => category.type === type),
    [categories, type],
  );

  useEffect(() => {
    if (!availableCategories.some((category) => category.id === categoryId)) {
      setCategoryId(availableCategories[0]?.id ?? 0);
    }
  }, [availableCategories, categoryId]);

  const changeType = (nextType: TransactionType) => {
    setType(nextType);
    const first = categories.find((category) => category.type === nextType);
    setCategoryId(first?.id ?? 0);
  };

  const submit = async (event: FormEvent) => {
    event.preventDefault();
    const numericAmount = Number(amount);
    if (!numericAmount || numericAmount <= 0 || !categoryId) {
      setError('Vui lòng nhập số tiền và chọn danh mục.');
      return;
    }

    setSaving(true);
    setError('');
    const input: TransactionInput = {
      amount: Math.round(numericAmount),
      type,
      categoryId,
      note: note.trim() || null,
      occurredAt: new Date(`${occurredAt}T12:00:00`).toISOString(),
    };

    try {
      if (transaction) await api.updateTransaction(transaction.id, input);
      else await api.createTransaction(input);
      onSaved();
    } catch (submitError) {
      setError(submitError instanceof Error ? submitError.message : 'Không thể lưu giao dịch.');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="modal-backdrop" role="presentation" onMouseDown={onClose}>
      <section className="transaction-modal" role="dialog" aria-modal="true" aria-labelledby="modal-title" onMouseDown={(event) => event.stopPropagation()}>
        <header className="modal-header">
          <div>
            <p className="eyebrow">Giao dịch</p>
            <h2 id="modal-title">{transaction ? 'Chỉnh sửa dữ liệu' : 'Thêm giao dịch mới'}</h2>
          </div>
          <button className="icon-button" type="button" onClick={onClose} aria-label="Đóng">
            <X size={20} />
          </button>
        </header>

        <form onSubmit={submit}>
          <div className="type-switch" aria-label="Loại giao dịch">
            <button type="button" className={type === 'EXPENSE' ? 'active expense' : ''} onClick={() => changeType('EXPENSE')}>
              <ArrowUpRight size={17} /> Khoản chi
            </button>
            <button type="button" className={type === 'INCOME' ? 'active income' : ''} onClick={() => changeType('INCOME')}>
              <ArrowDownLeft size={17} /> Khoản thu
            </button>
          </div>

          <label className="form-field amount-field">
            <span>Số tiền</span>
            <div className="amount-input-wrap">
              <input
                autoFocus
                inputMode="numeric"
                min="1"
                max="1000000000000"
                step="1"
                type="number"
                value={amount}
                onChange={(event) => setAmount(event.target.value)}
                placeholder="0"
                required
              />
              <strong>₫</strong>
            </div>
          </label>

          <div className="form-field">
            <span>Danh mục</span>
            <div className="category-picker">
              {availableCategories.map((category) => (
                <button
                  type="button"
                  key={category.id}
                  className={category.id === categoryId ? 'selected' : ''}
                  style={{ '--category-color': category.color } as React.CSSProperties}
                  onClick={() => setCategoryId(category.id)}
                >
                  <CategoryIcon name={category.icon} />
                  {category.name}
                </button>
              ))}
            </div>
          </div>

          <div className="form-grid">
            <label className="form-field">
              <span>Ngày giao dịch</span>
              <input type="date" value={occurredAt} onChange={(event) => setOccurredAt(event.target.value)} required />
            </label>
            <label className="form-field">
              <span>Ghi chú</span>
              <input maxLength={120} value={note} onChange={(event) => setNote(event.target.value)} placeholder="Nội dung giao dịch" />
            </label>
          </div>

          {error && <div className="form-error" role="alert">{error}</div>}

          <footer className="modal-actions">
            <button className="button ghost" type="button" onClick={onClose}>Hủy</button>
            <button className="button primary" type="submit" disabled={saving}>
              {saving ? 'Đang lưu...' : transaction ? 'Lưu thay đổi' : 'Thêm giao dịch'}
            </button>
          </footer>
        </form>
      </section>
    </div>
  );
}
