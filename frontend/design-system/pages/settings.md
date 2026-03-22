# Settings Page — Design Overrides

Inherits all tokens from `MASTER.md`. Overrides below.

## Layout

Single-column, max-width `max-w-4xl mx-auto`, `space-y-6` between sections.

### Sections (top to bottom)

1. **Page header**: `text-2xl font-display font-bold text-[#f0ece4]` — "Settings"
2. **Profile card**: User avatar + name + email
3. **Household card**: Member list + invite button
4. **Categories card**: Category list + add/edit/delete/reorder

No collapsible sections — all cards always visible (flat layout like other pages).

## Profile Section

- Card container: standard `.card` styling
- Section label: `text-xs font-medium uppercase tracking-wider text-[#6b6560]` — "PROFILE"
- Avatar: `h-12 w-12 rounded-full bg-gold-400/20 text-gold-400 font-display font-bold text-lg` with first initial
- Name: `text-lg font-medium text-[#f0ece4]`
- Email: `text-sm text-[#a8a29e]`
- Layout: `flex items-center gap-4`

## Household Section

- Card container with section label "HOUSEHOLD"
- Header row: label left, member count `text-sm text-[#a8a29e]`, "Invite Member" `btn-primary text-sm` right
- Member rows: `divide-y divide-white/[0.06]`
- Each row: `py-4 flex items-center gap-3 hover:bg-white/[0.03] transition-colors`
- Avatar: `h-10 w-10 rounded-full bg-gold-400/20 text-gold-400 font-display font-bold`
- "(You)" badge: `text-xs text-[#6b6560]`

## Categories Section

- Card container with section label "CATEGORIES"
- Header row: label + count + "Add Category" `btn-primary text-sm`
- Description: `text-sm text-[#a8a29e] mb-4`
- Category rows: `divide-y divide-white/[0.06]`
- Each row: `flex items-center justify-between px-3 py-3 group hover:bg-white/[0.03] transition-colors`
- Color indicator: `w-1 h-8 rounded-full` with `backgroundColor: category.color`
- Icon: `CategoryIcon` with `h-5 w-5`
- System badge: `px-2 py-0.5 text-xs bg-surface-elevated text-[#a8a29e] rounded`
- Action buttons: `opacity-100 md:opacity-0 md:group-hover:opacity-100 transition-opacity`
- Touch targets: `p-2` minimum for all buttons

## Skeleton

Three card skeletons stacked:
1. Profile: circle (48px) + 2 text bars
2. Household: 2 rows each with circle (40px) + 2 text bars
3. Categories: 4 rows each with small bar + circle + text bar

## Animations

- Each section card: `motion-safe:animate-slide-up` with staggered delay (0ms, 50ms, 100ms)
- Category rows: staggered within section at 50ms intervals
- `animationFillMode: 'backwards'`

## Empty States

- Categories empty: centered SVG icon (48x48, muted) + "No categories found" + "Add your first category" + CTA button
