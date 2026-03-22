export function SettingsSkeleton() {
  return (
    <div data-testid="settings-skeleton" className="space-y-6">
      {/* Profile skeleton */}
      <div
        data-testid="skeleton-profile"
        className="bg-surface rounded-xl border border-white/[0.06] p-6 shadow-lg shadow-black/20"
      >
        <div className="skeleton h-3 w-16 rounded-lg mb-4" />
        <div className="flex items-center gap-4">
          <div data-testid="skeleton-circle" className="skeleton w-12 h-12 rounded-full shrink-0" />
          <div className="space-y-2">
            <div data-testid="skeleton-bar" className="skeleton h-4 w-32 rounded-lg" />
            <div data-testid="skeleton-bar" className="skeleton h-3 w-48 rounded-lg" />
          </div>
        </div>
      </div>

      {/* Household skeleton */}
      <div
        data-testid="skeleton-household"
        className="bg-surface rounded-xl border border-white/[0.06] p-6 shadow-lg shadow-black/20"
      >
        <div className="flex items-center justify-between mb-4">
          <div className="skeleton h-3 w-24 rounded-lg" />
          <div className="skeleton h-8 w-28 rounded-lg" />
        </div>
        <div className="divide-y divide-white/[0.06]">
          {Array.from({ length: 2 }, (_, i) => (
            <div key={i} data-testid="skeleton-member-row" className="flex items-center gap-3 py-4">
              <div data-testid="skeleton-circle" className="skeleton w-10 h-10 rounded-full shrink-0" />
              <div className="space-y-2">
                <div data-testid="skeleton-bar" className="skeleton h-3.5 w-24 rounded-lg" />
                <div data-testid="skeleton-bar" className="skeleton h-3 w-36 rounded-lg" />
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Categories skeleton */}
      <div
        data-testid="skeleton-categories"
        className="bg-surface rounded-xl border border-white/[0.06] p-6 shadow-lg shadow-black/20"
      >
        <div className="flex items-center justify-between mb-4">
          <div className="skeleton h-3 w-24 rounded-lg" />
          <div className="skeleton h-8 w-28 rounded-lg" />
        </div>
        <div className="skeleton h-3 w-64 rounded-lg mb-4" />
        <div className="divide-y divide-white/[0.06]">
          {Array.from({ length: 4 }, (_, i) => (
            <div key={i} data-testid="skeleton-category-row" className="flex items-center gap-3 px-3 py-3">
              <div className="skeleton w-1 h-8 rounded-full" />
              <div data-testid="skeleton-circle" className="skeleton w-5 h-5 rounded-full shrink-0" />
              <div className="flex-1 space-y-1.5">
                <div data-testid="skeleton-bar" className="skeleton h-3.5 w-28 rounded-lg" />
                <div data-testid="skeleton-bar" className="skeleton h-2.5 w-20 rounded-lg" />
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
