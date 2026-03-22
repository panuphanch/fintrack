interface InstallmentEmptyStateProps {
  onAddInstallment: () => void;
}

export default function InstallmentEmptyState({ onAddInstallment }: InstallmentEmptyStateProps) {
  return (
    <div className="bg-[#13131f] rounded-xl border border-white/[0.06] p-6 shadow-lg shadow-black/20 text-center py-12">
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
        <path d="M17 9V7a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2m2 4h10a2 2 0 002-2v-6a2 2 0 00-2-2H9a2 2 0 00-2 2v6a2 2 0 002 2zm7-5a2 2 0 11-4 0 2 2 0 014 0z" />
      </svg>

      <h3 className="text-sm font-medium text-[#f0ece4]">
        No installments yet
      </h3>
      <p className="text-sm text-[#6b6560] mt-1">
        Add your installment purchases to track payment progress.
      </p>
      <button
        onClick={onAddInstallment}
        className="mt-4 inline-flex items-center px-4 py-2 rounded-lg text-sm font-medium bg-[#c4a44a] text-[#13131f] hover:bg-[#d4b45a] transition-colors focus-visible:ring-2 focus-visible:ring-gold-400/50 focus-visible:outline-none"
      >
        Add Installment
      </button>
    </div>
  );
}
