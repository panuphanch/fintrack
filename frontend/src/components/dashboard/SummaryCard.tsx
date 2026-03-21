import { Link } from 'react-router-dom';
import { formatTHB } from '../../lib/format';

interface SummaryCardProps {
  title: string;
  value: number;
  icon: React.ReactNode;
  color: 'gold' | 'emerald' | 'blue' | 'default';
  linkTo?: string;
  linkText?: string;
  subtitle?: string;
  isHighlighted?: boolean;
}

const colorMap = {
  gold: 'text-gold-400',
  emerald: 'text-emerald-400',
  blue: 'text-trust-400',
  default: 'text-[#f0ece4]',
};

export function SummaryCard({
  title,
  value,
  icon,
  color,
  linkTo,
  linkText,
  subtitle,
  isHighlighted,
}: SummaryCardProps) {
  return (
    <div
      className={`card transition-all duration-200 hover:border-white/[0.12] ${
        isHighlighted
          ? 'bg-gradient-to-br from-gold-400/15 to-gold-600/5 border-gold-400/20'
          : ''
      }`}
    >
      <div className="flex items-start justify-between mb-2">
        <h3 className={`text-sm font-medium ${isHighlighted ? 'text-gold-300' : 'text-[#a8a29e]'}`}>
          {title}
        </h3>
        <span className={`${colorMap[color]} opacity-60`}>
          {icon}
        </span>
      </div>
      <p className={`text-2xl lg:text-3xl font-bold font-mono tabular-nums ${colorMap[color]}`}>
        {formatTHB(value)}
      </p>
      {subtitle && (
        <p className="mt-1 text-sm text-[#6b6560]">{subtitle}</p>
      )}
      {linkTo && linkText && (
        <Link
          to={linkTo}
          className="mt-1 inline-block text-sm text-gold-400 hover:text-gold-300 transition-colors"
        >
          {linkText}
        </Link>
      )}
    </div>
  );
}
