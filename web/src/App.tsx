import { useCallback, useEffect, useMemo, useState } from 'react';
import {
  ArrowDownLeft,
  ArrowUpRight,
  Bell,
  ChevronRight,
  CircleDollarSign,
  LayoutDashboard,
  Menu,
  MoreHorizontal,
  Pencil,
  Plus,
  RefreshCw,
  Search,
  Trash2,
  WalletCards,
  X,
} from 'lucide-react';
import { api } from './api';
import { CategoryIcon } from './CategoryIcon';
import { currentMonth, formatDate, formatMoney, formatMonth } from './format';
import { TransactionModal } from './TransactionModal';
import type { Category, DashboardData, Transaction, TransactionType } from './types';

type View = 'dashboard' | 'transactions';
type Filter = 'ALL' | TransactionType;

type ModalState = {
  transaction: Transaction | null;
  initialType?: TransactionType;
};

export default function App() {
  const [view, setView] = useState<View>('dashboard');
  const [month, setMonth] = useState(currentMonth());
  const [dashboard, setDashboard] = useState<DashboardData | null>(null);
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [total, setTotal] = useState(0);
  const [filter, setFilter] = useState<Filter>('ALL');
  const [search, setSearch] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [modal, setModal] = useState<ModalState | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<Transaction | null>(null);
  const [deleting, setDeleting] = useState(false);
  const [sidebarOpen, setSidebarOpen] = useState(false);

  const loadData = useCallback(async () => {
    setLoading(true);
    setError('');
    try {
      const [dashboardData, transactionData, categoryData] = await Promise.all([
        api.getDashboard(month),
        api.getTransactions(filter === 'ALL' ? undefined : filter, search),
        api.getCategories(),
      ]);
      setDashboard(dashboardData);
      setTransactions(transactionData.items);
      setTotal(transactionData.total);
      setCategories(categoryData);
    } catch (loadError) {
      setError(loadError instanceof Error ? loadError.message : 'Không thể tải dữ liệu.');
    } finally {
      setLoading(false);
    }
  }, [filter, month, search]);

  useEffect(() => {
    const timer = window.setTimeout(() => void loadData(), 250);
    return () => window.clearTimeout(timer);
  }, [loadData]);

  const maxBreakdown = useMemo(
    () => Math.max(...(dashboard?.expenseBreakdown.map((item) => item.amount) ?? [1]), 1),
    [dashboard],
  );

  const navigate = (nextView: View) => {
    setView(nextView);
    setSidebarOpen(false);
  };

  const afterSaved = () => {
    setModal(null);
    void loadData();
  };

  const removeTransaction = async () => {
    if (!deleteTarget) return;
    setDeleting(true);
    try {
      await api.deleteTransaction(deleteTarget.id);
      setDeleteTarget(null);
      await loadData();
    } catch (deleteError) {
      setError(deleteError instanceof Error ? deleteError.message : 'Không thể xóa giao dịch.');
      setDeleteTarget(null);
    } finally {
      setDeleting(false);
    }
  };

  const table = (items: Transaction[]) => (
    <div className="table-wrap">
      <table className="transaction-table">
        <thead>
          <tr>
            <th>Giao dịch</th>
            <th>Ngày</th>
            <th>Loại</th>
            <th>Số tiền</th>
            <th><span className="sr-only">Thao tác</span></th>
          </tr>
        </thead>
        <tbody>
          {items.map((transaction) => {
            const income = transaction.type === 'INCOME';
            return (
              <tr key={transaction.id}>
                <td>
                  <div className="transaction-name">
                    <span className="category-icon" style={{ color: transaction.category.color, background: `${transaction.category.color}18` }}>
                      <CategoryIcon name={transaction.category.icon} />
                    </span>
                    <span>
                      <strong>{transaction.category.name}</strong>
                      <small>{transaction.note || 'Không có ghi chú'}</small>
                    </span>
                  </div>
                </td>
                <td data-label="Ngày">{formatDate(transaction.occurredAt)}</td>
                <td data-label="Loại"><span className={`status ${income ? 'income' : 'expense'}`}>{income ? 'Khoản thu' : 'Khoản chi'}</span></td>
                <td data-label="Số tiền" className={`money ${income ? 'income' : ''}`}>{income ? '+' : '-'}{formatMoney(transaction.amount)}</td>
                <td>
                  <div className="row-actions">
                    <button type="button" onClick={() => setModal({ transaction })} aria-label={`Sửa ${transaction.category.name}`}><Pencil size={16} /></button>
                    <button className="danger" type="button" onClick={() => setDeleteTarget(transaction)} aria-label={`Xóa ${transaction.category.name}`}><Trash2 size={16} /></button>
                  </div>
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
      {!items.length && !loading && (
        <div className="empty-state">
          <CircleDollarSign size={42} />
          <strong>Chưa có giao dịch</strong>
          <span>Thêm khoản thu hoặc khoản chi để bắt đầu quản lý dữ liệu.</span>
          <button className="button primary" onClick={() => setModal({ transaction: null })}><Plus size={17} /> Thêm giao dịch</button>
        </div>
      )}
    </div>
  );

  return (
    <div className="app-shell">
      <aside className={`sidebar ${sidebarOpen ? 'open' : ''}`}>
        <div className="brand">
          <span className="brand-mark"><span /></span>
          <div><strong>money</strong><span>history</span></div>
        </div>
        <button className="sidebar-close" onClick={() => setSidebarOpen(false)} aria-label="Đóng menu"><X size={20} /></button>

        <nav>
          <p>Không gian làm việc</p>
          <button className={view === 'dashboard' ? 'active' : ''} onClick={() => navigate('dashboard')}>
            <LayoutDashboard size={19} /> Tổng quan
          </button>
          <button className={view === 'transactions' ? 'active' : ''} onClick={() => navigate('transactions')}>
            <WalletCards size={19} /> Giao dịch <span className="nav-count">{total}</span>
          </button>
        </nav>

        <div className="sidebar-card">
          <span className="card-orb" />
          <CircleDollarSign size={24} />
          <strong>Ghi chép đều đặn</strong>
          <p>Dữ liệu rõ ràng giúp bạn ra quyết định tài chính tốt hơn.</p>
        </div>

        <div className="profile">
          <span className="avatar">MH</span>
          <div><strong>MoneyHistory</strong><small>Hồ sơ cá nhân</small></div>
          <MoreHorizontal size={18} />
        </div>
      </aside>

      {sidebarOpen && <button className="sidebar-overlay" aria-label="Đóng menu" onClick={() => setSidebarOpen(false)} />}

      <main className="main-content">
        <header className="topbar">
          <button className="mobile-menu" onClick={() => setSidebarOpen(true)} aria-label="Mở menu"><Menu size={22} /></button>
          <div>
            <p className="eyebrow">{view === 'dashboard' ? 'Bảng điều khiển' : 'Quản lý dữ liệu'}</p>
            <h1>{view === 'dashboard' ? 'Tổng quan tài chính' : 'Tất cả giao dịch'}</h1>
          </div>
          <div className="topbar-actions">
            <label className="month-picker">
              <span className="sr-only">Chọn tháng</span>
              <input type="month" value={month} onChange={(event) => setMonth(event.target.value)} />
            </label>
            <button className="icon-button" aria-label="Thông báo"><Bell size={19} /></button>
            <button className="button primary" onClick={() => setModal({ transaction: null })}><Plus size={18} /> Giao dịch mới</button>
          </div>
        </header>

        {error && (
          <div className="error-banner" role="alert">
            <span>{error}</span>
            <button onClick={() => void loadData()}><RefreshCw size={16} /> Thử lại</button>
          </div>
        )}

        {loading && !dashboard ? (
          <div className="page-loader"><span /><p>Đang tải dữ liệu...</p></div>
        ) : view === 'dashboard' ? (
          <div className="dashboard-view">
            <section className="hero-grid">
              <article className="balance-card">
                <span className="glow glow-one" />
                <span className="glow glow-two" />
                <div className="balance-top">
                  <div><p>Số dư hiện tại</p><small>Tính trên toàn bộ giao dịch</small></div>
                  <span className="wallet-icon"><WalletCards size={21} /></span>
                </div>
                <strong>{formatMoney(dashboard?.balance ?? 0)}</strong>
                <div className="balance-actions">
                  <button onClick={() => setModal({ transaction: null, initialType: 'INCOME' })}><ArrowDownLeft size={17} /> Thêm khoản thu</button>
                  <button onClick={() => setModal({ transaction: null, initialType: 'EXPENSE' })}><ArrowUpRight size={17} /> Thêm khoản chi</button>
                </div>
              </article>

              <div className="stat-stack">
                <article className="stat-card">
                  <span className="stat-icon income"><ArrowDownLeft size={20} /></span>
                  <div><p>Thu {formatMonth(month).toLowerCase()}</p><strong className="income-text">{formatMoney(dashboard?.monthIncome ?? 0)}</strong></div>
                </article>
                <article className="stat-card">
                  <span className="stat-icon expense"><ArrowUpRight size={20} /></span>
                  <div><p>Chi {formatMonth(month).toLowerCase()}</p><strong>{formatMoney(dashboard?.monthExpense ?? 0)}</strong></div>
                </article>
              </div>
            </section>

            <section className="content-grid">
              <article className="panel breakdown-panel">
                <div className="panel-header">
                  <div><p className="eyebrow">Phân tích</p><h2>Chi tiêu theo danh mục</h2></div>
                  <span>{formatMonth(month)}</span>
                </div>
                <div className="breakdown-list">
                  {dashboard?.expenseBreakdown.length ? dashboard.expenseBreakdown.map((item) => (
                    <div className="breakdown-row" key={item.category.id}>
                      <span className="category-icon" style={{ color: item.category.color, background: `${item.category.color}18` }}><CategoryIcon name={item.category.icon} /></span>
                      <div className="breakdown-info">
                        <div><strong>{item.category.name}</strong><span>{formatMoney(item.amount)}</span></div>
                        <div className="bar-track"><span style={{ width: `${Math.max(4, item.amount / maxBreakdown * 100)}%`, background: item.category.color }} /></div>
                      </div>
                    </div>
                  )) : <div className="mini-empty">Chưa có khoản chi trong tháng này.</div>}
                </div>
              </article>

              <article className="panel insight-panel">
                <p className="eyebrow">Dòng tiền tháng</p>
                <h2>{formatMoney((dashboard?.monthIncome ?? 0) - (dashboard?.monthExpense ?? 0))}</h2>
                <p>Số tiền còn lại sau khi trừ chi tiêu trong {formatMonth(month).toLowerCase()}.</p>
                <div className="donut" style={{ '--income': `${dashboard?.monthIncome ? Math.max(4, 100 - (dashboard.monthExpense / dashboard.monthIncome) * 100) : 0}%` } as React.CSSProperties}>
                  <span><strong>{dashboard?.monthIncome ? Math.max(0, Math.round((1 - dashboard.monthExpense / dashboard.monthIncome) * 100)) : 0}%</strong><small>còn lại</small></span>
                </div>
              </article>
            </section>

            <section className="panel recent-panel">
              <div className="panel-header">
                <div><p className="eyebrow">Dữ liệu mới nhất</p><h2>Giao dịch gần đây</h2></div>
                <button className="text-button" onClick={() => navigate('transactions')}>Xem tất cả <ChevronRight size={16} /></button>
              </div>
              {table(dashboard?.recentTransactions ?? [])}
            </section>
          </div>
        ) : (
          <section className="transactions-view panel">
            <div className="transaction-toolbar">
              <div className="search-box">
                <Search size={18} />
                <input value={search} onChange={(event) => setSearch(event.target.value)} placeholder="Tìm theo ghi chú hoặc danh mục..." />
                {search && <button onClick={() => setSearch('')} aria-label="Xóa tìm kiếm"><X size={17} /></button>}
              </div>
              <div className="filter-tabs">
                {([
                  ['ALL', 'Tất cả'],
                  ['INCOME', 'Khoản thu'],
                  ['EXPENSE', 'Khoản chi'],
                ] as const).map(([value, label]) => (
                  <button key={value} className={filter === value ? 'active' : ''} onClick={() => setFilter(value)}>{label}</button>
                ))}
              </div>
              <button className="button secondary" onClick={() => void loadData()}><RefreshCw size={16} /> Làm mới</button>
            </div>
            <div className="table-summary"><strong>{total} giao dịch</strong><span>Dữ liệu được sắp xếp mới nhất trước</span></div>
            {table(transactions)}
          </section>
        )}
      </main>

      {modal && (
        <TransactionModal
          categories={categories}
          transaction={modal.transaction}
          initialType={modal.initialType}
          onClose={() => setModal(null)}
          onSaved={afterSaved}
        />
      )}

      {deleteTarget && (
        <div className="modal-backdrop" role="presentation" onMouseDown={() => setDeleteTarget(null)}>
          <section className="confirm-dialog" role="alertdialog" aria-modal="true" onMouseDown={(event) => event.stopPropagation()}>
            <span className="delete-icon"><Trash2 size={24} /></span>
            <h2>Xóa giao dịch?</h2>
            <p>Bạn sắp xóa <strong>{deleteTarget.category.name}</strong> trị giá <strong>{formatMoney(deleteTarget.amount)}</strong>. Thao tác này không thể hoàn tác.</p>
            <div className="modal-actions">
              <button className="button ghost" onClick={() => setDeleteTarget(null)}>Hủy</button>
              <button className="button danger-button" disabled={deleting} onClick={() => void removeTransaction()}>{deleting ? 'Đang xóa...' : 'Xóa giao dịch'}</button>
            </div>
          </section>
        </div>
      )}
    </div>
  );
}
