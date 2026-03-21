export function SkeletonDashboard() {
  return (
    <div className="space-y-6 animate-fade-in">
      {/* Header skeleton */}
      <div className="flex items-center justify-between flex-wrap gap-4">
        <div className="space-y-2">
          <div className="skeleton h-5 w-40" />
          <div className="skeleton h-8 w-56" />
        </div>
        <div className="flex items-center gap-3">
          <div className="skeleton h-10 w-48 rounded-lg" />
          <div className="skeleton h-10 w-36 rounded-lg" />
        </div>
      </div>

      {/* Summary cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 lg:gap-6">
        {Array.from({ length: 4 }).map((_, i) => (
          <div key={i} className="card space-y-3">
            <div className="skeleton h-4 w-28" />
            <div className="skeleton h-9 w-36" />
            <div className="skeleton h-4 w-24" />
          </div>
        ))}
      </div>

      {/* Charts row */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="card">
          <div className="skeleton h-5 w-36 mb-4" />
          <div className="space-y-3">
            {Array.from({ length: 4 }).map((_, i) => (
              <div key={i} className="space-y-2">
                <div className="flex justify-between">
                  <div className="skeleton h-4 w-24" />
                  <div className="skeleton h-4 w-20" />
                </div>
                <div className="skeleton h-2 w-full rounded-full" />
              </div>
            ))}
          </div>
        </div>
        <div className="card">
          <div className="skeleton h-5 w-40 mb-4" />
          <div className="skeleton h-56 w-full rounded-xl" />
        </div>
      </div>

      {/* Insights row */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="card">
          <div className="skeleton h-5 w-36 mb-4" />
          <div className="skeleton h-48 w-full rounded-xl" />
        </div>
        <div className="card">
          <div className="skeleton h-5 w-40 mb-4" />
          <div className="space-y-3">
            {Array.from({ length: 4 }).map((_, i) => (
              <div key={i} className="flex items-center justify-between py-2">
                <div className="flex items-center gap-3">
                  <div className="skeleton h-8 w-8 rounded-lg" />
                  <div className="space-y-1.5">
                    <div className="skeleton h-4 w-28" />
                    <div className="skeleton h-3 w-20" />
                  </div>
                </div>
                <div className="skeleton h-5 w-20" />
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Cards section */}
      <div className="card">
        <div className="skeleton h-5 w-48 mb-4" />
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {Array.from({ length: 3 }).map((_, i) => (
            <div key={i} className="p-4 rounded-xl bg-surface-alt border border-white/[0.06] space-y-3">
              <div className="skeleton h-5 w-32" />
              <div className="skeleton h-3 w-40" />
              <div className="skeleton h-3 w-28" />
              <div className="space-y-2 pt-2">
                <div className="skeleton h-3 w-full" />
                <div className="skeleton h-3 w-full" />
              </div>
              <div className="skeleton h-9 w-full rounded-lg" />
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
