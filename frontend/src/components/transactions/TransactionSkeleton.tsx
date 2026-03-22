interface TransactionSkeletonProps {
  groupCount?: number;
}

// Predefined row counts per group to give a natural feel (cycles through 3, 2, 3, 2, ...)
const ROW_COUNTS = [3, 2, 3, 2, 3];

export function TransactionSkeleton({ groupCount = 3 }: TransactionSkeletonProps) {
  return (
    <div data-testid="transaction-skeleton" className="space-y-4">
      {Array.from({ length: groupCount }, (_, groupIndex) => {
        const rowCount = ROW_COUNTS[groupIndex % ROW_COUNTS.length];
        return (
          <div
            key={groupIndex}
            data-testid="skeleton-group"
            className="rounded-xl border border-white/[0.06] bg-surface p-4 space-y-3"
          >
            {/* Date header skeleton */}
            <div
              data-testid="skeleton-date-header"
              className="skeleton h-4 w-28 rounded-lg"
            />

            {/* Row skeletons */}
            {Array.from({ length: rowCount }, (_, rowIndex) => (
              <div
                key={rowIndex}
                data-testid="skeleton-row"
                className="flex items-center gap-3"
              >
                {/* Category icon circle */}
                <div
                  data-testid="skeleton-circle"
                  className="skeleton w-10 h-10 rounded-full shrink-0"
                />

                {/* Merchant + amount bars */}
                <div className="flex flex-1 items-center justify-between">
                  <div
                    data-testid="skeleton-bar"
                    className="skeleton h-3.5 w-32 rounded-lg"
                  />
                  <div
                    data-testid="skeleton-bar"
                    className="skeleton h-3.5 w-16 rounded-lg"
                  />
                </div>
              </div>
            ))}
          </div>
        );
      })}
    </div>
  );
}
