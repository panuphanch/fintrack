import { useState, useEffect, useRef } from 'react';
import { Link } from 'react-router-dom';
import { useInfiniteTransactions, useDeleteTransaction } from '../hooks/useTransactions';
import { useCards } from '../hooks/useCards';
import { useCategories } from '../hooks/useCategories';
import { ErrorMessage, ConfirmDialog } from '../components/common';
import { TransactionSkeleton } from '../components/transactions/TransactionSkeleton';
import TransactionSummaryBar from '../components/transactions/TransactionSummaryBar';
import TransactionFilterPanel from '../components/transactions/TransactionFilterPanel';
import TransactionDateGroup from '../components/transactions/TransactionDateGroup';
import TransactionEmptyState from '../components/transactions/TransactionEmptyState';
import { groupTransactionsByDate } from '../lib/groupTransactionsByDate';
import type { Transaction, TransactionFilters } from '../types';

export default function TransactionsPage() {
  const [filters, setFilters] = useState<TransactionFilters>({});
  const [transactionToDelete, setTransactionToDelete] = useState<Transaction | null>(null);

  const {
    data,
    isLoading,
    error,
    refetch,
    fetchNextPage,
    hasNextPage,
    isFetchingNextPage,
  } = useInfiniteTransactions(filters);

  const { data: cards } = useCards();
  const { data: categories } = useCategories();
  const deleteTransaction = useDeleteTransaction();

  // Flatten pages into single array
  const allTransactions = data?.pages.flatMap((p) => p.data) ?? [];
  const dateGroups = groupTransactionsByDate(allTransactions);
  const hasFilters = Object.values(filters).some((v) => v !== undefined && v !== '');

  // Infinite scroll via IntersectionObserver
  const sentinelRef = useRef<HTMLDivElement>(null);
  useEffect(() => {
    const sentinel = sentinelRef.current;
    if (!sentinel) return;

    const observer = new IntersectionObserver((entries) => {
      if (entries[0].isIntersecting && hasNextPage && !isFetchingNextPage) {
        fetchNextPage();
      }
    });

    observer.observe(sentinel);
    return () => observer.disconnect();
  }, [hasNextPage, isFetchingNextPage, fetchNextPage]);

  const handleDelete = async () => {
    if (!transactionToDelete) return;
    const idToDelete = transactionToDelete.id;
    setTransactionToDelete(null);
    try {
      await deleteTransaction.mutateAsync(idToDelete);
    } catch {
      // Error handled by mutation
    }
  };

  const clearFilters = () => {
    setFilters({});
  };

  // Loading state
  if (isLoading) {
    return (
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <h1 className="font-display text-2xl font-bold text-[#f0ece4]">Transactions</h1>
        </div>
        <TransactionSkeleton />
      </div>
    );
  }

  // Error state
  if (error) {
    return (
      <ErrorMessage
        message={error instanceof Error ? error.message : 'Failed to load transactions'}
        onRetry={() => refetch()}
      />
    );
  }

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex items-center justify-between">
        <h1 className="font-display text-2xl font-bold text-[#f0ece4]">Transactions</h1>
        <Link to="/transactions/new" className="btn-primary">
          Add Transaction
        </Link>
      </div>

      {/* Summary Stats */}
      {allTransactions.length > 0 && (
        <TransactionSummaryBar transactions={allTransactions} />
      )}

      {/* Filter Panel */}
      <TransactionFilterPanel
        filters={filters}
        onFilterChange={setFilters}
        cards={cards ?? []}
        categories={categories ?? []}
      />

      {/* Transaction Timeline */}
      {dateGroups.length > 0 ? (
        <div className="space-y-6">
          {dateGroups.map((group, index) => (
            <TransactionDateGroup
              key={group.dateKey}
              group={group}
              index={index}
              onDelete={setTransactionToDelete}
            />
          ))}

          {/* Infinite scroll sentinel */}
          <div ref={sentinelRef} className="h-4" />

          {/* Loading more indicator */}
          {isFetchingNextPage && (
            <div className="flex justify-center py-4">
              <div className="flex items-center gap-2 text-[#6b6560] text-sm" role="status" aria-live="polite">
                <div className="w-4 h-4 border-2 border-[#6b6560] border-t-gold-400 rounded-full animate-spin" aria-hidden="true" />
                Loading more…
              </div>
            </div>
          )}
        </div>
      ) : (
        <TransactionEmptyState hasFilters={hasFilters} onClearFilters={clearFilters} />
      )}

      {/* Delete Confirmation */}
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
