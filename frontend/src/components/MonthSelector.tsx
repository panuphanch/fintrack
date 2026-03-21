import { addMonths, subMonths, parseISO, format } from 'date-fns';

interface MonthSelectorProps {
  value: string;  // YYYY-MM format
  onChange: (month: string) => void;
  label?: string;
}

export function MonthSelector({ value, onChange, label = 'Payment Due' }: MonthSelectorProps) {
  const date = parseISO(`${value}-01`);
  const displayMonth = format(date, 'MMMM yyyy');

  const handlePrevious = () => {
    const prevMonth = subMonths(date, 1);
    onChange(format(prevMonth, 'yyyy-MM'));
  };

  const handleNext = () => {
    const nextMonth = addMonths(date, 1);
    onChange(format(nextMonth, 'yyyy-MM'));
  };

  return (
    <div className="flex items-center gap-3 bg-surface border border-white/[0.06] px-4 py-2 rounded-lg">
      <span className="text-sm text-[#a8a29e]">{label}:</span>
      <button
        onClick={handlePrevious}
        className="p-1 hover:bg-surface-alt rounded transition-colors"
        aria-label="Previous month"
      >
        <svg
          className="w-5 h-5 text-[#a8a29e] hover:text-gold-400"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M15 19l-7-7 7-7"
          />
        </svg>
      </button>
      <span className="font-medium text-[#f0ece4] min-w-[140px] text-center">
        {displayMonth}
      </span>
      <button
        onClick={handleNext}
        className="p-1 hover:bg-surface-alt rounded transition-colors"
        aria-label="Next month"
      >
        <svg
          className="w-5 h-5 text-[#a8a29e] hover:text-gold-400"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M9 5l7 7-7 7"
          />
        </svg>
      </button>
    </div>
  );
}
