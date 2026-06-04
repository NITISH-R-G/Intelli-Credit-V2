import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import '@testing-library/jest-dom/vitest';
import { vi, describe, it, expect, afterEach } from 'vitest';
import { cleanup } from '@testing-library/react';
import { CAMReport } from '../CAMReport';
import { CreditAnalysis } from '../../types';
import { downloadPDF, downloadJSON } from '../../lib/export';

vi.mock('lucide-react', () => ({
  FileDown: () => <div data-testid="file-down-icon" />,
  Download: () => <div data-testid="download-icon" />
}));

vi.mock('../../lib/export', () => ({
  downloadPDF: vi.fn(),
  downloadJSON: vi.fn()
}));

vi.mock('react-markdown', () => ({
  default: ({ children }: { children: React.ReactNode }) => <div data-testid="markdown">{children}</div>
}));

describe('CAMReport', () => {
  afterEach(() => {
    cleanup();
    vi.clearAllMocks();
  });

  const mockAnalysis = {
    camMarkdown: '# Mock CAM Report\nThis is a test report.'
  } as unknown as CreditAnalysis;

  const mockSetIsExporting = vi.fn();
  const mockSetError = vi.fn();

  it('renders correctly', () => {
    render(
      <CAMReport
        analysis={mockAnalysis}
        isExporting={false}
        setIsExporting={mockSetIsExporting}
        setError={mockSetError}
      />
    );

    expect(screen.getByText('Credit Appraisal Memo (CAM)')).toBeInTheDocument();
    expect(screen.getByTestId('file-down-icon')).toBeInTheDocument();
    expect(screen.getByText('EXPORT JSON')).toBeInTheDocument();
    expect(screen.getByText('EXPORT PDF')).toBeInTheDocument();

    expect(screen.getByTestId('markdown')).toHaveTextContent('# Mock CAM Report This is a test report.');
  });

  it('calls downloadJSON when Export JSON is clicked', () => {
    render(
      <CAMReport
        analysis={mockAnalysis}
        isExporting={false}
        setIsExporting={mockSetIsExporting}
        setError={mockSetError}
      />
    );

    const jsonButton = screen.getByText('EXPORT JSON');
    fireEvent.click(jsonButton);

    expect(downloadJSON).toHaveBeenCalledWith(mockAnalysis, mockSetError);
  });

  it('calls downloadPDF when Export PDF is clicked', () => {
    render(
      <CAMReport
        analysis={mockAnalysis}
        isExporting={false}
        setIsExporting={mockSetIsExporting}
        setError={mockSetError}
      />
    );

    const pdfButton = screen.getByText('EXPORT PDF');
    fireEvent.click(pdfButton);

    expect(downloadPDF).toHaveBeenCalledWith('cam-report', mockSetIsExporting, mockSetError);
  });

  it('disables Export PDF button when exporting', () => {
    render(
      <CAMReport
        analysis={mockAnalysis}
        isExporting={true}
        setIsExporting={mockSetIsExporting}
        setError={mockSetError}
      />
    );

    const pdfButton = screen.getByText('EXPORTING...');
    expect(pdfButton).toBeDisabled();
  });
});
