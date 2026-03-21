import { useState, useMemo } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';
import { useBillingCycleSummary, useMonthlyTrend } from '../hooks/useAnalytics';
import { useMarkCardPaid } from '../hooks/useCards';
import { useTransactions } from '../hooks/useTransactions';
import { useInstallments, useInstallmentsMonthlyTotal } from '../hooks/useInstallments';
import { useFixedCosts, useFixedCostsMonthlyTotal } from '../hooks/useFixedCosts';
import { useBudgets } from '../hooks/useBudgets';
import { ErrorMessage } from '../components/common';
import { getDefaultPaymentMonth, getCurrentMonth } from '../lib/format';
import {
  GreetingHeader,
  SummaryCard,
  BudgetProgress,
  SpendingChart,
  SpendingTrend,
  CardBillingCard,
  UpcomingPayments,
  RecentTransactions,
  SkeletonDashboard,
} from '../components/dashboard';
import type { ViewMode } from '../types';

export default function DashboardPage() {
  const [paymentMonth, setPaymentMonth] = useState(getDefaultPaymentMonth);
  const [includeInstallments, setIncludeInstallments] = useState(true);
  const [_viewMode] = useState<ViewMode>('household');
  const currentMonth = getCurrentMonth();

  // All hooks called before conditional returns
  const { user } = useAuth();
  const { data: billingSummary, isLoading: summaryLoading, error: summaryError } = useBillingCycleSummary(paymentMonth);
  const { data: transactions, isLoading: transactionsLoading } = useTransactions({ startDate: `${currentMonth}-01` });
  const { data: installments, isLoading: installmentsLoading } = useInstallments(true);
  const { data: installmentsTotal } = useInstallmentsMonthlyTotal();
  const { data: fixedCosts } = useFixedCosts(true);
  const { data: fixedCostsTotal } = useFixedCostsMonthlyTotal();
  const { data: budgets } = useBudgets();
  const { data: trendData } = useMonthlyTrend(6);
  const markCardPaid = useMarkCardPaid();

  const pieData = useMemo(() => {
    if (!billingSummary?.byCategory) return [];
    return billingSummary.byCategory
      .filter((cat) => cat.amount > 0)
      .map((cat) => ({ name: cat.categoryLabel, value: cat.amount, color: cat.categoryColor }))
      .sort((a, b) => b.value - a.value);
  }, [billingSummary]);

  const recentTransactions = useMemo(() => transactions?.slice(0, 5) || [], [transactions]);
  const isLoading = summaryLoading || transactionsLoading || installmentsLoading;

  if (isLoading) return <SkeletonDashboard />;
  if (summaryError) {
    return <ErrorMessage message={summaryError instanceof Error ? summaryError.message : 'Failed to load dashboard'} />;
  }

  const transactionCount = billingSummary?.cards.reduce((sum, c) => sum + c.transactionCount, 0) || 0;

  return (
    <div className="space-y-6">
      <GreetingHeader
        user={user}
        paymentMonth={paymentMonth}
        onMonthChange={setPaymentMonth}
        includeInstallments={includeInstallments}
        onIncludeInstallmentsChange={setIncludeInstallments}
      />

      {/* Summary KPIs */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 lg:gap-6">
        <SummaryCard
          title="Installments"
          value={installmentsTotal?.total || 0}
          color="gold"
          linkTo="/installments"
          linkText="View all"
          icon={<svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M17 9V7a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2m2 4h10a2 2 0 002-2v-6a2 2 0 00-2-2H9a2 2 0 00-2 2v6a2 2 0 002 2zm7-5a2 2 0 11-4 0 2 2 0 014 0z" /></svg>}
        />
        <SummaryCard
          title="Fixed Costs"
          value={fixedCostsTotal?.total || 0}
          color="emerald"
          linkTo="/fixed-costs"
          linkText="View all"
          icon={<svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 7h6m0 10v-3m-3 3h.01M9 17h.01M9 14h.01M12 14h.01M15 11h.01M12 11h.01M9 11h.01M7 21h10a2 2 0 002-2V5a2 2 0 00-2-2H7a2 2 0 00-2 2v14a2 2 0 002 2z" /></svg>}
        />
        <SummaryCard
          title="Transactions"
          value={billingSummary?.totals.transactions || 0}
          color="default"
          subtitle={`${transactionCount} transactions`}
          icon={<svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-3 7h3m-3 4h3m-6-4h.01M9 16h.01" /></svg>}
        />
        <SummaryCard
          title="Total Expenses"
          value={billingSummary?.totals.grandTotal || 0}
          color="gold"
          subtitle="All commitments"
          isHighlighted
          icon={<svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>}
        />
      </div>

      {/* Analytics row */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <BudgetProgress budgets={budgets || []} />
        <SpendingChart data={pieData} includeInstallments={includeInstallments} />
      </div>

      {/* Insights row */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <SpendingTrend data={trendData || []} />
        <UpcomingPayments installments={installments || []} fixedCosts={fixedCosts || []} />
      </div>

      {/* Card billing */}
      <section>
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-display font-bold text-[#f0ece4]">
            Cards — {billingSummary?.paymentMonthDisplay || ''}
            {includeInstallments && <span className="text-sm font-normal text-[#6b6560] ml-2">(incl. installments)</span>}
          </h2>
          <Link to="/cards/new" className="text-sm text-gold-400 hover:text-gold-300 transition-colors">
            Add card
          </Link>
        </div>
        {billingSummary?.cards && billingSummary.cards.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {billingSummary.cards.map((card) => (
              <CardBillingCard
                key={card.cardId}
                card={card}
                includeInstallments={includeInstallments}
                onMarkPaid={(cardId) => markCardPaid.mutate({ cardId, paymentMonth })}
                isPaying={markCardPaid.isPending}
              />
            ))}
          </div>
        ) : (
          <div className="card py-8 text-center">
            <p className="text-sm text-[#6b6560] mb-2">No cards added yet</p>
            <Link to="/cards/new" className="text-sm text-gold-400 hover:text-gold-300">
              Add your first card
            </Link>
          </div>
        )}
      </section>

      {/* Recent activity */}
      <RecentTransactions transactions={recentTransactions} />
    </div>
  );
}
