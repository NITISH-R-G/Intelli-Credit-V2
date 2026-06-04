import '@testing-library/jest-dom/vitest';
import { render, screen, cleanup, fireEvent } from '@testing-library/react';
import { describe, it, expect, afterEach, vi } from 'vitest';
import { ErrorDisplay } from '../ErrorDisplay';
import { AppError } from '../../types';

describe('ErrorDisplay', () => {
  afterEach(() => {
    cleanup();
  });

  const mockError: AppError = {
    type: 'API_ERROR',
    message: 'Test error message',
    details: 'Some additional details about the error.',
    action: 'Try again later',
    rawLogs: 'Error stack trace...'
  };

  it('renders nothing when error is null', () => {
    const { container } = render(<ErrorDisplay error={null} setError={vi.fn()} showLogs={false} setShowLogs={vi.fn()} />);
    expect(container).toBeEmptyDOMElement();
  });

  it('renders error information correctly', () => {
    render(<ErrorDisplay error={mockError} setError={vi.fn()} showLogs={false} setShowLogs={vi.fn()} />);
    expect(screen.getByText(/API ERROR: Test error message/)).toBeInTheDocument();
    expect(screen.getByText('CODE: API_ERROR')).toBeInTheDocument();
    expect(screen.getByText('Some additional details about the error.')).toBeInTheDocument();
    expect(screen.getByText('Suggested Action: Try again later')).toBeInTheDocument();
  });

  it('toggles logs when View Technical Logs button is clicked', () => {
    const setShowLogs = vi.fn();
    render(<ErrorDisplay error={mockError} setError={vi.fn()} showLogs={false} setShowLogs={setShowLogs} />);

    const viewLogsButton = screen.getByText('View Technical Logs');
    fireEvent.click(viewLogsButton);
    expect(setShowLogs).toHaveBeenCalledWith(true);
  });

  it('shows raw logs when showLogs is true', () => {
    render(<ErrorDisplay error={mockError} setError={vi.fn()} showLogs={true} setShowLogs={vi.fn()} />);
    expect(screen.getByText('Error stack trace...')).toBeInTheDocument();
    expect(screen.getByText('Hide Technical Logs')).toBeInTheDocument();
  });

  it('dismisses error when Dismiss Error button is clicked', () => {
    const setError = vi.fn();
    const setShowLogs = vi.fn();
    render(<ErrorDisplay error={mockError} setError={setError} showLogs={true} setShowLogs={setShowLogs} />);

    const dismissButton = screen.getByText('Dismiss Error');
    fireEvent.click(dismissButton);

    expect(setError).toHaveBeenCalledWith(null);
    expect(setShowLogs).toHaveBeenCalledWith(false);
  });
});
