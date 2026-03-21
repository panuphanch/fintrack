import { render, screen } from '@testing-library/react';
import { SpendingTrend } from '../SpendingTrend';

// Mock Recharts
vi.mock('recharts', () => ({
  BarChart: ({ children }: any) => <div data-testid="bar-chart">{children}</div>,
  Bar: () => <div />,
  XAxis: () => <div />,
  YAxis: () => <div />,
  Tooltip: () => <div />,
  ResponsiveContainer: ({ children }: any) => <div>{children}</div>,
  Legend: () => <div />,
}));

const trendData = [
  { month: '2026-01', transactions: 5000, installments: 2000, fixedCosts: 3000, total: 10000 },
  { month: '2026-02', transactions: 6000, installments: 2000, fixedCosts: 3000, total: 11000 },
  { month: '2026-03', transactions: 4000, installments: 2000, fixedCosts: 3000, total: 9000 },
];

describe('SpendingTrend', () => {
  it('should render chart with data', () => {
    render(<SpendingTrend data={trendData} />);
    expect(screen.getByText('Spending Trend')).toBeInTheDocument();
    expect(screen.getByTestId('bar-chart')).toBeInTheDocument();
  });

  it('should render empty state with less than 2 months', () => {
    render(<SpendingTrend data={[trendData[0]]} />);
    expect(screen.getByText('Need at least 2 months of data')).toBeInTheDocument();
  });

  it('should render empty state with empty data', () => {
    render(<SpendingTrend data={[]} />);
    expect(screen.getByText('Need at least 2 months of data')).toBeInTheDocument();
  });
});
