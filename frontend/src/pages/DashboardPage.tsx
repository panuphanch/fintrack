import { useState, useMemo } from 'react';
import { Link } from 'react-router-dom';
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip, Legend } from 'recharts';
import { useBillingCycleSummary } from '../hooks/useAnalytics';
import { useMarkCardPaid } from '../hooks/useCards';
import { useTransactions } from '../hooks/useTransactions';
import { useInstallments, useInstallmentsMonthlyTotal } from '../hooks/useInstallments';
import { useFixedCostsMonthlyTotal } from '../hooks/useFixedCosts';
import { LoadingSpinner, ErrorMessage } from '../components/common';
import { MonthSelector } from '../components/MonthSelector';
import { formatTHB, formatDate, getDefaultPaymentMonth, formatBillingPeriodDisplay, getCurrentMonth } from '../lib/format';

export default function DashboardPage() {
  const [paymentMonth, setPaymentMonth] = useState(getDefaultPaymentMonth);
  const [includeInstallments, setIncludeInstallments] = useState(true);
  const currentMonth = getCurrentMonth();

  const { data: billingSummary, isLoading: summaryLoading, error: summaryError } = useBillingCycleSummary(paymentMonth);
  const { data: transactions, isLoading: transactionsLoading } = useTransactions({
    startDate: `${currentMonth}-01`,
  });
  const { isLoading: installmentsLoading } = useInstallments(true);
  const { data: installmentsTotal } = useInstallmentsMonthlyTotal();
  const { data: fixedCostsTotal } = useFixedCostsMonthlyTotal();
  const markCardPaid = useMarkCardPaid();

  // Build pie chart data from billing summary
  const pieData = useMemo(() => {
    if (!billingSummary?.byCategory) return [];

    return billingSummary.byCategory
      .filter((cat) => cat.amount > 0)
      .map((cat) => ({
        name: cat.categoryLabel,
        value: cat.amount,
        color: cat.categoryColor,
      }))
      .sort((a, b) => b.value - a.value);
  }, [billingSummary]);

  // Recent transactions
  const recentTransactions = useMemo(() => {
    return transactions?.slice(0, 5) || [];
  }, [transactions]);

  const isLoading = summaryLoading || transactionsLoading || installmentsLoading;

  const handleMarkPaid = (cardId: string) => {
    markCardPaid.mutate({ cardId, paymentMonth });
  };

  // NOW we can have conditional returns
  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-12">
        <LoadingSpinner size="lg" />
      </div>
    );
  }

  if (summaryError) {
    return (
      <ErrorMessage
        message={summaryError instanceof Error ? summaryError.message : 'Failed to load dashboard'}
      />
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between flex-wrap gap-4">
        <h1 className="text-2xl font-display font-bold text-[#f0ece4]">Dashboard</h1>
        <div className="flex items-center gap-4 flex-wrap">
          <MonthSelector value={paymentMonth} onChange={setPaymentMonth} />
          <label className="flex items-center gap-2 text-sm text-[#a8a29e] bg-surface border border-white/[0.06] px-3 py-2 rounded-lg">
            <input
              type="checkbox"
              checked={includeInstallments}
              onChange={(e) => setIncludeInstallments(e.target.checked)}
            />
            Include installments
          </label>
          <Link to="/transactions/new" className="btn-primary">
            Add Transaction
          </Link>
        </div>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <div className="card">
          <h3 className="text-sm font-medium text-[#a8a29e]">Monthly Installments</h3>
          <p className="mt-2 text-3xl font-bold font-mono text-gold-400">
            {formatTHB(installmentsTotal?.total || 0)}
          </p>
          <Link to="/installments" className="mt-1 text-sm text-gold-400 hover:text-gold-300">
            View installments
          </Link>
        </div>

        <div className="card">
          <h3 className="text-sm font-medium text-[#a8a29e]">Monthly Fixed Costs</h3>
          <p className="mt-2 text-3xl font-bold font-mono text-emerald-400">
            {formatTHB(fixedCostsTotal?.total || 0)}
          </p>
          <Link to="/fixed-costs" className="mt-1 text-sm text-gold-400 hover:text-gold-300">
            View fixed costs
          </Link>
        </div>

        <div className="card">
          <h3 className="text-sm font-medium text-[#a8a29e]">Transaction Spending</h3>
          <p className="mt-2 text-3xl font-bold font-mono text-[#f0ece4]">
            {formatTHB(billingSummary?.totals.transactions || 0)}
          </p>
          <p className="mt-1 text-sm text-[#6b6560]">
            {billingSummary?.cards.reduce((sum, c) => sum + c.transactionCount, 0) || 0} transactions
          </p>
        </div>

        <div className="card bg-gradient-to-br from-gold-400/20 to-gold-600/10 border-gold-400/20">
          <h3 className="text-sm font-medium text-gold-300">Total Monthly Expenses</h3>
          <p className="mt-2 text-3xl font-bold font-mono text-gold-400">
            {formatTHB(billingSummary?.totals.grandTotal || 0)}
          </p>
          <p className="mt-1 text-sm text-[#a8a29e]">
            All commitments combined
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Spending by Category Chart */}
        <div className="card">
          <h3 className="text-lg font-display font-bold text-[#f0ece4] mb-4">
            Spending by Category
            {includeInstallments && <span className="text-sm font-normal text-[#6b6560] ml-2">(incl. installments)</span>}
          </h3>
          {pieData.length > 0 ? (
            <div className="h-64">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={pieData}
                    cx="50%"
                    cy="50%"
                    innerRadius={60}
                    outerRadius={80}
                    paddingAngle={2}
                    dataKey="value"
                  >
                    {pieData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip
                    formatter={(value: number) => formatTHB(value)}
                    contentStyle={{ background: '#222238', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '8px', color: '#f0ece4' }}
                    itemStyle={{ color: '#a8a29e' }}
                  />
                  <Legend wrapperStyle={{ color: '#a8a29e' }} />
                </PieChart>
              </ResponsiveContainer>
            </div>
          ) : (
            <div className="h-64 flex items-center justify-center text-[#6b6560]">
              No spending this period
            </div>
          )}
        </div>

        {/* Recent Transactions */}
        <div className="card">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-display font-bold text-[#f0ece4]">Recent Transactions</h3>
            <Link to="/transactions" className="text-sm text-gold-400 hover:text-gold-300">
              View all
            </Link>
          </div>
          {recentTransactions.length > 0 ? (
            <div className="space-y-3">
              {recentTransactions.map((transaction) => (
                <div
                  key={transaction.id}
                  className="flex items-center justify-between py-2 border-b border-white/[0.06] last:border-b-0"
                >
                  <div>
                    <p className="font-medium text-[#f0ece4]">{transaction.merchant}</p>
                    <p className="text-sm text-[#6b6560]">
                      {transaction.category?.label || 'Unknown'} • {formatDate(transaction.date)}
                    </p>
                  </div>
                  <p className="font-medium font-mono text-[#f0ece4]">{formatTHB(transaction.amount)}</p>
                </div>
              ))}
            </div>
          ) : (
            <div className="py-8 text-center text-[#6b6560]">
              <p>No transactions yet</p>
              <Link to="/transactions/new" className="text-gold-400 hover:text-gold-300">
                Add your first transaction
              </Link>
            </div>
          )}
        </div>
      </div>

      {/* Cards Overview with Billing Periods */}
      <div className="card">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-display font-bold text-[#f0ece4]">
            Cards - {billingSummary?.paymentMonthDisplay || 'Loading...'}
            {includeInstallments && <span className="text-sm font-normal text-[#6b6560] ml-2">(incl. installments)</span>}
          </h3>
          <Link to="/cards/new" className="text-sm text-gold-400 hover:text-gold-300">
            Add card
          </Link>
        </div>
        {billingSummary?.cards && billingSummary.cards.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {billingSummary.cards.map((card) => {
              const totalCardSpending = includeInstallments
                ? card.totalAmount
                : card.transactionAmount;

              return (
                <div
                  key={card.cardId}
                  className="p-4 rounded-xl bg-surface-alt border border-white/[0.06]"
                  style={{ borderLeftColor: card.cardColor, borderLeftWidth: '4px' }}
                >
                  <div className="flex items-center justify-between mb-2">
                    <div>
                      <p className="font-medium text-[#f0ece4]">{card.cardName}</p>
                      <p className="text-sm text-[#6b6560]">
                        {card.cardBank} •••• {card.cardLastFour}
                        {card.ownerName && ` (${card.ownerName})`}
                      </p>
                    </div>
                    <Link
                      to={`/cards/${card.cardId}/edit`}
                      className="text-xs text-gold-400 hover:text-gold-300"
                    >
                      Edit
                    </Link>
                  </div>

                  <div className="text-xs text-[#6b6560] mb-3">
                    Billing: {formatBillingPeriodDisplay(card.billingPeriod.start, card.billingPeriod.end)}
                  </div>

                  <div className="space-y-1 mb-3">
                    <div className="flex justify-between text-sm">
                      <span className="text-[#6b6560]">Transactions</span>
                      <span className="text-[#a8a29e] font-mono">{formatTHB(card.transactionAmount)}</span>
                    </div>
                    {includeInstallments && card.installmentAmount > 0 && (
                      <div className="flex justify-between text-sm">
                        <span className="text-[#6b6560]">Installments</span>
                        <span className="text-[#a8a29e] font-mono">{formatTHB(card.installmentAmount)}</span>
                      </div>
                    )}
                    <div className="flex justify-between text-sm font-medium border-t border-white/[0.06] pt-1">
                      <span className="text-[#a8a29e]">Total</span>
                      <span className="text-[#f0ece4] font-mono">{formatTHB(totalCardSpending)}</span>
                    </div>
                  </div>

                  <button
                    onClick={() => handleMarkPaid(card.cardId)}
                    disabled={card.isPaid || markCardPaid.isPending}
                    className={`w-full py-2 px-4 rounded-lg text-sm font-medium transition-all ${
                      card.isPaid
                        ? 'bg-emerald-500/20 text-emerald-400 cursor-default'
                        : 'btn-primary'
                    }`}
                  >
                    {card.isPaid ? '✓ Paid' : markCardPaid.isPending ? 'Marking...' : 'Pay'}
                  </button>
                </div>
              );
            })}
          </div>
        ) : (
          <div className="py-8 text-center text-[#6b6560]">
            <p>No cards added yet</p>
            <Link to="/cards/new" className="text-gold-400 hover:text-gold-300">
              Add your first card
            </Link>
          </div>
        )}
      </div>
    </div>
  );
}
