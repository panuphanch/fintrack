# Financial Tracker — Design System

Global design tokens and rules. All pages inherit from this file unless a page-specific override exists in `pages/`.

## Color Palette

### Core
| Token | Hex | Usage |
|-------|-----|-------|
| `dark` | `#09090f` | Page background |
| `surface` | `#13131f` | Cards, panels |
| `surface-alt` | `#1a1a2e` | Nested surfaces, inputs |
| `surface-elevated` | `#222238` | Tooltips, popovers, elevated panels |

### Brand
| Token | Hex | Usage |
|-------|-----|-------|
| `gold-300` | `#e9bf4b` | Hover/active accent |
| `gold-400` | `#d4a853` | Primary accent, CTAs, active nav |
| `gold-500` | `#c49a3a` | Pressed state |

### Semantic Status
| Token | Hex | Usage |
|-------|-----|-------|
| `trust-400` | `#2563EB` | Informational, installments |
| `profit-400` | `#059669` | Positive, fixed costs, paid |
| `warning-400` | `#d97706` | Caution, budget 50-80% |
| `danger-400` | `#dc2626` | Over-budget, overdue, destructive |

### Text
| Role | Value | Usage |
|------|-------|-------|
| Primary | `#f0ece4` | Headings, values |
| Secondary | `#a8a29e` | Labels, descriptions |
| Muted | `#6b6560` | Tertiary info, timestamps |
| Border | `rgba(255,255,255,0.06)` | Card borders, dividers |

## Typography

| Role | Font | Weights |
|------|------|---------|
| Display | Plus Jakarta Sans | 600, 700 |
| Body | Inter | 400, 500, 600 |
| Mono | JetBrains Mono | 400, 500, 700 |

### Scale
12px (xs) · 13px (sm) · 14px (sm) · 16px (base) · 18px (lg) · 24px (2xl) · 30px (3xl)

### Rules
- All monetary values: `font-mono tabular-nums`
- Headings: `font-display font-bold`
- Labels: `text-sm font-medium text-[#a8a29e]`

## Spacing

4px base unit. Scale: 4 · 8 · 12 · 16 · 24 · 32 · 48.

| Context | Value |
|---------|-------|
| Card padding | `p-6` (24px) |
| Section gap | `gap-6` (24px) |
| Inner card gap | `gap-4` (16px) |
| Compact list items | `py-2.5` |

## Elevation / Shadows

| Level | Token | Usage |
|-------|-------|-------|
| Base | `shadow-lg shadow-black/20` | Cards |
| Glow (sm) | `shadow-glow-sm` | Default buttons |
| Glow | `shadow-glow` | Hovered buttons |
| Glow (lg) | `shadow-glow-lg` | Featured elements |

Formula: `0 0 {size}px rgba(212, 168, 83, {opacity})`

## Border Radius

- Cards: `rounded-xl` (12px)
- Buttons/inputs: `rounded-lg` (8px)
- Pills/badges: `rounded-full`
- Inner elements: `rounded-lg` (8px)

## Animation

| Token | Value | Usage |
|-------|-------|-------|
| `shimmer` | 2s infinite linear | Skeleton loading |
| `fade-in` | 0.2s ease-out | Element appearance |
| `slide-up` | 0.3s ease-out | Staggered entrance |
| Transitions | `duration-200` | Hover/focus states |

Respect `prefers-reduced-motion`.

## Component Patterns

### `.card`
```
bg-surface rounded-xl border border-white/[0.06] p-6 shadow-lg shadow-black/20
```

### `.btn-primary`
Gold background, dark text, glow shadow on hover.

### `.btn-secondary`
Surface-alt background, bordered, muted text.

### `.input-field`
Surface-alt background, white/10 border, gold focus ring.

## Icons

SVG stroke icons, 1.5-2px stroke width, consistent 20x20 or 24x24 sizing. No emoji as structural icons.

## Responsive Breakpoints

| Name | Width | Usage |
|------|-------|-------|
| Mobile | < 768px | Single column, bottom nav |
| Tablet | 768px (`md:`) | 2-column grids |
| Desktop | 1024px (`lg:`) | Sidebar nav, 3-4 column grids |

## Accessibility

- Text contrast: 4.5:1 minimum (AA) against `#13131f`
- Touch targets: 44x44px minimum
- Focus rings: `focus-visible:ring-2 focus-visible:ring-gold-400/50`
- Skip link: present in Layout
- All interactive elements keyboard-accessible
