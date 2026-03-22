import { formatTHB } from '../../lib/format';
import type { CreditCard } from '../../types';

interface CreditCardVisualProps {
  card: CreditCard;
  onEdit: (id: string) => void;
  onDelete: (card: CreditCard) => void;
  isInactive?: boolean;
  style?: React.CSSProperties;
}

function hexToRgb(hex: string): { r: number; g: number; b: number } {
  const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
  return result
    ? { r: parseInt(result[1], 16), g: parseInt(result[2], 16), b: parseInt(result[3], 16) }
    : { r: 59, g: 130, b: 246 }; // fallback blue
}

export function CreditCardVisual({
  card,
  onEdit,
  onDelete,
  isInactive = false,
  style,
}: CreditCardVisualProps) {
  const rgb = hexToRgb(card.color);
  const gradientBg = `linear-gradient(135deg, rgba(${rgb.r}, ${rgb.g}, ${rgb.b}, 0.25) 0%, rgba(${rgb.r}, ${rgb.g}, ${rgb.b}, 0.08) 100%)`;

  return (
    <div
      role="article"
      aria-label={`${card.name} credit card`}
      className={`
        relative aspect-[86/54] rounded-xl border border-white/[0.06] overflow-hidden
        shadow-lg shadow-black/20 transition-[transform,box-shadow] duration-200
        ${isInactive ? 'opacity-50 grayscale' : 'hover:-translate-y-1'}
        motion-safe:animate-slide-up
      `}
      style={{
        background: gradientBg,
        ...(!isInactive && {
          '--glow-color': `rgba(${rgb.r}, ${rgb.g}, ${rgb.b}, 0.2)`,
        } as React.CSSProperties),
        ...style,
      }}
      onMouseEnter={(e) => {
        if (!isInactive) {
          (e.currentTarget as HTMLElement).style.boxShadow = `0 0 24px rgba(${rgb.r}, ${rgb.g}, ${rgb.b}, 0.2)`;
        }
      }}
      onMouseLeave={(e) => {
        if (!isInactive) {
          (e.currentTarget as HTMLElement).style.boxShadow = '';
        }
      }}
    >
      {/* Glass shine overlay */}
      <div
        className="absolute inset-0 bg-gradient-to-br from-white/[0.08] via-white/[0.02] to-transparent pointer-events-none"
        aria-hidden="true"
      />

      {/* Card content */}
      <div className="relative p-5 flex flex-col justify-between h-full">
        {/* Top row: chip + bank + actions */}
        <div className="flex items-start justify-between">
          <div className="flex items-center gap-2.5">
            {/* EMV Chip SVG */}
            <svg
              width="32"
              height="24"
              viewBox="0 0 32 24"
              fill="none"
              className="text-gold-400/60"
              aria-hidden="true"
            >
              <rect
                x="1"
                y="1"
                width="30"
                height="22"
                rx="4"
                stroke="currentColor"
                strokeWidth="1.5"
                fill="currentColor"
                fillOpacity="0.15"
              />
              <line x1="1" y1="8" x2="31" y2="8" stroke="currentColor" strokeWidth="0.75" />
              <line x1="1" y1="16" x2="31" y2="16" stroke="currentColor" strokeWidth="0.75" />
              <line x1="16" y1="1" x2="16" y2="23" stroke="currentColor" strokeWidth="0.75" />
            </svg>
            <span className="text-xs text-[#a8a29e]">{card.bank}</span>
          </div>

          <div className="flex items-center gap-1.5">
            {isInactive && (
              <span className="px-2 py-0.5 text-xs font-medium text-[#a8a29e] bg-surface-alt rounded-full">
                Inactive
              </span>
            )}
            <button
              onClick={() => onEdit(card.id)}
              className="p-1.5 rounded-lg text-[#6b6560] hover:text-[#a8a29e] hover:bg-white/[0.06] transition-colors focus-visible:ring-2 focus-visible:ring-gold-400/50 focus-visible:outline-none"
              aria-label="Edit card"
            >
              <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"
                />
              </svg>
            </button>
            {!isInactive && (
              <button
                onClick={() => onDelete(card)}
                className="p-1.5 rounded-lg text-[#6b6560] hover:text-danger-400 hover:bg-white/[0.06] transition-colors focus-visible:ring-2 focus-visible:ring-gold-400/50 focus-visible:outline-none"
                aria-label="Delete card"
              >
                <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"
                  />
                </svg>
              </button>
            )}
          </div>
        </div>

        {/* Center: masked card number */}
        <div className="flex items-center justify-center">
          <p className="font-mono text-base tabular-nums tracking-[0.2em]">
            <span className="text-[#6b6560]">••••   ••••   ••••</span>
            {'   '}
            <span className="text-[#f0ece4]">{card.lastFour}</span>
          </p>
        </div>

        {/* Bottom row: name + limit */}
        <div className="flex items-end justify-between">
          <div className="min-w-0">
            <p className="text-sm font-semibold text-[#f0ece4] truncate">{card.name}</p>
            {card.owner && (
              <p className="text-xs text-[#a8a29e] mt-0.5">{card.owner.name}</p>
            )}
          </div>
          <div className="text-right flex-shrink-0 ml-3">
            <p className="font-mono text-sm tabular-nums text-gold-400">
              {formatTHB(card.creditLimit)}
            </p>
            <p className="text-xs text-[#6b6560] mt-0.5">
              Cut {card.cutoffDay} / Due {card.dueDay}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
