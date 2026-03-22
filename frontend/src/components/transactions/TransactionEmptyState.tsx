import { Link } from 'react-router-dom';

interface TransactionEmptyStateProps {
  hasFilters: boolean;
  onClearFilters: () => void;
}

export default function TransactionEmptyState({ hasFilters, onClearFilters }: TransactionEmptyStateProps) {
  return (
    <div className="bg-[#13131f] rounded-xl border border-white/[0.06] p-6 shadow-lg shadow-black/20 text-center py-12">
      {/* Clipboard SVG icon */}
      <svg
        xmlns="http://www.w3.org/2000/svg"
        width="48"
        height="48"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="1.5"
        strokeLinecap="round"
        strokeLinejoin="round"
        className="mx-auto text-[#6b6560] mb-4"
        aria-hidden="true"
      >
        <path d="M16 4h2a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2V6a2 2 0 0 1 2-2h2" />
        <rect x="8" y="2" width="8" height="4" rx="1" ry="1" />
      </svg>

      {hasFilters ? (
        <>
          <h3 className="text-sm font-medium text-[#f0ece4]">
            No transactions match your filters
          </h3>
          <p className="text-sm text-[#6b6560] mt-1">
            Try adjusting your filters or clear them to see all transactions.
          </p>
          <button
            onClick={onClearFilters}
            className="mt-4 inline-flex items-center px-4 py-2 rounded-lg text-sm font-medium bg-white/[0.06] border border-white/[0.06] text-[#f0ece4] hover:bg-white/[0.1] transition-colors focus-visible:ring-2 focus-visible:ring-gold-400/50 focus-visible:outline-none"
          >
            Clear Filters
          </button>
        </>
      ) : (
        <>
          <h3 className="text-sm font-medium text-[#f0ece4]">
            No transactions yet
          </h3>
          <p className="text-sm text-[#6b6560] mt-1">
            Get started by adding your first transaction.
          </p>
          <Link
            to="/transactions/new"
            className="mt-4 inline-flex items-center px-4 py-2 rounded-lg text-sm font-medium bg-[#c4a44a] text-[#13131f] hover:bg-[#d4b45a] transition-colors focus-visible:ring-2 focus-visible:ring-gold-400/50 focus-visible:outline-none"
          >
            Add Transaction
          </Link>
        </>
      )}
    </div>
  );
}
