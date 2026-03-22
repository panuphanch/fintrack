# Budgets — Page Design Overrides

Inherits from `../MASTER.md`. Only deviations are documented here.

## Layout Structure

```
Page header: "Budgets" h1 + "Show unbudgeted" checkbox (right-aligned)
Single card container with divided rows:
  ── Budgeted rows (sorted by category sortOrder) ──
  Row: [CategoryBadge md] [spent/limit mono] [progress bar h-2] [edit icon btn]
  ── "No budget set" section label ──
  ── Unbudgeted rows (toggled by checkbox) ──
  Row: [CategoryBadge md] [spent mono + "no limit" muted] [Set Budget gold text btn]
```

## Budget Bar Thresholds

| Usage % | Color | Token |
|---------|-------|-------|
| 0-50% | Green | `profit-400` |
| 50-80% | Amber | `warning-400` |
| 80-100% | Red | `danger-400` |
| >100% | Red + pulse | `danger-400` + `animate-pulse` |

## Row Spacing

- Rows separated by `divide-y divide-white/[0.06]`
- Row padding: `py-4`
- Category badge width: `w-28` fixed
- Progress bar: `h-2 rounded-full` on `bg-surface-alt` track

## Monetary Values

All amounts use `font-mono text-sm tabular-nums`.

## Unbudgeted Section

- Section label: `text-xs font-medium uppercase tracking-wider text-[#6b6560]`
- "Set Budget" action: `text-gold-400 hover:text-gold-300`
- "no limit" label: `text-xs text-[#6b6560]`

## Modal

- Reuses shared `Modal` component
- Edit modal includes "Remove Budget" destructive link (bottom-left)
- Confirm removal via `ConfirmDialog`

## Show/Hide Toggle

- `showUnbudgeted` persisted to `localStorage` key `budgets-show-unbudgeted`
- Default: shown (true)
