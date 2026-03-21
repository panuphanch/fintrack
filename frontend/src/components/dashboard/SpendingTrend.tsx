import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, Legend } from 'recharts';
import { format, parseISO } from 'date-fns';
import { formatTHB } from '../../lib/format';
import type { MonthlyTrend } from '../../types';

interface SpendingTrendProps {
  data: MonthlyTrend[];
}

function formatMonthLabel(month: string): string {
  return format(parseISO(`${month}-01`), 'MMM');
}

function CustomTooltip({ active, payload, label }: {
  active?: boolean;
  payload?: Array<{ name: string; value: number; color: string }>;
  label?: string;
}) {
  if (!active || !payload) return null;
  const monthDisplay = label ? format(parseISO(`${label}-01`), 'MMMM yyyy') : '';
  const total = payload.reduce((sum, p) => sum + p.value, 0);

  return (
    <div className="bg-surface-elevated border border-white/10 rounded-lg px-3 py-2.5 shadow-lg text-sm">
      <p className="text-[#f0ece4] font-medium mb-1.5">{monthDisplay}</p>
      {payload.map((p) => (
        <div key={p.name} className="flex items-center justify-between gap-6 text-xs">
          <span className="flex items-center gap-1.5">
            <span className="w-2 h-2 rounded-full" style={{ backgroundColor: p.color }} />
            <span className="text-[#a8a29e]">{p.name}</span>
          </span>
          <span className="font-mono tabular-nums text-[#f0ece4]">{formatTHB(p.value)}</span>
        </div>
      ))}
      <div className="border-t border-white/[0.06] mt-1.5 pt-1.5 flex justify-between text-xs font-medium">
        <span className="text-[#a8a29e]">Total</span>
        <span className="font-mono tabular-nums text-gold-400">{formatTHB(total)}</span>
      </div>
    </div>
  );
}

export function SpendingTrend({ data }: SpendingTrendProps) {
  if (!data || data.length < 2) {
    return (
      <div className="card">
        <h2 className="text-lg font-display font-bold text-[#f0ece4] mb-4">Spending Trend</h2>
        <div className="h-48 flex items-center justify-center">
          <p className="text-sm text-[#6b6560]">Need at least 2 months of data</p>
        </div>
      </div>
    );
  }

  return (
    <div className="card">
      <h2 className="text-lg font-display font-bold text-[#f0ece4] mb-4">Spending Trend</h2>
      <div className="h-56">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={data} barCategoryGap="20%">
            <XAxis
              dataKey="month"
              tickFormatter={formatMonthLabel}
              tick={{ fill: '#6b6560', fontSize: 12 }}
              axisLine={{ stroke: 'rgba(255,255,255,0.06)' }}
              tickLine={false}
            />
            <YAxis
              tickFormatter={(v) => `${(v / 1000).toFixed(0)}k`}
              tick={{ fill: '#6b6560', fontSize: 11 }}
              axisLine={false}
              tickLine={false}
              width={45}
            />
            <Tooltip content={<CustomTooltip />} cursor={{ fill: 'rgba(255,255,255,0.03)' }} />
            <Legend
              wrapperStyle={{ fontSize: '12px', color: '#a8a29e' }}
              iconSize={8}
              iconType="circle"
            />
            <Bar
              dataKey="transactions"
              name="Transactions"
              stackId="a"
              fill="#d4a853"
              radius={[0, 0, 0, 0]}
            />
            <Bar
              dataKey="installments"
              name="Installments"
              stackId="a"
              fill="#2563EB"
              radius={[0, 0, 0, 0]}
            />
            <Bar
              dataKey="fixedCosts"
              name="Fixed Costs"
              stackId="a"
              fill="#059669"
              radius={[4, 4, 0, 0]}
            />
          </BarChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}
