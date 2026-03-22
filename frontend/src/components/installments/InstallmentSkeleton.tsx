interface InstallmentSkeletonProps {
  groupCount?: number;
}

const ROW_COUNTS = [3, 2, 3, 2];

export function InstallmentSkeleton({ groupCount = 2 }: InstallmentSkeletonProps) {
  return (
    <div data-testid="installment-skeleton" className="space-y-6">
      {/* Summary bar skeleton */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        {Array.from({ length: 3 }, (_, i) => (
          <div
            key={i}
            data-testid="skeleton-summary-card"
            className="bg-surface rounded-xl border border-white/[0.06] p-5 shadow-lg shadow-black/20 space-y-2"
          >
            <div className="skeleton h-3 w-20 rounded-lg" />
            <div className="skeleton h-7 w-28 rounded-lg" />
          </div>
        ))}
      </div>

      {/* Group skeletons */}
      {Array.from({ length: groupCount }, (_, groupIndex) => {
        const rowCount = ROW_COUNTS[groupIndex % ROW_COUNTS.length];
        return (
          <div key={groupIndex} data-testid="skeleton-group" className="space-y-2.5">
            {/* Group header skeleton */}
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="skeleton w-4 h-4 rounded-full" />
                <div className="skeleton h-3 w-24 rounded-lg" />
              </div>
              <div className="skeleton h-3 w-20 rounded-lg" />
            </div>

            {/* Card container skeleton */}
            <div className="rounded-xl border border-white/[0.06] bg-surface overflow-hidden divide-y divide-white/[0.06]">
              {Array.from({ length: rowCount }, (_, rowIndex) => (
                <div
                  key={rowIndex}
                  data-testid="skeleton-row"
                  className="flex items-center gap-3 px-3 py-2.5"
                >
                  <div
                    data-testid="skeleton-circle"
                    className="skeleton w-10 h-10 rounded-full shrink-0"
                  />
                  <div className="flex flex-1 items-center justify-between gap-3">
                    <div
                      data-testid="skeleton-bar"
                      className="skeleton h-3.5 w-32 rounded-lg"
                    />
                    <div
                      data-testid="skeleton-bar"
                      className="skeleton h-3.5 w-16 rounded-lg"
                    />
                    <div
                      data-testid="skeleton-bar"
                      className="skeleton h-2 w-24 rounded-full"
                    />
                  </div>
                </div>
              ))}
            </div>
          </div>
        );
      })}
    </div>
  );
}
