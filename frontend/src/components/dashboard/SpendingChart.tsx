import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip, Legend } from 'recharts';
import { formatTHB } from '../../lib/format';

interface ChartDataItem {
  name: string;
  value: number;
  color: string;
}

interface SpendingChartProps {
  data: ChartDataItem[];
  includeInstallments: boolean;
}

function CenterLabel({ viewBox, total }: { viewBox?: { cx: number; cy: number }; total: number }) {
  if (!viewBox) return null;
  const { cx, cy } = viewBox;
  return (
    <g>
      <text x={cx} y={cy - 8} textAnchor="middle" className="fill-[#6b6560] text-xs">
        Total
      </text>
      <text x={cx} y={cy + 14} textAnchor="middle" className="fill-[#f0ece4] text-sm font-bold" style={{ fontFamily: 'JetBrains Mono, monospace' }}>
        {formatTHB(total)}
      </text>
    </g>
  );
}

export function SpendingChart({ data, includeInstallments }: SpendingChartProps) {
  const total = data.reduce((sum, d) => sum + d.value, 0);

  return (
    <div className="card">
      <h2 className="text-lg font-display font-bold text-[#f0ece4] mb-4">
        Spending by Category
        {includeInstallments && (
          <span className="text-sm font-normal text-[#6b6560] ml-2">(incl. installments)</span>
        )}
      </h2>
      {data.length > 0 ? (
        <div className="h-64">
          <ResponsiveContainer width="100%" height="100%">
            <PieChart>
              <Pie
                data={data}
                cx="50%"
                cy="50%"
                innerRadius={60}
                outerRadius={82}
                paddingAngle={2}
                dataKey="value"
                strokeWidth={0}
              >
                {data.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={entry.color} />
                ))}
                <CenterLabel total={total} />
              </Pie>
              <Tooltip
                formatter={(value: number) => formatTHB(value)}
                contentStyle={{
                  background: '#222238',
                  border: '1px solid rgba(255,255,255,0.1)',
                  borderRadius: '8px',
                  color: '#f0ece4',
                  fontSize: '13px',
                }}
                itemStyle={{ color: '#a8a29e' }}
              />
              <Legend
                wrapperStyle={{ color: '#a8a29e', fontSize: '12px' }}
                iconSize={8}
              />
            </PieChart>
          </ResponsiveContainer>
        </div>
      ) : (
        <div className="h-64 flex items-center justify-center">
          <p className="text-sm text-[#6b6560]">No spending this period</p>
        </div>
      )}
    </div>
  );
}
