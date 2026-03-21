import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { MonthSelector } from './MonthSelector';

describe('MonthSelector', () => {
  it('should display the formatted month', () => {
    render(<MonthSelector value="2025-03" onChange={() => {}} />);

    expect(screen.getByText('March 2025')).toBeInTheDocument();
  });

  it('should display the label', () => {
    render(<MonthSelector value="2025-03" onChange={() => {}} label="Billing Month" />);

    expect(screen.getByText('Billing Month:')).toBeInTheDocument();
  });

  it('should display default label', () => {
    render(<MonthSelector value="2025-03" onChange={() => {}} />);

    expect(screen.getByText('Payment Due:')).toBeInTheDocument();
  });

  it('should navigate to previous month', async () => {
    const onChange = vi.fn();
    render(<MonthSelector value="2025-03" onChange={onChange} />);

    await userEvent.click(screen.getByLabelText('Previous month'));

    expect(onChange).toHaveBeenCalledWith('2025-02');
  });

  it('should navigate to next month', async () => {
    const onChange = vi.fn();
    render(<MonthSelector value="2025-03" onChange={onChange} />);

    await userEvent.click(screen.getByLabelText('Next month'));

    expect(onChange).toHaveBeenCalledWith('2025-04');
  });

  it('should handle year boundary going back', async () => {
    const onChange = vi.fn();
    render(<MonthSelector value="2025-01" onChange={onChange} />);

    await userEvent.click(screen.getByLabelText('Previous month'));

    expect(onChange).toHaveBeenCalledWith('2024-12');
  });

  it('should handle year boundary going forward', async () => {
    const onChange = vi.fn();
    render(<MonthSelector value="2025-12" onChange={onChange} />);

    await userEvent.click(screen.getByLabelText('Next month'));

    expect(onChange).toHaveBeenCalledWith('2026-01');
  });
});
