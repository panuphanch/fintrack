# Transactions — Page Design Overrides

Inherits from `../MASTER.md`. Only deviations are documented here.

## Layout Structure

```
Page header: "Transactions" h1 + "Add Transaction" btn-primary (right-aligned)
TransactionSummaryBar (3-col grid: Total Spent, Count, Average)
TransactionFilterPanel (collapsible: search + filters toggle + pills)
Date-grouped timeline:
  ── "Today" section label ──
  Card container with TransactionRow items (divided)
  ── "Yesterday" section label ──
  Card container with TransactionRow items (divided)
  ── "This Week" / "Earlier This Month" / "Older" ──
  ...
Infinite scroll sentinel + loading indicator
```

## Summary Stats Bar

- 3-column grid: `grid-cols-1 sm:grid-cols-3`
- Each stat: `.card` pattern with label + value
- Labels: `text-xs font-medium uppercase tracking-wider text-[#6b6560]`
- Values: `font-mono text-2xl tabular-nums text-[#f0ece4]`
- Stats react to active filters (computed from visible transactions)

## Filter Panel

- Collapsed default: "Filters" button + search input in a flex row
- Expanded: card with 4-column grid (Card, Category, From, To)
- Active filter count badge: `bg-gold-400 text-[#09090f]` rounded-full on Filters button
- Active filter pills: `bg-gold-400/15 border-gold-400/30 text-gold-400 rounded-full`
- "Clear all" link: `text-xs text-[#6b6560]`
- Search is debounced at 300ms

## Date Group Headers

- Label: `text-xs font-medium uppercase tracking-wider text-[#6b6560]`
- Relative groups: Today, Yesterday, This Week, Earlier This Month, Older
- Card container: `bg-surface rounded-xl border border-white/[0.06] divide-y divide-white/[0.06]`

## Transaction Row

- Category icon: `w-10 h-10 rounded-full` with `{category.color}26` background
- Merchant: `text-sm font-medium text-[#f0ece4]`
- Category badge: `CategoryBadge size="sm"`
- Card info: `text-xs text-[#6b6560]` — "{name} ····{lastFour}"
- Tags: `bg-[#1a1a2e] rounded px-1.5 py-0.5 text-xs text-[#a8a29e]`
- Amount: `font-mono tabular-nums font-semibold text-[#f0ece4] text-sm`
- Actions: `opacity-100 md:opacity-0 md:group-hover:opacity-100`
  - Edit: `bg-[#1a1a2e] text-[#d4a853]` icon button
  - Delete: `bg-[#1a1a2e] text-[#dc2626]` icon button

## Staggered Animation

- Each date group: `animate-slide-up` with `animation-delay: {index * 50}ms`
- `animationFillMode: backwards` to prevent flash
- Respects `prefers-reduced-motion` via `motion-safe:` prefix

## Skeleton Loading

- 3 skeleton groups (default)
- Each group: date header bar + 2-3 row skeletons
- Row: circle (40px, category icon) + two bars (merchant + amount)
- Uses `.skeleton` shimmer class

## Infinite Scroll

- IntersectionObserver on sentinel div at bottom of list
- Fetches next page (20 items) when sentinel enters viewport
- Loading indicator: spinner + "Loading more..." text

## Empty States

- No transactions + no filters: clipboard icon + "No transactions yet" + "Add Transaction" CTA
- With filters: clipboard icon + "No transactions match your filters" + "Clear Filters" button

## Monetary Values

All amounts use `font-mono tabular-nums`.
