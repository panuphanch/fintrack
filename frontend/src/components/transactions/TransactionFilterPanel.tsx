import { useState, useEffect, useRef, useCallback } from 'react';
import type { TransactionFilters, CreditCard, Category } from '../../types';

interface TransactionFilterPanelProps {
  filters: TransactionFilters;
  onFilterChange: (filters: TransactionFilters) => void;
  cards: CreditCard[];
  categories: Category[];
}

export default function TransactionFilterPanel({
  filters,
  onFilterChange,
  cards,
  categories,
}: TransactionFilterPanelProps) {
  const [isExpanded, setIsExpanded] = useState(false);
  const [searchValue, setSearchValue] = useState(filters.search || '');
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  // Sync search from external filter changes
  useEffect(() => {
    setSearchValue(filters.search || '');
  }, [filters.search]);

  const handleSearchChange = useCallback(
    (value: string) => {
      setSearchValue(value);
      if (debounceRef.current) clearTimeout(debounceRef.current);
      debounceRef.current = setTimeout(() => {
        onFilterChange({ ...filters, search: value || undefined });
      }, 300);
    },
    [filters, onFilterChange]
  );

  useEffect(() => {
    return () => { if (debounceRef.current) clearTimeout(debounceRef.current); };
  }, []);

  const handleFilterChange = (key: keyof TransactionFilters, value: string | undefined) => {
    onFilterChange({ ...filters, [key]: value || undefined });
  };

  const clearAllFilters = () => {
    onFilterChange({});
  };

  // Compute active filter pills
  const activeFilterPills: { key: keyof TransactionFilters; label: string }[] = [];
  if (filters.cardId) {
    const card = cards.find((c) => c.id === filters.cardId);
    if (card) activeFilterPills.push({ key: 'cardId', label: card.name });
  }
  if (filters.categoryId) {
    const cat = categories.find((c) => c.id === filters.categoryId);
    if (cat) activeFilterPills.push({ key: 'categoryId', label: cat.label });
  }
  if (filters.startDate) {
    activeFilterPills.push({ key: 'startDate', label: `From ${filters.startDate}` });
  }
  if (filters.endDate) {
    activeFilterPills.push({ key: 'endDate', label: `To ${filters.endDate}` });
  }

  const activeCount = activeFilterPills.length;

  return (
    <div className="space-y-3">
      {/* Top bar: search + filters toggle */}
      <div className="flex items-center gap-3">
        <button
          type="button"
          onClick={() => setIsExpanded(!isExpanded)}
          aria-expanded={isExpanded}
          aria-label="Filters"
          className="flex items-center gap-2 px-4 py-2.5 bg-surface rounded-lg border border-white/[0.06] text-sm text-[#a8a29e] hover:bg-surface-alt transition-colors focus-visible:ring-2 focus-visible:ring-gold-400/50 focus-visible:outline-none"
        >
          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2} aria-hidden="true">
            <path d="M22 3H2l8 9.46V19l4 2v-8.54L22 3z" />
          </svg>
          Filters
          {activeCount > 0 && !isExpanded && (
            <span className="bg-gold-400 text-[#09090f] text-xs font-semibold rounded-full w-5 h-5 flex items-center justify-center">
              {activeCount}
            </span>
          )}
        </button>

        <div className="flex-1">
          <input
            type="text"
            placeholder="Search transactions…"
            name="search"
            autoComplete="off"
            value={searchValue}
            onChange={(e) => handleSearchChange(e.target.value)}
            className="input-field w-full"
          />
        </div>
      </div>

      {/* Expandable filter panel */}
      {isExpanded && (
        <div className="bg-surface rounded-xl border border-white/[0.06] p-4 shadow-lg shadow-black/20">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <div>
              <label htmlFor="filter-card" className="label">
                Card
              </label>
              <select
                id="filter-card"
                value={filters.cardId || ''}
                onChange={(e) => handleFilterChange('cardId', e.target.value)}
                className="input-field"
              >
                <option value="">All cards</option>
                {cards.map((card) => (
                  <option key={card.id} value={card.id}>
                    {card.name}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label htmlFor="filter-category" className="label">
                Category
              </label>
              <select
                id="filter-category"
                value={filters.categoryId || ''}
                onChange={(e) => handleFilterChange('categoryId', e.target.value)}
                className="input-field"
              >
                <option value="">All categories</option>
                {categories.map((cat) => (
                  <option key={cat.id} value={cat.id}>
                    {cat.label}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label htmlFor="filter-start" className="label">
                From
              </label>
              <input
                id="filter-start"
                type="date"
                value={filters.startDate || ''}
                onChange={(e) => handleFilterChange('startDate', e.target.value)}
                className="input-field"
              />
            </div>

            <div>
              <label htmlFor="filter-end" className="label">
                To
              </label>
              <input
                id="filter-end"
                type="date"
                value={filters.endDate || ''}
                onChange={(e) => handleFilterChange('endDate', e.target.value)}
                className="input-field"
              />
            </div>
          </div>
        </div>
      )}

      {/* Active filter pills */}
      {activeFilterPills.length > 0 && (
        <div className="flex flex-wrap items-center gap-2">
          {activeFilterPills.map((pill) => (
            <span
              key={pill.key}
              className="inline-flex items-center gap-1.5 px-3 py-1 bg-gold-400/15 border border-gold-400/30 text-gold-400 rounded-full text-xs font-medium"
            >
              {pill.label}
              <button
                type="button"
                onClick={() => handleFilterChange(pill.key, undefined)}
                aria-label={`Remove ${pill.label} filter`}
                className="opacity-60 hover:opacity-100 transition-opacity"
              >
                <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2} aria-hidden="true">
                  <path d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </span>
          ))}
          <button
            type="button"
            onClick={clearAllFilters}
            className="text-xs text-[#6b6560] hover:text-[#a8a29e] transition-colors"
          >
            Clear all
          </button>
        </div>
      )}
    </div>
  );
}
