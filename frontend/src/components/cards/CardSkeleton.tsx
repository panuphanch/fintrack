interface CardSkeletonProps {
  count?: number;
}

export function CardSkeleton({ count = 3 }: CardSkeletonProps) {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      {Array.from({ length: count }, (_, i) => (
        <div
          key={i}
          data-testid="card-skeleton"
          className="card aspect-[86/54] overflow-hidden relative"
        >
          <div className="skeleton absolute inset-0" />
          <div className="relative p-6 flex flex-col justify-between h-full">
            {/* Chip + bank */}
            <div className="flex items-start justify-between">
              <div className="flex items-center gap-3">
                <div className="w-10 h-7 rounded bg-white/[0.06]" />
                <div className="w-16 h-3 rounded bg-white/[0.06]" />
              </div>
            </div>
            {/* Card number */}
            <div className="w-48 h-4 rounded bg-white/[0.06] mx-auto" />
            {/* Bottom row */}
            <div className="flex items-end justify-between">
              <div className="space-y-1.5">
                <div className="w-24 h-4 rounded bg-white/[0.06]" />
                <div className="w-16 h-3 rounded bg-white/[0.06]" />
              </div>
              <div className="space-y-1.5 text-right">
                <div className="w-20 h-4 rounded bg-white/[0.06] ml-auto" />
                <div className="w-24 h-3 rounded bg-white/[0.06] ml-auto" />
              </div>
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}
