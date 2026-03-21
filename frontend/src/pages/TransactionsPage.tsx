import { useState } from 'react';
import { Link } from 'react-router-dom';
import { useTransactions, useDeleteTransaction } from '../hooks/useTransactions';
import { useCards } from '../hooks/useCards';
import { useCategories } from '../hooks/useCategories';
import { LoadingSpinner, ErrorMessage, ConfirmDialog } from '../components/common';
import { CategoryBadge } from '../components/CategoryBadge';
import { formatTHB, formatDate } from '../lib/format';
import type { Transaction, TransactionFilters } from '../types';

export default function TransactionsPage() {
  const [filters, setFilters] = useState<TransactionFilters>({});
  const [transactionToDelete, setTransactionToDelete] = useState<Transaction | null>(null);

  const { data: transactions, isLoading, error, refetch } = useTransactions(filters);
  const { data: cards } = useCards();
  const { data: categories } = useCategories();
  const deleteTransaction = useDeleteTransaction();

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-12">
        <LoadingSpinner size="lg" />
      </div>
    );
  }

  if (error) {
    return (
      <ErrorMessage
        message={error instanceof Error ? error.message : 'Failed to load transactions'}
        onRetry={() => refetch()}
      />
    );
  }

  const handleDelete = async () => {
    if (!transactionToDelete) return;
    const idToDelete = transactionToDelete.id;
    setTransactionToDelete(null); // Close dialog first
    try {
      await deleteTransaction.mutateAsync(idToDelete);
    } catch {
      // Error handled by mutation
    }
  };

  const clearFilters = () => {
    setFilters({});
  };

  const hasFilters = Object.values(filters).some((v) => v !== undefined && v !== '');

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-[#f0ece4]">Transactions</h1>
        <Link to="/transactions/new" className="btn-primary">
          Add Transaction
        </Link>
      </div>

      {/* Filters */}
      <div className="card">
        <div className="flex flex-wrap gap-4">
          <div className="flex-1 min-w-[200px]">
            <label htmlFor="search" className="label">
              Search
            </label>
            <input
              id="search"
              type="text"
              placeholder="Search merchant..."
              value={filters.search || ''}
              onChange={(e) => setFilters({ ...filters, search: e.target.value || undefined })}
              className="input-field"
            />
          </div>

          <div className="w-48">
            <label htmlFor="card" className="label">
              Card
            </label>
            <select
              id="card"
              value={filters.cardId || ''}
              onChange={(e) => setFilters({ ...filters, cardId: e.target.value || undefined })}
              className="input-field"
            >
              <option value="">All cards</option>
              {cards?.map((card) => (
                <option key={card.id} value={card.id}>
                  {card.name}
                </option>
              ))}
            </select>
          </div>

          <div className="w-48">
            <label htmlFor="categoryId" className="label">
              Category
            </label>
            <select
              id="categoryId"
              value={filters.categoryId || ''}
              onChange={(e) =>
                setFilters({ ...filters, categoryId: e.target.value || undefined })
              }
              className="input-field"
            >
              <option value="">All categories</option>
              {categories?.map((cat) => (
                <option key={cat.id} value={cat.id}>
                  {cat.label}
                </option>
              ))}
            </select>
          </div>

          <div className="w-40">
            <label htmlFor="startDate" className="label">
              From
            </label>
            <input
              id="startDate"
              type="date"
              value={filters.startDate || ''}
              onChange={(e) => setFilters({ ...filters, startDate: e.target.value || undefined })}
              className="input-field"
            />
          </div>

          <div className="w-40">
            <label htmlFor="endDate" className="label">
              To
            </label>
            <input
              id="endDate"
              type="date"
              value={filters.endDate || ''}
              onChange={(e) => setFilters({ ...filters, endDate: e.target.value || undefined })}
              className="input-field"
            />
          </div>

          {hasFilters && (
            <div className="flex items-end">
              <button onClick={clearFilters} className="btn-secondary">
                Clear
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Transactions List */}
      {transactions && transactions.length > 0 ? (
        <div className="card overflow-hidden p-0">
          <table className="min-w-full divide-y divide-white/[0.06]">
            <thead className="bg-surface-alt">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-[#6b6560] uppercase tracking-wider">
                  Date
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-[#6b6560] uppercase tracking-wider">
                  Merchant
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-[#6b6560] uppercase tracking-wider">
                  Category
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-[#6b6560] uppercase tracking-wider">
                  Card
                </th>
                <th className="px-6 py-3 text-right text-xs font-medium text-[#6b6560] uppercase tracking-wider">
                  Amount
                </th>
                <th className="px-6 py-3 text-right text-xs font-medium text-[#6b6560] uppercase tracking-wider">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="bg-surface divide-y divide-white/[0.06]">
              {transactions.map((transaction) => (
                <tr key={transaction.id} className="hover:bg-surface-alt">
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-[#f0ece4]">
                    {formatDate(transaction.date)}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm font-medium text-[#f0ece4]">{transaction.merchant}</div>
                    {transaction.tags.length > 0 && (
                      <div className="flex gap-1 mt-1">
                        {transaction.tags.map((tag) => (
                          <span
                            key={tag.id}
                            className="inline-flex items-center px-2 py-0.5 text-xs font-medium bg-surface-alt text-[#a8a29e] rounded"
                          >
                            {tag.name}
                          </span>
                        ))}
                      </div>
                    )}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    {transaction.category && (
                      <CategoryBadge category={transaction.category} />
                    )}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-[#6b6560]">
                    {transaction.card?.name || 'Unknown'}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-[#f0ece4] text-right font-medium">
                    {formatTHB(transaction.amount)}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                    <Link
                      to={`/transactions/${transaction.id}/edit`}
                      className="text-gold-400 hover:text-gold-300 mr-3"
                    >
                      Edit
                    </Link>
                    <button
                      onClick={() => setTransactionToDelete(transaction)}
                      className="text-red-400 hover:text-red-300"
                    >
                      Delete
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      ) : (
        <div className="card text-center py-12">
          <svg
            className="mx-auto h-12 w-12 text-[#6b6560]"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={1}
              d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2"
            />
          </svg>
          <h3 className="mt-2 text-sm font-medium text-[#f0ece4]">No transactions</h3>
          <p className="mt-1 text-sm text-[#6b6560]">
            {hasFilters ? 'No transactions match your filters.' : 'Get started by adding your first transaction.'}
          </p>
          {!hasFilters && (
            <div className="mt-6">
              <Link to="/transactions/new" className="btn-primary">
                Add Transaction
              </Link>
            </div>
          )}
        </div>
      )}

      <ConfirmDialog
        isOpen={!!transactionToDelete}
        onClose={() => setTransactionToDelete(null)}
        onConfirm={handleDelete}
        title="Delete Transaction"
        message={`Are you sure you want to delete this transaction at "${transactionToDelete?.merchant}"?`}
        confirmText="Delete"
        isLoading={deleteTransaction.isPending}
      />
    </div>
  );
}
