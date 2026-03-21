# Dashboard — Page Design Overrides

Inherits from `../MASTER.md`. Only deviations are documented here.

## Layout Structure

```
GreetingHeader        (full width)
SummaryCard x 4       (grid: 2 cols mobile, 4 cols desktop)
BudgetProgress + SpendingChart  (grid: 1 col mobile, 2 cols desktop)
SpendingTrend + UpcomingPayments  (grid: 1 col mobile, 2 cols desktop)
CardBillingCard grid  (1 → 2 → 3 cols)
RecentTransactions    (full width)
```

## Chart Colors

| Data Series | Color | Token |
|-------------|-------|-------|
| Transactions | `#d4a853` | gold-400 |
| Installments | `#2563EB` | trust-400 |
| Fixed Costs | `#059669` | profit-400 |

## Budget Bar Thresholds

| Usage % | Color | Token |
|---------|-------|-------|
| 0-50% | Green | `profit-400` |
| 50-80% | Amber | `warning-400` |
| 80-100% | Red | `danger-400` |
| >100% | Red + pulse | `danger-400` + `animate-pulse` |

## Card Urgency Colors

| Status | Border Color |
|--------|-------------|
| Paid | `profit-400/30` |
| Overdue | `danger-400/40` |
| Due within 3 days | `warning-400/30` |
| Normal | `white/[0.06]` |

## Summary Card "Total Expenses"

Highlighted variant: `bg-gradient-to-br from-gold-400/15 to-gold-600/5 border-gold-400/20`

## Loading State

Full skeleton dashboard matching grid layout. Uses `.skeleton` class with shimmer animation.

## Empty States

Each section has its own empty state with:
- Muted icon (optional)
- Descriptive text
- CTA link to the relevant page
