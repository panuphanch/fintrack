import { render, screen } from '@testing-library/react';
import { SpendingChart } from '../SpendingChart';

// Mock Recharts to avoid canvas issues in tests
vi.mock('recharts', () => ({
  PieChart: ({ children }: any) => <div data-testid="pie-chart">{children}</div>,
  Pie: ({ children }: any) => <div>{children}</div>,
  Cell: () => <div />,
  ResponsiveContainer: ({ children }: any) => <div>{children}</div>,
  Tooltip: () => <div />,
  Legend: () => <div />,
}));

describe('SpendingChart', () => {
  it('should render chart with data', () => {
    render(
      <SpendingChart
        data={[
          { name: 'Food', value: 3000, color: '#ef4444' },
          { name: 'Travel', value: 1000, color: '#3b82f6' },
        ]}
        includeInstallments={false}
      />
    );
    expect(screen.getByText('Spending by Category')).toBeInTheDocument();
    expect(screen.getByTestId('pie-chart')).toBeInTheDocument();
  });

  it('should show installments label when included', () => {
    render(
      <SpendingChart
        data={[{ name: 'Food', value: 3000, color: '#ef4444' }]}
        includeInstallments={true}
      />
    );
    expect(screen.getByText('(incl. installments)')).toBeInTheDocument();
  });

  it('should render empty state', () => {
    render(<SpendingChart data={[]} includeInstallments={false} />);
    expect(screen.getByText('No spending this period')).toBeInTheDocument();
  });
});
