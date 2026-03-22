# Installments Page — Design Override

> Inherits all tokens from `MASTER.md`. Only deviations and page-specific rules documented here.

## Layout Structure

```
Page
├── Header row (h1 "Installments" + toggle "Show completed" + "Add Installment" btn-primary)
├── InstallmentSummaryBar (3-col stat grid)
├── InstallmentCardGroup[] (one per credit card, staggered)
│   ├── Group header (card color dot + card name + subtotal)
│   └── Card container (divided InstallmentRow items)
│       └── InstallmentRow (icon + name/notes + badge + amount + progress + actions)
├── InstallmentEmptyState (when no installments)
├── InstallmentSkeleton (when loading)
├── Modal (create/edit form)
└── ConfirmDialog (delete confirmation)
```

## Page Header

```
flex items-center justify-between
├── h1: font-display text-2xl font-bold text-[#f0ece4]
└── div.flex.items-center.gap-4
    ├── ToggleSwitch + "Show completed" label (text-sm text-[#a8a29e])
    │   Persist to localStorage key: installments-showCompleted
    └── button.btn-primary "Add Installment"
```

## InstallmentSummaryBar

3-column grid: `grid-cols-1 sm:grid-cols-3 gap-4`

| Stat | Label | Value Style |
|------|-------|-------------|
| Monthly Total | `text-xs font-medium uppercase tracking-wider text-[#6b6560]` | `font-mono text-2xl tabular-nums text-gold-400` |
| Active | same label style | `font-mono text-2xl tabular-nums text-[#f0ece4]` |
| Completed | same label style | `font-mono text-2xl tabular-nums text-[#f0ece4]` |

Each stat card: `bg-surface rounded-xl border border-white/[0.06] p-5 shadow-lg shadow-black/20`

## InstallmentCardGroup

**Animation:** `motion-safe:animate-slide-up` with `animationDelay: {index * 50}ms`, `animationFillMode: backwards`

**Group header:**
```
flex items-center justify-between mb-2.5
├── div.flex.items-center.gap-3
│   ├── div.w-4.h-4.rounded-full (backgroundColor: cardColor)
│   └── h3.text-xs.font-medium.uppercase.tracking-wider.text-[#6b6560]
└── span.text-sm.font-mono.tabular-nums.text-[#a8a29e] "Subtotal: ฿X,XXX"
```

**Card container:**
```
bg-surface rounded-xl border border-white/[0.06] shadow-lg shadow-black/20 overflow-hidden divide-y divide-white/[0.06]
```

## InstallmentRow

```
group flex items-center gap-3 px-3 py-2.5 rounded-lg hover:bg-white/[0.03] transition-colors
├── Category icon circle (40x40 rounded-full, category.color at 15% opacity bg)
│   └── CategoryIcon (h-5 w-5, color: category.color)
├── Center column (flex-1 min-w-0)
│   ├── div.flex.items-center.gap-2
│   │   ├── span.text-sm.font-medium.text-[#f0ece4].truncate (name)
│   │   └── CategoryBadge size="sm"
│   └── span.text-xs.text-[#6b6560] (notes, if present)
├── Monthly amount: font-mono tabular-nums font-semibold text-[#f0ece4] text-sm
├── Progress section
│   ├── Bar: w-24 bg-surface-alt rounded-full h-2
│   │   └── Fill: bg-gold-400 (active) or bg-profit-400 (completed)
│   └── Fraction: text-sm font-medium text-[#a8a29e] or text-profit-400 (completed)
└── Action buttons (opacity-100 md:opacity-0 md:group-hover:opacity-100 transition-opacity)
    ├── +1 button: p-1.5 rounded-md bg-[#1a1a2e] text-profit-400 (hidden when complete)
    ├── Edit button: p-1.5 rounded-md bg-[#1a1a2e] text-[#d4a853]
    └── Delete button: p-1.5 rounded-md bg-[#1a1a2e] text-[#dc2626]
```

**Completed state:** Row gets `opacity-60` class.

## Progress Bar Thresholds

| State | Bar Color | Fraction Color |
|-------|-----------|----------------|
| In progress (< 100%) | `bg-gold-400` | `text-[#a8a29e]` |
| Completed (current >= total) | `bg-profit-400` | `text-profit-400` |

## InstallmentSkeleton

```
div.space-y-4 data-testid="installment-skeleton"
├── Summary skeleton: grid-cols-3, each card with label bar + value bar
└── Group skeletons (default 2, cycling row counts [3, 2])
    ├── Header: dot skeleton + name bar + subtotal bar
    └── Rows: circle (40px) + name bar (w-32) + amount bar (w-16) + progress bar (w-24)
```

Uses `.skeleton` shimmer class from global styles.

## InstallmentEmptyState

```
bg-surface rounded-xl border border-white/[0.06] p-6 shadow-lg shadow-black/20 text-center py-12
├── SVG wallet icon (48x48, text-[#6b6560], aria-hidden)
├── h3.text-sm.font-medium.text-[#f0ece4] "No installments yet"
├── p.text-sm.text-[#6b6560].mt-1 "Add your installment purchases to track payment progress."
└── button.btn-primary.mt-4 "Add Installment" → onAddInstallment
```

## Components

| Component | File | Props |
|-----------|------|-------|
| InstallmentSummaryBar | `components/installments/InstallmentSummaryBar.tsx` | `monthlyTotal, activeCount, completedCount` |
| InstallmentRow | `components/installments/InstallmentRow.tsx` | `installment, onIncrement, onEdit, onDelete, isIncrementPending?` |
| InstallmentCardGroup | `components/installments/InstallmentCardGroup.tsx` | `cardName, cardColor, installments, index, onIncrement, onEdit, onDelete, isIncrementPending?` |
| InstallmentSkeleton | `components/installments/InstallmentSkeleton.tsx` | `groupCount?` |
| InstallmentEmptyState | `components/installments/InstallmentEmptyState.tsx` | `onAddInstallment` |

## Accessibility

- Progress bar: `role="progressbar"` with `aria-valuenow`, `aria-valuemin=0`, `aria-valuemax=100`
- Action buttons: `aria-label="Mark next payment"`, `aria-label="Edit"`, `aria-label="Delete"`
- Toggle: uses ToggleSwitch with `role="switch"` and `aria-checked`
- Empty state icon: `aria-hidden="true"`
- Summary stats: `<dl>` with `<dt>` labels and `<dd>` values
