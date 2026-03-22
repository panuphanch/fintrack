# Cards — Page Design Overrides

Inherits from `../MASTER.md`. Only deviations are documented here.

## Layout Structure

```
Page header: "Credit Cards" h1 + "Add Card" btn-primary (right-aligned)
CardStats summary bar (full width card, 3-col grid)
Active cards grid (1 col mobile, 2 tablet, 3 desktop)
Inactive cards collapsible <details> section
```

## Credit Card Visual

Each card rendered as a miniature physical credit card face.

- Aspect ratio: `aspect-[86/54]` (ISO 7810 ID-1 standard)
- Background: `linear-gradient(135deg, {card.color}30, {card.color}10)` over `bg-surface`
- Glass shine overlay: `bg-gradient-to-br from-white/[0.08] to-transparent` on top-left quadrant
- Chip SVG: 24x24, `gold-400/60`, positioned top-left
- Card number: `font-mono text-base tabular-nums tracking-[0.2em]`
  - Dots: `text-[#6b6560]`, lastFour: `text-[#f0ece4]`
- Border: `rounded-xl border border-white/[0.06] overflow-hidden`

### Card Face Layout

| Position | Content |
|----------|---------|
| Top-left | Chip SVG + bank name (text-xs, secondary) |
| Top-right | Edit/delete icons (hover-reveal on desktop, always visible mobile) |
| Center | `•••• •••• •••• {lastFour}` |
| Bottom-left | Card name (font-semibold, primary) + owner (text-xs, secondary) |
| Bottom-right | Credit limit (font-mono, gold-400) + "Cut {cutoffDay} / Due {dueDay}" (text-xs, muted) |

### Hover State

`transition-all duration-200 hover:-translate-y-1` + dynamic color glow shadow from card.color.

### Inactive Variant

`opacity-50 grayscale` + "Inactive" pill badge (`rounded-full bg-surface-alt text-xs text-[#a8a29e]`).

## Card Stats Bar

- Card pattern: `.card` with 3-column grid
- Stats: active count, total credit limit (formatTHB), owner names
- Label: `text-xs font-medium uppercase tracking-wider text-[#6b6560]`
- Values: `font-mono text-2xl tabular-nums`

## Inactive Section

- HTML `<details>` element for native accessible collapse
- `<summary>` styled with custom chevron SVG (rotates on open)
- Section label: `text-lg font-medium text-[#6b6560]`

## Staggered Animation

- Each card: `animate-slide-up` with `animation-delay: {index * 50}ms`
- Respects `prefers-reduced-motion`

## Skeleton Loading

- Matches card aspect ratio `aspect-[86/54]`
- 3 skeleton cards in grid layout
- Uses `.skeleton` shimmer class
- Internal skeleton lines for chip, number, name, limit

## Monetary Values

All amounts use `font-mono text-sm tabular-nums`.
