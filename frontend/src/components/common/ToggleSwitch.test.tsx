import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import ToggleSwitch from './ToggleSwitch';

describe('ToggleSwitch', () => {
  it('should render with aria-checked false when unchecked', () => {
    render(<ToggleSwitch checked={false} onChange={() => {}} label="Toggle" />);

    const toggle = screen.getByRole('switch');
    expect(toggle).toHaveAttribute('aria-checked', 'false');
  });

  it('should render with aria-checked true when checked', () => {
    render(<ToggleSwitch checked={true} onChange={() => {}} label="Toggle" />);

    const toggle = screen.getByRole('switch');
    expect(toggle).toHaveAttribute('aria-checked', 'true');
  });

  it('should call onChange when clicked', async () => {
    const onChange = vi.fn();
    render(<ToggleSwitch checked={false} onChange={onChange} label="Toggle" />);

    await userEvent.click(screen.getByRole('switch'));

    expect(onChange).toHaveBeenCalled();
  });

  it('should be disabled when disabled prop is true', () => {
    render(<ToggleSwitch checked={false} onChange={() => {}} disabled={true} label="Toggle" />);

    expect(screen.getByRole('switch')).toBeDisabled();
  });

  it('should apply aria-label', () => {
    render(<ToggleSwitch checked={false} onChange={() => {}} label="My Toggle" />);

    expect(screen.getByLabelText('My Toggle')).toBeInTheDocument();
  });

  it('should apply green background when checked', () => {
    render(<ToggleSwitch checked={true} onChange={() => {}} />);

    const toggle = screen.getByRole('switch');
    expect(toggle.className).toContain('bg-gold-400');
  });

  it('should apply surface-alt background when unchecked', () => {
    render(<ToggleSwitch checked={false} onChange={() => {}} />);

    const toggle = screen.getByRole('switch');
    expect(toggle.className).toContain('bg-surface-alt');
  });
});
